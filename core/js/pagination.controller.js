app.controller('PaginationController', function($scope){
    $scope.currentPage  = 0;
    $scope.pageLength   = 5;
    $scope.totalPages   = 0;
    $scope.pageSizes    = [5, 10, 15, 20, 25, 50];
    $scope.pageArray    = [];
    $scope.lastActivePage = 0;
    $scope.totalItems = 0;
    $scope.searchText = "";
    
    $scope.$on('DataLoaded', function(event, args){
        var totalItems = args.data;
        $scope.initialize( totalItems );
    });

    $scope.requestData = function(){
        $scope.$emit('RefreshData');
    }

    $scope.addButtonClick = function(){
        $scope.$emit('AddButtonClick');
    }

    $scope.initialize = function(totalItems){
        $scope.totalItems = totalItems;
        $scope.totalPages = Math.ceil(totalItems / $scope.pageLength);
        $scope.pageArray = [];
        for( var i=1; i<=$scope.totalPages; i++){
            $scope.pageArray.push(i);
        }

        jQuery(".ui.dropdown").dropdown();
    }

    $scope.firstPage = function(){
        $scope.currentPage = 0;
    }

    $scope.prevPage = function(){
        if( $scope.currentPage > 0 ){
            $scope.currentPage--;
        }
    }

    $scope.isFirst = function(){
        return $scope.currentPage == 0;
    }

    $scope.nextPage = function(){
        if( $scope.currentPage < $scope.pageArray.length - 1 ){
            $scope.currentPage++;
        }
    }

    $scope.isLast = function(){
        return $scope.currentPage == $scope.pageArray.length;
    }

    $scope.lastPage = function(){
        $scope.currentPage = $scope.pageArray.length - 1;
    }

    $scope.setPageLength = function( length ){
        $scope.pageLength = length;
        $scope.initialize( $scope.totalItems );
    }

    $scope.setPage = function(i){
        $scope.currentPage = i - 1;
    }

    $scope.resetPage = function(){
        if( $scope.searchText.length > 1){
            $scope.currentPage = 1;
        } if( $scope.searchText.length == 1){
            $scope.lastActivePage = $scope.currentPage;
            $scope.currentPage = 1;
        } 
        else{
            $scope.currentPage = $scope.lastActivePage;
        }
    }
})

.filter('pagination', function(){
    return function(data, itemCount, pageIndex){
        var count = 0;
        var startCount = itemCount * pageIndex;
        var output = [];
        angular.forEach(data, function(item){
            if( count >= startCount && output.length < itemCount ){
                output.push( item );
            }
            count++;
        });
        return output;
    }
})