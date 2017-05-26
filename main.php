<?php
	
	if(session_status() == PHP_SESSION_NONE){
		session_start();
	}

	ob_start();

	if(isset($_GET['logout'])){
		$_SESSION = array();
		unset($_SESSION);
		header("Location:index.php");
	}

	include('db.php');

	if(isset($_SESSION['username'])){
		$sql = "SELECT sf.permissionId FROM (SELECT p.permissionId FROM permission p WHERE p.permissionId IN (SELECT gp.permissionId FROM group_permission gp WHERE gp.groupId IN (SELECT gm.groupId FROM groupManagement gm WHERE gm.mainCharId = (SELECT u.mainId FROM user u WHERE u.username = '" . $_SESSION['username'] . "'))) OR permissionId IN (SELECT up.userPermissionId FROM user_permission up WHERE up.mainId = (SELECT uu.mainId FROM user uu WHERE uu.username = '" . $_SESSION['username'] . "'))) sf;"; 
		$result = mysqli_query($con, $sql);
		$permissions = array();
		if($result){
			foreach($result as $key => $val){
				array_push($permissions, $val['permissionId']);
			}
		}else{
			array_push($permissions, -10);	
		}
		$_SESSION['perms'] = $permissions;
	}
?>
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>Blackout Cartel Auth</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="/customauth/bootstrap/bootstrap.css">
	<script src="/customauth/js/jquery-3.1.1.min.js"></script>
	<script src="/customauth/js/bootstrap.min.js"></script>
	<style>
		body {
			padding-top: 50px;
		}
		#splitter {
			border: none;
			min-width: 300px;
			min-height: 300px;
			height: 700px;
			width: 100%;
		}
		#top {
			height: 350px;
		}
		#top, #bottom {
			height: 350px;
			overflow: hidden;
			min-height: 100px;
		}
		#left, #right {
			overflow: hidden;
			min-width: 100px;
		}
		#variables, #theme {
			height: 100%;
			width: 100%;
			position: relative;
		}
		.splitter-bar-vertical {
			width: 12px;
			background: #cdcdcd url("vgrabber.png") no-repeat center;
		}
		.splitter-bar-horizontal {
			height: 12px;
			background: #cdcdcd url("hgrabber.png") no-repeat center;
		}
		.splitter-bar-vertical.active, .splitter-bar-vertical:hover {
			background: #a0a0a0 url("vgrabber.png") no-repeat center;
		}
		.splitter-bar-horizontal.active, .splitter-bar-horizontal:hover {
			background: #a0a0a0 url("hgrabber.png") no-repeat center; 
		}
		#themeroller, #download {
			display: none;
		}
		#preview {
			height: calc(100% - 33px);
			overflow-x: hidden;
			overflow-y: auto;
		}
		#toolbar {
			margin: 0;
			padding: 5px 0;
			border-radius: 0;
		}
		.bs-docs-section {
			margin-bottom: 100px;
		}
		.variables {
			float: right;
			top: -40px;
		}
		.bs-component {
			position: relative;
		}
		.bs-component .modal {
			position: relative;
			top: auto;
			right: auto;
			left: auto;
			bottom: auto;
			z-index: 1;
			display: block;
		}
		.bs-component .modal-dialog {
			width: 90%;
		}
		.sp-container {
			border: 1px solid #999;
		}
		.sp-replacer {
			background: transparent none repeat scroll 0 0;
			border: none;
			padding: 0 0 0 10px;
		}
		.variables { display:none; }
		.page-header h1 { padding-top:100px; }
	</style>
</head>

<body>
<nav id="navHeader" class="navbar navbar-fixed-top navbar-default">
	<div class="bs-component">
		 <div class="container-fluid">
			<div class="navbar-header" style="padding-right: 20px">
			  <a class="navbar-brand" href="#">Blackout Cartel</a>
			</div>

			<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
				<ul class="nav navbar-nav">
					<li><a href="../home.php">Home</a></li>
					<li class="dropdown">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Utilities <span class="caret"></span></a>
						<ul class="dropdown-menu" role="menu">
							<li style="text-align: center; font-weight: bold;">Main Utilities</li>
							<li><a href="/customauth/services/apikey.php">Api Keys</a></li>
							<li><a href="/customauth/services/char.php">Characters</a></li>
							<li><a href="#">Help</a></li>
							<?php
								if(in_array('196', $_SESSION['perms']) or in_array('0', $_SESSION['perms'])){
									echo '<li><a href="/customauth/services/groups.php">Groups</a></li>';
								}
								if(in_array('0', $_SESSION['perms'])){
									echo '<li><a href="/customauth/services/services.php">Services</a></li>';
								}
								if(array_intersect(array('1', '2', '3'), $_SESSION['perms']) or in_array('0', $_SESSION['perms'])){
									echo '<li class="divider"></li>';
									echo '<li style="text-align: center; font-weight: bold;">Other Utilities</li>';
								}
								if(in_array('196', $_SESSION['perms']) or in_array('0', $_SESSION['perms'])){
									echo '<li><a href="#">Applications</a></li>';
								}
								if(in_array('196', $_SESSION['perms']) or in_array('0', $_SESSION['perms'])){
									echo '<li><a href="#">Corporation Stats</a></li>';
								}
								if(in_array('196', $_SESSION['perms']) or in_array('0', $_SESSION['perms'])){
									echo '<li><a href="/customauth/services/management.php">Management</a></li>';
								}
								if(in_array('196', $_SESSION['perms']) or in_array('0', $_SESSION['perms'])){
									echo '<li><a href="/customauth/services/posFuel.php">POS Fuel</a></li>';
								}
								echo '<li class="divider"></li>';
								echo '<li style="text-align: center; font-weight: bold;">Utility Utilities</li>';
								echo '<li><a href="#">Change Password</a></li>';
								if(in_array('196', $_SESSION['perms']) or in_array('0', $_SESSION['perms'])){
									echo '<li><a href="#">Discord Broadcast</a></li>';
								}
							?>
						</ul>
					</li>
				</ul>
				<ul class="nav navbar-nav navbar-right">
					<li><a href="/customauth/index.php?logout=true">Log out</a></li>
				</ul>
			</div>
		</div>
	</div>
</nav>	
	<?php
		print_r($_SESSION['perms']);
	?>
</body>
</html>


































