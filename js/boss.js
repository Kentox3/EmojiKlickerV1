// boss.js — Boss-System, Slayer-XP, Skills, Passive, Krit-System

// ===== Slayer Level =====
function slayerLevel(){ const xp=S.slayerXp||0; return Math.max(1,Math.floor(Math.sqrt(xp/10))+1); }
function slayerXpForLevel(lv){ return Math.pow(lv-1,2)*10; }
function slayerXpNext(){ const lv=slayerLevel(); return slayerXpForLevel(lv+1); }
function slayerXpPct(){ const lv=slayerLevel(),cur=S.slayerXp-slayerXpForLevel(lv),need=slayerXpForLevel(lv+1)-slayerXpForLevel(lv); return Math.min(100,cur/need*100); }
function updateSlayerHud(){
  const lv=slayerLevel(),pct=slayerXpPct(),xpNext=slayerXpNext();
  document.getElementById("slayerLvSpan").textContent=lv;
  document.getElementById("slayerXpFill").style.width=pct+"%";
  document.getElementById("slayerXpTxt").textContent=`${S.slayerXp} / ${xpNext}`;
}

// ===== Pet Boss Stats =====
function petBossAtk(p){
  const lv=petLevel(p.id);
  const lvBonus=1+Math.floor(lv/10)*0.05; // +5% per 10 levels
  const awakened=lv>=50?1.5:1;
  const transcendent=lv>=100?2:1;
  return Math.floor(p.bossAtk*lvBonus*awakened*transcendent);
}
function petBossCrit(p){
  const lv=petLevel(p.id);
  const lvBonus=Math.floor(lv/10)*0.5; // +0.5% crit per 10 levels
  return Math.min(75, p.bossCrit+lvBonus+getCritChanceBonus());
}
function petAwakeStatus(id){
  const lv=petLevel(id);
  if(lv>=100) return {label:"🌈 TRANSZENDENT",color:"#ff80ff"};
  if(lv>=50)  return {label:"✨ ERWACHT",     color:"#ffd700"};
  if(lv>=25)  return {label:"⭐ AUFGESTIEGEN",color:"#a0d8ff"};
  return null;
}

// ===== Skill-Helfer =====
function getCritChanceBonus(){
  let b=0;
  for(const sk of SLAYER_SKILLS){ if(sk.effect==="critChance"&&(S.skills&&S.skills[sk.id])) b+=sk.val; }
  return b;
}
function getCritMult(){
  let m=2;
  for(const sk of SLAYER_SKILLS){ if(sk.effect==="critMult"&&(S.skills&&S.skills[sk.id])) m+=sk.val; }
  const p=equippedPet();
  if(p.passiveId==="critBoost") m=p.id===401?3.5:3;
  return m;
}
function getPassiveStrMult(){
  return getPassiveStrMultForPet(S.equipped);
}
function getPassiveStrMultForPet(petId){
  let m=1;
  for(const sk of SLAYER_SKILLS){ if(sk.effect==="passiveMult"&&(S.skills&&S.skills[sk.id])) m+=sk.val; }
  const lv=petLevel(petId);
  if(lv>=100) m*=3;
  else if(lv>=50) m*=2;
  else if(lv>=25) m*=1.25;
  return m;
}
function getXpMult(){
  let m=1;
  for(const sk of SLAYER_SKILLS){ if(sk.effect==="xpMult"&&(S.skills&&S.skills[sk.id])) m+=sk.val; }
  if(equippedPet().passiveId==="soulReap") m*=2;
  return m;
}
function getBossDmgMult(){
  let m=1;
  for(const sk of SLAYER_SKILLS){ if(sk.effect==="bossDmg"&&(S.skills&&S.skills[sk.id])) m+=sk.val; }
  if(S.skills&&S.skills["atk4"]&&bossData&&bossData.maxHp>0&&bossData.hp/bossData.maxHp<0.2) m+=1.0;
  return m;
}
function getBonusGems(){
  let b=0;
  for(const sk of SLAYER_SKILLS){ if(sk.effect==="bonusGems"&&(S.skills&&S.skills[sk.id])) b+=sk.val; }
  return b;
}
function getClickSkillMult(){
  let m=1;
  for(const sk of SLAYER_SKILLS){ if(sk.effect==="clickMult"&&(S.skills&&S.skills[sk.id])) m+=sk.val; }
  return m;
}

// ===== Passive System =====
let _bossState={clicks:0,stacks:0};
function resetBossState(){ _bossState={clicks:0,stacks:0}; }

function applyPassive(pet, baseDmg){
  if(!pet.passiveId) return {dmg:baseDmg,label:null};
  const str=getPassiveStrMult();
  let dmg=baseDmg, label=null;

  switch(pet.passiveId){
    case 'doubleHit':{
      const chance=(pet.id<=3?0.10:pet.id<500?0.20:0.25)*str;
      if(Math.random()<chance){ dmg*=2; label='💥 DOUBLE HIT!'; }
      break;
    }
    case 'ramping':{
      const maxStack=pet.id===102?35:25;
      _bossState.stacks=Math.min(maxStack,_bossState.stacks+1);
      dmg*=(1+_bossState.stacks*0.01*str);
      if(_bossState.stacks%5===0&&_bossState.stacks>0) label=`📈 Stack ${_bossState.stacks}`;
      break;
    }
    case 'rhythm':{
      const nth=pet.id===302?8:pet.id===402?6:pet.id===701?7:5;
      const mult=pet.id===402?4:pet.id===701?5:pet.id===302?3:3;
      if(_bossState.clicks%nth===0){ dmg*=(mult*str); label=`⚡ KOMBO ×${mult}!`; }
      break;
    }
    case 'rage':{
      if(bossData&&bossData.maxHp>0){
        const hpPct=bossData.hp/bossData.maxHp;
        const threshold=pet.id>=400?0.20:0.30;
        const bonus=pet.id>=400?1.5:0.75;
        if(hpPct<threshold){ dmg*=(1+bonus*str); label='😡 RAGE!'; }
      }
      break;
    }
    case 'fireBreath':{
      const nth=pet.id===502?8:pet.id===701?7:10;
      const mult=pet.id===701?5:pet.id===502?3.5:2.5;
      if(_bossState.clicks%nth===0){ dmg*=(mult*str); label=`🔥 ${pet.passiveName.toUpperCase()}!`; }
      break;
    }
    case 'overclock':{
      if(_bossState.clicks>0&&_bossState.clicks%50===0){ dmg*=(5*str); label='🤖 ÜBERTAKTUNG!'; }
      break;
    }
    case 'pack':{
      const players=Object.keys(bossData&&bossData.participants||{}).length;
      const others=Math.max(0,players-1);
      const perPlayer=pet.id>=500?0.12:0.08;
      const cap=pet.id>=500?0.60:0.40;
      dmg*=(1+Math.min(cap,others*perPlayer*str));
      break;
    }
    case 'majesty':{
      if(bossData&&bossData.maxHp>0){
        const hpPct=bossData.hp/bossData.maxHp;
        const bonus=pet.id>=500?0.60:0.40;
        if(hpPct>0.50){ dmg*=(1+bonus*str); }
      }
      break;
    }
    case 'critBoost':{
      // Handled in getCritMult() — no extra effect here
      break;
    }
    case 'blessing':{
      const xpBonus=pet.id>=700?1:0.3;
      S.slayerXp=(S.slayerXp||0)+xpBonus*str; dirty=true;
      if(pet.id>=700&&Math.random()<0.01*str){ S.gems++; updateGemBadge(); label='✨ STERNENSTAUB!'; }
      break;
    }
    case 'soulReap':{
      // Extra XP on kill — handled in claimBossReward via getXpMult()
      break;
    }
    case 'gravity':{
      if(bossData&&bossData.maxHp>0){
        const hpPct=bossData.hp/bossData.maxHp;
        if(hpPct>0.70){ dmg*=(2*str); label='🪐 GRAVITY!'; }
      }
      break;
    }
    case 'armorBreak':{
      if(Math.random()<0.20*str){ dmg*=1.5; label='🛡️ RÜSTUNGSBRUCH!'; }
      break;
    }
  }
  return {dmg,label};
}

// ===== Boss Core =====
let bossData=null, bossTimerInt=null;
function getBossHour(){ return Math.floor(Date.now()/3600000); }
function getBossId(hour){ return BOSSES[hour%BOSSES.length]; }
function isBossActive(){
  if(!bossData||bossData.hp<=0||!bossData.startedAt) return false;
  return (Date.now()-bossData.startedAt)<BOSS_DURATION;
}
async function checkBoss(){
  const hour=getBossHour();
  try{
    const d=await dbGet(TABLES.boss);
    if(d&&d.hour===hour){ bossData=d; showBossBadge(isBossActive()); }
    else{
      const bdef=getBossId(hour);
      bossData={hour,id:bdef.id,emoji:bdef.emoji,name:bdef.name,maxHp:bdef.hp,hp:bdef.hp,
        bossXp:bdef.xp,rewardMin:bdef.rewardMin,rewardMax:bdef.rewardMax,
        participants:{},startedAt:Date.now()};
      await dbUpdate(TABLES.boss,bossData); showBossBadge(true);
    }
  }catch(e){ console.error("Boss",e); }
}
function showBossBadge(show){
  const b=document.getElementById("bossBadge");
  if(show){b.textContent="!";b.classList.add("show");}else b.classList.remove("show");
}
async function openBoss(){
  await checkBoss();
  resetBossState();
  document.getElementById("bossOverlay").classList.add("open");
  renderBossOverlay(); startBossTimer();
  if(bossData&&(bossData.participants||{})[playerId]===undefined){
    S.bossParticipations=(S.bossParticipations||0)+1; dirty=true;
  }
}
function closeBoss(){
  document.getElementById("bossOverlay").classList.remove("open");
  if(bossTimerInt){clearInterval(bossTimerInt);bossTimerInt=null;}
}
function renderBossOverlay(){
  if(!bossData) return;
  const alive=isBossActive(), dead=bossData.hp<=0;
  const pct=Math.max(0,bossData.hp/bossData.maxHp*100);
  document.getElementById("bossEmoji").textContent=bossData.emoji;
  document.getElementById("bossName").textContent=bossData.name;
  document.getElementById("bossHpBar").style.width=pct+"%";
  document.getElementById("bossHpBar").style.background=pct>50?"linear-gradient(90deg,#ff2060,#ff80c0)":pct>20?"linear-gradient(90deg,#ff8000,#ffb060)":"linear-gradient(90deg,#ff0000,#ff4040)";
  document.getElementById("bossHpText").textContent=`${fmt(Math.max(0,bossData.hp))} / ${fmt(bossData.maxHp)} HP`;
  const parts=Object.keys(bossData.participants||{}).length;
  document.getElementById("bossPlayerCount").textContent=`👥 ${parts} Kämpfer`;
  document.getElementById("bossClickBtn").style.display=alive?"":"none";
  document.getElementById("bossDeadPanel").classList.toggle("show",dead||!alive);
  if(dead||!alive) renderDeadPanel();
  updateSlayerHud();
  // Show equipped pet info
  const ep=equippedPet();
  document.getElementById("bossClickBtn").textContent=`${ep.emoji} Angreifen! (${fmt(petBossAtk(ep))} ATK · ${petBossCrit(ep).toFixed(1)}% Krit)`;
}
function renderDeadPanel(){
  const parts=bossData.participants||{};
  const total=Object.values(parts).reduce((a,b)=>a+b,0)||1;
  const sorted=Object.entries(parts).sort((a,b)=>b[1]-a[1]);
  const medal=i=>i===0?"🥇":i===1?"🥈":i===2?"🥉":"#"+(i+1);
  const isDead=bossData.hp<=0;
  const rewKey=`bossRew_${bossData.hour}`;
  const claimed=localStorage.getItem(rewKey);
  const myDmg=parts[playerId]||0;
  const contrib=myDmg>0?Math.min(100,myDmg/total*100):0;
  const [rMin,rMax]=[bossData.rewardMin||10,bossData.rewardMax||30];
  const previewDias=isDead?Math.round(rMin+(rMax-rMin)*(contrib/100))+getBonusGems():0;
  const previewXp=isDead?Math.round((bossData.bossXp||50)*(contrib/100+0.1)*getXpMult()):0;

  document.getElementById("bossDmgList").innerHTML=`
    <div style="font-size:13px;color:rgba(255,200,255,0.7);text-align:center;margin-bottom:8px">
      ${isDead?"☠️ Boss besiegt — Schadensrangliste":"⌛ Zeit abgelaufen — Schadensrangliste"}
    </div>`+
    sorted.slice(0,10).map(([pid,dmg],i)=>{
      const pct=Math.min(100,Math.round(dmg/total*100));
      const isMe=pid===playerId;
      return `<div class="boss-dmg-row ${isMe?"me":""}">
        <div class="boss-dmg-rank">${medal(i)}</div>
        <div class="boss-dmg-name">${isMe?"⚔️ Du":("Spieler "+(i+1))}
          <div class="boss-dmg-bar-wrap"><div class="boss-dmg-bar" style="width:${pct}%"></div></div>
        </div>
        <div class="boss-dmg-pct">${pct}%</div>
      </div>`;
    }).join("");

  const claimBtn=document.getElementById("bossClaimBtn");
  if(claimed){
    claimBtn.style.display=""; claimBtn.disabled=true;
    claimBtn.textContent="✅ Belohnung bereits abgeholt";
    claimBtn.style.background="linear-gradient(180deg,#6a8a6a,#4a6a4a)";
    claimBtn.style.color="rgba(255,255,255,0.6)";
  } else if(!isDead){
    claimBtn.style.display=myDmg>0?"":"none";
    if(myDmg>0){
      claimBtn.disabled=true;
      claimBtn.textContent="💀 Boss nicht besiegt — keine Belohnung";
      claimBtn.style.background="linear-gradient(180deg,#6a4a4a,#4a2a2a)";
      claimBtn.style.color="rgba(255,200,200,0.7)";
    }
  } else if(myDmg<=0){
    claimBtn.style.display=""; claimBtn.disabled=true;
    claimBtn.textContent="😴 Nicht mitgekämpft";
    claimBtn.style.background="linear-gradient(180deg,#5a5a7a,#3a3a5a)";
    claimBtn.style.color="rgba(255,255,255,0.5)";
  } else {
    claimBtn.style.display=""; claimBtn.disabled=false;
    claimBtn.textContent=`🎁 Belohnung abholen  +${previewDias}💎  +${previewXp} XP`;
    claimBtn.style.background="linear-gradient(180deg,#7be39a,#4caf70)";
    claimBtn.style.color="#1a4a2a";
    claimBtn.onclick=claimBossReward;
  }
}
function claimBossReward(){
  const rewKey=`bossRew_${bossData.hour}`;
  if(localStorage.getItem(rewKey)) return;
  const parts=bossData.participants||{};
  const total=Object.values(parts).reduce((a,b)=>a+b,0)||1;
  const myDmg=parts[playerId]||0;
  const contrib=Math.min(100,myDmg/total*100);
  const [rMin,rMax]=[bossData.rewardMin||10,bossData.rewardMax||30];
  const base=rMin+Math.floor(Math.random()*(rMax-rMin+1));
  const dias=base+getBonusGems();
  const xpGain=Math.round((bossData.bossXp||50)*(contrib/100+0.1)*getXpMult());
  S.gems+=dias; S.slayerXp=(S.slayerXp||0)+xpGain;
  S.bossKills=(S.bossKills||0)+1; dirty=true;
  localStorage.setItem(rewKey,"1");
  updateGemBadge(); updateSlayerHud();
  document.getElementById("bossClaimBtn").style.display="none";
  toast(`🎁 +${dias}💎  +${xpGain} Slayer XP!`);
  renderDeadPanel();
}
function startBossTimer(){
  if(bossTimerInt)clearInterval(bossTimerInt);
  bossTimerInt=setInterval(async()=>{
    if(!bossData){clearInterval(bossTimerInt);return;}
    const elapsed=Date.now()-bossData.startedAt;
    const rem=Math.max(0,BOSS_DURATION-elapsed);
    const m=Math.floor(rem/60000),s=Math.floor((rem%60000)/1000);
    if(bossData.hp<=0){
      document.getElementById("bossTimerBox").textContent="☠️ Boss besiegt!";
      const nextHour=Math.ceil(Date.now()/3600000)*3600000;
      const remNext=Math.max(0,nextHour-Date.now());
      const mN=Math.floor(remNext/60000),sN=Math.floor((remNext%60000)/1000);
      document.getElementById("bossPlayerCount").textContent=`⏳ Nächster Boss in ${String(mN).padStart(2,"0")}:${String(sN).padStart(2,"0")}`;
    } else if(rem<=0){
      document.getElementById("bossTimerBox").textContent="⌛ Zeit abgelaufen";
      document.getElementById("bossClickBtn").disabled=true;
      document.getElementById("bossDeadPanel").classList.add("show");
      renderDeadPanel();
    } else {
      document.getElementById("bossTimerBox").textContent=`⏰ ${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    }
    try{const d=await dbGet(TABLES.boss);if(d&&d.hour===getBossHour()){bossData=d;renderBossOverlay();}}catch(e){}
    if(elapsed>BOSS_DURATION+5000){clearInterval(bossTimerInt);bossTimerInt=null;}
  },3000);
}

async function doBossClick(){
  if(!bossData||bossData.hp<=0||!playerId) return;
  if((Date.now()-bossData.startedAt)>=BOSS_DURATION){ toast("⌛ Zeit abgelaufen!"); return; }

  _bossState.clicks++;
  const pet=equippedPet();
  let baseDmg=Math.max(1,petBossAtk(pet))*getBossDmgMult();

  // Krit-Check
  const critPct=petBossCrit(pet);
  const isCrit=Math.random()<critPct/100;
  let critLabel=null;
  if(isCrit){
    const mult=getCritMult();
    baseDmg*=mult;
    critLabel=`💫 KRIT! ×${mult}`;
    if(S.skills&&S.skills["crit3"]){ S.gems++; dirty=true; updateGemBadge(); }
  }

  // Passive anwenden
  const {dmg:finalDmg,label:passiveLabel}=applyPassive(pet,baseDmg);
  const dmg=Math.floor(finalDmg);

  // Stats tracken
  S.bossDmgDealt=(S.bossDmgDealt||0)+dmg; dirty=true;

  // Hit-Animation
  const em=document.getElementById("bossEmoji");
  em.classList.remove("hit"); void em.offsetWidth; em.classList.add("hit");
  setTimeout(()=>em.classList.remove("hit"),150);

  // Schaden-Float
  const arena=document.getElementById("bossArena");
  const f=document.createElement("div");
  f.style.cssText=`position:absolute;top:${35+Math.random()*25}%;left:${30+Math.random()*40}%;font-size:clamp(14px,4vw,${isCrit?22:17}px);font-weight:800;color:${isCrit?"#ffd700":"#ff80ff"};pointer-events:none;-webkit-text-stroke:2px rgba(80,0,80,0.5);paint-order:stroke fill;animation:floatUp 0.8s ease-out forwards;z-index:10`;
  f.textContent=(isCrit?"★ ":"")+"-"+fmt(dmg);
  arena.appendChild(f); setTimeout(()=>f.remove(),800);

  // Passive/Krit Label
  const labelText=passiveLabel||critLabel;
  if(labelText){
    const lf=document.createElement("div");
    lf.style.cssText=`position:absolute;top:${18+Math.random()*12}%;left:50%;transform:translateX(-50%);font-size:clamp(11px,3vw,15px);font-weight:800;color:#ffe066;pointer-events:none;-webkit-text-stroke:1px rgba(100,60,0,0.5);paint-order:stroke fill;animation:floatUp 1s ease-out forwards;z-index:11;white-space:nowrap`;
    lf.textContent=labelText;
    arena.appendChild(lf); setTimeout(()=>lf.remove(),1000);
  }

  // Firebase (debounced)
  window._bossPendingDmg=(window._bossPendingDmg||0)+dmg;
  if(!window._bossDebounce){
    window._bossDebounce=setTimeout(async()=>{
      window._bossDebounce=null;
      const pending=window._bossPendingDmg||0; window._bossPendingDmg=0;
      try{
        const cur=await dbGet(TABLES.boss);
        if(!cur||cur.hour!==getBossHour()) return;
        const newHp=Math.max(0,cur.hp-pending),parts=cur.participants||{};
        parts[playerId]=(parts[playerId]||0)+pending;
        await dbUpdate(TABLES.boss,{hp:newHp,participants:parts});
        bossData={...cur,hp:newHp,participants:parts};
        renderBossOverlay();
        if(newHp<=0){
          showBossBadge(false);
          document.getElementById("bossEmoji").classList.add("dead");
        }
      }catch(e){}
    },300);
  }
}

// ===== Skill Panel =====
function renderSkillPanel(){
  const lv=slayerLevel();
  const trees={};
  SLAYER_SKILLS.forEach(sk=>{ if(!trees[sk.tree])trees[sk.tree]=[]; trees[sk.tree].push(sk); });
  const treeEmojis={Angriff:"⚔️",Kritisch:"✨",Meisterschaft:"🌟"};
  const treeColors={Angriff:"rgba(255,80,80,0.15)",Kritisch:"rgba(255,220,0,0.12)",Meisterschaft:"rgba(100,180,255,0.12)"};

  document.getElementById("skillList").innerHTML=Object.entries(trees).map(([treeName,skills])=>`
    <div style="margin-bottom:14px">
      <div style="font-size:15px;font-weight:800;color:#df80ff;margin-bottom:8px;padding:8px 10px;background:${treeColors[treeName]||"rgba(180,0,255,0.1)"};border-radius:10px;border-left:4px solid rgba(180,0,255,0.5)">
        ${treeEmojis[treeName]||"◆"} ${treeName}
      </div>
      ${skills.map(sk=>{
        const owned=S.skills&&S.skills[sk.id];
        const reqMet=lv>=sk.req&&(!sk.requires||(S.skills&&S.skills[sk.requires]));
        const canAfford=(S.slayerXp||0)>=(sk.xpReq||0);
        const unlockable=reqMet&&canAfford&&!owned;
        const reqSkillName=sk.requires?SLAYER_SKILLS.find(x=>x.id===sk.requires)?.name:"";
        return `<div class="skill-node ${owned?"unlocked":reqMet?"":"locked"}">
          <div class="skill-node-head">
            <div class="skill-icon">${sk.emoji}</div>
            <div class="skill-info">
              <div class="skill-name">${sk.name} ${owned?"✓":""}</div>
              <div class="skill-desc">${sk.desc}</div>
              <div class="skill-req">Slayer Lv.${sk.req}${reqSkillName?` · ${reqSkillName}`:""}${!owned?` · ${sk.xpReq} XP`:""}</div>
            </div>
            ${!owned
              ?`<button class="skill-unlock-btn" data-skill="${sk.id}" ${unlockable?"":"disabled"}>${unlockable?"Freischalten":"🔒"}</button>`
              :"<div style='color:#7be39a;font-size:22px'>✓</div>"}
          </div>
        </div>`;
      }).join("")}
    </div>`).join("");

  document.querySelectorAll("[data-skill]").forEach(b=>b.onclick=()=>{
    const sk=SLAYER_SKILLS.find(x=>x.id===b.dataset.skill);
    if(!sk||(S.skills&&S.skills[sk.id])) return;
    if(!S.skills) S.skills={};
    S.skills[sk.id]=true; dirty=true;
    toast(`🌟 ${sk.name} freigeschaltet!`);
    renderSkillPanel();
  });
}