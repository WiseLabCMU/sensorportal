'use strict';

describe('User function tests', function() {
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
            controller = $controller("LoginCtrl", {
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




    Object.size = function(obj) {
        var size = 0,
            key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

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

    }
    it('Sucessful login test', function(done) {
        var username = 'ctpalmer'
        var password = 'graduate09';
        var success_handler = jasmine.createSpy();

        var login_promise = service.login(username, password).then(
            function(resp) {
                success_handler(resp);
            },
            function(arg) {
                fail("Could not login, " + arg);
            },
            function(args) {}).finally(function() {
            expect(service.loggedIn).toEqual(true);
            done();
        });
        window.setInterval(scope.$digest, 1000);
    });

    it('login failure', function(done) {
        var username = 'ctpalmer';
        var password = 'sadf';
        var failure_handler = jasmine.createSpy('failure');
        var login_promise = service.login(username, password);
        login_promise.then(
            function(result) {
                fail("Should not have logged in");
            }, failure_handler).
        finally(function() {
            expect(failure_handler).toHaveBeenCalled();
            expect(service.loggedIn).toEqual(false);
            done();
        });
        window.setInterval(scope.$digest, 1000);
    });

    it('Get permitted devices', function(done) {
        var username = 'ctpalmer'
        var password = 'graduate09';
        var login_promise = service.login(username, password);

        login_promise.then(
            function(result) {
                var permitted_devices_promise = service.getPermittedDevices();
                permitted_devices_promise.then(function(resonse) {
                        expect(Object.size(service.permittedDevices.owner)).
                        toBeGreaterThan(0);
                        expect(Object.size(service.permittedDevices.publisher)).
                        toBeGreaterThan(0);
                        done();
                    },
                    function(response) {
                        fail("Could not retrieve permitted devices.")
                    });
            },
            function(result) {
                fail("Could not log in.");
            });

        window.setInterval(scope.$digest, 1000);
    });


    it('Set vcard', function(done) {
        var username = 'ctpalmer'
        var password = 'graduate09';
        var login_promise = service.login(username, password);
        login_promise.then(
            function(result) {
                var vcard_promise = service.setVcard("Christopher Palmer",
                    'ctpalmer@andrew.cmu.edu').
                then(function(resonse) {
                        expect(service.name).toEqual("Christopher Palmer");
                        expect(service.email).toEqual("ctpalmer@andrew.cmu.edu");
                        done();
                    },
                    function(response) {
                        fail("Setting vcard failed.")
			done();
                    });
            },
            function(result) {
                fail("Could not log in.");
		done();
            });
        window.setInterval(scope.$digest, 1000);
    });


    it('Get vcard', function(done) {
        var username = 'ctpalmer'
        var password = 'graduate09';
        var login_promise = service.login(username, password);
        login_promise.then(
            function(result) {
                var getVcard_promise = service.getVcard();
                getVcard_promise.then(function(resonse) {
                        expect(service.name).toEqual("Christopher Palmer");
                        expect(service.email).toEqual("ctpalmer@andrew.cmu.edu");
                        done();
                    },
                    function(response) {
                        fail("Could not retrieve vcard.")
			done()
                    });
            },
            function(result) {
                fail("Could not log in.");
		done();
            });
        window.setInterval(scope.$digest, 100);
    });

});
