app.controller('CashbookController', function($scope, MySQLService, UserService){
    $scope.$on('InsertItem', function(event, request){
        var username = UserService.activeUser;

        var result = MySQLService.insert('cashbook', request);
        
        result.then(function(response){
            console.log(response);
            if( response.status == 200 ){
                //Success
                var item = request.userData;
                item.datetime = (new Date()).toUTCString();
                item.id = response.data.lastInsertId;
                item.username = username;
                $scope.$broadcast('Insert Item', item);
            }
        });
    });
});