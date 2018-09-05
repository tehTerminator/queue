app.directive('productTable', function () {
        return {
            'restrict': 'E',
            'templateUrl': 'core/views/productTable.html'
        }
    })

    .controller('ProductsController', function ($scope, MySQLService) {
        $scope.products = [];

        $scope.fetchProducts = function () {
            MySQLService.select('product').then(function (response) {
                if (response.status === 200) {
                    $scope.products = response.data.rows
                }
            });
        }

        $scope.edit = function (product) {
            $scope.$broadcast('Set Product', {
                id: product.id,
                name: product.name,
                quantity: product.quantity
            });
        }

        $scope.delete = function (product) {
            if (confirm("Do You Really Wish to Delete" + product.name + "?")) {
                MySQLService.delete('product', {
                    'andWhere': {
                        id: product.id
                    }
                }).then(function (response) {
                    if (response.status === 200 && response.data.rowCount == 1) {
                        let index = $scope.products.findIndex(x => x.id == product.id);
                        $scope.products.splice(index, 1);
                    }
                });
            }
        }

        $scope.$on('Product Added', function (e, arg) {
            $scope.products.push(arg);
        });

        $scope.$on('Product Updated', function (e, arg) {
            let productIndex = $scope.products.findIndex(x => x.id == arg.id);
            console.log("Product Index:", productIndex);
            console.log("Arg:", arg);
            $scope.products[productIndex]['name'] = arg.name;
            $scope.products[productIndex]['quantity'] = arg.quantity;
        });
    })