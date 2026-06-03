// ui.js — HUD, Panels, Render-Funktionen, Loops, Toast, Modal
function updateHud(){ const c=Math.max(liveCps(), idlePerSec()); document.getElementById("cps").textContent = fmt(c)+"/s"; document.getElementById("money").textContent = fmt(S.coins); }
function renderArena(){ document.getElementById("clicker").textContent = equippedPet().emoji; }
function renderList(){ const list=document.getElementById("list"); const rc=rebirthCost(), rReady=S.totalEarned>=rc;
  let html = `<div class="up-card rebirth"><div class="iconbox">🔄<div class="badge">${S.rebirths}</div></div>
      <div class="mid"><div class="ttl">Wiedergeburt</div></div>
      <button class="price ${rReady?"yes":""}" data-rebirth>$${fmt(rc)}</button></div>`;
  const ups=Object.values(UPGRADES).sort((a,b)=>a.order-b.order);
  for(const u of ups){
    if(isUnlocked(u)){
      const {count,cost}=buyInfo(u.id); const afford=S.coins>=cost && count>0;
      html += `<div class="up-card"><div class="iconbox">${u.emoji}</div>
        <div class="mid"><div class="ttl">${u.name}: ${levelOf(u)}</div><div class="sub">+$${fmt(perLevelValue(u))} ${u.unit}</div></div>
        <button class="price ${afford?"yes":""}" data-buy="${u.id}">${count>1?`<div style="font-size:12px;opacity:.85">x${count}</div>`:""}$${fmt(cost)}</button></div>`;
    } else {
      html += `<div class="up-card locked"><div class="iconbox">${u.emoji}</div>
        <div class="mid"><div class="ttl">${u.name}</div><div class="sub" style="color:#3a5572">🔒 ab Wiedergeburt ${u.reb}</div></div>
        <div class="price" style="background:linear-gradient(180deg,#9aa3b5,#6f7890);border-color:#4a5266;cursor:default">🔒</div></div>`;
    }
  }
  list.innerHTML=html;
  list.querySelector("[data-rebirth]").onclick=()=>openPanel("rebirth");
  list.querySelectorAll("[data-buy]").forEach(b=>b.onclick=()=>buyUpgrade(b.dataset.buy)); }
function petStatLine(p){ const a=[]; const ec=petEffectiveClick(p), ei=petEffectiveIdle(p); if(ec>0)a.push("👊+"+fmt(ec)); if(ei>0)a.push("⏰+"+fmt(ei)); if(p.mult>1)a.push("✖"+p.mult); return a.join("  "); }
function renderPets(){ const body=document.getElementById("panelBody");
  const owned=Object.keys(S.pets).filter(k=>S.pets[k]>0).length;
  const all=Object.values(PETS).sort((a,b)=>RARITIES[a.rarity].order-RARITIES[b.rarity].order||a.id-b.id);
  body.innerHTML=`<div class="empty-note" style="padding:4px 0 12px">Gesammelt: ${owned}/${all.length}</div><div class="grid">`+
    all.map(p=>{ const c=S.pets[p.id]||0,have=c>0,r=RARITIES[p.rarity],eq=S.equipped==p.id,ro=ROLES[p.role]||ROLES.allround;
      const lv=have?petLevel(p.id):1, xpPct=have?petXpPct(p.id):0, glow=have?petGlowClass(p.id):"", xpColor=have?xpBarColor(p.id):"";
      const multPct=have?Math.round((petMultiplier(p.id)-1)*100):0;
      return `<div class="pet-card ${have?"":"locked"} ${eq?"equipped":""} ${glow}" style="background:${r.color}">
        ${have?`<div class="plvl">Lv.${lv}</div><div class="pcount">x${c}</div>`:""}
        <div class="emoji">${have?p.emoji:"❔"}</div>
        <div class="pname">${have?p.name:"???"}</div>
        <div class="prare">${r.label}</div>
        ${have?`<div class="prole" style="color:${ro.color}">${ro.emoji} ${ro.label}</div>
          <div class="pstat">${petStatLine(p)}${multPct>0?` <span style="color:#ffe066">+${multPct}%</span>`:""}</div>
          <div class="xpbar-wrap"><div class="xpbar" style="width:${xpPct}%;background:${xpColor}"></div></div>`:""}
        ${have&&!eq?`<button class="eb" data-equip="${p.id}">Ausrüsten</button>`:""}
        ${eq?`<div class="eb" style="background:linear-gradient(180deg,#cfcfe0,#9a9ab8);color:#2a2a44">Aktiv ✓</div>`:""}</div>`; }).join("")+`</div>`;
  body.querySelectorAll("[data-equip]").forEach(b=>b.onclick=()=>equipPet(b.dataset.equip)); }
function renderEggs(){ const body=document.getElementById("panelBody");
  const maxed=S.gemLevel>=7;
  const nextCost=maxed?0:GEM_LEVELS[S.gemLevel+1].cost;
  const canUp=!maxed&&S.gems>=nextCost;
  const gemBar=`<div style="text-align:center;background:linear-gradient(180deg,rgba(96,208,255,0.25),rgba(32,144,224,0.15));border:3px solid rgba(96,208,255,0.5);border-radius:16px;padding:14px;margin-bottom:10px;">
    <div style="font-size:42px;filter:drop-shadow(0 2px 8px rgba(100,200,255,0.8))">💎</div>
    <div style="font-size:28px;font-weight:800;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,0.3)">${S.gems} Diamanten</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-top:2px">Chance: ${gemChance().toFixed(1)}% pro Klick</div>
    <button id="gemUpgradeBtn" style="margin-top:10px;width:100%;padding:12px;border-radius:13px;border:3px solid ${canUp?'#3a9a5a':maxed?'#4a6a8a':'#6e3d3d'};font-family:inherit;font-size:15px;font-weight:800;cursor:${canUp||maxed?'pointer':'not-allowed'};box-shadow:0 4px 0 rgba(0,0,0,0.25);
      background:linear-gradient(180deg,${canUp?'#7be39a,#4caf70':maxed?'#60a0d0,#3070a0':'#c08a8a,#a86a6a'});color:${canUp?'#1a4a2a':'#fff'}">
      ${maxed?'✨ Max. Level erreicht':`⬆️ Glück Lv.${S.gemLevel}→${S.gemLevel+1} · 💎${nextCost}`}
    </button>
  </div>`;
  body.innerHTML=gemBar+Object.entries(EGGS).map(([id,egg])=>{ const afford=S.gems>=egg.cost, tot=Object.values(egg.drops).reduce((a,b)=>a+b,0);
    const drops=Object.entries(egg.drops).map(([r,w])=>`${RARITIES[r].label} ${(w/tot*100).toFixed(w<1?1:0)}%`).join(" · ");
    return `<div class="egg-row"><div class="ico">${egg.emoji}</div><div class="mid"><div class="rt">${egg.name}</div><div class="drops">${drops}</div></div>
      <button class="eggbuy" data-egg="${id}" ${afford?"":"disabled"}>💎 ${egg.cost}</button></div>`; }).join("");
  body.querySelectorAll("[data-egg]").forEach(b=>b.onclick=()=>{ buyEgg(b.dataset.egg); renderEggs(); });
  const gu=body.querySelector("#gemUpgradeBtn"); if(gu&&!maxed) gu.onclick=upgradeGemLevel; }
function renderRebirth(){ const body=document.getElementById("panelBody"); const cost=rebirthCost(), ready=S.totalEarned>=cost;
  const pct=Math.min(100,S.totalEarned/cost*100);
  const nextUnlock=Object.values(UPGRADES).filter(u=>u.reb===S.rebirths+1).map(u=>u.emoji+" "+u.name);
  body.innerHTML=`<div class="rebirth-box"><div class="big">🔄</div><h3>Wiedergeburt #${S.rebirths+1}</h3>
    <p>Setzt <b>Münzen & Upgrades</b> zurück. Pets bleiben.</p>
    <p class="cur">Aktuell: x${rebirthMult()} → danach x${rebirthMult()+1}</p>
    ${nextUnlock.length?`<p style="color:#cfe;font-size:13px">🔓 Schaltet frei: ${nextUnlock.join(", ")}</p>`:""}
    <div style="background:rgba(0,0,0,0.25);border-radius:12px;height:24px;margin:16px 0;overflow:hidden;border:3px solid rgba(255,255,255,0.25)">
      <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#ff9ec0,#e85b9c)"></div></div>
    <p style="font-size:12px">${fmt(S.totalEarned)} / ${fmt(cost)}</p>
    <button class="eggbuy" id="doReb" style="margin-top:16px;width:100%;padding:14px;background:linear-gradient(180deg,#ffa6c0,#e85b9c);color:#5a0f28" ${ready?"":"disabled"}>${ready?"🔄 Wiedergeburt!":"🔒 Noch nicht bereit"}</button></div>`;
  const b=document.getElementById("doReb"); if(b)b.onclick=doRebirth; }
async function renderLeaderboard(){ const body=document.getElementById("panelBody"); body.innerHTML=`<div class="empty-note">Lädt…</div>`;
  let players={}; try{ players=await dbGet(TABLES.players)||{}; }catch(e){ body.innerHTML=`<div class="empty-note">⚠️ Nicht verfügbar</div>`; return; }
  const list=Object.entries(players).map(([id,p])=>({id,name:p.name||"???",reb:p.rebirths||0,life:p.lifetimeEarned||p.totalEarned||0}))
    .sort((a,b)=>b.reb-a.reb||b.life-a.life).slice(0,50);
  if(!list.length){ body.innerHTML=`<div class="empty-note">Noch keine Spieler</div>`; return; }
  const medal=i=>i===0?"🥇":i===1?"🥈":i===2?"🥉":"#"+(i+1);
  body.innerHTML=`<div class="empty-note" style="padding:2px 0 10px">Rang nach Wiedergeburten</div>`+list.map((p,i)=>`<div class="lb-row ${p.id===playerId?"me":""}"><div class="rank">${medal(i)}</div>
    <div class="lbname">${esc(p.name)}<div style="font-size:11px;opacity:.65;font-weight:600">💵 ${fmt(p.life)} gesamt</div></div>
    <div class="lbval">🔄 ${p.reb}</div></div>`).join(""); }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
const PANELS={ pets:{t:"🐾 Meine Pets",r:renderPets}, eggs:{t:"🥚 Eier",r:renderEggs}, rebirth:{t:"🔄 Wiedergeburt",r:renderRebirth}, lb:{t:"🏆 Rangliste",r:renderLeaderboard} };
function openPanel(k){ const p=PANELS[k]; if(!p)return; document.getElementById("panelTitle").textContent=p.t; document.getElementById("panelWrap").classList.add("open"); p.r(); }
function closePanel(){ document.getElementById("panelWrap").classList.remove("open"); }
function showHatch(pet){ const r=RARITIES[pet.rarity]; document.getElementById("hatchEmoji").textContent=pet.emoji;
  const n=document.getElementById("hatchName"); n.textContent=pet.name; n.style.color=r.color;
  document.getElementById("hatchRare").textContent=r.label.toUpperCase();
  const h=document.getElementById("hatch"); h.classList.add("open");
  const close=()=>{ h.classList.remove("open"); h.removeEventListener("click",close); }; setTimeout(()=>h.addEventListener("click",close),250); }
let toastT; function toast(m){ const t=document.getElementById("toast"); t.textContent=m; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2600); }
function showModal({ icon="❓", title="", body="", yes="OK", no="Abbrechen", onYes=null, onNo=null }={}){
  const w=document.getElementById("modalWrap");
  document.getElementById("modalIcon").textContent=icon;
  document.getElementById("modalTitle").textContent=title;
  document.getElementById("modalBody").textContent=body;
  document.getElementById("modalYes").textContent=yes;
  document.getElementById("modalNo").textContent=no;
  w.classList.add("open");
  const close=()=>w.classList.remove("open");
  document.getElementById("modalYes").onclick=()=>{ close(); if(onYes) onYes(); };
  document.getElementById("modalNo").onclick=()=>{ close(); if(onNo) onNo(); };
}
function startLoopsOnce(){ if(loopsStarted) return; loopsStarted=true;
  let lastTick=Date.now();
  setInterval(()=>{ const now=Date.now(),dt=(now-lastTick)/1000; lastTick=now; const inc=idlePerSec()*dt; if(inc>0){ S.coins+=inc; S.totalEarned+=inc; S.lifetimeEarned+=inc; trackEarn(inc); dirty=true; updateHud(); } },100);
  setInterval(()=>{ const i=idlePerSec(); if(i>0) spawnFloat("+$"+fmt(i),null,false); },1000);
  setInterval(()=>{ if(document.getElementById("list").children.length) renderList(); },600);
  setInterval(()=>{ if(dirty) save(); },8000);
  checkBoss(); setInterval(checkBoss,60000); }