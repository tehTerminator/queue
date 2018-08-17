app.controller('TaskPageController', function($scope, $interval, MySQLService, UserService){
    $scope.allTasks = [];
    $scope.users = UserService.all;

    $scope.$on('CreateTask', function(event, args){
        var data = {
            columnNames : ["customer", "type", "insertedBy", "amountCollected", "remark"],
            userData : {
                customer : args.customerName,
                type : args.category.id,
                insertedBy : UserService.activeUser.id,
                amountCollected : args.amountCollected,
                remark : args.remark
            }
        };

        MySQLService.insert('task', data)
        .then(function(response){
            if( response.status == 200 && response.data.serverData != undefined ){
                //Success
                var task = {
                    id : response.data.lastInsertId,
                    customer : args.customerName,
                    type : args.category.id,
                    jobType : args.category.name,
                    amountCollected : args.amountCollected,
                    endTime : null,
                    insertedBy : UserService.activeUser.id,
                    insertedByUser : UserService.activeUser.name,
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
    });


    $scope.getAllTask = function(){

        MySQLService.select('task', {
            columnNames : ['task.*', 'categories.name as categoryName', 'categories.logoUrl as logoUrl'],
            'join' : 'categories on categories.id = task.type',
            conditions : {'status' : ['BETWEEN', -1, 0]},
        })

        .then(function(response){
            if( response.status == 200 && response.data.serverData.length > 0 ){
                $scope.allTasks = [];
                angular.forEach(response.data.serverData, function(item){
                    item.id = Number.parseInt(item.id);
                    if( item.acceptedBy != 0 ){
                        item.acceptedByUser = UserService.get(item.acceptedBy).name;
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

    $scope.init = function(){
        pollTask = $interval(function(){
            $scope.getAllTask();
        }, 60000);
    }

    $scope.init();

});