<?php
    class Tag{
        private $name;
        private $attributes;
        private $child;
        
        private $selfClosingTags = array("area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr");
        
        public function __construct($tagname, $attributes){
            $this->name = $tagname;
            $attributes = $attributes;
            $child = array();
        }
        
        public function addClass( $class ){
            $this->attributes['class'] .= " " . $class;
        }
        
        public function addChild( $child ){
            $this->child[] = $child;
        }
        
        public function __toString(){
            $output = "<" . $this->name ." ";
            foreach ($this->attributes as $key => $value) {
                # code...
                if( $key != "html" )
                $output .= $key . "='" . $value . "' ";
            }
            
            if( array_search($this->name, $this->selfClosingTags) ){
                $output .= "/>";
            } else{
                if( isset($this->attributes['html'] ) ){
                    $output .= $this->attributes['html'];
                } if( count( $this->child ) > 0 ){
                    $output .= ">";
                    foreach ($this->child as $key => $value) {
                        # code...
                        $output .= (string)$value;
                    }
                }
                $output .= "</" . $this->name . ">";
            }
            
            return $output;
        } 
    }
    
    class Stack{
        private $data;
        
        public function __construct(){
            $data = array();
        }
        
        public function isEmpty(){
            return count($this->data) == 0;
        }
        
        public function push($item){
            $this->data[] = $item;
        }
        
        public function pop(){
            if( !isEmpty() ){
                $output = $this->data[0];
                unset($this->data[0]);
                $this->data = array_values($this->data);
                return $output;
            }
            else{
                return null;
            }
        }
    }