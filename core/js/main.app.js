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
        var request = MySQLService.select('user', {
            conditions : {'name' : username, 'password' : password}
        });

        request.then(function(response){
            console.log(response);
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

.factory('Categories', function(MySQLService){
    var cat = {};
    cat.data = [];

    cat.retrieve = function(){
        var post2 = MySQLService.select('task', {
            columnNames : ['count(type) as usageToday', 'type'],
            conditions : {"DATE(insertTime)" : "CURDATE()"},
            'GROUP BY' : 'type',
            "ORDER BY" : "TYPE ASC"
        });

        post2.then(function(response){
            var count = {};
            angular.forEach(response.data.serverData, function(item){
                count[item.type] = item.usageToday;
            })
            
            var post = MySQLService.select('categories');
    
            post.then(function(response){
                console.log(response);
                angular.forEach(response.data.serverData, function(item){
                    cat[item.id] = item;
                    if( count[item.id] != undefined ){
                        item.usageToday = count[item.id]
                    } else{
                        item.usageToday = 0;
                    }
                    cat.data.push(item);
                });
            });
        });
    } 

    cat.get = function(id){
        return cat[id];
    }

    return cat;

})

.factory('ProductService', function(MySQLService){
    var products = {};
    products.all = [];

    products.retrive = function(){
        MySQLService.select('products')

        .then(function(response){
            if( response.status == 200 ){
                angular.forEach(response.data.serverData, function(item){
                    products[item.id] = item;
                    products.all.push(item);
                });
            }
        });
    }

    products.get = function(index){
        return products.all[index];
    }

    products.insert = function(productName, initialQuantity){
        MySQLService.insert('product', {
            columnNames : ['name', 'quantity'],
            userData : {name : productName, quantity : initialQuantity}
        })

        .then(function(response){
            if( response.status == 200 ){
                products.all.push({
                    id : response.data.serverData.lastInsertId,
                    name : productName,
                    quantity : initialQuantity
                })
            }
        });
    }

    products.recordUsage = function(transaction){

        var description = transaction.description + " " + transaction.product.name + " " + transaction.quantity;
        MySQLService.insert('cashbook', {
            'columnNames' : ['user_id', 'description', 'amount', 'direction', 'status'],
            userData : {
                "user_id"       : transaction.user_id,
                "description"   : description,
                "amount"        : transaction.amount,
                "direction"     : transaction.direction,
                "status"        : transaction.status,
            }
        })

        .then(function(response){
            console.log(response);
            transaction.product_id = transaction.product.id;
            delete( transaction.product );
            delete( transaction.description );

            transaction['cashbook_id'] = response.data.lastInsertId

            console.log( transaction );
            MySQLService.insert('product_transaction', {
                columnNames : ['product_id', 'quantity', 'user_id', 'cashbook_id', 'direction', 'amount', 'status'],
                userData : transaction
            });
        });
    }

    return products;
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
    IN : 0,
    OUT : 1,
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