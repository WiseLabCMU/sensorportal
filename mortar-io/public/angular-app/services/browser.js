/**
 * Tree Browser
 */
(function() {
    var app = angular.module('browser-service', ['user-services', 'device-services']);
    app.service('Browser', function(User, Device, $q) {
        this.references = {};
        /**
         * Destroy object on logout
         */
        this.destruct = function() {
            var $self = this;
            $self.references = {};
            $self.children = [];
            $self.parents = {};
        };

        this.init = function() {
            var $self = this;
            var deferred = $q.defer();
            /**
             * Children have first id of refrences for device broweser
             **/
            $self.children = [
                User.rootFolder,
                User.favoritesFolder
            ];
            /**
             * Folder service property references is a list of instance of folder
             *                           */
            $self.promise = Device.constructDevice(User.rootFolder, true);

            $self.promise.then(function(rootdevice) {
                $self.references[User.rootFolder] = rootdevice;
                Device.objFolder = rootdevice;
                Device.constructDevice(User.favoritesFolder, true).then(function(favdevice) {
                    $self.loadChildren(User.favoritesFolder);
                    deferred.resolve(true);
                });
                $self.loadChildren(rootdevice.id);
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        };
        /**
         * [loadChildren description]
         * @param  {[type]} strFolderId [description]
         * @return {[type]}             [description]
         */
        this.loadChildren = function(strFolderId) {
            var $self = this;
            var deferred = $q.defer();
            if (typeof strFolderId == 'undefined') {
                deferred.reject("undefined folder");
                return deferred.promise;
            }
            Device.constructDevice(strFolderId, true).then(
                function(device) {
                    if (typeof $self.references[device.id] != 'undefined') {
                        device.parents = $self.references[device.id].parents;
                    }
                    $self.references[device.id] = device;
                    for (child_index = 0; child_index < device.children.length; child_index++) {
                        var child = device.children[child_index];
                        if (typeof $self.references[child] === 'undefined') {
                            $self.references[child] = device.references.children[child];
                        }
                        if (typeof $self.references[child].parents === 'undefined') {
                            $self.references[child].parents = {};
                        }
                        $self.references[child].parents[device.id] = device;
                    }
                    deferred.resolve(true);
                },
                function(error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        };
    });
})();
