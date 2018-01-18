app.controller('InsertTaskFormController', function($scope, $timeout, MySQLService, UserService){
    $scope.step = 1;
    $scope.customerName = "";
    $scope.amountCollected = 0;
    $scope.selectedCategory = {};
    $scope.remark = "";
    $scope.activeRefresh = true;
    $scope.categories = [];

    $scope.selectCategory = function(category){
        $scope.step = 2;
        $scope.selectedCategory = category;
        $scope.amountCollected = category.rate;
    }

    $scope.refreshCategories = function(){
        var categoryUsageCount = {};
        $scope.categories = [];
        MySQLService.select('task',{
                columnNames : ['count(type) as usageToday', 'type'],
                conditions : {"DATE(insertTime)" : "CURDATE()"},
                'GROUP BY' : 'type',
                "ORDER BY" : "TYPE ASC"
        })
        .then(function(response){
            angular.forEach(response.data.serverData, function(item){
                categoryUsageCount[item.type] = item.usageToday;
            });
        })
        .then(function(){
            MySQLService.select('categories')
            .then(function(response){
                angular.forEach(response.data.serverData, function(item){
                    if( categoryUsageCount[item.id] == undefined ){
                        item.usageToday = 0;
                    } else{
                        item.usageToday = categoryUsageCount[item.id];
                    }
                    $scope.categories.push( item );
                })
            })
        })
    }

    $scope.preview = function(){
        $scope.step = 3
    }

    $scope.goBack = function(){
        $scope.step = $scope.step > 1 ? $scope.step - 1 : 1;
    }

    $scope.submitData = function(){
        var data = {
            customerName : $scope.customerName,
            amountCollected : $scope.amountCollected,
            remark : $scope.remark,
            category : $scope.selectedCategory
        };

        $scope.$emit("CreateTask", data);
        $scope.categories[ $scope.categories.indexOf($scope.selectedCategory) ].usageToday++;
        $scope.step = 1;

        if( $scope.amountCollected > 0 ){
            MySQLService.insert('cashbook', {
                'columnNames' : ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
                'userData' : {
                    description : $scope.customerName + " - " + $scope.selectedCategory.name,
                    user_id: UserService.activeUser.id,
                    status : UserService.activeUser.authLevel < 5 ? 0 : 1,
                    giver : 1,
                    receiver: 2,
                    amount: $scope.amountCollected,
                }
            })
            .then($scope.customerName = "");
        }
    }

    $scope.refreshTasks = function(){
        $scope.activeRefresh = false;
        $timeout(function(){
            $scope.activeRefresh = true;
        }, 5000);
        $scope.$emit("Get All Task");
    }
})