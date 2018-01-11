app.controller('AllTaskListController', function ($scope, MySQLService, Categories) {
    $scope.hideSelected = false;
    $scope.toggleButtonText = "Hide Selected";
    $scope.categories = Categories.data;
    $scope.selectedCategoryId = 0;
    $scope.selectedUserId = 0;
    $scope.dates = [];
    $scope.filteredDate = 0;

    $scope.init = function(){
        for(var i = 0; i < 5; i++){
            var today = new Date();
            $scope.dates.push( today.setDate( today.getDate() - i ) );
        }
    }

    $scope.setDate = function(d){
        if( d > 0 ){
            $scope.filteredDate = new Date(d);
        } else{
            $scope.filteredDate = d;
        }
    }

    $scope.acceptTask = function (task) {
        var result = MySQLService.update('task', {
            columnNames: ['acceptedBy'],
            conditions: {
                id: task.id
            },
            userData: {
                'acceptedBy': $scope.$parent.user.id
            }
        });


        result.then(function (response) {
            if (response.status == 200) {
                task.acceptedBy = $scope.$parent.user.id;
                task.acceptedByUser = $scope.$parent.user.name;
            }
        });
    }

    $scope.selectCategoryId = function (category) {
        if( category == 0 ){
            $scope.selectedCategoryId = 0;
        } 
        else{
            $scope.selectedCategoryId = category.id;
        }
    }
    
    $scope.selectUserId = function (user) {
        if( user == 0 ){
            $scope.selectedUserId = 0;
        } 
        else{
            $scope.selectedUserId = user.id;
        }
    }

    $scope.toggleFilter = function () {
        if ($scope.hideSelected == false) {
            $scope.hideSelected = true;
            $scope.toggleButtonText = "Show Selected";
        } else {
            $scope.hideSelected = false;
            $scope.toggleButtonText = "Hide Selected";
        }
    }

    $scope.getColor = function (item) {
        if (item.status == STATUS.REJECTED)
            return 'inverted';
        else if (item.status == STATUS.INACTIVE)
            return 'grey';
        else if (item.status == STATUS.ACTIVE)
            return 'red'
        else if (item.status == STATUS.COMPLETED)
            return 'green'
        else if (item.status == STATUS.APPROVED)
            return 'blue'
    }

    $scope.init();
})

.filter('HideTask', function () {
    return function (list, hideSelected) {
        var filtered = [];

        if (hideSelected == false) {
            return list;
        } else {
            angular.forEach(list, function (item) {
                if (item.acceptedBy == 0) {
                    filtered.push(item);
                }
            });

            return filtered;
        }

    }
})

.filter('DateFilter', function(){
    return function(list, date){
        var filtered = [];
        if( typeof(date) == "object" ){
            angular.forEach(list, function(item){
                var insertTime = new Date(item.insertTime);
                if( date.getDate() === insertTime.getDate() ){
                    filtered.push(item);
                }
            });
        } else if(typeof(date) == 'number' && date < 0 ){
            angular.forEach(list, function(item){
                var d = new Date(),
                insertTime = new Date(item.insertTime);
                d.setDate( d.getDate() - 5 );
                if( d > insertTime ){
                    filtered.push(item);
                }
            });
        } 
        else if( typeof(date) == 'number' && date == 0 ){
            return list;
        }

        return filtered;
    }
})

.filter('CategoryFilter', function(){
    return function(list, categoryId){
        if( categoryId == 0 ){
            return list;
        } else{
            var filtered = [];
            angular.forEach(list, function(item){
                if( item.type == categoryId ){
                    filtered.push( item ); 
                }
            });

            return filtered;
        }
    }
})

.filter('UserFilter', function(){
    return function(list, userId){
        if( userId == 0 ){
            return list;
        } else{
            var filtered = [];
            angular.forEach(list, function(item){
                if( item.acceptedBy == userId ){
                    filtered.push( item ); 
                }
            });

            return filtered;
        }
    }
})