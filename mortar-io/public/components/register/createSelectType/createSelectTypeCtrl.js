(function() {
    var app = angular.module('create-select-type-controller', ['ui.router', 'mortar-services',
        'cgBusy', 'ui.bootstrap', 'alert-handler', 'angularFileUpload',
        'checklist-model', 'olmap-directive', 'ja.qr', 'angularTreeview',
        'uuid4', 'angular-centered', 'ngCsvImport'
    ]);
    app.controller('CreateSelectCtrl', function($scope, Device, $stateParams, User,
        Alert, MortarUser, $http, Browser, $modal, $upload) {
        $scope.csvfile = '';
        $scope.csvresult = {};
        $scope.csvseparator = ',';
        $scope.csvaccept = function(json) {
            console.log("csv accept");
            console.log(json);
            console.log($scope.csvresult);
        };
        $scope.submit = function() {
            $upload($scope.csvfile);
        };
        /**
         * [onFileSelect description]
         * @param  {[type]} $files [description]
         * @return {[type]}        [description]
         */
        $scope.onFileSelect = function($files) {
            $scope.csvfile = $files[0];
            console.log($files);
            console.log($scope.csvfile_data);
            $upload.upload({
                url: 'User.domain/csv',
                data: {
                    file: $scope.csvfile,
                    'username': User.username
                }
            }).then(function(resp) {
                console.log('Success ' + 'uploaded. Response: ' + resp.data);
            }, function(resp) {
                console.log('Error status: ' + resp.status);
            }, function(evt) {
                var progressPercentage =
                    parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ');
            });
        }
    });
})();
