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
        var userService = {};

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
                        var data = response['data']['rows'];

                        if (data.length == 1) {
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
    })

    .factory('CategoryService', function (MySQLService) {
        const categoryService = {};
        categoryService.categories = [];

        categoryService.fetch = function () {
            return MySQLService.select('categories').then(function (response) {
                categoryService.categories = response.data.rows
            });
        }

        categoryService.get = function (id) {
            return categoryService.categories.find(x => x.id === id);
        }

        return categoryService;
    })

    .factory('TaskService', function (MySQLService, UserService) {
        const taskService = {};
        taskService.tasks = [];

        taskService.retrieveTasks = function (params) {
            MySQLService.select('task', params).then(function (response) {
                response.data.rows.forEach(element => {
                    element.insertedByUser = UserService.getUserById(element.insertedBy).name;
                    element.acceptedByUser = UserService.getUserById(element.acceptedBy).name;
                });
                taskService.data = response.data.rows;
            });
        }

        taskService.insert = function (task) {
            return MySQLService.insert('task', task);
        }

    })

    .factory('CashbookService', function (MySQLService, AccountService, UserService) {
        const cashbookService = {};
        cashbookService.data = [];

        cashbookService.fetch = function () {
            return MySQLService.select('cashbook', request).then(function (response) {
                cashbookService.data = response.data.rows;
                cashbookService.data.forEach(element => {
                    element.giverName = AccountService.get(element.giver);
                    element.receiverName = AccountService.get(element.receiver);
                    element.userName = UserService.get(element.user_id);
                });
            });
        }

        return cashbookService;
    })

    .factory('AccountService', function (MySQLService) {
        const accountService = {};
        accountService.accounts = [];

        accountService.init = function () {
            MySQLService.select('accounts').then(function (response) {
                accountService.accounts = response.data.rows;
            });
        }

        accountService.get = function (id) {
            return this.accounts.accounts.find(x => x.id === id);
        }

        return accountService;
    });