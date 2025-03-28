// Configuratie ophalen uit JSON
fetch("KaartConfig.json")
    .then(response => response.json())
    .then(config => {
        // 1. Initialiseer de Leaflet-kaart met de instellingen uit config.json
        var map = L.map('map', {
            center: config.center,
            zoom: config.zoom,
            maxZoom: config.maxZoom,
            minZoom: config.minZoom,
            maxBounds: config.maxBounds,
            maxBoundsViscosity: config.maxBoundsViscosity
        });

        // 2. Voeg OpenStreetMap-kaartlaag toe
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        // 3. Voeg een sleepbare marker toe op de startlocatie
        var marker = L.marker(config.center, { draggable: true }).addTo(map)
            .bindPopup("Sleep mij en klik op de knop om het weer te zien!");

        // 4. Functie om weergegevens op te halen
        async function fetchWeather(lat, lon) {
            let apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

            try {
                let response = await fetch(apiUrl);
                let data = await response.json();
                let temp = data.current_weather.temperature;
                let wind = data.current_weather.windspeed;
                document.getElementById("weatherInfo").innerText = 
                    `🌡 Temperatuur: ${temp}°C | 💨 Windsnelheid: ${wind} km/u`;
            } catch (error) {
                console.error("Fout bij ophalen van weergegevens", error);
                document.getElementById("weatherInfo").innerText = "Fout bij ophalen van weergegevens.";
            }
        }

        // 5. Event listener voor weerknop
        document.getElementById("getWeather").addEventListener("click", function() {
            let latlng = marker.getLatLng();
            fetchWeather(latlng.lat, latlng.lng);
        });

        // 6. Event listener voor resetknop
        document.getElementById("resetMap").addEventListener("click", function() {
            map.setView(config.center, config.zoom);
        });
    })
    .catch(error => console.error("Fout bij laden van config.json", error));
