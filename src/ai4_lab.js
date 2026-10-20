let predRows=null;
const pctS=v=>v==null?'unavailable':Math.round(v*100)+'%';
function kv(id,rows){const el=$(id);if(!el)return;el.innerHTML='';rows.forEach(([k,v,cls])=>{const a=document.createElement('dt');a.textContent=k;const b=document.createElement('dd');b.textContent=v;if(cls)b.className=cls;el.appendChild(a);el.appendChild(b);});}
function renderBrain(){
  /* habit tracker: observed (decaying counts of what you did) */
  const s=AI.blast+AI.melee+AI.air+AI.dash+.05;
  [['Blast',AI.blast],['Melee',AI.melee],['Air',AI.air],['Dash',AI.dash]].forEach(([k,v])=>{const p=Math.round(v/s*100);$('b'+k).style.width=p+'%';$('n'+k).textContent=p+'%';});
  /* inferred counters, each with the observation it came from */
  const inf=[];
  if(AI.dodge>.15)inf.push(['Jump over your specials',Math.round(AI.dodge*100)+'% chance','from your blast share']);
  if(AI.block>.15)inf.push(['Block your combos',Math.round(AI.block*100)+'% chance','from your melee share']);
  if(AI.antiAir)inf.push(['Aim shots where you land','on','from your air share']);
  if(AI.punish>.15)inf.push(['Swing at the end of your dashes',Math.round(AI.punish*100)+'% chance','from your dash share']);
  if((AI.pDodge||0)>.15)inf.push(['Jump your next special',Math.round(AI.pDodge*100)+'% chance','from the move predictor']);
  if((AI.pBlock||0)>.15)inf.push(['Block your next attack',Math.round(AI.pBlock*100)+'% chance','from the move predictor']);
  if((AI.pPunish||0)>.15)inf.push(['Punish your next dash',Math.round(AI.pPunish*100)+'% chance','from the move predictor']);
  const ul=$('counter');ul.innerHTML='';if(!inf.length){const li=document.createElement('li');li.textContent='None active yet. Counters switch on once one habit dominates.';ul.appendChild(li);}
  inf.forEach(([a,b,c])=>{const li=document.createElement('li');const st=document.createElement('strong');st.textContent=a;li.appendChild(st);li.appendChild(document.createTextNode(' · '+b+' · '+c));ul.appendChild(li);});
  const met=Object.keys(STATS.pers).filter(k=>STATS.pers[k]>0).map(k=>PERS[k].n.toLowerCase()+' '+STATS.pers[k]).join(', ');
  kv('tacStats',[['Enemy tactics met this run',met||'none yet'],
    ['Boss adaptations this run',STATS.bossReads||STATS.bossGB||STATS.bossCounters?STATS.bossReads+' move reads, '+STATS.bossCounters+' counters, '+STATS.bossGB+' guard breaks':'none yet'],
    ['Hunter reads scored',HUNT.made?HUNT.hit+' of '+HUNT.made+' matched your next action ('+Math.round(HUNT.hit/HUNT.made*100)+'%)'+(HUNT.made<20?' · small sample':''):'unavailable (no Hunter has read you yet)']]);
  /* move predictor */
  const box=$('predBars');
  if(!predRows)predRows=EV.map(e=>{const l=document.createElement('span');l.textContent=EVN[e];const b=document.createElement('div');b.className='bar';const i=document.createElement('i');b.appendChild(i);
    const n=document.createElement('span');n.className='num';box.appendChild(l);box.appendChild(b);box.appendChild(n);return [i,n];});
  const d=PRED.n?PRED.dist():null;predRows.forEach(([i,n],k)=>{const p=d?Math.round(d[k]*100):0;i.style.width=p+'%';n.textContent=p+'%';});
  const tp=PRED.n>=3?PRED.top():null;$('predNext').textContent=tp?'Next move guess: '+EVN[tp.ev]+' ('+Math.round(tp.p*100)+'%)':'Next move guess: unavailable (needs 3 moves)';
  const N=PRED.evN;
  kv('predStats',[['Evaluated predictions (this run)',String(N)],['Top-1 accuracy',N?Math.round(PRED.evHit/N*100)+'%':'unavailable'],
    ['Baseline: most frequent move so far',N?Math.round(PRED.baseHit/N*100)+'%':'unavailable'],['Random guess','14%'],['Last 40 predictions',PRED.hits.length?Math.round(PRED.acc()*100)+'%':'unavailable']]);
  $('predNote').textContent=N<30?'Fewer than 30 evaluated predictions: too few to judge the predictor yet.':(PRED.evHit>PRED.baseHit?'Beating the frequency baseline by '+Math.round((PRED.evHit-PRED.baseHit)/N*100)+' points on your moves this run.':'Not beating the frequency baseline: your moves are not following a sequence it can exploit.');
  const rc=$('predRecent');rc.innerHTML='';PRED.recent.forEach(r=>{const sp=document.createElement('span');sp.className='chip '+(r.ok?'ok':'bad');sp.textContent=(r.ok?'✓ ':'✗ ')+EVN[EV[r.p]]+(r.ok?'':' → '+EVN[EV[r.a]]);rc.appendChild(sp);});
  /* shadow clone */
  const v=CLONE.val;
  kv('cloneStats',[['Training examples',String(CLONE.X.length)],['Held-out examples (never trained on)',String(CLONE.VX.length)+(CLONE.VX.length<30?' · need 30':'')],['Training steps',String(CLONE.steps)],
    ['Training loss (class-weighted)',CLONE.lossEma==null?'unavailable':CLONE.lossEma.toFixed(3)],['Validation loss',v.loss==null?'unavailable':v.loss.toFixed(3)],
    ['Held-out action agreement',pctS(v.acc)],['Baseline: always its most common action',v.base==null?'unavailable':pctS(v.base)+' ('+CA_LBL[v.baseLbl]+')'],['Random guess','10%'],
    ['Agreement on training examples',pctS(v.trainAcc)+(v.trainAcc!=null&&v.acc!=null&&v.trainAcc-v.acc>.15?' · overfitting gap':'')]]);
  const ld=CLONE.lastDuel,dr=$('duelRep');dr.innerHTML='';
  if(!ld){dr.textContent='No duel yet. Meet your clone on wave 5, or play Echo Duel from the title screen.';}
  else{const h=document.createElement('p');h.className='sub';h.textContent='Last duel ('+(ld.mode==='echo'?'Echo Duel':'endless wave')+'): '+(ld.outcome==='player'?'you won':ld.outcome==='clone'?'the clone won':'ended early')+' after '+Math.round(ld.dur)+' s.';dr.appendChild(h);
    dr.appendChild(cmpBars(ld));const k=document.createElement('dl');k.className='kv';dr.appendChild(k);k.id='duelKV';
    kv('duelKV',[['Behaviour mix similarity',ld.sim==null?'unavailable (under 20 clone decisions)':Math.round(ld.sim*100)+'%'],
      ['Agreement with your choices mid-duel',ld.agree==null?'unavailable (under 20 samples)':Math.round(ld.agree*100)+'% of '+ld.nAgree],
      ['Damage it dealt you',Math.round(ld.byClone)+'%'],['Damage you dealt it',Math.round(ld.toClone)+'%']]);}
  drawLoss();
}
function cmpBars(ld){const w=document.createElement('div');w.className='cmp';
  CAT_LBL.forEach((n,i)=>{const l=document.createElement('span');l.textContent=n;w.appendChild(l);
    [['you',ld.you[i]],['cl',ld.clone[i]]].forEach(([c,v])=>{const b=document.createElement('div');b.className='bar '+c;const it=document.createElement('i');it.style.width=Math.round(v*100)+'%';b.appendChild(it);b.title=Math.round(v*100)+'%';w.appendChild(b);});});
  const lg=document.createElement('span');lg.className='cmpLeg';lg.textContent='Top bar: you (its training data) · bottom bar: clone (its duel decisions)';w.appendChild(lg);return w;}
function drawLoss(){
  const cvs=$('lossChart');const c=cvs.getContext&&cvs.getContext('2d');if(!c)return;const W=320,Hh=90;
  c.fillStyle='#1A0D36';c.fillRect(0,0,W,Hh);c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=1;for(let i=1;i<3;i++){c.beginPath();c.moveTo(0,i*30);c.lineTo(W,i*30);c.stroke();}
  const h=CLONE.lossHist;c.font='11px Fredoka, sans-serif';c.textAlign='left';
  c.fillStyle='#3EE6FF';c.fillText('training loss',8,14);c.fillStyle='#FF8FCA';c.fillText('validation loss',90,14);c.fillStyle='#CDBDF0';c.fillText('(lower is better)',186,14);
  if(h.length<2){c.fillText('Play a wave to start training.',8,54);return;}
  let mx=-1e9,mn=1e9;h.forEach(p=>{[p.tr,p.va].forEach(v=>{if(v!=null){if(v>mx)mx=v;if(v<mn)mn=v;}});});mx+=.02;mn-=.02;
  [['tr','#3EE6FF'],['va','#FF8FCA']].forEach(([k,col])=>{c.strokeStyle=col;c.lineWidth=2;c.beginPath();let st=false;
    h.forEach((p,i)=>{const v=p[k];if(v==null){st=false;return;}const x=8+i/(h.length-1)*(W-16);const y=Hh-8-(v-mn)/(mx-mn)*(Hh-30);if(st)c.lineTo(x,y);else{c.moveTo(x,y);st=true;}});c.stroke();});
}
function labSummary(){const v=CLONE.val;return 'Move predictor: '+(PRED.evN?Math.round(PRED.evHit/PRED.evN*100)+'% on '+PRED.evN+' moves (baseline '+Math.round(PRED.baseHit/PRED.evN*100)+'%)':'no evaluated moves yet')+
  '. Shadow Clone: '+CLONE.X.length+' training examples, held-out agreement '+pctS(v.acc)+'.';}
