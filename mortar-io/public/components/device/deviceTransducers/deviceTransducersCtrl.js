(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('device-transducers-controller', ['ui.router',
        'mortar-services', 'cgBusy', 'ui.bootstrap',
        'alert-handler', 'angularFileUpload', 'checklist-model',
        'olmap-directive', 'ja.qr', 'angularTreeview', 'uuid4',
        'angular-centered', 'ngRoute'
    ]);
    app.controller('DeviceTransducersCtrl', function($scope, $http, $interval,
        $stateParams, $interval, Device, Alert, User) {
        var updateInterval = 5000; // 5 seconds

        var interval = $interval(function() {
            if ($scope.device != null && angular.isDefined($scope.device.transducers)) {
                $scope.device.getData();
            }
        }, updateInterval, 1);

        // on scope change (destroy) cancel interval
        $scope.$on('$destroy', function() {
            $interval.cancel(interval);
        });
    });
})();