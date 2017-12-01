app.controller('MainController', function($scope, $location, $rootScope, AllUsers, Categories){
    $scope.user = {
        name: 'User',
        password: '',
        authLevel: 0,
        isLoggedIn: false
    };

    $scope.allUsers = AllUsers.data;

    $scope.init = function(){
        AllUsers.retrieve();
        Categories.retrieve();
    }

    $scope.isLoggedIn = function(){
        return $scope.user.isLoggedIn;
    }

    $scope.getUser = function(){
        return $scope.user;
    }

    $scope.setUser = function(user){
        $scope.user = user;
        $scope.user['isLoggedIn'] = true;
        $scope.user.authLevel = Number(user.authLevel);

        console.log( $scope.user );
    }

    $scope.logout = function(){
        $scope.user = {
            name: 'User',
            password: '',
            authLevel: 0,
            isLoggedIn: false
        };

        $location.url("login");
    }

    $scope.forceLogin = function(){
        if( $scope.user.isLoggedIn != true ){
            $location.url("login");
        }
    }

    $rootScope.$on('$routeChangeStart', function (next, last) {
        if( $scope.user.isLoggedIn == false ){
            $location.url("login");
        }
    });

    $scope.init();
});