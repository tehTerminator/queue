app.controller('ProductUsageFormController', function($scope, ProductService, UserService, MySQLService){
    
    $scope.products = [];

    $scope.getProducts = function(){
        MySQLService.select('product')

        .then(function(response){
            console.log(response);
            $scope.products = response.data.serverData;
            $scope.initDropdown();
        });
    }

    $scope.transaction = {
        description : '',
        product : {},
        quantity : 0,
        user_id : UserService.activeUser.id,
        cashbook_id : 0,
        amount : 0,
        direction : 0,
        status : UserService.activeUser.authLevel < 5 ? 0 : 1
    };

    $scope.insertRecord = function(){
        ProductService.recordUsage( $scope.transaction );
        $scope.transaction = {
            description : '',
            product : {},
            quantity : 0,
            user_id : UserService.activeUser.id,
            cashbook_id : 0,
            amount : 0,
            direction : 0,
        };
    }

    $scope.selectProduct = function(product){
        $scope.transaction.product_id = product.id;
        $scope.transaction.productName = product.name;
    }

    $scope.initDropdown = function(){
        jQuery(".ui.dropdown").dropdown();
    }
})