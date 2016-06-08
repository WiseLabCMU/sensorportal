(function() {
    var app = angular.module('mio-services', ['user-services']);

    var MioService = function($window, User, $q) {
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
            for (id_index = 0; id_index < itemids.length; id_index++)
                iq.c('item', {
                    id: itemids[id_index]
                }).up();
            iqId = connection.sendIQ(iq.tree(), handler, error_handler);
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
            iqId = connection.sendIQ(iq.tree(), handler, error_handler);
        };
    };
    app.service('Mio', MioService);
})();
