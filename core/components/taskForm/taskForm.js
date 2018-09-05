app
    .directive('taskForm', function () {
        return {
            restrict: 'E',
            templateUrl: 'core/components/taskForm/taskForm.html',
            controller: 'TaskFormController',
            scope: {}
        }
    })
    .controller('TaskFormController', function ($scope, $rootScope, MySQLService, UserService) {
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

        $scope.init = function () {
            MySQLService
                .select('accounts')
                .then(function (response) {
                    $scope.accounts = response.data.rows;
                });

            $scope.task.paid = true;
        }

        $scope.selectCategory = function (category) {
            $scope.step = 2;
            $scope.task.selectedCategory = category;
            $scope.task.amountCollected = Number(category.rate);
            $scope.requireSeperateEntry = category.bankPaymentRequired == 0 ? false : true;
        }

        $scope.refreshCategories = function () {
            var categoryUsageCount = {};
            $scope.categories = [];
            MySQLService
                .select('task', {
                    columns: ['count(type) as usageToday', 'type'],
                    andWhere: {
                        "DATE(insertTime)": ["CURDATE()", "noQuotes"],
                        "status": ["NOT IN", "REJECTED", "UNPAID", "LIST"],
                    },
                    'GROUP BY': 'type',
                    "ORDER BY": "TYPE ASC"
                })
                .then(function (response) {
                    angular.forEach(response.data.rows, function (item) {
                        categoryUsageCount[item.type] = item.usageToday;
                    });
                })
                .then(function () {
                    MySQLService
                        .select('categories')
                        .then(function (response) {
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

            MySQLService
                .insert('task', {
                    'userData': data
                })
                .then(function (response) {
                    $scope.createCashBookEntry();
                    $rootScope.$broadcast('New Task', {
                        id: response.data.lastInsertId
                    });
                });
        }

        $scope.createCashBookEntry = function () {
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

                MySQLService
                    .insert('cashbook', {
                        'columns': ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
                        'userData': bankEntry
                    })
                finalAmount = $scope.task.amountCollected - $scope.cashbook.amount;
            }

            if (finalAmount > 0) {
                const userData = {
                    description: "Sales - " + $scope.task.customerName + " - " + $scope.task.selectedCategory.name,
                    user_id: UserService.activeUser.id,
                    giver: 10,
                    receiver: 2,
                    amount: finalAmount,
                    status: cashBookEntryStatus
                }

                MySQLService
                    .insert('cashbook', {
                        'columns': ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
                        'userData': userData
                    })
                    .then(function (response) {
                        $scope.reset();
                    });
            }
        }

        $scope.reset = function () {
            $scope.step = 1;
            $scope.task.customerName = "";
            $scope.task.paid = true;
        }

        $scope.initDropdown = function () {
            jQuery(".ui.dropdown").dropdown();
        }

        $scope.init();
    })