(function(){
  /*
  * passwordMatch directive to evaluate two passwords matching
  */
  var app = angular.module('password-match-directive',[]);
  app.directive('passwordMatch', function() {
    return {
      restrict: 'A',
      scope:true,
      require: 'ngModel',
      link: function (scope, elem , attrs,control){
        var checker = function () {
          //get the value of the first password
          var password = scope.$eval(attrs.ngModel);

          //get the value of the second password  
          var password2 = scope.$eval(attrs.passwordMatch);
          
          var el = angular.element(elem);
          if(typeof password2=='undefined' || password2==''){
            el.parent().removeClass('has-error');
          }else{
            if(password==password2 && el.hasClass('ng-dirty')){
              el.parent().removeClass('has-error');
            }else{
              if(password!='' && password2!='' && password2!=password && el.hasClass('has-visited')){
                el.parent().addClass('has-error');
              }           
            }
          }
          return password == password2;
        };
        scope.$watch(checker, function (n) {
          //set the form control to valid if both 
          //passwords are the same, else invalid
          control.$setValidity("unique", n);
        });
      }
    };
  }); 
})();