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
        };

        /**
         * Init Folder service
         */
        this.init = function() {
            var $self = this;
            var deferred = $q.defer();
            /**
             * Children have first id of refrences for device broweser
             */
            $self.children = [
                User.rootFolder,
                User.favoritesFolder
            ];
            /**
             * Folder service property references is a list of instance of folder
             */
            $self.promise = Device.constructDevice(User.rootFolder, true);
            $self.promise.then(function(rootdevice) {
                $self.references[User.rootFolder] = rootdevice;
                Device.objFolder = rootdevice;
                $self.loadChildren(rootdevice.id);
                Device.constructDevice(User.favoritesFolder, true).then(function(favdevice) {
                    $self.references[User.favoritesFolder] = favdevice;
                    $self.loadChildren(User.favoritesFolder);
                    deferred.resolve(true);
                }, function(error) {
                    var favedevice = Device.constructDevice(User.favoritesFolder, false);
                    favedevice.type = 'location';
                    favedevice.info = 'Your favorite devices';
                    favedevice.name = 'Favorites';
                    favedevice.create().then(function(result) {
                            $self.references[User.favoritesFolder] = favedevice;
                            $self.loadChildren(User.favoritesFolder);
                            deferred.resolve(true);
                        },
                        function(error) {
                            deferred.reject(error);
                        });

                });
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
            var devicetest = Device.constructDevice(strFolderId, false);
            //if (!devicetest.loaded || typeof devicetest.references == 'undefined') {
            if (!devicetest.loaded) {
                Device.constructDevice(strFolderId, true).then(function(device) {
                    $self.references[device.id] = device;
                    for (child_index = 0; child_index < device.children.length; child_index++) {
                        var child = device.children[child_index];
                        if (typeof $self.references[child] == 'undefined') {
                            $self.references[child] = device.references.children[child];
                        }
                    }
                    deferred.resolve(true);
                }, function(error) {
                    deferred.reject(error);
                });
            } else {
                $self.references[strFolderId] = devicetest;
                for (child_index = 0; child_index < devicetest.children.length; child_index++) {
                    var child = devicetest.children[child_index];
                    if (typeof $self.references[child] == 'undefined') {
                        $self.references[child] = devicetest.references.children[child];
                    }
                }
                deferred.resolve(true);
            }
            return deferred.promise
        };
    });
})();
