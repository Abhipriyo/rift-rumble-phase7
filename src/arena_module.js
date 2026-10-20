/* =====================================================================
   ARENAS (render-only). An arena replaces drawSky/drawPlat for one universe.
   Platform geometry is NOT owned here: it reads the same `plats` array the physics uses,
   so the walkable surface is always drawn at p.y. Static layers are baked to offscreen
   canvases (rebuilt only on resize) and drawn with parallax; only small live effects
   (moon clouds, lantern flicker, petals, rift tear, charms) are drawn per frame.
   ===================================================================== */
const ARENAS=(function(){
  function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
  function layer(w,h,R,fn){const cv=document.createElement('canvas');cv.width=Math.max(1,Math.ceil(w*R));cv.height=Math.max(1,Math.ceil(h*R));const c=cv.getContext('2d');c.scale(R,R);fn(c,w,h);return cv;}
  function roof(c,cx,y,w,h,col,rim,u){
    c.beginPath();c.moveTo(cx-w/2-10*u,y-7*u);c.quadraticCurveTo(cx-w/2+3*u,y+1*u,cx-w/2+w*.2,y-h*.55);c.lineTo(cx-w*.16,y-h);c.lineTo(cx+w*.16,y-h);
    c.lineTo(cx+w/2-w*.2,y-h*.55);c.quadraticCurveTo(cx+w/2-3*u,y+1*u,cx+w/2+10*u,y-7*u);c.lineTo(cx+w/2,y);c.lineTo(cx-w/2,y);c.closePath();c.fillStyle=col;c.fill();
    if(rim){c.beginPath();c.moveTo(cx+w*.16,y-h);c.lineTo(cx+w/2-w*.2,y-h*.55);c.quadraticCurveTo(cx+w/2-3*u,y+1*u,cx+w/2+10*u,y-7*u);c.strokeStyle=rim;c.lineWidth=1.3*u;c.stroke();}
  }
  function glowDot(c,x,y,r,col,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col.replace('A',a));g.addColorStop(1,col.replace('A',0));c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}

  function shinobi(){
    let L=null,key='';const lanterns=[];const plat={};
    const petals=[];const pr=rng(7);for(let i=0;i<34;i++)petals.push({x:pr(),y:pr(),v:18+pr()*40,s:pr()*6,r:2.4+pr()*2.6,z:.6+pr()*.6});
    function build(){
      const R=Math.min(2,(typeof DPR!=='undefined'?DPR:1)*K),pad=80,W=VW+pad*2,H=VH,u=H/540;lanterns.length=0;
      const r=rng(1337);
      L={R,pad,W,H,u,
        sky:layer(W,H,R,c=>{
          const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#060920');g.addColorStop(.42,'#1B1146');g.addColorStop(.7,'#45195E');g.addColorStop(.86,'#74296C');g.addColorStop(1,'#2A1140');
          c.fillStyle=g;c.fillRect(0,0,W,H);
          for(let i=0;i<150;i++){const x=r()*W,y=r()*H*.62,s=.4+r()*1.2;c.globalAlpha=.25+r()*.7;c.fillStyle='#FFF4FB';c.fillRect(x,y,s,s);
            if(s>1.3){c.globalAlpha*=.6;c.fillRect(x-2.5,y+s/2-.25,5+s,.5);c.fillRect(x+s/2-.25,y-2.5,.5,5+s);}}
          c.globalAlpha=1;
          const mx=W*.74,my=H*.24,mr=H*.12;
          let rg=c.createRadialGradient(mx,my,mr*.8,mx,my,mr*3.4);rg.addColorStop(0,'rgba(255,175,220,.35)');rg.addColorStop(1,'rgba(255,175,220,0)');c.fillStyle=rg;c.fillRect(mx-mr*3.4,my-mr*3.4,mr*6.8,mr*6.8);
          rg=c.createRadialGradient(mx-mr*.3,my-mr*.3,mr*.1,mx,my,mr);rg.addColorStop(0,'#FFF8FB');rg.addColorStop(1,'#F5C8DE');c.fillStyle=rg;c.beginPath();c.arc(mx,my,mr,0,Math.PI*2);c.fill();
          c.fillStyle='rgba(214,150,190,.35)';[[-.35,-.2,.18],[.3,.25,.14],[.05,.42,.1],[-.2,.35,.08],[.38,-.32,.09]].forEach(([dx,dy,s])=>{c.beginPath();c.ellipse(mx+dx*mr,my+dy*mr,s*mr,s*mr*.8,0,0,Math.PI*2);c.fill();});
          c.save();c.beginPath();c.arc(mx,my,mr,0,Math.PI*2);c.clip();c.fillStyle='rgba(150,80,140,.22)';c.beginPath();c.arc(mx+mr*.35,my+mr*.3,mr,0,Math.PI*2);c.fill();c.restore();
        }),
        mtn:layer(W,H,R,c=>{
          [[H*.66,.12,.2,'#2C1C58'],[H*.7,.15,.28,'#22154A']].forEach(([base,hmin,hmax,col],li)=>{
            const pts=[];let x=-40;while(x<W+60){pts.push([x,base-H*(hmin+r()*(hmax-hmin))]);x+=50+r()*110;}
            c.beginPath();c.moveTo(-40,H);pts.forEach(([px,py],i)=>{if(i)c.lineTo((px+pts[i-1][0])/2,base-H*.05-r()*H*.04);c.lineTo(px,py);});c.lineTo(W+60,H);c.closePath();c.fillStyle=col;c.fill();
            pts.forEach(([px,py])=>{c.beginPath();c.moveTo(px,py);c.lineTo(px+38*u,py+46*u);c.lineTo(px+12*u,py+52*u);c.closePath();c.fillStyle=li?'rgba(150,120,230,.16)':'rgba(170,140,240,.22)';c.fill();
              c.beginPath();c.moveTo(px,py);c.lineTo(px+9*u,py+11*u);c.lineTo(px+3*u,py+9*u);c.lineTo(px-4*u,py+13*u);c.lineTo(px-8*u,py+9*u);c.closePath();c.fillStyle='rgba(235,220,255,.55)';c.fill();});
          });
          const g=c.createLinearGradient(0,H*.56,0,H*.8);g.addColorStop(0,'rgba(170,80,170,0)');g.addColorStop(1,'rgba(170,80,170,.42)');c.fillStyle=g;c.fillRect(0,H*.56,W,H*.44);
        }),
        castle:layer(W,H,R,c=>{
          const col='#1A1136',rim='#55428F';
          const cx=W*.26;
          c.fillStyle='#140C2B';c.beginPath();c.moveTo(cx-120*u,H);c.lineTo(cx-92*u,H*.8);c.lineTo(cx+92*u,H*.8);c.lineTo(cx+120*u,H);c.closePath();c.fill();
          let y=H*.8;[[150,20],[118,18],[90,17],[64,16]].forEach(([w,wh],i)=>{w*=u;wh*=u;
            c.fillStyle='#211640';c.fillRect(cx-w/2,y-wh,w,wh);
            for(let k=0;k<Math.floor(w/(14*u));k++){const wx=cx-w/2+7*u+k*14*u;if(r()<.55){c.fillStyle='rgba(255,182,96,.9)';c.fillRect(wx,y-wh*.68,5*u,6*u);glowDot(c,wx+2.5*u,y-wh*.68+3*u,12*u,'rgba(255,160,80,A)',.25);}else{c.fillStyle='#120A26';c.fillRect(wx,y-wh*.68,5*u,6*u);}}
            roof(c,cx,y-wh,w+18*u,22*u,col,rim,u);y-=wh+18*u;});
          c.fillStyle=col;c.fillRect(cx-2*u,y-26*u,4*u,26*u);
          const px=W*.86;y=H*.78;
          [[70,12],[60,12],[50,11],[42,11],[34,10]].forEach(([w,wh])=>{w*=u;wh*=u;c.fillStyle='#1E1440';c.fillRect(px-w*.36,y-wh,w*.72,wh);
            if(r()<.6){c.fillStyle='rgba(255,182,96,.85)';c.fillRect(px-2*u,y-wh*.75,4*u,5*u);}roof(c,px,y-wh,w,16*u,col,rim,u);y-=wh+12*u;});
          c.fillStyle=col;c.fillRect(px-1.5*u,y-40*u,3*u,40*u);for(let i=0;i<6;i++){c.fillRect(px-5*u,y-10*u-i*5*u,10*u,1.6*u);}
        }),
        town:layer(W,H,R,c=>{
          let x=-60;const base=H*.86;const tops=[];
          while(x<W+60){const w=(110+r()*90)*u,h=(34+r()*36)*u,top=base-h;tops.push([x,w,top]);
            c.fillStyle='#160D2E';c.fillRect(x,top,w,H-top);
            for(let k=0;k<Math.floor(w/(22*u));k++){const wx=x+8*u+k*22*u;if(r()<.6){c.fillStyle='rgba(242,180,110,.62)';c.fillRect(wx,top+14*u,14*u,16*u);c.strokeStyle='rgba(22,10,36,.8)';c.lineWidth=1*u;c.strokeRect(wx,top+14*u,14*u,16*u);c.beginPath();c.moveTo(wx+7*u,top+14*u);c.lineTo(wx+7*u,top+30*u);c.moveTo(wx,top+22*u);c.lineTo(wx+14*u,top+22*u);c.stroke();}}
            roof(c,x+w/2,top,w+14*u,(22+r()*8)*u,'#0F0822','#3D2D78',u);x+=w+(6+r()*20)*u;}
          for(let i=0;i+1<tops.length;i+=2){const a=tops[i],b=tops[i+1];if(!b)break;const x1=a[0]+a[1]*.7,x2=b[0]+b[1]*.3,y1=a[2]-4*u,y2=b[2]-4*u,sag=26*u;
            c.beginPath();c.moveTo(x1,y1);c.quadraticCurveTo((x1+x2)/2,(y1+y2)/2+sag,x2,y2);c.strokeStyle='rgba(30,16,40,.9)';c.lineWidth=1.2*u;c.stroke();
            for(let k=1;k<5;k++){const tt=k/5;const lx=(1-tt)*(1-tt)*x1+2*(1-tt)*tt*(x1+x2)/2+tt*tt*x2,ly=(1-tt)*(1-tt)*y1+2*(1-tt)*tt*((y1+y2)/2+sag)+tt*tt*y2+6*u;
              c.fillStyle='#E8473A';c.beginPath();c.ellipse(lx,ly,4.2*u,5.6*u,0,0,Math.PI*2);c.fill();c.fillStyle='#1A0D1E';c.fillRect(lx-2.5*u,ly-6.6*u,5*u,1.6*u);c.fillRect(lx-2.5*u,ly+5*u,5*u,1.6*u);
              lanterns.push([lx,ly]);}}
          [[W*.05,1],[W*.95,-1]].forEach(([tx,dir])=>{
            c.strokeStyle='#2B1626';c.lineCap='round';
            const br=(x0,y0,a,len,w,d)=>{if(d>4||len<8*u)return;const x1=x0+Math.cos(a)*len,y1=y0+Math.sin(a)*len;c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
              br(x1,y1,a-.45-r()*.3,len*.72,w*.62,d+1);br(x1,y1,a+.35+r()*.3,len*.68,w*.6,d+1);};
            br(tx,H,-Math.PI/2+dir*.18,110*u,13*u,0);
            const cx=tx+dir*30*u,cy=H*.5;
            for(let i=0;i<90;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*90*u;const x=cx+Math.cos(a)*d*1.3,y=cy+Math.sin(a)*d*.75,rad=(6+r()*12)*u;
              c.fillStyle=['#8E2A63','#C23C7E','#E8609E','#FF8FC0','#FFB8D8'][Math.min(4,Math.floor(r()*3+(y<cy?2:0)))];c.globalAlpha=.92;c.beginPath();c.arc(x,y,rad,0,Math.PI*2);c.fill();}
            c.globalAlpha=1;});
          const g=c.createLinearGradient(0,H*.82,0,H);g.addColorStop(0,'rgba(40,14,60,0)');g.addColorStop(1,'rgba(20,8,36,.85)');c.fillStyle=g;c.fillRect(0,H*.82,W,H*.18);
        })
      };
    }
    function blit(c,cv,par){const ox=-(cam.x-480)*par;c.drawImage(cv,-L.pad+ox,0,L.W,L.H);return ox;}
    function sky(c,t,dt){
      const k=VW.toFixed(1)+'x'+VH.toFixed(1)+'x'+((typeof DPR!=='undefined'?DPR:1)*K).toFixed(2);if(k!==key||!L){key=k;build();}
      const u=L.u;
      blit(c,L.sky,.015);
      const mx=L.W*.74-L.pad,my=L.H*.24,mr=L.H*.12;
      c.save();c.fillStyle='rgba(44,22,80,.75)';for(let i=0;i<3;i++){const x=((t*(6+i*3)+i*260)%(VW+500))-250;c.beginPath();c.ellipse(x,my+(i-1)*mr*.55,mr*(1.4+i*.3),mr*.13,0,0,Math.PI*2);c.fill();}c.restore();
      c.save();c.globalCompositeOperation='lighter';const rx=VW*.17,ry=VH*.13,pulse=.55+.25*Math.sin(t*2.3);c.globalAlpha=pulse;
      c.strokeStyle='#B57CFF';c.lineWidth=5*u;c.lineJoin='round';c.beginPath();c.moveTo(rx-40*u,ry-12*u);c.lineTo(rx-18*u,ry+2*u);c.lineTo(rx-4*u,ry-6*u);c.lineTo(rx+16*u,ry+10*u);c.lineTo(rx+38*u,ry+2*u);c.stroke();
      c.strokeStyle='#FFD1F2';c.lineWidth=1.6*u;c.stroke();c.restore();
      blit(c,L.mtn,.04);blit(c,L.castle,.1);const ox=blit(c,L.town,.22);
      c.save();c.globalCompositeOperation='lighter';lanterns.forEach(([x,y],i)=>{const fl=.22+.08*Math.sin(t*7+i*1.7)+.04*Math.sin(t*13+i);glowDot(c,x-L.pad+ox,y,26*u,'rgba(255,140,70,A)',fl);});c.restore();
      c.save();petals.forEach(p=>{p.y+=p.v*p.z*dt/VH;p.x+=(Math.sin(t*.8+p.s)*.02-.012)*dt;if(p.y>1.05){p.y=-.05;p.x=Math.random()*1.1;}if(p.x<-.05)p.x=1.05;
        c.save();c.translate(p.x*VW,p.y*VH);c.rotate(t*1.6+p.s);c.scale(1,.55+.45*Math.sin(t*3+p.s));c.globalAlpha=.55+.35*p.z;c.fillStyle=p.z>1?'#FFB8D8':'#FF8FC0';
        const r=p.r*p.z*u;c.beginPath();c.moveTo(0,-r);c.quadraticCurveTo(r,-r*.2,0,r);c.quadraticCurveTo(-r,-r*.2,0,-r);c.fill();c.restore();});c.restore();
      return true;
    }
    function sprite(kind,w){
      const kk=kind+w;if(plat[kk])return plat[kk];const R=3;let spec;
      if(kind==='main')spec={x0:-64,y0:-30,x1:w+64,y1:172,d:c=>{
        const g=c.createLinearGradient(0,50,0,170);g.addColorStop(0,'#2C2148');g.addColorStop(1,'#120A24');c.fillStyle=g;c.fillRect(20,48,w-40,124);
        for(let x=20;x<=w-20;x+=72){c.fillStyle='#1A0F1E';c.fillRect(x-4,48,8,124);}
        c.fillStyle='#2A1820';c.fillRect(20,58,w-40,6);
        for(let x=34;x<w-40;x+=72){c.fillStyle='rgba(232,169,98,.5)';c.fillRect(x,74,44,34);c.strokeStyle='rgba(26,15,30,.9)';c.lineWidth=1.4;for(let k=1;k<4;k++){c.beginPath();c.moveTo(x+k*11,74);c.lineTo(x+k*11,108);c.stroke();}
          c.beginPath();c.moveTo(x,91);c.lineTo(x+44,91);c.stroke();c.strokeRect(x,74,44,34);}
        const rf=c=>{c.beginPath();c.moveTo(0,8);c.lineTo(w,8);c.lineTo(w+46,46);c.quadraticCurveTo(w+56,46,w+60,32);c.lineTo(w+64,46);c.lineTo(w+48,52);c.lineTo(-48,52);c.lineTo(-64,46);c.lineTo(-60,32);c.quadraticCurveTo(-56,46,-46,46);c.closePath();};
        c.save();rf(c);c.fillStyle='#3B3466';c.fill();c.clip();
        for(let i=-6;i<=w/9+6;i++){const xt=i*9,xb=-48+(i*9)*(w+96)/w;c.beginPath();c.moveTo(xt,8);c.lineTo(xb,52);c.strokeStyle='#2B2452';c.lineWidth=3;c.stroke();c.strokeStyle='rgba(120,110,190,.45)';c.lineWidth=1;c.beginPath();c.moveTo(xt+1.4,8);c.lineTo(xb+1.6,52);c.stroke();}
        for(let y=14;y<52;y+=7){c.strokeStyle='rgba(20,14,40,.6)';c.lineWidth=1.2;c.beginPath();c.moveTo(-70,y);c.lineTo(w+70,y);c.stroke();}
        const sg=c.createLinearGradient(0,8,0,52);sg.addColorStop(0,'rgba(140,130,220,.25)');sg.addColorStop(1,'rgba(10,6,24,.35)');c.fillStyle=sg;c.fillRect(-70,8,w+140,44);c.restore();
        c.save();rf(c);c.strokeStyle='#160A24';c.lineWidth=2.4;c.stroke();c.restore();
        c.beginPath();c.moveTo(-48,51);c.lineTo(w+48,51);c.strokeStyle='#1E1638';c.lineWidth=5;c.stroke();
        [[-60,32],[w+60,32]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,2.6,0,Math.PI*2);c.fillStyle='#C9A04A';c.fill();});
        c.beginPath();c.roundRect?c.roundRect(-6,-3,w+12,12,5):c.rect(-6,-3,w+12,12);c.fillStyle='#2A2245';c.fill();c.strokeStyle='#160A24';c.lineWidth=2;c.stroke();
        for(let x=4;x<w;x+=16){c.beginPath();c.arc(x,-1,4,Math.PI,0);c.fillStyle='#3A3163';c.fill();}
        c.beginPath();c.moveTo(-4,-2.4);c.lineTo(w+4,-2.4);c.strokeStyle='#A69CE2';c.lineWidth=1.6;c.stroke();
        [[-10,1],[w+10,-1]].forEach(([x,d])=>{c.save();c.translate(x,0);c.scale(d,1);c.beginPath();c.moveTo(-6,9);c.lineTo(-6,-10);c.quadraticCurveTo(-11,-21,-2,-26);c.lineTo(5,-17);c.lineTo(5,9);c.closePath();
          c.fillStyle='#241C3F';c.fill();c.strokeStyle='#160A24';c.lineWidth=2;c.stroke();c.beginPath();c.moveTo(-5,-9);c.quadraticCurveTo(-9,-19,-2,-24);c.strokeStyle='#8A80CC';c.lineWidth=1.2;c.stroke();
          c.beginPath();c.arc(0,-6,1.8,0,Math.PI*2);c.fillStyle='#C9A04A';c.fill();c.restore();});
        [46,w-46].forEach(x=>{c.strokeStyle='#160A24';c.lineWidth=1.2;c.beginPath();c.moveTo(x,51);c.lineTo(x,60);c.stroke();
          c.fillStyle='#160A24';c.fillRect(x-6,58,12,3);c.fillRect(x-6,84,12,3);
          c.beginPath();c.ellipse(x,72,9,12,0,0,Math.PI*2);c.fillStyle='#E04636';c.fill();c.strokeStyle='#160A24';c.lineWidth=1.6;c.stroke();
          c.strokeStyle='rgba(90,20,20,.6)';c.lineWidth=.8;for(let k=-6;k<=6;k+=3){c.beginPath();c.ellipse(x,72,Math.sqrt(Math.max(0,81-k*k*1.6)),.5,0,0,Math.PI*2);}
          for(let k=64;k<82;k+=3.5){c.beginPath();c.moveTo(x-8.5*Math.sqrt(1-((k-72)/12)**2),k);c.lineTo(x+8.5*Math.sqrt(1-((k-72)/12)**2),k);c.stroke();}
          c.beginPath();c.arc(x,72,3.6,0,Math.PI*2);c.fillStyle='#FFF1E6';c.fill();c.beginPath();c.arc(x,72,1.6,0,Math.PI*2);c.fillStyle='#E04636';c.fill();});
        c.globalCompositeOperation='destination-out';const fg=c.createLinearGradient(0,130,0,172);fg.addColorStop(0,'rgba(0,0,0,0)');fg.addColorStop(1,'rgba(0,0,0,1)');c.fillStyle=fg;c.fillRect(-70,130,w+140,44);
      }};
      else if(kind==='side')spec={x0:-12,y0:-12,x1:w+12,y1:44,d:c=>{
        c.beginPath();c.moveTo(-8,-8);c.quadraticCurveTo(-2,-4,0,-5);c.lineTo(w,-5);c.quadraticCurveTo(w+2,-4,w+8,-8);c.lineTo(w+4,4);c.lineTo(-4,4);c.closePath();c.fillStyle='#9A6542';c.fill();c.strokeStyle='#160A24';c.lineWidth=2;c.stroke();
        for(let x=22;x<w;x+=22){c.beginPath();c.moveTo(x,-5);c.lineTo(x,4);c.strokeStyle='rgba(60,30,20,.7)';c.lineWidth=1;c.stroke();}
        c.beginPath();c.moveTo(-2,-4.4);c.lineTo(w+2,-4.4);c.strokeStyle='#E2AC78';c.lineWidth=1.4;c.stroke();
        c.fillStyle='#5A3324';c.fillRect(2,4,w-4,8);c.strokeStyle='#160A24';c.lineWidth=1.6;c.strokeRect(2,4,w-4,8);
        [w*.25,w*.75].forEach(x=>{c.fillStyle='#3A2018';c.fillRect(x-3,12,6,6);});
        const x=w/2;c.strokeStyle='#160A24';c.lineWidth=1;c.beginPath();c.moveTo(x,12);c.lineTo(x,20);c.stroke();
        c.beginPath();c.ellipse(x,29,6,8,0,0,Math.PI*2);c.fillStyle='#F2E6D0';c.fill();c.stroke();c.fillStyle='#160A24';c.fillRect(x-4,19.5,8,2);c.fillRect(x-4,36.5,8,2);
        c.beginPath();c.arc(x,29,2.4,0,Math.PI*2);c.fillStyle='#E04636';c.fill();
      }};
      else spec={x0:-34,y0:-12,x1:w+34,y1:52,d:c=>{
        const rf=c=>{c.beginPath();c.moveTo(0,8);c.lineTo(w,8);c.lineTo(w+22,32);c.quadraticCurveTo(w+30,32,w+32,22);c.lineTo(w+34,32);c.lineTo(w+22,38);c.lineTo(-22,38);c.lineTo(-34,32);c.lineTo(-32,22);c.quadraticCurveTo(-30,32,-22,32);c.closePath();};
        c.save();rf(c);c.fillStyle='#3B3466';c.fill();c.clip();for(let i=-4;i<=w/8+4;i++){const xt=i*8,xb=-22+(i*8)*(w+44)/w;c.beginPath();c.moveTo(xt,8);c.lineTo(xb,38);c.strokeStyle='#2B2452';c.lineWidth=2.6;c.stroke();}
        const sg=c.createLinearGradient(0,8,0,38);sg.addColorStop(0,'rgba(140,130,220,.25)');sg.addColorStop(1,'rgba(10,6,24,.4)');c.fillStyle=sg;c.fillRect(-40,8,w+80,30);c.restore();
        c.save();rf(c);c.strokeStyle='#160A24';c.lineWidth=2.2;c.stroke();c.restore();
        c.beginPath();c.rect(-4,-3,w+8,11);c.fillStyle='#2A2245';c.fill();c.strokeStyle='#160A24';c.lineWidth=2;c.stroke();
        for(let x=4;x<w;x+=14){c.beginPath();c.arc(x,-1,3.6,Math.PI,0);c.fillStyle='#3A3163';c.fill();}
        c.beginPath();c.moveTo(-2,-2.4);c.lineTo(w+2,-2.4);c.strokeStyle='#A69CE2';c.lineWidth=1.6;c.stroke();
        c.fillStyle='#C9A04A';[[-32,22],[w+32,22]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,2.2,0,Math.PI*2);c.fill();});
      }};
      const cv=document.createElement('canvas');cv.width=Math.ceil((spec.x1-spec.x0)*R);cv.height=Math.ceil((spec.y1-spec.y0)*R);const c=cv.getContext('2d');
      c.scale(R,R);c.translate(-spec.x0,-spec.y0);c.lineJoin='round';spec.d(c);
      return plat[kk]={cv,x0:spec.x0,y0:spec.y0,w:spec.x1-spec.x0,h:spec.y1-spec.y0};
    }
    function platform(c,p){
      const w=p.x2-p.x1,t=typeof G!=='undefined'?G.time||performance.now()/1000:0;
      if(p.main){const s=sprite('main',w);c.drawImage(s.cv,p.x1+s.x0,p.y+s.y0,s.w,s.h);
        c.save();c.globalCompositeOperation='lighter';[p.x1+46,p.x2-46].forEach((x,i)=>{const fl=.35+.1*Math.sin(t*6+i*2)+.05*Math.sin(t*15+i);glowDot(c,x,p.y+72,48,'rgba(255,120,70,A)',fl);});c.restore();return true;}
      const top=p.y<200;const s=sprite(top?'top':'side',w);
      if(!top){c.save();c.globalCompositeOperation='lighter';const pu=.35+.15*Math.sin(t*2.2+p.x1*.01);const g=c.createRadialGradient(p.x1+w/2,p.y+20,4,p.x1+w/2,p.y+20,w*.6);
        g.addColorStop(0,'rgba(181,124,255,'+pu+')');g.addColorStop(1,'rgba(181,124,255,0)');c.fillStyle=g;c.fillRect(p.x1-w*.1,p.y-10,w*1.2,w*.7);c.restore();}
      c.drawImage(s.cv,p.x1+s.x0,p.y+s.y0,s.w,s.h);
      if(!top){[p.x1+18,p.x2-18].forEach((x,i)=>{const a=Math.sin(t*3+i*2+p.x1*.02)*.25-(p.dx||0)*.08;c.save();c.translate(x,p.y+12);c.rotate(a);
        c.fillStyle='#F4EBDA';c.fillRect(-3,0,6,18);c.strokeStyle='#160A24';c.lineWidth=1;c.strokeRect(-3,0,6,18);c.strokeStyle='#C2373F';c.lineWidth=1.1;c.beginPath();c.moveTo(-1.4,4);c.lineTo(1.4,4);c.moveTo(0,4);c.lineTo(0,13);c.moveTo(-1.6,9);c.lineTo(1.6,9);c.stroke();c.restore();});}
      else{const x=p.x1+w/2,a=Math.sin(t*2.6)*.18;c.save();c.translate(x,p.y+38);c.rotate(a);c.strokeStyle='#160A24';c.lineWidth=1;c.beginPath();c.moveTo(0,0);c.lineTo(0,6);c.stroke();
        c.beginPath();c.arc(0,10,5,Math.PI,0);c.lineTo(5,11);c.lineTo(-5,11);c.closePath();c.fillStyle='#7FD8E8';c.fill();c.stroke();c.fillStyle='#F4EBDA';c.fillRect(-1.5,12,3,9);c.restore();
        c.save();c.globalCompositeOperation='lighter';glowDot(c,x,p.y+48,18,'rgba(127,216,232,A)',.18);c.restore();}
      return true;
    }
    return {sky,platform,name:'Shinobi Rooftops'};
  }
  const A={sh:shinobi()};
  const broken={};
  return {
    sky(u,c,t,dt){const a=A[u];if(!a||broken[u])return false;try{return a.sky(c,t,dt);}catch(e){broken[u]=1;console.warn('arena fallback',u,e);return false;}},
    platform(u,c,p){const a=A[u];if(!a||broken[u])return false;try{return a.platform(c,p);}catch(e){broken[u]=1;console.warn('arena fallback',u,e);return false;}},
    has:u=>!!A[u]&&!broken[u]
  };
})();
