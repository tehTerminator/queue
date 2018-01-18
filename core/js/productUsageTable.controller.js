app.controller('ProductUsageTableController', function($scope, MySQLService){
    $scope.productList = [];
    $scope.data = {
        products: {},
        transactions: [],
    }

    $scope.refresh = function(){
        MySQLService.select('product')
        .then(function(response){
            $scope.data.products = [];
            angular.forEach(response.data.serverData, function(item){
                $scope.data.products[item.id] = item.name;
            });
        })
        .then(function(){
            MySQLService.select('product_transaction', {
                columnNames : ['sum(quantity) as quantity', 'sum(amount) as amount', 'product_id'],
                'group by' : 'product_id',
                conditions : {
                    'DATE(`datetime`)' : 'CURDATE()',
                }
            })
            .then(function(response){
                console.log(response);
                $scope.data.transactions = [];
                angular.forEach(response.data.serverData, function(item){
                    item.name = $scope.data.products[item.product_id];
                    $scope.data.transactions.push(item);
                })
            });
        });
    }
});