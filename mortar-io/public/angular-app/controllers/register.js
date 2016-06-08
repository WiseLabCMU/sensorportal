(function() {
	var UPDATE_TRANSDUCER_INTERVAL = 20000;
	var app = angular.module('create-controller', ['ui.router', 'mortar-services',
		'cgBusy', 'ui.bootstrap', 'alert-handler', 'angularFileUpload',
		'checklist-model', 'olmap-directive', 'ja.qr', 'angularTreeview',
		'uuid4', 'angular-centered', 'ngCsvImport'
	]);
	app.controller('DeviceCreateCtrl', function($scope, Device, $stateParams, User,
		Alert, MortarUser, $http, Browser,$upload, $modal) {
	


	
});
app.controller('DeviceCreateSelectCtrl', function($scope, Device, $stateParams, User,
	Alert, MortarUser, $http, Browser, $modal, $upload) {
		$scope.csvfile = '';
		$scope.csvresult = {};
		$scope.csvseparator = ',';
		$scope.csvaccept = function(json) {
			console.log("csv accept");
			console.log(json);
			console.log($scope.csvresult);
		};
		$scope.submit = function() { 
			$upload($scope.csvfile);
		};
			/**
			 * [onFileSelect description]
			 * @param  {[type]} $files [description]
			 * @return {[type]}        [description]
			 */
		$scope.onFileSelect = function($files) {
			$scope.csvfile = $files[0];
			console.log($files);
			console.log("HERE");
			console.log($scope.csvfile_data);
				         $upload.upload({
						             url: '192.168.177.211/csv'  ,
							                 data: {file: $scope.csvfile, 'username': User.username}
									         }).then(function (resp) {
											             console.log('Success ' + 'uploaded. Response: ' + resp.data);
												             }, function (resp) {
														                 console.log('Error status: ' + resp.status);
																         }, function (evt) {
																		             var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
																			                 console.log('progress: ' + progressPercentage + '% ' );
																					         });
		}

});

app.controller('DeviceCreateTemplateCtrl', function($scope, Device, $stateParams, User, Alert,
	MortarUser, Browser, $state, $filter) {
	Browser.children = [];
	$scope.templateBrowser = {};
	$scope.selectedDevice = null;
	$scope.createType = $stateParams['type'];

		// Assumes rootFolder has already been loaded
	$scope.template = Device.constructDevice(User.rootFolder, false).
	getChildByName('templates');
	Browser.loadChildren($scope.template.id);
	Device.constructDevice($scope.template.id, true).then(function(device) {
		if ($scope.createType == 'adapter') {
			$scope.templateBrowserID = device.getChildByName('adapters');
		} else if ($scope.createType == 'device') {
			$scope.templateBrowserID = device.getChildByName('devices');
		} else if ($scope.type == 'gateway') {
			$scope.createType = device.getChildByName('gateways');
		}
		if ($scope.templateBrowserID != null) {
			$scope.template.id = $scope.templateBrowserID.node;
		}

		Browser.loadChildren($scope.template.id);
		Device.constructDevice($scope.template.id, true).then(
			function(device) {
				$scope.template = device;
				console.log($scope.template);
				Browser.children.push($scope.template.id);
				Browser.loadChildren($scope.template.id);
				$scope.selectedFolder = $scope.template;
			});
	});

	$scope.deviceIsSelected = function() {
		return $scope.selectedDevice == null;
	};

	$scope.selectFolder = function(objFolder) {
		$scope.selectedFolder = objFolder;
		$scope.selectedDevice = null;
	};

	$scope.selectDevice = function(templateDevice) {
		$scope.selectedDevice = templateDevice;
		console.log(templateDevice.id);
	};

	$scope.continueConfig = function() {
		$state.go('devicecreate.config', {
			id: $scope.selectedDevice.id,
			type: $state.createType
		});
	};
});

app.controller('DeviceCreateConfigCtrl', function($scope, Device,
	$stateParams, User, $state,
	$filter, uuid4) {

	var find_config = function(config, config_var) {
		var configHold;
		for (var arrIndex in config) {
			configHold = config[arrIndex];
			if (configHold.var == config_var) {
				return configHold;
			}
		}
		return null;
	};
	// todo add more information about config
	Device.constructDevice($stateParams.id, true).then(
		function(device) {
			device.getConfig(true).then(function(result) {
				$scope.template = device;
				console.log($scope.template.config);
				config_item = find_config($scope.template.config, "pubsub#max_items");
				console.log(config_item);
				config_item.value = 500;
			}, function(r) {
				// todo 
				console.log(error);
			});
		});
	$scope.submitConfig = function() {
		var deviceUUID = uuid4.generate();
		device = Device.constructDevice(deviceUUID, false);
		device.config = $scope.template.config;
		device.create().then(function(result) {
			$state.go('devicecreate.edit', {
				template: $stateParams.id,
				deviceid: deviceUUID
			}, function(error) {
				console.log(error);
			});
		});
	}
});
app.controller('DeviceCreateEditCtrl', function($scope, Device, $state,
	$stateParams, User, Alert,
	MortarUser, $http, Browser) {
	$scope.device = {};
	$scope.template = {};
	console.log($stateParams.template);
	console.log($stateParams.deviceid);
	Device.constructDevice($stateParams.template, true).then(function(device) {
		$scope.template = device;
	});
	Device.constructDevice($stateParams.deviceid, true).then(function(device) {
		$scope.device = device;
		$scope.device.transducers = $scope.template.transducers;
		$scope.device.properties = $scope.template.properties;
		$scope.device.name = $scope.template.name;
		$scope.device.type = $scope.template.type;
		$scope.device.interfaces = $scope.template.interfaces;
		$scope.device.info = $scope.template.info;
	});
	$scope.continue = function() {
		$scope.device.setMeta().then(function(result) {
			$state.go('devicecreate.references', {
				id: $scope.device.id,
				type: $stateParams.type
			});
		}, function(error) {
			console.log(error);
		});
	}

});
app.controller('DeviceCreateReferencesCtrl', function($scope, Device, $stateParams, User, Alert, MortarUser, $state, Browser) {
	$scope.deviceReferenceBrowser = {};
	$scope.references = [];
	$scope.type = $stateParams.type;
	Browser.children = [];
	if ($scope.type == 'adapter') {
		Browser.loadChildren(User.favoritesFolder);
		Device.constructDevice(User.favoritesFolder, true).then(function(device) {
			$scope.gateways = device;
			Browser.loadChildren(device.id);
			Browser.children.push(device.id);
			$scope.selectedFolder = device;
		});
	} else if ($scope.type == 'device') {
		Browser.loadChildren(User.favoritesFolder);
		Device.constructDevice(User.favoritesFolder, true).then(function(device) {
			$scope.gateways = device;
			Browser.loadChildren(device.id);
			Browser.children.push(device.id);
			$scope.selectedFolder = device;
		});
	} else if ($scope.type == 'gateway') {
		Browser.loadChildren(User.favoritesFolder);
		Device.constructDevice(User.favoritesFolder, true).then(function(device) {
			$scope.gateways = device;
			Browser.loadChildren(device.id);
			Browser.children.push(device.id);
			$scope.selectedFolder = device;
		});
	} else if ($scope.type == 'gateway') {
		Browser.loadChildren(User.favoritesFolder);
		Device.constructDevice(User.favoritesFolder, true).then(function(device) {
			$scope.gateways = device;
			Browser.loadChildren(device.id);
			Browser.children.push(device.id);
			$scope.selectedFolder = device;
		});
	}
	$scope.selectedFolder = User.favorites_folder;
	Browser.children = [User.favoritesFolder];
	Browser.loadChildren($scope.selectedFolder);
	$scope.device = Device.constructDevice($stateParams.id, false);

	$scope.selectFolder = function(folder) {
		$scope.references.push(folder);

		$scope.selectedFolder = folder;
	};
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
		for (ref in $scope.references) {
			if ($scope.references[ref].id == User.rootFolder) {
				continue;
			}
			console.log($scope.references[ref].id);
			Device.constructDevice($scope.references[ref].id, true).then(function(device) {
				device.addReferences([{
					id: $scope.device.id,
					name: $scope.device.name,
					type: 'child',
					metaType: 'device'
				}]).then(function(result) {
					device.getReferences().then(function(result) {
						//	Browser.loadChildren($scope.references[ref].id).then(function(result) {
						$state.go('devicecreate.permissions', {
							id: $scope.device.id
						});
						//	});
					});
				});
			});
		}
		$scope.device.addReferences($scope.references).then(function() {}, function(error) {
			console.log(error);
		});
	};
});

app.controller('DeviceCreatePermissionsCtrl', function($scope, Device, $stateParams, User, Alert, MortarUser, $state, Browser) {
$scope.isFolder = false;
$scope.user = User;
$scope.username = "";
$scope.node = null;

$scope.usersToRemove = [];
$scope.usersToAdd = [];
$scope.showUsers = true;

$scope.devicePromise =
	Device.constructDevice($stateParams['id'], true);

$scope.$watch('device', function() {
	if ($scope.node != null && angular.isUndefined($scope.node.affiliations)) {
		$scope.node.getAffiliations();
	}
});
$scope.loadUsers = function() {
	console.log("stateparams id " + $stateParams['id']);
	$scope.devicePromise.then(function(device) {
		$scope.node = device;
		$scope.node.folders = [];
		$scope.node.errors = [];
		$scope.usersGet = $scope.node.getAffiliations();
		$scope.usersGet.then(function(response) {
			console.log($scope.node.affiliations);
			$scope.affiliations = {};
			for (affiliation in $scope.node.affiliations) {
				$scope.affiliations[affiliation] = [];
				for (jid in $scope.node.affiliations) {
					var userItem = {};
					userItem.username = jid;
					vcard = User.getVcard(jid).then(function(result) {
						if (vcard.fn) {
							userItem.username = vcard.fn;
						} else {
							userItem.name = jid;
						}
						userItem.show = true;
						$scope.affiliations[affiliation].push(userItem);
					}, function(result) {
						if (vcard.fn) {
							userItem.username = vcard.fn;
						} else {
							userItem.name = jid;
						}
						userItem.show = true;
						$scope.affiliations[affiliation].push(userItem);
					});
				}
			}
			$scope.showUsers = true;
		}, function(error) {
			$scope.cp.error = true;
			$scope.cp.errorMessage = error;
			console.log(error);
		});
	});
};
$scope.deviceId = $stateParams['id'];
$scope.usersToAdd = {
	publisher: [],
	owner: [],
	outcast: []
};

$scope.loadUsers();
$scope.selectedFolder = User.favorites_folder;
Browser.children = [User.favoritesFolder];
Browser.loadChildren($scope.selectedFolder);
$scope.device = Device.constructDevice($stateParams.id, false);

/**
 * addUser Add a user to the new user list
 * @param User $item user to add
 */
$scope.addUser = function(username, permission) {
	//var username = $item.username;
	var indexNewUsers;
	if (typeof $scope.usersToAdd[permission] != 'undefined') {
		indexNewUsers = $scope.usersToAdd[permission].indexOf(username);
	} else {
		indexNewUsers = -1;
	}
	console.log("Add user: " + username);
	var hasPermission;
	if (typeof $scope.node.affiliations != 'undefined' &&
		typeof $scope.node.affiliations[permission] != 'undefined') {
		hasPermission = $scope.isInArray(username, $scope.node.affiliations[permission]);
	} else {
		hasPermission = false;
	}
	console.log("has permissions: " + hasPermission);
	console.log("index " + indexNewUsers);
	if (hasPermission) {
		$scope.isAlreadySelected = true;
	} else if (indexNewUsers !== -1) {
		$scope.isAlreadySelected = true;
	} else if ($scope.isInArray(username, $scope.usersToRemove)) {
		console.log("Already in users to Remove");
		indexToRemove = $scope.isInArray(username, $scope.usersToRemove);
		$scope.usersToRemove.splice($item);
		if (typeof $scope.usersToAdd[permission] == 'undefined')
			$scope.usersToAdd[permission] = [];
		$scope.usersToAdd[permission].push($item);
		$scope.username = '';
	} else {
		console.log("Adding to list");
		if (typeof $scope.usersToAdd[permission] == 'undefined')
			$scope.usersToAdd[permission] = [];
		$scope.usersToAdd[permission].push(username);
		$scope.isAlreadySelected = false;
	}
	$scope.username = '';
}
$scope.setPermissions = function() {
	$scope.permissionPromises = [];
	if ($scope.usersToAdd['publisher'].length > 0) {
		for (user in $scope.usersToAdd['publisher']) {
			$scope.permissionPromises.push($scope.node.addAffiliation($scope.usersToAdd['publisher'][user], 'publisher'));
		}
	}
	if ($scope.usersToRemove.length > 0) {
		for (user in $scope.usersToRemove) {
			$scope.permissionPromises.push($scope.node.removeAffiliation($scope.usersToRemove[user]));
		}
	}
	var errors = [];
	for (var i = 0; i < $scope.permissionPromises.length; i++) {
		$scope.permissionPromises[i].then(function(response) {
			if (response.isLast) $scope.displayNotification(errors);
		}, function(response) {
			errors.push(response.name);
			if (response.isLast) $scope.displayNotification(errors);
		}, function(response) {
			if (response.isLast) $scope.displayNotification(errors);
		})
	}
	$modalInstance.dismiss();
};

/**
 * shows notifications to user after permissions setting is finished
 * @param array errors users that could not set permissions to
 * @return void
 */
$scope.displayNotification = function(errors) {
	var message = ''
	var messageType = '';
	if (errors.length > 0) {
		messageType = 'warning';
		message = 'Some errors occurred while setting permissions to this users: ';
		for (err in errors) {
			message += errors[err];
			if (err < errors.length - 1) {
				message += ', ';
			}
		}
	} else {
		message = 'Permissions successfully set to selected users';
		messageType = 'success';
	}
	$modalInstance.dismiss();
	Alert.open(messageType, message);
}


/**
 * removeUser remove a user permissions
 * @param  User user User service
 */
$scope.removeUser = function(user) {
		var affil;
		var indexNewUsers;
		for (affil in $scope.usersToAdd) {
			indexNewUsers = $scope.usersToAdd[affil].indexOf(user);
			if (indexNewUsers != -1) {
				break;
			}
		}
		if (indexNewUsers !== -1) {
			user.show = false;
		} else {
			indexPermittedUsers = $scope.node.users.indexOf(user);
			$scope.node.users.splice(indexPermittedUsers, 1);
			$scope.usersToRemove.push(user);
		}
	}
	/**
	 * add and remove permissions to selected users
	 */
	//todo test this
$scope.continue = function() {
	$scope.permissionPromises = [];
	if ($scope.usersToAdd['publisher'].length > 0) {
		for (user in $scope.usersToAdd['publisher']) {
			$scope.permissionPromises.push($scope.node.addAffiliation($scope.usersToAdd['publisher'][user], 'publisher'));
		}
	}
	if ($scope.usersToAdd['owner'] == null &&
		$scope.usersToAdd['owner'].length > 0) {
		for (user in $scope.usersToAdd['owner']) {
			$scope.permissionPromises.push($scope.node.addAffiliation($scope.usersToAdd['owner'][user], 'owner'));
		}
	}
	if ($scope.usersToAdd['outcast'].length != null &&
		$scope.usersToAdd['outcast'].length > 0) {
		for (user in $scope.usersToAdd['outcast']) {
			$scope.permissionPromises.push($scope.node.addAffiliation($scope.usersToAdd['outcast'][user], 'outcast'));
		}
	}
	if ($scope.usersToRemove != null && $scope.usersToRemove.length > 0) {
		for (user in $scope.usersToRemove) {
			$scope.permissionPromises.push($scope.node.removeAffiliation($scope.usersToRemove[user]));
		}
	}
	var errors = [];
	for (var i = 0; i < $scope.permissionPromises.length; i++) {
		$scope.permissionPromises[i].then(function(response) {
			if (i == $scope.permissionPromises.length - 1) {
				$state.go('devicecreate.select', {});
				$scope.displayNotification(errors);
			}
		}, function(response) {
			errors.push(response.name);
			if (i == $scope.permissionPromises.length - 1) {
				$state.go('devicecreate.select', {});
				$scope.displayNotification(errors);
			}
		});
	}
	if ($scope.permissionPromises.length == 0) {
		$state.go('devicecreate.select', {});
	}

};
});
})();
