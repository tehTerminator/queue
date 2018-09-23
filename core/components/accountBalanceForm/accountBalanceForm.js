app.directive('accountBalanceForm', function () {
    return {
        'templateUrl': 'core/components/accountBalanceForm/accountBalanceForm.html',
        'controller': "AccountBalanceFormController",
        'scope': {}
    }
}).controller('AccountBalanceFormController', function ($scope, MySQLService, $rootScope) {
    $scope.accounts = [];

    $scope.myDate = new Date();
    $scope.openingBalance = 0.00;
    $scope.selectedAccount = {};
    $scope.balanceRecorded = false;

    $scope.insertBalance = function () {
        $scope.getBalance.then(function () {
            if ($scope.balanceRecorded === true) {
                MySQLService.update('balance', {
                    'andWhere': {
                        'DATE(date)': ["DATE('" + $scope.myDate.toMysqlFormat() + "')", "noQuotes"],
                        'account_id': $scope.selectedAccount.id
                    },
                    'userData': {
                        'opening': $scope.openingBalance
                    }
                }).then(function (response) {
                    if (response.status === 200 && response.data.rowCount > 0) {
                        $rootScope.broadcast('Balance Updated', {
                            'account_id': $scope.selectedAccount.id,
                            'openingBalance': $scope.openingBalance
                        });
                    }
                });
            } else {
                MySQLService.insert('balance', {
                    'userData': {
                        'date': $scope.myDate.toMysqlFormat().substr(0, 10),
                        'account_id': $scope.selectedAccount.id,
                        'opening': $scope.openingBalance
                    }
                }).then(function (response) {
                    if (response.status === 200 && response.data.rowCount > 0) {
                        $rootScope.broadcast('Balance Inserted', {
                            'account_id': $scope.selectedAccount.id,
                            'openingBalance': $scope.openingBalance,
                            'date': $scope.myDate
                        });
                    }
                });
            }
        });
    }

    $scope.getBalance = function (someDate, accountId) {
        return MySQLService.select('balance', {
            'andWhere': {
                'DATE(date)': ["DATE('" + $scope.myDate.toMysqlFormat() + "')", "noQuotes"],
                'account_id': $scope.selectedAccount.id
            }
        }).then(function (response) {
            if (response.status === 200) {
                $scope.balanceRecorded = response.data.rowCount > 0;
            }
        })
    }
})