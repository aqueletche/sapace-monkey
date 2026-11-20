'use strict';
// StarChimp — motor do jogo: áudio, física, mundos, eventos e desenho
/* ---------- AUDIO ---------- */
let AC=null,noiseBuf=null;
function au(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();const n=AC.sampleRate*.5;noiseBuf=AC.createBuffer(1,n,AC.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;}catch(e){}}if(AC&&AC.state==='suspended')AC.resume().catch(()=>{});}
function note(f1,f2,dur,type='sine',vol=.12,at=0,isMusic=false){if(!AC||(isMusic?!SAVE.set.music:!SAVE.set.sfx))return;const t=at||AC.currentTime;const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);if(f2!==f1)o.frequency.exponentialRampToValueAtTime(f2,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+dur+.02);}
function noise(dur,vol=.3,freq=900){if(!AC||!SAVE.set.sfx)return;const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf;f.type='lowpass';f.frequency.setValueAtTime(freq,t);f.frequency.exponentialRampToValueAtTime(60,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f).connect(g).connect(AC.destination);s.start(t);s.stop(t+dur);}
const SFX={
 grab:()=>note(280,900,.11,'square',.05),
 rel:()=>note(600,300,.08,'triangle',.06),
 ban:(c)=>note(880*Math.pow(2,Math.min(c,12)/24),1300*Math.pow(2,Math.min(c,12)/24),.08,'triangle',.07),
 perf:()=>{[0,4,7,12].forEach((n,i)=>note(523*Math.pow(2,n/12),523*Math.pow(2,n/12),.12,'square',.04,AC&&AC.currentTime+i*.06))},
 pow:()=>{[0,7,12,19].forEach((n,i)=>note(392*Math.pow(2,n/12),392*Math.pow(2,n/12)*1.01,.14,'sine',.09,AC&&AC.currentTime+i*.07))},
 bump:()=>noise(.12,.18,500),
 shield:()=>{note(900,200,.3,'sawtooth',.06);noise(.2,.2,2000)},
 die:()=>{note(400,50,.7,'sawtooth',.1);noise(.6,.35,1200)},
 mis:()=>{[0,4,7,12,16].forEach((n,i)=>note(659*Math.pow(2,n/12),659*Math.pow(2,n/12),.15,'triangle',.08,AC&&AC.currentTime+i*.08))},
 buy:()=>{note(700,1400,.15,'square',.05)},
 jet:()=>noise(.06,.05,1800),
 boing:()=>note(180,720,.25,'sine',.12),
 portal:()=>{note(300,1200,.25,'sine',.08);note(600,2400,.2,'triangle',.04)},
 flip:()=>note(500,1000,.12,'triangle',.07),
 alarm:()=>{[0,1,2].forEach(i=>note(880,660,.18,'square',.05,AC&&AC.currentTime+i*.22))},
 ink:()=>noise(.15,.12,700),
 bossHit:()=>{note(200,80,.3,'sawtooth',.1);noise(.25,.3,1500)},
 chest:()=>{[0,4,7,12,16,19].forEach((n,i)=>note(523*Math.pow(2,n/12),523*Math.pow(2,n/12),.18,'triangle',.08,AC&&AC.currentTime+i*.07))}};
const mus={next:0,step:0};
const SCALE=[0,3,5,7,10,12,15,17,19];
function musicTick(){if(!AC||!SAVE.set.music||state!=='play'||AC.state!=='running')return;const t=AC.currentTime;if(mus.next<t)mus.next=t+.05;
 const Wm=WORLDS[G?G.wi:0].mus,boss=!!(G&&G.ev&&G.ev.k==='boss'),base=Wm.base*(boss?.84:1),stepT=boss?.1:Wm.tempo,k=base/330;
 while(mus.next<t+.2){const s=mus.step,bar=Math.floor(s/16)%4,roots=Wm.roots[bar];
  if(s%4===0)note(110*k*Math.pow(2,roots/12),110*k*Math.pow(2,roots/12),.25,'triangle',.06,mus.next,true);
  if(boss&&s%2===1)note(55*Math.pow(2,roots/12),55*Math.pow(2,roots/12),.08,'square',.03,mus.next,true);
  if(s%2===0){const n=SCALE[(s*5+bar*3)%SCALE.length];const f=base*Math.pow(2,(n+roots)/12);note(f,f,.13,Wm.wave,Wm.wave==='square'?.014:.028,mus.next,true);}
  if(s%8===4)note(2400,1800,.03,'square',.01,mus.next,true);
  mus.step++;mus.next+=stepT;}}
const vib=ms=>{if(SAVE.set.vib&&navigator.vibrate)try{navigator.vibrate(ms)}catch(e){}};

/* ---------- INPUT ---------- */
const input={grab:false,jet:false,ptr:new Map(),keys:{}};
function refreshInput(){let g=false,j=false;for(const z of input.ptr.values()){if(z==='g')g=true;else j=true;}
 const k=input.keys;input.grab=g||!!(k.Space||k.ArrowRight||k.KeyD||k.KeyX);input.jet=j||!!(k.ArrowUp||k.KeyW);input.down=!!(k.ArrowDown||k.KeyS);}
cv.addEventListener('pointerdown',e=>{au();if(state!=='play')return;e.preventDefault();const left=e.clientX<W*.45;const zone=(left!==!!SAVE.set.swap)?'j':'g';input.ptr.set(e.pointerId,zone);refreshInput();});
const ptrEnd=e=>{input.ptr.delete(e.pointerId);refreshInput();};
addEventListener('pointerup',ptrEnd);addEventListener('pointercancel',ptrEnd);
addEventListener('keydown',e=>{const tg=e.target&&e.target.tagName;if(tg==='INPUT'||tg==='TEXTAREA')return;au();input.keys[e.code]=true;refreshInput();if(e.code==='Space')e.preventDefault();if(e.code==='Escape'||e.code==='KeyP'){if(state==='play')doPause();else if(state==='pause')doResume();}});
addEventListener('keyup',e=>{input.keys[e.code]=false;refreshInput();});
function thrustVal(){if(input.jet)return 1;if(input.down)return -1;return 0;}

/* ---------- STATE ---------- */
let state='menu',G=null,menuCam=0,T=0,uiFrom='menu';
const LF=()=>(G&&G.pr)?(G.fakeLife||(G.fakeLife={})):SAVE.life;
function giveBan(v){G.ban+=v;if(!G.pr)SAVE.bananas+=v;}
const R=()=>(G&&G.rng?G.rng():Math.random()),RR=(a,b)=>a+R()*(b-a),LITE=()=>!!SAVE.set.lite;
function mkAst(x,y,r,type,o={}){const a={x,y,bx:x,by:y,r,type,rot:R()*6.28,rs:(R()-.5)*.8,osc:o.osc||0,ph:R()*6.28,spd:o.spd||1,cr:[],pts:[],tone:Math.floor(R()*3),dead:false,fragile:!!o.fragile,wi:worldAt(x/10).i};
 if(type==='rock'){const n=3+Math.floor(r/10);for(let i=0;i<n;i++){const an=R()*6.28,d=R()*r*.55;a.cr.push([Math.cos(an)*d,Math.sin(an)*d,r*(.12+R()*.15)]);}for(let i=0;i<12;i++)a.pts.push(r*(.88+R()*.16));
  if(a.fragile){a.cracks=[];for(let i=0;i<4;i++){const an=i*1.57+RR(-.4,.4);a.cracks.push([an,an+RR(-.5,.5),RR(.55,.95)]);}}}
 return a;}
function newRun(mode='normal'){const daily=mode==='daily',prac=mode==='practice'||mode==='tutorial',diff=daily?'medio':mode==='practice'?(isLocked(SAVE.pr.d)?'facil':SAVE.pr.d):mode==='tutorial'?'facil':SAVE.diff;
 G={t:0,m:{x:40,y:330,vx:430,vy:-420,r:15,ang:0},teth:null,tethT:0,ast:[],items:[],fx:[],txt:[],proj:[],warn:[],camX:-200,genX:360,genY:190,
  mode,diff,rng:daily?rng(daySeed()*7919+13):Math.random,chalTarget:chalTarget(),chalDone:false,
  storm:-800,stormV:85,dist:0,ban:0,fuel:0,shield:0,snapT:0,magnet:0,rocket:0,inv:0,combo:0,maxCombo:0,lastA:null,freeT:0,portalCd:0,
  perf:0,pw:0,shake:0,flash:0,dead:false,revived:false,reason:'',mdone:{},jetSnd:0,target:null,
  wi:0,wPrev:0,lap:0,wT:1,zoom:1,vw:VW,sc:S,oy:0,ev:null,evN:0,nextEv:1000,cometT:8,spin:0,flipAcc:0,flips:0,flipChain:0,maxFlipChain:0,usedJet:false,
  pr:mode==='practice'?Object.assign({},SAVE.pr):mode==='tutorial'?{w:0,slow:0,ev:''}:null,falls:0,
  prevBest:prac?1e9:daily?(SAVE.chal.date===today()?SAVE.chal.best:0):SAVE.bestD[diff],recShown:false,happy:0,scared:false,slow:0,banner:null,newAch:[],achT:1,
  tut:mode==='tutorial'||(mode==='normal'&&!SAVE.tut)?{s:0,t:0}:null,tutFreeze:false,fpsT:0,fpsN:0,fpsDone:false};
 if(G.pr&&G.pr.w>0){const off=WSTART[G.pr.w]*10;G.m.x+=off;G.camX+=off;G.genX+=off;G.storm+=off;}
 if(G.pr)G.nextEv=G.pr.ev?(G.m.x/10+60):1e9;
 G.st=stats();G.fuel=fuelMax();G.shield=(SAVE.up.shield||Dz().shield||G.st.shield)?1:0;G.ast.push(mkAst(G.genX,190,34,'rock'));gen();
 if(mode==='practice')banner('🧪 MODO TREINO','Aqui você não perde: treine à vontade!','#39ff88');
 if(daily)banner('📅 DESAFIO DO DIA',`Chegue a ${G.chalTarget} m · a fase é a mesma para todos hoje!`,'#7fd3ff');
}
function overlaps(x,y,r){for(const a of G.ast)if(Math.hypot(a.bx-x,a.by-y)<a.r+r+(a.osc||0)+30)return true;return false;}
function gen(){const need=G.camX+G.vw+500;
 while(G.genX<need){
  const md=G.genX/10,diff=Math.min(1,md/3500),D=Dz(),Wg=WORLDS[worldAt(md).i];
  const gap=185+R()*(110+diff*60)+diff*70+D.gapAdd,px=G.genX,py=G.genY,x=px+gap;
  const y=clamp(py+(R()-.5)*(230+diff*90),105,400),r=21+R()*19-diff*4;
  const osc=(md>D.oscStart&&R()<(.2+diff*.35)*D.osc)?RR(25,45+diff*40):0;
  const frag=md>300&&R()<(.07+diff*.12)*Math.min(D.haz,1.6);
  G.ast.push(mkAst(x,y,r,'rock',{osc,spd:RR(.7,1.6),fragile:frag}));
  const mx=(px+x)/2,my=(py+y)/2,roll=R();
  const pS=(.15+diff*.35)*D.haz,pH=(.05+diff*.1)*D.hole;
  if(md>D.hazStart&&roll<pS){const hy=clamp(my+(R()<.5?-1:1)*RR(60,150),55,480),hr=RR(13,21);
   if(!overlaps(mx,hy,hr))G.ast.push(mkAst(mx+RR(-30,30),hy,hr,'spike',{osc:md>D.oscStart+500&&R()<.45?RR(30,60):0,spd:RR(1,2)}));}
  else if(md>D.holeStart&&roll<pS+pH){const hy=clamp(my+RR(-120,120),120,440);if(!overlaps(mx,hy,40))G.ast.push(mkAst(mx,hy,17,'hole'));}
  else{const r2=R(),pP=.06*(Wg.portal||1),pM=.09,pT=(.05+diff*.08)*D.haz;
   if(md>200&&r2<pP){const iy=clamp(my+RR(-80,80),110,420);if(!overlaps(mx,iy,26)){const ex=x+RR(380,560),ey=RR(120,400),o={type:'portal',x:ex,y:ey,bx:ex,by:ey,r:20,rot:0,rs:0,dead:false,in:false};G.ast.push({type:'portal',x:mx,y:iy,bx:mx,by:iy,r:20,rot:0,rs:0,dead:false,in:true,to:o},o);}}
   else if(md>120&&r2<pP+pM){const sy=clamp(Math.max(py,y)+RR(90,150),330,500);if(!overlaps(mx,sy,20))G.ast.push({type:'spring',x:mx,y:sy,bx:mx,by:sy,r:16,rot:0,rs:0,sq:0,cd:0,dead:false});}
   else if(md>D.holeStart+250&&r2<pP+pM+pT){const sy=clamp(my+RR(-110,110),110,440),arm=RR(42,58);if(!overlaps(mx,sy,arm))G.ast.push({type:'sat',x:mx,y:sy,bx:mx,by:sy,r:arm,arm,rot:R()*6.28,rs:(R()<.5?-1:1)*RR(1,2)*(1+diff*.5),dead:false});}}
  if(R()<.8){const n=4+Math.floor(R()*4),dip=R()<.6?RR(80,130):-RR(60,100);
   for(let i=0;i<n;i++){const t=i/(n-1),bx=px+gap*(.15+t*.7),by=clamp(lerp(py,y,t)+dip*Math.sin(t*Math.PI),40,500);if(!overlaps(bx,by,-18))G.items.push({x:bx,y:by,k:'ban',ph:R()*6});}}
  if(md>40&&R()<.075){const ks=['shield','magnet','rocket','gold','magnet','gold'];G.items.push({x:mx,y:clamp(my-RR(70,120),50,450),k:ks[Math.floor(R()*ks.length)],ph:0});}
  else if(R()<.14){G.items.push({x:mx+RR(-30,30),y:clamp(my+RR(60,120),60,480),k:'fuel',ph:0});}
  G.genX=x;G.genY=y;}
}
function popTxt(x,y,s,c='#fff',sz=22){G.txt.push({x,y,s,c,sz,life:1});}
function burst(x,y,n,c,sp=200,sz=4,life=.6){if(LITE())n=Math.ceil(n/2);for(let i=0;i<n;i++){const a=Math.random()*6.28,v=Math.random()*sp;G.fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:life*(.5+Math.random()*.5),max:life,c,s:sz*(.5+Math.random())});}}
function checkMis(id,val){if(G&&G.pr)return;const m=MIS.find(q=>q.id===id);let lv=SAVE.mlv[id];while(val>=m.t(lv)){const rw=misReward(lv);SAVE.bananas+=rw;toast(`🎯 Missão cumprida! ${m.f(m.t(lv))}<br>+${rw} 🍌`);SFX.mis();lv++;SAVE.mlv[id]=lv;persist();}}
let toastQ=[],toastOn=false;
function toast(h){toastQ.push(h);if(!toastOn)nextToast();}
function nextToast(){const h=toastQ.shift();if(!h){toastOn=false;return}toastOn=true;const el=$('#toast');el.innerHTML=h;el.classList.add('on');setTimeout(()=>{el.classList.remove('on');setTimeout(nextToast,400)},2200);}

function tryGrab(){const m=G.m,R=ropeRange();let best=null,bd=1e9;
 for(const a of G.ast){if(a.type!=='rock')continue;const d=Math.hypot(a.x-m.x,a.y-m.y);if(d>R||a.x<m.x-80)continue;const score=d-(a.x>m.x?40:0);if(score<bd){bd=score;best=a;}}
 return best;}
function grab(a){const m=G.m;const L0=Math.max(Math.hypot(a.x-m.x,a.y-m.y),a.r+m.r+6);G.teth={a,L:L0,Lmin:Math.max(a.r+m.r+22,L0*.72)};G.tethT=0;SFX.grab();
 if(a!==G.lastA){G.combo++;G.maxCombo=Math.max(G.maxCombo,G.combo);LF().maxCombo=Math.max(LF().maxCombo||0,G.combo);checkMis('combo',G.combo);if(G.combo>=3&&G.combo%5===0)popTxt(m.x,m.y-40,`COMBO ${G.combo}!`,'#ff8a00',26);}
 G.lastA=a;G.freeT=0;G.spin=0;G.flipChain=0;G.flipAcc=0;burst(a.x+(m.x-a.x)/G.teth.L*a.r,a.y+(m.y-a.y)/G.teth.L*a.r,6,'#7fd3ff',120,3,.4);}
function release(){const m=G.m,sp=Math.hypot(m.vx,m.vy),a=G.teth.a,dx=m.x-a.x,dy=m.y-a.y,d=Math.hypot(dx,dy)||1;
 G.spin=clamp((dx*m.vy-dy*m.vx)/(d*d),-16,16);G.flipAcc=0;
 if(G.tethT>.3&&sp>520&&m.vx>200&&m.vy<-60){G.perf++;LF().perf++;m.vx*=1.12;m.vy*=1.1;G.flash=.25;G.slow=.28;popTxt(m.x,m.y-30,'PERFEITO!','#ffd93b',30);SFX.perf();addBan(1,m.x,m.y);burst(m.x,m.y,18,'#ffd93b',260,4,.6);checkMis('perf',G.perf);
  if(G.ev&&G.ev.k==='boss'){G.proj.push({k:'missile',x:m.x,y:m.y,vx:m.vx+200,vy:-250,r:8});popTxt(m.x,m.y-58,'🍌 ATAQUE!','#ffd93b',18);}}
 else SFX.rel();
 G.teth=null;}
const mult=()=>1+Math.min(4,Math.floor(G.combo/5));
function addBan(n,x,y){let v=n*mult()*Dz().ban;if(G.st&&G.st.ban&&Math.random()<G.st.ban)v++;G.ban+=v;if(!G.pr){SAVE.bananas+=v;SAVE.life.ban+=v;checkMis('ban',G.ban);}return v;}
function hurt(reason,from){const m=G.m;if(G.inv>0||G.rocket>0)return false;
 if(G.shield>0){G.shield=0;G.inv=1.2;SFX.shield();vib(60);G.shake=10;popTxt(m.x,m.y-30,'ESCUDO!','#7fd3ff',26);burst(m.x,m.y,24,'#7fd3ff',300,4,.7);
  if(from){from.dead=true;burst(from.x,from.y,20,'#ff4466',250,5,.7);}return false;}
 die(reason);return true;}
function die(reason){if(G.dead)return;
 if(G.pr){const m=G.m;G.falls++;burst(m.x,m.y,30,'#ff6b3c',300,5,.8);SFX.bump();vib(40);G.shake=8;m.y=240;m.vy=-150;m.vx=Math.max(420,m.vx);G.teth=null;G.inv=2;G.proj=G.proj.filter(p=>p.k==='missile');G.combo=0;popTxt(m.x,m.y-40,'OPS! De novo! 💪','#39ff88',24);G.lastFall=reason;return;}G.dead=true;G.reason=reason;state='dying';G.teth=null;SFX.die();vib([80,40,120]);G.shake=18;
 burst(G.m.x,G.m.y,40,'#ffd93b',380,5,1);burst(G.m.x,G.m.y,30,'#ff6b3c',300,6,1);burst(G.m.x,G.m.y,20,skin().traje,250,5,1.1);
 setTimeout(endRun,1200);}
function endRun(){if(state!=='dying')return;state='over';const d=Math.floor(G.dist),L=SAVE.life,daily=G.mode==='daily';
 SAVE.runs++;L.runs++;L.bestAny=Math.max(L.bestAny,d);
 if(!daily){const lv=L.lv[G.diff]||(L.lv[G.diff]={runs:0,sum:0,deaths:{}});lv.runs++;lv.sum+=d;lv.deaths[G.reason]=(lv.deaths[G.reason]||0)+1;}
 const rec=d>G.prevBest&&G.prevBest>0||(G.prevBest===0&&d>0&&!daily);let best;
 if(daily){if(SAVE.chal.date!==today())SAVE.chal={date:today(),best:0,done:false};SAVE.chal.best=Math.max(SAVE.chal.best,d);best=SAVE.chal.best;}
 else{SAVE.bestD[G.diff]=Math.max(SAVE.bestD[G.diff],d);best=SAVE.bestD[G.diff];}
 SAVE.best=Math.max(SAVE.best,d);checkAch();persist();
 $('#oDiff').textContent=daily?'📅 Desafio do Dia':'Nível: '+Dz().nome;$('#oDiff').style.background=daily?'#3fa9ff':Dz().cor;
 const Wd=WORLDS[G.wi];$('#oWorld').textContent=`${Wd.ic} ${Wd.nome}`;
 $('#oReason').textContent=`${SAVE.name}: ${G.reason}`;$('#oDist').textContent=d;$('#oBan').textContent=G.ban;$('#oPerf').textContent=G.perf;$('#oFlip').textContent=G.flips;$('#oRec').style.display=(rec&&G.prevBest>0)?'block':'none';
 const ref=daily?G.chalTarget:Math.max(best,1);$('#oBar').style.width=Math.min(100,d/ref*100)+'%';
 $('#oBarTx').textContent=daily?`Meta do dia: ${d}/${G.chalTarget} m`:(d>=best?'🏆 Este é o seu recorde!':`Faltaram ${best-d} m para o recorde (${best} m)`);
 $('#oAch').innerHTML=G.newAch.map(a=>`<span>${a.ic} ${a.nome}</span>`).join('');
 const cost=120;$('#revCost').textContent=cost;const rb=$('#bRevive');rb.style.display=G.revived?'none':'';rb.disabled=SAVE.bananas<cost;show('over');}

function step(dt){
 const m=G.m;G.t+=dt;
 for(const a of G.ast){a.rot+=a.rs*dt;if(a.osc)a.y=a.by+Math.sin(G.t*a.spd+a.ph)*a.osc;}
 if(G.dead){updFx(dt);return;}
 G.inv=Math.max(0,G.inv-dt);G.magnet=Math.max(0,G.magnet-dt);G.portalCd=Math.max(0,G.portalCd-dt);
 const th=thrustVal(),D=Dz();G.jetOn=false;
 if(G.rocket>0){G.rocket-=dt;G.teth=null;m.vx+=(980-m.vx)*4*dt;m.vy+=((280-m.y)*3-m.vy)*4*dt;
  if(Math.random()<.8)G.fx.push({x:m.x-14,y:m.y+8,vx:-300+rand(-60,60),vy:rand(-60,60),life:.4,max:.4,c:Math.random()<.5?'#ff8a00':'#ffd93b',s:rand(3,7)});
  if(G.rocket<=0){G.inv=1;m.vx=650;m.vy=-200;}}
 else{
  m.vy+=D.grav*(G.teth?1:1-G.st.flut)*dt;
  for(const a of G.ast){const dx=a.x-m.x,dy=a.y-m.y,d=Math.hypot(dx,dy)||1;
   if(a.type==='hole'){const R=210;if(d<R){const f=1500*(1-d/R)+200;m.vx+=dx/d*f*dt;m.vy+=dy/d*f*dt;}}
   else if(a.type==='rock'){const R=a.r*3.4;if(d<R&&G.teth?.a!==a){const f=240*(1-d/R);m.vx+=dx/d*f*dt;m.vy+=dy/d*f*dt;}}}
  if(th!==0&&G.fuel>0){m.vy-=th*JET*G.st.thr*dt;m.vx+=60*Math.abs(th)*dt;G.fuel=Math.max(0,G.fuel-dt*Math.abs(th)*G.st.cons);G.jetOn=th;G.usedJet=true;
   if(Math.random()<.7)G.fx.push({x:m.x-10,y:m.y+(th>0?16:-16),vx:rand(-40,40)-m.vx*.1,vy:(th>0?1:-1)*rand(150,300),life:.35,max:.35,c:Math.random()<.5?look().jet.flame:'#ffd93b',s:rand(2,5)});
   G.jetSnd-=dt;if(G.jetSnd<=0){SFX.jet();G.jetSnd=.07;}}
  G.snapT=Math.max(0,G.snapT-dt);
  if(input.grab&&!G.teth&&G.snapT<=0){const a=tryGrab();if(a)grab(a);}
  if(!input.grab&&G.teth)release();
 }
 G.target=(!G.teth&&G.rocket<=0)?tryGrab():null;
 m.x+=m.vx*dt;m.y+=m.vy*dt;
 if(G.teth){const a=G.teth.a;G.tethT+=dt;G.fuel=Math.min(fuelMax(),G.fuel+dt*D.regen*G.st.regen);
  if(D.ropeT&&G.tethT>D.ropeT){G.teth=null;G.snapT=.5;popTxt(m.x,m.y-30,'A CORDA ARREBENTOU!','#ff2e63',20);SFX.bump();G.shake=5;burst(m.x,m.y-20,10,'#7fd3ff',180,3,.5);}
  if(G.teth&&G.teth.a.fragile&&G.tethT>1.3)crumble(G.teth.a);
  if(G.teth){
  G.teth.L=Math.max(G.teth.Lmin,G.teth.L-30*dt);
  const dx=m.x-a.x,dy=m.y-a.y,d=Math.hypot(dx,dy)||1,nx=dx/d,ny=dy/d;
  if(d>G.teth.L){m.x=a.x+nx*G.teth.L;m.y=a.y+ny*G.teth.L;const vr=m.vx*nx+m.vy*ny;if(vr>0){m.vx-=vr*nx;m.vy-=vr*ny;}}
  const tx=-ny,ty=nx,vt=m.vx*tx+m.vy*ty,sg=Math.sign(vt)||1;m.vx+=tx*sg*PUMP*dt;m.vy+=ty*sg*PUMP*dt;}}
 else{G.freeT+=dt;if(G.freeT>3&&G.combo>0){G.combo=0;}}
 const tr=SAVE.eq.trail;if(tr!=='nenhum'&&!G.teth&&Math.hypot(m.vx,m.vy)>280&&Math.random()<(LITE()?.25:.55))trail(tr,m);
 const sp=Math.hypot(m.vx,m.vy);if(sp>VMAX){m.vx*=VMAX/sp;m.vy*=VMAX/sp;}
 // collisions
 for(const a of G.ast){if(a.dead)continue;const dx=m.x-a.x,dy=m.y-a.y,d=Math.hypot(dx,dy)||1;
  if(a.type==='rock'){if(d<a.r+m.r){const nx=dx/d,ny=dy/d;m.x=a.x+nx*(a.r+m.r);m.y=a.y+ny*(a.r+m.r);const vn=m.vx*nx+m.vy*ny;if(vn<0){const kb=WORLDS[a.wi||0].bounce||1.45;m.vx-=kb*vn*nx;m.vy-=kb*vn*ny;if(vn<-200){SFX.bump();G.shake=Math.max(G.shake,4);burst(m.x-nx*m.r,m.y-ny*m.r,6,'#a99',120,3,.4);}}
    if(G.rocket>0){a.dead=true;burst(a.x,a.y,26,'#b9a58f',300,6,.8);SFX.bump();G.shake=8;}else if(G.combo>0&&vn<-250)G.combo=0;}}
  else if(a.type==='spike'){if(d<a.r+m.r-3){if(G.rocket>0){a.dead=true;burst(a.x,a.y,24,'#ff4466',300,5,.8);SFX.bump();G.shake=8;addBan(2,a.x,a.y);popTxt(a.x,a.y,'POW!','#ff4466',26);}else hurt('Você bateu num asteroide espinhoso!',a);}}
  else if(a.type==='hole'){if(d<a.r+4&&G.rocket<=0){if(G.shield>0&&G.inv<=0){G.shield=0;G.inv=1.5;SFX.shield();m.vx=600;m.vy=-600;popTxt(m.x,m.y-30,'ESCUDO!','#7fd3ff',26);}else if(G.inv<=0)die('O buraco negro te engoliu!');}}
  else collideObj(a,m,d,dt);}
 G.ast=G.ast.filter(a=>!a.dead&&a.x>G.camX-300);
 if(G.teth&&!G.ast.includes(G.teth.a))G.teth=null;
 if(m.y<12){m.y=12;if(m.vy<0)m.vy*=-.3;}
 if(m.y>VH+40){if(G.shield>0||G.rocket>0||G.inv>0||G.tut){if(G.shield>0&&G.inv<=0&&!G.tut){G.shield=0;G.inv=1.2;SFX.shield();popTxt(m.x,VH-60,'ESCUDO!','#7fd3ff',26);}m.y=VH+30;m.vy=-950;m.vx=Math.max(m.vx,350);}else die('Você caiu no abismo espacial!');}
 // storm
 G.stormV=D.storm0+Math.min(D.stormMax-D.storm0,G.dist*D.stormK);G.storm=Math.max(G.storm+G.stormV*dt,m.x-D.stormGap);if(G.tut||G.pr)G.storm=Math.min(G.storm,m.x-1500);
 if(m.x<G.storm+5&&!G.dead){if(G.rocket>0||G.inv>0){m.vx=Math.max(m.vx,700);}else die('A tempestade solar te alcançou!');}
 // items
 const mr=G.magnet>0?magRange():0;
 for(const it of G.items){if(it.got)continue;const dx=m.x-it.x,dy=m.y-it.y,d=Math.hypot(dx,dy)||1;
  if(mr&&(it.k==='ban'||it.k==='gold')&&d<mr){it.x+=dx/d*Math.min(d,700*dt);it.y+=dy/d*Math.min(d,700*dt);}
  if(d<m.r+(it.k==='ban'?16:20)){it.got=true;collect(it);}}
 G.items=G.items.filter(i=>!i.got&&i.x>G.camX-200);
 stepExtras(dt);
 if(G.dead){updFx(dt);return;}
 G.dist=Math.max(G.dist,m.x/10);checkMis('dist',G.dist);
 if(G.diff==='dificil'&&!G.unlockMsg&&G.dist>=UNLOCK_M&&(SAVE.bestD.dificil||0)<UNLOCK_M){G.unlockMsg=true;SAVE.bestD.dificil=Math.floor(G.dist);persist();toast('🔓 IMPOSSÍVEL DESBLOQUEADO!<br>Você é fera! 🐵🔥');SFX.mis();vib([60,40,60]);popTxt(m.x,m.y-50,'🔓 IMPOSSÍVEL!','#ff2e63',28);}
 if(G.teth){m.ang=Math.atan2(G.teth.a.y-m.y,G.teth.a.x-m.x)+Math.PI/2;}
 else if(Math.abs(G.spin)>.6){m.ang+=G.spin*dt;G.flipAcc+=Math.abs(G.spin)*dt;G.spin*=Math.max(0,1-1.1*dt);if(G.flipAcc>=Math.PI*2){G.flipAcc-=Math.PI*2;flipDone();}}
 else{m.ang=Math.atan2(Math.sin(m.ang),Math.cos(m.ang));m.ang=lerp(m.ang,clamp(m.vx/1200,-.6,.6)+clamp(m.vy/1500,-.4,.4),dt*6);G.flipAcc=0;}
 updFx(dt);
}
function collect(it){const m=G.m;
 if(it.k==='ban'){const v=addBan(1);SFX.ban(G.combo);G.fx.push({x:it.x,y:it.y,vx:0,vy:-40,life:.3,max:.3,c:'#ffd93b',s:9,ring:1});if(v>1)popTxt(it.x,it.y-10,'+'+v,'#ffd93b',16);return;}
 G.pw++;checkMis('pw',G.pw);SFX.pow();vib(30);burst(it.x,it.y,16,'#fff',220,4,.6);
 if(it.k==='gold'){const v=addBan(5);popTxt(it.x,it.y-20,`+${v} 🍌`,'#ffd93b',26);G.pw--;}
 else if(it.k==='fuel'){G.fuel=Math.min(fuelMax(),G.fuel+fuelMax()*.6);popTxt(it.x,it.y-20,'COMBUSTÍVEL!','#ff8a00',22);G.pw--;}
 else if(it.k==='shield'){G.shield=1;popTxt(it.x,it.y-20,'ESCUDO!','#7fd3ff',24);}
 else if(it.k==='magnet'){G.magnet=magTime();popTxt(it.x,it.y-20,'ÍMÃ!','#ff4d8d',24);}
 else if(it.k==='rocket'){G.rocket=3;G.teth=null;popTxt(it.x,it.y-20,'FOGUETE!!','#ff8a00',30);G.shake=6;}
 if(it.k==='gold'||it.k==='fuel')checkMis('pw',G.pw);}
function trail(tr,m){const p={x:m.x-m.vx*.02+rand(-4,4),y:m.y+rand(-4,4),vx:-m.vx*.08+rand(-20,20),vy:-m.vy*.08+rand(-20,20),life:.7,max:.7,c:'#fff',s:3};
 if(tr==='bolhas'){p.ring=0;p.bub=1;p.c='#9fe8ff';p.s=rand(2,5);p.vy-=30;}
 else if(tr==='estrelas'){p.ch='★';p.c=Math.random()<.5?'#ffd93b':'#fff';p.s=rand(7,11);}
 else if(tr==='fogo'){p.c=Math.random()<.5?'#ff5a00':'#ffb300';p.s=rand(3,6);p.life=p.max=.45;}
 else if(tr==='coracoes'){p.ch='♥';p.c=Math.random()<.5?'#ff4d8d':'#ff9ac2';p.s=rand(8,12);}
 else if(tr==='neve'){p.ch='❄';p.c='#e0f7ff';p.s=rand(8,12);}
 else if(tr==='presentes'){p.gift=1;p.s=rand(3.5,5.5);p.c=['#e53935','#43a047','#1e88e5','#fdd835'][Math.floor(Math.random()*4)];}
 else if(tr==='bananas'){p.ban=1;p.s=rand(.6,.9);p.rot=rand(0,6);}
 else if(tr==='arcoiris'){p.c=`hsl(${(T*300)%360},90%,60%)`;p.s=5;p.life=p.max=.6;}
 G.fx.push(p);}
function updFx(dt){for(const p of G.fx){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;p.life-=dt;}G.fx=G.fx.filter(p=>p.life>0);
 for(const t of G.txt){t.y-=40*dt;t.life-=dt*.9;}G.txt=G.txt.filter(t=>t.life>0);
 G.shake=Math.max(0,G.shake-dt*30);G.flash=Math.max(0,G.flash-dt);
 const spd=Math.hypot(G.m.vx,G.m.vy),zt=1-clamp((spd-550)/600,0,1)*.15;G.zoom=lerp(G.zoom,zt,Math.min(1,dt*1.5));G.vw=VW/G.zoom;
 const tgt=G.m.x-G.vw*.33;G.camX=lerp(G.camX,tgt,Math.min(1,dt*5));gen();}

/* ---------- NOVOS SISTEMAS (mundos, objetos, eventos, tutorial) ---------- */
function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy||1;const t=clamp(((px-ax)*dx+(py-ay)*dy)/l,0,1);return Math.hypot(px-ax-t*dx,py-ay-t*dy);}
function banner(txt,sub,col){G.banner={txt,sub,col:col||'#fff',t:3.2};}
function confetti(x,y){const cs=['#ff2e63','#ffd93b','#39ff88','#3fa9ff','#c77dff','#ff8a00'];const n=LITE()?20:45;for(let i=0;i<n;i++){const a=Math.random()*6.28,v=150+Math.random()*350;G.fx.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-150,life:1.2,max:1.2,c:cs[i%6],s:2+Math.random()*3});}}
function crumble(a){a.dead=true;G.teth=null;G.snapT=.3;burst(a.x,a.y,26,'#d7c4a5',260,6,.8);popTxt(a.x,a.y-a.r-10,'CRACK!','#ffd0a0',22);SFX.bump();G.shake=6;}
function flipDone(){const m=G.m;G.flips++;G.flipChain++;G.maxFlipChain=Math.max(G.maxFlipChain,G.flipChain);LF().flips++;addBan(1);
 popTxt(m.x,m.y-38,G.flipChain>1?`CAMBALHOTA x${G.flipChain}!`:'CAMBALHOTA!','#7fffd4',22);SFX.flip();}
function collideObj(a,m,d,dt){
 if(a.type==='spring'){a.cd=Math.max(0,a.cd-dt);a.sq=Math.max(0,a.sq-dt*4);
  if(d<a.r+m.r&&a.cd<=0){a.cd=.5;a.sq=1;m.vy=-1000;m.vx=Math.max(m.vx,380)+120;G.teth=null;G.spin=9;G.flipAcc=0;SFX.boing();vib(25);burst(a.x,a.y-10,12,'#39ff88',220,4,.5);popTxt(a.x,a.y-34,'BOING!','#39ff88',22);LF().springs++;}}
 else if(a.type==='portal'){if(a.in&&d<a.r+m.r&&G.portalCd<=0){const o=a.to;burst(m.x,m.y,16,'#c77dff',220,4,.5);m.x=o.x+o.r+m.r+8;m.y=o.y;m.vx=Math.max(m.vx,450);G.teth=null;G.portalCd=.6;G.flash=.15;SFX.portal();burst(m.x,m.y,16,'#ff8a00',220,4,.5);popTxt(m.x,m.y-34,'PORTAL!','#c77dff',22);LF().portals++;G.camX=m.x-G.vw*.33;}}
 else if(a.type==='sat'){const ax=Math.cos(a.rot)*a.arm,ay=Math.sin(a.rot)*a.arm;
  if(Math.abs(m.x-a.x)<a.arm+30&&segDist(m.x,m.y,a.x-ax,a.y-ay,a.x+ax,a.y+ay)<m.r+5){if(G.rocket>0){a.dead=true;burst(a.x,a.y,24,'#9fb4ff',300,5,.8);SFX.bump();addBan(2);}else hurt('Você bateu num satélite!',a);}}}
function startEvent(){const k=G.pr&&G.pr.ev?G.pr.ev:(G.evN%2===0?'met':'boss');G.evN++;G.nextEv=G.pr?(G.pr.ev?G.dist+300:1e9):G.nextEv+1000;
 if(k==='met'){G.ev={k,t:0,dur:9,spawn:.5};banner('☄️ CHUVA DE METEOROS!','Sobreviva por 9 segundos!','#ff8a00');}
 else{G.ev={k,t:0,dur:24,hp:3,max:3,x:G.camX+G.vw+150,y:200,r:46,shoot:2.2,hit:0,enter:0};banner('🐙 CHEFE: POLVO GALÁCTICO','Faça lançamentos PERFEITOS para atacar!','#c77dff');}
 SFX.alarm();vib([60,40,60]);}
function stepEvent(dt){const e=G.ev,m=G.m,D=Dz();e.t+=dt;
 if(e.k==='met'){e.spawn-=dt;if(e.spawn<=0&&e.t<e.dur-1){e.spawn=RR(.4,.7)/Math.min(Math.max(D.haz,.7),1.6);G.warn.push({k:'met',x:G.camX+G.vw*RR(.3,1.05),t:.85});}
  if(e.t>=e.dur){const rw=Math.round(60*D.ban);giveBan(rw);LF().showers++;toast(`☄️ Você sobreviveu à chuva!<br>+${rw} 🍌`);SFX.mis();G.ev=null;}}
 else{e.enter=Math.min(1,e.enter+dt*.7);const tx=G.camX+G.vw*.82,ty=170+Math.sin(e.t*1.2)*90;e.x=lerp(G.camX+G.vw+150,tx,e.enter);e.y=lerp(e.y,ty,Math.min(1,dt*2));e.hit=Math.max(0,e.hit-dt);
  e.shoot-=dt;if(e.shoot<=0&&e.t<e.dur-2&&e.enter>=1){e.shoot=RR(1.5,2.3)/Math.min(Math.max(D.haz,.7),1.5);const dx=m.x-e.x,dy=m.y-e.y,d=Math.hypot(dx,dy)||1,sp=260;
   G.proj.push({k:'ink',x:e.x-e.r*.6,y:e.y+e.r*.3,vx:clamp(m.vx,0,900)*.85+dx/d*sp,vy:dy/d*sp,r:11});SFX.ink();}
  if(Math.hypot(m.x-e.x,m.y-e.y)<e.r+m.r){if(G.rocket>0){if(e.hit<=0)bossHit();}else hurt('Você trombou no polvo!',null);}
  if(e.t>=e.dur){toast('🐙 O polvo fugiu... fica para a próxima!');G.ev=null;}}}
function bossHit(){const e=G.ev;if(!e||e.k!=='boss')return;e.hp--;e.hit=.4;G.shake=10;SFX.bossHit();burst(e.x,e.y,30,'#c77dff',350,6,.8);popTxt(e.x,e.y-e.r-10,'POW!','#ffd93b',30);
 if(e.hp<=0){const rw=Math.round(150*Dz().ban);giveBan(rw);LF().bosses++;confetti(e.x,e.y);burst(e.x,e.y,60,'#ff7eb6',450,7,1.2);toast(`🐙 POLVO DERROTADO!<br>+${rw} 🍌`);SFX.mis();G.ev=null;persist();}}
function stepExtras(dt){const m=G.m,D=Dz();
 const w=worldAt(G.dist);if(w.i!==G.wi||w.lap!==G.lap){G.wPrev=G.wi;G.wi=w.i;G.lap=w.lap;G.wT=0;const Wd=WORLDS[w.i];banner(`${Wd.ic} ${Wd.nome.toUpperCase()}`,w.lap>0?`Volta ${w.lap+1} pelo universo!`:'Você chegou a um novo mundo!',Wd.neon?Wd.neon[1]:'#fff');SFX.mis();}
 G.wT=Math.min(1,G.wT+dt*.5);
 if(G.banner){G.banner.t-=dt;if(G.banner.t<=0)G.banner=null;}
 if(!G.recShown&&G.prevBest>50&&G.dist>G.prevBest){G.recShown=true;G.happy=2;popTxt(m.x,m.y-55,'🏆 NOVO RECORDE!','#39ff88',28);confetti(m.x,m.y);SFX.mis();vib([40,30,40]);}
 G.happy=Math.max(0,G.happy-dt);
 if(G.mode==='daily'&&!G.chalDone&&G.dist>=G.chalTarget){G.chalDone=true;const already=SAVE.chal.date===today()&&SAVE.chal.done;
  if(SAVE.chal.date!==today())SAVE.chal={date:today(),best:0,done:false};SAVE.chal.done=true;
  if(!already){SAVE.bananas+=200;SAVE.life.dailyDone++;toast('🏁 DESAFIO DO DIA CUMPRIDO!<br>+200 🍌');}else toast('🏁 Meta do dia alcançada de novo!');SFX.mis();confetti(m.x,m.y);persist();}
 const Wc=WORLDS[G.wi];
 if(!G.tut&&G.dist>D.hazStart+250){G.cometT-=dt;if(G.cometT<=0){G.cometT=RR(6,12)/((Wc.comet||1)*Math.min(Math.max(D.haz,.6),1.6));G.warn.push({k:'comet',y:clamp(m.y+RR(-120,120),60,480),t:1.1});}}
 if(!G.ev&&!G.tut&&G.dist>=G.nextEv)startEvent();
 if(G.ev)stepEvent(dt);
 for(const w2 of G.warn){w2.t-=dt;if(w2.t<=0){if(w2.k==='comet')G.proj.push({k:'comet',x:G.camX+G.vw+80,y:w2.y,vx:-(650+Math.min(400,G.dist*.05)),vy:RR(-30,30),r:16});else G.proj.push({k:'met',x:w2.x,y:-40,vx:-90,vy:560,r:14});}}
 G.warn=G.warn.filter(w2=>w2.t>0);
 for(const p of G.proj){p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(p.k==='missile'){const b=G.ev&&G.ev.k==='boss'?G.ev:null;if(!b){p.dead=true;continue;}const dx=b.x-p.x,dy=b.y-p.y,d=Math.hypot(dx,dy)||1;p.vx=lerp(p.vx,dx/d*1100,Math.min(1,dt*6));p.vy=lerp(p.vy,dy/d*1100,Math.min(1,dt*6));if(d<b.r){p.dead=true;bossHit();}continue;}
  if(!LITE()&&Math.random()<.5)G.fx.push({x:p.x,y:p.y,vx:rand(-30,30),vy:rand(-30,30),life:.4,max:.4,c:p.k==='ink'?'#7b45b0':(p.k==='comet'?'#9fe8ff':'#ff8a00'),s:rand(2,5)});
  const d=Math.hypot(p.x-m.x,p.y-m.y);
  if(d<p.r+m.r-2&&!G.dead){p.dead=true;if(G.rocket>0||G.inv>0){burst(p.x,p.y,16,'#fff',220,4,.5);if(G.rocket>0)addBan(2);}else hurt(p.k==='comet'?'Um cometa te atingiu!':p.k==='ink'?'A tinta do polvo te pegou!':'Um meteoro caiu em você!',null);}
  if(p.y>VH+80||p.x<G.camX-250||p.y<-250)p.dead=true;}
 G.proj=G.proj.filter(p=>!p.dead);
 G.scared=false;for(const a of G.ast){if((a.type==='spike'||a.type==='hole'||a.type==='sat')&&Math.abs(a.x-m.x)<120&&Math.hypot(a.x-m.x,a.y-m.y)<110){G.scared=true;break;}}
 if(!G.scared)for(const p of G.proj){if(p.k!=='missile'&&Math.hypot(p.x-m.x,p.y-m.y)<150){G.scared=true;break;}}
 G.achT-=dt;if(G.achT<=0){G.achT=1;if(!G.pr)SAVE.life.bestAny=Math.max(SAVE.life.bestAny,Math.floor(G.dist));checkAch();}
 if(G.tut)stepTut(dt);}
function stepTut(dt){const t=G.tut,m=G.m;t.t+=dt;G.tutFreeze=false;
 if(t.s===0){if(G.target&&!G.teth)t.s=1;else if(G.teth){t.s=2;}}
 if(t.s===1){G.tutFreeze=!G.teth;if(G.teth){t.s=2;t.t=0;}}
 else if(t.s===2){if(G.teth&&G.tethT>.35&&m.vx>150&&m.vy<-40)t.s=3;else if(!G.teth&&t.t>.2){t.s=0;}}
 else if(t.s===3){G.tutFreeze=!!G.teth;if(!G.teth){t.s=4;t.t=0;}}
 else if(t.s===4){if(!G.teth&&m.vy>150&&m.y>300&&G.fuel>.5&&t.t>.4){t.s=5;t.j=0;}else if(t.t>10){t.s=6;t.t=0;}}
 else if(t.s===5){G.tutFreeze=!input.jet;if(input.jet){t.j+=dt;if(t.j>.45){t.s=6;t.t=0;}}}
 else if(t.s===6){if(t.t>3.5){G.tut=null;SAVE.tut=true;if(!SAVE.tutRw){SAVE.tutRw=true;SAVE.bananas+=50;toast('🎓 Tutorial completo! +50 🍌');}else toast('🎓 Tutorial completo!');persist();if(G.mode==='tutorial')banner('🧪 Agora é treino livre!','Toque em ⏸ e depois 🏠 para voltar ao menu','#39ff88');}}}
/* ---------- CONQUISTAS ---------- */
function checkAch(){const L=SAVE.life,got=[],inRun=!!(G&&(state==='play'||state==='dying'||state==='over'));if(inRun&&G.pr)return;
 for(const a of ACH){if(SAVE.ach[a.id])continue;let ok=false;try{ok=a.ok(L,inRun?G:null);}catch(e){}
  if(ok){SAVE.ach[a.id]=today();SAVE.bananas+=a.rw;got.push(a);if(inRun&&G.newAch)G.newAch.push(a);}}
 if(!got.length)return;persist();SFX.mis();
 if(got.length===1)toast(`🏅 Conquista: ${got[0].nome}!<br>+${got[0].rw} 🍌`);else toast(`🏅 ${got.length} conquistas desbloqueadas!<br>+${got.reduce((s,a)=>s+a.rw,0)} 🍌`);}

/* ---------- RENDER ---------- */
function rng(seed){let s=seed|0;return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return((s>>>8)&0xffffff)/0x1000000;};}
const PCOL=[['#ff7eb6','#7a2b6b'],['#6be3ff','#1d4a8a'],['#ffd36b','#a3561d'],['#9cff8a','#25704a'],['#c79bff','#4b2a8f']];
function hex2rgb(h){h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255];}
function mixHex(a,b,t){const A=hex2rgb(a),B=hex2rgb(b);return`rgb(${Math.round(lerp(A[0],B[0],t))},${Math.round(lerp(A[1],B[1],t))},${Math.round(lerp(A[2],B[2],t))})`;}
function drawBG(cam){const inG=!!(G&&state!=='menu');const cur=WORLDS[inG?G.wi:0],prv=WORLDS[inG?G.wPrev:0],t=inG?G.wT:1,lite=LITE();
 const g=ctx.createLinearGradient(0,0,0,H);[0,.6,1].forEach((s,i)=>g.addColorStop(s,mixHex(prv.bg[i],cur.bg[i],t)));ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 if(!lite){const TP=700;const off=cam*S*.05;for(let i=Math.floor(off/TP)-1;i<=Math.floor((off+W)/TP)+1;i++){const r=rng(i*31337+7);if(r()<.55){const px=i*TP+r()*TP-off,py=r()*H*.8,pr=(30+r()*70)*S*1.4,c=PCOL[Math.floor(r()*PCOL.length)];
  const gg=ctx.createRadialGradient(px-pr*.35,py-pr*.35,pr*.1,px,py,pr);gg.addColorStop(0,c[0]);gg.addColorStop(1,c[1]);ctx.globalAlpha=.5;ctx.fillStyle=gg;ctx.beginPath();ctx.arc(px,py,pr,0,7);ctx.fill();
  if(r()<.4){ctx.strokeStyle=c[0];ctx.lineWidth=3*S;ctx.beginPath();ctx.ellipse(px,py,pr*1.7,pr*.35,-.3,0,7);ctx.stroke();}ctx.globalAlpha=1;}}}
 const Ls=[[.08,16,.9,.45],[.18,10,1.4,.7],[.35,6,2.1,1]].slice(0,lite?2:3);const TW=320;
 Ls.forEach((l,li)=>{const off=cam*S*l[0];for(let i=Math.floor(off/TW)-1;i<=Math.floor((off+W)/TW)+1;i++){const r=rng(i*7919+li*104729);for(let k=0;k<l[1];k++){const x=i*TW+r()*TW-off,y=r()*H,tw=.6+.4*Math.sin(T*2+x*.1+k);ctx.globalAlpha=l[3]*tw;ctx.fillStyle=k%7===0?'#ffe9a8':cur.star;ctx.fillRect(x,y,l[2],l[2]);}}});
 ctx.globalAlpha=1;const md=(v,n)=>((v%n)+n)%n;
 if(cur.snow){const n=lite?25:60;ctx.fillStyle='#fff';for(let i=0;i<n;i++){const x=md(i*137.5+T*(20+i%5*8)-cam*S*.3,W+20)-10,y=md(i*91.7+T*(40+i%7*10),H+20)-10,z=1+(i%3);ctx.globalAlpha=(.35+.25*(i%3))*t;ctx.fillRect(x,y,z+1,z+1);}ctx.globalAlpha=1;}
 if(cur.ember){const n=lite?15:40;for(let i=0;i<n;i++){const x=md(i*173.3-cam*S*.25,W+20)-10,y=H-md(i*61.3+T*(30+i%6*12),H+20);ctx.fillStyle=i%2?'#ff8a00':'#ffcf3f';ctx.globalAlpha=.6*t;ctx.beginPath();ctx.arc(x+Math.sin(T*2+i)*6,y,1.5+(i%3),0,7);ctx.fill();}ctx.globalAlpha=1;}
 if(cur.grid){ctx.strokeStyle=`rgba(177,77,255,${.28*t})`;ctx.lineWidth=1;const hz=H*.7;ctx.beginPath();for(let i=0;i<9;i++){const y=hz+Math.pow(i/8,2)*(H-hz);ctx.moveTo(0,y);ctx.lineTo(W,y);}const off=md(cam*S*.6,60);for(let x=-off-W;x<W*2;x+=60){ctx.moveTo(W/2+(x-W/2)*.25,hz);ctx.lineTo(x,H);}ctx.stroke();}}
function drawRock(a,hl){ctx.save();const shk=(a.fragile&&G&&G.teth&&G.teth.a===a)?Math.min(3,G.tethT*2.5):0;ctx.translate(a.x+(Math.random()-.5)*shk,a.y+(Math.random()-.5)*shk);
 if(a.osc){ctx.strokeStyle='rgba(127,211,255,.15)';ctx.lineWidth=2;ctx.setLineDash([4,6]);ctx.beginPath();ctx.moveTo(0,a.by-a.y-a.osc);ctx.lineTo(0,a.by-a.y+a.osc);ctx.stroke();ctx.setLineDash([]);}
 ctx.rotate(a.rot);const Wr=WORLDS[a.wi||0],cols=Wr.rock[a.tone];
 ctx.beginPath();for(let i=0;i<12;i++){const an=i/12*Math.PI*2;ctx.lineTo(Math.cos(an)*a.pts[i],Math.sin(an)*a.pts[i]);}ctx.closePath();
 const g=ctx.createRadialGradient(-a.r*.4,-a.r*.4,a.r*.1,0,0,a.r);g.addColorStop(0,cols[0]);g.addColorStop(1,cols[1]);ctx.fillStyle=g;ctx.fill();
 ctx.lineWidth=2.5;ctx.strokeStyle=hl?'#7fd3ff':(Wr.neon?Wr.neon[a.tone]:'#3a3029');ctx.stroke();
 for(const c of a.cr){ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.arc(c[0],c[1],c[2],0,7);ctx.fill();ctx.fillStyle=Wr.lava?'rgba(255,110,0,.45)':'rgba(255,255,255,.08)';ctx.beginPath();ctx.arc(c[0]-c[2]*.25,c[1]-c[2]*.25,c[2]*.6,0,7);ctx.fill();}
 if(a.fragile){ctx.strokeStyle='rgba(20,10,5,.85)';ctx.lineWidth=2;ctx.beginPath();for(const k of a.cracks){ctx.moveTo(Math.cos(k[0])*a.r*.12,Math.sin(k[0])*a.r*.12);ctx.lineTo(Math.cos(k[1])*a.r*k[2],Math.sin(k[1])*a.r*k[2]);}ctx.stroke();ctx.strokeStyle='rgba(255,230,190,.5)';ctx.lineWidth=.8;ctx.stroke();}
 ctx.restore();
 if(hl){ctx.strokeStyle='rgba(127,211,255,'+(.5+.3*Math.sin(T*10))+')';ctx.lineWidth=2;ctx.setLineDash([6,6]);ctx.beginPath();ctx.arc(a.x,a.y,a.r+9,T*2,T*2+6.28);ctx.stroke();ctx.setLineDash([]);}}
function drawSpike(a){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.rot*3);
 ctx.shadowColor='#ff2e63';ctx.shadowBlur=LITE()?0:14;ctx.fillStyle='#ff2e63';ctx.beginPath();const n=9;for(let i=0;i<n*2;i++){const an=i/(n*2)*Math.PI*2,rr=i%2?a.r*.7:a.r*1.25;ctx.lineTo(Math.cos(an)*rr,Math.sin(an)*rr);}ctx.closePath();ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle='#8a0f33';ctx.beginPath();ctx.arc(0,0,a.r*.62,0,7);ctx.fill();ctx.fillStyle='#ffdd55';ctx.beginPath();ctx.arc(-a.r*.2,-a.r*.1,a.r*.15,0,7);ctx.arc(a.r*.2,-a.r*.1,a.r*.15,0,7);ctx.fill();
 ctx.restore();}
function drawHole(a){ctx.save();ctx.translate(a.x,a.y);
 const g=ctx.createRadialGradient(0,0,a.r*.5,0,0,a.r*5);g.addColorStop(0,'rgba(140,60,255,.45)');g.addColorStop(1,'rgba(140,60,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,a.r*5,0,7);ctx.fill();
 for(let i=0;i<3;i++){ctx.save();ctx.rotate(T*(1.5+i*.6)+i*2);ctx.strokeStyle=['#c77dff','#ff7eb6','#7fd3ff'][i];ctx.globalAlpha=.7;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,0,a.r*(2.2-i*.35),a.r*(.8-i*.12),0,0,4.5);ctx.stroke();ctx.restore();}
 ctx.globalAlpha=1;ctx.fillStyle='#000';ctx.beginPath();ctx.arc(0,0,a.r,0,7);ctx.fill();ctx.strokeStyle='#ffd0ff';ctx.lineWidth=1.5;ctx.stroke();ctx.restore();}
function drawBanana(x,y,rot,sc=1,gold=false){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.scale(sc,sc);
 ctx.beginPath();ctx.moveTo(-9,-4);ctx.quadraticCurveTo(0,11,10,-5);ctx.quadraticCurveTo(0,4,-9,-4);ctx.fillStyle=gold?'#ffb300':'#ffe14d';ctx.fill();ctx.strokeStyle='#a86f00';ctx.lineWidth=1.3;ctx.stroke();
 ctx.fillStyle='#5b3a1a';ctx.fillRect(9,-7.5,2.6,3.2);ctx.restore();}
function drawItem(it){const y=it.y+Math.sin(T*3+it.ph)*4;
 if(it.k==='ban'){drawBanana(it.x,y,Math.sin(T*2+it.ph)*.3,1.45);return;}
 const col={shield:'#7fd3ff',magnet:'#ff4d8d',rocket:'#ff8a00',gold:'#ffd93b',fuel:'#39ff88'}[it.k];
 ctx.save();ctx.translate(it.x,y);ctx.shadowColor=col;ctx.shadowBlur=LITE()?0:16;ctx.fillStyle='rgba(20,10,50,.75)';ctx.strokeStyle=col;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,17+Math.sin(T*6)*1.5,0,7);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
 if(it.k==='gold'){if(seasonOn('natal')){ctx.font='20px system-ui,"Apple Color Emoji","Segoe UI Emoji"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('🎁',0,1);}else{drawBanana(-4,2,-.3,.9,true);drawBanana(2,-2,.1,.9,true);drawBanana(5,4,.4,.9,true);}}
 else{ctx.font='18px system-ui,"Apple Color Emoji","Segoe UI Emoji"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText({shield:'🛡️',magnet:'🧲',rocket:'🚀',fuel:'⛽'}[it.k],0,1);}
 ctx.restore();}
function drawJet(J,on,t){const c=ctx,st=J.style;
 if(st===3){c.fillStyle='#1e3a8a';c.save();c.translate(-14,-2);c.rotate(-.5);c.fillRect(-16,-4,15,7);c.strokeStyle='#90caf9';c.lineWidth=.6;for(let i=-13;i<0;i+=4){c.beginPath();c.moveTo(i,-4);c.lineTo(i,3);c.stroke();}c.restore();}
 if(st===4){c.strokeStyle='#ddd';c.lineWidth=.8;c.beginPath();c.moveTo(-13,-4);c.lineTo(-15,-17);c.stroke();const b=Math.sin(t*3)*1.5;c.fillStyle='rgba(120,230,255,.45)';c.strokeStyle='#b2ebf2';c.lineWidth=1.2;c.beginPath();c.arc(-16,-24+b,8,0,7);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.arc(-19,-27+b,2,0,7);c.fill();}
 if(st===5){c.shadowColor=J.flame;c.shadowBlur=8;}
 if(st===6){rr(-17,-4,9,17,3);c.save();c.clip();c.fillStyle='#fff';c.fillRect(-17,-4,9,17);c.fillStyle='#e53935';for(let i=-10;i<22;i+=5){c.beginPath();c.moveTo(-17,i);c.lineTo(-8,i-5);c.lineTo(-8,i-2.5);c.lineTo(-17,i+2.5);c.fill();}c.restore();c.strokeStyle='#e53935';c.lineWidth=2.2;c.lineCap='round';c.beginPath();c.arc(-10.5,-5,3.2,Math.PI,0);c.stroke();}
 c.fillStyle=J.body;
 if(st===6){}else if(st===2){rr(-20,-5,6,18,3);c.fill();rr(-13.5,-3,6,16,3);c.fill();c.shadowBlur=0;c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-19,-3,1.5,12);c.fillRect(-12.5,-1,1.5,10);}
 else{rr(-17,-4,9,17,3);c.fill();c.shadowBlur=0;c.fillStyle='rgba(255,255,255,.3)';c.fillRect(-16,-2,2,11);}
 if(st===5){c.strokeStyle=J.flame;c.lineWidth=1.2;c.beginPath();c.arc(-12.5,4,3.2+Math.sin(t*8)*.6,0,7);c.stroke();}
 c.fillStyle=J.flame;if(st!==2)c.fillRect(-16,9,7,2.5);
 if(on){const dir=on>0?1:-1,by=dir>0?13:-4;const fl=(8+Math.random()*8)*(J.thr||1);c.fillStyle=on>0?J.flame:'#7fd3ff';
  const nz=st===2?[[-20,-14],[-13.5,-7.5]]:[[-16,-9]];for(const [a,b2] of nz){c.beginPath();c.moveTo(a,by);c.lineTo((a+b2)/2,by+fl*dir);c.lineTo(b2,by);c.fill();}
  c.fillStyle='rgba(255,255,255,.8)';for(const [a,b2] of nz){c.beginPath();c.moveTo(a+1.5,by);c.lineTo((a+b2)/2,by+fl*.45*dir);c.lineTo(b2-1.5,by);c.fill();}}}
function star(x,y,R,r){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr2=i%2?r:R;ctx.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2);}ctx.closePath();ctx.fill();}
function drawGlass(g,t){const c=ctx,E=[[-1.6,-12],[4.4,-12]];
 if(g==='escuros'){c.fillStyle='#111';rr(-5,-14.6,6.4,4.6,2);c.fill();rr(1.2,-14.6,6.4,4.6,2);c.fill();c.fillRect(0.5,-13.2,1.6,1);c.fillStyle='rgba(255,255,255,.55)';c.fillRect(-4,-14,2,1);c.fillRect(2.2,-14,2,1);}
 else if(g==='3d'){c.fillStyle='#ff2e63';c.fillRect(-4.8,-14.3,6,4.5);c.fillStyle='#3fc8ff';c.fillRect(1.4,-14.3,6,4.5);c.strokeStyle='#fff';c.lineWidth=1;c.strokeRect(-4.8,-14.3,6,4.5);c.strokeRect(1.4,-14.3,6,4.5);}
 else if(g==='coracao'){c.fillStyle='#ff4d8d';for(const [x,y] of E){c.beginPath();c.moveTo(x,y+2.8);c.bezierCurveTo(x-5,y-.5,x-2.2,y-4.6,x,y-1.8);c.bezierCurveTo(x+2.2,y-4.6,x+5,y-.5,x,y+2.8);c.fill();}}
 else if(g==='nerd'){c.strokeStyle='#222';c.lineWidth=1.3;for(const [x,y] of E){c.beginPath();c.arc(x,y,3,0,7);c.stroke();}c.fillStyle='rgba(200,240,255,.25)';for(const [x,y] of E){c.beginPath();c.arc(x,y,2.6,0,7);c.fill();}}
 else if(g==='estrela'){c.fillStyle='#ffd93b';for(const [x,y] of E)star(x,y,3.8,1.7);}
 else if(g==='floco'){c.strokeStyle='#bfe9ff';c.lineWidth=1.1;for(const [x,y] of E){for(let i=0;i<3;i++){const a=i*Math.PI/3+t;c.beginPath();c.moveTo(x+Math.cos(a)*3.5,y+Math.sin(a)*3.5);c.lineTo(x-Math.cos(a)*3.5,y-Math.sin(a)*3.5);c.stroke();}}}
 else if(g==='laser'){c.shadowColor='#ff2e63';c.shadowBlur=6;c.fillStyle='#ff2e63';rr(-6,-14.2,15,4.4,2);c.fill();c.shadowBlur=0;c.fillStyle='#fff';c.fillRect(-5+((t*18)%12),-13,2,1.8);}}
function drawHat(h,t){const c=ctx;
 if(h==='bone'){c.fillStyle='#e53935';c.beginPath();c.arc(0,-21,8,Math.PI,0);c.fill();c.fillRect(3,-22,11,3);c.fillStyle='#fff';c.beginPath();c.arc(0,-28.5,1.6,0,7);c.fill();}
 else if(h==='cartola'){c.fillStyle='#1a1a1a';c.fillRect(-6,-37,12,14);c.fillRect(-10,-25,20,3);c.fillStyle='#e53935';c.fillRect(-6,-28,12,3);}
 else if(h==='coroa'){c.fillStyle='#ffd700';c.beginPath();c.moveTo(-9,-21);c.lineTo(-9,-31);c.lineTo(-4.5,-25.5);c.lineTo(0,-33);c.lineTo(4.5,-25.5);c.lineTo(9,-31);c.lineTo(9,-21);c.closePath();c.fill();c.strokeStyle='#b8860b';c.lineWidth=1;c.stroke();c.fillStyle='#ff2e63';c.beginPath();c.arc(0,-24.5,1.8,0,7);c.fill();c.fillStyle='#3fa9ff';c.beginPath();c.arc(-5.5,-23.5,1.2,0,7);c.arc(5.5,-23.5,1.2,0,7);c.fill();}
 else if(h==='pirata'){c.fillStyle='#222';c.beginPath();c.moveTo(-14,-21);c.quadraticCurveTo(0,-40,14,-21);c.quadraticCurveTo(0,-26,-14,-21);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(0,-28,2.3,0,7);c.fill();c.fillRect(-2.5,-25.5,5,1);}
 else if(h==='antena'){const w=Math.sin(t*6)*2;c.strokeStyle='#39ff88';c.lineWidth=1.5;c.beginPath();c.moveTo(-4,-22);c.lineTo(-7+w,-33);c.moveTo(4,-22);c.lineTo(7+w,-33);c.stroke();c.fillStyle='#39ff88';c.beginPath();c.arc(-7+w,-34,2.6,0,7);c.arc(7+w,-34,2.6,0,7);c.fill();}
 else if(h==='helice'){c.fillStyle='#ff8a00';c.beginPath();c.arc(0,-21,8,Math.PI,0);c.fill();c.fillStyle='#3fa9ff';c.beginPath();c.moveTo(0,-21);c.arc(0,-21,8,Math.PI,Math.PI*1.5);c.fill();c.fillStyle='#555';c.fillRect(-.8,-32,1.6,8);const sc=Math.abs(Math.cos(t*25));c.fillStyle='#ffd93b';c.beginPath();c.ellipse(0,-32,11*sc+1,1.8,0,0,7);c.fill();}
 else if(h==='viking'){c.fillStyle='#f5f0e1';c.strokeStyle='#a89f80';c.lineWidth=1;for(const sg of [-1,1]){c.beginPath();c.moveTo(sg*11,-17);c.quadraticCurveTo(sg*23,-21,sg*19,-34);c.quadraticCurveTo(sg*17,-24,sg*8,-21);c.closePath();c.fill();c.stroke();}}
 else if(h==='gorro'){c.fillStyle='#d32f2f';c.beginPath();c.moveTo(-11,-21);c.quadraticCurveTo(-4,-44,15,-34);c.quadraticCurveTo(4,-30,11,-21);c.closePath();c.fill();c.fillStyle='#fff';rr(-13,-25,26,5.5,2.7);c.fill();c.beginPath();c.arc(16,-34,3.3,0,7);c.fill();}
 else if(h==='rena'){c.strokeStyle='#8d5524';c.lineWidth=2.4;c.lineCap='round';for(const sg of[-1,1]){c.beginPath();c.moveTo(sg*7,-22);c.lineTo(sg*12,-35);c.moveTo(sg*9.5,-28.5);c.lineTo(sg*17,-31);c.moveTo(sg*11,-32);c.lineTo(sg*7.5,-39);c.stroke();}}
 else if(h==='mago'){c.fillStyle='#5b2d8c';c.beginPath();c.moveTo(-10,-21);c.lineTo(3,-46);c.lineTo(10,-21);c.closePath();c.fill();c.fillStyle='#ffd93b';star(1,-31,2.4,1);star(-3,-25,1.6,.7);star(4,-38,1.5,.6);c.fillStyle='#7b45b0';c.fillRect(-12,-23,24,3);}}
function drawMonkey(x,y,ang,L,opt={}){ctx.save();ctx.translate(x,y);ctx.rotate(ang);const t=T;
 const traje=L.rbSuit?`hsl(${(t*120)%360},80%,55%)`:L.traje,pelo=L.rbFur?`hsl(${(t*90+180)%360},65%,48%)`:L.pelo;
 drawJet(L.jet,opt.jet,t);
 ctx.strokeStyle=pelo;ctx.lineWidth=3.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-5,13);const w=Math.sin(t*5)*3;ctx.bezierCurveTo(-14,22,-24+w,14,-21,6+w);ctx.bezierCurveTo(-19,1,-14,4,-16,8);ctx.stroke();
 ctx.strokeStyle=traje;ctx.lineWidth=5;const lk=opt.teth?Math.sin(t*8)*3:0;ctx.beginPath();ctx.moveTo(-3,12);ctx.lineTo(-5+lk,21);ctx.moveTo(4,12);ctx.lineTo(6-lk,21);ctx.stroke();
 ctx.fillStyle=L.det;ctx.beginPath();ctx.arc(-5+lk,22,3,0,7);ctx.arc(6-lk,22,3,0,7);ctx.fill();
 ctx.fillStyle=traje;ctx.beginPath();ctx.ellipse(0,6,9,10,0,0,7);ctx.fill();ctx.fillStyle=L.det;ctx.fillRect(-6,4,12,3);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(3,9,2,0,7);ctx.fill();
 ctx.strokeStyle=traje;ctx.lineWidth=4.5;ctx.beginPath();
 if(opt.teth){ctx.moveTo(5,0);ctx.lineTo(4,-24);ctx.moveTo(-6,1);ctx.lineTo(-11,10);}else{const s=Math.sin(t*6)*.3;ctx.moveTo(6,1);ctx.lineTo(14,-6+s*10);ctx.moveTo(-6,1);ctx.lineTo(-13,-5-s*10);}
 ctx.stroke();ctx.fillStyle=L.rosto;ctx.beginPath();if(opt.teth){ctx.arc(4,-25,3,0,7);}else{ctx.arc(14,-7,2.8,0,7);ctx.arc(-13,-6,2.8,0,7);}ctx.fill();
 ctx.fillStyle=pelo;ctx.beginPath();ctx.arc(-9,-10,4.5,0,7);ctx.arc(9,-10,4.5,0,7);ctx.fill();ctx.fillStyle=L.rosto;ctx.beginPath();ctx.arc(-9,-10,2.5,0,7);ctx.arc(9,-10,2.5,0,7);ctx.fill();
 ctx.fillStyle=pelo;ctx.beginPath();ctx.arc(0,-10,9,0,7);ctx.fill();
 ctx.fillStyle=L.rosto;ctx.beginPath();ctx.ellipse(1,-7,6.5,5.5,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(-2,-12,3.2,3.5,0,0,7);ctx.ellipse(4,-12,3.2,3.5,0,0,7);ctx.fill();
 const blink=(Math.sin(t*1.3)>.97);ctx.fillStyle='#1a1020';
 if(opt.scared){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(-1.6,-12,2.7,0,7);ctx.arc(4.4,-12,2.7,0,7);ctx.fill();ctx.fillStyle='#1a1020';ctx.beginPath();ctx.arc(-1.2,-12,1,0,7);ctx.arc(4.8,-12,1,0,7);ctx.fill();}
 else if(opt.happy){ctx.strokeStyle='#1a1020';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(-1.6,-11,1.8,3.5,5.9);ctx.moveTo(6.1,-11.6);ctx.arc(4.4,-11,1.8,3.5,5.9);ctx.stroke();}
 else if(blink){ctx.fillRect(-4,-12,4,1.2);ctx.fillRect(2,-12,4,1.2);}else{ctx.beginPath();ctx.arc(-1.6,-12,1.7,0,7);ctx.arc(4.4,-12,1.7,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(-1.4,-13.2,.9,.9);ctx.fillRect(4.6,-13.2,.9,.9);}
 if(L.glass&&L.glass!=='nenhum')drawGlass(L.glass,t);
 if(opt.scared){ctx.fillStyle='#5b2a1a';ctx.beginPath();ctx.ellipse(1.5,-4.4,1.6,2.1,0,0,7);ctx.fill();}
 else if(opt.happy){ctx.fillStyle='#5b2a1a';ctx.beginPath();ctx.arc(1.5,-6.2,3.6,.1,3.04);ctx.closePath();ctx.fill();ctx.fillStyle='#ff7a8a';ctx.beginPath();ctx.arc(1.5,-3.5,1.5,0,3.14);ctx.fill();}
 else{ctx.strokeStyle='#5b2a1a';ctx.lineWidth=1.3;ctx.beginPath();if(opt.dead){ctx.arc(1.5,-3,2.5,3.6,5.8);}else ctx.arc(1.5,-6,3,.3,2.8);ctx.stroke();}
 ctx.fillStyle='#5b2a1a';ctx.beginPath();ctx.arc(0,-8,.7,0,7);ctx.arc(2.6,-8,.7,0,7);ctx.fill();
 ctx.fillStyle='rgba(180,230,255,.13)';ctx.strokeStyle=L.visor;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-9,14.5,0,7);ctx.fill();ctx.stroke();
 ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,-9,11.5,3.6,4.4);ctx.stroke();
 if(L.hat&&L.hat!=='nenhum')drawHat(L.hat,t);else{ctx.fillStyle=L.det;ctx.fillRect(-1,-25.5,2,3);ctx.beginPath();ctx.arc(0,-26.5,2,0,7);ctx.fill();}
 ctx.restore();}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function drawStorm(){const sx=G.storm;const left=G.camX-50;if(sx<left)return;
 ctx.save();const g=ctx.createLinearGradient(sx-260,0,sx+40,0);g.addColorStop(0,'rgba(255,90,0,.95)');g.addColorStop(.75,'rgba(255,170,0,.75)');g.addColorStop(1,'rgba(255,220,80,0)');ctx.fillStyle=g;
 ctx.beginPath();ctx.moveTo(left,-20);for(let y=-20;y<=VH+40;y+=20){ctx.lineTo(sx+Math.sin(y*.03+T*5)*18+Math.sin(y*.11-T*7)*8,y);}ctx.lineTo(left,VH+40);ctx.closePath();ctx.fill();
 for(let i=0;i<14;i++){const yy=((i*53+T*120)%(VH+40)),xx=sx+Math.sin(i*7+T*3)*20+10;ctx.fillStyle=i%2?'#ffd93b':'#ff6b00';ctx.globalAlpha=.8;ctx.beginPath();ctx.arc(xx,yy,3+(i%3),0,7);ctx.fill();}
 ctx.restore();}
function drawSpring(a){ctx.save();ctx.translate(a.x,a.y);const h=22*(1-a.sq*.5);
 ctx.fillStyle='#1b5e20';rr(-17,8,34,8,3);ctx.fill();ctx.strokeStyle='#cfd8dc';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=6;i++)ctx.lineTo(i%2?-9:9,8-i*h/6);ctx.stroke();
 if(!LITE()){ctx.shadowColor='#39ff88';ctx.shadowBlur=12;}ctx.fillStyle='#39ff88';rr(-19,8-h-7,38,7,3);ctx.fill();ctx.shadowBlur=0;
 ctx.fillStyle='rgba(57,255,136,'+(.5+.4*Math.sin(T*6))+')';ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillText('▲',0,-h-8);ctx.restore();}
function drawPortal(a){ctx.save();ctx.translate(a.x,a.y);const c=a.in?['#c77dff','#7b2cbf']:['#ffb347','#ff6b00'],dir=a.in?1:-1;
 ctx.globalAlpha=.35;ctx.fillStyle=c[1];ctx.beginPath();ctx.ellipse(0,0,a.r*1.3,a.r*1.7,0,0,7);ctx.fill();ctx.globalAlpha=1;
 for(let i=0;i<3;i++){ctx.strokeStyle=i%2?c[0]:'#fff';ctx.lineWidth=3-i*.6;const s=T*(3+i)*dir;ctx.beginPath();ctx.ellipse(0,0,a.r*(1.2-i*.3),a.r*(1.6-i*.4),0,s,s+4.6);ctx.stroke();}
 ctx.fillStyle='#fff';ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(a.in?'»':'✦',0,0);ctx.restore();}
function drawSat(a){ctx.save();ctx.translate(a.x,a.y);ctx.rotate(a.rot);
 for(const sg of[-1,1]){const x0=sg>0?11:-a.arm,w=a.arm-11;ctx.fillStyle='#1e3a8a';ctx.fillRect(x0,-7,w,14);ctx.strokeStyle='#90caf9';ctx.lineWidth=.8;for(let x=x0+6;x<x0+w;x+=7){ctx.beginPath();ctx.moveTo(x,-7);ctx.lineTo(x,7);ctx.stroke();}ctx.strokeStyle='#ff2e63';ctx.lineWidth=1.5;ctx.strokeRect(x0,-7,w,14);}
 ctx.fillStyle='#cfd8dc';ctx.beginPath();ctx.arc(0,0,11,0,7);ctx.fill();ctx.strokeStyle='#90a4ae';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#ff2e63';ctx.beginPath();ctx.arc(0,0,3.5+Math.sin(T*8),0,7);ctx.fill();ctx.restore();}
function drawProj(p){
 if(p.k==='missile'){drawBanana(p.x,p.y,T*15,1.9,true);return;}
 ctx.save();ctx.translate(p.x,p.y);
 if(p.k==='comet'){const g=ctx.createLinearGradient(0,0,100,0);g.addColorStop(0,'rgba(160,230,255,.9)');g.addColorStop(1,'rgba(160,230,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-p.r);ctx.lineTo(100,-3);ctx.lineTo(100,3);ctx.lineTo(0,p.r);ctx.fill();ctx.fillStyle='#e8fbff';ctx.beginPath();ctx.arc(0,0,p.r,0,7);ctx.fill();ctx.fillStyle='#7fd3ff';ctx.beginPath();ctx.arc(-3,-3,p.r*.5,0,7);ctx.fill();}
 else if(p.k==='met'){const g=ctx.createLinearGradient(0,0,14,-75);g.addColorStop(0,'rgba(255,140,0,.9)');g.addColorStop(1,'rgba(255,80,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-p.r,0);ctx.lineTo(14,-80);ctx.lineTo(p.r,0);ctx.fill();ctx.fillStyle='#6b3b2b';ctx.beginPath();ctx.arc(0,0,p.r,0,7);ctx.fill();ctx.fillStyle='#ff8a00';ctx.beginPath();ctx.arc(-3,3,p.r*.4,0,7);ctx.fill();}
 else if(p.k==='ink'){ctx.fillStyle='#4a148c';ctx.beginPath();ctx.arc(0,0,p.r,0,7);ctx.fill();ctx.fillStyle='#9c4dcc';ctx.beginPath();ctx.arc(-3,-3,p.r*.45,0,7);ctx.fill();}
 ctx.restore();}
function drawBoss(e){ctx.save();ctx.translate(e.x,e.y);const r=e.r,hit=e.hit>0&&Math.floor(T*20)%2;
 ctx.strokeStyle=hit?'#fff':'#8e44ad';ctx.lineCap='round';
 for(let i=0;i<6;i++){const bx=-r*.7+i*r*.28;ctx.lineWidth=9-i*.4;ctx.beginPath();ctx.moveTo(bx,r*.5);const w=Math.sin(T*3+i)*14;ctx.bezierCurveTo(bx+w,r*1.1,bx-w,r*1.5,bx+w*.6,r*2);ctx.stroke();}
 const g=ctx.createRadialGradient(-r*.3,-r*.4,r*.2,0,0,r);g.addColorStop(0,hit?'#fff':'#d17bff');g.addColorStop(1,hit?'#ffd0ff':'#6a1b9a');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,r,r*1.05,0,0,7);ctx.fill();
 ctx.fillStyle='rgba(255,255,255,.15)';[[-.4,-.55,.12],[.35,-.62,.09],[.55,-.1,.1]].forEach(([a,b,c])=>{ctx.beginPath();ctx.arc(a*r,b*r,c*r,0,7);ctx.fill();});
 const m=G.m,an=Math.atan2(m.y-e.y,m.x-e.x);
 for(const sx of[-.35,.15]){ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(sx*r,-r*.1,r*.2,r*.24,0,0,7);ctx.fill();ctx.fillStyle='#1a1020';ctx.beginPath();ctx.arc(sx*r+Math.cos(an)*r*.08,-r*.1+Math.sin(an)*r*.1,r*.1,0,7);ctx.fill();}
 ctx.strokeStyle='#3a0d52';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-r*.58,-r*.44);ctx.lineTo(-r*.18,-r*.3);ctx.moveTo(r*.35,-r*.44);ctx.lineTo(-r*.02,-r*.3);ctx.stroke();
 ctx.fillStyle='#3a0d52';ctx.beginPath();ctx.ellipse(-r*.1,r*.3,r*.16,r*.1+Math.abs(Math.sin(T*4))*r*.06,0,0,7);ctx.fill();
 ctx.restore();}
function drawWorld(){const m=G.m,sk=skin(),Wc=WORLDS[G.wi],VWz=G.vw;
 const sh=G.shake>0?(Math.random()-.5)*G.shake:0,sh2=G.shake>0?(Math.random()-.5)*G.shake:0;
 const sc=S*G.zoom,oy=H-VH*sc;G.sc=sc;G.oy=oy;
 ctx.setTransform(DPR*sc,0,0,DPR*sc,(-G.camX*sc+sh)*DPR,(oy+sh2)*DPR);
 const L0=G.camX-90,R0=G.camX+VWz+90,ab=Wc.abyss;
 const ag=ctx.createLinearGradient(0,VH-90,0,VH);ag.addColorStop(0,`rgba(${ab},0)`);ag.addColorStop(1,`rgba(${ab},.5)`);ctx.fillStyle=ag;ctx.fillRect(G.camX-20,VH-90,VWz+40,140);
 ctx.strokeStyle=`rgba(${ab},.6)`;ctx.lineWidth=2;ctx.beginPath();for(let x=Math.floor(G.camX/20)*20;x<G.camX+VWz+20;x+=20)ctx.lineTo(x,VH-4+Math.sin(x*.05+T*3)*3);ctx.stroke();
 for(const a of G.ast){if(a.x<L0||a.x>R0)continue;if(a.type==='hole')drawHole(a);else if(a.type==='portal')drawPortal(a);}
 for(const a of G.ast){if(a.x<L0||a.x>R0)continue;if(a.type==='rock')drawRock(a,a===G.target&&!G.dead);else if(a.type==='spike')drawSpike(a);else if(a.type==='spring')drawSpring(a);else if(a.type==='sat')drawSat(a);}
 for(const it of G.items)if(it.x>G.camX-40&&it.x<G.camX+VWz+40)drawItem(it);
 if(G.magnet>0&&!G.dead){ctx.strokeStyle='rgba(255,77,141,'+(.15+.1*Math.sin(T*8))+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(m.x,m.y,magRange(),0,7);ctx.stroke();}
 if(G.teth){const a=G.teth.a,dx=m.x-a.x,dy=m.y-a.y,d=Math.hypot(dx,dy)||1,ex=a.x+dx/d*a.r,ey=a.y+dy/d*a.r;
  const hx=m.x+Math.cos(m.ang-Math.PI/2)*30,hy=m.y+Math.sin(m.ang-Math.PI/2)*30;
  ctx.strokeStyle='rgba(127,211,255,.35)';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(ex,ey);ctx.stroke();
  const rk=Dz().ropeT?clamp(G.tethT/Dz().ropeT,0,1):0;ctx.strokeStyle=rk>.65?(Math.floor(T*14)%2?'#ff2e63':'#ffd0d8'):'#e8fbff';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(hx,hy);const segs=8;for(let i=1;i<=segs;i++){const t=i/segs;ctx.lineTo(lerp(hx,ex,t)+(i<segs?Math.sin(T*40+i)*1.5:0),lerp(hy,ey,t)+(i<segs?Math.cos(T*40+i)*1.5:0));}ctx.stroke();
  ctx.fillStyle='#7fd3ff';ctx.beginPath();ctx.arc(ex,ey,4,0,7);ctx.fill();}
 for(const p of G.fx){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.c;if(p.ch){ctx.font=`${p.s}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.ch,p.x,p.y);}else if(p.ban){drawBanana(p.x,p.y,p.rot+T*3,p.s);}else if(p.gift){ctx.fillRect(p.x-p.s,p.y-p.s,p.s*2,p.s*2);ctx.fillStyle='#fff';ctx.fillRect(p.x-.8,p.y-p.s,1.6,p.s*2);ctx.fillRect(p.x-p.s,p.y-.8,p.s*2,1.6);}else if(p.bub){ctx.strokeStyle=p.c;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,7);ctx.stroke();}else if(p.ring){ctx.strokeStyle=p.c;ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,p.s*(2-p.life/p.max),0,7);ctx.stroke();}else{ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,7);ctx.fill();}}ctx.globalAlpha=1;
 if(!G.dead){if(G.rocket>0){ctx.save();ctx.translate(m.x,m.y);ctx.fillStyle='#ff8a00';ctx.globalAlpha=.35+.2*Math.sin(T*30);ctx.beginPath();ctx.ellipse(-8,0,34,22,0,0,7);ctx.fill();ctx.restore();ctx.globalAlpha=1;}
  if(G.teth&&Dz().cue>0){const sp=Math.hypot(m.vx,m.vy);if(G.tethT>.3&&sp>520&&m.vx>200&&m.vy<-60){ctx.fillStyle='rgba(57,255,136,'+(.25+.15*Math.sin(T*20))+')';ctx.beginPath();ctx.arc(m.x,m.y-3,30,0,7);ctx.fill();
   if(Dz().cue>1){ctx.font='900 18px system-ui';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='rgba(15,6,35,.9)';ctx.strokeText('SOLTE!',m.x,m.y-42);ctx.fillStyle='#39ff88';ctx.fillText('SOLTE!',m.x,m.y-42);}}}
  if(!(G.inv>0&&Math.floor(T*16)%2)){ctx.save();ctx.translate(m.x,m.y);ctx.scale(1.25,1.25);drawMonkey(0,0,m.ang,sk,{teth:!!G.teth,jet:G.jetOn,scared:G.scared&&G.happy<=0&&G.rocket<=0,happy:G.happy>0||G.rocket>0});ctx.restore();}
  if(G.t<4){ctx.globalAlpha=clamp(4-G.t,0,1);ctx.font='900 13px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';ctx.lineWidth=3;ctx.strokeStyle='rgba(15,6,35,.9)';ctx.strokeText(SAVE.name,m.x,m.y-48);ctx.fillStyle='#7fd3ff';ctx.fillText(SAVE.name,m.x,m.y-48);ctx.globalAlpha=1;}
  if(G.shield>0){ctx.strokeStyle='rgba(127,211,255,'+(.6+.25*Math.sin(T*6))+')';ctx.lineWidth=3;ctx.fillStyle='rgba(127,211,255,.12)';ctx.beginPath();ctx.arc(m.x,m.y-3,33,0,7);ctx.fill();ctx.stroke();}}
 for(const p of G.proj)drawProj(p);
 if(G.ev&&G.ev.k==='boss')drawBoss(G.ev);
 drawStorm();
 for(const t of G.txt){ctx.globalAlpha=Math.min(1,t.life*2);ctx.font=`900 ${t.sz}px system-ui,sans-serif`;ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='rgba(20,8,40,.9)';ctx.strokeText(t.s,t.x,t.y);ctx.fillStyle=t.c;ctx.fillText(t.s,t.x,t.y);}ctx.globalAlpha=1;
}
function btnPos(k){const R=Math.min(58*k,H*.17),pad=16*k+R,y=H-pad,sw=!!SAVE.set.swap;return{jet:{x:sw?W-pad:pad,y,R},grab:{x:sw?pad:W-pad,y,R}};}
function drawButtons(k){const P=btnPos(k);
 const btn=(B,on,ic,lb,col,ring,ringCol,glow)=>{const x=B.x,y=B.y,R=B.R;ctx.save();ctx.globalAlpha=on?.95:.55;ctx.fillStyle=on?col:'rgba(20,10,50,.55)';ctx.strokeStyle=col;ctx.lineWidth=3*k;
  if(glow&&!LITE()){ctx.shadowColor=col;ctx.shadowBlur=18*k;}ctx.beginPath();ctx.arc(x,y,on?R*.93:R,0,7);ctx.fill();ctx.stroke();ctx.shadowBlur=0;
  if(ring!=null){ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=6*k;ctx.beginPath();ctx.arc(x,y,R+7*k,0,7);ctx.stroke();ctx.strokeStyle=ringCol;ctx.beginPath();ctx.arc(x,y,R+7*k,-Math.PI/2,-Math.PI/2+6.283*Math.max(0,ring));ctx.stroke();}
  ctx.globalAlpha=on?1:.85;ctx.font=`${R*.7}px system-ui,"Apple Color Emoji","Segoe UI Emoji"`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(ic,x,y-R*.1);
  ctx.font=`900 ${Math.max(10,R*.24)}px system-ui,sans-serif`;ctx.fillStyle='#fff';ctx.fillText(lb,x,y+R*.55);ctx.restore();};
 const fr=G.fuel/fuelMax();btn(P.jet,input.jet,'🔥','JETPACK','#ff8a00',fr,fr<.25?'#ff2e63':'#ffd93b',false);
 const D=Dz();const rp=G.teth&&D.ropeT?1-G.tethT/D.ropeT:null;
 btn(P.grab,input.grab,'🤚','CORDA','#3fa9ff',rp,rp!=null&&rp<.35?'#ff2e63':'#7fd3ff',!!G.target&&!G.teth);}
function hudText(s,x,y,sz,col='#fff',al='left'){ctx.font=`900 ${sz}px system-ui,sans-serif`;ctx.textAlign=al;ctx.textBaseline='top';ctx.lineWidth=Math.max(3,sz/6);ctx.strokeStyle='rgba(15,6,35,.85)';ctx.strokeText(s,x,y);ctx.fillStyle=col;ctx.fillText(s,x,y);}
function drawTut(k){const t=G.tut;if(!t)return;const B=btnPos(k);let msg=null,sub=null,btn=null;
 if(t.s===1){msg=isTouch?'SEGURE o botão 🤚 CORDA':'SEGURE a tecla ESPAÇO';sub='para agarrar o asteroide que está brilhando';btn=B.grab;}
 else if(t.s===3){msg=isTouch?'SOLTE o botão 🤚 CORDA agora!':'SOLTE o ESPAÇO agora!';sub='Soltar subindo = voo bem longo 🚀';btn=B.grab;}
 else if(t.s===5){msg=isTouch?'SEGURE 🔥 JETPACK para subir':'SEGURE a SETA ↑ para o jetpack';sub='Cuidado com o abismo lá embaixo!';btn=B.jet;}
 else if(t.s===6){msg=`Agora é com você, ${SAVE.name}! 🐵`;sub='Fuja da tempestade e vá o mais longe que puder';}
 else return;
 hudText(msg,W/2,H*.28,24*k,'#ffd93b','center');if(sub)hudText(sub,W/2,H*.28+32*k,15*k,'#fff','center');
 if(btn&&isTouch&&G.tutFreeze){const bob=Math.sin(T*8)*8*k;ctx.strokeStyle='rgba(255,217,59,'+(.5+.5*Math.sin(T*8))+')';ctx.lineWidth=5*k;ctx.beginPath();ctx.arc(btn.x,btn.y,btn.R+16*k,0,7);ctx.stroke();
  ctx.font=`${44*k}px system-ui,"Apple Color Emoji"`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText('👇',btn.x,btn.y-btn.R-38*k+bob);}}
function drawHUD(){ctx.setTransform(DPR,0,0,DPR,0,0);const k=clamp(H/400,.75,1.4),pad=12*k,m=G.m,sp=Math.hypot(m.vx,m.vy);
 if(!LITE()&&sp>720&&!G.dead){const al=clamp((sp-720)/380,0,1)*.4;ctx.strokeStyle=`rgba(255,255,255,${al})`;ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<16;i++){const y=(i*61.7+Math.floor(T*6+i*.37)*137)%H,x=W-((T*2600+i*397)%(W+400)),len=60+(i%5)*35;ctx.moveTo(x,y);ctx.lineTo(x+len,y);}ctx.stroke();}
 if(G.flash>0){ctx.fillStyle=`rgba(255,230,120,${G.flash*1.2})`;ctx.fillRect(0,0,W,H);}
 const Wd=WORLDS[G.wi];
 hudText(`${Math.floor(G.dist)} m`,pad,pad,30*k);
 if(G.mode==='tutorial')hudText('🎓 TUTORIAL',pad,pad+34*k,14*k,'#ffd93b');
 else if(G.pr)hudText(`🧪 TREINO · quedas: ${G.falls}`,pad,pad+34*k,14*k,'#39ff88');
 else if(G.mode==='daily')hudText(`📅 Meta ${G.chalTarget} m${G.chalDone?' ✔':''}`,pad,pad+34*k,14*k,'#7fd3ff');
 else hudText(`🏆 ${Math.max(SAVE.bestD[G.diff],Math.floor(G.dist))} m · ${Dz().nome}`,pad,pad+34*k,14*k,Dz().cor);
 const fx=pad,fy=pad+56*k,fw=120*k,fh=12*k;hudText('⛽',fx,fy-3*k,14*k);ctx.fillStyle='rgba(0,0,0,.5)';rr(fx+22*k,fy,fw,fh,fh/2);ctx.fill();const fr=G.fuel/fuelMax();ctx.fillStyle=fr<.25?'#ff2e63':'#ff8a00';if(fr>0){rr(fx+22*k,fy,Math.max(fh,fw*fr),fh,fh/2);ctx.fill();}
 hudText(`${Wd.ic} ${Wd.nome}`,pad,pad+74*k,11*k,'rgba(255,255,255,.75)');
 hudText(`🍌 ${G.ban}`,W/2,pad,26*k,'#ffe14d','center');
 const mu=mult();if(mu>1)hudText(`x${mu}`,W/2+70*k,pad+2*k,20*k,'#ff8a00','left');
 if(G.combo>=2)hudText(`COMBO ${G.combo}`,W/2,pad+32*k,15*k,'#ffb36b','center');
 if(G.ev){const e=G.ev;if(e.k==='boss'){hudText('🐙 '+'❤️'.repeat(Math.max(0,e.hp))+'🖤'.repeat(Math.max(0,e.max-e.hp)),W/2,pad+52*k,18*k,'#fff','center');hudText(`Faça PERFEITOS para atacar! · ${Math.max(0,Math.ceil(e.dur-e.t))}s`,W/2,pad+76*k,12*k,'#e0b0ff','center');}
  else hudText(`☄️ CHUVA DE METEOROS · ${Math.max(0,Math.ceil(e.dur-e.t))}s`,W/2,pad+52*k,15*k,'#ff8a00','center');}
 let px=W-70*k;const pw=[];if(G.shield>0)pw.push(['🛡️',1]);if(G.magnet>0)pw.push(['🧲',G.magnet/magTime()]);if(G.rocket>0)pw.push(['🚀',G.rocket/3]);
 for(const p of pw){ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.arc(px,pad+22*k,18*k,0,7);ctx.fill();ctx.strokeStyle='#ffd93b';ctx.lineWidth=3*k;ctx.beginPath();ctx.arc(px,pad+22*k,18*k,-Math.PI/2,-Math.PI/2+p[1]*6.28);ctx.stroke();ctx.font=`${18*k}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p[0],px,pad+23*k);px-=44*k;}
 const sd=(G.m.x-G.storm)/10;if(G.storm<G.camX&&sd<70){const a=.5+.5*Math.sin(T*10);ctx.globalAlpha=a;hudText(`☀️ ${Math.max(0,Math.floor(sd))} m`,pad,H/2-10*k,18*k,'#ff8a00');ctx.globalAlpha=1;}
 for(const w of G.warn){ctx.globalAlpha=Math.floor(T*10)%2?1:.35;if(w.k==='comet')hudText('⚠️',W-115*k,G.oy+w.y*G.sc-14*k,28*k,'#ff2e63','center');else hudText('⚠️',(w.x-G.camX)*G.sc,G.oy+6*k,22*k,'#ff8a00','center');}ctx.globalAlpha=1;
 if(G.banner){const b=G.banner,a=clamp(Math.min(b.t,(3.2-b.t)*4),0,1),s=1+Math.max(0,b.t-2.95)*1.6;ctx.globalAlpha=a;ctx.save();ctx.translate(W/2,H*.3);ctx.scale(s,s);hudText(b.txt,0,0,28*k,b.col,'center');if(b.sub)hudText(b.sub,0,34*k,14*k,'#fff','center');ctx.restore();ctx.globalAlpha=1;}
 if(G.tut&&G.tutFreeze){ctx.fillStyle='rgba(5,2,20,.5)';ctx.fillRect(0,0,W,H);}
 drawButtons(k);drawTut(k);}
function drawSnowOverlay(){ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle='#fff';const n=LITE()?25:55;for(let i=0;i<n;i++){const x=((i*137.5+Math.sin(T+i)*20)%W+W)%W,y=((i*91.7+T*(30+i%6*9))%(H+20))-10,z=1.5+(i%3);ctx.globalAlpha=.5+.15*(i%3);ctx.beginPath();ctx.arc(x,y,z,0,7);ctx.fill();}ctx.globalAlpha=1;}
function render(){ctx.setTransform(DPR,0,0,DPR,0,0);
 if(G&&state!=='menu'){drawBG(G.camX);drawWorld();drawHUD();}
 else{drawBG(menuCam);ctx.setTransform(DPR*S,0,0,DPR*S,0,0);const cx=VW*.18,cy=VH*.5+Math.sin(T*1.5)*18;
  for(let i=0;i<6;i++){const a=T*.6+i;drawBanana(cx+Math.cos(a)*70,cy+Math.sin(a)*50,a,1.2);}
  ctx.save();ctx.translate(cx,cy);ctx.scale(2.6,2.6);drawMonkey(0,0,Math.sin(T)*.25,skin(),{jet:1});ctx.restore();if(seasonOn('natal'))drawSnowOverlay();}
}

/* ---------- LOOP ---------- */
let last=performance.now(),acc=0;
function loop(now){const rdt=Math.min(.05,(now-last)/1000);last=now;T+=rdt;
 if(state==='menu')menuCam+=rdt*120;
 if(state==='play'||state==='dying'){let ts=1;if(G.slow>0){G.slow-=rdt;ts=.35;}if(G.pr&&+G.pr.slow)ts*=.7;if(G.tutFreeze)ts=.06;acc+=rdt*ts;const h=1/120;let n=0;while(acc>=h&&n<8){step(h);acc-=h;n++;}if(n>=8)acc=0;
  if(state==='play'&&!G.fpsDone){G.fpsT+=rdt;G.fpsN++;if(G.fpsT>=4){G.fpsDone=true;const fps=G.fpsN/G.fpsT;
   if(fps<40&&!SAVE.set.lite&&!SAVE.set.liteAsked){SAVE.set.lite=true;SAVE.set.liteAsked=true;persist();resize();toast('⚡ Modo leve ativado para o jogo rodar mais liso<br><small>(dá para mudar em Config)</small>');}}}}
 musicTick();
 if($('#shop').classList.contains('show'))drawShopPreview();
 render();requestAnimationFrame(loop);}

