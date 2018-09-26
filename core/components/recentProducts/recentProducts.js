app
    .directive('recentProducts', function () {
        return {
            restrict: 'E',
            templateUrl: 'core/components/recentProducts/recentProducts.html',
            controller: 'RecentProductsController',
            scope: {}
        }
    })
    .controller('RecentProductsController', function ($scope, MySQLService) {
        $scope.product_data = [];
        $scope.products = [];

        $scope.refresh = function () {
            MySQLService.select('product_transaction', {
                'columns': ['product_transaction.*', 'product.name'],
                'andWhere': {
                    "DATE(datetime)": ["CURDATE()", "noQuotes"],
                    'status': ["IN", "PENDING", "COMPLETED", "LIST"]
                },
                'limit': '10',
                'orderBy': "ID DESC",
                'join': 'join product on product_transaction.product_id = product.id'
            }).then(response => {
                console.log(response);
                $scope.product_data = response.data.rows
            });
        }

        $scope.$on('Product Added', (e, arg) => $scope.refresh());
    });