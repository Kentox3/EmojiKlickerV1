// config.js — Spielkonfiguration

const NAME_BLACKLIST=[
  "admin","administrator","moderator","mod","staff","owner","dev","developer","support","system","bot","official","team",
  "scheiße","scheisse","scheiß","scheiss","arsch","arschloch","wichser","wichse","hurensohn","hure","fotze","fick","ficken","gefickt","kacke","kacken","pisser","pisse","vollidiot","idiot","depp","trottel","volltrottel","dummkopf","dumm","blödmann","blöd","bloed","wanker","drecksau","dreck","schlampe","nutte","bastard","penner","spast","spastiker",
  "fuck","fucker","fucking","fucked","shit","shitter","bullshit","asshole","ass","bitch","bastard","cunt","dick","cock","pussy","prick","wanker","twat","moron","idiot","retard","loser","stupid","dumbass","jackass","jerk",
  "nazi","neger","nigger","kanake","judensau","zigeuner","hurenkind","rassist","rassismus","faschist",
  "nigga","chink","kike","spic","wetback","towelhead","raghead","tranny","faggot","fag","dyke","racist","fascist",
  "penis","vagina","pimmel","schwanz","titten","möse","anal","sexting","porno","nacktbild","erotik","dildo","vibrator",
  "cock","tits","boobs","nude","naked","horny","slut","whore","milf",
];
function isNameBlacklisted(name){
  const n=name.toLowerCase().replace(/[^a-z0-9äöüß]/g,"");
  return NAME_BLACKLIST.some(w=>n.includes(w.toLowerCase().replace(/[^a-z0-9äöüß]/g,"")));
}
const genId = () => crypto.randomUUID?.() || ("p"+Date.now()+Math.random().toString(36).slice(2));

const ROLES = {
  click:{label:"Klick-Spezi",emoji:"🎯",color:"#d96a28"},
  idle:{label:"Idle-Spezi",emoji:"⏰",color:"#2884c8"},
  multi:{label:"Multi-Spezi",emoji:"💰",color:"#b88a14"},
  allround:{label:"Allrounder",emoji:"⭐",color:"#8a4ec8"},
};
const RARITIES = {
  Common:    {label:"Gewöhnlich",color:"#b4b4c3",order:1},
  Rare:      {label:"Selten",    color:"#78c8dc",order:2},
  Epic:      {label:"Episch",    color:"#b482dc",order:3},
  Legendary: {label:"Legendär",  color:"#ffb450",order:4},
  Mythic:    {label:"Mythisch",  color:"#ff6482",order:5},
  God:       {label:"Göttlich",  color:"#f5c350",order:6},
  Secret:    {label:"Geheim",    color:"#6a4c93",order:7},
  Celestial: {label:"Himmlisch", color:"#50dcc8",order:8},
};

// passiveId: doubleHit | ramping | rhythm | rage | fireBreath | overclock | pack | majesty | critBoost | blessing | soulReap | gravity | armorBreak
const PETS = {
  1:  {id:1,  emoji:"🐱",name:"Katze",    rarity:"Common",   role:"click",   click:1,     idle:0,     mult:1,
       bossAtk:500,    bossCrit:5,  passiveId:"doubleHit",  passiveName:"Doppelklaue",       passiveDesc:"10% Chance: Angriff macht 2× Schaden"},
  2:  {id:2,  emoji:"🐶",name:"Hund",     rarity:"Common",   role:"idle",    click:0,     idle:1,     mult:1,
       bossAtk:600,    bossCrit:4,  passiveId:"ramping",    passiveName:"Ausdauer",          passiveDesc:"Jeder Klick +1% Schaden (max. 25%)"},
  3:  {id:3,  emoji:"🐰",name:"Hase",     rarity:"Common",   role:"allround",click:1,     idle:1,     mult:1,
       bossAtk:700,    bossCrit:6,  passiveId:"rhythm",     passiveName:"Trommelschlag",     passiveDesc:"Jeder 5. Klick: 3× Schaden"},
  100:{id:100,emoji:"🦊",name:"Fuchs",    rarity:"Rare",     role:"click",   click:5,     idle:0,     mult:1.1,
       bossAtk:3000,   bossCrit:8,  passiveId:"armorBreak", passiveName:"Listiger Angriff",  passiveDesc:"20% Chance: Rüstungsbruch → 1.5× Schaden"},
  101:{id:101,emoji:"🐻",name:"Bär",      rarity:"Rare",     role:"allround",click:3,     idle:3,     mult:1.1,
       bossAtk:4000,   bossCrit:7,  passiveId:"rage",       passiveName:"Berserker-Wut",     passiveDesc:"Boss unter 30% HP: +75% Schaden"},
  102:{id:102,emoji:"🐮",name:"Kuh",      rarity:"Rare",     role:"idle",    click:0,     idle:8,     mult:1.1,
       bossAtk:3500,   bossCrit:6,  passiveId:"ramping",    passiveName:"Sturheit",          passiveDesc:"Jeder Klick +1.5% Schaden (max. 35%)"},
  200:{id:200,emoji:"🦁",name:"Löwe",     rarity:"Epic",     role:"click",   click:25,    idle:0,     mult:1.2,
       bossAtk:20000,  bossCrit:12, passiveId:"majesty",    passiveName:"Königlicher Schlag",passiveDesc:"Boss über 50% HP: +40% Schaden"},
  201:{id:201,emoji:"🐯",name:"Tiger",    rarity:"Epic",     role:"allround",click:15,    idle:15,    mult:1.2,
       bossAtk:28000,  bossCrit:15, passiveId:"critBoost",  passiveName:"Präzisionsangriff", passiveDesc:"Kritische Treffer: 3× statt 2× Schaden"},
  202:{id:202,emoji:"🐺",name:"Wolf",     rarity:"Epic",     role:"idle",    click:0,     idle:40,    mult:1.2,
       bossAtk:22000,  bossCrit:11, passiveId:"pack",       passiveName:"Rudel-Instinkt",    passiveDesc:"+8% Schaden pro weiterem Kämpfer (max. +40%)"},
  300:{id:300,emoji:"🐲",name:"Drache",   rarity:"Legendary",role:"click",   click:120,   idle:0,     mult:1.5,
       bossAtk:200000, bossCrit:16, passiveId:"fireBreath", passiveName:"Feueratem",         passiveDesc:"Jeder 10. Klick: 2.5× Schaden"},
  301:{id:301,emoji:"🦄",name:"Einhorn",  rarity:"Legendary",role:"idle",    click:0,     idle:200,   mult:1.3,
       bossAtk:150000, bossCrit:14, passiveId:"blessing",   passiveName:"Heiliger Segen",    passiveDesc:"+0.3 Slayer XP pro Klick (bonus)"},
  302:{id:302,emoji:"🐉",name:"Wyvern",   rarity:"Legendary",role:"allround",click:80,    idle:80,    mult:1.4,
       bossAtk:180000, bossCrit:15, passiveId:"rhythm",     passiveName:"Schwanzpeitsche",   passiveDesc:"Jeder 8. Klick: 3× Schaden"},
  400:{id:400,emoji:"👹",name:"Oni",      rarity:"Mythic",   role:"click",   click:800,   idle:0,     mult:2.0,
       bossAtk:3000000,bossCrit:20, passiveId:"rage",       passiveName:"Teuflische Wut",    passiveDesc:"Boss unter 20% HP: +150% Schaden"},
  401:{id:401,emoji:"🦅",name:"Adler",    rarity:"Mythic",   role:"idle",    click:0,     idle:1200,  mult:1.6,
       bossAtk:2000000,bossCrit:25, passiveId:"critBoost",  passiveName:"Adlerauge",         passiveDesc:"Kritische Treffer: 3.5× Schaden"},
  402:{id:402,emoji:"🐙",name:"Krake",    rarity:"Mythic",   role:"allround",click:500,   idle:500,   mult:1.8,
       bossAtk:2500000,bossCrit:18, passiveId:"rhythm",     passiveName:"Tentakelwirbel",    passiveDesc:"Jeder 6. Klick: 4× Schaden"},
  500:{id:500,emoji:"🔱",name:"Poseidon", rarity:"God",      role:"multi",   click:6000,  idle:0,     mult:2.5,
       bossAtk:50000000,bossCrit:25,passiveId:"pack",       passiveName:"Meeresherrschaft",  passiveDesc:"+12% Schaden pro Kämpfer (max. +60%)"},
  501:{id:501,emoji:"👑",name:"Imperator",rarity:"God",      role:"idle",    click:0,     idle:9000,  mult:2.2,
       bossAtk:40000000,bossCrit:22,passiveId:"majesty",    passiveName:"Kaiserlicher Befehl",passiveDesc:"Boss über 50% HP: +60% Schaden"},
  502:{id:502,emoji:"🌋",name:"Magma",    rarity:"God",      role:"multi",   click:5000,  idle:5000,  mult:3.0,
       bossAtk:60000000,bossCrit:24,passiveId:"fireBreath", passiveName:"Lavahagel",         passiveDesc:"Jeder 8. Klick: 3.5× Schaden"},
  600:{id:600,emoji:"🤖",name:"Roboter",  rarity:"Secret",   role:"click",   click:60000, idle:0,     mult:4.0,
       bossAtk:500000000,bossCrit:30,passiveId:"overclock", passiveName:"Übertaktung",       passiveDesc:"Jeder 50. Klick: 5× Megaschaden"},
  601:{id:601,emoji:"👾",name:"Alien",    rarity:"Secret",   role:"idle",    click:0,     idle:90000, mult:3.5,
       bossAtk:400000000,bossCrit:28,passiveId:"doubleHit", passiveName:"Quantenverschiebung",passiveDesc:"25% Chance: 2× Schaden"},
  602:{id:602,emoji:"💀",name:"Reaper",   rarity:"Secret",   role:"allround",click:50000, idle:50000, mult:3.8,
       bossAtk:450000000,bossCrit:29,passiveId:"soulReap",  passiveName:"Seelenernte",       passiveDesc:"+100% Slayer XP nach Boss-Kill"},
  700:{id:700,emoji:"🌟",name:"Stern",    rarity:"Celestial",role:"click",   click:600000,idle:0,     mult:5.0,
       bossAtk:5000000000,bossCrit:35,passiveId:"blessing", passiveName:"Sternenstaub",      passiveDesc:"1% Chance +1💎 pro Klick & +1 XP/Klick"},
  701:{id:701,emoji:"☄️",name:"Komet",    rarity:"Celestial",role:"idle",    click:0,     idle:900000,mult:4.5,
       bossAtk:4000000000,bossCrit:33,passiveId:"fireBreath",passiveName:"Meteorsturm",      passiveDesc:"Jeder 7. Klick: 5× Schaden"},
  702:{id:702,emoji:"🪐",name:"Planet",   rarity:"Celestial",role:"multi",   click:500000,idle:500000,mult:5.0,
       bossAtk:6000000000,bossCrit:35,passiveId:"gravity",  passiveName:"Gravitationskraft", passiveDesc:"Boss über 70% HP: 2× Schaden (High-Gravity)"},
};

const EGGS = {
  basic: {emoji:"🥚",name:"Basis-Ei",  cost:5,   drops:{Common:75,Rare:22,Epic:3}},
  golden:{emoji:"🪺",name:"Gold-Ei",   cost:50,  drops:{Rare:50,Epic:38,Legendary:11,Mythic:1}},
  cosmic:{emoji:"🌌",name:"Kosmos-Ei", cost:500, drops:{Epic:40,Legendary:34,Mythic:18,God:6,Secret:1.9,Celestial:0.1}},
};

const UPGRADES = {
  click1:{id:"click1",emoji:"👊",name:"Stärkere Klicks", unit:"pro Klick",  type:"click",base:15,     mult:1.15,per:2,    reb:0, order:1},
  idle1: {id:"idle1", emoji:"⏰",name:"Auto-Verdienst",  unit:"pro Sekunde",type:"idle", base:60,     mult:1.18,per:1,    reb:0, order:2},
  click2:{id:"click2",emoji:"🐾",name:"Krallen-Hieb",    unit:"pro Klick",  type:"click",base:1000,   mult:1.16,per:25,   reb:1, order:3},
  idle2: {id:"idle2", emoji:"🏭",name:"Geld-Fabrik",     unit:"pro Sekunde",type:"idle", base:4000,   mult:1.19,per:18,   reb:2, order:4},
  click3:{id:"click3",emoji:"⚡",name:"Power-Klick",     unit:"pro Klick",  type:"click",base:120000,  mult:1.17,per:300,  reb:4, order:5},
  idle3: {id:"idle3", emoji:"🏗️",name:"Großbetrieb",     unit:"pro Sekunde",type:"idle", base:500000,  mult:1.20,per:220,  reb:6, order:6},
  click4:{id:"click4",emoji:"💥",name:"Mega-Klick",      unit:"pro Klick",  type:"click",base:1e7,     mult:1.18,per:4000, reb:9, order:7},
  idle4: {id:"idle4", emoji:"🏰",name:"Imperium",        unit:"pro Sekunde",type:"idle", base:5e7,     mult:1.21,per:3000, reb:12,order:8},
};

const BOSSES=[
  {id:"devil", emoji:"😈",name:"Der Teufel",    hp:5000000,   xp:50,  rewardMin:10,rewardMax:30},
  {id:"skull", emoji:"💀",name:"Der Reaper",    hp:15000000,  xp:120, rewardMin:20,rewardMax:50},
  {id:"dragon",emoji:"🐲",name:"Feuer-Drache",  hp:50000000,  xp:300, rewardMin:30,rewardMax:70},
  {id:"alien", emoji:"👾",name:"Alien-Overlord", hp:150000000, xp:800, rewardMin:50,rewardMax:100},
];

// 3-Baum Skill-System: Angriff | Kritisch | Meisterschaft
const SLAYER_SKILLS=[
  // ⚔️ Angriff-Baum
  {id:"atk1",tree:"Angriff",   name:"Berserker I",       emoji:"⚔️",desc:"+15% Boss-Schaden",                     effect:"bossDmg",   val:0.15, req:3,  xpReq:100},
  {id:"atk2",tree:"Angriff",   name:"Berserker II",       emoji:"🗡️",desc:"+30% Boss-Schaden",                     effect:"bossDmg",   val:0.30, req:8,  xpReq:500,   requires:"atk1"},
  {id:"atk3",tree:"Angriff",   name:"Berserker III",      emoji:"🔥",desc:"+60% Boss-Schaden",                     effect:"bossDmg",   val:0.60, req:18, xpReq:2500,  requires:"atk2"},
  {id:"atk4",tree:"Angriff",   name:"Todesstoss",         emoji:"☠️",desc:"Boss unter 20% HP: +100% Schaden",      effect:"execute",   val:1.00, req:25, xpReq:8000,  requires:"atk3"},
  // ✨ Kritisch-Baum
  {id:"crit1",tree:"Kritisch",  name:"Scharfer Sinn",      emoji:"👁️",desc:"+5% Krit-Chance",                       effect:"critChance",val:5,    req:5,  xpReq:200},
  {id:"crit2",tree:"Kritisch",  name:"Präzisionsschlag",   emoji:"🎯",desc:"Krits: 2.5× statt 2× Schaden",          effect:"critMult",  val:0.5,  req:12, xpReq:800,   requires:"crit1"},
  {id:"crit3",tree:"Kritisch",  name:"Goldener Treffer",   emoji:"💛",desc:"Krit gibt +1 💎",                        effect:"critGem",   val:1,    req:20, xpReq:4000,  requires:"crit2"},
  {id:"crit4",tree:"Kritisch",  name:"Tödlicher Instinkt", emoji:"⚡",desc:"+15% weitere Krit-Chance",              effect:"critChance",val:15,   req:28, xpReq:10000, requires:"crit3"},
  // 🌟 Meisterschaft-Baum
  {id:"mast1",tree:"Meisterschaft",name:"Passive Kraft",   emoji:"🌀",desc:"Passive 25% stärker",                   effect:"passiveMult",val:0.25,req:10, xpReq:600},
  {id:"mast2",tree:"Meisterschaft",name:"Krieger-Seele",   emoji:"🧠",desc:"+15% globaler Klick-Wert",              effect:"clickMult", val:0.15, req:15, xpReq:1500},
  {id:"mast3",tree:"Meisterschaft",name:"Boss-Bändiger",   emoji:"🏆",desc:"+75% Slayer XP",                        effect:"xpMult",    val:0.75, req:22, xpReq:5000,  requires:"mast1"},
  {id:"mast4",tree:"Meisterschaft",name:"Schatzgier",      emoji:"💰",desc:"+20 Bonus-Dias nach Boss-Kill",          effect:"bonusGems", val:20,   req:30, xpReq:15000, requires:"mast3"},
];

const BOSS_DURATION=30*60*1000;
const BASE_CLICK=1, REBIRTH_BASE=5000, REBIRTH_SCALE=6.5;
const SESSION_KEY="ec_session";
const UNITS=["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
function fmt(n){ n=Math.floor(n); if(n<1000) return ""+n;
  let t=Math.floor(Math.log10(n)/3); if(t>=UNITS.length)t=UNITS.length-1;
  const v=n/Math.pow(1000,t); return (v<10?v.toFixed(2):v<100?v.toFixed(1):Math.floor(v))+UNITS[t]; }