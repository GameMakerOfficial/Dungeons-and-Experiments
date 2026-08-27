// --- BAZA DANYCH GRACZA ---
let player = {
    nickname: "",
    password: "",
    rank: "PLAYER",
    weapon: "None",
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

// --- SYSTEM MODALI (WYSKAKUJĄCYCH OKIEN) ---
function showModal(title, text, buttons) {
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-desc").innerText = text;
    
    let btnContainer = document.getElementById("modal-buttons");
    btnContainer.innerHTML = "";

    buttons.forEach(btn => {
        let newBtn = document.createElement("button");
        newBtn.className = "btn";
        newBtn.innerText = btn.text;
        if(btn.color) newBtn.style.background = btn.color;
        
        newBtn.onclick = () => {
            closeModal();
            if(btn.action) btn.action();
        };
        btnContainer.appendChild(newBtn);
    });

    document.getElementById("custom-modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("custom-modal").style.display = "none";
}

// --- REJESTRACJA KONTA ---
function handleRegister() {
    const nickInput = document.getElementById('nickname-input').value.trim();
    const passInput = document.getElementById('password-input').value.trim();

    if (nickInput === "" || passInput === "") {
        showModal("BŁĄD", "Wpisz zarówno Nick jak i Hasło!", [{text: "OK", color: "#f44336"}]);
        return;
    }

    if (localStorage.getItem("user_" + nickInput)) {
        showModal("BŁĄD", "Konto o tym nicku już istnieje! Kliknij LOGIN.", [{text: "OK", color: "#f44336"}]);
        return;
    }

    let newPlayer = {
        nickname: nickInput,
        password: passInput,
        rank: (nickInput === "GameMaker_Official") ? "OWNER" : "PLAYER",
        weapon: "None",
        dungeonLevel: 1,
        inventory: { plank: 0, stone: 0, meat: 0, metal: 0, diamond: 0, mythril: 0 }
    };

    if (nickInput === "GameMaker_Official") {
        newPlayer.inventory.plank += 10;
        newPlayer.inventory.mythril += 1;
    }

    localStorage.setItem("user_" + nickInput, JSON.stringify(newPlayer));
    showModal("SUKCES!", "Konto utworzone pomyślnie!\nTeraz kliknij LOGIN.", [{text: "SUPER", color: "#4CAF50"}]);
}

// --- LOGOWANIE DO KONTA ---
function handleLogin() {
    const nickInput = document.getElementById('nickname-input').value.trim();
    const passInput = document.getElementById('password-input').value.trim();

    const savedData = localStorage.getItem("user_" + nickInput);

    if (!savedData) {
        showModal("BŁĄD", "Nie znaleziono konta.\nKliknij REGISTER!", [{text: "OK", color: "#f44336"}]);
        return;
    }

    let userData = JSON.parse(savedData);

    if (userData.password !== passInput) {
        showModal("BŁĄD", "Błędne hasło!", [{text: "OK", color: "#f44336"}]);
        return;
    }

    player = userData;
    updateUI();

    document.getElementById('start-screen').style.display = "none";
    document.getElementById('top-bar').style.display = "flex";
    document.getElementById('bottom-nav').style.display = "flex";
    document.getElementById('zone-lab').style.display = "flex";
    document.getElementById('zone-dungeon').style.display = "flex";
}

function saveProgress() {
    if (player.nickname) {
        localStorage.setItem("user_" + player.nickname, JSON.stringify(player));
    }
}

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
    if (player.weapon === "None") {
        showModal("LABORATORY", "Witaj na pierwszej wizycie!\nTwój pierwszy eksperyment to stworzenie broni.\nKoszt: ZA DARMO\nSzansa: 100%", [
            { text: "CRAFT (100%)", color: "#4CAF50", action: () => {
                player.weapon = "Stone Sword";
                saveProgress();
                updateUI();
                setTimeout(() => showModal("SUKCES!", "Stworzyłeś Stone Sword!\nDroga do Lochów stoi otworem.", [{text: "ZAMKNIJ", color: "#2196F3"}]), 150);
            }},
            { text: "ANULUJ", color: "#777" }
        ]);
    } else {
        let costPlank = 2;
        let costStone = 2;
        
        showModal("LABORATORY", `Kolejny eksperyment.\nKoszt: ${costPlank}x Plank, ${costStone}x Stone.\nSzansa powodzenia: 80%`, [
            { text: "SPRÓBUJ", color: "#FF9800", action: () => {
                if (player.inventory.plank >= costPlank && player.inventory.stone >= costStone) {
                    player.inventory.plank -= costPlank;
                    player.inventory.stone -= costStone;
                    updateUI();
                    
                    let roll = Math.random() * 100;
                    if (roll <= 80) {
                        setTimeout(() => showModal("SUKCES!", "Eksperyment udany!", [{text: "EKSTRA", color: "#4CAF50"}]), 150);
                    } else {
                        setTimeout(() => showModal("PORAŻKA!", "BUM! Eksperyment wybuchł.\nStraciłeś użyte surowce.", [{text: "TRUDNO", color: "#f44336"}]), 150);
                    }
                    saveProgress();
                } else {
                    setTimeout(() => showModal("BRAK SUROWCÓW", `Potrzebujesz:\n${costPlank}x Plank\n${costStone}x Stone`, [{text: "OK", color: "#f44336"}]), 150);
                }
            }},
            { text: "WYJDŹ", color: "#777" }
        ]);
    }
}

// --- WCHODZENIE DO LOCHU ---
function enterDungeon() {
    if (player.weapon === "None") {
        showModal("BŁĄD", "Jesteś bezbronny!\nWejdź do Laboratorium by odebrać darmowy miecz.", [{text: "OK", color: "#f44336"}]);
        return;
    }

    let level = player.dungeonLevel;
    let winChance = 100 - ((level - 1) * 8.39);
    
    if (player.rank === "OWNER") winChance += 20;
    if (winChance < 0) winChance = 0;

    let roll = (Math.random() * 100).toFixed(2);
    let isWin = parseFloat(roll) <= winChance;

    let title = isWin ? "🎉 ZWYCIĘSTWO!" : "💀 PORAŻKA!";
    let message = `Loch: Poziom ${level}\nTwoja szansa: ${winChance.toFixed(2)}%\nWylosowano: ${roll}\n\n`;

    if (isWin) {
        let dropMod = player.rank === "OWNER" ? 2.0 : 1.0; 

        if (Math.random() * 100 <= (20 * dropMod)) {
            player.inventory.plank += 1;
            message += "+1 Plank 🪵\n";
        }
        if (Math.random() * 100 <= (30 * dropMod)) {
            player.inventory.stone += 1;
            message += "+1 Stone 🪨\n";
        }
        
        let meatDrop = Math.floor(Math.random() * 3) + 1;
        player.inventory.meat += meatDrop;
        message += `+${meatDrop} Meat 🍖\n`;

        player.dungeonLevel++; 
    } else {
        message += "Zostałeś pokonany.";
    }

    showModal(title, message, [{text: "KONTYNUUJ", color: isWin ? "#4CAF50" : "#f44336"}]);
    saveProgress();
    updateUI();
}

// --- ZASTĄPIENIE ALERTÓW W DOLNYM MENU ---
function showInventoryMsg() {
    showModal("EKWIPUNEK", "Panel Ekwipunku jest w trakcie budowy.", [{text: "ZAMKNIJ", color: "#777"}]);
}
function showQuestsMsg() {
    showModal("MISJE", "Lista zadań i nagród będzie wkrótce dostępna.", [{text: "ZAMKNIJ", color: "#777"}]);
}
