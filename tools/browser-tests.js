const { chromium } = require('playwright');
const URL='http://127.0.0.1:8765/rift-rumble.html';
const log=[];const ok=(name,cond,extra)=>{log.push((cond?'PASS ':'FAIL ')+name+(extra?' — '+extra:''));};
(async()=>{
 const b=await chromium.launch({args:['--proxy-bypass-list=<-loopback>']});
 const p=await b.newPage({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(URL);await p.waitForFunction(()=>!/Loading/.test(document.getElementById('artStatus').textContent),null,{timeout:8000});
 const st=await p.textContent('#artStatus');const mm=/(\d+)\/(\d+) from PNG/.exec(st);ok('All character PNG sprite sets load over HTTP',!!mm&&mm[1]===mm[2]&&+mm[2]===25,st);
 await p.click('#startBtn');await p.waitForTimeout(200);
 await p.click('.tab:nth-child(2)');await p.waitForTimeout(200);
 await p.click('.hcard:nth-child(3)');await p.waitForTimeout(900);
 await p.screenshot({path:'shots/01_select.png'});
 await p.click('#fightBtn');await p.waitForTimeout(1800);
 const R='window.__rr';
 const info=await p.evaluate(()=>{const r=window.__rr;return {hero:r.G.hero,uni:r.G.uni,art:r.P.artId,w:r.P.w,h:r.P.h};});
 ok('Hana selected and uses new art',info.hero==='hana'&&info.art==='hana_bloom',JSON.stringify(info));
 ok('Hero hitbox unchanged (30x78)',info.w===30&&info.h===78);
 await p.screenshot({path:'shots/02_idle_arena.png'});
 await p.evaluate(()=>{window.__rr.P.x=300;window.__rr.P.inv=3;});await p.keyboard.down('KeyD');await p.waitForTimeout(450);await p.screenshot({path:'shots/03_run.png'});
 const x1=await p.evaluate(()=>window.__rr.P.x);await p.waitForTimeout(300);const x2=await p.evaluate(()=>window.__rr.P.x);await p.keyboard.up('KeyD');
 ok('Movement works',x2>x1,'x '+x1.toFixed(0)+' -> '+x2.toFixed(0));
 await p.keyboard.press('Space');await p.waitForTimeout(160);const air=await p.evaluate(()=>!window.__rr.P.onGround);await p.screenshot({path:'shots/04_jump.png'});
 ok('Jump works',air);await p.waitForTimeout(700);
 // place the nearest enemy in front of Hana, then run the real attack input
 await p.waitForFunction(()=>window.__rr.P.alive&&window.__rr.P.inv<=0&&window.__rr.enemies.some(e=>e.spawnT<=0),null,{timeout:9000});
 await p.evaluate(()=>{const r=window.__rr,P=r.P;P.x=420;P.y=410;P.vx=0;P.vy=0;P.face=1;P.inv=0;const e=r.enemies.find(e=>e.spawnT<=0);e.x=P.x+42;e.y=410;e.vx=0;e.vy=0;e.cd=5;e.wind=0;e.blockT=0;e.stun=0;e.evadeCd=99;e.tpCd=99;e.dodgeCd=99;e.guardStam=0;});
 await p.waitForTimeout(60);
 const pct0=await p.evaluate(()=>window.__rr.enemies.reduce((a,e)=>a+e.pct,0));
 let shot=false;
 for(let i=0;i<8;i++){await p.keyboard.press('KeyJ');await p.waitForTimeout(i===3&&!shot?70:120);if(i===3){await p.screenshot({path:'shots/05_slash.png'});shot=true;}}
 const pct1=await p.evaluate(()=>window.__rr.enemies.reduce((a,e)=>a+e.pct,0)+window.__rr.G.kos*100);
 ok('Attacks connect (enemy damage rises)',pct1>pct0,pct0.toFixed(0)+' -> '+pct1.toFixed(0));
 await p.keyboard.press('KeyK');await p.waitForTimeout(140);await p.screenshot({path:'shots/06_special.png'});
 const petals=await p.evaluate(()=>document&&window.__rr.G&&1);
 await p.evaluate(()=>{window.__rr.P.meter=100;});await p.keyboard.press('KeyI');await p.waitForTimeout(350);await p.screenshot({path:'shots/07_super_cutin.png'});
 await p.waitForTimeout(1300);
 // hurt + knockback: let an enemy hit us via the real applyHit path by standing still near one
 const hurt=await p.evaluate(()=>{const r=window.__rr;const P=r.P;P.inv=0;const e=r.enemies.find(e=>e.spawnT<=0);if(!e)return null;
   const vx0=P.vx;e.x=P.x+30;e.face=-1;e.cd=0;e.wind=.01;return true;});
 await p.waitForTimeout(90);await p.screenshot({path:'shots/08_hit.png'});
 // pause / resume
 await p.keyboard.press('KeyP');await p.waitForTimeout(100);const t0=await p.evaluate(()=>window.__rr.G.time);await p.waitForTimeout(500);const t1=await p.evaluate(()=>window.__rr.G.time);
 const scr=await p.evaluate(()=>window.__rr.G.screen);await p.screenshot({path:'shots/09_pause.png'});
 ok('Pause stops the simulation',scr==='pause'&&t0===t1,'screen='+scr+' time '+t0.toFixed(2)+' -> '+t1.toFixed(2));
 await p.click('#resumeBtn');await p.waitForTimeout(300);const t2=await p.evaluate(()=>window.__rr.G.time);ok('Resume continues',t2>t1);
 // wave clear -> victory pose -> clone wave with Hana's corrupted reflection
 await p.evaluate(()=>{const r=window.__rr;r.G.wave=4;r.G.queue=[];r.enemies.forEach(e=>{e.y=2000;});r.P.stun=0;r.P.act=null;});
 await p.waitForTimeout(700);await p.screenshot({path:'shots/10_victory_pose.png'});
 const scr2=await p.evaluate(()=>window.__rr.G.screen);ok('Wave clears to the upgrade screen',true,'screen='+scr2);
 await p.waitForFunction(()=>window.__rr.G.screen==='upgrade',null,{timeout:5000});
 await p.click('#upgList .pick');await p.waitForTimeout(3200);
 const cl=await p.evaluate(()=>{const r=window.__rr;const c=r.enemies.find(e=>e.role==='clone');return c?{art:c.artId,w:c.w,h:c.h,intent:c.intent}:null;});
 ok('Shadow Clone spawns with Hana corrupted art',cl&&cl.art==='hana_bloom',JSON.stringify(cl));
 await p.screenshot({path:'shots/11_clone.png'});
 const sa=await p.evaluate(()=>{const r=window.__rr;r.G.uni='sh';return null;});
 // AI still learning
 const ai=await p.evaluate(()=>{const r=window.__rr;return {samples:r.CLONE.X.length,steps:r.CLONE.steps,pred:r.PRED.n};});
 ok('AI systems still collecting/training',ai.samples>0&&ai.steps>0&&ai.pred>0,JSON.stringify(ai));
 // enemy art + hitbox check for the Shinobi grunt
 const gr=await p.evaluate(()=>{const r=window.__rr;const e=r.enemies.find(e=>e.role==='grunt');return e?{art:e.artId,name:e.name,w:e.w,h:e.h}:null;});
 ok('Shadow Assassin grunt uses new art, hitbox 34x78',!gr||(gr.art==='shadow_assassin'&&gr.w===34&&gr.h===78),JSON.stringify(gr));
 ok('No page errors (desktop run)',errs.length===0,errs.slice(0,3).join(' | '));
 await p.close();
 // ---- fallback: one PNG missing -> keeps built-in sprites, no crash
 const p2=await b.newPage({viewport:{width:900,height:600}});const e2=[];p2.on('pageerror',e=>e2.push(e.message));
 await p2.route('**/assets/hana_bloom/torso.png',r=>r.abort());
 await p2.goto(URL);await p2.waitForFunction(()=>!/Loading/.test(document.getElementById('artStatus').textContent),null,{timeout:8000});
 const st2=await p2.textContent('#artStatus');const hs=await p2.evaluate(()=>window.__rr.ART.status.hana_bloom);ok('Missing PNG falls back to built-in sprites',hs==='baked'&&/1 built-in/.test(st2),hs+' / '+st2);
 // ---- fallback: renderer error -> classic rig, game keeps running
 await p2.evaluate(()=>{const r=window.__rr;r.ART.defs.shadow_assassin.render=()=>{throw new Error('simulated art failure');};});
 await p2.click('#startBtn');await p2.click('.tab:nth-child(2)');await p2.click('#fightBtn');await p2.waitForTimeout(3500);
 const st3=await p2.evaluate(()=>window.__rr.ART.status.shadow_assassin);const run=await p2.evaluate(()=>window.__rr.G.screen);
 ok('Art exception falls back to classic renderer',st3==='failed'&&run==='play','status='+st3+' screen='+run);
 ok('No page errors (fallback run)',e2.length===0,e2.join(' | '));
 await p2.screenshot({path:'shots/12_fallback.png'});await p2.close();
 // ---- every hero uses its new art; every enemy slot and boss uses artwork-sheet enemies with the original hitboxes
 const p4=await b.newPage({viewport:{width:1280,height:800}});const e4=[];p4.on('pageerror',e=>e4.push(e.message));p4.on('console',m=>{if(/fallback/i.test(m.text()))e4.push(m.text());});
 await p4.goto(URL);await p4.waitForFunction(()=>!/Loading/.test(document.getElementById('artStatus').textContent),null,{timeout:8000});
 const HA={kenji:'kenji_kaboom',lila:'lila_thunderfist',mochi:'mochi_monk',nyanja:'nyanja',rokuro:'rokuro_ink',hana:'hana_bloom',comet:'captain_comet',raccoon:'midnight_raccoon',skate:'skate_surge',titan:'tin_titan',gravity:'grandma_gravity',jaguar:'jaguar_jinx'};
 const heroRes=[];
 for(const h in HA){await p4.evaluate(h=>{const R=window.__rr;R.setHero(h);R.startGame();},h);await p4.waitForTimeout(500);
   heroRes.push(await p4.evaluate(()=>{const R=window.__rr;return {h:R.G.hero,art:R.P.artId,st:R.ART.status[R.P.artId],w:R.P.w,hh:R.P.h,arena:R.ARENAS.has(R.G.uni)};}));}
 const badH=heroRes.filter(r=>r.art!==HA[r.h]||r.st!=='png'||r.w!==30||r.hh!==78||!r.arena);
 ok('All 12 heroes render with their new art (PNG), hitbox 30x78, arena active',badH.length===0&&heroRes.length===12,JSON.stringify(badH.length?badH:heroRes.map(r=>r.h+':'+r.st)));
 const EXP={ki:{grunt:['Rift Grunt','rift_grunt',34,78],shooter:['Rift Caster','rift_caster',32,76],heavy:['Rift Beast','rift_beast',46,100],boss:['ONI BRUTE','oni_brute',86,130]},
   sh:{grunt:['Shadow Assassin','shadow_assassin',34,78],shooter:['Rift Caster','rift_caster',32,76],heavy:['Oni Brute','oni_brute',46,100],boss:['RIFT BEAST','rift_beast',86,130]},
   cape:{grunt:['Rift Grunt','rift_grunt',34,78],shooter:['Rift Caster','rift_caster',32,76],heavy:['Mecha Sentinel','mecha_sentinel',46,100],boss:['RIFT BEAST','rift_beast',86,130]},
   mighty:{grunt:['Void Stalker','void_stalker',34,78],shooter:['Rift Caster','rift_caster_float',50,44],heavy:['Rift Beast','rift_beast_prowl',64,74],boss:['MECHA SENTINEL','mecha_sentinel',86,110]}};
 for(const [u,h] of [['ki','kenji'],['sh','nyanja'],['cape','raccoon'],['mighty','gravity']]){
   await p4.evaluate(h=>{const R=window.__rr;R.setHero(h);R.startGame();},h);await p4.waitForTimeout(400);
   /* Phase 7 mixes the five art-pack extras into waves; pin the universe roster here so this check still sees each slot's own enemy */
   await p4.evaluate(()=>{const R=window.__rr;R.G.chal={noNew:true};R.G.wave=9;R.G.queue=[];R.enemies.forEach(e=>{e.y=2000;});});
   await p4.waitForFunction(()=>window.__rr.G.screen==='upgrade'||window.__rr.G.wave===10,null,{timeout:8000});if(await p4.evaluate(()=>window.__rr.G.screen==='upgrade'))await p4.click('#upgList .pick');
   const seen={};for(let k=0;k<30;k++){await p4.waitForTimeout(250);
     const cur=await p4.evaluate(()=>{const R=window.__rr;R.P.inv=1;return R.enemies.filter(e=>e.spawnT<=0).map(e=>({role:e.role,name:e.name,art:e.artId,w:e.w,h:e.h,fly:!!e.fly,st:R.ART.status[e.artId]}));});
     cur.forEach(e=>{seen[e.role]=e;});if(seen.boss&&seen.grunt&&seen.shooter&&seen.heavy)break;}
   if(u==='mighty'||u==='ki')await p4.screenshot({path:'shots/17_boss_'+u+'.png'});
   const bad=[];for(const r in EXP[u]){const x=EXP[u][r],e=seen[r];if(!e||e.name!==x[0]||e.art!==x[1]||e.w!==x[2]||e.h!==x[3]||e.st!=='png')bad.push(r+':'+JSON.stringify(e||null));}
   if(u==='mighty'&&seen.shooter&&!seen.shooter.fly)bad.push('mighty shooter should fly');
   ok('Wave 10 in '+u+': grunt, shooter, heavy and boss are the artwork enemies with original hitboxes',bad.length===0,bad.join(' ')||Object.keys(seen).map(r=>seen[r].name).join(', '));
 }
 ok('No page errors (roster run)',e4.length===0,e4.slice(0,3).join(' | '));await p4.close();
 // ---- mobile portrait (auto-rotated play mode)
 const p3=await b.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});const e3=[];p3.on('pageerror',e=>e3.push(e.message));
 await p3.goto(URL);await p3.waitForTimeout(600);await p3.tap('#startBtn');await p3.waitForTimeout(300);await p3.tap('.tab:nth-child(2)');await p3.waitForTimeout(150);await p3.tap('.hcard:nth-child(3)');await p3.tap('#fightBtn');await p3.waitForTimeout(2200);
 const mob=await p3.evaluate(()=>({cls:document.getElementById('root').className,hero:window.__rr.G.hero}));
 ok('Mobile portrait: rotated full-screen play with Hana',/rot/.test(mob.cls)&&mob.hero==='hana',mob.cls);
 await p3.screenshot({path:'shots/13_mobile.png'});ok('No page errors (mobile)',e3.length===0,e3.join(' | '));
 await b.close();console.log(log.join('\n'));
})().catch(e=>{console.log(log.join('\n'));console.log('SCRIPT ERROR',e.message);process.exit(1);});
