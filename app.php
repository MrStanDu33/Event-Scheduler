<?php
	if (isset($_GET["CORSProxy"]) && !empty($_GET["CORSProxy"]))
		echo(htmlspecialchars(file_get_contents(urldecode($_GET["CORSProxy"]))));
	die();
?>