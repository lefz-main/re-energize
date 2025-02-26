<?php
require_once '../php/Client.php';

$client = new Client();
$client->send("Naam", "test naam");
$client->get("Naam");
$client->delete("Naam");
