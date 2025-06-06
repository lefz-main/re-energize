<?php
$servername = "localhost:3306";
$username = "re-energize-db";
$password = "CrazyWachtwoordVoorProject";
$dbname = "re-energize";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

$sql = "INSERT INTO scores (Name, Score
VALUES (?, ?)";
$sql.bind('ss', $_POST['NAME'], $_POST['SCORE'])

if ($conn->query($sql) === TRUE) {
  echo "New record created successfully";
} else {
  echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>