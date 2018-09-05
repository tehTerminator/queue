app
    .directive('recentTaskList', function () {
        return {
            restrict: 'E',
            templateUrl: 'core/components/recentTaskList/recentTaskList.html',
            controller: 'RecentTaskListController',
            scope: {}
        }
    })
    .controller('RecentTaskListController', function ($scope, MySQLService) {
        $scope.tasks = [];

        $scope.refresh = function () {
            MySQLService
                .select('task', {
                    'andWhere': {
                        "DATE(insertTime)": ["CURDATE()", "noQuotes"]
                    },
                    'limit': '10',
                    'orderBy': "ID DESC",
                    "status": ["NOT IN", "REJECTED", "COMPLETED", "LIST"]
                })
                .then(function (response) {
                    console.log(response);
                    $scope.tasks = response['data']['rows'];
                })
        }

        $scope.$on('New Task', function (args) {
            $scope.refresh();
        })
    });