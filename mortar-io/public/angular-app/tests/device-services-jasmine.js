'use strict';

describe('Device function tests', function() {
    var service, scope, $rootScope, $q, controller, deviceService;

    beforeEach(function() {
        // load modules 
        module('pasvaz.bindonce');
        module('ui.router');
        module('login-controller');
        module('checklist-model');
        module('device-controller');
        module('alert-handler');
        module('mightyDatepicker');
        module('angularModalService');
        module('mortar-user-services');
        module('favorite-service');
        module('olmap-directive');
        module('ja.qr');
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
            console.debug( message);
        } else if (level == Strophe.LogLevel.INFO) {
            console.info(message);
        } else if (level == Strophe.LogLevel.WARN) {
            console.warn(message);
        } else if (level == Strophe.LogLevel.ERROR) {
            console.error(message);
        } else if (level == Strophe.LogLevel.FATAL) {
            console.error(message);
        }

    };
    /*it('Device get meta test', function(done) {

        //Strophe.log = stropheLog;
        var username = 'ctpalmer'
        var password = 'graduate09';
        var success_handler = jasmine.createSpy();

       service.login(username, password).then(
            function(resp) {
                var device = deviceService.constructDevice('244E7901519C395B', false);
                device.getMeta().then(function(response) {
                        if (typeof device.meta == 'undefined') {
                            fail('Did not generate a meta node');
			    done();
			}
                        expect(device.meta.name).toEqual('Twist 395B');
                        expect(device.meta.info).toEqual('Bosch Twist Node sensor.');
                        expect(device.meta.timestamp).toEqual('2015-07-24T14:51:00.824492');
                        expect(device.meta.properties['type']).toEqual('Twist');
                        expect(device.meta.transducers.length).toEqual(9);
			device = '';
                        done();
                    },
                    function(response) {
                        fail("Could not retrieve meta");
			done();
                    }
                );

            },
            function(arg) {
                fail("Could not login, " + arg);
		done();
            });
        window.setInterval(scope.$digest, 1000);
    });

    it('Device get Data test', function(done) {

       // Strophe.log = stropheLog
        var username = 'ctpalmer'
        var password = 'graduate09';
        var success_handler = jasmine.createSpy();
	var device;
	var key;
        service.login(username, password).then(
            function(resp) {
                device = deviceService.constructDevice('244E7901519C395B', false);
		device.getMeta().then(function(result){
                     	if (typeof device.meta == 'undefined') {
                        	fail('Did not generate a meta node');
				done();
			}
                	device.getData().then(function(response) {
                	     	if (typeof device.data == 'undefined') {
                	        	fail('Did not generate a data node');
					done();
				}
                        	expect((device.data['Temperature']).value).toBeGreaterThan(0);
				for (key in device.data) {
					console.log(key);
					console.log(device.data[key]);
				}
                        	done();
                    	},
                    	function(response) {
                        	fail("Could not retrieve data");
				done();
                    	}
             	);},function(error){fail("Could not retrieve meta" + error);done();});
            },
            function(arg) {
                fail("Could not login, " + arg);
		done();
            });
        window.setInterval(scope.$digest, 1000);
    });

    it('Device getReferences  test', function(done) {

        //Strophe.log = stropheLog;
        var username = 'ctpalmer'
        var password = 'graduate09';
        var success_handler = jasmine.createSpy();

        var login_promise = service.login(username, password).then(
            function(resp) {
                var device = deviceService.constructDevice('root', false);
                device.getReferences().then(function(response) {
			expect(device.references.children.length).toEqual(3);
			expect(device.references.parents.length).toEqual(0);
			done();
                    },
                    function(response) {
                        fail("Could not retrieve meta");
			done();
                    }
                );

            },
            function(arg) {
                fail("Could not login, " + arg);
		done();
            });
        window.setInterval(scope.$digest, 1000);
    });
    it('Device getStorage  test', function(done) {

        //Strophe.log = stropheLog;
        var username = 'ctpalmer'
        var password = 'graduate09';
        var success_handler = jasmine.createSpy();

        var login_promise = service.login(username, password).then(
            function(resp) {
                var device = deviceService.constructDevice('244E7901519C395B', false);
                device.getStorage().then(function(response) {
			expect(device.storage.length).toEqual(1);
			expect((device.storage[0]).address).toEqual('http://128.2.120.174:4723');
			done();
                    },
                    function(response) {
                        fail("Could not retrieve meta");
			done();
                    }
                );

            },
            function(arg) {
                fail("Could not login, " + arg);
		done();
            });
        window.setInterval(scope.$digest, 1000);
    });

    it('Device init test', function(done) {

        Strophe.log = stropheLog;
        var username = 'ctpalmer'
        var password = 'graduate09';
        var success_handler = jasmine.createSpy();

        var login_promise = service.login(username, password).then(
            function(resp) {
                var device_promise = deviceService.constructDevice('244E7901519C395B', true);
		var key;
                device_promise.then(function(device) {
                        if (typeof device == 'undefined') {
                            fail('Did not generate a device');
			    done();
			} else if (typeof device == 'undefined') {
                            fail('Did not generate a device');
			    done();
			}
                        expect(device.meta.name).toEqual('Twist 395B');
                        expect(device.meta.info).toEqual('Bosch Twist Node sensor.');
                        expect(device.meta.timestamp).toEqual('2015-07-24T14:51:00.824492');
                        expect(device.meta.properties['type']).toEqual('Twist');
                        expect(Object.keys(device.meta.transducers).length).toEqual(9);
			expect(device.storage.length).toEqual(1);
			expect((device.storage[0]).address).toEqual('http://128.2.120.174:4723');
			for (key in device.data) {
				console.log(key);
				console.log(device.data[key]);
			}

                        done();
                    },
                    function(response) {
                        fail("Could not retrieve meta");
                    }
                );

            },
            function(arg) {
                fail("Could not login, " + arg);
            });
        window.setInterval(scope.$digest, 1000);
    });
   
   it('Device addReferences  test', function(done) {
        Strophe.log = stropheLog;
        var username = 'ctpalmer'
        var password = 'graduate09';
        var success_handler = jasmine.createSpy();
        var login_promise = service.login(username, password).then(
            function(resp) {
                var device = deviceService.constructDevice('tmp22', false);
                var promise = device.addReferences([{name:'boo',metaType:'location',type:'child',node:'root'}]);
		promise.then(function(device) {
                        done();
                    },
                    function(response) {
                        fail(response);
			done();
                    }
                );
            },
            function(arg) {
                fail("Could not login, " + arg);
            });
        window.setInterval(scope.$digest, 1000);
    });*/

   /*  it('Device removeReferences  test', function(done) {

        //Strophe.log = stropheLog;
        var username = 'ctpalmer'
        var password = 'graduate09';
        var success_handler = jasmine.createSpy();

        var login_promise = service.login(username, password).then(
            function(resp) {
                var device_promise = deviceService.constructDevice('244E7901519C395B', true);
                device_promise.then(function(device) {
                        if (typeof device.meta == 'undefined')
                            fail('Did not generate a meta node');
                        expect(device.meta.name).toEqual('Twist 395B');
                        expect(device.meta.info).toEqual('Bosch Twist Node sensor.');
                        expect(device.meta.timestamp).toEqual('2015-07-24T14:51:00.824492');
                        expect(device.meta.properties['type']).toEqual('Twist');
                        expect(device.meta.transducers.length).toEqual(9);
                        done();
                    },
                    function(response) {
                        fail("Could not retrieve meta");
                    }
                );

            },
            function(arg) {
                fail("Could not login, " + arg);
            });
        window.setInterval(scope.$digest, 1000);
    });

    it('Device add Geolocation  test', function(done) {

        //Strophe.log = stropheLog;
        var username = 'ctpalmer'
        var password = 'graduate09';
        var success_handler = jasmine.createSpy();

        var login_promise = service.login(username, password).then(
            function(resp) {
                var device_promise = deviceService.constructDevice('244E7901519C395B', true);
                device_promise.then(function(device) {
                        if (typeof device.meta == 'undefined')
                            fail('Did not generate a meta node');
                        expect(device.meta.name).toEqual('Twist 395B');
                        expect(device.meta.info).toEqual('Bosch Twist Node sensor.');
                        expect(device.meta.timestamp).toEqual('2015-07-24T14:51:00.824492');
                        expect(device.meta.properties['type']).toEqual('Twist');
                        expect(device.meta.transducers.length).toEqual(9);
                        done();
                    },
                    function(response) {
                        fail("Could not retrieve meta");
                    }
                );

            },
            function(arg) {
                fail("Could not login, " + arg);
            });
        window.setInterval(scope.$digest, 1000);
    });

    it('Device add Geolocation  test', function(done) {

        //Strophe.log = stropheLog;
        var username = 'ctpalmer'
        var password = 'graduate09';
        var success_handler = jasmine.createSpy();

        var login_promise = service.login(username, password).then(
            function(resp) {
                var device_promise = deviceService.constructDevice('244E7901519C395B', true);
                device_promise.then(function(device) {
                        if (typeof device.meta == 'undefined')
                            fail('Did not generate a meta node');
                        expect(device.meta.name).toEqual('Twist 395B');
                        expect(device.meta.info).toEqual('Bosch Twist Node sensor.');
                        expect(device.meta.timestamp).toEqual('2015-07-24T14:51:00.824492');
                        expect(device.meta.properties['type']).toEqual('Twist');
                        expect(device.meta.transducers.length).toEqual(9);
                        done();
                    },
                    function(response) {
                        fail("Could not retrieve meta");
                    }
                );

            },
            function(arg) {
                fail("Could not login, " + arg);
            });
        window.setInterval(scope.$digest, 1000);
    });*/
});
