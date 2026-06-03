// auth.js — Login, Register, Session, Offline-Earnings, Ladescreen

// ===== Ladescreen Simulation =====
const LOAD_PETS  = ['🐱','🐶','🐰','🦊','🐻','🦁','🐯','🐺','🐲','🦄','👹','🐙','🤖','👾','🌟','☄️','🪐'];
const LOAD_NAMES = ['Katze','Hund','Hase','Fuchs','Bär','Löwe','Tiger','Wolf','Drache','Einhorn','Oni','Krake','Roboter','Alien','Stern','Komet','Planet'];
let _loadSim = null;

function startLoadSim(){
  const idx = Math.floor(Math.random()*LOAD_PETS.length);
  const petEl   = document.getElementById('loadPet');
  const nameEl  = document.getElementById('loadPetName');
  const moneyEl = document.getElementById('loadMoney');
  const arenaEl = document.getElementById('loadArenaWrap');
  if(!petEl) return;
  petEl.textContent  = LOAD_PETS[idx];
  nameEl.textContent = LOAD_NAMES[idx];
  let coins = 0;
  const perClick = Math.floor(Math.random()*8)+2;
  const fmtL = n => n>=1000000?(n/1000000).toFixed(1)+'M':n>=1000?(n/1000).toFixed(1)+'K':''+n;

  function doLoadClick(){
    if(!document.getElementById('loadPet')) return;
    coins += perClick;
    moneyEl.textContent = fmtL(coins);
    petEl.classList.remove('squash'); void petEl.offsetWidth; petEl.classList.add('squash');
    const f = document.createElement('div');
    f.className = 'load-float';
    f.textContent = '+$'+perClick;
    const r = arenaEl.getBoundingClientRect();
    f.style.left = (r.width/2 - 20 + (Math.random()*60-30))+'px';
    f.style.top  = (r.height/2 - 60)+'px';
    arenaEl.appendChild(f);
    setTimeout(()=>f.remove(), 900);
  }

  const delay = ()=>Math.floor(Math.random()*300)+400;
  function scheduleClick(){
    _loadSim = setTimeout(()=>{
      doLoadClick();
      if(document.getElementById('loadPet')) scheduleClick();
    }, delay());
  }
  scheduleClick();
}

function stopLoadSim(){ clearTimeout(_loadSim); _loadSim=null; }

function setLoadStatus(text, pct){
  const s=document.getElementById('loadStatus'), f=document.getElementById('loadFill');
  if(s) s.textContent=text;
  if(f) f.style.width=pct+'%';
}
function hideLoadScreen(){
  stopLoadSim();
  const s=document.getElementById('loadScreen');
  if(!s) return;
  s.classList.add('hide');
  setTimeout(()=>s.remove(), 700);
}

// ===== Auth =====
function setSession(pid,user){ localStorage.setItem(SESSION_KEY, JSON.stringify({playerId:pid,username:user})); }
function showAuth(){ document.getElementById("authModal").classList.add("open"); setAuthMode("login"); }
function hideAuth(){ document.getElementById("authModal").classList.remove("open"); }
function setAuthMode(m){ authMode=m;
  document.getElementById("tabLogin").classList.toggle("sel",m==="login");
  document.getElementById("tabReg").classList.toggle("sel",m==="register");
  document.getElementById("auConfirmWrap").style.display = m==="register"?"":"none";
  document.getElementById("auSubmit").textContent = m==="register"?"Account erstellen":"Anmelden";
  document.getElementById("auPass").value=""; document.getElementById("auPass2").value="";
  document.getElementById("auErr").textContent=""; }
async function submitAuth(){
  const btn=document.getElementById("auSubmit"), err=document.getElementById("auErr");
  const user=document.getElementById("auUser").value.trim();
  const pw=document.getElementById("auPass").value, pw2=document.getElementById("auPass2").value;
  err.textContent="";
  if(!/^[a-zA-Z0-9_]{3,16}$/.test(user)){ err.textContent="Benutzername: 3–16 Zeichen (a–Z, 0–9, _)"; return; }
  if(isNameBlacklisted(user)){ err.textContent="Dieser Benutzername ist nicht erlaubt."; return; }
  if(!/^[0-9]{6}$/.test(pw)){ err.textContent="PIN muss genau 6 Ziffern sein"; return; }
  if(authMode==="register" && pw!==pw2){ err.textContent="PINs stimmen nicht überein"; return; }
  if(!(window.crypto&&crypto.subtle)){ err.textContent="Krypto nicht verfügbar – bitte über einen Webserver öffnen"; return; }
  btn.disabled=true; const orig=btn.textContent; btn.textContent="…";
  try{ if(authMode==="register") await register(user,pw); else await login(user,pw); }
  catch(e){ err.textContent=(typeof e==="string"?e:"Fehler – versuch es nochmal"); btn.disabled=false; btn.textContent=orig; return; } }
async function register(user,pw){
  const key=user.toLowerCase(); let existing=null;
  try{ existing=await dbGet(acctPath(key)); }catch(e){ throw "Verbindungsfehler"; }
  if(existing) throw "Benutzername schon vergeben";
  const {salt,hash}=await hashPassword(pw); const pid=genId();
  await dbUpdate(acctPath(key), { username:user, salt, hash, playerId:pid, createdAt:Date.now() });
  playerId=pid; currentUsername=user;
  Object.keys(S).forEach(k=>delete S[k]); Object.assign(S, freshState()); S.name=user;
  setSession(pid,user); await save(true); afterAuth(); }
async function login(user,pw){
  const key=user.toLowerCase(); let acc=null;
  try{ acc=await dbGet(acctPath(key)); }catch(e){ throw "Verbindungsfehler"; }
  if(!acc) throw "Benutzer nicht gefunden";
  const {hash}=await hashPassword(pw, acc.salt);
  if(hash!==acc.hash) throw "Falsches Passwort";
  playerId=acc.playerId; currentUsername=acc.username;
  let d=null; try{ d=await dbGet(playerPath(playerId)); }catch(e){}
  const migrated2=migrateState(Object.assign(freshState(), d||{}));
  Object.keys(S).forEach(k=>delete S[k]); Object.assign(S, migrated2);
  if(d&&d.pets) S.pets=d.pets; if(!PETS[S.equipped])S.equipped=1; S.name=acc.username;
  setSession(acc.playerId, acc.username); offlineEarnings(); save(true); afterAuth(); }
function logout(){ showModal({ icon:"👋", title:"Abmelden?", body:"Dein Fortschritt wird gespeichert.", yes:"Abmelden", no:"Abbrechen", onYes:()=>{ save(true); localStorage.removeItem(SESSION_KEY); location.reload(); } }); }
function offlineEarnings(){
  const capSec = Math.max(1, S.rebirths) * 60;
  const el=Math.min((Date.now()-(S.lastSeen||Date.now()))/1000, capSec);
  if(el>10 && idlePerSec()>0){
    const earned=idlePerSec()*el;
    const hrs=Math.floor(el/3600), mins=Math.floor((el%3600)/60), secs=Math.floor(el%60);
    const timeStr=hrs>0?`${hrs}h ${mins}m`:mins>0?`${mins}m ${secs}s`:`${secs}s`;
    const pct=Math.min(100,el/capSec*100);
    setTimeout(()=>{ showOfflineModal(earned, timeStr, pct, capSec); },600);
  }
}
function showOfflineModal(earned, timeStr, pct, capSec){
  const w=document.getElementById("modalWrap");
  const fillColor=pct>=100?"#ffd700":pct>=60?"#7be39a":pct>=30?"#60b8ff":"#a0d8ff";
  const jarFill=Math.round(pct);
  const capMin=Math.round(capSec/60);
  const capInfo=S.rebirths===0?"Max. 1 Min (0 Wiedergeburten)":`Max. ${capMin} Min (${S.rebirths}× Wiedergeburt)`;
  document.getElementById("modalIcon").innerHTML=`
    <div style="position:relative;display:inline-block;font-size:72px;line-height:1">
      <span style="position:relative;z-index:1">🫙</span>
      <div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:36px;height:${Math.round(jarFill*0.38)}px;max-height:38px;background:${fillColor};border-radius:0 0 8px 8px;opacity:0.7;z-index:0"></div>
    </div>`;
  document.getElementById("modalTitle").textContent="Willkommen zurück! 👋";
  document.getElementById("modalBody").textContent=`Du warst ${timeStr} weg.\nDein Glas hat sich gefüllt:\n\n+$${fmt(earned)}\n\n${capInfo}`;
  document.getElementById("modalYes").textContent="🫙 Einsammeln!";
  document.getElementById("modalNo").textContent="Später";
  w.classList.add("open");
  const close=()=>w.classList.remove("open");
  document.getElementById("modalYes").onclick=()=>{ close(); S.coins+=earned; S.totalEarned+=earned; S.lifetimeEarned+=earned; dirty=true; updateHud(); toast(`🫙 +$${fmt(earned)} eingesammelt!`); };
  document.getElementById("modalNo").onclick=()=>{ close(); };
}
function afterAuth(){ hideAuth(); document.getElementById("userChip").textContent="👤 "+currentUsername; loaded=true; renderAll(); startLoopsOnce(); hideLoadScreen(); }
function boot(){
  startLoadSim();
  setLoadStatus('Verbinde mit Firebase…', 15);
  // Warte bis Firebase-Modul fertig geladen ist
  function waitForFirebase(cb){
    if(window._firebaseReady) cb();
    else document.addEventListener('firebaseReady', cb, {once:true});
  }
  waitForFirebase(()=>{
    setLoadStatus('Prüfe Sitzung…', 30);
    const s=JSON.parse(localStorage.getItem(SESSION_KEY)||"null");
    if(s&&s.playerId&&s.username){
      playerId=s.playerId; currentUsername=s.username;
      (async()=>{
        setLoadStatus('Lade Spielstand…', 55);
        let d=null;
        try{
          d=await dbGet(playerPath(playerId));
          console.log('[boot] Firebase data loaded:', d ? 'OK ('+Object.keys(d).length+' keys)' : 'null/empty');
          console.log('[boot] keys:', d ? Object.keys(d) : []);
          console.log('[boot] coins:', d?.coins, 'rebirths:', d?.rebirths, 'pets:', d?.pets);
        }catch(e){
          console.error('[boot] Firebase error:', e);
          toast("⚠️ Verbindungsfehler – lokaler Stand");
        }
        setLoadStatus('Initialisiere…', 85);
        if(d){
          const migrated = migrateState(Object.assign(freshState(), d));
          // S in-place überschreiben damit alle anderen Scripts dieselbe Referenz nutzen
          Object.keys(S).forEach(k=>delete S[k]);
          Object.assign(S, migrated);
          if(d.pets) S.pets=d.pets;
          if(!PETS[S.equipped]) S.equipped=1;
        }
        S.name=currentUsername;
        offlineEarnings(); afterAuth(); save(true);
      })();
    } else {
      setLoadStatus('Bereit!', 100);
      setTimeout(()=>{ hideLoadScreen(); showAuth(); }, 500);
    }
  });
}