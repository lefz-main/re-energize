fetch("KaartConfig.json")
    .then(response => response.json())
    .then(config => {
        const map = L.map('map', {
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
        let currentObject = "windmill";
        let gridPoints = [];
        const gridSpacing = 0.01;

        const windmillIcon = L.icon({
            iconUrl: 'windmill.png',
            iconSize: [50, 50],
            iconAnchor: [25, 50],
            popupAnchor: [0, -50]
        });

        const solarPanelIcon = L.icon({
            iconUrl: 'zonnepaneel.png',
            iconSize: [50, 50],
            iconAnchor: [25, 50],
            popupAnchor: [0, -50]
        });

        window.selectObject = function (type) {
            currentObject = type;
            document.querySelectorAll(".menu-item").forEach(item => {
                item.classList.remove("selected");
            });
            document.getElementById(type + "Select").classList.add("selected");
        }

        function distance(lat1, lng1, lat2, lng2) {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        }

        function getClosestGridValue(lat, lng) {
            let closest = gridPoints[0];
            let closestDistance = distance(lat, lng, closest.lat, closest.lng);
            for (let point of gridPoints) {
                let d = distance(lat, lng, point.lat, point.lng);
                if (d < closestDistance) {
                    closest = point;
                    closestDistance = d;
                }
            }
            return closest.value;
        }

        function addWindmill(lat, lng) {
            const bonus = getClosestGridValue(lat, lng);
            const marker = L.marker([lat, lng], { icon: windmillIcon, draggable: true }).addTo(map)
                .bindPopup(`Windmolen geplaatst! Gridwaarde: ${bonus}`);
            windmills.push({ marker, lat, lng, power: 0, bonus });
            calculatePower();
        }

        function addSolarPanel(lat, lng) {
            const bonus = getClosestGridValue(lat, lng);
            const marker = L.marker([lat, lng], { icon: solarPanelIcon, draggable: true }).addTo(map)
                .bindPopup(`Zonnepaneel geplaatst! Gridwaarde: ${bonus}`);
            solarpanels.push({ marker, lat, lng, power: 0, bonus });
            calculatePower();
        }

        async function calculatePower() {
            let totalPower = 0;

            for (const wm of windmills) {
                const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${wm.lat}&longitude=${wm.lng}&current_weather=true`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                wm.power = data.current_weather.windspeed * 10 + wm.bonus;
                totalPower += wm.power;
            }

            for (const sp of solarpanels) {
                const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${sp.lat}&longitude=${sp.lng}&current_weather=true`;
                const response = await fetch(apiUrl);
                const data = await response.json();
                sp.power = data.current_weather.is_day ? data.current_weather.temperature * 5 + sp.bonus : sp.bonus;
                totalPower += sp.power;
            }

            determineWinner();
            updateScoreDisplay(totalPower);
        }

        function determineWinner() {
            const all = [...windmills, ...solarpanels];
            if (all.length === 0) return;
            const winner = all.reduce((max, obj) => obj.power > max.power ? obj : max, all[0]);
            document.getElementById("weatherInfo").innerText = `🏆 Hoogste opbrengst: ${winner.power.toFixed(2)} kWh!`;
        }

        function updateScoreDisplay(score) {
            const display = document.getElementById("scoreDisplay");
            display.innerText = `⚡ Totale Opbrengst: ${score.toFixed(2)} kWh`;
        }

        function generateGrid() {
            const [minLat, minLng] = config.maxBounds[0];
            const [maxLat, maxLng] = config.maxBounds[1];

            for (let lat = minLat; lat <= maxLat; lat += gridSpacing) {
                for (let lng = minLng; lng <= maxLng; lng += gridSpacing) {
                    const value = Math.floor(Math.random() * 11);
                    gridPoints.push({ lat, lng, value });
                }
            }
        }

        map.on('click', function (e) {
            if (currentObject === "windmill") {
                addWindmill(e.latlng.lat, e.latlng.lng);
            } else if (currentObject === "solarpanel") {
                addSolarPanel(e.latlng.lat, e.latlng.lng);
            }
        });

        document.getElementById("getWeather").addEventListener("click", calculatePower);

        document.getElementById("resetMap").addEventListener("click", function () {
            windmills.forEach(wm => map.removeLayer(wm.marker));
            solarpanels.forEach(sp => map.removeLayer(sp.marker));
            windmills = [];
            solarpanels = [];
            map.setView(config.center, config.zoom);
            document.getElementById("weatherInfo").innerText = "";
            updateScoreDisplay(0);
        });

        generateGrid();
        selectObject("windmill");
    })
    .catch(error => console.error("Fout bij laden van KaartConfig.json", error));
