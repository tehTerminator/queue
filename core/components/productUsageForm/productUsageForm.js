app
    .directive('productUsageForm', function () {
        return {
            templateUrl: 'core/components/productUsageForm/productUsageForm.html',
            controller: 'ProductUsageFormController',
            replace: true
        };
    })
    .controller('ProductUsageFormController', function ($scope, $rootScope, UserService, MySQLService) {

        $scope.products = [];
        $scope.accounts = [];

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
            MySQLService.select('product').then(function (response) {
                $scope.products = response.data.rows;
                $scope.initDropdown();
            });
            MySQLService.select('accounts').then(response => $scope.accounts = response.data.rows);
        }


        $scope.insertRecord = function () {
            var row = $scope.transaction;
            row["description"] = row.description + " " + row.quantity + " " + row.product.name;
            MySQLService.insert('cashbook', {
                columnNames: ['user_id', 'giver', 'receiver', 'description', 'amount', 'status'],
                userData: {
                    "user_id": row.user_id,
                    "description": row.description,
                    "giver": $scope.accounts.find(x => x.name.toLowerCase() == 'sales').id,
                    "receiver": $scope.accounts.find(x => x.name.toLowerCase() == 'shop').id,
                    "amount": row.amount,
                    "status": row.status
                }
            }).then(function (response) {
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
                }).then(response => {
                    $rootScope.$broadcast("Product Added", {});
                    console.log(response);
                    $scope.reset();
                });
            });
        }

        $scope.reset = () => {
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
        }

        $scope.selectProduct = function (product) {
            $scope.transaction.product_id = product.id;
            $scope.transaction.productName = product.name;
        }

        $scope.initDropdown = function () {
            jQuery(".ui.dropdown").dropdown();
        }
    })