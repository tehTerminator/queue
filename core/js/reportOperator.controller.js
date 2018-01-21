app.controller('OperatorReportController', function($scope, MySQLService, UserService){
    $scope.operators = UserService.activeUser.authLevel > 5 ? UserService.all : [ UserService.activeUser ];
    $scope.date = {
        start: "",
        end : "",
        getDateRange : function(){
            return $scope.date.enclose($scope.date.start) + " AND " + $scope.date.enclose($scope.date.end);
        },
        enclose : function(dt){
            return "'" + dt.getFullYear() + 
                   "-" + $scope.date.leadingZero(dt.getMonth() + 1 ) + 
                    "-" + $scope.date.leadingZero(dt.getDate()) +
                    " " + $scope.date.leadingZero(dt.getHours()) +
                    ":" + $scope.date.leadingZero(dt.getMinutes()) + 
                    ":" + $scope.date.leadingZero(dt.getSeconds()) +
                    ".000000'";
        },
        leadingZero : function(num){
            var output = "000000" + num;
            return output.substr(output.length - 2, 2);
        }
    };
    $scope.selectedOperatorId = UserService.activeUser.id;
    $scope.result = [];
    $scope.footer = {
        totalItems : 0,
        totalJobs : 0,
        totalAmount : 0
    };

    $scope.getData = function(){
        $scope.result = [];
        $scope.footer = {
            totalItems : 0,
            totalJobs : 0,
            totalAmount : 0
        };

        MySQLService.select('task', {
            columnNames : ['count(acceptedBy) as jobCompleted', 'sum(amountCollected) as jobAmount', 'DATE(endTime) as dateTime'],
            'group by' : 'DATE(endTime)',
            conditions : {'acceptedBy' : $scope.selectedOperator.id, 'DATE(endTime)' : ['BETWEEN', $scope.date.enclose($scope.date.start), $scope.date.enclose($scope.date.end)], 'status' : 1},
        })
        .then(function(response){
            angular.forEach(response.data.serverData, function(item){
                $scope.footer.totalItems++;
                $scope.footer.totalJobs += Number(item.jobCompleted);
                $scope.footer.totalAmount += Number(item.jobAmount);
                $scope.result.push(item);
            })
        });
    }

    $scope.initDropdown = function(){
        jQuery(".ui.dropdown").dropdown();
    }

})