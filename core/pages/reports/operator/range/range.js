app.controller('OperatorPeriodWiseReportController', function ($scope, UserService, MySQLService) {
    $scope.users = UserService.get();
    $scope.selectedUser = 0;
    $scope.fromDate = new Date();
    $scope.toDate = new Date();
    $scope.rows = [];
    $scope.total = 0;

    $scope.init = () => {
        jQuery(".ui.dropdown").dropdown();
    }

    $scope.getData = function () {
        const request = {
            'columns': ['count(id) as jobs', 'DATE(endTime) as endTime'],
            'andWhere': {
                'DATE(endTime)': ['BETWEEN', $scope.fromDate.toMysqlFormat(), $scope.toDate.toMysqlFormat(), "RANGE"],
                'status': ['NOT IN', 'REJECTED', 'INACTIVE', 'ACTIVE', 'LIST'],
                'acceptedBy': $scope.selectedUser.id
            },
            'groupBy': 'DATE(endTime)'
        };
        console.log(request);
        MySQLService.select('task', request).then(response => {
            if (response.status === 200) {
                $scope.rows = Array.from(response.data.rows);
            }
            $scope.total = 0;
            $scope.rows.forEach(item => $scope.total += Number(item.jobs));
        });
    }
})