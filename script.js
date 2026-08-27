// --- KONFIGURACJA FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyDbVxlkWCzXBmsnQ5uvFpuW91Xevf2ZR54",
    authDomain: "dungeons-and-experiments.firebaseapp.com",
    projectId: "dungeons-and-experiments",
    storageBucket: "dungeons-and-experiments.firebasestorage.app",
    messagingSenderId: "104990230475",
    appId: "1:104990230475:web:58e9dcca6be7a434ded84e",
    measurementId: "G-YCS8LP95X0"
  };
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  
  // --- BAZA DANYCH GRACZA ---
  let player = {
      nickname: "",
      password: "",
      rank: "PLAYER",
      weapon: "None",
      dungeonLevel: 1,
      inventory: { plank: 0, stone: 0, meat: 0, metal: 0, diamond: 0, mythril: 0 },
      inbox: []
  };
  
  let activeTimer = null;
  
  // --- SYSTEM MODALI ---
  function showModal(title, content, buttons, seconds = 0, onTimerFinish = null) {
      const modal = document.getElementById("custom-modal");
      const timerElem = document.getElementById("modal-timer");
      const descElem = document.getElementById("modal-desc");
      
      document.getElementById("modal-title").innerText = title;
      
      if (typeof content === "string") {
          descElem.innerText = content;
      } else {
          descElem.innerHTML = "";
          descElem.appendChild(content);
      }
      
      let btnContainer = document.getElementById("modal-buttons");
      btnContainer.innerHTML = "";
  
      if (activeTimer) clearInterval(activeTimer);
  
      if (seconds > 0) {
          timerElem.style.display = "block";
          timerElem.innerText = seconds + "s";
          let timeLeft = seconds;
          activeTimer = setInterval(() => {
              timeLeft--;
              timerElem.innerText = timeLeft + "s";
              if (timeLeft <= 0) {
                  clearInterval(activeTimer);
                  timerElem.style.display = "none";
                  if (onTimerFinish) onTimerFinish();
              }
          }, 1000);
      } else {
          timerElem.style.display = "none";
      }
  
      buttons.forEach(btn => {
          let newBtn = document.createElement("button");
          newBtn.className = "btn";
          newBtn.innerText = btn.text;
          if(btn.color) newBtn.style.background = btn.color;
          newBtn.onclick = () => {
              if (activeTimer) clearInterval(activeTimer);
              closeModal();
              if(btn.action) btn.action();
          };
          btnContainer.appendChild(newBtn);
      });
      modal.classList.add("active");
  }
  
  function closeModal() { document.getElementById("custom-modal").classList.remove("active"); }
  
  // --- REJESTRACJA KONTA (FIREBASE) ---
  async function handleRegister() {
      const nickInput = document.getElementById('nickname-input').value.trim();
      const passInput = document.getElementById('password-input').value.trim();
  
      if (nickInput === "" || passInput === "") {
          return showModal("BŁĄD", "Wpisz zarówno Nick jak i Hasło!", [{text: "OK", color: "#f44336"}]);
      }
  
      showModal("ŁADOWANIE...", "Tworzenie konta w chmurze...", []);
  
      try {
          const docRef = db.collection("users").doc(nickInput);
          const docSnap = await docRef.get();
  
          if (docSnap.exists) {
              return showModal("BŁĄD", "Konto o tym nicku już istnieje! Kliknij LOGIN.", [{text: "OK", color: "#f44336"}]);
          }
  
          let newPlayer = {
              nickname: nickInput,
              password: passInput,
              rank: (nickInput === "GameMaker_Official") ? "OWNER" : "PLAYER",
              weapon: "None",
              dungeonLevel: 1,
              inventory: { plank: 0, stone: 0, meat: 0, metal: 0, diamond: 0, mythril: 0 },
              inbox: []
          };
  
          await docRef.set(newPlayer);
          showModal("SUKCES!", "Konto utworzone pomyślnie w chmurze!\nKliknij LOGIN.", [{text: "SUPER", color: "#4CAF50"}]);
      } catch (e) {
          showModal("BŁĄD FIREBASE", "Nie udało się połączyć z bazą danych.", [{text: "OK", color: "#f44336"}]);
      }
  }
  
  // --- LOGOWANIE DO KONTA (FIREBASE) ---
  async function handleLogin() {
      const nickInput = document.getElementById('nickname-input').value.trim();
      const passInput = document.getElementById('password-input').value.trim();
  
      if (nickInput === "" || passInput === "") return showModal("BŁĄD", "Wpisz Nick i Hasło!", [{text: "OK", color: "#f44336"}]);
      showModal("ŁADOWANIE...", "Logowanie do chmury...", []);
  
      try {
          const docRef = db.collection("users").doc(nickInput);
          const docSnap = await docRef.get();
  
          if (!docSnap.exists) return showModal("BŁĄD", "Konto nie istnieje! Kliknij REGISTER.", [{text: "OK", color: "#f44336"}]);
  
          let userData = docSnap.data();
          if (userData.password !== passInput) return showModal("BŁĄD", "Błędne hasło!", [{text: "OK", color: "#f44336"}]);
  
          if(!userData.inbox) userData.inbox = [];
          player = userData;
          updateUI();
  
          closeModal();
          document.getElementById('start-screen').style.display = "none";
          document.getElementById('top-bar').style.display = "flex";
          document.getElementById('bottom-nav').style.display = "flex";
          document.getElementById('zone-lab').style.display = "flex";
          document.getElementById('zone-dungeon').style.display = "flex";
      } catch (e) {
          showModal("BŁĄD FIREBASE", "Problem z połączeniem z bazą danych.", [{text: "OK", color: "#f44336"}]);
      }
  }
  
  // --- ZAPIS POSTĘPU ---
  async function saveProgress() {
      if (player.nickname) {
          try {
              // Zapisujemy pełny stan gracza, zachowując inbox
              await db.collection("users").doc(player.nickname).set(player, {merge: true});
          } catch (e) { console.error("Błąd zapisu:", e); }
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
      document.getElementById('res-metal').innerText = player.inventory.metal;
      document.getElementById('res-diamond').innerText = player.inventory.diamond;
      document.getElementById('res-mythril').innerText = player.inventory.mythril;
  }
  
  // --- WYŚWIETLANIE TOP 100 GRACZY ---
  async function showLeaderboard() {
      showModal("ŁADOWANIE...", "Pobieranie rankingu graczy...", []);
      try {
          const querySnapshot = await db.collection("users")
              .orderBy("dungeonLevel", "desc")
              .limit(100)
              .get();
  
          let container = document.createElement("div");
          let place = 1;
  
          querySnapshot.forEach((doc) => {
              let data = doc.data();
              let row = document.createElement("div");
              row.className = "leaderboard-row";
              let medal = place === 1 ? "🥇" : place === 2 ? "🥈" : place === 3 ? "🥉" : `#${place}`;
              row.innerHTML = `<span>${medal} <span style="color:${data.rank==='OWNER'?'#F44336':data.rank!=='PLAYER'?'#FF9800':'#fff'}">[${data.rank}]</span> ${data.nickname}</span><span style="color: #FFD700;">Lvl ${data.dungeonLevel}</span>`;
              container.appendChild(row);
              place++;
          });
  
          showModal("🏆 TOP 100 GRACZY", container, [{ text: "ZAMKNIJ", color: "#777" }]);
      } catch (e) {
          showModal("BŁĄD", "Nie udało się pobrać rankingu.", [{ text: "OK", color: "#f44336" }]);
      }
  }

  // --- MENU SOCIAL (INBOX & PREZENTY) ---
  function openSocial() {
      showModal("SOCIAL", "Wybierz co chcesz zrobić:", [
          { text: "📬 INBOX (ODBIERZ)", color: "#2196F3", action: openInbox },
          { text: "🎁 WYŚLIJ PREZENT", color: "#4CAF50", action: openSendGift },
          { text: "ZAMKNIJ", color: "#777" }
      ]);
  }

  // --- SKRZYNKA ODBIORCZA (INBOX) ---
  async function openInbox() {
      showModal("ŁADOWANIE...", "Sprawdzanie skrytki...", []);
      try {
          const docSnap = await db.collection("users").doc(player.nickname).get();
          if (docSnap.exists) {
              player.inbox = docSnap.data().inbox || [];
          }

          if (player.inbox.length === 0) {
              return showModal("📬 INBOX", "Twoja skrzynka jest pusta.", [{ text: "WRÓĆ", color: "#777", action: openSocial }]);
          }

          let container = document.createElement("div");
          player.inbox.forEach(gift => {
              let row = document.createElement("div");
              row.className = "inbox-item";
              let desc = gift.type === "rank" ? `Nowa ranga: [${gift.rankName}]` : `+${gift.resAmount} ${gift.resType}`;
              
              row.innerHTML = `<div><strong style="color: #FFD700;">Od: ${gift.from}</strong><br><span style="color: #aaa;">${desc}</span></div>`;
              
              let btn = document.createElement("button");
              btn.className = "btn";
              btn.innerText = "ODBIERZ";
              btn.style.padding = "6px 8px";
              btn.onclick = () => claimGift(gift);
              
              row.appendChild(btn);
              container.appendChild(row);
          });

          showModal("📬 TWOJE PREZENTY", container, [{ text: "ZAMKNIJ", color: "#777" }]);
      } catch (e) {
          showModal("BŁĄD", "Nie udało się wczytać inboxa.", [{ text: "OK", color: "#f44336" }]);
      }
  }

  async function claimGift(gift) {
      if (gift.type === "rank") player.rank = gift.rankName;
      if (gift.type === "resource") player.inventory[gift.resType] += gift.resAmount;

      try {
          // Usunięcie prezentu z bazy w chmurze
          await db.collection("users").doc(player.nickname).update({
              inbox: firebase.firestore.FieldValue.arrayRemove(gift)
          });
          
          // Aktualizujemy lokalny inbox
          player.inbox = player.inbox.filter(g => g.id !== gift.id);

          updateUI();
          saveProgress();
          showModal("SUKCES!", "Prezent odebrany pomyślnie!", [{ text: "OK", color: "#4CAF50", action: openInbox }]);
      } catch(e) {
          showModal("BŁĄD", "Błąd odbierania.", [{ text: "OK", color: "#f44336" }]);
      }
  }

  // --- WYSYŁANIE PREZENTU INNEMU GRACZOWI ---
  function openSendGift() {
      let container = document.createElement("div");
      container.innerHTML = `
          <input type="text" id="gift-nick" placeholder="Nick gracza...">
          <select id="gift-res">
              <option value="plank">🪵 Plank</option>
              <option value="stone">🪨 Stone</option>
              <option value="meat">🍖 Meat</option>
              <option value="metal">⚙️ Metal</option>
              <option value="diamond">💎 Diamond</option>
              <option value="mythril">🔮 Mythril</option>
          </select>
          <input type="number" id="gift-amount" placeholder="Ilość (np. 5)" min="1">
      `;
      showModal("🎁 WYŚLIJ PREZENT", container, [
          { text: "WYŚLIJ", color: "#4CAF50", action: processSendGift },
          { text: "ANULUJ", color: "#777", action: openSocial }
      ]);
  }

  async function processSendGift() {
      let targetNick = document.getElementById('gift-nick').value.trim();
      let resType = document.getElementById('gift-res').value;
      let amount = parseInt(document.getElementById('gift-amount').value);

      if (!targetNick || !amount || amount <= 0) return showModal("BŁĄD", "Uzupełnij poprawnie dane!", [{ text: "OK", color: "#f44336", action: openSendGift }]);
      if (targetNick === player.nickname) return showModal("BŁĄD", "Nie możesz wysłać prezentu samemu sobie!", [{ text: "OK", color: "#f44336", action: openSendGift }]);
      if (player.inventory[resType] < amount) return showModal("BŁĄD", "Nie masz tyle surowców!", [{ text: "OK", color: "#f44336", action: openSendGift }]);

      showModal("WYSYŁANIE...", "Szukanie gracza w bazie...", []);

      try {
          const targetRef = db.collection("users").doc(targetNick);
          const targetSnap = await targetRef.get();

          if (!targetSnap.exists) return showModal("BŁĄD", "Taki gracz nie istnieje!", [{ text: "OK", color: "#f44336", action: openSendGift }]);

          player.inventory[resType] -= amount;
          saveProgress();
          updateUI();

          let newGift = { id: Date.now(), from: player.nickname, type: "resource", resType: resType, resAmount: amount };

          await targetRef.update({
              inbox: firebase.firestore.FieldValue.arrayUnion(newGift)
          });

          showModal("SUKCES!", "Wysłano prezent do " + targetNick + "!", [{ text: "SUPER", color: "#4CAF50" }]);
      } catch (e) {
          showModal("BŁĄD", "Wystąpił błąd podczas wysyłania.", [{ text: "OK", color: "#f44336" }]);
      }
  }
  
  // --- LABORATORIUM ---
  function openLab() {
      if (player.weapon === "None") {
          showModal("LABORATORY", "Witaj na pierwszej wizycie!\nTwój pierwszy eksperyment to stworzenie broni.\nKoszt: ZA DARMO\nSzansa: 100%", [
              { text: "CRAFT (100%)", color: "#4CAF50", action: () => {
                  player.weapon = "Stone Sword"; saveProgress(); updateUI();
                  showModal("SUKCES!", "Stworzyłeś Stone Sword!\nDroga do Lochów stoi otworem.", [{text: "ZAMKNIJ", color: "#2196F3"}]);
              }}, { text: "ANULUJ", color: "#777" }
          ]);
      } else {
          const recipes = [
              { name: "Standard Exp.", time: 10, resultWeapon: "Advanced Sword", cost: { plank: 2, stone: 2 } },
              { name: "Iron Upgrade", time: 20, resultWeapon: "Iron Sword", cost: { plank: 2, stone: 2, metal: 1 } },
              { name: "Diamond Craft", time: 30, resultWeapon: "Diamond Sword", cost: { plank: 2, stone: 2, diamond: 1 } },
              { name: "Mythril Forge", time: 60, resultWeapon: "Mythril Blade", cost: { plank: 2, stone: 2, mythril: 1 } }
          ];
          let container = document.createElement("div");
          recipes.forEach(rec => {
              let hasResources = true, costString = "";
              for (let res in rec.cost) {
                  let icon = res==="plank"?"🪵":res==="stone"?"🪨":res==="metal"?"⚙️":res==="diamond"?"💎":"🔮";
                  costString += `${rec.cost[res]}${icon} `;
                  if (player.inventory[res] < rec.cost[res]) hasResources = false;
              }
              let card = document.createElement("div");
              card.className = `craft-card ${hasResources ? "available" : "unavailable"}`;
              card.innerHTML = `<div><strong style="color: #FFD700;">${rec.name}</strong> (${rec.time}s)<br><span style="color: #aaa;">Koszt: ${costString}</span></div>`;
              let btn = document.createElement("button"); btn.className = "btn"; btn.innerText = "START"; btn.style.fontSize = "7px"; btn.style.padding = "6px 8px";
              if (!hasResources) { btn.style.background = "#555"; btn.style.borderColor = "#333"; btn.style.boxShadow = "none"; btn.disabled = true; } 
              else { btn.onclick = () => startCrafting(rec); }
              card.appendChild(btn); container.appendChild(card);
          });
          showModal("WYBIERZ EKSPERYMENT", container, [{ text: "WYJDŹ", color: "#777" }]);
      }
  }
  
  function startCrafting(recipe) {
      for (let res in recipe.cost) player.inventory[res] -= recipe.cost[res];
      updateUI();
      showModal("EKSPERYMENT IN PROGRESS...", `Tworzenie: ${recipe.name}\nLaboratorium pracuje...`, [], recipe.time, () => {
          if (Math.random() * 100 <= 80) {
              player.weapon = recipe.resultWeapon;
              showModal("SUKCES!", `Eksperyment udany!\nOtrzymano nową broń: ${recipe.resultWeapon}`, [{text: "EKSTRA", color: "#4CAF50"}]);
          } else {
              showModal("PORAŻKA!", "BUM! Eksperyment wybuchł.\nStraciłeś użyte surowce.", [{text: "TRUDNO", color: "#f44336"}]);
          }
          saveProgress(); updateUI();
      });
  }
  
  // --- LOCHY ---
  function enterDungeon() {
      if (player.weapon === "None") return showModal("BŁĄD", "Jesteś bezbronny!\nWejdź do Laboratorium by odebrać darmowy miecz.", [{text: "OK", color: "#f44336"}]);
      let level = player.dungeonLevel;
      let winChance = 100 - ((level - 1) * 8.39);
      if (player.rank === "OWNER") winChance += 20;
      if (winChance < 0) winChance = 0;
  
      showModal("WALKA W LOCHU...", `Poziom lochów: ${level}\nTwoja szansa: ${winChance.toFixed(1)}%\n\nWalczysz z potworami...`, [], 30, () => {
          let roll = (Math.random() * 100).toFixed(2);
          let isWin = parseFloat(roll) <= winChance;
          let title = isWin ? "🎉 ZWYCIĘSTWO!" : "💀 PORAŻKA!";
          let message = `Loch: Poziom ${level}\nSzansa wynosiła: ${winChance.toFixed(2)}%\nWylosowano: ${roll}\n\n`;
  
          if (isWin) {
              let dropMod = player.rank === "OWNER" ? 2.0 : 1.0; 
              if (Math.random() * 100 <= (20 * dropMod)) { player.inventory.plank += 1; message += "+1 Plank 🪵\n"; }
              if (Math.random() * 100 <= (30 * dropMod)) { player.inventory.stone += 1; message += "+1 Stone 🪨\n"; }
              if (Math.random() * 100 <= (10 * dropMod)) { player.inventory.metal += 1; message += "+1 Metal ⚙️\n"; }
              let meatDrop = Math.floor(Math.random() * 3) + 1; player.inventory.meat += meatDrop; message += `+${meatDrop} Meat 🍖\n`;
              player.dungeonLevel++; 
          } else {
              message += "Zostałeś pokonany w walce.";
          }
          showModal(title, message, [{text: "KONTYNUUJ", color: isWin ? "#4CAF50" : "#f44336"}]);
          saveProgress(); updateUI();
      });
  }
  
  function showInventoryMsg() { showModal("EKWIPUNEK", "Panel Ekwipunku jest w trakcie budowy.", [{text: "ZAMKNIJ", color: "#777"}]); }
              
