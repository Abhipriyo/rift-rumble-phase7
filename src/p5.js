/* ================= PHASE 5: PROGRESSION =================
   Upgrades with rarity, categories and stack caps; wave bounties; milestone and boss rewards;
   persistent medals and a local player profile; an end-of-run summary built from real counters. */
const RAR={common:{n:'COMMON',c:'#CDBDF0',w:60,k:0},rare:{n:'RARE',c:'#3EE6FF',w:30,k:1},epic:{n:'EPIC',c:'#FFB03A',w:10,k:2}};
const CATN={offense:'Offense',defense:'Defense',mobility:'Mobility',meter:'Meter',special:'Special',utility:'Utility'};
const UPG5=[
  {id:'power',n:'Power Gloves',d:'All your hits deal 20% more damage.',cat:'offense',r:'common',max:3},
  {id:'heavy',n:'Heavy Hitter',d:'Combo finishers launch 30% farther.',cat:'offense',r:'common',max:3},
  {id:'combo',n:'Combo Fuel',d:'While your combo is 5+ hits, every hit deals 15% more damage.',cat:'offense',r:'rare',max:1},
  {id:'jump',n:'Sky Step',d:'One extra mid-air jump.',cat:'mobility',r:'common',max:2},
  {id:'speed',n:'Turbo Sneakers',d:'Run 20% faster.',cat:'mobility',r:'common',max:2},
  {id:'dodge',n:'Afterimage',d:'Dashes travel 25% farther and stay invulnerable 0.08 s longer.',cat:'mobility',r:'rare',max:2},
  {id:'airdash',n:'Air Drift',d:'One extra dash in the air.',cat:'mobility',r:'rare',max:1},
  {id:'meter',n:'Hype Battery',d:'Super meter fills 50% faster.',cat:'meter',r:'common',max:2},
  {id:'awake',n:'Long Fuse',d:'Awaken lasts 4 seconds longer.',cat:'meter',r:'rare',max:2},
  {id:'multi',n:'Double Trouble',d:'Specials fire one extra projectile.',cat:'special',r:'rare',max:2},
  {id:'boom',n:'Spicy Specials',d:'Your projectiles explode and shove everyone nearby.',cat:'special',r:'rare',max:1},
  {id:'sig',n:'Signature Mastery',d:'{special} recharges 30% faster.',cat:'special',r:'epic',max:2},
  {id:'armor',n:'Tough Cookie',d:'Take 25% less damage.',cat:'defense',r:'common',max:2},
  {id:'guardup',n:'Iron Guard',d:'Perfect-guard window 0.06 s longer, and guarding takes half the chip damage.',cat:'defense',r:'common',max:2},
  {id:'recover',n:'Quick Recovery',d:'You recover from hits 25% sooner.',cat:'defense',r:'rare',max:2},
  {id:'aegis',n:'Rift Aegis',d:'Every wave starts with a shield that blocks the first hit.',cat:'defense',r:'epic',max:1},
  {id:'vamp',n:'Rift Siphon',d:'Every knockout removes 6% of your damage.',cat:'utility',r:'rare',max:2},
  {id:'heal',n:'Snack Break',d:'Reset your damage to 0% right now.',cat:'utility',r:'common',max:99},
  {id:'life',n:'Second Wind',d:'Gain one extra life (up to 5).',cat:'utility',r:'rare',max:99}
];
const upgDef=id=>UPG5.find(u=>u.id===id);
function upgText(u){return u.d.replace('{special}',HEROES[G.hero]?HEROES[G.hero].special.name:'Your special');}
function upgAvail(u,minR){if(minR&&RAR[u.r].k<RAR[minR].k)return false;if(u.r==='epic'&&G.wave<4&&!minR)return false;
  if(u.id==='heal')return !!P&&P.pct>=35;if(u.id==='life')return !!P&&P.stocks<5;return upg(u.id)<u.max;}
/* three offers, weighted by rarity, from three different categories whenever possible */
function rollUpgrades(minR){
  let pool=UPG5.filter(u=>upgAvail(u,minR));if(pool.length<3)pool=UPG5.filter(u=>upgAvail(u,null));
  const out=[],cats=new Set();
  while(out.length<3&&pool.length){let cand=pool.filter(u=>!cats.has(u.cat));if(!cand.length)cand=pool;
    let s=0;cand.forEach(u=>s+=RAR[u.r].w);let r=Math.random()*s,pick=cand[0];for(const u of cand){r-=RAR[u.r].w;if(r<=0){pick=u;break;}}
    out.push(pick);cats.add(pick.cat);pool=pool.filter(u=>u!==pick);}
  return out;}

/* ---------- run progress (reset every run) ---------- */
const PROG={reset(){Object.assign(this,{active:true,recorded:false,upgrades:[],tokens:0,bounties:0,bountiesTried:0,milestones:[],newMedals:[],perfects:0,airHits:0,rareNext:false,offer:null,bestBefore:null});},active:false};
const OFFER_EVERY=2;
function offersAfter(w){return w===1||w%OFFER_EVERY===0;}

/* ---------- bounties: one clear, measurable condition per wave ---------- */
const BOUNTY=[
  {id:'untouched',n:'Untouchable',d:'Clear the wave without taking damage',start(b){b.v0=STATS.taken;},fail(b){return STATS.taken>b.v0;},end(b){return STATS.taken===b.v0;}},
  {id:'combo15',n:'Combo Artist',d:'Land a 15-hit combo',live(){return G.hits>=15;}},
  {id:'perfect2',n:'Iron Wall',d:'Land 2 perfect guards',start(b){b.v0=PROG.perfects;},live(b){return PROG.perfects-b.v0>=2;},prog(b){return Math.min(2,PROG.perfects-b.v0)+'/2';}},
  {id:'air10',n:'Air Show',d:'Land 10 hits while airborne',start(b){b.v0=PROG.airHits;},live(b){return PROG.airHits-b.v0>=10;},prog(b){return Math.min(10,PROG.airHits-b.v0)+'/10';}},
  {id:'triple',n:'Triple Threat',d:'Knock out 3 enemies in a quick chain',live(){return G.koCombo>=3&&G.time-G.lastKO<.1;}},
  {id:'blitz',n:'Blitz',d:'Clear the wave in under {t} s',start(b){b.limit=Math.round(14+G.queue.length*4);b.t0=G.time;},fail(b){return G.time-b.t0>b.limit;},end(b){return G.time-b.t0<=b.limit;},prog(b){return Math.max(0,Math.ceil(b.limit-(G.time-b.t0)))+' s left';}}
];
function waveStarted(boss,clone){
  G.bounty=null;if(P&&upg('aegis'))P.aegis=1;
  if(G.mode!=='endless'||clone||G.wave<2)return;
  const opts=BOUNTY.filter(b=>!(boss&&(b.id==='blitz'||b.id==='untouched')));const def=opts[Math.floor(Math.random()*opts.length)];
  const b={def,done:false,failed:false};if(def.start)def.start(b);G.bounty=b;PROG.bountiesTried++;
}
function bountyText(b){return b.def.d.replace('{t}',b.limit);}
function bountyComplete(b){b.done=true;PROG.bounties++;PROG.tokens++;addScore(200*G.wave);sfx('perfect');
  pop(P.x,P.y-P.h-40,'BOUNTY! +1 REROLL','#7DFF8A',30);G.toast={t:0,dur:2.6,text:'BOUNTY COMPLETE: '+b.def.n+' · +1 reroll · +'+200*G.wave};
  const tot=(PROF.data.bounties||0)+PROG.bounties;if(tot>=10)medal('bounty10');}
function progTick(dt){
  const b=G.bounty;if(b&&!b.done&&!b.failed){if(b.def.fail&&b.def.fail(b)){b.failed=true;}else if(b.def.live&&b.def.live(b))bountyComplete(b);}
  if(G.maxHits>=25)medal('combo25');
}
function waveCleared(){
  if(G.mode!=='endless')return;const w=G.wave,b=G.bounty;
  if(b&&!b.done&&!b.failed){if(b.def.end&&b.def.end(b))bountyComplete(b);else b.failed=true;}
  if(w===1)medal('first');if(w>=10)medal('wave10');if(w>=20)medal('wave20');
  if(w%5===0){PROG.milestones.push(w);PROG.tokens++;if(P)P.meter=Math.min(200,P.meter+100);addScore(500*w);
    G.toast={t:0,dur:3,text:'MILESTONE: WAVE '+w+' CLEARED · +1 reroll · +1 super bar · +'+500*w};}
}
function afterWave(){
  if(G.mode==='endless'&&offersAfter(G.wave))showUpgrades();
  else{const nx=G.wave+(G.wave%OFFER_EVERY===0?OFFER_EVERY:1);startWave();if(G.banner&&!G.banner.sub)G.banner.sub='Next power-up after wave '+nx;}
}
function bossReward(f){
  PROG.rareNext=true;if(P&&P.stocks<5){P.stocks++;}medal('boss1');
  const bt=PROF.data.bossTypes||{};bt[f.cosId]=1;PROF.data.bossTypes=bt;if(Object.keys(bt).length>=3)medal('boss3');profSave();
  G.toast={t:0,dur:3,text:'BOSS REWARD: +1 life · next power-ups are rare or better'};
}

/* ---------- upgrade screen ---------- */
function showUpgrades(){
  G.screen='upgrade';const minR=PROG.rareNext?'rare':null;
  PROG.offer=rollUpgrades(minR);renderOffer();
  $('upgTitle').textContent='WAVE '+G.wave+' CLEAR!';
  const info=[];const b=G.bounty;if(b)info.push('Bounty "'+b.def.n+'": '+(b.done?'complete':'missed'));
  if(minR)info.push('Boss reward: rare or better');
  $('upgInfo').textContent=info.join(' · ');
  show('ovUpg',true);const f=$('upgList').querySelector('button');if(f)f.focus();
  waveRecap();saveClone();
}
function renderOffer(){
  const list=$('upgList');list.innerHTML='';
  PROG.offer.forEach(u=>{const b=document.createElement('button');b.type='button';b.className='pick';b.style.borderColor=RAR[u.r].c;b.dataset.id=u.id;
    const tg=document.createElement('span');tg.className='rar';tg.style.color=RAR[u.r].c;tg.textContent=RAR[u.r].n+' · '+CATN[u.cat].toUpperCase();b.appendChild(tg);
    const s=document.createElement('strong');s.textContent=u.n;b.appendChild(s);
    const sm=document.createElement('small');const have=upg(u.id);sm.textContent=upgText(u)+(u.max<99?' ('+have+'/'+u.max+')':'');b.appendChild(sm);
    b.addEventListener('click',()=>applyUpgrade(u.id));list.appendChild(b);});
  const rb=$('rerollBtn');rb.hidden=PROG.tokens<=0;rb.textContent='Reroll ('+PROG.tokens+' left)';
  const bl=$('buildLine');bl.textContent=PROG.upgrades.length?'Your build: '+PROG.upgrades.map(id=>upgDef(id).n).join(', '):'Your build: no power-ups yet.';
}
function reroll(){if(PROG.tokens<=0)return;PROG.tokens--;sfx('ui');PROG.offer=rollUpgrades(PROG.rareNext?'rare':null);renderOffer();}
function applyUpgrade(id){
  sfx('ui');const u=upgDef(id);
  if(id==='heal')P.pct=0;else if(id==='life')P.stocks=Math.min(5,P.stocks+1);else G.upg[id]=upg(id)+1;
  if(PROG.active)PROG.upgrades.push(id);PROG.rareNext=false;
  show('ovUpg',false);G.screen='play';startWave();lastT=performance.now();
  if(u)pop(P.x,P.y-P.h-30,u.n.toUpperCase()+'!',RAR[u.r].c,28);
}

/* ---------- medals (persistent) ---------- */
const MEDALS=[
  ['first','First Steps','Clear wave 1'],['wave10','Rift Veteran','Clear wave 10'],['wave20','Rift Legend','Clear wave 20'],
  ['boss1','Boss Breaker','Defeat a boss'],['boss3','Boss Collector','Defeat all three boss types'],['combo25','Combo Maestro','Land a 25-hit combo'],
  ['perfect','Perfect Timing','Land a perfect guard'],['bounty10','Bounty Hunter','Complete 10 bounties'],['clone','Know Thyself','Defeat your Shadow Clone'],
  ['echo','Echo Chamber','Win an Echo Duel'],['uni4','Multiverse Tourist','Play a run in all four universes'],['all12','Full Roster','Play a run with all 12 heroes']];
function medal(id){if(!PROF.data.medals||PROF.data.medals[id])return;const m=MEDALS.find(x=>x[0]===id);if(!m)return;
  PROF.data.medals[id]=Date.now();PROG.newMedals.push(id);profSave();
  if(G.screen==='play')G.toast={t:0,dur:3,text:'MEDAL UNLOCKED: '+m[1]+' · '+m[2]};}

/* ---------- local profile (this browser only) ---------- */
const PROF_KEY='rrProfile1';
function profDefault(){return {v:1,matches:0,kos:0,bestWave:0,bestCombo:0,bestScore:0,bosses:0,bossTypes:{},bestTime:0,bounties:0,echo:{played:0,won:0},heroes:{},unis:{},medals:{},recent:[]};}
function profSanitize(d){const o=profDefault();if(!d||typeof d!=='object'||Array.isArray(d))return o;
  const num=v=>Number.isFinite(+v)&&+v>=0?+v:0;
  ['matches','kos','bestWave','bestCombo','bestScore','bosses','bestTime','bounties'].forEach(k=>o[k]=num(d[k]));
  const map=(src,ok)=>{const r={};if(src&&typeof src==='object'&&!Array.isArray(src))for(const k in src){if(ok(k))r[k]=num(src[k]);}return r;};
  o.heroes=map(d.heroes,k=>!!HEROES[k]);o.unis=map(d.unis,k=>!!UNIS[k]);o.medals=map(d.medals,k=>MEDALS.some(m=>m[0]===k));o.bossTypes=map(d.bossTypes,k=>!!BOSSDEF[k]);
  if(d.echo&&typeof d.echo==='object'){o.echo.played=num(d.echo.played);o.echo.won=Math.min(num(d.echo.won),o.echo.played);}
  if(Array.isArray(d.recent))o.recent=d.recent.filter(r=>r&&typeof r==='object'&&HEROES[r.hero]).slice(0,10).map(r=>({d:num(r.d),hero:r.hero,mode:r.mode==='echo'?'echo':'endless',
    wave:num(r.wave),kos:num(r.kos),combo:num(r.combo),score:num(r.score),time:num(r.time),dealt:num(r.dealt),taken:num(r.taken),bosses:num(r.bosses),result:String(r.result||'').slice(0,60)}));
  return o;}
const PROF={data:profDefault(),status:'ok'};
function profLoad(){let raw=null;try{raw=localStorage.getItem(PROF_KEY);}catch(e){PROF.status='unavailable';PROF.data=profDefault();return;}
  if(!raw){PROF.data=profDefault();PROF.status='ok';return;}
  try{PROF.data=profSanitize(JSON.parse(raw));PROF.status='ok';}catch(e){PROF.data=profDefault();PROF.status='corrupt';}}
function profSave(){try{localStorage.setItem(PROF_KEY,JSON.stringify(PROF.data));if(PROF.status!=='corrupt')PROF.status='ok';}catch(e){PROF.status='unavailable';}}
function profReset(){PROF.data=profDefault();try{localStorage.removeItem(PROF_KEY);PROF.status='ok';}catch(e){PROF.status='unavailable';}}
profLoad();
function favHero(){let b=null;for(const k in PROF.data.heroes)if(!b||PROF.data.heroes[k]>PROF.data.heroes[b])b=k;return b;}
function recordRun(result){
  if(!PROG.active||PROG.recorded||G.mode!=='endless')return null;PROG.recorded=true;PROG.active=false;
  const D=PROF.data;const before={wave:D.bestWave,combo:D.bestCombo,score:D.bestScore,time:D.bestTime};PROG.bestBefore=before;
  D.matches++;D.kos+=G.kos;D.bestWave=Math.max(D.bestWave,G.wave);D.bestCombo=Math.max(D.bestCombo,G.maxHits);D.bestScore=Math.max(D.bestScore,G.score);
  D.bosses+=STATS.bosses;D.bestTime=Math.max(D.bestTime,G.time);D.bounties+=PROG.bounties;
  D.heroes[G.hero]=(D.heroes[G.hero]||0)+1;D.unis[G.uni]=(D.unis[G.uni]||0)+1;
  const res=result==='quit'?'Quit on wave '+G.wave:'Knocked out on wave '+G.wave;
  D.recent.unshift({d:Date.now(),hero:G.hero,mode:'endless',wave:G.wave,kos:G.kos,combo:G.maxHits,score:G.score,time:Math.round(G.time),dealt:Math.round(STATS.dealt),taken:Math.round(STATS.taken),bosses:STATS.bosses,result:res});
  D.recent=D.recent.slice(0,10);
  if(Object.keys(D.unis).length>=4)medal('uni4');if(Object.keys(D.heroes).length>=12)medal('all12');
  profSave();return res;}
function recordEcho(res){if(res!=='win'&&res!=='lose')return;const D=PROF.data;D.echo.played++;if(res==='win'){D.echo.won++;medal('echo');}
  D.recent.unshift({d:Date.now(),hero:G.hero,mode:'echo',wave:0,kos:0,combo:G.maxHits,score:0,time:Math.round(CLONE.lastDuel?CLONE.lastDuel.dur:0),dealt:Math.round(CLONE.lastDuel?CLONE.lastDuel.toClone:0),taken:Math.round(CLONE.lastDuel?CLONE.lastDuel.byClone:0),bosses:0,result:res==='win'?'Echo Duel won':'Echo Duel lost'});
  D.recent=D.recent.slice(0,10);profSave();}

/* ---------- run summary (game over) ---------- */
const fmtT=s=>{s=Math.round(s);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
function buildSummary(res){
  const box=$('sumBox');box.innerHTML='';const B=PROG.bestBefore||{wave:0,combo:0,score:0,time:0};
  const rec=(v,b)=>v>b&&b>0?' · NEW BEST':'';
  const k=document.createElement('dl');k.className='kv';k.id='sumKV';box.appendChild(k);
  kv('sumKV',[['Final result',res||'Knocked out on wave '+G.wave],['Highest wave',G.wave+rec(G.wave,B.wave)],['Score',G.score+rec(G.score,B.score)],['Enemies defeated',String(G.kos)],
    ['Best combo',G.maxHits+' hits'+rec(G.maxHits,B.combo)],['Damage dealt',Math.round(STATS.dealt)+'%'],['Damage received',Math.round(STATS.taken)+'%'],
    ['Bosses defeated',String(STATS.bosses)],['Bounties completed',PROG.bounties+' of '+PROG.bountiesTried],['Survival time',fmtT(G.time)+rec(G.time,B.time)]]);
  const up=document.createElement('div');up.className='chips sumUp';const h=document.createElement('span');h.className='sumH';h.textContent='Power-ups selected:';up.appendChild(h);
  if(!PROG.upgrades.length){const s=document.createElement('span');s.className='chip';s.textContent='none';up.appendChild(s);}
  PROG.upgrades.forEach(id=>{const u=upgDef(id);const s=document.createElement('span');s.className='chip';s.style.borderColor=RAR[u.r].c;s.style.color=RAR[u.r].c;s.textContent=u.n;up.appendChild(s);});box.appendChild(up);
  if(PROG.newMedals.length){const m=document.createElement('p');m.className='sumMed';m.textContent='Medals unlocked: '+PROG.newMedals.map(id=>MEDALS.find(x=>x[0]===id)[1]).join(', ');box.appendChild(m);}
}

/* ---------- profile screen ---------- */
let resetArm=false;
function openProfile(){
  const D=PROF.data;resetArm=false;$('profReset').textContent='Reset statistics';
  const st=$('profStatus');st.textContent=PROF.status==='unavailable'?'Browser storage is unavailable here, so stats from this session will not be saved.':PROF.status==='corrupt'?'Saved statistics were unreadable and have been reset.':'';
  const fh=favHero();
  kv('profKV',[['Matches played',String(D.matches)],['Enemies defeated',String(D.kos)],['Highest wave',String(D.bestWave)],['Highest combo',D.bestCombo+' hits'],['Best score',String(D.bestScore)],
    ['Favourite hero',fh?HEROES[fh].name+' ('+D.heroes[fh]+(D.heroes[fh]===1?' run)':' runs)'):'none yet'],['Bosses defeated',String(D.bosses)],['Best survival time',fmtT(D.bestTime)],
    ['Bounties completed',String(D.bounties)],['Echo Duels won',D.echo.won+' of '+D.echo.played]]);
  const mg=$('profMedals');mg.innerHTML='';MEDALS.forEach(([id,n,d])=>{const e=document.createElement('div');const got=!!D.medals[id];e.className='medal'+(got?' got':'');
    const s=document.createElement('strong');s.textContent=(got?'★ ':'☆ ')+n;const sm=document.createElement('small');sm.textContent=d;e.appendChild(s);e.appendChild(sm);mg.appendChild(e);});
  $('profMedCount').textContent=Object.keys(D.medals).length+' / '+MEDALS.length;
  const tb=$('profRecent');tb.innerHTML='';
  if(!D.recent.length){const tr=document.createElement('tr');const td=document.createElement('td');td.colSpan=6;td.textContent='No matches yet.';tr.appendChild(td);tb.appendChild(tr);}
  D.recent.forEach(r=>{const tr=document.createElement('tr');[new Date(r.d).toLocaleDateString(),HEROES[r.hero].name,r.mode==='echo'?'Echo':'W'+r.wave,r.mode==='echo'?'-':String(r.kos),r.combo+' hits',r.result].forEach(v=>{const td=document.createElement('td');td.textContent=v;tr.appendChild(td);});tb.appendChild(tr);});
  show('ovProfile',true);$('ovProfile').scrollTop=0;$('profClose').focus({preventScroll:true});
}
function closeProfile(){show('ovProfile',false);}

/* ---------- HUD: current bounty ---------- */
function drawBountyHUD(c,t){
  const b=G.bounty;if(!b||G.mode!=='endless'||G.screen!=='play')return;
  const y=62+(bossOf()?46:0),txt=(b.done?'✓ ':b.failed?'✗ ':'')+'BOUNTY · '+b.def.n+': '+bountyText(b)+(b.def.prog&&!b.done&&!b.failed?' ('+b.def.prog(b)+')':'');
  c.save();c.font='600 13px Fredoka, sans-serif';const w=Math.min(VW-30,c.measureText(txt).width+26),x=VW/2-w/2;
  rr(c,x,y,w,24,10);c.fillStyle=b.done?'rgba(40,120,60,.85)':b.failed?'rgba(70,30,50,.75)':'rgba(18,8,34,.8)';c.fill();c.strokeStyle=b.done?'#7DFF8A':b.failed?'rgba(255,46,99,.5)':'rgba(125,255,138,.6)';c.lineWidth=1.5;c.stroke();
  c.fillStyle=b.failed?'#CDBDF0':'#E9FFEE';c.textAlign='center';c.fillText(txt,VW/2,y+16);c.restore();
}
function drawPlayerFx(c,t){if(P&&P.alive&&P.aegis){c.save();c.globalAlpha=.45+.15*Math.sin(t*6);c.strokeStyle='#FFB03A';c.lineWidth=2.5;c.beginPath();c.ellipse(P.x,P.y-P.h/2,P.w*1.25,P.h*.68,0,0,Math.PI*2);c.stroke();c.restore();}}
