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

});