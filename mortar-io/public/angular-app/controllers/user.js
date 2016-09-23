/**
 * User controller module
 */
(function() {
    var app = angular.module('user-controller', ['ui.router', 'mortar-services',
        'cgBusy', 'angularTreeview', 'ui.bootstrap', 'xml-rpc', 'rt.timeout',
        'mortar-directives'
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
    app.controller('UsersCtrl', function($scope, Alert, MortarUser, $modal,
        User, $q, $timeout) {
        // todo extend to people who do not have xmlrpc access
        $scope.users = [];
        $scope.user = User;
        $scope.$watch(function() {
            return User;
        }, function(oldValue, newValue) {
            $scope.user = newValue;
        });
        $scope.userCallback = function(i) {
            return function(userResponse) {
                $scope.users[i] = userResponse;
            }
        };
        $scope.usersGetPromise = MortarUser.getUsers().then(
            function(response) {
                if (typeof response === 'undefined') {
                    return null;
                }
                if (typeof response.error != 'undefined') {
                    return response.error;
                }
                var promises = [];
                var domainTag = "@" + User.connection.domain;
                $scope.users = response.users;
                for (userIndex in response.users) {
                    var user = response.users[userIndex];
                    var callback = $scope.userCallback(userIndex);
                    MortarUser.get(user.username + domainTag).then(callback);
                }
                if (response.messages) {
                    Alert.open('warning', response.messages);
                }
            },
            function(response) {
                Alert.open('warning', response);
            });
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
                
            }, function(result) {
                Alert.open(result);
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
    app.controller('UserProfileCtrl', function($scope, $stateParams, User,
        $state, $modal, MortarUser, Alert, Device) {
        $scope.devices = {};
        if (typeof $stateParams.username == 'undefined') {
            
        } else if ($stateParams.username == User.username) {
            $scope.user = User;
            User.nodes = {};
            //load first ten devices
            for (permittedTypeIndex in $scope.user.permittedDevices) {
                var permittedType = $scope.user.permittedDevices[permittedTypeIndex];
                var count = 0;
                for (permittedDevice in permittedType) {
                    Device.constructDevice(permittedDevice, true).then(
                        function(device) {
                        	$scope.devices[device.id] = device;
                    	});
                    count++;
                    if (count == 10) {
                        break;
                    }
                }
            }
        } else if ($stateParams.username.indexOf('@') >= 0) {
            user = $stateParams.username;
        } else {
            user = $stateParams.username + '@' + User.connection.domain;
        }

        if (typeof $scope.user == 'undefined') {
            $scope.getUserPromise = MortarUser.get(user).then(function(result) {
                $scope.user = result;
            }, function(errorstanza) {
                Alert.open('warning', errorstanza);
            });
        }

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
                }, function(result) { 
                	Alert.open('error', result);
                });
            },
            function() {};

        //Todo
        $scope.getUserInfo = function() {
                var deferred = $q.defer();
                if (typeof $scope.user.username != 'undefined' && 
                  MortarUserFactory.user.username == username) {
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

            $state.go('device.view.detail', {
                id: node
            });
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
    app.controller('UserCreateEditCtrl', function($scope, $modalInstance, User,
        MortarUser, $stateParams, Alert, Browser, Device) {
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
        if ($stateParams.username == User.username) {
            $scope.editSelf = true;
        } else {
            $scope.editSelf = false;
        }

        // If username is passed then load this user's data
        if (typeof username != 'undefined') {
        	if (username == User.username) { 
        		$scope.user = User;
        		$scope.getFolderPromise = Device.constructDevice(
                    $scope.user.rootFolder, true);
                $scope.getFolderPromise.then(function(folder) {
                    $scope.userRootFolder = folder;
                    $scope.userCopy = folder;
                    Browser.references[$scope.user.rootFolder] = $scope.userRootFolder;
                    $scope.selectedFolder = $scope.user.rootFolder;
                    $scope.folderLoaded = true;
                }, function(response) {
                    Alert.open('warning', response);
                });
        	} else {
            $scope.userCopy = {};
            $scope.getUserPromise = MortarUser.get(username);
            $scope.getUserPromise.then(function(response) {
                $scope.user = response;
                $scope.getFolderPromise = Device.constructDevice(
                    $scope.user.rootFolder, true);
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
            $scope.createUser = false;
            }
        } else {
            $scope.createUser = true;
        }
        
		$scope.isEdit = function () { 
			return $stateParams.isEdit;
		}
		
        // sets the selected folder to user
        $scope.selectFolder = function(folder) {
                $scope.user.rootFolder = folder.id;
        }
        
        // edit existing user's vcard
        $scope.editUser = function() {
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
        };

        // create a new user
        $scope.createUser = function() {
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
                $modalInstance.close(response);
            });
        }

        // Save user data, this handles both user creation and editing
        $scope.saveUser = function() {
            if ($scope.isEdit) {
                $scope.editUser();
            } else {
                $scope.createUser();
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
        username, User, Alert, Browser) {
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
            /*var data = {
                name: $scope.user.name,
                email: $scope.user.email,
                group: $scope.user.group,
                username: $scope.user.username,
                password: password,
                root_folder: $scope.user.rootFolder
            };*/
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
    app.controller('UserChangePasswordCtrl', function($scope, $stateParams, 
      $modalInstance, Alert, strUsername, MortarUser, User) {
        $scope.cp = {
            error: false,
            errorMessage: ''
        };
        if ($stateParams.username == User.username) { 
        	$scope.user = User;
        	$scope.user.password = '';
        	$scope.user.password2 = '';
        } else {
			$scope.getUserPromise = MortarUser.get($stateParams.username);
        	$scope.getUserPromise.then(function(response) {
            	$scope.user = response;
            	$scope.user.password = '';
            	$scope.user.password2 = '';
        	}, function(response) {
            	$scope.cp.error = true;
            	$scope.cp.errorMessage = response;
        	});
		}
        $scope.changePassword = function() {
            $scope.changePasswordPromise = $scope.user.changePassword(
              $scope.user.password);
            $scope.changePasswordPromise.then(function(response) {
                // set new user token
                if ($scope.user.username === User.username) {
                    User.token = response.token;
                    User.saveSession();
                }
                $modalInstance.close(true);
            }, function(response) {
                $scope.cp.error = true;
                $scope.cp.errorMessage = response;
            });
        };

        $scope.cancel = function() {
            $modalInstance.dismiss();
        }
    });
})();
