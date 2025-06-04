<?php
require_once '../php/Client.php';

Client::send("test", "send test");
Client::get("test");
Client::send("test", "edit test");
Client::get("test");
Client::delete("test"); // delete test
Client::get("test");