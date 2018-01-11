app.controller('NavigationController', function ($scope, $location, UserService) {
    $scope.menuItems = [
        {
            title: 'Home',
            url: '',
            icon: 'home'
        },
        {
            title: 'Products',
            url: 'product',
            icon: 'cart'
        },
        {
            title: 'Tasks',
            url: 'task',
            icon: 'pencil'
        },
        {
            title: 'Cash Book',
            url: 'cashbook',
            icon: 'money'
        },
        {
            title: 'Report',
            url: 'report',
            icon: 'print'
        },
        {
            title: 'Admin',
            url: 'admin',
            icon: 'wrench'
        }
    ];

    $scope.user = UserService.activeUser;

    $scope.logout = function(){
        UserService.logout();
    }

    $scope.getClass = function (url) {
        var location = $location.url().substr(1);
        return location == url ? 'active' : '';
    }

    $scope.initDropdown = function () {
        jQuery(".ui.dropdown").dropdown();
    }

    $scope.$watch(function(){
        return UserService.activeUser;
    }, function(newUser){
        $scope.user = newUser;
    })

    $scope.isLoggedIn = function(){
        return UserService.isLoggedIn();
    }
});