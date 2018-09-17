app.controller('DayReportController', function ($scope, MySQLService, UserService) {
    $scope.myDate = new Date();

    $scope.fetch = function () {
        console.log("Date : ", $scope.myDate);
        $scope.$broadcast('fetch', $scope.myDate.toMysqlFormat());
    }
})