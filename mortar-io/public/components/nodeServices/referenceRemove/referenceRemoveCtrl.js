/**
 * Folder Controller module
 */
(function() {
    var app = angular.module('reference-remove-controller', ['uuid4', 'ui.router', 'mortar-services', 'cgBusy', 'angularTreeview', 'ui.bootstrap', 'angularFileUpload', 'ngRoute']);
    /**
     * [description]
     * @param  {[type]} $scope         [description]
     * @param  {[type]} $modalInstance [description]
     * @param  {[type]} $http          [description]
     * @param  {[type]} $state         [description]
     * @param  {[type]} $stateParams   [description]
     * @param  {[type]} $upload        [description]
     * @param  {[type]} $window        [description]
     * @param  {[type]} fromModal      [description]
     * @param  {[type]} Alert          [description]
     * @param  {[type]} Folder         [description]
     * @param  {[type]} Browser        [description]
     * @param  {[type]} User           [description]
     * @param  {[type]} Device         [description]
     * @return {[type]}                [description]
     */
    app.controller('FolderRemoveCtrl', function($scope, $modalInstance, $state,
        $stateParams, $upload, $window, fromModal,
        Alert, $q, Browser, User, Device, uuid4) {
        $scope.modalBrowser = {};
        $scope.folder = null;
        $scope.cp = {
            username: '',
            error: false,
            errorMessage: ''
        };
        $scope.showRoot = true;
        $scope.isFromModal = fromModal;
        $scope.selectedFolder = "";
        $scope.selectedParents = {};
        $scope.parents = [];
        $scope.parent = null;
        $scope.isOpen = false;
        $scope.toggled = function(selection) {
            $scope.selectedParent = selection;
        };

        if (User.isPublisherOrOwner(User.rootFolder)) {
            Browser.children = [User.rootFolder, User.favoritesFolder];
        } else {
            Browser.children = [User.favoritesFolder];
        }
        /**
         * removeFolder removes reference to a device.
         */
        $scope.removeFolder = function() {
            $self.deferred = $q.defer();
            $scope.selectedParent = $scope.parents[0];
            $scope.selectedParentId = $scope.selectedParent.id;
            Device.constructDevice($scope.selectedParentId, true, true).then(
                function(parentDev) {
                    Device.constructDevice($scope.selectedFolder.id, true, true).then(
                        function(childDev) {
                            var promises = [];
                            var parentReference = {
                                type: parentDev.metaType,
                                relation: 'parent',
                                node: parentDev.id,
                                id: parentDev.id,
                                name: parentDev.name,
                                label: parentDev.name,
                                metaType: parentDev.metaType,
                            };
                            var childReference = {
                                type: childDev.metaType,
                                relation: 'child',
                                node: childDev.id,
                                id: childDev.id,
                                name: childDev.name,
                                label: childDev.name,
                                metaType: childDev.metaType,
                            };
                            promises.push(childDev.removeReferences([parentReference]));
                            promises.push(parentDev.removeReferences([childReference]));
                            $q.all(promises).then(function(result) {
                                $self.deferred.resolve(true);
                                $modalInstance.close([$scope.selectedParent, childDev.id]);
                            }, function(result) {
                                $self.deferred.resolve(true);
                                $modalInstance.close([$scope.selectedParent, childDev.id]);
                            });
                        },
                        function(error) {
                            console.log(error);
                            $self.deferred.reject(error);
                        });
                },
                function(error) {
                    console.log(error);
                    $self.deferred.reject(error);
                });
            return $self.deferred.promise;
        };

        /**
         * selectFolder callback function to call inside the browser
         * @param  Folder folder object selected in the browser
         */
        $scope.selectFolder = function(folder) {
            var keys;
            $scope.selectedFolder = folder;
            if (typeof folder == 'undefined') {
                return;
            }
            $scope.selectedParents = folder.parents;
            $scope.selectedParent = {};
            $scope.parents = [];
            if (typeof $scope.selectedParents != 'undefined') {
                keys = Object.keys($scope.selectedParents);
                for (keyInd in keys) {
                    $scope.parents.push($scope.selectedParents[keys[keyInd]]);
                }
            }
        };

        /**
         * selectFolder callback function to call inside the browser
         * @param  Folder folder object selected in the browser
         */
        $scope.selectDevice = function(folder) {
            var keys;
            $scope.selectedFolder = folder;
            $scope.selectedParents = folder.parents;
            $scope.selectedParent = {};
            $scope.parents = [];
            keys = Object.keys($scope.selectedParents);
            for (keyInd in keys) {
                $scope.parents.push($scope.selectedParents[keys[keyInd]]);
            }
        };

        /**
         * isFolderNotSelect validate if there is a folder select int browser
         * @return Boolean return true if there is not a folder select not apply if 
         * is root o favorite
         */
        $scope.isFolderNotSelect = function() {
            return typeof $scope.selectedFolder == 'undefined';
        }

        /**
         * Close the create folder modal
         */
        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
    });


})();
