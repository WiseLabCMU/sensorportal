(function() {
    var app = angular.module('user-list-controller', ['ui.router', 'mortar-services',
        'cgBusy', 'angularTreeview', 'ui.bootstrap', 'xml-rpc', 'rt.timeout'
    ]);

    app.controller('UsersCtrl', function($scope, Alert, MortarUser, $modal,
        User, $q, $timeout) {
        // todo extend to people who do not have xmlrpc access
        $scope.users = [];
        $scope.user = User;
        $scope.$watch(function() {
            return User;
        }, function(oldValue, newValue) {
            $scope.user = newValue;
        });
        $scope.userCallback = function(i) {
            return function(userResponse) {
                $scope.users[i] = userResponse;
            }
        };
        $scope.usersGetPromise = MortarUser.getUsers().then(
            function(response) {
                if (typeof response === 'undefined') {
                    return null;
                }
                if (typeof response.error != 'undefined') {
                    return response.error;
                }
                var promises = [];
                var domainTag = "@" + User.connection.domain;
                $scope.users = response.users;
                for (userIndex in response.users) {
                    var user = response.users[userIndex];
                    var callback = $scope.userCallback(userIndex);
                    MortarUser.get(user.username + domainTag).then(callback);
                }
                if (response.messages) {
                    Alert.open('warning', response.messages);
                }
            },
            function(response) {
                Alert.open('warning', response);
            });
        /**
         * removes an user
         * @param string strUsername username of user to remove
         */
        $scope.removeUser = function(strUsername) {
            if (confirm('Are you sure to delete this user?')) {
                $scope.deleteUserPromise = MortarUser.delete(strUsername);
                $scope.deleteUserPromise.then(function(response) {
                    for (index in $scope.users) {
                        if ($scope.users[index].username == strUsername) {
                            $scope.users.splice(index, 1);
                        }
                    }
                    Alert.close();
                    Alert.open('success', response);
                }, function(response) {
                    Alert.close();
                    Alert.open('warning', response);
                });
            }
        };


        //Todo
        /**
         * open up a modal to change the password of an user
         * @param string strUsername username of user to change password
         */
        $scope.changePassword = function(strUsername) {
            $modal.open({
                templateUrl: 'angular-app/partials/userChangePassword.html',
                controller: 'UserChangePasswordCtrl',
                resolve: {
                    strUsername: function() {
                        return strUsername;
                    }
                }
            }).result.then(function(result) {

            }, function(result) {
                Alert.open(result);
            });
        };
    });
})();