app
    .controller('OperatorReportController', function ($scope, MySQLService, UserService) {
        $scope.operators = UserService.activeUser.authLevel > 5 ? UserService.all : [UserService.activeUser];
        $scope.date = {
            start: "",
            end: "",
            enclose: function (dt) {
                return "'" + dt.getFullYear() +
                    "-" + $scope.date.leadingZero(dt.getMonth() + 1) +
                    "-" + $scope.date.leadingZero(dt.getDate()) +
                    " " + $scope.date.leadingZero(dt.getHours()) +
                    ":" + $scope.date.leadingZero(dt.getMinutes()) +
                    ":" + $scope.date.leadingZero(dt.getSeconds()) +
                    ".000000'";
            },
            leadingZero: function (num) {
                var output = "000000" + num;
                return output.substr(output.length - 2, 2);
            }
        };
        $scope.selectedOperatorId = UserService.activeUser.id;
        $scope.result = [];
        $scope.footer = {
            totalItems: 0,
            totalJobs: 0,
            totalAmount: 0
        };

        $scope.getData = function () {
            $scope.result = [];
            $scope.footer = {
                totalItems: 0,
                totalJobs: 0,
                totalAmount: 0
            };

            MySQLService.select('task', {
                    columnNames: ['count(acceptedBy) as jobCompleted', 'sum(amountCollected) as jobAmount', 'DATE(endTime) as dateTime'],
                    'group by': 'DATE(endTime)',
                    conditions: {
                        'acceptedBy': $scope.selectedOperator.id,
                        'DATE(endTime)': ['BETWEEN', $scope.date.enclose($scope.date.start), $scope.date.enclose($scope.date.end)],
                        'status': 1
                    },
                })
                .then(function (response) {
                    angular.forEach(response.data.serverData, function (item) {
                        $scope.footer.totalItems++;
                        $scope.footer.totalJobs += Number(item.jobCompleted);
                        $scope.footer.totalAmount += Number(item.jobAmount);
                        $scope.result.push(item);
                    })
                });
        }

        $scope.initDropdown = function () {
            jQuery(".ui.dropdown").dropdown();
        }

    })

    .controller('CashbookReportController', function ($scope, MySQLService, UserService) {
        $scope.date = ""
        $scope.cashbook = [];
        $scope.accounts = {};

        $scope.getData = function () {
            $scope.cashbook = [];
            MySQLService.select('accounts')
                .then(function (response) {
                    $scope.accounts = {};
                    angular.forEach(response.data.serverData, function (account) {
                        $scope.accounts[account.id] = account.name;
                    });
                })
                .then(function () {
                    var req = {
                        columnNames: ['sum(amount) as totalAmount', 'giver', 'receiver'],
                        conditions: {
                            status: 1,
                            "DATE(datetime)": $scope.date
                        },
                        'group by': ['giver', 'receiver'],
                        'order by': 'giver'
                    }

                    if (UserService.activeUser.authLevel < 5) {
                        req.conditions.user_id = UserService.activeUser.id;
                    }

                    MySQLService.select('cashbook', req)
                        .then(function (res) {
                            console.log(res);
                            angular.forEach(res.data.serverData, function (item) {
                                item.giver = $scope.accounts[item.giver];
                                item.receiver = $scope.accounts[item.receiver];
                                $scope.cashbook.push(item);

                                console.log(item);
                            })
                        })
                });
        }
    })

    .controller('AccountBookController', function ($scope, MySQLService, UserService) {
        $scope.accounts = {
            all: []
        };
        $scope.selectedAccount = {};
        $scope.transactions = [];
        $scope.date = {
            start: "",
            end: "",
            getDateRange: function () {
                return $scope.date.enclose($scope.date.start) + " AND " + $scope.date.enclose($scope.date.end);
            },
            enclose: function (dt) {
                return "'" + dt.getFullYear() +
                    "-" + $scope.date.leadingZero(dt.getMonth() + 1) +
                    "-" + $scope.date.leadingZero(dt.getDate()) +
                    " " + $scope.date.leadingZero(dt.getHours()) +
                    ":" + $scope.date.leadingZero(dt.getMinutes()) +
                    ":" + $scope.date.leadingZero(dt.getSeconds()) +
                    ".000000'";
            },
            leadingZero: function (num) {
                var output = "000000" + num;
                return output.substr(output.length - 2, 2);
            }
        };

        $scope.getAccounts = function () {
            MySQLService.select('accounts')
                .then(function (response) {
                    $scope.accounts.all = response.data.serverData;
                    angular.forEach(response.data.serverData, function (item) {
                        $scope.accounts[item.id] = item.name;
                    });
                });
        }

        $scope.getData = function () {
            $scope.transactions = [];
            MySQLService.select('cashbook', {
                    conditions: {
                        'DATE(datetime)': [
                            'BETWEEN', $scope.date.enclose($scope.date.start), $scope.date.enclose($scope.date.end)
                        ],
                        'giver': $scope.selectedAccount.id,
                        status: 1
                    }
                })
                .then(function (response) {
                    angular.forEach(response.data.serverData, function (item) {
                        item.giverName = $scope.accounts[item.giver];
                        item.receiverName = $scope.accounts[item.receiver];
                        $scope.transactions.push(item);
                    })
                })
                .then(
                    MySQLService.select('cashbook', {
                        conditions: {
                            'DATE(datetime)': [
                                'BETWEEN', $scope.date.enclose($scope.date.start), $scope.date.enclose($scope.date.end)
                            ],
                            'receiver': $scope.selectedAccount.id,
                            status: 1
                        }
                    })
                    .then(function (response) {
                        angular.forEach(response.data.serverData, function (item) {
                            item.giverName = $scope.accounts[item.giver];
                            item.receiverName = $scope.accounts[item.receiver];
                            $scope.transactions.push(item);
                        });
                    })
                );
        }

        $scope.initDropdown = function () {
            jQuery(".ui.dropdown").dropdown();
        }


    })