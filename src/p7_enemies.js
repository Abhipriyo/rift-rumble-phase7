/* ================= PHASE 7: the five art-pack enemies (references 09-13) ================= */
/* Each new enemy takes an existing combat role (so the adaptive AI, personalities and waves keep working)
   and adds its own stats and one behaviour of its own. */
const NEWEN={
  minion:{name:'Rift Minion',id:'rift_minion',role:'grunt',o:{w:28,h:54},from:3,p:.3,dmg:.6,weight:.72,spd:1.3,pack:true,score:60,
    desc:'Small, fast and fragile. Arrives in pairs.'},
  ronin:{name:'Elite Ronin',id:'elite_ronin',role:'grunt',o:{w:34,h:84},from:6,p:.22,dmg:1.35,weight:1.25,spd:1.1,parry:.35,reach:26,score:180,
    desc:'Parries close attacks and has a long katana reach.'},
  drone:{name:'Aerial Drone',id:'aerial_drone',role:'shooter',o:{w:40,h:40,fly:true},from:4,p:.4,dmg:.85,weight:.8,spd:1,score:90,shot:['ray','#FF2E4D'],
    desc:'Hovers out of reach and fires red lasers.'},
  corrupt:{name:'Corrupted Hero',id:'corrupted_hero',role:'heavy',o:{w:34,h:84},from:7,p:.35,dmg:1,weight:1.1,spd:1.7,rdash:true,score:260,
    desc:'A fallen hero. Telegraphs, then rift-dashes straight through you.'}
};
const LORD_PAIR=['RIFT LORD','rift_lord',{w:96,h:150}];
const BOSS_PAIRS={oni_brute:['ONI BRUTE','oni_brute'],rift_beast:['RIFT BEAST','rift_beast'],mecha_sentinel:['MECHA SENTINEL','mecha_sentinel',{h:110}],rift_lord:LORD_PAIR};
ENEMY_SHOT.aerial_drone=['ray','#FF2E4D'];ENEMY_SHOT.rift_lord=['eki','#FF2FB4'];ENEMY_SHOT.corrupted_hero=['eki','#FF3BD4'];

BOSSDEF.rift_lord={jp:'リフトの王',phases:[['riftSlash','voidRain','summon'],['riftSlash','voidRain','summon','riftBeam'],['riftSlash','riftBeam','voidRain','teleSlam']],newMove:['','RIFT BEAM','RIFT DESCENT']};
Object.assign(BATK,{
  riftSlash:{n:'RIFT SLASH',tele:.6,rec:.75,range:[0,300],melee:1,
    act(e,bs){if(bs.f0){e.vx=e.face*760;e.punchT=.3;sfx('swingH');bs.hit=false;}
      if(!bs.hit&&inBox(e.x-e.face*20,e.x+e.face*170,e.y-150,e.y)){bs.hit=true;bossHit(e,{dm:1.1,base:350,ang:40});}
      if(bs.t>.18)e.vx=approach(e.vx,0,5000*(1/120));
      if(bs.t<.26&&Math.random()<.8)fx7.push({k:'arc',x:e.x+e.face*60,y:e.y-80,face:e.face,t:0,dur:.22,col:'#FF2FB4'});
      return bs.t>.3;},
    draw(c,e,p){const x=e.face>0?e.x:e.x-300;c.fillStyle='rgba(255,47,180,'+(.1+.25*p)+')';c.fillRect(x,e.y-150,300,150);c.strokeStyle='rgba(255,47,180,.85)';c.lineWidth=2;c.strokeRect(x,e.y-150,300,150);}},
  voidRain:{n:'VOID RAIN',tele:.7,rec:.9,range:[0,900],
    start(e,bs){bs.xs=[];const n=4+bs.phase;for(let i=0;i<n;i++)bs.xs.push(clamp(P.x+(i-(n-1)/2)*105+rnd(-20,20),plats[0].x1-40,plats[0].x2+40));},
    act(e,bs){if(bs.f0){e.punchT=.25;sfx('blast');bs.xs.forEach((x,i)=>projs.push({team:'enemy',x,y:cam.y-VH/2/cam.z-60-i*36,vx:0,vy:820,r:13,dmg:EDEF.boss.dmg*e.dmgMul*.55,kb:270,scale:2.4,life:2.4,color:'#FF2FB4',kind:'eki',spin:0,attacker:e}));}return bs.t>.25;},
    draw(c,e,p,bs){(bs.xs||[]).forEach(x=>{c.fillStyle='rgba(255,47,180,'+(.12+.3*p)+')';c.fillRect(x-13,-200,26,plats[0].y+200);c.strokeStyle='rgba(255,47,180,.8)';c.lineWidth=2;c.beginPath();c.ellipse(x,plats[0].y,22,6,0,0,Math.PI*2);c.stroke();});}},
  summon:{n:'RIFT SUMMON',tele:.5,rec:.7,range:[0,900],
    act(e,bs){if(bs.f0){const have=enemies.filter(x=>x.kind7==='minion'&&x.alive).length;const n=Math.max(0,Math.min(2,3-have));
        for(let i=0;i<n;i++){const m=makeNew('minion',e.x+(i?-90:90),e.y-60);m.spawnT=.5;enemies.push(m);ring(m.x,m.y-20,90,'#FF4FD8',.4);}
        sfx('zap');pop(e.x,e.y-e.h-20,n?'RISE, MINIONS!':'...','#FF4FD8',26);e.punchT=.3;}return bs.t>.3;},
    draw(c,e,p){c.strokeStyle='rgba(255,79,216,'+(.3+.6*p)+')';c.lineWidth=3;[-90,90].forEach(dx=>{c.beginPath();c.ellipse(e.x+dx,e.y,40*p+10,10,0,0,Math.PI*2);c.stroke();});}},
  riftBeam:{n:'RIFT BEAM',tele:.85,rec:1,range:[0,900],
    start(e,bs){bs.by=e.y-e.h*.55;},
    aim(e,bs){e.face=sign(P.x-e.x)||e.face;},
    act(e,bs){if(bs.f0){sfx('zap');shake(9);bs.hit=false;}
      if(!bs.hit&&P.alive&&Math.abs((P.y-P.h/2)-bs.by)<44&&sign(P.x-e.x)===e.face){bs.hit=true;bossHit(e,{dm:1.25,base:380,ang:25});}
      fx7.push({k:'beam',x:e.x+e.face*40,y:bs.by,face:e.face,t:0,dur:.06,w:1});return bs.t>.5;},
    draw(c,e,p,bs){c.strokeStyle='rgba(255,47,180,'+(.4+.5*p)+')';c.lineWidth=2+6*p;c.setLineDash([14,10]);c.beginPath();c.moveTo(e.x+e.face*40,bs.by);c.lineTo(e.x+e.face*1400,bs.by);c.stroke();c.setLineDash([]);}},
  teleSlam:{n:'RIFT DESCENT',tele:.55,rec:.9,range:[0,900],melee:1,
    start(e,bs){bs.tx=clamp(P.x,plats[0].x1+40,plats[0].x2-40);},
    act(e,bs){if(bs.f0){ring(e.x,e.y-60,120,'#FF2FB4',.3);e.x=bs.tx;e.y=Math.min(P.y-320,40);e.vy=1300;e.vx=0;e.onGround=false;bs.air=true;sfx('whoosh');}
      if(bs.air&&bs.t>.05&&e.onGround){bs.air=false;shake(14);ring(e.x,e.y,240,'#FF2FB4',.5);sparks(e.x,e.y,26,'#FF9AE0',420);sfx('boom');
        if(P.alive&&Math.abs(P.x-e.x)<230&&Math.abs(P.y-e.y)<60)bossHit(e,{base:360,scale:3.3,ang:70,dir:sign(P.x-e.x)||1});return true;}
      return bs.t>2.4;},
    draw(c,e,p,bs){c.strokeStyle='rgba(255,47,180,'+(.4+.5*p)+')';c.lineWidth=3;c.beginPath();c.ellipse(bs.tx,plats[0].y,230*(.4+.6*p),18,0,0,Math.PI*2);c.stroke();}}
});

/* Aerial Drone: drawn directly (a rigid hovering machine needs no skeleton) */
CUSTOM.aerial_drone=function(c,f,t){
  const sil=typeof OVR!=='undefined'&&OVR;const cy=-20,r=17,spin=t*1.4+(f.id||0);const charge=f.wind>0?1:0;
  c.save();c.translate(0,cy+Math.sin(t*3+(f.id||0))*2);
  if(!sil){c.save();c.globalCompositeOperation='lighter';const fl=.6+.4*Math.sin(t*30);const g=c.createLinearGradient(0,r*.6,0,r*2.2);g.addColorStop(0,'rgba(255,90,60,'+.8*fl+')');g.addColorStop(1,'rgba(255,46,77,0)');
    c.fillStyle=g;c.beginPath();c.moveTo(-5,r*.6);c.lineTo(5,r*.6);c.lineTo(0,r*2.2+fl*4);c.closePath();c.fill();c.restore();}
  /* isometric cube: three visible faces, rotating */
  const k=Math.cos(spin)*.35;const pts=[[0,-r],[r*.9,-r*.45+k*4],[r*.9,r*.5+k*4],[0,r],[-r*.9,r*.5-k*4],[-r*.9,-r*.45-k*4]];
  const poly=(arr,fill)=>{c.beginPath();arr.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=fill;c.fill();};
  c.lineJoin='round';
  c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.lineWidth=5;c.strokeStyle=sil||'#160A24';c.stroke();
  if(sil){c.fillStyle=sil;c.fill();c.restore();return;}
  poly([pts[0],pts[1],[0,k*6],pts[5]],'#4A3A5E');poly([pts[5],[0,k*6],pts[3],pts[4]],'#241A33');poly([[0,k*6],pts[1],pts[2],pts[3]],'#33264A');
  c.strokeStyle='#7A6A96';c.lineWidth=1;c.beginPath();c.moveTo(pts[5][0],pts[5][1]);c.lineTo(0,k*6);c.lineTo(pts[1][0],pts[1][1]);c.moveTo(0,k*6);c.lineTo(pts[3][0],pts[3][1]);c.stroke();
  c.save();c.shadowColor='#FF2E4D';c.shadowBlur=8;c.strokeStyle='#FF2E4D';c.lineWidth=1.2;c.beginPath();c.moveTo(-r*.7,-r*.1);c.lineTo(-r*.3,r*.3);c.lineTo(-r*.5,r*.6);c.moveTo(r*.6,-r*.2);c.lineTo(r*.4,r*.2);c.stroke();c.restore();
  /* red eye */
  const er=6+charge*2.5+(f.flash>0?2:0);const eg=c.createRadialGradient(r*.35,0,0,r*.35,0,er*2.2);eg.addColorStop(0,'#FFFFFF');eg.addColorStop(.25,f.flash>0?'#FFFFFF':'#FF6A6A');eg.addColorStop(.55,'rgba(255,30,60,.85)');eg.addColorStop(1,'rgba(255,30,60,0)');
  c.fillStyle=eg;c.beginPath();c.arc(r*.35,0,er*2.2,0,Math.PI*2);c.fill();
  c.fillStyle='#160A24';c.beginPath();c.arc(r*.35,0,er*.55,0,Math.PI*2);c.lineWidth=1.4;c.strokeStyle='#160A24';c.stroke();
  c.fillStyle='#FFD0D0';c.beginPath();c.arc(r*.35+1.5,-1.5,1.4,0,Math.PI*2);c.fill();
  /* orbiting shards */
  for(let i=0;i<3;i++){const a=spin*1.6+i*2.1;const x=Math.cos(a)*(r+9),y=Math.sin(a)*(r*.5+4);c.save();c.translate(x,y);c.rotate(a*2);c.fillStyle=i%2?'#3A2A4E':'#FF2E4D';c.globalAlpha=y<0?.6:1;
    c.beginPath();c.moveTo(0,-3.4);c.lineTo(2.4,0);c.lineTo(0,3.4);c.lineTo(-2.4,0);c.closePath();c.fill();c.restore();}
  c.restore();
};

/* build one of the new enemies (or a forced boss) by borrowing a role slot for the duration of makeEnemy */
function withPair(role,pair,fn){const u=UNIS[G.uni];const keep=u.enemies[role];u.enemies[role]=pair;try{return fn();}finally{u.enemies[role]=keep;}}
function makeNew(kind,x,y){const N=NEWEN[kind];const e=withPair(N.role,[N.name,N.id,N.o],()=>_mkE7(N.role,x,y));
  e.kind7=kind;e.dmgMul*=N.dmg;e.weight*=N.weight;e.spdMul=N.spd;e.score7=N.score;if(N.reach)e.reachAdd=N.reach;
  if(kind==='drone'){e.custom=CUSTOM.aerial_drone;e.artId=null;}
  if(N.shot){e.shotKind=N.shot[0];e.shotColor=N.shot[1];}
  if(kind==='corrupt'){e.rdCd=rnd(1.5,3);e.auraColor='#FF3BD4';}
  return e;}
const _mkE7=makeEnemy;
makeEnemy=function(role,x,y){
  if(G.force7&&G.force7[role]){const pair=G.force7[role];delete G.force7[role];
    const e=withPair(role,pair,()=>_mkE7(role,x,y));if(pair[1]==='rift_lord'){e.weight*=1.25;e.kind7='lord';e.auraColor='#FF2FB4';}return e;}
  if(role==='boss'&&G.mode==='endless'&&G.wave>0&&G.wave%20===0)return lord7(x,y);
  if(G.mode!=='echo'&&role!=='boss'&&role!=='clone'){
    const opts=Object.keys(NEWEN).filter(k=>NEWEN[k].role===role&&G.wave>=NEWEN[k].from&&!(G.chal&&G.chal.noNew));
    for(const k of opts){if(Math.random()<NEWEN[k].p)return makeNew(k,x,y);}
  }
  return _mkE7(role,x,y);
};
function lord7(x,y){G.force7=Object.assign(G.force7||{},{boss:LORD_PAIR});return makeEnemy('boss',x,y);}

/* pairs of minions; first sighting of each new enemy is announced once per run */
const _spawn7=spawnEnemy;
spawnEnemy=function(role){_spawn7(role);const e=enemies[enemies.length-1];if(!e)return;
  if(e.kind7&&!(G.seen7||(G.seen7={}))[e.kind7]){G.seen7[e.kind7]=1;const N=NEWEN[e.kind7];if(N)G.toast={t:0,dur:3,text:'NEW ENEMY: '+N.name.toUpperCase()+' · '+N.desc};}
  if(e.kind7==='minion'&&NEWEN.minion.pack&&enemies.length<4+Math.floor(G.wave/4)+1){const m=makeNew('minion',clamp(e.x+(e.x<480?70:-70),200,760),e.y);m.face=e.face;enemies.push(m);}
};
/* per-enemy speed */
const _walk7=walkAI;walkAI=function(e,dir,speed){return _walk7(e,dir,speed*(e.spdMul||1));};
/* katana reach */
const _strike7=enemyStrike;enemyStrike=function(e){const w=e.w;if(e.reachAdd)e.w+=e.reachAdd*2;try{return _strike7(e);}finally{e.w=w;}};
/* Elite Ronin parry: reads close attacks */
const _qa7=queueAttack;queueAttack=function(ax,ay){_qa7(ax,ay);
  enemies.forEach(e=>{if(e.kind7!=='ronin'||e.stun>0||e.wind>0||e.blockT>0||e.parryCd>G.time)return;
    if(Math.abs(e.x-P.x)<120&&Math.abs(e.y-P.y)<80&&Math.random()<NEWEN.ronin.parry){e.blockT=.4;e.parryCd=G.time+1.4;e.face=sign(P.x-e.x)||1;pop(e.x,e.y-e.h-16,'PARRY','#FF8A6A',22);}});};
/* Corrupted Hero rift dash */
const _ue7=updateEnemy;
updateEnemy=function(e,dt){
  if(e.kind7==='corrupt'&&e.alive){
    if(e.rd>0){e.rd-=dt;e.vx=e.face*980;e.vy=Math.min(e.vy,0);if(Math.random()<.7)e.trail.push(snap(e));
      if(!e.rdHit&&P.alive&&overlap(rect(e),rect(P))){e.rdHit=true;applyHit(P,{dmg:EDEF.heavy.dmg*e.dmgMul*1.1,base:300,scale:2.8,ang:35,dir:e.face,src:'enemy',attacker:e});}
      if(e.rd<=0||e.stun>0){e.rd=0;e.vx*=.3;e.rdCd=rnd(2.6,4);}
      physics(e,dt);return;}
    if(e.rt>0){e.rt-=dt;e.wind=Math.max(.05,e.rt);e.vx=approach(e.vx,0,1600*dt);if(e.stun>0){e.rt=0;e.wind=0;}
      else if(e.rt<=0){e.wind=0;e.rd=.3;e.rdHit=false;sfx('whoosh');}physics(e,dt);return;}
    e.rdCd-=dt;
    if(e.rdCd<=0&&e.onGround&&e.stun<=0&&e.spawnT<=0&&P.alive&&Math.abs(P.y-e.y)<60){const ad=Math.abs(P.x-e.x);
      if(ad>110&&ad<420){e.face=sign(P.x-e.x)||1;e.rt=.38;pop(e.x,e.y-e.h-16,'RIFT DASH','#FF3BD4',24);sfx('warn');}}
  }
  return _ue7(e,dt);
};
/* new enemies give their own KO score bonus on top of the role base */
const _ko7=koFighter;koFighter=function(f){const before=G.score;_ko7(f);if(f.team==='enemy'&&f.score7)addScore(f.score7);};
