app.controller('OperatorDayReportController', function ($scope, MySQLService, UserService) {
    $scope.users = [];
    $scope.selectedUser = {};
    $scope.tasksCompleted = {}
    $scope.myDate = new Date();

    $scope.init = function () {
        if (UserService.activeUser.authLevel >= 5) {
            $scope.users = Array.from(UserService.get());
        } else {
            $scope.users.push(UserService.activeUser);
        }
    }

    $scope.fetchData = function () {
        const params = {
            'columns': ['count(task.customer) as totalTasks', 'categories.name as category', 'categories.commission as commission'],
            'andWhere': {
                'task.acceptedBy': $scope.selectedUser.id,
                'task.status': ["IN", "APPROVED", "COMPLETED", "LIST"],
                'DATE(task.endTime)': ["DATE('" + $scope.myDate.toMysqlFormat() + "')", "noQuotes"]
            },
            'groupBy': 'categories.name',
            'join': 'join categories on task.type = categories.id'
        };

        MySQLService.select('task', params).then(function (response) {
            if (response.status === 200) {
                $scope.tasksCompleted = response.data.rows;
            }
        });

        MySQLService.select('product_transaction', {
            'columns' : ['']
        })

    }

    $scope.init();
})