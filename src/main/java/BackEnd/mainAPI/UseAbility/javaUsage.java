package BackEnd.mainAPI.UseAbility;

import BackEnd.mainAPI.Client;
import java.io.IOException;

public class javaUsage {
    public static void main(String[] args) {
        Client client = new Client();

        try {
            client.send("Naam", "test naam");
            client.get("Naam");
            client.delete("Naam");
            client.get("Naam");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
