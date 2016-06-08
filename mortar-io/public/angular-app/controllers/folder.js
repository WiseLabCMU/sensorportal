/**
 * Folder Controller module
 */
(function() {
    var app = angular.module('folder-controller', ['uuid4', 'ui.router', 'mortar-services', 'cgBusy', 'angularTreeview', 'ui.bootstrap', 'angularFileUpload']);
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
    app.controller('BrowserCtrl', function($scope, User, Mio, Device, $state, $filter, $modal, Browser) {
        //Initial object of the controller
        $scope.user = User;
        Browser.children = [User.rootFolder, User.favoritesFolder];
        $scope.devBrowser = {};
        $scope.selcectedFolder = Device.objFolder;
        var modalInstance;
        /**
         * selectFolder callback function to call inside the browser
         * @param  Folder objFolder object selected in the browser
         */
        $scope.selectFolder = function(objFolder) {
            $scope.selectedFolder = objFolder;
            Device.constructDevice(objFolder.id, true).then(function(device) {
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
            console.log("Adding folder modal");
            modalInstance = $modal.open({
                templateUrl: 'angular-app/partials/FolderModal.html',
                controller: 'FolderModalCtrl',
                scope: $scope,
                resolve: {
                    fromModal: function() {
                        return false;
                    }
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
    app.controller('FolderModalCtrl', function($scope, $modalInstance, $state, $stateParams, $upload, $window, fromModal, Alert, Favorite, Browser, User, Device, uuid4) {
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
        //$scope.showRoot = (User.isAdmin()) ? true : false;
        $scope.showRoot = true;
        $scope.isFromModal = fromModal;
        $scope.isRootOrFavorite = false;
        $scope.selectedFolder = undefined;

        $scope.isUpdate = angular.isDefined($stateParams.folders) && $stateParams['folders'] != '';
        if ($scope.isUpdate) {
            //@todo edit function to get all data from folder
            $scope.folder = Device.objFolder;
            $scope.loadFolder = Device.constructDevice($stateParams['folders'], true);
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
            if ($scope.isUpdate) { //Check if is for update
                $scope.folder.publishMeta();
                $scope.addReferences([{
                    id: $scope.selectedFolder.id,
                    name: $scope.selectedFolder.name,
                    type: 'child',
                    metaType: 'location'
                }]).
                then(function(response) {
                    $scope.selectedFolder.addReferences(
                        [{
                            id: $scope.folder.id,
                            name: $scope.folder.name,
                            type: 'child',
                            metaType: 'location'
                        }]).
                    then(function(result) {
                        $modalInstance.close(true);
                        Alert.open('Success, updated ' + tmpFolder.id);
                    });
                });

            } else {
                if (typeof $scope.selectedFolder.id == 'undefined') {
                    $scope.selectedFolder.id = null;
                }
                var tmpFolder = Device.constructDevice($scope.folder.id, false);
                tmpFolder.type = $scope.folder.type;
                tmpFolder.mapUri = $scope.folder.mapUri;
                tmpFolder.mapUriUrl = $scope.folder.mapUriUrl;
                tmpFolder.name = $scope.folder.name;
                tmpFolder.references = {};
                $scope.savingPromise = tmpFolder.create();
                $scope.savingPromise.then(function(response) {
                    tmpFolder.addReferences([{
                        id: $scope.selectedFolder.id,
                        name: $scope.selectedFolder.name,
                        type: 'parent',
                        metaType: 'location'
                    }]).then(function(result) {
                        if (typeof $scope.selectedFolder != 'undefined') {
                            $scope.selectedFolder.addReferences([{
                                id: tmpFolder.id,
                                name: tmpFolder.name,
                                type: 'child',
                                metaType: 'location'
                            }]).then(function(result) {
                                Browser.loadChildren($scope.selectedFolder.id);
                                Alert.open('success', response.message);
                                $modalInstance.close(true);
                            }, function(error) {
                                Alert.open('Failed adding reference to parent ' +
                                    $scope.selectedFolder.name);
                                $modalInstance.close(true);
                            });
                        } else {
                            Alert.open('Success, created ' + tmpFolder.id);
                            $modalInstace.close(true);
                        }
                    }, function(error) {
                        Alert.open("Could not add reference to created device " + error);
                    });
                }, function(error) {
                    Alert.open('Failure ' + error);
                    return;
                });

                //todo create a new folder
            }
        };
        /**
         * selectFolder callback function to call inside the browser
         * @param  Folder folder object selected in the browser
         */
        $scope.selectFolder = function(folder) {
            $scope.selectedFolder = folder;
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
        $window, Alert, User, Device, Browser) {
        $scope.devices = [];
        $scope.parentFolder = null;
        $scope.selectedFolder = {};
        $scope.user = User;

        /**
         * initFolder get the current Folder
         * @param  string strFolderId Folder ID
         */
        $scope.initFolder = function(strFolderId) {
            Device.constructDevice(strFolderId, true).then(function(device) {
                Device.objFolder = device;
                $scope.selectedFolder = device;
                if (typeof $scope.selectedFolder.parent != 'undefined') {
                    $scope.parentFolder = $scope.selectedFolder.parent;
                }
                $scope.isRootOrFavorite = ($scope.selectedFolder.id == $scope.user.favoritesFolder) ||
                    ($scope.selectedFolder.id == $scope.user.rootFolder);
                if (typeof $scope.selectedFolder.parent != 'undefined') {
                    Browser.loadChildren($scope.selectedFolder.parent.id);
                }
                $scope.devices = [];
                if (typeof $scope.selectedFolder.references != 'undefined' &&
                    typeof $scope.selectedFolder.references.children != 'undefined') {
                    for (cIndex in $scope.selectedFolder.references.children) {
                        var child = $scope.selectedFolder.references.children[cIndex];
                        if (child.type == 'device') {
                            Device.constructDevice(child.id, true).then(function(childdevice) {
                                $scope.devices.push(childdevice);
                            });
                        }
                    }
                }
                $scope.isPublishOrOwner = $scope.user.isOwner($scope.selectedFolder.id) ||
                    $scope.user.isPublisher($scope.selectedFolder.id);
            }, function(error) {});
        };


        if (typeof $stateParams.folder != 'undefined') {
            $scope.initFolder($stateParams.folder);
        }
        /**
         * [isOwner description]
         * @param  {[type]}  deviceId [description]
         * @return {Boolean}          [description]
         */
        $scope.isOwner = function(deviceId) {
                return typeof $scope.user.isOwner(deviceId);
            }
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
        // todo poor handeling of folder deletion
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
