/* ================= PHASE 7: visual polish ================= */
/* - rim lighting + soft shading for every fighter (offscreen composite, per-universe key lights)
   - squash and stretch, soft contact shadows that follow you into the air
   - impact bursts, shockwaves, manga impact frames, knockout blasts
   - render interpolation between fixed 1/120 s simulation steps
   - HUD: signature-mechanic gauge, enemy portrait panel, restyled panels, mode labels
   "Graphics: Standard" in Settings turns off the lighting and atmosphere passes. */
const fx7=[];
const LIGHT7={ki:[{c:'255,206,130',x:.78,y:-.62,a:.85}],sh:[{c:'210,196,255',x:-.72,y:-.68,a:.75}],
  cape:[{c:'127,231,255',x:.86,y:-.42,a:.9},{c:'255,79,190',x:-.86,y:-.3,a:.7}],mighty:[{c:'150,196,255',x:-.62,y:-.76,a:.85},{c:'199,125,255',x:.75,y:.15,a:.5}]};
let lowGfx7=false,slowF7=0;
const hiGfx=()=>SET.gfx==='high'||(SET.gfx==='auto'&&!lowGfx7);
/* Auto graphics: lighting starts on; if drawing averages over 12 ms a frame for about 2 s of play, it is switched off for this session */
function autoGfx7(){if(SET.gfx!=='auto'||lowGfx7||G.screen!=='play')return;if(PERF.ren>12)slowF7++;else slowF7=Math.max(0,slowF7-2);
  if(slowF7>120){lowGfx7=true;G.toast={t:0,dur:3.5,text:'Lighting effects turned off for smoother play (Settings → Graphics)'};}}
function squash7(f){if(f.land7>0){const k=f.land7/.12;return [1+.13*k,1-.15*k];}if(f.jump7>0){const k=f.jump7/.12;return [1-.08*k,1+.12*k];}return null;}
const _dba7=drawBodyAt;
drawBodyAt=function(c,f,t){
  const sq=(typeof OVR==='undefined'||!OVR)?squash7(f):null;if(sq){c.save();c.scale(sq[0],sq[1]);}
  try{if(!hiGfx()||(typeof OVR!=='undefined'&&OVR)||f.preview||c!==ctx||!(f.trail))_dba7(c,f,t);else litDraw7(c,f,t);}
  finally{if(sq)c.restore();}
};
/* Rim light: the fighter's silhouette, tinted with each universe key light and nudged toward that light, is drawn
   first; the body drawn on top leaves a thin coloured rim on the lit side. Uses the art pipeline's cached tinted
   textures, so it costs about one extra body draw per light (profiled: the earlier offscreen-composite version
   cost ~17 ms a frame in software rendering and was replaced). */
function litDraw7(c,f,t){G.lit7=(G.lit7||0)+1;
  const ga=c.globalAlpha*(f===P&&G.hidden7?.6:1);const fc=f.face||1,k=1.8*((f.h||78)>100?1.3:1);
  for(const L of LIGHT7[G.uni]||[]){c.save();c.translate(L.x*k*fc,L.y*k);c.globalAlpha=ga*L.a;OVR='rgb('+L.c+')';try{_dba7(c,f,t);}finally{OVR=null;c.restore();}}
  c.save();c.globalAlpha=ga;_dba7(c,f,t);c.restore();
}
function labelOK7(f){for(const e of enemies){if(e!==f&&e.alive&&e.spawnT<=0&&e.id<f.id&&Math.abs(e.x-f.x)<70&&Math.abs((e.y-e.h)-(f.y-f.h))<44)return false;}return true;}
/* soft contact shadow projected onto the platform below (also while airborne) */
function shadow7(c,f){let best=null,bd=1e9;for(const p of plats){if(f.x>=p.x1-6&&f.x<=p.x2+6&&p.y>=f.y-3){const d=p.y-f.y;if(d<bd){bd=d;best=p;}}}
  if(!best||bd>320)return;const k=1-bd/320,rx=f.w*.85*(.55+.45*k),y=best.y+2;
  const g=c.createRadialGradient(f.x,y,0,f.x,y,rx);g.addColorStop(0,'rgba(8,2,22,'+(.55*k)+')');g.addColorStop(1,'rgba(8,2,22,0)');
  c.save();c.fillStyle=g;c.translate(f.x,y);c.scale(1,.24);c.translate(-f.x,-y);c.beginPath();c.arc(f.x,y,rx,0,Math.PI*2);c.fill();c.restore();}

/* ---------- impact + KO effects ---------- */
function hitFx7(t,h,ok){if(!ok||!t||!t.alive&&t.team!=='enemy')return;const sp=Math.hypot(t.vx||0,t.vy||0);
  const col=t.team==='hero'?'#FF2E63':(h.color||'#FFE14D');const big=sp>760||h.heavy;
  fx7.push({k:'impact',x:t.x-(h.dir||1)*t.w*.25,y:t.y-t.h*.55,a:Math.atan2(t.vy||0,t.vx||1),s:clamp(sp/700,.55,1.9),col,t:0,dur:big?.24:.16,seed:Math.random()*9});
  if(big){fx7.push({k:'shock',x:t.x,y:t.y-t.h*.5,t:0,dur:.32,col,r:90+sp*.06});if(flashMul()>.5)G.if7={until:performance.now()+70,x:t.x,y:t.y-t.h*.5};}
  if(fx7.length>140)fx7.splice(0,fx7.length-140);}
const _koV7=koFighter;
koFighter=function(f){const x=f.x,y=f.y-f.h/2,team=f.team,boss=f.role==='boss';_koV7(f);
  fx7.push({k:'koBlast',x,y,t:0,dur:boss?1.3:.9,col:team==='hero'?'#FF2E63':boss?'#FF2FB4':(f.auraColor&&f.kind7?f.auraColor:'#FFE14D'),boss});
  G.slowT=Math.max(G.slowT,boss?.6:.2);G.zoomKick=Math.max(G.zoomKick,.07);
  const vx0=cam.x-VW/2/cam.z+30,vx1=cam.x+VW/2/cam.z-30,vy0=cam.y-VH/2/cam.z+30,vy1=cam.y+VH/2/cam.z-30;const cx=clamp(x,vx0,vx1),cy=clamp(y,vy0,vy1);
  const cols=team==='hero'?['#FF2E63','#FFFFFF','#B57CFF']:['#FFE14D','#FFFFFF','#FF8A3D','#7FE7FF'];
  for(let i=0;i<34;i++){const a=Math.atan2(cam.y-cy,cam.x-cx)+rnd(-1.1,1.1),s=rnd(300,900);parts.push({x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(.4,.8),max:.8,r:rnd(2.5,5),color:pick(cols),g:600,streak:true});}};
function fxTick7(dt){for(const e of fx7)e.t+=dt;for(let i=fx7.length-1;i>=0;i--)if(fx7[i].t>=fx7[i].dur)fx7.splice(i,1);
  const all=P?[P].concat(enemies):enemies;
  for(const f of all){if(f.land7>0)f.land7-=dt;if(f.jump7>0)f.jump7-=dt;
    if(f.onGround&&f._g7===false&&(f._vy7||0)>320)f.land7=.12;
    if(!f.onGround&&f._g7===true&&f.vy<-420)f.jump7=.12;
    f._g7=f.onGround;f._vy7=f.vy;
    if(f.team==='enemy'&&f.stun>0&&Math.hypot(f.vx,f.vy)>720&&hiGfx()){const c=f.pct>=120?'#FF2E63':f.pct>=80?'#FF8A3D':'#FFE14D';
      parts.push({x:f.x+rnd(-6,6),y:f.y-f.h/2+rnd(-6,6),vx:-f.vx*.08,vy:-f.vy*.08,life:.32,max:.32,r:rnd(4,7),color:c,g:0,streak:true});}}
}
function drawFx7(c,t){
  for(const e of fx7){const p=clamp(e.t/e.dur,0,1);
    if(e.k==='impact'){c.save();c.translate(e.x,e.y);c.globalCompositeOperation='lighter';
      const r=(30*e.s)*(.6+.6*p);const g=c.createRadialGradient(0,0,0,0,0,r*1.3);g.addColorStop(0,'rgba(255,255,255,'+(1-p)+')');g.addColorStop(.35,e.col);g.addColorStop(1,'rgba(0,0,0,0)');
      c.globalAlpha=1-p;c.fillStyle=g;c.beginPath();c.arc(0,0,r*1.3,0,Math.PI*2);c.fill();
      c.rotate(e.a);c.fillStyle='#FFFFFF';const n=8;for(let i=0;i<n;i++){const a=i/n*Math.PI*2+e.seed;const L=(i%2?24:46)*e.s*(.5+p)*(Math.abs(Math.cos(a))*.7+.5);
        c.save();c.rotate(a);c.beginPath();c.moveTo(r*.25,-2.4*(1-p)-.5);c.lineTo(L+r*.25,0);c.lineTo(r*.25,2.4*(1-p)+.5);c.closePath();c.fill();c.restore();}
      c.restore();}
    else if(e.k==='shock'){c.save();c.globalAlpha=(1-p)*.9;c.strokeStyle='#FFFFFF';c.lineWidth=6*(1-p)+1;c.beginPath();c.ellipse(e.x,e.y,e.r*p+12,(e.r*p+12)*.62,0,0,Math.PI*2);c.stroke();
      c.strokeStyle=e.col;c.lineWidth=3*(1-p)+1;c.beginPath();c.ellipse(e.x,e.y,e.r*p*.8+8,(e.r*p*.8+8)*.62,0,0,Math.PI*2);c.stroke();c.restore();}
    else if(e.k==='flare'){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=1-p;const g=c.createRadialGradient(e.x,e.y,0,e.x,e.y,e.r*(.6+.6*p));g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.3,e.col);g.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=g;c.beginPath();c.arc(e.x,e.y,e.r*(.6+.6*p),0,Math.PI*2);c.fill();c.restore();}
    else if(e.k==='arc'){c.save();c.translate(e.x,e.y);c.scale(e.face,1);c.globalCompositeOperation='lighter';c.globalAlpha=1-p;c.strokeStyle=e.col;c.lineCap='round';
      c.lineWidth=16*(1-p)+2;c.beginPath();c.arc(-40,0,150,-.9,.9);c.stroke();c.strokeStyle='#FFFFFF';c.lineWidth=4*(1-p)+1;c.stroke();c.restore();}
    else if(e.k==='beam'){c.save();c.globalCompositeOperation='lighter';const x2=e.x+e.face*1500;const g=c.createLinearGradient(0,e.y-40,0,e.y+40);
      g.addColorStop(0,'rgba(255,47,180,0)');g.addColorStop(.35,'rgba(255,47,180,.7)');g.addColorStop(.5,'rgba(255,240,250,1)');g.addColorStop(.65,'rgba(255,47,180,.7)');g.addColorStop(1,'rgba(255,47,180,0)');
      c.fillStyle=g;c.fillRect(Math.min(e.x,x2),e.y-40,1500,80);c.restore();}
    else if(e.k==='ink'){c.save();c.globalAlpha=1-p;c.fillStyle='#160A24';for(let i=0;i<6+e.n*2;i++){const a=i*2.4,d=(20+i*6)*(.4+p);c.beginPath();c.arc(e.x+Math.cos(a)*d,e.y+Math.sin(a)*d*.7,6*(1-p)+2,0,Math.PI*2);c.fill();}
      c.strokeStyle='#C9CEDB';c.lineWidth=3*(1-p);c.beginPath();c.arc(e.x,e.y,60*p+10,0,Math.PI*2);c.stroke();c.restore();}
  }
}
/* screen-space: knockout blasts, impact frames, foreground bokeh */
function toScr7(x,y){return [(x-cam.x)*cam.z+VW/2,(y-cam.y)*cam.z+VH/2];}
function drawScreen7(c,t){
  for(const e of fx7){if(e.k!=='koBlast')continue;const p=clamp(e.t/e.dur,0,1);const s=toScr7(e.x,e.y);const x=clamp(s[0],18,VW-18),y=clamp(s[1],18,VH-18);
    const a=Math.atan2(VH/2-y,VW/2-x);c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.rotate(a);
    const L=Math.max(VW,VH)*1.4*Math.min(1,p*4),W=(e.boss?190:120)*(1-p);
    const g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,'rgba(255,255,255,'+(1-p)+')');g.addColorStop(.15,e.col);g.addColorStop(1,'rgba(0,0,0,0)');
    c.globalAlpha=(1-p)*.9;c.fillStyle=g;c.beginPath();c.moveTo(0,-W*.25);c.lineTo(L,-W);c.lineTo(L,W);c.lineTo(0,W*.25);c.closePath();c.fill();
    c.globalAlpha=1-p;c.strokeStyle=e.col;c.lineWidth=16*(1-p)+2;c.beginPath();c.arc(0,0,30+320*p,0,Math.PI*2);c.stroke();
    c.strokeStyle='#FFFFFF';c.lineWidth=5*(1-p)+1;c.beginPath();c.arc(0,0,20+220*p,0,Math.PI*2);c.stroke();c.restore();}
  if(G.if7&&performance.now()<G.if7.until){const s=toScr7(G.if7.x,G.if7.y);c.save();c.globalAlpha=.32*flashMul();c.strokeStyle='#FFFFFF';c.lineCap='round';
    for(let i=0;i<28;i++){const a=i/28*Math.PI*2+(i%3)*.05;const r0=60+(i*37%40),r1=Math.max(VW,VH);c.lineWidth=(i%4)+1.5;c.beginPath();c.moveTo(s[0]+Math.cos(a)*r0,s[1]+Math.sin(a)*r0);c.lineTo(s[0]+Math.cos(a)*r1,s[1]+Math.sin(a)*r1);c.stroke();}c.restore();}
  if(hiGfx()&&G.screen!=='title'&&G.screen!=='select'){const col={ki:'255,200,120',sh:'255,140,200',cape:'127,231,255',mighty:'199,125,255'}[G.uni]||'255,255,255';c.save();c.globalCompositeOperation='lighter';
    for(let i=0;i<6;i++){const x=((i*211+t*(6+i*2))%(VW+200))-100,y=VH*(.2+((i*.37)%0.7))+Math.sin(t*.3+i)*20,r=40+(i%3)*26;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+col+',.07)');g.addColorStop(1,'rgba('+col+',0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
    c.restore();}
}
/* atmosphere drawn behind the world (screen space) */
function drawAtmos7(c,t){if(!hiGfx())return;const U=G.uni;c.save();
  if(U==='ki'){c.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const a=2.05+i*.16+Math.sin(t*.2+i)*.03;c.save();c.translate(VW*.82,-60);c.rotate(a);const g=c.createLinearGradient(0,0,VH*1.6,0);g.addColorStop(0,'rgba(255,214,150,.10)');g.addColorStop(1,'rgba(255,214,150,0)');c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.lineTo(VH*1.6,-60-i*10);c.lineTo(VH*1.6,60+i*10);c.closePath();c.fill();c.restore();}}
  else if(U==='sh'){const g=c.createLinearGradient(0,VH*.55,0,VH);g.addColorStop(0,'rgba(120,80,190,0)');g.addColorStop(1,'rgba(120,80,190,.22)');c.fillStyle=g;c.fillRect(0,VH*.55,VW,VH*.45);}
  else if(U==='cape'){c.strokeStyle='rgba(180,220,255,.18)';c.lineWidth=1.2;c.beginPath();for(let i=0;i<70;i++){const x=((i*97.3+t*140)%(VW+120))-60,y=((i*53.1+t*900)%(VH+80))-40;c.moveTo(x,y);c.lineTo(x-6,y+22);}c.stroke();
    const g=c.createLinearGradient(0,VH*.6,0,VH);g.addColorStop(0,'rgba(255,46,140,0)');g.addColorStop(1,'rgba(255,46,140,.14)');c.fillStyle=g;c.fillRect(0,VH*.6,VW,VH*.4);}
  else{c.globalCompositeOperation='lighter';[[.25,.3,'157,93,229'],[.75,.2,'62,160,255']].forEach(([x,y,col],i)=>{const cx=VW*x+Math.sin(t*.05+i)*60,cy=VH*y+Math.cos(t*.04+i)*30,r=VW*.35;const g=c.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,'rgba('+col+',.10)');g.addColorStop(1,'rgba('+col+',0)');c.fillStyle=g;c.fillRect(cx-r,cy-r,r*2,r*2);});}
  c.restore();}

/* ---------- render interpolation between fixed steps ---------- */
let interp7=null;
function snapPrev7(){if(P){P._px=P.x;P._py=P.y;}for(const e of enemies){e._px=e.x;e._py=e.y;}for(const q of projs){q._px=q.x;q._py=q.y;}cam._px=cam.x;cam._py=cam.y;cam._pz=cam.z;}
function applyInterp7(a){if(!(a>0&&a<1))return 0;const L=[];
  const f=o=>{if(o&&o._px!=null&&Math.abs(o.x-o._px)<160&&Math.abs(o.y-o._py)<160){L.push(o,o.x,o.y);o.x=o._px+(o.x-o._px)*a;o.y=o._py+(o.y-o._py)*a;}};
  if(P)f(P);enemies.forEach(f);projs.forEach(f);
  if(cam._px!=null){L.push(cam,cam.x,cam.y);const z=cam.z;cam.x=cam._px+(cam.x-cam._px)*a;cam.y=cam._py+(cam.y-cam._py)*a;cam._rz=z;cam.z=cam._pz+(z-cam._pz)*a;}
  interp7=L;return 1;}
function restoreInterp7(){const L=interp7;if(!L)return;for(let i=0;i<L.length;i+=3){L[i].x=L[i+1];L[i].y=L[i+2];}if(cam._rz!=null){cam.z=cam._rz;cam._rz=null;}interp7=null;}

/* ---------- HUD ---------- */
function hudPanel7(c,x,y,w,h,col){const s=Math.min(10,h*.25);c.save();
  c.beginPath();c.moveTo(x+s,y);c.lineTo(x+w,y);c.lineTo(x+w-s,y+h);c.lineTo(x,y+h);c.closePath();
  const g=c.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'rgba(34,17,74,.88)');g.addColorStop(1,'rgba(14,6,30,.82)');c.fillStyle=g;c.fill();
  c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=1.5;c.stroke();
  c.beginPath();c.moveTo(x+s,y+1);c.lineTo(x+w,y+1);c.strokeStyle=col;c.lineWidth=2.5;c.shadowColor=col;c.shadowBlur=8;c.stroke();c.shadowBlur=0;
  c.fillStyle=col;c.beginPath();c.moveTo(x+w-s-1,y+h);c.lineTo(x+w-s-16,y+h);c.lineTo(x+w-s-12,y+h-4);c.lineTo(x+w-s+1,y+h-4);c.closePath();c.fill();
  c.restore();}
function bar7(c,x,y,w,h,v,c1,c2){c.save();c.beginPath();c.moveTo(x+h*.5,y);c.lineTo(x+w,y);c.lineTo(x+w-h*.5,y+h);c.lineTo(x,y+h);c.closePath();c.fillStyle='rgba(255,255,255,.1)';c.fill();c.clip();
  if(v>0){const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,c1);g.addColorStop(1,c2);c.fillStyle=g;c.fillRect(x,y,w*clamp(v,0,1),h);}c.restore();}
function drawHUD7(c,t){if(!P||G.screen==='title'||G.screen==='select')return;
  const M=mech();
  if(M){const gg=M.gauge(P);const x0=14,y0=12+116+(P.awake>0?34:0);hudPanel7(c,x0,y0,262,34,M.col);
    c.font='600 10px Fredoka, sans-serif';c.textAlign='left';c.fillStyle=M.col;c.fillText(M.n,x0+14,y0+13);
    c.textAlign='right';c.fillStyle=gg.hot&&Math.floor(t*6)%2?'#FFFFFF':'#E9DDFF';c.fillText(gg.txt,x0+250,y0+13);
    bar7(c,x0+12,y0+19,238,9,gg.v,M.col,gg.hot?'#FFFFFF':M.col);}
  let e=G.lastHit7&&G.lastHit7.alive&&G.time-G.lastHitT7<4?G.lastHit7:null;
  if(!e){let bd=520;for(const x of enemies){if(!x.alive||x.spawnT>0)continue;const d=Math.hypot(x.x-P.x,x.y-P.y);if(d<bd){bd=d;e=x;}}}
  G.ePanel7=0;if(!e||e.role==='boss')return;G.ePanel7=1;
  const w=250,x1=VW-14,x0=x1-w,y0=60/K+4;hudPanel7(c,x0,y0,w,66,'#FF2E63');
  const px=x1-40,py=y0+33;c.save();c.beginPath();c.arc(px,py,26,0,Math.PI*2);const bg=c.createLinearGradient(0,py-26,0,py+26);bg.addColorStop(0,'#3A1A5A');bg.addColorStop(1,'#120624');c.fillStyle=bg;c.fill();c.clip();
  try{const fake={id:e.id,mood:e.mood,onGround:true,preview:true,pose:e.pose,act:null,vx:0,wind:e.wind,flash:e.flash,face:-1,x:0,y:0,h:e.h,w:e.w};
    if(e.custom){c.translate(px,py+20);c.scale(1.05,1.05);e.custom(c,Object.assign({},e,{face:-1}),t);}
    else if(e.artId&&ART.has(e.artId)){c.translate(px+2,py+4);const s=e.kind7==='minion'?1.25:1.55;c.scale(-s,s);ART.portrait(c,e.artId,fake,t);}}catch(err){}
  c.restore();c.strokeStyle='#FF2E63';c.lineWidth=2.5;c.beginPath();c.arc(px,py,26,0,Math.PI*2);c.stroke();
  c.font='600 13px Fredoka, sans-serif';c.textAlign='right';c.fillStyle='#FFF6E6';c.fillText(e.name.toUpperCase(),px-34,y0+19);
  const pc=Math.round(e.pct);outlined(c,pc+'%',px-34,y0+48,30,pctColor(pc),'right');
  c.font='600 9px Fredoka, sans-serif';c.textAlign='left';c.fillStyle='#CDBDF0';c.fillText('KO RISK',x0+14,y0+42);bar7(c,x0+14,y0+47,96,7,pc/150,'#FFE14D','#FF2E63');
  if(e.pers&&PERS[e.pers]){c.font='600 9px Fredoka, sans-serif';c.fillStyle=PERS[e.pers].c;c.fillText(PERS[e.pers].n,x0+14,y0+19);}
}
