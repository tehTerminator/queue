app.directive('cashbookTable', function () {
        return {
            restrict: 'E',
            templateUrl: 'core/views/cashbookTable.html',
            replace: true
        }
    })
    .controller('EditTaskController', function ($scope, $routeParams, $location, $timeout, MySQLService, UserService) {
        $scope.task = {
            id: $routeParams.taskId
        };
        $scope.categories = [];
        $scope.accounts = [];
        $scope.cashbook = [];

        $scope.init = function () {
            MySQLService.select('categories').then(function (response) {
                if (response.status === 200) {
                    $scope.categories = response.data.rows;
                }
            }).then(function () {
                jQuery(".ui.dropdown").dropdown();
            }).then(function () {
                MySQLService.select('task', {
                    'andWhere': {
                        'task.id': $scope.task.id
                    },
                    'columns': ['task.*', 'categories.name as category', 'categories.logoUrl as logoUrl'],
                    'join': 'join categories on task.type = categories.id'
                }).then(function (response) {
                    if (response.status === 200) {
                        response.data.rows[0].amountCollected = Number(response.data.rows[0].amountCollected)
                        $scope.task = response.data.rows[0];
                    }
                }).then(function () {
                    $timeout(() => {
                        jQuery("#taskCategoryDropdown").dropdown('set selected', $scope.task.type);
                    }, 2000);
                }).then($scope.getCashbook());
            });
        }

        $scope.getCashbook = function () {
            MySQLService.select('accounts').then(function (response) {
                if (response.status === 200) {
                    $scope.accounts = response.data.rows;
                }
                MySQLService.select('cashbook', {
                    'andWhere': {
                        'id': ['IN', '(select cashbook_id from task_cashbook where task_id = ' + $scope.task.id + ')', "noQuotes"],
                    }
                }).then(function (response) {
                    if (response.status === 200) {
                        $scope.cashbook = [];
                        response.data.rows.forEach(function (item) {
                            item.giverName = $scope.accounts.find(x => x.id == item.giver)['name'];
                            item.receiverName = $scope.accounts.find(x => x.id == item.receiver)['name'];
                            item.postedBy = UserService.get(item.user_id)['name'];
                            $scope.cashbook.push(item);
                        })
                    }
                });
            })
        }

        $scope.save = function () {
            if (UserService.activeUser.authLevel < 5 && UserService.activeUser.id != $scope.task.insertedBy) {
                alert("You are not Authorised to Edit This Task");
                return;
            }

            MySQLService.update('task', {
                'andWhere': {
                    'id': $scope.task.id
                },
                'userData': {
                    'customer': $scope.task.customer,
                    'type': $scope.task.type.id,
                    'amountCollected': $scope.task.amountCollected
                }
            }).then(function (response) {
                console.log(response);
                if (response.status === 200 && response.data.rowCount > 0) {
                    $location.url("tasks/manage");
                } else {
                    alert("Server Error, Please Try Again Later");
                }
            })
        }

        $scope.editTransaction = function (transaction) {
            $scope.$broadcast('setTransaction', transaction);
        }

        $scope.$on('transactionUpdated', function (e, arg) {

        })
    })