angular.module("rt.timeout", []).factory("scopedTimeout", ["$timeout", "$interval", function ($timeout, $interval) {
    return function ($scope) {
        var timeouts = [];
        var intervals = [];

        function destroyAll(service, promises) {
            for (var i = 0; i < promises.length; i++) {
                service.cancel(promises[i]);
            }
        }

        $scope.$on("$destroy", function () {
            destroyAll($timeout, timeouts);
            destroyAll($interval, intervals);
        });

        return {
            timeout: function (fn, ts) {
                var promise = $timeout(fn, ts);
                timeouts.push(promise);
                return promise;
            },

            interval: function (fn, ts) {
                var promise = $interval(fn, ts);
                intervals.push(promise);
                return promise;
            },
        };
    };
}]);
