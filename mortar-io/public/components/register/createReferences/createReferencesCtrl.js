(function() {
    var app = angular.module('create-references-controller', ['ui.router', 'device-services', 'user-services', 
        'cgBusy', 'ui.bootstrap', 'alert-handler', 'angularTreeview', 'uuid4']);

	app.controller('CreateReferencesCtrl', function($scope, $stateParams, $state, User, Alert, Browser,  Device) {
        $scope.deviceReferenceBrowser = {};
        $scope.references = [];
        $scope.type = $stateParams.type;
        $scope.folderSelected = false;
        Browser.loadChildren(User.favoritesFolder);
        Device.constructDevice(User.favoritesFolder, true).then(function(device) {
            $scope.gateways = device;
            Browser.loadChildren(device.id);
            $scope.selectedFolder = device;
        });
	if (User.isAdmin()) { 
		Browser.children = [User.rootFolder, User.favoritesFolder];
	} else { 
        	Browser.children = [User.favoritesFolder];
	}

        $scope.device = Device.constructDevice($stateParams.id, false);

        $scope.selectFolder = function(folder) {
            $scope.selectedFolder = folder;
            Device.constructDevice(folder.id, true, true).then(function(device) {
                Browser.loadChildren(folder.id);
                $scope.selectedFolder = device;
            });
            $scope.folderSelected = true;
        };

        $scope.isFolderSelected = function() {
            return $scope.folderSelected;
        }
        $scope.removeFolder = function(folder) {
            for (folderIndex in $scope.references) {
                var iterFolder = $scope.references[folderIndex];
                if (iterFolder.id == folder.id) {
                    $scope.references.split(folderIndex, 1);
                    break;
                }
            }
        };
        $scope.continue = function() {
            Device.constructDevice($scope.selectedFolder.id, true).then(function(device) {
                device.addReferences([{
                    id: $scope.device.id,
                    name: $scope.device.name,
                    type: 'child',
                    metaType: 'device'
                }]).then(function(result) {
                    device.getReferences().then(function(result) {
                        $state.go('devicecreate.permissions', {
                            id: $scope.device.id
                        });
                    });
                });
            });
        };
    });

})();
