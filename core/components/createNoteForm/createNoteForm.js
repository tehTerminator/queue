app.directive('createNoteForm', function () {
    return {
        'controller': 'CreateNoteFormController',
        'scope': {},
        'templateUrl': 'core/components/createNoteForm/createNoteForm.html'
    }
}).controller('CreateNoteFormController', function ($scope, $rootScope, MySQLService, UserService) {
    $scope.amount = 0;
    $scope.description = "";

    $scope.save = () => {
        if (amount <= 0) return;

        MySQLService.insert('notes', {
            'userData': {
                'amount': $scope.amount,
                'description': $scope.description,
                'user_id': UserService.activeUser.id
            }
        }).then(response => {
            if (response.status === 200) {
                $rootScope.$broadcast('GetNotes');
                $scope.reset()
            }
        });
    }

    $scope.reset = () => {
        $scope.amount = 0;
    }
})