// pets.js — Pet-Level-System, XP, Gem-System, CPS-Tracking
const _earn=[];
function trackEarn(v){ const now=Date.now(); _earn.push({t:now,v}); }
function liveCps(){
  const now=Date.now(), cutoff=now-1000;
  while(_earn.length && _earn[0].t < cutoff) _earn.shift();
  return _earn.reduce((s,e)=>s+e.v, 0);
}
const GEM_LEVELS=[null,{cost:0},{cost:10},{cost:25},{cost:60},{cost:150},{cost:350},{cost:800}];
function gemChance(){ return (0.02+(S.gemLevel-1)*0.005)*100; }
function upgradeGemLevel(){
  if(S.gemLevel>=7){ toast("💎 Bereits max. Level!"); return; }
  const cost=GEM_LEVELS[S.gemLevel+1].cost;
  if(S.gems<cost){ toast(`❌ Nicht genug 💎 (${cost} benötigt)`); return; }
  S.gems-=cost; S.gemLevel++; dirty=true; updateGemBadge(); renderEggs();
  toast(`💎 Dia-Glück auf Level ${S.gemLevel}! Jetzt ${gemChance()}%`); }
function petLevel(id){ const xp=(S.petXp&&S.petXp[id])||0; return Math.min(100,Math.floor(xp/100)+1); }
function petXpCurrent(id){ const xp=(S.petXp&&S.petXp[id])||0; return xp>=9900?100:xp%100; }
function petXpPct(id){ return petLevel(id)>=100?100:petXpCurrent(id); }
function petMultiplier(id){ return 1+(petLevel(id)-1)*0.01; }
function petEffectiveClick(p){ return Math.floor(p.click*petMultiplier(p.id)); }
function petEffectiveIdle(p){ return Math.floor(p.idle*petMultiplier(p.id)); }
function petGlowClass(id){ const lv=petLevel(id); if(lv>=100)return"lv100"; if(lv>=75)return"lv75"; if(lv>=50)return"lv50"; if(lv>=25)return"lv25"; if(lv>=10)return"lv10"; return""; }
function xpBarColor(id){ const lv=petLevel(id); if(lv>=100)return"linear-gradient(90deg,#ffd700,#fff176)"; if(lv>=75)return"linear-gradient(90deg,#60b0ff,#a0d8ff)"; if(lv>=50)return"linear-gradient(90deg,#ff50c8,#ff9eec)"; if(lv>=25)return"linear-gradient(90deg,#ff8c20,#ffcc60)"; if(lv>=10)return"linear-gradient(90deg,#ffe040,#fff9c4)"; return"linear-gradient(90deg,#7be39a,#b8f5cc)"; }
function addPetXp(id, amount){
  if(!S.petXp) S.petXp={};
  const oldLv=petLevel(id);
  S.petXp[id]=(S.petXp[id]||0)+amount;
  if(S.petXp[id]>9900) S.petXp[id]=9900;
  const newLv=petLevel(id);
  if(newLv>oldLv) spawnXpFloat(`🎉 Lv.${newLv}!`);
}
function spawnXpFloat(txt){
  const cl=document.getElementById("clicker").getBoundingClientRect();
  const f=document.createElement("div"); f.className="xp-float"; f.textContent=txt;
  f.style.fontSize="20px";
  f.style.left=(cl.left+cl.width/2-30)+"px"; f.style.top=(cl.top)+"px";
  document.body.appendChild(f); setTimeout(()=>f.remove(),800);
}
function updateGemBadge(){ const b=document.getElementById("gemBadge"); if(S.gems>0){ b.textContent=S.gems>99?"99+":S.gems; b.classList.add("show"); } else b.classList.remove("show"); }
function spawnGem(ev){
  const btn=document.getElementById("eggsBtn");
  const bR=btn.getBoundingClientRect();
  const destX=bR.left+bR.width/2, destY=bR.top+bR.height/2;
  const startX=ev?ev.clientX:window.innerWidth/2, startY=ev?ev.clientY:window.innerHeight/2;
  const gem=document.createElement("div"); gem.className="gem-fly"; gem.textContent="💎";
  gem.style.cssText=`left:${startX-14}px;top:${startY-14}px;`;
  document.body.appendChild(gem);
  gem.style.animation="gemPop 0.3s ease-out forwards";
  setTimeout(()=>{
    gem.style.transition="left 0.55s cubic-bezier(0.4,0,0.2,1),top 0.55s cubic-bezier(0.4,0,0.2,1),opacity 0.2s 0.45s,transform 0.55s";
    gem.style.left=(destX-14)+"px"; gem.style.top=(destY-14)+"px";
    gem.style.transform="scale(0.4)";
    setTimeout(()=>{ gem.style.opacity="0"; setTimeout(()=>gem.remove(),200); },450);
  },300);
}