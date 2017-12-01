app.controller('InsertTaskFormController', function($scope, $timeout, MySQLService, Categories){
    $scope.step = 1;
    $scope.customerName = "";
    $scope.amountCollected = 0;
    $scope.selectedCategory = {};
    $scope.remark = "";
    $scope.activeRefresh = true;

    $scope.categories = Categories.data;

    $scope.selectCategory = function(category){
        $scope.step = 2;
        $scope.selectedCategory = category;
        $scope.amountCollected = category.rate;
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

        var post = MySQLService.insert('cashbook', {
            'columnNames' : ['user_id', 'description', 'amount', 'direction', 'status'],
            'userData' : {
                description : $scope.customerName + " - " + $scope.selectedCategory.name,
                amount : $scope.amountCollected,
                direction : 0,
                user_id: $scope.$parent.user.id,
                status : $scope.$parent.user.authLevel < 5 ? 0 : 1
            }
        });
    }

    $scope.refreshTasks = function(){
        $scope.activeRefresh = false;
        $timeout(function(){
            $scope.activeRefresh = true;
        }, 5000);
        $scope.$emit("Get All Task");
    }
})