/**
 * Recap directive
 */
(function(){
  var app = angular.module('recap-directive',[]);
  app.directive('recapInfo',function(){
    return {
      restrict:'A',
      scope:{
        schedule:'='
      },
      templateUrl:'/angular-app/directives/schedule-directive/schedule-templates/schedule-recap.html',
      link:function(scope,element,attrs){

      }
    };
  });
})();