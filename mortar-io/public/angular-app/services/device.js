(function() {
	var app = angular.module('device-services', ['mio-services', 'user-services', 'transducer-service', 'angular.filter']);
	app.factory('Device', function($q, Mio, User, Transducer) {

		var DeviceService = {
			objFolder: {},
			devices: {},
			references: {}
		};
		//name="enum" id="value"  ng-options="enum for (value,enum) in transducer.e track by value"
		function Device(id) {
			this.id = id;
			this.user = User;
			this.references = {};
			this.references.children = {};
			this.references.parents = {};
			this.references.others = {};
			this.interfaces = {};
			this.children = [];

		};
		Device.prototype = {
			_handleIqError: function(iq, deferred) {
				var error = iq.getElementsByTagName('error');
				var error_code = error[0].getAttribute('code');
				var error_type = error[0].getAttribute('type');
				var error_msg = error[0].childNodes[0].tagName;
				deferred.reject("Error Code: " + error_code +
					" ,Type: " + error_type + ", Message: " + error_msg);
			},
			/* Stanza generation functions */
			_processRef: function(ref) {
				return {
					name: ref.name,
					node: ref.id,
					metaType: ref.metaType
				};
			},
			_getTransducerStanza: function(transducer) {
				var transducerStanza = $build('transducer', {
					name: transducer.name,
				});
				if (typeof transducer.max != 'undefined') {
					transducerStanza.attr({
						maxValue: transducer.max
					});
				}
				if (typeof transducer.min != 'undefined') {
					transducerStanza.attr({
						minValue: transducer.min
					});
				}
				if (typeof transducer.min != 'undefined') {
					transducerStanza.attr({
						min: transducer.min
					});
				}
				if (typeof transducer.unit != 'undefined') {
					transducerStanza.attr({
						unit: transducer.unit
					});
				}
				if (typeof transducer.type != 'undefined') {
					transducerStanza.attr({
						type: transducer.type
					});
				}
				for (propIndex in transducer.properties) {
					if ($self.properties.hasOwnProperty(property_key)) {
						property = {
							name: propertyIndex,
							value: transducer.properties[propertyIndex]
						};
						transducerStana.c('property', property).up();
					}
				}
				if (typeof transducer.e != 'undefined') {
					for (enumIndex = 0; enumIndex < transducer.e.length; enumIndex++) {
						var e = transducer.e[enumIndex];
						var property = {
							name: e,
							value: enum_index
						};
						transducerStana.c('map', property).up();
					}
				}
				return transducerStanza.up();
			},
			_parseTransducer: function(stanza) {
				return Transducer.constructTransducer(stanza);
			},
			/* Stanza Builder to build reference stanza from this.references */
			_getReferencesStanza: function() {
				var referenceStanza = $build('references', {});
				var ref_index, ref;

				for (ref_key in this.references.children) {
					ref = this._processRef(this.references.children[ref_key]);
					ref.type = 'child';
					referenceStanza.c('reference', ref).up();
				}
				for (ref_key in this.references.parents) {
					ref = this._processRef(this.references.parents[ref_key]);
					ref.type = 'parent';
					referenceStanza.c('reference', ref).up();
				}
				for (ref_key in this.references.others) {
					ref = this._processRef(this.references.others[ref_key]);
					ref.type = 'other';
					referenceStanza.c('reference', ref).up();
				}
				return referenceStanza.up();
			},
			/*build Data Stanza for given transducer and command
			 * @param string transducer name to publish data to
			 * @param object command to send transducer.
			 */
			_getDataStanza: function(transducer, value) {
				var dataStanza = $build('transducerSetData', {});
				var d_index, data;
				dataStanza.attrs({
					name: transducer.name,
					value: value,
					timestamp: ""
				});
				return dataStanza.up();
			},
			_transducersArray: function() {
				Object.keys(this.transducers).map(function(key) {
					return this.transducers[key];
				});
			},
			/*build meta stanza for this event node 
			 */
			_getMetaStanza: function() {
				$self = this;
				var metaStanza = $build('meta', {});
				if (typeof $self.name != 'undefined') {
					metaStanza.attrs({
						name: $self.name
					});
				}
				if (typeof $self.type != 'undefined') {
					metaStanza.attrs({
						type: $self.type
					});
				}
				if (typeof $self.info != 'undefined') {
					metaStanza.attrs({
						info: $self.info
					});
				}
				//metaStanza.attrs({timestamp: });
				if (typeof $self.properties != 'undefined') {
					for (propIndex in $self.properties) {
						if ($self.properties.hasOwnProperty(propIndex)) {
							property = {
								name: propIndex,
								value: $self.properties[propIndex]
							};
							metaStanza.c('property', property).up();
						}
					}
				}
				if (typeof $self.transducers != 'undefined') {
					for (transducer_key in $self.transducers) {
						metaStanza.c('transducer',
							$self.transducers[transducer_key]).up();
					}
				}
				if (typeof $self.geolocation != 'undefined') {}
				return metaStanza.up();
			},

			/* Parses data from the items stanza
			 * @param items contain the data items for this device's transducers
			 */
			_parseData: function(items) {
				var data_index;
				var data;
				var data_node, name, tvalue, ttimestamp;
				var n_data = items[0].childNodes.length;

				if (typeof this.data == 'undefined') {
					data = [];
				} else
					data = this.data;
				for (data_index = 0; data_index < n_data; data_index++) {
					data_node = items[0].childNodes[data_index];
					name = data_node.getAttribute('id');
					if (name[0] != '_') continue;
					name = name.substr(1);
					tvalue = data_node.childNodes[0].getAttribute('value');
					ttimestamp = data_node.childNodes[0].getAttribute('timestamp');
					data[name] = {
						value: tvalue,
						timestamp: ttimestamp
					};
				}
				return data;
			},
			_parseGeolocation: function(stanza) {

			},
			/* Parses meta stanza into this devices meta data 
			 * @param Element Meta item element*/
			_parseMetaItem: function(metaItem) {
				var $self = this;
				if (typeof $self.timestamp != 'undefined' &&
					typeof metaItem.childNodes[0].getAttribute('timestamp') != 'undefined' &&
					metaItem.childNodes[0].getAttribute('timestamp') == $self.timestamp) {
					return;
				}
				if (typeof metaItem.childNodes[0].getAttribute('type') != 'undefined')
					$self.type = $self.type == metaItem.childNodes[0].getAttribute('type') ?
					$self.type : metaItem.childNodes[0].getAttribute('type');
				if (typeof metaItem.childNodes[0].getAttribute('name') != 'undefined') {
					$self.name = $self.name == metaItem.childNodes[0].getAttribute('name') ?
						$self.name : metaItem.childNodes[0].getAttribute('name');
				}
				if (typeof metaItem.childNodes[0].getAttribute('info') != 'undefined') {
					$self.info = $self.info == metaItem.childNodes[0].getAttribute('info') ?
						$self.name : metaItem.childNodes[0].getAttribute('info');
				}
				if (typeof metaItem.childNodes[0].getAttribute('timestamp') != 'undefined') {
					$self.timestamp = $self.timestamp == metaItem.childNodes[0].getAttribute('timestamp') ?
						$self.timestamp : metaItem.childNodes[0].getAttribute('timestamp');
				}
				var nodes = metaItem.childNodes[0].childNodes;
				var node, key, value, tran;
				$self.properties = {};
				$self.transducers = {};
				for (child_index = 0; child_index < nodes.length; child_index++) {
					node = nodes[child_index];
					if (node.tagName == 'property') {
						key = node.getAttribute('name');
						value = node.getAttribute('value');
						if (typeof $self.properties[key] == 'undefined' || $self.properties[key] != value) {
							$self.properties[key] = value;
						}
					} else if (node.tagName == 'transducer') {
						tran = $self._parseTransducer(node);
						if (typeof $self.transducers[tran.name] == 'undefined') {
							$self.transducers[tran.name] = tran;
						}
					} else if (node.tagName == 'geolocation') {
						$self.geolocation = $self.parseGeolocation(node);
					} else if (node.tagName == 'interface') {
						$self.interfaces[node.getAttribute('name')] = true;
					}
				}
			},
			_contains: function(str, strarr) {
				for (i = 0; i < strarr.length; i++) {
					if (str == strarr[i])
						return true;
				}
			},
			_parseReferenceItem: function(referenceItem) {
				var references;
				$self = this;
				if (typeof this.references == 'undefined') {
					this.references = {};
					this.references.children = {};
					this.references.parents = {};
					this.references.others = {};
				}
				references = this.references;
				var nodes = referenceItem.childNodes;
				var node, nodeid, type, metaType, name;
				var reference;
				if (typeof $self.children == 'undefined')
					$self.children = [];
				for (child_index = 0; child_index < nodes.length; child_index++) {
					node = nodes[child_index];
					name = node.getAttribute('name');
					metaType = node.getAttribute('metaType');
					nodeid = node.getAttribute('node');
					type = node.getAttribute('type');
					reference = {
						type: metaType,
						relation: type,
						node: nodeid,
						id: nodeid,
						name: name,
						label: name,
						metaType: metaType,
						children: []
					};
					if (DeviceService.references[nodeid] == 'undefined') {
						DeviceService.references[nodeid] = reference;
					}
					if (type == 'child') {
						if (typeof references.children[nodeid] == 'undefined') {
							references.children[nodeid] = reference;
							$self.children.push(reference.id);
						}
					} else if (type == 'parent')
						if (typeof references.parents[nodeid] == 'undefined') {
							references.parents[nodeid] = reference;
						} else {
							if (typeof references.others[nodeid] == 'undefined') {
								references.others[nodeid] = reference;
							}
						}
				}
			},
			contains: function(arr, elem) {
				for (i in arr) {
					if (arr[i] == elem) {
						return true;
					}
				}
				return false;

			},
			_parseStorageItem: function(storageItem) {
				var storage;
				if (typeof this.storage == 'undefined') {
					storage = [];
				} else {
					storage = this.storage;
				}

				var addressesItem = storageItem.childNodes[0];
				var nodes = addressesItem.childNodes;
				var address, node, key;

				for (child_index = 0; child_index < nodes.length; child_index++) {
					node = nodes[child_index];
					address = node.getAttribute('link');
					key = node.getAttribute('key');
					if (!self._contains(storage, address)) {
						storage.push({
							address: address,
							key: key
						});
					}
				}
				return storage;
			},
			init: function() {
				var $self = this;
				var deferred = $q.defer();
				if (typeof $self.id == 'undefined' || $self.id == '') {
					deferred.reject("Invalid Event Id");
					return deferred.promise;
				}
				if (typeof $self.user.connection == 'undefined' ||
					!$self.user.connection.connected) {
					deferred.reject("User not connected");
					return deferred.promise;
				}
				$self.user.connection.pubsub.items($self.id,
					function(stanza) {
						var items = stanza.getElementsByTagName('items');
						var child, child_index, id;
						var t_values = [];
						var n_items = items[0].childElementCount;
						for (child_index = 0; child_index < n_items; child_index++) {
							child = items[0].childNodes[child_index];
							id = child.getAttribute('id');
							if (id == 'meta') {
								$self._parseMetaItem(child);
							} else if (id == 'references') {
								$self._parseReferenceItem(child.childNodes[0]);
							} else if (id == 'storage') {
								$self.storage = $self._parseStorageItem(child);
							} else if (id[0] == '_') {
								continue;
							}
						}
						$self.data = $self._parseData(items);
						deferred.resolve($self);
					},
					function(error) {
						deferred.reject(error);
					}, 1000000);
				return deferred.promise;
			},
			configFormat: function(config) { 
				var configFormatted = {};
				var arrLen = config.length-1;
				var confIndex;
				var confHold;
				for (confIndex = 0;confIndex<arrLen;confIndex++) {
					confHold = config[confIndex];
					console.log(configIndex);
					console.log(confHold);
					configFormatted[confHold['var']] = confHold['value'];
				}
				console.log(config);
				console.log("COnfig formatted");
				console.log(configFormatted);
				return configFormatted

			},
			create: function(config) {
				var $self = this;
				var deferred = $q.defer();
				$self.children = [];
				if (typeof $self.references == 'undefined') {
					$self.references = {
						children: {},
						parents: {},
						others: {}
					};
				}
				console.log(config);

				User.connection.pubsub.createNode(
					$self.id, $self.configFormat(config),
					function(result) {
						var type = result.getAttribute('type');
						if (type == 'result') {
							var metaStanza = $self._getMetaStanza();
							DeviceService.references[$self.id] = $self;
							DeviceService.devices[$self.id] = $self;
							Mio.publishItems([{
								attrs: {
									id: 'meta'
								},
								data: metaStanza.tree()
							}], deferred, $self.id);
						} else if (type == 'error') {
							$self._handleIqError(result, deferred);
							deferred.reject(result);
						} else {
							deferred.reject("Could not create device" + result);
						}
					}
				);
				return deferred.promise;
			},
			getMeta: function() {
				var $self = this;
				var deferred = $q.defer();
				Mio.item($self.id, ["meta"], function(stanza) {
					var items = stanza.getElementsByTagName('items');

					if (items[0].childNodes.length == 0) {
						deferred.reject("Could not get meta item.");
						return;
					}
					var metaItem = items[0].childNodes[0];
					$self._parseMetaItem(metaItem);
					deferred.resolve(true);
				}, function(error) {
					deferred.reject(error);
				});
				return deferred.promise;
			},
			setMeta: function() {
				var metaStanza = this._getMetaStanza();
				var deferred = $q.defer();
				console.log(metaStanza);
				Mio.publishItems([{
						attrs: {
							id: "meta"
						},
						data: metaStanza.tree()
					}],
					deferred, this.id);
				return deferred.promise;
			},
			getData: function() {
				var $self = this;
				var deferred = $q.defer();
				var items = [];
				for (t_index = 0; t_index < Object.keys($self.transducers).length; t_index++)
					items.push("_" + Object.keys($self.transducers)[t_index]);

				if (items.length == 0) {
					deferred.reject("No transducers in meta data");
					return deferred.promise;
				}
				Mio.item($self.id, items, function(stanza) {
					var items = stanza.getElementsByTagName('items');
					if (items[0].childNodes.length == 0) {
						deferred.reject("No items retrievied");
						return;
					}
					$self.data = $self._parseData(items);
					deferred.resolve(true);
				}, function(error) {
					deferred.reject(error);
				});
				return deferred.promise;
			},
			hasTransducers: function() {
				if (typeof this.transducers == 'undefined')
					return false;
				if (this.transducers.length == 0)
					return false;
				return true;
			},
			getReferences: function() {
				var $self = this;
				var deferred = $q.defer();
				Mio.item($self.id, ["references"], function(stanza) {
					var items = stanza.getElementsByTagName('items');
					if (items[0].childNodes.length == 0) {
						if (typeof $self.references == 'undefined') {
							$self.references = {
								children: {},
								parents: {},
								others: {}
							};
						}
						deferred.resolve(true);
						return;
					}
					var referenceItem = items[0].childNodes[0];
					$self._parseReferenceItem(referenceItem);
					deferred.resolve(true);
				}, function(error) {
					deferred.reject(error);
				});
				return deferred.promise;
			},
			getStorage: function() {
				var $self = this;
				var deferred = $q.defer();
				Mio.item($self.id, ["storage"], function(stanza) {
					var items = stanza.getElementsByTagName('items');

					if (items[0].childNodes.length == 0) {
						deferred.reject("Could not get storage item.");
						return;
					}
					var storageItem = items[0].childNodes[0];
					$self.storage = $self._parseStorageItem(storageItem);
					deferred.resolve(true);
				}, function(error) {
					deferred.reject(error);
				});
				return deferred.promise;
			},
			startStorage: function(storage_jid) {
				var deferred = $q.defer();
				var $self = this;
				$self.user.connection.pubsub.setAffiliation(this.id, storage_jid, 'publisher',
					function(response) {
						var type = response.getAttribute('type');
						if (type == 'result') {
							deferred.resolve(true);
						} else if (type == 'error') {
							this._handleIqError(result, deferred);
						} else {
							deferred.reject("Could not set storage publisher");
						}
					});
				return deferred
			},
			actuate: function(transducer, command) {
				var $self = this;
				var deferred = $q.defer();
				data_stanza = $self._getDataStanza(transducer, command.value).tree();
				console.log(data_stanza);
				Mio.publishItems([{
						attrs: {
							id: '_' + transducer.name
						},
						data: data_stanza
					}],
					deferred, $self.id + '_act');
				return deferred.promise;
			},
			addReferences: function(references) {
				var $self = this;
				var deferred = $q.defer();
				var getRefPromise = $self.getReferences();
				if (references == null || references.length == 0) {
					deferred.resolve(true);
					deferred.promise;
				}


				getRefPromise.then(function(response) {
					var ref_index, type, ref;
					for (ref_index = 0; ref_index < references.length; ref_index++) {
						ref = references[ref_index];
						type = ref.type;
						if (type == 'child') {
							$self.references.children[ref.node] = ref;
						} else if (type == 'parent') {
							$self.references.parents[ref.node] = ref;
						} else {
							$self.references.others[ref.node] = ref;
						}
					}
					var datanode = $self._getReferencesStanza().tree();
					Mio.publishItems([{
						attrs: {
							id: 'references'
						},
						data: datanode
					}], deferred, $self.id);
				}, function(error) {
					deferred.reject("Could not retrieve references.");
				});
				return deferred.promise;
			},
			removeReferences: function(references) {
				var deferred = $q.defer;
				var $self = this;
				var getRefPromise;
				if (typeof $self.references == 'undefined') {
					getRefPromise = $self.getReferences();
				} else {
					var getRefDeferred = $q.defer();
					getRefDeferred.resolve(true);
					getRefPromise = getRefDeferred.promise;
				}
				getRefPromise.then(function(response) {
					var ref_index, type, ref;
					for (ref_index = 0; ref_index < references.length; ref_index++) {
						ref = references[ref_index];
						type = ref.type;
						if (type == 'child') {
							$self.references.children[ref.node] = '';
						} else if (type == 'parent') {
							$self.references.parents[ref.node] = '';
						} else {
							$self.references.others[ref.node] = '';
						}
					}
					var datanode = $self._getReferencesStanza().tree();
					Mio.publishItems([{
						attrs: {
							id: 'references'
						},
						data: datanode
					}], deferred, $self.id);
				}, function(error) {
					deferred.reject("Could not retrieve references.");
				});

				return deferred.promise;
			},
			getSubOptions: function() {
				var deferred = $q.defer();
				var $self = this;
				User.connection.pubsub.getSubscriptions($self.id, function(result) {
					var type = result.getAttribute('type');
					if (type == 'result') {
						var x = result.getElementsByTagName('x');
						$self.suboptions = {};
						for (childIndex = 0; childIndex < x.childNodes.length; childIndex++) {
							var child = result.childNodes[childIndex];
							var childType = child.getAttribte('type');
							$self.suboptions[child.getAttribute('var')] = {
								value: child.childNodes[0],
								type: childType
							};
						}
					} else if (type == 'errror') {
						$self._handleIqError(result, deferred);
					} else {
						deferred.reject("Could not delete node: " + result);
					}
				});
				return deferred.promise;
			},
			getSubscriptions: function() {
				var deferred = $q.defer();
				var $self = this;
				User.connection.pubsub.getNodeSubscriptions($self.id, function(result) {
					var type = result.getAttribute('type');
					if (type == 'result') {
						var subscriptions = result.getElementsByTagName('subscriptions');
						var jid, sub, subid;
						for (subIndex = 0; subIndex < subscriptions.length; subIndex++) {
							subscription = subscriptions.childNodes[subIndex];
							jid = subscription.getAttribute('jid');
							sub = subscription.getAttribute('subscription');
							subid = subscription.getAttribute('subid');
							this.subscriptions.push({
								jid: jid,
								subscription: sub,
								subid: subid
							});
						}
					} else if (type == 'error') {
						$self._handleIqError(result, deferred);
					} else {
						deferred.reject("Could not getNodeSubscriptions: " + result);
					}
				});
			},
			getAffiliations: function() {
				var deferred = $q.defer();
				var $self = this;
				User.connection.pubsub.getAffiliations($self.id, function(result) {
					var type = result.getAttribute('type');
					if (type == 'result') {
						var affiliations = result.getElementsByTagName('affiliations');
						this.affiliations = {};
						this.affiliations.owner = [];
						this.affiliations.publisher = [];
						this.affiliations.outcast = [];

						for (affilIndex = 0; affilIndex < affiliations[0].childNodes.length; affilIndex++) {
							var affiliation = affiliations[0].childNodes[affilIndex];
							var affilType = affiliation.getAttribute('affiliation');
							var jid = affiliation.getAttribute('jid');
							if (typeof $self.affiliations == 'undefined') {
								$self.affiliations = {};
							}
							if (typeof $self.affiliations[affilType] == 'undefined') {
								$self.affiliations[affilType] = [];
							}
							if (!$self._contains(jid, $self.affiliations[affilType])) {
								$self.affiliations[affilType].push(jid);
							}
						}
						deferred.resolve(true);
					} else if (type == 'error') {
						$self._handleIqError(result, deferred);
					} else {
						deferred.reject("Could not get node affiliations: " + result);
					}
				});
				return deferred.promise;
			},
			addAffiliation: function(jid, affiliation) {
				var deferred = $q.defer();
				var $self = this;
				User.connection.pubsub.setAffiliation($self.id, jid, affiliation,
					function(result) {
						var type = result.getAttribute('type');
						if (type == 'result') {
							deferred.resolve(true);
						} else if (type == 'error') {
							$self._handleIqError(result, deferred);
						} else {
							deferred.reject("Could not set affiliation");
						}
					});
				return deferred.promise;
			},
			removeAffiliation: function(jid) {
				return this.addAffiliation(jid, "none");
			},
			getChildByName: function(name) {
				for (childIndex in this.folders) {
					child = this.folders[childIndex];
					if (child.name == name || child.label == name) {
						console.log(child);
						return child;
					}
				}
				return null;
			},
			getConfig: function(defaultConfig) {
				defaultConfig = typeof defaultConfig == 'undefined' ? true : defaultConfig;
				var $self = this;
				var deferred = $q.defer();
				if (defaultConfig) {
					User.connection.pubsub.getDefaultNodeConfig(function(result) {
						var type = result.getAttribute('type');
						if (type == 'result') {
							var x = result.getElementsByTagName('x');
							$self.config = [];
							for (configIndex = 0; configIndex < x[0].childNodes.length; configIndex++) {
								var field = x[0].childNodes[configIndex];
								var v = field.getAttribute('var');
								var conftype = field.getAttribute('type');
								var label = field.getAttribute('label');
								var value;
								if (field.childNodes.length > 0) {
									value = field.childNodes[0].textContent;
								} else {
									value = "";
								}

								$self.config.push({
									var: v,
									type: conftype,
									label: label,
									value: value
								});
							}
							deferred.resolve(true);
						} else if (type == 'errror') {
							$self._handleIqError(result, deferred);
						} else {
							deferred.reject("Could not get config: " + result);
						}
					});

				} else {
					User.connection.pubsub.getConfig($self.id, function(result) {
						var type = result.getAttribute('type');
						if (type == 'result') {
							var x = result.getElementsByTagName('x');
							$self.config = {};
							for (configIndex = 0; configIndex < x[0].childNodes.length; configIndex++) {
								var field = x[0].childNodes[configIndex];
								var v = field.getAttribute('var');
								var conftype = field.getAttribute('type');
								var label = field.getAttribute('label');
								var value = field.childNodes[0].toString();
								$self.config[v] = {
									var: v,
									type: conftype,
									label: label,
									value: value,
									var: v
								};
							}
							deferred.resolve(true);
						} else if (type == 'errror') {
							$self._handleIqError(result, deferred);
						} else {
							deferred.reject("Could not get config: " + result);
						}
					});
				}
				return deferred.promise;
			},
			setConfig: function() {

			},
			deleteNode: function() {
				var deferred = $q.defer();
				var $self = this;
				User.connection.pubsub.deleteNode($self.id, function(result) {
					var type = result.getAttribute('type');
					if (type == 'result') {
						deferred.resolve(true);
					} else if (type == 'error') {
						$self._handleIqError(result, deferred);
					} else {
						deferred.reject("Could not delete node: " + result);
					}
				});
				return deferred;
			},
			saveFile: function() {},
			subscribe: function() {
				var deferred = $q.defer();
				var $self = this;
				User.connection.pubsub.subscribe($self.id, function(result) {
					var type = result.getAttribute('type');
					if (type == 'result') {
						deferred.resolve(true);
					} else if (type == 'error') {
						this._handleIqError(result, deferred);
					} else {
						deferred.reject("Could not delete node: " + result);
					}
				});
				return deferred;
			},
			unsubscribe: function() {
				var deferred = $q.defer();
				var $self = this;
				User.connection.pubsub.unsubscribe($self.id, function(result) {
					var type = result.getAttribute('type');
					if (type == 'result') {
						deferred.resolve(true);
					} else if (type == 'error') {
						this._handleIqError(result, deferred);
					} else {
						deferred.reject("Could not delete node: " + result);
					}
				});
				return deferred;
			},
			save: function(isRootOrFavorite, selectedId) {
				var deferred = $q.defer();
				deferred.reject("In place");
				return deferred.promise;
			}
		};
		/**
		 * [constructDevice description]
		 * @param  {[type]} json [description]
		 * @return {[type]}      [description]
		 */
		DeviceService.constructDevice = function(id, initialize) {
			var device;
			var devices = DeviceService.devices;
			var toLoad = false;
			if (typeof id == 'undefined' || id == '') {
				if (initialize) {
					var deferred = $q.defer();
					deferred.reject("bad id");
					return deferred.promise;
				} else {
					return null;
				}
			}
			if (typeof devices[id] == 'undefined') {
				if (initialize == false) {
					device = new Device(id);
					device.loaded = false;
				} else {
					device = new Device(id);
					device.loaded = false;
					loaded_device = true;
				}
			} else {
				device = devices[id];
				device.loaded = true;
			}
			if (initialize) {
				var deferred = $q.defer();
				device.init().then(function(result) {
					if (loaded_device) {
						device.folders = device.references.children;
						devices[id] = device;
						if (typeof DeviceService.objFolder === 'undefined') {
							DeviceService.objFolder = device;
						}
					} else {
						DeviceService.references[device.id] = device;
					}
					deferred.resolve(device);
				}, function(error) {
					deferred.reject(error);
				});
				return deferred.promise;
			}
			return device;
		};
		return DeviceService;
	});
})();
