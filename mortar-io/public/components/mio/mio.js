(function() {
    var app = angular.module('mio-services', ['user-services']);

    var MioService = function($window, User, $q) {
        this.timeout = 5000; // timeout of 5 seconds
        this.deleteNode = function(deferred, eventnode) {
            User.connection.pubsub.delete(eventnode, function(iq) {
                var type = iq.getAttribute('type');
                if (type == 'result') {
                    deferred.resolve(true);
                } else if (type == 'error') {
                    var error = iq.getElementsByTagName('error');
                    var error_code = error[0].getAttribute('code');
                    var error_type = error[0].getAttribute('type');
                    var error_msg = error[0].childNodes[0].tagName;
                    var msg = "Error Code: " + error_code + " ,Type: " +
                        error_type + ", Message: " + error_msg;
                    deferred.reject(msg);
                } else {
                    deferred.reject("Could not publish, unknown response type.");
                }
            }, this.timeout);
        }
        this.publishItems = function(items, deferred, eventnode) {
            User.connection.pubsub.publish(
                eventnode, items,
                function(iq) {
                    var type = iq.getAttribute('type');
                    if (type == 'result') {
                        deferred.resolve({
                            id: $self.id
                        });
                    } else if (type == 'error') {
                        var error = iq.getElementsByTagName('error');
                        var error_code = error[0].getAttribute('code');
                        var error_type = error[0].getAttribute('type');
                        var error_msg = error[0].childNodes[0].tagName;
                        var msg = "Error Code: " + error_code + " ,Type: " +
                            error_type + ", Message: " + error_msg;
                        deferred.reject(msg);
                    } else {
                        deferred.reject("Could not publish, unknown response type.");
                    }
                });
        };

        this.item = function(event, itemids, handler, error_handler) {
            var connection = User.connection;
            var iq = $iq({
                    from: User.username,
                    to: User.pubsubservice,
                    type: 'get'
                })
                .c('pubsub', {
                    xmlns: Strophe.NS.PUBSUB
                })
                .c('items', {
                    node: event
                });
            var id_index;
            for (id_index in itemids.length) {
                iq.c('item', {
                    id: itemids[id_index]
                }).up();
            }
            var iqId = connection.sendIQ(iq.tree(), handler, error_handler);
            return iqId;
        };

        this.items = function(event, handler, error_handler) {
            var connection = User.connection;
            var iq = $iq({
                    from: User.username,
                    to: User.pubsubservice,
                    type: 'get'
                })
                .c('pubsub', {
                    xmlns: Strophe.NS.PUBSUB
                })
                .c('items', {
                    node: event
                });
            var iqId = connection.sendIQ(iq.tree(), handler, error_handler);
        };
        this.delete = function(event, handler) {
            var timeout = 5000;
            var connection = User.connection;
            var iqId = connection.pubsub.deleteNode(event, handler);
        };
    };

    app.service('Mio', MioService);
})();