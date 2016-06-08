(function(){
  /**
   * Show the form schedule
   */
  var app=angular.module('schedule-form-directive',[]);
  app.directive('scheduleForm',function(){
    return {
      restrict:'A',
      scope:{
        isUpdate: '=',
        schedule: '='
      },
      templateUrl:'/angular-app/partials/schedule-form.html',
      link:function(scope,element,attrs){
        scope.validator = {};
        scope.validator.ends='never';
        scope.calendar = {};
        scope.calendar.dayOfWeek ={SU:true,MO:true,TU:true,WE:true,TH:true,FR:true,SA:true};
        scope.calendar.months = {'0':true,'1':true,'2':true,'3':true,'4':true,'5':true,'6':true,'7':true,'8':true,'9':true,'10':true,'11':true};
        if(scope.isUpdate){
          // scope.schedule = Schedule.get($stateParams['schedule']);
          if(typeof scope.schedule.interval != 'undefined'){
            scope.schedule.interval *=1;
          }
          if(typeof scope.schedule.byday !== 'undefined' && scope.schedule.byday !== null){
            scope.calendar.dayOfWeek ={SU:false,MO:false,TU:false,WE:false,TH:false,FR:false,SA:false};
            for(var day in scope.schedule.byday){
              scope.calendar.dayOfWeek[scope.schedule.byday[day]]=true; 
            }
          }
          if(typeof scope.schedule.bymonth !== 'undefined' && scope.schedule.bymonth !== null){
            scope.calendar.months = {'0':false,'1':false,'2':false,'3':false,'4':false,'5':false,'6':false,'7':false,'8':false,'9':false,'10':false,'11':false};
            for(var month in scope.schedule.bymonth){
              scope.calendar.months[scope.schedule.bymonth[month]]=true; 
            }
          }
          if(typeof scope.schedule.count !== 'undefined'){
            scope.validator.ends = 'count';
          }
          if(typeof scope.schedule.until !== 'undefined'){
            scope.validator.ends = 'until';
          } 
        }
        /**
         * changeWeek change day checked
         * @param  string strDayOfWeek day of the week
         */
        scope.changeWeek = function(strDayOfWeek){
          if(scope.calendar.dayOfWeek[strDayOfWeek]){
            scope.schedule.byday.push(strDayOfWeek);
          }else{
            scope.schedule.byday.splice(scope.myIndexOf(scope.schedule.byday,strDayOfWeek),1);
          }
        };
        /**
         * changeMonth change month checked
         * @param  string strMonth month
         */
        scope.changeMonth = function(strMonth){
          if(scope.calendar.months[strMonth]){
            scope.schedule.bymonth.push(strMonth);
          }else{
            scope.schedule.bymonth.splice(scope.myIndexOf(scope.schedule.bymonth,strMonth),1);
          }
        };
        /**
         * myIndexOf search for the index of a value in a array
         * @param  array arr array to search
         * @param  string value value to search in array
         * @return int     index of the value
         */
        scope.myIndexOf = function(arr, value){
          for(var i = 0; i < arr.length; i++){
            if(arr[i]==value){
              return i;
            }
          };
          return -1;
        };
        scope.today=new Date();
        scope.openPicker = {
          start: false,
          until: false
        };
        /**
         * open open date picker
         * @param  object $event the js event
         * @param  boolean picker which picker is open
         */
        scope.open=function($event,picker){
          $event.preventDefault();
          $event.stopPropagation();
          scope.openPicker[picker]=true;
        };
      }
    };
  });
})();