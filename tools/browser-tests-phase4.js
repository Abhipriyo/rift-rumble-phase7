// Phase 4 browser checks: adaptive enemies, bosses, AI Lab metrics recomputed independently, Echo Duel, storage failures.
const { chromium } = require('playwright');
const URL='http://127.0.0.1:8765/rift-rumble.html';
const log=[];const ok=(name,cond,extra)=>{log.push((cond?'PASS ':'FAIL ')+name+(extra?' — '+extra:''));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function bot(p,secs,opt){opt=opt||{};const t0=Date.now();
  while(Date.now()-t0<secs*1000){
    await p.evaluate(o=>{const R=window.__rr,P=R.P;if(!P)return;['left','right','guard'].forEach(k=>R.kHeld[k]=false);if(!P.alive)return;P.inv=Math.max(P.inv,o.god?1:0);
      const E=R.enemies.filter(e=>e.spawnT<=0&&e.alive);const t=E.sort((a,b)=>Math.abs(a.x-P.x)-Math.abs(b.x-P.x))[0];
      const hx=t?Math.max(240,Math.min(720,t.x)):480;if(P.x<hx-40)R.kHeld.right=true;else if(P.x>hx+40)R.kHeld.left=true;
      if(!P.onGround&&P.vy>0&&(P.x<200||P.x>760))R.press('jump');
      const r=Math.random();if(t&&Math.abs(t.x-P.x)<90){if(r<.5)R.press('attack');else if(r<.6)R.press('jump');else if(r<.7)R.press('dash');else if(r<.8)R.press('special');else R.kHeld.guard=true;}
      else if(r<.15)R.press('special');},opt);
    await wait(120);}}
(async()=>{
 const b=await chromium.launch({args:['--proxy-bypass-list=<-loopback>']});
 /* ---------- 1. endless run: personalities, predictor + clone metrics recomputed ---------- */
 const p=await b.newPage({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(URL);await p.waitForFunction(()=>!/Loading/.test(document.getElementById('artStatus').textContent),null,{timeout:8000});
 await p.evaluate(()=>{localStorage.removeItem('rrClone');window.__rr.CLONE.reset();});
 await p.click('#startBtn');await p.click('.tab:nth-child(1)');await p.click('#fightBtn');
 await bot(p,20,{god:true});
 await p.evaluate(()=>{const R=window.__rr;R.G.wave=5;R.G.queue=['grunt','grunt','shooter','heavy'];});await bot(p,10,{god:true});
 const pers=await p.evaluate(()=>{const R=window.__rr;return R.enemies.filter(e=>e.role!=='clone'&&e.role!=='boss').map(e=>({c:e.cosId,p:e.pers,hasDbg:!!e.dbg}));});
 ok('Every regular enemy has a tactical personality and decision data',pers.length>0&&pers.every(x=>x.p&&x.hasDbg),JSON.stringify(pers));
 const met=await p.evaluate(()=>window.__rr.STATS.pers);const MAP={rift_grunt:['berserker','hunter','mimic'],rift_caster:['zoner'],rift_beast:['hunter'],oni_brute:['guardian']};
 ok('Personalities follow the enemy type (grunt: berserker/hunter/mimic, caster: zoner, beast: hunter)',met.berserker>0&&pers.every(x=>!MAP[x.c]||MAP[x.c].includes(x.p)),JSON.stringify(met));
 await p.evaluate(()=>window.__rr.render(performance.now()/1000,0));
 const lab=await p.evaluate(()=>{const R=window.__rr,C=R.CLONE,PR=R.PRED;R.togglePause();
   C.evalAll();R.renderBrain();
   const shown={};['cloneStats','predStats'].forEach(id=>{document.getElementById(id).querySelectorAll('dt').forEach(d=>shown[d.textContent]=d.nextSibling.textContent);});
   let okc=0,L=0;for(let i=0;i<C.VX.length;i++){const pr=C.forward(C.VX[i]);let bi=0;for(let k=1;k<10;k++)if(pr[k]>pr[bi])bi=k;if(bi===C.VY[i])okc++;L+=-Math.log(Math.max(1e-7,pr[C.VY[i]]));}
   const tr=new Set(C.X);const leak=C.VX.filter(x=>tr.has(x)).length;
   const sx=C.X,sy=C.Y,st=C.steps;C.X=[];C.Y=[];C.step(32);const stepped=C.steps!==st;C.X=sx;C.Y=sy;
   R.togglePause();document.getElementById('ovPause').hidden=true;
   return {shown,nTrain:C.X.length,nVal:C.VX.length,mine:C.VX.length?okc/C.VX.length:null,mineLoss:C.VX.length?L/C.VX.length:null,its:C.val.acc,itsLoss:C.val.loss,leak,stepped,
     predN:PR.evN,predObs:PR.n,predHit:PR.evHit,predBase:PR.baseHit,recent:PR.recent.length};});
 const shown=lab.shown;
 ok('Held-out examples exist and never appear in the training set',lab.nVal>=30&&lab.leak===0,'train '+lab.nTrain+' · held-out '+lab.nVal+' · overlap '+lab.leak);
 ok('Training uses only the training set (no steps when it is empty)',lab.stepped===false);
 ok('Held-out agreement recomputed independently matches the model',lab.its!=null&&Math.abs(lab.mine-lab.its)<1e-9&&Math.abs(lab.mineLoss-lab.itsLoss)<1e-9,'mine '+(lab.mine*100).toFixed(1)+'% / reported '+(lab.its*100).toFixed(1)+'%, loss '+lab.mineLoss.toFixed(3));
 const shownAcc=shown['Held-out action agreement'];ok('AI Lab shows that held-out agreement',shownAcc===Math.round(lab.its*100)+'%','shown '+shownAcc);
 ok('Predictor is evaluated prequentially on every move after the 3rd',lab.predN===lab.predObs-3&&lab.recent<=12,'evaluated '+lab.predN+' of '+lab.predObs+' moves');
 ok('AI Lab predictor accuracy and baseline match the counts',shown['Top-1 accuracy']===Math.round(lab.predHit/lab.predN*100)+'%'&&shown['Baseline: most frequent move so far']===Math.round(lab.predBase/lab.predN*100)+'%',
   shown['Top-1 accuracy']+' vs baseline '+shown['Baseline: most frequent move so far']);
 await p.keyboard.press('Backquote');await wait(200);const dbg=await p.evaluate(()=>window.__rr.DEBUG);ok('Backtick toggles the developer debug view',dbg===true);
 await p.screenshot({path:'shots/p4_01_debug.png'});await p.keyboard.press('Backquote');
 await p.screenshot({path:'shots/p4_02_lab.png',fullPage:true});
 ok('No page errors (endless run)',errs.length===0,errs.slice(0,3).join(' | '));
 /* ---------- 2. boss: intro card, phase bar, telegraphs ---------- */
 await p.evaluate(()=>{const R=window.__rr;R.setHero('kenji');R.startGame();R.G.wave=9;R.G.queue=[];R.enemies.length=0;R.startWave();});
 let card=false,states=new Set(),telShot=false,prev='';const t0=Date.now();
 while(Date.now()-t0<14000){const s=await p.evaluate(()=>{const R=window.__rr,b=R.bossOf();R.P.inv=1;return {card:!!R.G.bossCard,st:b?b.bs.state:null,atk:b&&b.bs.atk};});
   if(s.card)card=true;if(s.st)states.add(s.st);
   if(s.card&&!prev){await p.screenshot({path:'shots/p4_03_boss_intro.png'});prev='card';}
   if(s.st==='tele'&&!telShot){await wait(150);await p.screenshot({path:'shots/p4_04_boss_telegraph.png'});telShot=true;}
   await p.evaluate(()=>{const R=window.__rr,P=R.P,b=R.bossOf();R.kHeld.left=R.kHeld.right=false;if(b&&Math.abs(b.x-P.x)>90){if(b.x>P.x)R.kHeld.right=true;else R.kHeld.left=true;}});
   await wait(100);}
 ok('Boss intro card shows when the boss lands',card);
 ok('Boss cycles walk → telegraph → attack → recovery',['walk','tele','act','rec'].every(x=>states.has(x)),[...states].join(','));
 await p.evaluate(()=>{const b=window.__rr.bossOf();if(b)b.pct=70;});await wait(1500);
 const ph=await p.evaluate(()=>{const b=window.__rr.bossOf();return b?b.bs.phase:null;});ok('Boss enters phase 2 at 60% damage',ph===1,'phase index '+ph);
 await p.screenshot({path:'shots/p4_05_boss_phase2.png'});
 await p.close();
 /* ---------- 3. Echo Duel end to end ---------- */
 const q=await b.newPage({viewport:{width:1280,height:900}});const e3=[];q.on('pageerror',e=>e3.push(e.message));
 await q.goto(URL);await q.waitForFunction(()=>!/Loading/.test(document.getElementById('artStatus').textContent),null,{timeout:8000});
 await q.evaluate(()=>{localStorage.removeItem('rrClone');window.__rr.CLONE.reset();});
 await q.click('#echoBtn');await wait(200);
 const sel=await q.evaluate(()=>({h:document.querySelector('#ovSelect h2').textContent,b:document.getElementById('fightBtn').textContent}));
 ok('Echo Duel opens the fighter select in Echo mode',/ECHO DUEL/.test(sel.h)&&sel.b==='START TRAINING',JSON.stringify(sel));
 await q.click('.tab:nth-child(2)');await q.click('.hcard:nth-child(1)');await q.click('#fightBtn');await wait(400);
 const m0=await q.evaluate(()=>({mode:window.__rr.G.mode,ph:window.__rr.G.echo&&window.__rr.G.echo.phase}));ok('Echo Duel starts in the training round',m0.mode==='echo'&&m0.ph==='train',JSON.stringify(m0));
 await bot(q,24,{god:true});await q.screenshot({path:'shots/p4_06_echo_training.png'});
 const rec=await q.evaluate(()=>{const R=window.__rr;return R.CLONE.seen-R.G.echo.start;});
 await q.evaluate(()=>{window.__rr.G.echo.t=79.95;});
 await q.waitForFunction(()=>window.__rr.G.screen==='learn',null,{timeout:5000});await wait(900);
 const L1=await q.evaluate(()=>({vis:!document.getElementById('ovLearn').hidden,steps:window.__rr.G.echo.steps,bar:document.getElementById('learnBar').style.width}));
 await q.screenshot({path:'shots/p4_07_echo_learning.png'});
 ok('Training screen runs real steps with a progress bar',L1.vis&&L1.steps>0,'steps '+L1.steps+', bar '+L1.bar+', recorded '+rec+' decisions');
 await q.waitForFunction(()=>window.__rr.G.echo.phase==='duel',null,{timeout:12000});await wait(600);
 const d0=await q.evaluate(()=>{const R=window.__rr;const c=R.enemies.find(e=>e.role==='clone');return {clone:!!c,on:R.CLONE.duel.on,steps:R.CLONE.steps,steps2:null};});
 await bot(q,6,{god:true});
 const d1=await q.evaluate(()=>{const R=window.__rr;return {steps:R.CLONE.steps,dec:Array.from(R.CLONE.duel.clone).reduce((a,b)=>a+b,0),n:R.CLONE.duel.n};});
 ok('Duel spawns the clone with the network frozen',d0.clone&&d0.on&&d1.steps===d0.steps,'steps '+d0.steps+' → '+d1.steps+', clone decisions '+d1.dec+', your samples '+d1.n);
 await q.screenshot({path:'shots/p4_08_echo_duel.png'});
 await q.evaluate(()=>{const c=window.__rr.enemies.find(e=>e.role==='clone');if(c){c.y=2500;c.x=-500;}});
 await q.waitForFunction(()=>!document.getElementById('ovEcho').hidden,null,{timeout:6000});
 const rep=await q.evaluate(()=>{const R=window.__rr,ld=R.CLONE.lastDuel,o={};document.querySelectorAll('#ovEcho dt').forEach(d=>o[d.textContent]=d.nextSibling.textContent);
   const pre=R.G.echo.pre;return {title:document.getElementById('echoTitle').textContent,o,ld:{agree:ld.agree,n:ld.nAgree,sim:ld.sim,by:ld.byClone,to:ld.toClone},pre};});
 await q.screenshot({path:'shots/p4_09_echo_report.png'});
 const expHeld=rep.pre.acc==null?null:Math.round(rep.pre.acc*100)+'% on '+rep.pre.n+' examples';
 ok('Echo report shows the measured held-out agreement',rep.title==='YOU BEAT YOUR CLONE'&&(expHeld==null?/unavailable/.test(rep.o['Held-out agreement before the duel']):rep.o['Held-out agreement before the duel']===expHeld),rep.o['Held-out agreement before the duel']);
 ok('Echo report damage figures match the duel log',rep.o['Damage you dealt it']===Math.round(rep.ld.to)+'%'&&rep.o['Damage it dealt you']===Math.round(rep.ld.by)+'%',rep.o['Damage you dealt it']+' / '+rep.o['Damage it dealt you']);
 await q.click('#echoAgain');await wait(500);const again=await q.evaluate(()=>({ph:window.__rr.G.echo.phase,c:!!window.__rr.enemies.find(e=>e.role==='clone')}));
 ok('"Duel again" starts a new duel with the same model',again.ph==='duel'&&again.c,JSON.stringify(again));
 await q.evaluate(()=>window.__rr.togglePause());await q.click('#quitBtn');await wait(300);
 await q.evaluate(()=>{window.__rr.startGame&&0;});
 ok('No page errors (Echo Duel)',e3.length===0,e3.slice(0,3).join(' | '));
 await q.close();
 /* ---------- 4. storage blocked / old data ---------- */
 const r=await b.newPage();const e4=[];r.on('pageerror',e=>e4.push(e.message));
 await r.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('storage blocked');}});});
 await r.goto(URL);await wait(800);await r.evaluate(()=>{const R=window.__rr;R.setHero('nyanja');R.startGame();});await wait(2500);
 const st=await r.evaluate(()=>window.__rr.G.screen);ok('Game runs with browser storage blocked',st==='play'&&e4.length===0,'screen '+st+(e4.length?' · '+e4[0]:''));await r.close();
 const s2=await b.newPage();const e5=[];s2.on('pageerror',e=>e5.push(e.message));
 await s2.addInitScript(()=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');const X=[],Y=[];for(let i=0;i<100;i++){X.push(Array.from({length:13},()=>Math.random()));Y.push(i%10);}
   localStorage.setItem('rrClone',JSON.stringify({X,Y}));}});
 await s2.goto(URL);await wait(800);const mig=await s2.evaluate(()=>({t:window.__rr.CLONE.X.length,v:window.__rr.CLONE.VX.length}));
 ok('Old saved clone data is migrated with a held-out split',mig.t===80&&mig.v===20,JSON.stringify(mig));
 await s2.evaluate(()=>localStorage.setItem('rrClone','{not json'));await s2.reload();await wait(800);
 ok('Corrupted saved clone data does not crash the game',e5.length===0,e5.join(' | '));
 await s2.close();
 await b.close();console.log(log.join('\n'));
})().catch(e=>{console.log(log.join('\n'));console.log('SCRIPT ERROR',e.message);process.exit(1);});
