import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
const firebaseConfig = {
  apiKey: "AIzaSyCse7ZqdinNvdIE81aLlrM-T9mhmLQbfNM",
  authDomain: "kinderpunkte.firebaseapp.com",
  databaseURL: "https://kinderpunkte-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "kinderpunkte", storageBucket: "kinderpunkte.firebasestorage.app",
  messagingSenderId: "692809846345", appId: "1:692809846345:web:7f768feca0a0a5f7ee3998"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const DB_PREFIX = "emojiClicker";
const TABLES = { players: DB_PREFIX+"/players", accounts: DB_PREFIX+"/accounts", meta: DB_PREFIX+"/meta", boss: DB_PREFIX+"/boss" };
const playerPath = (id) => `${TABLES.players}/${id}`;
const acctPath = (key) => `${TABLES.accounts}/${key}`;
async function dbGet(p){ const s=await get(ref(db,p)); return s.val(); }
async function dbUpdate(p,v){ await update(ref(db,p),v); }
function buf2hex(buf){ return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join(""); }
function hex2buf(hex){ const a=new Uint8Array(hex.length/2); for(let i=0;i<a.length;i++)a[i]=parseInt(hex.substr(i*2,2),16); return a; }
async function hashPassword(password, saltHex){
  const enc=new TextEncoder();
  const salt = saltHex ? hex2buf(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const km = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name:"PBKDF2", salt, iterations:120000, hash:"SHA-256" }, km, 256);
  return { salt: buf2hex(salt), hash: buf2hex(bits) };
}
window.dbGet = dbGet;
window.dbUpdate = dbUpdate;
window.hashPassword = hashPassword;
window.TABLES = TABLES;
window.playerPath = playerPath;
window.acctPath = acctPath;
window._firebaseReady = true;
document.dispatchEvent(new Event('firebaseReady'));