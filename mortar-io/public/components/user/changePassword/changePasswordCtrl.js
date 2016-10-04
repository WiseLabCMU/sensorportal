
(function() {
    var app = angular.module('change-password-controller', ['ui.router', 'mortar-services',
        'cgBusy', 'angularTreeview', 'ui.bootstrap', 'xml-rpc', 'rt.timeout'
    ]);
    app.controller('ChangePasswordCtrl', function($scope, $stateParams, 
      $modalInstance, Alert, strUsername, MortarUser, User) {
        $scope.cp = {
            error: false,
            errorMessage: ''
        };
        if ($stateParams.username == User.username) { 
        	$scope.user = User;
        	$scope.user.password = '';
        	$scope.user.password2 = '';
        } else {
			$scope.getUserPromise = MortarUser.get($stateParams.username);
        	$scope.getUserPromise.then(function(response) {
            	$scope.user = response;
            	$scope.user.password = '';
            	$scope.user.password2 = '';
        	}, function(response) {
            	$scope.cp.error = true;
            	$scope.cp.errorMessage = response;
        	});
		}
        $scope.changePassword = function() {
            $scope.changePasswordPromise = $scope.user.changePassword(
              $scope.user.password);
            $scope.changePasswordPromise.then(function(response) {
                // set new user token
                if ($scope.user.username === User.username) {
                    User.token = response.token;
                    User.saveSession();
                }
                $modalInstance.close(true);
            }, function(response) {
                $scope.cp.error = true;
                $scope.cp.errorMessage = response;
            });
        };

        $scope.cancel = function() {
            $modalInstance.dismiss();
        }
    });

})();
