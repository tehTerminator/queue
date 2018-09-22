app.directive('taskForm', function () {
    return {
        restrict: 'E',
        templateUrl: 'core/components/taskForm/taskForm.html',
        controller: 'TaskFormController',
        scope: {}
    }
}).controller('TaskFormController', function ($scope, $rootScope, MySQLService, UserService) {
    $scope.step = 1;
    $scope.task = {
        customerName: "",
        amountCollected: 0,
        selectedCategory: {},
        remark: "",
        paid: true,
    };

    $scope.cashbook = {
        giver: {},
        receiver: {},
        amount: 0,
    }

    $scope.activeRefresh = true;
    $scope.categories = [];
    $scope.accounts = [];
    $scope.requireSeperateEntry = false;


    $scope.selectCategory = function (category) {
        $scope.step = 2;
        $scope.task.selectedCategory = category;
        $scope.task.amountCollected = Number(category.rate);
        $scope.requireSeperateEntry = category.bankPaymentRequired == 0 ? false : true;
    }

    $scope.refreshCategories = function () {
        var categoryUsageCount = {};
        $scope.categories = [];
        MySQLService.select('task', {
            columns: ['count(type) as usageToday', 'type'],
            andWhere: {
                "DATE(insertTime)": ["CURDATE()", "noQuotes"],
                "status": ["NOT IN", "REJECTED", "UNPAID", "LIST"],
            },
            'groupBy': 'type',
            "orderBy": "TYPE ASC"
        }).then(function (response) {
            angular.forEach(response.data.rows, function (item) {
                categoryUsageCount[item.type] = item.usageToday;
            });
        }).then(function () {
            MySQLService.select('categories').then(function (response) {
                angular.forEach(response.data.rows, function (item) {
                    if (categoryUsageCount[item.id] == undefined) {
                        item.usageToday = 0;
                    } else {
                        item.usageToday = categoryUsageCount[item.id];
                    }
                    $scope.categories.push(item);
                })
            })
        });
    }

    $scope.preview = function () {
        if ($scope.requireSeperateEntry == true && $scope.step == 2) {
            $scope.step = 3;
        } else {
            $scope.step = 4;
        }
    }

    $scope.goBack = function () {
        if ($scope.step == 4 && $scope.requireSeperateEntry == false) {
            $scope.step = 2;
        } else {
            $scope.step = $scope.step > 1 ? $scope.step - 1 : 1;
        }
    }

    $scope.submitData = function (approveTask) {
        const data = {
            customer: $scope.task.customerName,
            type: $scope.task.selectedCategory.id,
            insertedBy: UserService.activeUser.id,
            amountCollected: $scope.task.amountCollected,
            remark: $scope.task.remark,
        };

        if ($scope.task.paid === false) {
            data.status = "UNPAID";
        }

        if (typeof (approveTask) !== 'undefined' && approveTask === true) {
            data.endTime = new Date().toMysqlFormat();
            data.acceptedBy = UserService.activeUser.id;
            data.status = "COMPLETED";
        }

        MySQLService.insert('task', { 'userData': data }).then(function (response) {
            if (response.status === 200) {
                $rootScope.$broadcast('New Task', {
                    id: response.data.lastInsertId
                });
                $scope.createCashBookEntry(response.data.lastInsertId);
            }
        });
    }

    $scope.createCashBookEntry = function (taskId) {
        $scope.categories.find(x => x.id === $scope.task.selectedCategory.id).usageToday++;
        let cashBookEntryStatus = "PENDING";
        let finalAmount = $scope.task.amountCollected;

        if ($scope.task.status == "UNPAID") {
            cashBookEntryStatus = "UNPAID"
        }

        if ($scope.requireSeperateEntry === true) {
            //Create Seperate Entry in Cashbook
            const bankEntry = {
                description: "Paid for " + $scope.task.customerName + " - " + $scope.task.selectedCategory.name,
                user_id: UserService.activeUser.id,
                giver: $scope.cashbook.giver.id,
                receiver: $scope.cashbook.receiver.id,
                amount: $scope.cashbook.amount,
                status: cashBookEntryStatus
            }

            MySQLService.insert('cashbook', {
                'columns': ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
                'userData': bankEntry
            }).then(function (response) {
                if (response.status === 200) {
                    let cashbookId = response.data.lastInsertId;
                    $scope.relateTaskAndCashBook(taskId, cashbookId);
                }
            })
            finalAmount = $scope.task.amountCollected - $scope.cashbook.amount;
        }

        if (finalAmount > 0) {
            const userData = {
                description: "Sales - " + $scope.task.customerName + " - " + $scope.task.selectedCategory.name,
                user_id: UserService.activeUser.id,
                giver: $scope.accounts.find(x => x.name.toLowerCase() == 'commission').name,
                receiver: $scope.accounts.find(x => x.name.toLowerCase() == 'shop').name,
                amount: finalAmount,
                status: cashBookEntryStatus
            }

            MySQLService.insert('cashbook', {
                'columns': ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
                'userData': userData
            }).then(function (response) {
                if (response.status === 200) {
                    let cashbookId = response.data.lastInsertId;
                    $scope.relateTaskAndCashBook(taskId, cashbookId);
                }
                $scope.reset();
            });
        } else {
            $scope.reset();
        }
    }


    $scope.reset = () => {
        $scope.step = 1;
        $scope.task.customerName = "";
        $scope.task.paid = true;
    }

    $scope.init = () => MySQLService.select('accounts').then(response => $scope.accounts = response.data.rows);
    $scope.initDropdown = () => jQuery(".ui.dropdown").dropdown();
    $scope.relateTaskAndCashBook = (taskId, cashBookId) => MySQLService.insert('task_cashbook', { 'task_id': taskId, 'cashbook_id': cashBookId });

    $scope.init();
})