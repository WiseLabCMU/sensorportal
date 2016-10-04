describe('User function tests', function() {
    var service, scope, $rootScope, $q,  controller;

    beforeEach(function() {
	// load modules 
        module('ui.router');
        module('login-controller');
        module('alert-handler');
        module('angularModalService');
        module('mortar-user-services');
        module('favorite-service');
        module('user-services');
        angular.mock.inject(function($controller, _$rootScope_, _$q_,
            _MortarUser_, _User_, _$http_,
            _$state_, _Alert_, _$modal_) {
            $rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $q = _$q_;
            controller = $controller("LoginCtrl", {
                $scope: scope,
                MortarUser: _MortarUser_,
                User: _User_,
                $http: _$http_,
                $state: _$state_,
                Alert: _Alert_,
                $modal: _$modal_
            });
            service = _User_;

        });
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });



});
