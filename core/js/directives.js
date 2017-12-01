app.directive('appRoot', function(){
    return{
        restrict: 'E',
        templateUrl: 'core/components/app-root.html',
        replace: true
    }
})

.directive('navBar', function(){
    return{
        restrict: 'E',
        templateUrl: 'core/components/navigation-bar.html',
        controller: 'NavigationController'
    }
})

.directive('cashbookForm', function(){
    return{
        restrict: 'E',
        templateUrl: 'core/components/cashbookForm.html',
        controller: 'CashbookFormController'
    }
})

.directive('cashbookTable', function(){
    return{
        restrict: 'E',
        templateUrl: 'core/components/cashbookTable.html',
    }
})

.directive('insertTaskForm', function(){
    return{
        restrict : 'E',
        templateUrl : 'core/components/insertForm.html',
        controller : 'InsertTaskFormController'
    }
})

.directive('listAllTask', function(){
    return {
        restrict : 'E',
        templateUrl : 'core/components/listAllTask.html',
        controller : 'AllTaskListController'
    }
})

.directive('myTasks', function(){
    return {
        restrict : 'E',
        templateUrl : 'core/components/myTaskSegment.html',
        controller : 'MyTaskController'
    }
})