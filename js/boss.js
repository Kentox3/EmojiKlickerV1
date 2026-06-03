// boss.js — Boss-Event, Slayer-System, Skills
function slayerLevel(){ const xp=S.slayerXp||0; return Math.max(1,Math.floor(Math.sqrt(xp/10))+1); }
function slayerXpForLevel(lv){ return Math.pow(lv-1,2)*10; }
function slayerXpNext(){ const lv=slayerLevel(); return slayerXpForLevel(lv+1); }
function slayerXpPct(){ const lv=slayerLevel(),cur=S.slayerXp-slayerXpForLevel(lv),need=slayerXpForLevel(lv+1)-slayerXpForLevel(lv); return Math.min(100,cur/need*100); }
function getBossDmgMult(){ let m=1; for(const sk of SLAYER_SKILLS){ if(sk.effect==="bossDmg"&&(S.skills&&S.skills[sk.id])) m+=sk.val; } return m; }
function getBonusGems(){ let b=0; for(const sk of SLAYER_SKILLS){ if(sk.effect==="bonusGems"&&(S.skills&&S.skills[sk.id])) b+=sk.val; } return b; }
function getClickSkillMult(){ let m=1; for(const sk of SLAYER_SKILLS){ if(sk.effect==="clickMult"&&(S.skills&&S.skills[sk.id])) m+=sk.val; } return m; }
function updateSlayerHud(){
  const lv=slayerLevel(),pct=slayerXpPct(),xpNext=slayerXpNext();
  document.getElementById("slayerLvSpan").textContent=lv;
  document.getElementById("slayerXpFill").style.width=pct+"%";
  document.getElementById("slayerXpTxt").textContent=`${S.slayerXp} / ${xpNext}`;
}
let bossData=null, bossTimerInt=null;
function getBossHour(){ return Math.floor(Date.now()/3600000); }
function getBossId(hour){ return BOSSES[hour%BOSSES.length]; }
function isBossActive(){
  if(!bossData) return false;
  if(bossData.hp<=0) return false;
  if(!bossData.startedAt) return false;
  return (Date.now()-bossData.startedAt) < BOSS_DURATION;
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
  document.getElementById("bossOverlay").classList.add("open");
  renderBossOverlay(); startBossTimer();
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
  document.getElementById("bossDeadPanel").classList.toggle("show", dead||!alive);
  if(dead||!alive) renderDeadPanel();
  updateSlayerHud();
}
function renderDeadPanel(){
  const parts=bossData.participants||{};
  const total=Object.values(parts).reduce((a,b)=>a+b,0)||1;
  const sorted=Object.entries(parts).sort((a,b)=>b[1]-a[1]);
  const medal=i=>i===0?"🥇":i===1?"🥈":i===2?"🥉":"#"+(i+1);
  document.getElementById("bossDmgList").innerHTML=sorted.slice(0,10).map(([pid,dmg],i)=>{
    const pct=Math.min(100,Math.round(dmg/total*100));
    const isMe=pid===playerId;
    return `<div class="boss-dmg-row ${isMe?"me":""}">
      <div class="boss-dmg-rank">${medal(i)}</div>
      <div class="boss-dmg-name">${isMe?"⚔️ Du":("Spieler "+(i+1))}<div class="boss-dmg-bar-wrap"><div class="boss-dmg-bar" style="width:${pct}%"></div></div></div>
      <div class="boss-dmg-pct">${pct}%</div>
    </div>`;
  }).join("");
  const rewKey=`bossRew_${bossData.hour}`;
  const claimed=localStorage.getItem(rewKey);
  const myDmg=parts[playerId]||0;
  const claimBtn=document.getElementById("bossClaimBtn");
  if(!claimed&&myDmg>0&&bossData.hp<=0){
    claimBtn.style.display=""; claimBtn.onclick=claimBossReward;
  } else { claimBtn.style.display="none"; }
}
function claimBossReward(){
  const rewKey=`bossRew_${bossData.hour}`;
  if(localStorage.getItem(rewKey)) return;
  const parts=bossData.participants||{};
  const total=Object.values(parts).reduce((a,b)=>a+b,0)||1;
  const myDmg=parts[playerId]||0;
  const contrib=Math.min(100,myDmg/total*100);
  const [rMin,rMax]=[bossData.rewardMin||10, bossData.rewardMax||30];
  const base=rMin+Math.floor(Math.random()*(rMax-rMin+1));
  const bonus=getBonusGems();
  const dias=base+bonus;
  const xpGain=Math.round((bossData.bossXp||50)*(contrib/100+0.1));
  S.gems+=dias; S.slayerXp=(S.slayerXp||0)+xpGain; dirty=true;
  localStorage.setItem(rewKey,"1");
  updateGemBadge(); updateSlayerHud();
  document.getElementById("bossClaimBtn").style.display="none";
  toast(`🎁 +${dias}💎 +${xpGain} Slayer XP!`);
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
      document.getElementById("bossTimerBox").textContent="☠️ Besiegt!";
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
  const baseDmg=Math.max(1,Math.floor(clickValue()));
  const dmg=Math.floor(baseDmg*getBossDmgMult());
  const em=document.getElementById("bossEmoji");
  em.classList.remove("hit");void em.offsetWidth;em.classList.add("hit");
  setTimeout(()=>em.classList.remove("hit"),150);
  const arena=document.getElementById("bossArena");
  const f=document.createElement("div");
  f.style.cssText=`position:absolute;top:${40+Math.random()*30}%;left:${25+Math.random()*50}%;font-size:clamp(14px,4vw,20px);font-weight:800;color:#ff80ff;pointer-events:none;-webkit-text-stroke:2px rgba(80,0,80,0.5);paint-order:stroke fill;animation:floatUp 0.8s ease-out forwards;z-index:10`;
  f.textContent="-"+fmt(dmg); arena.appendChild(f); setTimeout(()=>f.remove(),800);
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
        if(newHp<=0){ showBossBadge(false); document.getElementById("bossEmoji").classList.add("dead"); }
      }catch(e){}
    },300);
  }
}
function renderSkillPanel(){
  const lv=slayerLevel();
  document.getElementById("skillList").innerHTML=SLAYER_SKILLS.map(sk=>{
    const owned=S.skills&&S.skills[sk.id];
    const reqMet=lv>=sk.req&&(!sk.requires||(S.skills&&S.skills[sk.requires]));
    const canAfford=S.slayerXp>=(sk.xpReq||0);
    const unlockable=reqMet&&canAfford&&!owned;
    return `<div class="skill-node ${owned?"unlocked":reqMet?"":"locked"}">
      <div class="skill-node-head">
        <div class="skill-icon">${sk.emoji}</div>
        <div class="skill-info">
          <div class="skill-name">${sk.name} ${owned?"✓":""}</div>
          <div class="skill-desc">${sk.desc}</div>
          <div class="skill-req">⚔️ Slayer Lv.${sk.req}${sk.requires?` · Benötigt: ${SLAYER_SKILLS.find(x=>x.id===sk.requires)?.name}`:""}${!owned?` · ${sk.xpReq} XP`:""}</div>
        </div>
        ${!owned?`<button class="skill-unlock-btn" data-skill="${sk.id}" ${unlockable?"":"disabled"}>${unlockable?"Freischalten":"🔒"}</button>`:"<div style='color:#7be39a;font-size:20px'>✓</div>"}
      </div>
    </div>`;
  }).join("");
  document.querySelectorAll("[data-skill]").forEach(b=>b.onclick=()=>{
    const sk=SLAYER_SKILLS.find(x=>x.id===b.dataset.skill);
    if(!sk||S.skills?.[sk.id]) return;
    if(!S.skills) S.skills={};
    S.skills[sk.id]=true; dirty=true;
    toast(`🌟 Skill freigeschaltet: ${sk.name}!`);
    renderSkillPanel();
  });
}