app.controller('MainController', function($scope, $location, $rootScope, UserService){
    $scope.user = UserService.activeUser;

    $scope.init = function(){
        UserService.retrieve();
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
})

.controller('AdminController', function(UserService, $location, $scope){
    $scope.init = function(){
        if( UserService.activeUser.authLevel < 5 ){
            $location.url("home");
        }
    }

    $scope.init();
})