<?php 

    class QueryGenerator{
        private $query;

        public function __construct(){
            $this->query = "";
        }

        public function select($tableName)
        {
            $this->query = "SELECT * FROM {$tableName}";
        }   

        public function columns($columns){
            str_replace("*", implode(',', $columns ), $this->query );
        }

        public function condition($conditions){
            
        }

    }