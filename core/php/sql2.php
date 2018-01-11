<?php
    define('LOCALHOST', 'localhost');
    define('DBNAME', 'shopdb');
    define('USER', 'root');
    define('PASSWORD', '');
    
    $connection = null;
    
    $request = json_decode( file_get_contents("php://input") );
    
    try{
        $connection = new PDO('mysql:host=localhost;dbname=' . DBNAME, USER, PASSWORD);
        // $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); 
    } catch( PDOException $ex ){
        die( json_encode(
            array(
                'result'=>false,
                'exception'=>$ex->getMessage()
            )
        ) );
    }

    require_once 'ds.php';
    
    $query_type = $request->queryType;

    if( strcmp($query_type, "chain") == 0 ){
        $list = json_decode(json_encode($request->requests));
        $output = array();
        $lastInsertId = null;
        foreach ($list as $req) {
            $tableName = $req->tableName;
            $adapter = new DataAdapter($connection, $tableName);

            $params = isset( $req->params ) ? json_decode(json_encode($req->params), true) : null;
            
            if( $params != null || isset($params['userData']) ){
                foreach($params['userData'] as $key=>$val){
                    if( strcmp($val, "lastInsertId") == 0 ){
                        $params['userData'][$key] = $lastInsertId;
                    }
                }
            }

            
            $adapter->generateQuery($req->queryType, $params);
            $adapter->execute();
            $lastInsertId = $adapter->output['lastInsertId'];
            array_push($output, $adapter->output);
        }
        
        die( json_encode($output) );
    } else{
        $tableName = $request->tableName;
        $params = isset( $request->params ) ? json_decode(json_encode($request->params), true) : null;
        
        $adapter = new DataAdapter($connection, $tableName);
        $adapter->generateQuery($query_type, $params);
        $adapter->execute();
        $adapter->echo_output(); 
    }


