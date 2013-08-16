<?php
if(isset($_GET) && !empty($_GET["tryget"])){
	echo "get";
}
if(isset($_POST) && !empty($_POST["trypost"])){
	echo "post";
}
?>