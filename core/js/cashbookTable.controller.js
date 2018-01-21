app.controller('CashbookTableController', function($scope, MySQLService, UserService){
    $scope.cashbook = [];
    $scope.user = UserService.activeUser;
    $scope.accounts = {};
    $scope.isLoading = false;

    $scope.getTodayCashbook = function(){
        $scope.isLoading = true;
        var user = UserService.activeUser;
        $scope.cashbook = [];

        var params = {
            conditions : {
                'DATE(`datetime`)' : 'CURDATE()',
                'status' : ['>', -1]
            }
        };

        if( user.authLevel > 5 ){
            params.columnNames = ['cashbook.*', 'user.name as username']
            params.join = 'user on user.id = cashbook.user_id';
        } 
        else{
            params.conditions['user_id'] = user.id
        }

        MySQLService.select('accounts')
        .then(function(response){
            angular.forEach(response.data.serverData, function(item){
                $scope.accounts[item.id] = item.name;
            })
        })
        .then(function(){
            MySQLService.select('cashbook', params)
            .then(function(response){
                if(response.status == 200){
                    //Success                                   
                    angular.forEach(response.data.serverData, function(item){
                        item.giver = $scope.accounts[item.giver];
                        item.receiver = $scope.accounts[item.receiver];
                        $scope.cashbook.push(item);
                    });
                }
            });
            $scope.isLoading = false;        
        })
        .then($scope.emitDataLoaded());
    }

    $scope.changeStatus = function(transaction, status){
        
        //Makes sure either status is Either
        // 1 Approved*-*//
        // -1 Rejected
        status = status >= 1 ? 1 : -1;

        var params = {
            columnNames : ['status'],
            conditions : {'id' : transaction.id},
            userData : {'status' : status }
        };

        var result = MySQLService.update('cashbook', params);
 
        result.then(function(response){
            if(response.status == 200){
                //Success                
                var index = $scope.cashbook.indexOf(transaction);
                $scope.cashbook[index]['status'] = status;

                if( status == -1 ){
                    $scope.cashbook.splice(index, 1);
                }
            }
        });
    }

    $scope.emitDataLoaded = function(){
        $scope.$emit('DataLoaded', {data : $scope.cashbook.length});
    }

    $scope.$on('AddButtonClick', function(e, a){
        $scope.getTodayCashbook();
    })

})