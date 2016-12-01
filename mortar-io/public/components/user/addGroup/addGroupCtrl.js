(function() {
    var app = angular.module('add-group-controller', ['ui.router', 'mortar-services',
        'cgBusy', 'angularTreeview', 'ui.bootstrap', 'xml-rpc', 'rt.timeout'
    ]);

app.controller('AddGroupCtrl', function($scope, Alert, MortarUser, $modal,$modalInstance,
    User, $q, $timeout, MortarRoster) {
        // todo extend to people who do not have xmlrpc access
	
	this.grouphost = User.connection.domain;
	this.description = "";
	this.groupname = "";
	this.displayGroup = false;
       
       
	$scope.cancel = function() { 
		$modalInstance.close();
	};
        
	$scope.saveGroup = function() { 
		MortarRoster.createSharedRoster(this.groupname, this.grouphost, this.description,
					       this.displayGroup).then(function() { 
			$modal.close();
		}, function(error) { 
			$scope.cp = error;
		});
	};
    });
})();
