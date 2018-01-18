app.controller('TabController', function($scope){
    $scope.url = "";
    $scope.baseUrl = "";
    $scope.tabUrl = "";

    $scope.setTab = function(url){
        $scope.url = url;
        $scope.tabUrl = $scope.baseUrl + url;
    }

    $scope.getClass = function(url){
        return url == $scope.url ? "active" : "";
    }
})