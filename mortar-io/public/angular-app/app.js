(function() {
    var app = angular.module('mortar-app', ['ui.router', 'mortar-services',
        'mortar-controllers', 'mortar-directives', 'alert-handler'
    ]);
    /**
     * Configures the apps routes
     * @param  object $stateProvider     ui-router service
     * @param  object $urlRouterProvider ui-router service
     */
    app.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');
        $stateProvider.
        state('login', {
            url: '/login',
            templateUrl: '/angular-app/partials/login.html',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device', {
            url: '/device',
            templateUrl: '/angular-app/partials/dashboard.html',
            controller: 'BrowserCtrl',
            abstract: true
        }).
        state('device.list', {
            url: '/list/?folder',
            templateUrl: '/angular-app/partials/devicelist.html',
            controller: 'FolderViewCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.list.edit', {
            url: '/edit',
            onEnter: function($state, $modal, $stateParams) {
                $modal.open({
                    templateUrl: '/angular-app/partials/device-modal.html',
                    controller: 'FolderModalCtrl',
                }).result.then(function(result) {
                    if (result) {
                        return $state.go('device.list', {
                            folder: $stateParams['folder']
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
            url: '/favorites/?id',
            onEnter: function($state, $stateParams, $modal) {
                $modal.open({
                    templateUrl: '/angular-app/partials/device-favorites-modal.html',
                    controller: 'FolderFavoritesModalCtrl'
                }).result.then(function(result) {
                        return $state.go('device.list', {
                          folder: $stateParams['id']
                        });
                }, function() {
                    return $state.go('device.list', {
                        folder: $stateParams['id']
                    });
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('device.map', {
            url: '/map/:folder',
            templateUrl: '/angular-app/partials/device-map-list.html',
            controller: 'FolderMapCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.permissions', {
            url: '/permissions/?id?isFolder',
            onEnter: function($state, $modal, $stateParams) {
                $modal.open({
                    templateUrl: '/angular-app/partials/device-permissions.html',
                    controller: 'DeviceSetPermissionsCtrl',
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
        state('device.view', {
            url: '/:id',
            templateUrl: '/angular-app/partials/device-view.html',
            controller: 'DeviceCtrl',
            abstract: true
        }).
        state('device.view.edit', {
            url: '/edit/?id',
            onEnter: function($state, $modal, $stateParams) {
                $modal.open({
                    templateUrl: '/angular-app/partials/device-modal.html',
                    controller: 'DeviceModalCtrl',
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
            templateUrl: '/angular-app/partials/device-view-detail.html',
            controller: 'DeviceViewCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.view.map', {
            url: '/map',
            templateUrl: '/angular-app/partials/device-map.html',
            controller: 'DeviceDetailMapCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.view.transducers', {
            url: '/transducers',
            templateUrl: '/angular-app/partials/device-transducers.html',
            controller: 'DeviceTransducersCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.view.timeseries', {
            url: '/timeseries',
            templateUrl: '/angular-app/partials/device-timeseries.html',
            controller: 'DeviceTimeSeriesCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate', {
            url: '/devicecreate',
            templateUrl: '/angular-app/partials/devicecreate.html',
            controller: 'DeviceCreateCtrl',
            isAbstract: true
        }).
        state('devicecreate.select', {
            url: '/devicecreate/select',
            templateUrl: '/angular-app/partials/devicecreate-select.html',
            controller: 'DeviceCreateSelectCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.templateselect', {
            url: '/devicecreate/template/?type',
            templateUrl: '/angular-app/partials/devicecreate-templates.html',
            controller: 'DeviceCreateTemplateSelectCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.templatespecify', {
            url: '/devicecreate/templatespecify',
            templateUrl: '/angular-app/partials/devicecreate-templatespecify.html',
            controller: 'DeviceCreateTemplateSpecifyCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.templatefill', {
            url: '/devicecreate/templatefill',
            templateUrl: '/angular-app/partials/devicecreate-templatefill.html',
            controller: 'DeviceCreateTemplateFillCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.templatetype', {
            url: '/devicecreate/templatetype',
            templateUrl: '/angular-app/partials/devicecreate-templatetype.html',
            controller: 'DeviceCreateTemplateTypeCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.config', {
            url: '/devicecreate/config/?id?type?uuid',
            templateUrl: '/angular-app/partials/devicecreate-config.html',
            controller: 'DeviceCreateConfigCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.edit', {
            url: '/devicecreate/edit/?template?deviceid?type',
            templateUrl: '/angular-app/partials/devicecreate-edit.html',
            controller: 'DeviceCreateEditCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.references', {
            url: '/devicecreate/references/?id?type',
            templateUrl: '/angular-app/partials/devicecreate-references.html',
            controller: 'DeviceCreateReferencesCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('devicecreate.permissions', {
            url: '/devicecreate/permissions/?id',
            templateUrl: '/angular-app/partials/devicecreate-permissions.html',
            controller: 'DeviceCreatePermissionsCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.view.functions', {
            url: '/functions',
            templateUrl: '/angular-app/partials/device-functions.html',
            controller: 'DeviceFunctionsCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('device.view.favorites', {
            url: '/favorites/?id',
            onEnter: function($state, $stateParams, $modal) {
                $modal.open({
                    templateUrl: '/angular-app/partials/device-favorites-modal.html',
                    controller: 'DevFavoritesModalCtrl'
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
        state('user', {
            url: '/user',
            templateUrl: '/angular-app/partials/user.html',
            abstract: true,
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('user.list', {
            url: '',
            templateUrl: '/angular-app/partials/userList.html',
            controller: 'UsersCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('user.view', {
            url: '/?username',
            templateUrl: '/angular-app/partials/userDetail.html',
            controller: 'UserProfileCtrl',
            data: {
                groups: [],
                isModal: false
            }
        }).
        state('user.edit', {
            url: '/edit/:username',
            onEnter: function($state, $stateParams, $modal, User, MortarUser) {
                $modal.open({
                    templateUrl: 'angular-app/partials/addEditUserModal.html',
                    controller: 'UserCreateEditCtrl',
                    resolve: {
                        username: function() {
                            return $stateParams.username;
                        },
                        User: User
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
            url: '',
            onEnter: function($state, $modal) {
                $modal.open({
                    templateUrl: 'angular-app/partials/addEditUserModal.html',
                    controller: 'UserCreateEditCtrl',
                    resolve: {
                        username: function() {
                            return false;
                        }
                    }
                }).result.then(function(result) {
                    if (result) {
                        return $state.transitionTo('user.list');
                    }
                }, function() {
                    return $state.transitionTo('user.list');
                });
            },
            data: {
                groups: [],
                isModal: true
            }
        }).
        state('user.init', {
            url: '/init/:username',
            onEnter: function($state, $stateParams, $modal, User, MortarUser) {
                $modal.open({
                    templateUrl: 'angular-app/partials/initModal.html',
                    controller: 'UserInitCtrl',
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
            url: '/recovery_password/:user/:token',
            templateUrl: '/angular-app/partials/user-reset-password.html',
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
                    templateUrl: 'angular-app/partials/FolderRemoveModal.html',
                    controller: 'FolderRemoveModalCtrl'
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
                    templateUrl: 'angular-app/partials/FolderModal.html',
                    controller: 'FolderModalCtrl'
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
            url: '/edit/:folders',
            onEnter: function($state, $stateParams, $modal) {
                $modal.open({
                    templateUrl: 'angular-app/partials/FolderModal.html',
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
                var sessionUser = JSON.parse($window.sessionStorage.getItem("User"));
                if (!$rootScope.triedSession && typeof sessionUser != 'undefined' && sessionUser != null) {
                    $rootScope.triedSession = true;
                    $rootScope.tryingSession = true;
                    var sessionState = JSON.parse($window.sessionStorage.getItem("State"));
                    console.log("sessionState");
                    console.log(sessionState);
                    var loginFunction = function(result) {
                    User.login(sessionUser.username,sessionUser.password).then(function(result){
                      var userInfoPost = User.getVcard();
                      Browser.children = [User.rootFolder, User.favoritesFolder];
                      userInfoPost.then(function(success) {
                          Browser.init().then(function(result) {
                            console.log("Browser Initialized");
                            console.log(sessionState);
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
                                      console.log("Browser could not initialize");
                                      $state.go('login');
                                    });
                      }, function(response) {
                          var modalInstance = $modal.open({
                              templateUrl: 'angular-app/partials/initModal.html',
                              controller: 'UserInitCtrl',
                              resolve: {
                                  username: function() {
                                      return sessionUser.username;
                                  },
                                  password: function() {
                                      return sessionUser.password;
                                  }
                              }
                          });
                          modalInstance.result.then(function(error) { //success
                              if (error) {
                                  Alert.open('danger', 'Vcard information could not be saved.');
                              } else {
                                  Browser.children = [User.rootFolder, User.favoritesFolder];
                                  Browser.init().then(function(success) {
                                      if (typeof User.state.name != 'undefined') {
                                          $state.go(User.state.name, User.state.params);
                                          return;
                                      }
                                      $state.go('device.list', {
                                          folder: User.favoritesFolder
                                      });
                                  });
                              }
                          }, function() {
                              User.loggedIn = false;
                              Alert.open('danger', 'Vcard request failed.');
                              $state.go('login');
                          });
                    },
                  function(result){
                    event.preventDefault();
                    angular.copy(next,User.state);
                    User.state.toParams = toParams;
                    $state.go('login');
                  });
                }, function() {$rootScope.tryingSession = false; $state.go('login');})};
                event.preventDefault();
                $state.go('login').then(loginFunction,loginFunction);
              } else if (!$rootScope.tryingSession && next.name != "login" && next.name != 'recovery_password') {
                    event.preventDefault();
                    // set user state data to redirect if necessary
                    angular.copy(next, User.state);
                    User.state.toParams = toParams;
                    Alert.open('warning', 'You need to be logged in');
                    $state.go('login');
                    return;
                }
            }
            // groups that shouldn't be there!
            var groups = next.data.groups || [];
            /**
             * Prevent route change, show alert,
             * You aint got cleareance!
             */
            if (User.loggedIn && groups.indexOf(User.group) != -1) {
                console.log("you shouldn't be here");
                console.log(next, event);
                $state.go(fromState.name);
                return;
            }
        });
        $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
            angular.copy(from.name, $rootScope.lastState);
            angular.copy(fromParams, $rootScope.lastParams);
            console.log(from);
            if (to.name != '' && to.name != '\/login' && to.name != 'login') {
              $window.sessionStorage.setItem("State", JSON.stringify({state: to.name,
                params: toParams}));
              }
            else if (from.name != '' && from.name != '\/login' && from.name != 'login') {
              $window.sessionStorage.setItem("State", JSON.stringify({state: from.name,
                params: fromParams}));
            }

        });
    });
})();
