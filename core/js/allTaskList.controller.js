app.controller('AllTaskListController', function ($scope, MySQLService, Categories) {
        $scope.hideSelected = false;
        $scope.toggleButtonText = "Hide Selected";
        $scope.categories = Categories.data;
        $scope.selectedCategoryId = 0;
        $scope.selectedUserId = 0;

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