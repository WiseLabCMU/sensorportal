(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('device-timeseries-controller', ['ui.router',
        'mortar-services', 'cgBusy', 'ui.bootstrap',
        'alert-handler', 'angularFileUpload', 'checklist-model',
        'olmap-directive', 'ja.qr', 'angularTreeview', 'uuid4',
        'angular-centered', 'ngRoute'
    ]);
    app.controller('DeviceTimeseriesCtrl', function($rootScope, $interval,
        $scope, Device, User) {
        var intervalDelay = 5000; // 5 seconds
        $scope.intervalPromise = $interval(function() {
            $scope.device.getData();
        }, intervalDelay);
        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams) {
                $interval.cancel($scope.intervalPromise);
            });
    });
})();