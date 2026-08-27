// --- BAZA DANYCH GRACZA ---
let player = {
    nickname: "",
    password: "",
    rank: "PLAYER", // Może być: OWNER, VIP, FP, SNIPER
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

// --- REJESTRACJA KONTA ---
function handleRegister() {
    const nickInput = document.getElementById('nickname-input').value.trim();
    const passInput = document.getElementById('password-input').value.trim();

    if (nickInput === "" || passInput === "") {
        alert("Enter both Nickname and Password!");
        return;
    }

    // Sprawdzanie czy konto już istnieje
    if (localStorage.getItem("user_" + nickInput)) {
        alert("Account with this nickname already exists! Click LOGIN.");
        return;
    }

    // Tworzenie nowego konta
    let newPlayer = {
        nickname: nickInput,
        password: passInput,
        rank: (nickInput === "GameMaker_Official") ? "OWNER" : "PLAYER",
        weapon: "None",
        dungeonLevel: 1,
        inventory: { plank: 0, stone: 0, meat: 0, metal: 0, diamond: 0, mythril: 0 }
    };

    // Bonus dla Właściciela (OWNER)
    if (nickInput === "GameMaker_Official") {
        newPlayer.inventory.plank += 10;
        newPlayer.inventory.mythril += 1;
    }

    // Zapis konta w przeglądarce
    localStorage.setItem("user_" + nickInput, JSON.stringify(newPlayer));
    alert("Account created successfully! Now click LOGIN.");
}

// --- LOGOWANIE DO KONTA ---
function handleLogin() {
    const nickInput = document.getElementById('nickname-input').value.trim();
    const passInput = document.getElementById('password-input').value.trim();

    if (nickInput === "" || passInput === "") {
        alert("Enter both Nickname and Password!");
        return;
    }

    const savedData = localStorage.getItem("user_" + nickInput);

    if (!savedData) {
        alert("Account not found. Click REGISTER first!");
        return;
    }

    let userData = JSON.parse(savedData);

    // Weryfikacja hasła
    if (userData.password !== passInput) {
        alert("Incorrect password!");
        return;
    }

    // Pomyślne logowanie
    player = userData;
    updateUI();

    // Ukrycie ekranu startowego i pokazanie gry
    document.getElementById('start-screen').style.display = "none";
    document.getElementById('top-bar').style.display = "flex";
    document.getElementById('bottom-nav').style.display = "flex";
    document.getElementById('zone-lab').style.display = "flex";
    document.getElementById('zone-dungeon').style.display = "flex";
}

// --- ZAPISYWANIE POSTĘPU GRACZA ---
function saveProgress() {
    if (player.nickname) {
        localStorage.setItem("user_" + player.nickname, JSON.stringify(player));
    }
}

// --- ODŚWIEŻANIE INTERFEJSU (UI) ---
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
        let craft = confirm("Laboratory! Free first experiment: Craft Stone Sword?");
        if (craft) {
            player.weapon = "Stone Sword";
            alert("Success! You created Stone Sword. Now you can enter Dungeon!");
            saveProgress();
            updateUI();
        }
    } else {
        alert("Welcome to Laboratory! Experiment crafting system coming soon.");
    }
}

// --- WCHODZENIE DO LOCHU (SZANSE I SPADEK O 8.39%) ---
function enterDungeon() {
    if (player.weapon === "None") {
        alert("You need a weapon! Go to Laboratory to get your Stone Sword.");
        return;
    }

    let level = player.dungeonLevel;
    
    // Obliczanie szansy na wygraną (spadek o 8.39% co poziom)
    let winChance = 100 - ((level - 1) * 8.39);
    
    // Ranga OWNER daje +20% szans
    if (player.rank === "OWNER") winChance += 20;
    
    if (winChance < 0) winChance = 0;

    let roll = (Math.random() * 100).toFixed(2);
    
    let message = `Entering Dungeon Lv.${level}!\n`;
    message += `Win Chance: ${winChance.toFixed(2)}%\n`;
    message += `Rolled: ${roll}\n\n`;

    if (roll <= winChance) {
        message += "🎉 VICTORY!\n";
        
        // Modyfikator dla właściciela
        let dropMod = player.rank === "OWNER" ? 2.0 : 1.0; 

        // Losowanie lootów (Deska 20%, Kamień 30%)
        if (Math.random() * 100 <= (20 * dropMod)) {
            player.inventory.plank += 1;
            message += "+1 Plank 🪵\n";
        }
        if (Math.random() * 100 <= (30 * dropMod)) {
            player.inventory.stone += 1;
            message += "+1 Stone 🪨\n";
        }
        
        // Drop mięsa (1-3 sztuki)
        let meatDrop = Math.floor(Math.random() * 3) + 1;
        player.inventory.meat += meatDrop;
        message += `+${meatDrop} Meat 🍖\n`;

        player.dungeonLevel++; // Odblokowanie kolejnego poziomu
    } else {
        message += "💀 DEFEAT! Win chance was too low.";
    }

    saveProgress();
    alert(message);
    updateUI();
}
