app
    .factory('MySQLService', function ($http) {
        var link = {
            response: {},

            execute: function (type, tableName, params) {
                var request = {
                    "queryType": type,
                    "tableName": tableName,
                    "params": params
                }
                return $http.post(serverLink, request)
            },

            select: function (tableName, params) {
                return link.execute("select", tableName, params);
            },

            insert: function (tableName, params) {
                return link.execute("insert", tableName, params);
            },

            update: function (tableName, params) {
                return link.execute("update", tableName, params);
            },

            delete: function (tableName, params) {
                return link.execute("delete", tableName, params);
            }
        }

        return link;
    })

    .factory('UserService', function (MySQLService, $location) {
        var user = {};

        user.all = [];
        user.activeUser = {
            name: "Anonymous",
            authLevel: 0,
            isLoggedIn: false,
        };

        user.retrieve = function () {
            const request = MySQLService.select('user');
            request.then(function (response) {
                if (response.status === 200) {
                    user.all = response.data['rows'];
                }
            });
        }

        user.getUserById = function (index) {
            return user.all.find(x => x.id === index);
        }

        user.login = function (username, password) {
            MySQLService
                .select('user', {
                    'columns': ['id', 'name', 'authLevel'],
                    'andWhere': {
                        'name': username,
                        'password': password
                    }
                })

                .then(function (response) {
                    console.log(response);
                    if (response.status == 200) {
                        var data = response['data']['rows'];

                        if (data.length == 1) {
                            user.activeUser = data[0];
                            user.activeUser.isLoggedIn = true;
                            $location.url('/');
                        } else {
                            user.activeUser = {
                                name: "Anonymous",
                                authLevel: 0,
                                isLoggedIn: false
                            }
                        }
                    }
                });
        }

        user.logout = function () {
            user.activeUser = {
                name: "Anonymous",
                authLevel: 0,
                isLoggedIn: false
            }
            $location.url("login");
        }

        user.isLoggedIn = function () {
            if (user.activeUser.isLoggedIn != undefined) {
                return user.activeUser.isLoggedIn;
            } else {
                return false;
            }
        }

        return user;
    });