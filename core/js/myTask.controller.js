app.controller("MyTaskController", function($scope, MySQLService, UserService){
    $scope.setStatus = function(task, statusCode){
        MySQLService.update('task', {
            'conditions' : {'id' : task.id},
            'columnNames' : ['status'],
            'userData' : {status : statusCode}
        })

        .then(function(response){
            task.status = statusCode;
            if( task.status == STATUS.REJECTED && task.amountCollected > 0 ){
                MySQLService.insert('cashbook', {
                    'columnNames' : ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
                    'userData' : {
                        'user_id' : UserService.activeUser.id,
                        'giver' : 2,
                        'receiver' : 1,
                        'description' : "Refunded Money to " + task.customer,
                        'amount' : task.amountCollected,
                        'status' : 1
                    }
                })
                .then($scope.$emit('Remove Task', task));
            } 
            else if ( ( task.status == STATUS.REJECTED && task.amountCollected == 0) || task.status == STATUS.COMPLETED ){
                $scope.$emit('Remove Task', task);
            } 
        });
    }

    $scope.unmark = function(task){
        task.acceptedBy = 0;
        task.status = STATUS.INACTIVE;
        var post = MySQLService.update('task', {
            conditions : {'id' : task.id},
            columnNames : ['status', 'acceptedBy'],
            'userData' : {status : STATUS.INACTIVE, acceptedBy : 0}
        });
    }
})