fetch('KaartConfig.json')
    .then(response => response.json())
    .then(config => {
        document.getElementById('maxGuessesReached').style.display = 'none';

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

        let currentPlacements = 0;
        let windmills = [];
        let solarpanels = [];
        let currentObject = 'windmill';
        let gridPoints = [];
        const gridSpacing = 0.01;

        let guessesLeft = 15;
        let maxPlacements = 15;
        let isGameOver = false;

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
            document.querySelectorAll('.menu-item').forEach(item => {
                item.classList.remove('selected');
            });
            document.getElementById(type + 'Select').classList.add('selected');
        }

        function distance(lat1, lng1, lat2, lng2) {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLng = (lng2 - lng1) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
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
            if (isGameOver || guessesLeft <= 0) return;
            const bonus = getClosestGridValue(lat, lng);
            const marker = L.marker([lat, lng], { icon: windmillIcon, draggable: false }).addTo(map)
                .bindPopup('Windmolen geplaatst! Gridwaarde: ${bonus}');
            windmills.push({ marker, lat, lng, power: 0, bonus });
            updateGuesses();
            calculatePower();
        }

        function addSolarPanel(lat, lng) {
            if (isGameOver || guessesLeft <= 0) return;
            const bonus = getClosestGridValue(lat, lng);
            const marker = L.marker([lat, lng], { icon: solarPanelIcon, draggable: false }).addTo(map)
                .bindPopup('Zonnepaneel geplaatst! Gridwaarde: ${bonus}');
            solarpanels.push({ marker, lat, lng, power: 0, bonus });
            updateGuesses();
            calculatePower();
        }

        function updateGuesses() {
            guessesLeft--;
            if (guessesLeft <= 0) {
                isGameOver = true;
                document.getElementById('weatherInfo').innerText += ' | 🎯 Max aantal plaatsingen bereikt!';
            }
        }

        async function calculatePower() {
            let totalPower = 0;

            for (const wm of windmills) {
                const apiUrl = 'https://weerlive.nl/api/weerlive_api_v2.php?key=9f3afbd842&locatie=52.10416,4.28922';
                const response = await fetch(apiUrl);
                const data = await response.json();
                const live = data.liveweer[0];
                wm.power = live.windkmh * 10 + wm.bonus;
                totalPower += wm.power;
            }

            for (const sp of solarpanels) {
                const apiUrl = 'https://weerlive.nl/api/weerlive_api_v2.php?key=9f3afbd842&locatie=52.10416,4.28922';
                const response = await fetch(apiUrl);
                const data = await response.json();
                const live = data.liveweer[0]
                sp.power = live.sup ? live.temp * 5 + sp.bonus : sp.bonus;
                totalPower += sp.power;
            }

            determineWinner();
            updateScoreDisplay(totalPower);
            return totalPower
        }

        function determineWinner() {
            const all = [...windmills, ...solarpanels];
            if (all.length === 0) return;
            const winner = all.reduce((max, obj) => obj.power > max.power ? obj : max, all[0]);
            document.getElementById('weatherInfo').innerText = `🏆 Hoogste opbrengst: ${winner.power.toFixed(2)} kWh!`;
        }

        function updateScoreDisplay(score) {
            const display = document.getElementById('scoreDisplay');
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
            if (isGameOver || currentPlacements >= maxPlacements) {
                document.getElementById('maxGuessesReached').style.display = 'block';
                return;
            }

            if (currentObject === 'windmill') {
                addWindmill(e.latlng.lat, e.latlng.lng);
            } else if (currentObject === 'solarpanel') {
                addSolarPanel(e.latlng.lat, e.latlng.lng);
            }

            currentPlacements++;
            document.getElementById('remainingGuesses').innerText = maxPlacements - currentPlacements;

            if (currentPlacements >= maxPlacements) {
                document.getElementById('maxGuessesReached').style.display = 'block';
            }
        });

        document.getElementById('submitScore').addEventListener('click', function () {
            let name = prompt('Please enter your name:', 'BOEM KAKA');
            totalPower = calculatePower();
            const xhttp = new XMLHttpRequest();
            xhttp.open('POST', `score.php?NAME=${name}&SCORE=${totalPower}`);
            xhttp.send();
        });

        document.getElementById('resetMap').addEventListener('click', function () {
            currentPlacements = 0;
            guessesLeft = 15;
            isGameOver = false;
            windmills.forEach(wm => map.removeLayer(wm.marker));
            solarpanels.forEach(sp => map.removeLayer(sp.marker));
            windmills = [];
            solarpanels = [];
            document.getElementById('remainingGuesses').innerText = maxPlacements;
            document.getElementById('maxGuessesReached').style.display = 'none';
            map.setView(config.center, config.zoom);
            document.getElementById('weatherInfo').innerText = '';
            updateScoreDisplay(0);
        });

        generateGrid();
        selectObject('windmill');
    })
    .catch(error => console.error('Fout bij laden van KaartConfig.json', error));

document.addEventListener('DOMContentLoaded', function () {
    fetch('https://weerlive.nl/api/weerlive_api_v2.php?key=9f3afbd842&locatie=52.10416,4.28922')
        .then(response => response.json())
        .then(data => {
            const live = data.liveweer[0];
            document.getElementById('temp').textContent = live.temp;
            document.getElementById('wind').textContent = live.windkmh + ' KM/U';
            document.getElementById('windr').textContent = live.windr;
            document.getElementById('description').textContent = live.samenv;

            // Optioneel: vervang de instructietekst met succesmelding
            document.getElementById('weatherInfo').textContent = 'Weerdata bijgewerkt!';
        })
        .catch(error => {
            console.error('Fout bij ophalen weerdata:', error);
            document.getElementById('weatherInfo').textContent = 'Fout bij het ophalen van de weergegevens.';
        });
});

