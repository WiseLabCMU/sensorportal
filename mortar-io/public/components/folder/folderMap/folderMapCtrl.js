(function() {
    var UPDATE_TRANSDUCER_INTERVAL = 20000;
    var app = angular.module('folder-map--controller', ['ui.router',
        'mortar-services', 'cgBusy', 'ui.bootstrap',
        'alert-handler', 'angularFileUpload', 'checklist-model',
        'olmap-directive', 'ja.qr', 'angularTreeview', 'uuid4',
        'angular-centered', 'ngRoute'
    ]);

  /**
   * Constroller in charge of showing the map in the device list
   * @param  object $scope       controller scope
   * @param  object $stateParams url params
   * @param  service Device       Device service
   */
  app.controller('FolderMapCtrl',function($scope,$stateParams,Device){
    $scope.folder = $stateParams.folder;
    $scope.device = typeof $stateParams.device != 'undefined' ? $stateParams.device : null;
  });
})();
