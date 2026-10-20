function cloneAI(e,dt,dx,dy){
  const H=HEROES[G.hero];
  e.decT-=dt;e.specCd-=dt;e.dashCd-=dt;e.castT=Math.max(0,(e.castT||0)-dt);
  if(!P.alive){e.vx=approach(e.vx,0,900*dt);return;}
  if(e.act){const a=e.act,d=a.def;a.t+=dt;if(e.onGround)e.vx=approach(e.vx,0,2000*dt);
    if(a.t>=d.act[0]&&a.t<=d.act[1]&&!a.hit.has(P.id)&&overlap(moveBox(e,d),rect(P))){a.hit.add(P.id);
      applyHit(P,{dmg:d.dmg*e.dmgMul,base:d.base,scale:d.scale,ang:d.ang,dir:e.face,src:'enemy',attacker:e});}
    if(a.t>=d.dur){e.lastMove=a.name;e.lastEnd=G.time;e.act=null;}return;}
  if(e.dashT>0){e.dashT-=dt;e.vx=e.dashDir*600;if(Math.random()<.5)e.trail.push(snap(e));return;}
  if(e.decT<=0&&e.spawnT<=0){
    e.decT=.14;const x=feats(e,P,'hero');const p=CLONE.forward(x);
    let s=0;const q=Array.from(p,v=>{const w=Math.pow(v,1.6);s+=w;return w;});let r=Math.random()*s,a=0;for(;a<NO-1;a++){r-=q[a];if(r<=0)break;}
    e.intent=a;e.intentP=p[a];e.face=sign(dx)||e.face;const nm=CA[a];
    if(CLONE.duel.on)CLONE.duel.clone[a]++;
    const top=Array.from(p,(v,i)=>[CA_LBL[i],Math.round(v*100)/100]).sort((u,w)=>w[1]-u[1]).slice(0,4);
    e.dbg={pers:'clone',state:'network policy',cands:top,pick:CA_LBL[a],inputs:x.map(v=>Math.round(v*100)/100),react:.14};
    if(nm==='jump'&&(e.onGround||e.jumps>0)){e.vy=-H.stats.jump*(e.onGround?1:.92);if(!e.onGround)e.jumps--;e.onGround=false;}
    else if(nm==='attack'||nm==='launch'){
      const prev=G.time-e.lastEnd<.4&&e.lastMove?MOVES[e.lastMove]:null;let n;
      if(nm==='launch')n=e.onGround?'launch':'airUp';else if(e.onGround)n=prev&&prev.next&&!prev.air?prev.next:'jab1';else n=prev&&prev.next&&prev.air?prev.next:'air1';
      const md=MOVES[n];e.act={name:n,def:md,t:0,hit:new Set()};e.handTrail=[];if(md.lunge)e.vx=e.face*md.lunge*.8;if(md.air&&!e.onGround)e.vy=Math.min(e.vy,-140);sfx('whoosh');}
    else if(nm==='special'&&e.specCd<=0){e.specCd=1.1;e.castT=.22;const sp=H.special;const kind=sp.kind==='star'||sp.kind==='petal'?sp.kind:'ki';
      projs.push({team:'enemy',x:e.x+e.face*24,y:e.y-44,vx:e.face*560,vy:0,r:11,dmg:6*e.dmgMul,kb:230,scale:2.4,life:1.5,color:sp.color,kind,spin:0,attacker:e});sfx('blast');}
    else if((nm==='dashT'||nm==='dashA')&&e.dashCd<=0){e.dashDir=(nm==='dashT'?1:-1)*(sign(dx)||1);e.dashT=.17;e.dashCd=.7;e.inv=.12;sfx('whoosh');}
    else if(nm==='guard')e.blockT=.35;
  }
  const nm=CA[e.intent||0],spd=H.stats.speed*.9;
  if(nm==='toward'&&Math.abs(dx)>30)walkAI(e,sign(dx),spd);
  else if(nm==='away')walkAI(e,-sign(dx)||1,spd);
  else if(e.onGround)e.vx=approach(e.vx,0,2400*dt);
  e.face=sign(dx)||e.face;
}

