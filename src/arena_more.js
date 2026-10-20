  /* shared arena scaffold: baked parallax layers (rebuilt on resize), cached platform sprites, live effects */
  function makeArena(def){
    let L=null,key='';const cache={};const st={};
    function build(){const R=Math.min(2,(typeof DPR!=='undefined'?DPR:1)*K),pad=80,W=VW+pad*2,H=VH,u=H/540;L={R,pad,W,H,u};def.build(L,rng(def.seed),st);}
    function blit(c,cv,par){const ox=-(cam.x-480)*par;c.drawImage(cv,-L.pad+ox,0,L.W,L.H);return ox;}
    function sky(c,t,dt){const k=VW.toFixed(1)+'x'+VH.toFixed(1)+'x'+((typeof DPR!=='undefined'?DPR:1)*K).toFixed(2);if(k!==key||!L){key=k;build();}def.draw(c,t,dt||0,L,blit,st);return true;}
    function sprite(kind,w){const kk=kind+w;if(cache[kk])return cache[kk];const spec=def.sprite(kind,w);const R=3;
      const cv=document.createElement('canvas');cv.width=Math.ceil((spec.x1-spec.x0)*R);cv.height=Math.ceil((spec.y1-spec.y0)*R);const c=cv.getContext('2d');
      c.scale(R,R);c.translate(-spec.x0,-spec.y0);c.lineJoin='round';spec.d(c);return cache[kk]={cv,x0:spec.x0,y0:spec.y0,w:spec.x1-spec.x0,h:spec.y1-spec.y0};}
    function platform(c,p){const w=p.x2-p.x1,t=typeof G!=='undefined'?G.time||performance.now()/1000:0;const kind=p.main?'main':p.y<200?'top':'side';
      if(def.under)def.under(c,p,kind,t,w);const s=sprite(kind,w);c.drawImage(s.cv,p.x1+s.x0,p.y+s.y0,s.w,s.h);if(def.over)def.over(c,p,kind,t,w);return true;}
    return {sky,platform,name:def.name};
  }
  const OL='#160A24';
  function grad(c,x0,y0,x1,y1,stops){const g=c.createLinearGradient(x0,y0,x1,y1);stops.forEach(([o,col])=>g.addColorStop(o,col));return g;}
  function torii(c,x,y,h,u,col,dark){const w=h*.95;c.fillStyle=col;
    c.fillRect(x-w*.36,y-h,h*.07,h);c.fillRect(x+w*.29,y-h,h*.07,h);
    c.beginPath();c.moveTo(x-w*.62,y-h*.98);c.quadraticCurveTo(x,y-h*.9,x+w*.62,y-h*.98);c.lineTo(x+w*.66,y-h*1.08);c.quadraticCurveTo(x,y-h*.98,x-w*.66,y-h*1.08);c.closePath();c.fill();
    c.fillRect(x-w*.5,y-h*.8,w,h*.06);c.fillStyle=dark;c.fillRect(x-w*.62,y-h*.98,w*1.24,h*.03);c.fillRect(x-h*.03,y-h*.88,h*.06,h*.09);}
  function pagoda(c,cx,y,tiers,u,col,rim,win,r){let yy=y;tiers.forEach(([w,wh])=>{w*=u;wh*=u;c.fillStyle=col;c.fillRect(cx-w*.36,yy-wh,w*.72,wh);
      if(win&&r()<.7){c.fillStyle=win;c.fillRect(cx-2.5*u,yy-wh*.72,5*u,6*u);}roof(c,cx,yy-wh,w,15*u,col,rim,u);yy-=wh+11*u;});
    c.fillStyle=col;c.fillRect(cx-1.5*u,yy-30*u,3*u,30*u);}

  /* =================================================================
     MOUNTAIN DOJO (Ki Fighters): sunset over a mountain shrine, red torii, maple trees, stone steps
     ================================================================= */
  const dojo=makeArena({name:'Mountain Dojo',seed:4242,
    build(L,r,st){const {W,H,R,u}=L;
      st.leaves=[];const lr=rng(99);for(let i=0;i<30;i++)st.leaves.push({x:lr(),y:lr(),v:16+lr()*30,s:lr()*6,r:2.6+lr()*2.6,z:.6+lr()*.6,col:['#FF6A2A','#E8402A','#FFB03A','#C8302A'][Math.floor(lr()*4)]});
      L.sky=layer(W,H,R,c=>{c.fillStyle=grad(c,0,0,0,H,[[0,'#2A1240'],[.28,'#7A2A4A'],[.5,'#E0563A'],[.66,'#FF9A3C'],[.8,'#FFC86A'],[1,'#B85A3A']]);c.fillRect(0,0,W,H);
        const sx=W*.5,sy=H*.5,sr=H*.13;let g=c.createRadialGradient(sx,sy,sr*.6,sx,sy,sr*4);g.addColorStop(0,'rgba(255,214,120,.55)');g.addColorStop(1,'rgba(255,150,80,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
        g=c.createRadialGradient(sx,sy-sr*.2,sr*.1,sx,sy,sr);g.addColorStop(0,'#FFF6D0');g.addColorStop(1,'#FFC060');c.fillStyle=g;c.beginPath();c.arc(sx,sy,sr,0,Math.PI*2);c.fill();
        c.fillStyle='rgba(120,40,70,.45)';[[.15,.2,.16],[.35,.13,.1],[.78,.18,.14],[.62,.3,.09]].forEach(([x,y,s])=>{c.beginPath();c.ellipse(W*x,H*y,W*s,H*.022,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(W*x+W*s*.4,H*y-H*.012,W*s*.6,H*.016,0,0,Math.PI*2);c.fill();});
        c.strokeStyle='rgba(255,220,170,.35)';c.lineWidth=1*u;for(let i=0;i<7;i++){c.beginPath();c.moveTo(0,sy+i*7*u);c.lineTo(W,sy+i*7*u);c.globalAlpha=.25-i*.03;c.stroke();}c.globalAlpha=1;});
      L.mtn=layer(W,H,R,c=>{[[H*.62,.16,.3,'#7A3050'],[H*.68,.1,.22,'#5A2242']].forEach(([base,hmin,hmax,col])=>{const pts=[];let x=-40;while(x<W+60){pts.push([x,base-H*(hmin+r()*(hmax-hmin))]);x+=60+r()*120;}
          c.beginPath();c.moveTo(-40,H);pts.forEach(([px,py],i)=>{if(i)c.lineTo((px+pts[i-1][0])/2,base-H*.04-r()*H*.04);c.lineTo(px,py);});c.lineTo(W+60,H);c.closePath();c.fillStyle=col;c.fill();
          pts.forEach(([px,py])=>{c.beginPath();c.moveTo(px,py);c.lineTo(px+30*u,py+40*u);c.lineTo(px+8*u,py+46*u);c.closePath();c.fillStyle='rgba(255,170,120,.18)';c.fill();});});
        c.fillStyle=grad(c,0,H*.55,0,H*.8,[[0,'rgba(255,170,110,0)'],[1,'rgba(255,150,100,.35)']]);c.fillRect(0,H*.55,W,H*.45);});
      L.shrine=layer(W,H,R,c=>{const col='#3A1626',rim='#B85A3A';
        pagoda(c,W*.16,H*.8,[[120,18],[96,16],[76,15],[56,14],[42,13]],u,col,rim,'rgba(255,190,110,.9)',r);
        pagoda(c,W*.86,H*.78,[[90,16],[72,15],[56,14],[44,12]],u,col,rim,'rgba(255,190,110,.9)',r);
        torii(c,W*.5,H*.76,H*.32,u,'#C8302A','#5A1218');
        c.fillStyle='#4A1E2A';for(let i=0;i<6;i++){const w=(260-i*30)*u;c.fillRect(W*.5-w/2,H*.76+i*5*u,w,4*u);c.fillStyle=i%2?'#4A1E2A':'#5A2632';}
        [[W*.04,1],[W*.96,-1],[W*.32,1],[W*.7,-1]].forEach(([tx,dir],k)=>{c.strokeStyle='#2A1018';c.lineCap='round';const sc=k<2?1:.6;
          const br=(x0,y0,a,len,w,d)=>{if(d>4||len<8*u)return;const x1=x0+Math.cos(a)*len,y1=y0+Math.sin(a)*len;c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();br(x1,y1,a-.45-r()*.3,len*.72,w*.62,d+1);br(x1,y1,a+.35+r()*.3,len*.68,w*.6,d+1);};
          br(tx,H*(k<2?1:.86),-Math.PI/2+dir*.15,110*u*sc,12*u*sc,0);
          const cx=tx+dir*26*u*sc,cy=H*(k<2?.52:.6);for(let i=0;i<(k<2?90:45);i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*85*u*sc;const x=cx+Math.cos(a)*d*1.3,y=cy+Math.sin(a)*d*.72,rad=(6+r()*11)*u*sc;
            c.fillStyle=['#7A1A1E','#B8302A','#E8502A','#FF8A3A','#FFB04A'][Math.min(4,Math.floor(r()*3+(y<cy?2:0)))];c.globalAlpha=.92;c.beginPath();c.arc(x,y,rad,0,Math.PI*2);c.fill();}c.globalAlpha=1;});
        c.fillStyle=grad(c,0,H*.82,0,H,[[0,'rgba(60,16,30,0)'],[1,'rgba(30,8,20,.85)']]);c.fillRect(0,H*.82,W,H*.18);});},
    draw(c,t,dt,L,blit,st){const u=L.u;blit(c,L.sky,.015);blit(c,L.mtn,.05);const ox=blit(c,L.shrine,.16);
      c.save();c.globalCompositeOperation='lighter';[[L.W*.16,L.H*.62],[L.W*.86,L.H*.66]].forEach(([x,y],i)=>glowDot(c,x-L.pad+ox,y,40*u,'rgba(255,150,70,A)',.18+.06*Math.sin(t*5+i)));c.restore();
      c.save();st.leaves.forEach(p=>{p.y+=p.v*p.z*dt/VH;p.x+=(Math.sin(t*.7+p.s)*.03-.02)*dt;if(p.y>1.05){p.y=-.05;p.x=Math.random()*1.1;}if(p.x<-.05)p.x=1.05;
        c.save();c.translate(p.x*VW,p.y*VH);c.rotate(t*1.4+p.s);c.scale(1,.5+.5*Math.sin(t*2.6+p.s));c.globalAlpha=.6+.3*p.z;c.fillStyle=p.col;const r=p.r*p.z*u;
        c.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i/5*Math.PI*2;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);c.lineTo(Math.cos(a+.63)*r*.45,Math.sin(a+.63)*r*.45);}c.closePath();c.fill();c.restore();});c.restore();},
    sprite(kind,w){
      if(kind==='main')return {x0:-50,y0:-40,x1:w+50,y1:172,d:c=>{
        c.fillStyle=grad(c,0,10,0,170,[[0,'#6A4A44'],[1,'#2A1820']]);c.beginPath();c.moveTo(-10,8);c.lineTo(w+10,8);c.lineTo(w-20,170);c.lineTo(20,170);c.closePath();c.fill();
        c.strokeStyle='rgba(30,14,20,.55)';c.lineWidth=1.6;for(let y=26;y<170;y+=22){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();for(let x=(y/22%2)*30;x<w;x+=60){c.beginPath();c.moveTo(x,y);c.lineTo(x,y+22);c.stroke();}}
        c.fillStyle='#8A5A3A';c.fillRect(-14,-2,w+28,12);c.strokeStyle=OL;c.lineWidth=2.2;c.strokeRect(-14,-2,w+28,12);
        c.fillStyle='#C8935A';c.fillRect(-12,-3,w+24,4);for(let x=0;x<w;x+=34){c.strokeStyle='rgba(60,30,20,.6)';c.lineWidth=1;c.beginPath();c.moveTo(x,-3);c.lineTo(x,10);c.stroke();}
        [[-4,1],[w+4,-1]].forEach(([x,d])=>{c.fillStyle='#C8302A';c.fillRect(x-3,-34,6,32);c.strokeStyle=OL;c.lineWidth=1.6;c.strokeRect(x-3,-34,6,32);
          c.fillStyle='#5A1218';c.fillRect(x-7,-38,14,5);c.strokeRect(x-7,-38,14,5);});
        [60,w-60].forEach(x=>{c.fillStyle='#8E8A96';c.fillRect(x-7,-28,14,26);c.strokeStyle=OL;c.lineWidth=1.6;c.strokeRect(x-7,-28,14,26);c.fillStyle='#6E6A76';c.beginPath();c.moveTo(x-11,-28);c.lineTo(x,-38);c.lineTo(x+11,-28);c.closePath();c.fill();c.stroke();
          c.fillStyle='#FFC060';c.fillRect(x-3,-22,6,7);});
        c.globalCompositeOperation='destination-out';c.fillStyle=grad(c,0,130,0,172,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,1)']]);c.fillRect(-60,130,w+120,44);}};
      if(kind==='side')return {x0:-10,y0:-10,x1:w+10,y1:40,d:c=>{
        c.fillStyle='#8A5A3A';c.beginPath();c.moveTo(-6,-5);c.lineTo(w+6,-5);c.lineTo(w+2,6);c.lineTo(-2,6);c.closePath();c.fill();c.strokeStyle=OL;c.lineWidth=2;c.stroke();
        c.fillStyle='#C8935A';c.fillRect(-4,-5,w+8,3);for(let x=20;x<w;x+=20){c.strokeStyle='rgba(60,30,20,.6)';c.lineWidth=1;c.beginPath();c.moveTo(x,-5);c.lineTo(x,6);c.stroke();}
        c.fillStyle='#5A3324';c.beginPath();c.moveTo(10,6);c.lineTo(w-10,6);c.lineTo(w/2+18,26);c.lineTo(w/2-18,26);c.closePath();c.fill();c.strokeStyle=OL;c.lineWidth=1.6;c.stroke();
        c.fillStyle='#E8402A';[[w*.3,12],[w*.7,12]].forEach(([x,y])=>{c.beginPath();c.ellipse(x,y+6,3,4,0,0,Math.PI*2);c.fill();});}};
      return {x0:-30,y0:-12,x1:w+30,y1:40,d:c=>{
        c.fillStyle='#3A1626';c.beginPath();c.moveTo(-26,30);c.quadraticCurveTo(-10,24,0,10);c.lineTo(w,10);c.quadraticCurveTo(w+10,24,w+26,30);c.lineTo(w+18,34);c.lineTo(-18,34);c.closePath();c.fill();c.strokeStyle=OL;c.lineWidth=2;c.stroke();
        c.strokeStyle='#B85A3A';c.lineWidth=1.4;c.beginPath();c.moveTo(-26,30);c.quadraticCurveTo(-10,24,0,10);c.lineTo(w,10);c.quadraticCurveTo(w+10,24,w+26,30);c.stroke();
        c.fillStyle='#8A5A3A';c.fillRect(-4,-4,w+8,14);c.strokeStyle=OL;c.lineWidth=2;c.strokeRect(-4,-4,w+8,14);c.fillStyle='#C8935A';c.fillRect(-2,-4,w+4,3);}};},
    over(c,p,kind,t,w){if(kind==='main'){c.save();c.globalCompositeOperation='lighter';[p.x1+60,p.x2-60].forEach((x,i)=>glowDot(c,x,p.y-18,30,'rgba(255,170,80,A)',.3+.08*Math.sin(t*6+i*2)));c.restore();}}
  });

  /* =================================================================
     NEON METROPOLIS (Caped League): night skyline, neon billboards, tiled roofs in the foreground
     ================================================================= */
  const metro=makeArena({name:'Neon Metropolis',seed:777,
    build(L,r,st){const {W,H,R,u}=L;st.signs=[];st.cars=[];const cr=rng(5);for(let i=0;i<6;i++)st.cars.push({y:.18+cr()*.3,v:(cr()<.5?-1:1)*(40+cr()*80),x:cr(),col:cr()<.5?'#FF4FA0':'#5FF2FF'});
      L.sky=layer(W,H,R,c=>{c.fillStyle=grad(c,0,0,0,H,[[0,'#060A24'],[.45,'#1A1A5A'],[.75,'#4A2A8A'],[1,'#2A1050']]);c.fillRect(0,0,W,H);
        for(let i=0;i<90;i++){c.globalAlpha=.2+r()*.6;c.fillStyle='#E8F0FF';c.fillRect(r()*W,r()*H*.4,1.2,1.2);}c.globalAlpha=1;
        const mx=W*.8,my=H*.16,mr=H*.08;const g=c.createRadialGradient(mx,my,mr*.8,mx,my,mr*3);g.addColorStop(0,'rgba(160,200,255,.3)');g.addColorStop(1,'rgba(160,200,255,0)');c.fillStyle=g;c.fillRect(0,0,W,H*.5);
        c.fillStyle='#DDE8FF';c.beginPath();c.arc(mx,my,mr,0,Math.PI*2);c.fill();c.fillStyle='rgba(120,140,200,.35)';c.beginPath();c.arc(mx+mr*.3,my+mr*.2,mr*.3,0,Math.PI*2);c.fill();});
      const city=(c,base,hmin,hmax,col,wins,par)=>{let x=-40;while(x<W+40){const w=(26+r()*44)*u,h=H*(hmin+r()*(hmax-hmin));c.fillStyle=col;c.fillRect(x,base-h,w,h+H);
          if(r()<.4){c.fillRect(x+w*.4,base-h-14*u,2*u,14*u);}
          for(let yy=base-h+6*u;yy<base;yy+=7*u)for(let xx=x+4*u;xx<x+w-5*u;xx+=6*u){if(r()<wins){c.fillStyle=r()<.7?'rgba(120,200,255,.55)':'rgba(255,120,200,.55)';c.fillRect(xx,yy,2.6*u,3.2*u);}}
          c.fillStyle=col;if(r()<.35){const sx=x+w*.15,sy=base-h+(10+r()*40)*u,sw=w*.7,sh=(14+r()*20)*u,nc=['#FF4FA0','#5FF2FF','#B57CFF','#FFC93C'][Math.floor(r()*4)];st.signs.push({x:sx+sw/2,y:sy+sh/2,w:sw,h:sh,col:nc,par,ph:r()*6});
            c.fillStyle='#120A2A';c.fillRect(sx,sy,sw,sh);c.strokeStyle=nc;c.lineWidth=1.6*u;c.strokeRect(sx,sy,sw,sh);c.fillStyle=nc;for(let k=0;k<3;k++)c.fillRect(sx+sw*.2,sy+sh*(.25+k*.22),sw*(.3+r()*.4),1.4*u);}
          x+=w+(2+r()*8)*u;}};
      L.far=layer(W,H,R,c=>city(c,H*.86,.32,.62,'#1E1A4A',.25,.06));
      L.mid=layer(W,H,R,c=>{city(c,H*.92,.22,.46,'#140F34',.32,.14);c.fillStyle=grad(c,0,H*.6,0,H,[[0,'rgba(180,80,220,0)'],[1,'rgba(120,40,180,.45)']]);c.fillRect(0,H*.6,W,H*.4);});
      L.near=layer(W,H,R,c=>{let x=-60;const base=H*.93;while(x<W+60){const w=(100+r()*80)*u,h=(30+r()*30)*u;c.fillStyle='#0E0A22';c.fillRect(x,base-h,w,H);
          for(let k=0;k<Math.floor(w/(20*u));k++){if(r()<.6){c.fillStyle=r()<.5?'rgba(255,90,170,.55)':'rgba(95,242,255,.45)';c.fillRect(x+8*u+k*20*u,base-h+12*u,12*u,14*u);}}
          roof(c,x+w/2,base-h,w+14*u,(18+r()*8)*u,'#0A0618','#5A3AA8',u);x+=w+(8+r()*20)*u;}
        c.fillStyle=grad(c,0,H*.85,0,H,[[0,'rgba(20,8,40,0)'],[1,'rgba(10,4,24,.85)']]);c.fillRect(0,H*.85,W,H*.15);});},
    draw(c,t,dt,L,blit,st){const u=L.u;blit(c,L.sky,.015);
      st.cars.forEach(k=>{k.x+=k.v*dt/VW;if(k.x>1.1)k.x=-.1;if(k.x<-.1)k.x=1.1;const x=k.x*VW,y=k.y*VH;c.save();c.globalCompositeOperation='lighter';c.fillStyle=k.col;c.globalAlpha=.8;c.fillRect(x,y,3*u,1.6*u);c.globalAlpha=.25;c.fillRect(x-Math.sign(k.v)*14*u,y+.3*u,14*u,1*u);c.restore();});
      const o1=blit(c,L.far,.06);const o2=blit(c,L.mid,.14);
      c.save();c.globalCompositeOperation='lighter';st.signs.forEach(s=>{const ox=s.par<.1?o1:o2;const fl=Math.sin(t*9+s.ph)>-.85?1:.2;glowDot(c,s.x-L.pad+ox,s.y,Math.max(s.w,s.h)*.9,s.col==='#FF4FA0'?'rgba(255,79,160,A)':s.col==='#5FF2FF'?'rgba(95,242,255,A)':s.col==='#B57CFF'?'rgba(181,124,255,A)':'rgba(255,201,60,A)',.22*fl);});c.restore();
      blit(c,L.near,.22);},
    sprite(kind,w){
      if(kind==='main')return {x0:-40,y0:-26,x1:w+40,y1:172,d:c=>{
        c.fillStyle=grad(c,0,10,0,170,[[0,'#2A2450'],[1,'#120C26']]);c.fillRect(10,8,w-20,164);
        for(let x=30;x<w-30;x+=46)for(let y=30;y<160;y+=34){c.fillStyle=(x+y)%3?'rgba(95,242,255,.35)':'rgba(255,79,160,.35)';c.fillRect(x,y,24,16);c.strokeStyle='rgba(10,6,24,.9)';c.lineWidth=1;c.strokeRect(x,y,24,16);}
        c.fillStyle='#3A3466';c.fillRect(-8,-3,w+16,13);c.strokeStyle=OL;c.lineWidth=2.2;c.strokeRect(-8,-3,w+16,13);
        c.fillStyle='#5FF2FF';c.fillRect(-8,-3,w+16,2);c.fillStyle='#FF4FA0';c.fillRect(-8,8,w+16,1.6);
        [[70,'#2E2A50'],[w-110,'#2E2A50']].forEach(([x,col])=>{c.fillStyle=col;c.fillRect(x,-24,40,22);c.strokeStyle=OL;c.lineWidth=1.6;c.strokeRect(x,-24,40,22);c.strokeStyle='#5A548A';for(let k=0;k<4;k++){c.beginPath();c.moveTo(x+6+k*8,-20);c.lineTo(x+6+k*8,-6);c.stroke();}});
        c.globalCompositeOperation='destination-out';c.fillStyle=grad(c,0,130,0,172,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,1)']]);c.fillRect(-50,130,w+100,44);}};
      if(kind==='side')return {x0:-8,y0:-8,x1:w+8,y1:30,d:c=>{
        c.fillStyle='#3A3466';c.fillRect(-4,-4,w+8,9);c.strokeStyle=OL;c.lineWidth=2;c.strokeRect(-4,-4,w+8,9);c.fillStyle='#5FF2FF';c.fillRect(-4,-4,w+8,1.6);
        c.strokeStyle='#5A548A';c.lineWidth=1.4;for(let x=8;x<w;x+=14){c.beginPath();c.moveTo(x,5);c.lineTo(x+7,14);c.lineTo(x+14,5);c.stroke();}c.beginPath();c.moveTo(0,14);c.lineTo(w,14);c.stroke();}};
      return {x0:-14,y0:-8,x1:w+14,y1:46,d:c=>{
        c.fillStyle='#120A2A';c.fillRect(-10,4,w+20,34);c.strokeStyle='#FF4FA0';c.lineWidth=2;c.strokeRect(-10,4,w+20,34);
        c.fillStyle='#FF4FA0';c.font='bold 16px sans-serif';c.textAlign='center';c.fillText('RIFT',w/2-20,28);c.fillStyle='#5FF2FF';c.fillText('ラーメン',w/2+26,28);
        c.fillStyle='#3A3466';c.fillRect(-4,-4,w+8,9);c.strokeStyle=OL;c.lineWidth=2;c.strokeRect(-4,-4,w+8,9);c.fillStyle='#5FF2FF';c.fillRect(-4,-4,w+8,1.6);}};},
    over(c,p,kind,t,w){c.save();c.globalCompositeOperation='lighter';if(kind==='top'){const fl=Math.sin(t*7)>-.9?.22:.05;glowDot(c,p.x1+w/2,p.y+22,w*.7,'rgba(255,79,160,A)',fl);}
      else glowDot(c,p.x1+w/2,p.y,w*.6,'rgba(95,242,255,A)',.12+.04*Math.sin(t*3+p.x1*.01));c.restore();}
  });

  /* =================================================================
     COSMIC OUTPOST (Mighty Vanguard): a station on the rim of a giant blue planet, saucer platforms
     ================================================================= */
  const cosmos=makeArena({name:'Cosmic Outpost',seed:9001,
    build(L,r,st){const {W,H,R,u}=L;st.ships=[];const sr=rng(3);for(let i=0;i<3;i++)st.ships.push({x:sr(),y:.12+sr()*.25,v:(sr()<.5?-1:1)*(10+sr()*16),s:.6+sr()*.6});st.shoot=0;
      L.sky=layer(W,H,R,c=>{c.fillStyle=grad(c,0,0,0,H,[[0,'#02030F'],[.5,'#0A0E34'],[1,'#1A1050']]);c.fillRect(0,0,W,H);
        for(let i=0;i<260;i++){const s=r()<.92?.8:1.8;c.globalAlpha=.3+r()*.7;c.fillStyle=r()<.8?'#E8F0FF':'#B5D8FF';c.fillRect(r()*W,r()*H*.8,s,s);}c.globalAlpha=1;
        c.fillStyle='rgba(120,60,200,.12)';c.beginPath();c.ellipse(W*.3,H*.25,W*.3,H*.08,-.3,0,Math.PI*2);c.fill();
        const px=W*.72,py=H*.62,pr=H*.62;let g=c.createRadialGradient(px,py,pr*.95,px,py,pr*1.18);g.addColorStop(0,'rgba(90,170,255,.45)');g.addColorStop(1,'rgba(90,170,255,0)');c.fillStyle=g;c.fillRect(0,0,W,H);
        g=c.createRadialGradient(px-pr*.35,py-pr*.45,pr*.1,px,py,pr);g.addColorStop(0,'#7AC8FF');g.addColorStop(.5,'#2A6AD0');g.addColorStop(1,'#0A1A5A');c.fillStyle=g;c.beginPath();c.arc(px,py,pr,0,Math.PI*2);c.fill();
        c.save();c.beginPath();c.arc(px,py,pr,0,Math.PI*2);c.clip();c.strokeStyle='rgba(200,230,255,.25)';for(let i=0;i<8;i++){c.lineWidth=(3+r()*6)*u;c.beginPath();c.ellipse(px,py+(-.6+i*.17)*pr,pr*1.1,pr*.05,-.12,0,Math.PI*2);c.stroke();}
        c.fillStyle='rgba(5,10,40,.45)';c.beginPath();c.arc(px+pr*.35,py+pr*.3,pr,0,Math.PI*2);c.fill();c.restore();});
      L.spires=layer(W,H,R,c=>{const col='#141A3A';[[W*.2,H*.18,22],[W*.27,H*.34,14],[W*.08,H*.4,12],[W*.9,H*.3,16]].forEach(([x,top,w])=>{w*=u;c.fillStyle=col;c.beginPath();c.moveTo(x-w,H*.8);c.lineTo(x-w*.4,top+20*u);c.lineTo(x,top);c.lineTo(x+w*.4,top+20*u);c.lineTo(x+w,H*.8);c.closePath();c.fill();
          for(let y=top+30*u;y<H*.78;y+=14*u){if(r()<.6){c.fillStyle='rgba(95,200,255,.7)';c.fillRect(x-1.5*u,y,3*u,5*u);}}c.fillStyle='#FF4D5E';c.fillRect(x-1*u,top-6*u,2*u,6*u);});
        [[W*.36,H*.55,60],[W*.62,H*.48,46]].forEach(([x,y,rw])=>{rw*=u;c.fillStyle='#1A2048';c.fillRect(x-2*u,y,4*u,H);c.beginPath();c.ellipse(x,y,rw,rw*.22,0,0,Math.PI*2);c.fill();c.fillStyle='#2A3470';c.beginPath();c.ellipse(x,y-rw*.08,rw*.9,rw*.15,0,0,Math.PI*2);c.fill();
          for(let k=-3;k<=3;k++){c.fillStyle='rgba(120,220,255,.8)';c.fillRect(x+k*rw*.25-1*u,y-1*u,2*u,2*u);}});
        c.fillStyle=grad(c,0,H*.7,0,H,[[0,'rgba(10,14,40,0)'],[1,'rgba(6,8,26,.9)']]);c.fillRect(0,H*.7,W,H*.3);});},
    draw(c,t,dt,L,blit,st){const u=L.u;blit(c,L.sky,.01);
      st.ships.forEach(s=>{s.x+=s.v*dt/VW;if(s.x>1.15)s.x=-.15;if(s.x<-.15)s.x=1.15;const x=s.x*VW,y=s.y*VH,k=s.s*u;c.save();c.translate(x,y);c.scale(Math.sign(s.v),1);
        c.fillStyle='#2A3060';c.beginPath();c.ellipse(0,0,16*k,4*k,0,0,Math.PI*2);c.fill();c.fillStyle='#4A5AA0';c.beginPath();c.ellipse(0,-2*k,7*k,3.4*k,0,Math.PI,0);c.fill();
        c.globalCompositeOperation='lighter';c.fillStyle='rgba(95,200,255,.8)';c.fillRect(-20*k,-1*k,4*k,2*k);c.globalAlpha=.3;c.fillRect(-34*k,-.6*k,14*k,1.2*k);c.restore();});
      st.shoot-=dt;if(st.shoot<-3)st.shoot=1.2+Math.random()*.2;if(st.shoot>0){const p=1-st.shoot/1.2,x=VW*(.1+p*.5),y=VH*(.08+p*.18);c.save();c.globalCompositeOperation='lighter';c.strokeStyle='rgba(220,240,255,'+(.8*(1-p))+')';c.lineWidth=1.6*u;c.beginPath();c.moveTo(x,y);c.lineTo(x-40*u,y-14*u);c.stroke();c.restore();}
      blit(c,L.spires,.08);},
    sprite(kind,w){
      if(kind==='main')return {x0:-60,y0:-14,x1:w+60,y1:172,d:c=>{
        c.fillStyle=grad(c,0,0,0,80,[[0,'#3A4478'],[1,'#141A3A']]);c.beginPath();c.moveTo(-50,4);c.lineTo(w+50,4);c.lineTo(w+20,40);c.lineTo(w-60,70);c.lineTo(60,70);c.lineTo(-20,40);c.closePath();c.fill();c.strokeStyle=OL;c.lineWidth=2.2;c.stroke();
        c.fillStyle='#141A3A';c.fillRect(w/2-50,70,100,102);c.strokeRect(w/2-50,70,100,102);for(let y=80;y<170;y+=16){c.fillStyle='rgba(95,200,255,.5)';c.fillRect(w/2-40,y,80,3);}
        for(let x=-30;x<w+40;x+=40){c.fillStyle='rgba(120,220,255,.9)';c.beginPath();c.arc(x,22,2.2,0,Math.PI*2);c.fill();}
        c.fillStyle='#5A66A8';c.fillRect(-10,-4,w+20,9);c.strokeStyle=OL;c.lineWidth=2;c.strokeRect(-10,-4,w+20,9);c.fillStyle='#9DF0FF';c.fillRect(-10,-4,w+20,1.6);
        for(let x=10;x<w;x+=50){c.fillStyle='#2A3060';c.fillRect(x,-2,24,5);}
        c.globalCompositeOperation='destination-out';c.fillStyle=grad(c,0,130,0,172,[[0,'rgba(0,0,0,0)'],[1,'rgba(0,0,0,1)']]);c.fillRect(-60,130,w+120,44);}};
      if(kind==='side')return {x0:-14,y0:-8,x1:w+14,y1:26,d:c=>{
        c.fillStyle='#3A4478';c.beginPath();c.ellipse(w/2,4,w/2+10,10,0,0,Math.PI);c.fill();c.strokeStyle=OL;c.lineWidth=2;c.stroke();
        c.fillStyle='#5A66A8';c.fillRect(-6,-4,w+12,8);c.strokeRect(-6,-4,w+12,8);c.fillStyle='#9DF0FF';c.fillRect(-6,-4,w+12,1.6);
        for(let x=12;x<w;x+=22){c.fillStyle='rgba(120,220,255,.9)';c.beginPath();c.arc(x,8,1.6,0,Math.PI*2);c.fill();}}};
      return {x0:-20,y0:-60,x1:w+20,y1:30,d:c=>{
        c.strokeStyle='#5A66A8';c.lineWidth=2;c.beginPath();c.moveTo(w/2,-4);c.lineTo(w/2,-50);c.stroke();c.fillStyle='#FF4D5E';c.beginPath();c.arc(w/2,-52,3,0,Math.PI*2);c.fill();
        c.beginPath();c.moveTo(w/2-14,-30);c.lineTo(w/2+14,-30);c.stroke();
        c.fillStyle='#3A4478';c.beginPath();c.ellipse(w/2,4,w/2+8,14,0,0,Math.PI);c.fill();c.strokeStyle=OL;c.lineWidth=2;c.stroke();
        c.fillStyle='#5A66A8';c.fillRect(-6,-4,w+12,8);c.strokeRect(-6,-4,w+12,8);c.fillStyle='#9DF0FF';c.fillRect(-6,-4,w+12,1.6);}};},
    under(c,p,kind,t,w){if(kind!=='main'){c.save();c.globalCompositeOperation='lighter';const pu=.3+.15*Math.sin(t*8+p.x1*.02);const g=c.createLinearGradient(0,p.y+8,0,p.y+60);g.addColorStop(0,'rgba(120,220,255,'+pu+')');g.addColorStop(1,'rgba(120,220,255,0)');
      c.fillStyle=g;c.beginPath();c.moveTo(p.x1+w*.3,p.y+10);c.lineTo(p.x1+w*.7,p.y+10);c.lineTo(p.x1+w*.6,p.y+60);c.lineTo(p.x1+w*.4,p.y+60);c.closePath();c.fill();c.restore();}},
    over(c,p,kind,t,w){if(kind==='top'){c.save();c.globalCompositeOperation='lighter';glowDot(c,p.x1+w/2,p.y-52,14,'rgba(255,77,94,A)',.4+.4*(Math.sin(t*4)>0?1:0));c.restore();}}
  });
