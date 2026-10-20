/* =====================================================================
   ART PIPELINE  (render-only)
   Contract: ART.draw(ctx, fighter, t) draws a fighter at its feet origin, with ctx already
   translated to (f.x,f.y), rotated by f.spin and mirrored by f.face (same as the old drawRig).
   It READS f.pose, f.mood, f.act, f.onGround, f.vx ... and NEVER writes gameplay fields
   (position, velocity, hitboxes, timers, AI state). It only writes render caches:
   f._art (cloth chains, slash samples), f._hand/f._foot (trail anchors), f._artSlash.
   Character parts are authored as vector draw functions, baked to transparent textures at
   S px per world unit, exported as PNGs (assets/<id>/<part>.png + assets/manifest.json) and
   preferred at runtime when those files load. Missing PNG -> baked texture. Bake failure ->
   ART.draw returns false and the old procedural rig is used.
   ===================================================================== */
const ART=(function(){
  const S=4,INK='#160A24';
  const defs={},tex={},status={};
  const heroArt={hana:'hana_bloom'},enemyArt={shadow_assassin:'shadow_assassin',rift_grunt:'rift_grunt',oni_brute:'oni_brute',rift_caster:'rift_caster',mecha_sentinel:'mecha_sentinel',void_stalker:'void_stalker',rift_beast:'rift_beast'};
  function hexRgb(h){h=String(h).replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');const n=parseInt(h,16)||0;return [(n>>16)&255,(n>>8)&255,n&255];}
  function mix(a,b,k){const pa=hexRgb(a),pb=hexRgb(b);return 'rgb('+Math.round(pa[0]+(pb[0]-pa[0])*k)+','+Math.round(pa[1]+(pb[1]-pa[1])*k)+','+Math.round(pa[2]+(pb[2]-pa[2])*k)+')';}
  const mcC={};
  /* colour for procedural cloth in each render mode: normal, back-limb shade, clone void, hit-flash white, trail silhouette */
  function mc(col,m){if(!m)return col;const k=col+'|'+m;if(mcC[k])return mcC[k];let r;
    if(m==='shade')r=mix(col,'#1A0B30',.30);else if(m==='void')r=mix(col,'#22083D',.80);else if(m==='white')r='#FFFFFF';else r=m;return mcC[k]=r;}
  const silent=m=>m&&m!=='shade'&&m!=='void';

  /* ---------- drawing helpers (world units) ---------- */
  function capsule(c,w0,w1,L){c.beginPath();c.moveTo(-w0/2,0);c.lineTo(-w1/2,L);c.arc(0,L,w1/2,Math.PI,0,true);c.lineTo(w0/2,0);c.arc(0,0,w0/2,0,Math.PI,true);c.closePath();}
  /* cel-shaded fill: outline (outer half of a doubled stroke), shadow tone, lit tone offset toward the light (front-top), rim highlight */
  function cel(c,path,base,sh,light,k,lw){
    lw=lw||1.4;k=k==null?1.3:k;
    c.save();path(c);c.lineWidth=lw*2;c.strokeStyle=INK;c.lineJoin='round';c.stroke();c.restore();
    c.save();path(c);c.fillStyle=sh;c.fill();c.clip();
    c.save();c.translate(k,-k*.8);path(c);c.fillStyle=base;c.fill();c.restore();
    if(light){c.translate(k*1.5,-k*1.2);path(c);c.strokeStyle=light;c.lineWidth=.8;c.stroke();}
    c.restore();
  }
  function line(c,pts,w,col){c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.lineWidth=w;c.strokeStyle=col;c.lineCap='round';c.lineJoin='round';c.stroke();}
  function blossom(c,x,y,r,col,core){
    c.save();c.translate(x,y);
    for(let i=0;i<5;i++){c.save();c.rotate(i/5*Math.PI*2);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-r*.55,-r*.55,-r*.2,-r);c.lineTo(0,-r*.82);c.lineTo(r*.2,-r);c.quadraticCurveTo(r*.55,-r*.55,0,0);c.closePath();
      c.fillStyle=col;c.fill();c.lineWidth=.45;c.strokeStyle=INK;c.stroke();c.restore();}
    c.beginPath();c.arc(0,0,r*.28,0,Math.PI*2);c.fillStyle=core||'#FFE27A';c.fill();c.restore();
  }

  /* ---------- texture baking + variants ---------- */
  function bake(p){
    const x0=p.b[0],y0=p.b[1],x1=p.b[2],y1=p.b[3];
    const cv=document.createElement('canvas');cv.width=Math.ceil((x1-x0)*S);cv.height=Math.ceil((y1-y0)*S);
    const c=cv.getContext('2d');if(!c)throw new Error('no 2d context');
    c.scale(S,S);c.translate(-x0,-y0);c.lineJoin='round';c.lineCap='round';p.d(c);
    return {img:cv,px:-x0*S,py:-y0*S,w:cv.width,h:cv.height,v:{},src:'baked'};
  }
  function variant(T,key){
    if(T.v[key])return T.v[key];
    const cv=document.createElement('canvas');cv.width=T.w;cv.height=T.h;const c=cv.getContext('2d');
    c.drawImage(T.img,0,0);c.globalCompositeOperation='source-atop';
    c.fillStyle=key==='shade'?'rgba(18,7,38,.30)':key==='void'?'rgba(30,7,58,.80)':key==='white'?'rgba(255,255,255,.95)':key;
    c.fillRect(0,0,T.w,T.h);
    return T.v[key]=cv;
  }
  function part(c,id,name,x,y,ang,mode,sc){
    const T=tex[id]&&tex[id][name];if(!T)return;const img=mode?variant(T,mode):T.img;
    c.save();c.translate(x,y);if(ang)c.rotate(-ang);if(sc)c.scale(sc,sc);c.drawImage(img,-T.px/S,-T.py/S,T.w/S,T.h/S);c.restore();
  }

  /* ---------- local <-> world (matches drawFighter's translate/spin/mirror order) ---------- */
  function toW(f,lx,ly){const fc=f.face||1,h=f.h||78,sp=f.spin||0,k=(f._art&&f._art.sc)||1;let x=lx*k*fc,y=ly*k;
    if(sp){const cy=-h/2,dy=y-cy,cs=Math.cos(sp),sn=Math.sin(sp);const nx=x*cs-dy*sn;y=cy+x*sn+dy*cs;x=nx;}return [(f.x||0)+x,(f.y||0)+y];}
  function toL(f,wx,wy){const fc=f.face||1,h=f.h||78,sp=f.spin||0;let x=wx-(f.x||0),y=wy-(f.y||0);
    if(sp){const cy=-h/2,dy=y-cy,cs=Math.cos(-sp),sn=Math.sin(-sp);const nx=x*cs-dy*sn;y=cy+x*sn+dy*cs;x=nx;}const k=(f._art&&f._art.sc)||1;return [x*fc/k,y/k];}

  /* ---------- secondary motion: verlet chains in world space (hair, sleeves, sashes, scarves) ---------- */
  function chain(f,key,n,seg,anc,rest,o){
    const A=f._art;const w=toW(f,anc[0],anc[1]);const rdx=rest[0]*(f.face||1),rdy=rest[1];let ch=A.ch[key];
    if(!ch||ch.length!==n||Math.hypot(ch[0].x-w[0],ch[0].y-w[1])>140){ch=[];for(let i=0;i<n;i++){const x=w[0]+rdx*seg*i,y=w[1]+rdy*seg*i;ch.push({x,y,px:x,py:y});}A.ch[key]=ch;}
    ch[0].x=ch[0].px=w[0];ch[0].y=ch[0].py=w[1];
    const dt=A.dt;
    if(dt>0){const g=(o.g||600)*dt*dt,b=(o.bias||400)*dt*dt,dm=o.damp||.86;
      const fl=o.fl,tt=A.lt||0;
      for(let i=1;i<n;i++){const q=ch[i];const vx=(q.x-q.px)*dm,vy=(q.y-q.py)*dm;q.px=q.x;q.py=q.y;q.x+=vx+rdx*b;q.y+=vy+g+rdy*b;
        if(fl){const w=Math.sin(tt*fl[1]-i*.9+(f.id||0))*fl[0]*i/n*dt*dt;q.x+=-rdy*w;q.y+=rdx*w;}}
      for(let it=0;it<3;it++)for(let i=1;i<n;i++){const a=ch[i-1],q=ch[i];const dx=q.x-a.x,dy=q.y-a.y,d=Math.hypot(dx,dy)||1,k=(d-seg)/d;q.x-=dx*k;q.y-=dy*k;}}
    return ch.map(p=>toL(f,p.x,p.y));
  }
  function ribbon(c,pts,w0,w1,fill,m,tip){
    const n=pts.length;if(n<2)return;const Lf=[],Rt=[];
    for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
      const w=(w0+(w1-w0)*i/(n-1))/2;Lf.push([pts[i][0]-dy*w,pts[i][1]+dx*w]);Rt.push([pts[i][0]+dy*w,pts[i][1]-dx*w]);}
    c.beginPath();c.moveTo(Lf[0][0],Lf[0][1]);
    for(let i=1;i<n;i++)c.quadraticCurveTo(Lf[i-1][0],Lf[i-1][1],(Lf[i-1][0]+Lf[i][0])/2,(Lf[i-1][1]+Lf[i][1])/2);
    c.lineTo(Lf[n-1][0],Lf[n-1][1]);
    if(tip){const e=pts[n-1],p=pts[n-2];c.lineTo(e[0]+(e[0]-p[0])*.6,e[1]+(e[1]-p[1])*.6);}
    c.lineTo(Rt[n-1][0],Rt[n-1][1]);
    for(let i=n-2;i>=0;i--)c.quadraticCurveTo(Rt[i+1][0],Rt[i+1][1],(Rt[i+1][0]+Rt[i][0])/2,(Rt[i+1][1]+Rt[i][1])/2);
    c.lineTo(Rt[0][0],Rt[0][1]);c.closePath();
    c.lineJoin='round';c.lineWidth=2.6;c.strokeStyle=silent(m)?fill:INK;c.stroke();c.fillStyle=fill;c.fill();
  }

  /* ---------- skeleton (same limb lengths convention as the old rig: angle 0 = straight down) ---------- */
  function lmb(x,y,a1,a2,l1,l2){const ex=x+Math.sin(a1)*l1,ey=y+Math.cos(a1)*l1,a=a1+a2;return [ex,ey,ex+Math.sin(a)*l2,ey+Math.cos(a)*l2,a];}
  function joints(f,R,t){
    const L=R.len,P=f.pose;
    const fl=lmb(0,0,P.fl1,P.fl2,L.th,L.sh),bl=lmb(-2,0,P.bl1,P.bl2,L.th,L.sh);
    const gr=f.onGround||f.preview;
    let hy=R.hipY!=null?R.hipY:gr?-Math.max(fl[3],bl[3])-L.ft:-(L.th+L.sh)*.84;
    if(gr&&!f.act)hy+=Math.sin(t*3+(f.id||0))*.6;
    const ln=P.lean,cl=Math.cos(ln),sl=Math.sin(ln);
    const nx=sl*L.to,ny=hy-cl*L.to,shx=nx-sl*3.5,shy=ny+cl*3.5;
    const ha=ln*.5+P.ht,hx=nx+Math.sin(ln+P.ht)*L.hd,hy2=ny-Math.cos(ln+P.ht)*L.hd;
    const fsx=shx+cl*2.2,fsy=shy+sl*2.2,bsx=shx-cl*2.2,bsy=shy-sl*2.2;
    const fa=lmb(fsx,fsy,P.fa1,P.fa2,L.ua,L.fa),ba=lmb(bsx,bsy,P.ba1,P.ba2,L.ua,L.fa);
    return {hy,lean:ln,ha,head:[hx,hy2],neck:[nx,ny],
      fK:[fl[0],fl[1]+hy],fA:[fl[2],fl[3]+hy],fT:P.fl1,fS:fl[4],
      bK:[bl[0]-0,bl[1]+hy],bA:[bl[2],bl[3]+hy],bT:P.bl1,bS:bl[4],
      fSh:[fsx,fsy],fE:[fa[0],fa[1]],fW:[fa[2],fa[3]],fU:P.fa1,fF:fa[4],fWp:fa[4]+(P.wr||0),
      bSh:[bsx,bsy],bE:[ba[0],ba[1]],bW:[ba[2],ba[3]],bU:P.ba1,bF:ba[4],bWp:ba[4]+(P.wr||0)};
  }
  const tl=(j,x,y)=>{const c=Math.cos(j.lean),s=Math.sin(j.lean);return [x*c-y*s,j.hy+x*s+y*c];};
  const hl=(j,x,y)=>{const c=Math.cos(j.ha),s=Math.sin(j.ha);return [j.head[0]+x*c-y*s,j.head[1]+x*s+y*c];};
  const along=(p,a,d)=>[p[0]+Math.sin(a)*d,p[1]+Math.cos(a)*d];
  function face(f){const m=f.mood||'idle';if(m==='hurt'||m==='dizzy')return 'hurt';if(m==='attack'||m==='charge')return 'attack';
    const ph=((f.id||0)*.77+(typeof G!=='undefined'?G.time:0))%3.7;return ph<.13?'blink':'idle';}

  /* slash ribbons: sample weapon tip/base in world space during an attack's active window */
  function slash(c,f,t,key,tipL,baseL,col,on){
    const A=f._art;const arr=A.sl[key]||(A.sl[key]=[]);
    if(on&&A.dt>0)arr.push({t,a:toW(f,tipL[0],tipL[1]),b:toW(f,baseL[0],baseL[1])});
    while(arr.length&&t-arr[0].t>.13)arr.shift();if(arr.length>9)arr.shift();
    if(arr.length<2)return;
    const tips=arr.map(s=>toL(f,s.a[0],s.a[1])),bases=arr.map(s=>toL(f,s.b[0],s.b[1]));
    c.save();c.globalCompositeOperation='lighter';
    c.beginPath();c.moveTo(tips[0][0],tips[0][1]);for(let i=1;i<tips.length;i++)c.lineTo(tips[i][0],tips[i][1]);
    for(let i=bases.length-1;i>=0;i--)c.lineTo(bases[i][0],bases[i][1]);c.closePath();
    c.fillStyle=col;c.globalAlpha=.45;c.fill();
    c.globalAlpha=.9;c.beginPath();c.moveTo(tips[0][0],tips[0][1]);for(let i=1;i<tips.length;i++)c.lineTo(tips[i][0],tips[i][1]);
    c.strokeStyle='#FFFFFF';c.lineWidth=2;c.stroke();c.restore();
  }
  const activeWin=f=>!!(f.act&&f.act.t>=f.act.def.act[0]-.04&&f.act.t<=f.act.def.act[1]+.05);

  /* =================================================================
     HANA BLOOM  (Shinobi Clan · sword sorcerer)
     ================================================================= */
  const HB={skin:'#FFE4D6',skinS:'#F0B8A6',hair:'#251B44',hairS:'#150F2C',hairL:'#6E5BB8',kim:'#FFF5F9',kimS:'#E9BCD3',pink:'#FF5FA2',pinkS:'#C73A7B',
    obi:'#B8236A',obiS:'#7C1547',gold:'#FFCB55',goldS:'#B9862A',stock:'#2D1E42',stockS:'#1A1029',boot:'#5E1F47',bootS:'#3B1230',guard:'#3B1F50',guardS:'#24123A',
    blade:'#F6F8FF',bladeS:'#AEB8DE',edge:'#FF8FCA',tsuka:'#2B1A36',saya:'#2B0F2E',iris:'#E0368A',irisD:'#5E0F3A'};
  function hanaEyes(c,kind){
    if(kind==='blink'){line(c,[2.6,1.4,5.2,2.4,7.6,1.2],1.2,INK);line(c,[8.4,1.2,10.2,1.9],1,INK);return;}
    if(kind==='hurt'){line(c,[3,-.6,6.4,1.4,3,3.2],1.3,INK);line(c,[10.6,-.4,8.8,1.4,10.6,3],1.1,INK);
      c.beginPath();c.moveTo(-3.5,-4);c.quadraticCurveTo(-5.2,-.8,-3.6,0);c.quadraticCurveTo(-2,-.8,-3.5,-4);c.fillStyle='#BDE8FF';c.fill();c.lineWidth=.5;c.strokeStyle=INK;c.stroke();return;}
    const at=kind==='attack',h=at?2.7:3.5,ih=at?2.3:2.9;
    [[5.1,1.4,2.5,h,1.85,ih],[9.5,1.3,1.35,h*.9,1.1,ih*.9]].forEach(([x,y,rx,ry,irx,iry],i)=>{
      c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle='#FFFFFF';c.fill();
      const g=c.createLinearGradient(0,y-iry,0,y+iry);g.addColorStop(0,HB.irisD);g.addColorStop(.6,HB.iris);g.addColorStop(1,'#FF9CCB');
      c.beginPath();c.ellipse(x+.55,y+.35,irx,iry,0,0,Math.PI*2);c.fillStyle=g;c.fill();
      c.beginPath();c.ellipse(x+.7,y+.35,irx*.42,iry*.48,0,0,Math.PI*2);c.fillStyle='#2A0618';c.fill();
      c.beginPath();c.arc(x+1.3,y-iry*.45,.75,0,Math.PI*2);c.fillStyle='#FFFFFF';c.fill();
      c.beginPath();c.arc(x+.1,y+iry*.5,.35,0,Math.PI*2);c.fill();
      if(i===0){c.beginPath();c.moveTo(x-rx-.5,y-ry*.55);c.quadraticCurveTo(x,y-ry-1.3,x+rx+.4,y-ry*.7);c.lineWidth=1.35;c.strokeStyle=INK;c.stroke();
        line(c,[x-rx-.5,y-ry*.55,x-rx-1.9,y-ry*.95],1,INK);line(c,[x-rx+.3,y+ry*.75,x+rx-.2,y+ry*.8],.5,INK);}
      else{c.beginPath();c.moveTo(x-rx,y-ry*.8);c.quadraticCurveTo(x,y-ry-.9,x+rx+.2,y-ry*.4);c.lineWidth=1.1;c.strokeStyle=INK;c.stroke();}
    });
    if(at){line(c,[2.6,-4.4,7.4,-2.9],1,INK);line(c,[8.6,-3,10.6,-4],.9,INK);}else{line(c,[2.6,-4.6,7,-4.9],.8,INK);line(c,[8.7,-4.8,10.4,-4.5],.7,INK);}
  }
  function hanaHead(kind){return function(c){
    cel(c,c=>capsule(c,4.6,4.2,7.5),HB.skin,HB.skinS,null,.6,1.2);
    const fp=c=>{c.beginPath();c.ellipse(0,-1,9.6,10.2,0,0,Math.PI*2);c.moveTo(-2.2,6);c.lineTo(3,9.8);c.lineTo(6.6,8.7);c.lineTo(9,4.4);c.lineTo(9.4,0);c.lineTo(0,0);c.closePath();};
    c.save();fp(c);c.lineWidth=2.8;c.strokeStyle=INK;c.stroke();c.fillStyle=HB.skin;c.fill();c.clip();
    c.beginPath();c.ellipse(-6.5,0,6.5,12,0,0,Math.PI*2);c.fillStyle=HB.skinS;c.fill();
    c.beginPath();c.ellipse(4.8,5.2,1.9,.8,0,0,Math.PI*2);c.ellipse(9.6,4.9,1,.7,0,0,Math.PI*2);c.fillStyle='rgba(255,105,150,.38)';c.fill();c.restore();
    hanaEyes(c,kind);
    line(c,[10.1,3.5,9.6,4.6],.6,INK);
    if(kind==='attack'){c.beginPath();c.ellipse(7.6,7.4,1.5,1.25,0,0,Math.PI*2);c.fillStyle='#5A0F2A';c.fill();c.lineWidth=.6;c.strokeStyle=INK;c.stroke();
      c.beginPath();c.ellipse(7.6,8,1,.5,0,0,Math.PI*2);c.fillStyle='#FF7096';c.fill();}
    else if(kind==='hurt'){line(c,[6,7.6,7,7,8,7.7,9,7.1],.7,INK);}
    else{c.beginPath();c.moveTo(6.6,7.1);c.quadraticCurveTo(7.7,7.8,8.8,6.9);c.lineWidth=.7;c.strokeStyle='#8A2E4A';c.stroke();}
  };}
  defs.hana_bloom={name:'Hana Bloom',len:{th:18,sh:18,ft:3.4,to:24,hd:10.5,ua:11.5,fa:11.5},
    parts:{
      thigh:{b:[-6,-6,6,23],d(c){cel(c,c=>capsule(c,9.2,7.2,18),HB.stock,HB.stockS,'rgba(190,160,255,.35)',1.3);
        c.save();capsule(c,9.2,7.2,18);c.clip();c.fillStyle=HB.pink;c.fillRect(-6,13.5,12,1.6);c.restore();}},
      shin:{b:[-6,-6,6,22],d(c){cel(c,c=>capsule(c,7.3,6.1,18),HB.boot,HB.bootS,'rgba(255,170,220,.35)',1.2);
        cel(c,c=>{c.beginPath();c.moveTo(-3.8,-1.8);c.lineTo(4,-1.8);c.lineTo(3.6,2.4);c.lineTo(-3.6,2.4);c.closePath();},HB.pink,HB.pinkS,null,.5,1);
        cel(c,c=>{c.beginPath();c.moveTo(1,-3.2);c.quadraticCurveTo(5.4,-1,4.2,5.4);c.lineTo(1.2,4);c.closePath();},'#E9B6D7',HB.pinkS,'#FFFFFF',.4,1);
        for(let y=6;y<16;y+=3.2)line(c,[2.8,y,1,y+1.6,2.8,y+3.2],.55,HB.gold);}},
      foot:{b:[-5,-5,10,5],d(c){cel(c,c=>{c.beginPath();c.moveTo(-3.6,-3.6);c.lineTo(2.2,-3.6);c.quadraticCurveTo(7.2,-1.8,8.4,1.4);c.lineTo(8.2,3.3);c.lineTo(-3.9,3.3);c.closePath();},HB.boot,HB.bootS,'rgba(255,170,220,.35)',.8,1.1);
        c.fillStyle=INK;c.fillRect(-3.9,2.2,12,1.2);}},
      uarm:{b:[-6,-5,6,15],d(c){cel(c,c=>capsule(c,8.6,7.4,11.5),HB.kim,HB.kimS,'#FFFFFF',1.2);
        c.save();capsule(c,8.6,7.4,11.5);c.clip();c.fillStyle=HB.pink;c.fillRect(-5,8.6,10,2.2);blossom(c,-1.6,3.6,1.7,'#FFB3D4');c.restore();}},
      farm:{b:[-5,-4,5,15],d(c){cel(c,c=>capsule(c,6,5,11.5),HB.skin,HB.skinS,null,.7,1.2);
        cel(c,c=>{c.beginPath();c.moveTo(-3.4,1.6);c.lineTo(3.5,1.6);c.lineTo(3,10);c.lineTo(-2.9,10);c.closePath();},HB.guard,HB.guardS,'rgba(200,160,255,.5)',.8,1.1);
        line(c,[-3.2,2.6,3.3,2.6],.7,HB.gold);line(c,[-2.8,9,2.8,9],.7,HB.gold);
        c.fillStyle=HB.gold;[[0,4.4],[0,7.2]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,.55,0,Math.PI*2);c.fill();});}},
      hand:{b:[-5,-5,5,5],d(c){cel(c,c=>{c.beginPath();c.arc(0,.4,3.4,0,Math.PI*2);},HB.skin,HB.skinS,null,.6,1.1);
        line(c,[-1.6,-1.4,1.8,-.6],.55,INK);line(c,[-1.8,.6,1.9,1.2],.55,INK);}},
      torso:{b:[-12,-30,13,5],d(c){
        const body=c=>{c.beginPath();c.moveTo(-8.2,2.5);c.lineTo(8.8,2.5);c.quadraticCurveTo(10.2,-9,8.8,-17);c.quadraticCurveTo(8.2,-23.4,4,-25.2);c.lineTo(-4.4,-25.2);c.quadraticCurveTo(-9.6,-23.4,-9.6,-17);c.quadraticCurveTo(-10.2,-8,-8.2,2.5);c.closePath();};
        cel(c,body,HB.kim,HB.kimS,'#FFFFFF',1.6,1.5);
        c.save();body(c);c.clip();
        [[-5.6,-16.5,1.9],[-7.2,-21.2,1.5],[5.8,-20.4,1.6],[-3.4,-20.8,1.1]].forEach(([x,y,r])=>blossom(c,x,y,r,'#FFA6CF'));
        c.beginPath();c.moveTo(-2.8,-26);c.lineTo(1.4,-26);c.lineTo(7.2,-12.5);c.lineTo(4.2,-12.5);c.closePath();c.fillStyle=HB.pink;c.fill();c.lineWidth=.7;c.strokeStyle=INK;c.stroke();
        c.beginPath();c.moveTo(1.4,-26);c.lineTo(3.4,-26);c.lineTo(8.4,-14.5);c.lineTo(7.2,-12.5);c.closePath();c.fillStyle='#C2185B';c.fill();c.stroke();
        c.fillStyle='#FFD1E6';c.fillRect(-11,-13.6,24,1.6);
        c.fillStyle=HB.obi;c.fillRect(-11,-12,24,9.4);c.fillStyle=HB.obiS;c.fillRect(-11,-12,24,1.6);c.fillRect(-11,-4.4,24,1.8);
        line(c,[-11,-7.4,12,-7.4],1,HB.gold);c.beginPath();c.arc(3.4,-7.4,1.6,0,Math.PI*2);c.fillStyle=HB.gold;c.fill();c.lineWidth=.6;c.strokeStyle=INK;c.stroke();
        c.restore();
        c.save();body(c);c.lineWidth=1.4;c.strokeStyle=INK;c.stroke();c.restore();}},
      bow:{b:[-10,-9,5,9],d(c){
        cel(c,c=>{c.beginPath();c.ellipse(-4.6,-3.4,5,3.1,-.45,0,Math.PI*2);},HB.obi,HB.obiS,'#FF7DB6',.8,1.1);
        cel(c,c=>{c.beginPath();c.ellipse(-4.6,3.4,5,3.1,.45,0,Math.PI*2);},HB.obi,HB.obiS,'#FF7DB6',.8,1.1);
        cel(c,c=>{c.beginPath();c.arc(-.6,0,2.6,0,Math.PI*2);},HB.pink,HB.pinkS,'#FFFFFF',.5,1);
        line(c,[-2.6,-.8,1.4,.8],.8,HB.gold);}},
      hairB:{b:[-17,-16,10,20],d(c){
        const p=c=>{c.beginPath();c.ellipse(-1,-2,11.4,11.8,0,0,Math.PI*2);c.moveTo(-11.6,-3);c.quadraticCurveTo(-14.6,8,-11,17);c.lineTo(-7.6,13.6);c.lineTo(-5.2,17.4);c.lineTo(-2.6,11);c.quadraticCurveTo(-1,4,-1,-2);c.closePath();};
        cel(c,p,HB.hair,HB.hairS,HB.hairL,1.4,1.4);
        c.beginPath();c.arc(-1,-2,8.6,Math.PI*1.08,Math.PI*1.5);c.lineWidth=1.6;c.strokeStyle='rgba(150,130,235,.55)';c.stroke();}},
      hairF:{b:[-12,-16,14,15],d(c){
        const p=c=>{c.beginPath();c.moveTo(-7.4,-7.6);c.quadraticCurveTo(-2.4,-15.4,6.2,-12.8);c.quadraticCurveTo(10.8,-10.6,11.4,-5);c.lineTo(10,-2.2);c.lineTo(8.8,-5.6);c.lineTo(7.6,-1.4);
          c.lineTo(6,-5.8);c.lineTo(4,-2);c.lineTo(2.7,-6.2);c.lineTo(.6,-3.4);c.lineTo(-.6,-7.2);c.quadraticCurveTo(-4.2,-6.2,-7.4,-7.6);c.closePath();
          c.moveTo(-1.6,-6.2);c.quadraticCurveTo(-3.4,4.6,.2,12.6);c.lineTo(2,9.4);c.quadraticCurveTo(1.4,2,1.6,-5);c.closePath();};
        cel(c,p,HB.hair,HB.hairS,HB.hairL,1,1.3);
        c.beginPath();c.moveTo(1,-11.6);c.quadraticCurveTo(5,-12,8,-9.4);c.lineWidth=1.1;c.strokeStyle='rgba(160,140,240,.6)';c.stroke();}},
      kanzashi:{b:[-7,-6,7,15],d(c){
        line(c,[0,1,-.8,9.5],.5,HB.gold);line(c,[1.4,1.6,1.8,12],.5,HB.gold);
        [[-.8,10,'#FF5FA2'],[1.8,12.6,HB.gold],[-.8,7,'#FFFFFF']].forEach(([x,y,col])=>{c.beginPath();c.arc(x,y,.9,0,Math.PI*2);c.fillStyle=col;c.fill();c.lineWidth=.4;c.strokeStyle=INK;c.stroke();});
        blossom(c,-2.4,1.6,2.3,'#FF8FC8');blossom(c,2.3,2.2,2,'#FFC2DD');blossom(c,0,-1.2,2.7,'#FF6FB0');}},
      sword:{b:[-3.5,-10,3.5,42],d(c){
        cel(c,c=>{c.beginPath();c.moveTo(-1.6,-8.6);c.lineTo(1.6,-8.6);c.lineTo(1.5,2.6);c.lineTo(-1.5,2.6);c.closePath();},HB.tsuka,'#160C1E',null,.3,.9);
        c.fillStyle=HB.pink;for(let y=-7.4;y<2;y+=2.2){c.beginPath();c.moveTo(0,y);c.lineTo(1.2,y+1.1);c.lineTo(0,y+2.2);c.lineTo(-1.2,y+1.1);c.closePath();c.fill();}
        cel(c,c=>{c.beginPath();c.ellipse(0,-9.2,2,1.1,0,0,Math.PI*2);},HB.gold,HB.goldS,null,.3,.8);
        cel(c,c=>{c.beginPath();c.ellipse(0,3.4,3.3,1.3,0,0,Math.PI*2);},HB.gold,HB.goldS,'#FFF2B8',.4,.9);
        const bl=c=>{c.beginPath();c.moveTo(-1.15,4.6);c.quadraticCurveTo(-1.7,22,-.5,37.4);c.lineTo(.7,40.4);c.quadraticCurveTo(1.7,22,1.3,4.6);c.closePath();};
        c.save();bl(c);c.lineWidth=1.6;c.strokeStyle=INK;c.stroke();
        const g=c.createLinearGradient(-1.5,0,1.5,0);g.addColorStop(0,HB.bladeS);g.addColorStop(.55,HB.blade);g.addColorStop(1,'#FFFFFF');c.fillStyle=g;c.fill();c.clip();
        c.beginPath();c.moveTo(.6,5);c.quadraticCurveTo(1.25,22,.4,38);c.lineWidth=.9;c.strokeStyle=HB.edge;c.stroke();c.restore();}},
      glow:{b:[-8,-2,8,46],d(c){c.shadowColor='#FF5FA2';c.shadowBlur=5*S;c.fillStyle='rgba(255,120,190,.85)';
        for(let i=0;i<2;i++){c.beginPath();c.moveTo(-1.6,4.6);c.quadraticCurveTo(-2.2,22,-.7,37.6);c.lineTo(.8,40.8);c.quadraticCurveTo(2.2,22,1.8,4.6);c.closePath();c.fill();}}},
      saya:{b:[-3,-2,3,33],d(c){cel(c,c=>capsule(c,4.2,3.4,30),HB.saya,'#170717','rgba(255,120,200,.5)',.6,1.1);
        c.fillStyle=HB.gold;c.fillRect(-2.1,-.6,4.2,1.6);c.fillStyle=HB.pink;c.fillRect(-2.2,5,4.4,1.2);c.fillRect(-2.2,8,4.4,1.2);}},
      head_idle:{b:[-15,-15,15,20],d:hanaHead('idle')},
      head_attack:{b:[-15,-15,15,20],d:hanaHead('attack')},
      head_hurt:{b:[-15,-15,15,20],d:hanaHead('hurt')},
      head_blink:{b:[-15,-15,15,20],d:hanaHead('blink')}
    },
    poses:{
      stand:{wr:.55,fa1:.45,fa2:.95,ba1:-.25,ba2:.7},
      jabW:{lean:-.05,fa1:2.5,fa2:.35,wr:.7,ba1:-.4,ba2:.9},
      jab:{lean:.32,fa1:1.25,fa2:.05,wr:-.25,ba1:-.6,ba2:.6},
      crossW:{lean:0,fa1:-.35,fa2:1.5,wr:1.3,ba1:.2,ba2:1.2},
      cross:{lean:.38,fa1:1.6,fa2:0,wr:.08,ba1:-.7,ba2:.5},
      kickW:{wr:1.1,fa1:.6,fa2:1.4},kick:{wr:1.3,fa1:.9,fa2:1.2},
      finW:{lean:-.22,fa1:-1.15,fa2:.6,wr:-.9,ba1:.8,ba2:1.4},
      fin:{lean:.5,fa1:2.15,fa2:.08,wr:.35,ba1:-1,ba2:.5},
      upW:{fa1:.15,fa2:.5,wr:.25},up:{fa1:3,fa2:.05,wr:.08,ba1:-.5,ba2:.7},
      sweepW:{fa1:1,fa2:.4,wr:.9},sweep:{fa1:1.15,fa2:.15,wr:.2},
      spikeW:{fa1:2.95,fa2:.35,wr:.45},spike:{fa1:.95,fa2:.1,wr:.15},
      dash:{fa1:-1.05,fa2:.25,wr:-1.25},
      guard:{fa1:.95,fa2:1.25,wr:.35,ba1:1,ba2:1.9},
      hurt:{wr:.6},dizzy:{wr:1.2,fa1:.2,fa2:.4},
      cast:{lean:.15,fa1:2.75,fa2:.15,wr:.15,ba1:1.5,ba2:.05},
      charge:{fa1:.35,fa2:1.4,wr:1.45,ba1:.9,ba2:1.6},
      throw:{fa1:2.6,fa2:.2,wr:.2,ba1:1.4,ba2:0},
      jump:{wr:1},fall:{wr:.5,fa1:1.4,fa2:.5},hover:{wr:.8},
      victory:{lean:-.06,fa1:2.95,fa2:.15,wr:.1,ba1:.5,ba2:2,fl1:.42,fl2:-.42,bl1:-.42,bl2:-.2}
    },
    idle:(t)=>{const b=Math.sin(t*3);return {fa1:.45+b*.02,fa2:.95,wr:.6+b*.04,ba1:-.25,ba2:.7};},
    run:(ph)=>({lean:.36,fa1:-.55+Math.sin(ph)*.15,fa2:.35,wr:-1.15,ba1:Math.sin(ph)*.8+.3,ba2:1.3}),
    render(c,f,t,j,m){
      const id='hana_bloom',bk=m||'shade',fc=f.face||1;
      /* hair (long, behind everything) */
      const h2=chain(f,'h2',6,4,hl(j,-3,6.4),[-.3,.95],{g:560,bias:380,damp:.85,fl:[120,3.6]});
      const h1=chain(f,'h1',8,4.4,hl(j,-7.4,2.2),[-.5,.86],{g:520,bias:420,damp:.86,fl:[160,3.2]});
      ribbon(c,h2,6,1.4,mc(HB.hairS,m),m,true);ribbon(c,h1,9.4,1.8,mc(HB.hair,m),m,true);
      if(!m){c.save();c.globalAlpha=.55;c.beginPath();c.moveTo(h1[1][0],h1[1][1]);for(let i=2;i<5;i++)c.lineTo(h1[i][0]-1,h1[i][1]);c.lineWidth=1.2;c.strokeStyle=HB.hairL;c.stroke();c.restore();}
      /* obi tails */
      const o2=chain(f,'o2',5,4.2,tl(j,-8,-4),[-.15,.99],{g:650,bias:300,fl:[220,4.6]});
      const o1=chain(f,'o1',5,4.6,tl(j,-8.6,-6.5),[-.35,.94],{g:600,bias:320,fl:[260,4]});
      ribbon(c,o2,4.6,4.2,mc(HB.obiS,m),m);ribbon(c,o1,5,4.6,mc(HB.obi,m),m);
      if(!m){const e=o1[o1.length-1];c.beginPath();c.arc(e[0],e[1],1.3,0,Math.PI*2);c.fillStyle=HB.gold;c.fill();}
      /* back arm + its long furisode sleeve */
      sleeve(c,f,'sb',j.bE,j.bW,mc(HB.kimS,m),mc(HB.pinkS,m),m);
      part(c,id,'uarm',j.bSh[0],j.bSh[1],j.bU,bk);part(c,id,'farm',j.bE[0],j.bE[1],j.bF,bk);part(c,id,'hand',j.bW[0],j.bW[1],j.bF,bk);
      /* sheath at the back hip */
      const sp=tl(j,-5,-5);part(c,id,'saya',sp[0],sp[1],-.62-j.lean*.6,m);
      /* back leg + back skirt panel */
      part(c,id,'thigh',-2,j.hy,j.bT,bk);part(c,id,'shin',j.bK[0],j.bK[1],j.bS,bk);part(c,id,'foot',j.bA[0],j.bA[1],-j.bS*.2,bk);
      skirt(c,j,j.bT,mc(HB.kimS,m),mc(HB.pinkS,m),m,false);
      const bw=tl(j,-9,-8);part(c,id,'bow',bw[0],bw[1],-j.lean,m);
      part(c,id,'torso',0,j.hy,-j.lean,m);
      part(c,id,'thigh',0,j.hy,j.fT,m);part(c,id,'shin',j.fK[0],j.fK[1],j.fS,m);part(c,id,'foot',j.fA[0],j.fA[1],-j.fS*.2,m);
      skirt(c,j,j.fT,mc(HB.kim,m),mc(HB.pink,m),m,true);
      /* head */
      const HS=1.14;part(c,id,'hairB',j.head[0],j.head[1],-j.ha,m,HS);
      part(c,id,'head_'+face(f),j.head[0],j.head[1],-j.ha,m,HS);
      part(c,id,'hairF',j.head[0],j.head[1],-j.ha,m,HS);
      const kz=hl(j,-5*HS,-9.5*HS);part(c,id,'kanzashi',kz[0],kz[1],-j.ha-Math.sin(t*3+(f.id||0))*.08,m,HS);
      if(m==='void')voidEyes(c,j,[[5.6*HS,1.6*HS],[9.8*HS,1.5*HS]]);
      /* front arm, katana, sleeve */
      part(c,id,'uarm',j.fSh[0],j.fSh[1],j.fU,m);part(c,id,'farm',j.fE[0],j.fE[1],j.fF,m);
      const lit=f.act||f.sup||f.castT>0||f.charge!=null||(f.awake>0);
      if(lit&&!silent(m)){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.55+.25*Math.sin(t*20);part(c,id,'glow',j.fW[0],j.fW[1],j.fWp,m==='void'?'#FF2E63':null);c.restore();}
      part(c,id,'sword',j.fW[0],j.fW[1],j.fWp,m);
      part(c,id,'hand',j.fW[0],j.fW[1],j.fF,m);
      sleeve(c,f,'sf',j.fE,j.fW,mc(HB.kim,m),mc(HB.pink,m),m);
      const tip=along(j.fW,j.fWp,39),mid=along(j.fW,j.fWp,12);
      f._hand=tip;f._foot=j.fA;f._artSlash=true;
      if(!silent(m))slash(c,f,t,'blade',tip,mid,m==='void'?'#FF2E63':'#FF7DBA',activeWin(f)||(f.sup&&f.sup.t<.6));
    }
  };
  function sleeve(c,f,key,E,W,fill,hem,m){
    const an=[E[0]+(W[0]-E[0])*.55,E[1]+(W[1]-E[1])*.55];
    const ch=chain(f,key,4,4.6,an,[-.2,.98],{g:820,bias:220,damp:.82});
    ribbon(c,[E].concat(ch),6.4,12.8,fill,m);
    ribbon(c,ch.slice(-2),12.2,12.8,hem,m);
  }
  function skirt(c,j,ang,fill,hem,m,front,deco){
    const A=tl(j,-8.4,-1.8),B=tl(j,8.8,-1.8),cx=Math.sin(ang)*15,cy=j.hy+Math.cos(ang)*15,px=Math.cos(ang),py=-Math.sin(ang),w=front?9.6:8.6;
    const C=[cx+px*w,cy+py*w],D=[cx-px*w,cy-py*w];
    const p=c=>{c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.quadraticCurveTo((B[0]+C[0])/2+px*1.5,(B[1]+C[1])/2,C[0],C[1]);
      c.quadraticCurveTo(cx+px*w*.3,cy+2.4,cx,cy+.6);c.quadraticCurveTo(cx-px*w*.4,cy+2.2,D[0],D[1]);c.quadraticCurveTo((A[0]+D[0])/2-px*1.2,(A[1]+D[1])/2,A[0],A[1]);c.closePath();};
    c.save();p(c);c.lineWidth=2.6;c.strokeStyle=silent(m)?fill:INK;c.lineJoin='round';c.stroke();c.fillStyle=fill;c.fill();c.clip();
    c.beginPath();c.moveTo(C[0]-px*1+0,C[1]-3.4);c.lineTo(D[0],D[1]-3.4);c.lineTo(D[0],D[1]+4);c.lineTo(C[0],C[1]+4);c.closePath();c.fillStyle=hem;c.fill();
    if(!silent(m)){line(c,[(A[0]+B[0])/2,A[1],cx,cy],.6,'rgba(22,10,36,.45)');line(c,[A[0]*.4+B[0]*.6+2,A[1],cx+px*w*.55,cy+py*w*.55],.6,'rgba(22,10,36,.35)');
      if(front&&!m&&deco!==false){blossom(c,cx-px*3,cy-6,1.6,'#FFA6CF');}}
    c.restore();
  }
  function voidEyes(c,j,pts){c.save();c.globalCompositeOperation='lighter';pts.forEach(([x,y])=>{const p=hl(j,x,y);c.beginPath();c.ellipse(p[0],p[1],1.9,1.1,j.ha,0,Math.PI*2);c.fillStyle='rgba(255,46,99,.95)';c.fill();
    c.beginPath();c.ellipse(p[0],p[1],4,2.4,j.ha,0,Math.PI*2);c.fillStyle='rgba(255,46,99,.3)';c.fill();});c.restore();}

  /* =================================================================
     SHADOW ASSASSIN  (Shinobi Clan grunt · rift-corrupted shinobi with twin tanto)
     ================================================================= */
  const SA={cloth:'#221E33',clothS:'#131020',wrap:'#3A3452',armor:'#3E3250',armorS:'#251D33',armorL:'#7C6A9A',red:'#FF2E4D',redD:'#8E0F2C',steel:'#D3D8EC',steelS:'#7D84A6',hood:'#191626',hoodS:'#0E0C17',scarf:'#B3123A',scarfS:'#6E0A23'};
  function saHead(kind){return function(c){
    const hood=c=>{c.beginPath();c.moveTo(-11.6,6);c.quadraticCurveTo(-14,-6,-6.5,-12.2);c.quadraticCurveTo(-1,-14.6,6,-11.6);c.quadraticCurveTo(11.2,-8.2,11.4,-1);c.lineTo(10.8,9);c.quadraticCurveTo(4,11.6,-4,11);c.closePath();
      c.moveTo(-6.5,-12.2);c.quadraticCurveTo(-13,-15.6,-17.4,-11.4);c.quadraticCurveTo(-12.6,-10.8,-10.8,-7.6);c.closePath();};
    cel(c,hood,SA.hood,SA.hoodS,SA.armorL,1.2,1.4);
    cel(c,c=>{c.beginPath();c.moveTo(-1,-3.6);c.quadraticCurveTo(6,-5.6,10.6,-4);c.lineTo(10.8,3);c.quadraticCurveTo(4,4.4,-1,3.2);c.closePath();},'#0B0911','#05040A',null,.4,1);
    cel(c,c=>{c.beginPath();c.moveTo(-1.4,3);c.quadraticCurveTo(5,4.6,10.9,2.8);c.lineTo(10.6,9.4);c.quadraticCurveTo(3.6,11.4,-2,9.6);c.closePath();},SA.cloth,SA.clothS,SA.armorL,.6,1.2);
    line(c,[2,6.2,9.6,5.6],.5,'rgba(124,106,154,.6)');
    c.save();c.shadowColor=SA.red;c.shadowBlur=3*S;c.fillStyle=kind==='hurt'?'#FF8A9E':SA.red;
    if(kind==='hurt'){line(c,[3,-2,5.6,1.4],1.1,'#FF8A9E');line(c,[5.6,-2,3,1.4],1.1,'#FF8A9E');line(c,[8.2,-2,10,1.2],1,'#FF8A9E');line(c,[10,-2,8.2,1.2],1,'#FF8A9E');}
    else{const n=kind==='attack'?.75:1.25;
      c.beginPath();c.moveTo(2.4,-.2-n*.3);c.lineTo(6.8,-1.4);c.lineTo(6.2,.2+n*.6);c.lineTo(2.6,.8);c.closePath();c.fill();
      c.beginPath();c.moveTo(8.2,-1.3);c.lineTo(10.6,-2);c.lineTo(10.5,.2+n*.4);c.lineTo(8.3,.5);c.closePath();c.fill();}
    c.restore();
    c.save();c.globalAlpha=.85;line(c,[-9,-3,-6.6,1,-8.4,4.4],.8,SA.red);c.restore();
  };}
  defs.shadow_assassin={name:'Shadow Assassin',len:{th:17,sh:18,ft:3,to:23,hd:10,ua:12.5,fa:12.5},
    parts:{
      thigh:{b:[-6,-5,6,21],d(c){cel(c,c=>capsule(c,8.4,6.6,17),SA.cloth,SA.clothS,SA.armorL,1.2);
        c.save();capsule(c,8.4,6.6,17);c.clip();for(let y=3;y<17;y+=3.6)line(c,[-5,y,5,y+1.8],.8,SA.wrap);c.restore();}},
      shin:{b:[-6,-5,6,21],d(c){cel(c,c=>capsule(c,6.8,5.6,18),SA.cloth,SA.clothS,null,1);
        c.save();capsule(c,6.8,5.6,18);c.clip();for(let y=2;y<17;y+=2.6){line(c,[-4,y,4,y+1.4],.7,SA.wrap);}c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(.6,-1.8);c.quadraticCurveTo(5.4,1,4,13);c.lineTo(1.2,13);c.closePath();},SA.armor,SA.armorS,SA.armorL,.5,1);
        c.save();c.shadowColor=SA.red;c.shadowBlur=2*S;line(c,[2.6,1,2.6,11.4],.6,SA.red);c.restore();}},
      foot:{b:[-5,-5,10,5],d(c){cel(c,c=>{c.beginPath();c.moveTo(-3.4,-3.4);c.lineTo(2,-3.4);c.quadraticCurveTo(6.8,-2,8,1.2);c.lineTo(7.8,3.2);c.lineTo(-3.6,3.2);c.closePath();},SA.hood,SA.hoodS,SA.armorL,.6,1.1);
        line(c,[4.4,-1,4.6,3],.6,INK);}},
      uarm:{b:[-6,-5,6,16],d(c){cel(c,c=>capsule(c,7.4,6.2,12.5),SA.cloth,SA.clothS,SA.armorL,1);}},
      farm:{b:[-5,-4,5,16],d(c){cel(c,c=>capsule(c,6.2,5.2,12.5),SA.armor,SA.armorS,SA.armorL,.8,1.2);
        c.save();c.shadowColor=SA.red;c.shadowBlur=2.5*S;line(c,[1.4,2.4,-.6,5.4,1.2,8.2,-.4,10.6],.75,SA.red);c.restore();}},
      hand:{b:[-5,-5,5,5],d(c){cel(c,c=>{c.beginPath();c.arc(0,.4,3.2,0,Math.PI*2);},SA.hood,SA.hoodS,SA.armorL,.5,1.1);}},
      pauldron:{b:[-7,-6,7,9],d(c){
        cel(c,c=>{c.beginPath();c.moveTo(-5.6,-3.2);c.quadraticCurveTo(0,-6.4,5.8,-3);c.lineTo(5,3.4);c.quadraticCurveTo(0,1.8,-5.2,3.6);c.closePath();},SA.armor,SA.armorS,SA.armorL,.8,1.1);
        cel(c,c=>{c.beginPath();c.moveTo(-5,2.2);c.quadraticCurveTo(0,.6,5.2,2.2);c.lineTo(4.6,7.2);c.quadraticCurveTo(0,5.8,-4.6,7.4);c.closePath();},SA.armor,SA.armorS,SA.armorL,.7,1.1);
        line(c,[-5,2.2,5.2,2.2],.6,SA.red);}},
      torso:{b:[-11,-28,11,4],d(c){
        const body=c=>{c.beginPath();c.moveTo(-6.6,2);c.lineTo(6.6,2);c.quadraticCurveTo(8.4,-9,8.2,-16);c.quadraticCurveTo(8,-22.6,3.6,-24.6);c.lineTo(-4,-24.6);c.quadraticCurveTo(-8.8,-22.6,-8.8,-16);c.quadraticCurveTo(-8.6,-8,-6.6,2);c.closePath();};
        cel(c,body,SA.cloth,SA.clothS,SA.armorL,1.4,1.4);
        c.save();body(c);c.clip();
        cel(c,c=>{c.beginPath();c.moveTo(-1,-23);c.quadraticCurveTo(7.6,-22,8.6,-14);c.lineTo(7.6,-8);c.quadraticCurveTo(2,-10,-1,-12);c.closePath();},SA.armor,SA.armorS,SA.armorL,.8,1.1);
        c.shadowColor=SA.red;c.shadowBlur=2.5*S;line(c,[2,-21,4.4,-17,2.8,-14.4,5.6,-11.6],.75,SA.red);line(c,[4.4,-17,7,-18.4],.6,SA.red);c.shadowBlur=0;
        c.fillStyle=SA.redD;c.fillRect(-10,-5,20,3.4);line(c,[-10,-5,10,-5],.6,SA.red);
        c.restore();
        cel(c,c=>{c.beginPath();c.ellipse(-3.4,-3.3,2.2,1.8,0,0,Math.PI*2);},SA.scarf,SA.scarfS,null,.4,.9);}},
      blade:{b:[-3.5,-10,3.5,40],d(c){
        cel(c,c=>{c.beginPath();c.rect(-1.5,-9,3,11);},'#14111E','#05040A',null,.3,.9);
        c.fillStyle=SA.red;for(let y=-8;y<1.5;y+=2.4){c.beginPath();c.moveTo(0,y);c.lineTo(1.2,y+1.2);c.lineTo(0,y+2.4);c.lineTo(-1.2,y+1.2);c.closePath();c.fill();}
        cel(c,c=>{c.beginPath();c.ellipse(0,2.6,3.2,1.2,0,0,Math.PI*2);},SA.armor,SA.armorS,SA.armorL,.3,.8);
        const bl=c=>{c.beginPath();c.moveTo(-1.1,3.8);c.quadraticCurveTo(-1.6,20,-.4,34.4);c.lineTo(.8,37.4);c.quadraticCurveTo(1.7,20,1.3,3.8);c.closePath();};
        c.save();bl(c);c.lineWidth=1.5;c.strokeStyle=INK;c.stroke();const g=c.createLinearGradient(-1.4,0,1.4,0);g.addColorStop(0,SA.steelS);g.addColorStop(.6,SA.steel);g.addColorStop(1,'#FFFFFF');c.fillStyle=g;c.fill();c.clip();
        c.shadowColor=SA.red;c.shadowBlur=2*S;c.beginPath();c.moveTo(.8,4.2);c.quadraticCurveTo(1.3,20,.5,35.5);c.lineWidth=.9;c.strokeStyle=SA.red;c.stroke();c.restore();}},
      head_idle:{b:[-19,-17,13,13],d:saHead('idle')},
      head_attack:{b:[-19,-17,13,13],d:saHead('attack')},
      head_hurt:{b:[-19,-17,13,13],d:saHead('hurt')},
      head_blink:{b:[-19,-17,13,13],d:saHead('idle')}
    },
    poses:{
      stand:{lean:.28,fl1:.75,fl2:-1.25,bl1:-.45,bl2:-.95,fa1:.85,fa2:.9,wr:.75,ba1:-.25,ba2:1.5},
      jabW:{lean:.05,fa1:2.4,fa2:.4,wr:.7,ba1:-.4,ba2:1.2,fl1:.7,fl2:-1.1,bl1:-.5,bl2:-.8},
      jab:{lean:.45,fa1:1.3,fa2:.05,wr:-.2,ba1:-.6,ba2:1,fl1:.9,fl2:-.7,bl1:-.7,bl2:-.2},
      crossW:{lean:.05,fa1:-.35,fa2:1.5,wr:1.3,ba1:.2,ba2:1.4},
      cross:{lean:.5,fa1:1.6,fa2:0,wr:.1,ba1:-.7,ba2:.8,fl1:.9,fl2:-.7,bl1:-.7,bl2:-.2},
      finW:{lean:-.15,fa1:-1.1,fa2:.6,wr:-.9,ba1:.8,ba2:1.4},fin:{lean:.6,fa1:2.1,fa2:.1,wr:.35,ba1:-1,ba2:.6},
      guard:{fa1:1,fa2:1.3,wr:.4,ba1:1,ba2:1.9},
      jump:{lean:.3,fl1:1.2,fl2:-2,bl1:.5,bl2:-1.7,fa1:-.6,fa2:.8,ba1:-.9,ba2:.6,wr:1},
      fall:{lean:.15,fa1:.9,fa2:.6,ba1:-.8,ba2:.6,wr:.8},
      hurt:{wr:.6},dizzy:{wr:1.2},dash:{lean:.75,fa1:-1.1,fa2:.25,ba1:-1.3,ba2:.2,wr:-1.2},cast:{fa1:1.5,fa2:0,wr:.2}
    },
    idle:(t)=>{const b=Math.sin(t*4);return {lean:.28+b*.02,fl1:.75,fl2:-1.25,bl1:-.45,bl2:-.95,fa1:.85+b*.03,fa2:.9,wr:.75,ba1:-.25,ba2:1.5};},
    run:(ph)=>({lean:.62,fa1:-1.1,fa2:.25,ba1:-1.25,ba2:.2,wr:-1.2}),
    render(c,f,t,j,m){
      const id='shadow_assassin',bk=m||'shade';
      /* red-lined cape (two layers) */
      const c2=chain(f,'c2',6,4.6,tl(j,-5,-22),[-.45,.9],{g:520,bias:520,damp:.86,fl:[420,5]});
      const c1=chain(f,'c1',6,5,tl(j,-6.5,-21),[-.6,.8],{g:480,bias:600,damp:.86,fl:[520,4.4]});
      ribbon(c,c2,9,6,mc(SA.scarf,m),m,true);ribbon(c,c1,8,3,mc(SA.hood,m),m,true);
      /* ponytail with a red tie */
      const pt=chain(f,'pt',7,4,hl(j,-7.5,-6),[-.9,.35],{g:300,bias:900,damp:.87,fl:[700,6]});
      ribbon(c,pt,5,1.4,mc('#22234A',m),m,true);
      if(!silent(m)){c.beginPath();c.arc(pt[0][0],pt[0][1],1.8,0,Math.PI*2);c.fillStyle=mc(SA.red,m);c.fill();
        const r1=chain(f,'r1',3,3.4,pt[0],[-.6,.8],{g:500,bias:400,fl:[500,7]});ribbon(c,r1,1.8,1,mc(SA.red,m),m,true);}
      part(c,id,'uarm',j.bSh[0],j.bSh[1],j.bU,bk);part(c,id,'farm',j.bE[0],j.bE[1],j.bF,bk);part(c,id,'hand',j.bW[0],j.bW[1],j.bF,bk);
      part(c,id,'thigh',-2,j.hy,j.bT,bk);part(c,id,'shin',j.bK[0],j.bK[1],j.bS,bk);part(c,id,'foot',j.bA[0],j.bA[1],-j.bS*.2,bk);
      part(c,id,'torso',0,j.hy,-j.lean,m);
      part(c,id,'thigh',0,j.hy,j.fT,m);part(c,id,'shin',j.fK[0],j.fK[1],j.fS,m);part(c,id,'foot',j.fA[0],j.fA[1],-j.fS*.2,m);
      part(c,id,'head_'+face(f),j.head[0],j.head[1],-j.ha,m);
      part(c,id,'uarm',j.fSh[0],j.fSh[1],j.fU,m);
      part(c,id,'pauldron',j.fSh[0],j.fSh[1]+1,-j.lean-(j.fU-.6)*.35,m);
      part(c,id,'farm',j.fE[0],j.fE[1],j.fF,m);
      part(c,id,'blade',j.fW[0],j.fW[1],j.fWp,m);part(c,id,'hand',j.fW[0],j.fW[1],j.fF,m);
      if(!silent(m)){
        c.save();c.globalCompositeOperation='lighter';
        for(let i=0;i<3;i++){const ph=(t*.9+i*.37+(f.id||0)*.13)%1;const b=tl(j,-3+i*3,-22);c.globalAlpha=(1-ph)*.8;c.fillStyle='#FF3A5C';
          c.beginPath();c.arc(b[0]-ph*6,b[1]-ph*16,1.1*(1-ph)+.3,0,Math.PI*2);c.fill();}
        c.restore();
        const on=activeWin(f)||f.punchT>0;
        slash(c,f,t,'fb',along(j.fW,j.fWp,36),along(j.fW,j.fWp,10),'#FF2E4D',on);
      }
      f._hand=along(j.fW,j.fWp,34);f._foot=j.fA;f._artSlash=true;
    }
  };

  /* shared anime eye renderer for the newer characters (Hana keeps her own) */
  function eyes(c,kind,o){
    if(kind==='blink'){line(c,[2.6,1.4,5.2,2.4,7.6,1.2],1.2,INK);line(c,[8.4,1.2,10.2,1.9],1,INK);return;}
    if(kind==='hurt'){line(c,[3,-.6,6.4,1.4,3,3.2],1.3,INK);line(c,[10.6,-.4,8.8,1.4,10.6,3],1.1,INK);return;}
    const at=kind==='attack',sq=o.stern?.78:1,h=(at?2.6:3.3)*sq,ih=(at?2.2:2.8)*sq;
    [[5.1,1.3,2.4,h,1.75,ih],[9.5,1.2,1.3,h*.9,1.05,ih*.9]].forEach(([x,y,rx,ry,irx,iry],i)=>{
      c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle='#FFFFFF';c.fill();
      const g=c.createLinearGradient(0,y-iry,0,y+iry);g.addColorStop(0,o.irisD);g.addColorStop(.6,o.iris);g.addColorStop(1,o.irisL);
      c.beginPath();c.ellipse(x+.55,y+.3,irx,iry,0,0,Math.PI*2);c.fillStyle=g;c.fill();
      c.beginPath();if(o.slit)c.ellipse(x+.7,y+.3,irx*.2,iry*.75,0,0,Math.PI*2);else c.ellipse(x+.7,y+.3,irx*.42,iry*.48,0,0,Math.PI*2);c.fillStyle='#0E0712';c.fill();
      c.beginPath();c.arc(x+1.25,y-iry*.45,.7,0,Math.PI*2);c.fillStyle='#FFFFFF';c.fill();
      if(i===0){c.beginPath();c.moveTo(x-rx-.5,y-ry*.5);c.quadraticCurveTo(x,y-ry-1.2,x+rx+.4,y-ry*.75);c.lineWidth=1.35;c.strokeStyle=INK;c.stroke();
        if(o.lash)line(c,[x-rx-.5,y-ry*.5,x-rx-1.9,y-ry*.95],1,INK);}
      else{c.beginPath();c.moveTo(x-rx,y-ry*.8);c.quadraticCurveTo(x,y-ry-.9,x+rx+.2,y-ry*.4);c.lineWidth=1.1;c.strokeStyle=INK;c.stroke();}
    });
    const bc=o.brow||INK;
    if(at||o.stern){line(c,[2.4,-4.2+(at?0:.6),7.4,-2.6],1.15,bc);line(c,[8.6,-2.8,10.8,-3.9],1,bc);}
    else{line(c,[2.6,-4.6,7,-4.9],.85,bc);line(c,[8.7,-4.8,10.4,-4.5],.75,bc);}
  }
  function faceShape(c,skin,skinS){
    const fp=c=>{c.beginPath();c.ellipse(0,-1,9.6,10.2,0,0,Math.PI*2);c.moveTo(-2.2,6);c.lineTo(3,9.8);c.lineTo(6.6,8.7);c.lineTo(9,4.4);c.lineTo(9.4,0);c.lineTo(0,0);c.closePath();};
    c.save();fp(c);c.lineWidth=2.8;c.strokeStyle=INK;c.stroke();c.fillStyle=skin;c.fill();c.clip();
    c.beginPath();c.ellipse(-6.5,0,6.5,12,0,0,Math.PI*2);c.fillStyle=skinS;c.fill();c.restore();
  }

  /* =================================================================
     NYANJA  (Shinobi Clan · agile cat-eared kunoichi: kunai, shuriken, tail)
     ================================================================= */
  const NY={fur:'#F4F1FA',furS:'#C6C0DC',furL:'#FFFFFF',pink:'#FF4F9A',pinkS:'#B92A68',navy:'#25254A',navyS:'#15152C',navyL:'#6262A8',
    wrap:'#F4DCE8',wrapS:'#C9A2BA',skin:'#FFE1D2',skinS:'#EDB5A0',steel:'#E0E6F4',steelS:'#8790B0',gold:'#FFCB55'};
  function nyHead(kind){return function(c){
    cel(c,c=>capsule(c,4.4,4,7.5),NY.skin,NY.skinS,null,.6,1.2);
    faceShape(c,NY.skin,NY.skinS);
    eyes(c,kind,{iris:'#22C7B8',irisD:'#0B4F4A',irisL:'#9FF5EC',slit:true,lash:true,brow:'#8A84A8'});
    /* pink scarf mask over the nose and mouth */
    cel(c,c=>{c.beginPath();c.moveTo(-3.2,3.2);c.quadraticCurveTo(4,4.6,10.6,3.6);c.lineTo(10.2,8.6);c.quadraticCurveTo(5,11.4,-2.6,9.8);c.closePath();},NY.pink,NY.pinkS,'#FF9AC6',.7,1.2);
    line(c,[0,6.4,9.2,6],.5,'rgba(22,10,36,.45)');
    if(kind==='attack')line(c,[5.8,7.4,8.6,7.2],.6,'rgba(22,10,36,.6)');
  };}
  defs.nyanja={name:'Nyanja',len:{th:16,sh:17,ft:3,to:21,hd:10,ua:11,fa:11},
    parts:{
      thigh:{b:[-6,-5,6,21],d(c){cel(c,c=>capsule(c,8.4,6.6,16),NY.wrap,NY.wrapS,'#FFFFFF',1.1);
        c.save();capsule(c,8.4,6.6,16);c.clip();for(let y=8;y<17;y+=2.6)line(c,[-5,y,5,y+1.4],.6,NY.wrapS);
        c.fillStyle=NY.navy;c.fillRect(-6,-6,12,13);c.fillStyle=NY.pink;c.fillRect(-6,6,12,1.4);c.restore();
        c.save();capsule(c,8.4,6.6,16);c.lineWidth=1.3;c.strokeStyle=INK;c.stroke();c.restore();}},
      shin:{b:[-6,-5,6,21],d(c){cel(c,c=>capsule(c,6.6,5.4,17),NY.wrap,NY.wrapS,'#FFFFFF',1);
        c.save();capsule(c,6.6,5.4,17);c.clip();for(let y=2;y<17;y+=2.4)line(c,[-4,y,4,y+1.3],.55,NY.wrapS);c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(.4,-1.6);c.quadraticCurveTo(5,1,3.8,12);c.lineTo(.8,12);c.closePath();},NY.navy,NY.navyS,NY.navyL,.5,1);
        line(c,[1.6,1,1.6,10.6],.7,NY.pink);}},
      foot:{b:[-5,-5,10,5],d(c){cel(c,c=>{c.beginPath();c.moveTo(-3.3,-3.2);c.lineTo(1.8,-3.2);c.quadraticCurveTo(6.6,-1.8,7.8,1.2);c.lineTo(7.6,3.1);c.lineTo(-3.5,3.1);c.closePath();},NY.navy,NY.navyS,NY.navyL,.6,1.1);
        line(c,[4.2,-.8,4.4,3],.6,INK);}},
      uarm:{b:[-6,-5,6,15],d(c){cel(c,c=>capsule(c,6.6,5.8,11),NY.skin,NY.skinS,null,.8,1.2);
        cel(c,c=>{c.beginPath();c.rect(-3.6,1.2,7.2,2.6);},NY.pink,NY.pinkS,null,.3,.9);}},
      farm:{b:[-5,-4,5,15],d(c){cel(c,c=>capsule(c,5.8,5,11),NY.pink,NY.pinkS,'#FF9AC6',.8,1.2);
        c.save();capsule(c,5.8,5,11);c.clip();for(let y=1;y<11;y+=2.2)line(c,[-3.4,y,3.4,y+1.2],.55,NY.pinkS);c.restore();
        cel(c,c=>{c.beginPath();c.rect(-3,7.6,6,3.2);},NY.navy,NY.navyS,null,.3,.9);}},
      hand:{b:[-5,-5,5,5],d(c){cel(c,c=>{c.beginPath();c.arc(0,.4,3.1,0,Math.PI*2);},NY.navy,NY.navyS,NY.navyL,.5,1.1);
        c.beginPath();c.arc(1.6,-.6,1.2,0,Math.PI*2);c.fillStyle=NY.skin;c.fill();}},
      torso:{b:[-11,-27,11,5],d(c){
        const body=c=>{c.beginPath();c.moveTo(-6.4,2.5);c.lineTo(6.8,2.5);c.quadraticCurveTo(8.4,-8,7.8,-14.5);c.quadraticCurveTo(7.4,-20.6,3.4,-22.4);c.lineTo(-3.8,-22.4);c.quadraticCurveTo(-8.4,-20.6,-8.4,-14.5);c.quadraticCurveTo(-8.4,-7,-6.4,2.5);c.closePath();};
        cel(c,body,NY.navy,NY.navyS,NY.navyL,1.3,1.4);
        c.save();body(c);c.clip();
        c.beginPath();c.moveTo(-2.4,-23);c.lineTo(.6,-23);c.lineTo(6,-11);c.lineTo(3.6,-11);c.closePath();c.fillStyle=NY.pink;c.fill();
        c.fillStyle=NY.pink;c.fillRect(-10,-9,20,4.2);c.fillStyle=NY.pinkS;c.fillRect(-10,-5.6,20,1);
        c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(1,-5);c.lineTo(7.6,-5);c.lineTo(7,4.6);c.lineTo(1.6,4.6);c.closePath();},NY.navy,NY.navyS,NY.navyL,.5,1.1);
        c.fillStyle=NY.pink;c.beginPath();c.arc(4.3,-.4,1.3,0,Math.PI*2);c.fill();[[3,-2.4],[4.3,-2.9],[5.6,-2.4]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,.55,0,Math.PI*2);c.fill();});}},
      ninjato:{b:[-3,-6,3,30],d(c){
        cel(c,c=>{c.beginPath();c.rect(-1.4,-5.6,2.8,7);},NY.pink,NY.pinkS,null,.3,.9);
        cel(c,c=>{c.beginPath();c.rect(-2.6,1.2,5.2,1.6);},NY.gold,'#B9862A',null,.3,.8);
        cel(c,c=>capsule(c,3.2,2.8,25),NY.navy,NY.navyS,NY.navyL,.5,1);
        line(c,[-1.6,8,1.6,8],.8,NY.pink);}},
      kunai:{b:[-3,-8,3,16],d(c){
        c.beginPath();c.arc(0,-6,1.6,0,Math.PI*2);c.lineWidth=1;c.strokeStyle=INK;c.stroke();
        cel(c,c=>{c.beginPath();c.rect(-1,-4.6,2,6);},NY.navy,NY.navyS,null,.3,.8);
        c.fillStyle=NY.pink;for(let y=-4;y<1;y+=1.6)c.fillRect(-1,y,2,.6);
        const bl=c=>{c.beginPath();c.moveTo(0,1.6);c.lineTo(2.2,5);c.lineTo(0,14.6);c.lineTo(-2.2,5);c.closePath();};
        c.save();bl(c);c.lineWidth=1.3;c.strokeStyle=INK;c.stroke();c.fillStyle=NY.steelS;c.fill();c.clip();c.fillStyle=NY.steel;c.fillRect(0,1,3,14);c.restore();}},
      shuriken:{b:[-6,-6,6,6],d(c){c.beginPath();for(let i=0;i<8;i++){const r=i%2?1.5:5.4,a=i/8*Math.PI*2;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();
        c.lineWidth=1.2;c.strokeStyle=INK;c.stroke();c.fillStyle=NY.steel;c.fill();c.beginPath();c.arc(0,0,1,0,Math.PI*2);c.fillStyle=INK;c.fill();}},
      hairB:{b:[-16,-15,10,14],d(c){
        const p=c=>{c.beginPath();c.moveTo(-1,-12);c.quadraticCurveTo(-11,-12,-11.8,-3);c.lineTo(-15,-1);c.lineTo(-11.4,2);c.lineTo(-14,6.4);c.lineTo(-9.4,6.4);c.lineTo(-9.8,11);c.lineTo(-5.4,7.6);c.lineTo(-3,10.6);c.lineTo(-1,4);c.quadraticCurveTo(4,-10,-1,-12);c.closePath();};
        cel(c,p,NY.fur,NY.furS,NY.furL,1.2,1.4);}},
      hairF:{b:[-13,-24,14,13],d(c){
        cel(c,c=>{c.beginPath();c.moveTo(-8.6,-7);c.lineTo(-10.6,-21.4);c.lineTo(-2,-11.6);c.closePath();},NY.fur,NY.furS,NY.furL,.6,1.3);
        cel(c,c=>{c.beginPath();c.moveTo(-8,-8.6);c.lineTo(-9.4,-18.2);c.lineTo(-4,-11.6);c.closePath();},NY.pink,NY.pinkS,null,.3,.8);
        cel(c,c=>{c.beginPath();c.moveTo(1.6,-11.4);c.lineTo(8.4,-22);c.lineTo(9.2,-8.4);c.closePath();},NY.fur,NY.furS,NY.furL,.6,1.3);
        cel(c,c=>{c.beginPath();c.moveTo(3.2,-11.4);c.lineTo(7.6,-18.6);c.lineTo(8,-9.8);c.closePath();},NY.pink,NY.pinkS,null,.3,.8);
        const p=c=>{c.beginPath();c.moveTo(-8,-6.4);c.quadraticCurveTo(-4,-14.6,4.6,-13);c.quadraticCurveTo(10.6,-11,11.6,-4.6);c.lineTo(10.4,-1.4);c.lineTo(9.4,-5);c.lineTo(8,-.4);c.lineTo(6.6,-5.4);c.lineTo(4.4,-1.4);c.lineTo(3.4,-6);c.lineTo(1,-2.6);c.lineTo(0,-7);c.quadraticCurveTo(-4,-5.6,-8,-6.4);c.closePath();
          c.moveTo(-1.2,-6);c.lineTo(-3.4,5.2);c.lineTo(-.4,2.4);c.lineTo(1.4,6);c.lineTo(1.6,-5);c.closePath();};
        cel(c,p,NY.fur,NY.furS,NY.furL,1,1.3);}},
      glow:{b:[-6,-2,6,20],d(c){c.shadowColor='#7FFFF0';c.shadowBlur=4*S;c.fillStyle='rgba(160,255,245,.8)';for(let i=0;i<2;i++){c.beginPath();c.moveTo(0,1.6);c.lineTo(2.8,5);c.lineTo(0,15.6);c.lineTo(-2.8,5);c.closePath();c.fill();}}},
      head_idle:{b:[-15,-15,15,20],d:nyHead('idle')},head_attack:{b:[-15,-15,15,20],d:nyHead('attack')},
      head_hurt:{b:[-15,-15,15,20],d:nyHead('hurt')},head_blink:{b:[-15,-15,15,20],d:nyHead('blink')}
    },
    poses:{
      stand:{lean:.22,fl1:.7,fl2:-1.15,bl1:-.5,bl2:-.85,fa1:.9,fa2:1.2,wr:.2,ba1:-.3,ba2:1.4},
      jabW:{fa1:.2,fa2:1.7,wr:.4,lean:.15},jab:{lean:.42,fa1:1.55,fa2:.05,wr:.1,ba1:-.5,ba2:1.1},
      crossW:{ba1:.3,ba2:1.8,fa1:.6,fa2:1.5,wr:.4},cross:{lean:.45,ba1:1.6,ba2:.05,fa1:.5,fa2:1.4,wr:.3},
      finW:{fa1:-1,fa2:.6,wr:.5,lean:-.2},fin:{lean:.55,fa1:1.7,fa2:0,wr:.2,ba1:-.9,ba2:.6},
      upW:{fa1:.2,fa2:.8,wr:.3},up:{fa1:2.95,fa2:.05,wr:.1,ba1:-.4,ba2:.9},
      spikeW:{fa1:2.8,fa2:.5,wr:.5},spike:{fa1:.9,fa2:.1,wr:.1},
      cast:{lean:.3,fa1:1.5,fa2:-.05,wr:.2,ba1:1.45,ba2:.1},throw:{lean:.3,fa1:1.5,fa2:-.05,wr:.2,ba1:1.45,ba2:.1},
      charge:{fa1:.5,fa2:1.6,wr:.4,ba1:.6,ba2:1.8},
      dash:{lean:.8,fa1:-1.2,fa2:.2,ba1:-1.3,ba2:.2,wr:.3},
      guard:{fa1:1.1,fa2:2,wr:1,ba1:1,ba2:2.1},
      jump:{lean:.25,fl1:1.3,fl2:-2.1,bl1:.6,bl2:-1.8,fa1:-.5,fa2:.9,ba1:-.9,ba2:.7,wr:.3},
      fall:{lean:.1,fa1:1.1,fa2:.7,ba1:-.9,ba2:.6,wr:.3},
      victory:{lean:-.05,fa1:2.8,fa2:.4,wr:.2,ba1:.2,ba2:1.8,fl1:.4,fl2:-.4,bl1:-.4,bl2:-.2}
    },
    idle:(t)=>{const b=Math.sin(t*4.2);return {lean:.22+b*.02,fl1:.7,fl2:-1.15-b*.05,bl1:-.5,bl2:-.85-b*.05,fa1:.9+b*.03,fa2:1.2,wr:.2,ba1:-.3,ba2:1.4};},
    run:(ph)=>({lean:.62,fa1:-1.1,fa2:.25,ba1:-1.2,ba2:.2,wr:.3}),
    portrait(p){p('hairB',0,0,0,1);p('head_idle',0,0,0,1);p('hairF',0,0,0,1);},
    render(c,f,t,j,m){
      const id='nyanja',bk=m||'shade',HS=1.12;
      const tail=chain(f,'tail',7,4.2,tl(j,-6.5,-1),[-.72,-.55],{g:220,bias:900,damp:.86,fl:[700,5]});
      ribbon(c,tail,7.2,4,mc(NY.fur,m),m,true);ribbon(c,tail.slice(-2),5,4,mc(NY.pink,m),m,true);
      const s2=chain(f,'s2',7,4,hl(j,-4.6,8),[-.9,.4],{g:300,bias:1000,damp:.88,fl:[800,6.5]});
      const s1=chain(f,'s1',8,4.3,hl(j,-6,6.4),[-.94,.28],{g:260,bias:1100,damp:.88,fl:[900,6]});
      ribbon(c,s2,4,1.6,mc(NY.pinkS,m),m,true);ribbon(c,s1,5,2,mc(NY.pink,m),m,true);
      const nb=tl(j,-1,-23.5);part(c,id,'ninjato',nb[0],nb[1],-.75-j.lean,bk);
      part(c,id,'uarm',j.bSh[0],j.bSh[1],j.bU,bk);part(c,id,'farm',j.bE[0],j.bE[1],j.bF,bk);
      if(f.castT>0||f.charge!=null||(f.sup&&!silent(m)))part(c,id,'shuriken',j.bW[0],j.bW[1],t*18,m);
      part(c,id,'hand',j.bW[0],j.bW[1],j.bF,bk);
      part(c,id,'thigh',-2,j.hy,j.bT,bk);part(c,id,'shin',j.bK[0],j.bK[1],j.bS,bk);part(c,id,'foot',j.bA[0],j.bA[1],-j.bS*.2,bk);
      part(c,id,'torso',0,j.hy,-j.lean,m);
      part(c,id,'thigh',0,j.hy,j.fT,m);part(c,id,'shin',j.fK[0],j.fK[1],j.fS,m);part(c,id,'foot',j.fA[0],j.fA[1],-j.fS*.2,m);
      part(c,id,'hairB',j.head[0],j.head[1],-j.ha,m,HS);part(c,id,'head_'+face(f),j.head[0],j.head[1],-j.ha,m,HS);part(c,id,'hairF',j.head[0],j.head[1],-j.ha,m,HS);
      if(m==='void')voidEyes(c,j,[[5.6*HS,1.5*HS],[9.8*HS,1.4*HS]]);
      part(c,id,'uarm',j.fSh[0],j.fSh[1],j.fU,m);part(c,id,'farm',j.fE[0],j.fE[1],j.fF,m);
      if((f.act||f.awake>0)&&!silent(m)){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.6;part(c,id,'glow',j.fW[0],j.fW[1],j.fWp,m==='void'?'#FF2E63':null);c.restore();}
      part(c,id,'kunai',j.fW[0],j.fW[1],j.fWp,m);part(c,id,'hand',j.fW[0],j.fW[1],j.fF,m);
      const tip=along(j.fW,j.fWp,15),mid=along(j.fW,j.fWp,4);f._hand=tip;f._foot=j.fA;f._artSlash=true;
      if(!silent(m))slash(c,f,t,'k',tip,mid,m==='void'?'#FF2E63':'#7FFFF0',activeWin(f));
    }
  };

  /* =================================================================
     ROKURO INK  (Shinobi Clan · ronin swordsman with a straw kasa and an ink-brush katana)
     ================================================================= */
  const RK={kim:'#ECEAF2',kimS:'#B6B2C8',ink:'#15121F',inkL:'#4A4466',hak:'#1E1C2C',hakS:'#100F19',hakL:'#4C4870',straw:'#3A2B33',strawS:'#1E151C',strawL:'#6E5763',
    red:'#C2373F',redS:'#80141E',skin:'#F2CBB0',skinS:'#D39C80',hair:'#17131F',hairL:'#4D4670',paper:'#F1E6CF',paperS:'#C6B48C',edge:'#FFFFFF'};
  function splat(c,pts){c.fillStyle=RK.ink;pts.forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();c.beginPath();c.arc(x+r*1.3,y+r*.6,r*.35,0,Math.PI*2);c.fill();c.beginPath();c.arc(x-r*.6,y+r*1.4,r*.25,0,Math.PI*2);c.fill();});}
  function rkHead(kind){return function(c){
    cel(c,c=>capsule(c,4.8,4.4,7.5),RK.skin,RK.skinS,null,.6,1.2);
    faceShape(c,RK.skin,RK.skinS);
    eyes(c,kind,{iris:'#D8404A',irisD:'#4A0A12',irisL:'#FF9A8A',stern:true,brow:INK});
    line(c,[10.1,3.4,9.5,4.7],.6,INK);line(c,[2.2,4.8,4.4,6.6],.6,'#A8584A');
    if(kind==='attack'){c.beginPath();c.moveTo(5.8,7.2);c.lineTo(9,6.8);c.lineTo(8.4,8.8);c.lineTo(6.2,8.8);c.closePath();c.fillStyle='#4A0F1A';c.fill();c.lineWidth=.6;c.strokeStyle=INK;c.stroke();
      c.fillStyle='#FFFFFF';c.fillRect(6.2,7.1,2.6,.6);}
    else if(kind==='hurt')line(c,[5.8,7.8,6.8,7.1,7.8,7.8,8.8,7.1],.7,INK);
    else line(c,[6.2,7.4,8.8,7.1],.75,'#6A2A2A');
  };}
  defs.rokuro_ink={name:'Rokuro Ink',len:{th:19,sh:19,ft:3.4,to:25,hd:10.5,ua:12.5,fa:12.5},
    parts:{
      thigh:{b:[-7,-6,7,24],d(c){cel(c,c=>{c.beginPath();c.moveTo(-5.4,-2);c.lineTo(5.6,-2);c.lineTo(6.2,19.5);c.lineTo(-5.8,19.5);c.closePath();},RK.hak,RK.hakS,RK.hakL,1.2,1.4);
        line(c,[-1.8,1,-2.2,18.5],.7,'rgba(110,104,150,.6)');line(c,[2,1,2.4,18.5],.7,'rgba(110,104,150,.6)');}},
      shin:{b:[-9,-3,9,22],d(c){cel(c,c=>{c.beginPath();c.moveTo(-5.8,-.5);c.lineTo(6.2,-.5);c.lineTo(8.2,18.2);c.quadraticCurveTo(0,19.8,-7.6,18.2);c.closePath();},RK.hak,RK.hakS,RK.hakL,1.2,1.4);
        line(c,[-2.4,1,-3.6,17.6],.7,'rgba(110,104,150,.6)');line(c,[2.2,1,3,17.8],.7,'rgba(110,104,150,.6)');}},
      foot:{b:[-5,-5,10,5],d(c){cel(c,c=>{c.beginPath();c.moveTo(-3.4,-3);c.lineTo(2,-3);c.quadraticCurveTo(6.8,-1.6,7.8,1);c.lineTo(7.8,2.2);c.lineTo(-3.6,2.2);c.closePath();},'#F4F2F8','#C2BED2',null,.5,1.1);
        cel(c,c=>{c.beginPath();c.rect(-4,2,12.4,1.8);},RK.straw,RK.strawS,null,.3,.9);line(c,[3.2,-2.6,1.4,1.2],.7,RK.red);}},
      uarm:{b:[-7,-5,7,17],d(c){cel(c,c=>capsule(c,10,9,12.5),RK.kim,RK.kimS,'#FFFFFF',1.2);
        c.save();capsule(c,10,9,12.5);c.clip();splat(c,[[-2.6,4,1.3],[2.4,9,.9]]);c.restore();}},
      farm:{b:[-5,-4,5,16],d(c){cel(c,c=>capsule(c,6.4,5.4,12.5),RK.skin,RK.skinS,null,.7,1.2);
        cel(c,c=>{c.beginPath();c.rect(-3.3,7.8,6.4,3.6);},RK.ink,'#05040A',RK.inkL,.3,1);}},
      hand:{b:[-5,-5,5,5],d(c){cel(c,c=>{c.beginPath();c.arc(0,.4,3.5,0,Math.PI*2);},RK.skin,RK.skinS,null,.6,1.1);line(c,[-1.6,-1.2,1.8,-.4],.55,INK);}},
      torso:{b:[-13,-31,13,5],d(c){
        const body=c=>{c.beginPath();c.moveTo(-8.8,2.5);c.lineTo(9.2,2.5);c.quadraticCurveTo(10.6,-10,9.4,-18);c.quadraticCurveTo(8.8,-24.6,4.4,-26.2);c.lineTo(-4.8,-26.2);c.quadraticCurveTo(-10,-24.6,-10.2,-18);c.quadraticCurveTo(-10.8,-9,-8.8,2.5);c.closePath();};
        cel(c,body,RK.kim,RK.kimS,'#FFFFFF',1.6,1.5);
        c.save();body(c);c.clip();
        splat(c,[[-6,-18,1.8],[5.4,-14,1.2],[-3,-10,1],[6.8,-22,.9]]);
        c.beginPath();c.moveTo(-3,-27);c.lineTo(1.8,-27);c.lineTo(7.4,-11);c.lineTo(4,-11);c.closePath();c.fillStyle=RK.ink;c.fill();
        c.beginPath();c.moveTo(1.8,-27);c.lineTo(3.4,-27);c.lineTo(8.6,-13);c.lineTo(7.4,-11);c.closePath();c.fillStyle='#E9E6F0';c.fill();
        c.fillStyle=RK.hak;c.fillRect(-12,-9,26,12);c.fillStyle=RK.ink;c.fillRect(-12,-10.6,26,3.2);
        line(c,[-12,-9,14,-9],.9,RK.red);c.beginPath();c.moveTo(3,-8.6);c.lineTo(6,-4);c.lineTo(4.4,-3.6);c.lineTo(2.2,-7.6);c.closePath();c.fillStyle=RK.red;c.fill();
        c.restore();
        c.save();body(c);c.lineWidth=1.4;c.strokeStyle=INK;c.stroke();c.restore();}},
      hairB:{b:[-14,-14,10,10],d(c){cel(c,c=>{c.beginPath();c.ellipse(-1.4,-2.4,10.8,10.4,0,0,Math.PI*2);},RK.hair,'#0B0912',RK.hairL,1.2,1.4);}},
      hairF:{b:[-12,-15,14,14],d(c){
        const p=c=>{c.beginPath();c.moveTo(-7.6,-7.2);c.quadraticCurveTo(-2,-14,6,-12);c.quadraticCurveTo(10.6,-10,11.2,-4.6);c.lineTo(9.6,-3);c.lineTo(8.8,-6.6);c.lineTo(6,-2.8);c.lineTo(5.4,-6.8);c.lineTo(2.6,-4);c.lineTo(1.6,-7.6);c.quadraticCurveTo(-3,-6.2,-7.6,-7.2);c.closePath();
          c.moveTo(-1.4,-6);c.quadraticCurveTo(-3.4,3,-1.6,10);c.lineTo(.6,7.6);c.quadraticCurveTo(.4,1,1,-5.6);c.closePath();};
        cel(c,p,RK.hair,'#0B0912',RK.hairL,1,1.3);}},
      hat:{b:[-22,-22,24,10],d(c){
        const p=c=>{c.beginPath();c.moveTo(-20.4,-4.2);c.quadraticCurveTo(-6,-17,1.6,-19.2);c.quadraticCurveTo(9,-17,22,-4.6);c.quadraticCurveTo(1,-1.4,-20.4,-4.2);c.closePath();};
        cel(c,p,RK.straw,RK.strawS,RK.strawL,1.4,1.5);
        c.save();p(c);c.clip();c.strokeStyle='rgba(120,90,105,.45)';c.lineWidth=.6;
        for(let i=-6;i<=6;i++){c.beginPath();c.moveTo(1.6,-19.2);c.lineTo(1.6+i*3.6,-1);c.stroke();}
        for(let k=1;k<4;k++){c.beginPath();c.moveTo(-20+k*4.6,-4.2-k*3.3);c.quadraticCurveTo(1.6,-5.2-k*3.6,22-k*4.8,-4.6-k*3.2);c.stroke();}
        c.beginPath();c.moveTo(-20.4,-4.2);c.quadraticCurveTo(1,-1.4,22,-4.6);c.lineWidth=2.4;c.strokeStyle=RK.red;c.stroke();
        c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(-6,-9.6);c.quadraticCurveTo(1.6,-11.8,9.6,-9.6);c.lineTo(9.8,-7.8);c.quadraticCurveTo(1.6,-10,-6.2,-7.8);c.closePath();},RK.red,RK.redS,null,.3,.9);
        line(c,[-5.6,-3,-4,8],.7,RK.red);line(c,[9,-3.4,7.6,8],.7,RK.red);}},
      sword:{b:[-3.5,-11,3.5,44],d(c){
        cel(c,c=>{c.beginPath();c.rect(-1.6,-10,3.2,12.6);},'#F4F2F8','#B6B2C8',null,.3,.9);
        c.fillStyle=RK.ink;for(let y=-9;y<2;y+=2.4){c.beginPath();c.moveTo(0,y);c.lineTo(1.3,y+1.2);c.lineTo(0,y+2.4);c.lineTo(-1.3,y+1.2);c.closePath();c.fill();}
        cel(c,c=>{c.beginPath();c.ellipse(0,3.4,3.6,1.4,0,0,Math.PI*2);},RK.red,RK.redS,null,.4,.9);
        const bl=c=>{c.beginPath();c.moveTo(-1.3,4.8);c.quadraticCurveTo(-1.9,24,-.6,39.6);c.lineTo(.8,42.6);c.quadraticCurveTo(1.9,24,1.5,4.8);c.closePath();};
        c.save();bl(c);c.lineWidth=1.6;c.strokeStyle=INK;c.stroke();c.fillStyle=RK.ink;c.fill();c.clip();
        c.beginPath();c.moveTo(.9,5);c.quadraticCurveTo(1.5,24,.5,41);c.lineWidth=1;c.strokeStyle=RK.edge;c.stroke();
        c.fillStyle='rgba(150,140,200,.5)';c.fillRect(-1.6,6,.8,30);c.restore();
        c.fillStyle=RK.ink;[[-1.6,16,.9],[-1.4,27,.7],[-1.9,34,.55]].forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();});}},
      glow:{b:[-8,-2,8,48],d(c){c.shadowColor='#9A7BFF';c.shadowBlur=5*S;c.fillStyle='rgba(70,50,140,.75)';
        for(let i=0;i<2;i++){c.beginPath();c.moveTo(-1.8,4.8);c.quadraticCurveTo(-2.4,24,-1,40);c.lineTo(.9,43.6);c.quadraticCurveTo(2.4,24,2,4.8);c.closePath();c.fill();}}},
      scroll:{b:[-4,-3,4,26],d(c){
        cel(c,c=>capsule(c,5,5,22),RK.paper,RK.paperS,'#FFFFFF',.8,1.2);
        cel(c,c=>{c.beginPath();c.ellipse(0,0,3.4,1.6,0,0,Math.PI*2);},RK.hak,RK.hakS,null,.3,.9);
        cel(c,c=>{c.beginPath();c.ellipse(0,22,3.4,1.6,0,0,Math.PI*2);},RK.hak,RK.hakS,null,.3,.9);
        line(c,[-2.6,10,2.6,10],1,RK.red);line(c,[-2.6,12,2.6,12],1,RK.red);}},
      head_idle:{b:[-15,-15,15,20],d:rkHead('idle')},head_attack:{b:[-15,-15,15,20],d:rkHead('attack')},
      head_hurt:{b:[-15,-15,15,20],d:rkHead('hurt')},head_blink:{b:[-15,-15,15,20],d:rkHead('blink')}
    },
    poses:{
      stand:{lean:.08,fa1:.25,fa2:.6,wr:-1,ba1:.5,ba2:1.6,fl1:.45,fl2:-.5,bl1:-.42,bl2:-.25},
      jabW:{fa1:2.6,fa2:.5,wr:.6,lean:-.05},jab:{lean:.35,fa1:1.3,fa2:.1,wr:-.2,ba1:-.5,ba2:.7},
      crossW:{fa1:-.4,fa2:1.4,wr:1.4},cross:{lean:.4,fa1:1.62,fa2:0,wr:.05,ba1:-.6,ba2:.5},
      kickW:{wr:-.8},kick:{wr:-.8},
      finW:{fa1:-1.3,fa2:.7,wr:-1,lean:-.25,ba1:.8,ba2:1.4},fin:{lean:.55,fa1:2.2,fa2:.05,wr:.3,ba1:-1,ba2:.5},
      upW:{fa1:.15,fa2:.5,wr:.25},up:{fa1:3,fa2:.05,wr:.05,ba1:-.5,ba2:.7},
      sweepW:{fa1:1,fa2:.4,wr:.9},sweep:{fa1:1.15,fa2:.15,wr:.2},spikeW:{fa1:2.95,fa2:.35,wr:.45},spike:{fa1:.95,fa2:.1,wr:.15},
      cast:{lean:.18,fa1:1.55,fa2:0,wr:0,ba1:1.3,ba2:1.5},charge:{fa1:.2,fa2:1.5,wr:1.5,ba1:1,ba2:1.8},
      dash:{lean:.7,fa1:-1.1,fa2:.25,wr:-1.2},guard:{fa1:.9,fa2:1.3,wr:.4,ba1:1.2,ba2:1.6},
      hurt:{wr:-.4},jump:{wr:-.6},fall:{wr:-.4,fa1:1.2,fa2:.5},
      victory:{lean:-.05,fa1:.3,fa2:.2,wr:-.4,ba1:-.2,ba2:.5,fl1:.48,fl2:-.48,bl1:-.48,bl2:-.2}
    },
    idle:(t)=>{const b=Math.sin(t*2.4);return {lean:.08+b*.015,fa1:.25,fa2:.6+b*.03,wr:-1,ba1:.5,ba2:1.6,fl1:.45,fl2:-.5,bl1:-.42,bl2:-.25};},
    run:(ph)=>({lean:.42,fa1:-.7+Math.sin(ph)*.1,fa2:.3,wr:-1.05,ba1:Math.sin(ph)*.7+.3,ba2:1.3}),
    portrait(p){p('hairB',0,0,0,1);p('head_idle',0,0,0,1);p('hairF',0,0,0,1);p('hat',0,-2,0,.9);},
    render(c,f,t,j,m){
      const id='rokuro_ink',bk=m||'shade',HS=1.06;
      const pt=chain(f,'pony',6,4,hl(j,-8.6*HS,-1),[-.75,.6],{g:500,bias:500,damp:.86,fl:[180,3.4]});
      ribbon(c,pt,5.2,1.4,mc(RK.hair,m),m,true);
      const h2=chain(f,'h2',6,5,tl(j,-7.6,-15),[-.35,.94],{g:620,bias:300,damp:.85,fl:[260,3.8]});
      const h1=chain(f,'h1',6,5.2,tl(j,-7,-22),[-.5,.86],{g:600,bias:320,damp:.85,fl:[300,3.4]});
      ribbon(c,h2,8,7,mc(RK.hakS,m),m);ribbon(c,h1,9,8,mc(RK.ink,m),m);
      if(!silent(m)){const e=h1[h1.length-1];c.save();c.globalAlpha=.6;c.beginPath();c.arc(e[0],e[1]+2,1.2,0,Math.PI*2);c.fillStyle=mc(RK.ink,m);c.fill();c.restore();}
      const sc=tl(j,-6.5,-17);part(c,id,'scroll',sc[0],sc[1],-1.05-j.lean,bk);
      part(c,id,'uarm',j.bSh[0],j.bSh[1],j.bU,bk);part(c,id,'farm',j.bE[0],j.bE[1],j.bF,bk);part(c,id,'hand',j.bW[0],j.bW[1],j.bF,bk);
      part(c,id,'thigh',-2,j.hy,j.bT,bk);part(c,id,'shin',j.bK[0],j.bK[1],j.bS,bk);part(c,id,'foot',j.bA[0],j.bA[1],-j.bS*.2,bk);
      part(c,id,'torso',0,j.hy,-j.lean,m);
      part(c,id,'thigh',0,j.hy,j.fT,m);part(c,id,'shin',j.fK[0],j.fK[1],j.fS,m);part(c,id,'foot',j.fA[0],j.fA[1],-j.fS*.2,m);
      part(c,id,'hairB',j.head[0],j.head[1],-j.ha,m,HS);part(c,id,'head_'+face(f),j.head[0],j.head[1],-j.ha,m,HS);part(c,id,'hairF',j.head[0],j.head[1],-j.ha,m,HS);
      if(m==='void')voidEyes(c,j,[[5.6*HS,1.4*HS],[9.8*HS,1.3*HS]]);
      const hp=hl(j,0,-2*HS);part(c,id,'hat',hp[0],hp[1],-j.ha,m,HS);
      part(c,id,'uarm',j.fSh[0],j.fSh[1],j.fU,m);part(c,id,'farm',j.fE[0],j.fE[1],j.fF,m);
      const lit=f.act||f.sup||f.castT>0||f.charge!=null||f.awake>0;
      if(lit&&!silent(m)){c.save();c.globalAlpha=.7;part(c,id,'glow',j.fW[0],j.fW[1],j.fWp,m==='void'?'#FF2E63':null);c.restore();}
      part(c,id,'sword',j.fW[0],j.fW[1],j.fWp,m);part(c,id,'hand',j.fW[0],j.fW[1],j.fF,m);
      const tip=along(j.fW,j.fWp,41),mid=along(j.fW,j.fWp,13);f._hand=tip;f._foot=j.fA;f._artSlash=true;
      if(!silent(m))slash(c,f,t,'blade',tip,mid,m==='void'?'#FF2E63':'#B8A8FF',activeWin(f)||(f.sup&&f.sup.t<.6));
    }
  };
  heroArt.nyanja='nyanja';heroArt.rokuro='rokuro_ink';

  /* ---------- pose overrides (render-only) ---------- */
  const poseCache={};
  function poseSet(id){if(poseCache[id])return poseCache[id];const d=defs[id];if(!d)return null;const o={};
    const st=(d.poses&&d.poses.stand)||{};for(const k in POSE)o[k]=Object.assign({},POSE[k],{wr:st.wr||0},(d.poses&&d.poses[k])||{});o.stand=Object.assign({},POSE.stand,st);
    for(const k in (d.poses||{}))if(!o[k])o[k]=Object.assign({},POSE.stand,d.poses[k]);
    return poseCache[id]=o;}

  /* ---------- registration, preloading, export ---------- */
  function alias(){for(const id in defs){const d=defs[id];if(d.texOf){if(tex[d.texOf]){tex[id]=tex[d.texOf];status[id]=status[d.texOf];}else{delete tex[id];status[id]='failed';}}}}
  function bakeAll(){for(const id in defs){if(defs[id].texOf)continue;try{const T={};for(const n in defs[id].parts)T[n]=bake(defs[id].parts[n]);tex[id]=T;status[id]='baked';}catch(e){status[id]='failed';delete tex[id];}}}
  function loadImg(src){return new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(new Error('load '+src));im.src=src;});}
  async function loadPNG(base){
    base=base||'assets/';let man;
    try{const r=await fetch(base+'manifest.json',{cache:'no-cache'});if(!r.ok)throw new Error(r.status);man=await r.json();}catch(e){return {ok:false,reason:'no manifest'};}
    const out={};
    for(const id in (man.characters||{})){
      if(!defs[id]||defs[id].texOf)continue;const ent=man.characters[id];const T={};let ok=true;
      await Promise.all(Object.keys(defs[id].parts).map(async n=>{const p=ent.parts&&ent.parts[n];if(!p){ok=false;return;}
        try{const im=await loadImg(base+p.file);T[n]={img:im,px:p.pivot[0],py:p.pivot[1],w:im.naturalWidth,h:im.naturalHeight,v:{},src:'png'};}catch(e){ok=false;}}));
      if(ok){tex[id]=T;status[id]='png';out[id]='png';}else out[id]=status[id]+' (png incomplete)';
    }
    alias();return {ok:true,result:out};
  }
  function exportAll(){
    const man={version:1,generator:'Rift Rumble ART.exportAll',scale:S,unit:'1 world unit = '+S+' px; pivot = joint in px from the top-left',characters:{}},files={};
    for(const id in defs){if(defs[id].texOf)continue;const ent={name:defs[id].name,scale:S,parts:{}};const T=tex[id];if(!T)continue;
      for(const n in T){const file=id+'/'+n+'.png';ent.parts[n]={file,pivot:[Math.round(T[n].px*100)/100,Math.round(T[n].py*100)/100],size:[T[n].w,T[n].h]};files[file]=T[n].img.toDataURL('image/png');}
      man.characters[id]=ent;}
    return {manifest:man,files};
  }
  /* public draw: returns false when this fighter has no working art so the caller can fall back */
  function draw(c,f,t){
    const id=f.artId;if(!id||!tex[id]||!defs[id])return false;
    try{
      const A=f._art||(f._art={ch:{},sl:{},lt:null,dt:0});
      if(A.lt!==t){A.dt=A.lt==null?0:Math.max(0,Math.min(.033,t-A.lt));A.lt=t;}else A.dt=0;
      let m=null;
      if(typeof OVR!=='undefined'&&OVR)m=OVR==='#FFFFFF'?'white':OVR;
      else if(f.role==='clone')m='void';
      const R=defs[id];const sc=R.baseH?(f.h||R.baseH)/R.baseH:1;A.sc=sc;const j=joints(f,R,t);
      if(f.aura&&!m&&typeof drawAura==='function')drawAura(c,f,t,{hipY:j.hy*sc});
      c.save();if(sc!==1)c.scale(sc,sc);
      if(m==='void'){c.shadowColor='#FF2E63';c.shadowBlur=12;}
      R.render(c,f,t,j,m);c.restore();
      if(sc!==1){if(f._hand)f._hand=[f._hand[0]*sc,f._hand[1]*sc];if(f._foot)f._foot=[f._foot[0]*sc,f._foot[1]*sc];}
      return true;
    }catch(e){if(!draw.warned){draw.warned=1;console.warn('ART fallback for',id,e);}const src=defs[id]&&defs[id].texOf||id;for(const k in defs)if(k===src||defs[k].texOf===src){status[k]='failed';delete tex[k];}return false;}
  }
  function portrait(c,id,f,t){if(!tex[id])return false;const d=defs[id];
    if(d.portrait){d.portrait((n,x,y,a,sc)=>part(c,id,n,x,y,a,null,sc));return true;}
    part(c,id,'hairB',0,0,0);part(c,id,'head_idle',0,0,0);part(c,id,'hairF',0,0,0);if(tex[id].kanzashi)part(c,id,'kanzashi',-5,-9.5,0);return true;}
  function pose(f,name){const id=f&&f.artId;if(!id||!defs[id]||!tex[id])return POSE[name];const s=poseSet(id);return (s&&s[name])||POSE[name];}
  function run(f){const id=f.artId,d=id&&defs[id];if(!d||!tex[id]||!d.run)return null;return Object.assign(runPose(f.runPh),d.run(f.runPh));}
  function idle(f,tt){const id=f.artId,d=id&&defs[id];if(!d||!tex[id]||!d.idle)return null;return Object.assign(idlePose(tt),d.idle(tt));}
  bakeAll();alias();
  return {draw,portrait,pose,run,idle,loadPNG,exportAll,heroArt,enemyArt,status,defs,has:id=>!!tex[id],isNew:k=>!!heroArt[k]&&!!tex[heroArt[k]]};
})();
