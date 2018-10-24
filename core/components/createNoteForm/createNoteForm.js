app.directive('createNoteForm', function () {
    return {
        'controller': 'CreateNoteFormController',
        'scope': {},
        'templateUrl': 'core/component/createNoteForm/createNoteForm.html'
    }
}).controller('CreateNoteFormController', function ($scope, $rootScope, MySQLService, UserService) {
    $scope.amount = 0;
    $scope.description = "";

    $scope.save = () => {
        MySQLService.insert('notes', {
            'userData': {
                'amount': $scope.amount,
                'description': $scope.description
            }
        }).then(response => {
            if (response.status === 200) {
                $rootScope.broadcast('GetNotes');
                $scope.reset()
            }
        });
    }

    $scope.reset = () => {
        $scope.amount = 0;
        $scope.description = "";
    }
})