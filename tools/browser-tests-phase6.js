// Phase 6 browser checks: settings that really apply, key remapping, audio buses/limiter/ambience,
// fixed timestep, visibility pause, effect caps, perf counters, mobile settings layout and focus.
const { chromium } = require('playwright');
const URL='http://127.0.0.1:8765/rift-rumble.html';
const log=[];const ok=(name,cond,extra)=>{log.push((cond?'PASS ':'FAIL ')+name+(extra?' — '+extra:''));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const near=(a,b,e)=>Math.abs(a-b)<=(e||.01);
(async()=>{
 const b=await chromium.launch({args:['--proxy-bypass-list=<-loopback>','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(URL);await p.evaluate(()=>{localStorage.removeItem('rrSettings1');});await p.reload();
 await p.waitForFunction(()=>!/Loading/.test(document.getElementById('artStatus').textContent),null,{timeout:8000});

 /* 1. defaults + settings screen */
 const d0=await p.evaluate(()=>{const S=window.__rr.SET;return {m:S.master,s:S.sfx,a:S.music,sh:S.shake,fl:S.flash,d:S.diff};});
 ok('Defaults without reduced motion: full shake/flash, Normal difficulty',d0.sh==='full'&&d0.fl==='full'&&d0.d==='normal',JSON.stringify(d0));
 await p.click('#setBtn');await wait(200);
 const so=await p.evaluate(()=>({vis:!document.getElementById('ovSettings').hidden,focus:document.activeElement.id,rows:document.querySelectorAll('#keyRows tr').length}));
 ok('Settings opens from the title screen with focus on Done and 11 key rows',so.vis&&so.focus==='setClose'&&so.rows===11,JSON.stringify(so));
 await p.screenshot({path:'shots/p6_01_settings.png'});

 /* 2. volume sliders drive the real gain nodes */
 await p.$eval('#set_master',el=>{el.value=50;el.dispatchEvent(new Event('input'));el.dispatchEvent(new Event('change'));});
 await p.$eval('#set_sfx',el=>{el.value=40;el.dispatchEvent(new Event('input'));el.dispatchEvent(new Event('change'));});
 await p.$eval('#set_music',el=>{el.value=0;el.dispatchEvent(new Event('input'));el.dispatchEvent(new Event('change'));});
 await wait(500);
 const g=await p.evaluate(()=>{const S=window.__rr.SND;return {ctx:!!S.ctx,m:S.master.gain.value,s:S.sfxBus.gain.value,a:S.musBus.gain.value,label:document.getElementById('val_master').textContent};});
 ok('Master/effects/ambience sliders set the real Web Audio gains',g.ctx&&near(g.m,.3)&&near(g.s,.4)&&near(g.a,0),JSON.stringify(g));

 /* 3. comfort: shake and flash */
 await p.click('#segShake .segb:nth-child(3)');await p.click('#segFlash .segb:nth-child(2)');
 const cf=await p.evaluate(()=>{const R=window.__rr,G=R.G;const out={};
   G.shake=0;R.shake(10);out.off=G.shake;R.SET.shake='reduced';G.shake=0;R.shake(10);out.red=G.shake;R.SET.shake='full';G.shake=0;R.shake(10);out.full=G.shake;G.shake=0;R.SET.shake='off';
   out.flash=R.flashMul();out.pressed=document.querySelector('#segShake .segb:nth-child(3)').getAttribute('aria-pressed');return out;});
 ok('Screen shake Off/Reduced/Full gives 0 / 4 / 10 for the same hit; flash Reduced scales to 15%',cf.off===0&&near(cf.red,4)&&cf.full===10&&near(cf.flash,.15)&&cf.pressed==='true',JSON.stringify(cf));

 /* 4. persistence */
 await p.click('#segDiff .segb:nth-child(3)');await p.reload();await wait(600);
 const pr=await p.evaluate(()=>{const S=window.__rr.SET;return {m:S.master,s:S.sfx,a:S.music,sh:S.shake,fl:S.flash,d:S.diff};});
 ok('Settings survive a reload',pr.m===50&&pr.s===40&&pr.a===0&&pr.sh==='off'&&pr.fl==='reduced'&&pr.d==='hard',JSON.stringify(pr));

 /* 5. difficulty changes real enemy numbers */
 const df=await p.evaluate(async()=>{const R=window.__rr,G=R.G;R.setHero('kenji');R.startGame();await new Promise(r=>setTimeout(r,300));
   const out={};G.spawnT=1e9;
   for(const d of ['easy','normal','hard']){R.SET.diff=d;G.wave=1;const n0=R.enemies.length;R.spawnEnemy('grunt');const e=R.enemies[R.enemies.length-1];
     R.spawnEnemy('boss');const bo=R.enemies.find(x=>x.role==='boss'&&!x.done6);bo.done6=1;R.initBoss(bo);R.startBossAtk(bo,'smash');
     out[d]={dmg:+e.dmgMul.toFixed(3),react:+e.react.toFixed(3),tele:+bo.bs.dur.toFixed(3),breact:+bo.react.toFixed(3)};
     R.enemies.splice(n0);}
   G.wave=20;R.SET.diff='hard';R.spawnEnemy('grunt');const e=R.enemies[R.enemies.length-1];out.hardLate=+e.react.toFixed(3);
   R.SET.diff='normal';return out;});
 ok('Difficulty scales enemy damage ×0.7 / ×1 / ×1.25',near(df.easy.dmg/df.normal.dmg,.7,.001)&&near(df.hard.dmg/df.normal.dmg,1.25,.001),JSON.stringify(df));
 ok('Difficulty changes reaction time (+0.08 / 0 / −0.04) and boss telegraphs (×1.25 / ×1 / ×0.9)',near(df.easy.react-df.normal.react,.08,.002)&&near(df.normal.react-df.hard.react,.04,.002)&&near(df.easy.tele/df.normal.tele,1.25,.002)&&near(df.hard.tele/df.normal.tele,.9,.002));
 ok('Hard never pushes reaction time below 0.2 s',df.hardLate>=.2-1e-9,'wave 20 grunt react '+df.hardLate);

 /* 6. key remapping */
 await p.evaluate(()=>{const R=window.__rr;R.togglePause();R.openSettings();R.capture('jump');R.renderSettings();});
 await p.keyboard.press('KeyH');
 const km=await p.evaluate(()=>{const R=window.__rr;return {H:R.KEYS.KeyH,space:R.KEYS.Space||null,msg:document.getElementById('keyMsg').textContent,help:document.getElementById('kbHelp').textContent,screen:R.G.screen};});
 ok('Rebinding Jump to H works and Space is freed; help text updates',km.H==='jump'&&km.space===null&&/Jump is now H/.test(km.msg)&&/H/.test(km.help)&&km.screen==='pause',JSON.stringify(km));
 await p.evaluate(()=>{window.__rr.capture('attack');window.__rr.renderSettings();});await p.keyboard.press('KeyH');
 const kc=await p.evaluate(()=>{const R=window.__rr,S=R.SET.keys;const all=Object.values(S).flat();return {jump:S.jump,attack:S.attack,dup:all.length-new Set(all).size,msg:document.getElementById('keyMsg').textContent};});
 ok('Binding a key that is in use swaps it, never leaving duplicates or an unbound action',kc.dup===0&&kc.attack[0]==='KeyH'&&kc.jump.length>=1&&/swapped/.test(kc.msg),JSON.stringify(kc));
 await p.evaluate(()=>{window.__rr.capture('dash');window.__rr.renderSettings();});await p.keyboard.press('KeyP');
 const kr=await p.evaluate(()=>({p:window.__rr.KEYS.KeyP||null,msg:document.getElementById('keyMsg').textContent,screen:window.__rr.G.screen,open:!document.getElementById('ovSettings').hidden}));
 ok('Reserved keys (P) cannot be bound, and pressing them while binding does not unpause',kr.p===null&&/reserved/.test(kr.msg)&&kr.screen==='pause'&&kr.open,JSON.stringify(kr));
 await p.evaluate(()=>{window.__rr.capture('dash');window.__rr.renderSettings();});await p.keyboard.press('Escape');
 const ke=await p.evaluate(()=>({open:!document.getElementById('ovSettings').hidden,screen:window.__rr.G.screen}));
 ok('Esc while waiting for a key cancels the capture only',ke.open&&ke.screen==='pause',JSON.stringify(ke));
 await p.keyboard.press('Escape');
 const ke2=await p.evaluate(()=>({open:!document.getElementById('ovSettings').hidden,screen:window.__rr.G.screen,focus:document.activeElement.id}));
 ok('Esc then closes Settings and returns to the pause menu without resuming',!ke2.open&&ke2.screen==='pause'&&ke2.focus==='resumeBtn',JSON.stringify(ke2));
 await p.click('#resumeBtn');await wait(200);
 const jumped=await p.evaluate(async()=>{const R=window.__rr,P=R.P;P.inv=9;R.enemies.splice(0);await new Promise(r=>setTimeout(r,500));return P.onGround;});
 await p.keyboard.down('KeyJ');await wait(60);const vy=await p.evaluate(()=>window.__rr.P.vy);await p.keyboard.up('KeyJ');
 const gl=await p.evaluate(()=>window.__rr.glyph('jump'));
 ok('The remapped key (J now Jump) makes the hero jump in play; tutorial hints show the new key',jumped&&vy<0&&gl==='J','vy '+Math.round(vy)+', hint "'+gl+'"');
 const cp=await p.evaluate(()=>{const ev=new KeyboardEvent('keydown',{code:'KeyD',key:'d',ctrlKey:true,bubbles:true,cancelable:true});window.dispatchEvent(ev);
   const ev2=new KeyboardEvent('keydown',{code:'KeyD',key:'d',bubbles:true,cancelable:true});window.dispatchEvent(ev2);window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyD'}));return {ctrl:ev.defaultPrevented,plain:ev2.defaultPrevented};});
 ok('Browser shortcuts (Ctrl+key) are not intercepted during play; game keys are',cp.ctrl===false&&cp.plain===true,JSON.stringify(cp));
 await p.evaluate(()=>{const R=window.__rr;R.togglePause();R.openSettings();});await p.click('#keyReset');
 const rs=await p.evaluate(()=>JSON.stringify(window.__rr.SET.keys)===JSON.stringify(window.__rr.KEYDEF)&&window.__rr.KEYS.Space==='jump');
 ok('Reset keys restores every default binding',rs);
 await p.screenshot({path:'shots/p6_02_settings_pause.png'});
 await p.click('#setClose');await p.click('#resumeBtn');await wait(200);

 /* 7. audio: buses, limiter, ambience */
 const au=await p.evaluate(async()=>{const R=window.__rr,S=R.SND;S.on=true;R.SET.master=80;R.SET.sfx=90;R.SET.music=45;R.applyAudio();
   S.voices=[];S.last={};const names=['hit','heavy','jab','kick','swingH','launch','spikeS','block','guard','zap','blast','ko','boom','perfect','super','warn','roar','medal','victory','defeat','combo','bossIntro','sp_orb','sp_wave','sp_zip','sp_ball','sp_bolt','clear'];
   const fr=()=>new Promise(r=>requestAnimationFrame(r));let played=0,maxV=0;
   for(let i=0;i<names.length;i+=2){await fr();for(const n of names.slice(i,i+2)){const v=S.voices.length;R.sfx(n,1);if(S.voices.length>v)played++;}maxV=Math.max(maxV,S.voices.length);}
   const capped=maxV;await new Promise(r=>setTimeout(r,600));await fr();S.last={};R.sfx('jab');R.sfx('jab');const twice=S.voices.filter(v=>v>S.ctx.currentTime+.4).length;
   return {played,capped,twice,state:S.ctx.state};});
 ok('Sound limiter: at most 24 voices at once, and the same sound cannot retrigger within 35 ms',au.capped<=24&&au.capped>=20&&au.played<28&&au.twice===1,JSON.stringify(au));
 await p.evaluate(()=>window.__rr.togglePause());await wait(400);
 const am=await p.evaluate(async()=>{const R=window.__rr,A=R.AMB,S=R.SND;const o={};o.cur=A.cur;o.uni=R.G.uni;o.nodes=A.nodes.length;o.duck=+S.musBus.gain.value.toFixed(3);
   R.togglePause();await new Promise(r=>setTimeout(r,500));o.play=+S.musBus.gain.value.toFixed(3);
   R.SET.music=0;await new Promise(r=>setTimeout(r,100));o.offCur=A.cur;R.SET.music=45;await new Promise(r=>setTimeout(r,100));o.back=A.cur;
   S.on=false;R.applyAudio();await new Promise(r=>setTimeout(r,100));o.muteCur=A.cur;o.muteM=+S.master.gain.value.toFixed(3);S.on=true;R.applyAudio();return o;});
 ok('Ambience plays the current universe, ducks while paused, stops at 0% or when muted',am.cur===am.uni&&am.nodes>0&&am.duck<am.play&&am.offCur===null&&am.back===am.uni&&am.muteCur===null,JSON.stringify(am));

 /* 8. fixed timestep: the same 2 s of play at 30, 60 and 144 Hz */
 const ft=await p.evaluate(()=>{const R=window.__rr,G=R.G,P=R.P;R.MANUAL=true;R.enemies.splice(0);G.queue=['grunt'];G.spawnT=1e9;P.x=480;P.vx=0;P.inv=99;
   const prim=o=>{const r={};for(const k in o){const v=o[k];if(v===null||typeof v!=='object'&&typeof v!=='function')r[k]=v;}return r;};
   const sP=prim(P),sG=prim(G);const res={};
   for(const hz of [30,60,144]){Object.assign(P,sP);P.act=null;Object.assign(G,sG);R.PERF.acc=0;
     let now=100000;R.lastT=now;let frames=0,steps0=R.PERF.steps;R.press('jump');
     while(now<100000+2000-1e-6){const el=now-100000;R.kHeld.right=el<500-1e-6;R.kHeld.left=el>=500-1e-6&&el<1500-1e-6;now+=1000/hz;R.frameStep(now);frames++;}R.kHeld.right=R.kHeld.left=false;
     res[hz]={x:+P.x.toFixed(3),y:+P.y.toFixed(3),t:+(G.time-sG.time).toFixed(4),steps:R.PERF.steps-steps0,frames};}
   R.MANUAL=false;R.lastT=performance.now();return res;});
 const same=ft[60].x===ft[144].x&&ft[60].y===ft[144].y&&ft[30].x===ft[60].x&&ft[30].y===ft[60].y;
 ok('Fixed timestep: 2 s of the same input (right, left, idle, one jump) gives identical position and game time at 30, 60 and 144 Hz',same&&ft[60].steps===240&&ft[144].steps===240&&ft[30].steps===240,JSON.stringify(ft));

 /* 9. pause and hidden tab stop gameplay */
 const ps=await p.evaluate(async()=>{const R=window.__rr,G=R.G;R.togglePause();const t0=G.time;await new Promise(r=>setTimeout(r,400));const t1=G.time;R.togglePause();
   await new Promise(r=>setTimeout(r,200));const t2=G.time;return {paused:t1-t0,running:+(t2-t1).toFixed(3)};});
 ok('While paused, game time does not advance (it does after resuming)',ps.paused===0&&ps.running>.1,JSON.stringify(ps));
 const vis=await p.evaluate(async()=>{const R=window.__rr;let hidden=true;Object.defineProperty(document,'hidden',{configurable:true,get:()=>hidden});
   document.dispatchEvent(new Event('visibilitychange'));await new Promise(r=>setTimeout(r,300));const o={screen:R.G.screen,ctx:R.SND.ctx.state};const t0=R.G.time;
   await new Promise(r=>setTimeout(r,300));o.adv=R.G.time-t0;hidden=false;document.dispatchEvent(new Event('visibilitychange'));await new Promise(r=>setTimeout(r,300));o.ctx2=R.SND.ctx.state;o.screen2=R.G.screen;
   delete document.hidden;return o;});
 ok('Switching tabs pauses the game and suspends audio; returning resumes audio but stays paused',vis.screen==='pause'&&vis.ctx==='suspended'&&vis.adv===0&&vis.ctx2==='running'&&vis.screen2==='pause',JSON.stringify(vis));
 await p.evaluate(()=>window.__rr.togglePause());

 /* 10. effect caps */
 const caps=await p.evaluate(async()=>{const R=window.__rr;for(let i=0;i<300;i++){R.pops.push({x:0,y:0,str:'x',color:'#fff',size:10,t:0});R.fx.push({kind:'ring',x:0,y:0,t:0,dur:5,color:'#fff',r:10});
     R.projs.push({team:'hero',x:R.P.x,y:R.P.y-300,vx:0,vy:0,r:1,dmg:0,kb:0,scale:0,life:5,color:'#fff',kind:'ball',spin:0,hit:new Set(),checked:new Set()});}
   await new Promise(r=>setTimeout(r,120));return {pops:R.pops.length,fx:R.fx.length,projs:R.projs.length};});
 ok('Effect caps hold under a flood (projectiles ≤140, effects ≤160, popups ≤40)',caps.projs<=140&&caps.fx<=160&&caps.pops<=40,JSON.stringify(caps));

 /* 11. perf counters in the debug view */
 await p.keyboard.press('Backquote');await wait(1300);
 const pf=await p.evaluate(()=>{const P=window.__rr.PERF;return {upd:+P.upd.toFixed(3),ren:+P.ren.toFixed(3),fps:P.fps,spf:+P.spf.toFixed(2)};});
 await p.screenshot({path:'shots/p6_03_debug_perf.png'});await p.keyboard.press('Backquote');
 ok('Debug view reports measured update/render time, fps and sim steps per frame',pf.upd>0&&pf.ren>0&&pf.fps>0&&pf.spf>0,JSON.stringify(pf));
 ok('No page errors (desktop)',errs.length===0,errs.slice(0,3).join(' | '));
 await p.close();

 /* 12. reduced motion defaults, corrupt + invalid settings */
 const ctx2=await b.newContext({reducedMotion:'reduce'});const r=await ctx2.newPage();const e2=[];r.on('pageerror',e=>e2.push(e.message));
 await r.goto(URL);await wait(500);const rm=await r.evaluate(()=>({sh:window.__rr.SET.shake,fl:window.__rr.SET.flash}));
 ok('With reduce-motion on, shake defaults to Off and flashes to Reduced',rm.sh==='off'&&rm.fl==='reduced',JSON.stringify(rm));
 await r.evaluate(()=>localStorage.setItem('rrSettings1','{nope'));await r.reload();await wait(500);
 const cs=await r.evaluate(()=>{window.__rr.openSettings();return {msg:document.getElementById('setStatus').textContent,d:window.__rr.SET.diff};});
 ok('Corrupt saved settings fall back to defaults and say so',/unreadable/.test(cs.msg)&&cs.d==='normal',cs.msg);
 const sz=await r.evaluate(()=>{const R=window.__rr;return R.setSanitize({master:'999',sfx:-5,music:'x',shake:'wild',diff:'insane',keys:{left:['Escape','KeyA'],right:['KeyA','KeyD'],up:['KeyW'],down:['KeyS'],jump:['Space'],attack:['KeyJ'],special:['KeyK'],dash:['KeyL'],guard:['ShiftLeft'],super:['KeyI'],awaken:['KeyO']}});});
 ok('Invalid settings are clamped or replaced (volume 0–100, unknown modes, reserved/duplicate keys)',sz.master===100&&sz.sfx===0&&sz.music===45&&sz.shake==='off'&&sz.diff==='normal'&&sz.keys.left.join()==='KeyA'&&sz.keys.right.join()==='KeyD',JSON.stringify({m:sz.master,s:sz.sfx,mu:sz.music,sh:sz.shake,d:sz.diff,l:sz.keys.left,r:sz.keys.right}));
 ok('No page errors (reduced motion / corrupt data)',e2.length===0,e2.join(' | '));
 await ctx2.close();

 /* 13. phone layout + keyboard focus */
 const mc=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});const m=await mc.newPage();
 /* the artifact host adds a width=device-width viewport tag when it wraps the page; add the same tag here */
 await m.route('**/rift-rumble.html',async rt=>{const res=await rt.fetch();const body=(await res.text()).replace('<meta charset="utf-8">','<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">');rt.fulfill({response:res,body});});const e3=[];m.on('pageerror',e=>e3.push(e.message));
 await m.goto(URL);await wait(600);await m.evaluate(()=>window.__rr.openSettings());await wait(200);
 const ml=await m.evaluate(()=>{const o=document.getElementById('ovSettings');const small=[...o.querySelectorAll('button,input')].filter(x=>x.getBoundingClientRect().height<32).map(x=>x.id||x.textContent);
   return {sw:o.scrollWidth,cw:o.clientWidth,doc:document.documentElement.scrollWidth,vw:innerWidth,small};});
 await m.screenshot({path:'shots/p6_04_settings_phone.png'});await m.evaluate(()=>{document.getElementById('ovSettings').scrollTop=9999;});await wait(100);await m.screenshot({path:'shots/p6_05_settings_phone_keys.png'});
 ok('Phone (390 px): settings fit without sideways scrolling, every control at least 32 px tall',ml.vw===390&&ml.sw<=ml.cw+1&&ml.doc<=ml.vw+1&&ml.small.length===0,JSON.stringify(ml));
 ok('No page errors (phone)',e3.length===0,e3.join(' | '));await mc.close();
 const k=await b.newPage();await k.goto(URL);await wait(500);await k.focus('#setBtn');await k.keyboard.press('Enter');await wait(200);
 const f1=await k.evaluate(()=>document.activeElement.id);await k.keyboard.press('Shift+Tab');await k.keyboard.press('Shift+Tab');
 const f2=await k.evaluate(()=>{const a=document.activeElement;const cs=getComputedStyle(a);return {id:a.id||a.textContent,outline:cs.outlineStyle,w:cs.outlineWidth};});
 ok('Keyboard: Enter opens Settings, Tab moves through controls with a visible focus outline',f1==='setClose'&&f2.outline==='solid'&&parseFloat(f2.w)>=2,JSON.stringify({f1,f2}));
 await k.close();await b.close();console.log(log.join('\n'));
})().catch(e=>{console.log(log.join('\n'));console.log('SCRIPT ERROR',e.message);process.exit(1);});
