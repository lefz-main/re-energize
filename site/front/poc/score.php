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

$sql = "INSERT INTO scores (Name, Score) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
if ($stmt) {
  $stmt->bind_param('ss', $_POST['NAME'], $_POST['SCORE']);
  if ($stmt->execute()) {
    echo "New record created successfully";
  } else {
    echo "Error: " . $stmt->error;
  }
  $stmt->close();
} else {
  echo "Error: " . $conn->error;
}

$conn->close();
?>