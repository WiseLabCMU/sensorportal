(function() {
    var app = angular.module('acl-controller', ['ui.router', 'mortar-services',
        'cgBusy', 'angularTreeview', 'ui.bootstrap', 'xml-rpc', 'rt.timeout'
    ]);

app.controller('AclCtrl', function($scope, Alert, MortarUser, $modal,
        User, $q, $timeout, MortarRoster) {
        // todo extend to people who do not have xmlrpc access
        $scope.groups = {};
	$scope.roster = {};
        $scope.user = User;

	$scope.groupsGetPromise = MortarRoster.listSharedRosters(User.connection.domain).
	    then(function(groups) { 
		$scope.groups[User.connection.domain] = groups[User.connection.domain];
		console.log($scope.groups);
		console.log(groups);
	}, function(error) { 
		console.log(error);
	});

        $scope.userCallback = function(i) {
            return function(userResponse) {
                $scope.users[i] = userResponse;
            }
        };

	$scope.getGroups = function(host) { 
		MortarRoster.listSharedRosters(host).then(
			function(result) { 
				($scope.groups[host])[group] = result;
				console.log(result);
			}, function(error) {
				Alert.open('warning', error);
				console.log(error);
			});
	};

	$scope.expandGroupUsers = function(group, host) { 
		var hostGroups  = $scope.groups[host];
		var rosterGroup  = hostGroups[group];
		if (rosterGroup.isExpanded) { 
			rosterGroup.isExpanded = false; 
		} else { 
			rosterGroup.isExpanded = true; 
			rosterGroup.getMembers().then(function(result) {
				console.log(rosterGroup);
			}, function (error) { 
				Alert.open('error', error);
				console.log(error);
			});
		}
	};

        /**
         * removes an user
         * @param string strUsername username of user to remove
         */
        $scope.removeGroup = function(group, grouphost) {
            if (confirm('Are you sure to delete this group?')) {
                $scope.removeGroupPromise = MortarRoster.deleteSharedRoster(group, grouphost);
                $scope.removeGroupPromise.then(function(response) {
                    delete ($scope.groups[grouphost])[group];
                    Alert.close();
                    Alert.open('success', response);
                }, function(response) {
                    Alert.close();
                    Alert.open('warning', response);
                });
            }
        };
    });
})();
