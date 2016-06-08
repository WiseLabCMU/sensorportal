/**
 * Login Controller module
 */
(function() {
    var app = angular.module('login-controller', ['ui.router', 'mortar-services', 'http-queue', 'cgBusy', 'ui.bootstrap', 'alert-handler', 'browser-service', 'xml-rpc']);
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
    //app.controller('LoginCtrl', function($scope, Browser, MortarUser, User, $http, $state, Alert, $modal) {
    app.controller('LoginCtrl', function($scope, MortarUser, User, $state, Alert, $modal, Browser, xmlrpc) {
        $scope.user = User;
        $scope.username = '';

        /*       $scope.stropheLog = function(level, message) {
                   if (level == Strophe.LogLevel.DEBUG) {
                       console.log("DEBUG: " + message);
                   } else if (level == Strophe.LogLevel.INFO) {
                       console.log("INFO: " + message);
                   } else if (level == Strophe.LogLevel.WARN) {
                       console.log("WARN: " + message);
                   } else if (level == Strophe.LogLevel.ERROR) {
                       console.log("ERROR: " + message);
                   } else if (level == Strophe.LogLevel.FATAL) {
                       console.log("FATAl: " + message);
                   }

               }*/

        //        Strophe.log = $scope.stropheLog;
        /**
         * Authenticates the user. 
         */
        $scope.login = function() {
            if (!$scope.username.includes("@")) {
                $scope.username = $scope.username + "@sensor.andrew.cmu.edu";
            }
            $scope.loginPost = $scope.user.login($scope.username, $scope.password);

            $scope.loginPost.then(function(response) {
                $scope.userInfoPost = $scope.user.getVcard();
                $scope.userInfoPost.then(function(success) {
                    Browser.init().then(function(result) {
                        if (typeof $scope.user.state.name != 'undefined') {
                            $state.go($scope.user.state.name, $scope.user.state.params);
                            return;
                        }
                        $state.go('device.list', {
                            folder: $scope.user.rootFolder
                        });
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
                            $scope.user.loggedIn = false;
                            Alert.open('danger', '$scope.user information could not be saved');
                        } else {
                            Browser.init().then(function(success) {
                                if (typeof $scope.user.state.name != 'undefined') {
                                    $state.go($scope.user.state.name, $scope.user.state.params);
                                    return;
                                }
                                $state.go('device.list', {
                                    folder: $scope.user.favoritesFolder
                                });
                            });
                        }
                    }, function() { //failure
                        $scope.user.loggedIn = false;
                        Alert.open('danger', 'Could not edit user information.');
                    });
                });
            });
        };
        /**
         * Logs the user out, and takes him to the login screen
         */
        $scope.logout = function() {
            //Monitor.deleteMonitorsSession();
            //Browser.destruct();
            // Folder.deleteInstace();
            $scope.user.logout();
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
            }, function(result) {
                // Dissmissed, canceled the action
                // nothing to do really...
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
        $scope.forgotPassword = function() {
                $scope.cp.emailPost = MortarUser.forgotPassword($scope.cp.username);
                $scope.cp.emailPost.then(function(result) {
                    $modalInstance.close(result);
                }, function(result) {
                    $scope.cp.error = true;
                    $scope.cp.errorMessage = result;
                });
            }
            /**
             * Dismisses the modal
             */
        $scope.cancel = function() {
            //$modalInstance.dismiss();
            $modal;
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
            $scope.changePassword = $scope.user.resetPassword($scope.rp.username, $scope.rp.password, $scope.rp.passwordConfirm, $scope.rp.token);
            $scope.changePassword.then(function(result) {
                $state.go('login');
                Alert.open('success', 'Your password was successfully changed.');
            }, function(result) {
                Alert.open('warning', result);
            });
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
