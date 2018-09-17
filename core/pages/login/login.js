app.controller('LoginPageController', function ($scope, UserService) {
    $scope.user = {
        name: '',
        password: '',
    };

    $scope.warning = false;

    $scope.login = function () {
        UserService.login($scope.user.name, $scope.user.password);
        $scope.warning = true;
    }

    $scope.reset = function () {
        $scope.user = {
            name: '',
            password: '',
        };
        $scope.warning = false;
    }

    $scope.init = function () {
        let username = window.localStorage.getItem('username');
        let password = window.localStorage.getItem('password');

        if (typeof (username) != 'undefined' && typeof ('password') != 'undefined') {
            $scope.user.name = username;
            $scope.user.password = password;
            $scope.login();
        }
    }

    $scope.init();

});