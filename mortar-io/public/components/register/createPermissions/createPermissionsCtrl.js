(function() {
    var app = angular.module('create-permissions-controller', ['ui.router', 'mortar-services',
        'cgBusy', 'ui.bootstrap', 'alert-handler', 'angularFileUpload',
        'checklist-model', 'olmap-directive', 'ja.qr', 'angularTreeview',
        'uuid4', 'angular-centered', 'ngCsvImport'
    ]);
    app.controller('CreatePermissionsCtrl', function($scope, Device, $stateParams, User, Alert, MortarUser, $state, Browser) {
        $scope.isFolder = false;
        $scope.user = User;
        $scope.username = "";
        $scope.node = null;

        $scope.usersToRemove = [];
        $scope.usersToAdd = [];
        $scope.showUsers = true;

        $scope.devicePromise =
            Device.constructDevice($stateParams['id'], true);

        $scope.$watch('device', function() {
            if ($scope.node != null && angular.isUndefined($scope.node.affiliations)) {
                $scope.node.getAffiliations();
            }
        });
        $scope.loadUsers = function() {
            $scope.devicePromise.then(function(device) {
                $scope.node = device;
                $scope.node.folders = [];
                $scope.node.errors = [];
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
                    $scope.cp.error = true;
                    $scope.cp.errorMessage = error;
                    console.log(error);
                });
            });
        };
        $scope.deviceId = $stateParams['id'];
        $scope.usersToAdd = {
            publisher: [],
            owner: [],
            outcast: []
        };

        $scope.loadUsers();
        $scope.selectedFolder = User.favorites_folder;
        Browser.children = [User.favoritesFolder];
        $scope.device = Device.constructDevice($stateParams.id, false);

        /**
         * addUser Add a user to the new user list
         * @param User $item user to add
         */
        $scope.addUser = function(username, permission) {
            var indexNewUsers;
            var hasPermission;
            if (typeof $scope.usersToAdd[permission] != 'undefined') {
                indexNewUsers = $scope.usersToAdd[permission].indexOf(username);
            } else {
                indexNewUsers = -1;
            }
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
            } else if ($scope.isInArray(username, $scope.usersToRemove)) {
                indexToRemove = $scope.isInArray(username, $scope.usersToRemove);
                $scope.usersToRemove.splice($item);
                if (typeof $scope.usersToAdd[permission] == 'undefined')
                    $scope.usersToAdd[permission] = [];
                $scope.usersToAdd[permission].push($item);
                $scope.username = '';
            } else {
                if (typeof $scope.usersToAdd[permission] == 'undefined')
                    $scope.usersToAdd[permission] = [];
                $scope.usersToAdd[permission].push(username);
                $scope.isAlreadySelected = false;
            }
            $scope.username = '';
        }
        $scope.setPermissions = function() {
            $scope.permissionPromises = [];
            if ($scope.usersToAdd['publisher'].length > 0) {
                for (user in $scope.usersToAdd['publisher']) {
                    $scope.permissionPromises.push($scope.node.addAffiliation($scope.usersToAdd['publisher'][user], 'publisher'));
                }
            }
            if ($scope.usersToRemove.length > 0) {
                for (user in $scope.usersToRemove) {
                    $scope.permissionPromises.push($scope.node.removeAffiliation($scope.usersToRemove[user]));
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
         * removeUser remove a user permissions
         * @param  User user User service
         */
        $scope.removeUser = function(user, affil) {
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
            //todo test this
        $scope.continue = function() {
            $scope.permissionPromises = [];
            if ($scope.usersToAdd['publisher'].length > 0) {
                for (user in $scope.usersToAdd['publisher']) {
                    $scope.permissionPromises.push($scope.node.addAffiliation($scope.usersToAdd['publisher'][user], 'publisher'));
                }
            }
            if ($scope.usersToAdd['owner'] == null &&
                $scope.usersToAdd['owner'].length > 0) {
                for (user in $scope.usersToAdd['owner']) {
                    $scope.permissionPromises.push($scope.node.addAffiliation($scope.usersToAdd['owner'][user], 'owner'));
                }
            }
            if ($scope.usersToAdd['outcast'].length != null &&
                $scope.usersToAdd['outcast'].length > 0) {
                for (user in $scope.usersToAdd['outcast']) {
                    $scope.permissionPromises.push($scope.node.addAffiliation($scope.usersToAdd['outcast'][user], 'outcast'));
                }
            }
            if ($scope.usersToRemove != null && $scope.usersToRemove.length > 0) {
                for (user in $scope.usersToRemove) {
                    $scope.permissionPromises.push($scope.node.removeAffiliation($scope.usersToRemove[user]));
                }
            }
            var errors = [];
            for (var i = 0; i < $scope.permissionPromises.length; i++) {
                $scope.permissionPromises[i].then(function(response) {
                    if (i == $scope.permissionPromises.length - 1) {
                        $state.go('devicecreate.select', {});
                        $scope.displayNotification(errors);
                    }
                }, function(response) {
                    errors.push(response.name);
                    if (i == $scope.permissionPromises.length - 1) {
                        $state.go('devicecreate.select', {});
                        $scope.displayNotification(errors);
                    }
                });
            }
            if ($scope.permissionPromises.length == 0) {
                $state.go('devicecreate.select', {});
            }

        };
    });
})();