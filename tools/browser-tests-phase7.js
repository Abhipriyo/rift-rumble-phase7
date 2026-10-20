// Phase 7 browser checks: hero signature mechanics, arena mechanics, the five new enemies (Rift Lord),
// Boss Rush, Challenges, visual systems (lighting pass, impacts, KO blast, interpolation, HUD), title/select, phone layout.
const { chromium } = require('playwright');
const URL='http://127.0.0.1:8765/rift-rumble.html';
const log=[];const ok=(name,cond,extra)=>{log.push((cond?'PASS ':'FAIL ')+name+(extra?' — '+extra:''));};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const near=(a,b,e)=>Math.abs(a-b)<=(e||.01);
const SETUP=()=>{const R=window.__rr;let now=500000;
  window.__step=(sec)=>{R.MANUAL=true;const n=Math.round(sec*60);for(let i=0;i<n;i++){now+=1000/60;R.frameStep(now);}};
  window.__start=(hero,opts)=>{opts=opts||{};R.MANUAL=true;now=500000;R.lastT=now;R.selMode=opts.mode||'endless';if(opts.chal)R.selChal=opts.chal;R.setHero(hero);R.startGame();R.lastT=now;
    const G=R.G;if(opts.wave!=null)G.wave=opts.wave;G.queue=opts.keepQueue?G.queue:['grunt'];G.spawnT=1e9;R.enemies.splice(0);R.P.inv=0;R.P.x=480;R.P.y=410;R.P.vx=0;R.P.vy=0;R.P.onGround=true;R.P.plat=null;G.hintI=99;
    __step(.05);R.P.inv=0;R.P.x=480;R.P.y=410;R.P.vx=0;R.P.vy=0;};
  window.__enemy=(role,x,kind)=>{const e=kind?R.makeNew(kind,x,410):window.__mk(role,x);e.spawnT=0;e.y=410;e.onGround=true;e.x=x;e.vx=0;e.vy=0;R.enemies.push(e);return e;};
  window.__mk=(role,x)=>{const G=R.G;const w=G.wave;G.wave=0;try{return R.__makeEnemy(role,x,410);}finally{G.wave=w;}};
  window.__hit=(e,o)=>R.applyHit(e,Object.assign({dmg:5,base:200,scale:0,ang:45,dir:1,src:'hero'},o||{}));};
(async()=>{
 const b=await chromium.launch({args:['--proxy-bypass-list=<-loopback>','--autoplay-policy=no-user-gesture-required']});
 const p=await b.newPage({viewport:{width:1280,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(URL);await p.evaluate(()=>{localStorage.removeItem('rrProfile1');localStorage.removeItem('rrSettings1');});await p.reload();
 await p.waitForFunction(()=>!/Loading/.test(document.getElementById('artStatus').textContent),null,{timeout:9000});
 await p.evaluate(SETUP);

 /* ---------- title + select ---------- */
 const tt=await p.evaluate(()=>{const strip=[...document.querySelectorAll('#strip7 .hero7')];const drawn=strip.filter(b=>{const c=b.querySelector('canvas');const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;for(let i=3;i<d.length;i+=16)if(d[i]>0)n++;return n>200;}).length;
   return {unis:document.querySelectorAll('#uni7 .uniB7').length,heroes:strip.length,drawn,modes:['startBtn','rushBtn','chalBtn','echoBtn'].every(id=>!!document.getElementById(id))};});
 ok('Title screen: 4 universe banners, 12 hero panels with rendered portraits, 4 mode buttons',tt.unis===4&&tt.heroes===12&&tt.drawn===12&&tt.modes,JSON.stringify(tt));
 await p.screenshot({path:'shots/p7_01_title.png'});
 await p.click('#strip7 .hero7:nth-child(11)');await wait(300);
 const sel=await p.evaluate(()=>({screen:window.__rr.G.screen,pressed:[...document.querySelectorAll('.hcard')].findIndex(b=>b.getAttribute('aria-pressed')==='true'),info:[...document.querySelectorAll('#mechInfo7 .mi7')].map(d=>d.querySelector('b').textContent)}));
 ok('Clicking a hero panel opens the select screen on that hero, showing signature, weakness and arena mechanic',sel.screen==='select'&&sel.pressed===1&&sel.info.length===3&&/GRANDMA GRAVITY · SIGNATURE: GRAVITY CONTROL/.test(sel.info[0])&&/LOW GRAVITY/.test(sel.info[2]),JSON.stringify(sel));
 await p.screenshot({path:'shots/p7_02_select.png'});

 /* ---------- hero mechanics ---------- */
 const hm=await p.evaluate(()=>{const R=window.__rr,G=R.G,out={};const sp=e=>Math.hypot(e.vx,e.vy);
   const E=(x)=>{const e=__enemy('grunt',x||560);e.weight=1;e.pct=0;e.inv=0;return e;};
   const melee=(e,o)=>{G._melee=true;const p0=e.pct;R.applyHit(e,Object.assign({dmg:5,base:200,scale:0,ang:45,dir:1,src:'hero'},o||{}));G._melee=false;return +(e.pct-p0).toFixed(3);};
   const enemyHit=(o,guard)=>{const P=R.P;P.inv=0;P.guard=!!guard;P.guardT=5;P.shield=0;const p0=P.pct;R.applyHit(P,Object.assign({dmg:10,base:200,scale:0,ang:45,dir:1,src:'enemy'},o||{}));return {d:+(P.pct-p0).toFixed(3),v:sp(P)};};
   /* Kenji */
   __start('kenji');let e=E();const base=melee(e);R.P.mx=4;const boom=melee(e);R.P.mx=0;R.P.m=.8;const t1=enemyHit();R.P.m=0;const t0=enemyHit();
   out.kenji={base,boom,ratioTaken:+(t1.d/t0.d).toFixed(3)};
   /* Lila */
   __start('lila');e=E(560);const e2=E(650),e3=E(740);R.P.m=1;melee(e);out.lila={chain2:e2.pct>0,chain3:e3.pct>0,m:R.P.m};const h=enemyHit({dmg:1});out.lila.kb=+(h.v/(200/R.P.weight)).toFixed(3);
   /* Mochi */
   __start('mochi');R.press('attack');__step(.03);const before=R.P.pct;R.P.inv=0;R.applyHit(R.P,{dmg:5,base:300,scale:0,ang:45,dir:1,src:'enemy'});out.mochi={stun:R.P.stun,dmg:+(R.P.pct-before).toFixed(2),armor:R.P.armor};
   __step(.5);R.P.dashCd=0;R.P.dashT=0;R.press('dash');__step(1/60);out.mochi.dashT=+R.P.dashT.toFixed(3);out.mochi.airDash=R.P.airDash;
   /* Nyanja */
   __start('nyanja');e=E();R.P.dashT=.1;R.P.inv=.1;R.applyHit(R.P,{dmg:10,base:200,scale:0,ang:45,dir:1,src:'enemy'});const crit=R.P.mCrit;R.P.dashT=0;R.P.inv=0;
   const c1=melee(e);const c0=melee(e);const tk=enemyHit();out.nyanja={crit,c1,c0,ratio:+(c1/c0).toFixed(3),taken:tk.d};
   /* Rokuro */
   __start('rokuro');e=E();const r1=melee(e);melee(e);melee(e);const ink=e.ink;R.P.act={name:'fin',def:{act:[0,1]},t:0,hit:new Set()};const fin=melee(e,{dmg:5});R.P.act=null;
   out.rokuro={plain:r1,ink,fin,inkAfter:e.ink};
   /* Hana */
   __start('hana');e=E();e.weight=50;R.P.m=.99;melee(e);const on=R.P.mOn;R.enemies.splice(0);R.P.pct=50;__step(1);out.hana={on,pctAfter1s:+R.P.pct.toFixed(2)};
   /* Comet */
   __start('comet');R.P.y=200;R.P.onGround=false;R.P.jumps=0;R.P.vy=0;R.kHeld.jump=true;R.kHeld.up=true;__step(.5);out.comet={vy:Math.round(R.P.vy),fuel:+R.P.mFuel.toFixed(2),fly:R.P.mFly};R.kHeld.jump=false;R.kHeld.up=false;
   /* Raccoon */
   __start('raccoon');e=E(620);e.weight=50;for(let i=0;i<8;i++){e.inv=0;melee(e,{dmg:.1});}const tur=(G.turrets7||[]).length;const pj0=R.projs.length;__step(1);
   out.raccoon={turrets:tur,turretShots:R.STATS.turret7||0};R.P.stun=0;const g2=enemyHit({},true);R.P.guard=false;out.raccoon.guardChip=g2.d;
   /* Skate */
   __start('skate');const m0=R.P.m;R.kHeld.right=true;for(let i=0;i<7;i++){R.P.x=300;__step(.25);}R.kHeld.right=false;out.skate={m0,m:+R.P.m.toFixed(2),vx:Math.round(R.P.vx)};e=E(R.P.x+60);const dm=melee(e);out.skate.dmgRatio=+(dm/(5*R.HEROES.skate.stats.power)).toFixed(3);
   /* Titan */
   __start('titan');const pl=enemyHit();const pl2=enemyHit();R.P.stun=0;R.P.vx=0;R.P.vy=0;R.P.x=480;R.P.y=410;e=E(540);e.weight=50;R.P.specCd=0;let vent=0,presses=0;for(let i=0;i<10&&!(R.P.lockT>G.time);i++){R.P.specCd=0;R.P.downCd=0;R.P.stun=0;const m0=R.P.m;R.press('special');__step(1/15);presses++;}const lockT=+(R.P.lockT-G.time).toFixed(2);
   out.titan={plateBlocked:pl.d===0,second:pl2.d>0,heat:R.P.m,presses,lockT,specCd:+R.P.specCd.toFixed(2),enemyDmg:+e.pct.toFixed(1)};
   /* Grandma */
   __start('gravity');e=E(560);e.y=330;e.onGround=false;e.stun=0;__step(1/60);out.gravity={field:e.field7>G.time,grav:R.gravScale7(e)};
   R.P.y=200;R.P.onGround=false;R.P.vy=0;R.kHeld.guard=true;__step(.4);out.gravity.hoverVy=Math.round(R.P.vy);R.kHeld.guard=false;
   /* Jaguar */
   __start('jaguar');e=E();e.weight=50;for(let i=0;i<5;i++){e.inv=0;melee(e,{dmg:.1});}const fr=R.P.m;const rate=R.MECH.jaguar.rate(R.P);const bl=e.bleed;const pb=e.pct;__step(1.5);
   out.jaguar={frenzy:fr,rate,bleed:bl,bleedDmg:+(e.pct-pb).toFixed(2)};
   return out;});
 ok('Kenji Heat: loaded strikes add +4 damage; above half Heat he takes 10% more',near(hm.kenji.boom-hm.kenji.base,4*1.05,.05)&&near(hm.kenji.ratioTaken,1.1,.01),JSON.stringify(hm.kenji));
 ok('Lila Static: a full charge chains into 2 more enemies; she is launched 12% farther',hm.lila.chain2&&hm.lila.chain3&&hm.lila.m===0&&near(hm.lila.kb,1.12,.02),JSON.stringify(hm.lila));
 ok('Mochi Iron Body: hits while attacking do not stagger and wear the armour; dash 30% shorter, no air dash',hm.mochi.stun<=0&&hm.mochi.dmg>0&&hm.mochi.armor>0&&hm.mochi.armor<14&&near(hm.mochi.dashT,.17*.7-1/120,.012)&&hm.mochi.airDash===0,JSON.stringify(hm.mochi));
 ok('Nyanja Nine Lives: dashing through an attack arms a 1.6× critical; she takes 15% more damage',hm.nyanja.crit===1&&near(hm.nyanja.ratio,1.6,.01)&&near(hm.nyanja.taken,11.5,.01),JSON.stringify(hm.nyanja));
 ok('Rokuro Ink Marks: plain hits deal 10% less and mark; a finisher detonates 3 marks for +9',near(hm.rokuro.plain,5*1.1*.9,.01)&&hm.rokuro.ink===3&&near(hm.rokuro.fin,(5+9)*1.1,.02)&&hm.rokuro.inkAfter===0,JSON.stringify(hm.rokuro));
 ok('Hana Bloom: a full Bloom blossoms for 5 s and heals 2.2% per second',hm.hana.on===5&&near(hm.hana.pctAfter1s,50-2.2,.2),JSON.stringify(hm.hana));
 ok('Captain Comet Flight: holding jump after his jumps lets him fly upward and drains flight fuel',hm.comet.vy<-300&&hm.comet.fuel<.85&&hm.comet.fly===true,JSON.stringify(hm.comet));
 ok('Midnight Raccoon Scrap Turret: 8 hits build a turret that fires; guarded chip damage doubles',hm.raccoon.turrets===1&&hm.raccoon.turretShots>0&&near(hm.raccoon.guardChip,4,.01),JSON.stringify(hm.raccoon));
 ok('Skate Momentum: rolling one way builds Momentum; full Momentum adds +30% damage',hm.skate.m0===0&&hm.skate.m>=.99&&near(hm.skate.dmgRatio,1.3,.02),JSON.stringify(hm.skate));
 ok('Tin Titan: plating blocks the first hit; 4 specials vent a blast that hurts nearby enemies and locks specials',hm.titan.plateBlocked&&hm.titan.second&&hm.titan.heat===0&&hm.titan.presses===4&&hm.titan.lockT>1.3&&hm.titan.specCd>=1.3&&hm.titan.enemyDmg>0,JSON.stringify(hm.titan));
 ok('Grandma Gravity: her field halves enemy gravity nearby; guard in the air hovers',hm.gravity.field&&hm.gravity.grav===.5&&Math.abs(hm.gravity.hoverVy)<60,JSON.stringify(hm.gravity));
 ok('Jaguar Jinx Frenzy: quick hits stack to 5 (40% faster attacks) and claws make enemies bleed',hm.jaguar.frenzy===5&&near(hm.jaguar.rate,1.4,.001)&&hm.jaguar.bleed===3&&hm.jaguar.bleedDmg>0,JSON.stringify(hm.jaguar));

 /* ---------- arena mechanics ---------- */
 const ar=await p.evaluate(()=>{const R=window.__rr,G=R.G,out={};
   __start('kenji');const S=R.ARENA7.st;const z=S.zones[0];const q=z.pl;const pl=window.__rr.ARENA7.st;R.P.x=z.x;R.P.y=[410,285,285,175][z.pl];R.P.onGround=true;R.P.plat=null;
   const zp=(()=>{const plats=[[180,780,410],[0,0,285],[0,0,285],[405,555,175]];return 0;})();
   R.P.meter=0;R.P.plat=undefined;
   /* stand in zone 0 on the main platform for a clean test */
   S.zones[0]={ai:0,x:300,pl:0,r:70,on:1,born:-9};R.P.x=300;R.P.y=410;__step(.02);const inside=R.inKi7(R.P);R.P.meter=0;__step(1);out.ki={inside,meter:Math.round(R.P.meter)};
   const e=__enemy('grunt',360);e.weight=50;G._melee=true;const p0=e.pct;R.applyHit(e,{dmg:5,base:100,scale:0,ang:45,dir:1,src:'hero'});G._melee=false;out.ki.dmg=+(e.pct-p0).toFixed(3);
   const before=JSON.stringify(S.zones.map(z=>z.ai));S.next=.01;__step(.3);out.ki.moved=JSON.stringify(S.zones.map(z=>z.ai))!==before;
   __start('hana');R.P.x=250;R.P.y=410;__step(.05);out.sh={hidden:G.hidden7};const c=__enemy('shooter',600);const pj=R.projs.length;c.cd=0;c.wind=0;__step(1.5);out.sh.shots=R.projs.filter(q=>q.team==='enemy').length;
   const g=__enemy('grunt',300);g.weight=50;G._melee=true;let a0=g.pct;R.applyHit(g,{dmg:5,base:100,scale:0,ang:45,dir:1,src:'hero'});const amb=g.pct-a0;g.inv=0;a0=g.pct;R.applyHit(g,{dmg:5,base:100,scale:0,ang:45,dir:1,src:'hero'});const second=g.pct-a0;G._melee=false;
   out.sh.ambushRatio=+(amb/second).toFixed(3);
   __start('skate');const S2=R.ARENA7.st;const o=S2.props[0];const v=__enemy('grunt',o.x+40);v.weight=50;const hp0=o.hp;R.breakProp7(o);out.cape={props:S2.props.length,broken:o.dead>0,enemyHurt:v.pct>0};o.dead=.02;__step(.1);out.cape.respawned=o.dead===0&&o.hp===o.max;
   __start('titan');const m=__enemy('grunt',180);m.y=200;m.onGround=false;m.vy=0;m.stun=0;const n=__enemy('grunt',480);n.y=200;n.onGround=false;n.vy=0;n.stun=0;n.fly=false;m.fly=false;
   out.mighty={gIn:R.arenaGrav7(m),gOut:R.arenaGrav7(n)};const f1={x:180,y:200,vx:0,vy:0,h:78,w:30,stun:0,onGround:false,team:'enemy',spin:0,runPh:0,gravMul:1},f2=Object.assign({},f1,{x:480});
   for(let i=0;i<30;i++){R.physics(f1,1/120);R.physics(f2,1/120);}out.mighty.vyIn=Math.round(f1.vy);out.mighty.vyOut=Math.round(f2.vy);
   return out;});
 ok('Ki energy zone: standing in it fills super meter and adds 15% damage; zones relocate',ar.ki.inside&&ar.ki.meter>=10&&near(ar.ki.dmg,5*1.05*1.15,.01)&&ar.ki.moved,JSON.stringify(ar.ki));
 ok('Shinobi shadow zone: you are hidden, casters hold fire, and the first strike is a 1.5× ambush',ar.sh.hidden&&ar.sh.shots===0&&near(ar.sh.ambushRatio,1.5,.01),JSON.stringify(ar.sh));
 ok('Caped destructibles: smashing a prop hurts enemies around it, and it rebuilds',ar.cape.props===3&&ar.cape.broken&&ar.cape.enemyHurt&&ar.cape.respawned,JSON.stringify(ar.cape));
 ok('Mighty low gravity: inside a column gravity is 40%, so falls are slower',ar.mighty.gIn===.4&&ar.mighty.gOut===1&&near(ar.mighty.vyIn/ar.mighty.vyOut,.4,.02),JSON.stringify(ar.mighty));

 /* ---------- new enemies ---------- */
 const ne=await p.evaluate(()=>{const R=window.__rr,G=R.G,out={};
   out.art=['rift_minion','elite_ronin','corrupted_hero','rift_lord'].map(id=>id+':'+R.ART.status[id]);
   __start('kenji',{wave:9});const kinds={};for(let i=0;i<300;i++){const e=R.__makeEnemy(['grunt','shooter','heavy'][i%3],480,410);if(e.kind7)kinds[e.kind7]=(kinds[e.kind7]||0)+1;}out.mix=kinds;
   G.wave=1;let early=0;for(let i=0;i<120;i++){const e=R.__makeEnemy(['grunt','shooter','heavy'][i%3],480,410);if(e.kind7)early++;}out.early=early;
   G.wave=9;R.enemies.splice(0);
   const m=R.makeNew('minion',400,410),r=R.makeNew('ronin',400,410),d=R.makeNew('drone',400,410),c=R.makeNew('corrupt',400,410);
   out.stats={minion:[m.w,m.h,+(m.dmgMul).toFixed(2)],ronin:[r.h,r.reachAdd],drone:[d.fly,d.shotKind,!!d.custom],corrupt:[c.spdMul]};
   /* minions arrive in pairs */
   R.enemies.splice(0);const rr=Math.random;Math.random=()=>0;try{R.spawnEnemy('grunt');}finally{Math.random=rr;}out.pairEnemies=R.enemies.length;out.pairKinds=R.enemies.map(e=>e.kind7).join(',');
   /* corrupted hero rift dash */
   R.enemies.splice(0);__start('kenji',{wave:9});const ch=__enemy('heavy',740,'corrupt');ch.rdCd=0;R.P.x=480;R.P.inv=9;__step(.45);out.rdash={tele:ch.rd>0||ch.rt>0,vx:Math.round(Math.abs(ch.vx))};
   /* elite ronin parry */
   R.enemies.splice(0);const ro=__enemy('grunt',530,'ronin');const rnd=Math.random;Math.random=()=>0;R.press('attack');__step(1/60);Math.random=rnd;out.parry=ro.blockT>0;
   return out;});
 ok('All four new rigged enemies have working art (PNG or built-in)',ne.art.every(s=>/:(png|baked)$/.test(s)),ne.art.join(' '));
 ok('New enemies mix into waves from their start wave, never on wave 1',Object.keys(ne.mix).length===4&&ne.early===0,JSON.stringify(ne.mix)+' early '+ne.early);
 ok('Each new enemy has its own stats: small fragile minion, long-reach ronin, flying laser drone, fast corrupted hero',ne.stats.minion[1]===54&&ne.stats.minion[2]<1&&ne.stats.ronin[1]===26&&ne.stats.drone[0]===true&&ne.stats.drone[1]==='ray'&&ne.stats.drone[2]&&ne.stats.corrupt[0]===1.7,JSON.stringify(ne.stats));
 ok('Rift Minions arrive in pairs',ne.pairEnemies===2,'enemies after one spawn: '+ne.pairEnemies);
 ok('Corrupted Hero telegraphs and rift-dashes at you',ne.rdash.tele&&ne.rdash.vx>500,JSON.stringify(ne.rdash));
 ok('Elite Ronin parries a close attack',ne.parry===true);

 /* Rift Lord */
 const rl=await p.evaluate(()=>{const R=window.__rr,G=R.G,out={};__start('titan',{wave:19});G.queue=[];R.enemies.splice(0);G.wave=19;R.startWave();out.queue=G.queue.join(',');
   G.spawnT=0;R.P.inv=99;__step(.2);const L=R.enemies.find(e=>e.role==='boss');L.bs=L.bs||{};out.name=L&&L.name;out.id=L&&L.cosId;out.h=L&&L.h;
   const moves=['riftSlash','voidRain','summon','riftBeam','teleSlam'];out.moves={};
   if(!L.bs.state)R.initBoss(L);L.bs.intro=true;for(const mv of moves){L.y=410;L.onGround=true;L.x=480;L.stun=0;L.bs.state='walk';G.freeze=0;R.startBossAtk(L,mv);let saw=new Set();for(let i=0;i<180;i++){__step(1/60);saw.add(L.bs.state);if(L.bs.state==='walk')break;}out.moves[mv]=[...saw].join('>');}
   out.minions=R.enemies.filter(e=>e.kind7==='minion').length;out.beamFx=true;return out;});
 ok('Wave 20 in endless brings the Rift Lord (final boss) with its own art',rl.queue.indexOf('boss')===0&&rl.name==='RIFT LORD'&&rl.id==='rift_lord'&&rl.h===150,JSON.stringify({q:rl.queue,n:rl.name,h:rl.h}));
 ok('Rift Lord: all five attacks run telegraph → attack → recovery; summon brings minions',Object.values(rl.moves).every(s=>/tele.*act.*rec/.test(s))&&rl.minions>=1,JSON.stringify(rl.moves)+' minions '+rl.minions);

 /* ---------- Boss Rush ---------- */
 const br=await p.evaluate(async()=>{const R=window.__rr,G=R.G,out={seq:[]};__start('kenji',{mode:'bossrush',keepQueue:true});
   out.list=R.rushList().map(x=>x[1]).join(',');G.queue=['boss'];
   for(let k=0;k<4;k++){G.spawnT=0;R.P.inv=99;__step(.3);const B=R.enemies.find(e=>e.role==='boss');out.seq.push(B?B.cosId:'none');if(!B)break;
     B.y=2000;__step(3.5);if(k<3){out['scr'+k]=G.screen+':'+document.getElementById('upgTitle').textContent;if(G.screen==='upgrade')document.querySelector('#upgList .pick').click();}}
   __step(2);out.end=G.screen;out.title=document.getElementById('overTitle').textContent;out.rec=JSON.stringify(R.PROF.data.modes.rush);return out;});
 ok('Boss Rush: own-universe boss first, then the other two, then the Rift Lord',br.seq.join(',')===br.list&&br.list.split(',').length===4&&br.list.endsWith('rift_lord'),br.seq.join(' → '));
 ok('Boss Rush: a power-up pick between bosses, and clearing all four shows RUSH COMPLETE and saves the time',/upgrade:BOSS 1 DOWN!/.test(br.scr0)&&br.end==='over'&&br.title==='RUSH COMPLETE!'&&/"clears":1/.test(br.rec)&&!/"best":0/.test(br.rec),br.scr0+' · '+br.title+' · '+br.rec);
 await p.screenshot({path:'shots/p7_03_rush_complete.png'});

 /* ---------- Challenges ---------- */
 await p.evaluate(()=>{window.__rr.MANUAL=false;window.__rr.lastT=performance.now();});await p.evaluate(()=>{document.getElementById('switchBtn').click();});await p.evaluate(()=>{document.getElementById('chalBack')&&0;});
 await p.evaluate(()=>{const R=window.__rr;['ovSelect','ovOver'].forEach(id=>document.getElementById(id).hidden=true);R.G.screen='title';document.getElementById('ovTitle').hidden=false;});
 await p.click('#chalBtn');await wait(250);
 const cl=await p.evaluate(()=>({n:document.querySelectorAll('#chalList .chal').length,open:!document.getElementById('ovChal').hidden}));
 await p.screenshot({path:'shots/p7_04_challenges.png'});
 ok('Challenge list shows 6 challenges',cl.n===6&&cl.open,JSON.stringify(cl));
 const ch=await p.evaluate(()=>{const R=window.__rr,G=R.G,out={};
   __start('kenji',{mode:'challenge',chal:'perfect'});let e=__enemy('grunt',540);e.weight=50;G._melee=true;const p0=e.pct;R.applyHit(e,{dmg:5,base:100,scale:0,ang:45,dir:1,src:'hero'});G._melee=false;out.perfectNormal=e.pct-p0;
   R.P.guard=true;R.P.guardT=0;R.applyHit(R.P,{dmg:8,base:200,scale:0,ang:45,dir:-1,src:'enemy',attacker:e});out.perfectBurst=+(e.pct-p0).toFixed(1);
   for(let w=0;w<3;w++){G.queue=[];R.enemies.splice(0);__step(2.5);}out.perfectEnd=G.screen+':'+document.getElementById('overTitle').textContent;out.rec=JSON.stringify(R.PROF.data.modes.chal.perfect);
   __start('kenji',{mode:'challenge',chal:'fists'});const s0=R.P.specCd;R.press('special');__step(1/60);R.P.meter=100;R.press('super');__step(1/60);out.fists={specCd:R.P.specCd===s0||R.P.specCd<=0,sup:!!R.P.sup,meter:R.P.meter};
   __start('kenji',{mode:'challenge',chal:'onelife'});out.stocks=R.P.stocks;
   __start('kenji',{mode:'challenge',chal:'sky'});e=__enemy('grunt',540);e.weight=50;G._melee=true;let q0=e.pct;R.applyHit(e,{dmg:5,base:100,scale:0,ang:45,dir:1,src:'hero'});out.skyGround=e.pct-q0;R.P.onGround=false;e.inv=0;q0=e.pct;R.applyHit(e,{dmg:5,base:100,scale:0,ang:45,dir:1,src:'hero'});out.skyAir=+(e.pct-q0).toFixed(2);G._melee=false;R.P.onGround=true;
   __start('kenji',{mode:'challenge',chal:'blitz'});G.time=99.9;R.P.inv=99;__step(3);out.blitz=G.screen+':'+document.getElementById('overTitle').textContent;
   __start('kenji',{mode:'challenge',chal:'slayer'});G.queue=[];G.wave=0;R.enemies.splice(0);R.startWave();G.spawnT=0;__step(.2);const L=R.enemies.find(x=>x.role==='boss');out.slayer=(L&&L.cosId)+' stocks '+R.P.stocks;
   return out;});
 ok('Perfect Defence: normal hits do nothing; a perfect guard releases a Counter Burst; 3 waves clears it and saves the result',ch.perfectNormal===0&&ch.perfectBurst>=12&&/over:CHALLENGE CLEAR!/.test(ch.perfectEnd)&&/"clears":1/.test(ch.rec),JSON.stringify({n:ch.perfectNormal,b:ch.perfectBurst,e:ch.perfectEnd,r:ch.rec}));
 ok('Fists Only: specials and supers are blocked',ch.fists.specCd&&!ch.fists.sup&&ch.fists.meter===100,JSON.stringify(ch.fists));
 ok('One Life starts with a single life; Sky Fighter only counts airborne hits',ch.stocks===1&&ch.skyGround===0&&ch.skyAir>0,JSON.stringify({s:ch.stocks,g:ch.skyGround,a:ch.skyAir}));
 ok('Blitz fails when the 100 s limit runs out; Giant Slayer is the Rift Lord with one life',/over:CHALLENGE FAILED/.test(ch.blitz)&&ch.slayer==='rift_lord stocks 1',ch.blitz+' · '+ch.slayer);

 /* ---------- visual systems ---------- */
 const vs=await p.evaluate(()=>{const R=window.__rr,G=R.G,out={};__start('hana');const e=__enemy('grunt',540);R.fx7.length=0;
   R.applyHit(e,{dmg:5,base:900,scale:0,ang:45,dir:1,src:'hero',heavy:true});out.fx=R.fx7.map(f=>f.k).join(',');e.y=2000;__step(.4);out.ko=R.fx7.some(f=>f.k==='koBlast');
   const q=__enemy('grunt',600);q.weight=50;R.applyHit(q,{dmg:5,base:100,scale:0,ang:45,dir:1,src:'hero'});__step(1/60);out.panel=G.ePanel7;out.gauge=R.MECH.hana.gauge(R.P).txt;
   R.snapPrev7();const x0=R.P.x;R.P.x=x0+10;R.applyInterp7(.5);out.interp=R.P.x-x0;R.restoreInterp7();out.restored=R.P.x-x0;
   R.SET.gfx='high';G.lit7=0;__step(.1);out.litHigh=G.lit7;R.SET.gfx='standard';G.lit7=0;__step(.1);out.litStd=G.lit7;
   R.SET.gfx='auto';R.lowGfx7=false;G.lit7=0;__step(.1);out.autoOn=G.lit7>0;const pr=R.PERF.ren;let k=0;for(;k<200&&!R.lowGfx7;k++){R.PERF.ren=20;__step(1/60);}out.autoFrames=k;G.lit7=0;R.PERF.ren=1;__step(.1);out.autoOff=G.lit7===0;out.toast=G.toast&&G.toast.text;R.lowGfx7=false;return out;});
 ok('Hits spawn impact bursts and shockwaves; knockouts spawn a KO blast',/impact/.test(vs.fx)&&/shock/.test(vs.fx)&&vs.ko,vs.fx);
 ok('HUD shows the targeted enemy panel and the signature-mechanic gauge',vs.panel===1&&/BLOOM/.test(vs.gauge),JSON.stringify({p:vs.panel,g:vs.gauge}));
 ok('Render interpolation draws between simulation steps and restores the real position',near(vs.interp,5,.001)&&vs.restored===10,JSON.stringify({i:vs.interp,r:vs.restored}));
 ok('Lighting pass runs on Graphics: High and is skipped on Standard',vs.litHigh>0&&vs.litStd===0,JSON.stringify({high:vs.litHigh,std:vs.litStd}));
 ok('Graphics: Auto starts lit and switches lighting off after ~2 s of slow (>12 ms) drawing, telling the player',vs.autoOn&&vs.autoFrames>100&&vs.autoFrames<200&&vs.autoOff&&/Lighting effects turned off/.test(vs.toast||''),JSON.stringify({on:vs.autoOn,frames:vs.autoFrames,off:vs.autoOff}));
 await p.evaluate(()=>{window.__rr.MANUAL=false;window.__rr.lastT=performance.now();});

 /* profile records survive reload + sanitizing */
 await p.reload();await wait(700);
 const pr=await p.evaluate(()=>{const M=window.__rr.PROF.data.modes;return {rush:M.rush.clears,perfect:M.chal.perfect&&M.chal.perfect.clears,blitz:M.chal.blitz&&M.chal.blitz.tries};});
 ok('Boss Rush and challenge records survive a reload',pr.rush===1&&pr.perfect===1&&pr.blitz===1,JSON.stringify(pr));
 const sz=await p.evaluate(()=>{localStorage.setItem('rrProfile1',JSON.stringify({modes:{rush:{runs:2,clears:9,best:-4},chal:{fake:{tries:1},sky:{tries:'x',clears:3}}}}));window.__rr.profLoad();return JSON.stringify(window.__rr.PROF.data.modes);});
 ok('Invalid mode records are cleaned on load',sz==='{"rush":{"runs":2,"clears":2,"best":0},"chal":{"sky":{"tries":0,"clears":0,"best":0}}}',sz);
 ok('No page errors (desktop run)',errs.length===0,errs.slice(0,3).join(' | '));
 await p.close();

 /* ---------- phone ---------- */
 const mc=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});const m=await mc.newPage();const e3=[];m.on('pageerror',e=>e3.push(e.message));
 await m.route('**/rift-rumble.html',async rt=>{const res=await rt.fetch();rt.fulfill({response:res,body:(await res.text()).replace('<meta charset="utf-8">','<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">')});});
 await m.goto(URL);await wait(900);
 const ml=await m.evaluate(()=>({doc:document.documentElement.scrollWidth,vw:innerWidth,cols:getComputedStyle(document.getElementById('strip7')).gridTemplateColumns.split(' ').length}));
 await m.screenshot({path:'shots/p7_05_title_phone.png'});
 ok('Phone (390 px): title fits without sideways page scrolling; hero strip uses 6 columns',ml.doc<=ml.vw+1&&ml.cols===6,JSON.stringify(ml));
 ok('No page errors (phone)',e3.length===0,e3.join(' | '));
 await mc.close();await b.close();console.log(log.join('\n'));
})().catch(e=>{console.log(log.join('\n'));console.log('SCRIPT ERROR',e.message);process.exit(1);});
