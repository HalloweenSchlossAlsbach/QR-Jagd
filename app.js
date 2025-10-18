// Konfiguration: IDs und Namen bleiben gleich
const STATIONS = [
    { id: '4821', name: 'Folterplatz' },
    { id: '1903', name: 'Tunnel der Ängste' },
    { id: '7356', name: 'Zombiezone' },
    { id: '9210', name: 'Dark Forest' },
    { id: '3488', name: 'Cornfield' },
    { id: '6675', name: 'Anstalt X' },
    { id: '8102', name: 'Clowntown' }
];
const TOTAL_STATIONS = STATIONS.length;

// NEU: Definiere die gewünschte Anzeigereihenfolge der IDs
const DISPLAY_ORDER = ['1903', '7356', '9210', '3488', '6675', '8102', '4821'];

document.addEventListener('DOMContentLoaded', () => {
    // ... (der obere Teil bis einschließlich Event Listeners bleibt unverändert) ...
    const instructionsModal = document.getElementById('instructions-modal');
    const closeInstructionsBtn = document.getElementById('close-instructions-btn');
    const showInstructionsBtn = document.getElementById('show-instructions-btn');
    const mapButtonContainer = document.querySelector('.main-actions');

    let challengeData = JSON.parse(localStorage.getItem('halloweenChallenge')) || { scannedStations: [] };
    
    const urlParams = new URLSearchParams(window.location.search);
    const currentStationId = urlParams.get('station');

    const isFirstVisit = challengeData.scannedStations.length === 0;

    if (currentStationId && !challengeData.scannedStations.includes(currentStationId)) {
        if (STATIONS.some(s => s.id === currentStationId)) {
            challengeData.scannedStations.push(currentStationId);
            localStorage.setItem('halloweenChallenge', JSON.stringify(challengeData));
            if (isFirstVisit) {
                instructionsModal.style.display = 'flex';
            }
        }
    }

    if (challengeData.scannedStations.length >= TOTAL_STATIONS) {
        showView('completion-form-view');
    } else {
        showView('progress-view');
        showProgressViewContent(challengeData);
    }
    
    if (isFirstVisit && !currentStationId) {
        instructionsModal.style.display = 'flex';
    }

    if (challengeData.scannedStations.length < TOTAL_STATIONS) {
        showInstructionsBtn.style.display = 'block';
        mapButtonContainer.style.display = 'block';
    }

    closeInstructionsBtn.addEventListener('click', () => {
        instructionsModal.style.display = 'none';
    });
    showInstructionsBtn.addEventListener('click', () => {
        instructionsModal.style.display = 'flex';
    });
});

document.getElementById('completion-form').addEventListener('submit', (event) => {
    event.preventDefault(); 
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const privacyConsent = document.getElementById('privacy-consent').checked;
    const marketingConsent = document.getElementById('marketing-consent').checked;

    if (name && email && privacyConsent) {
        const finalData = { name, email, marketingConsent };
        showFinalQrCodeView(finalData);
    } else {
        alert('Bitte fülle die Pflichtfelder aus und stimme der Datenschutzerklärung zu.');
    }
});

function showView(viewId) {
    document.querySelectorAll('main > .view').forEach(view => view.style.display = 'none');
    document.getElementById(viewId).style.display = 'block';
}

function showProgressViewContent(challengeData) {
    const stationsList = document.getElementById('stations-list');
    stationsList.innerHTML = '';
    
    // Erstelle ein Nachschlagewerk für Namen basierend auf IDs
    const stationNameMap = STATIONS.reduce((map, station) => {
        map[station.id] = station.name;
        return map;
    }, {});

    // Gehe durch die definierte Anzeigereihenfolge
    DISPLAY_ORDER.forEach(stationId => {
        const isScanned = challengeData.scannedStations.includes(stationId);
        const stationDiv = document.createElement('div');
        stationDiv.className = 'station' + (isScanned ? ' scanned' : '');
        // Hole den Namen aus dem Nachschlagewerk
        stationDiv.textContent = stationNameMap[stationId] || `Unbekannte Station ${stationId}`;
        stationsList.appendChild(stationDiv);
    });
}


function showFinalQrCodeView(finalData) {
    showView('final-qrcode-view');
    const qrCodeContainer = document.getElementById('final-qrcode');
    qrCodeContainer.innerHTML = ''; 

    const baseUrl = 'https://halloweenschlossalsbach.github.io/QR-Jagd/scanner.html'; 

    const nameParam = encodeURIComponent(finalData.name);
    const emailParam = encodeURIComponent(finalData.email);
    const consentParam = finalData.marketingConsent;
    const urlWithData = `${baseUrl}?name=${nameParam}&email=${emailParam}&consent=${consentParam}`;

    new QRCode(qrCodeContainer, {
        text: urlWithData,
        width: 256,
        height: 256,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });
}
