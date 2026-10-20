  /* =================================================================
     MIGHTY VANGUARD
     ================================================================= */
  /* ---------- TIN TITAN (armored blaster) ---------- */
  const TT={w:'#E6E9F2',wS:'#A7ADC4',wL:'#FFFFFF',d:'#20243A',dS:'#0F1120',dL:'#4E5678',blue:'#33C6FF',blueG:'#9DF0FF',red:'#FF4D5E'};
  function ttGlow(c,pts,w){glowLine(c,pts,w||.8,TT.blueG,2.5);}
  function ttHead(kind){return function(c){
    cel(c,c=>capsule(c,5.4,5,7.5),TT.d,TT.dS,TT.dL,.6,1.2);
    cel(c,c=>{c.beginPath();c.moveTo(-6,-7);c.lineTo(-13,-15);c.lineTo(-3,-10.6);c.closePath();},TT.w,TT.wS,TT.wL,.5,1.2);
    const hd=c=>{c.beginPath();c.moveTo(-9.4,5);c.lineTo(-10,-4);c.quadraticCurveTo(-8,-11.6,0,-12);c.quadraticCurveTo(8.6,-11.6,11,-4.4);c.lineTo(11.6,3.6);c.lineTo(8.6,9.6);c.lineTo(1,10.4);c.lineTo(-6,9.4);c.closePath();};
    cel(c,hd,TT.w,TT.wS,TT.wL,1.2,1.5);
    cel(c,c=>{c.beginPath();c.moveTo(1,-4.6);c.lineTo(11.6,-3.6);c.lineTo(11.4,5.4);c.lineTo(8,8.4);c.lineTo(2,7.6);c.closePath();},TT.d,TT.dS,null,.3,1);
    const on=kind==='hurt'?'#FF9AA8':TT.blueG,h=kind==='blink'?.3:kind==='attack'?1.2:1.6;
    c.save();c.shadowColor=on;c.shadowBlur=3*S;c.fillStyle=on;c.beginPath();c.ellipse(5,-.4,1.9,h,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(9.6,-.6,1.1,h*.9,0,0,Math.PI*2);c.fill();c.restore();
    line(c,[-5,-4,-1,-4],.7,TT.wS);c.fillStyle=TT.red;c.fillRect(-3.6,-9.4,2.4,1.4);c.fillRect(-.2,-10,2.4,1.4);
  };}
  defs.tin_titan={name:'Tin Titan',len:{th:18,sh:18.5,ft:4,to:24.5,hd:10.5,ua:12.5,fa:12.5},
    parts:{
      thigh:{b:[-8,-6,8,23],d(c){cel(c,c=>capsule(c,10.4,8.4,18),TT.d,TT.dS,TT.dL,1.2,1.3);
        cel(c,c=>{c.beginPath();c.moveTo(-5.6,-2.4);c.lineTo(6.4,-2.4);c.lineTo(5.6,13);c.lineTo(-4.6,14);c.closePath();},TT.w,TT.wS,TT.wL,1.1,1.3);ttGlow(c,[3,1,2.6,10]);}},
      shin:{b:[-8,-5,8,23],d(c){cel(c,c=>capsule(c,9,8,18.5),TT.d,TT.dS,TT.dL,1,1.2);
        cel(c,c=>{c.beginPath();c.moveTo(-5.4,-1);c.lineTo(6.6,-1.6);c.lineTo(6.2,16);c.lineTo(-4.4,16.6);c.closePath();},TT.w,TT.wS,TT.wL,1.1,1.3);
        cel(c,c=>{c.beginPath();c.rect(1,3,3,8);},TT.blue,'#1A7AAA',null,.3,.9);ttGlow(c,[2.5,4,2.5,10],.6);}},
      foot:{b:[-6,-6,12,6],d(c){cel(c,footPath(10,4.4),TT.w,TT.wS,TT.wL,.8,1.3);c.fillStyle=TT.d;c.fillRect(-4.6,2.2,15,1.8);ttGlow(c,[-3,3,7,3],.5);}},
      uarm:{b:[-7,-5,7,17],d(c){cel(c,c=>capsule(c,9,8,12.5),TT.d,TT.dS,TT.dL,.9,1.2);c.save();capsule(c,9,8,12.5);c.clip();for(let y=3;y<13;y+=2.6)line(c,[-4.4,y,4.4,y],.5,TT.dL);c.restore();}},
      farm:{b:[-8,-5,8,16],d(c){cel(c,c=>{c.beginPath();c.moveTo(-5.4,-1);c.lineTo(5.8,-1);c.lineTo(6.6,12.6);c.lineTo(-6,12.6);c.closePath();},TT.w,TT.wS,TT.wL,1.1,1.3);
        cel(c,c=>{c.beginPath();c.rect(-2,2,4,7.6);},TT.blue,'#1A7AAA',null,.3,.9);ttGlow(c,[0,3,0,8.6]);}},
      hand:{b:[-6,-6,6,7],d(c){fist(c,4.4,TT.d,TT.dS,TT.dL,false);c.save();c.shadowColor=TT.blueG;c.shadowBlur=3*S;c.beginPath();c.arc(0,1,1.6,0,Math.PI*2);c.fillStyle=TT.blueG;c.fill();c.restore();}},
      torso:{b:[-15,-32,15,6],d(c){const body=torsoPath(16,23,25.6);cel(c,body,TT.d,TT.dS,TT.dL,1.4,1.5);
        c.save();body(c);c.clip();
        cel(c,c=>{c.beginPath();c.moveTo(-12,-26.6);c.lineTo(13,-26.6);c.lineTo(10,-12);c.quadraticCurveTo(1,-8,-9,-12);c.closePath();},TT.w,TT.wS,TT.wL,1.2,1.4);
        for(let y=-8;y<2;y+=3){c.fillStyle=TT.dL;c.fillRect(-6,y,13,1.2);}
        c.restore();
        c.save();c.shadowColor=TT.blueG;c.shadowBlur=6*S;c.beginPath();c.arc(1.6,-19,4.4,0,Math.PI*2);c.fillStyle=TT.blue;c.fill();c.restore();
        c.beginPath();c.arc(1.6,-19,4.4,0,Math.PI*2);c.lineWidth=1.2;c.strokeStyle=INK;c.stroke();c.beginPath();c.arc(1.6,-19,2,0,Math.PI*2);c.fillStyle='#E6FBFF';c.fill();
        ttGlow(c,[-8,-24,-4,-16]);ttGlow(c,[11,-24,7,-16]);}},
      pauldron:{b:[-11,-9,11,11],d(c){cel(c,c=>{c.beginPath();c.moveTo(-9.6,-2);c.quadraticCurveTo(-5,-8.6,3,-8.4);c.quadraticCurveTo(10,-6.6,9.6,1);c.lineTo(8,7.6);c.lineTo(-8,7.6);c.closePath();},TT.w,TT.wS,TT.wL,1.3,1.4);
        cel(c,c=>{c.beginPath();c.rect(-2.4,-2,6,4.4);},TT.blue,'#1A7AAA',null,.3,.9);ttGlow(c,[-1.4,.2,2.6,.2]);c.fillStyle=TT.red;c.fillRect(-7,4.6,3,1.4);}},
      head_idle:{b:[-15,-17,14,13],d:ttHead('idle')},head_attack:{b:[-15,-17,14,13],d:ttHead('attack')},
      head_hurt:{b:[-15,-17,14,13],d:ttHead('hurt')},head_blink:{b:[-15,-17,14,13],d:ttHead('blink')}
    },
    poses:{stand:{lean:.08,fa1:.7,fa2:1.5,ba1:.35,ba2:1.6,fl1:.48,fl2:-.5,bl1:-.45,bl2:-.28},
      hover:{lean:.2,fa1:1.4,fa2:.2,ba1:-.5,ba2:.4,fl1:.15,fl2:-.25,bl1:-.25,bl2:-.5}},
    idle:(t)=>{const b=Math.sin(t*2.6);return {lean:.08,fa1:.7+b*.02,fa2:1.5,ba1:.35,ba2:1.6+b*.04,fl1:.48,fl2:-.5,bl1:-.45,bl2:-.28};},
    run:(ph)=>({lean:.32,fa1:.2+Math.sin(ph)*.5,fa2:1.2,ba1:.2-Math.sin(ph)*.5,ba2:1.2}),
    portrait(p){p('head_idle',0,0,0,1);},
    render(c,f,t,j,m){
      const id='tin_titan';
      if(!f.onGround&&!f.preview&&!silent(m)){c.save();c.globalCompositeOperation='lighter';[j.fA,j.bA].forEach((a,i)=>{const L=12+Math.sin(t*40+i)*3;const g=c.createLinearGradient(a[0],a[1],a[0],a[1]+L);g.addColorStop(0,'rgba(157,240,255,.95)');g.addColorStop(1,'rgba(51,198,255,0)');
        c.fillStyle=g;c.beginPath();c.moveTo(a[0]-2.8,a[1]);c.lineTo(a[0]+2.8,a[1]);c.lineTo(a[0],a[1]+L);c.closePath();c.fill();});c.restore();}
      rig(c,f,t,j,m,id,{HS:1.05,eyes:[[5,-.4],[9.6,-.6]]});
      fistTrail(f,j);
    }
  };

  /* ---------- GRANDMA GRAVITY (gravity sorcerer) ---------- */
  const GG={coat:'#2A1A3E',coatS:'#160C24',coatL:'#6A4A9A',purple:'#8E44FF',purpleG:'#C79BFF',gold:'#E2B04A',goldS:'#9E7424',goldL:'#FFE39A',
    inner:'#E9E2F2',innerS:'#B8ADCB',hair:'#ECEAF2',hairS:'#B8B4C8',hairL:'#FFFFFF',skin:'#F1CDB4',skinS:'#D19C80',glass:'#3A2A4A',orn:'#3F7BFF'};
  function ggHead(kind){return function(c){
    cel(c,c=>capsule(c,4.6,4.2,7.5),GG.skin,GG.skinS,null,.6,1.2);
    faceShape(c,GG.skin,GG.skinS);
    eyes(c,kind==='attack'?'idle':kind,{iris:'#8E44FF',irisD:'#2A0A5A',irisL:'#E0C6FF',lash:true,brow:'#9A96A8'});
    /* round glasses */
    c.beginPath();c.arc(5,1.3,3.4,0,Math.PI*2);c.moveTo(11.4,1.2);c.arc(9.6,1.2,1.9,0,Math.PI*2);c.lineWidth=.8;c.strokeStyle=GG.glass;c.stroke();line(c,[8.4,1,7.7,1],.7,GG.glass);line(c,[1.6,.8,-3,.2],.6,GG.glass);
    c.save();c.globalAlpha=.35;c.beginPath();c.moveTo(3,-.4);c.lineTo(5.4,-1.4);c.lineWidth=.6;c.strokeStyle='#FFFFFF';c.stroke();c.restore();
    line(c,[2,5.2,3.4,6],.5,'rgba(150,100,80,.6)');line(c,[9.6,4.6,10,5.4],.5,'rgba(150,100,80,.6)');
    line(c,[10.1,3.4,9.5,4.6],.6,INK);
    if(kind==='attack'){c.beginPath();c.moveTo(5.8,7);c.quadraticCurveTo(7.6,9.4,9.4,6.8);c.closePath();c.fillStyle='#5A1A2A';c.fill();c.lineWidth=.6;c.strokeStyle=INK;c.stroke();}
    else if(kind==='hurt')line(c,[5.8,7.8,6.8,7.1,7.8,7.8,8.8,7.1],.7,INK);
    else{c.beginPath();c.moveTo(5.6,6.8);c.quadraticCurveTo(7.6,8.4,9.4,6.6);c.lineWidth=.75;c.strokeStyle='#8A3A4A';c.stroke();}
  };}
  defs.grandma_gravity={name:'Grandma Gravity',len:{th:17,sh:17,ft:3.2,to:23,hd:10.5,ua:11.5,fa:11.5},
    parts:{
      thigh:{b:[-7,-6,7,22],d(c){cel(c,c=>capsule(c,9.4,7.6,17),GG.coat,GG.coatS,GG.coatL,1.2);}},
      shin:{b:[-6,-5,6,21],d(c){cel(c,c=>capsule(c,7.4,6.2,17),GG.inner,GG.innerS,null,1);}},
      foot:{b:[-5,-5,10,5],d(c){cel(c,footPath(7.8,3.2),GG.coatS,'#08040E',GG.coatL,.5,1.1);c.fillStyle=GG.gold;c.fillRect(-3.8,2.2,11.8,1);}},
      uarm:{b:[-6,-5,6,15],d(c){cel(c,c=>capsule(c,8.4,7.6,11.5),GG.coat,GG.coatS,GG.coatL,1,1.2);}},
      farm:{b:[-5,-4,5,15],d(c){cel(c,c=>capsule(c,6.4,5.4,11.5),GG.skin,GG.skinS,null,.7,1.2);c.beginPath();c.arc(0,8,3,0,Math.PI*2);c.lineWidth=.9;c.strokeStyle=GG.gold;c.stroke();}},
      hand:{b:[-5,-5,5,6],d(c){cel(c,c=>{c.beginPath();c.ellipse(0,1.2,2.9,3.4,0,0,Math.PI*2);},GG.skin,GG.skinS,null,.5,1.1);line(c,[-1.4,3,-1.6,4.8],.5,INK);line(c,[.4,3.4,.4,5.2],.5,INK);}},
      torso:{b:[-13,-30,13,5],d(c){const body=torsoPath(16,18,23.6);cel(c,body,GG.coat,GG.coatS,GG.coatL,1.4,1.5);
        c.save();body(c);c.clip();
        c.beginPath();c.moveTo(-3,-24);c.lineTo(2,-24);c.lineTo(6.6,-11);c.lineTo(3.4,-11);c.closePath();c.fillStyle=GG.inner;c.fill();
        line(c,[-3.4,-24,3,-11],1.2,GG.gold);line(c,[2.4,-24,7,-11.4],1,GG.gold);
        [[-8,-19],[-6,-15],[8,-20]].forEach(([x,y])=>{c.beginPath();c.arc(x,y,1.3,0,Math.PI*2);c.lineWidth=.5;c.strokeStyle=GG.goldS;c.stroke();});
        c.fillStyle=GG.gold;c.fillRect(-12,-10,24,7);c.fillStyle=GG.goldS;c.fillRect(-12,-10,24,1);c.fillRect(-12,-4,24,1);
        c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(1,-9.6);c.lineTo(6,-7);c.lineTo(1,-4.4);c.lineTo(-4,-7);c.closePath();},GG.gold,GG.goldS,GG.goldL,.4,1.1);
        c.beginPath();c.arc(1,-7,1.4,0,Math.PI*2);c.fillStyle=GG.purple;c.fill();}},
      hairB:{b:[-18,-26,10,10],d(c){
        const p=c=>{c.beginPath();c.ellipse(-1.4,-2.4,11,10.8,0,0,Math.PI*2);};cel(c,p,GG.hair,GG.hairS,GG.hairL,1.2,1.4);
        cel(c,c=>{c.beginPath();c.ellipse(-4,-15,7.4,6.4,-.3,0,Math.PI*2);},GG.hair,GG.hairS,GG.hairL,.8,1.4);
        c.beginPath();c.ellipse(-4,-15,4,3.4,-.3,0,Math.PI*2);c.lineWidth=.6;c.strokeStyle=GG.hairS;c.stroke();}},
      hairF:{b:[-12,-24,14,8],d(c){
        const p=c=>{c.beginPath();c.moveTo(-8.4,-5.6);c.quadraticCurveTo(-4,-14.6,4.6,-13);c.quadraticCurveTo(10.6,-11,11.4,-4);c.quadraticCurveTo(7,-8.6,1,-8);c.quadraticCurveTo(-4,-7,-8.4,-5.6);c.closePath();};
        cel(c,p,GG.hair,GG.hairS,GG.hairL,1,1.3);line(c,[-2,-11,5,-11.4],.6,GG.hairS);
        /* hair ornament */
        line(c,[-2,-15,-9,-21],.8,GG.gold);[[-9.4,-21.6,GG.orn],[-6.6,-18.6,GG.gold]].forEach(([x,y,col])=>{c.beginPath();c.arc(x,y,1.6,0,Math.PI*2);c.fillStyle=col;c.fill();c.lineWidth=.5;c.strokeStyle=INK;c.stroke();});}},
      orb:{b:[-8,-8,8,8],d(c){const g=c.createRadialGradient(-1.4,-1.4,.5,0,0,6);g.addColorStop(0,'#3A1A6A');g.addColorStop(.7,'#120624');g.addColorStop(1,'#8E44FF');c.beginPath();c.arc(0,0,6,0,Math.PI*2);c.fillStyle=g;c.fill();
        c.save();c.shadowColor=GG.purpleG;c.shadowBlur=3*S;c.lineWidth=1;c.strokeStyle=GG.purpleG;c.stroke();c.restore();}},
      head_idle:{b:[-15,-15,15,20],d:ggHead('idle')},head_attack:{b:[-15,-15,15,20],d:ggHead('attack')},
      head_hurt:{b:[-15,-15,15,20],d:ggHead('hurt')},head_blink:{b:[-15,-15,15,20],d:ggHead('blink')}
    },
    poses:{stand:{lean:.04,fa1:.7,fa2:.9,ba1:.2,ba2:1.2,fl1:.3,fl2:-.32,bl1:-.3,bl2:-.2}},
    idle:(t)=>{const b=Math.sin(t*2.2);return {lean:.04+b*.015,fa1:.7+b*.05,fa2:.9,ba1:.2,ba2:1.2,fl1:.3,fl2:-.32,bl1:-.3,bl2:-.2};},
    run:(ph)=>({lean:.25,fa1:.6+Math.sin(ph)*.3,fa2:.8,ba1:.3-Math.sin(ph)*.3,ba2:.9}),
    render(c,f,t,j,m){
      const id='grandma_gravity',fid=f.id||0,HS=1.08;
      /* slow orbiting gravity marbles + a faint ring */
      const orbs=[0,1].map(i=>{const a=t*1.1+i*Math.PI+fid;return {x:Math.cos(a)*18,y:-44+Math.sin(a)*5,back:Math.sin(a)<0};});
      const drawOrbs=back=>{if(silent(m)&&m!=='void')return;orbs.forEach(o=>{if(o.back===back)part(c,id,'orb',o.x,o.y,0,m,back?.75:.9);});};
      if(!silent(m)){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.35;c.strokeStyle=GG.purpleG;c.lineWidth=.8;c.beginPath();c.ellipse(0,-44,18,5,0,0,Math.PI*2);c.stroke();c.restore();}
      drawOrbs(true);
      rig(c,f,t,j,m,id,{HS,
        beforeTorso(){skirt(c,j,j.bT,mc(GG.coatS,m),mc(GG.goldS,m),m,false,false);},
        afterLegs(){skirt(c,j,j.fT,mc(GG.coat,m),mc(GG.gold,m),m,true,false);},
        backHand(bk){part(c,id,'hand',j.bW[0],j.bW[1],j.bF,bk);sleeve(c,f,'sb',j.bE,j.bW,mc(GG.coatS,m),mc(GG.goldS,m),m);},
        front(){part(c,id,'hand',j.fW[0],j.fW[1],j.fF,m);sleeve(c,f,'sf',j.fE,j.fW,mc(GG.coat,m),mc(GG.gold,m),m);
          if((f.act||f.castT>0||f.charge!=null||f.sup)&&!silent(m)){const p=along(j.fW,j.fF,5);c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.6+.3*Math.sin(t*20);c.strokeStyle=GG.purpleG;c.lineWidth=1.4;
            for(let k=0;k<2;k++){c.beginPath();c.ellipse(p[0],p[1],5+k*3+Math.sin(t*12)*1,2.4+k*1.4,t*3+k,0,Math.PI*2);c.stroke();}c.restore();}}});
      drawOrbs(false);
      fistTrail(f,j);
    }
  };

  /* ---------- JAGUAR JINX (claws fighter) ---------- */
  const JJ={hair:'#16121C',hairS:'#08060C',hairL:'#4A3E5E',skin:'#D9A47A',skinS:'#B07A54',gold:'#F2B52A',goldS:'#A87410',goldL:'#FFE38A',black:'#1C1820',blackS:'#0C0A10',blackL:'#4E4658',spot:'#3A2A12'};
  function jjHead(kind){return function(c){
    cel(c,c=>capsule(c,4.4,4,7.5),JJ.skin,JJ.skinS,null,.6,1.2);
    faceShape(c,JJ.skin,JJ.skinS);
    eyes(c,kind,{iris:'#F2B52A',irisD:'#6A3A04',irisL:'#FFE9A0',slit:true,lash:true,brow:INK});
    line(c,[10.1,3.5,9.6,4.6],.6,INK);
    if(kind==='attack'){c.beginPath();c.moveTo(5.6,7);c.lineTo(9.2,6.6);c.lineTo(8.6,8.8);c.lineTo(6,8.8);c.closePath();c.fillStyle='#4A0F1A';c.fill();c.lineWidth=.6;c.strokeStyle=INK;c.stroke();
      c.fillStyle='#FFFFFF';c.beginPath();c.moveTo(6.4,7);c.lineTo(7,8.2);c.lineTo(7.4,7);c.closePath();c.fill();}
    else if(kind==='hurt')line(c,[5.8,7.8,6.8,7.1,7.8,7.8,8.8,7.1],.7,INK);
    else{c.beginPath();c.moveTo(6,7);c.quadraticCurveTo(7.6,7.9,9,6.8);c.lineWidth=.75;c.strokeStyle='#7A2A2A';c.stroke();}
    c.fillStyle=JJ.gold;c.fillRect(-2,8.4,1.2,2.4);
  };}
  function spots(c,pts){pts.forEach(([x,y,r])=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.lineWidth=r*.55;c.strokeStyle=JJ.gold;c.stroke();c.beginPath();c.arc(x,y,r*.4,0,Math.PI*2);c.fillStyle=JJ.goldS;c.fill();});}
  defs.jaguar_jinx={name:'Jaguar Jinx',len:{th:18,sh:18,ft:3.4,to:23.5,hd:10.5,ua:11.5,fa:11.5},
    parts:{
      thigh:{b:[-7,-6,7,23],d(c){cel(c,c=>capsule(c,9.6,7.6,18),JJ.black,JJ.blackS,JJ.blackL,1.2);c.save();capsule(c,9.6,7.6,18);c.clip();spots(c,[[-1.6,4,1.4],[2,9,1.2],[-1,14,1.1]]);c.restore();}},
      shin:{b:[-6,-5,6,22],d(c){cel(c,c=>capsule(c,7.6,6.2,18),JJ.black,JJ.blackS,JJ.blackL,1);c.save();capsule(c,7.6,6.2,18);c.clip();spots(c,[[1,3,1.1],[-1.4,8,1]]);c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(-4,11);c.lineTo(4.2,11);c.lineTo(3.8,18.6);c.lineTo(-3.6,18.6);c.closePath();},JJ.gold,JJ.goldS,JJ.goldL,.5,1.1);}},
      foot:{b:[-5,-5,10,5],d(c){cel(c,footPath(8,3.4),JJ.black,JJ.blackS,JJ.blackL,.6,1.1);c.fillStyle=JJ.gold;c.fillRect(-3.8,2,12,1.2);}},
      uarm:{b:[-6,-5,6,15],d(c){cel(c,c=>capsule(c,7.6,6.6,11.5),JJ.skin,JJ.skinS,'#F2C49A',1,1.2);cel(c,c=>{c.beginPath();c.rect(-4,4.6,8,2.2);},JJ.gold,JJ.goldS,JJ.goldL,.3,1);}},
      farm:{b:[-6,-4,6,15],d(c){cel(c,c=>capsule(c,7.4,6.4,11.5),JJ.gold,JJ.goldS,JJ.goldL,.9,1.3);line(c,[-3.4,3,3.4,3],.6,JJ.goldS);line(c,[-3.2,7,3.2,7],.6,JJ.goldS);}},
      hand:{b:[-6,-5,6,12],d(c){c.save();c.fillStyle=JJ.goldL;[[-2.4,-.4],[0,0],[2.4,.4]].forEach(([x,a])=>{c.beginPath();c.moveTo(x-1,1.8);c.quadraticCurveTo(x+a*2,7,x+a*3.4+.8,10.6);c.quadraticCurveTo(x+a*2+1,6.4,x+1,1.8);c.closePath();c.fill();c.lineWidth=.5;c.strokeStyle=INK;c.stroke();});c.restore();
        fist(c,3.6,JJ.gold,JJ.goldS,JJ.goldL,false);}},
      torso:{b:[-12,-29,12,5],d(c){const body=torsoPath(14,17,23.4);cel(c,body,JJ.skin,JJ.skinS,'#F2C49A',1.2,1.4);
        c.save();body(c);c.clip();
        cel(c,c=>{c.beginPath();c.moveTo(-12,-24);c.lineTo(12,-24);c.lineTo(11,-13);c.quadraticCurveTo(0,-11.4,-11,-13);c.closePath();},JJ.black,JJ.blackS,JJ.blackL,1,1.3);
        line(c,[-11,-13,11,-13],1.2,JJ.gold);line(c,[-11,-24,12,-24],1,JJ.gold);spots(c,[[-5,-19,1.3],[4,-20,1.2]]);
        c.fillStyle=JJ.black;c.fillRect(-12,-4,24,8);c.fillStyle=JJ.gold;c.fillRect(-12,-5.6,24,2.4);
        c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(0,-5.6);c.lineTo(4,-5.6);c.lineTo(3,3);c.lineTo(1,3);c.closePath();},JJ.gold,JJ.goldS,JJ.goldL,.3,1);}},
      hairB:{b:[-17,-16,10,22],d(c){const p=c=>{c.beginPath();c.ellipse(-1,-2,11.4,11.8,0,0,Math.PI*2);c.moveTo(-11.6,-3);c.quadraticCurveTo(-15,8,-11,19);c.lineTo(-8,14.6);c.lineTo(-5.6,19.6);c.lineTo(-3,12);c.quadraticCurveTo(-1,4,-1,-2);c.closePath();};
        cel(c,p,JJ.hair,JJ.hairS,JJ.hairL,1.4,1.4);}},
      hairF:{b:[-14,-26,15,15],d(c){
        cel(c,c=>{c.beginPath();c.moveTo(-9,-7);c.lineTo(-11.4,-22.6);c.lineTo(-2,-12);c.closePath();},JJ.hair,JJ.hairS,JJ.hairL,.6,1.3);
        cel(c,c=>{c.beginPath();c.moveTo(-8.4,-9);c.lineTo(-10,-19.4);c.lineTo(-4,-12);c.closePath();},JJ.gold,JJ.goldS,null,.3,.8);
        cel(c,c=>{c.beginPath();c.moveTo(1.6,-12);c.lineTo(8.6,-23.4);c.lineTo(9.4,-8.6);c.closePath();},JJ.hair,JJ.hairS,JJ.hairL,.6,1.3);
        cel(c,c=>{c.beginPath();c.moveTo(3.2,-11.6);c.lineTo(7.8,-20);c.lineTo(8.2,-10);c.closePath();},JJ.gold,JJ.goldS,null,.3,.8);
        const p=c=>{c.beginPath();c.moveTo(-8,-7);c.quadraticCurveTo(-3,-15,5,-13.4);c.quadraticCurveTo(11,-11,12,-4.6);c.lineTo(10.4,-1.6);c.lineTo(9.4,-5);c.lineTo(7.8,0);c.lineTo(6.4,-5.4);c.lineTo(4.2,-1.2);c.lineTo(3.2,-6.2);c.lineTo(.8,-2.6);c.lineTo(-.4,-7.2);c.quadraticCurveTo(-4,-6,-8,-7);c.closePath();
          c.moveTo(-1.6,-6);c.quadraticCurveTo(-3.8,4.6,-.4,12.6);c.lineTo(1.4,9);c.quadraticCurveTo(.8,1.6,1.4,-5);c.closePath();};
        cel(c,p,JJ.hair,JJ.hairS,JJ.hairL,1,1.3);}},
      head_idle:{b:[-15,-15,15,20],d:jjHead('idle')},head_attack:{b:[-15,-15,15,20],d:jjHead('attack')},
      head_hurt:{b:[-15,-15,15,20],d:jjHead('hurt')},head_blink:{b:[-15,-15,15,20],d:jjHead('blink')}
    },
    poses:{stand:{lean:.25,fa1:1.1,fa2:1.3,ba1:.6,ba2:1.5,fl1:.65,fl2:-.95,bl1:-.5,bl2:-.6}},
    idle:(t)=>{const b=Math.sin(t*4.4);return {lean:.25+b*.02,fa1:1.1+b*.04,fa2:1.3,ba1:.6,ba2:1.5,fl1:.65,fl2:-.95,bl1:-.5,bl2:-.6};},
    run:(ph)=>({lean:.62,fa1:-.9+Math.sin(ph)*.3,fa2:.4,ba1:-1-Math.sin(ph)*.3,ba2:.4}),
    render(c,f,t,j,m){
      const id='jaguar_jinx',HS=1.1;
      rig(c,f,t,j,m,id,{HS});
      if(!silent(m))slash(c,f,t,'cl',along(j.fW,j.fF,10),along(j.fW,j.fF,2),'#FFE38A',activeWin(f)&&f.act&&f.act.def.limb==='hand');
      f._hand=along(j.fW,j.fF,8);f._artSlash=!!(f.act&&f.act.def.limb==='hand');
    }
  };
  heroArt.titan='tin_titan';heroArt.gravity='grandma_gravity';heroArt.jaguar='jaguar_jinx';
