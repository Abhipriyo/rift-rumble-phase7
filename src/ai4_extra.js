/* ================= PHASE 4: bookkeeping, boss presentation, Echo Duel, debug view ================= */
/* real damage bookkeeping: measured as the actual change in the target's damage percent */
const _applyHit=applyHit;
applyHit=function(t,h){const p0=t.pct;const ok=_applyHit(t,h);const d=t.pct-p0;
  if(d>0){if(t.team==='hero'){STATS.taken+=d;if(h.attacker&&h.attacker.role==='clone'&&CLONE.duel.on)CLONE.duel.byClone+=d;}
    else if(h.src==='hero'){STATS.dealt+=d;if(t.role==='clone'&&CLONE.duel.on)CLONE.duel.toClone+=d;if(t.role==='boss')bossNoteHit(t);}}
  return ok;};

let DEBUG=typeof location!=='undefined'&&/[?&]debug\b/.test(location.search);
window.addEventListener('keydown',e=>{if(e.code==='Backquote'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.altKey){DEBUG=!DEBUG;}});

/* telegraphs and enemy tags (world space) */
function drawEnemyFx(c,t){
  for(const e of enemies){
    if(e.blink){const p=1-e.blink.t/.38;c.save();c.globalAlpha=.35+.5*p;c.fillStyle='rgba(60,30,90,.85)';c.beginPath();c.ellipse(e.blink.x,e.blink.y-30,18+10*p,34,0,0,Math.PI*2);c.fill();
      c.strokeStyle='#D9B8FF';c.lineWidth=2;c.stroke();c.restore();}
    if(e.recover>0&&e.alive){outlinedW(c,'OPEN',e.x,e.y-e.h-34,14,'#7FE7FF');}
    if(e.guardBroken>0&&e.alive){outlinedW(c,'GUARD DOWN',e.x,e.y-e.h-34,14,'#7FE7FF');}
    const bs=e.bs;if(!bs||!e.alive)continue;const A=bs.atk&&BATK[bs.atk];
    if(bs.state==='tele'&&A){const p=clamp(bs.t/bs.dur,0,1);c.save();A.draw(c,e,p,bs,'tele');c.restore();}
    else if(bs.state==='act'&&A&&(bs.atk==='laser'||bs.atk==='sweep')){c.save();A.draw(c,e,1,bs,'act');c.restore();}
    else if(bs.state==='rec'&&bs.dur>.4&&!e.stun){c.save();c.globalAlpha=.5+.3*Math.sin(t*12);c.strokeStyle='#7FE7FF';c.lineWidth=3;c.beginPath();c.ellipse(e.x,e.y-e.h/2,e.w*.75,e.h*.6,0,0,Math.PI*2);c.stroke();c.restore();}
  }
}
function outlinedW(c,txt,x,y,size,col){c.save();c.font=size+'px Bangers, Impact, sans-serif';c.textAlign='center';c.lineJoin='round';c.lineWidth=4;c.strokeStyle=OUT;c.strokeText(txt,x,y);c.fillStyle=col;c.fillText(txt,x,y);c.restore();}

/* boss bar + intro card (screen space) */
function drawBossHUD(c,t){
  const b=bossOf();if(!b)return;const bs=b.bs,def=BOSSDEF[b.cosId]||{jp:''};
  const w=Math.min(420,VW-40),x=VW/2-w/2,y=62;
  rr(c,x,y,w,40,12);c.fillStyle='rgba(18,8,34,.82)';c.fill();c.strokeStyle='rgba(255,46,99,.7)';c.lineWidth=2;c.stroke();
  c.font='14px Bangers, Impact, sans-serif';c.textAlign='left';c.fillStyle='#FFE14D';c.fillText(b.name+'  '+def.jp,x+12,y+16);
  c.textAlign='right';c.fillStyle='#FFFFFF';c.fillText('PHASE '+(bs.phase+1)+' / 3   '+Math.round(b.pct)+'%',x+w-12,y+16);
  const A=bs.atk&&BATK[bs.atk];if(A&&(bs.state==='tele'||bs.state==='act')){c.textAlign='center';c.fillStyle=bs.gb?'#FF2E63':'#FF8A3D';c.fillText(A.n+(bs.gb?' · GUARD BREAK':''),x+w/2,y+16);}
  else if(bs.state==='rec'&&bs.dur>.4){c.textAlign='center';c.fillStyle='#7FE7FF';c.fillText('OPENING!',x+w/2,y+16);}
  else if(bs.state==='roar'){c.textAlign='center';c.fillStyle='#FF2E63';c.fillText('ROAAAR!',x+w/2,y+16);}
  const bx=x+12,bw=w-24,by=y+24;rr(c,bx,by,bw,9,4);c.fillStyle='#3A2463';c.fill();
  rr(c,bx,by,bw*clamp(b.pct/180,0,1),9,4);c.fillStyle=bs.phase===2?'#FF2E63':bs.phase===1?'#FF8A3D':'#FFE14D';c.fill();
  [60,120].forEach(v=>{c.fillStyle='#FFFFFF';c.fillRect(bx+bw*v/180-1,by-2,2,13);});
}
function drawBossCard(c,t){
  const bc=G.bossCard;if(!bc)return;if(bc.t0==null)bc.t0=performance.now();const el=(performance.now()-bc.t0)/1000;if(el>bc.dur){G.bossCard=null;return;}
  const a=el<.2?el/.2:el>bc.dur-.3?(bc.dur-el)/.3:1;c.save();c.globalAlpha=clamp(a,0,1);
  const bh=Math.min(70,VH*.12);c.fillStyle='rgba(8,2,20,.85)';c.fillRect(0,0,VW,bh);c.fillRect(0,VH-bh,VW,bh);
  const cy=VH*.62;c.beginPath();c.moveTo(0,cy-46);c.lineTo(VW,cy-62);c.lineTo(VW,cy+30);c.lineTo(0,cy+46);c.closePath();c.fillStyle='rgba(120,10,40,.88)';c.fill();
  c.textAlign='center';c.font='600 16px Fredoka, sans-serif';c.fillStyle='#FFD1E0';c.fillText('BOSS',VW/2,cy-26);
  let s=58;c.font=s+'px Bangers, Impact, sans-serif';const tw=c.measureText(bc.name).width;if(tw>VW-40){s=Math.floor(s*(VW-40)/tw);}
  outlined(c,bc.name,VW/2,cy+16,s,'#FFE14D','center');c.font='600 18px Fredoka, sans-serif';c.fillStyle='#FFFFFF';c.fillText(bc.jp,VW/2,cy+40);
  c.restore();
}

/* developer debug view: press ` (backtick). Enemy state, candidate actions + scores, chosen action, model inputs */
function drawDebug(c,t){
  c.save();c.font='11px monospace';c.textAlign='left';
  for(const e of enemies){const d=e.dbg;if(!d||!e.alive)continue;
    const lines=[(d.pers||'').toUpperCase()+' · '+d.state,'react '+(d.react!=null?d.react.toFixed(2)+'s':'-')+' · pick: '+d.pick];
    (d.cands||[]).slice(0,5).forEach(cd=>lines.push('  '+cd[0]+' '+cd[1]));
    if(e.bs){const bs=e.bs;lines.push('state '+bs.state+(bs.atk?' '+bs.atk:'')+' t '+bs.t.toFixed(2)+'/'+(bs.dur||0).toFixed(2)+' armor '+Math.round(e.armor||0));lines.push('log: '+bs.log.slice(-3).join(', '));}
    if(d.inputs)lines.push('inputs: '+d.inputs.join(' '));
    const w=Math.max(...lines.map(l=>c.measureText(l).width))+10,h=lines.length*13+6,x=e.x-w/2,y=e.y-e.h-70-h;
    c.fillStyle='rgba(0,0,0,.75)';c.fillRect(x,y,w,h);c.fillStyle='#9DF0FF';lines.forEach((l,i)=>c.fillText(l,x+5,y+14+i*13));}
  c.restore();
}
function drawDebugScreen(c){
  c.save();c.font='12px monospace';c.textAlign='left';const tp=PRED.n>=3?PRED.top():null;
  const lines=['DEBUG (press ` to hide)','predictor: '+(tp?tp.ev+' '+Math.round(tp.p*100)+'%':'-')+' · evaluated '+PRED.evN,
    'hunter reads: '+HUNT.hit+'/'+HUNT.made+(HUNT.pending?' · pending '+HUNT.pending.ev:''),
    'habits b/m/a/d: '+[AI.blast,AI.melee,AI.air,AI.dash].map(v=>v.toFixed(1)).join('/'),
    'clone: train '+CLONE.X.length+' val '+CLONE.VX.length+' frozen '+(!!enemies.find(e=>e.role==='clone')),
    'last player actions: '+OBS.ev.slice(-5).map(v=>v.k).join(' ')];
  const w=Math.max(...lines.map(l=>c.measureText(l).width))+12;c.fillStyle='rgba(0,0,0,.75)';c.fillRect(VW-w-10,VH-lines.length*15-18,w,lines.length*15+8);
  c.fillStyle='#FFE14D';lines.forEach((l,i)=>c.fillText(l,VW-w-4,VH-lines.length*15-4+i*15));c.restore();
}

/* ================= ECHO DUEL MODE =================
   1) fight normal enemies while the game records your decisions (training round)
   2) the network trains on them in front of you (real steps, real held-out metrics)
   3) duel the clone, with the network frozen
   4) report: imitation (held-out + mid-duel agreement, behaviour mix) separately from combat results */
let selMode='endless';
const ECHO_NEED=200,ECHO_MIN=35,ECHO_MAX=80,ECHO_STEPS=900;
function startEcho(){selMode='echo';startGame();CLONE.sess.fill(0);
  G.echo={phase:'train',t:0,start:CLONE.seen,spawnT:.5,endT:0,result:null};
  G.banner={t:0,dur:2.4,text:'ECHO DUEL',sub:'Round 1: fight normally. Your clone is watching.'};}
function echoUpdate(dt){
  const E=G.echo;if(!E)return;E.t+=dt;
  if(E.phase==='train'){
    E.spawnT-=dt;if(E.spawnT<=0&&enemies.length<3){E.spawnT=1.4;spawnEnemy(Math.random()<.7?'grunt':'shooter');}
    const n=CLONE.seen-E.start;
    if((n>=ECHO_NEED&&E.t>=ECHO_MIN)||E.t>=ECHO_MAX){
      enemies.forEach(e=>{sparks(e.x,e.y-e.h/2,10,'#B57CFF',260);});enemies=[];projs=[];
      E.phase='learn';E.lt0=performance.now();E.steps=0;E.curve=[];G.screen='learn';show('ovLearn',true);CLONE.evalAll();renderLearn();}
  }else if(E.phase==='duel'){
    if(E.endT>0){E.endT-=dt;if(E.endT<=0)echoFinish('win');}
  }
}
function echoLearnTick(){
  const E=G.echo;if(!E||E.phase!=='learn')return;
  for(let i=0;i<20&&E.steps<ECHO_STEPS;i++){CLONE.step(32);E.steps++;if(E.steps%60===0){CLONE.evalAll();E.curve.push({tr:CLONE.lossEma,va:CLONE.val.loss});}}
  renderLearn();
  if(E.steps>=ECHO_STEPS&&performance.now()-E.lt0>2600){CLONE.evalAll();E.pre={acc:CLONE.val.acc,base:CLONE.val.base,n:CLONE.val.n};startEchoDuel();}
}
function renderLearn(){
  const E=G.echo,v=CLONE.val;$('learnBar').style.width=Math.round(E.steps/ECHO_STEPS*100)+'%';
  $('learnTxt').textContent='Recorded '+(CLONE.seen-E.start)+' new decisions this round. Training step '+E.steps+' of '+ECHO_STEPS+'.';
  kv('learnKV',[['Training examples',String(CLONE.X.length)],['Held-out examples',String(CLONE.VX.length)],['Training loss',CLONE.lossEma==null?'unavailable':CLONE.lossEma.toFixed(3)],
    ['Validation loss',v.loss==null?'unavailable':v.loss.toFixed(3)],['Held-out agreement',pctS(v.acc)],['Baseline (most common action)',pctS(v.base)]]);
  const cv=$('learnChart'),c=cv&&cv.getContext&&cv.getContext('2d');if(!c)return;const W=320,H=90;c.fillStyle='#1A0D36';c.fillRect(0,0,W,H);
  const h=E.curve;const note=$('learnNote');if(note){const a=h.find(p=>p.va!=null),z=h[h.length-1];note.textContent=a&&z&&z.va!=null&&z.va>a.va+.1?'Validation loss is rising while training loss falls: with this few examples the network is starting to memorise them (overfitting). More rounds of play give it more to generalise from.':'';}
  if(h.length<2){c.fillStyle='#CDBDF0';c.font='11px Fredoka, sans-serif';c.fillText('Loss curve appears after a few steps...',8,50);return;}
  let mx=-1e9,mn=1e9;h.forEach(p=>[p.tr,p.va].forEach(v2=>{if(v2!=null){mx=Math.max(mx,v2);mn=Math.min(mn,v2);}}));mx+=.02;mn-=.02;
  [['tr','#3EE6FF'],['va','#FF8FCA']].forEach(([k,col])=>{c.strokeStyle=col;c.lineWidth=2;c.beginPath();let st=false;h.forEach((p,i)=>{const v2=p[k];if(v2==null)return;const x=8+i/(h.length-1)*(W-16),y=H-8-(v2-mn)/(mx-mn)*(H-20);st?c.lineTo(x,y):c.moveTo(x,y);st=true;});c.stroke();});
}
function startEchoDuel(){
  const E=G.echo;show('ovLearn',false);show('ovEcho',false);E.phase='duel';E.endT=0;E.t=0;
  enemies=[];projs=[];P=makePlayer();cam.x=480;cam.y=300;G.screen='play';lastT=performance.now();
  if(!E.pre){CLONE.evalAll();E.pre={acc:CLONE.val.acc,base:CLONE.val.base,n:CLONE.val.n};}
  spawnEnemy('clone');
  G.banner={t:0,dur:2,text:'ROUND 2: DUEL',sub:'Your clone learned from '+CLONE.X.length+' examples. It is frozen now.'};sfx('super');
}
function echoFinish(res){
  const E=G.echo;if(!E||E.phase==='report')return;
  let rep=CLONE.duel.on?endDuel(res==='win'?'player':res==='lose'?'clone':'ended'):CLONE.lastDuel;
  E.phase='report';G.screen='echoReport';show('ovEcho',true);
  $('echoTitle').textContent=res==='win'?'YOU BEAT YOUR CLONE':res==='lose'?'YOUR CLONE WON':'TRAINING NOT FINISHED';
  const imit=$('echoImit'),fight=$('echoFight');imit.innerHTML='';fight.innerHTML='';
  if(res==='trainfail'||!rep){$('echoRes').textContent='You were knocked out before the training round finished, so no clone was trained this time.';
    $('echoLim').textContent='';$('echoAgain').hidden=true;return;}
  $('echoAgain').hidden=false;
  $('echoRes').textContent=(res==='win'?'You knocked your clone out':'Your clone took your last stock')+' after '+Math.round(rep.dur)+' seconds.';
  const k1=document.createElement('dl');k1.className='kv';k1.id='echoK1';imit.appendChild(k1);
  const pre=E.pre||rep.pre||{};
  kv('echoK1',[['Held-out agreement before the duel',pre.acc==null?'unavailable (under 30 held-out examples)':pctS(pre.acc)+' on '+pre.n+' examples'],['Baseline (its most common action)',pctS(pre.base)],['Random guess','10%'],
    ['Agreement with your choices mid-duel',rep.agree==null?'unavailable (under 20 samples)':pctS(rep.agree)+' of '+rep.nAgree],
    ['Behaviour mix similarity',rep.sim==null?'unavailable':pctS(rep.sim)]]);
  imit.appendChild(cmpBars(rep));
  const k2=document.createElement('dl');k2.className='kv';k2.id='echoK2';fight.appendChild(k2);
  kv('echoK2',[['Result',res==='win'?'you won':'clone won'],['Damage it dealt you',Math.round(rep.byClone)+'%'],['Damage you dealt it',Math.round(rep.toClone)+'%'],['Duel length',Math.round(rep.dur)+' s']]);
  $('echoLim').textContent='Imitation and fighting strength are measured separately: copying your habits closely does not make the clone a strong fighter. '+
    'It picks from 10 coarse actions using 13 features of the situation, and its held-out examples come from your own play (a random 1-in-5 split), not from another player.';
  saveClone();renderBrain();
}
