app.controller('CashbookController', function($scope, MySQLService){
    $scope.cashbook = [];

    $scope.$on('InsertItem', function(event, request){

        var username = $scope.$parent.user.name;

        var result = MySQLService.insert('cashbook', request.params);
        
        result.then(function(response){
            console.log(response);
            if( response.status == 200 ){
                //Success
                var item = request.params.userData;
                item.datetime = (new Date()).toUTCString();
                item.id = response.data.lastInsertId;
                item.username = username;
                $scope.cashbook.push(item);
            }
        });
    });

    $scope.getTodayCashbook = function(){
        var user = $scope.$parent.getUser();

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

        var result = MySQLService.select('cashbook', params);

        result.then(function(response){
            if(response.status == 200){
                //Success                
                var data = response.data.serverData;
                $scope.cashbook = [];
                angular.forEach(data, function(item){
                    $scope.cashbook.push(item);
                });
            }
        });        
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

});