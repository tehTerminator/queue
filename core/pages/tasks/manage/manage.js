app
    .controller('ManageTaskController', function ($scope, MySQLService, UserService) {
        $scope.tasks = [];
        $scope.myDate = new Date();

        $scope.fetchTasks = function () {
            const request = {
                'columns': ['task.*', 'categories.name as category', 'categories.logoUrl as logoUrl'],
                'andWhere': {
                    'DATE(insertTime)': ["DATE('" + $scope.myDate.toMysqlFormat() + "')", "noQuotes"]
                },
                'join': 'join categories on task.type = categories.id'
            };
            MySQLService.select('task', request).then(function (response) {
                $scope.tasks = [];
                response.data.rows.forEach(function (item) {
                    item.acceptedByUser = UserService.get(item.acceptedBy)['name'];
                    item.insertedByUser = UserService.get(item.insertedByUser)['name']
                    $scope.tasks.push(item);
                })
            });
        }

        $scope.approveTask = function (task) {
            console.log("Approve Task Called");
            const dontApproveIf = ["REJECTED", "INACTIVE", "APPROVED", "ACTIVE", "UNPAID"];
            if (dontApproveIf.find(x => x === task.status)) {
                alert("Sorry Cant Approve " + task.status + " task");
                return;
            }

            if (UserService.activeUser.authLevel < 5) {
                alert("You are not Authorised to Approve Task");
                return;
            }

            const request = {
                'andWhere': {
                    'id': task.id
                },
                'userData': {
                    'status': "APPROVED"
                }
            }

            MySQLService.update('task', request).then(function (response) {
                console.log(response);
                if (response.status === 200) {
                    task.status = "APPROVED";
                    $scope.updateCashbook(task);
                }
            });
        }

        $scope.updateCashbook = function (task) {
            let cashbookIds = [];
            MySQLService.select('task_cashbook', {
                'andWhere': {
                    'task_id': task.id
                }
            }).then(function (response) {
                if (response.status === 200) {
                    response.data.rows.forEach(function (element) {
                        cashbookIds.push(element['cashbook_id']);
                    });
                }
            }).then(function () {
                cashbookIds.forEach(function (item) {
                    MySQLService.update('cashbook', {
                        'andWhere': {
                            'id': item
                        },
                        'userData': {
                            'status': task.status
                        }
                    })
                });
            });
        }

        $scope.rejectTask = function (task) {
            console.log("Reject Task Called");
            const dontRejectIf = ['REJECTED', 'ACTIVE'];

            if (dontRejectIf.find(x => x === task.status)) {
                alert("Cant Reject " + task.status + " task");
                return;
            }

            if (task.status === "APPROVED" && UserService.activeUser.authLevel < 8) {
                alert("Sorry You are not Authorised to Reject Approved Task");
                return;
            }

            if (UserService.activeUser.authLevel < 5 && task.insertedBy != UserService.activeUser.id) {
                alert("Sorry you are not Authorised to Reject This Task");
                return;
            }

            MySQLService.update('task', {
                'andWhere': {
                    'id': task.id
                },
                'userData': {
                    'status': 'REJECTED'
                }
            }).then(function (response) {
                if (response.status === 200) {
                    task.status = 'REJECTED';
                    $scope.updateCashbook(task);
                }
            });
        }

    });