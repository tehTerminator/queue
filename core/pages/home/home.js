app.controller('HomeController', function ($scope, UserService, MySQLService) {
    $scope.user = UserService.activeUser;
    $scope.isLoading = false;
    $scope.title = "Home Page"
    $scope.data = {
        index: 0,
        jobCompletionData: {
            table: 'task',
            params: {
                columnNames: ['count(acceptedBy) as series', 'acceptedBy as userId'],
                'group by': 'acceptedBy',
                'andWhere': {
                    'acceptedBy': ['>', 0],
                    'DATE(`endTime`)': 'CURDATE()',
                    'status': 1
                },
            },
            series: [],
            labels: [],
            selectorClass: '.jobCard'
        },
        jobInsertionData: {
            table: 'task',
            params: {
                columnNames: ['count(insertedBy) as series', 'insertedBy as userId'],
                'group by': 'insertedBy',
                'andWhere': {
                    'DATE(`insertTime`)': 'CURDATE()',
                    'status': ['>', -2]
                }
            },
            series: [],
            labels: [],
            selectorClass: '.jobInsertCard'
        },
        productUsageData: {
            table: 'product_transaction',
            params: {
                columnNames: ['sum(amount) as series', 'user_id as userId'],
                'group by': 'user_id',
                'andWhere': {
                    'direction': 0,
                    'DATE(`datetime`)': 'CURDATE()'
                }
            },
            series: [],
            labels: [],
            selectorClass: '.productUsageCard'
        },
        moneyProdData: {
            table: 'task',
            params: {
                columnNames: ['sum(amountCollected) as series', 'acceptedBy as userId'],
                'group by': 'acceptedBy',
                'andWhere': {
                    'acceptedBy': ['>', 0],
                    'DATE(`endTime`)': 'CURDATE()',
                    'status': ['>', -2]
                },
            },
            series: [],
            labels: [],
            selectorClass: '.moneyCard'
        },
        myKeys: ['jobCompletionData', 'jobInsertionData', 'productUsageData', 'moneyProdData'],
        next: function () {
            $scope.data.index++;
        },
        getItem: function () {
            return $scope.data[$scope.data.myKeys[$scope.data.index]];
        }
    };

    $scope.refresh = function (index) {
        if ($scope.data.index < $scope.data.myKeys.length) {
            var counter = 0;
            $scope.isLoading = true;
            MySQLService.select($scope.data.getItem().table, $scope.data.getItem().params)
                .then(function (response) {
                    $scope.data.getItem().series = [];
                    $scope.data.getItem().labels = [];
                    angular.forEach(response.data.serverData, function (item) {
                        $scope.data.getItem().series.push(item.series);
                        $scope.data.getItem().labels.push(UserService.get(item.userId).name);
                    });
                })
                .then(function () {
                    if ($scope.data.getItem().series.length > 0) {
                        var chart = new Chartist.Bar($scope.data.getItem().selectorClass, {
                            series: [$scope.data.getItem().series],
                            labels: $scope.data.getItem().labels,
                        }, {
                            low: 0,
                            fullWidth: true,
                        });
                    }
                })
                .then(function () {
                    $scope.data.next();
                    $scope.refresh();
                })
        } else {
            $scope.data.index = 0;
            $scope.isLoading = false;
        }

    }

});