/* ================= PHASE 7: Boss Rush and Challenge modes ================= */
const CHALS=[
  {id:'perfect',n:'Perfect Defence',d:'Enemies only take damage from Counter Bursts. Land a perfect guard (tap guard just before a hit) to release one. Clear 3 waves.',waves:3,noNew:true,perfectOnly:true,
    wave:n=>['grunt','grunt'].concat(n>1?['grunt']:[]).concat(n>2?['heavy']:[])},
  {id:'fists',n:'Fists Only',d:'Specials, supers and awakening are switched off. Clear 5 waves.',waves:5,noSpecial:true},
  {id:'onelife',n:'One Life',d:'A single life and no power-ups. Clear 6 waves.',waves:6,oneLife:true},
  {id:'sky',n:'Sky Fighter',d:'Only hits you land while airborne deal damage. Clear 4 waves.',waves:4,airOnly:true},
  {id:'blitz',n:'Blitz',d:'Clear 4 waves within 100 seconds.',waves:4,limit:100},
  {id:'slayer',n:'Giant Slayer',d:'Face the Rift Lord alone, with a single life.',waves:1,oneLife:true,lord:true,wave:()=>['boss']}
];
const chalById=id=>CHALS.find(c=>c.id===id);
let selChal='perfect';
function rushList(){const own=UNIS[G.uni].enemies.boss[1];const order=[own].concat(['oni_brute','rift_beast','mecha_sentinel'].filter(k=>k!==own));return order.map(k=>BOSS_PAIRS[k]).concat([LORD_PAIR]);}
const fmtT7=s=>{s=Math.max(0,s);const m=Math.floor(s/60),r=s-m*60;return m+':'+(r<10?'0':'')+r.toFixed(1);};

/* start: mode, challenge rules, arena and per-run state */
const _sg7=startGame;
startGame=function(){
  G.chal=selMode==='challenge'?chalById(selChal):null;STATS.turret7=0;STATS.props7=0;G.force7=null;G.seen7={};G.turrets7=[];fx7.length=0;G.rush7=null;G.lastHit7=null;G.modeDone7=false;
  _sg7();
  ARENA7.reset();
  if(G.chal&&G.chal.oneLife&&P)P.stocks=1;
  if(G.mode==='bossrush')G.rush7={list:rushList(),t0:G.time};
  modeRecordStart7();
};
const _sw7=startWave;
startWave=function(){
  if(G.mode==='bossrush'){const L=G.rush7?G.rush7.list:rushList();G.wave++;const b=L[G.wave-1];G.force7={boss:b};G.queue=['boss'];G.spawnT=.8;G.waveDone=false;G.waveKOs=0;G.waveMax=0;
    G.banner={t:0,dur:1.8,text:'BOSS '+G.wave+' / '+L.length,sub:b[0]+(b[1]==='rift_lord'?' · the final boss':'')};waveStarted(true,false);ann('boss',{},2);return;}
  if(G.mode==='challenge'&&G.chal){const C=G.chal;G.wave++;G.queue=C.wave?C.wave(G.wave):waveList(Math.min(G.wave+1,9)).filter(r=>r!=='boss'&&r!=='clone');
    if(C.lord)G.force7={boss:LORD_PAIR};G.spawnT=.8;G.waveDone=false;G.waveKOs=0;G.waveMax=0;
    G.banner={t:0,dur:1.8,text:C.lord?'GIANT SLAYER':'WAVE '+G.wave+' / '+C.waves,sub:C.n};waveStarted(!!C.lord,false);return;}
  _sw7();
};
/* bosses in Boss Rush (and the Giant Slayer) are built at the strength they would have deep into a run */
const _mkE7m=makeEnemy;
makeEnemy=function(role,x,y){if(role!=='boss'||!(G.mode==='bossrush'||(G.chal&&G.chal.lord)))return _mkE7m(role,x,y);
  const w=G.wave;G.wave=G.mode==='bossrush'?10+5*(w-1):20;try{return _mkE7m(role,x,y);}finally{G.wave=w;}};
const _aw7=afterWave;
afterWave=function(){
  if(G.mode==='bossrush'){const L=G.rush7.list;if(G.wave>=L.length){endMode7(true);return;}
    if(P){P.pct=Math.round(P.pct*.5);}PROG.rareNext=true;showUpgrades();$('upgTitle').textContent='BOSS '+G.wave+' DOWN!';
    $('upgInfo').textContent='Your damage was halved. Next: '+L[G.wave][0]+'. Power-ups are rare or better.';return;}
  if(G.mode==='challenge'){if(G.wave>=G.chal.waves){endMode7(true);return;}startWave();return;}
  _aw7();
};
const _go7=gameOver;
gameOver=function(){if(G.mode==='bossrush'||G.mode==='challenge'){endMode7(false);return;}const h=$('overTitle');if(h)h.textContent='WIPED OUT!';_go7();};
function modeTick7(dt){
  if(G.mode==='challenge'&&G.chal&&G.chal.limit&&!G.modeDone7&&G.time>G.chal.limit&&G.screen==='play'){G.banner={t:0,dur:1.4,text:'TIME UP!',small:true};G.modeDone7=true;G.overT=1.2;}
}
function modeLabel7(){
  if(G.mode==='bossrush'&&G.rush7)return 'BOSS RUSH · '+G.wave+'/'+G.rush7.list.length+' · '+fmtT7(G.time);
  if(G.mode==='challenge'&&G.chal){const C=G.chal;return C.n.toUpperCase()+' · '+(C.lord?'':G.wave+'/'+C.waves+' · ')+(C.limit?fmtT7(C.limit-G.time)+' LEFT':fmtT7(G.time));}
  return G.mode==='echo'?'ECHO DUEL':'WAVE '+G.wave+'  ·  BEST '+best;
}
/* challenge rules on hits */
let noEff7=0;
function chalBlocks7(t,h,info){const C=G.chal;if(!C)return false;
  let block=false;if(C.perfectOnly&&!h.counter7)block=true;if(C.airOnly&&!info.air&&!h.counter7)block=true;
  if(block&&G.time-noEff7>.4){noEff7=G.time;pop(t.x,t.y-t.h-12,C.perfectOnly?'NO EFFECT · COUNTER!':'NO EFFECT · GO AIRBORNE','#CDBDF0',18);}
  return block;}
const _pg7=perfectGuard;
perfectGuard=function(t,h){_pg7(t,h);if(!(G.chal&&G.chal.perfectOnly))return;
  const tg=nearEn(t.x,t.y-40,190);if(h.attacker&&h.attacker.alive&&tg.indexOf(h.attacker)<0&&Math.abs(h.attacker.x-t.x)<300)tg.push(h.attacker);
  ring(t.x,t.y-40,190,'#7FE7FF',.4);fx7.push({k:'flare',x:t.x,y:t.y-40,t:0,dur:.3,col:'#7FE7FF',r:160});pop(t.x,t.y-t.h-40,'COUNTER BURST!','#7FE7FF',30);
  tg.forEach(e=>heroHit7(e,{dmg:12,base:440,scale:3.4,ang:50,heavy:true,light:false,counter7:true,color:'#7FE7FF'}));};
const _ss7=startSuper;startSuper=function(){if(G.chal&&G.chal.noSpecial){pop(P.x,P.y-P.h-20,'SUPERS OFF','#CDBDF0',20);return;}return _ss7();};
const _sa7=startAwaken;startAwaken=function(){if(G.chal&&G.chal.noSpecial){pop(P.x,P.y-P.h-20,'AWAKEN OFF','#CDBDF0',20);return;}return _sa7();};

/* results + profile records (stored inside the existing rrProfile1 profile) */
function modeRec7(){const D=PROF.data;if(!D.modes)D.modes={rush:{runs:0,clears:0,best:0},chal:{}};return D.modes;}
function modeRecordStart7(){G.modeRec7=false;}
function endMode7(win){
  if(G.screen==='over')return;G.screen='over';G.overT=0;sfx(win?'victory':'defeat');saveClone();
  const M=modeRec7();const rush=G.mode==='bossrush';const T=G.time;let best=0,isBest=false,title,name;
  if(!G.modeRec7){G.modeRec7=true;
    if(rush){M.rush.runs++;if(win){M.rush.clears++;isBest=!M.rush.best||T<M.rush.best;if(isBest)M.rush.best=Math.round(T*10)/10;}best=M.rush.best;}
    else{const r=M.chal[G.chal.id]||(M.chal[G.chal.id]={tries:0,clears:0,best:0});r.tries++;if(win){r.clears++;isBest=!r.best||T<r.best;if(isBest)r.best=Math.round(T*10)/10;}best=r.best;}
    const D=PROF.data;D.kos+=G.kos;D.bestCombo=Math.max(D.bestCombo,G.maxHits);D.heroes[G.hero]=(D.heroes[G.hero]||0)+1;D.unis[G.uni]=(D.unis[G.uni]||0)+1;
    D.bosses+=STATS.bosses;if(STATS.bosses)medal('boss1');profSave();}
  name=rush?'Boss Rush':G.chal.n;
  title=win?(rush?'RUSH COMPLETE!':'CHALLENGE CLEAR!'):(rush?'RUSH OVER':'CHALLENGE FAILED');
  const h=$('overTitle');if(h)h.textContent=title;
  $('overTxt').textContent=win?name+' cleared with '+HEROES[G.hero].name+' in '+fmtT7(T)+(isBest?' · NEW BEST':'')+'.':name+': '+(rush?'defeated by boss '+G.wave+' of '+G.rush7.list.length:'failed on wave '+G.wave)+'.';
  const box=$('sumBox');box.innerHTML='';const dl=document.createElement('dl');dl.className='kv';
  const rows=[['Mode',name],['Hero',HEROES[G.hero].name],['Result',win?'Cleared':'Not cleared'],['Time',fmtT7(T)],['Best clear time',best?fmtT7(best):'none yet'],
    ['Bosses defeated',String(STATS.bosses)],['Enemies defeated',String(G.kos)],['Best combo',G.maxHits+' hits'],['Damage dealt',Math.round(STATS.dealt)+'%'],['Damage taken',Math.round(STATS.taken)+'%']];
  if(G.chal)rows.splice(1,0,['Rule',G.chal.d]);
  rows.forEach(([k,v])=>{const dt=document.createElement('dt');dt.textContent=k;const dd=document.createElement('dd');dd.textContent=v;dl.appendChild(dt);dl.appendChild(dd);});box.appendChild(dl);
  show('ovOver',true);$('againBtn').focus();
}

/* ---------- menus ---------- */
function renderChal7(){const box=$('chalList');box.innerHTML='';const M=modeRec7();
  CHALS.forEach(C=>{const r=M.chal[C.id];const b=document.createElement('button');b.type='button';b.className='chal'+(r&&r.clears?' done':'');
    const h=document.createElement('strong');h.textContent=C.n;const p=document.createElement('span');p.textContent=C.d;const s=document.createElement('small');
    s.textContent=r&&r.clears?'Cleared '+r.clears+'× · best '+fmtT7(r.best):r&&r.tries?'Tried '+r.tries+'× · not cleared yet':'Not tried yet';
    b.appendChild(h);b.appendChild(p);b.appendChild(s);b.addEventListener('click',()=>{selChal=C.id;selMode='challenge';show('ovChal',false);openSelect();});box.appendChild(b);});}
function openChal7(){audioInit();renderChal7();['ovTitle','ovOver'].forEach(id=>show(id,false));show('ovChal',true);$('ovChal').scrollTop=0;const f=$('chalList').querySelector('button');if(f)f.focus({preventScroll:true});sfx('ui');}
$('rushBtn').addEventListener('click',()=>{selMode='bossrush';audioInit();if(root.classList.contains('touch')&&!isFs())enterFs();openSelect();});
$('chalBtn').addEventListener('click',()=>{if(root.classList.contains('touch')&&!isFs())enterFs();openChal7();});
$('chalBack').addEventListener('click',()=>{show('ovChal',false);show('ovTitle',true);G.screen='title';$('chalBtn').focus();sfx('ui');});
const _os7=openSelect;
openSelect=function(){show('ovChal',false);ARENA7.st=null;_os7();
  const h=$('ovSelect').querySelector('h2'),f=$('fightBtn');
  if(selMode==='bossrush'){h.textContent='BOSS RUSH: PICK A FIGHTER';f.textContent='FIGHT!';}
  else if(selMode==='challenge'){h.textContent=chalById(selChal).n.toUpperCase();f.textContent='START CHALLENGE';}
  const m=$('modeInfo7');if(m)m.textContent=selMode==='bossrush'?'Four bosses back to back: your universe\'s boss, the other two, then the Rift Lord. Your damage is halved and you pick a power-up between bosses.'
    :selMode==='challenge'?chalById(selChal).d:'';
};
/* profile: show mode records */
const _op7=openProfile;
openProfile=function(){_op7();const dl=$('profKV');if(!dl)return;const M=modeRec7();
  const add=(k,v)=>{const dt=document.createElement('dt');dt.textContent=k;const dd=document.createElement('dd');dd.textContent=v;dl.appendChild(dt);dl.appendChild(dd);};
  add('Boss Rush clears',M.rush.clears+' of '+M.rush.runs+(M.rush.best?' · best '+fmtT7(M.rush.best):''));
  add('Challenges cleared',CHALS.filter(C=>M.chal[C.id]&&M.chal[C.id].clears).length+' of '+CHALS.length);};
