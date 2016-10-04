(function() {
    var app = angular.module('reset-password-controller', ['uuid4', 'ui.router', 'mortar-services', 
			     'cgBusy', 'angularTreeview', 'ui.bootstrap', 'ngRoute']);
    /**
     * [description]
     * @param  object $scope
     * @param  service $modalInstance
     * @param  service $scope.user
     */
    app.controller('ForgotPasswordController', function($scope, $modal, User, MortarUser) {
        $scope.cp = {
            username: '',
            error: false,
            errorMessage: ''
        };

        /**
         * Sends an email to the user to change password
         * on success closes the modal, if not, notifies the user of error.
         */
        //todo
        $scope.forgotPassword = function() {
            /* $scope.cp.emailPromise = User.forgotPassword($scope.cp.username);
            $scope.cp.emailPromise.then(function(result) {
                $modalInstance.close(result);
            }, function(result) {
                $scope.cp.error = true;
                $scope.cp.errorMessage = result;
            });*/
        }

        /**
         * Dismisses the modal
         */
        $scope.cancel = function() {
            $modal.dismiss();
        }
    });
})();
