app
    .directive('cashbookForm', function () {
        return {
            'restrict': 'E',
            'templateUrl': 'core/components/cashbookForm/cashbookForm.html',
            'controller': 'CashbookFormController',
            'replace:': true,
        }
    })
    .controller('CashbookFormController', function ($scope, UserService, MySQLService) {
        $scope.transaction = {
            id: 0,
            description: "",
            amount: 0,
            giver: 0,
            receiver: 0,
            user_id: UserService.activeUser.id,
            status: "COMPLETED"
        };

        $scope.accounts = [];

        $scope.init = function () {
            MySQLService.select("accounts").then(function (response) {
                $scope.accounts = response.data.rows;
            }).then(() => {
                jQuery("ui.dropdown").dropdown();
            });
        }

        $scope.add = function () {
            if (typeof ($scope.transaction.giver) === "object") {
                $scope.transaction.giver = $scope.transaction.giver.id;
            }

            if (typeof ($scope.transaction.receiver) === "object") {
                $scope.transaction.receiver = $scope.transaction.receiver.id;
            }

            if ($scope.transaction.amount === 0 || $scope.transaction.giver === 0 || $scope.receiver === 0) return;

            MySQLService.insert('cashbook', {
                'columnNames': ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
                'userData': {
                    description: $scope.transaction.description,
                    amount: $scope.transaction.amount,
                    giver: $scope.transaction.giver,
                    receiver: $scope.transaction.receiver,
                    user_id: UserService.activeUser.id,
                    status: $scope.transaction.status
                }
            }).then(function (response) {
                $scope.reset();
            })

        }

        $scope.update = function () {
            MySQLService.update('cashbook', {
                'andWhere': {
                    id: $scope.transaction.id
                },
                'userData': {
                    'giver': $scope.transaction.giver,
                    'receiver': $scope.transaction.receiver,
                    'description': $scope.transaction.description,
                    'amount': $scope.transaction.amount
                }
            }).then(function (response) {
                if (response.status === 200 && response.data.rowCount > 0) {
                    $scope.reset();
                } else {
                    alert("Error While Updating Data");
                }
            })
        }

        $scope.reset = function () {
            $scope.transaction = {
                description: "",
                amount: 0,
                giver: 0,
                receiver: 0,
                user_id: UserService.activeUser.id,
                status: "COMPLETED",
                id: 0
            };
        }

        $scope.$on('setTransaction', function (e, arg) {
            $scope.transaction = arg;
            jQuery("#giverField").dropdown('set selected', $scope.transaction.giver);
            jQuery("#receiverField").dropdown('set selected', $scope.transaction.receiver);
        });

        $scope.init();
    });