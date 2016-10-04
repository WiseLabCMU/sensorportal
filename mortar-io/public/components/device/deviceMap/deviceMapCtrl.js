(function() {
    var app = angular.module('device-map-controller', ['ui.router',
        'mortar-services', 'cgBusy', 'ui.bootstrap',
        'alert-handler', 'angularFileUpload', 'checklist-model',
        'olmap-directive', 'ja.qr', 'angularTreeview', 'uuid4',
        'angular-centered', 'ngRoute'
    ]);   
    app.controller('DeviceMapCtrl', function($scope, $stateParams, Device) {
        $scope.folder = $stateParams.folder;
        $scope.device = typeof $stateParams.device != 'undefined' ? $stateParams.device : null;
    });

  /**
   * Constroller in charge of showing the map in the device detail
   * @param  object $scope       controller scope
   * @param  object $stateParams url params
   * @param  service Device       Device service
   */
  app.controller('DeviceDetailMapCtrl',function($scope,$stateParams,Device){
    $scope.$watch('device',function(){
      if($scope.device == null ){
        $scope.promise = Device.get($stateParams['id']);
        $scope.promise.then(function(object){
          $scope.device=object;
        });
      }
    });
  });
})();
