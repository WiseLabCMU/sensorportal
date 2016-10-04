/**
 * Device Controller module
 */
(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('device-view-controller', ['ui.router',
        'mortar-services', 'cgBusy', 'ui.bootstrap',
        'alert-handler', 'angularFileUpload', 'checklist-model',
        'olmap-directive', 'ja.qr', 'angularTreeview', 'uuid4',
        'angular-centered', 'ngRoute'
    ]);
    app.controller('DeviceViewCtrl', function($rootScope, $scope, $state,
        $stateParams, Device, User, $location, $window, Alert, $interval) {
        var modalInstance;
        var intervalDelay = 5000; // 5 seconds
        $scope.qrString = $location.$$absUrl;
        Device.constructDevice($stateParams['id'], true).then(function(device) {
            if (typeof device == 'undefined') {
                return;
            }
            $scope.device = device;
            $scope.intervalPromise = $interval(
                function() {
                    if (typeof $scope.device != 'undefined') {
                        $scope.device.getData();
                    }
                }, intervalDelay);
        }, function(result) {
            Alert.open(result);
            $state.go($rootScope.lastState, $rootScope.lastParams);
        });
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams) {
                $interval.cancel($scope.intervalPromise);
            });
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
        $scope.isFavorite = function() {
        	if (typeof $scope.device == 'undefined') {
        		return true;
        	}
        	return $scop.device.name == User.favoritesFolder;
        };
        $scope.reload = function() {
            $scope.initFolder({
                id: $stateParams.id
            });
        };
        $scope.isSubscribed = function() { 
        	return User.isSubscribed($stateParams.id);
        }
        $scope.deleteDevice = function() {
        	var parent;
            if (typeof $scope.device.parents != 'undefined' &&
                Object.keys($scope.device.parents).length > 0){
                parent = $scope.device.parents[0].id;
            } else {
                parent = User.favoritesFolder;
            }
            $state.go('device.view.delete', {
              parent:parent});
        };
    });
})();
