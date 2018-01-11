app.controller('CashbookFormController', function($scope, UserService){
    $scope.transaction = {
        description : "",
        amount : 0,
        direction : 0,
        user_id: UserService.activeUser.id,
        status : UserService.activeUser.authLevel < 5 ? 0 : 1
    };

    $scope.addTransaction = function(){
        $scope.$emit('InsertItem', {
            'columnNames' : ['user_id', 'description', 'amount', 'direction', 'status'],
            'userData' : $scope.transaction
        });

        //Reset Transaction
        $scope.transaction = {
            description : "",
            amount : 0,
            direction : 0,
            user_id: UserService.activeUser.id,
            status : UserService.activeUser.authLevel < 5 ? 0 : 1
        };

        $("#descriptionField").focus();
    }

})