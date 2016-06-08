'use strict';

describe('Browser service tests', function() {
    var service, scope, $rootScope, $q, controller, deviceService;

    beforeEach(function() {
        // load modules 
        module('pasvaz.bindonce');
        module('ui.router');
        module('checklist-model');
        module('alert-handler');
        module('ja.qr');
        module('mightyDatepicker');
        module('angularModalService');
        module('olmap-directive');

        module('login-controller');
        module('device-controller');
        module('folder-controller');

        module('mortar-user-services');
        module('favorite-service');
        module('user-services');
        module('transducer-service');
        module('mio-services');
        angular.mock.inject(function($controller, _$rootScope_, _$q_,
            _MortarUser_, _User_, _$http_,
            _$state_, _Alert_, _$modal_, _Mio_, _Device_, _Transducer_) {
            //_checklistModel_,_mightyDatepicker_
            $rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $q = _$q_;
            deviceService = _Device_;
            controller = $controller("DeviceCtrl", {
                $scope: scope,
                MortarUser: _MortarUser_,
                Device: _Device_,
                User: _User_,
                $http: _$http_,
                $state: _$state_,
                Alert: _Alert_,
                Mio: _Mio_,
                Transducer: _Transducer_,
                //checklistModel: _checklistModel_,
                //mightDatepicker:_mightyDatepicker_,
                $modal: _$modal_
            });
            service = _User_;

        });
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
    });
    afterEach(function() {
    });
});

