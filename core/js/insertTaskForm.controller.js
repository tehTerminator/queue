app.controller('InsertTaskFormController', function($scope, $timeout, MySQLService, UserService){
    $scope.step = 1;
    $scope.task = {
        customerName : "",
        amountCollected : 0,
        selectedCategory : {},
        remark : ""
    }

    $scope.cashbook = {
        giver : {},
        receiver: {},
        amount : 0,
    }

    $scope.activeRefresh = true;
    $scope.categories = [];
    $scope.accounts = [];
    $scope.requireSeperateEntry = false;

    $scope.init = function(){
        MySQLService.select('accounts')
        .then(function(response){
            $scope.accounts = response.data.serverData;
        });
    }

    $scope.selectCategory = function(category){
        $scope.step = 2;
        $scope.task.selectedCategory = category;
        $scope.task.amountCollected = category.rate;
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
        if( $scope.requireSeperateEntry == true && $scope.step == 2){
            $scope.step = 3;
        } else{
            $scope.step = 4;
        }
    }

    $scope.goBack = function(){
        if( $scope.step == 4 && $scope.requireSeperateEntry == false ){
            $scope.step = 2;
        } else{
            $scope.step = $scope.step > 1 ? $scope.step - 1 : 1;
        }
    }

    $scope.submitData = function(){

        var data = {
            customerName : $scope.task.customerName,
            amountCollected : $scope.task.amountCollected,
            remark : $scope.task.remark,
            category : $scope.task.selectedCategory
        };

        $scope.$emit("CreateTask", data);
        $scope.categories[ $scope.categories.indexOf($scope.task.selectedCategory) ].usageToday++;
        $scope.step = 1;

        if( $scope.requireSeperateEntry == true ){
            //Create Seperate Entry in Cashbook
            MySQLService.insert('cashbook', {
                'columnNames' : ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
                'userData' : {
                    description : "Paid for "  + $scope.task.customerName + " - " + $scope.task.selectedCategory.name,
                    user_id : UserService.activeUser.id,
                    status : UserService.activeUser.authLevel < 5 ? 0 : 1,
                    giver : $scope.cashbook.giver.id,
                    receiver : $scope.cashbook.receiver.id,
                    amount : $scope.cashbook.amount
                }
            })
            $scope.task.amountCollected = $scope.task.amountCollected - $scope.cashbook.amount;
        }

        if( $scope.task.amountCollected > 0 ){
            MySQLService.insert('cashbook', {
                'columnNames' : ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
                'userData' : {
                    description : "Sales For " + $scope.task.customerName + " - " + $scope.task.selectedCategory.name,
                    user_id: UserService.activeUser.id,
                    status : UserService.activeUser.authLevel < 5 ? 0 : 1,
                    giver : 1,
                    receiver: 2,
                    amount: $scope.task.amountCollected,
                }
            })
        }
        $scope.task.customerName = "";
    }

    $scope.init();
})