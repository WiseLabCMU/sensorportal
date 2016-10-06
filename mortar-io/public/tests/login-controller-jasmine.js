'use strict';

describe('Login Controller tests', function() {
    var service, scope, $rootScope, $q, controller;

    beforeEach(function() {
        // load modules 
        module('ui.router');
        module('login-controller');
        module('alert-handler');
        module('angularModalService');
        module('mortar-user-services');
        module('favorite-service');
        module('user-services');
        module('transducer-service');
        module('mio-services');
        angular.mock.inject(function($controller, _$rootScope_, _$q_,
            _MortarUser_, _User_, _$http_,
            _$state_, _Alert_, _$modal_, _Mio_,_Device_,_Devices_) {
            $rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $q = _$q_;
            controller = $controller("LoginCtrl", {
                $scope: scope,
                MortarUser: _MortarUser_,
                User: _User_,
		Device: _Device_,
		Devices: _Devices_,
                $http: _$http_,
                $state: _$state_,
                Alert: _Alert_,
                Mio: _Mio_,
                $modal: _$modal_
            });
            service = _User_;

        });
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });
	afterEach(function() {
    });

    it('LoginCtrl login test', function(done) {
	    // look
	    done();
    });

    it('LoginCtrl logout test', function(done) {
	    // look
	    done();
    });
    it('LoginCtrl forgot password test', function(done) {
	    // look
	    done();
    });

    it('LoginCtrl forgot password test', function(done) {
	    // look
	    done();
    });
});

describe('FOrgotPasswordController tests', function() {
    var service, scope, $rootScope, $q, controller;

    beforeEach(function() {
        // load modules 
        module('ui.router');
        module('login-controller');
        module('alert-handler');
        module('angularModalService');
        module('mortar-user-services');
        module('favorite-service');
        module('user-services');
        module('transducer-service');
        module('mio-services');
        angular.mock.inject(function($controller, _$rootScope_, _$q_,
            _MortarUser_, _User_, _$http_,
            _$state_, _Alert_, _$modal_, _Mio_) {
            $rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $q = _$q_;
            controller = $controller("ForgotPasswordController", {
                $scope: scope,
                MortarUser: _MortarUser_,
                User: _User_,
                $http: _$http_,
                $state: _$state_,
                Alert: _Alert_,
                Mio: _Mio_,
                $modal: _$modal_
            });
            service = _User_;

        });
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });
	afterEach(function() {
    });

    it('ForgotPassword forgotPassword test', function(done) {
	    // look
	    done();
    });

    it('ForgotPassword cancel test', function(done) {
	    // look
	    done();
    });
    
});

describe('ResetUserPasswordController tests', function() {
    var service, scope, $rootScope, $q, controller;

    beforeEach(function() {
        // load modules 
        module('ui.router');
        module('login-controller');
        module('alert-handler');
        module('angularModalService');
        module('mortar-user-services');
        module('favorite-service');
        module('user-services');
        module('transducer-service');
        module('mio-services');
        angular.mock.inject(function($controller, _$rootScope_, _$q_,
            _MortarUser_, _User_, _$http_,
            _$state_, _Alert_, _$modal_, _Mio_) {//,_ModalService_
            $rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $q = _$q_;
            controller = $controller('ForgotPasswordController', {
                $scope: scope,
                MortarUser: _MortarUser_,
                User: _User_,
                $http: _$http_,
                $state: _$state_,
                Alert: _Alert_,
                Mio: _Mio_,
                $modalInstance: _$modal_
		//$modalInst
            });
            service = _User_;

        });
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });
	afterEach(function() {
    });

    it('LoginCtrl login test', function(done) {
	    // look
	    done();
    });

    it('LoginCtrl logout test', function(done) {
	    // look
	    done();
    });
    it('LoginCtrl forgot password test', function(done) {
	    // look
	    done();
    });

    it('LoginCtrl forgot password test', function(done) {
	    // look
	    done();
    });
});
