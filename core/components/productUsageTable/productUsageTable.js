app
    .directive('productUsageTable', function () {
        return {
            'restrict': 'E',
            'templateUrl': 'core/components/productUsageTable/productUsageTable.html',
            'controller': 'ProductUsageTableController',
            'scope': {}
        }
    })

    .controller('ProductUsageTableController', function ($scope, MySQLService) {
        $scope.productList = [];
        $scope.transactions = [];
        $scope.totalAmount = 0;

        $scope.refresh = function () {
            MySQLService
                .select('product')
                .then(function (response) {
                    $scope.products = response.data.rows;
                })
                .then(function () {
                    $scope.totalAmount = 0;
                    $scope.transactions = [];
                    MySQLService
                        .select('product_transaction', {
                            columns: ['sum(quantity) as quantity', 'sum(amount) as amount', 'product_id'],
                            'groupBy': 'product_id',
                            andWhere: {
                                'DATE(datetime)': ['CURDATE()', "noQuotes"],
                            }
                        })
                        .then(function (response) {
                            console.log(response);
                            angular.forEach(response.data.serverData, function (item) {
                                $scope.totalAmount += item.amount;
                                item.name = $scope.products.find(x => x.id = item.product_id).name;
                                $scope.transactions.push(item);
                            })
                        });
                });
        }
    });