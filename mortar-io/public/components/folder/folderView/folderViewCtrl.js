(function() {
    var app = angular.module('folder-view-controller', ['uuid4', 'ui.router', 'mortar-services', 'cgBusy', 'angularTreeview', 'ui.bootstrap', 'angularFileUpload', 'ngRoute']);

    app.controller('FolderViewCtrl', function($rootScope, $state,
        $stateParams, $window, $route, Alert, User, Device, Browser, $q) {
        this.devices = [];
        /**
         * initFolder get the current Folder
         * @param  string strFolderId Folder ID
         */
        this.initFolder = function(strFolderId) {
            var deferred = $q.defer();
            var $self = this;
            // looks a lot like Browser code, use References
            Browser.loadChildren(strFolderId).then(function(result) {
                $self.folder = Browser.references[strFolderId];
                console.log("Initialized folder");
                console.log($self.folder);
                $self.devices = $self.folder.references.children;
                for (cIndex in $self.devices) {
                    var child = $self.folder.references.children[cIndex];
                    $self.devices[child.id] = (child);
                    Device.constructDevice(child.id, true).then(function(childdevice) {
                        $self.devices[childdevice.id] = childdevice;
                    }, function(error) {
                        console.log(error);
                    });
                }
                deferred.resolve(true);
            }, function(reject) {
                deferred.resolve(reject);
            });
            return deferred.promise;
        };


        console.log("initializing folder");
        if (typeof $stateParams.folder != 'undefined') {
            this.initFolder($stateParams.folder);
        } else {
            $state.go('device.list', User.rootFolder);
        }

        /**
         * [isOwner description]
         * @param  {[type]}  deviceId [description]
         * @return {Boolean}          [description]
         */
        this.isOwner = function(deviceId) {
            console.log(deviceId);
            return User.isOwner({
                id: deviceId
            });
        };
        this.canEdit = function(deviceId) {
            return User.isOwner({
                id: deviceId
            }) || User.isPublisher({
                id: deviceId
            });
        };
        this.reload = function() {
            this.initFolder({
                id: $stateParams.folder
            });
        };
        this.hasMap = function() {
                return (typeof this.folder != 'undefined' &&
                    typeof this.folder.properties != 'undefined' &&
                    typeof this.folder.properties.mapUri != 'undefined');
            }
            /**
             * [isPublisher description]
             * @param  {[type]}  deviceId [description]
             * @return {Boolean}          [description]
             */
        this.isPublisher = function(deviceId) {
            return User.isPublisher({
                id: deviceId
            });
        }

        /**
         * deleteFolder remove a folder if have parent delete the references
         */
        this.deleteFolder = function() {
            var parent;
            if (typeof this.folder.parents != 'undefined' &&
                this.folder.parents.length > 0) {
                parent = this.folder.parents[0].id;
            } else {
                parent = User.favoritesFolder;
            }
            $state.go('device.list.delete', {
                id: $stateParams.folder,
                parent: parent
            });
        };


    });
})();