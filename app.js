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
const DISPLAY_ORDER = ['1903', '7356', '9210', '3488', '6675', '8102', '4821'];

document.addEventListener('DOMContentLoaded', () => {
    const instructionsModal = document.getElementById('instructions-modal');
    const closeInstructionsBtn = document.getElementById('close-instructions-btn');
    const showInstructionsBtn = document.getElementById('show-instructions-btn');
    const mapButtonContainer = document.querySelector('.main-actions');
    // NEU: Elemente für das zweite Pop-up
    const incognitoWarningModal = document.getElementById('incognito-warning-modal');
    const closeWarningBtn = document.getElementById('close-warning-btn');

    let challengeData = JSON.parse(localStorage.getItem('halloweenChallenge')) || { scannedStations: [] };
    const urlParams = new URLSearchParams(window.location.search);
    const currentStationId = urlParams.get('station');
    const isFirstVisitEver = !localStorage.getItem('halloweenChallenge'); // Prüfen, ob *überhaupt* schonmal was gespeichert wurde

    let showSecondPopup = false; // Flag, um zu steuern, ob das zweite Pop-up gezeigt werden soll

    if (currentStationId && !challengeData.scannedStations.includes(currentStationId)) {
        if (STATIONS.some(s => s.id === currentStationId)) {
            // Nur beim allerersten erfolgreichen Scan die Pop-ups triggern
            if (isFirstVisitEver && challengeData.scannedStations.length === 0) {
                instructionsModal.style.display = 'flex';
                showSecondPopup = true; // Merken, dass das zweite Pop-up folgen soll
            }
            challengeData.scannedStations.push(currentStationId);
            localStorage.setItem('halloweenChallenge', JSON.stringify(challengeData));
        }
    }

    if (challengeData.scannedStations.length >= TOTAL_STATIONS) {
        showView('completion-form-view');
    } else {
        showView('progress-view');
        showProgressViewContent(challengeData);
    }
    
    // Anleitung auch zeigen, wenn die Seite ohne Scan aufgerufen wird und noch leer ist
    if (isFirstVisitEver && challengeData.scannedStations.length === 0 && !currentStationId) {
        instructionsModal.style.display = 'flex';
        showSecondPopup = true; // Auch hier das zweite Pop-up vorbereiten
    }

    if (challengeData.scannedStations.length < TOTAL_STATIONS) {
        showInstructionsBtn.style.display = 'block';
        mapButtonContainer.style.display = 'block';
    }

    // Event Listener für Pop-ups
    closeInstructionsBtn.addEventListener('click', () => {
        instructionsModal.style.display = 'none';
        // Nur wenn das Flag gesetzt ist (beim ersten Mal), das zweite Pop-up zeigen
        if (showSecondPopup) {
            incognitoWarningModal.style.display = 'flex';
            showSecondPopup = false; // Flag zurücksetzen, damit es nur einmal passiert
        }
    });
    closeWarningBtn.addEventListener('click', () => {
        incognitoWarningModal.style.display = 'none';
    });
    showInstructionsBtn.addEventListener('click', () => {
        // Sicherstellen, dass das zweite Pop-up nicht angezeigt wird, wenn man die Anleitung später aufruft
        showSecondPopup = false; 
        instructionsModal.style.display = 'flex';
    });
});

// Der Rest der app.js bleibt unverändert (completion-form submit, showView, showProgressViewContent, showFinalQrCodeView)
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
    const stationNameMap = STATIONS.reduce((map, station) => {
        map[station.id] = station.name;
        return map;
    }, {});
    DISPLAY_ORDER.forEach(stationId => {
        const isScanned = challengeData.scannedStations.includes(stationId);
        const stationDiv = document.createElement('div');
        stationDiv.className = 'station' + (isScanned ? ' scanned' : '');
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
