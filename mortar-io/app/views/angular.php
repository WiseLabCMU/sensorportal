<!DOCTYPE html>
<html lang="en" ng-app="mortar-app">
<head>
	<meta charset="UTF-8">
	<title>Sensor Andrew</title>
	<link rel="stylesheet" type="text/css" href="/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="/css/style.css">
	<link rel="stylesheet" type="text/css" href="/js/vendor/angular-busy/dist/angular-busy.min.css" />
	<link rel="stylesheet" type="text/css" href="/angular-app/directives/angular.treeview/css/angular.treeview.css" />
	<link rel="stylesheet" type="text/css" href="/js/vendor/angular-mighty-datepicker/build/angular-mighty-datepicker.css" />
	<link rel="stylesheet" type="text/css" href="/angular-app/directives/timeseries/jquery-ui.css" />
	<link rel="stylesheet" type="text/css" href="/angular-app/directives/timeseries/grapher.css" />
	<link rel="stylesheet" type="text/css" href="/angular-app/directives/openlayers/css/ol.css" />
	<link rel="stylesheet" type="text/css" href="/js/vendor/fontawesome/css/font-awesome.min.css" />
</head>
<body>
	<div ng-include src="'/angular-app/partials/header.html'" ng-controller="LoginCtrl" ng-show="user.loggedIn"></div>
	<div class="container alerts-container ng-hide" ng-controller="AlertCtrl" ng-show="Alert.show">
		<alert ng-repeat="alert in Alert.alerts | limitTo : 1" type="{{alert.type}}" close="Alert.close()">{{alert.msg}}</alert>
	</div>
	<div ui-view></div>
	<script type="text/javascript" src="/js/vendor/ng-file-upload/angular-file-upload-shim.js"></script>
	<script type="text/javascript" src="/js/vendor/jquery/dist/jquery.js"></script>
	<script type="text/javascript" src="/js/vendor/angular/angular.js"></script>
	<script type="text/javascript" src="js/vendor/vcard/dist/vcard.min.js"></script>
        <script type="text/javascript" src="js/vendor/angular-uuid4/angular-uuid4.min.js"></script>
	<script type="text/javascript" src="js/vendor/angular-xmlrpc/xmlrpc.js"></script>
	<script type="text/javascript" src="js/vendor/angular-timeout/dist/angular-timeout.js"></script>
	<script type="text/javascript" src="/js/vendor/strophejs/strophe.js"></script>
	<script type="text/javascript" src="/js/vendor/strophejs-plugins/vcard/strophe.vcard.js"></script>
	<script type="text/javascript" src="js/vendor/strophejs-plugins/rpc/strophe.rpc.js"></script>
	<script type="text/javascript" src="/js/vendor/strophejs-plugins/pubsub/strophe.pubsub.js"></script>
	<script type="text/javascript" src="js/vendor/strophejs-plugins/disco/strophe.disco.js"></script>
	<script type="text/javascript" src="/js/vendor/angular-filter/dist/angular-filter.min.js"></script>
	<script type="text/javascript" src="/js/vendor/angular-centered/angular-centered.js"></script>
	<script type="text/javascript" src="/js/vendor/ng-file-upload/angular-file-upload.js"></script>
	<script type="text/javascript" src="/js/vendor/angular-ui-router/release/angular-ui-router.js"></script>
	<!--<script type="text/javascript" src="/js/vendor/angular-busy/dist/angular-busy.min.js"></script>-->
	<script type="text/javascript" src="/js/vendor/angular-busy/dist/angular-busy.js"></script>
	<script type="text/javascript" src="/js/vendor/checklist-model/checklist-model.js"></script>
	<script type="text/javascript" src="/js/vendor/angular-bootstrap/ui-bootstrap-tpls.js"></script>
	<script type="text/javascript" src="/js/vendor/angular-bindonce/bindonce.js"></script>
  <script type="text/javascript" src="/js/vendor/moment/moment.js"></script>
  <script type="text/javascript" src="/js/vendor/angular-mighty-datepicker/build/angular-mighty-datepicker.js"></script>
	<script type="text/javascript" src="/angular-app/alert.js"></script>
	<script type="text/javascript" src="/angular-app/services/user.js"></script>
	<script type="text/javascript" src="/angular-app/services/mortarUser.js"></script>
	<!-- <script type="text/javascript" src="/angular-app/services/folder.js"></script>-->
	<script type="text/javascript" src="/angular-app/services/browser.js"></script>
	<script type="text/javascript" src="/angular-app/services/favorite.js"></script>
	<script type="text/javascript" src="/angular-app/services/transducer.js"></script>
	<script type="text/javascript" src="/angular-app/services/mio.js"></script>
	<!-- <script type="text/javascript" src="/angular-app/services/command.js"></script>-->
	<script type="text/javascript" src="/angular-app/services/device.js"></script>
	<!-- <script type="text/javascript" src="/angular-app/services/schedule.js"></script>-->
	<!-- <script type="text/javascript" src="/angular-app/services/monitor.js"></script>-->
	<script type="text/javascript" src="/angular-app/services/http-queue.js"></script>
	<script type="text/javascript" src="/angular-app/services.js"></script>
	<script type="text/javascript" src="/angular-app/directives/openlayers/build/ol.js"></script>
	<script type="text/javascript" src="/angular-app/directives/openlayers/olmap.js"></script>
	<script type="text/javascript" src="/angular-app/directives/timeseries/jquery-ui.min.js"></script>
	<script type="text/javascript" src="/angular-app/directives/timeseries/grapher4/grapher2.nocache.js"></script>
	<script type="text/javascript" src="/angular-app/directives/timeseries/timeseries.js"></script>
	<script type="text/javascript" src="/angular-app/directives/multicontrol.js"></script>
	<script type="text/javascript" src="/angular-app/directives/schedule-directive/schedule-recap.js"></script>
	<script type="text/javascript" src="/angular-app/directives/schedule-form.js"></script>
	<script type="text/javascript" src="/angular-app/directives/user-form-show-errors.js"></script>
	<script type="text/javascript" src="/angular-app/directives/user-password-match.js"></script>
	<script type="text/javascript" src="/angular-app/directives/angular.treeview/angular.treeview.js"></script>
	<script type="text/javascript" src="/angular-app/directives/qrcode/lib/qrcode.min.js"></script>
	<script type="text/javascript" src="/angular-app/directives/angular-qr/angular-qr.min.js"></script>
	<script type="text/javascript" src="/angular-app/directives.js"></script>
	<script type="text/javascript" src="/angular-app/controllers/device.js"></script>
	<script type="text/javascript" src="/angular-app/controllers/register.js"></script>
	<script type="text/javascript" src="/angular-app/controllers/folder.js"></script>
	<script type="text/javascript" src="/angular-app/controllers/login.js"></script>
	<script type="text/javascript" src="/angular-app/controllers/user.js"></script>
	<!-- <script type="text/javascript" src="/angular-app/controllers/monitor.js"></script>-->
	<!-- <script type="text/javascript" src="/angular-app/controllers/schedule.js"></script>-->
	<script type="text/javascript" src="/angular-app/controllers.js"></script>
	<script type="text/javascript" src="/angular-app/app.js"></script>
</body>
</html>