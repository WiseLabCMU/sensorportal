
(function() {
    var app = angular.module('folder-edit-controller', ['uuid4', 'ui.router', 'mortar-services', 
			     'cgBusy', 'angularTreeview', 'ui.bootstrap', 'ngRoute']);
	app.controller('FolderEditCtrl', function($rootScope, $scope, $q,
        $modalInstance, $state, $stateParams, $upload, $window, Alert,
        Browser, User, Device, uuid4) {
        $scope.modalBrowser = {};
        Browser.children = [User.rootFolder, User.favoritesFolder];
        $scope.cp = {
            username: '',
            error: false,
            errorMessage: ''
        };
        
        $scope.showRoot = User.isAdmin();
        $scope.isRootOrFavorite = false;
		$scope.isUpdate = function() { 
			return $stateParams.isUpdate;
		}
        if (User.isPublisherOrOwner(User.rootFolder)) {
            Browser.children = [User.rootFolder, User.favoritesFolder];
        } else {
            Browser.children = [User.favoritesFolder];
        }
        if ($scope.isUpdate()) {
            $scope.loadFolder = Device.constructDevice($stateParams['folder'],
                true, true);
            $scope.loadFolder.then(function(device) {
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
            });

        } else {
       		$scope.folder = {
           	 id: uuid4.generate(),
       	     name: '',
       	     mapUri: '',
       	     mapUriUrl: '',
       	     type: 'location'
        	};
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
            if ($scope.isUpdate()) {
                $scope.folder.saveMeta();
                if (typeof $scope.selectedFolder != 'undefined') {
                    console.log("Selected Folder");
                    console.log($scope.selectedFolder);
                    $scope.folder.addReferences([{
                        id: $scope.selectedFolder.id,
                        node: $scope.selectedFolder.id,
                        name: $scope.selectedFolder.name,
                        type: 'parent',
                        metaType: $scope.selectedFolder.metaType
                    }]);
                    $scope.selectedFolder.addReferences(
                      [{
                            id: $scope.folder.id,
                            node: $scope.folder.id,
                            name: $scope.folder.name,
                            type: 'child',
                            metaType: $scope.folder.metaType
                      }]);
                }
                $modalInstance.close([]);
            } else {
                if (typeof $scope.selectedFolder.id == 'undefined') {
                    $scope.selectedFolder.id = null;
                }
                var tmpFolder = Device.constructDevice($scope.folder.id, false);
                tmpFolder.metaType = $scope.folder.type;
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
            //$scope.selectedFolder = objFolder;
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

})();
