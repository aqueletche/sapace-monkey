'use strict';
// StarChimp — telas, loja, metas, baú, backup e PWA
/* ---------- UI ---------- */
function show(id){document.querySelectorAll('.ui').forEach(e=>e.classList.toggle('show',e.id===id));if(typeof updBanner==='function')updBanner();$('#bPause').style.display=(!id&&state==='play')?'flex':'none';}
function refreshBadges(){const av=chestAvail(),cb=$('#bChest');cb.innerHTML=av?'🎁 Baú diário!<small>toque para abrir</small>':`🎁 Baú<small>🔥 ${SAVE.daily.streak} dia(s)</small>`;cb.classList.toggle('glow',av);
 const done=SAVE.chal.date===today()&&SAVE.chal.done;$('#bDaily').innerHTML=`📅 Desafio do Dia<small>${done?'✔ cumprido hoje':'meta '+chalTarget()+' m · +200 🍌'}</small>`;}
function refreshMenu(){refreshBadges();$('#mName').textContent=SAVE.name;const si=curSeason();$('#bShop').innerHTML=si?`🛒 Loja <span class="stag">${si.se.ic}</span>`:'🛒 Loja';$('#mBest').textContent=SAVE.bestD[SAVE.diff];$('#mBan').textContent=SAVE.bananas;
 const el=$('#segDiff');el.innerHTML='';for(const id of DIFF_IDS){const d=DIFF[id],b=document.createElement('button');const lk=isLocked(id);b.innerHTML=lk?`🔒 ${d.nome}<small>${Math.floor(SAVE.bestD.dificil||0)}/${UNLOCK_M} m no Difícil</small>`:`${d.nome}<small>${d.desc}</small>`;if(lk)b.style.opacity=.6;
  if(id===SAVE.diff){b.classList.add('on');b.style.background=d.cor;}b.onclick=()=>{au();if(lk){toast(`🔒 Alcance ${UNLOCK_M} m no Difícil para desbloquear o Impossível!`);SFX.bump();return;}SAVE.diff=id;persist();SFX.rel();refreshMenu();};el.appendChild(b);}}
async function startGame(mode){au();if(typeof mode!=='string')mode='normal';
 if(isTouch&&!STANDALONE){try{const el=document.documentElement;if(!document.fullscreenElement&&el.requestFullscreen)await el.requestFullscreen({navigationUI:'hide'});}catch(e){}try{await screen.orientation.lock('landscape')}catch(e){}}
 newRun(mode);input.ptr.clear();refreshInput();state='play';show(null);mus.next=0;}
function doPause(){if(state!=='play')return;state='pause';show('pause');}
function doResume(){state='play';input.ptr.clear();refreshInput();last=performance.now();show(null);}
function goMenu(){state='menu';refreshMenu();show('menu');}
$('#bPlay').onclick=()=>startGame('normal');$('#bAgain').onclick=()=>startGame(G?G.mode:'normal');$('#bDaily').onclick=()=>startGame('daily');
$('#bTutMode').onclick=()=>startGame('tutorial');$('#bPractice').onclick=openPractice;$('#bStartPr').onclick=()=>startGame('practice');
$('#bChest').onclick=openChestUI;$('#bOpenChest').onclick=openChest;$('#chestBox').onclick=openChest;$('#bShare').onclick=shareRun;
$('#bPause').onclick=e=>{e.stopPropagation();doPause();};$('#bResume').onclick=doResume;
$('#bPMenu').onclick=()=>{if(G&&G.mode==='normal'){SAVE.bestD[G.diff]=Math.max(SAVE.bestD[G.diff],Math.floor(G.dist));SAVE.best=Math.max(SAVE.best,Math.floor(G.dist));}persist();goMenu();};$('#bOMenu').onclick=goMenu;
$('#bShop').onclick=()=>openShop('menu');$('#bOShop').onclick=()=>openShop('over');
$('#bMis').onclick=openMeta;
$('#bSet').onclick=()=>{uiFrom='menu';renderSet();show('settings');};$('#bPSet').onclick=()=>{uiFrom='pause';renderSet();show('settings');};
document.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{if(b.dataset.back){renderSet();show(b.dataset.back);return;}if(uiFrom==='menu')goMenu();else{refreshMenu();show(uiFrom);if(uiFrom==='over'){$('#bRevive').disabled=SAVE.bananas<120;}}});
$('#bRevive').onclick=()=>{if(SAVE.bananas<120||G.revived)return;SAVE.bananas-=120;persist();G.revived=true;G.dead=false;const m=G.m;
 m.x=Math.max(m.x,G.storm+700);m.y=260;m.vx=500;m.vy=0;G.storm=m.x-900;G.rocket=2.5;G.inv=1;G.fx=[];G.proj=[];G.warn=[];G.teth=null;G.combo=0;G.fuel=fuelMax();
 G.ast=G.ast.filter(a=>Math.abs(a.x-m.x)>120||a.type==='rock');state='play';input.ptr.clear();refreshInput();show(null);SFX.pow();};
let shopTab='up',subTab='pelo',tryOn=null;
const TABS=[['up','🚀 Melhorias'],['traje','👕 Trajes'],['jet','🎒 Jetpacks'],['look','🐵 Visual']],SUBS=['pelo','hat','glass','trail'];
function openShop(from){uiFrom=from;tryOn=null;if(curSeason())shopTab='season';else if(shopTab==='season')shopTab='up';renderShop();show('shop');}
function shopTabs(){const si=curSeason(),t=[...TABS];if(si)t.unshift(['season',`${si.se.ic} ${si.se.nome}`]);return t;}
const pct=v=>(v>0?'+':'')+Math.round(v*100)+'%';
function chips(cat,it){const c=[];
 if(it.flut)c.push(`🪶 Flutua ${pct(it.flut)}`);if(it.thr&&it.thr!==1)c.push(`🔥 Força ${pct(it.thr-1)}`);if(it.cons&&it.cons!==1)c.push(`⛽ Gasto ${pct(it.cons-1)}`);
 if(it.cap&&cat==='jet'&&it.cap!==1)c.push(`🛢️ Tanque ${pct(it.cap-1)}`);if(it.cap&&cat==='traje')c.push(`🛢️ Tanque ${pct(it.cap)}`);if(it.regen&&it.regen!==1)c.push(`🔋 Recarga ${pct(it.regen-1)}`);
 if(it.mag)c.push(`🧲 Ímã ${pct(it.mag)}`);if(it.ban)c.push(`🍌 Bônus ${pct(it.ban)}`);if(it.shield)c.push('🛡️ Escudo inicial');
 if(!c.length&&(cat==='traje'||cat==='jet'))c.push('Padrão');return c.map(x=>`<span>${x}</span>`).join('');}
function renderShop(){$('#sBan').textContent=SAVE.bananas;
 const tb=$('#shopTabs');tb.innerHTML='';if(shopTab==='season'&&!curSeason())shopTab='up';for(const [id,lb] of shopTabs()){const b=document.createElement('button');b.textContent=lb;b.className=(id===shopTab?'on':'')+(id==='season'?' seasonTab':'');b.onclick=()=>{shopTab=id;tryOn=null;renderShop();};tb.appendChild(b);}
 const sb=$('#subTabs');sb.innerHTML='';sb.style.display=shopTab==='look'?'':'none';
 if(shopTab==='look')for(const id of SUBS){const b=document.createElement('button');b.textContent=CATS[id].ic+' '+CATS[id].nome;if(id===subTab)b.className='on';b.onclick=()=>{subTab=id;tryOn=null;renderShop();};sb.appendChild(b);}
 const g=$('#shopGrid');g.innerHTML='';
 if(shopTab==='up'){for(const u of UPG){const l=SAVE.up[u.id],max=l>=u.max,c=u.cost(l);const d=document.createElement('div');d.className='card';
  d.innerHTML=`<div class="ic">${u.ic}</div><div class="nm">${u.nome}</div><div class="ds">${u.desc}</div><div class="lv">${Array.from({length:u.max},(_,i)=>`<i class="${i<l?'on':''}"></i>`).join('')}</div>`;
  const b=document.createElement('button');b.className=max?'ghost':'green';b.textContent=max?'MÁXIMO ✔':`🍌 ${c}`;b.disabled=max||SAVE.bananas<c;
  b.onclick=e=>{e.stopPropagation();if(SAVE.bananas<c||max)return;SAVE.bananas-=c;SAVE.up[u.id]++;persist();au();SFX.buy();renderShop();};d.appendChild(b);g.appendChild(d);}
  renderPvInfo();return;}
 if(shopTab==='season'){const si=curSeason();
  g.insertAdjacentHTML('beforeend',`<div class="seasonHead">${si.se.ic} Edição especial de ${si.se.nome}<small>${si.active?`Itens à venda só até ${si.end?si.end.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}):'o fim da temporada'} · faltam ${si.days} dia(s)! Depois, só fica com quem comprou.`:`Chega em ${si.days} dia(s)! Já dá para provar os itens 👀`}</small></div>`);
  for(const [c,it] of seasonItems(si.se.id))itemCard(c,it,g,si.active?null:`🔒 em ${si.days} dia(s)`,true);
  renderPvInfo();return;}
 const cat=shopTab==='look'?subTab:shopTab;
 for(const it of CATS[cat].items){if(it.season&&!SAVE.own[cat].includes(it.id))continue;itemCard(cat,it,g,null,false);}
 renderPvInfo();}
const CATNAME={traje:'👕 Traje',jet:'🎒 Jetpack',pelo:'🐵 Pelagem',hat:'🎩 Chapéu',glass:'🕶️ Óculos',trail:'✨ Rastro'};
function itemCard(cat,it,g,lock,showCat){const own=SAVE.own[cat].includes(it.id),eq=SAVE.eq[cat]===it.id,tr=tryOn&&tryOn.cat===cat&&tryOn.id===it.id;
  const d=document.createElement('div');d.className='card'+(eq?' sel':'')+(tr?' try':'')+(it.season?' seasonal':'');
  if(showCat)d.insertAdjacentHTML('beforeend',`<div class="ctag">${CATNAME[cat]}</div>`);
  if(cat==='trail'){d.insertAdjacentHTML('beforeend',`<div class="ic" style="text-align:center;font-size:38px">${it.ic}</div>`);}
  else{const pc=document.createElement('canvas');pc.className='mini';pc.width=168;pc.height=126;d.appendChild(pc);miniPreview(pc,cat,it.id);}
  d.insertAdjacentHTML('beforeend',`<div class="nm">${it.nome}</div>${(cat==='traje'||cat==='jet')?`<div class="chips">${chips(cat,it)}</div>`:''}`);
  const b=document.createElement('button');
  if(eq){b.className='ghost';b.textContent='Usando ✔';b.disabled=true;}
  else if(own){b.textContent='Usar';b.onclick=e=>{e.stopPropagation();SAVE.eq[cat]=it.id;tryOn=null;persist();au();SFX.rel();renderShop();checkAch();};}
  else if(lock){b.className='ghost';b.textContent=lock;b.disabled=true;}
  else{b.className='gold';b.textContent=`🍌 ${it.preco}`;b.disabled=SAVE.bananas<it.preco;
   b.onclick=e=>{e.stopPropagation();if(SAVE.bananas<it.preco)return;SAVE.bananas-=it.preco;SAVE.own[cat].push(it.id);SAVE.eq[cat]=it.id;tryOn=null;persist();au();SFX.buy();toast(`✨ ${it.nome} comprado!`);renderShop();checkAch();};}
  d.onclick=()=>{tryOn=(tr||eq)?null:{cat,id:it.id};au();renderShop();};
  d.appendChild(b);g.appendChild(d);}
function overObj(){return tryOn?{[tryOn.cat]:tryOn.id}:{};}
function renderPvInfo(){const o=overObj();const it=tryOn?findItem(tryOn.cat,tryOn.id):null;
 $('#pvName').innerHTML=it?`👀 Provando: ${it.nome}<br><small style="opacity:.7;font-weight:600">toque de novo para tirar</small>`:`🐵 ${esc(SAVE.name)}`;
 const a=stats(),b=stats(o);
 const rows=[['🪶 Flutuação',b.flut/.3,a.flut/.3,b.flut,v=>pct(v),b.flut-a.flut],
  ['🔥 Força',(b.thr-.8)/.6,(a.thr-.8)/.6,b.thr-1,v=>pct(v),b.thr-a.thr],
  ['⛽ Economia',(1/b.cons-.8)/1.2,(1/a.cons-.8)/1.2,1/b.cons-1,v=>pct(v),a.cons-b.cons],
  ['🛢️ Tanque',(b.cap-.9)/.7,(a.cap-.9)/.7,b.cap-1,v=>pct(v),b.cap-a.cap]];
 $('#pvStats').innerHTML=rows.map(r=>`<div class="st"><span>${r[0]}</span><div class="bar"><i style="width:${clamp(r[1],0.03,1)*100}%"></i>${tryOn?`<u style="left:${clamp(r[2],0,1)*100}%"></u>`:''}</div><b class="${r[5]>.001?'up':r[5]<-.001?'dn':''}">${r[4](r[3])}</b></div>`).join('');}
function miniPreview(pc,cat,id){const c2=pc.getContext('2d');const o=ctx;ctx=c2;try{
 if(cat==='hat'||cat==='glass'){c2.setTransform(2.6,0,0,2.6,0,0);c2.translate(32,cat==='hat'?40:30);}
 else if(cat==='jet'){c2.setTransform(2.5,0,0,2.5,0,0);c2.translate(42,27);}
 else{c2.setTransform(2.3,0,0,2.3,0,0);c2.translate(37,29);}
 drawMonkey(0,0,0,look({[cat]:id}),{jet:cat==='jet'?1:0});}finally{ctx=o;}}
function drawShopPreview(){const pc=$('#pv'),c2=pc.getContext('2d');c2.setTransform(1,0,0,1,0,0);c2.clearRect(0,0,320,260);
 const L=look(overObj());const tr=(tryOn&&tryOn.cat==='trail')?tryOn.id:SAVE.eq.trail;const o=ctx;ctx=c2;try{
  c2.setTransform(1,0,0,1,0,0);const bob=Math.sin(T*2)*6;
  if(tr!=='nenhum'){for(let i=0;i<7;i++){const x=150-30-i*22-((T*60)%22),y=150+bob+Math.sin(i+T*4)*6;c2.globalAlpha=1-i/7;
   if(tr==='bananas'){c2.save();c2.translate(x,y);c2.scale(1.4,1.4);drawBanana(0,0,T*3+i,1);c2.restore();}
   else if(tr==='bolhas'){c2.strokeStyle='#9fe8ff';c2.lineWidth=2;c2.beginPath();c2.arc(x,y,4+i%3*2,0,7);c2.stroke();}
   else if(tr==='fogo'||tr==='arcoiris'){c2.fillStyle=tr==='fogo'?(i%2?'#ff5a00':'#ffb300'):`hsl(${(i*50+T*200)%360},90%,60%)`;c2.beginPath();c2.arc(x,y,9-i,0,7);c2.fill();}
   else if(tr==='presentes'){c2.fillStyle=['#e53935','#43a047','#1e88e5','#fdd835'][i%4];c2.fillRect(x-6,y-6,12,12);c2.fillStyle='#fff';c2.fillRect(x-1,y-6,2,12);c2.fillRect(x-6,y-1,12,2);}
   else{c2.font='18px system-ui';c2.textAlign='center';c2.textBaseline='middle';c2.fillStyle=tr==='estrelas'?'#ffd93b':tr==='neve'?'#e0f7ff':'#ff4d8d';c2.fillText(tr==='estrelas'?'★':tr==='neve'?'❄':'♥',x,y);}}c2.globalAlpha=1;}
  c2.translate(170,150+bob);c2.scale(3.4,3.4);drawMonkey(0,0,Math.sin(T*1.5)*.12,L,{jet:Math.sin(T*2.5)>-.3?1:0});
 }finally{ctx=o;c2.setTransform(1,0,0,1,0,0);}}
/* ---------- METAS (missões, conquistas, estatísticas) ---------- */
let metaTab='mis';
function openMeta(){uiFrom='menu';metaTab='mis';renderMeta();show('missions');}
const shortReason=r=>({'A tempestade solar te alcançou!':'☀️ Tempestade','Você caiu no abismo espacial!':'🕳️ Abismo','Você bateu num asteroide espinhoso!':'🔴 Espinhos','O buraco negro te engoliu!':'⚫ Buraco negro','Você bateu num satélite!':'🛰️ Satélite','Um cometa te atingiu!':'☄️ Cometa','Um meteoro caiu em você!':'☄️ Meteoro','A tinta do polvo te pegou!':'🐙 Polvo','Você trombou no polvo!':'🐙 Polvo'})[r]||r;
function renderMeta(){$('#miBan').textContent=SAVE.bananas;const tb=$('#metaTabs');tb.innerHTML='';const got=ACH.filter(a=>SAVE.ach[a.id]).length;
 for(const [id,lb] of [['mis','🎯 Missões'],['ach',`🏅 Conquistas ${got}/${ACH.length}`],['st','📊 Estatísticas']]){const b=document.createElement('button');b.textContent=lb;if(id===metaTab)b.className='on';b.onclick=()=>{metaTab=id;renderMeta();};tb.appendChild(b);}
 const l=$('#misList');l.innerHTML='';
 if(metaTab==='mis'){l.insertAdjacentHTML('beforeend','<div class="note" style="margin:0 auto 8px">Complete durante uma partida. Cada missão cumprida sobe de nível!</div>');
  for(const m of MIS){const lv=SAVE.mlv[m.id];l.insertAdjacentHTML('beforeend',`<div class="mis"><div class="ic">${m.ic}</div><div class="tx">${m.f(m.t(lv))}<small>Nível ${lv+1}</small></div><span class="pill">+${misReward(lv)} 🍌</span></div>`);}}
 else if(metaTab==='ach'){for(const a of ACH){const ok=!!SAVE.ach[a.id];l.insertAdjacentHTML('beforeend',`<div class="mis${ok?'':' lock'}"><div class="ic">${ok?a.ic:'🔒'}</div><div class="tx">${a.nome}<small>${a.desc}</small></div><span class="pill">${ok?'✔':'+'+a.rw+' 🍌'}</span></div>`);}}
 else{const L=SAVE.life;const rows=[['🎮 Partidas',L.runs],['📏 Maior distância',L.bestAny+' m'],['🍌 Bananas coletadas',L.ban],['⭐ Perfeitos',L.perf],['🤸 Cambalhotas',L.flips],['🔥 Maior combo',L.maxCombo],['🐙 Chefes derrotados',L.bosses],['☄️ Chuvas sobrevividas',L.showers],['🌀 Portais usados',L.portals],['🟢 Molas usadas',L.springs],['📅 Dias seguidos (baú)',SAVE.daily.streak],['🏁 Desafios cumpridos',L.dailyDone]];
  let h='<div class="stgrid">'+rows.map(r=>`<div><span>${r[0]}</span><b>${r[1]}</b></div>`).join('')+'</div>';
  h+='<h3 class="sth">Por nível <small>(ajuda a calibrar a dificuldade)</small></h3><table class="sttab"><tr><th>Nível</th><th>Partidas</th><th>Recorde</th><th>Média</th><th>Mais perde para</th></tr>';
  for(const id of DIFF_IDS){const v=L.lv[id]||{runs:0,sum:0,deaths:{}};const top=Object.entries(v.deaths||{}).sort((a,b)=>b[1]-a[1])[0];
   h+=`<tr><td>${DIFF[id].nome}</td><td>${v.runs}</td><td>${SAVE.bestD[id]} m</td><td>${v.runs?Math.round(v.sum/v.runs):0} m</td><td>${top?`${shortReason(top[0])} (${Math.round(top[1]/v.runs*100)}%)`:'—'}</td></tr>`;}
  l.innerHTML=h+'</table>';}}
/* ---------- BAÚ DIÁRIO ---------- */
const CHEST=[40,60,80,100,130,160,250];
const chestAvail=()=>SAVE.daily.last!==today();
const nextStreak=()=>SAVE.daily.last===yesterday()?SAVE.daily.streak+1:1;
function openChestUI(){uiFrom='menu';renderChest(false);show('chest');}
function renderChest(opened,rw,extra){const av=chestAvail()&&!opened,s=av?nextStreak():SAVE.daily.streak,di=((s-1)%7+7)%7;
 $('#chestDays').innerHTML=CHEST.map((v,i)=>`<div class="day${i<di||(!av&&i===di)?' done':''}${i===di&&av?' now':''}"><b>Dia ${i+1}</b><span>${i===6?'🎁 item':v+'🍌'}</span></div>`).join('');
 const box=$('#chestBox');box.textContent=opened?'🎉':'🎁';box.classList.toggle('shake',av);
 $('#chestMsg').innerHTML=opened?`+${rw} 🍌${extra?`<br>Item grátis: <b>${extra}</b>!`:''}<br><small>🔥 ${SAVE.daily.streak} dia(s) seguido(s)</small>`
  :(av?`Toque no baú para abrir!<br><small>🔥 Sequência: ${s} dia(s) — não quebre a corrente!</small>`:`Volte amanhã para o próximo baú!<br><small>🔥 Sequência: ${SAVE.daily.streak} dia(s)</small>`);
 $('#bOpenChest').style.display=av?'':'none';}
function openChest(){if(!chestAvail())return;au();const s=nextStreak(),di=(s-1)%7;let rw=CHEST[di],extra='';
 if(di===6){const pool=[];for(const c of['hat','glass','trail','pelo'])for(const it of CATS[c].items)if(!SAVE.own[c].includes(it.id)&&it.preco<=600&&!it.season)pool.push([c,it]);
  if(pool.length){const [c,it]=pool[Math.floor(Math.random()*pool.length)];SAVE.own[c].push(it.id);extra=`${CATS[c].ic} ${it.nome}`;}else rw+=300;}
 SAVE.daily={last:today(),streak:s};SAVE.bananas+=rw;persist();SFX.chest();vib([40,30,80]);renderChest(true,rw,extra);refreshMenu();checkAch();}
/* ---------- COMPARTILHAR ---------- */
async function shareRun(){if(!G)return;const d=Math.floor(G.dist),url=location.href.split('#')[0].split('?')[0];
 const nm=SAVE.name;const txt=G.mode==='daily'?`📅 Desafio do Dia ${today().split('-').reverse().join('/')}: ${nm} voou ${d} m no StarChimp! 🐵 Consegue superar?`:`🐵 ${nm} voou ${d} m no StarChimp (nível ${Dz().nome})! Consegue superar? 🚀`;
 try{if(navigator.share){await navigator.share({title:'StarChimp',text:txt,url});return;}}catch(e){if(e&&e.name==='AbortError')return;}
 try{await navigator.clipboard.writeText(txt+' '+url);toast('📋 Copiado! Cole no WhatsApp para desafiar');}catch(e){toast(txt);}}
/* ---------- BACKUP ---------- */
const bkCode=()=>'ME1:'+btoa(unescape(encodeURIComponent(JSON.stringify(SAVE))));
let bkArm=false;
function openBackup(){$('#bkText').value='';bkArm=false;$('#bBkLoad').textContent='📥 Restaurar código colado';show('backup');}
/* ---------- TREINO ---------- */
function openPractice(){uiFrom='menu';renderPractice();show('practice');}
function segP(id,opts,val,cb){const el=$(id);el.innerHTML='';for(const [v,lb] of opts){const b=document.createElement('button');b.innerHTML=lb;if(String(v)===String(val))b.className='on';b.onclick=()=>{au();cb(v);persist();renderPractice();};el.appendChild(b);}}
function renderPractice(){const P=SAVE.pr;
 segP('#segPW',WORLDS.map((w,i)=>[i,`${w.ic} ${w.nome.split(' ').slice(-1)[0]}`]),P.w,v=>P.w=+v);
 segP('#segPD',DIFF_IDS.filter(id=>!isLocked(id)).map(id=>[id,DIFF[id].nome]),isLocked(P.d)?'facil':P.d,v=>P.d=v);
 segP('#segPS',[[0,'Normal'],[1,'🐢 Câmera lenta']],P.slow,v=>P.slow=+v);
 segP('#segPE',[['','Nenhum'],['met','☄️ Meteoros'],['boss','🐙 Chefe']],P.ev,v=>P.ev=v);}
function seg(id,val,cb){const el=$(id);el.querySelectorAll('button').forEach(b=>{b.classList.toggle('on',b.dataset.v===String(val));b.onclick=()=>{cb(b.dataset.v);persist();renderSet();};});}
let resetArm=false;
function renderSet(){const s=SAVE.set;
 seg('#segSide',s.swap?'1':'0',v=>s.swap=v==='1');
 const ni=$('#nameIn');if(document.activeElement!==ni)ni.value=SAVE.name;
 seg('#segLite',s.lite?'1':'0',v=>{s.lite=v==='1';s.liteAsked=true;resize();});
 seg('#segSfx',s.sfx?'1':'0',v=>s.sfx=v==='1');seg('#segMus',s.music?'1':'0',v=>s.music=v==='1');seg('#segVib',s.vib?'1':'0',v=>s.vib=v==='1');

 $('#ctrlHelp').innerHTML=s.swap?'Esquerda = 🤚 corda · Direita = 🔥 jetpack (canhotos)':'Esquerda = 🔥 jetpack · Direita = 🤚 corda';
 $('#bReset').textContent=resetArm?'Toque de novo p/ confirmar':'Apagar';}


$('#bReset').onclick=()=>{if(!resetArm){resetArm=true;renderSet();setTimeout(()=>{resetArm=false;renderSet();},3000);return;}const keep=SAVE.set;SAVE=clone(DEF);SAVE.set=keep;persist();resetArm=false;renderSet();toast('Progresso apagado');};
const saveName=()=>{const v=$('#nameIn').value.replace(/[<>]/g,'').trim().slice(0,14);SAVE.name=v||'Chimp';$('#nameIn').value=SAVE.name;persist();refreshMenu();};
$('#nameIn').addEventListener('change',saveName);$('#nameIn').addEventListener('blur',saveName);$('#nameIn').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('#nameIn').blur();toast(`🐵 Olá, ${esc(SAVE.name)}!`);}});
$('#bTut').onclick=()=>startGame('tutorial');
$('#bBackup').onclick=openBackup;
$('#bBkCopy').onclick=async()=>{const c=bkCode();$('#bkText').value=c;try{await navigator.clipboard.writeText(c);toast('📋 Código copiado!<br>Guarde no WhatsApp ou e-mail');}catch(e){$('#bkText').select();toast('Selecione o texto e copie');}};
$('#bBkLoad').onclick=()=>{const v=$('#bkText').value.trim();let o=null;if(v.startsWith('ME1:')){try{o=JSON.parse(decodeURIComponent(escape(atob(v.slice(4)))));}catch(e){o=null;}}
 if(!o||typeof o.bananas!=='number'){toast('❌ Código inválido. Cole o código completo (começa com ME1:)');return;}
 if(!bkArm){bkArm=true;$('#bBkLoad').textContent='⚠️ Toque de novo: substituir o progresso atual';setTimeout(()=>{bkArm=false;$('#bBkLoad').textContent='📥 Restaurar código colado';},4000);return;}
 SAVE=merge(clone(DEF),o);persist();bkArm=false;$('#bBkLoad').textContent='📥 Restaurar código colado';toast('✅ Progresso restaurado!');refreshMenu();};

/* ---------- RESIZE / ORIENT ---------- */
function resize(){DPR=SAVE.set.lite?1:Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);S=H/VH;VW=W/S;
 bgGrad=ctx.createLinearGradient(0,0,0,H);bgGrad.addColorStop(0,'#0b0820');bgGrad.addColorStop(.6,'#1d0f45');bgGrad.addColorStop(1,'#3a1250');
 const port=isTouch&&H>W;$('#rot').style.display=port?'flex':'none';if(port&&state==='play')doPause();}
addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,200));
document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='play')doPause();});
/* ---------- PWA ---------- */
const STANDALONE=matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;
let deferredPrompt=null,updWorker=null;
function updInstallBtn(){$('#bInstall').style.display=(!STANDALONE&&(deferredPrompt||isIOS))?'':'none';}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;updInstallBtn();});
addEventListener('appinstalled',()=>{deferredPrompt=null;$('#bInstall').style.display='none';toast('🎉 Jogo instalado!');});
$('#bInstall').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();try{await deferredPrompt.userChoice}catch(e){}deferredPrompt=null;updInstallBtn();}else if(isIOS){uiFrom='menu';show('iosHelp');}};
function updBanner(){$('#upd').classList.toggle('on',!!updWorker&&state!=='play'&&state!=='dying');}
$('#upd').onclick=()=>{if(!updWorker)return;persist();$('#upd').textContent='⏳ Atualizando...';updWorker.postMessage('SKIP_WAITING');};
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost')){
 try{
  let reloading=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading||!updWorker)return;reloading=true;location.reload();});
  navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.version)$('#ver').textContent='v'+e.data.version;});
  navigator.serviceWorker.register('./sw.js').then(reg=>{
   const watch=w=>{if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller){updWorker=w;updBanner();}});};
   if(reg.waiting&&navigator.serviceWorker.controller){updWorker=reg.waiting;updBanner();}
   watch(reg.installing);reg.addEventListener('updatefound',()=>watch(reg.installing));
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)reg.update().catch(()=>{});});
   setInterval(()=>reg.update().catch(()=>{}),30*60*1000);
  }).catch(()=>{});
  navigator.serviceWorker.ready.then(r=>{if(r.active)r.active.postMessage('GET_VERSION');}).catch(()=>{});
 }catch(e){}
}
updInstallBtn();
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});}catch(e){}
resize();refreshMenu();requestAnimationFrame(loop);setTimeout(()=>{checkAch();refreshMenu();},1200);
