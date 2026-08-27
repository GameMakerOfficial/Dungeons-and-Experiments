// ============================================================
// PIXEL RPG TYCOON
// SCRIPT.JS
// ============================================================


// ============================================================
// WYSOKOŚĆ EKRANU MOBILE
// ============================================================

function setScreenHeight() {
    let vh = window.innerHeight * 0.01;

    document.documentElement.style.setProperty(
        '--vh',
        `${vh}px`
    );
}

window.addEventListener(
    'resize',
    setScreenHeight
);

setScreenHeight();


// ============================================================
// SCHOWANIE PASKA PRZEGLĄDARKI
// ============================================================

window.addEventListener(
    'load',
    () => {

        setTimeout(() => {
            window.scrollTo(0, 1);
        }, 100);

    }
);


// ============================================================
// FIREBASE
// ============================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyDbVxlkWCzXBmsnQ5uvFpuW91Xevf2ZR54",

    authDomain:
        "dungeons-and-experiments.firebaseapp.com",

    projectId:
        "dungeons-and-experiments",

    storageBucket:
        "dungeons-and-experiments.firebasestorage.app",

    messagingSenderId:
        "104990230475",

    appId:
        "1:104990230475:web:58e9dcca6be7a434ded84e",

    measurementId:
        "G-YCS8LP95X0"
};


firebase.initializeApp(firebaseConfig);

const db =
    firebase.firestore();


// ============================================================
// GRACZ
// ============================================================

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

        mythril: 0,

        upgradeItem: 0
    },

    // Liczba wykorzystanych Upgrade Itemów.
    // Każdy wykorzystany daje +1% do lochów.
    sniperUpgradesUsed: 0,

    // Milestone ostatnio nagrodzony Upgrade Itemem.
    sniperLastRewardLevel: 0,

    // Jednorazowe bonusy rang.
    rankRewardsClaimed: {

        OWNER: false,

        VIP: false,

        FB: false
    },

    inbox: []
};


let activeTimer = null;


// ============================================================
// NORMALIZACJA DANYCH STARYCH KONT
// ============================================================

function normalizePlayerData() {

    if (!player.inventory) {
        player.inventory = {};
    }


    const defaultInventory = {

        plank: 0,

        stone: 0,

        meat: 0,

        metal: 0,

        diamond: 0,

        mythril: 0,

        upgradeItem: 0
    };


    for (let res in defaultInventory) {

        if (
            typeof player.inventory[res]
            !== "number"
        ) {

            player.inventory[res] =
                defaultInventory[res];
        }
    }


    if (!player.rankRewardsClaimed) {

        player.rankRewardsClaimed = {

            OWNER: false,

            VIP: false,

            FB: false
        };
    }


    if (
        typeof player.rankRewardsClaimed.OWNER
        !== "boolean"
    ) {
        player.rankRewardsClaimed.OWNER = false;
    }


    if (
        typeof player.rankRewardsClaimed.VIP
        !== "boolean"
    ) {
        player.rankRewardsClaimed.VIP = false;
    }


    if (
        typeof player.rankRewardsClaimed.FB
        !== "boolean"
    ) {
        player.rankRewardsClaimed.FB = false;
    }


    if (
        typeof player.sniperUpgradesUsed
        !== "number"
    ) {
        player.sniperUpgradesUsed = 0;
    }


    if (
        typeof player.sniperLastRewardLevel
        !== "number"
    ) {
        player.sniperLastRewardLevel = 0;
    }


    if (!Array.isArray(player.inbox)) {

        player.inbox = [];
    }
}


// ============================================================
// MODALE
// ============================================================

function showModal(
    title,
    content,
    buttons,
    seconds = 0,
    onTimerFinish = null
) {

    const modal =
        document.getElementById(
            "custom-modal"
        );

    const timerElem =
        document.getElementById(
            "modal-timer"
        );

    const descElem =
        document.getElementById(
            "modal-desc"
        );


    document.getElementById(
        "modal-title"
    ).innerText = title;


    if (typeof content === "string") {

        descElem.innerText = content;

    } else {

        descElem.innerHTML = "";

        descElem.appendChild(
            content
        );
    }


    let btnContainer =
        document.getElementById(
            "modal-buttons"
        );

    btnContainer.innerHTML = "";


    if (activeTimer) {

        clearInterval(
            activeTimer
        );

        activeTimer = null;
    }


    if (seconds > 0) {

        timerElem.style.display =
            "block";

        timerElem.innerText =
            seconds + "s";


        let timeLeft = seconds;


        activeTimer =
            setInterval(() => {

                timeLeft--;

                timerElem.innerText =
                    timeLeft + "s";


                if (timeLeft <= 0) {

                    clearInterval(
                        activeTimer
                    );

                    activeTimer = null;

                    timerElem.style.display =
                        "none";


                    if (onTimerFinish) {
                        onTimerFinish();
                    }
                }

            }, 1000);

    } else {

        timerElem.style.display =
            "none";
    }


    buttons.forEach(btn => {

        let newBtn =
            document.createElement(
                "button"
            );


        newBtn.className =
            "btn";


        newBtn.innerText =
            btn.text;


        if (btn.color) {

            newBtn.style.background =
                btn.color;
        }


        newBtn.onclick = () => {

            if (activeTimer) {

                clearInterval(
                    activeTimer
                );

                activeTimer = null;
            }


            closeModal();


            if (btn.action) {

                btn.action();
            }
        };


        btnContainer.appendChild(
            newBtn
        );
    });


    modal.classList.add(
        "active"
    );
}


function closeModal() {

    document.getElementById(
        "custom-modal"
    ).classList.remove(
        "active"
    );
}


// ============================================================
// ZAPIS
// ============================================================

async function saveProgress() {

    if (!player.nickname) {
        return;
    }


    try {

        await db
            .collection("users")
            .doc(player.nickname)
            .set(
                player,
                {
                    merge: true
                }
            );

    } catch (e) {

        console.error(
            "Błąd zapisu:",
            e
        );
    }
}


// ============================================================
// UI
// ============================================================

function updateUI() {

    normalizePlayerData();


    document.getElementById(
        'ui-nick'
    ).innerText =
        player.nickname;


    document.getElementById(
        'ui-rank'
    ).innerText =
        "[" + player.rank + "]";


    document.getElementById(
        'ui-weapon'
    ).innerText =
        player.weapon;


    document.getElementById(
        'dungeon-lvl-display'
    ).innerText =
        player.dungeonLevel;


    document.getElementById(
        'res-plank'
    ).innerText =
        player.inventory.plank;


    document.getElementById(
        'res-stone'
    ).innerText =
        player.inventory.stone;


    document.getElementById(
        'res-meat'
    ).innerText =
        player.inventory.meat;


    document.getElementById(
        'res-metal'
    ).innerText =
        player.inventory.metal;


    document.getElementById(
        'res-diamond'
    ).innerText =
        player.inventory.diamond;


    document.getElementById(
        'res-mythril'
    ).innerText =
        player.inventory.mythril;


    // Upgrade Item widoczny TYLKO dla Snajpera.
    const upgradeUI =
        document.getElementById(
            "upgrade-resource-ui"
        );


    if (player.rank === "SNAJPER") {

        upgradeUI.style.display =
            "inline";

        document.getElementById(
            "res-upgrade"
        ).innerText =
            player.inventory.upgradeItem;

    } else {

        upgradeUI.style.display =
            "none";
    }
}


// ============================================================
// BONUSY RANGI - JEDNORAZOWE
// ============================================================

function grantRankReward() {

    normalizePlayerData();


    // ----------------------------
    // OWNER
    // ----------------------------

    if (
        player.rank === "OWNER" &&
        !player.rankRewardsClaimed.OWNER
    ) {

        player.inventory.mythril += 1;

        player.rankRewardsClaimed.OWNER =
            true;


        return (
            "👑 OWNER BONUS!\n\n" +
            "+1 Mythril 🔮\n\n" +
            "Darmowy Mythril otrzymujesz tylko raz."
        );
    }


    // ----------------------------
    // VIP
    // ----------------------------

    if (
        player.rank === "VIP" &&
        !player.rankRewardsClaimed.VIP
    ) {

        player.inventory.diamond += 1;

        player.rankRewardsClaimed.VIP =
            true;


        return (
            "💎 VIP BONUS!\n\n" +
            "+1 Diamond 💎\n\n" +
            "Darmowy Diamond otrzymujesz tylko raz."
        );
    }


    // ----------------------------
    // FB
    // ----------------------------

    if (
        player.rank === "FB" &&
        !player.rankRewardsClaimed.FB
    ) {

        player.inventory.metal += 1;

        player.inventory.plank += 1;

        player.rankRewardsClaimed.FB =
            true;


        return (
            "⭐ FIRST PLAYER BONUS!\n\n" +
            "+1 Metal ⚙️\n" +
            "+1 Plank 🪵\n\n" +
            "Darmowe materiały otrzymujesz tylko raz."
        );
    }


    return null;
}


// ============================================================
// CZAS LOCHU
// ============================================================

function getDungeonTime() {

    if (player.rank === "OWNER") {
        return 5;
    }


    if (player.rank === "VIP") {
        return 10;
    }


    if (player.rank === "FB") {
        return 20;
    }


    return 30;
}


// ============================================================
// DROP
// ============================================================

function getDropMultiplier() {

    if (player.rank === "OWNER") {
        return 2.0;
    }


    if (player.rank === "VIP") {
        return 1.5;
    }


    return 1.0;
}


// ============================================================
// LABORATORIUM - MNOŻNIK
// ============================================================

function getLabMultiplier() {

    if (player.rank === "OWNER") {
        return 2.0;
    }


    if (player.rank === "VIP") {
        return 1.5;
    }


    return 1.0;
}


// ============================================================
// LABORATORIUM - BONUS SNAJPERA
// ============================================================

function getSniperLabPenalty() {

    if (player.rank === "SNAJPER") {

        return -5;
    }


    return 0;
}


// ============================================================
// LOCH - MNOŻNIK RANGI
// ============================================================

function getDungeonRankMultiplier() {

    if (player.rank === "OWNER") {
        return 2.0;
    }


    if (player.rank === "VIP") {
        return 1.5;
    }


    if (player.rank === "SNAJPER") {
        return 3.0;
    }


    return 1.0;
}


// ============================================================
// UPGRADE ITEM - TYLKO SNAJPER
// ============================================================
//
// Każdy Upgrade Item:
//
// +1% do szansy w LOCHU.
//
// NIE wpływa na laboratorium.
//
// Upgrade Item zdobywa się:
// Lv 20  -> +1
// Lv 40  -> +1
// Lv 60  -> +1
// itd.
//
// ============================================================

function getSniperUpgradeBonus() {

    if (player.rank !== "SNAJPER") {
        return 0;
    }


    return player.sniperUpgradesUsed;
}


// ============================================================
// PRZYZNAWANIE UPGRADE ITEMÓW
// ============================================================

function checkSniperMilestoneReward() {

    if (player.rank !== "SNAJPER") {
        return 0;
    }


    normalizePlayerData();


    const currentLevel =
        player.dungeonLevel;


    const reachedMilestones =
        Math.floor(
            currentLevel / 20
        );


    const claimedMilestones =
        Math.floor(
            player.sniperLastRewardLevel / 20
        );


    const newRewards =
        reachedMilestones -
        claimedMilestones;


    if (newRewards <= 0) {
        return 0;
    }


    player.inventory.upgradeItem +=
        newRewards;


    player.sniperLastRewardLevel =
        reachedMilestones * 20;


    return newRewards;
}


// ============================================================
// UŻYWANIE UPGRADE ITEM
// ============================================================

function useSniperUpgrade() {

    if (player.rank !== "SNAJPER") {

        return showModal(
            "BRAK DOSTĘPU",
            "Upgrade Item jest dostępny wyłącznie dla rangi SNAJPER.",
            [
                {
                    text: "OK",
                    color: "#f44336"
                }
            ]
        );
    }


    if (
        player.inventory.upgradeItem <= 0
    ) {

        return showModal(
            "BRAK UPGRADE ITEM",
            "Nie posiadasz żadnego Upgrade Item.\n\n" +
            "Otrzymasz +1 Upgrade Item za każde 20 poziomów lochu.",
            [
                {
                    text: "OK",
                    color: "#777"
                }
            ]
        );
    }


    player.inventory.upgradeItem--;

    player.sniperUpgradesUsed++;


    updateUI();

    saveProgress();


    showModal(
        "🔼 UPGRADE!",
        "Upgrade Item został wykorzystany!\n\n" +
        "+1% do szansy sukcesu w LOCHU.\n\n" +
        `Bonus z Upgrade Itemów: +${player.sniperUpgradesUsed}%`,
        [
            {
                text: "SUPER",
                color: "#4CAF50"
            }
        ]
    );
}


// ============================================================
// REJESTRACJA
// ============================================================

async function handleRegister() {

    const nickInput =
        document.getElementById(
            'nickname-input'
        ).value.trim();


    const passInput =
        document.getElementById(
            'password-input'
        ).value.trim();


    if (
        nickInput === "" ||
        passInput === ""
    ) {

        return showModal(
            "BŁĄD",
            "Wpisz zarówno Nick jak i Hasło!",
            [
                {
                    text: "OK",
                    color: "#f44336"
                }
            ]
        );
    }


    showModal(
        "ŁADOWANIE...",
        "Tworzenie konta w chmurze...",
        []
    );


    try {

        const docRef =
            db.collection("users")
              .doc(nickInput);


        const docSnap =
            await docRef.get();


        if (docSnap.exists) {

            return showModal(
                "BŁĄD",
                "Konto o tym nicku już istnieje! Kliknij LOGIN.",
                [
                    {
                        text: "OK",
                        color: "#f44336"
                    }
                ]
            );
        }


        let newPlayer = {

            nickname:
                nickInput,

            password:
                passInput,

            rank:
                (
                    nickInput ===
                    "GameMaker_Official"
                )
                    ? "OWNER"
                    : "PLAYER",

            weapon:
                "None",

            dungeonLevel:
                1,


            inventory: {

                plank: 0,

                stone: 0,

                meat: 0,

                metal: 0,

                diamond: 0,

                mythril: 0,

                upgradeItem: 0
            },


            sniperUpgradesUsed:
                0,


            sniperLastRewardLevel:
                0,


            rankRewardsClaimed: {

                OWNER: false,

                VIP: false,

                FB: false
            },


            inbox: []
        };


        await docRef.set(
            newPlayer
        );


        showModal(
            "SUKCES!",
            "Konto utworzone pomyślnie w chmurze!\nKliknij LOGIN.",
            [
                {
                    text: "SUPER",
                    color: "#4CAF50"
                }
            ]
        );

    } catch (e) {

        console.error(e);


        showModal(
            "BŁĄD FIREBASE",
            "Nie udało się połączyć z bazą danych.",
            [
                {
                    text: "OK",
                    color: "#f44336"
                }
            ]
        );
    }
}


// ============================================================
// LOGOWANIE
// ============================================================

async function handleLogin() {

    const nickInput =
        document.getElementById(
            'nickname-input'
        ).value.trim();


    const passInput =
        document.getElementById(
            'password-input'
        ).value.trim();


    if (
        nickInput === "" ||
        passInput === ""
    ) {

        return showModal(
            "BŁĄD",
            "Wpisz Nick i Hasło!",
            [
                {
                    text: "OK",
                    color: "#f44336"
                }
            ]
        );
    }


    showModal(
        "ŁADOWANIE...",
        "Logowanie do chmury...",
        []
    );


    try {

        const docRef =
            db.collection("users")
              .doc(nickInput);


        const docSnap =
            await docRef.get();


        if (!docSnap.exists) {

            return showModal(
                "BŁĄD",
                "Konto nie istnieje! Kliknij REGISTER.",
                [
                    {
                        text: "OK",
                        color: "#f44336"
                    }
                ]
            );
        }


        let userData =
            docSnap.data();


        if (
            userData.password !==
            passInput
        ) {

            return showModal(
                "BŁĄD",
                "Błędne hasło!",
                [
                    {
                        text: "OK",
                        color: "#f44336"
                    }
                ]
            );
        }


        player =
            userData;


        normalizePlayerData();


        // ----------------------------------------------------
        // JEDNORAZOWY BONUS RANGI
        // ----------------------------------------------------

        const rankReward =
            grantRankReward();


        if (rankReward) {

            await saveProgress();
        }


        // ----------------------------------------------------
        // UI
        // ----------------------------------------------------

        updateUI();


        closeModal();


    
