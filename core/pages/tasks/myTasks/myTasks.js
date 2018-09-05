app
    .directive('availableTasks', function () {
        return {
            'restrict': 'E',
            'templateUrl': 'core/views/availableTasks.html'
        }
    })
    .directive('acceptedTasks', function () {
        return {
            'restrict': 'E',
            'templateUrl': 'core/views/acceptedTasks.html'
        }
    })
    .controller('MyTaskController', function ($scope, $timeout, $interval, MySQLService, UserService) {
        $scope.tasks = [];
        $scope.categories = [];
        $scope.users = Array.from(UserService.users);
        $scope.hideSelected = true;
        $scope.allowRefresh = true;
        $scope.toggleButtonText = "Show Selected";
        $scope.selectedCategoryId = 0;
        $scope.selectedUserId = 0;
        $scope.dates = [];
        $scope.filteredDate = 0;
        $scope.userId = UserService.activeUser.id;
        $scope.intervalPromise = null;

        $scope.init = function () {
            UserService.fetch();
            $scope.fetchCategories().then(function () {
                const today = new Date().toMysqlFormat();
                jQuery(".ui.dropdown").dropdown();
            });

            for (var i = 0; i < 4; i++) {
                var today = new Date();
                $scope.dates.push(today.setDate(today.getDate() - i));
            }
            $scope.setDate(new Date());
            $scope.intervalPromise = $interval(() => {
                $scope.fetchTasks();
            }, 10000);
        }

        $scope.$on('$destroy', function () {
            $interval.cancel($scope.intervalPromise);
        });

        $scope.fetchTasks = function () {
            const params = {
                'columns': ['task.*', 'categories.name as category', 'categories.logoUrl as logoUrl'],
                'andWhere': {
                    'status': ["NOT IN", "REJECTED", "COMPLETED", "APPROVED", "LIST"]
                },
                'join': 'join categories on task.type = categories.id'
            };
            MySQLService.select('task', params).then(function (response) {
                if (response.status === 200) {
                    $scope.tasks = [];
                    response.data.rows.forEach(element => {
                        element.insertedByUser = UserService.get(element.insertedBy).name;
                        element.acceptedByUser = UserService.get(element.acceptedBy).name;
                        $scope.tasks.push(element);
                    });
                }
            });
        }

        $scope.setStatus = function (task, status) {
            const request = {
                'andWhere': {
                    "id": task.id
                },
                "userData": {
                    'status': status
                }
            };

            if (status === 'COMPLETED') {
                request.userData['endTime'] = (new Date()).toMysqlFormat();
            }

            MySQLService.update('task', request).then(function (response) {
                if (response.status === 200) {
                    task.status = status;
                } else {
                    alert("Connection Broken, Please Wait or Try Again");
                }
            });
        }

        $scope.setRejected = function (task) {
            $scope.setStatus(task, "REJECTED")
        }

        $scope.setCompleted = function (task) {
            $scope.setStatus(task, "COMPLETED");
            $scope.tasks.splice($scope.tasks.indexOf(task), 1);
        }

        $scope.setActive = function (task) {
            $scope.setStatus(task, 'ACTIVE');
        }

        $scope.setInactive = function (task) {
            $scope.setStatus(task, 'INACTIVE');
        }

        $scope.select = function (task) {
            if (task.status == "UNPAID") {
                if (!confirm("Have You collected Payment for this Job, As this is Marked as Unpaid Job?")) {
                    return;
                }
            }
            const request = {
                "andWhere": {
                    "id": UserService.activeUser.id
                },
                "userData": {
                    "acceptedBy": userId
                }
            };

            let doTask = false;

            if (task.acceptedBy > 0 && UserService.activeUser.id != task.acceptedBy) {
                if (confirm("Task Already Accepted by " + task.acceptedByUser + " Do you want to transfer this Job?")) {
                    doTask = true;
                } else {
                    doTask = false;
                }
            } else if (task.acceptedBy == 0) {
                doTask = true;
            } else {
                doTask = false;
            }

            if (doTask) {
                MySQLService.update('task', request).then(function (response) {
                    if (response.status === 200) {
                        task.acceptedBy = UserService.activeUser.id
                        task.acceptedByUser = UserService.activeUser.name;
                    } else {
                        alert("Connection Broken, Please Wait or Try Again");
                    }
                });
            }

        }

        $scope.unselect = function (task) {
            const request = {
                "andWhere": {
                    "id": task.id
                },
                "userData": {
                    "acceptedBy": 0,
                    "status": "INACTIVE"
                }
            };
            MySQLService.update('task', request).then(function (response) {
                if (response.status === 200) {
                    task.status = "INACTIVE"
                    task.acceptedBy = 0;
                } else {
                    alert("Connection Broken, Please Wait or Try Again");
                }
            });
        }

        $scope.fetchCategories = function () {
            return MySQLService.select('categories').then(function (response) {
                if (response.status === 200) {
                    $scope.categories = response.data.rows;
                    $scope.fetchTasks();
                } else {
                    alert("Connection with Server Broken, Please Try Again After Some Time");
                }
            });
        }

        $scope.setDate = function (d) {
            if (d > 0) {
                $scope.filteredDate = new Date(d);
            } else {
                $scope.filteredDate = d;
            }
        }

        $scope.selectCategoryId = function (category) {
            if (category == 0) {
                $scope.selectedCategoryId = 0;
            } else {
                $scope.selectedCategoryId = category.id;
            }
        }

        $scope.selectUserId = function (user) {
            if (user == 0) {
                $scope.selectedUserId = 0;
            } else {
                $scope.selectedUserId = user.id;
            }
        }

        $scope.toggleFilter = function () {
            if ($scope.hideSelected == false) {
                $scope.hideSelected = true;
                $scope.toggleButtonText = "Show Selected";
            } else {
                $scope.hideSelected = false;
                $scope.toggleButtonText = "Hide Selected";
            }
        }

        $scope.refreshTasks = function () {
            $scope.allowRefresh = false;
            $timeout(function () {
                $scope.allowRefresh = true;
            }, 5000);
            $scope.fetchTasks();
        }

        $scope.getColor = function (item) {
            if (item.status == "INACTIVE" && item.acceptedBy == 0)
                return '';
            else if (item.status == "ACTIVE")
                return 'red';
            else if (item.status == "INACTIVE" && item.acceptedBy > 0)
                return 'orange';
            else if (item.status == "UNPAID")
                return 'teal';
            else if (item.status == "COMPLETED")
                return 'green';
            else if (item.status == "REJECTED")
                return 'inverted';
            else if (item.status == 'APPROVED')
                return 'blue';
        }

        $scope.init();

    })