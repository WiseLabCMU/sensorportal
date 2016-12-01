(function() {
    var app = angular.module('mortar-app', ['ui.router', 'mortar-app-modules', 
			     'alert-handler']);
    /**
     * Configures the apps routes
     * @param  object $stateProvider     ui-router service
     * @param  object $urlRouterProvider ui-router service
     */
    app.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login/');
        $stateProvider.
        state('login', {
            url: '/login/',
            templateUrl: '/components/login/login/login.html',
	    controller: 'LoginCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('login.register', {
            url: '/login/register',
            onEnter: function($state, $modal, $stateParams) {
                $modal.open({
                    templateUrl: '/components/login/register/register.html',
                    controller: 'UserRegisterCtrl',
                }).result.then(function(result) {
                    if (result) {
                        // todo: once registered go to device list
                        return $state.go('login');
                    }
                }, function() {
                    return $state.go('login');
                });
            },
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device', {
            url: '/device',
            templateUrl: '/components/browser/dashboard.html',
            controller: 'BrowserCtrl',
            abstract: true
        }).
        state('device.list', {
            url: '/list/?folder',
            templateUrl: '/components/folder/folderView/folderView.html',
            controller: 'FolderViewCtrl',
	    controllerAs: 'devList',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.list.edit', {
            url: '/edit/?isUpdate',
            onEnter: function($state, $modal, $stateParams) {
                $modal.open({
                    templateUrl: '/components/folder/folderEdit/folderEdit.html',
                    controller: 'FolderEditCtrl',
                }).result.then(function(result) {
                    if (result) {
                        return $state.go('device.list', {
                            folder: $stateParams['folder'],
                        });
                    }
                }, function() {
                    return $state.go('device.list', {
                        folder: $stateParams['folder']
                    });
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('device.list.favorites', {
            url: '/favorites/',
            onEnter: function($state, $stateParams, $modal) {
		$stateParams.id = $stateParams.folder;
                $modal.open({
                    templateUrl: '/components/nodeServices/referenceAdd/referenceAdd.html',
                    controller: 'ReferenceAddCtrl',
                }).result.then(function(result) {
                    return $state.go('device.list', {
                        folder: $stateParams['folder']
                    });
                }, function() {
                    return $state.go('device.list', {
                        folder: $stateParams['folder']
                    });
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('device.list.delete', {
            url: '/delete/?id?parent',
            onEnter: function($state, $stateParams, $modal) {
                $modal.open({
                    templateUrl: '/controllers/nodeServices/delete/nodeDelete.html',
                    controller: 'DeviceDeleteCtrl'
                }).result.then(function(result) {
                    return $state.transitionTo('device.list', {
                        folder: $stateParams['parent']
                    });
                }, function() {
                    return $state.transitionTo('device.list', {
                        folder: $stateParams['id']
                    });
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('device.list.permissions', {
            url: '/permissions/?id?isFolder',
            onEnter: function($state, $modal, $stateParams) {
                $modal.open({
                    templateUrl: '/components/nodeServices/permissions/permissions.html',
                    controller: 'PermissionsCtrl',
                    controllerAs: 'dspc'
                }).result.then(function(result) {
                    if (result) {
                        if (typeof $stateParams['isFolder'] != 'undefined') {
                            return $state.go('device.list', {
                                folder: $stateParams['id']
                            });
                        }
                        return $state.go('device.view.detail', {
                            id: $stateParams['id']
                        });
                    }
                }, function() {
                    if (typeof $stateParams['isFolder'] != 'undefined') {
                        return $state.go('device.list', {
                            folder: $stateParams['id']
                        });
                    }
                    return $state.go('device.view.detail', {
                        id: $stateParams['id']
                    });
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('device.list.map', {
            url: '/map/?folder',
            templateUrl: '/components/folder/folderMap/folderMap.html',
            controller: 'FolderMapCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.view', {
            url: '/?id',
            templateUrl: 'components/device/deviceView/deviceView.html',
            controller: 'DeviceCtrl',
            abstract: true
        }).
        state('device.view.edit', {
            url: '/edit',
            onEnter: function($state, $modal, $stateParams) {
                $modal.open({
                    templateUrl: 'components/device/deviceEdit/deviceEdit.html',
                    controller: 'DeviceEditCtrl',
                    //controllerAs: 'DeviceModal',
                }).result.then(function(result) {
                    if (result) {
                        return $state.go('device.view.detail', {
                            id: $stateParams['id']
                        });
                    }
                }, function() {
                    return $state.go('device.view.detail', {
                        id: $stateParams['id']
                    });
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('device.view.detail', {
            url: '',
            templateUrl: '/components/device/deviceDetail/deviceDetail.html',
            controller: 'DeviceViewCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.view.map', {
            url: '/map',
            templateUrl: '/components/device/deviceMap/deviceMap.html',
            controller: 'DeviceMapCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.view.transducers', {
            url: '/transducers',
            templateUrl: '/components/device/deviceTransducers/deviceTransducers.html',
            controller: 'DeviceTransducersCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.view.timeseries', {
            url: '/timeseries',
            templateUrl: '/components/device/deviceTimeseries/deviceTimeseries.html',
            controller: 'DeviceTimeseriesCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.view.delete', {
            url: '/delete/?parent',
            onEnter: function($state, $stateParams, $modal) {
                $modal.open({
                    templateUrl: '/components/nodeServices/delete/nodeDelete.html',
                    controller: 'NodeDeleteCtrl'
                }).result.then(function(result) {
                    return $state.go('device.list', {
                        folder: $stateParams['parent']
                    });
                }, function() {
                    return $state.go('device.view.detail', {
                        folder: $stateParams['id']
                    });
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('device.view.functions', {
            url: '/functions',
            templateUrl: '/components/device/deviceActuate/deviceActuate.html',
            controller: 'DeviceActuateCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.view.favorites', {
            url: '/favorites/',
            onEnter: function($state, $stateParams, $modal) {
                $modal.open({
                    templateUrl: '/components/nodeServices/referenceAdd/referenceAdd.html',
                    controller: 'ReferenceAddCtrl',
                    data: {
                		folder: $stateParams['id']
                		}
                }).result.then(function(result) {
                    if (result) {
                        return $state.go('device.view.detail', {
                            id: $stateParams['id']
                        });
                    }
                }, function() {
                    return $state.go('device.view.detail', {
                        id: $stateParams['id']
                    });
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('device.view.permissions', {
            url: '/permissions/?id?isFolder',
            onEnter: function($state, $modal, $stateParams) {
                $modal.open({
                    templateUrl: '/components/nodeServices/permissions/permissions.html',
                    controller: 'PermissionsCtrl',
                    controllerAs: 'dspc'
                }).result.then(function(result) {
                    if (result) {
                        if (typeof $stateParams['isFolder'] != 'undefined') {
                            return $state.go('device.list', {
                                folder: $stateParams['id']
                            });
                        }
                        return $state.go('device.view.detail', {
                            id: $stateParams['id']
                        });
                    }
                }, function() {
                    if (typeof $stateParams['isFolder'] != 'undefined') {
                        return $state.go('device.list', {
                            folder: $stateParams['id']
                        });
                    }
                    return $state.go('device.view.detail', {
                        id: $stateParams['id']
                    });
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('devicecreate', {
            url: '/devicecreate',
            templateUrl: '/components/register/create/create.html',
            controller: 'CreateCtrl',
            isAbstract: true
        }).
        state('devicecreate.select', {
            url: '/devicecreate/select',
            templateUrl: '/components/register/createSelectType/createSelect.html',
            controller: 'CreateSelectCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.templateselect', {
            url: '/devicecreate/template/?type',
            templateUrl: '/components/register/createSelectTemplate/createSelectTemplate.html',
            controller: 'CreateSelectTemplateCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.templatespecify', {
            url: '/devicecreate/templatespecify',
            templateUrl: '/components/register/createTemplate/createTemplate.html',
            controller: 'CreateTemplateCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.templatetype', {
            url: '/devicecreate/templatetype',
            templateUrl: '/components/register/createSelectType/selectType.html',
            controller: 'CreateTemplateTypeCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.config', {
            url: '/devicecreate/config/?templateId?type?uuid',
            templateUrl: '/components/register/createConfig/createConfig.html',
            controller: 'CreateConfigCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.edit', {
            url: '/devicecreate/edit/?templateId?deviceId?type',
            templateUrl: '/components/register/createEdit/createEdit.html',
            controller: 'CreateEditCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.references', {
            url: '/devicecreate/references/?id?type',
            templateUrl: '/components/register/createReferences/createReferences.html',
            controller: 'CreateReferencesCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.permissions', {
            url: '/devicecreate/permissions/?id',
            templateUrl: '/components/register/createPermissions/createPermissions.html',
            controller: 'CreatePermissionsCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('user', {
            url: '/user',
            templateUrl: '/components/user/user.html',
            abstract: true,
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('user.list', {
            url: '',
            templateUrl: '/components/user/userList/userList.html',
            controller: 'UsersCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('user.groups', {
            url: '/groups',
            templateUrl: '/components/user/aclList/aclList.html',
            controller: 'AclCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('user.groups.add', {
            url: '/add',
	    onEnter: function($state, $modal, $stateParams) {
                $modal.open({
                    controller: 'AddGroupCtrl as UGA',
                    templateUrl: '/components/user/addGroup/addGroup.html',
                    //controllerAs: 'UGA'
                }).result.then(function(result) {
                        return $state.go('user.groups', {});
                }, function() {
                        return $state.go('user.groups', {});
                    }
                );
                }}
	     ).
         state('user.groups.edit', {
            url: '/user/groups',
            templateUrl: '/components/user/addGroup/addGroup.html',
            controller: 'AddGroupCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('user.view', {
            url: '/?username',
            templateUrl: '/components/user/userView/userView.html',
            controller: 'UserViewCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('user.edit', {
            url: '/edit/?username?isEdit',
            onEnter: function($state, $stateParams, $modal, User, MortarUser) {
                $modal.open({
                    templateUrl: '/components/user/addEditUser/addEditUserModal.html',
                    controller: 'UserCreateEditCtrl',

                    resolve: {
                        username: function() {
                            return $stateParams.username;
                        }
                    }
                }).result.then(function(result) {
                    if (User.isAdmin()) {
                        return $state.go('user.list');
                    } else {
                        return $state.go('user.view', {
                            username: $stateParams.username
                        });
                    }
                }, function() {
                    MortarUser.user = {};
                    if (User.isAdmin()) {
                        return $state.go('user.list');
                    } else {
                        return $state.go('user.view', {
                            username: $stateParams.username
                        });
                    }
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('user.add', {
            url: '/add',

            onEnter: function($state, $modal) {
                $modal.open({
                    templateUrl: '/components/user/addEditUser/addEditUserModal.html',
                    controller: 'UserCreateEditCtrl',
		    
                    resolve: {
		        isEdit: function() { return false;},
                        username: function() {
                            return false;
                        }
                    }
                }).result.then(function(result) {
                    $state.transitionTo('user.list');
                }, function() {
                   $state.transitionTo('user.list');
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('user.init', {
            url: '/init/?username',
            onEnter: function($state, $stateParams, $modal, User, MortarUser) {
                $modal.open({
                    templateUrl: '/components/user/addEditUser/addEditUser.html',
                    controller: 'AddEditUserCtrl',
                    resolve: {
                        username: function() {
                            return $stateParams.username;
                        }
                    }
                }).result.then(function(result) {
                    return $state.go('device.list');
                }, function() {
                    MortarUser.user = {};
                    return $state.go('login');
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('recovery_password', {
            url: '/recovery_password/?user/?token',
            templateUrl: '/components/user//user-reset-password.html',
            controller: 'ResetUserPasswordController',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.removefolder', {
            url: ':device',
            onEnter: function($state, $stateParams, $modal) {
                $modal.open({
                    templateUrl: '/components/nodeServices/removeFolder/FolderRemoveModal.html',
                    controller: 'FolderRemoveCtrl'
                }).result.then(function(result) {
                    if (result) {
                        return $state.go('device.list');
                    }
                }, function() {
                    return $state.go('device.list');
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('device.addfolder', {
            url: ':device',
            onEnter: function($state, $stateParams, $modal) {
                $modal.open({
                    templateUrl: 'components/nodeServices/referenceAdd/referenceAdd.html',
                    controller: 'FolderEditCtrl'
                }).result.then(function(result) {
                    if (result) {
                        return $state.go('device.list');
                    }
                }, function() {
                    return $state.go('device.list');
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('device.editFolder', {
            url: '/edit/?folders',
            onEnter: function($state, $stateParams, $modal) {
                $modal.open({
                    templateUrl: 'components/folder/folderEdit/folderEdit.html',
                    controller: 'FolderModalCtrl',
                    resolve: {
                        fromModal: function() {
                            return false;
                        }
                    }
                }).result.then(function(result) {
                    if (result) {
                        return $state.go('device.list', {
                            folder: $stateParams['folders']
                        });
                    }
                }, function() {
                    return $state.go('device.list', {
                        folder: $stateParams['folders']
                    });
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        })
    });
    /**
     * Add listener to the stateChangeStart, handles logged
     * in user and authorized
     * @param  obj $rootScope   scope of the whole app
     * @param  service $state   ui router state service
     * @param  factory User     user model
     */
    app.run(function($rootScope, $state, User, Alert, $location, $window, Browser, Device) {
        $rootScope.triedSession = false;
        $rootScope.tryingSession = false;
        $rootScope.$on("$stateChangeStart", function(event, next, toParams, fromState) {
            if (typeof fromState.data != 'undefined' && !fromState.data.isModal) {
                Alert.close();
            }
            if (typeof fromState.data != 'undefined' && !fromState.data.isModal) {
                Alert.close();
            }
            if (!User.loggedIn) {
                $rootScope.sessionUser = JSON.parse($window.sessionStorage.getItem("User"));
                if (!$rootScope.triedSession && typeof $rootScope.sessionUser !=
                    'undefined' && $rootScope.sessionUser != null) {
                    $rootScope.triedSession = true;
                    $rootScope.tryingSession = true;
                    var loginFunction = function(result) {
                        if (typeof $rootScope.sessionUser == 'undefined') {
                            $rootScope.tryingSession = false;
                            return;
                        }
                        var sessionUser = JSON.parse($window.sessionStorage.getItem("User"));
                        User.login(sessionUser.username, sessionUser.password).then(function(result) {
                                var userInfoPost = User.getVcard();
                                var sessionState = JSON.parse($window.sessionStorage.getItem("State"));
                                Browser.children = [User.rootFolder, User.favoritesFolder];
                                userInfoPost.then(function(success) {
                                    Browser.init().then(function(result) {
                                        $rootScope.tryingSession = false;
                                        if (typeof sessionState != 'undefined' && sessionState.state != '') {
                                            $state.go(sessionState.state,
                                                sessionState.params);
                                        } else {
                                            $state.go('device.list', {
                                                folder: User.rootFolder
                                            });
                                        }
                                    }, function(result) {
                                        $rootScope.tryingSession = false;
                                    });
                                });
                            },
                            function(result) {
                                event.preventDefault();
                                angular.copy(next, User.state);
                                User.state.toParams = toParams;
                            });
                    };
                    event.preventDefault();
                    loginFunction();
                    $state.go('login');
                } else if (!$rootScope.tryingSession && next.name != "login" &&
                  next.name != 'recovery_password' && next.name !=
                  'login.register') {
                    $rootScope.triedSession = false;
                    $rootScope.tryingSession = false;
                    event.preventDefault();
                    Alert.open('warning', 'You need to be logged in');
                    $state.go('login');
                    return;
                }
            }
        });
        $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
            angular.copy(from.name, $rootScope.lastState);
            angular.copy(fromParams, $rootScope.lastParams);
            if (to.name != '' && to.name != '\/login' && to.name != 'login' && to.name != 'login.register' ) {
                $window.sessionStorage.setItem("State", JSON.stringify({
                    state: to.name,
                    params: toParams
                }));
            } else if (from.name != '' && from.name != '\/login' && from.name != 'login'
              && from.name != 'login.register') {
                $window.sessionStorage.setItem("State", JSON.stringify({
                    state: from.name,
                    params: fromParams
                }));
            }

        });
    });
})();
