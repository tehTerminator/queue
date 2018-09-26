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
                .select('product_transaction', {
                    columns: ['product.name as name', 'sum(product_transaction.quantity) as quantity', 'sum(product_transaction.amount) as amount', 'product_transaction.product_id'],
                    'groupBy': 'product_id',
                    andWhere: {
                        'DATE(datetime)': ['CURDATE()', "noQuotes"],
                    },
                    'join': 'product on product.id == product_id'
                })
                .then(function (response) {
                    console.log(response);
                    angular.forEach(response.data.serverData, function (item) {
                        $scope.totalAmount += item.amount;
                        item.name = $scope.products.find(x => x.id = item.product_id).name;
                        $scope.transactions.push(item);
                    })
                });
        }
    });