'use strict';

describe('FOlderViewCtrl Controller tests', function() {
    var service, scope, $rootScope, $q, controller, deviceService,goMock;

    beforeEach(function() {
        // load modules 
        module('ui.router');
        module('login-controller');
        module('folder-controller');
        module('alert-handler');
        module('angularModalService');
        module('angularTreeview');
        module('mortar-user-services');
        module('favorite-service');
        module('user-services');
        module('transducer-service');
	module('devices-service');
	module('device-services');
        module('mio-services');
	goMock =  jasmine.createSpy('goMock');
        angular.mock.inject(function($controller, _$rootScope_, _$q_,
            _MortarUser_, _User_, _$http_,
            _$state_, _Alert_, _$modal_, _Mio_,_Device_,_Devices_) {
            $rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $q = _$q_;
	    _$state_.go = goMock;
            controller = $controller("FolderViewCtrl", {
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
	    deviceService = _Device_;

        });
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });
	afterEach(function() {
    });

    it('FolderViewCtrl selectFolder test', function(done) {
	var username = 'ctpalmer'
        var password = 'graduate09';
        var success_handler = jasmine.createSpy();
        var login_promise = service.login(username, password).then(
            function(response) {
			deviceService.constructDevice('root',true).then(function(device){
			var folder = device.toFolder();
			scope.selectFolder(folder);
			expect(goMock).toHaveBeenCalledWith('device.list',{folder: folder.id});
			expect(scope.selectedFolder).toEqual(folder);
	    		done();
		},function(error){
			fail(error);done();
		});
            },
            function(arg) {
                fail("Could not login, " + arg);
		done();
            });
        window.setInterval(scope.$digest, 100);
    });


});


/*describe('BrowserCtrl Controller tests', function() {
    var service, scope, $rootScope, $q, controller, deviceService,goMock;

    beforeEach(function() {
        // load modules 
        module('ui.router');
        module('login-controller');
        module('folder-controller');
        module('alert-handler');
        module('angularModalService');
        module('angularTreeview');
        module('mortar-user-services');
        module('favorite-service');
        module('user-services');
        module('transducer-service');
	module('devices-service');
	module('device-services');
        module('mio-services');
	goMock =  jasmine.createSpy('goMock');
        angular.mock.inject(function($controller, _$rootScope_, _$q_,
            _MortarUser_, _User_, _$http_,
            _$state_, _Alert_, _$modal_, _Mio_,_Device_,_Devices_) {
            $rootScope = _$rootScope_;
            scope = _$rootScope_.$new();
            $q = _$q_;
	    _$state_.go = goMock;
            controller = $controller("BrowserCtrl", {
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
	    deviceService = _Device_;

        });
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });
	afterEach(function() {
    });

    it('BrowserCtrl selectFolder test', function(done) {
	var username = 'ctpalmer'
        var password = 'graduate09';
        var success_handler = jasmine.createSpy();
        var login_promise = service.login(username, password).then(
            function(response) {
			deviceService.constructDevice('root',true).then(function(device){
			var folder = device.toFolder();
			//controller.selectFolder(folder);
			scope.selectFolder(folder);
			expect(goMock).toHaveBeenCalledWith('device.list',{folder: folder.id});
			expect(scope.selectedFolder).toEqual(folder);
	    		done();
		},function(error){
			fail(error);done();
		});
            },
            function(arg) {
                fail("Could not login, " + arg);
		done();
            });
        window.setInterval(scope.$digest, 100);
    });


});
*/

