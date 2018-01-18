app.controller('CashbookController', function($scope, MySQLService, UserService){
    $scope.$on('InsertItem', function(event, request){
        var username = UserService.activeUser;

        MySQLService.insert('cashbook', request)
        .then(function(response){
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