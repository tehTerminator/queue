app
    .controller('', function ($scope, $interval, MySQLService, UserService) {
        $scope.allTasks = [];
        $scope.users = UserService.all;

        $scope.$on('Remove Task', function (e, args) {
            $scope.allTasks.splice($scope.allTasks.indexOf(args), 1);
        });


        $scope.getAllTask = function () {

            MySQLService
                .select('task', {
                    columnNames: ['task.*', 'categories.name as categoryName', 'categories.logoUrl as logoUrl'],
                    'join': 'categories on categories.id = task.type',
                    conditions: {
                        'status': ['BETWEEN', -1, 0]
                    },
                })

                .then(function (response) {
                    if (response.status == 200 && response.data.serverData.length > 0) {
                        $scope.allTasks = [];
                        angular.forEach(response.data.serverData, function (item) {
                            item.id = Number.parseInt(item.id);
                            if (item.acceptedBy != 0) {
                                item.acceptedByUser = UserService.get(item.acceptedBy).name;
                            }
                            $scope.allTasks.push(item);
                        })
                    }
                })
        }

        $scope.$on("Get All Task", function (e, args) {
            $scope.getAllTask();
        })

        $scope.initCheckbox = function () {
            jQuery(".ui.checkbox").checkbox();
        }

        $scope.init = function () {
            pollTask = $interval(function () {
                $scope.getAllTask();
            }, 60000);
        }

        $scope.setStatus = function (task, statusCode) {
            if (statusCode == "REJECTED") {
                if (!confirm("Do You Really Wish To Delete This Job ")) {
                    return;
                }
            }
            MySQLService
                .update('task', {
                    'andWhere': {
                        'id': task.id
                    },
                    'columns': ['status'],
                    'userData': {
                        status: statusCode
                    }
                })

                .then(function (response) {
                    task.status = statusCode;
                    if (task.status == STATUS.REJECTED && task.amountCollected > 0) {
                        MySQLService.insert('cashbook', {
                                'columns': ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
                                'userData': {
                                    'user_id': UserService.activeUser.id,
                                    'giver': 2,
                                    'receiver': 10,
                                    'description': "Refunded Money to " + task.customer,
                                    'amount': task.amountCollected,
                                    'status': 1
                                }
                            })
                            .then($scope.$emit('Remove Task', task));
                    } else if ((task.status == STATUS.REJECTED && task.amountCollected == 0) || task.status == STATUS.COMPLETED) {
                        $scope.$emit('Remove Task', task);
                    }
                });
        }

        $scope.unmark = function (task) {
            task.acceptedBy = 0;
            task.status = STATUS.INACTIVE;
            MySQLService.update('task', {
                conditions: {
                    'id': task.id
                },
                columnNames: ['status', 'acceptedBy'],
                'userData': {
                    status: STATUS.INACTIVE,
                    acceptedBy: 0
                }
            });
        }

        $scope.init();

    });