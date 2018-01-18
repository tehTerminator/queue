app.controller('CreateProductFormController', function($scope, MySQLService){
    $scope.product = {
        name : '',
        quantity : 0,
    }

    $scope.createProduct = function(){
        MySQLService.insert('product', {
            "columnNames" :["name", "quantity"],
            "userData" : {
                name : $scope.product.name,
                quantity : $scope.product.quantity
            }
        })
        .then(
            $scope.product = {
                name : "",
                quantity : 0,
            }
        );
    }
})