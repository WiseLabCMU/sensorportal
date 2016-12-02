(function() {
    var app = angular.module('register-controller', ['ui.router', 'mortar-services', 
			     'http-queue', 'cgBusy', 'ui.bootstrap', 'alert-handler', 
			     'browser-service', 'xml-rpc'
    ]);
    app.controller('UserRegisterCtrl', function($scope, MortarUser, User, $state,
        Alert, $modalInstance, Browser, xmlrpc, $window, $q) {

        $scope.user = '';
        $scope.password = '';
        $scope.passwordConfirm = '';
        $scope.waitTime = 5000; // 5 seconds
        $scope.formLoaded = false;
        $scope.form = null;
        $scope.connection = null;

        $scope.domainSelected = function(domain) {
            if (typeof domain === 'undefined' || domain == '') {
                return;
            }
            $scope.loadForm = $q.defer();
            var boshEndpoint = 'http://' + domain + ':5280/http-bind/';
            Strophe.TIMEOUT = 10000;
            $scope.connection = new Strophe.Connection(boshEndpoint);
            $scope.connection.register.connect(domain, function(status) {
              if (status === Strophe.Status.REGISTER) {
                $scope.formLoaded = true;
                $scope.loadForm.resolve(true);
              } else if (status === Strophe.Status.REGISTERED) {
                User.username =  $scope.connection.register.fields.username +
                  '@' +$scope.domain;
                User.password = $scope.connection.register.fields.password;
                $modalInstance.close();
              } else if (status === Strophe.Status.CONFLICT) {
                Alert.open('error',"Username already exists!");
              } else if (status === Strophe.Status.NOTACCEPTABLE) {
                Alert.open("Registration form not properly filled out.")
              } else if (status === Strophe.Status.REGIFAIL) {
                Alert.open('warning', "The server at " + domain + " does not allow registration.");
                $modalInstance.dismiss();
              } else if (status === Strophe.Status.CONNECTED) {
                // do something after successful authentication
              } else {
                // Do other stuff
              }
              },
                $scope.waitTime);
        };

        $scope.$watch('domain', function(oldValue, newValue) {
          $scope.domainSelected(newValue);
        });
        $scope.cancel = function() {
            $modalInstance.dismiss();
        }
        $scope.submit = function() {
            $scope.connection.register.submit();
        };
        $scope.allFieldsFilled = function() {
            if (!$scope.formLoaded) {
                return false;
            }
            for (key in $scope.connection.register.fields) {
                var value = $scope.connection.register.fields[key];
                if (value == '') {
                    return false;
                }
            }
            return true;
        };

        $scope.domain = XMPP_SERVER;

    });
})();
