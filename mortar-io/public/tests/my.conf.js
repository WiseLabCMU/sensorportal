// Karma configuration
// Generated on Fri Jan 15 2016 01:25:22 GMT-0500 (EST)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '.',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
         'js/vendor/angular/angular.js',
         'js/vendor/angular-mocks/angular-mocks.js',
         'js/vendor/angular-ui-router/release/angular-ui-router.js',
	 'js/vendor/angular-modal-service/dst/angular-service.js',
         'js/vendor/*/release/*.js',
         'js/vendor/jasmine-rjs/src/jasmine-rjs.js',
         'js/vendor/strophejs/strophe.js',
	 'js/vendor/strophejs-plugins/disco/strophe.disco.js',
	 'js/vendor/strophejs-plugins/rpc/strophe.rpc.js',
         'js/vendor/strophejs-plugins/pubsub/strophe.pubsub.js',
         'js/vendor/strophejs-plugins/vcard/strophe.vcard.js',
         'js/vendor/ng-file-upload/angular-file-upload.js',
	 'js/vendor/angular-bootstrap/ui-bootstrap.js',
	 'js/vendor/angular-busy/dist/angular-busy.js',
	 "js/vendor/angular-filter/dist/angular-filter.min.js",
	 'js/vendor/angular-modal-service/dst/angular-modal-service.js',
	 'js/vendor/vcard/dist/vcard.min.js',
	 'js/vendor/checklist-model/checklist-model.js',
	 'js/vendor/angular-qr/src/angular-qr.js',
	 'js/vendor/angular-mighty-datepicker/build/angular-mighty-datepicker.js',
	 'js/vendor/angular-bindonce/bindonce.js',
	 'js/vendor/angular-xmlrpc/xmlrpc.js',
	 'angular-app/alert.js',
	 'angular-app/directives.js',
	 'angular-app/directives/*.js',
	 'angular-app/directives/openlayers/*.js',
	 'angular-app/directives/angular.treeview/angular.treeview.js',
         'angular-app/controllers.js',
	 'angular-app/controllers/*.js',
         'angular-app/app.js',
         'angular-app/controllers/*.js',
	 'angular-app/services/*.js',
         'angular-app/services.js',
	 'angular-app/tests/mortarUser-services-jasmine.js'
	 /*'angular-app/tests/device-services-jasmine.js',
	 'angular-app/tests/user-services-jasmine.js',
	 'angular-app/tests/device-controller-jasmine.js',
	 'angular-app/tests/folder-controller-jasmine.js'*/
    ],


    // list of files to exclude
    exclude: [

    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    //browsers: ['PhantomJS'],
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
