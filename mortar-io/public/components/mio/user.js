/**
 * User Services
 */
(function() {
    var app = angular.module('user-services', ['xml-rpc']);

    /**
     * Service that represents the logged in user
     * @param service $window window wrapped of angularjs
     * @param service $http   requests service of angularjs
     * @param service $q      promise service of angularjs
     */
    var UserService = function($window, $http, $q, xmlrpc, $rootScope,
        $state) {
        this.username = '';
        this.password = '';
        this.connection = null;
        /**
         * Returns if the user is an admin
         * @return bool true if is Admin
         */
        this.isAdmin = function() {
            return this.isPublisher({
                id: this.root
            }) || this.isOwner({
                id: this.root
            });
        };
        /**
         * Returns if the user is the owner of the device
         * @param  string  nodeId id of the device or location node
         * @return bool true if is owner
         */
        this.isOwner = function(nodeId) {
            return typeof this.permittedDevices.owner[nodeId.id] != 'undefined';
        };

        this.loadFavorites = function() {
                var self = this;
                self.favoritesFolder;
                Device.constructDevice(this.favoritesFolder, true).then(
                    function(favorite) {

                    });
            }
            /**
             * Returns if the user is a publisher of the node
             * @param  string  nodeId id of the device or location node
             * @return bool true if is publisher
             */
        this.isPublisher = function(nodeId) {
            return typeof this.permittedDevices.publisher[nodeId.id] !== 'undefined';
        }
        this.isPublisherOrOwner = function(nodeID) {
            return this.isPublisher({
                id: nodeID
            }) || this.isOwner({
                id: nodeID
            });
        }

        /**
         * Returns if the user is subscribed to the device
         * @param  string  deviceId id of the device
         * @return boolean true if user is subscribed to the device
         */
        this.isSubscribed = function(deviceId) {
            return typeof this.subscriptions[deviceId.id] != 'undefined';
        }
        this.isSubscribe = function(deviceId) {
            return typeof this.subscriptions[deviceId.id] != 'undefined';
        }
        this.isUnSubscribe = function(deviceId) {
            return typeof this.subscriptions[deviceId.id] == 'undefined';
        }
        this.getSubscriptionList = function() {
            return this.permittedDevices.subscribed;
        }
        this.getPublisherList = function() {
            return this.permittedDevices.publisher;
        }
        this.getOwnerList = function() {
            return this.permittedDevices.publisher;
        }
        this.getSubscriptions = function() {
            var getSubscriptionsTimeout = 5000; // 5 seconds
            var $self = this;
            var deferred = $q.defer();
            $self.connection.pubsub.getSubscriptions(function(iq) {
                var type = iq.getAttribute('type');
                if (type == "result") {
                    var subscriptions = iq.getElementsByTagName('subscriptions');
                    $self.subscriptions = {};
                    Strophe.forEachChild(subscriptions[0], 'subscription',
                        function(subEl) {
                            var node = subEl.getAttribute('node');
                            var jid = subEl.getAttribute('jid');
                            var subscription = subEl.getAttribute('subscription');
                            var subid = subEl.getAttribute('subid');
                            $self.subscriptions[node] = {
                                node: node,
                                jid: jid,
                                subscription: subscription,
                                subid: subid
                            };
                        });
                    deferred.resolve($self.subscriptions);
                } else if (type == 'error') {
                    var error = iq.getElementsByTagName('error');
                    var error_code = error[0].getAttribute('code');
                    var error_type = error[0].getAttribute('type');
                    var error_msg = error[0].childNodes[0].tagName;
                    var msg = "Error Code: " + error_code + " ,Type: " +
                        error_type + ", Message: " + error_msg;
                    deferred.reject(msg);
                } else {
                    deferred.reject(iq);
                }
            }, getSubscriptionsTimeout);
            return deferred.promise;
        };

        /**
         * Returns if the user can edit the device or location node
         * @param  string nodeId id of the device or location node
         * @return bool true if he can edit the node
         */
        this.canEdit = function(nodeId) {
                return this.isOwner(nodeId) || this.isPublisher(nodeId);

            }
            /**
             * Returns if the user can manage, calls is owner function
             * @param  string nodeId id of a device or location node
             * @return boolean true if he can manage the devices permissions
             */
        this.canManage = function(nodeId) {
            return this.isOwner(nodeId) || this.isPublisher(nodeId);
        }

        this.changePassword = function(password) {
            var timeout = 5000; // 5 seconds
            var iqId = this.connection.getUniqueId();
            var atIndex = this.username.indexOf('@');
            var username = this.username.split(atIndex, 1)
            var stanza = $iq({
                type: 'set',
                to: this.domain,
                id: iqId
            });
            var deferred = $q.defer();
            stanza.c('query', {
                xmlns: "jabber:iq:register"
            });
            stanza.c('username', {}).t(username).up();
            stanza.c('password', {}).t(password).up();
            stanza.up();
            console.log("In change password");
            console.log(stanza.toString());
            this.connection.sendIQ(stanza, function(iq) {
                console.log(iq);
                $self.password = password;
                if ($self.saveUser) {
                    $self.save();
                }
                deffered.resolve(iq);
            }, function(iq) {
                console.log(iq);
                var type = iq.getAttribute('type');
                if (iq == null) {
                    deferred.reject("Timeout");
                } else if (type == 'error') {
                    var error = iq.getElementsByTagName('error');
                    var error_code = error[0].getAttribute('code');
                    var error_type = error[0].getAttribute('type');
                    var error_msg = error[0].childNodes[0].tagName;
                    var msg = "Error Code: " + error_code + " ,Type: " +
                        error_type + ", Message: " + error_msg;
                    deferred.reject(msg);
                } else {
                    deferred.reject("Could not publish, unknown response type.");
                }
                deferred.reject(iq);

            }, timeout);
            return deferred.promise;

        }

        this.on_message = function(iq) {
            return true;
        }

        /**
         * Logs the user in, and sets hes data, sets the default headers for other requests.
         * @param  string username
         * @param  string password
         * @return promise
         */
        this.login = function(username, password, saveUser) {
            var $self = this;
            var loginDeferred = $q.defer();
            var at_index = username.indexOf('@');
            $self.saveUser = saveUser;
            $self.favoritesFolder = username.substring(0, at_index) + "_Favorites";
            $self.rootFolder = "root";
            $self.username = username.toLowerCase();
            $self.password = password;
            $self.domain = username.substring(at_index + 1, username.length);

            xmlrpc.config({
                hostname: 'localhost',
                //hostname: $self.domain,
                pathName: "/RPC2",
                401: function() {},
                404: function() {},
                500: function() {}
            });
            Strophe.TIMEOUT = 10000;
            var bosh_endpoint = 'http://' + $self.domain + ':5280/http-bind/';

            $self.connection = new Strophe.Connection(bosh_endpoint);
            $self.connection.connect($self.username, password, function(status) {
                $self.setRequestToken();
                $self.bosh_endpoint = bosh_endpoint;
                $self.pubsubservice = 'pubsub.' + $self.connection.domain;
                $self.xmlrpcservice = "http://" + $self.connection.domain + ":4560/RPC2";

                $self.connectionStatus = status;
                if (status == Strophe.Status.CONNECTED) {
                    $self.loggedIn = true;
                    if ($self.saveUser) {
                        $self.saveSession();
                    }
                    $self.connection.addHandler($self.on_message, null, 'message',
                        'chat', null, null);
                    $self.getPermittedDevices().then(
                        function(result) {
                            $self.getSubscriptions().then(
                                function(result) {
                                    loginDeferred.resolve(true);
                                },
                                function(error) {
                                    loginDeferred.resolve(error);
                                });
                        });
                    return;
                } else if (status == Strophe.Status.CONNFAIL) {
                    loginDeferred.reject(
                        "Strophe: Could not connect to server, connection failed.");
                } else if (status == Strophe.Status.DISCONNECTING) {
                    loginDeferred.notify("Strophe: Disconnecting from server.");
                } else if (status == Strophe.Status.DISCONNECTED) {
                    loginDeferred.reject("Strophe: Disconnected from server.");
                    $self.loggedIn = false;
                    $self.connection.reset();
                } else if (status == Strophe.Status.CONNECTING) {
                    loginDeferred.notify("Strophe: Connecting to server.");
                } else if (status == Strophe.Status.AUTHENTICATING) {
                    loginDeferred.notify("Strophe: Authenticating with server.");
                } else if (status == Strophe.Status.ATTACHED) {
                    loginDeferred.notify("Strophe: Attached.");
                } else if (status == Strophe.Status.AUTHFAIL) {
                    loginDeferred.reject("Strophe: Authentication failed.");
                } else {
                    loginDeferred.reject("Strophe connection error");
                }
            });
            return loginDeferred.promise;
        };

        /**
         * Logs out the user, deleting session
         * @todo remove default headers
         */
        this.logout = function() {
            if (this.connection)
                this.connection.disconnect("User logged out.");
            this.deleteSession();
        };
        /**
         * Sets the request token in the http headers default
         */
        this.setRequestToken = function() {
            $http.defaults.headers.common.Authorization = this.requestToken;
        };
        /**
         * Saves the user in the browser's session
         */
        this.saveSession = function() {
            $window.sessionStorage.setItem("User", JSON.stringify({
                username: this.username,
                password: this.password
            }));
            //$window.sessionStorage.setItem("User", this);
        };
        /**
         * Deletes logged in user from window session, resets user data in service
         */
        this.deleteSession = function() {
            this.username = '';
            this.name = '';
            this.email = '';
            this.group = '';
            this.favoritesFolder = '';
            this.rootFolder = '';
            this.permittedDevices = {
                publisher: {},
                owner: {},
                subscribed: {}
            };
            this.loginDeferred = {};
            this.state = {};
            this.token = '';
            this.requestToken = '';
            $window.sessionStorage.removeItem("User");
            $window.sessionStorage.removeItem("State");
            this.loggedIn = false;
            //$http.defaults.headers.common.Authorization = '';
        };


        /**
         * Gets the current user's permitted devices (owner, publisher, subscriber)
         * @param boolean allData whether to load all user devices data
         * @return promise
         */
        this.getPermittedDevices = function() {
            var deferred = $q.defer();
            var $self = this;
            $self.connection.pubsub.getAffiliations('', function(iq) {
                var type = iq.getAttribute('type');
                if (type == 'result') {
                    var affils = iq.getElementsByTagName('affiliations');
                    var affil, node;
                    var affil_index;
                    var attribute;
                    var attr_index;
                    for (affil_index = 0; affil_index < affils[0].childNodes.length; affil_index++) {
                        var affiliation = affils[0].childNodes[affil_index];
                        for (attr_index = 0; attr_index < affiliation.attributes['length']; attr_index++) {
                            attribute = affiliation.attributes[attr_index];
                            if (attribute.name == 'affiliation')
                                affil = attribute.value;
                            else if (attribute.name == 'node')
                                node = attribute.value;
                        }
                        if (affil == 'owner')
                            $self.permittedDevices.owner[node] = node;
                        else if (affil == 'publisher')
                            $self.permittedDevices.publisher[node] = node;
                        else if (affil == 'subscribed')
                            $self.permittedDevices.subscribed[node] = node;
                    }
                    deferred.resolve(true);
                } else {
                    if (type == 'error') {
                        var error = iq.getElementsByTagName('error');
                        var error_code = error[0].getAttribute('code');
                        var error_type = error[0].getAttribute('type');
                        var error_msg = error[0].childNodes[0].tagName;
                        var msg = "Error Code: " + error_code;
                        mst = msg + ", Type: " + error_type + ", Message: " + error_msg;
                        deferred.reject(msg);
                    } else if (deferred) {
                        deferred.reject('Could not retrieve affiliations.')
                    }
                }
            });
            return deferred.promise;
        };

        /* User information functions. Interactions with Vcards */

        this.getVcard = function(jid) {
            var deferred = $q.defer();
            $self = this;
            if (jid == null) {
                jid = $self.username;
            }
            this.connection.vcard.get(function(iq) {
                var Card = vCard.parse(iq.childNodes[0].textContent);
                $self.vCard = Card;
                if (typeof Card.email != 'undefined') {
                    $self.email = Card.email[0].value;
                } else {
                    deferred.reject("Could not retrieve email");
                }
                if (typeof Card.fn != 'undefined')
                    $self.name = Card.fn[0].value;
                else
                    deferred.reject("Could not retrieve name");
                $self.group = 'user';
                $self.password = '';
                $self.password2 = '';
                deferred.resolve(true);
            }, jid, function(iq) {
                deferred.reject(iq);
            });
            return deferred.promise;
        };

        this.setVcard = function(name, email) {
            $self = this;
            $self.name = name;
            $self.email = email;
            var deferred = $q.defer();
            var card = {};
            card.fn = [{
                'value': name
            }];
            card.email = [{
                'value': email
            }];
            this.connection.vcard.set(function(iq) {
                    deferred.resolve(true);
                }, Strophe.xmlTextNode(vCard.generate(card, true)), $self.username,
                function(error) {
                    deferred.reject(error)
                });
            return deferred.promise;
        };


        this.connectionStatus = Strophe.Status.DISCONNECTED;
        this.username = '';
        this.name = '';
        this.email = '';
        this.group = '';
        this.favoritesFolder = '';
        this.rootFolder = '';
        this.permittedDevices = {
            publisher: {},
            owner: {},
            subscribed: {}
        };
        this.subscriptions = {};
        this.loggedIn = false;
        this.state = {};
        this.loginDeferred = [];
        this.getVcardDeferred = [];
        this.getPermittedDevicesPromise = [];
        this.token = '';
        this.requestToken = '';
        // $http.defaults.headers.common.Authorization = '';
        //this.getPermittedDevices();
    };
    app.service('User', UserService);
})();