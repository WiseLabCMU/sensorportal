(function(){
  var app = angular.module('multicontrol-directive',['alert-handler']);

  app.directive('multicontrol', function(Alert){
    return {
      restrict: 'A',
      scope: true,
      templateUrl: '/angular-app/partials/multicontrol-template.html',
      link: function(scope,element,attrs){

        var callbackFunction = attrs.callbackFunction || 'runCommands';
        scope.submit = function(){
          Alert.close();
          var commands = [];
          var inputs = [];
          var nodeList = element[0].querySelectorAll('input[type=text],input[type=number],select');
          for(var i = 0; i<nodeList.length; i++){
            inputs[i] = nodeList[i];
          }
          angular.forEach(inputs,function(el){
            var input = angular.element(el);
            var inputAttrs = input[0].attributes;
            input.removeClass('invalid');
            if(input.val() != null && typeof input.val()!='undefined' && input.val()!='?' && input.val()!=''){
              commands.push({
                device: inputAttrs.device.value,
                transducer: inputAttrs.transducer.value,
                value: input.val(),
                // el:el
              });
            }else{
              input.addClass('invalid');
              return;
            }
          });
          if(commands.length>0){
            var commandsCopy = [];
            angular.copy(commands,commandsCopy);
            scope.standBy = true;
            scope[callbackFunction](commandsCopy);
          }
        }
      }
    }
  });
})();
