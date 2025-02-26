package BackEnd.mainAPI;
import okhttp3.*;
import java.io.IOException;

public class Client {
    private static final String BASE_URL = "http://localhost:8089";
    private final OkHttpClient client;

    public Client() {
        this.client = new OkHttpClient();
    }

    public void send(String key, String value) throws IOException {
        String json = "{\"key\":\"" + key + "\",\"value\":\"" + value + "\"}";
        RequestBody body = RequestBody.create(json, MediaType.get("application/json"));

        Request request = new Request.Builder()
                .url(BASE_URL + "/send")
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            System.out.println(response.body().string());
        }
    }

    public void get(String key) throws IOException {
        Request request = new Request.Builder()
                .url(BASE_URL + "/get?key=" + key)
                .get()
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful()) {
                System.out.println(response.body().string());
            } else {
                System.out.println("Error: " + response.message());
            }
        }
    }

    public void delete(String key) throws IOException {
        Request request = new Request.Builder()
                .url(BASE_URL + "/delete?key=" + key)
                .delete()
                .build();

        try (Response response = client.newCall(request).execute()) {
            System.out.println(response.body().string());
        }
    }
}
