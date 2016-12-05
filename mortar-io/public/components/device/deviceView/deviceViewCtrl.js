(function() {
    var app = angular.module('device-view-controller', ['ui.router',
        'mortar-services', 'cgBusy', 'ui.bootstrap',
        'alert-handler', 'angularFileUpload', 'checklist-model',
        'olmap-directive', 'ja.qr', 'angularTreeview', 'uuid4',
        'angular-centered', 'ngRoute'
    ]);
    /**
     * Controller for managing device detail view
     * @param  object $scope
     * @param  service $http
     * @param  factory Device
     * @param  factory User
     */
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
                Object.keys($scope.device.parents).length > 0) {
                parent = $scope.device.parents[0].id;
            } else {
                parent = User.favoritesFolder;
            }
            $state.go('device.view.delete', {
                parent: parent
            });
        };
    });

    app.controller('DeviceCtrl', function($rootScope, $scope, $state, $route,
        $stateParams, User, Device, Alert) {
        $scope.folder = Device;
        $scope.devices = [];
        $scope.permittedDevices = User.permittedDevices.publisher;
        $scope.subscribedDevices = User.permittedDevices.subscribed;
        $scope.ownerDevices = User.permittedDevices.owner;
        $scope.subscrbValidator = {
            isSubscribe: false,
            isUnsubscribe: false
        };
        Device.constructDevice($stateParams['id'], true, true).then(function(device) {
            $scope.device = device;
            $scope.subscrbValidator.isSubscribe = User.isSubscribe($scope.device.id);
            $scope.subscrbValidator.isUnSubscribe = User.isUnSubscribe($scope.device.id);
            if (typeof device.parent != 'undefined') {
                $scope.loadParent = Device.getParent(device.parent.id);
                $scope.loadParent.then(function(parentDevice) {
                    $scope.device.parentDetail = parentDevice;
                }, function(error) {
                    Alert.open('Could not load current device\'s parent', error);
                });
            }
        }, function(result) {
            Alert.open(result);
            if ($rootScope.lastState != 'undefined' && $rootScope.lastParams !=
                null) {
                $state.go($rootScope.lastState, $rootScope.lastParams);
            }
        });

        /**
         * subscribe Subscribe a user to the current device
         */
        $scope.subscribe = function() {
            $scope.promiseSubs = $scope.device.subscribe();
            $scope.promiseSubs.then(function(response) {
                User.getPermittedDevices();
                $scope.subscrbValidator.isSubscribed = false;
                $scope.subscrbValidator.isUnsubscribeb = true;
                Alert.open('Subscribed to ' + $scope.device.id, response);
            }, function(error) {
                Alert.open('warning', error);
            });
        };
        $scope.isOwner = function(eventId) {
            return User.isOwner({
                'id': eventId
            });
        };
        $scope.isPublisher = function(eventId) {
            return User.isPublisher({
                'id': eventId
            });
        }
        $scope.isSubscribed = function(eventId) {
            return User.isSubscribed({
                'id': eventId
            });
        };
        $scope.deleteDevice = function() {
            var parent;
            if (typeof $scope.device.parents != 'undefined' &&
                Object.keys($scope.device.parents).length > 0) {
                parent = $scope.device.parents[0].id;
            } else {
                parent = User.favoritesFolder;
            }
            $state.go('device.view.delete', {
                parent: parent
            });
        };

        /**
         * unSubscribe Unsubscribe a user from current device
         */
        $scope.unSubscribe = function() {
            $scope.promiseUnsubs = $scope.device.unsubscribe();
            $scope.promiseUnsubs.then(function(response) {
                User.getPermittedDevices();
                $scope.subscrbValidator.isSubscribe = true;
                $scope.subscrbValidator.isUnsubscribe = false;
                Alert.open('Unsubscribed', response);
            }, function(error) {
                Alert.open('warning', error);
            });
        };
    });
})();