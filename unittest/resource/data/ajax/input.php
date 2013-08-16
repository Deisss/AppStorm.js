<?php
// Handling put & delete request
$method = $_SERVER["REQUEST_METHOD"];

// Checking the HTTP verb is an allowed one
if(in_array($method, array("POST", "PUT", "DELETE", "HEAD", "OPTIONS", "GET"))) {
	$param = array();

	// Extracting parameters from request
	if(isset($_GET) && !empty($_GET)) {
		$method = "GET";
		$param = $_GET;
	} else if($method === "POST") {
		$method = "POST";
		$param = $_POST;
	} else {
		parse_str(file_get_contents("php://input"),$param);
	}

	// Parsing content
	$finalResult = strtolower($method)."=";

	foreach($param as $key => $value) {
		$finalResult .= $key;
	}

	// Outputting content
	echo $finalResult;
} else {
	echo "error";
}
?>