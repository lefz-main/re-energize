<?php

class Client {
    private const BASE_URL = "http://localhost:8089";

    public function send(string $key, string $value): void {
        $url = self::BASE_URL . "/send";
        $data = json_encode(["key" => $key, "value" => $value]);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

        $response = curl_exec($ch);
        curl_close($ch);

        echo $response;
    }

    public function get(string $key): void {
        $url = self::BASE_URL . "/get?key=" . urlencode($key);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        echo $response;
    }

    public function delete(string $key): void {
        $url = self::BASE_URL . "/delete?key=" . urlencode($key);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");

        $response = curl_exec($ch);
        curl_close($ch);

        echo $response;
    }
}