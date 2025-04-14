// --- Konfiguracja ---
const FACEIT_API_BASE_URL = 'https://open.faceit.com/data/v4';
const GAME_ID = 'cs2'; // lub 'cs2' jeśli potrzeba
// !!! UWAGA: Hardkodowanie klucza API jest NIEBEZPIECZNE !!!
// Używaj tylko do celów lokalnych/prywatnych. Nie udostępniaj tego kodu publicznie.
const API_KEY = '3daa12e4-1ec0-4ced-8d06-61c4073c211c';

// --- Elementy DOM ---
const nicknameInput = document.getElementById('nicknameInput');
const fetchButton = document.getElementById('fetchButton');
const statusElement = document.getElementById('status');
const overlaySelectors = document.querySelectorAll('input[name="overlayType"]');
const colorCustomizationPanel = document.getElementById('colorCustomization');

// Elementy Nakładki 1
const overlayLevel1 = document.getElementById('overlayLevel1');
const levelIconElementL1 = document.getElementById('levelIconL1');
const usernameElementL1 = document.getElementById('usernameL1');
const eloElementL1 = document.getElementById('eloL1');
const winsElementL1 = document.getElementById('winsL1');
const lossesElementL1 = document.getElementById('lossesL1');

// Elementy Nakładki 2
const overlayLevel2 = document.getElementById('overlayLevel2');
const levelIconElementL2 = document.getElementById('levelIconL2');
const usernameElementL2 = document.getElementById('usernameL2');
const eloElementL2 = document.getElementById('eloL2');
const eloChangeElementL2 = document.getElementById('eloChangeL2');
const winsElementL2 = document.getElementById('winsL2');
const lossesElementL2 = document.getElementById('lossesL2');

// Elementy do zmiany kolorów (Nakładka 2)
const colorNickBgInput = document.getElementById('colorNickBg');
const colorNickTextInput = document.getElementById('colorNickText');
const colorEloTextInput = document.getElementById('colorEloText');
const colorWLTextInput = document.getElementById('colorWLText');

// --- Zmienne Stanu ---
let currentOverlayType = 'level_1'; // Domyślna nakładka

// --- Funkcje Pomocnicze ---

function setStatus(message, isError = false) {
    statusElement.textContent = message;
    statusElement.style.color = isError ? '#e74c3c' : '#ffcc00';
}

function getLevelIconUrl(elo) {
    // Zwraca tylko URL ikony na podstawie ELO
    let icon = 'images/1.png'; // Domyślna
    if (elo >= 2001) { icon = 'images/10.png'; }
    else if (elo >= 1751) { icon = 'images/9.png'; }
    else if (elo >= 1531) { icon = 'images/8.png'; }
    else if (elo >= 1351) { icon = 'images/7.png'; }
    else if (elo >= 1201) { icon = 'images/6.png'; }
    else if (elo >= 1051) { icon = 'images/5.png'; }
    else if (elo >= 901) { icon = 'images/4.png'; }
    else if (elo >= 751) { icon = 'images/3.png'; }
    else if (elo >= 501) { icon = 'images/2.png'; }
    else if (elo >= 100) { icon = 'images/1.png'; }
    return icon;
}

function updateOverlayVisibility() {
    if (currentOverlayType === 'level_1') {
        overlayLevel1.classList.remove('hidden');
        overlayLevel2.classList.add('hidden');
        colorCustomizationPanel.style.display = 'none'; // Ukryj kolory dla L1
    } else if (currentOverlayType === 'level_2') {
        overlayLevel1.classList.add('hidden');
        overlayLevel2.classList.remove('hidden');
        colorCustomizationPanel.style.display = 'flex'; // Pokaż kolory dla L2
    } else { // Na wszelki wypadek ukryj obie
        overlayLevel1.classList.add('hidden');
        overlayLevel2.classList.add('hidden');
         colorCustomizationPanel.style.display = 'none';
    }
}

// Funkcja do aktualizacji Nakładki 1
function updateOverlayLevel1(playerData, statsData) {
     const { nickname, games } = playerData;
     const csgoInfo = games[GAME_ID];
     if (!csgoInfo) return; // Powinno być obsłużone wcześniej, ale dla pewności

     const { faceit_elo } = csgoInfo;
     const { lifetime } = statsData;
     const iconUrl = getLevelIconUrl(faceit_elo);

     usernameElementL1.textContent = nickname;
     eloElementL1.textContent = `${faceit_elo} ELO`;
     levelIconElementL1.src = iconUrl;
     levelIconElementL1.alt = `Level icon for ELO ${faceit_elo}`; // Alt text zamiast numeru

     const totalWins = lifetime?.["Wins"] || '0';
     const totalMatches = lifetime?.["Matches"] || '0';
     const totalLosses = parseInt(totalMatches) - parseInt(totalWins);

     winsElementL1.textContent = totalWins;
     lossesElementL1.textContent = isNaN(totalLosses) ? '0' : totalLosses.toString();
}

// Funkcja do aktualizacji Nakładki 2
function updateOverlayLevel2(playerData, statsData, lastMatchEloChange) {
    const { nickname, games } = playerData;
    const csgoInfo = games[GAME_ID];
    if (!csgoInfo) return;

    const { faceit_elo } = csgoInfo;
    const { lifetime } = statsData;
    const iconUrl = getLevelIconUrl(faceit_elo);

    usernameElementL2.textContent = nickname;
    levelIconElementL2.src = iconUrl;
    levelIconElementL2.alt = `Level icon for ELO ${faceit_elo}`;

    eloElementL2.textContent = `${faceit_elo} ELO`;

    // Aktualizacja zmiany ELO z ostatniego meczu
    eloChangeElementL2.classList.remove('positive', 'negative', 'zero'); // Usuń stare klasy
    if (lastMatchEloChange !== null && lastMatchEloChange !== undefined) {
         const change = parseInt(lastMatchEloChange);
         if (change > 0) {
             eloChangeElementL2.textContent = `(+${change})`;
             eloChangeElementL2.classList.add('positive');
         } else if (change < 0) {
             eloChangeElementL2.textContent = `(${change})`; // Minus jest już w liczbie
             eloChangeElementL2.classList.add('negative');
         } else {
             eloChangeElementL2.textContent = `(0)`;
             eloChangeElementL2.classList.add('zero');
         }
    } else {
         eloChangeElementL2.textContent = `(?)`; // Brak danych
    }

    // Całkowite Wygrane/Przegrane (nie tylko dzisiaj)
    const totalWins = lifetime?.["Wins"] || '0';
    const totalMatches = lifetime?.["Matches"] || '0';
    const totalLosses = parseInt(totalMatches) - parseInt(totalWins);

    winsElementL2.textContent = totalWins;
    lossesElementL2.textContent = isNaN(totalLosses) ? '0' : totalLosses.toString();

    // Zastosuj początkowe kolory (lub te już ustawione)
    applyLevel2Colors();
}

// Funkcja do zastosowania kolorów CSS dla Nakładki 2
function applyLevel2Colors() {
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--nick-bg-color-l2', colorNickBgInput.value);
    rootStyle.setProperty('--nick-text-color-l2', colorNickTextInput.value);
    rootStyle.setProperty('--elo-text-color-l2', colorEloTextInput.value);
    rootStyle.setProperty('--wl-text-color-l2', colorWLTextInput.value);
}


// --- Główna funkcja pobierania danych ---
async function handleFetchData() {
    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        setStatus("Wpisz nick gracza.", true);
        return;
    }
     if (!API_KEY) {
         setStatus("Brak klucza API w kodzie! (To niebezpieczne)", true);
         return;
     }


    setStatus("Pobieranie danych...");
    overlayLevel1.classList.add('hidden'); // Ukryj obie nakładki na czas ładowania
    overlayLevel2.classList.add('hidden');

    const headers = {
        'Authorization': `Bearer ${API_KEY}`,
        'accept': 'application/json'
    };

    let playerData = null;
    let statsData = null;
    let lastMatchEloChange = null;

    try {
        // 1. Pobierz dane gracza (player_id, elo)
        const playerDetailsResponse = await fetch(`${FACEIT_API_BASE_URL}/players?nickname=${nickname}`, { headers });
        if (!playerDetailsResponse.ok) throw new Error(`Błąd pobierania gracza: ${playerDetailsResponse.status} (${nickname})`);
        playerData = await playerDetailsResponse.json();

        if (!playerData || !playerData.player_id) throw new Error(`Nie znaleziono gracza: ${nickname}`);
        if (!playerData.games || !playerData.games[GAME_ID]) throw new Error(`Gracz ${nickname} nie ma statystyk ${GAME_ID}.`);

        const playerId = playerData.player_id;

        // 2. Pobierz ogólne statystyki (lifetime W/L)
        const playerStatsResponse = await fetch(`${FACEIT_API_BASE_URL}/players/${playerId}/stats/${GAME_ID}`, { headers });
        if (!playerStatsResponse.ok) throw new Error(`Błąd pobierania statystyk: ${playerStatsResponse.status}`);
        statsData = await playerStatsResponse.json();

        // 3. Pobierz historię meczów (aby znaleźć ostatnią zmianę ELO)
        // Pobieramy tylko kilka ostatnich, żeby znaleźć pierwszy zakończony
        const historyResponse = await fetch(`${FACEIT_API_BASE_URL}/players/${playerId}/history?game=${GAME_ID}&offset=0&limit=5`, { headers });
         if (historyResponse.ok) {
             const historyData = await historyResponse.json();
             // Znajdź pierwszy zakończony mecz od końca (najnowszy)
             const lastFinishedMatch = historyData.items?.find(match => match.status === 'finished' || match.status === 'cancelled'); // Czasem ELO zmienia się po anulowaniu?
             if (lastFinishedMatch) {
                 // Spróbuj znaleźć zmianę ELO - API może różnie to zwracać
                 // Czasem jest `elo_change`, czasem trzeba liczyć `elo_after_match - elo_before_match`
                 // Ta część może wymagać dostosowania w zależności od odpowiedzi API!
                 if (lastFinishedMatch.elo_change !== undefined) {
                    lastMatchEloChange = lastFinishedMatch.elo_change;
                 } else if (lastFinishedMatch.elo) {
                     // Starsze API mogło zwracać tylko końcowe ELO w historii
                     // W takim wypadku nie możemy łatwo obliczyć zmiany bez poprzedniego ELO.
                     console.warn("Nie znaleziono 'elo_change' w ostatnim meczu.");
                     lastMatchEloChange = null; // Nie udało się znaleźć
                 }
                  else {
                    // Czasem ELO może nie być w ogóle dostępne w historii dla danego meczu
                    lastMatchEloChange = null;
                 }

                 // Jeśli zmiana ELO to 0, też ją pokażemy
                 if (lastMatchEloChange === undefined) lastMatchEloChange = null;

             } else {
                console.log("Nie znaleziono ostatniego zakończonego meczu w historii.");
             }
         } else {
             console.warn(`Nie udało się pobrać historii meczów: ${historyResponse.status}`);
         }


        // 4. Zaktualizuj OBIE nakładki (nawet jeśli jedna jest ukryta)
        updateOverlayLevel1(playerData, statsData);
        updateOverlayLevel2(playerData, statsData, lastMatchEloChange);

        // 5. Pokaż właściwą nakładkę zgodnie z wyborem
        updateOverlayVisibility();
        setStatus("Statystyki załadowane.");

    } catch (error) {
        console.error("API Error:", error);
        setStatus(`Błąd: ${error.message}`, true);
        overlayLevel1.classList.add('hidden'); // Ukryj obie w razie błędu
        overlayLevel2.classList.add('hidden');
    }
}

// --- Event Listeners ---
fetchButton.addEventListener('click', handleFetchData);

// Nasłuchiwanie zmiany wyboru nakładki
overlaySelectors.forEach(radio => {
    radio.addEventListener('change', (event) => {
        currentOverlayType = event.target.value;
        updateOverlayVisibility(); // Pokaż/ukryj odpowiednią nakładkę
    });
});

// Nasłuchiwanie zmian kolorów dla Nakładki 2
colorNickBgInput.addEventListener('input', applyLevel2Colors);
colorNickTextInput.addEventListener('input', applyLevel2Colors);
colorEloTextInput.addEventListener('input', applyLevel2Colors);
colorWLTextInput.addEventListener('input', applyLevel2Colors);


// --- Inicjalizacja ---
updateOverlayVisibility(); // Ustaw widoczność początkową

function updateMarquee() {
    const input = document.getElementById('marqueeInput').value;
    const output = document.getElementById('marqueeText');
    if (input.trim() !== "") {
      output.textContent = input.toUpperCase();
    }
  }
  
  function applyPreset() {
    const select = document.getElementById('presetSelect');
    const input = document.getElementById('marqueeInput');
    const value = select.value;
    if (value) {
      input.value = value;
      updateMarquee();
    }
  }
  
