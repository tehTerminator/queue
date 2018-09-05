const app = angular.module("MainApp", ['ngRoute']);
const serverLink = 'core/php/sql.php';

app
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'core/pages/home/home.html',
                controller: 'HomeController'
            })

            .when('/products', {
                templateUrl: 'core/pages/products/products.html',
                controller: 'ProductsController'
            })

            .when('/cashbook', {
                templateUrl: 'core/pages/cashbook/cashbook.html',
            })

            .when('/tasks/myTasks', {
                templateUrl: 'core/pages/tasks/myTasks/myTasks.html',
                controller: 'MyTaskController'
            })

            .when('/tasks/liveView', {
                templateUrl: 'core/pages/tasks/liveView/liveView.html',
                controller: 'LiveViewController'
            })

            .when('/tasks/manage', {
                templateUrl: 'core/pages/tasks/manage/manage.html',
                controller: 'ManageTaskController'
            })

            .when('/task/edit/:taskId', {
                templateUrl: 'core/pages/tasks/edit/edit.html',
                controller: 'EditTaskController'
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
    })
    .filter('rupee', function () {
        return function (input) {
            input = Number(input).toFixed(2);
            return "Rs. " + input;
        }
    })
    .filter('HideTask', function () {
        return function (list, hideSelected) {
            var filtered = [];

            if (hideSelected == false) {
                return list;
            } else {
                angular.forEach(list, function (item) {
                    if (item.acceptedBy == 0) {
                        filtered.push(item);
                    }
                });

                return filtered;
            }

        }
    })

    .filter('DateFilter', function () {
        return function (list, date) {
            var filtered = [];
            if (typeof (list) == "undefined") {
                return list;
            } else if (typeof (date) == "object") {
                angular.forEach(list, function (item) {
                    var insertTime = new Date(item.insertTime);
                    if ((date.getDate() === insertTime.getDate()) && (date.getMonth() === insertTime.getMonth())) {
                        filtered.push(item);
                    }
                });
            } else if (typeof (date) == 'number' && date < 0) {
                angular.forEach(list, function (item) {
                    var d = new Date(),
                        insertTime = new Date(item.insertTime);
                    d.setDate(d.getDate() - 5);
                    if (d > insertTime) {
                        filtered.push(item);
                    }
                });
            } else if (typeof (date) == 'number' && date == 0) {
                return list;
            }

            return filtered;
        }
    })

    .filter('CategoryFilter', function () {
        return function (list, categoryId) {
            if (categoryId == 0) {
                return list;
            } else if (typeof (list) == "undefined") {
                return list;
            } else {
                return list.filter(x => x.type == categoryId);
            }
        }
    })

    .filter('UserFilter', function () {
        return function (list, userId) {
            if (userId == 0) {
                return list;
            } else if (typeof (list) == "undefined") {
                return list;
            } else {
                return list.filter(x => x.acceptedBy == userId);
            }
        }
    })

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

/** 
 * You first need to create a formatting function to pad numbers to two digits…
 **/
function twoDigits(d) {
    if (0 <= d && d < 10) return "0" + d.toString();
    if (-10 < d && d < 0) return "-0" + (-1 * d).toString();
    return d.toString();
}

/**
 * …and then create the method to output the date string as desired.
 * Some people hate using prototypes this way, but if you are going
 * to apply this to more than one Date object, having it as a prototype
 * makes sense.
 **/
Date.prototype.toMysqlFormat = function () {
    return this.getFullYear() + "-" + twoDigits(1 + this.getMonth()) + "-" + twoDigits(this.getDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getMinutes()) + ":" + twoDigits(this.getSeconds());
};