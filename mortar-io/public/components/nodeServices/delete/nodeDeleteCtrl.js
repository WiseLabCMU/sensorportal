(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('delete-controller', ['ui.router', 'device-services',
        'cgBusy', 'ui.bootstrap', 'alert-handler', 'angular-centered'
    ]);
    app.controller('DeleteCtrl', function($rootScope, $scope, $modal,
        $modalInstance, $state, $stateParams, User, Alert, Device, Browser, $q,
        $timeout, Mio) {
        $scope.confirm = function() {
            var deferred = $q.defer();
            Device.constructDevice($stateParams.id, true).then(function(device) {
                var removeReference = {
                    id: $stateParams.id,
                    type: $stateParams.metaType,
                    relation: '',
                    node: $stateParams.id,
                    name: device.name
                };
                var promises = [];
                var parents = {};
                if (typeof device.references != 'undefined') {
                    // parent reference remove
                    for (parentIndex in device.references.parents) {
                        var parent = device.references.parents[parentIndex];
                        if (User.canEdit({
                                id: parent.node
                            })) {
                            var parentDevice = Device.constructDevice(parent.id, false);
                            promises.push(parentDevice.removeReferences([removeReference]));
                            parents[device.id] = true;
                        }
                    }
                    // child reference remove
                    for (childIndex in device.references.children) {
                        var child = device.references.children[childIndex];
                        if (User.canEdit({
                                id: child.node
                            })) {
                            var childDevice = Device.constructDevice(child.id, false);
                            promises.push(childDevice.removeReferences([removeReference]));
                        }
                    }
                }
                if (typeof device.parents != 'undefined') {
                    for (parentIndex in device.parents) {
                        var parent = device.parents[parentIndex];
                        if (User.canEdit({
                                id: parent.id
                            })) {
                            if (parents[parent.id]) {
                                continue;
                            }
                            var parentDevice = Device.constructDevice(parent.id, false);
                            promises.push(parentDevice.removeReferences([removeReference]));
                        }
                    }
                }
                var performDelete = function(results) {
                    Mio.delete($stateParams.id, function(iq) {
                        promises = [];
                        if (iq == null) {
                            Alert.open("request to delte " + $stateParams.id +
                                " timed out.");
                            $modalInstance.dismiss();
                        }
                        if (typeof device.parents != 'undefined') {
                            for (parentIndex in device.parents) {
                                var parent = device.parents[parentIndex];
                                if (User.canEdit({
                                        id: parent.id
                                    })) {
                                    promises.push(Browser.loadChildren(parent.id));
                                }
                            }
                        }
                        $q.all(promises).then(function(promises) {
                            var type = iq.getAttribute('type');
                            if (type == 'result') {
                                delete Browser.references[device.id];
                                delete Device.references[device.id];
                                delete Device.devices[device.id];
                                deferred.resolve(true);
                                $modalInstance.close();
                            } else {
                                Alert.open('Error', "could not delete node " + iq.toString());
                                $modalInstance.dismiss();
                            }
                        }, function(promises) {
                            var type = iq.getAttribute('type');
                            if (type == 'result') {
                                delete Browser.references[device.id];
                                delete Device.references[device.id];
                                delete Device.devices[device.id];
                                deferred.resolve(true);
                                $modalInstance.close();
                            } else {
                                Alert.open('Error', "could not delete node " + iq.toString());
                                $modalInstance.dismiss();
                            }
                        });
                    });
                };
                $q.all(promises).then(performDelete, performDelete);
            }, function(result) {
                Alert.open('Error', "Could not get node " + result);

            });
            return deferred.promise;
        };
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        $scope.deleteDevice = function() {
            var parent;
            if (typeof $scope.device.parents != 'undefined' &&
                Object.keys($scope.device.parents).length > 0) {
                parent = $scope.device.parents[0].id;
            } else {
                parent = User.favoritesFolder;
            }
            $state.go('device.view.delete', {
                parent: parent
            });
        };
    });

})();