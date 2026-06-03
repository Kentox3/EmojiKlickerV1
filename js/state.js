// state.js — Spielzustand, Berechnungsfunktionen
function freshState(){ return { coins:0, totalEarned:0, lifetimeEarned:0, totalClicks:0, rebirths:0, upgrades:{}, equipped:1, pets:{1:1}, gems:0, gemLevel:1, petXp:{}, slayerXp:0, skills:{}, createdAt:Date.now(), lastSeen:Date.now(), name:"" }; }
let S = freshState();
let playerId = null, currentUsername = "";
let dirty=false, loaded=false, selMult="1", loopsStarted=false, authMode="login";
const rebirthMult=()=>1+S.rebirths;
const equippedPet=()=>PETS[S.equipped]||PETS[1];
function sumType(type){ let s=0; for(const u of Object.values(UPGRADES)){ if(u.type===type) s+=((S.upgrades&&S.upgrades[u.id])||0)*u.per; } return s; }
function clickValue(){ const p=equippedPet(); return (BASE_CLICK + sumType("click") + petEffectiveClick(p)) * p.mult * rebirthMult() * getClickSkillMult(); }
function idlePerSec(){ const p=equippedPet(); return (sumType("idle") + petEffectiveIdle(p)) * p.mult * rebirthMult(); }
const levelOf=(u)=> (S.upgrades&&S.upgrades[u.id])||0;
const costAt=(u,lvl)=> Math.floor(u.base*Math.pow(u.mult,lvl));
const rebirthCost=()=> Math.floor(REBIRTH_BASE*Math.pow(REBIRTH_SCALE,S.rebirths));
const perLevelValue=(u)=> u.per*equippedPet().mult*rebirthMult();
const isUnlocked=(u)=> S.rebirths >= (u.reb||0);
function buyInfo(uId){ const u=UPGRADES[uId], lvl=levelOf(u);
  if(selMult==="Max"){ let count=0,cost=0,c=costAt(u,lvl);
    while(S.coins>=cost+c && count<1000000){ cost+=c; count++; c=costAt(u,lvl+count); }
    if(count===0) return {count:0,cost:costAt(u,lvl)}; return {count,cost}; }
  const n=parseInt(selMult); let cost=0; for(let i=0;i<n;i++) cost+=costAt(u,lvl+i); return {count:n,cost}; }
function migrateState(s){
  if(!s.upgrades||typeof s.upgrades!=="object") s.upgrades={};
  if(typeof s.clickLevel==="number" && s.clickLevel>0) s.upgrades.click1=(s.upgrades.click1||0)+s.clickLevel;
  if(typeof s.idleLevel==="number" && s.idleLevel>0) s.upgrades.idle1=(s.upgrades.idle1||0)+s.idleLevel;
  delete s.clickLevel; delete s.idleLevel;
  if(typeof s.lifetimeEarned!=="number") s.lifetimeEarned=Math.max(s.totalEarned||0,0);
  if(typeof s.gems!=="number") s.gems=0;
  if(typeof s.gemLevel!=="number") s.gemLevel=1;
  if(!s.petXp||typeof s.petXp!=="object") s.petXp={};
  if(typeof s.slayerXp!=="number") s.slayerXp=0;
  if(!s.skills||typeof s.skills!=="object") s.skills={};
  return s;
}