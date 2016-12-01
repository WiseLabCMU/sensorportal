(function() {
    /**
     * MortarUser services
     */
    var app = angular.module('mortar-roster-services', ['xml-rpc', 'user-services', 'mio-services']);
    //,'rt.timeout'
    app.factory('MortarRoster', function($http, $q, User, xmlrpc, $timeout, MortarUser) {

       var rpcCommand = function(command, args) {
            return xmlrpc.callMethod(command, args);
        };

	var MortarRoster = function() {
		var deferred = $q.defer();
		User.connection.roster.get(function(result) { 
			console.log(result);
			var type = result.getAttribute('type');
			if (type == 'result') { 
				this.roster = result.getElementsByTagName('roster');
			} else {
				deferred.reject(result);
			}
		});
		return deferred.promise;

        };

	MortarRoster.prototype = {
		addUser: function(jid, name, groups) { 
			var deferred = $q.defer();
			User.connection.roster.add(jid, name, groups, 
			function(result) { 
				if (type == 'result') { 
					deferred.resolve(true);
				} else { 
					deferred.reject(result);
				}
			});
			return deferred.promise;
		}, 
		removeUser: function(jid) { 
			var deferred = $q.defer();
			User.connection.roster.add(jid, name, groups, 
			function(result) { 
				if (type == 'result') { 
					deferred.resolve(true);
				} else { 
					deferred.reject(result);
				}
			});
			return deferred.promise;
		},
		updateUser: function(jid,name,groups) {
			var deferred = $q.defer();
			User.connection.roster.update(jid,name,groups, 
				function(result) { 
					var type = result.getAttribute('type');
					if (type == 'result') { 
						deferred.resolve(true);
					} else { 
						deferred.reject(result);
					}
				});
			return deferred.promise;
		},
		getMembers: function() { 
			var deferred = $q.defer();
    			User.connection.roster.get(function(result) { 
    				console.log(result);
    				var type = result.getAttribute('type');
    				if (type == 'result') { 
    					this.roster = result.getElementsByTagName('roster');
    				} else {
    					deferred.reject(result);
    				}
    			});
			return deferred.promise;
		}, 
		subscribePresence: function(jid,message,nick) { 
			User.connection.roster.subscribe(jid,message,nick);
		},
		unSubscribePresence: function(jid,message) { 
			User.connection.roster.unsubscribe(jid,message);
		},
		authorizeSubscribePresence: function(jid) { 
			User.connection.roster.authorize(jid);
		},
		unAuthorizeSubscribePresence: function(jid) { 
			User.connection.roster.authorize(jid);
		}
        };

	var MortarSharedRoster = function(group, grouphost) {
		this.group = group;
		this.host = grouphost;
        };

	MortarSharedRoster.prototype = {
		addUser: function(user, host) { 
			var command = "srg_user_add";
			var deferred = $q.defer();
			var args = [{ 
				user: User.connection.authcid,
				server: User.connection.domain,
				password: User.connection.pass,
			}, {
				user: user, 
				host: host, 
				group: this.group, 
				grouphost: this.grouphost
			}];
                	var rpcpromise = rpcCommand(command, args);

			rpcpromise.then(function(result) { 
				this.users.append({user:user, host:host});
				deferred.resolve(resolve);
			}, function(error) { 
				deferred.reject(error);
			});
			return deferred.promise;
		}, 
		removeUser: function(user, host) { 
			var command = "srg_user_add";
			var deferred = $q.defer();
			var $self = this;
			var args = [{ 
				user: User.connection.authcid,
				server: User.connection.domain,
				password: User.connection.pass,
			}, {
				user: user, 
				host: host, 
				group: this.group, 
				grouphost: this.grouphost
			}];
                	var rpcpromise = rpcCommand(command, args);
			rpcpromise.then(function(result) { 
				$self.users = $.grep($self.users, function(a) { return 
				a.user != user || a.host != host});
				deferred.accept(result);
			}, function(error) { 
				deferred.reject(error);
			});
			return deferred.promise;
		},
		delete: function() { 
			var command = "srg_delete";
			var args = [{ 
				user: User.connection.authcid,
				server: User.connection.domain,
				password: User.connection.pass,
			}, {
				group: this.group, 
				grouphost: this.host
			}];
                	var rpcpromise = rpcCommand(command, args);
			return rpcpromise;
		}, 
		getMembers: function() { 
			var command = "srg_get_members";
			var deferred = $q.defer();
			var $self = this;
			var args = [{ 
				user: User.connection.authcid,
				server: User.connection.domain,
				password: User.connection.pass,
			}, {
				group: this.group, 
				host: this.host
			}];
                	var rpcpromise = rpcCommand(command, args).then(function(result) { 
				$self.members = {};
				console.log(result);
				for (memberIndex in result.members) { 
					var member = result.members[memberIndex].member;
					//var atIndex = member.indexOf('@');
					//var memberUser = member.slice(0,atIndex);
					//var memberHost = member.slice(atIndex+1);
					MortarUser.get(member).then(function(user) {
						$self.members[user.username] = user;
					}, function(error) {
						console.log(error);
					});
				}
				deferred.resolve(result);
			}, function(error) { 
				deferred.reject(error);
			});
			return deferred.promise;
		}
        };
        var MortarRosterFactory = {
		getRoster: function() { 
			return new MortarRoster();
		},
		createSharedRoster: function(group, grouphost, description,
					    displayGroup) {
			var command = "srg_create";
			var args = [{ 
				user: User.connection.authcid,
				server: User.connection.domain,
				password: User.connection.pass
			}, {
				group: group, 
				host: grouphost,
				name: group, 
				description: description,
				display: displayGroup? 1 : 0
			}];
			console.log(args);
                	var rpcpromise = rpcCommand(command, args);
			return rpcpromise;
		}, 
		getSharedRoster: function(group, grouphost) { 
			var command = "srg_get";
			var args = [{ 
				user: User.connection.authcid,
				server: User.connection.domain,
				password: User.connection.pass,
			}, {
				group: group, 
				grouphost: grouphost
			}];
                	var rpcpromise = rpcCommand(command, args);
			return rpcpromise;
		},
		listSharedRosters: function(host) { 
			var command = "srg_list";
			var deferred = $q.defer();
			var args = [{ 
				user: User.connection.authcid,
				server: User.connection.domain,
				password: User.connection.pass
			}, {
				host: host
			}];
                	var rpcpromise = rpcCommand(command, args);
			rpcpromise.then( 
			function(result) { 
				console.log(result);
				if (typeof this.groups == 'undefined') { 
					this.groups = {};
				}
				this.groups[host] = {};
				for (groupIndex in result.groups) { 
					var group = result.groups[groupIndex];
					var sharedGroup = new MortarSharedRoster(group.id,host);
					groups[host][group.id] = sharedGroup;
				}
				deferred.resolve(groups);
			}, function(error) { 
				deferred.reject(error);
			});
			return deferred.promise;
		},
		deleteSharedRoster: function(group, grouphost) {
			var command = "srg_delete";
			var args = [{ 
				user: User.connection.authcid,
				server: User.connection.domain,
				password: User.connection.pass
			}, {
				group: group,
				host: grouphost
			}];
                	var rpcpromise = rpcCommand(command, args);
			return rpcpromise;
		},
		supportVersioning() { 
			return User.connection.roster.supportVersioning();
		},
	};
        return MortarRosterFactory;
    });
})();
