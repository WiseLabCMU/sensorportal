/**
 * User controller module
 */
(function() {
    var app = angular.module('user-controller', ['ui.router', 'mortar-services', 'mortar-directives',
        'cgBusy', 'angularTreeview', 'ui.bootstrap', 'xml-rpc', 'rt.timeout'
    ]);

    //Todo
    /**
     * Controller for managing user list
     * @param  object $scope    scope of the controller
     * @param  service Alert  service to manage messages to the user
     * @param  factory MortarUser  MortarUser factory instance
     * @param  service $modal service to create modal windows
     * @author Jairo Diaz Montero <jairo.diaz.montero.07@gmail.com>
     */
    app.controller('UsersCtrl', function($scope, Alert, MortarUser, $modal, User, $q, $timeout) {
        // todo extend to people who do not have xmlrpc access
        $scope.users = [];
        $scope.usersGetPromise = MortarUser.getUsers().then(
            function(response) {
                if (typeof response == 'undefined') {
                    return null;
                }
                if (typeof response.error != 'undefined') {
                    console.log("response.error");
                    console.log(response.error);
                    return response.error;
                }
                var promises = [];
                var domainTag = "@" + User.connection.domain;
                $scope.users = response.users;
                for (userIndex in response.users) {
                    user = response.users[userIndex];
                    user.userIndex = userIndex;
                    promises.push(MortarUser.get(user.username + domainTag).then(function(userResponse) {
                        $scope.users.push(userResponse);
                    }));
                }
                if (response.messages) {
                    Alert.open('warning', response.messages);
                }
            },
            function(response) {
                Alert.open('warning', response);
            });
        // todo
        /**
         * removes an user
         * @param string strUsername username of user to remove
         */
        $scope.removeUser = function(strUsername) {
            if (confirm('Are you sure to delete this user?')) {
                $scope.deleteUserPromise = MortarUser.delete(strUsername);
                $scope.deleteUserPromise.then(function(response) {
                    for (index in $scope.users) {
                        if ($scope.users[index].username == strUsername) {
                            $scope.users.splice(index, 1);
                        }
                    }
                    Alert.close();
                    Alert.open('success', response);
                }, function(response) {
                    Alert.close();
                    Alert.open('warning', response);
                });
            }
        };


        //Todo
        /**
         * open up a modal to change the password of an user
         * @param string strUsername username of user to change password
         */
        $scope.changePassword = function(strUsername) {
            $modal.open({
                templateUrl: 'angular-app/partials/userChangePassword.html',
                controller: 'UserChangePasswordCtrl',
                resolve: {
                    strUsername: function() {
                        return strUsername;
                    }
                }
            }).result.then(function(result) {
                // @todo handle result
            }, function() {
                MortarUser.user.password = '';
                MortarUser.user.password2 = '';
            });
        };
    });

    /**
     * Controller to show user detail
     * @param  object $scope  scope of the controller
     * @param  object $stateParams parameters of the current state
     * @param  service User service to handle logged in user actions
     * @param  object $state state object to hangle state actions
     * @param  service $modal modal service to create and handle modal actions
     * @param  factory MortarUser factory instance to manage user models
     * @param  service Alert service to handle messages to user
     * @author Jairo Diaz Montero <jairo.diaz.montero.07@gmail.com>
     */
    app.controller('UserProfileCtrl', function($scope, $stateParams, User, $state, $modal, MortarUser, Alert) {
        var user;
        if (typeof $stateParams.username == 'undefined') {
            console.log("Username undefined");
            user = "";
        } else if ($stateParams.username.indexOf('@') >= 0) {
            user = $stateParams.username;
        } else {
            user = $stateParams.username + '@' + User.connection.domain;
        }

        $scope.getUserPromise = MortarUser.get(user).then(function(result) {
            $scope.user = result;
        }, function(errorstanza) {
            Alert.open('warning', errorstanza);
        });

        $scope.showDevices = true;
        $scope.allowDelete = false;
        if (User.isAdmin() && $stateParams.username != User.username) {
            $scope.allowDelete = true;
        }
        // open up a modal to change the password of an user
        $scope.changePassword = function() {
                $modal.open({
                    templateUrl: 'angular-app/partials/userChangePassword.html',
                    controller: 'UserChangePasswordCtrl',
                    resolve: {
                        strUsername: function() {
                            return $scope.user.username;
                        }
                    }
                }).result.then(function(result) {
                    // @todo handle result
                });
            },
            function() {};

        //Todo
        $scope.getUserInfo = function() {
                var deferred = $q.defer();
                if (typeof $scope.user.username != 'undefined' && MortarUserFactory.user.username == username) {
                    deferred.resolve(MortarUserFactory.user);
                    return deferred.promise;
                }
                return MortarUser.get($scope.user.username);
        }
        // removes an user from users
        $scope.deleteUser = function() {
            if (confirm('Are you sure to delete this user?')) {
                $scope.deleteUserPromise = MortarUser.delete($scope.user.username);
                $scope.deleteUserPromise.then(function(response) {
                    $state.go('user.list');
                    Alert.open('success', response);
                }, function(response) {
                    Alert.open('warning', response);
                });
            }
        }

        /**
         * redirects to detail of selected node depending on the node type
         * @param object node  Device or Folder object to view detail
         */
        $scope.viewNodeDetail = function(node) {
            if (node.type == 'location') {
                $state.go('device.list', {
                    folder: node.id
                });
            } else {
                $state.go('device.view.detail', {
                    id: node.id
                });
            }
        }
    });


    /**
     * Controller to create and update user
     * @param  object  $scope scope of the controller
     * @param  object  $modalInstance modal instance to manage
     * @param  service MortarUser  service instance to manage user actions
     * @param  string  username user username to load on edit
     * @param  service  User service instance to manage logged in user actions
     * @param  service  Alert service instance to manage user messages
     * @author Jairo Diaz Montero <jairo.diaz.montero.07@gmail.com>
     */
    app.controller('UserCreateEditCtrl', function($scope, $modalInstance, User, MortarUser, username, Alert, Browser, Device) {
        $scope.user = {};
        $scope.devBrowserUserRoot = {};
        $scope.userRootFolder = {};
        $scope.folderLoaded = false;
        $scope.cp = {
            error: false,
            errorMessage: ''
        };
        $scope.userTypes = [{
            value: 'admin',
            label: 'Administrator'
        }, {
            value: 'user',
            label: 'User'
        }];

        // If username is passed then load this user's data
        if (username) {
            $scope.userCopy = {};
            $scope.getUserPromise = MortarUser.get(username);
            $scope.getUserPromise.then(function(response) {
                $scope.user = response;
                $scope.getFolderPromise = Device.constructDevice($scope.user.rootFolder, true);
                $scope.getFolderPromise.then(function(folder) {
                    $scope.userRootFolder = folder;
                    $scope.userCopy = folder;
                    Browser.references[$scope.user.rootFolder] = $scope.userRootFolder;
                    $scope.selectedFolder = $scope.user.rootFolder;
                    $scope.folderLoaded = true;
                }, function(response) {
                    Alert.open('warning', response);
                });
                angular.copy($scope.user, $scope.userCopy);
            }, function(response) {
                $modalInstance.close(false);
                Alert.open('warning', response);
            });
            $scope.isEdit = true;
        } else {
            $scope.folderLoaded = true;
        }

        // sets the selected folder to user
        $scope.selectFolder = function(folder) {
            $scope.user.rootFolder = folder.id;
        }

        // Save user data, this handles both user creation and editing
        $scope.saveUser = function() {
            if ($scope.isEdit) {
                $scope.saveUserPromise = MortarUser.save($scope.userCopy);
                $scope.saveUserPromise.then(function(response) {
                    $scope.user = $scope.userCopy;
                    MortarUser.getUsers().then(
                        function(response) {
                            $scope.users = users;
                        }
                    );
                    Alert.open('success', response);
                    $modalInstance.close(true);
                }, function(response) {
                    $modalInstance.close(true);
                });
            } else {
                var data = {
                    name: $scope.user.name,
                    email: $scope.user.email,
                    group: $scope.user.group,
                    username: $scope.user.username,
                    password: $scope.user.password,
                    password2: $scope.user.password2,
                    root_folder: $scope.user.rootFolder,
                    favorites_folder: $scope.user.favoritesFolder
                };

                $scope.createUserPromise = MortarUser.create(data);
                $scope.createUserPromise.then(function(response) {
                    Alert.open('success', response);
                    MortarUser.getUsers().then(
                        function(response) {
                            $scope.users = users;
                        }
                    );
                    $modalInstance.close(true);
                }, function(response) {
                    $scope.cp.error = true;
                    $scope.cp.errorMessage = response;
                });
            }
        };

        // Close modal form on cancel
        $scope.cancel = function() {
            $modalInstance.close(true);
        };
    });

    /**
     * Controller to create and update user
     * @param  object  $scope scope of the controller
     * @param  object  $modalInstance modal instance to manage
     * @param  service MortarUser  service instance to manage user actions
     * @param  string  username user username to load on edit
     * @param  service  User service instance to manage logged in user actions
     * @param  service  Alert service instance to manage user messages
     * @author Jairo Diaz Montero <jairo.diaz.montero.07@gmail.com>
     */
    app.controller('UserInitCtrl', function($scope, $modalInstance, MortarUser,
        username, password, User, Alert, Browser) {
        $scope.cp = {
            error: false,
            errorMessage: ''
        };
        $scope.user = {};
        $scope.user.rootFolder = 'root';
        $scope.user.favoritesFolder = username.concat(username, '_Favorites');
        $scope.userCopy = {};

        $scope.isModalCanceled = false;

        //Todo inband registration
        // Save user data, this handles both user creation and editing
        $scope.saveUser = function() {
            var data = {
                name: $scope.user.name,
                email: $scope.user.email,
                group: $scope.user.group,
                username: $scope.user.username,
                password: password,
                root_folder: $scope.user.rootFolder
            };
            if ($scope.user.email != '') User.name = $scope.user.name;
            if ($scope.user.email != '') User.email = $scope.user.email;
            $scope.createUserPromise = User.setVcard(User.name, User.email);
            $scope.createUserPromise.then(function(response) {
                $modalInstance.close(false);
                $scope.cp.error = false;
            }, function(response) {
                $scope.cp.error = true;
                $scope.cp.errorMessage = response;
                Alert.open('error', response);
            }, function(response) {
                $scope.cp.error = true;
                $scope.cp.errormessage = response;
                Alert.open('error', response);
                $modalinstance.close(true);
            });
        };

        // Close modal form on cancel
        $scope.cancel = function() {
            $scope.isModalCanceled = true;
            $modalInstance.close(true);
        };
    });
    //Todo
    /**
     *Controller to manage user password change
     *@param object $scope scope for this user
     *@param object $modalInstance modal passed to controller
     *@param service Alert service to manage messages to user
     *@param string strUsername username of user to change password
     *@param factory MortarUser factory instance to manage user models
     *@param service User service instance to manage logged in user actions
     *@author Jairo Diaz Montero <jairo.diaz.montero.07@gmail.com>
     */
    app.controller('UserChangePasswordCtrl', function($scope, $modalInstance, Alert, strUsername, MortarUser, User) {
        $scope.user = {};
        $scope.cp = {
            error: false,
            errorMessage: ''
        };
        $scope.getUserPromise = MortarUser.get(strUsername);
        $scope.getUserPromise.then(function(response) {
            $scope.user = response;
            $scope.user.password = '';
            $scope.user.password2 = '';
        }, function(response) {
            $scope.cp.error = true;
            $scope.cp.errorMessage = response;
        });

        $scope.changePassword = function() {
            $scope.changePasswordPromise = $scope.user.changePassword();
            $scope.changePasswordPromise.then(function(response) {
                // set new user token
                if ($scope.user.username === User.username) {
                    User.token = response.token;
                    User.saveSession();
                }
                $scope.updateUserPromise = $scope.user.update();
                $scope.updateUserPromise.then(function(response) {
                    Alert.open('success', response);
                    $modalInstance.close(true);
                }, function(response) {
                    Alert.open('warning', 'Changes successfully saved, but view could not be updated, try reloading.');
                    $modalInstance.close(true);
                });
            }, function(response) {
                $scope.cp.error = true;
                $scope.cp.errorMessage = response;
            });
        }

        $scope.cancel = function() {
            $modalInstance.dismiss();
        }
    });
})();
