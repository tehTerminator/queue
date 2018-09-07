app
    .directive('productUsageForm', function () {
        return {
            templateUrl: 'core/components/productUsageForm/productUsageForm.html',
            controller: 'ProductUsageFormController',
            replace: true
        };
    })
    .controller('ProductUsageFormController', function ($scope, UserService, MySQLService) {

        $scope.products = [];

        $scope.transaction = {
            description: '',
            product: {},
            quantity: 0,
            user_id: UserService.activeUser.id,
            cashbook_id: 0,
            amount: 0,
            direction: "OUT",
            status: "PENDING"
        };

        $scope.getProducts = function () {
            MySQLService.select('product')
                .then(function (response) {
                    $scope.products = response.data.rows;
                    $scope.initDropdown();
                });
        }


        $scope.insertRecord = function () {
            var row = $scope.transaction;
            row["description"] = row.description + " " + row.quantity + " " + row.product.name;
            MySQLService
                .insert('cashbook', {
                    columnNames: ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
                    userData: {
                        "user_id": row.user_id,
                        "description": row.description,
                        "giver": 1,
                        "receiver": 2,
                        "amount": row.amount,
                        "status": row.status
                    }
                })
                .then(function (response) {
                    var cashbookId = response.data.lastInsertId;
                    MySQLService.insert('product_transaction', {
                        columnNames: ["product_id", "quantity", "user_id", "cashbook_id", "direction", "amount", "status"],
                        userData: {
                            product_id: row.product.id,
                            quantity: row.quantity,
                            user_id: row.user_id,
                            cashbook_id: cashbookId,
                            direction: row.direction,
                            amount: row.amount,
                            status: row.status
                        }
                    })
                })
                .then(function () {
                    $scope.transaction = {
                        description: '',
                        product: {},
                        quantity: 0,
                        user_id: UserService.activeUser.id,
                        cashbook_id: 0,
                        amount: 0,
                        direction: 0,
                        status: UserService.activeUser.authLevel < 5 ? 0 : 1
                    };
                })
        }

        $scope.selectProduct = function (product) {
            $scope.transaction.product_id = product.id;
            $scope.transaction.productName = product.name;
        }

        $scope.initDropdown = function () {
            jQuery(".ui.dropdown").dropdown();
        }
    })