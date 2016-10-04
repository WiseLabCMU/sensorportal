(function() {
    var app = angular.module('device-edit-controller', ['ui.router',
        'mortar-services', 'cgBusy', 'ui.bootstrap',
        'alert-handler', 'angularFileUpload', 'checklist-model',
        'olmap-directive', 'ja.qr', 'angularTreeview', 'uuid4',
        'angular-centered', 'ngRoute'
    ]);   
    app.controller('DeviceEditCtrl', function($scope, User, $modalInstance, $state,
      $stateParams, $upload, $window, $modal, Device, Alert, Browser, $q) {
        $scope.parentDevice = {};
                Device.constructDevice($stateParams['id'],true).then(function(device) {
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
                        $scope.parentDevice.selectNodeLabel(
                        	Device.references[device.parent.id]);
                    }
                    if (typeof $scope.imageUrl === 'udefined') {
                        $scope.device.imageUrl = '';
                    }
                });
        
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
                //todo error formatting
                Alert.open(error);
            });
        };
        /**
         * cancel the current modal opened
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    });
})();
