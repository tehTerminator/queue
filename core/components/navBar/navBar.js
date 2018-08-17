app
    .directive('navBar', function () {
        return {
            restrict: 'E',
            templateUrl: 'core/components/navBar/navBar.html',
            controller: 'NavigationController'
        }
    })

    .controller('NavigationController', function ($scope, $location, UserService) {
        $scope.user = UserService.activeUser;

        $scope.logout = function () {
            UserService.logout();
        }

        $scope.getClass = function (url) {
            var location = $location.url().substr(1);
            return location == url ? 'active' : '';
        }

        $scope.initDropdown = function () {
            jQuery(".ui.dropdown").dropdown();
        }

        $scope.$watch(function () {
            return UserService.activeUser;
        }, function (newUser) {
            $scope.user = newUser;
        })

        $scope.isLoggedIn = function () {
            return UserService.isLoggedIn();
        }
    });