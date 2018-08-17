const app = angular.module("MainApp", ['ngRoute']);
const serverLink = 'core/php/sql.php';

app.config(function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'core/pages/home/home.html',
                controller: 'HomeController'
            })

            .when('/product', {
                templateUrl: 'core/pages/products/product.html',
            })

            .when('/cashbook', {
                templateUrl: 'core/pages/cashbook/cashbook.html',
            })

            .when('/task', {
                templateUrl: 'core/pages/tasks/tasks.html',
                controller: 'TaskPageController'
            })

            .when('/report', {
                templateUrl: 'core/pages/reports/report.html',
            })

            .when('/admin', {
                templateUrl: 'core/pages/admin/admin.html',
                controller: 'AdminController'
            })

            .when('/login', {
                templateUrl: 'core/pages/login/login.html',
                controller: 'LoginPageController'
            })

            .otherwise({
                redirectTo: '/'
            });

        $locationProvider
            .html5Mode(true);
    })
    .filter('dateToISO', function () {
        return function (input) {
            if (typeof (input) == "undefined") {
                input = new Date().toISOString();
            } else {
                input = new Date(input).toISOString();
            }

            return input;
        };
    });

function timeDiff(end, start) {
    var ms = end - start;
    var output = ""
    var seconds = Math.round((ms / 1000) % 60);

    output = seconds + " Seconds";

    ms = (ms / 1000) - seconds;
    if (ms > 0) {
        var minutes = Math.round((ms / 60) % 60);
        output = minutes + " Minutes " + output;
        ms = (ms / 60) - minutes;

        if (ms > 0) {
            var hours = Math.round((ms / 60) % 24);
            output = hours + " Hours " + output;
            ms = (ms / 60) - hours;

            if (ms > 0) {
                var days = Math.round((ms / 24) % 7);
                output = days + " Days " + output;
                ms = (ms / 24) - days;

                if (ms > 0) {
                    var weeks = Math.round((ms / 7) % 30);
                    output = weeks + " Week " + output;
                    ms = ms / 7 - weeks;

                    if (ms > 0) {
                        output = ms + " Month " + output;
                    }
                }
            }
        }
    }

    return output;
}