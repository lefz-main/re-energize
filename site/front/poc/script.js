fetch("KaartConfig.json")
    .then(response => response.json())
    .then(config => {
        var map = L.map('map', {
            center: config.center,
            zoom: config.zoom,
            maxZoom: config.maxZoom,
            minZoom: config.minZoom,
            maxBounds: config.maxBounds,
            maxBoundsViscosity: config.maxBoundsViscosity
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        let windmills = [];
        let solarpanels = [];
        let currentObject = "windmill"; // Standaard op windmolen

        let windmillIcon = L.icon({
            iconUrl: 'windmill.png',
            iconSize: [50, 50],
            iconAnchor: [25, 50],
            popupAnchor: [0, -50]
        });

        let solarPanelIcon = L.icon({
            iconUrl: 'zonnepaneel.png',
            iconSize: [50, 50],
            iconAnchor: [25, 50],
            popupAnchor: [0, -50]
        });

        // Functie voor het selecteren van het object
        function selectObject(type) {
            console.log("selectObject aangeroepen, type:", type); // Debugging

            currentObject = type;

            // Alle menu-items resetten
            document.querySelectorAll(".menu-item").forEach(item => {
                item.classList.remove("selected");
            });

            // Het geselecteerde item markeren
            document.getElementById(type + "Select").classList.add("selected");

            console.log("Geselecteerd object: " + currentObject); // Debugging
        }

        function addWindmill(lat, lng) {
            let windmill = L.marker([lat, lng], { icon: windmillIcon, draggable: true }).addTo(map)
                .bindPopup(`Windmolen geplaatst!`);
            windmills.push({ marker: windmill, lat, lng, power: 0 });
        }

        function addSolarPanel(lat, lng) {
            let solarPanel = L.marker([lat, lng], { icon: solarPanelIcon, draggable: true }).addTo(map)
                .bindPopup(`Zonnepaneel geplaatst!`);
            solarpanels.push({ marker: solarPanel, lat, lng, power: 0 });
        }

        // Weerdata ophalen en vermogen berekenen
        function calculatePower() {
            windmills.forEach(async (wm) => {
                let apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${wm.lat}&longitude=${wm.lng}&current_weather=true`;
                let response = await fetch(apiUrl);
                let data = await response.json();
                wm.power = data.current_weather.windspeed * 10;
            });

            solarpanels.forEach(async (sp) => {
                let apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${sp.lat}&longitude=${sp.lng}&current_weather=true`;
                let response = await fetch(apiUrl);
                let data = await response.json();
                sp.power = data.current_weather.is_day ? data.current_weather.temperature * 5 : 0;
            });
        }

        // Bepaal de winnaar op basis van het hoogste vermogen
        function determineWinner() {
            let allObjects = [...windmills, ...solarpanels];
            if (allObjects.length === 0) return;

            let winner = allObjects.reduce((max, obj) => (obj.power > max.power ? obj : max), allObjects[0]);
            document.getElementById("weatherInfo").innerText = `🏆 Hoogste opbrengst: ${winner.power} kWh!`;
        }

        document.getElementById("getWeather").addEventListener("click", calculatePower);
        document.getElementById("resetMap").addEventListener("click", function() {
            windmills.forEach(wm => map.removeLayer(wm.marker));
            solarpanels.forEach(sp => map.removeLayer(sp.marker));
            windmills = [];
            solarpanels = [];
            map.setView(config.center, config.zoom);
        });

        // Klikken op de kaart om een object te plaatsen
        map.on('click', function(e) {
            console.log("Klik op de kaart geregistreerd, huidig object:", currentObject); // Debugging
            if (currentObject === "windmill") {
                addWindmill(e.latlng.lat, e.latlng.lng);
            } else if (currentObject === "solarpanel") {
                addSolarPanel(e.latlng.lat, e.latlng.lng);
            }
        });
    })
    .catch(error => console.error("Fout bij laden van config.json", error));
