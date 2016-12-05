/**
 * Folder Controller module
 */
(function() {
    var app = angular.module('browser-controller', ['uuid4', 'ui.router', 'mortar-services', 'cgBusy', 'angularTreeview', 'ui.bootstrap', 'angularFileUpload', 'ngRoute']);
    /**
     * Controlles for managing folder components
     * @param  object $scope    scope of the controller
     * @param  factory User     User factory instance
     * @param  factory Folder   User factory instance
     * @param  factory Device   User factory instance
     * @parem  service $state   ui router state service
     * @param  service $http    angulars $http service
     * @param  filter $filter   angular filter service
     */
    app.controller('BrowserCtrl', function($scope, User, Mio, Device, $state, $filter,
        $modal, Browser, $route) {
        //Initial object of the controller
        $scope.devBrowser = {};

        $scope.selectedFolder = Browser.references[User.favoritesFolder];
        /**
         * selectFolder callback function to call inside the browser
         * @param  Folder objFolder object selected in the browser
         */
        $scope.selectFolder = function(objFolder) {
            if (typeof objFolder == 'undefined' || typeof objFolder.id == 'undefined') {
                return;
            }
            $scope.selectedFolder = objFolder;
            Device.constructDevice(objFolder.id, true).then(
                function(device) {
                    $state.go('device.list', {
                        folder: objFolder.id
                    });
                });
        };

        /**
         * selectDevice callback function to call inside the browser
         * @param  Device objDevice object selected in the browser
         */
        $scope.selectDevice = function(objDevice) {
            $state.go('device.view.detail', {
                id: objDevice.id
            });
        };

        /**
         * addFolder callback function to pass to browser directive
         */
        $scope.addFolder = function(param) {
            $scope.modalInstance = $modal.open({
                templateUrl: 'components/folder/folderAdd/folderAdd.html',
                controller: 'FolderAddCtrl',
                scope: $scope,
                resolve: {
                    fromModal: function() {
                        return false;
                    }
                }
            });
            $scope.modalInstance.result.then(function(refreshIds) {
                for (var refreshIndex in refreshIds) {
                    Browser.loadChildren(refreshIds[refreshIndex]);
                }
            });
        };
        /**
         * removeFolder callback function to pass to browser directive
         */
        $scope.removeFolder = function(param) {
            $scope.modalInstance = $modal.open({
                templateUrl: '/components/nodeServices/referenceRemove/folderRemoveModal.html',
                controller: 'FolderRemoveCtrl',
                scope: $scope,
                resolve: {
                    fromModal: function() {
                        return false;
                    }
                }
            });
            $scope.modalInstance.result.then(function(updateIds) {
                for (var idIndex = 0; idIndex < updateIds.length; idIndex++) {
                    Browser.loadChildren(updateIds[idIndex]);
                    //$scope.selectedFolder = updateIds[0];
                }
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
     * @param  {[type]} $upload        [description]
     * @param  {[type]} $window        [description]
     * @param  {[type]} fromModal      [description]
     * @param  {[type]} Alert          [description]
     * @param  {[type]} Folder         [description]
     * @param  {[type]} Favorite       [description]
     * @param  {[type]} Browser        [description]
     * @param  {[type]} User           [description]
     * @param  {[type]} Device         [description]
     * @return {[type]}                [description]
     */
    //app.controller('FolderRemoveModalCtrl', function($scope, $modalInstance, $state,
    //     $stateParams, $upload, $window, fromModal,
    //     Alert, $q, Favorite, Browser, User, Device, uuid4) {
    //     $scope.favorite = Favorite;
    //     $scope.modalBrowser = {};
    //     $scope.folder = null;
    //     $scope.cp = {
    //         username: '',
    //         error: false,
    //         errorMessage: ''
    //     };
    //     $scope.showRoot = true;
    //     $scope.isFromModal = fromModal;
    //     $scope.selectedFolder = "";
    //     $scope.selectedParents = {};
    //     $scope.parents = [];
    //     $scope.parent = null;
    //     $scope.isOpen = false;
    //     $scope.toggled = function(selection) {
    //         $scope.selectedParent = selection;
    //     };

    //     if (User.isPublisherOrOwner(User.rootFolder)) {
    //         Browser.children = [User.rootFolder, User.favoritesFolder];
    //     } else {
    //         Browser.children = [User.favoritesFolder];
    //     }
    //     /**
    //      * removeFolder removes reference to a device.
    //      */
    //     $scope.removeFolder = function() {
    //         $self.deferred = $q.defer();
    //         $scope.selectedParent = $scope.parents[0];
    //         $scope.selectedParentId = $scope.selectedParent.id;
    //         Device.constructDevice($scope.selectedParentId, true, false).then(
    //             function(parentDev) {
    //                 Device.constructDevice($scope.selectedFolder.id, true).then(
    //                     function(childDev) {
    //                         childDev.removeReferences([parentDev]);
    //                         parentDev.removeReferences([childDev]);
    //                         $self.deferred.resolve(true);
    //                         $modalInstance.close([$scope.selectedParent, childDev.id]);
    //                     },
    //                     function(error) {
    //                         console.log(error);
    //                         $self.deferred.reject(error);
    //                     });
    //             },
    //             function(error) {
    //                 console.log(error);
    //                 $self.deferred.reject(error);
    //             });
    //         return $self.deferred.promise;
    //     };

    //     /**
    //      * selectFolder callback function to call inside the browser
    //      * @param  Folder folder object selected in the browser
    //      */
    //     $scope.selectFolder = function(folder) {
    //         var keys;
    //         $scope.selectedFolder = folder;
    //         if (typeof folder == 'undefined') {
    //             return;
    //         }
    //         $scope.selectedParents = folder.parents;
    //         $scope.selectedParent = {};
    //         $scope.parents = [];
    //         if (typeof $scope.selectedParents != 'undefined') {
    //             keys = Object.keys($scope.selectedParents);
    //             for (keyInd in keys) {
    //                 $scope.parents.push($scope.selectedParents[keys[keyInd]]);
    //             }
    //         }
    //     };

    //     /**
    //      * selectFolder callback function to call inside the browser
    //      * @param  Folder folder object selected in the browser
    //      */
    //     $scope.selectDevice = function(folder) {
    //         var keys;
    //         $scope.selectedFolder = folder;
    //         $scope.selectedParents = folder.parents;
    //         $scope.selectedParent = {};
    //         $scope.parents = [];
    //         keys = Object.keys($scope.selectedParents);
    //         for (keyInd in keys) {
    //             $scope.parents.push($scope.selectedParents[keys[keyInd]]);
    //         }
    //     };

    //     /**
    //      * isFolderNotSelect validate if there is a folder select int browser
    //      * @return Boolean return true if there is not a folder select not apply if is root o favorite
    //      */
    //     $scope.isFolderNotSelect = function() {
    //         return typeof $scope.selectedFolder == 'undefined';
    //     }

    //     /**
    //      * Close the create folder modal
    //      */
    //     $scope.cancel = function() {
    //         $modalInstance.dismiss();
    //     };
    // });


    /**
     * [description]
     * @param  {[type]} $scope         [description]
     * @param  {[type]} $modalInstance [description]
     * @param  {[type]} $http          [description]
     * @param  {[type]} $state         [description]
     * @param  {[type]} $stateParams   [description]
     * @param  {[type]} $upload        [description]
     * @param  {[type]} $window        [description]
     * @param  {[type]} fromModal      [description]
     * @param  {[type]} Alert          [description]
     * @param  {[type]} Folder         [description]
     * @param  {[type]} Favorite       [description]
     * @param  {[type]} Browser        [description]
     * @param  {[type]} User           [description]
     * @param  {[type]} Device         [description]
     * @return {[type]}                [description]
     */
    app.controller('FolderModalCtrl', function($rootScope, $scope, $q,
        $modalInstance, $state, $stateParams, $upload, $window, Alert,
        Favorite, Browser, User, Device, uuid4) {
        $scope.favorite = Favorite;
        $scope.modalBrowser = {};
        Browser.children = [User.rootFolder, User.favoritesFolder];
        $scope.cp = {
            username: '',
            error: false,
            errorMessage: ''
        };
        $scope.folder = {
            id: uuid4.generate(),
            name: '',
            mapUri: '',
            mapUriUrl: '',
            type: 'location'
        };
        $scope.showRoot = (User.isAdmin()) ? true : false;
        $scope.showRoot = true;
        //$scope.isFromModal = fromModal;
        $scope.isRootOrFavorite = false;
        $scope.selectedFolder = undefined;

        if (User.isPublisherOrOwner(User.rootFolder)) {
            Browser.children = [User.rootFolder, User.favoritesFolder];
        } else {
            Browser.children = [User.favoritesFolder];
        }
        $scope.isUpdate = angular.isDefined($stateParams.folders) && $stateParams['folders'] != '';
        if ($scope.isUpdate) {
            $scope.folder = Device.objFolder;
            $scope.loadFolder = Device.constructDevice($stateParams['folders'],
                true, true);
            $scope.loadFolder.then(function(device) {
                Device.objFolder = device;
                $scope.folder = device;
                $scope.isRootOrFavorite = ($scope.folder.id == User.favoritesFolder) ||
                    ($scope.folder.id == 'root');
                if (typeof device.parent != 'undefined') {
                    $scope.selectedFolder = device.parent;
                }
            }, function(error) {
                $scope.cp.error = true;
                $scope.cp.errorMessage = error;
                Alert.open(result);
                modal.cancel([]);
                //$state.go($rootScope.lastState, $rootscope.lastParams);
            });

        }

        /**
         * onFileSelect  save the file in variable
         * @param  array $files [description]
         */
        $scope.onFileSelect = function($files) {
            $scope.folder.file = $files[0];
        }

        /**
         * Submit the necesarry data to update or create a folder
         */
        $scope.submitFolder = function() {
            if ($scope.isUpdate) {
                $scope.folder.publishMeta();
                if (typeof $scope.selectedFolder == 'defined') {
                    $scope.addReferences([{
                        id: $scope.selectedFolder.id,
                        name: $scope.selectedFolder.name,
                        type: 'parent',
                        metaType: selectedFolder.metaType
                    }]);
                    $scope.selectedFolder.addReferences(
                        [{
                            id: $scope.folder.id,
                            name: $scope.folder.name,
                            type: 'child',
                            metaType: folder.metaType
                        }]);
                }
                $modalInstance.close([selectedFolder.id, tmpFolder.id]);
            } else {
                if (typeof $scope.selectedFolder.id == 'undefined') {
                    $scope.selectedFolder.id = null;
                }
                var tmpFolder = Device.constructDevice($scope.folder.id, false);
                tmpFolder.type = $scope.folder.type;
                tmpFolder.mapUri = $scope.folder.mapUri;
                tmpFolder.mapUriUrl = $scope.folder.mapUriUrl;
                tmpFolder.name = $scope.folder.name;
                $scope.modalDeferred = $q.defer()
                $scope.modalPromise = $scope.modalDeferred.promise;
                $scope.savingPromise = tmpFolder.create();
                $scope.savingPromise.then(function(response) {
                    if (typeof $scope.selectedFolder != 'undefined') {
                        var folderAddPromises = [];
                        folderAddPromises.push(tmpFolder.addReferences([{
                            id: $scope.selectedFolder.id,
                            name: $scope.selectedFolder.name,
                            type: 'parent',
                            metaType: 'location'
                        }]));
                        folderAddPromises.push($scope.selectedFolder.addReferences([{
                            id: tmpFolder.id,
                            name: tmpFolder.name,
                            type: 'child',
                            metaType: 'location'
                        }]));
                        $q.all(folderAddPromises).then(function(result) {
                            Alert.open('success', response.message);
                            $scope.modalDeferred.resolve(true);
                            $modalInstance.close([$scope.selectedFolder.id]);
                        }, function(result) {
                            Alert.open('Failed adding references ' +
                                $scope.selectedFolder.name);
                            $modalInstance.close([]);
                        });
                    } else {
                        Alert.open('Success, created ' + tmpFolder.id);
                        $scope.modalPromise.resolve(true);
                        $modalInstace.close([]);
                    }
                }, function(error) {
                    Alert.open("Could not add reference to created device " + error);
                    $scope.modalPromise.resolve(error);
                    $modalInstance.close();
                });
            }
        };
        /**
         * selectFolder callback function to call inside the browser
         * @param  Folder folder object selected in the browser
         */
        $scope.selectFolder = function(objFolder) {
            $scope.selectedFolder = objFolder;
            Device.constructDevice(objFolder.id, true).then(function(folder) {
                $scope.selectedFolder = folder;
            });
        };
        /**
         * isFolderNotSelect validate if there is a folder select int browser
         * @return Boolean return true if there is not a folder select not apply if is root o favorite
         */
        $scope.isFolderNotSelect = function() {
                return typeof $scope.selectedFolder == 'undefined';
            }
            /**
             * Close the create folder modal
             */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    });

    /**
     * Constroller in charge of showing the map in the device list
     * @param  object $scope       controller scope
     * @param  object $stateParams url params
     * @param  service Device       Device service
     */
    app.controller('FolderMapCtrl', function($scope, $stateParams, Device, User, Browser) {
        $scope.folderID = $stateParams.folder;
        $scope.device = typeof $stateParams.device != 'undefined' ? $stateParams.device : null;
    });

    //    /**
    //     * Controller to manage Device List
    //     * @param  service $scope
    //     * @param  service $http
    //     * @param  service $state
    //     * @param  service $stateParams
    //     * @param  object  $window
    //     * @param  service Alert
    //     * @param  factory User
    //     * @param  factory Folder
    //     * @param  service Browser
    //     */
    //    app.controller('FolderViewCtrl', function($rootScope, $scope, $state,
    //        $stateParams, $window, $route, Alert, User, Device, Browser) {
    //        $scope.devices = [];
    //        $scope.selectedFolder = {id: $stateParams.folder};
    //        if (typeof Browser.references[$stateParams.folder] != 'undefined') {
    //            $scope.selectedFolder = Browser.references[$stateParams.folder];
    //        }
    //        /**
    //         * initFolder get the current Folder
    //         * @param  string strFolderId Folder ID
    //         */
    //        /*$scope.$watch(function() {
    //                if (typeof Browser.references[$stateParams.folder] ==
    //                    'undefined') {
    //                    return {};
    //                }
    //                return Browser.references[$stateParams.folder];
    //            },
    //            function(oldValue, newValue) {
    //                if (typeof newValue == 'undefined' || typeof newValue.references
    //                  == 'undefined') {
    //                    return;
    //                }
    //                $scope.selectedFolder = Browser.references[$stateParams.folder];
    //                $scope.devices = {};
    //                for (cIndex in $scope.selectedFolder.references.children) {
    //                    var child = $scope.selectedFolder.references.children[cIndex];
    //                    $scope.devices[child.id] = child;
    //                    console.log(child.name);
    //                    console.log(child.id + "hlel");
    //                    Device.constructDevice(child.id, true).then(function(childdevice) {
    //                        $scope.devices[childdevice.id] = childdevice;
    //                    }, function(error) {
    //                        console.log(error);
    //                        console.log(child);
    //                    });
    //                }
    //            });*/
    //        $scope.initFolder = function(strFolderId) {
    //            // looks a lot like Browser code, use References
    //            Browser.loadChildren(strFolderId).then(function(result) {
    //                $scope.selectedFolder = Browser.references[strFolderId];
    //                $scope.devices = $scope.selectedFolder.references.children;
    //                for (cIndex in $scope.selectedFolder.references.children) {
    //                    var child = $scope.selectedFolder.references.children[cIndex];
    //                    $scope.devices[child.id] = (child);
    //                    Device.constructDevice(child.id, true).then(function(childdevice) {
    //                        $scope.devices[childdevice.id] = childdevice;
    //                    }, function(error) {
    //                        console.log(error);
    //                    });
    //                }
    //            })
    //        };
    //
    //
    //        if (typeof $stateParams.folder != 'undefined') {
    //            $scope.selctedFolder = {id: $stateParams.folder}
    //            $scope.selectFolder(Browser.references[$stateParams.folder]);
    //            $scope.initFolder($stateParams.folder);
    //        } else {
    //            Alert.open('warning', "Folder id must be specified.");
    //            if (typeof $rootScope.lastState != 'undefined') {
    //              $state.go($rootScope.lastState, $rootScope.lastParams);
    //            } else {
    //              $state.go('device.list', User.rootFolder);
    //            }
    //        }
    //
    //        /**
    //         * [isOwner description]
    //         * @param  {[type]}  deviceId [description]
    //         * @return {Boolean}          [description]
    //         */
    //        $scope.isOwner = function(deviceId) {
    //            return User.isOwner({id:deviceId});
    //        };
    //        $scope.canEdit = function(deviceId) {
    //            return User.isOwner( {id: deviceId}) || User.isPublisher({id: deviceId});
    //        };
    //        $scope.reload = function() {
    //            $scope.initFolder($stateParams.folder);
    //        };
    //        $scope.hasMap = function() {
    //          return (typeof $scope.selectedFolder != 'undefined' &&
    //            typeof $scope.selectedFolder.properties != 'undefined' &&
    //            typeof $scope.selectedFolder.properties.mapUri != 'undefined');
    //        }
    //        /**
    //         * [isPublisher description]
    //         * @param  {[type]}  deviceId [description]
    //         * @return {Boolean}          [description]
    //         */
    //        $scope.isPublisher = function(deviceId) {
    //            return User.isPublisher({id:deviceId});
    //        }
    //
    //        /**
    //         * deleteFolder remove a folder if have parent delete the references
    //         */
    //        $scope.deleteFolder = function() {
    //            var confirm = $window.confirm('Are you sure you want to delete ' +
    //                $scope.selectedFolder.name + ' ?');
    //            if (confirm) {
    //                $scope.selectedFolder.deleteEvent().then(
    //                    function(device) {
    //                        device.deleteDevice();
    //                        Browser.loadChildren($scope.parentFolder.id);
    //                        $state.go('device.list', {
    //                            folder: $scope.parentFolder.id
    //                        });
    //                    });
    //            }
    //        };
    //
    //
    //    });
    //
    app.controller('FolderFavoritesModalCtrl', function($rootScope, $scope, $modal,
        $modalInstance, $state, $stateParams, User, Alert, Device, Browser, $q,
        $timeout) {
        $scope.devBrowserFavorites = {};
        Browser.children = [];
        $scope.newFavorites = [];
        $scope.favoritesToRemove = [];
        $scope.isAlreadySelected = false;
        $scope.errors = [];
        Device.constructDevice(User.favoritesFolder, true).then(function(device) {
            $scope.favorite = device;
            Browser.children = [device.id];
            $scope.selectedFolder = device;
        }, function(error) {
            $modalInstnace.close();
        });
        Device.constructDevice($stateParams.id, true).then(function(device) {
            $scope.device = device;
            //$scope.device.folders = [];
        }, function(error) {
            console.log(error + $stateParams.id);
            $modalInstance.close();
        });

        /**
         * addFolder callback function to pass to browser directive
         */
        //todo add to other folders than favorite
        $scope.addFolder = function() {
            modalInstance = $modal.open({
                templateUrl: 'components/folder/folderAdd/folderAdd.html',
                controller: 'FolderModalCtrl',
                scope: $scope,
                resolve: {
                    fromModal: function() {
                        return true;
                    }
                }
            });
            modalInstance.result.then(function(ids) {
                if (idIndex in ids) {
                    Browser.loadChildren(ids[idIndex]);
                }
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
            if (indexDeletedFavorites !== -1) {
                $scope.favoritesToRemove.splice(indexDeletedFavorites, 1);
                return;
            }
            if (indexNewFavorites !== -1) {
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
                    var tmpDeferred = $q.defer();
                    $scope.allPromise.push(tmpDeferred.promise);
                    Device.constructDevice(folderid, true).then(function(tmpFolder) {
                        tmpFolder.addReferences(
                            [{
                                type: 'child',
                                id: $scope.device.id,
                                metaType: 'device',
                                name: $scope.device.name
                            }]).then(function(result) {
                            tmpDeferred.resolve(result);
                        }, function(result) {
                            tmpDeferred.reject(result);
                        });
                    });
                }
                $q.all($scope.allPromise).then(function(response) {
                    $scope.errors = [];
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

    app.controller('FolderEditCtrl', function($rootScope, $scope, $state,
        $stateParams, $window, $route, Alert, User, Device, Browser) {});
})();