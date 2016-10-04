(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('reference-add-controller', ['ui.router', 'device-services',
        'cgBusy', 'ui.bootstrap', 'alert-handler', 'angular-centered'
    ]);
    app.controller('ReferenceAddCtrl', function($rootScope, $scope, $modal,
        $modalInstance, $state, $stateParams, User, Alert, Device, Browser, $q,
        $timeout) {
        $scope.devBrowserFavorites = {};
        Browser.children = [];
        $scope.newFavorites = [];
        $scope.favoritesToRemove = [];
        $scope.isAlreadySelected = false;
        $scope.errors = [];
        $scope.isUpdate = $stateParams.isUpdate;
        Device.constructDevice(User.favoritesFolder, true).then(function(device) {
            $scope.favorite = device;
            Browser.children = [device.id];
            $scope.selectedFolder = device;
        }, function(error) {
            $modalInstnace.close();
        });
        Device.constructDevice($stateParams.id, true).then(function(device) {
            $scope.device = device;
            //$scope.device.folders = [];
        }, function(error) {
            console.log(error + $stateParams.id);
            $modalInstance.close();
        });

        /**
         * addFolder callback function to pass to browser directive
         */
        //todo add to other folders than favorite
        $scope.addFolder = function() {
            modalInstance = $modal.open({
                templateUrl: 'angular-app/partials/FolderModal.html',
                controller: 'FolderModalCtrl',
                scope: $scope,
                resolve: {
                    fromModal: function() {
                        return true;
                    }
                }
            });
            modalInstance.result.then(function(ids) {
                if (idIndex in ids) {
                    Browser.loadChildren(ids[idIndex]);
                }
            });
        };
        /**
         * [myIndexOf description]
         * @param  {[type]} arr [description]
         * @param  {[type]} obj [description]
         * @return {[type]}     [description]
         */
        $scope.myIndexOf = function(arr, obj) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].id == obj.id) {
                        return i;
                    }
                };
                return -1;
        }
        
        /**
         * [addFavorite description]
         * @param {[type]} $favorite [description]
         */
        $scope.addFavorite = function($favorite) {
            var favorite = {
                id: $favorite.id,
                name: $favorite.name
            };
            var indexNewFavorites = $scope.myIndexOf($scope.newFavorites, favorite);
            var indexDeletedFavorites = $scope.myIndexOf($scope.favoritesToRemove, favorite);
            if (indexDeletedFavorites !== -1) {
                $scope.favoritesToRemove.splice(indexDeletedFavorites, 1);
                return;
            }
            if (indexNewFavorites !== -1) {
                $scope.isAlreadySelected = true;
                return;
            }
            $scope.newFavorites.push(favorite);
            $scope.isAlreadySelected = false;
        }

        /**
         * [deleteFavorite description]
         * @param  {[type]} $favorite [description]
         * @return {[type]}           [description]
         */
        $scope.deleteFavorite = function($favorite) {
            var indexNewFavorites = $scope.myIndexOf($scope.newFavorites, $favorite);
            if (indexNewFavorites !== -1) {
                $scope.newFavorites.splice(indexNewFavorites, 1);
            }
        };

        /**
         * submit send the resques to add device to favorite
         */
        $scope.submit = function() {
            $scope.allPromise = [];
            if ($scope.newFavorites.length > 0) {
                $scope.loading = true;
                for (favorite in $scope.newFavorites) {
                    var folderid = $scope.newFavorites[favorite].id;
                    var tmpDeferred = $q.defer();
                    $scope.allPromise.push(tmpDeferred.promise);
                    Device.constructDevice(folderid, true).then(function(tmpFolder) {
                        tmpFolder.addReferences(
                            [{
                                type: 'child',
                                id: $scope.device.id,
                                node: $scope.device.id,
                                metaType: 'device',
                                name: $scope.device.name
                            }]).then(function(result) {
                            tmpDeferred.resolve(result);
                        }, function(result) {
                            tmpDeferred.reject(result);
                        });
                    });
                }
                $q.all($scope.allPromise).then(function(response) {
                    $scope.errors = [];
                    Alert.close();
                    Alert.open('success', 'Device successfully added to favorites');
                    $modalInstance.close(true);
                }, function(error) {
                    var message = 'Device could not be added to some favorites: ';
                    for (error in $scope.errors) {
                        message += $scope.errors[error];
                        if (error != $scope.errors.length - 1) {
                            message += ', ';
                        }
                    }
                    Alert.close();
                    Alert.open('warning', message);
                    $modalInstance.close(true);
                });
            } else {
                $modalInstance.close(true);
            }
        };

        /**
         * isFolderNotSelect check if there is a folder select
         * @return Boolean
         */
        $scope.isFolderNotSelect = function() {
            return $scope.newFavorites.length <= 0;
        };

        /**
         * [cancel description]
         * @return {[type]} [description]
         */
        $scope.cancel = function() {
            $modalInstance.dismiss($scope.selectedFolder);
        };
    });
})();
