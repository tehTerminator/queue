app.controller('MainController', function($scope, $location, $rootScope, UserService, Categories){
    $scope.user = UserService.activeUser;

    $scope.init = function(){
        UserService.retrieve();
        Categories.retrieve();
    }

    $scope.forceLogin = function(){
        if( UserService.isLoggedIn() != true ){
            $location.url("login");
        }
    }

    $rootScope.$on('$routeChangeStart', function (next, last) {
        if( UserService.isLoggedIn() == false ){
            $location.url("login");
        }
    });

    $scope.initDropdown = function(){
        jQuery(".ui.dropdown").dropdown();
    }

    $scope.initCheckbox = function(){
        jQuery(".ui.checkbox").checkbox();
    }

    $scope.init();
});