// config.js — Spielkonfiguration (Pets, Eier, Upgrades, Blacklist)
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
  Common:{label:"Gewöhnlich",color:"#b4b4c3",order:1}, Rare:{label:"Selten",color:"#78c8dc",order:2},
  Epic:{label:"Episch",color:"#b482dc",order:3}, Legendary:{label:"Legendär",color:"#ffb450",order:4},
  Mythic:{label:"Mythisch",color:"#ff6482",order:5}, God:{label:"Göttlich",color:"#f5c350",order:6},
  Secret:{label:"Geheim",color:"#6a4c93",order:7}, Celestial:{label:"Himmlisch",color:"#50dcc8",order:8},
};
const PETS = {
  1:{id:1,emoji:"🐱",name:"Katze",rarity:"Common",role:"click",click:1,idle:0,mult:1},
  2:{id:2,emoji:"🐶",name:"Hund",rarity:"Common",role:"idle",click:0,idle:1,mult:1},
  3:{id:3,emoji:"🐰",name:"Hase",rarity:"Common",role:"allround",click:1,idle:1,mult:1},
  100:{id:100,emoji:"🦊",name:"Fuchs",rarity:"Rare",role:"click",click:5,idle:0,mult:1.1},
  101:{id:101,emoji:"🐻",name:"Bär",rarity:"Rare",role:"allround",click:3,idle:3,mult:1.1},
  102:{id:102,emoji:"🐮",name:"Kuh",rarity:"Rare",role:"idle",click:0,idle:8,mult:1.1},
  200:{id:200,emoji:"🦁",name:"Löwe",rarity:"Epic",role:"click",click:25,idle:0,mult:1.2},
  201:{id:201,emoji:"🐯",name:"Tiger",rarity:"Epic",role:"allround",click:15,idle:15,mult:1.2},
  202:{id:202,emoji:"🐺",name:"Wolf",rarity:"Epic",role:"idle",click:0,idle:40,mult:1.2},
  300:{id:300,emoji:"🐲",name:"Drache",rarity:"Legendary",role:"click",click:120,idle:0,mult:1.5},
  301:{id:301,emoji:"🦄",name:"Einhorn",rarity:"Legendary",role:"idle",click:0,idle:200,mult:1.3},
  302:{id:302,emoji:"🐉",name:"Wyvern",rarity:"Legendary",role:"allround",click:80,idle:80,mult:1.4},
  400:{id:400,emoji:"👹",name:"Oni",rarity:"Mythic",role:"click",click:800,idle:0,mult:2.0},
  401:{id:401,emoji:"🦅",name:"Adler",rarity:"Mythic",role:"idle",click:0,idle:1200,mult:1.6},
  402:{id:402,emoji:"🐙",name:"Krake",rarity:"Mythic",role:"allround",click:500,idle:500,mult:1.8},
  500:{id:500,emoji:"🔱",name:"Poseidon",rarity:"God",role:"multi",click:6000,idle:0,mult:2.5},
  501:{id:501,emoji:"👑",name:"Imperator",rarity:"God",role:"idle",click:0,idle:9000,mult:2.2},
  502:{id:502,emoji:"🌋",name:"Magma",rarity:"God",role:"multi",click:5000,idle:5000,mult:3.0},
  600:{id:600,emoji:"🤖",name:"Roboter",rarity:"Secret",role:"click",click:60000,idle:0,mult:4.0},
  601:{id:601,emoji:"👾",name:"Alien",rarity:"Secret",role:"idle",click:0,idle:90000,mult:3.5},
  602:{id:602,emoji:"💀",name:"Reaper",rarity:"Secret",role:"allround",click:50000,idle:50000,mult:3.8},
  700:{id:700,emoji:"🌟",name:"Stern",rarity:"Celestial",role:"click",click:600000,idle:0,mult:5.0},
  701:{id:701,emoji:"☄️",name:"Komet",rarity:"Celestial",role:"idle",click:0,idle:900000,mult:4.5},
  702:{id:702,emoji:"🪐",name:"Planet",rarity:"Celestial",role:"multi",click:500000,idle:500000,mult:5.0},
};
const EGGS = {
  basic:{emoji:"🥚",name:"Basis-Ei",cost:5,drops:{Common:75,Rare:22,Epic:3}},
  golden:{emoji:"🪺",name:"Gold-Ei",cost:50,drops:{Rare:50,Epic:38,Legendary:11,Mythic:1}},
  cosmic:{emoji:"🌌",name:"Kosmos-Ei",cost:500,drops:{Epic:40,Legendary:34,Mythic:18,God:6,Secret:1.9,Celestial:0.1}},
};
const UPGRADES = {
  click1:{id:"click1",emoji:"👊",name:"Stärkere Klicks",unit:"pro Klick",  type:"click",base:15,    mult:1.15,per:2,    reb:0, order:1},
  idle1: {id:"idle1", emoji:"⏰",name:"Auto-Verdienst", unit:"pro Sekunde",type:"idle", base:60,    mult:1.18,per:1,    reb:0, order:2},
  click2:{id:"click2",emoji:"🐾",name:"Krallen-Hieb",   unit:"pro Klick",  type:"click",base:1000,  mult:1.16,per:25,   reb:1, order:3},
  idle2: {id:"idle2", emoji:"🏭",name:"Geld-Fabrik",    unit:"pro Sekunde",type:"idle", base:4000,  mult:1.19,per:18,   reb:2, order:4},
  click3:{id:"click3",emoji:"⚡",name:"Power-Klick",    unit:"pro Klick",  type:"click",base:120000, mult:1.17,per:300,  reb:4, order:5},
  idle3: {id:"idle3", emoji:"🏗️",name:"Großbetrieb",    unit:"pro Sekunde",type:"idle", base:500000, mult:1.20,per:220,  reb:6, order:6},
  click4:{id:"click4",emoji:"💥",name:"Mega-Klick",     unit:"pro Klick",  type:"click",base:1e7,    mult:1.18,per:4000, reb:9, order:7},
  idle4: {id:"idle4", emoji:"🏰",name:"Imperium",       unit:"pro Sekunde",type:"idle", base:5e7,    mult:1.21,per:3000, reb:12,order:8},
};
const BOSSES=[
  {id:"devil", emoji:"😈",name:"Der Teufel",    hp:5000000,   xp:50,  rewardMin:10, rewardMax:30},
  {id:"skull", emoji:"💀",name:"Der Reaper",    hp:15000000,  xp:120, rewardMin:20, rewardMax:50},
  {id:"dragon",emoji:"🐲",name:"Feuer-Drache",  hp:50000000,  xp:300, rewardMin:30, rewardMax:70},
  {id:"alien", emoji:"👾",name:"Alien-Overlord", hp:150000000, xp:800, rewardMin:50, rewardMax:100},
];
const SLAYER_SKILLS=[
  {id:"dmgBoost1",  name:"Berserker I",     emoji:"💢", desc:"+10% Schaden beim Boss",       effect:"bossDmg",  val:0.10, req:3,  xpReq:100},
  {id:"gemBonus1",  name:"Schatzsucher I",  emoji:"💎", desc:"+5 Bonus-Dias nach Boss-Kill", effect:"bonusGems",val:5,    req:5,  xpReq:250},
  {id:"dmgBoost2",  name:"Berserker II",    emoji:"⚔️", desc:"+25% Schaden beim Boss",       effect:"bossDmg",  val:0.25, req:8,  xpReq:500,  requires:"dmgBoost1"},
  {id:"gemBonus2",  name:"Schatzsucher II", emoji:"👑", desc:"+15 Bonus-Dias nach Boss-Kill",effect:"bonusGems",val:15,   req:12, xpReq:1000, requires:"gemBonus1"},
  {id:"dmgBoost3",  name:"Berserker III",   emoji:"🔥", desc:"+50% Schaden beim Boss",       effect:"bossDmg",  val:0.50, req:18, xpReq:2500, requires:"dmgBoost2"},
  {id:"clickBoost", name:"Krieger-Instinkt",emoji:"🧠", desc:"+15% Klick-Wert global",       effect:"clickMult",val:0.15, req:25, xpReq:5000, requires:"dmgBoost3"},
  {id:"gemBonus3",  name:"Legenden-Gier",   emoji:"🏆", desc:"+40 Bonus-Dias nach Boss-Kill",effect:"bonusGems",val:40,   req:30, xpReq:10000,requires:"gemBonus2"},
];
const BOSS_DURATION=30*60*1000;
const BASE_CLICK=1, REBIRTH_BASE=5000, REBIRTH_SCALE=6.5;
const SESSION_KEY="ec_session";
const UNITS=["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc"];
function fmt(n){ n=Math.floor(n); if(n<1000) return ""+n;
  let t=Math.floor(Math.log10(n)/3); if(t>=UNITS.length)t=UNITS.length-1;
  const v=n/Math.pow(1000,t); return (v<10?v.toFixed(2):v<100?v.toFixed(1):Math.floor(v))+UNITS[t]; }