app.controller("MyTaskController", function($scope, MySQLService){
    $scope.setStatus = function(task, statusCode){
        var post = MySQLService.update('task', {
            'conditions' : {'id' : task.id},
            'columnNames' : ['status'],
            'userData' : {status : statusCode}
        });

        post.then(function(response){
            task.status = statusCode;
            if( task.status == STATUS.REJECTED || task.status == STATUS.COMPLETED ){
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