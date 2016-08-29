(function() {
    var app = angular.module('transducer-service', []);
    app.factory('Transducer', function($q, Mio, User) {
        var TransducerService = {
            listTransducers: {}
        };

        /**
         * [Transducer description]
         * @param {[type]} json [description]
         */
        function Transducer(stanza) {
            this.name = stanza.getAttribute('name');
            this.max = stanza.getAttribute('maxValue');
            this.min = stanza.getAttribute('minValue');
            this.unit = stanza.getAttribute('unit');
            this.type = stanza.getAttribute('type');
            this.isActuable = stanza.getAttribute('interface') ? true : false;
            this.value = '';
            this.properties = {};
            this.e = {};
            var child_index, node, name, key;
            var nodes = stanza.childNodes;
            for (child_index = 0; child_index < nodes.length; child_index++) {
                var node = nodes[child_index];
                if (node.tagName == 'property') {
                    key = node.getAttribute('name');
                    value = node.getAttribute('value');
                    this.properties[key] = value;
                } else if (node.tagName == 'map') {
                    this.unit = 'enum';
                    name = node.getAttribute('name');
                    value = node.getAttribute('value');
                    this.e[parseInt(value)] = {
                        name: name,
                        value: value
                    };
                }
            }
        };
        /**
         * [prototype description]
         * @type Transducer
         */
        Transducer.prototype = {};
        /**
         * [constructTransducer description]
         * @param  {[type]} json [description]
         * @return {[type]}      [description]
         */
        TransducerService.constructTransducer = function(stanza) {
            return new Transducer(stanza);
        };

        return TransducerService;

    });
})();