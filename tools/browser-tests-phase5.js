// Phase 5 browser checks: upgrades, schedule, bounties, upgrade effects, run summary, profile persistence and robustness.
const { chromium } = require('playwright');
const URL='http://127.0.0.1:8765/rift-rumble.html';
const log=[];const ok=(name,cond,extra)=>{log.push((cond?'PASS ':'FAIL ')+name+(extra?' — '+extra:''));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const clearWave=p=>p.evaluate(()=>{const R=window.__rr;R.G.queue=[];R.enemies.forEach(e=>{e.y=2000;});});
(async()=>{
 const b=await chromium.launch({args:['--proxy-bypass-list=<-loopback>']});
 const p=await b.newPage({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(URL);await p.waitForFunction(()=>!/Loading/.test(document.getElementById('artStatus').textContent),null,{timeout:8000});
 await p.evaluate(()=>{localStorage.removeItem('rrProfile1');window.__rr.profLoad();});
 await p.click('#startBtn');await p.click('.tab:nth-child(1)');await p.click('#fightBtn');await wait(400);
 /* 1. offer rules over 600 real rolls */
 const roll=await p.evaluate(()=>{const R=window.__rr,G=R.G;const cat=id=>R.UPG5.find(u=>u.id===id);let bad=[],cnt={common:0,rare:0,epic:0},early=0,rareFail=0;
   G.wave=6;G.upg={power:3};R.P.pct=0;R.P.stocks=5;
   for(let i=0;i<600;i++){const o=R.rollUpgrades(null);const ids=o.map(u=>u.id);
     if(o.length!==3||new Set(ids).size!==3)bad.push('dup');if(new Set(o.map(u=>u.cat)).size!==3)bad.push('cat');if(ids.includes('power'))bad.push('maxed');if(ids.includes('heal')||ids.includes('life'))bad.push('heal/life');o.forEach(u=>cnt[u.r]++);}
   G.wave=2;for(let i=0;i<300;i++){if(R.rollUpgrades(null).some(u=>u.r==='epic'))early++;}
   for(let i=0;i<300;i++){if(R.rollUpgrades('rare').some(u=>u.r==='common'))rareFail++;}
   G.upg={};G.wave=1;return {bad:[...new Set(bad)],cnt,early,rareFail};});
 ok('Offers: always 3 different power-ups from 3 different categories, maxed ones never offered',roll.bad.length===0,roll.bad.join(',')||'600 rolls clean');
 ok('Epic power-ups never appear before wave 4',roll.early===0);
 ok('Boss reward offers are rare or better',roll.rareFail===0);
 const tot=roll.cnt.common+roll.cnt.rare+roll.cnt.epic;ok('Rarity mix follows the weights (reported)',roll.cnt.common>roll.cnt.rare&&roll.cnt.rare>roll.cnt.epic,
   'common '+Math.round(roll.cnt.common/tot*100)+'% · rare '+Math.round(roll.cnt.rare/tot*100)+'% · epic '+Math.round(roll.cnt.epic/tot*100)+'%');
 /* 2. schedule: pick after wave 1 and every even wave */
 const seq=[];
 for(let w=1;w<=3;w++){await p.waitForFunction(()=>window.__rr.enemies.length>0||window.__rr.G.queue.length>0,null,{timeout:6000});await clearWave(p);
   const r=await p.waitForFunction(w=>{const G=window.__rr.G;return G.screen==='upgrade'||G.wave>w;},w,{timeout:8000}).then(()=>p.evaluate(()=>window.__rr.G.screen));
   seq.push('w'+w+':'+r);if(r==='upgrade'){if(w===2)await p.screenshot({path:'shots/p5_01_upgrades.png'});await p.click('#upgList .pick');await wait(300);}}
 ok('Power-up picks after wave 1 and wave 2, none after wave 3',seq.join(' ')==='w1:upgrade w2:upgrade w3:play',seq.join(' '));
 const hasB=await p.evaluate(()=>{const b=window.__rr.bounty;return b?b.def.id:null;});ok('From wave 2 every wave has a bounty',!!hasB,'current: '+hasB);
 /* 3. bounties */
 const bc=await p.evaluate(async()=>{const R=window.__rr,G=R.G;const t0=R.PROG.tokens,b0=R.PROG.bounties;
   G.bounty={def:R.BOUNTY.find(x=>x.id==='combo15'),done:false,failed:false};G.hits=15;G.hitT=1;await new Promise(r=>setTimeout(r,200));
   const done=G.bounty.done;const b2={def:R.BOUNTY.find(x=>x.id==='untouched'),done:false,failed:false};b2.def.start(b2);G.bounty=b2;
   R.P.inv=0;const e=R.enemies.find(x=>x.alive)||null;
   return {done,tokens:R.PROG.tokens-t0,count:R.PROG.bounties-b0};});
 ok('Completing a bounty (15-hit combo) grants a reroll',bc.done&&bc.tokens===1&&bc.count===1,JSON.stringify(bc));
 const uf=await p.evaluate(async()=>{const R=window.__rr;R.STATS.taken+=5;await new Promise(r=>setTimeout(r,150));return R.bounty.failed;});
 ok('Untouchable bounty fails as soon as you take damage',uf===true);
 await p.evaluate(()=>{window.__rr.G.bounty=null;});
 /* 4. reroll on the next upgrade screen */
 await clearWave(p);await p.waitForFunction(()=>window.__rr.G.screen==='upgrade',null,{timeout:8000});
 const rr1=await p.evaluate(()=>({vis:!document.getElementById('rerollBtn').hidden,t:window.__rr.PROG.tokens}));
 await p.click('#rerollBtn');await wait(150);const rr2=await p.evaluate(()=>window.__rr.PROG.tokens);
 ok('Reroll button appears with tokens and spends one',rr1.vis&&rr2===rr1.t-1,'tokens '+rr1.t+' → '+rr2);
 await p.click('#upgList .pick');await wait(300);
 /* 5. new upgrade effects are real */
 const fx=await p.evaluate(async()=>{const R=window.__rr,G=R.G,P=R.P;const out={};const sl=ms=>new Promise(r=>setTimeout(r,ms));
   const dashLen=async()=>{/* measured on one fixed 1/120 s step so the frame rate cannot change the reading */R.MANUAL=true;P.dashCd=0;P.dashT=0;P.stun=0;R.press('dash');R.update(1/120);const v=P.dashT;R.MANUAL=false;R.lastT=performance.now();return v;};
   G.upg.dodge=0;const d0=await dashLen();await sl(500);G.upg.dodge=1;const d1=await dashLen();out.dash=d1>d0*1.15;out.dashV=[d0.toFixed(3),d1.toFixed(3)];
   G.upg.sig=1;P.specCd=0;P.awake=0;R.press('special');await sl(80);const cd=R.HEROES[G.hero].special.cd;out.sig=Math.abs(P.specCd-(cd*.7))<.12;
   G.upg.airdash=1;P.y=200;P.onGround=false;await sl(900);out.air=P.airDash===2;
   P.pct=40;G.upg.vamp=1;const e=R.enemies.find(x=>x.alive);if(e){e.y=2000;}await sl(300);out.vamp=e?P.pct<=34.01:null;
   G.upg.aegis=1;R.startWave();out.aegisOn=P.aegis===1;P.inv=0;const ok2=window.__rr;return out;});
 ok('Afterimage makes dashes longer',fx.dash,'dash time '+fx.dashV.join(' → ')+' s');ok('Signature Mastery shortens the special cooldown by 30%',fx.sig);ok('Air Drift gives a second air dash after landing',fx.air);
 ok('Rift Siphon removes 6% damage on a knockout',fx.vamp===true,String(fx.vamp));ok('Rift Aegis shield is up at the start of a wave',fx.aegisOn);
 /* 6. game over: summary built from real counters, recorded to the profile */
 await wait(1500);
 const pre=await p.evaluate(()=>window.__rr.PROF.data.matches);
 await p.evaluate(()=>{const R=window.__rr;R.P.stocks=1;R.P.inv=0;R.P.y=2500;});
 await p.waitForFunction(()=>window.__rr.G.screen==='over',null,{timeout:8000});await wait(300);
 const sm=await p.evaluate(()=>{const R=window.__rr,G=R.G,o={};document.querySelectorAll('#sumKV dt').forEach(d=>o[d.textContent]=d.nextSibling.textContent);
   return {o,wave:G.wave,kos:G.kos,combo:G.maxHits,dealt:Math.round(R.STATS.dealt),taken:Math.round(R.STATS.taken),ups:R.PROG.upgrades.length,chips:document.querySelectorAll('.sumUp .chip').length,
     matches:R.PROF.data.matches,recent:R.PROF.data.recent[0],bTried:R.PROG.bountiesTried,b:R.PROG.bounties};});
 await p.screenshot({path:'shots/p5_02_summary.png'});
 ok('Run summary matches the game counters',sm.o['Highest wave'].startsWith(String(sm.wave))&&sm.o['Enemies defeated']===String(sm.kos)&&sm.o['Best combo'].startsWith(sm.combo+' hits')&&
   sm.o['Damage dealt']===sm.dealt+'%'&&sm.o['Damage received']===sm.taken+'%'&&sm.o['Bounties completed']===sm.b+' of '+sm.bTried&&sm.chips===sm.ups,JSON.stringify(sm.o));
 ok('The run is recorded once in the profile',sm.matches===pre+1&&sm.recent&&sm.recent.wave===sm.wave,'matches '+pre+' → '+sm.matches);
 const med=await p.evaluate(()=>Object.keys(window.__rr.PROF.data.medals));ok('Medals unlock from real events (wave 1 clear)',med.includes('first'),med.join(','));
 /* 7. persists across reload; profile screen shows it */
 await p.reload();await wait(800);
 const per=await p.evaluate(()=>({m:window.__rr.PROF.data.matches,med:Object.keys(window.__rr.PROF.data.medals).length}));
 ok('Profile survives a page reload',per.m===sm.matches&&per.med>=1,JSON.stringify(per));
 await p.click('#profBtn');await wait(200);const pv=await p.evaluate(()=>{const o={};document.querySelectorAll('#profKV dt').forEach(d=>o[d.textContent]=d.nextSibling.textContent);return {o,rows:document.querySelectorAll('#profRecent tr').length};});
 await p.screenshot({path:'shots/p5_03_profile.png',fullPage:false});
 ok('Profile screen shows matches, records and recent matches',pv.o['Matches played']===String(sm.matches)&&pv.rows>=1,JSON.stringify(pv.o)+' rows '+pv.rows);
 await p.click('#profReset');const armed=await p.evaluate(()=>document.getElementById('profReset').textContent);await p.click('#profReset');await wait(150);
 const rs=await p.evaluate(()=>({m:window.__rr.PROF.data.matches,ls:localStorage.getItem('rrProfile1')}));
 ok('Reset needs a second tap, then erases the stats',/again/.test(armed)&&rs.m===0&&rs.ls===null,armed);
 await p.click('#profClose');
 /* 8. restart resets the run state */
 await p.evaluate(()=>{const R=window.__rr;R.setHero('mochi');R.startGame();R.G.upg.power=2;R.PROG.upgrades.push('power');R.STATS.dealt=50;R.startGame();});
 const rst=await p.evaluate(()=>{const R=window.__rr;return {upg:Object.keys(R.G.upg).length,pu:R.PROG.upgrades.length,dealt:R.STATS.dealt,bounty:R.bounty,wave:R.G.wave,tokens:R.PROG.tokens};});
 ok('Starting a new run resets upgrades, bounty and counters',rst.upg===0&&rst.pu===0&&rst.dealt===0&&rst.bounty===null&&rst.wave===1&&rst.tokens===0,JSON.stringify(rst));
 /* 9. quitting mid-run is recorded as a quit */
 await p.evaluate(()=>window.__rr.togglePause());await p.click('#quitBtn');await wait(200);
 const q=await p.evaluate(()=>window.__rr.PROF.data.recent[0]);ok('Quitting mid-run is recorded as a quit',q&&/^Quit on wave/.test(q.result),q&&q.result);
 ok('No page errors (progression run)',errs.length===0,errs.slice(0,3).join(' | '));
 await p.close();
 /* 10. corrupted and invalid saved data */
 const c=await b.newPage();const e2=[];c.on('pageerror',e=>e2.push(e.message));
 await c.addInitScript(()=>{const k=sessionStorage.getItem('stage')||'0';if(k==='0'){sessionStorage.setItem('stage','1');localStorage.setItem('rrProfile1','{broken json');}
   else if(k==='1'){sessionStorage.setItem('stage','2');localStorage.setItem('rrProfile1',JSON.stringify({matches:-5,kos:'lots',heroes:{fake:3,kenji:2},medals:{first:1,hack:1},recent:[{hero:'nobody'},{hero:'lila',wave:4,result:'x'}],echo:{played:1,won:9}}));}});
 await c.goto(URL);await wait(700);const cs=await c.evaluate(()=>window.__rr.PROF.status);
 await c.evaluate(()=>window.__rr.openProfile());const cmsg=await c.evaluate(()=>document.getElementById('profStatus').textContent);
 ok('Corrupted profile data is reset without crashing, and the player is told',cs==='corrupt'&&/unreadable/.test(cmsg)&&e2.length===0,cmsg);
 await c.reload();await wait(700);const sv=await c.evaluate(()=>{const d=window.__rr.PROF.data;return {m:d.matches,k:d.kos,h:d.heroes,med:Object.keys(d.medals),rec:d.recent.map(r=>r.hero),echo:d.echo};});
 ok('Invalid fields are cleaned (negative counts, unknown heroes and medals)',sv.m===0&&sv.k===0&&JSON.stringify(sv.h)==='{"kenji":2}'&&sv.med.join()==='first'&&sv.rec.join()==='lila'&&sv.echo.won===1,JSON.stringify(sv));
 await c.close();
 const d=await b.newPage();const e3=[];d.on('pageerror',e=>e3.push(e.message));
 await d.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new Error('blocked');}});});
 await d.goto(URL);await wait(700);await d.evaluate(()=>{const R=window.__rr;R.setHero('jaguar');R.startGame();});await wait(800);
 await d.evaluate(()=>{const R=window.__rr;R.P.stocks=1;R.P.inv=0;R.P.y=2500;});await d.waitForFunction(()=>window.__rr.G.screen==='over',null,{timeout:8000});
 await d.evaluate(()=>window.__rr.openProfile());const dm=await d.evaluate(()=>document.getElementById('profStatus').textContent);
 ok('With storage blocked the game still ends a run and explains stats are not saved',/unavailable/.test(dm)&&e3.length===0,dm);
 await d.close();await b.close();console.log(log.join('\n'));
})().catch(e=>{console.log(log.join('\n'));console.log('SCRIPT ERROR',e.message);process.exit(1);});
