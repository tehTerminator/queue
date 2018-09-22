app
    .factory('MySQLService', function ($http) {
        var link = {
            response: {},

            execute: function (type, tableName, params) {
                const request = {
                    "queryType": type,
                    "tableName": tableName,
                    "params": params
                }

                if (typeof (params) == 'undefined ') {
                    delete(request.params);
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
        const userService = {};

        userService.users = [];
        userService.activeUser = {
            id: 0,
            name: "Anonymous"
        };

        userService.fetch = function () {
            const request = MySQLService.select('user');
            request.then(function (response) {
                if (response.status === 200) {
                    userService.users = response.data['rows'];
                }
            });
        }

        userService.get = function (index) {
            if (typeof (index) == 'undefined') {
                return userService.users;
            } else {
                const user = userService.users.find(x => x.id === index);
                if (typeof (user) == 'undefined') {
                    return {
                        'id': 0,
                        'name': "Anonymous",
                        'authLevel': -1
                    };
                } else {
                    return user;
                }
            }
        }

        userService.login = function (username, password) {
            MySQLService
                .select('user', {
                    'columns': ['id', 'name', 'authLevel'],
                    'andWhere': {
                        'name': username,
                        'password': password
                    }
                })

                .then(function (response) {
                    if (response.status == 200) {
                        console.log(response);
                        var data = response['data']['rows'];

                        if (data.length == 1) {
                            window.localStorage.setItem("username", username);
                            window.localStorage.setItem("password", password);
                            userService.activeUser = data[0];
                            userService.activeUser.isLoggedIn = true;
                            $location.url('/');
                        } else {
                            userService.activeUser = {
                                name: "Anonymous",
                                authLevel: 0,
                                isLoggedIn: false
                            }
                        }
                    }
                });
        }

        userService.logout = function () {
            userService.activeUser = {
                name: "Anonymous",
                authLevel: 0,
                isLoggedIn: false
            }
            window.localStorage.clear('username');
            window.localStorage.clear('password');
            $location.url("login");
        }

        userService.isLoggedIn = function () {
            if (userService.activeUser.isLoggedIn != undefined) {
                return userService.activeUser.isLoggedIn;
            } else {
                return false;
            }
        }

        return userService;
    });