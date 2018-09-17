app
    .directive('allTasks', function () {
        return {
            'restrict': 'E',
            'templateUrl': 'core/views/allTasks.html'
        }
    })

    .controller('LiveViewController', function ($scope, $interval, MySQLService, UserService) {
        $scope.tasks = [];
        $scope.users = Array.from(UserService.get());
        $scope.categories = [];
        $scope.myDate = new Date();
        $scope.selected = {
            'category': 0,
            'user': 0
        };
        $scope.intervalPromise = null;

        $scope.init = function () {
            MySQLService.select('categories').then(function (response) {
                $scope.categories = response.data.rows;
            }).then($scope.fetchTasks());

            $scope.intervalPromise = $interval(() => {
                $scope.fetchTasks();
            }, 10000);
        }

        $scope.$on('$destroy', function () {
            $interval.cancel($scope.intervalPromise);
        });

        $scope.fetchTasks = function () {
            console.log($scope.myDate);
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

        $scope.selectUser = (id) => {
            $scope.selected.user = id;
        }

        $scope.selectCategory = (id) => {
            $scope.selected.category = id;
        }

        $scope.initDropdown = function () {
            jQuery('.ui.dropdown').dropdown();
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