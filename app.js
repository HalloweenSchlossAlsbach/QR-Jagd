// Konfiguration: Jede Station hat eine einzigartige ID und einen neuen Namen.
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

document.addEventListener('DOMContentLoaded', () => {
    // UI-Elemente
    const instructionsModal = document.getElementById('instructions-modal');
    const closeInstructionsBtn = document.getElementById('close-instructions-btn');
    const showInstructionsBtn = document.getElementById('show-instructions-btn');
    const mapButtonContainer = document.querySelector('.main-actions');

    // Lade den Spielstand oder erstelle einen neuen
    let challengeData = JSON.parse(localStorage.getItem('halloweenChallenge')) || { scannedStations: [] };
    
    const urlParams = new URLSearchParams(window.location.search);
    const currentStationId = urlParams.get('station');

    const isFirstVisit = challengeData.scannedStations.length === 0;

    // 1. Verarbeite einen neuen Scan, falls einer vorhanden ist
    if (currentStationId && !challengeData.scannedStations.includes(currentStationId)) {
        if (STATIONS.some(s => s.id === currentStationId)) {
            challengeData.scannedStations.push(currentStationId);
            localStorage.setItem('halloweenChallenge', JSON.stringify(challengeData));
            // Zeige die Anleitung nur beim allerersten *erfolgreichen* Scan
            if (isFirstVisit) {
                instructionsModal.style.display = 'flex';
            }
        }
    }

    // 2. Entscheide, welche Haupt-Ansicht gezeigt wird
    if (challengeData.scannedStations.length >= TOTAL_STATIONS) {
        showView('completion-form-view');
    } else {
        showView('progress-view');
        showProgressViewContent(challengeData);
    }
    
    // 3. Zeige die Anleitung an, wenn der Nutzer die Seite das erste Mal direkt aufruft (ohne Scan)
    if (isFirstVisit && !currentStationId) {
        instructionsModal.style.display = 'flex';
    }

    // 4. Zeige die Steuerungs-Buttons an, solange das Spiel noch nicht beendet ist
    if (challengeData.scannedStations.length < TOTAL_STATIONS) {
        showInstructionsBtn.style.display = 'block';
        mapButtonContainer.style.display = 'block';
    }

    // Event Listeners für die Anleitung (funktionieren jetzt immer)
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
    
    const stationData = challengeData.scannedStations.length === 0 ? STATIONS.map(s => ({...s, isScanned: false})) : STATIONS.map(s => ({...s, isScanned: challengeData.scannedStations.includes(s.id)}));

    stationData.forEach(station => {
        const stationDiv = document.createElement('div');
        stationDiv.className = 'station' + (station.isScanned ? ' scanned' : '');
        stationDiv.textContent = station.name;
        stationsList.appendChild(stationDiv);
    });
}

function showFinalQrCodeView(finalData) {
    showView('final-qrcode-view');
    const qrCodeContainer = document.getElementById('final-qrcode');
    qrCodeContainer.innerHTML = ''; 

    // --- HIER IST DIE WICHTIGE ÄNDERUNG ---
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
