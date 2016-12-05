(function() {
    var app = angular.module('user-view-controller', ['ui.router', 'mortar-services',
        'cgBusy', 'angularTreeview', 'ui.bootstrap', 'xml-rpc', 'rt.timeout'
    ]);
    app.controller('UserViewCtrl', function($scope, $stateParams, User,
        $state, $modal, MortarUser, Alert, Device) {
        $scope.devices = {};
        if (typeof $stateParams.username == 'undefined') {

        } else if ($stateParams.username == User.username) {
            $scope.user = User;
            User.nodes = {};
            //load first ten devices
            for (permittedTypeIndex in $scope.user.permittedDevices) {
                var permittedType = $scope.user.permittedDevices[permittedTypeIndex];
                var count = 0;
                for (permittedDevice in permittedType) {
                    Device.constructDevice(permittedDevice, true).then(
                        function(device) {
                            $scope.devices[device.id] = device;
                        });
                    count++;
                    if (count == 10) {
                        break;
                    }
                }
            }
        } else if ($stateParams.username.indexOf('@') >= 0) {
            user = $stateParams.username;
        } else {
            user = $stateParams.username + '@' + User.connection.domain;
        }

        if (typeof $stateParams.username == 'undefined') {
            $scope.getUserPromise = MortarUser.get(User.username).then(function(result) {
                $scope.user = result;
            }, function(errorstanza) {
                Alert.open('warning', errorstanza);
            });
        } else {
            $scope.getUserPromise = MortarUser.get($stateParams.username).then(function(result) {
                $scope.user = result;
            }, function(errorstanza) {
                Alert.open('warning', errorstanza);
            });
        }

        $scope.showDevices = true;
        $scope.allowDelete = false;
        if (User.isAdmin() && $stateParams.username != User.username) {
            $scope.allowDelete = true;
        }
        // open up a modal to change the password of an user
        $scope.changePassword = function() {
                $modal.open({
                    templateUrl: 'angular-app/partials/userChangePassword.html',
                    controller: 'UserChangePasswordCtrl',
                    resolve: {
                        strUsername: function() {
                            return $scope.user.username;
                        }
                    }
                }).result.then(function(result) {
                    // @todo handle result
                }, function(result) {
                    Alert.open('error', result);
                });
            },
            function() {};

        //Todo
        $scope.getUserInfo = function() {
                var deferred = $q.defer();
                if (typeof $scope.user.username != 'undefined' &&
                    MortarUserFactory.user.username == username) {
                    deferred.resolve(MortarUserFactory.user);
                    return deferred.promise;
                }
                return MortarUser.get($scope.user.username);
            }
            // removes an user from users
        $scope.deleteUser = function() {
            if (confirm('Are you sure to delete this user?')) {
                $scope.deleteUserPromise = MortarUser.delete($scope.user.username);
                $scope.deleteUserPromise.then(function(response) {
                    $state.go('user.list');
                    Alert.open('success', response);
                }, function(response) {
                    Alert.open('warning', response);
                });
            }
        }

        /**
         * redirects to detail of selected node depending on the node type
         * @param object node  Device or Folder object to view detail
         */
        $scope.viewNodeDetail = function(node) {

            $state.go('device.view.detail', {
                id: node
            });
        }
    });
})();