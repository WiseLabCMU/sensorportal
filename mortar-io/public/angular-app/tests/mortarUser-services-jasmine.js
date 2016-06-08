'use strict';

describe('MortarUser function tests', function() {
    var service; 
    var scope; 
    var $rootScope; 
    var $q; 
    var controller; 
    var user;
    var xmlrpc;

    beforeEach(function() {
        // load modules 
        module('ui.router');
        module('user-services');
        module('login-controller');
        module('alert-handler');
        module('angularModalService');
        module('xml-rpc');
        module('mortar-user-services');
        module('favorite-service');
        module('transducer-service');
        module('mio-services');

        angular.mock.inject(function($controller, _$rootScope_, _$q_,
            _MortarUser_, _User_, _$http_,
            _$state_, _Alert_, _$modal_, _Mio_,_xmlrpc_) {
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
                Mio: _Mio_,
                $modal: _$modal_,
		xmlrpc:_xmlrpc_
            });
	    user = _User_;
            service = _MortarUser_;
	    xmlrpc = _xmlrpc_;
        });
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });
	afterEach(function() {
    });

    var stropheLog = function(level, message) {
        if (level == Strophe.LogLevel.DEBUG) {
            console.info("DEBUG: " + message);
        } else if (level == Strophe.LogLevel.INFO) {
            console.info("INFO: " + message);
        } else if (level == Strophe.LogLevel.WARN) {
            console.info("WARN: " + message);
        } else if (level == Strophe.LogLevel.ERROR) {
            console.info("ERROR: " + message);
        } else if (level == Strophe.LogLevel.FATAL) {
            console.info("FATAl: " + message);
        }
    };

    it('Sucessful login test', function(done) {
        Strophe.log = stropheLog;
        var username = 'admin@sensor.andrew.cmu.edu';
        var password = 'summernegr0n1';
	console.log("calling login in");
	console.log(user);
	user.login(username,password).then(function(result) {
		console.log("logged in");
		service.getUsers().then(function(result) {
			console.log(result);
			done();
		}, function(error) {
			fail(error);
		});
	},function(error) { 
		console.log("Could not login: " + error);
		fail("Could not log in");
	});
        window.setInterval(scope.$digest, 1000);
    });
});
