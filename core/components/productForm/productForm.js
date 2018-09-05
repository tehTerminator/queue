app
    .directive('productForm', function () {
        return {
            'restrict': 'E',
            'templateUrl': 'core/components/productForm/productForm.html',
            'controller': 'ProductFormController'
        }
    })
    .controller('ProductFormController', function ($scope, MySQLService) {
        $scope.product = {
            id: 0,
            name: '',
            quantity: 0,
        }

        $scope.createProduct = function () {
            MySQLService.insert('product', {
                "userData": {
                    name: $scope.product.name,
                    quantity: $scope.product.quantity
                }
            }).then(function (response) {
                if (response.status === 200 && response.data.rowCount > 0) {
                    console.log(response);
                    $scope.$emit("Product Added", {
                        'id': response.data.lastInsertId,
                        'name': $scope.product.name,
                        'quantity': $scope.product.quantity
                    });
                    $scope.reset();
                }
            });
        }

        $scope.updateProduct = function () {
            MySQLService.update('product', {
                'andWhere': {
                    id: $scope.product.id
                },
                'userData': {
                    'name': $scope.product.name,
                    'quantity': $scope.product.quantity
                }
            }).then(function (response) {
                if (response.status === 200 && response.data.rowCount > 0) {
                    $scope.$emit("Product Updated", {
                        'id': $scope.product.id,
                        'name': $scope.product.name,
                        'quantity': $scope.product.quantity
                    });
                    $scope.reset();
                }
            });
        }

        $scope.$on('Set Product', function (e, arg) {
            $scope.product.name = arg.name;
            $scope.product.quantity = Number(arg.quantity);
            $scope.product.id = Number(arg.id);
        })

        $scope.reset = () => {
            $scope.product = {
                id: 0,
                name: '',
                quantity: 0,
            }
        }
    });