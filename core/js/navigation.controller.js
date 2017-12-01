app.controller('NavigationController', function ($scope, $location) {
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

    $scope.getClass = function (url) {
        var location = $location.url().substr(1);
        return location == url ? 'active' : '';
    }

    $scope.initDropdown = function () {
        jQuery(".ui.dropdown").dropdown();
    }
});