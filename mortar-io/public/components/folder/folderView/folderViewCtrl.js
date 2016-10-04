(function() {
    var app = angular.module('folder-view-controller', ['uuid4', 'ui.router', 'mortar-services', 'cgBusy', 'angularTreeview', 'ui.bootstrap', 'angularFileUpload', 'ngRoute']);

    app.controller('FolderViewCtrl', function($rootScope, $scope, $state,
        $stateParams, $window, $route, Alert, User, Device, Browser, $q) {
        $scope.devices = [];
	$scope.folder = {};

        /**
         * initFolder get the current Folder
         * @param  string strFolderId Folder ID
         */
        $scope.initFolder = function(strFolderId) {
            var deferred = $q.defer();
            // looks a lot like Browser code, use References
            Browser.loadChildren(strFolderId).then(function(result) {
		$scope.folder = Browser.references[strFolderId];
                $scope.devices = $scope.folder.references.children;
                for (cIndex in $scope.devices) {
                    var child = $scope.folder.references.children[cIndex];
                    $scope.devices[child.id] = (child);
                    Device.constructDevice(child.id, true).then(function(childdevice) {
                        $scope.devices[childdevice.id] = childdevice;
                    }, function(error) {
                        console.log(error);
                    });
                }
                deferred.resolve(true);
            }, function(reject) {
                deferred.resolve(reject);
            });
            return deferred.promise;
        };


        if (typeof $stateParams.folder != 'undefined') {
            $scope.initFolder($stateParams.folder);
        } else {
            Alert.open('warning', "Folder id must be specified.");
            if (typeof $rootScope.lastState != 'undefined') {
                $state.go($rootScope.lastState, $rootScope.lastParams);
            } else {
                $state.go('device.list', User.rootFolder);
            }
        }

        /**
         * [isOwner description]
         * @param  {[type]}  deviceId [description]
         * @return {Boolean}          [description]
         */
        $scope.isOwner = function(deviceId) {
            return User.isOwner({
                id: deviceId
            });
        };
        $scope.canEdit = function(deviceId) {
            return User.isOwner({
                id: deviceId
            }) || User.isPublisher({
                id: deviceId
            });
        };
        $scope.reload = function() {
            $scope.initFolder({
                id: $stateParams.folder
            });
        };
        $scope.hasMap = function() {
                return (typeof $scope.folder != 'undefined' &&
                    typeof $scope.folder.properties != 'undefined' &&
                    typeof $scope.folder.properties.mapUri != 'undefined');
            }
            /**
             * [isPublisher description]
             * @param  {[type]}  deviceId [description]
             * @return {Boolean}          [description]
             */
        $scope.isPublisher = function(deviceId) {
            return User.isPublisher({
                id: deviceId
            });
        }

        /**
         * deleteFolder remove a folder if have parent delete the references
         */
        $scope.deleteFolder = function() {
              var parent;
              if (typeof $scope.folder.parents != 'undefined' &&
                $scope.folder.parents.length > 0){
                  parent = $scope.folder.parents[0].id;
              } else {
                  parent = User.favoritesFolder;
              }
              $state.go('device.list.delete', {id:$stateParams.folder,
                parent:parent});
        };


    });
})();
