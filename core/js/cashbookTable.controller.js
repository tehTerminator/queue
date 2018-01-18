app.controller('CashbookTableController', function($scope, MySQLService, UserService){
    $scope.cashbook = [];
    $scope.user = UserService.activeUser;
    $scope.accounts = {};

    $scope.getTodayCashbook = function(){

        var user = UserService.activeUser;

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
            console.log(response);
            angular.forEach(response.data.serverData, function(item){
                $scope.accounts[item.id] = item.name;
            })
        })
        .then(function(){
            MySQLService.select('cashbook', params)
            .then(function(response){
                if(response.status == 200){
                    //Success                
                    var data = response.data.serverData;
                    $scope.cashbook = [];
                    angular.forEach(data, function(item){
                        item.giver = $scope.accounts[item.giver];
                        item.receiver = $scope.accounts[item.receiver];
                        $scope.cashbook.push(item);
                    });
    
                    $scope.emitDataLoaded();
                }
            });        
        })
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

    $scope.$on('Insert Item', function(event, item){
        $scope.cashbook.push(item);
        $scope.$emit('DataLoaded', {data : $scope.cashbook.length});
    })

})