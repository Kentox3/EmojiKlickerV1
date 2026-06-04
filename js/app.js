// app.js — Event Listener & Boot
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById("clicker").addEventListener("pointerdown", e=>{ e.preventDefault(); doClick(e); });
  document.getElementById("petsBtn").onclick=()=>openPanel("pets");
  document.getElementById("eggsBtn").onclick=()=>openPanel("eggs");
  document.getElementById("lbBtn").onclick=()=>openPanel("lb");
  document.getElementById("bossBtn").onclick=()=>openBoss();
  document.getElementById("bossClickBtn").onclick=doBossClick;
  document.getElementById("bossCloseBtn").onclick=closeBoss;
  document.getElementById("bossSkillsBtn").onclick=()=>{ renderSkillPanel(); document.getElementById("skillPanel").classList.add("open"); };
  document.getElementById("skillPanelClose").onclick=()=>document.getElementById("skillPanel").classList.remove("open");
  document.querySelectorAll(".mult").forEach(b=>b.onclick=()=>{ selMult=b.dataset.m; document.querySelectorAll(".mult").forEach(x=>x.classList.toggle("sel",x===b)); renderList(); });
  document.getElementById("panelClose").onclick=closePanel;
  document.getElementById("panelWrap").addEventListener("click",e=>{ if(e.target.id==="panelWrap")closePanel(); });
  document.getElementById("userChip").onclick=logout;
  document.getElementById("tabLogin").onclick=()=>setAuthMode("login");
  document.getElementById("tabReg").onclick=()=>setAuthMode("register");
  document.getElementById("auSubmit").onclick=submitAuth;
  document.getElementById("auPass").addEventListener("keydown",e=>{ if(e.key==="Enter"&&authMode==="login")submitAuth(); });
  document.getElementById("auPass2").addEventListener("keydown",e=>{ if(e.key==="Enter")submitAuth(); });
  document.getElementById("modalNo").onclick=()=>document.getElementById("modalWrap").classList.remove("open");
  window.addEventListener("beforeunload",()=>save(true));
  document.addEventListener("visibilitychange",()=>{ if(document.hidden)save(true); });
  boot();
});