(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('create-edit-controller', ['ui.router', 'mortar-services',
        'cgBusy', 'ui.bootstrap', 'alert-handler', 'angular-centered'
    ]);
       app.controller('CreateEditCtrl', function($scope, $state,
        $stateParams, $http, Device, Alert) {
	$scope.templateId = $stateParams.template;
	$scope.deviceId = $stateParams.deviceId;
	$scope.type = $stateParams.type;
        Device.constructDevice($scope.templateId, true).then(
          function(device) {
            $scope.template = device;
        }, function(error) { 
		Alert.open('error', "Could not load template device");
		$state.go("devicecreate.select");
	});
        Device.constructDevice($stateParams.deviceid, true).then(
          function(device) {
            $scope.device = device;
            $scope.device.transducers = $scope.template.transducers;
            $scope.device.properties = $scope.template.properties;
            $scope.device.name = $scope.template.name;
            $scope.device.type = $scope.template.type;
            $scope.device.interfaces = $scope.template.interfaces;
            $scope.device.info = $scope.template.info;
        });
        $scope.continue = function() {
            $scope.device.setMeta().then(function(result) {
                $state.go('devicecreate.references', {
                    id: $scope.device.id,
                    type: $stateParams.type
                });
            }, function(error) {
                console.log(error);
            });
        }
    });
})();
