// game.js — Speichern, Klicken, Kaufen, Wiedergeburt
async function save(force){ if(!playerId) return; if(!loaded&&!force) return; S.lastSeen=Date.now();
  try{ await dbUpdate(playerPath(playerId),{ name:S.name,coins:S.coins,totalEarned:S.totalEarned,lifetimeEarned:S.lifetimeEarned,totalClicks:S.totalClicks,
    rebirths:S.rebirths,upgrades:S.upgrades,equipped:S.equipped,pets:S.pets,gems:S.gems,gemLevel:S.gemLevel,petXp:S.petXp,slayerXp:S.slayerXp,skills:S.skills,bossKills:S.bossKills,bossDmgDealt:S.bossDmgDealt,bossParticipations:S.bossParticipations,createdAt:S.createdAt,lastSeen:S.lastSeen });
    dirty=false; }catch(e){ console.error(e); } }
function doClick(ev){ const v=clickValue(); S.coins+=v; S.totalEarned+=v; S.lifetimeEarned+=v; S.totalClicks++; trackEarn(v); dirty=true;
  const el=document.getElementById("clicker"); el.classList.remove("squash"); void el.offsetWidth; el.classList.add("squash");
  spawnFloat("+$"+fmt(v), ev, true); updateHud();
  addPetXp(S.equipped, 1); dirty=true;
  if(Math.random()<0.02+(S.gemLevel-1)*0.005){ S.gems++; dirty=true; spawnGem(ev); updateGemBadge(); } }
function spawnFloat(txt, ev, isClick){ const f=document.createElement("div"); f.className="float"+(isClick?" click":""); f.textContent=txt;
  const arena=document.getElementById("arena"), r=arena.getBoundingClientRect();
  const x= ev? ev.clientX-r.left : r.width/2 + (Math.random()*80-40); const y= ev? ev.clientY-r.top : r.height/2 - 40;
  f.style.left=x+"px"; f.style.top=y+"px"; arena.appendChild(f); setTimeout(()=>f.remove(),900); }
function buyUpgrade(uId){ const u=UPGRADES[uId]; if(!isUnlocked(u)) return;
  const {count,cost}=buyInfo(uId);
  if(count<=0||S.coins<cost){ toast("❌ Nicht genug Münzen"); return; }
  S.coins-=cost; S.upgrades[uId]=(S.upgrades[uId]||0)+count; dirty=true; updateHud(); renderList(); }
function buyEgg(eggId){ const egg=EGGS[eggId]; if(S.gems<egg.cost){ toast("❌ Nicht genug 💎 Diamanten"); return; }
  S.gems-=egg.cost; dirty=true; updateGemBadge();
  const total=Object.values(egg.drops).reduce((a,b)=>a+b,0); let roll=Math.random()*total, rar="Common";
  for(const [r,w] of Object.entries(egg.drops)){ roll-=w; if(roll<=0){ rar=r; break; } }
  const pool=Object.values(PETS).filter(p=>p.rarity===rar); const pet=pool[Math.floor(Math.random()*pool.length)];
  S.pets[pet.id]=(S.pets[pet.id]||0)+1;
  if(RARITIES[pet.rarity].order>RARITIES[equippedPet().rarity].order) S.equipped=pet.id;
  updateHud(); renderArena(); showHatch(pet); }
function equipPet(id){ if(!S.pets[id])return; S.equipped=Number(id); dirty=true; renderArena(); renderPets(); }
function doRebirth(){ const cost=rebirthCost(); if(S.coins<cost){ toast(`❌ Brauchst ${fmt(cost)} Münzen`); return; }
  showModal({ icon:"🔄", title:`Wiedergeburt #${S.rebirths+1}`, body:`Münzen & Upgrades werden zurückgesetzt.\nPets bleiben erhalten.\nMultiplikator danach: x${S.rebirths+2}\n\n✨ Neue Upgrade-Karten werden freigeschaltet!`, yes:"Wiedergeburt!", no:"Abbrechen", onYes:()=>{
  S.rebirths++; S.coins=0; S.upgrades={}; S.totalEarned=0; dirty=true;
  toast(`🔄 Wiedergeburt! Jetzt x${rebirthMult()} + neue Karten`); closePanel(); renderAll(); } }); }
function renderAll(){ updateHud(); renderArena(); renderList(); }