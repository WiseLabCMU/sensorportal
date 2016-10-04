(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('create-config-controller', ['ui.router', 'device-services',
        'cgBusy', 'ui.bootstrap', 'alert-handler', 'checklist-model', 
	'olmap-directive', 'uuid4', 'angular-centered' 
    ]);
   app.controller('CreateConfigCtrl', function($scope, $stateParams, $state, uuid4, Device) {
	$scope.templateId = $stateParams.templateId;
	$scope.type = $stateParams.type;
	$scope.id = $scope.uuid;
        var find_config = function(config, config_var) {
            var configHold;
            for (var arrIndex in config) {
                configHold = config[arrIndex];
                if (configHold.var == config_var) {
                    return configHold;
                }
            }
            return null;
        };

        var set_config = function(config, config_var, config_val) {
            var configHold;
            for (var arrIndex in config) {
                configHold = config[arrIndex];
                if (configHold.var == config_var) {
                    configHold.value = config_val;
                    return;
                }
            }
            return null;
        };
        // todo add more information about config
        Device.getDefaultConfig().then(
            function(config) {
		    $scope.config = config;
        }, function(error) { 
		Alert.open('error', "Could not get default node config");
		$state.go("devicecreate.select");
	});

        $scope.submitConfig = function() {
            var deviceId;
            if (typeof $stateParams['uuid'] == 'undefined' ||
                $stateParams['uuid'] == '') {
                deviceId = uuid4.generate();
            } else {
                deviceId = $stateParams['uuid'];
            }
	    var promises = [];
            device = Device.constructDevice(deviceUUID, false);
            deviceActuation = Device.constructDevice(deviceUUID+"_act", false);
            set_config(device.config, "pubsub#max_items", 500);
            device.config = $scope.config;
	    deviceActuation.config = $scope.config;
            promises.push(device.create(device.config));
            promises.push(deviceActuation.create(device.config));
	    $q.all(promises).then(function(result) {
                $state.go('devicecreate.edit', {
                    template: $stateParams.id,
                    deviceid: deviceUUID
                }, function(error) {
                    console.log(error);
		    Alert.close();
		    Alert.open("error", "Could not create node");
		    $state.go("devicecreate.select");
                });
            });
        }
    });
})();
