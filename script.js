// 🔥 FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAg47iuhmvXmJ_SHxp7k2aUg20wZI4_RHo",
  authDomain: "fronteira-rpg-77819.firebaseapp.com",
  projectId: "fronteira-rpg-77819",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔐 LOGIN
window.login = async () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch {
    await createUserWithEmailAndPassword(auth, email, password);
  }
};

window.logout = () => signOut(auth);

onAuthStateChanged(auth, user => {
  if (user) {
    login-screen.classList.add("hidden");
    app.classList.remove("hidden");
    loadCharacters();
    initSkills();
  }
});

// 🧠 PERÍCIAS
const skillNames = [
  "Luta", "Armas Brancas", "Armas de Fogo", "Esquiva",
  "Conhecimento", "Percepção", "Investigação", "Ocultismo", "Intuição",
  "Acrobacia", "Atletismo", "Furtividade", "Resistência",
  "Diplomacia", "Persuasão", "Enganação", "Intimidação", "Empatia"
];

let skills = {};
let points = 200;

function initSkills() {
  const container = document.getElementById("skills");
  container.innerHTML = "";
  skillNames.forEach(name => {
    skills[name] = 20;
    const div = document.createElement("div");
    div.className = "skill";
    div.innerHTML = `
      <strong>${name}</strong><br>
      <input type="number" value="20" min="0" onchange="updateSkill('${name}', this.value)">
    `;
    container.appendChild(div);
  });
  updatePoints();
}

window.updateSkill = (name, value) => {
  value = parseInt(value);
  const total = Object.values(skills).reduce((a,b)=>a+b,0) - skills[name] + value;
  if (total > 200 || value < 0) return;
  skills[name] = value;
  updatePoints();
};

function updatePoints() {
  document.getElementById("points").innerText =
    200 - Object.values(skills).reduce((a,b)=>a+b,0);
}

// 💾 SALVAR
window.saveCharacter = async () => {
  await addDoc(collection(db, "characters"), {
    uid: auth.currentUser.uid,
    name: charName.value,
    player: playerName.value,
    appearance: appearance.value,
    history: history.value,
    goals: goals.value,
    skills,
    life: 15,
    sanity: 15,
    control: 0
  });
  alert("Personagem salvo!");
  loadCharacters();
};

// 📜 LISTAR
async function loadCharacters() {
  const list = document.getElementById("characterList");
  list.innerHTML = "";
  const snap = await getDocs(collection(db, "characters"));
  snap.forEach(doc => {
    const c = doc.data();
    if (c.uid !== auth.currentUser.uid) return;
    const div = document.createElement("div");
    div.className = "character-card";
    div.innerHTML = `<strong>${c.name}</strong> — ${c.player}`;
    list.appendChild(div);
  });
}

// 🎲 DADOS
window.loadDiceSkills = () => {
  const panel = document.getElementById("diceSkills");
  panel.innerHTML = "";
  Object.entries(skills).forEach(([name, val]) => {
    const btn = document.createElement("button");
    btn.innerText = `${name} (${val}%)`;
    btn.onclick = () => roll(val);
    panel.appendChild(btn);
  });
};

function roll(chance) {
  const r = Math.floor(Math.random()*100)+1;
  const panel = document.getElementById("diceResult");
  panel.classList.remove("hidden");
  diceNumber.innerText = r;

  let text = "Fracasso";
  if (r <= chance) text = "Sucesso";
  if (r <= chance*0.3) text = "Sucesso Extremo";
  if (r >= 90) text = "Desastre";

  diceText.innerText = text;
}

// 🧭 TABS
window.showTab = id => {
  document.querySelectorAll(".tab").forEach(t=>t.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
};
