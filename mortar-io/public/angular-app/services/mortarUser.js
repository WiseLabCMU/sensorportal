(function() {
    /**
     * MortarUser services
     */
    var app = angular.module('mortar-user-services', ['xml-rpc', 'user-services', 'mio-services']);
    //,'rt.timeout'
    app.factory('MortarUser', function($http, $q, User, xmlrpc, $timeout) {

        var MortarUser = function(name, email, username) {
            this.username = username.slice(0, username.indexof('@'));
            this.domain = username.slice(username.indexof('@'));
            this.name = name;
            this.requests = {};
            this.email = email;
            this.favoritesFolder = username.slice(0, username.indexof('@')) + '_Favorites';
            this.rootFolder = 'root';
            this.group = 'user';
        }

        MortarUser.prototype = {
            username: '',
            email: '',
            group: '',
            password: '',
            name: '',
            favoritesFolder: '',
            rootFolder: 'root',
        }

        //Todo
        /**
         * save changes performed on an user
         * @return promise object
         */
        // moved to set VCARD in user.js


        //Todo
        // updates the data of an user on frontend
        // moved to getVCard under user.js
        var MortarUserFactory = {
            requests: {},
            user: {},
            users: {},

            //Todo switch to vcards and rosters
            /**
             * Returns an user object given the username
             * @param string username user to return
             * @return mixed user object or error message
             */
            get: function(username) {
                var $self = this;
                var deferred = $q.defer();
                var timeoutpromise = $timeout(function() {
                    deferred.resolve({
                        username: username
                    });
                }, 5000);
                User.connection.vcard.get(function(iq) {
                    var email;
                    var name;
                    var user_vcard;
                    var Card = vCard.parse(iq.childNodes[0].textContent);
                    $timeout.cancel(timeoutpromise);
                    if (typeof Card.email != 'undefined') {
                        email = Card.email[0].value;
                    }
                    if (typeof Card.fn != 'undefined') {
                        name = Card.fn[0].value;
                    }
                    user_vcard = {
                        username: username.slice(0, username.indexOf('@')),
                        name: name,
                        email: email,
                        group: 'user',
                        rootFolder: 'root',
                        favoritesFolder: username.slice(0, username.indexOf('@')) +
                            '_Favorites'
                    };
                    deferred.resolve(user_vcard);
                }, username, function(iq) {
                    console.log(iq);
                    var newUser = {
                        username: username.slice(0, username.indexOf('@')),
                        name: "",
                        email: "",
                        group: 'user',
                        rootFolder: 'root',
                        favoritesFolder: username.slice(0, username.indexOf('@')) +
                            '_Favorites'
                    };
                    $timeout.cancel(timeoutpromise);
                    deferred.resolve(newUser);
                });
                return deferred.promise;
            },

            rpcCommand: function(command, args) {
                return xmlrpc.callMethod(command, args);
            },
            // toDo switch to roster
            /**
             * load the list of users
             * @return promise object
             */
            getUsers: function() {
                var $self = this;
                var password = User.connection.pass;
                var host = User.connection.domain;
                var user = User.connection.authcid;
                var args = [{
                    user: user,
                    server: host,
                    password: password
                }, {
                    host: host
                }];
                $self.promises = [];
                var rpcpromise = this.rpcCommand('registered_users', args);
                return rpcpromise;
            },
            saveUser: function(user) {
                var $self = this;
                var promises = [];
                var promise;
                var args;
                args = [{
                    user: user.user,
                    server: User.connection.domain,
                    password: User.connection.password
                }, {
                    host: host,
                    name: email,
                    content: user.email
                }];
                promises.push(this.rpcCommand('setVcard', args));

                args = [{
                    user: user.user,
                    server: User.connection.domain,
                    password: User.connection.password
                }, {
                    host: host,
                    name: "FN",
                    content: user.name
                }];
                promises.push(this.rpcCommand('setVcard', args));

                args = [{
                    user: user.user,
                    server: User.connection.domain,
                    password: User.connection.password
                }, {
                    host: host,
                    name: "favorites",
                    content: user.favoritesFolder
                }];
                promises.push(this.rpcCommand('setVcard', args));

                args = [{
                    user: user.user,
                    server: User.connection.domain,
                    password: User.connection.password
                }, {
                    host: host,
                    name: "root",
                    content: user.rootFolder
                }];
                promises.push(this.rpcCommand('setVcard', args));
                promise = $q.all(promises);
                return promise;
            },

            /**
             * Resets the user's password to a new one he gives.
             * @param  string username        username to reset password of
             * @param  string password        new password
             * @param  string passwordConfirm confirmation of new password
             * @param  string token           token generated by system
             * @return promise
             */
            resetPassword: function(username, password, passwordConfirm, token) {
                var $self = this;
                var user = User.connection.authcid;
                var password = User.connection.pass;
                var host = User.connection.domain;
                var args = [{
                    user: user,
                    server: host,
                    password: password
                }, {
                    user: username,
                    host: User.connection.domain,
                    password: password
                }];
                var deferred = $q.defer();
                var promise = this.rpcCommand('change_password', args).then(
                    function(response) {
                        deffered.resolve(response);
                    },
                    function(error) {
                        deferred.reject(response);
                    });
                return deferred.promise;
            },

            /**
             * Sends a request to the server to send the user a forgot your password email
             * @param  string username use who forgot hes password
             * @return promise
             */
            // todo forgot password
            forgotPassword: function(username) {
                var deferred = $q.defer();
                /*$http.post('api/user/' + username + '/send_recovery')
                    .success(function(response) {
                        if (response.error) {
                            deferred.reject(response.message);
	  // 		    $self.promises = [];
                            return;
                        }
                        deferred.resolve(response.message);
                    }).error(function(response) {
                        deferred.reject('Something wrong with the server');
                    });*/
                return deferred.promise;
            },

            /**
             * Cretes a new user from data
             * @param object data data to creare user with
             * @return mixed
             */
            create: function(data) {
                var $self = this;
                var password = User.connection.pass;
                var host = User.connection.domain;
                var user = User.connection.authcid;

                var args = [{
                    user: user,
                    server: host,
                    password: password
                }, {
                    user: data.username,
                    host: host,
                    password: data.password
                }];
                var promise = $self.rpcCommand('register', args).then((function(response) {
                    if (response.error) {
                        return;
                    }
                    return response;
                }, function(response) {
                    console.log(response);
                    //deferred.reject('Something wrong with the server. User could not be created');
                    return response;
                }));
                return promise;
            },

            delete: function(username) {
                var $self = this;
                var password = User.connection.pass;
                var host = User.connection.domain;
                var user = User.connection.authcid;
                var args = [{
                    user: user,
                    server: host,
                    password: password
                }, {
                    user: username,
                    host: User.connection.domain
                }];
                var promise = $self.rpcCommand('unregister', args).then((function(response) {
                    if (response.error) {
                        return;
                    }
                    for (user in $self.users) {
                        if (username == $self.users[user]) {
                            $self.users.split(user, 1);
                            break;
                        }
                    }

                }, function(response) {
                    console.log(response);
                    deferred.reject('Something wrong with the server. User could not be created');
                }));
                return promise;
            }
        }
        return MortarUserFactory;
    });
})();
