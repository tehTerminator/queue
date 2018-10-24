app.directive('operatorWiseEntry', function () {
    return {
        'restrict': 'E',
        'templateUrl': "core/components/operatorWiseEntry/operatorWiseEntry.html",
        'controller': 'OperatorWiseEntryController',
        'scope': {}
    }
}).controller('OperatorWiseEntryController', function ($scope, UserService, MySQLService) {
    $scope.users = [];

    $scope.fetch = function (someDate) {
        let users = UserService.get();
        users.forEach(user => {
            MySQLService.select('task', {
                'columns': ['count(task.id) as jobs', 'task.type', 'sum(amountCollected) as amount', 'task.amountCollected as rate', 'categories.name as category'],
                'andWhere': {
                    'task.insertedBy': user.id,
                    'DATE(insertTime)': ['DATE("' + someDate + '")', 'noQuotes'],
                    'task.status': ['NOT IN', 'REJECTED', 'UNPAID', 'LIST'],
                },
                'join': 'join categories on task.type = categories.id',
                'groupBy': 'task.type, task.amountCollected'
            }).then(response => {
                if (response.status === 200) {
                    if (response.data.rowCount > 0) {
                        let total = 0;
                        response.data.rows.forEach(item => total += Number(item.amount));
                        $scope.users.push({
                            'name': user.name,
                            'data': response.data.rows,
                            'total': total.toFixed(2)
                        });
                    }
                }
            });
        });
    }

    $scope.$on('fetch', function (e, arg) {
        $scope.reset();
        $scope.fetch(arg);
    });

    $scope.reset = () => $scope.users = [];
});