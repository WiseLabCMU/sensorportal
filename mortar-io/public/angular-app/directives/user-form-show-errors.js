(function(){
  /*
  * showErrors directive to validate and display errors on user edit and create forms
  */

  var app = angular.module('show-errors-directive',[]);
  app.directive('showErrors', function() {
    return {
      restrict: 'A',
      require:  '^form',
      link: function (scope, el, attrs, formCtrl) {
        var inputEl   = el[0].querySelector('input[type=text],input[type=password],input[type=email],select');
        var inputNgEl = angular.element(inputEl);
        var inputName = inputNgEl.attr('name');

        // format input fields on blur events
        inputNgEl.on('blur', function(){
          if(inputNgEl[0].type=='select-one'){
            inputNgEl.addClass('has-visited');          
          }          
          if(inputNgEl.hasClass('ng-dirty')){
            inputNgEl.addClass('has-visited');
            el.toggleClass('has-error', formCtrl[inputName].$invalid);
            scope.$apply(function(){
              formCtrl[inputName].hasVisited = true;
            });
          }
        });

        // format input fields on focus events
        inputNgEl.on('focus', function(){
          if(inputNgEl.hasClass('has-visited')){
            inputNgEl.removeClass('has-visited');
            el.removeClass('has-error');
            scope.$apply(function(){
              formCtrl[inputName].hasVisited = false;
            });
          }
        });
      }
    }
  });
})();