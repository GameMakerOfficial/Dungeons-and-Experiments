// --- BAZA DANYCH GRACZA ---
let player = {
    nickname: "",
    rank: "PLAYER", // Może być: OWNER, VIP, FP, SNIPER
    weapon: "None", // Na początku brak, potem Stone Sword
    dungeonLevel: 1,
    inventory: {
        plank: 0,
        stone: 0,
        meat: 0,
        metal: 0,
        diamond: 0,
        mythril: 0
    }
};

// --- FUNKCJA STARTOWA (LOGOWANIE) ---
function startGame() {
    const nickInput = document.getElementById('nickname-input').value.trim();
    
    if(nickInput === "") {
        alert("Musisz podać nick!");
        return;
    }

    // Przypisanie danych
    player.nickname = nickInput;

    // Tajna weryfikacja rangi Właściciela
    if (player.nickname === "GameMaker_Official") {
        player.rank = "OWNER";
        player.inventory.plank += 10; // Bonus na start dla Ownera
        player.inventory.mythril += 1;
        alert("Witaj Twórco! Przyznano rangę OWNER.");
    }

    // Aktualizacja interfejsu (UI)
    updateUI();

    // Ukrycie ekranu startowego i pokazanie gry
    document.getElementById('start-screen').style.display = "none";
    document.getElementById('top-bar').style.display = "flex";
    document.getElementById('bottom-nav').style.display = "flex";
    document.getElementById('zone-lab').style.display = "flex";
    document.getElementById('zone-dungeon').style.display = "flex";
}

// --- ODŚWIEŻANIE INTERFEJSU ---
function updateUI() {
    document.getElementById('ui-nick').innerText = player.nickname;
    document.getElementById('ui-rank').innerText = "[" + player.rank + "]";
    document.getElementById('ui-weapon').innerText = player.weapon;
    document.getElementById('dungeon-lvl-display').innerText = player.dungeonLevel;

    document.getElementById('res-plank').innerText = player.inventory.plank;
    document.getElementById('res-stone').innerText = player.inventory.stone;
    document.getElementById('res-meat').innerText = player.inventory.meat;
}

// --- OTWIERANIE LABORATORIUM ---
function openLab() {
    // Na razie prosty alert, tutaj zbudujemy okno craftingu!
    if(player.weapon === "None") {
        let craft = confirm("Laboratorium! Darmowy pierwszy eksperyment: Stworzyć Stone Sword? (Koszty: 0)");
        if(craft) {
            player.weapon = "Stone Sword";
            alert("Udało się! Masz Stone Sword. Możesz iść do Lochu!");
            updateUI();
        }
    } else {
        alert("Witaj w Laboratorium! Moduł łączenia itemów dodamy w kolejnym kroku.");
    }
}

// --- WCHODZENIE DO LOCHU (Logika szans i dropów) ---
function enterDungeon() {
    if(player.weapon === "None") {
        alert("Musisz mieć broń! Idź najpierw do Laboratorium po Stone Sword.");
        return;
    }

    let level = player.dungeonLevel;
    
    // Obliczanie szansy na wygraną (Zaczynamy od 100%, spada o 8.39% co poziom dla Stone Sword)
    let winChance = 100 - ((level - 1) * 8.39);
    
    // Ranga OWNER daje boost
    if(player.rank === "OWNER") winChance += 20;
    
    if(winChance < 0) winChance = 0;

    // Losowanie wyniku walki (od 0.01 do 100.00)
    let roll = (Math.random() * 100).toFixed(2);
    
    let message = `Wchodzisz do Lochu Lv.${level}!\n`;
    message += `Twoja szansa na sukces: ${winChance.toFixed(2)}%\n`;
    message += `Wylosowano: ${roll}\n\n`;

    if (roll <= winChance) {
        message += "🎉 ZWYCIĘSTWO!\n";
        
        // --- LOSOWANIE DROPÓW (Lochy Lv 1-20) ---
        // Zwykłe szanse: Plank 20%, Stone 30%, Metal 10%
        // Dodajemy modyfikatory rang (np. Owner +20%)
        let dropMod = player.rank === "OWNER" ? 1.2 : 1.0; 

        if (Math.random() * 100 <= (20 * dropMod)) {
            player.inventory.plank += 1;
            message += "+1 Plank 🪵\n";
        }
        if (Math.random() * 100 <= (30 * dropMod)) {
            player.inventory.stone += 1;
            message += "+1 Stone 🪨\n";
        }
        
        // Gwarantowane mięso (1-6 sztuk z różnymi szansami)
        let meatDrop = Math.floor(Math.random() * 3) + 1; // Uproszczony system na start
        player.inventory.meat += meatDrop;
        message += `+${meatDrop} Meat 🍖\n`;

        player.dungeonLevel++; // Awans do kolejnego lochu
    } else {
        message += "💀 PORAŻKA! Twój poziom szansy był za mały.";
    }

    alert(message);
    updateUI();
      }
