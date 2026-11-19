// Macaco Espacial — dados, save e configurações
'use strict';
const $=s=>document.querySelector(s);
const cv=$('#c');let ctx=cv.getContext('2d');
const VH=600,JET=1650,PUMP=150,VMAX=1150;
let W=1,H=1,DPR=1,S=1,VW=1000,bgGrad=null;
const isTouch=matchMedia('(pointer:coarse)').matches;
const isIOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t, rand=(a,b)=>a+Math.random()*(b-a);

/* ---------- SAVE ---------- */
/* ---------- DIFICULDADE ---------- */
const DIFF={
 facil:     {nome:'Fácil',     cor:'#1fb35a',grav:610,storm0:55, stormK:.035,stormMax:190,stormGap:1450,rope:60, gapAdd:-30,haz:.55,hazStart:250,hole:.5,holeStart:900,osc:.6,oscStart:1300,fuel:1.4,regen:.32,ban:1,ropeT:0,  cue:2,shield:true, desc:'Calmo, escudo grátis'},
 medio:     {nome:'Médio',     cor:'#e0a400',grav:720,storm0:85, stormK:.08, stormMax:340,stormGap:1150,rope:0,  gapAdd:0,  haz:1,  hazStart:120,hole:1,  holeStart:550,osc:1,  oscStart:700, fuel:1,  regen:.18,ban:1,ropeT:0,  cue:1,shield:false,desc:'O clássico'},
 dificil:   {nome:'Difícil',   cor:'#ff6b00',grav:800,storm0:105,stormK:.1,  stormMax:410,stormGap:1000,rope:-15,gapAdd:30, haz:1.4,hazStart:50, hole:1.4,holeStart:300,osc:1.4,oscStart:350, fuel:.85,regen:.1, ban:2,ropeT:3.5,cue:0,shield:false,desc:'Corda frágil · 🍌x2'},
 impossivel:{nome:'Impossível',cor:'#ff2e63',grav:880,storm0:115,stormK:.12, stormMax:480,stormGap:950, rope:-20,gapAdd:40, haz:1.9,hazStart:0,  hole:1.9,holeStart:120,osc:2,  oscStart:80,  fuel:.7, regen:.05,ban:3,ropeT:2.2,cue:0,shield:false,desc:'Boa sorte · 🍌x3'}};
const DIFF_IDS=Object.keys(DIFF);
const Dz=()=>DIFF[(G&&G.diff)||SAVE.diff]||DIFF.medio;
const UNLOCK_M=1000;
/* ---------- MUNDOS ---------- */
const WORLDS=[
 {id:'nebulosa',nome:'Nebulosa Roxa',ic:'🌌',bg:['#0b0820','#1d0f45','#3a1250'],abyss:'255,46,99',star:'#ffffff',rock:[['#9b8a7a','#5e5147'],['#8f97a8','#4f566a'],['#a88f7a','#6a4b39']],mus:{base:330,roots:[0,-4,-7,-2],tempo:.13,wave:'sine'},comet:1,portal:1},
 {id:'gelo',nome:'Planeta de Gelo',ic:'🧊',bg:['#06142b','#0f3a66','#3f8fc0'],abyss:'120,220,255',star:'#cfefff',rock:[['#e6f7ff','#7fb6d6'],['#c4ecff','#5c93b8'],['#f0fbff','#8fc3de']],mus:{base:392,roots:[0,5,-2,3],tempo:.14,wave:'triangle'},snow:1,comet:.8,portal:1,bounce:1.75},
 {id:'lava',nome:'Cinturão de Lava',ic:'🌋',bg:['#1a0505','#4a0f0a','#8a2a0a'],abyss:'255,120,0',star:'#ffcf9f',rock:[['#6a4436','#2a1510'],['#7b4b3b','#2b120a'],['#5d3b32','#1e0c08']],mus:{base:294,roots:[0,-2,-5,-7],tempo:.15,wave:'triangle'},ember:1,comet:2,portal:.7,lava:1},
 {id:'neon',nome:'Galáxia Neon',ic:'💜',bg:['#000000','#12002b','#2b0050'],abyss:'0,255,200',star:'#99ffff',rock:[['#2a2a48','#101020'],['#30304e','#151528'],['#28284a','#0d0d1d']],mus:{base:440,roots:[0,3,-4,-2],tempo:.11,wave:'square'},grid:1,comet:1.3,portal:2,neon:['#ff2e9a','#00f0ff','#b14dff']}];
const WORLD_LEN=[800,1000,1200,1500];
function worldAt(d){let tot=0,i=0;while(i<400){const L=WORLD_LEN[i%4];if(d<tot+L)return{i:i%4,lap:Math.floor(i/4)};tot+=L;i++;}return{i:0,lap:0};}
/* ---------- DATAS ---------- */
const dstr=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today=()=>dstr(new Date());
const yesterday=()=>{const d=new Date();d.setDate(d.getDate()-1);return dstr(d);};
const daySeed=()=>parseInt(today().replace(/-/g,''),10);
const chalTarget=()=>400+(daySeed()%6)*100;
/* ---------- CONQUISTAS ---------- */
const ACH=[
 {id:'primeiro',ic:'🚀',nome:'Primeiro Voo',desc:'Termine sua primeira partida',rw:20,ok:L=>L.runs>=1},
 {id:'km1',ic:'📏',nome:'Quilômetro!',desc:'Alcance 1000 m numa partida',rw:100,ok:L=>L.bestAny>=1000},
 {id:'km3',ic:'🛰️',nome:'Explorador',desc:'Alcance 3000 m numa partida',rw:300,ok:L=>L.bestAny>=3000},
 {id:'km5',ic:'🌠',nome:'Lenda Espacial',desc:'Alcance 5000 m numa partida',rw:600,ok:L=>L.bestAny>=5000},
 {id:'gelo',ic:'🧊',nome:'Que Frio!',desc:'Chegue ao Planeta de Gelo (800 m)',rw:80,ok:L=>L.bestAny>=800},
 {id:'lava',ic:'🌋',nome:'Pé Quente',desc:'Chegue ao Cinturão de Lava (1800 m)',rw:150,ok:L=>L.bestAny>=1800},
 {id:'neon',ic:'💜',nome:'Luzes Neon',desc:'Chegue à Galáxia Neon (3000 m)',rw:200,ok:L=>L.bestAny>=3000},
 {id:'perf100',ic:'⭐',nome:'Mestre do Lançamento',desc:'100 lançamentos PERFEITOS no total',rw:150,ok:L=>L.perf>=100},
 {id:'flip50',ic:'🤸',nome:'Acrobata',desc:'50 cambalhotas no total',rw:150,ok:L=>L.flips>=50},
 {id:'flip3',ic:'🌀',nome:'Ventilador',desc:'3 cambalhotas num único voo',rw:120,ok:(L,g)=>!!g&&g.maxFlipChain>=3},
 {id:'ban1000',ic:'🍌',nome:'Comilão',desc:'Colete 1.000 bananas no total',rw:100,ok:L=>L.ban>=1000},
 {id:'ban10000',ic:'🏦',nome:'Banco de Bananas',desc:'Colete 10.000 bananas no total',rw:500,ok:L=>L.ban>=10000},
 {id:'combo20',ic:'🔥',nome:'Combo Insano',desc:'Chegue a um combo de 20',rw:120,ok:L=>L.maxCombo>=20},
 {id:'chefe',ic:'🐙',nome:'Caçador de Polvos',desc:'Derrote o Polvo Galáctico',rw:200,ok:L=>L.bosses>=1},
 {id:'chefe5',ic:'👑',nome:'Rei dos Chefes',desc:'Derrote 5 chefes',rw:500,ok:L=>L.bosses>=5},
 {id:'meteoro',ic:'☄️',nome:'Guarda-Chuva',desc:'Sobreviva a uma chuva de meteoros',rw:100,ok:L=>L.showers>=1},
 {id:'portal',ic:'🌀',nome:'Teletransporte',desc:'Use 10 portais',rw:80,ok:L=>L.portals>=10},
 {id:'mola',ic:'🟢',nome:'Boing!',desc:'Use 25 molas',rw:80,ok:L=>L.springs>=25},
 {id:'semjet',ic:'🙌',nome:'Sem as Mãos',desc:'Chegue a 500 m sem usar o jetpack',rw:150,ok:(L,g)=>!!g&&!g.usedJet&&g.dist>=500},
 {id:'estilo',ic:'😎',nome:'Estiloso',desc:'Use chapéu, óculos e rastro ao mesmo tempo',rw:50,ok:()=>SAVE.eq.hat!=='nenhum'&&SAVE.eq.glass!=='nenhum'&&SAVE.eq.trail!=='nenhum'},
 {id:'colecao',ic:'🎒',nome:'Colecionador',desc:'Tenha 15 itens comprados na loja',rw:200,ok:()=>Object.values(SAVE.own).reduce((a,b)=>a+b.length,0)-6>=15},
 {id:'quantico',ic:'⚛️',nome:'Tecnologia Quântica',desc:'Compre o Jetpack Quântico',rw:300,ok:()=>SAVE.own.jet.includes('quantico')},
 {id:'impossivel',ic:'🔓',nome:'Destravado',desc:'Desbloqueie o nível Impossível',rw:300,ok:()=>!isLocked('impossivel')},
 {id:'imp500',ic:'💀',nome:'Nada é Impossível',desc:'Alcance 500 m no Impossível',rw:1000,ok:()=>(SAVE.bestD.impossivel||0)>=500},
 {id:'diario7',ic:'📅',nome:'Fiel Escudeiro',desc:'Abra o baú 7 dias seguidos',rw:300,ok:()=>SAVE.daily.streak>=7},
 {id:'desafio',ic:'🏁',nome:'Desafiante',desc:'Cumpra um Desafio do Dia',rw:100,ok:L=>L.dailyDone>=1}];

const isLocked=id=>id==='impossivel'&&(SAVE.bestD.dificil||0)<UNLOCK_M;
const KEY='macacoEspacial_v1';
const DEF={best:0,bananas:0,runs:0,up:{rope:0,fuel:0,magnet:0,shield:0},skins:['classico'],skin:'classico',own:{traje:['classico'],jet:['padrao'],pelo:['castanho'],hat:['nenhum'],glass:['nenhum'],trail:['nenhum']},eq:{traje:'classico',jet:'padrao',pelo:'castanho',hat:'nenhum',glass:'nenhum',trail:'nenhum'},mig2:false,
  set:{sfx:true,music:true,vib:true,swap:false,lite:false,liteAsked:false},diff:'medio',bestD:{facil:0,medio:0,dificil:0,impossivel:0},mlv:{dist:0,ban:0,perf:0,combo:0,pw:0},
  life:{runs:0,perf:0,flips:0,ban:0,maxCombo:0,bosses:0,showers:0,portals:0,springs:0,bestAny:0,dailyDone:0,lv:{}},ach:{},daily:{last:'',streak:0},chal:{date:'',best:0,done:false},tut:false,mig3:false};
const clone=o=>JSON.parse(JSON.stringify(o));
function merge(a,b){for(const k in b){if(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a[k]&&typeof a[k]==='object')merge(a[k],b[k]);else if(b[k]!==undefined)a[k]=b[k];}return a;}
let SAVE;try{SAVE=merge(clone(DEF),JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){SAVE=clone(DEF)}
if(SAVE.best&&!SAVE.bestD.medio)SAVE.bestD.medio=SAVE.best;
if(!SAVE.mig2){const PM={classico:'castanho',dourado:'dourado',ninja:'chocolate',robo:'prata',lava:'lava',galaxia:'cosmico'};
 for(const k of SAVE.skins||[]){if(!SAVE.own.traje.includes(k))SAVE.own.traje.push(k);if(PM[k]&&!SAVE.own.pelo.includes(PM[k]))SAVE.own.pelo.push(PM[k]);}
 if(SAVE.skin&&PM[SAVE.skin]){SAVE.eq.traje=SAVE.skin;SAVE.eq.pelo=PM[SAVE.skin];}SAVE.mig2=true;}
if(!DIFF_IDS.includes(SAVE.diff)||isLocked(SAVE.diff))SAVE.diff='medio';
if(!SAVE.mig3){SAVE.life.runs=SAVE.runs||0;SAVE.life.bestAny=Math.max(SAVE.best||0,...Object.values(SAVE.bestD).map(v=>v||0));if((SAVE.runs||0)>0)SAVE.tut=true;SAVE.mig3=true;}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(SAVE))}catch(e){}}

const UPG=[
 {id:'rope',ic:'🪢',nome:'Corda Cósmica',desc:'Alcance maior para agarrar asteroides',max:5,cost:l=>80+l*90},
 {id:'fuel',ic:'⛽',nome:'Tanque Turbo',desc:'Mais combustível no jetpack',max:5,cost:l=>70+l*80},
 {id:'magnet',ic:'🧲',nome:'Super Ímã',desc:'Ímã dura mais e puxa de mais longe',max:5,cost:l=>90+l*100},
 {id:'shield',ic:'🛡️',nome:'Escudo de Largada',desc:'Começa toda partida com um escudo',max:1,cost:()=>450}];
const ropeRange=()=>230+Dz().rope+SAVE.up.rope*28, fuelMax=()=>(2.6+SAVE.up.fuel*.7)*Dz().fuel*ST().cap, magTime=()=>(7+SAVE.up.magnet*1.6)*ST().mag, magRange=()=>200+SAVE.up.magnet*25;
/* ---------- ITENS DA LOJA ---------- */
const CATS={
 traje:{nome:'Trajes',ic:'👕',items:[
  {id:'classico',nome:'Traje Clássico',preco:0,traje:'#e9eef6',det:'#ff7a3c',visor:'#7fd3ff'},
  {id:'nylon',nome:'Traje Leve',preco:200,traje:'#7fe0c0',det:'#14866b',visor:'#b8fff0',flut:.05},
  {id:'dourado',nome:'Astro Dourado',preco:300,traje:'#ffcf3f',det:'#ff6b00',visor:'#ffb347',flut:.04,mag:.3},
  {id:'ninja',nome:'Ninja Galáctico',preco:600,traje:'#2a2c45',det:'#ff2e63',visor:'#ff2e63',flut:.08},
  {id:'robo',nome:'Robo-Traje',preco:1000,traje:'#4f5fd0',det:'#39ff88',visor:'#39ff88',flut:.06,shield:true},
  {id:'lava',nome:'Traje de Lava',preco:1600,traje:'#40201a',det:'#ff4d00',visor:'#ff4d00',flut:.10,cap:.15},
  {id:'galaxia',nome:'Rei da Galáxia',preco:2500,traje:'#1b0f3a',det:'#ffd700',visor:'#c77dff',flut:.14,ban:.15,rb:true}]},
 jet:{nome:'Jetpacks',ic:'🎒',items:[
  {id:'padrao',nome:'Jetpack Padrão',preco:0,body:'#8d97a8',flame:'#ffb300',style:1},
  {id:'eco',nome:'Jato Econômico',preco:250,body:'#43a047',flame:'#7dff9a',style:1,thr:.95,cons:.7,regen:1.2},
  {id:'turbo',nome:'Turbo V8',preco:550,body:'#e53935',flame:'#ff5a00',style:2,thr:1.3,cons:1.15,cap:1.05},
  {id:'solar',nome:'Planador Solar',preco:900,body:'#ffca28',flame:'#fff176',style:3,cons:.85,regen:2.2,flut:.04},
  {id:'bolha',nome:'Bolha Flutuante',preco:1200,body:'#4dd0e1',flame:'#b2ebf2',style:4,thr:.9,cons:.9,flut:.10},
  {id:'duplo',nome:'Foguete Duplo',preco:1600,body:'#5c6bc0',flame:'#80d8ff',style:2,thr:1.2,cons:.8,cap:1.25,flut:.03},
  {id:'quantico',nome:'Jetpack Quântico',preco:3500,body:'#1d1830',flame:'#e040fb',style:5,thr:1.35,cons:.55,cap:1.35,regen:1.5,flut:.06}]},
 pelo:{nome:'Pelagem',ic:'🐵',items:[
  {id:'castanho',nome:'Castanho',preco:0,pelo:'#8b5a2b',rosto:'#f2c99b'},
  {id:'dourado',nome:'Dourado',preco:120,pelo:'#b5762a',rosto:'#ffe0a3'},
  {id:'chocolate',nome:'Chocolate',preco:120,pelo:'#3a2a20',rosto:'#d6a274'},
  {id:'ruivo',nome:'Ruivo',preco:180,pelo:'#c4501c',rosto:'#ffd2a8'},
  {id:'prata',nome:'Prata',preco:220,pelo:'#8c9aa8',rosto:'#cfd8e0'},
  {id:'neve',nome:'Neve',preco:300,pelo:'#e8e8f0',rosto:'#ffd9e0'},
  {id:'lava',nome:'Lava',preco:400,pelo:'#3b1a12',rosto:'#ff9d5c'},
  {id:'cosmico',nome:'Cósmico',preco:500,pelo:'#5b2d8c',rosto:'#f0c8ff'},
  {id:'arcoiris',nome:'Arco-Íris',preco:1500,pelo:'#c33',rosto:'#ffe9f5',rb:true}]},
 hat:{nome:'Chapéus',ic:'🎩',items:[
  {id:'nenhum',nome:'Nenhum',preco:0},{id:'bone',nome:'Boné',preco:100},{id:'antena',nome:'Antenas Alien',preco:150},
  {id:'helice',nome:'Boné Hélice',preco:250},{id:'pirata',nome:'Pirata',preco:300},{id:'cartola',nome:'Cartola',preco:350},
  {id:'viking',nome:'Viking',preco:450},{id:'mago',nome:'Mago',preco:600},{id:'coroa',nome:'Coroa',preco:1000}]},
 glass:{nome:'Óculos',ic:'🕶️',items:[
  {id:'nenhum',nome:'Nenhum',preco:0},{id:'nerd',nome:'Nerd',preco:80},{id:'escuros',nome:'Escuros',preco:150},
  {id:'3d',nome:'Óculos 3D',preco:200},{id:'coracao',nome:'Corações',preco:250},{id:'estrela',nome:'Estrelas',preco:300},{id:'laser',nome:'Visor Laser',preco:700}]},
 trail:{nome:'Rastros',ic:'✨',items:[
  {id:'nenhum',nome:'Nenhum',preco:0,ic:'🚫'},{id:'bolhas',nome:'Bolhas',preco:150,ic:'🫧'},{id:'estrelas',nome:'Estrelas',preco:200,ic:'⭐'},
  {id:'fogo',nome:'Fogo',preco:300,ic:'🔥'},{id:'coracoes',nome:'Corações',preco:350,ic:'💖'},{id:'bananas',nome:'Bananas',preco:500,ic:'🍌'},{id:'arcoiris',nome:'Arco-Íris',preco:900,ic:'🌈'}]}};
const findItem=(c,id)=>CATS[c].items.find(i=>i.id===id)||CATS[c].items[0];
function look(over){const e=Object.assign({},SAVE.eq,over||{}),tr=findItem('traje',e.traje),pe=findItem('pelo',e.pelo);
 return{pelo:pe.pelo,rosto:pe.rosto,rbFur:!!pe.rb,traje:tr.traje,det:tr.det,visor:tr.visor,rbSuit:!!tr.rb,jet:findItem('jet',e.jet),hat:e.hat,glass:e.glass};}
function stats(over){const e=Object.assign({},SAVE.eq,over||{}),tr=findItem('traje',e.traje),j=findItem('jet',e.jet);
 return{flut:Math.min(.3,(tr.flut||0)+(j.flut||0)),thr:j.thr||1,cons:j.cons||1,cap:(j.cap||1)*(1+(tr.cap||0)),regen:j.regen||1,ban:tr.ban||0,mag:1+(tr.mag||0),shield:!!tr.shield};}
const skin=()=>look();
const ST=()=>(G&&G.st)||stats();
const MIS=[
 {id:'dist',ic:'📏',f:n=>`Alcance ${n} m numa partida`,t:l=>[150,300,500,750,1000,1400,1800,2400,3000][l]??3000+(l-8)*800},
 {id:'ban',ic:'🍌',f:n=>`Pegue ${n} bananas numa partida`,t:l=>[15,30,50,80,120,160,220][l]??220+(l-6)*80},
 {id:'perf',ic:'⭐',f:n=>`Faça ${n} lançamentos PERFEITOS numa partida`,t:l=>[2,4,7,10,14,18][l]??18+(l-5)*5},
 {id:'combo',ic:'🔥',f:n=>`Chegue a um combo de ${n}`,t:l=>[5,8,12,16,20,25][l]??25+(l-5)*5},
 {id:'pw',ic:'🎁',f:n=>`Pegue ${n} power-ups numa partida`,t:l=>[1,2,3,5,7][l]??7+(l-4)*2}];
const misReward=l=>40+l*35;

