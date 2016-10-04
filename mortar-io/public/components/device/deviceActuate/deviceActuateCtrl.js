(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('device-actuate-controller', ['ui.router',
        'mortar-services', 'cgBusy', 'ui.bootstrap',
        'alert-handler', 'angular-centered', 'ngRoute'
    ]);
    app.controller('DeviceActuateCtrl', function($rootScope, $scope,
        $stateParams, User, Device, Alert, $interval) {
        $scope.command = {};
        $scope.command.value = "";
        var intervalDelay = 1000;
        $scope.$watch('device', function() {
            if ($scope.device != null) {
                if (angular.isUndefined($scope.device.transducers)) {
                    $scope.device.getTransducers();
                }
            }
        });

        Device.constructDevice($stateParams['id'], true).then(function(device) {
            $scope.device = device;
            $scope.intervalPromise = $interval(
                function() {
                    $scope.device.getData()
                }, intervalDelay);
        }, function(result) {
            Alert.open(result);
            $state.go($rootScope.lastState, $rootScope.lastParams);
        });
        // update transducers value each 3 minutes

        // on scope change (destroy) cancel interval
        $scope.$on('$destroy', function() {
            if (typeof $scope.intervalPromsie != 'undefined') {
                $interval.cancel($scope.intervalPromise);
            }
        });

        /**
         * Valid if a value is set
         */
        $scope.isValid = function(command) {
            if (typeof command != 'undefined' && command == '') {
                return false;
            }
            return true;
        };
        /**
         * Run a command
         * @param  {[type]} transducer [description]
         * @param  {[type]} command    [description]
         * get transducer data to pass to a command a then execute
         */
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
})();
