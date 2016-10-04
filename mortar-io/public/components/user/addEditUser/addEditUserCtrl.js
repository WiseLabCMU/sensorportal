(function() {
    var app = angular.module('addedit-user-controller', ['ui.router', 'mortar-services',
        'cgBusy', 'angularTreeview', 'ui.bootstrap', 'xml-rpc', 'rt.timeout'
    ]);
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


})();
