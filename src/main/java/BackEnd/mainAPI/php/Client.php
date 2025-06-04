<?php

class Client {
    private const BASE_URL = "http://localhost:8089";

    private static function request(string $method, string $endpoint, array $data = []): ?string {
        $url = self::BASE_URL . $endpoint;
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);

        if (!empty($data)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($response === false) {
            echo 'cURL Error: ' . curl_error($ch);
            curl_close($ch);
            return null;
        }

        curl_close($ch);

        if ($httpCode >= 400) {
            echo "HTTP Error ($httpCode): $response";
            return null;
        }

        return $response;
    }

    public static function send(string $key, string $value): void {
        $response = self::request("POST", "/send", ["key" => $key, "value" => $value]);
        if ($response) echo "Response from server (send): $response";
    }

    public static function get(string $key): void {
        $response = self::request("GET", "/get?key=" . urlencode($key));
        if ($response) echo "Response from server (get): $response";
    }

    public static function delete(string $key): void {
        $response = self::request("DELETE", "/delete?key=" . urlencode($key));
        if ($response) echo "Response from server (delete): $response";
    }
}