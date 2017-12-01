app.controller('TaskPageController', function($scope, MySQLService, AllUsers){
    $scope.allTasks = [];
    $scope.activateRefresh = true;
    
    $scope.$on('CreateTask', function(event, args){
        var data = {
            columnNames : ["customer", "type", "insertedBy", "amountCollected", "remark"],
            userData : {
                customer : args.customerName,
                type : args.category.id,
                insertedBy : $scope.$parent.user.id,
                amountCollected : args.amountCollected,
                remark : args.remark
            }
        };

        var post = MySQLService.insert('task', data);

        post.then(function(response){
            console.log(response);
            if( response.status == 200 && response.data.serverData != undefined ){
                //Success
                var task = {
                    id : response.data.lastInsertId,
                    customer : args.customerName,
                    type : args.category.id,
                    jobType : args.category.name,
                    amountCollected : args.amountCollected,
                    endTime : null,
                    insertedBy : $scope.$parent.user.id,
                    insertedByUser : $scope.$parent.user.name,
                    accepectedBy : 0,
                    accepectedByUser : null,
                    status : -1,
                    remark : args.remark
                };

                $scope.allTasks.push( task );
            }
        });
    });

    $scope.$on('Remove Task', function(e, args){
        $scope.allTasks.splice( $scope.allTasks.indexOf(args), 1 );
    })


    $scope.getAllTask = function(){
        var post = MySQLService.select('task', {
            columnNames : ['task.*', 'categories.name as categoryName'],
            'join' : 'categories on categories.id = task.type',
            conditions : {'status' : ['<', 1]}
        });

        post.then(function(response){
            if( response.status == 200 && response.data.serverData.length > 0 ){
                $scope.myTasks = [];
                $scope.allTasks = [];
                angular.forEach(response.data.serverData, function(item){
                    if( item.acceptedBy != 0 ){
                        item.acceptedByUser = AllUsers.get(item.acceptedBy).name;
                    } 
                    $scope.allTasks.push(item);
                })
            }
        })
    }

    $scope.$on("Get All Task", function(e, args){
        $scope.getAllTask();
    })

    $scope.initAccordion = function(){
        jQuery(".ui.accordion").accordion();
    }

    $scope.initCheckbox = function(){
        jQuery(".ui.checkbox").checkbox();
    }

});