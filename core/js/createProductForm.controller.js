app.controller('CreateProductFormController', function($scope, ProductService){
    $scope.product = {
        name : '',
        quantity : 0,
    }

    $scope.createProduct = function(){
        ProductService.insert($scope.product.name, $scope.product.quantity);
        $scope.product = {
            name : '',
            quantity : 0,
        }
    }
})