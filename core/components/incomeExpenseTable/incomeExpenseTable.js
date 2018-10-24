app.directive('incomeExpenseTable', function () {
    return {
        templateUrl: 'core/components/incomeExpenseTable/incomeExpenseTable.html',
        controller: 'IncExpTableController',
        scope: {},
    }
}).controller('IncExpTableController', function ($scope, MySQLService) {
    $scope.income = {
        'data': [],
        'total': 0
    };

    $scope.expense = {
        'data': [],
        'total': 0
    };

    $scope.accounts = [];

    $scope.init = function () {
        MySQLService.select('accounts').then(function (response) {
            if (response.status === 200) {
                $scope.accounts = response.data.rows;
            }
        });
    }

    $scope.fetch = function (someDate) {
        console.log(someDate);
        let shopAccount = $scope.accounts.find(x => x.name.toLowerCase() === 'shop').id;
        console.log("shopAccount", shopAccount);

        const request = {
            'columns': ['sum(amount) as amount', 'giver', 'receiver'],
            'andWhere': {
                'orWhere': {
                    'giver': shopAccount,
                    'receiver': shopAccount
                },
                'andWhere': {
                    'DATE(datetime)': ['DATE("' + someDate + '")', 'noQuotes'],
                    'cashbook.status': ['<>', 'REJECTED']
                }
            },
            'groupBy': 'giver'
        };

        console.log("Request", request);

        MySQLService.select('cashbook', request).then(function (response) {
            if (response.status === 200) {
                $scope.reset();
                response.data.rows.forEach(function (item) {
                    item.giverName = $scope.accounts.find(x => x.id == item.giver).name;
                    item.receiverName = $scope.accounts.find(x => x.id == item.receiver).name;
                    if (item.giver == shopAccount.id) {
                        $scope.expense.data.push(item);
                        $scope.expense.total += Number(item.amount);
                    } else {
                        $scope.income.data.push(item);
                        $scope.income.total += Number(item.amount);
                    }
                });
            }
        });
    }

    $scope.reset = function () {
        $scope.income = {
            'data': [],
            'total': 0
        };

        $scope.expense = {
            'data': [],
            'total': 0
        };
    }

    $scope.$on('fetch', function (e, arg) {
        $scope.fetch(arg);
    })

    $scope.init();

})