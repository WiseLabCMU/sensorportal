/**
 * Login Controller module
 */
(function() {
    var app = angular.module('login-controller', ['ui.router', 'mortar-services', 'http-queue', 'cgBusy',
        'ui.bootstrap', 'alert-handler', 'browser-service', 'xml-rpc'
    ]);
    /**
     * Controller for managing user login / logout
     * @param  object $scope
     * @param  service MortarUser
     * @param  service $scope.user
     * @param  service $http
     * @param  service $state
     * @param  service Alert
     * @param  service Folder
     * @param  service $modal
     */
    app.controller('LoginCtrl', function($scope, MortarUser, User, $state,
      Alert, $modal, Browser, xmlrpc, $window) {
        $scope.username = '';
        $scope.user = User;

        /**
         * Authenticates the user.
         */
        $scope.login = function() {
            if (!$scope.username.includes("@")) {
                $scope.username = $scope.username + "@sensor.andrew.cmu.edu";
            }
            $scope.loginPost = User.login($scope.username, $scope.password, $scope.stayLoggedIn);
            $scope.loginPost.then(function(response) {
                $scope.userInfoPost = User.getVcard();
                $scope.userInfoPost.then(function(success) {
                    Browser.children = [User.rootFolder, User.favoritesFolder];
                    Browser.init().then(function(result) {
                        var sessionState = JSON.parse($window.sessionStorage.getItem("State"));
                        if (typeof sessionState != 'undefined' && sessionState != null) {
                                  $state.go(sessionState.state, sessionState.params);
                        } else {
                            $state.go('device.list', {
                                folder: User.rootFolder
                              });
                        }
                    });
                }, function(response) {
                    var modalInstance = $modal.open({
                        templateUrl: 'angular-app/partials/initModal.html',
                        controller: 'UserInitCtrl',
                        resolve: {
                            username: function() {
                                return $scope.username;
                            },
                            password: function() {
                                return $scope.password;
                            }
                        }
                    });
                    modalInstance.result.then(function(error) { //success
                        if (error) {
                            Alert.open('danger', 'Vcard information could not be saved.');
                        } else {
                            Browser.children = [User.rootFolder, User.favoritesFolder];
                            Browser.init().then(function(success) {
                                if (typeof User.state.name != 'undefined') {
                                    $state.go(User.state.name, User.state.params);
                                    return;
                                }
                                $state.go('device.list', {
                                    folder: User.favoritesFolder
                                });
                            });
                        }
                    }, function() {
                        User.loggedIn = false;
                        Alert.open('danger', 'Vcard request failed.');
                    });
                });
            });
        };
        /**
         * Logs the user out, and takes him to the login screen
         */
        $scope.logout = function() {
            Browser.destruct();
            User.logout();
            $state.go('login');
            Alert.open('success', 'Logged out');
        };
        /**
         * opens the forgot password modal, when dismissed shows alert with result
         */
        $scope.forgotPassword = function() {
            $modal.open({
                templateUrl: '/angular-app/partials/user-send-recovery.html',
                controller: 'ForgotPasswordController',
            }).result.then(function(result) {
                Alert.open('success', result); //result brings a text msg.
            });
        }
    });

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
    /**
     * Manages the Reset password screen
     * @param  object $scope
     * @param  service $window
     * @param  service $state
     * @param  service $stateParams
     * @param  service Alert
     * @param  service $scope.user
     */
    app.controller('Reset$scope.userPasswordController', function($scope, $window, $state, $stateParams, Alert, User) {
        $scope.rp = {
            username: $stateParams.user,
            password: '',
            passwordConfirm: '',
            token: $stateParams.token
        }

        /**
         * Calls the user service resetPassword.
         * on success takes the user to the login screen.
         * on error displays alert with message
         */
        $scope.resetPassword = function() {
            /*$scope.changePassword = User.resetPassword($scope.rp.username, $scope.rp.password,
							      $scope.rp.passwordConfirm, $scope.rp.token);
            $scope.changePassword.then(function(result) {
                $state.go('login');
                Alert.open('success', 'Your password was successfully changed.');
            }, function(result) {
                Alert.open('warning', result);
            });*/
        }

        /**
         * Lets the user go back to the login screen, but prompts him with a confirmation
         */
        $scope.cancel = function() {
            if ($window.confirm('Are you sure you want to leave this page?')) {
                $state.go('login');
            }
        }
    });
})();
