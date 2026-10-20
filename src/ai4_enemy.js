/* =====================================================================
   ENEMY AI (Phase 4)
   Conventional utility AI: every decision scores a few candidate actions and takes the best one.
   Enemies only react to player actions they have perceived for at least their reaction time
   (0.20-0.38 s), so nothing responds on the same frame as your input.
   Tactical personalities: berserker, guardian, trickster, hunter, zoner, mimic.
   The Hunter uses the move predictor; the Mimic uses your observed action mix and spacing.
   ===================================================================== */
const PERS={
  berserker:{n:'BERSERKER',c:'#FF6A5E',d:'Rushes in and chains hits, never blocks. Wide open for a moment after a combo.'},
  guardian:{n:'GUARDIAN',c:'#7FE7FF',d:'Raises a guard when you attack up close and counters blocked hits. The guard tires out.'},
  trickster:{n:'TRICKSTER',c:'#D9B8FF',d:'Keeps mid range, sidesteps attacks it sees coming and blinks behind you (smoke marks the spot first).'},
  hunter:{n:'HUNTER',c:'#FFB03A',d:'Positions against the move the predictor expects next and punishes it when you do it.'},
  zoner:{n:'ZONER',c:'#C79BFF',d:'Keeps its distance and fires talismans; blinks away when you corner it.'},
  mimic:{n:'MIMIC',c:'#7DFF8A',d:'Copies your observed action mix and the spacing you like to keep.'}
};
const PERS_BASE={rift_grunt:'berserker',shadow_assassin:'trickster',void_stalker:'trickster',oni_brute:'guardian',mecha_sentinel:'guardian',rift_beast:'hunter',rift_caster:'zoner'};
/* run statistics (real counters, reset every run) */
const STATS={dealt:0,taken:0,pers:{},bosses:0,bossReads:0,bossGB:0,bossCounters:0,reset(){this.dealt=0;this.taken=0;this.pers={};this.bosses=0;this.bossReads=0;this.bossGB=0;this.bossCounters=0;}};
function assignPers(e){
  let p=PERS_BASE[e.cosId]||'berserker';
  if(e.role==='grunt'){const r=Math.random();if(G.wave>=6&&r<.2)p='mimic';else if(G.wave>=4&&r<.4)p='hunter';}
  e.pers=p;e.react=clamp(.34-G.wave*.012,.2,.34)+(p==='guardian'?.04:p==='trickster'?-.02:0);
  e.guardStam=2.2;e.guardBroken=0;e.evadeCd=0;e.tpCd=2+Math.random()*2;e.recover=0;e.volley=0;e.decT=0;e.dbg=null;e.lastSeen=null;
  STATS.pers[p]=(STATS.pers[p]||0)+1;
}

/* ---------- what the enemies can perceive about you: a short log of your actions ---------- */
const OBS={ev:[],dist:null};
function obsPush(k){if(!P)return;OBS.ev.push({k,t:G.time,x:P.x,y:P.y,face:P.face,air:!P.onGround});if(OBS.ev.length>40)OBS.ev.shift();HUNT.resolve(k);}
function seen(e,kinds,win){for(let i=OBS.ev.length-1;i>=0;i--){const v=OBS.ev[i];const age=G.time-v.t;if(age<e.react)continue;if(age>e.react+win)return null;if(kinds.indexOf(v.k)>=0)return v;}return null;}
function seenNew(e,kinds,win){const v=seen(e,kinds,win);return v&&e.lastSeen!==v?v:null;}

/* ---------- Hunter reads: every stance the Hunter takes is a logged prediction, scored against your NEXT action ---------- */
const HUNT={pending:null,made:0,hit:0,expired:0,log:[],
  commit(ev){if(this.pending&&this.pending.ev===ev)return;this.pending={ev,t:G.time};},
  resolve(k){const p=this.pending;if(!p)return;this.pending=null;
    if(G.time-p.t>3){this.expired++;return;}
    const ok=p.ev===k;this.made++;if(ok)this.hit++;this.log.push({p:p.ev,a:k,ok});if(this.log.length>10)this.log.shift();},
  reset(){this.pending=null;this.made=0;this.hit=0;this.expired=0;this.log=[];}};

/* ---------- shared enemy helpers ---------- */
function choose(e,cands,state){let best=null;for(const c of cands)if(c[1]>0&&(!best||c[1]>best[1]))best=c;
  e.dbg={pers:e.pers,state,cands:cands.filter(c=>c[1]>0).map(c=>[c[0],Math.round(c[1]*100)/100]),pick:best?best[0]:'none',react:e.react};return best?best[0]:'none';}
function startWind(e,w,dx){e.wind=w;e.face=sign(dx)||e.face;}
function hold(e,dt,dx){if(e.onGround)e.vx=approach(e.vx,0,1400*dt);e.face=sign(dx)||e.face;}
function platUnder(x,y){for(const p of plats){if(Math.abs(p.y-y)<6&&x>=p.x1+16&&x<=p.x2-16)return p;}return null;}
function startBlink(e,tx,ty){e.blink={t:.38,x:tx,y:ty};e.vx=0;e.tpCd=4.5+Math.random()*2;
  for(let i=0;i<10;i++)parts.push({x:e.x+rnd(-14,14),y:e.y-rnd(10,70),vx:rnd(-60,60),vy:rnd(-80,-10),life:.5,max:.5,r:rnd(4,8),color:'rgba(60,30,90,.8)',g:0});sfx('whoosh');}
function finishBlink(e){const b=e.blink;e.blink=null;e.x=b.x;e.y=b.y;e.vx=0;e.vy=0;e.face=sign(P.x-e.x)||1;
  for(let i=0;i<10;i++)parts.push({x:e.x+rnd(-14,14),y:e.y-rnd(10,70),vx:rnd(-60,60),vy:rnd(-80,-10),life:.5,max:.5,r:rnd(4,8),color:'rgba(60,30,90,.8)',g:0});
  if(e.role!=='shooter')e.wind=.32;}

function enemyStrike(e){
  const d=EDEF[e.role];e.punchT=.16;e.cd=Math.max(.45,d.cd-Math.min(.4,G.wave*.03));
  const reach=e.role==='heavy'||e.role==='boss'?62:44;
  const r=e.face>0?{x1:e.x,x2:e.x+e.w/2+reach,y1:e.y-e.h,y2:e.y}:{x1:e.x-e.w/2-reach,x2:e.x,y1:e.y-e.h,y2:e.y};
  const gb=!!e.gbreak;e.gbreak=false;
  if(e.counterHit){e.counterHit=false;pop(e.x,e.y-e.h-14,'COUNTER!','#7FE7FF',26);}
  if(P.alive&&overlap(r,rect(P))){const ok=applyHit(P,{dmg:d.dmg*e.dmgMul,base:d.kb,scale:d.scale,ang:40,dir:e.face,src:'enemy',attacker:e,unblock:gb});
    if(ok)pop(P.x,P.y-P.h-10,pick(['POW!','BONK!','OOF!']),'#FF2E63',30);}
  else sparks(e.x+e.face*40,e.y-40,4,'#FFFFFF',120);
  const maxC=e.pers==='berserker'?(G.wave>=3?2:1):(e.role==='grunt'&&G.wave>=3?1:0);
  if(e.combo<maxC){e.combo++;e.wind=.16;}else{if(e.pers==='berserker'&&e.combo>0)e.recover=.75;e.combo=0;}
}
function enemyShoot(e,n,spr){
  const u=UNIS[G.uni];let tx=P.x,ty=P.y-36;
  if(antiAirP()){tx+=P.vx*.35;ty+=Math.min(0,P.vy)*.22;}
  const ox=e.x+e.face*24,oy=e.y-e.h*.6;spr=spr||.22;
  for(let i=0;i<n;i++){const a=Math.atan2(ty-oy,tx-ox)+(i-(n-1)/2)*spr;const spd=e.role==='boss'?380:430;
    projs.push({team:'enemy',x:ox,y:oy,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,r:e.role==='boss'?14:10,dmg:EDEF[e.role].dmg*e.dmgMul*(e.role==='boss'?.6:1),
      kb:EDEF.shooter.kb,scale:EDEF.shooter.scale,life:2.2,color:e.shotColor||u.shot,kind:e.shotKind||u.shotKind,spin:0,attacker:e});}
  sfx('blast');
}
function zonerFire(e){e.volley=(e.volley||0)+1;const spread=G.wave>=5&&e.volley%3===0;enemyShoot(e,spread?3:1,.24);if(spread)pop(e.x,e.y-e.h-12,'VOLLEY','#C79BFF',20);}
function walkAI(e,dir,speed){
  if(e.onGround&&dir!==0&&!overPlat(e.x+dir*26,e.plat)){
    const dy=P.y-e.y;
    if(dy>40&&Math.abs(P.x-e.x)<260){}
    else if(dy<-30&&e.jcd<=0){e.vy=-730;e.jcd=1.3;}
    else dir=0;
  }
  e.vx=dir*speed;if(dir)e.face=dir;
}

/* ---------- personalities ---------- */
const PERS_AI={
  berserker(e,dt,dx,dy,d){
    const ad=Math.abs(dx),inR=ad<e.w/2+36&&Math.abs(dy)<60,can=e.cd<=0&&e.spawnT<=0;
    if(e.recover>0){choose(e,[['recover',1]],'overextended');hold(e,dt,dx);return;}
    const c=choose(e,[['attack',can&&inR?1.2:0],['jumpChase',e.onGround&&dy<-70&&ad<190&&e.jcd<=0?.9:0],['approach',ad>=26?.6:0],['hold',.1]],'rush');
    if(c==='attack')startWind(e,Math.max(.16,d.wind-.08-Math.min(.1,G.wave*.01)),dx);
    else if(c==='jumpChase'){e.vy=-740;e.jcd=1.2;}
    else if(c==='approach')walkAI(e,sign(dx),d.speed*(1.1+Math.min(G.wave*.03,.5)));
    else hold(e,dt,dx);
  },
  guardian(e,dt,dx,dy,d){
    const ad=Math.abs(dx),inR=ad<e.w/2+36&&Math.abs(dy)<60,can=e.cd<=0&&e.spawnT<=0;
    if(e.guardBroken>0){e.guardBroken-=dt;if(e.guardBroken<=0)e.guardStam=1.2;}
    else{e.guardStam=Math.min(2.2,e.guardStam+(e.blockT>0?-dt:dt*.5));if(e.guardStam<=0){e.guardBroken=1.6;e.blockT=0;pop(e.x,e.y-e.h-12,'GUARD DOWN','#7FE7FF',22);}}
    const threat=seen(e,['attack','launch','special','dash'],.6);
    const blocked=e.blockedHitT&&G.time-e.blockedHitT<.7;
    const c=choose(e,[['counter',blocked&&e.spawnT<=0&&inR?1.5:0],
      ['guard',threat&&ad<150&&e.guardBroken<=0&&e.guardStam>.2?1.1:0],
      ['charge',e.role==='heavy'&&ad>140&&ad<420&&Math.abs(dy)<40&&can&&e.onGround?.8:0],
      ['attack',can&&inR?.9:0],['approach',ad>70?.5:0],['hold',.2]],e.blockT>0?'guarding':'advance');
    if(c==='counter'){e.blockedHitT=0;e.counterHit=true;e.blockT=0;startWind(e,.12,dx);e.cd=0;}
    else if(c==='guard'){e.blockT=Math.max(e.blockT,.35);hold(e,dt,dx);}
    else if(c==='charge'){e.face=sign(dx);e.wind=.5;e.doCharge=true;e.cd=2;}
    else if(c==='attack')startWind(e,Math.max(.22,d.wind-Math.min(.12,G.wave*.01)),dx);
    else if(c==='approach')walkAI(e,sign(dx),d.speed*.9);
    else hold(e,dt,dx);
  },
  trickster(e,dt,dx,dy,d){
    const ad=Math.abs(dx),inR=ad<e.w/2+36&&Math.abs(dy)<60,can=e.cd<=0&&e.spawnT<=0;
    const thr=seenNew(e,['attack','launch','special'],.35);
    let bt=null;if(P.onGround&&P.plat){const tx=clamp(P.x-(P.face||1)*70,P.plat.x1+18,P.plat.x2-18);if(Math.abs(tx-P.x)>40)bt=[tx,P.plat.y];}
    const c=choose(e,[['evade',thr&&ad<140&&e.evadeCd<=0&&e.onGround?1.4:0],
      ['blink',can&&e.tpCd<=0&&ad<260&&bt&&e.onGround?.95:0],
      ['attack',can&&inR?1.0:0],['retreat',ad<80?.6:0],['approach',ad>170?.6:0],['circle',.3]],'skirmish');
    if(c==='evade'){e.lastSeen=thr;e.vy=-560;e.vx=-(sign(dx)||1)*330;e.onGround=false;e.evadeCd=1.5;pop(e.x,e.y-e.h-12,'EVADE','#D9B8FF',22);}
    else if(c==='blink')startBlink(e,bt[0],bt[1]);
    else if(c==='attack')startWind(e,.22,dx);
    else if(c==='retreat'){walkAI(e,-(sign(dx)||1),d.speed);e.face=sign(dx)||e.face;}
    else if(c==='approach')walkAI(e,sign(dx),d.speed*1.05);
    else{e.vx=approach(e.vx,Math.sin(G.time*1.7+e.id)*d.speed*.5,900*dt);e.face=sign(dx)||e.face;}
  },
  hunter(e,dt,dx,dy,d){
    const ad=Math.abs(dx),inR=ad<e.w/2+36&&Math.abs(dy)<60,can=e.cd<=0&&e.spawnT<=0;
    const tp=PRED.n>=8?PRED.top():null;const read=tp&&tp.p>=.34?tp.ev:null;
    if(read!==e.read){e.read=read;e.readT=G.time;}
    if(read)HUNT.commit(read);
    const want=read==='dash'?170:read==='special'?200:read==='attack'||read==='launch'?115:read==='jump'?150:read==='guard'?90:60;
    const ev=read?seenNew(e,[read==='launch'?'launch':read],.45):null;
    const c=choose(e,[['punish',ev&&can&&ad<320?1.5:0],['attack',can&&inR&&!read?.9:can&&inR?.5:0],
      ['approach',ad>want+30?.6:0],['retreat',ad<want-30&&read?.55:0],['hold',.3]],read?'reading '+read+' ('+Math.round(tp.p*100)+'%)':'stalking');
    if(c==='punish'){e.lastSeen=ev;pop(e.x,e.y-e.h-14,'READ!','#FFB03A',26);
      if(read==='jump'&&e.onGround){e.vy=-760;e.vx=sign(dx)*260;e.onGround=false;startWind(e,.16,dx);}
      else if(read==='guard'){e.gbreak=true;startWind(e,.45,dx);pop(e.x,e.y-e.h-34,'GUARD BREAK','#FF2E63',22);}
      else{e.vx=sign(dx)*d.speed*2.2;startWind(e,.18,dx);}}
    else if(c==='attack')startWind(e,Math.max(.2,d.wind-.05),dx);
    else if(c==='approach')walkAI(e,sign(dx),d.speed*(1+Math.min(G.wave*.03,.4)));
    else if(c==='retreat'){walkAI(e,-(sign(dx)||1),d.speed*.8);e.face=sign(dx)||e.face;}
    else hold(e,dt,dx);
  },
  zoner(e,dt,dx,dy,d){
    const ad=Math.abs(dx),m=plats[0];
    const bx=P.x<480?m.x2-40:m.x1+40;
    const c=choose(e,[['blink',ad<130&&e.tpCd<=0&&e.onGround&&e.spawnT<=0?1.3:0],['fire',e.cd<=0&&ad<640&&e.spawnT<=0?1.0:0],
      ['retreat',ad<230?.8:0],['approach',ad>420?.6:0],['hold',.3]],'zoning');
    if(c==='blink')startBlink(e,bx,m.y);
    else if(c==='fire'){e.wind=d.wind;e.face=sign(dx)||e.face;e.cd=Math.max(.9,d.cd-Math.min(.7,G.wave*.05));}
    else if(c==='retreat'){walkAI(e,-(sign(dx)||1),d.speed);e.face=sign(dx)||e.face;}
    else if(c==='approach'){walkAI(e,sign(dx),d.speed);}
    else hold(e,dt,dx);
  },
  mimic(e,dt,dx,dy,d){
    const ad=Math.abs(dx),inR=ad<e.w/2+36&&Math.abs(dy)<60,can=e.cd<=0&&e.spawnT<=0;
    const want=clamp(OBS.dist==null?110:OBS.dist,50,320);
    let s=0;const w=EV.map((k,i)=>{const v=k==='super'?0:PRED.c0[i];s+=v;return v;});
    e.decT-=dt;
    if(e.decT<=0&&can&&s>.5){e.decT=.5;let r=Math.random()*s,i=0;for(;i<w.length-1;i++){r-=w[i];if(r<=0)break;}const a=EV[i];
      e.dbg={pers:'mimic',state:'copying (spacing '+Math.round(want)+')',cands:EV.map((k,j)=>[k,Math.round(w[j]/s*100)/100]).filter(x=>x[1]>0),pick:a,react:e.react};
      if(a==='jump'&&e.onGround){e.vy=-720;e.onGround=false;}
      else if((a==='attack'||a==='launch')&&inR)startWind(e,.22,dx);
      else if(a==='attack'||a==='launch')e.mimicGo=.4;
      else if(a==='special'){e.shootNext=true;startWind(e,.3,dx);}
      else if(a==='dash'){e.vx=(ad>want?sign(dx):-(sign(dx)||1))*560;e.dashT=.16;}
      else if(a==='guard')e.blockT=.5;
      return;}
    if(e.dashT>0){e.dashT-=dt;return;}
    if(e.mimicGo>0){e.mimicGo-=dt;walkAI(e,sign(dx),d.speed*1.3);return;}
    if(ad>want+25)walkAI(e,sign(dx),d.speed);else if(ad<want-25){walkAI(e,-(sign(dx)||1),d.speed);e.face=sign(dx)||e.face;}else hold(e,dt,dx);
    if(!e.dbg||e.dbg.pers!=='mimic')e.dbg={pers:'mimic',state:'spacing '+Math.round(want),cands:[],pick:'move',react:e.react};
  }
};

function updateEnemy(e,dt){
  const d=EDEF[e.role];
  e.cd-=dt;e.blockT-=dt;e.dodgeCd-=dt;e.jcd-=dt;e.punchT=Math.max(0,e.punchT-dt);e.bowlCd-=dt;e.flash=Math.max(0,e.flash-dt);
  e.recover=Math.max(0,(e.recover||0)-dt);e.evadeCd=(e.evadeCd||0)-dt;e.tpCd=(e.tpCd||0)-dt;
  if(e.spawnT>0)e.spawnT-=dt;
  if(e.inv>0)e.inv-=dt;
  if(e.blink){e.blink.t-=dt;if(e.blink.t<=0)finishBlink(e);else{e.vx=0;physics(e,dt);return;}}
  if(e.root>0){e.root-=dt;e.vx=0;e.mood='hurt';if(e.stun>0)e.stun-=dt;physics(e,dt);return;}
  if(e.dizzy>0){e.dizzy-=dt;e.mood='dizzy';e.vx=approach(e.vx,0,900*dt);physics(e,dt);return;}
  if(e.stun>0){e.stun-=dt;if(e.stun<=0){e.mood='idle';if(e.wasFlyer){e.fly=true;e.wasFlyer=false;e.vy=0;}}physics(e,dt);return;}
  e.mood=e.wind>0||e.punchT>0?'attack':'idle';
  if(e.fly){flyerAI(e,dt);return;}
  const offstage=(e.x<170||e.x>790)&&!e.onGround;
  if(offstage&&e.y>250){const dir=e.x<480?1:-1;e.vx=approach(e.vx,dir*270,900*dt);e.face=dir;
    if(e.vy>60&&e.jumps>0){e.vy=-720;e.jumps--;sparks(e.x,e.y,5,'rgba(255,255,255,.7)',120);}physics(e,dt);return;}
  if(!P.alive){e.vx=approach(e.vx,0,800*dt);physics(e,dt);return;}
  const dx=P.x-e.x,dy=P.y-e.y;
  if(e.role==='clone'){cloneAI(e,dt,dx,dy);physics(e,dt);return;}
  if(e.onGround&&e.dodgeCd<=0&&e.role!=='boss'&&e.pers!=='berserker'&&e.pers!=='guardian'){
    for(const q of projs){if(q.team!=='hero'||!q.checked||q.checked.has(e.id))continue;
      if(Math.abs(q.y-(e.y-e.h/2))<e.h&&sign(q.vx)===sign(e.x-q.x)&&Math.abs(e.x-q.x)<200){q.checked.add(e.id);
        if(Math.random()<dodgeP()){const read=(AI.pDodge||0)>AI.dodge;e.vy=-660;e.dodgeCd=.8;pop(e.x,e.y-e.h-10,read?'READ YOU!':'DODGE','#7FE7FF',22);if(read)ann('read',{m:'special'},0);}break;}}
  }
  if(e.pers==='guardian'&&e.guardBroken<=0&&e.guardStam>.2){
    for(const q of projs){if(q.team==='hero'&&sign(q.vx)===sign(e.x-q.x)&&Math.abs(e.x-q.x)<150&&Math.abs(q.y-(e.y-e.h/2))<e.h){e.blockT=Math.max(e.blockT,.25);e.face=sign(q.x-e.x)||e.face;break;}}
  }
  if(e.role==='boss'){bossAI(e,dt,dx,dy);physics(e,dt);return;}
  if(e.charging>0){e.charging-=dt;e.vx=e.face*430;e.armor=Math.max(e.armor,1);
    if(P.alive&&overlap(rect(e),rect(P))){applyHit(P,{dmg:d.dmg*e.dmgMul,base:340,scale:3,ang:45,dir:e.face,src:'enemy',attacker:e,unblock:!!e.gbreak});e.charging=0;e.gbreak=false;}
    if(e.onGround&&!overPlat(e.x+e.face*30,e.plat))e.charging=0;
    if(e.charging<=0){e.armor=0;e.cd=1.6;}physics(e,dt);return;}
  if(e.wind>0){e.wind-=dt;if(e.onGround)e.vx=approach(e.vx,0,1200*dt);
    if(e.wind<=0){if(e.role==='shooter')zonerFire(e);else if(e.shootNext){e.shootNext=false;enemyShoot(e,1);e.cd=1.2;}
      else if(e.doCharge){e.doCharge=false;e.charging=.75;pop(e.x,e.y-e.h-10,'CHARGE!','#FF2E63',26);}else enemyStrike(e);}
    physics(e,dt);return;}
  (PERS_AI[e.pers]||PERS_AI.berserker)(e,dt,dx,dy,d);
  physics(e,dt);
}
function flyerAI(e,dt){
  const d=EDEF.shooter;const dx=P.x-e.x;const tx=P.x-(sign(dx)||1)*260;const ty=clamp(P.y-170,90,300);
  e.face=sign(dx)||e.face;
  if(e.x<120||e.x>840)e.vx=approach(e.vx,(480-e.x)*1.5,600*dt);else e.vx=approach(e.vx,clamp((tx-e.x)*1.4,-180,180),500*dt);
  e.vy=approach(e.vy,clamp((ty-e.y)*2,-200,200),500*dt);
  if(e.wind>0){e.wind-=dt;e.vx*=.9;if(e.wind<=0&&P.alive)zonerFire(e);}
  else if(e.cd<=0&&e.spawnT<=0&&P.alive){e.wind=d.wind;e.cd=Math.max(1,d.cd-Math.min(.7,G.wave*.05));}
  e.dbg={pers:'zoner',state:'hovering at range',cands:[['fire',e.cd<=0?1:0],['keep range',.5]],pick:e.wind>0?'fire':'keep range',react:e.react};
  physics(e,dt);
}

/* =====================================================================
   BOSSES: telegraphed attacks, three phases, observation-based adaptation
   - Phase 2 at 60% damage, phase 3 at 120%: each phase adds a move and shortens telegraphs.
   - Every attack: telegraph (>=0.4 s, shown on screen) -> active -> recovery (no armour: your opening).
   - Light hits during telegraph/active land on poise armour; heavy hits or enough damage interrupt.
   - Adapts to real observations: 4+ hits of one move category in 6 s -> it reads and counters that
     move for 9 s; guarding more than 45% of the last ~6 s -> it switches to guard-breaking attacks.
   ===================================================================== */
const BOSSDEF={
  oni_brute:{jp:'鬼の巨人',phases:[['smash','stomp','rush'],['smash','stomp','rush','spin'],['smash','stomp','spin','quake']],newMove:['','SPIN SWEEP','EARTH QUAKE']},
  rift_beast:{jp:'リフトの獣',phases:[['pounce','claws','howl'],['pounce','claws','howl','frenzy'],['pounce3','claws','howl','frenzy']],newMove:['','FRENZY','TRIPLE POUNCE']},
  mecha_sentinel:{jp:'機械の番人',phases:[['laser','stomp','rush'],['laser','stomp','rush','sweep'],['laser','sweep','barrage','stomp']],newMove:['','FLOOR SWEEP','ROCKET BARRAGE']}
};
const MOVECAT={jab1:'combo',jab2:'combo',kick:'combo',fin:'combo',launch:'launcher',airUp:'launcher',sweep:'sweep',dashStrike:'dash',spike:'air'};
const CATKINDS={combo:['attack'],sweep:['attack'],air:['attack'],launcher:['launch'],dash:['dash'],special:['special']};
function moveCat(n){return MOVECAT[n]||(/^air/.test(n)?'air':'combo');}
function bossHit(e,o){const d=EDEF.boss;return applyHit(P,{dmg:d.dmg*e.dmgMul*(o.dm||1),base:o.base||330,scale:o.scale||3.1,ang:o.ang||45,dir:o.dir||e.face,src:'enemy',attacker:e,unblock:!!(o.unblock||e.bs.gb)});}
function inBox(x1,x2,y1,y2){return P.alive&&overlap({x1:Math.min(x1,x2),x2:Math.max(x1,x2),y1,y2},rect(P));}
const BATK={
  smash:{n:'KANABO SMASH',tele:.7,rec:.9,range:[0,170],melee:1,
    act(e,bs){if(bs.f0){e.punchT=.2;shake(8);sfx('heavy');sparks(e.x+e.face*110,e.y-6,14,'#FF2E4D',300);
      if(inBox(e.x+e.face*10,e.x+e.face*175,e.y-130,e.y))bossHit(e,{dm:1.2,base:360,ang:50});}return bs.t>.22;},
    draw(c,e,p){c.fillStyle='rgba(255,46,77,'+(.12+.25*p)+')';const x=e.face>0?e.x+10:e.x-175;c.fillRect(x,e.y-130,165,130);c.strokeStyle='rgba(255,46,77,.8)';c.lineWidth=2;c.strokeRect(x,e.y-130,165,130);}},
  stomp:{n:'METEOR STOMP',tele:.5,rec:.85,range:[60,420],melee:1,
    start(e,bs){bs.tx=clamp(P.x,plats[0].x1+30,plats[0].x2-30);},
    act(e,bs){if(bs.f0){e.vy=-950;e.vx=clamp((bs.tx-e.x)*1.3,-430,430);e.onGround=false;bs.air=true;}
      if(bs.air&&bs.t>.15&&e.onGround){bs.air=false;shake(12);sparks(e.x,e.y,22,'#FFE6B3',380);ring(e.x,e.y,200,'#FFE6B3',.45);sfx('boom');
        if(P.alive&&P.onGround&&Math.abs(P.x-e.x)<210&&Math.abs(P.y-e.y)<40)bossHit(e,{base:330,scale:3.2,ang:70,dir:sign(P.x-e.x)||1});return true;}
      return bs.t>2.5;},
    draw(c,e,p,bs){c.strokeStyle='rgba(255,230,179,'+(.4+.5*p)+')';c.lineWidth=3;c.beginPath();c.ellipse(bs.tx,plats[0].y,210*(.4+.6*p),18,0,0,Math.PI*2);c.stroke();}},
  rush:{n:'RAMPAGE',tele:.5,rec:.8,range:[120,520],melee:1,
    act(e,bs){if(bs.f0){e.charging=1;bs.hit=false;}e.vx=e.face*400;
      if(!bs.hit&&P.alive&&overlap(rect(e),rect(P))){bs.hit=true;bossHit(e,{base:360,scale:3.2});}
      if(e.onGround&&!overPlat(e.x+e.face*40,e.plat))return true;return bs.t>1||bs.hit;},
    end(e){e.charging=0;e.vx=0;},
    draw(c,e,p){c.fillStyle='rgba(255,46,77,'+(.3+.4*p)+')';const y=e.y-e.h*.5;c.beginPath();c.moveTo(e.x+e.face*60,y-14);c.lineTo(e.x+e.face*140,y);c.lineTo(e.x+e.face*60,y+14);c.closePath();c.fill();}},
  spin:{n:'SPIN SWEEP',tele:.7,rec:.85,range:[0,150],melee:1,
    act(e,bs){e.punchT=.2;e.spin=bs.t*18;if(bs.f0)sfx('whoosh');if(!bs.hit&&P.alive&&Math.abs(P.x-e.x)<135&&Math.abs(P.y-e.y)<90){bs.hit=true;bossHit(e,{base:340,ang:60,dir:sign(P.x-e.x)||1});}
      if(bs.t>.45){e.spin=0;return true;}return false;},
    draw(c,e,p){c.strokeStyle='rgba(255,46,77,'+(.35+.5*p)+')';c.lineWidth=3;c.setLineDash([8,6]);c.beginPath();c.ellipse(e.x,e.y-40,135,60,0,0,Math.PI*2);c.stroke();c.setLineDash([]);}},
  quake:{n:'EARTH QUAKE',tele:.6,rec:1,range:[0,700],
    act(e,bs){if(bs.f0){shake(10);sfx('boom');[-1,1].forEach(s=>projs.push({team:'enemy',x:e.x+s*40,y:e.y-16,vx:s*520,vy:0,r:16,dmg:EDEF.boss.dmg*e.dmgMul*.7,kb:300,scale:2.6,life:1.4,color:'#FF2E4D',kind:'wave',spin:0,attacker:e}));}return bs.t>.2;},
    draw(c,e,p){c.fillStyle='rgba(255,46,77,'+(.15+.3*p)+')';c.fillRect(plats[0].x1,plats[0].y-26,plats[0].x2-plats[0].x1,26);}},
  pounce:{n:'POUNCE',tele:.55,rec:.75,range:[90,460],melee:1,
    start(e,bs){bs.tx=clamp(P.x,plats[0].x1+20,plats[0].x2-20);bs.hit=false;},
    act(e,bs){if(bs.f0){e.vy=-700;e.vx=clamp((bs.tx-e.x)/.75,-560,560);e.onGround=false;e.face=sign(bs.tx-e.x)||e.face;bs.air=true;sfx('whoosh');}
      if(!bs.hit&&P.alive&&overlap(rect(e),rect(P))){bs.hit=true;bossHit(e,{base:320,ang:45});}
      if(bs.air&&bs.t>.15&&e.onGround){bs.air=false;e.vx=0;dust(e.x,e.y,10);
        if(bs.multi>1){bs.multi--;bs.wait=.34;bs.started=false;bs.t=0;bs.tx=clamp(P.x,plats[0].x1+20,plats[0].x2-20);bs.hit=false;return false;}return true;}
      return bs.t>2.5;},
    draw(c,e,p,bs){c.strokeStyle='rgba(199,125,255,'+(.4+.5*p)+')';c.lineWidth=3;c.beginPath();c.moveTo(bs.tx-40,plats[0].y-2);c.lineTo(bs.tx+40,plats[0].y-2);c.stroke();
      c.beginPath();c.arc(bs.tx,plats[0].y-40,12+20*(1-p),0,Math.PI*2);c.stroke();}},
  claws:{n:'RIFT CLAWS',tele:.42,rec:.6,range:[0,150],melee:1,
    act(e,bs){const k=bs.t<.12?0:1;if(bs.k!==k||bs.f0){bs.k=k;e.punchT=.14;sfx('whoosh');
      if(inBox(e.x,e.x+e.face*(e.w/2+90),e.y-e.h,e.y))bossHit(e,{dm:.6,base:k?320:150,scale:k?2.8:1,ang:k?45:30});}
      return bs.t>.3;},
    draw(c,e,p){c.fillStyle='rgba(199,125,255,'+(.12+.25*p)+')';const x=e.face>0?e.x:e.x-(e.w/2+90);c.fillRect(x,e.y-e.h,e.w/2+90,e.h);}},
  howl:{n:'RIFT HOWL',tele:.6,rec:.8,range:[160,800],
    act(e,bs){if(bs.f0){ring(e.x,e.y-e.h*.6,160,'#C77DFF',.5);sfx('zap');enemyShoot(e,bs.phase>=1?5:3,.26);}return bs.t>.2;},
    draw(c,e,p){c.strokeStyle='rgba(199,125,255,'+(.3+.5*p)+')';c.lineWidth=3;c.beginPath();c.arc(e.x,e.y-e.h*.7,40+50*p,0,Math.PI*2);c.stroke();}},
  frenzy:{n:'FRENZY',tele:.5,rec:1,range:[0,260],melee:1,
    act(e,bs){const k=Math.floor(bs.t/.3);if(bs.k!==k&&k<3){bs.k=k;e.face=sign(P.x-e.x)||e.face;e.vx=e.face*360;e.punchT=.16;sfx('whoosh');
      if(inBox(e.x,e.x+e.face*(e.w/2+80),e.y-e.h,e.y))bossHit(e,{dm:.55,base:k===2?340:160,scale:k===2?3:1,ang:k===2?50:30});}
      if(bs.t>.9){e.vx=0;return true;}return false;},
    draw(c,e,p){c.fillStyle='rgba(199,125,255,'+(.15+.3*p)+')';const x=e.face>0?e.x:e.x-260;c.fillRect(x,e.y-e.h,260,e.h);}},
  laser:{n:'SENTINEL LASER',tele:.75,rec:.7,range:[120,900],
    start(e,bs){bs.lock=null;},
    aim(e,bs){const o=[e.x+e.face*20,e.y-e.h*.78];if(bs.t<bs.dur-.22)bs.aim=Math.atan2(P.y-P.h/2-o[1],P.x-o[0]);bs.o=o;},
    act(e,bs){if(bs.f0){sfx('zap');shake(5);const o=bs.o,a=bs.aim,L=900,ex=o[0]+Math.cos(a)*L,ey=o[1]+Math.sin(a)*L;
      const px=P.x,py=P.y-P.h/2,vx=ex-o[0],vy=ey-o[1],k=clamp(((px-o[0])*vx+(py-o[1])*vy)/(vx*vx+vy*vy),0,1),qx=o[0]+vx*k,qy=o[1]+vy*k;
      if(P.alive&&Math.hypot(px-qx,py-qy)<26)bossHit(e,{dm:.9,base:300,ang:35,dir:sign(Math.cos(a))||1});}return bs.t>.25;},
    draw(c,e,p,bs,st){if(!bs.o)return;const L=900,ex=bs.o[0]+Math.cos(bs.aim)*L,ey=bs.o[1]+Math.sin(bs.aim)*L;
      c.save();if(st==='act'){c.strokeStyle='rgba(143,224,255,.95)';c.lineWidth=12;c.shadowColor='#8FD8FF';c.shadowBlur=18;}else{c.strokeStyle='rgba(255,46,77,'+(.35+.5*p)+')';c.lineWidth=bs.t>bs.dur-.22?3:1.5;c.setLineDash([10,8]);}
      c.beginPath();c.moveTo(bs.o[0],bs.o[1]);c.lineTo(ex,ey);c.stroke();c.restore();}},
  sweep:{n:'FLOOR SWEEP',tele:.8,rec:.8,range:[0,900],
    act(e,bs){if(bs.f0){sfx('zap');shake(6);if(P.alive&&P.onGround&&Math.abs(P.y-plats[0].y)<6)bossHit(e,{dm:.8,base:320,ang:70,dir:sign(P.x-e.x)||1});}return bs.t>.3;},
    draw(c,e,p,bs,st){c.fillStyle=st==='act'?'rgba(143,224,255,.7)':'rgba(255,46,77,'+(.15+.35*p)+')';c.fillRect(plats[0].x1-20,plats[0].y-18,plats[0].x2-plats[0].x1+40,18);}},
  barrage:{n:'ROCKET BARRAGE',tele:.85,rec:1,range:[0,900],
    start(e,bs){const m=plats[0];bs.xs=[clamp(P.x,m.x1+20,m.x2-20)];for(let i=0;i<4;i++)bs.xs.push(m.x1+40+Math.random()*(m.x2-m.x1-80));},
    act(e,bs){if(bs.f0){sfx('blast');bs.xs.forEach((x,i)=>projs.push({team:'enemy',x,y:cam.y-VH/2/cam.z-40-i*30,vx:0,vy:760,r:12,dmg:EDEF.boss.dmg*e.dmgMul*.6,kb:280,scale:2.4,life:2.2,color:'#FF9A3C',kind:'missile',spin:0,attacker:e}));}return bs.t>.2;},
    draw(c,e,p,bs){(bs.xs||[]).forEach(x=>{c.strokeStyle='rgba(255,154,60,'+(.4+.5*p)+')';c.lineWidth=2;c.beginPath();c.ellipse(x,plats[0].y,26*(1.3-p*.3),7,0,0,Math.PI*2);c.stroke();});}},
  counter:{n:'COUNTER',tele:.3,rec:.8,range:[0,170],melee:1,
    start(e){e.blockT=.3;},
    act(e,bs){if(bs.f0){e.punchT=.2;sfx('heavy');if(inBox(e.x,e.x+e.face*(e.w/2+110),e.y-e.h,e.y))bossHit(e,{base:340,ang:45});}return bs.t>.18;},
    draw(c,e,p){c.strokeStyle='rgba(127,231,255,.9)';c.lineWidth=3;c.beginPath();c.arc(e.x,e.y-e.h/2,e.h*.6,0,Math.PI*2);c.stroke();}}
};
BATK.pounce3=Object.assign({},BATK.pounce,{n:'TRIPLE POUNCE',start(e,bs){BATK.pounce.start(e,bs);bs.multi=3;}});
function bossOf(){return enemies.find(e=>e.role==='boss'&&e.alive&&e.bs);}
function initBoss(e){e.bs={state:'walk',t:0,dur:0,cd:1.2,phase:0,atk:null,last:null,hits:[],read:null,readUntil:0,ccd:0,gsum:0,tsum:.01,gb:false,intro:false,interrupts:0,log:[]};e.react=.3;}
function bossInterrupt(e){const bs=e.bs;if(!bs||bs.state==='walk')return;const A=bs.atk&&BATK[bs.atk];if(A&&A.end)A.end(e);bs.state='rec';bs.t=0;bs.dur=.35;e.armor=0;bs.interrupts++;e.spin=0;
  pop(e.x,e.y-e.h-30,'INTERRUPTED!','#7FE7FF',24);}
function bossNoteHit(t){const bs=t.bs;if(!bs||!P)return;const c=P.act?moveCat(P.act.name):P.zip?'dash':'special';bs.hits.push({c,t:G.time});
  bs.hits=bs.hits.filter(h=>G.time-h.t<6);const n=bs.hits.filter(h=>h.c===c).length;
  if(n>=4&&(bs.read!==c||G.time>bs.readUntil)){bs.read=c;bs.readUntil=G.time+9;bs.hits=[];
    G.toast={t:0,dur:3,text:t.name+' IS READING YOUR '+({combo:'GROUND COMBO',sweep:'SWEEP',air:'AIR ATTACKS',launcher:'LAUNCHER',dash:'DASH ATTACKS',special:'SPECIALS'}[c]||c.toUpperCase())};
    bs.log.push('read '+c);STATS.bossReads++;}}
function startBossAtk(e,name,gb){const bs=e.bs,A=BATK[name];bs.atk=name;bs.state='tele';bs.t=0;bs.gb=!!gb;bs.last=name;
  bs.dur=Math.max(.4,A.tele*(bs.phase===1?.9:bs.phase===2?.8:1));if(name==='counter')bs.dur=A.tele;
  bs.k=-1;bs.hit=false;bs.multi=0;bs.air=false;bs.wait=0;bs.started=false;e.armor=14+bs.phase*6;e.face=sign(P.x-e.x)||e.face;if(A.start)A.start(e,bs);
  if(gb){pop(e.x,e.y-e.h-30,'GUARD BREAK','#FF2E63',26);STATS.bossGB++;}if(name==='counter')STATS.bossCounters++;bs.log.push(name+(gb?' (guard break)':''));if(bs.log.length>8)bs.log.shift();}
function bossAI(e,dt,dx,dy){
  const d=EDEF.boss;if(!e.bs)initBoss(e);const bs=e.bs,def=BOSSDEF[e.cosId]||BOSSDEF.oni_brute;
  if(!bs.intro&&e.onGround){bs.intro=true;G.banner=null;G.freeze=Math.max(G.freeze,1.5);G.bossCard={t:0,dur:2,name:e.name,jp:def.jp};sfx('super');shake(10);}
  const dec=Math.exp(-dt/6);bs.gsum=bs.gsum*dec+(P.guard?dt:0);bs.tsum=bs.tsum*dec+dt;const gfrac=bs.gsum/bs.tsum;
  bs.ccd-=dt;
  const ph=e.pct>=120?2:e.pct>=60?1:0;
  if(ph>bs.phase&&bs.state!=='tele'&&bs.state!=='act'){bs.phase=ph;bs.state='roar';bs.t=0;bs.dur=.9;e.armor=40;e.vx=0;shake(10);sfx('super');ring(e.x,e.y-e.h/2,220,'#FF2E63',.6);
    G.banner={t:0,dur:1.6,text:'PHASE '+(ph+1),sub:(ph===1?'Enraged! ':'Desperate! ')+'New move: '+def.newMove[ph],small:true};bs.log.push('phase '+(ph+1));}
  if(bs.state!=='act')bs.t+=dt;
  if(bs.state==='roar'){e.wind=.1;if(bs.t>=bs.dur){bs.state='walk';bs.cd=.4;e.armor=0;e.wind=0;}return;}
  if(bs.state==='tele'){const A=BATK[bs.atk];e.wind=Math.max(.05,bs.dur-bs.t);if(e.onGround)e.vx=approach(e.vx,0,1600*dt);if(A.aim)A.aim(e,bs);
    if(bs.t>=bs.dur){bs.state='act';bs.t=0;bs.started=false;bs.wait=0;e.wind=0;}return;}
  if(bs.state==='act'){const A=BATK[bs.atk];if(bs.wait>0){bs.wait-=dt;e.wind=Math.max(.05,bs.wait);return;}bs.f0=!bs.started;bs.started=true;const done=A.act(e,bs);bs.t+=dt;if(done){if(A.end)A.end(e);bs.state='rec';bs.t=0;bs.dur=A.rec*(bs.phase===2?.85:1);e.armor=0;e.spin=0;}return;}
  if(bs.state==='rec'){if(e.onGround)e.vx=approach(e.vx,0,1600*dt);if(bs.t>=bs.dur){bs.state='walk';bs.t=0;bs.cd=Math.max(.25,.6-.12*bs.phase);}return;}
  /* walk: approach, perceive, choose */
  const ad=Math.abs(dx);bs.cd-=dt;
  walkAI(e,ad<85?0:sign(dx),d.speed*(1+.15*bs.phase));e.face=sign(dx)||e.face;
  if(bs.read&&G.time<bs.readUntil&&bs.ccd<=0&&e.spawnT<=0){const kinds=CATKINDS[bs.read]||['attack'];const v=seenNew(e,kinds,.35);
    if(v&&ad<170&&Math.abs(dy)<90&&(bs.read!=='air'||v.air)){e.lastSeen=v;bs.ccd=2.2;startBossAtk(e,'counter');pop(e.x,e.y-e.h-14,'READ!','#7FE7FF',26);return;}}
  if(bs.cd<=0&&e.onGround&&e.spawnT<=0&&G.freeze<=0){
    const opts=def.phases[bs.phase];const gbWant=gfrac>.45;
    const cands=opts.map(n=>{const A=BATK[n];let s=ad>=A.range[0]&&ad<=A.range[1]?1:.15;if(n===bs.last)s*=.35;if(gbWant&&A.melee)s*=1.6;s+=Math.random()*.25;return [n,Math.round(s*100)/100];});
    let best=cands[0];cands.forEach(c=>{if(c[1]>best[1])best=c;});
    e.dbg={pers:'boss',state:'phase '+(bs.phase+1)+(bs.read&&G.time<bs.readUntil?' · reading '+bs.read:'')+' · guard '+Math.round(gfrac*100)+'%',cands,pick:best[0],react:e.react};
    startBossAtk(e,best[0],gbWant&&BATK[best[0]].melee);
  }
}
function bossDefeated(f){
  STATS.bosses++;G.slowT=Math.max(G.slowT,1.2);G.flash=.15;shake(16);
  for(let i=0;i<3;i++)fx.push({kind:'ring',x:f.x,y:f.y-40,t:-i*.12,dur:.7,color:i%2?'#FFE14D':'#FF2E63',r:260+i*60});
  G.banner={t:0,dur:2.2,text:'BOSS DEFEATED!',sub:f.name+' is back in the rift'};
  ann('bossKO',{boss:f.name},3);
}
