app.controller('CashbookFormController', function($scope, $http){
    $scope.transaction = {
        description : "",
        amount : 0,
        direction : 0,
        user_id: $scope.$parent.user.id,
        status : $scope.$parent.user.authLevel < 5 ? 0 : 1
    };

    $scope.addTransaction = function(){
        var request = {
            queryType : 'insert',
            tableName : 'cashbook',
            params : {
                'columnNames' : ['user_id', 'description', 'amount', 'direction', 'status'],
                'userData' : $scope.transaction
            }
        };

        $scope.$emit('InsertItem', request);

        //Reset Transaction
        $scope.transaction = {
            description : "",
            amount : 0,
            direction : 0,
            user_id: $scope.$parent.user.id,
            status : $scope.$parent.user.authLevel < 5 ? 0 : 1
        };
    }

})