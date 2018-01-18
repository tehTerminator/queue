var app = angular.module("MainApp", ['ngRoute']);
var serverLink = 'core/php/sql2.php';

app.config(function($routeProvider, $locationProvider){
    $routeProvider
        .when('/', {
            templateUrl : 'core/pages/home.html',
            controller : 'HomeController'
        })

        .when('/product', {
            templateUrl : 'core/pages/product.html',
        })

        .when('/cashbook', {
            templateUrl : 'core/pages/cashbook.html',
            controller : 'CashbookController'
        })

        .when('/task', {
            templateUrl : 'core/pages/task.html',
            controller : 'TaskPageController'
        })
        
        .when('/report', {
            templateUrl : 'core/pages/report.html',
        })
        
        .when('/admin', {
            templateUrl : 'core/pages/admin.html',
            controller : 'AdminController'
        })
        
        .when('/login', {
            templateUrl: 'core/pages/login.html',
            controller: 'LoginPageController'
        })

        .otherwise({
            redirectTo : '/'
        });

    $locationProvider
        .html5Mode(true);
})

.factory('MySQLService', function($http){
    var link = {
        response : {},

        execute : function(type, tableName, params){
            var request = {
                "queryType" : type,
                "tableName" : tableName,
                "params" : params
            }
            return $http.post(serverLink, request)
        },

        getResponse : function(){
            return link.response;
        },

        select : function(tableName, params){
            return link.execute("select", tableName, params);
        },

        insert : function(tableName, params){
            return link.execute("insert", tableName, params);
        },

        update : function(tableName, params){
            return link.execute("update", tableName, params);
        },

        delete : function(tableName, params ){
            return link.execute("delete", tableName, params);
        }
    }

    return link;
})

.factory('UserService', function(MySQLService, $location){
    var user = {};

    user.all = [];
    user.activeUser = {
        name : "Anonymous",
        authLevel : 0,
        isLoggedIn : false,
    };

    user.retrieve = function(){
        var post = MySQLService.select('user');

        post.then(function(response){
            if( response.status == 200 ){
                angular.forEach(response.data.serverData, function(item){
                    user[item.id] = item;
                    user.all.push(item);
                });
            }
        });
    }

    user.get = function(index){
        if( user[index] != undefined ){
            return user[index];
        } 
        else{
            return null;
        }
    }

    user.login = function(username, password){
        MySQLService.select('user', {
            conditions : {'name' : username, 'password' : password}
        })

        .then(function(response){
            if( response.status == 200 ){
                var data = response.data.serverData;

                if( data.length == 1 ){
                    user.activeUser = data[0];
                    user.activeUser.isLoggedIn = true;
                    $location.url('/');
                } 
                else{
                    user.activeUser = {name : "Anonymous", authLevel : 0, isLoggedIn : false }
                }
            }
        });
    }

    user.logout = function(){
        user.activeUser = {name : "Anonymous", authLevel : 0, isLoggedIn : false }
        $location.url("login");
    }

    user.isLoggedIn = function(){
        if( user.activeUser.isLoggedIn != undefined ) 
            return user.activeUser.isLoggedIn;
        else 
            return false;
    }

    return user;
})

.filter('dateToISO', function(){
    return function(input){
        if( typeof(input) == "undefined" ){
            input = new Date().toISOString();
        } else{
            input = new Date(input).toISOString();
        }

        return input;
    };
});

var STATUS = {
    REJECTED : -2,
    INACTIVE : -1,
    ACTIVE : 0,
    COMPLETED : 1,
    APPROVED : 2
}

var DIRECTION = {
    INCOME : 0,
    EXPENSE : 1,
}

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