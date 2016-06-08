/**
 * @author Valentyn Shybanov 
 * @url http://stackoverflow.com/questions/14464945/add-queueing-to-angulars-http-service
 */
(function(){
  var app=angular.module('http-queue',[]);
  var httpQueue = function($q,$http){
    var queue=[];
    var execNext = function() {
      var task = queue[0];
      task.d.notify(1);
      $http(task.c).then(function(data) {
        queue.shift();
        task.d.resolve(data);
        if (queue.length>0) execNext();
      }, function(err) {
        queue.shift();
        task.d.reject(err);
        if (queue.length>0) execNext();
      })
      ;
    }; 
    return function(config) {
      var d = $q.defer();
      queue.push({c:config,d:d});
      if (queue.length===1) execNext();            
      return d.promise;
    };
  }
  app.factory('httpQueue',httpQueue);
})();