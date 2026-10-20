/* ================= PHASE 7: arena mechanics ================= */
/* Ki: energy zones · Shinobi: shadow zones · Caped: destructible objects · Mighty: low-gravity areas */
const ARENA7={
  ki:{n:'ENERGY ZONES',d:'Stand in a glowing energy zone: +15% damage and your super meter fills. Enemies inside hit harder too. Zones move every 12 s.'},
  sh:{n:'SHADOW ZONES',d:'Inside a shadow zone enemies lose track of you and casters hold fire. Your first strike from the shadows is a 1.5× ambush.'},
  cape:{n:'DESTRUCTIBLES',d:'Smash crates and hazard barrels: they burst into the enemies around them and can drop a health or meter pickup.'},
  mighty:{n:'LOW GRAVITY',d:'Two low-gravity columns: everyone inside falls at 40% gravity. Jump higher, juggle longer, but enemies float too.'},
  st:null,
  reset(){const u=G.uni;const S=this.st={u,t:0,zones:[],props:[],picks:[],next:12,warn:0};
    if(u==='ki'){S.anchors=[[300,0],[660,0],[480,3],[220,1],[740,2]];S.zones=[this.kiZone(0),this.kiZone(1)];}
    if(u==='sh')S.zones=[{x1:180,x2:320,y1:205,y2:418},{x1:640,x2:780,y1:205,y2:418}];
    if(u==='mighty')S.zones=[{x1:95,x2:265,y1:-400,y2:900},{x1:695,x2:865,y1:-400,y2:900}];
    if(u==='cape')S.props=[{id:'prop0',x:262,pl:0,type:'crate'},{id:'prop1',x:700,pl:0,type:'barrel'},{id:'prop2',x:480,pl:3,type:'crate'}].map(o=>Object.assign(o,{hp:o.type==='barrel'?12:18,max:o.type==='barrel'?12:18,dead:0,shake:0}));
    G.hidden7=false;G.amb7=false;},
  kiZone(i){const a=this.st.anchors[i%this.st.anchors.length];return {ai:i%this.st.anchors.length,x:a[0],pl:a[1],r:70,on:1};}
};
const platOf=i=>plats[i]||plats[0];
function kiZonePos(z){const p=platOf(z.pl);let x=z.x;if(p.move){const w=p.x2-p.x1;x=p.x1+w/2;}return {x,y:p.y,p};}
function inKi7(f){const S=ARENA7.st;if(!S||S.u!=='ki'||!f)return false;
  return S.zones.some(z=>{if(!z.on)return false;const q=kiZonePos(z);return Math.abs(f.x-q.x)<z.r&&f.y<=q.y+4&&f.y>q.y-110&&(f.onGround?f.plat===q.p:true);});}
function inShadow7(f){const S=ARENA7.st;if(!S||S.u!=='sh'||!f)return false;return S.zones.some(z=>f.x>z.x1&&f.x<z.x2&&f.y>z.y1&&f.y<z.y2);}
function arenaGrav7(f){const S=ARENA7.st;if(!S||S.u!=='mighty')return 1;const cy=f.y-(f.h||78)/2;return S.zones.some(z=>f.x>z.x1&&f.x<z.x2&&cy>z.y1&&cy<z.y2)?.4:1;}
function arenaSpd7(p){return 1;}
function arenaDealt7(t,h,info){const S=ARENA7.st;if(!S||!P)return;
  if(S.u==='ki'&&inKi7(P)){h.dmg*=1.15;h.ki7=1;}
  if(S.u==='sh'&&info.melee&&(G.hidden7||G.time-(G.leftShadow7||-9)<.5)&&!G.amb7){G.amb7=true;h.dmg*=1.5;h.base*=1.2;h.amb7=1;pop(t.x,t.y-t.h-24,'AMBUSH!','#B57CFF',30);}}
function arenaTaken7(h){const S=ARENA7.st;if(!S)return;if(S.u==='ki'&&h.attacker&&inKi7(h.attacker))h.dmg*=1.15;}
function propRect(o){const p=platOf(o.pl),w=o.type==='barrel'?34:44,hh=o.type==='barrel'?46:40;return {x1:o.x-w/2,x2:o.x+w/2,y1:p.y-hh,y2:p.y};}
function hitProp7(o,dmg,dir){if(o.dead)return;o.hp-=dmg;o.shake=.18;o.dir=dir||1;sparks(o.x,platOf(o.pl).y-20,5,'#FFE6B3',200);sfx('block');if(o.hp<=0)breakProp7(o);}
function breakProp7(o){const S=ARENA7.st;o.dead=12;const p=platOf(o.pl);const y=p.y-22;const big=o.type==='barrel';
  ring(o.x,y,big?190:140,big?'#FF8A3D':'#FFE6B3',.4);shake(big?12:7);sfx(big?'boom':'heavy');pop(o.x,y-40,big?'KA-BOOM!':'CRASH!','#FFE14D',big?38:30);
  for(let i=0;i<(big?26:18);i++)parts.push({x:o.x+rnd(-14,14),y:y+rnd(-14,14),vx:rnd(-420,420),vy:rnd(-620,-120),life:rnd(.5,.9),max:.9,r:rnd(3,6),color:big?pick(['#FF8A3D','#FFE14D','#5E6278']):pick(['#B07A45','#8A5A2E','#C9CEDB']),g:1400});
  fx7.push({k:'flare',x:o.x,y,t:0,dur:.3,col:big?'#FF8A3D':'#FFE6B3',r:big?150:90});
  nearEn(o.x,y,big?190:150).forEach(e=>heroHit7(e,{dmg:big?10:8,base:big?360:300,scale:2.6,ang:55,dir:sign(e.x-o.x)||1,heavy:true,light:false,color:'#FFB84D'}));
  if(P&&P.alive&&big&&Math.hypot(P.x-o.x,P.y-20-y)<120&&P.inv<=0){P.pct+=4;P.vy=-420;P.vx=(sign(P.x-o.x)||1)*260;}
  if(Math.random()<.55)S.picks.push({x:o.x,y:p.y-14,kind:Math.random()<.5?'heal':'meter',t:9,pl:o.pl});
  STATS.props7=(STATS.props7||0)+1;}
function arenaTick7(dt){const S=ARENA7.st;if(!S||!P)return;S.t+=dt;
  if(S.u==='ki'){if(inKi7(P)&&P.alive){P.meter=Math.min(200,P.meter+12*dt);if(Math.random()<.4)parts.push({x:P.x+rnd(-18,18),y:P.y-rnd(0,60),vx:0,vy:-rnd(80,160),life:.4,max:.4,r:rnd(2,3.5),color:'#FFE14D',g:0});}
    S.next-=dt;S.warn=S.next<1.5?1:0;
    if(S.next<=0){S.next=12;const used=new Set(S.zones.map(z=>z.ai));const free=S.anchors.map((a,i)=>i).filter(i=>!used.has(i));
      const zi=Math.floor(Math.random()*2),ni=pick(free);S.zones[zi]=Object.assign(ARENA7.kiZone(ni),{born:G.time});const q=kiZonePos(S.zones[zi]);ring(q.x,q.y,90,'#FFE14D',.4);}}
  if(S.u==='sh'){const h=inShadow7(P)&&P.alive;if(G.hidden7&&!h)G.leftShadow7=G.time;if(h&&!G.hidden7)G.amb7=false;G.hidden7=h;}
  if(S.u==='cape'){
    S.props.forEach(o=>{if(o.dead>0){o.dead-=dt;if(o.dead<=0){o.dead=0;o.hp=o.max;ring(o.x,platOf(o.pl).y-20,60,'#7FE7FF',.3);}return;}o.shake=Math.max(0,o.shake-dt);
      const r=propRect(o);
      if(P.act){const a=P.act,d=a.def;if(a.t>=d.act[0]&&a.t<=d.act[1]&&!a.hit.has(o.id)&&overlap(moveBox(P,d),r)){a.hit.add(o.id);hitProp7(o,d.dmg*heroDmgMul()*(d.heavy?1.6:1),P.face);}}
      for(const q of projs){if(q.team!=='hero'||q.dead||q.hit.has(o.id))continue;if(q.x+q.r>r.x1&&q.x-q.r<r.x2&&q.y+q.r>r.y1&&q.y-q.r<r.y2){q.hit.add(o.id);hitProp7(o,q.dmg*1.5,sign(q.vx));if(!q.pierce)q.dead=true;}}
      for(const e of enemies){if(e.stun>0&&Math.hypot(e.vx,e.vy)>520&&overlap(rect(e),r)){hitProp7(o,99,sign(e.vx));e.vx*=.6;break;}}});
    S.picks.forEach(k=>{k.t-=dt;if(P.alive&&Math.abs(P.x-k.x)<34&&Math.abs(P.y-k.y)<50){k.t=0;if(k.kind==='heal'){P.pct=Math.max(0,P.pct-15);pop(P.x,P.y-P.h-20,'-15%','#7DFF8A',28);}else{P.meter=Math.min(200,P.meter+50);pop(P.x,P.y-P.h-20,'+METER','#FFE14D',26);}sfx('medal');}});
    S.picks=S.picks.filter(k=>k.t>0);}
}
/* enemies lose track of a hidden player */
const _seen7=seen;seen=function(e,kinds,win){if(!G.hidden7)return _seen7(e,kinds,win);const r=e.react;e.react=r+.25;try{return _seen7(e,kinds,win);}finally{e.react=r;}};
const _zf7=zonerFire;zonerFire=function(e){if(G.hidden7){pop(e.x,e.y-e.h-12,'?','#B57CFF',26);e.cd=Math.max(e.cd,.6);return;}return _zf7(e);};
const _ue7b=updateEnemy;
updateEnemy=function(e,dt){
  if(G.hidden7&&e.alive&&e.role!=='boss'&&e.role!=='clone'&&!e.fly&&e.stun<=0&&e.wind<=0&&e.charging<=0&&!(e.rd>0)&&!(e.rt>0)&&e.onGround&&P&&Math.abs(P.x-e.x)>110){
    e.lost7=(e.lost7||0)+dt;e.vx=approach(e.vx,Math.sin(G.time*1.3+e.id)*60,600*dt);e.mood='idle';e.cd=Math.max(e.cd,.3);if(e.lost7>.25&&!e.qm7){e.qm7=1;pop(e.x,e.y-e.h-16,'?','#B57CFF',26);}
    physics(e,dt);return;}
  e.lost7=0;e.qm7=0;return _ue7b(e,dt);
};

/* ---------- drawing ---------- */
function drawArena7Back(c,t){const S=ARENA7.st;if(!S)return;
  if(S.u==='ki')S.zones.forEach(z=>{const q=kiZonePos(z);const fade=Math.min(1,(G.time-(z.born||-9))/.6);const warn=S.warn&&Math.floor(t*8)%2?.4:1;const a=fade*warn;
    c.save();c.globalCompositeOperation='lighter';
    const g=c.createLinearGradient(0,q.y-120,0,q.y);g.addColorStop(0,'rgba(255,225,77,0)');g.addColorStop(1,'rgba(255,200,60,'+(.32*a)+')');c.fillStyle=g;c.fillRect(q.x-z.r,q.y-120,z.r*2,120);
    c.globalAlpha=a;c.strokeStyle='#FFE14D';c.lineWidth=3;c.beginPath();c.ellipse(q.x,q.y,z.r,12,0,0,Math.PI*2);c.stroke();
    c.lineWidth=1.5;c.beginPath();c.ellipse(q.x,q.y,z.r*(.55+.15*Math.sin(t*4)),7,0,0,Math.PI*2);c.stroke();
    for(let i=0;i<6;i++){const ph=(t*.6+i/6)%1;c.globalAlpha=a*(1-ph);c.fillStyle='#FFF3A0';c.beginPath();c.arc(q.x+Math.sin(i*2.4+t)*z.r*.7,q.y-ph*110,2.4,0,Math.PI*2);c.fill();}
    c.restore();
    c.save();c.globalAlpha=.55*a;c.font='22px "Noto Sans JP", sans-serif';c.textAlign='center';c.fillStyle='#FFE14D';c.fillText('気',q.x,q.y-128+Math.sin(t*2)*4);c.restore();});
  if(S.u==='mighty')S.zones.forEach((z,i)=>{c.save();c.globalCompositeOperation='lighter';const w=z.x2-z.x1;
    const g=c.createLinearGradient(z.x1,0,z.x2,0);g.addColorStop(0,'rgba(127,231,255,0)');g.addColorStop(.5,'rgba(127,231,255,.16)');g.addColorStop(1,'rgba(127,231,255,0)');c.fillStyle=g;c.fillRect(z.x1,-300,w,1000);
    c.strokeStyle='rgba(127,231,255,.35)';c.lineWidth=1.5;for(let k=0;k<5;k++){const y=430-((t*60+k*130+i*60)%650);c.beginPath();c.ellipse((z.x1+z.x2)/2,y,w*.45,8,0,0,Math.PI*2);c.stroke();}
    for(let k=0;k<10;k++){const ph=(t*.25+k/10+i*.3)%1;c.fillStyle='rgba(200,245,255,'+(.7*(1-ph))+')';c.beginPath();c.arc(z.x1+((k*37+i*13)%w),430-ph*620,1.8,0,Math.PI*2);c.fill();}
    c.strokeStyle='rgba(127,231,255,.28)';c.lineWidth=1.5;c.setLineDash([3,9]);c.beginPath();c.moveTo(z.x1,-300);c.lineTo(z.x1,700);c.moveTo(z.x2,-300);c.lineTo(z.x2,700);c.stroke();c.setLineDash([]);
    c.restore();c.save();c.font='600 12px Fredoka, sans-serif';c.textAlign='center';c.fillStyle='rgba(200,245,255,.8)';c.fillText('LOW-G',(z.x1+z.x2)/2,plats[0].y+34);c.restore();});
  if(S.u==='cape'){S.props.forEach(o=>{if(o.dead>0)return;const p=platOf(o.pl);const r=propRect(o);const sx=o.shake>0?Math.sin(o.shake*90)*3:0;const dmg=1-o.hp/o.max;
      c.save();c.translate(sx,0);c.lineWidth=3;c.strokeStyle=OUT;
      if(o.type==='crate'){rr(c,r.x1,r.y1,r.x2-r.x1,r.y2-r.y1,4);const g=c.createLinearGradient(0,r.y1,0,r.y2);g.addColorStop(0,'#C48A50');g.addColorStop(1,'#7A4E28');c.fillStyle=g;c.fill();c.stroke();
        c.strokeStyle='rgba(27,11,51,.5)';c.lineWidth=2;c.beginPath();c.moveTo(r.x1+4,r.y1+4);c.lineTo(r.x2-4,r.y2-4);c.moveTo(r.x2-4,r.y1+4);c.lineTo(r.x1+4,r.y2-4);c.stroke();
        c.fillStyle='#C9CEDB';[[r.x1,r.y1],[r.x2-8,r.y1],[r.x1,r.y2-8],[r.x2-8,r.y2-8]].forEach(([x,y])=>c.fillRect(x+1,y+1,7,7));
        c.fillStyle='#FF2E63';rr(c,(r.x1+r.x2)/2-9,r.y1+12,18,10,3);c.fill();}
      else{rr(c,r.x1,r.y1,r.x2-r.x1,r.y2-r.y1,8);const g=c.createLinearGradient(r.x1,0,r.x2,0);g.addColorStop(0,'#8E1C24');g.addColorStop(.45,'#E8443A');g.addColorStop(1,'#7A1218');c.fillStyle=g;c.fill();c.stroke();
        c.fillStyle='#FFE14D';c.fillRect(r.x1+2,r.y1+16,r.x2-r.x1-4,9);c.fillStyle=OUT;for(let x=r.x1+4;x<r.x2-4;x+=8){c.beginPath();c.moveTo(x,r.y1+25);c.lineTo(x+4,r.y1+16);c.lineTo(x+7,r.y1+16);c.lineTo(x+3,r.y1+25);c.closePath();c.fill();}
        c.save();c.globalCompositeOperation='lighter';c.fillStyle='rgba(255,138,61,'+(.25+.2*Math.sin(t*6))+')';c.beginPath();c.arc((r.x1+r.x2)/2,r.y1+6,14,0,Math.PI*2);c.fill();c.restore();}
      if(dmg>.3){c.strokeStyle='rgba(20,8,30,.8)';c.lineWidth=1.5;c.beginPath();c.moveTo(r.x1+10,r.y1+6);c.lineTo(r.x1+18,r.y1+18);c.lineTo(r.x1+12,r.y1+26);if(dmg>.6){c.moveTo(r.x2-8,r.y1+10);c.lineTo(r.x2-18,r.y1+22);}c.stroke();}
      c.restore();});
    S.picks.forEach(k=>{const b=Math.sin(t*5)*4,a=k.t<2?(Math.floor(t*10)%2?.4:1):1;c.save();c.globalAlpha=a;c.translate(k.x,k.y-14+b);
      c.globalCompositeOperation='lighter';c.fillStyle=k.kind==='heal'?'rgba(125,255,138,.35)':'rgba(255,225,77,.35)';c.beginPath();c.arc(0,0,20,0,Math.PI*2);c.fill();c.globalCompositeOperation='source-over';
      c.fillStyle=k.kind==='heal'?'#7DFF8A':'#FFE14D';c.strokeStyle=OUT;c.lineWidth=2.5;
      if(k.kind==='heal'){c.beginPath();c.rect(-4,-11,8,22);c.rect(-11,-4,22,8);c.fill();c.stroke();}else{c.beginPath();c.moveTo(3,-12);c.lineTo(-7,2);c.lineTo(0,2);c.lineTo(-3,12);c.lineTo(7,-2);c.lineTo(0,-2);c.closePath();c.fill();c.stroke();}
      c.restore();});}
  (G.turrets7||[]).forEach(q=>{c.save();c.translate(q.x,q.y);c.strokeStyle=OUT;c.lineWidth=2.5;c.fillStyle='#5E6278';c.beginPath();c.moveTo(-14,0);c.lineTo(-8,-18);c.lineTo(8,-18);c.lineTo(14,0);c.closePath();c.fill();c.stroke();
    c.save();c.translate(0,-26);c.rotate(q.a||0);c.fillStyle='#C9CEDB';rr(c,0,-4,20,8,3);c.fill();c.stroke();c.restore();c.fillStyle='#FFC93C';c.beginPath();c.arc(0,-26,8,0,Math.PI*2);c.fill();c.stroke();
    c.fillStyle=Math.floor(t*6)%2?'#FF2E63':'#7DFF8A';c.beginPath();c.arc(0,-26,2.6,0,Math.PI*2);c.fill();c.restore();});
}
function drawArena7Front(c,t){const S=ARENA7.st;if(!S)return;
  if(S.u==='sh')S.zones.forEach((z,i)=>{const w=z.x2-z.x1,h=z.y2-z.y1,cx=(z.x1+z.x2)/2;c.save();
    const g=c.createLinearGradient(0,z.y1,0,z.y2);g.addColorStop(0,'rgba(10,4,26,0)');g.addColorStop(.35,'rgba(10,4,26,.55)');g.addColorStop(1,'rgba(6,2,16,.82)');
    c.beginPath();c.moveTo(z.x1-18,z.y2);c.bezierCurveTo(z.x1-30,z.y1+h*.5,z.x1+10,z.y1+10,cx,z.y1);c.bezierCurveTo(z.x2-10,z.y1+10,z.x2+30,z.y1+h*.5,z.x2+18,z.y2);c.closePath();c.fillStyle=g;c.fill();
    c.globalCompositeOperation='lighter';c.strokeStyle='rgba(181,124,255,.35)';c.lineWidth=2;c.setLineDash([4,10]);c.lineDashOffset=-t*12;c.stroke();c.setLineDash([]);c.globalCompositeOperation='source-over';
    for(let k=0;k<5;k++){const ph=(t*.12+k*.2+i*.4)%1;c.globalAlpha=.45*Math.sin(ph*Math.PI);c.fillStyle='#2A1A48';c.beginPath();c.ellipse(z.x1+w*((k*.27+ph*.4)%1),z.y2-14-ph*h*.75,34,11,0,0,Math.PI*2);c.fill();}
    c.globalAlpha=.45+.15*Math.sin(t*2+i);c.font='20px "Noto Sans JP", sans-serif';c.textAlign='center';c.fillStyle='#B57CFF';c.fillText('影',cx,z.y1+h*.3);
    c.restore();
    if(G.hidden7&&P&&P.x>z.x1&&P.x<z.x2){c.save();c.font='600 12px Fredoka, sans-serif';c.textAlign='center';c.fillStyle='#D9B8FF';c.fillText('HIDDEN',P.x,P.y-P.h-34);c.restore();}});
  enemies.forEach(e=>{if(!e.ink||!e.alive)return;for(let i=0;i<e.ink;i++){c.fillStyle='#160A24';c.strokeStyle='#C9CEDB';c.lineWidth=1.2;c.beginPath();c.arc(e.x-((e.ink-1)*7)/2+i*7,e.y-e.h-36,3.4,0,Math.PI*2);c.fill();c.stroke();}});
  if(P&&P.alive&&G.hero==='gravity'){c.save();c.globalAlpha=.18+.06*Math.sin(t*3);c.strokeStyle='#B57CFF';c.lineWidth=2;c.setLineDash([6,8]);c.lineDashOffset=-t*30;c.beginPath();c.ellipse(P.x,P.y-40,200,120,0,0,Math.PI*2);c.stroke();c.restore();}
  if(P&&P.alive&&G.hero==='hana'&&P.mOn>0){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.25;c.fillStyle='#FF8FB8';c.beginPath();c.ellipse(P.x,P.y-30,150,60,0,0,Math.PI*2);c.fill();c.restore();}
}
