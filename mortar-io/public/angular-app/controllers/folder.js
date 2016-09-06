/**
 * Folder Controller module
 */
(function() {
    var app = angular.module('folder-controller', ['uuid4', 'ui.router', 'mortar-services', 'cgBusy', 'angularTreeview', 'ui.bootstrap', 'angularFileUpload', 'ngRoute']);
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
        $scope.user = User;
        $scope.devBrowser = {};
        Browser.children = [User.rootFolder, User.favoritesFolder];
        if (typeof Device.objFolder != 'undefined') {
          $scope.selcectedFolder = Device.objFolder;
        } else {
           Device.constructDevice(User.favoritesFolder, true).then( function(device) {
              $scope.selectedFolder = Device.objFolder;
           });
        }

        /**
         * selectFolder callback function to call inside the browser
         * @param  Folder objFolder object selected in the browser
         */
        $scope.selectFolder = function(objFolder) {
            if (typeof objFolder == 'undefined' || typeof objFolder.id == 'undefined') {
                return;
            }
            Device.constructDevice(objFolder.id, true).then(function(device) {
                $scope.selectedFolder = device;
                console.log(device);
                if (device.hasTransducers()) {
                    $state.go('device.view.detail', {
                        id: objFolder.id
                    });
                } else {
                    Browser.loadChildren(objFolder.id);
                    $state.go('device.list', {
                        folder: objFolder.id
                    });
                }
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
                templateUrl: 'angular-app/partials/FolderModal.html',
                controller: 'FolderModalCtrl',
                scope: $scope,
                resolve: {
                    fromModal: function() {
                        return false;
                    }
                }
            });
            $scope.modalInstance.result.then(function(refreshIds) {
                console.log("refreshIds");
                console.log(refreshIds);
                for (var refreshIndex in refreshIds) {
                    Device.constructDevice(refreshIds[refreshIndex], true,
                      true).then( function(device) {
                        Browser.loadChildren(refreshIds[refreshIndex]);
                      });
                }
            });
        };
        /**
         * removeFolder callback function to pass to browser directive
         */
        $scope.removeFolder = function(param) {
            console.log("Adding folder remove modal");
            $scope.modalInstance = $modal.open({
                templateUrl: 'angular-app/partials/FolderRemoveModal.html',
                controller: 'FolderRemoveModalCtrl',
                scope: $scope,
                resolve: {
                    fromModal: function() {
                        return false;
                    }
                }
            });
            $scope.modalInstance.result.then(function(updateIds) {
                for (var idIndex = 0; idIndex < updateIds.length; idIndex++) {
                    //Browser.loadChildren(updateIds[idIndex]);
                    $scope.selectedFolder = updateIds[0];
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
    app.controller('FolderRemoveModalCtrl', function($scope, $modalInstance, $state,
        $stateParams, $upload, $window, fromModal,
        Alert, $q, Favorite, Browser, User, Device, uuid4) {
        $scope.user = User;
        $scope.favorite = Favorite;
        $scope.modalBrowser = {};
        $scope.folder = null;
        $scope.cp = {
            username: '',
            error: false,
            errorMessage: ''
        };
        $scope.showRoot = true;
        $scope.isFromModal = fromModal;
        $scope.selectedFolder = "";
        $scope.selectedParents = {};
        $scope.parents = [];
        $scope.parent = null;
        $scope.isOpen = false;



        $scope.toggled = function(selection) {
            $scope.selectedParent = selection;
        };

        /**
         * removeFolder removes reference to a device.
         */
        $scope.removeFolder = function() {
            $self.deferred = $q.defer();
            console.log("selected parents");
            $scope.selectedParent = $scope.parents[0];
            $scope.selectedParentId = $scope.selectedParent.id;
            console.log($scope.selectedParent);
            Device.constructDevice($scope.selectedParentId, true, false).then(
                function(parentDev) {
                    Device.constructDevice($scope.selectedFolder.id, true).then(
                        function(childDev) {
                            console.log("created child");
                            childDev.removeReferences([parentDev]);
                            parentDev.removeReferences([childDev]);
                            $self.deferred.resolve(true);
                            $modalInstance.close([$scope.selectedParent, childDev.id]);
                        },
                        function(error) {
                            console.log(error);
                            $self.deferred.reject(error);
                        });
                },
                function(error) {
                    console.log(error);
                    $self.deferred.reject(error);
                });


            return $self.deferred.promise;
        };

        /**
         * selectFolder callback function to call inside the browser
         * @param  Folder folder object selected in the browser
         */
        $scope.selectFolder = function(folder) {
            var keys;
            $scope.selectedFolder = folder;
            $scope.selectedParents = folder.parents;
            $scope.selectedParent = {};
            $scope.parents = [];
            keys = Object.keys($scope.selectedParents);
            for (keyInd in keys) {
                $scope.parents.push($scope.selectedParents[keys[keyInd]]);
            }
        };

        /**
         * selectFolder callback function to call inside the browser
         * @param  Folder folder object selected in the browser
         */
        $scope.selectDevice = function(folder) {
            var keys;
            $scope.selectedFolder = folder;
            $scope.selectedParents = folder.parents;
            $scope.selectedParent = {};
            $scope.parents = [];
            keys = Object.keys($scope.selectedParents);
            console.log("selected Parents");
            console.log($scope.selectedParents);
            for (keyInd in keys) {
                $scope.parents.push($scope.selectedParents[keys[keyInd]]);
            }
            console.log(folder);
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
      $modalInstance, $state, $stateParams, $upload, $window, fromModal, Alert,
      Favorite, Browser, User, Device, uuid4) {
        $scope.user = User;
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
        $scope.isFromModal = fromModal;
        $scope.isRootOrFavorite = false;
        $scope.selectedFolder = undefined;

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
                $state.go($rootScope.lastState, $rootscope.lastParams);
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
                    console.log("Folder saved");
                    if (typeof $scope.selectedFolder != 'undefined') {
                        var folderAddPromises = [];
                        folderAddPromises.push(tmpFolder.addReferences([{
                            id: $scope.selectedFolder.id,
                            name: $scope.selectedFolder.name,
                            type: 'parent',
                            metaType: 'location'
                        }]));
                        folderAddPromises.push($scope.selectedFolder.
                          addReferences([{
                            id: tmpFolder.id,
                            name: tmpFolder.name,
                            type: 'child',
                            metaType: 'location'
                        }]));
                        $q.all(folderAddPromises).then(function(result) {
//                            Browser.loadChildren($scope.selectedFolder.id);
                            Alert.open('success', response.message);
                            $scope.modalDeferred.resolve(true);
                            $modalInstance.close([$scope.selectedFolder.id ]);
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
        $scope.user = User;
        $scope.folderID = $stateParams.folder;
        $scope.device = typeof $stateParams.device != 'undefined' ? $stateParams.device : null;
    });
    /**
     * Controller to manage Device List
     * @param  service $scope
     * @param  service $http
     * @param  service $state
     * @param  service $stateParams
     * @param  object  $window
     * @param  service Alert
     * @param  factory User
     * @param  factory Folder
     * @param  service Browser
     */
    app.controller('FolderViewCtrl', function($scope, $state, $stateParams,
        $window, $route, Alert, User, Device, Browser) {

        /**
         * initFolder get the current Folder
         * @param  string strFolderId Folder ID
         */
        $scope.initFolder = function(strFolderId) {
            Device.constructDevice(strFolderId, true, true).then(
              function(device) {
                $scope.selectedFolder = device;
                if (typeof $scope.selectedFolder.parent != 'undefined') {
                    $scope.parentFolder = $scope.selectedFolder.parent;
                }
                $scope.isRootOrFavorite = ($scope.selectedFolder.id == User.favoritesFolder) ||
                    ($scope.selectedFolder.id == User.rootFolder);

                $scope.devices = [];
                if (typeof $scope.selectedFolder.references != 'undefined' &&
                    typeof $scope.selectedFolder.references.children != 'undefined') {
                    for (cIndex in $scope.selectedFolder.references.children) {
                        var child = $scope.selectedFolder.references.children[cIndex];
                        console.log(child);
                        $scope.devices.push(child);
                        Device.constructDevice(child.id, true).then(function(childdevice) {
                            $scope.devices[cIndex] = child;
                        }, function(error) {
                            console.log(error);
                            console.log(child);
                        });
                    }
                }
                $scope.isPublishOrOwner = User.isOwner($scope.selectedFolder.id) ||
                    User.isPublisher($scope.selectedFolder.id);
            }, function(error) {});
        };


        if (typeof $stateParams.folder != 'undefined') {
            $scope.initFolder($stateParams.folder);
        } else {
           Alert.open('warning', "Folder list cannot list unspecified folder");
           $state.go($rootScope.lastState, $rootscope.lastParams);
        }
        /**
         * [isOwner description]
         * @param  {[type]}  deviceId [description]
         * @return {Boolean}          [description]
         */
        $scope.isOwner = function(deviceId) {
            return User.isOwner(deviceId);
        };
        $scope.reload = function() {
            var device = Device.constructDevice($scope.selectedFodlerId, false);
            //$scope.initFolder($scope.selectedFolderId);
            device.getReferences().then(function() {
              Browser.loadChildren($scope.selectedFolderId);
            });
        };
        /**
         * [isPublisher description]
         * @param  {[type]}  deviceId [description]
         * @return {Boolean}          [description]
         */
        $scope.isPublisher = function(deviceId) {
            return typeof $scope.user.isPublisher();
        }

        /**
         * deleteFolder remove a folder if have parent delete the references
         */
        $scope.deleteFolder = function() {
            var confirm = $window.confirm('Are you sure you want to delete ' +
                $scope.selectedFolder.name + ' ?');
            if (confirm) {
                $scope.selectedFolder.deleteEvent().then(
                    function(device) {
                        device.deleteDevice();
                        Browser.loadChildren($scope.parentFolder.id);
                        $state.go('device.list', {
                            folder: $scope.parentFolder.id
                        });
                    });
            }
        };
    });
})();
