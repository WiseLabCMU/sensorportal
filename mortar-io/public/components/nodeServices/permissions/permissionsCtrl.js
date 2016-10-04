(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('permissions-controller', ['ui.router', 'device-services',
        'cgBusy', 'ui.bootstrap', 'alert-handler', 'angular-centered'
    ]);
/**
     *Controller to manage device permissions
     *@param object $scope scope for this cntroller
     *@param service Device device service instance
     *@param object $stateParams parameters passed to state
     *@param object $modalInstance modal instance to manage
     *@param service $http service to perform http requests
     */
    //todo get user vcard information
    app.controller('PermissionsCtrl', function($rootScope, $scope,
        Device, $stateParams, $modalInstance, User, Alert, $state, MortarUser, $http) {
        $scope.isFolder = false;
        $scope.permissionsType = 'publisher';
        $scope.username = "";
        $scope.permissionsToAdd = [];
        $scope.permissionsToRemove = [];
        $scope.act = "data"; // actuation for actuation node
        $scope.isModal = typeof $modalInstance != 'undefined';

        $scope.devicePromise =
            Device.constructDevice($stateParams['id'], true);

        $scope.$watch(function() {
                return $scope.act;
            },
            function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                if ($scope.act == "actuation") {
                    $scope.devicePromise =
                        Device.constructDevice($stateParams['id'] + "_act", true);
                }
                if ($scope.act == "data" || $scope.act == "both") {
                    $scope.devicePromise =
                        Device.constructDevice($stateParams['id'], true);
                }
                $scope.loadUsers();
            });
        $scope.deviceId = $stateParams['id'];
        $scope.usersToAdd = {
            publisher: [],
            owner: [],
            outcast: [],
            none: [],
            publishonly: []
        };
        $scope.usersToRemove = {
            publisher: [],
            owner: [],
            outcast: [],
            none: [],
            publishonly: []
        };
        $scope.isAlreadySelected = false;
        $scope.showUsers = true;
        /**
         * loadUsers load all user data
         */
        $scope.loadUsers = function() {
            $scope.devicePromise.then(function(device) {
                $scope.node = device;
                $scope.node.errors = [];
                $scope.usersToRemove = {
                    publisher: [],
                    owner: [],
                    outcast: [],
                    none: [],
                    publishonly: []
                };
                $scope.usersToAdd = {
                    publisher: [],
                    owner: [],
                    outcast: [],
                    none: [],
                    publishonly: []
                };
                $scope.usersGet = $scope.node.getAffiliations();
                $scope.usersGet.then(function(response) {
                    $scope.affiliations = {};
                    for (affiliation in $scope.node.affiliations) {
                        $scope.affiliations[affiliation] = [];
                        for (jid in $scope.node.affiliations) {
                            var userItem = {};
                            userItem.username = jid;
                            vcard = User.getVcard(jid).then(function(result) {
                                if (vcard.fn) {
                                    userItem.username = vcard.fn;
                                } else {
                                    userItem.name = jid;
                                }
                                userItem.show = true;
                                $scope.affiliations[affiliation].push(userItem);
                            }, function(result) {
                                if (vcard.fn) {
                                    userItem.username = vcard.fn;
                                } else {
                                    userItem.name = jid;
                                }
                                userItem.show = true;
                                $scope.affiliations[affiliation].push(userItem);
                            });
                        }
                    }
                    $scope.showUsers = true;
                }, function(error) {
                    Alert.open('warning', 'Could not access permissions for noden');
                    if ($scope.isModal) {
                        $modalInstance.dismiss();
                    } else {
                        $state.go($rootScope.lastState, $rootScope.lastParams);
                    }
                });
            });
        };
		$scope.loadUsers();
        /**
         * addUser Add a user to the new user list
         * @param User $item user to add
         */
        $scope.addUser = function(username, permission) {
            var indexNewUsers;
            if (typeof $scope.usersToAdd[permission] != 'undefined') {
                indexNewUsers = $scope.usersToAdd[permission].indexOf(username);
            } else {
                indexNewUsers = -1;
            }
            var hasPermission;
            if (typeof $scope.node.affiliations != 'undefined' &&
                typeof $scope.node.affiliations[permission] != 'undefined') {
                hasPermission = $scope.isInArray(username, $scope.node.affiliations[permission]);
            } else {
                hasPermission = false;
            }
            if (hasPermission) {
                $scope.isAlreadySelected = true;
            } else if (indexNewUsers !== -1) {
                $scope.isAlreadySelected = true;
            } else if ($scope.isInArray(username, $scope.usersToRemove[permission])) {
                indexToRemove = $scope.isInArray(username, 
            	  $scope.usersToRemove[permission]);
                $scope.usersToRemove[permission].splice(indexToRemove);
                if (typeof $scope.usersToAdd[permission] == 'undefined')
                    $scope.usersToAdd[permission] = [];
                $scope.usersToAdd[permission].push(username);
            } else {
                if (typeof $scope.usersToAdd[permission] == 'undefined') {
                    $scope.usersToAdd[permission] = [];
                }
                $scope.usersToAdd[permission].push(username);
                $scope.isAlreadySelected = false;
            }
            $scope.username = '';
        }

        // Returns user position if exists, otherwise returns false
        $scope.isInArray = function(username, userArray) {
                for (user in userArray) {
                    if (username == user) {
                        return true;
                    }
                }
                return false;
            }
            /**
             * removeUser remove a user permissions
             * @param  User user User service
             */
        $scope.removeUser = function(user) {
                var affil;
                var indexNewUsers;
                for (affil in $scope.usersToAdd) {
                    indexNewUsers = $scope.usersToAdd[affil].indexOf(user);
                    if (indexNewUsers != -1) {
                        break;
                    }
                }
                if (indexNewUsers !== -1) {
                    user.show = false;
                } else {
                    indexPermittedUsers = $scope.node.users.indexOf(user);
                    $scope.node.users.splice(indexPermittedUsers, 1);
                    $scope.usersToRemove.push(user);
                }
            }
        /**
         * add and remove permissions to selected users
         */
        $scope.setPermissions = function() {
            $scope.permissionPromises = [];
            if ($scope.usersToAdd['publisher'].length > 0) {
                for (user in $scope.usersToAdd['publisher']) {
                    $scope.permissionPromises.push(
                        $scope.node.addAffiliation(
                            $scope.usersToAdd['publisher'][user], 'publisher'));
                }
            }
            if ($scope.usersToRemove.length > 0) {
                for (user in $scope.usersToRemove) {
                    $scope.permissionPromises.push(
                        $scope.node.removeAffiliation(
                            $scope.usersToRemove[user]));
                }
            }
            var errors = [];
            for (var i = 0; i < $scope.permissionPromises.length; i++) {
                $scope.permissionPromises[i].then(function(response) {
                    if (response.isLast) $scope.displayNotification(errors);
                }, function(response) {
                    errors.push(response.name);
                    if (response.isLast) $scope.displayNotification(errors);
                }, function(response) {
                    if (response.isLast) $scope.displayNotification(errors);
                })
            }
            $modalInstance.dismiss();
        };

        /**
         * shows notifications to user after permissions setting is finished
         * @param array errors users that could not set permissions to
         * @return void
         */
        $scope.displayNotification = function(errors) {
            var message = ''
            var messageType = '';
            if (errors.length > 0) {
                messageType = 'warning';
                message = 'Some errors occurred while setting permissions to this users: ';
                for (err in errors) {
                    message += errors[err];
                    if (err < errors.length - 1) {
                        message += ', ';
                    }
                }
            } else {
                message = 'Permissions successfully set to selected users';
                messageType = 'success';
            }
            $modalInstance.dismiss();
            Alert.open(messageType, message);
        }

        /**
         * cancel Dismiss the modal
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        }
    });
})();
