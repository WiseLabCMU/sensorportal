(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('create-select-template-controller', ['ui.router', 'mortar-services',
        'cgBusy', 'ui.bootstrap', 'alert-handler', 'angular-centered'
    ]);

   app.controller('CreateSelectTemplateCtrl', function($scope, $stateParams, $state, uuid4,
						       Device, Browser, User) {
	Browser.children = [];
        $scope.templateBrowser = {};
        $scope.selectedDevice = null;
        $scope.createType = $stateParams['type'];

        $scope.getTemplateChildren = function() {
            Browser.children.push($scope.template.id);
            Device.constructDevice($scope.template.id, true).then(function(device) {
                if ($scope.createType === 'adapter') {
                    $scope.templateBrowserID = device.getChildByName('adapters');
                } else if ($scope.createType === 'device') {
                    $scope.templateBrowserID = device.getChildByName('devices');
                } else if ($scope.type === 'gateway') {
                    $scope.createType = device.getChildByName('gateways');
                }

                if ($scope.templateBrowserID != null) {
                    $scope.template.id = $scope.templateBrowserID.node;
                    Browser.children.push($scope.template.id);
                }

                Device.constructDevice($scope.template.id, true).then(
                    function(device) {
                        $scope.template = device;
                        Browser.loadChildren($scope.template.id);
                        $scope.selectFolder($scope.template);
                    });
            });
        };
        // Assumes rootFolder has already been loaded

        Device.constructDevice(User.favoritesFolder, true).then(function(devicetemp) {
            $scope.template = devicetemp.getChildByName('templates');
            if ($scope.template === null) {
                Device.constructDevice(User.rootFolder, true).then(
                    function(device) {
                        $scope.template = device.getChildByName('templates');

                        Browser.loadChildren($scope.template.id);
                        Device.constructDevice($scope.template.id, true).then(
                            function(device) {
                                $scope.getTemplateChildren();
                            });
                    });
            } else {
                Browser.loadChildren($scope.template.id);
                Device.constructDevice($scope.template.id, true).then(
                    function(device) {
                        $scope.getTemplateChildren();
                    });
            }
        });

        $scope.deviceIsSelected = function() {
            return $scope.selectedDevice == null;
        };

        $scope.selectFolder = function(objFolder) {
            $scope.selectedFolder = objFolder;
            $scope.selectedDevice = objFolder;
        };

        $scope.selectDevice = function(templateDevice) {
            $scope.selectedDevice = templateDevice;
        };

        $scope.continueConfig = function() {
            $state.go('devicecreate.config', {
                id: $scope.selectedDevice.id,
                type: $state.createType,
                uuid: $scope.uuid
            });
        };


   });
})();
