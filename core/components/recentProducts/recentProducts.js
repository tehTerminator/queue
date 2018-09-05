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

        $scope.getProducts = function () {
            MySQLService
                .select('product')
                .then(function (response) {
                    $scope.products = response.data.rows;
                })
        }

        $scope.refresh = function () {
            $scope.getProducts();
            MySQLService
                .select('product_transaction', {
                    'andWhere': {
                        "DATE(datetime)": ["CURDATE()", "noQuotes"],
                        'status': ["IN", "PENDING", "COMPLETED", "LIST"]
                    },
                    'limit': '10',
                    'orderBy': "ID DESC",
                })
                .then(function (response) {
                    const serverData = response.data.rows;
                    serverData.forEach(element => {
                        element.name = $scope.products.find(x => x.id == element.product_id).name;
                    });
                    $scope.product_data = serverData;
                })
        }

        $scope.getProducts();
    });