app.controller('CashbookFormController', function($scope, UserService, MySQLService){
    $scope.transaction = {
        description : "",
        amount : 0,
        giver: 0,
        receiver: 0,
        user_id: UserService.activeUser.id,
        status : UserService.activeUser.authLevel < 5 ? 0 : 1
    };

    $scope.accounts = [];

    $scope.getAccounts = function(){
        MySQLService.select("accounts")
        .then(function(response){
            $scope.accounts = response.data.serverData;
        })
    }

    $scope.addTransaction = function(){
        if( typeof($scope.transaction.giver) === "object" ){
            $scope.transaction.giver = $scope.transaction.giver.id;
        }

        if( typeof($scope.transaction.receiver) === "object" ){
            $scope.transaction.receiver = $scope.transaction.receiver.id;
        }

        MySQLService.insert('cashbook', {
            'columnNames' : ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
            'userData' : $scope.transaction
        });

        //Reset Transaction
        $scope.transaction = {
            description : "",
            amount : 0,
            giver: 0,
            receiver: 0,
            user_id: UserService.activeUser.id,
            status : UserService.activeUser.authLevel < 5 ? 0 : 1
        };
    }

});