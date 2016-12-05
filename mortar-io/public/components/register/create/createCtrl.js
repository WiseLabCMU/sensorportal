(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('create-controller', ['ui.router', 'device-services',
        'cgBusy', 'ui.bootstrap', 'alert-handler', 'angular-centered'
    ]);

    app.controller('CreateCtrl', function($scope, $stateParams, $state, uuid4, Device) {});
})();