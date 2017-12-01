app.controller('LoginPageController', function($scope, $http, $location){
    $scope.user = {
        name: '',
        password: '',
    };

    $scope.warning = false;

    $scope.login = function(){
        var request = {
            queryType: 'select',
            tableName: 'user',
            params: {
                conditions: $scope.user
            }
        };

        $http.post(serverLink, request)
        .then(function(response){
            if( response.status == 200 ){
                var user = response.data.serverData;
                if( user.length > 0 ){
                    $scope.$parent.setUser( user[0] );
                    $location.url('/');
                } 
                else{
                    $scope.warning = true;
                }
            }
            else{
                $scope.warning = true;
            }
        });
    }
    
    $scope.reset = function(){
        $scope.user = {
            name: '',
            password: '',
        };    
        $scope.warning = false;
    }

})