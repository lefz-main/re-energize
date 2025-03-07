// 1. Initialiseer de Leaflet-kaart
var map = L.map('map').setView([52.3676, 4.9041], 10); // Amsterdam als startlocatie

// 2. Voeg OpenStreetMap-kaartlaag toe
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 3. Voeg een klikbare marker toe
var marker = L.marker([52.3676, 4.9041], { draggable: true }).addTo(map)
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

// 5. Voeg event listener toe aan de knop
document.getElementById("getWeather").addEventListener("click", function() {
    let latlng = marker.getLatLng();
    fetchWeather(latlng.lat, latlng.lng);
});
