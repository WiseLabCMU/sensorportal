/**
 * Device Controller module
 */
(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('device-controller', ['ui.router',
        'mortar-services', 'cgBusy', 'ui.bootstrap',
        'alert-handler', 'angularFileUpload', 'checklist-model',
        'olmap-directive', 'ja.qr', 'angularTreeview', 'uuid4',
        'angular-centered', 'ngRoute'
    ]);
    /**
     * Controller for managing device actions
     * @param  object $scope    scope of the controller
     * @param  service $http    angulars $http service
     * @param  service $state   ui router state service
     * @param  {[type]} $stateParams [description]
     * @param  factory User     User factory instance
     * @param  {[type]} Device       [description]
     * @param  {[type]} Alert        [description]
     */
    app.controller('DeviceCtrl', function($scope, $state, $route, $stateParams, User,
        Device, Alert) {
        $scope.folder = Device;
        $scope.user = User;
        $scope.device = null;
        $scope.devices = [];
        $scope.permittedDevices = User.permittedDevices.publisher;
        $scope.subscribeDevices = User.permittedDevices.subscribed;
        $scope.ownerDevices = User.permittedDevices.owner;
        $scope.subscrbValidator = {
            isSubscribe: false,
            isUnsubscribe: false
        };
        Device.constructDevice($stateParams['id'], true, true).then(function(device) {
            $scope.device = device;
            $scope.subscrbValidator.isSubscribe = $scope.user.isSubscribe($scope.device.id);
            $scope.subscrbValidator.isUnSubscribe = $scope.user.isUnSubscribe($scope.device.id);
            if (typeof device.parent != 'undefined') {
                $scope.loadParent = Device.getParent(device.parent.id);
                $scope.loadParent.then(function(parentDevice) {
                    $scope.device.parentDetail = parentDevice;
                }, function(error) {
                    Alert.open('Could not load current device\'s parent', error);
                });
            }
        });
	$scope.reload = function() { 
		$route.reload();
	};


        /**
         * subscribe Subscribe a user to the current device
         */
        $scope.subscribe = function() {
            $scope.promiseSubs = $scope.device.subscribe();
            $scope.promiseSubs.then(function(response) {
                $scope.user.getPermittedDevices();
                $scope.subscrbValidator.isSubscribe = false;
                $scope.subscrbValidator.isUnsubscribe = true;
                Alert.open('Subscribed to ' + $scope.device.id, response);
            }, function(error) {
                Alert.open('warning', error);
            });
        };
        /**
         * unSubscribe Unsubscribe a user from current device
         */
        $scope.unSubscribe = function() {
            $scope.promiseUnsubs = $scope.device.unsubscribe();
            $scope.promiseUnsubs.then(function(response) {
                $scope.user.getPermittedDevices();
                $scope.subscrbValidator.isSubscribe = true;
                $scope.subscrbValidator.isUnsubscribe = false;
                Alert.open('Unsubscribed', response);
            }, function(error) {
                Alert.open('warning', error);
            });
        };
    });
    app.controller('DeviceMapCtrl', function($scope, $stateParams, Device) {
        $scope.folder = $stateParams.folder;
        $scope.device = typeof $stateParams.device != 'undefined' ? $stateParams.device : null;
    });

    /**
     * Constroller in charge of showing the map in the device detail
     * @param  object $scope       controller scope
     * @param  object $stateParams url params
     * @param  service Device       Device service
     */
    app.controller('DeviceDetailMapCtrl', function($scope, $stateParams, Device, User) {
        $scope.$watch('device', function() {
            Device.constructDevice($stateParams['id'], true).then(function(device) {
                $scope.device = device;
            });
        });
    });
    /**
     * Controller for managing device detail view
     * @param  object $scope  
     * @param  service $http  
     * @param  factory Device 
     * @param  factory User           
     */
    app.controller('DeviceViewCtrl', function($scope, $state, $stateParams, Device,
        User, $location, $window, Alert) {
        var modalInstance;
        $scope.user = User;
        $scope.qrString = $location.$$absUrl;
        $scope.$watch('device', function() {
            if ($scope.device == null) {
                Device.constructDevice($stateParams['id'], true).then(
                    function(device) {
                        $scope.device = device;
                    });
            }
        });

    });
    /**
     * [description]
     * @param  {[type]} $scope    [description]
     * @param  {[type]} $http     [description]
     * @param  {[type]} $interval [description]
     * @param  {[type]} Device    [description]
     * @param  {[type]} Alert     [description]
     * @param  {[type]} User      [description]
     * @return {[type]}           [description]
     */
    //todo update device when that changes
    app.controller('DeviceTransducersCtrl', function($scope, $http,
        $stateParams, $interval, Device,
        Alert, User) {
        $scope.user = User;
        $scope.$watch('device', function() { // update transducers value each 3 minutes  
            if ($scope.device != null && angular.isDefined($scope.device.transducers)) {
                $scope.device.getData();
            }
        });
        var i = $interval(function() {
            if ($scope.device != null && angular.isDefined($scope.device.transducers)) {
                $scope.device.getData();
            }
        }, UPDATE_TRANSDUCER_INTERVAL, 1);

        // on scope change (destroy) cancel interval
        $scope.$on('$destroy', function() {
            $interval.cancel(i);
        });
    });

    /**
     * Device Modal Controller to manage the edit a create device
     * @param  service $scope [description]
     * @param  service $modalInstance Instance of the modal
     * @param  service $http  [description]
     * @param  service Device [description]
     * @param  factory User   [description]
     */
    app.controller('DeviceModalCtrl', function($scope, User, $modalInstance, $state,
        $stateParams, $upload, $window, $modal,
        Device, Alert, Browser, $q) {
        $scope.parentDevice = {};
        $scope.user = User;
        $scope.showAutomap = false;
        $scope.$watch('device', function() {
            if ($scope.device == null) {
                Device.constructDevice($stateParams['id']).then(function(device) {
                    $scope.device = device;
                    if (typeof device.location === 'undefined') {
                        device.location = {};
                        device.lon = 0;
                        device.lat = 0;
                        device.location.street = '';
                        device.location.building = '';
                        device.location.floor = '';
                        device.location.root = '';
                    }
                    if (typeof $scope.device.parent != 'undefined') {
                        $scope.parentDevice.selectNodeLabel(Device.references[device.parent.id]);
                    }
                    if (typeof $scope.imageUrl === 'udefined') {
                        $scope.device.imageUrl = '';
                    }
                });
            }
        });

        //toDo reintroduce automap getpossibles

        //toDo Update Geolocation form
        /**
         * setDeviceLocation Set the Device location
         * @param double lon longitud
         * @param double lat latitude
         */
        $scope.setDeviceLocation = function(lon, lat) {
                $scope.device.location.lat = lat;
                $scope.device.location.lon = lon;
        }
        //todo url
        /**
         * [onFileSelect description]
         * @param  {[type]} $files [description]
         * @return {[type]}        [description]
         */
        $scope.onFileSelect = function($files) {
            $scope.device.image = $files[0];
        }

        /**
         * selectFolder callback function to pass to browser directive
         * @param  Folder objFolder Folder object
         */
        $scope.selectFolder = function(objFolder) {
            $scope.selectedFolder = objFolder;
        };

        /**
         * isNotSelect callback function to determine if folder is already
         * selected. 
         * @param  Folder objFolder Folder object
         */
        $scope.isNotSelect = function() {
            return typeof $scope.selectedFolder === 'undefined';
        };
        /**
         * addFolder callback function to pass to browser directive
         */
        $scope.addFolder = function() {
            modalInstance = $modal.open({
                templateUrl: 'angular-app/partials/FolderModal.html',
                controller: 'FolderModalCtrl',
                scope: $scope,
                resolve: {
                    fromModal: function() {
                        return true;
                    }
                }
            });
            modalInstance.result.then(function(objFolder) {
                //$scope.parentDevice.selectNodeLabel(Browser.references[objFolder.id]);
                $scope.parentDevice.selectNodeLabel(Browser.references[objFolder.id]);
            });
        };
        /**
         * addFolder callback function to pass to browser directive
         */
        $scope.addDevice = function() {
            modalInstance = $modal.open({
                templateUrl: 'angular-app/partials/DeviceModal.html',
                controller: 'FolderModalCtrl',
                scope: $scope,
                resolve: {
                    fromModal: function() {
                        return true;
                    }
                }
            });
            modalInstance.result.then(function(objFolder) {
                $scope.parentDevice.selectNodeLabel(Browser.references[objFolder.id]);
            });
        };
        /**
         * [isNotSelect description]
         * @return {Boolean} [description]
         */
        $scope.isNotSelect = function() {
            return typeof $scope.selectedFolder === 'undefined';
        };
        /**
         * submitDevice send to update the device
         * @return {[type]} [description]
         */
        //todo not sure if correct handeling in device.parent undefined case
        $scope.submitDevice = function() {
            var hasNewParent = $scope.device.getParent().id != $scope.selectedFolder.id;
            $scope.device.save().then(function(response) {
                Alert.open('success', response);
                if (typeof $scope.device.parent != 'undefined' && $scope.device.parent.id &&
                    $scope.parent.id != $scope.selectedFolder.id) {
                    Devices.references[$scope.device.parent.id].getChildren();
                    $scope.device.parent = $scope.selectedFolder;
                } else {
                    if (typeof $scope.device.parent == 'undefined') {
                        $scope.selectedFolder.getChildren();
                        $scope.device.parent = $scope.selectedFolder;
                    }
                }
                $modalInstance.close(true);
            }, function(error) {
                $scope.cp.error = true;
                $scope.cp.errorMessage = error;
            });

        };
        /**
         * cancel the current modal opened
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    });

    /**
     * Controller for handling timeseries data of the device,
     * gets the transducers of said device, and sets defaults for the datepicker
     * @param  $scope controllers scope
     * @param  Device current device
     * @param  User   current user
     */
    app.controller('DeviceTimeSeriesCtrl', function($scope, Device, User) {
        $scope.user = User;
        $scope.$watch('device', function() {
            if ($scope.device != null) {
                if (angular.isUndefined($scope.device.transducers)) {
                    $scope.device.getMeta();
                }
            }
        });

    });
    /**
     * [description]
     * @param  {[type]} $scope    [description]
     * @param  {[type]} $http     [description]
     * @param  {[type]} User      [description]
     * @param  {[type]} Device    [description]
     * @param  {[type]} Alert     [description]
     * @param  {[type]} $interval [description]
     * @return {[type]}           [description]
     */
    app.controller('DeviceFunctionsCtrl', function($scope, User, Device, Alert, $interval) {
        $scope.user = User;

        $scope.command = {};
        $scope.command.value = "";
        $scope.$watch('device', function() {
            if ($scope.device != null) {
                if (angular.isUndefined($scope.device.transducers)) {
                    $scope.device.getTransducers();
                }
            }
        });
        // update transducers value each 3 minutes
        var i = $interval(function() {
            if ($scope.device != null && angular.isDefined($scope.device.transducers)) {
                $scope.device.getData();
            }
        }, UPDATE_TRANSDUCER_INTERVAL, 1);

        // on scope change (destroy) cancel interval
        $scope.$on('$destroy', function() {
            $interval.cancel(i);
        });

        /**
         * Valid if a value is set
         */
        $scope.isValid = function(command) {
            /*if (typeof command != 'undefined' && command.value != '') {
                return false;
            }*/
            return true;
        };
        /**
         * Run a command
         * @param  {[type]} transducer [description]
         * @param  {[type]} command    [description]
         * get transducer data to pass to a command a then execute
         */
        // todo make sure that transducer is a string
        $scope.runCommand = function(transducer, command) {
            if (typeof command == 'undefined') {
                Alert.close();
                Alert.open('warning', 'Enter a value');
                return;
            }
            $scope.sendCmd = $scope.device.actuate(transducer, command);
            $scope.sendCmd.then(function(response) {
                Alert.close();
                Alert.open('success', 'Command successfully executed.');
                if ($scope.device != null) {
                    $scope.device.getData();
                }

            }, function(error) {
                Alert.close();
                Alert.open('warning', error);
            });

        };
    });
    /**
     * [description]
     * @param  {[type]} $scope         [description]
     * @param  {[type]} $modalInstance [description]
     * @param  {[type]} $http          [description]
     * @param  {[type]} $state         [description]
     * @param  {[type]} $stateParams   [description]
     * @param  {[type]} User           [description]
     * @param  {[type]} Alert          [description]
     * @param  {[type]} Device         [description]
     * @param  {[type]} Folder         [description]
     * @param  {[type]} Favorite       [description]
     * @param  {[type]} $q             [description]
     * @param  {[type]} $timeout       [description]
     * @return {[type]}                [description]
     */
    app.controller('DevFavoritesModalCtrl', function($scope, $modal, $modalInstance, $state, $stateParams, 
						     User, Alert, Device, Browser, $q, $timeout) {
        $scope.devBrowserFavorites = {};
        Browser.children = [User.favoritesFolder];
        $scope.newFavorites = [];
        $scope.favoritesToRemove = [];
        $scope.isAlreadySelected = false;
        $scope.errors = [];
        Device.constructDevice(User.favoritesFolder, true).then(function(device) {
            $scope.favorite = device;
        });
        Device.constructDevice($stateParams['id'], true).then(function(device) {
            $scope.device = device;
            $scope.device.folders = [];
        });

        $scope.$watch(function() {
            return User.favoritesFolder;
        }, function() {
            if (typeof $scope.favorite != 'undefined' &&
                $scope.favorite.id != null && typeof $scope.favorite.id != 'undefined') {
                $scope.addFavorite($scope.favorite);
                $scope.favorite.id = null;
                $scope.favorite.name = null;
            }
        });

        $scope.$watch('device', function() {
            if ($scope.device != null && angular.isUndefined($scope.device.folders)) {
                $scope.device.folders = [];
            }
        });
        /**
         * addFolder callback function to pass to browser directive
         */
        //todo add to other folders than favorite
        $scope.addFolder = function() {
            modalInstance = $modal.open({
                templateUrl: 'angular-app/partials/FolderModal.html',
                controller: 'FolderModalCtrl',
                scope: $scope,
                resolve: {
                    fromModal: function() {
                        return true;
                    }
                }
            });
            modalInstance.result.then(function(objFolder) {
                $scope.addFavorite(objFolder);
            });
        };
        /**
         * [myIndexOf description]
         * @param  {[type]} arr [description]
         * @param  {[type]} obj [description]
         * @return {[type]}     [description]
         */
        $scope.myIndexOf = function(arr, obj) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].id == obj.id) {
                        return i;
                    }
                };
                return -1;
            }
            /**
             * [addFavorite description]
             * @param {[type]} $favorite [description]
             */
        $scope.addFavorite = function($favorite) {
                var favorite = {
                    id: $favorite.id,
                    name: $favorite.name
                };
                var indexNewFavorites = $scope.myIndexOf($scope.newFavorites, favorite);
                var indexDeletedFavorites = $scope.myIndexOf($scope.favoritesToRemove, favorite);
                //if (typeof $scope.device == 'undefined') return;
                var inFavorites = $scope.device.isFavorite;
                if (indexDeletedFavorites !== -1) {
                    $scope.favoritesToRemove.splice(indexDeletedFavorites, 1);
                    return;
                }
                if (inFavorites == true || indexNewFavorites !== -1) {
                    $scope.isAlreadySelected = true;
                    return;
                }
                $scope.newFavorites.push(favorite);
                $scope.isAlreadySelected = false;
            }
            /**
             * [deleteFavorite description]
             * @param  {[type]} $favorite [description]
             * @return {[type]}           [description]
             */
        $scope.deleteFavorite = function($favorite) {
            var indexNewFavorites = $scope.myIndexOf($scope.newFavorites, $favorite);
            if (indexNewFavorites !== -1) {
                $scope.newFavorites.splice(indexNewFavorites, 1);
            }
        };
        /**
         * submit send the resques to add device to favorite
         */
        $scope.submit = function() {
            $scope.allPromise = [];
            if ($scope.newFavorites.length > 0) {
                $scope.loading = true;
                for (favorite in $scope.newFavorites) {
                    var folderid = $scope.newFavorites[favorite].id;
                    $scope.allPromise.push(
                        Device.constructDevice(folderid, false).addReferences(
                            [{
                                type: 'child',
                                id: $scope.device.id,
                                metaType: 'device',
                                name: $scope.device.name
                            }]));
                }
                $q.all($scope.allPromise).then(function(response) {
                    $scope.errors = [];
                    for (var i = 0; i < response.length; i++) {
                        if (typeof response[i].error != 'undefined') {
                            $scope.errors.push(response[i].id);
                        } else {
                            Browser.loadChildren($scope.newFavorites[i].id);
                        }
                    }

                    Alert.close();

                    Alert.open('success', 'Device successfully added to favorites');
                    $modalInstance.close(true);
                }, function(error) {
                    var message = 'Device could not be added to some favorites: ';
                    for (error in $scope.errors) {
                        message += $scope.errors[error];
                        if (error != $scope.errors.length - 1) {
                            message += ', ';
                        }
                    }
                    Alert.close();
                    Alert.open('warning', message);
                    $modalInstance.close(true);
                });
            } else {
                $modalInstance.close(true);
            }
        };
        /**
         * isFolderNotSelect check if there is a folder select
         * @return Boolean 
         */
        $scope.isFolderNotSelect = function() {
            return $scope.newFavorites.length <= 0;
        };
        /**
         * [cancel description]
         * @return {[type]} [description]
         */
        $scope.cancel = function() {
            $modalInstance.dismiss($scope.selectedFolder);
        };
    });


    /**
     *Controller to manage device permissions
     *@param object $scope scope for this cntroller
     *@param service Device device service instance
     *@param object $stateParams parameters passed to state
     *@param object $modalInstance modal instance to manage
     *@param service $http service to perform http requests
     */
    //todo get user vcard information
    app.controller('DeviceSetPermissionsCtrl', function($scope, Device, $stateParams, $modalInstance, User, Alert, MortarUser, $http) {
        $scope.isFolder = false;
        $scope.user = User;
        $scope.username = "";
        $scope.node = null;

        $scope.devicePromise =
            Device.constructDevice($stateParams['id'], true);

        $scope.$watch('device', function() {
            if ($scope.node != null && angular.isUndefined($scope.node.affiliations)) {
                $scope.node.getAffiliations();
            }
        });

        $scope.deviceId = $stateParams['id'];
        $scope.usersToAdd = {
            publisher: [],
            owner: []
        };
        $scope.usersToRemove = [];
        $scope.isAlreadySelected = false;
        $scope.showUsers = true;
        /**
         * loadUsers load all user data
         */
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

        /**
         * addUser Add a user to the new user list
         * @param User $item user to add
         */
        $scope.addUser = function(username, permission) {
            //var username = $item.username;
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
            //todo test this
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
         * cancel Dismiss the modal
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        }
    });

})();
