/**
 * Tree Browser
 */
(function() {
    var app = angular.module('browser-service', ['user-services', 'device-services']);
    app.service('Browser', function(Device, $q, User) {
        this.references = {};
        this.initialized = false;
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
            this.initialized = true;
            var $self = this;
            var deferred = $q.defer();
            var promises = [];
            for (child in $self.children) {
                promises.push($self.loadChildren(this.children[child]));
            }
            $q.all(promises).then(function(results) {
                deferred.resolve(results);
            }, function(results) {
                deferred.reject(results);
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
            if (!this.initialized) {
                this.init().then(function(result) {
                    $self.loadChildren(strFolderId).then(function() {
                            deferred.resolve(true)
                        },
                        function() {
                            deferred.reject(false);
                        });
                });
                return deferred.promise;
            }
            if (typeof strFolderId == 'undefined') {
                deferred.reject("undefined folder");
                return deferred.promise;
            }
            Device.constructDevice(strFolderId, true, true).then(
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
                        if ($self.references[child] == null) {
                            continue;
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
