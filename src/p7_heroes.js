/* ================= PHASE 7: signature hero mechanics ================= */
/* Every hero gets one signature mechanic, one strength and one weakness, all implemented as hooks:
   init (new life) · tick (every 1/120 s step) · dealt (before one of the hero's hits lands, may change it)
   · landed (after it lands) · taken (before a hit on the hero) · spd (ground speed multiplier) · gauge (HUD). */
const nearEn=(x,y,r,skip)=>enemies.filter(e=>e.alive&&e.spawnT<=0&&e!==skip&&Math.hypot(e.x-x,(e.y-e.h/2)-y)<r);
function heroHit7(e,o){return applyHit(e,Object.assign({src:'hero',dir:sign(e.x-P.x)||P.face,light:true,m7:true},o));}
const MECH={
  kenji:{n:'HEAT',col:'#FF8A3D',strength:'Landing hits builds Heat. At full Heat your next 4 strikes explode for +4 damage and 40% more knockback.',
    weak:'Running hot: while Heat is above half (or the explosive strikes are loaded) you take 10% more damage.',
    init(p){p.m=0;p.mx=0;p.mLast=-9;},
    tick(p,dt){if(G.time-p.mLast>1.2)p.m=Math.max(0,p.m-dt*.25);},
    dealt(p,e,h,i){if(!i.melee)return;if(p.mx>0){p.mx--;h.dmg+=4;h.base*=1.4;h.boom7=1;}},
    landed(p,e,h,ok,i){if(!ok||!i.melee)return;p.mLast=G.time;
      if(h.boom7){ring(e.x,e.y-e.h/2,90,'#FF8A3D',.3);sparks(e.x,e.y-e.h/2,14,'#FFB84D',380);fx7.push({k:'flare',x:e.x,y:e.y-e.h/2,t:0,dur:.25,col:'#FF8A3D',r:70});}
      else if(p.mx<=0){p.m=Math.min(1,p.m+.12);if(p.m>=1){p.m=0;p.mx=4;pop(p.x,p.y-p.h-20,'KABOOM FISTS!','#FF8A3D',30);sfx('super');}}},
    taken(p,h){if(p.m>.5||p.mx>0)h.dmg*=1.1;},
    gauge(p){return p.mx>0?{v:p.mx/4,txt:'KABOOM FISTS ×'+p.mx,hot:1}:{v:p.m,txt:'HEAT '+Math.round(p.m*100)+'%'};}},
  lila:{n:'STATIC',col:'#FFE14D',strength:'Running and dashing charges Static. A full charge discharges on your next hit as chain lightning into 2 more enemies.',
    weak:'Featherweight: you are launched 12% farther.',
    init(p){p.m=0;},
    tick(p,dt){const mv=Math.abs(p.vx)>200||p.dashT>0;if(mv)p.m=Math.min(1,p.m+dt*(p.onGround?.45:.25));},
    landed(p,e,h,ok){if(!ok||p.m<1||h.chain7)return;p.m=0;let from=e;const hit=new Set([e]);
      for(let k=0;k<2;k++){const n=nearEn(from.x,from.y-from.h/2,300).filter(x=>!hit.has(x)).sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y))[0];if(!n)break;
        hit.add(n);fx.push({kind:'bolt',x1:from.x,y1:from.y-from.h/2,x2:n.x,y2:n.y-n.h/2,t:0,dur:.3,color:'#FFE14D',thick:5});heroHit7(n,{dmg:6,base:240,scale:1.8,ang:55,color:'#FFE14D',chain7:1});from=n;}
      pop(e.x,e.y-e.h-24,'CHAIN!','#FFE14D',28);sfx('zap');},
    taken(p,h){h.base*=1.12;h.scale*=1.12;},
    gauge(p){return {v:p.m,txt:p.m>=1?'STATIC READY':'STATIC '+Math.round(p.m*100)+'%',hot:p.m>=1};}},
  mochi:{n:'IRON BODY',col:'#B6FFCE',strength:'Super armour: while attacking on the ground or casting, hits do not stagger you until 14 damage breaks the armour (it reforms after 4 s).',
    weak:'Heavy feet: no air dash, and your dash is 30% shorter.',
    init(p){p.mA=14;p.mBreak=-9;p.armOn=false;p.armor=0;},
    tick(p,dt){p.airDash=0;
      const att=(p.act&&p.onGround)||p.castT>0||p.charge!=null||!!p.sup;
      if(att&&p.mA>0){if(!p.armOn){p.armOn=true;p.armor=p.mA;}else p.mA=Math.max(0,p.armor);
        if(p.mA<=0){p.armOn=false;p.armor=0;p.mBreak=G.time;pop(p.x,p.y-p.h-20,'ARMOUR BROKEN','#FF8A3D',24);sfx('block');}}
      else{if(p.armOn){p.armOn=false;p.mA=Math.max(0,p.armor);p.armor=0;}
        if(p.mA<=0&&G.time-p.mBreak>4){p.mA=14;pop(p.x,p.y-p.h-20,'IRON BODY','#B6FFCE',22);}
        else if(p.mA>0)p.mA=Math.min(14,p.mA+dt*2);}},
    post(p){if(p.dashT>(p._pd||0)+.01)p.dashT*=.7;p._pd=p.dashT;},
    gauge(p){return {v:p.mA/14,txt:p.mA<=0?'ARMOUR REFORMING':'IRON BODY '+Math.round(p.mA),hot:p.armOn};}},
  nyanja:{n:'NINE LIVES',col:'#FF9EC8',strength:'Dash through an attack at the last moment for a Nine Lives dodge: time slows and your next hit is a 1.6× critical.',
    weak:'Frail: you take 15% more damage.',
    init(p){p.mCrit=0;p.mDodge=0;},
    dodge(p){if(p.mDodgeT>G.time)return;p.mDodgeT=G.time+.5;p.mCrit=1;p.mDodge++;G.slowT=Math.max(G.slowT,.35);pop(p.x,p.y-p.h-20,'NINE LIVES!','#FF9EC8',30);sfx('perfect');ring(p.x,p.y-40,80,'#FF9EC8',.35);},
    dealt(p,e,h){if(p.mCrit&&!h.chain7){p.mCrit=0;h.dmg*=1.6;h.base*=1.25;h.crit7=1;}},
    landed(p,e,h,ok){if(ok&&h.crit7){pop(e.x,e.y-e.h-24,'CRITICAL!','#FF9EC8',32);fx7.push({k:'flare',x:e.x,y:e.y-e.h/2,t:0,dur:.25,col:'#FF9EC8',r:80});}},
    taken(p,h){h.dmg*=1.15;},
    gauge(p){return {v:p.mCrit?1:0,txt:p.mCrit?'CRITICAL READY':'DODGE THROUGH AN ATTACK',hot:p.mCrit};}},
  rokuro:{n:'INK MARKS',col:'#C9CEDB',strength:'Each strike leaves an ink mark (up to 5). Heavy finishers detonate the marks for +3 damage and +8% knockback each.',
    weak:'Patient blade: hits that do not detonate marks deal 10% less damage. Marks fade after 4 s.',
    init(p){},
    tick(p,dt){enemies.forEach(e=>{if(e.ink&&G.time-e.inkT>4)e.ink=0;});},
    dealt(p,e,h,i){const fin=i.melee&&P.act&&/fin|airFin|spike|dashStrike|sweep/.test(P.act.name);
      if(fin&&e.ink>0){h.dmg+=3*e.ink;h.base*=1+.08*e.ink;h.det7=e.ink;e.ink=0;}else h.dmg*=.9;},
    landed(p,e,h,ok,i){if(!ok)return;if(h.det7){pop(e.x,e.y-e.h-24,'INK BURST ×'+h.det7,'#C9CEDB',28);fx7.push({k:'ink',x:e.x,y:e.y-e.h/2,t:0,dur:.45,n:h.det7});sfx('heavy');}
      else if(i.melee){e.ink=Math.min(5,(e.ink||0)+1);e.inkT=G.time;}},
    gauge(p){let m=0;enemies.forEach(e=>{if(e.ink>m)m=e.ink;});return {v:m/5,txt:'INK MARKS '+m+'/5',hot:m>=5};}},
  hana:{n:'BLOOM',col:'#FF8FB8',strength:'Hits fill Bloom. When it blossoms, for 5 s you heal 2.2% per second and petals cut nearby enemies.',
    weak:'Gentle blade: your hits knock back 10% less.',
    init(p){p.m=0;p.mOn=0;p.mTick=0;},
    tick(p,dt){if(p.mOn>0){p.mOn-=dt;p.pct=Math.max(0,p.pct-2.2*dt);p.mTick-=dt;
        if(p.mTick<=0){p.mTick=.5;nearEn(p.x,p.y-40,150).forEach(e=>heroHit7(e,{dmg:1,base:60,scale:.3,ang:60,color:'#FF8FB8',chain7:1}));}
        if(Math.random()<.5)parts.push({x:p.x+rnd(-60,60),y:p.y-rnd(0,80),vx:rnd(-40,40),vy:rnd(-60,-10),life:.8,max:.8,r:rnd(2,4),color:'#FF8FB8',g:0});}},
    dealt(p,e,h){h.base*=.9;},
    landed(p,e,h,ok){if(!ok||h.chain7||p.mOn>0)return;p.m=Math.min(1,p.m+.07);if(p.m>=1){p.m=0;p.mOn=5;pop(p.x,p.y-p.h-20,'FULL BLOOM!','#FF8FB8',30);sfx('perfect');ring(p.x,p.y-40,140,'#FF8FB8',.5);}},
    gauge(p){return p.mOn>0?{v:p.mOn/5,txt:'FULL BLOOM',hot:1}:{v:p.m,txt:'BLOOM '+Math.round(p.m*100)+'%'};}},
  comet:{n:'FLIGHT',col:'#FFE14D',strength:'True flight: after your jumps, hold jump to fly and steer up or down for 2.4 s. Air attacks deal 15% more damage.',
    weak:'Sky-born: ground attacks deal 10% less damage.',
    init(p){p.mFuel=1;},
    tick(p,dt){if(p.onGround)p.mFuel=Math.min(1,p.mFuel+dt*.8);},
    post(p,dt){if(!p.onGround&&p.alive&&held('jump')&&p.jumps<=0&&p.mFuel>0&&p.stun<=0&&!p.sup){p.mFuel=Math.max(0,p.mFuel-dt/2.4);p.vy=approach(p.vy,axisY()*380,2600*dt);p.mFly=true;
        if(Math.random()<.5)parts.push({x:p.x-p.face*10,y:p.y-30,vx:-p.face*120,vy:rnd(40,90),life:.3,max:.3,r:rnd(3,5),color:'#FFE14D',g:0});}else p.mFly=false;},
    dealt(p,e,h,i){if(!i.melee)return;h.dmg*=i.air?1.15:.9;},
    gauge(p){return {v:p.mFuel,txt:p.mFly?'FLYING':'FLIGHT '+Math.round(p.mFuel*100)+'%',hot:p.mFly};}},
  raccoon:{n:'SCRAP TURRET',col:'#FFC93C',strength:'Every 8 hits you build a scrap turret that fires at the nearest enemy for 6 s.',
    weak:'Thin guard: blocked hits chip twice as much damage.',
    init(p){p.m=0;},
    tick(p,dt){(G.turrets7||[]).forEach(q=>{q.t-=dt;q.cd-=dt;if(q.cd<=0){const e=nearestEnemy(q.x,q.y-20,620);if(e){q.cd=.7;const a=Math.atan2(e.y-e.h/2-(q.y-26),e.x-q.x);q.a=a;
        shoot({x:q.x+Math.cos(a)*16,y:q.y-26+Math.sin(a)*16,vx:Math.cos(a)*720,vy:Math.sin(a)*720,r:7,dmg:2.5,kb:150,scale:1.3,color:'#FFC93C',kind:'ki',life:1,light:1});STATS.turret7=(STATS.turret7||0)+1;sfx('jab');}}});
      G.turrets7=(G.turrets7||[]).filter(q=>q.t>0);},
    landed(p,e,h,ok){if(!ok||h.chain7)return;p.m++;if(p.m>=8){p.m=0;const pl=p.onGround?p.plat:plats[0];const x=clamp(p.x-p.face*30,(pl||plats[0]).x1+16,(pl||plats[0]).x2-16);
      (G.turrets7=G.turrets7||[]).push({x,y:(pl||plats[0]).y,t:6,cd:.3,a:0});if(G.turrets7.length>2)G.turrets7.shift();pop(x,(pl||plats[0]).y-60,'TURRET!','#FFC93C',26);sfx('ui');}},
    taken(p,h){if(p.guard)h.dmg*=2;},
    gauge(p){return {v:p.m/8,txt:'SCRAP '+p.m+'/8'+((G.turrets7||[]).length?' · TURRET ON':''),hot:(G.turrets7||[]).length>0};}},
  skate:{n:'MOMENTUM',col:'#FFFFFF',strength:'Keep rolling one way to build Momentum: up to 40% more speed, +30% damage and +25% knockback.',
    weak:'Slow start: with no Momentum you move 15% slower, and getting hit or turning bleeds it fast.',
    init(p){p.m=0;p.mDir=1;},
    tick(p,dt){const ax=axisX();if(Math.abs(ax)>.5&&(p.onGround||p.dashT>0)){const d=sign(ax);if(d===p.mDir)p.m=Math.min(1,p.m+dt/1.5);else{p.mDir=d;p.m*=.3;}}
      else if(p.onGround)p.m=Math.max(0,p.m-dt*1.6);
      if(p.m>.6&&Math.random()<.35)p.trail.push(snap(p));},
    spd(p){return .85+.55*p.m;},
    dealt(p,e,h){h.dmg*=1+.3*p.m;h.base*=1+.25*p.m;},
    taken(p,h){p.m*=.2;},
    gauge(p){return {v:p.m,txt:'MOMENTUM '+Math.round(p.m*100)+'%',hot:p.m>=.95};}},
  titan:{n:'OVERHEAT',col:'#7FE7FF',strength:'Armour plating fully blocks one hit every 6 s. Specials build Heat; at full Heat you vent a steam blast that launches nearby enemies.',
    weak:'After venting, specials lock for 1.5 s while the reactor cools.',
    init(p){p.m=0;p.plateT=-9;},
    special(p){p.m=Math.min(1,p.m+.25);if(p.m>=1){p.m=0;p.specCd=Math.max(p.specCd,1.5);p.downCd=Math.max(p.downCd,1.5);p.lockT=G.time+1.5;
        ring(p.x,p.y-40,170,'#E9FDFF',.45);sparks(p.x,p.y-40,26,'#E9FDFF',420);shake(8);sfx('boom');pop(p.x,p.y-p.h-20,'VENT!','#7FE7FF',30);
        nearEn(p.x,p.y-40,180).forEach(e=>heroHit7(e,{dmg:7,base:340,scale:2.6,ang:55,heavy:true,light:false,color:'#7FE7FF'}));}},
    taken(p,h){if(G.time-p.plateT>=6&&!p.guard&&h.src==='enemy'){p.plateT=G.time;p.shield=Math.max(p.shield,.0001);pop(p.x,p.y-p.h-20,'PLATING!','#7FE7FF',24);}},
    gauge(p){const ready=G.time-p.plateT>=6;return {v:p.m,txt:(p.lockT>G.time?'COOLING':'HEAT '+Math.round(p.m*100)+'%')+(ready?' · PLATE READY':''),hot:ready};}},
  gravity:{n:'GRAVITY CONTROL',col:'#B57CFF',strength:'A gravity field halves enemy gravity and slows enemies by 30% within 200 px; launched enemies float. Hold guard in the air to hover. +15% damage on airborne enemies.',
    weak:'Old bones: the slowest runner, and you are launched 10% farther.',
    init(p){p.mFloat=1;},
    tick(p,dt){if(p.alive)enemies.forEach(e=>{if(e.alive&&Math.hypot(e.x-p.x,e.y-p.y)<200)e.field7=G.time+.05;});if(p.onGround)p.mFloat=Math.min(1,p.mFloat+dt*.7);},
    post(p,dt){if(!p.onGround&&held('guard')&&p.mFloat>0&&p.stun<=0){p.guard=false;p.mFloat=Math.max(0,p.mFloat-dt/1.5);p.vy=approach(p.vy,0,3000*dt);p.mHov=true;}else p.mHov=false;},
    dealt(p,e,h){if(!e.onGround)h.dmg*=1.15;},
    landed(p,e,h,ok){if(ok)e.float7=G.time+1.2;},
    taken(p,h){h.base*=1.1;h.scale*=1.1;},
    gauge(p){return {v:p.mFloat,txt:p.mHov?'HOVERING':'FIELD ON · HOVER '+Math.round(p.mFloat*100)+'%',hot:p.mHov};}},
  jaguar:{n:'FRENZY',col:'#FF8A3D',strength:'Quick consecutive hits stack Frenzy (up to 5): each stack makes your attacks 8% faster. Claw strikes make enemies bleed.',
    weak:'Reckless: at 3+ Frenzy you take 12% more damage.',
    init(p){p.m=0;p.mLast=-9;},
    tick(p,dt){if(G.time-p.mLast>1.2)p.m=0;
      enemies.forEach(e=>{if(e.bleed>0&&e.alive){e.bleed-=dt;e.bleedT=(e.bleedT||0)-dt;if(e.bleedT<=0){e.bleedT=.5;const d=.6*heroDmgMul();e.pct+=d;STATS.dealt+=d;parts.push({x:e.x,y:e.y-e.h*.6,vx:rnd(-30,30),vy:rnd(20,80),life:.4,max:.4,r:2.5,color:'#D7263D',g:300});}}});},
    landed(p,e,h,ok,i){if(!ok||!i.melee)return;p.m=G.time-p.mLast<1?Math.min(5,p.m+1):1;p.mLast=G.time;e.bleed=3;},
    taken(p,h){if(p.m>=3)h.dmg*=1.12;},
    rate(p){return 1+.08*p.m;},
    gauge(p){return {v:p.m/5,txt:'FRENZY ×'+p.m,hot:p.m>=5};}}
};
const mech=()=>P&&MECH[G.hero];

/* ---- hooks into the existing systems ---- */
const _mkP7=makePlayer;makePlayer=function(){const p=_mkP7();const M=MECH[G.hero];if(M&&M.init)M.init(p);G.turrets7=[];return p;};
const _resp7=typeof respawn==='function'?respawn:null;
if(_resp7){respawn=function(){_resp7();const M=mech();if(M&&M.init&&P)M.init(P);};}
const _up7=updatePlayer;
updatePlayer=function(dt){
  const M=mech();if(!M||!P){_up7(dt);return;}
  const H=HEROES[G.hero],s0=H.stats.speed;
  if(M.tick&&P.alive)M.tick(P,dt);
  H.stats.speed=s0*(M.spd?M.spd(P):1)*arenaSpd7(P);
  try{_up7(dt);}finally{H.stats.speed=s0;}
  if(M.post&&P.alive)M.post(P,dt);
};
const _ua7=updateAct;
updateAct=function(p,dt){if(p!==P){_ua7(p,dt);return;}const M=mech();G._melee=true;try{_ua7(p,dt*(M&&M.rate?M.rate(p):1));}finally{G._melee=false;}};
const _dsp7=doSpecialPress;
doSpecialPress=function(ax,ay){const p=P,s0=p.specCd,d0=p.downCd,u0=p.upUsed;
  if(G.chal&&G.chal.noSpecial){pop(p.x,p.y-p.h-20,'SPECIALS OFF','#CDBDF0',20);return;}
  _dsp7(ax,ay);const used=p.specCd>s0+.01||p.downCd>d0+.01||(!u0&&p.upUsed);const M=mech();if(used&&M&&M.special)M.special(p);};

/* one wrapper for every hit: hero mechanics, arena modifiers and challenge rules */
const _ah7=applyHit;
applyHit=function(t,h){
  const M=mech();let info=null;
  if(P&&t.team==='enemy'&&h.src==='hero'){
    h=Object.assign({},h);info={melee:!!G._melee&&!h.m7,air:!!P&&!P.onGround,sup:!!(P&&P.sup)};
    if(chalBlocks7(t,h,info))return false;
    arenaDealt7(t,h,info);
    if(M&&M.dealt&&!h.m7)M.dealt(P,t,h,info);
  }else if(t===P&&h.src!=='hero'){
    h=Object.assign({},h);
    if(MECH.nyanja===M&&P.dashT>0&&P.inv>0&&h.src==='enemy')M.dodge(P);
    if(M&&M.taken&&P.inv<=0)M.taken(P,h);
    arenaTaken7(h);
  }
  const ok=_ah7(t,h);
  if(info){if(M&&M.landed&&!h.m7)M.landed(P,t,h,ok,info);
    if(ok){G.lastHit7=t;G.lastHitT7=G.time;}}
  hitFx7(t,h,ok);
  return ok;
};
/* gravity: arena low-gravity areas, Grandma's field and floating launches */
const _phys7=physics;
physics=function(f,dt){const g=gravScale7(f);if(g!==1&&!(f.fly&&f.stun<=0))f.vy-=GRAV*dt*(1-g)*(f.stun>0?f.gravMul:1);_phys7(f,dt);
  if(g<1&&f.vy>1150*Math.max(.45,g))f.vy=1150*Math.max(.45,g);};
function gravScale7(f){let g=arenaGrav7(f);if(f.team==='enemy'){if(f.field7>G.time)g*=.5;if(f.float7>G.time&&f.stun>0)g*=.45;}return g;}
const _walk7b=walkAI;walkAI=function(e,dir,speed){return _walk7b(e,dir,speed*(e.field7>G.time?.7:1));};
/* Nyanja's dodge also counts dodged projectiles, which never reach applyHit while invulnerable: handled in applyHit above */
