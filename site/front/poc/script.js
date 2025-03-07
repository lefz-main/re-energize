// 1. Initialiseer de Leaflet-kaart op Scheveningen met een bepaald zoomniveau
var map = L.map('map', {
    center: [52.1117, 4.2817], // Zet de startlocatie op Scheveningen
    zoom: -10, // Stel het zoomniveau in (hoe groter het nummer, hoe dichter je inzoomt)
    maxZoom: 16, // Maximale zoom (bijvoorbeeld 16 is redelijk ver ingezoomd)
    minZoom: 12, // Minimale zoom (je kunt dit naar behoefte aanpassen)
    maxBounds: [
        [51.9, 4.1],  // Zuidwestelijke grens van het zichtbare gebied
        [52.3, 4.5]   // Noordoostelijke grens van het zichtbare gebied
    ], // Dit bepaalt het gebied waarin de kaart kan pannen
    maxBoundsViscosity: 1.0 // Voorkomt dat de kaart buiten de grenzen wordt verplaatst
});

// 2. Voeg OpenStreetMap-kaartlaag toe
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// 3. Voeg een sleepbare marker toe op Scheveningen
var marker = L.marker([52.1117, 4.2817], { draggable: true }).addTo(map)
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

// 5. Voeg event listener toe aan de knop voor het weer
document.getElementById("getWeather").addEventListener("click", function() {
    let latlng = marker.getLatLng();
    fetchWeather(latlng.lat, latlng.lng);
});

// 6. Voeg event listener toe aan de reset-knop om de kaart te resetten naar de startlocatie
document.getElementById("resetMap").addEventListener("click", function() {
    // Zet de kaart terug naar de startpositie (Scheveningen)
    map.setView([52.1117, 4.2817], -10); // Startlocatie en zoomniveau
});
