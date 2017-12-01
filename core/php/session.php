<?php

    define('HOME', 1);
    define('PAGE', 2);
    define('NOTE', 3);
    define('QUIZ', 4);
    define('QUERY', 5);
    define('EDIT', 6);

    $pageTypes = array('index.php', 'home', 'page', 'note', 'quiz', 'query');

    $url = $_SERVER['REQUEST_URI'];
    $url_split = split("/", $url);

    if( $url == "/"){
        $pageSettings['page_type'] == HOME; 
    } else{
    
    }
    
