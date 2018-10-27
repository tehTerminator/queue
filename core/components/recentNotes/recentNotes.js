app.directive('recentNotes', function () {
    return {
        'templateUrl': 'core/components/recentNotes/recentNotes.html',
        'controller': 'RecentNotesController',
        'scope': {}
    }
}).controller('RecentNotesController', function ($scope, MySQLService) {
    $scope.notes = [];

    $scope.fetch = function () {
        MySQLService.select('notes', {
            'andWhere': { 'DATE(postedOn)': ['CURDATE()', 'noQuotes'] },
            'limit': '10',
            'orderBy': 'postedOn DESC'
        }).then(response => {
            console.log(response);
            if (response.status === 200) {
                $scope.notes = Array.from(response.data.rows);
            }
        })
    }

    $scope.$on('GetNotes', (e, args) => $scope.fetch())
    $scope.fetch();
})