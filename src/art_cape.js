  /* =================================================================
     CAPED LEAGUE
     ================================================================= */
  /* ---------- CAPTAIN COMET (flying fighter) ---------- */
  const CC={suit:'#1C2034',suitS:'#0E1020',suitL:'#4E5A8C',plate:'#D8DEEA',plateS:'#9AA2BA',plateL:'#FFFFFF',blue:'#2FA8FF',blueG:'#8FE0FF',
    hair:'#F2F4FA',hairS:'#B8BED2',hairL:'#FFFFFF',skin:'#EDC2A2',skinS:'#C99474',gold:'#E6B84A',goldS:'#A07A26',visor:'#1E3A7A'};
  function ccHead(kind){return function(c){
    cel(c,c=>capsule(c,5,4.6,7.5),CC.suit,CC.suitS,null,.6,1.2);
    faceShape(c,CC.skin,CC.skinS);
    eyes(c,kind,{iris:'#2FA8FF',irisD:'#0A2A6A',irisL:'#BFF0FF',stern:true,brow:'#7A8098'});
    /* visor mask over the eyes */
    cel(c,c=>{c.beginPath();c.moveTo(-6,-3.6);c.lineTo(11.4,-2.6);c.lineTo(11,1.6);c.quadraticCurveTo(9.4,4.4,7.4,1.8);c.quadraticCurveTo(6.4,3.6,4.6,4.2);c.quadraticCurveTo(2,4.2,1.4,1.2);c.lineTo(-6,1.4);c.closePath();},CC.visor,'#0E1E48',null,.4,1.1);
    c.save();c.globalAlpha=.85;c.beginPath();c.ellipse(4.6,.8,2.1,1.6,0,0,Math.PI*2);c.ellipse(9.4,.6,1.2,1.4,0,0,Math.PI*2);c.fillStyle=kind==='hurt'?'#FFFFFF':'#BFF0FF';c.fill();c.restore();
    glowLine(c,[-6,-3.6,11.4,-2.6],.6,CC.blueG,2);
    line(c,[10.1,3.6,9.6,4.8],.6,INK);smirk(c,kind);
  };}
  defs.captain_comet={name:'Captain Comet',len:{th:18.5,sh:18.5,ft:3.4,to:25,hd:10.5,ua:12.5,fa:12},
    parts:{
      thigh:{b:[-7,-6,7,24],d(c){cel(c,c=>capsule(c,10,8,18.5),CC.suit,CC.suitS,CC.suitL,1.3);glowLine(c,[3,1,2.4,16],.7,CC.blueG,2.5);}},
      shin:{b:[-7,-5,7,23],d(c){cel(c,c=>capsule(c,8,6.6,18.5),CC.suit,CC.suitS,CC.suitL,1.1);
        cel(c,c=>{c.beginPath();c.moveTo(-1,0);c.quadraticCurveTo(6,2,5,15);c.lineTo(.4,16);c.closePath();},CC.plate,CC.plateS,CC.plateL,.6,1.1);glowLine(c,[2.4,3,2.6,13],.6,CC.blue,2);}},
      foot:{b:[-5,-5,11,5],d(c){cel(c,footPath(8.8,3.6),CC.plate,CC.plateS,CC.plateL,.6,1.1);c.fillStyle=CC.suit;c.fillRect(-4,2.2,13,1.4);glowLine(c,[-2,2.8,6,2.8],.6,CC.blue,2);}},
      uarm:{b:[-6,-5,6,16],d(c){cel(c,c=>capsule(c,8.6,7.4,12.5),CC.suit,CC.suitS,CC.suitL,1,1.3);glowLine(c,[2.4,2,2,11],.6,CC.blueG,2);}},
      farm:{b:[-6,-4,6,15],d(c){cel(c,c=>capsule(c,7.4,6.4,12),CC.suit,CC.suitS,CC.suitL,.8,1.2);
        cel(c,c=>{c.beginPath();c.moveTo(-4,4);c.lineTo(4.2,4);c.lineTo(4,11);c.lineTo(-3.8,11);c.closePath();},CC.plate,CC.plateS,CC.plateL,.5,1.1);glowLine(c,[-3,7.4,3.2,7.4],.7,CC.blue,2);}},
      hand:{b:[-5,-5,5,6],d(c){fist(c,3.7,CC.suit,CC.suitS,CC.suitL);}},
      torso:{b:[-14,-31,14,5],d(c){const body=torsoPath(15,21,25.6);cel(c,body,CC.suit,CC.suitS,CC.suitL,1.5,1.5);
        c.save();body(c);c.clip();
        cel(c,c=>{c.beginPath();c.moveTo(-9,-26);c.lineTo(11,-26);c.lineTo(9,-14);c.lineTo(2,-10);c.lineTo(-7,-14);c.closePath();},CC.plate,CC.plateS,CC.plateL,1.2,1.3);
        c.save();c.shadowColor=CC.blueG;c.shadowBlur=4*S;c.beginPath();c.moveTo(1.6,-22);c.lineTo(4.4,-18);c.lineTo(1.6,-14.4);c.lineTo(-1.2,-18);c.closePath();c.fillStyle=CC.blue;c.fill();c.restore();
        glowLine(c,[-7,-14,-4,-4],.7,CC.blueG,2.5);glowLine(c,[9,-14,6,-4],.7,CC.blueG,2.5);
        c.fillStyle=CC.suitS;c.fillRect(-12,-5,26,3.6);c.restore();
        cel(c,c=>{c.beginPath();c.rect(-.6,-5.6,5.4,4.6);},CC.gold,CC.goldS,'#FFF2B8',.4,1);
        /* high collar */
        cel(c,c=>{c.beginPath();c.moveTo(-7,-24.6);c.lineTo(-6,-30);c.lineTo(5,-30);c.lineTo(7,-24.6);c.closePath();},CC.suit,CC.suitS,CC.suitL,.5,1.2);glowLine(c,[-6,-29.4,5,-29.4],.6,CC.blueG,2);}},
      pauldron:{b:[-8,-6,8,9],d(c){cel(c,c=>{c.beginPath();c.moveTo(-6.4,-3);c.quadraticCurveTo(0,-6.6,6.6,-2.6);c.lineTo(5.6,4.6);c.quadraticCurveTo(0,3,-5.6,4.8);c.closePath();},CC.plate,CC.plateS,CC.plateL,.8,1.2);glowLine(c,[-5,3,5,3],.6,CC.blue,2);}},
      hairB:{b:[-21,-20,10,12],d(c){const p=c=>{c.beginPath();c.moveTo(6,-11);c.quadraticCurveTo(-1,-15,-6,-13);c.lineTo(-13,-18.6);c.lineTo(-11.6,-11);c.lineTo(-20,-11);c.lineTo(-13,-5);c.lineTo(-18,1);c.lineTo(-11,-.4);c.lineTo(-10,6);c.lineTo(-5,1);c.lineTo(-2,6);c.quadraticCurveTo(2,-4,6,-11);c.closePath();};
        cel(c,p,CC.hair,CC.hairS,CC.hairL,1.2,1.4);}},
      hairF:{b:[-12,-22,16,6],d(c){const p=c=>{c.beginPath();c.moveTo(-9,-6);c.quadraticCurveTo(-8,-12.6,-2,-13.4);c.lineTo(2,-20.4);c.lineTo(4.4,-13.4);c.lineTo(10.4,-18);c.lineTo(9,-10);c.lineTo(14.6,-10);c.lineTo(10.4,-5.6);c.lineTo(11.6,-3.4);c.lineTo(7.6,-4);c.lineTo(6,-1);c.lineTo(4.4,-4.6);c.lineTo(-9,-4.2);c.closePath();};
        cel(c,p,CC.hair,CC.hairS,CC.hairL,1,1.3);line(c,[0,-12,6,-15],.7,'rgba(160,170,200,.8)');}},
      head_idle:{b:[-15,-15,15,20],d:ccHead('idle')},head_attack:{b:[-15,-15,15,20],d:ccHead('attack')},
      head_hurt:{b:[-15,-15,15,20],d:ccHead('hurt')},head_blink:{b:[-15,-15,15,20],d:ccHead('blink')}
    },
    poses:{stand:{lean:.08,fa1:.85,fa2:1.6,ba1:.45,ba2:1.8,fl1:.45,fl2:-.5,bl1:-.42,bl2:-.25},
      hover:{lean:.25,fa1:1.4,fa2:.2,ba1:-.4,ba2:.4,fl1:.2,fl2:-.3,bl1:-.3,bl2:-.6}},
    idle:(t)=>{const b=Math.sin(t*3);return {lean:.08+b*.02,fa1:.85,fa2:1.6+b*.05,ba1:.45,ba2:1.8,fl1:.45,fl2:-.5,bl1:-.42,bl2:-.25};},
    render(c,f,t,j,m){
      const id='captain_comet';
      if(!f.onGround&&!f.preview&&!silent(m)){c.save();c.globalCompositeOperation='lighter';[j.fA,j.bA].forEach((a,i)=>{const L=10+Math.sin(t*40+i)*3;const g=c.createLinearGradient(a[0],a[1],a[0],a[1]+L);g.addColorStop(0,'rgba(143,224,255,.9)');g.addColorStop(1,'rgba(47,168,255,0)');
        c.fillStyle=g;c.beginPath();c.moveTo(a[0]-2.4,a[1]);c.lineTo(a[0]+2.4,a[1]);c.lineTo(a[0],a[1]+L);c.closePath();c.fill();});c.restore();}
      rig(c,f,t,j,m,id,{HS:1.08});
      fistTrail(f,j);
    }
  };

  /* ---------- MIDNIGHT RACCOON (gadget fighter) ---------- */
  const MR={hood:'#E8DCC8',hoodS:'#B5A68E',hoodL:'#FFF6E6',spot:'#5A4636',mask:'#1A1820',maskS:'#0B0A0E',jacket:'#2A3260',jacketS:'#161B3A',jacketL:'#5E6AA8',patch:'#D8CDB8',
    scarf:'#FF7A2A',scarfS:'#C2501A',scarfL:'#FFB27A',glove:'#22202A',belt:'#4A3A2A',beltL:'#8A6A4A',eye:'#5FF2E0',pants:'#34344A',pantsS:'#1C1C2A',pantsL:'#666888',skin:'#C9A28A'};
  function mrHead(kind){return function(c){
    cel(c,c=>capsule(c,5,4.6,7.5),MR.mask,MR.maskS,null,.6,1.2);
    const hd=c=>{c.beginPath();c.ellipse(0,-1,9.6,10.2,0,0,Math.PI*2);c.moveTo(-2.2,6);c.lineTo(3,9.8);c.lineTo(6.6,8.7);c.lineTo(9,4.4);c.lineTo(9.4,0);c.lineTo(0,0);c.closePath();};
    cel(c,hd,MR.mask,MR.maskS,'#4A4660',1,1.4);
    /* raccoon-style mask band with glowing goggle eyes */
    cel(c,c=>{c.beginPath();c.moveTo(-1,-3.4);c.quadraticCurveTo(6,-5,10.8,-3);c.lineTo(10.6,2.6);c.quadraticCurveTo(6,3.4,-1,2.6);c.closePath();},'#0A090D','#000',null,.3,1);
    c.save();c.shadowColor=MR.eye;c.shadowBlur=3*S;c.fillStyle=kind==='hurt'?'#FFFFFF':MR.eye;const h=kind==='blink'?.3:kind==='attack'?1.3:1.7;
    c.beginPath();c.ellipse(4.6,-.4,2.2,h,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(9.2,-.6,1.2,h*.9,0,0,Math.PI*2);c.fill();c.restore();
    line(c,[1,6,9.4,5.4],.6,'rgba(90,86,110,.8)');
  };}
  defs.midnight_raccoon={name:'Midnight Raccoon',len:{th:18,sh:18,ft:3.4,to:24,hd:10.5,ua:12,fa:12},
    parts:{
      thigh:{b:[-7,-6,7,23],d(c){cel(c,c=>capsule(c,10,8,18),MR.pants,MR.pantsS,MR.pantsL,1.3);
        cel(c,c=>{c.beginPath();c.rect(1.6,5,4.6,6);},MR.belt,'#2A2018',MR.beltL,.3,1);}},
      shin:{b:[-7,-5,7,22],d(c){cel(c,c=>capsule(c,8,6.4,18),MR.pants,MR.pantsS,MR.pantsL,1.1);
        cel(c,c=>{c.beginPath();c.moveTo(-4.2,10);c.lineTo(4.4,10);c.lineTo(4,19);c.lineTo(-3.8,19);c.closePath();},MR.glove,'#0C0B10',MR.pantsL,.5,1.1);line(c,[-4,12,4.2,12],.7,MR.beltL);}},
      foot:{b:[-5,-5,11,5],d(c){cel(c,footPath(8.8,3.6),MR.glove,'#0C0B10',MR.pantsL,.6,1.1);c.fillStyle=MR.scarf;c.fillRect(-4,2.2,13,1.2);}},
      uarm:{b:[-7,-5,7,16],d(c){cel(c,c=>capsule(c,9.6,8.4,12),MR.jacket,MR.jacketS,MR.jacketL,1.1,1.3);
        cel(c,c=>{c.beginPath();c.rect(-3,3,5,4.6);},MR.patch,'#A89C86',null,.3,.9);line(c,[-3,3,2,7.6],.4,'rgba(60,50,40,.7)');}},
      farm:{b:[-6,-4,6,15],d(c){cel(c,c=>capsule(c,8,7,12),MR.jacket,MR.jacketS,MR.jacketL,.9,1.2);
        cel(c,c=>{c.beginPath();c.moveTo(-4.4,6);c.lineTo(4.6,6);c.lineTo(4,12.4);c.lineTo(-3.8,12.4);c.closePath();},MR.glove,'#0C0B10','#4A4660',.5,1.1);
        c.fillStyle=MR.patch;c.fillRect(-4.2,6,8.6,1.4);}},
      hand:{b:[-5,-5,5,6],d(c){fist(c,3.8,MR.glove,'#0C0B10','#4A4660');}},
      torso:{b:[-14,-30,14,6],d(c){const body=torsoPath(17,20,24.6);cel(c,body,MR.jacket,MR.jacketS,MR.jacketL,1.5,1.5);
        c.save();body(c);c.clip();
        line(c,[1.4,-24,1,2],.9,MR.jacketS);
        cel(c,c=>{c.beginPath();c.rect(-8,-18,5.4,6);},MR.patch,'#A89C86',null,.3,.9);line(c,[-8,-18,-2.6,-12],.4,'rgba(60,50,40,.7)');line(c,[-8,-12,-2.6,-18],.4,'rgba(60,50,40,.7)');
        c.fillStyle=MR.belt;c.fillRect(-13,-6.4,27,3.6);
        c.restore();
        [[-6.6,-5.8],[3.6,-5.8],[8,-5.4]].forEach(([x,y])=>cel(c,c=>{c.beginPath();c.rect(x,y,3.8,4.6);},MR.belt,'#2A2018',MR.beltL,.3,1));
        cel(c,c=>{c.beginPath();c.rect(-1.4,-6.6,3,3.8);},'#B8BCCB','#7A7F94','#FFFFFF',.3,1);}},
      hood:{b:[-17,-24,13,14],d(c){
        cel(c,c=>{c.beginPath();c.moveTo(-9,-8);c.lineTo(-12.6,-21);c.lineTo(-2.6,-12.6);c.closePath();},MR.hood,MR.hoodS,MR.hoodL,.6,1.3);
        cel(c,c=>{c.beginPath();c.moveTo(1.6,-12.6);c.lineTo(7,-21.6);c.lineTo(9,-8.6);c.closePath();},MR.hood,MR.hoodS,MR.hoodL,.6,1.3);
        c.fillStyle=MR.spot;[[-12.6,-21,-10.4,-16,-9.4,-18.6],[7,-21.6,6,-16.6,8.4,-17.4]].forEach(a=>{c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(a[2],a[3]);c.lineTo(a[4],a[5]);c.closePath();c.fill();});
        const p=c=>{c.beginPath();c.moveTo(-14.6,10);c.quadraticCurveTo(-16.6,-6,-8,-12.6);c.quadraticCurveTo(1,-17,8.6,-12.6);c.quadraticCurveTo(13,-8.6,12.4,-3.4);c.lineTo(9.6,-4.6);c.quadraticCurveTo(1,-10,-6,-4);c.quadraticCurveTo(-9,2,-7,10);c.closePath();};
        cel(c,p,MR.hood,MR.hoodS,MR.hoodL,1.2,1.5);
        c.save();p(c);c.clip();c.fillStyle=MR.spot;[[-10,-6,2.2],[-5,-11,1.8],[2,-12,2],[-13,2,2.2],[7,-10,1.4]].forEach(([x,y,r])=>{c.beginPath();c.ellipse(x,y,r*1.2,r,.4,0,Math.PI*2);c.fill();});c.restore();}},
      scarf:{b:[-14,-6,14,8],d(c){cel(c,c=>{c.beginPath();c.moveTo(-11,-2);c.quadraticCurveTo(0,-5.6,11.6,-2.6);c.lineTo(11,4);c.quadraticCurveTo(0,7,-10.6,4.4);c.closePath();},MR.scarf,MR.scarfS,MR.scarfL,1,1.4);
        line(c,[-8,1,8,0],.7,MR.scarfS);}},
      head_idle:{b:[-15,-15,15,20],d:mrHead('idle')},head_attack:{b:[-15,-15,15,20],d:mrHead('attack')},
      head_hurt:{b:[-15,-15,15,20],d:mrHead('hurt')},head_blink:{b:[-15,-15,15,20],d:mrHead('blink')}
    },
    poses:{stand:{lean:.14,fa1:1,fa2:1.6,ba1:.4,ba2:1.8,fl1:.5,fl2:-.6,bl1:-.45,bl2:-.35}},
    idle:(t)=>{const b=Math.sin(t*3.4);return {lean:.14+b*.02,fa1:1+b*.03,fa2:1.6,ba1:.4,ba2:1.8,fl1:.5,fl2:-.6,bl1:-.45,bl2:-.35};},
    portrait(p){p('head_idle',0,0,0,1);p('hood',0,0,0,1);},
    render(c,f,t,j,m){
      const id='midnight_raccoon',HS=1.08;
      const s2=chain(f,'s2',7,4.2,tl(j,-5,-23),[-.85,.5],{g:320,bias:900,damp:.87,fl:[650,5.4]});
      const s1=chain(f,'s1',8,4.6,tl(j,-6,-24),[-.92,.36],{g:280,bias:1000,damp:.87,fl:[750,5]});
      rig(c,f,t,j,m,id,{HS,behind(){ribbon(c,s2,6.4,3,mc(MR.scarfS,m),m,true);ribbon(c,s1,7.6,3.6,mc(MR.scarf,m),m,true);},
        head(HS){part(c,id,'hood',j.head[0],j.head[1],-j.ha,m,HS);const sp=tl(j,.4,-25.4);part(c,id,'scarf',sp[0],sp[1],-j.lean*.6,m);}});
      fistTrail(f,j);
    }
  };

  /* ---------- SKATE SURGE (speedster) ---------- */
  const SS={hair:'#1E8C9A',hairS:'#0E5560',hairL:'#6FE0E0',skin:'#F2C9A8',skinS:'#D29A7A',shirt:'#ECEAF2',shirtS:'#B8B4C8',vest:'#1C1A24',vestS:'#0C0B10',vestL:'#55506A',
    hood:'#9A96A8',hoodS:'#68647A',pants:'#22202C',pantsS:'#100F16',pantsL:'#55536A',cuff:'#3F7BFF',shoe:'#EEF2FA',shoeS:'#A8B0C8',glove:'#FF8A2A',gloveS:'#C25A10',
    board:'#FF8A2A',boardS:'#B85A12',boardL:'#FFC27A',wheel:'#2A2A34',band:'#FF8A2A'};
  function ssHead(kind){return function(c){
    cel(c,c=>capsule(c,4.6,4.2,7.5),SS.skin,SS.skinS,null,.6,1.2);
    faceShape(c,SS.skin,SS.skinS);
    eyes(c,kind,{iris:'#1FB5B5',irisD:'#06484A',irisL:'#9FF5EC',brow:'#0E5560'});
    line(c,[10.1,3.5,9.6,4.6],.6,INK);
    if(kind==='idle'||kind==='blink'){c.beginPath();c.moveTo(5.8,7);c.quadraticCurveTo(7.6,8.4,9.2,6.6);c.lineWidth=.75;c.strokeStyle='#6A2A2A';c.stroke();}else smirk(c,kind);
  };}
  defs.skate_surge={name:'Skate Surge',len:{th:18,sh:18,ft:3.6,to:23.5,hd:10.5,ua:11.5,fa:11.5},
    parts:{
      thigh:{b:[-7,-6,7,23],d(c){cel(c,c=>capsule(c,10,8.4,18),SS.pants,SS.pantsS,SS.pantsL,1.3);line(c,[-1,4,1.6,7,-.6,10],.6,'rgba(120,118,150,.6)');}},
      shin:{b:[-7,-5,7,22],d(c){cel(c,c=>capsule(c,8.6,7.6,18),SS.pants,SS.pantsS,SS.pantsL,1.1);
        cel(c,c=>{c.beginPath();c.moveTo(-5,10.6);c.lineTo(5.2,10.6);c.lineTo(5,15);c.lineTo(-4.8,15);c.closePath();},SS.cuff,'#2050C0','#9AB8FF',.4,1.1);}},
      foot:{b:[-6,-6,12,6],d(c){cel(c,footPath(9.6,4.4),SS.shoe,SS.shoeS,'#FFFFFF',.7,1.2);c.fillStyle=SS.cuff;c.fillRect(-4.6,2.2,14.4,1.6);line(c,[1,-3,3,-1],.6,SS.cuff);line(c,[2.6,-3.4,4.6,-1.2],.6,SS.cuff);}},
      uarm:{b:[-6,-5,6,15],d(c){cel(c,c=>capsule(c,7.4,6.6,11.5),SS.shirt,SS.shirtS,'#FFFFFF',1,1.2);}},
      farm:{b:[-5,-4,5,15],d(c){cel(c,c=>capsule(c,6.6,5.8,11.5),SS.skin,SS.skinS,null,.8,1.2);cel(c,c=>{c.beginPath();c.rect(-3.4,8,6.8,3.4);},SS.vest,SS.vestS,null,.3,.9);}},
      hand:{b:[-5,-5,5,6],d(c){fist(c,3.6,SS.glove,SS.gloveS,'#FFC27A');}},
      torso:{b:[-13,-30,13,5],d(c){const body=torsoPath(15,18,24);cel(c,body,SS.shirt,SS.shirtS,'#FFFFFF',1.4,1.5);
        c.save();body(c);c.clip();
        cel(c,c=>{c.beginPath();c.moveTo(-12,-26);c.lineTo(-2,-26);c.lineTo(-1,3);c.lineTo(-12,3);c.closePath();},SS.vest,SS.vestS,SS.vestL,.8,1.2);
        cel(c,c=>{c.beginPath();c.moveTo(4,-26);c.lineTo(12,-26);c.lineTo(12,3);c.lineTo(5,3);c.closePath();},SS.vest,SS.vestS,SS.vestL,.8,1.2);
        line(c,[0,-14,3,-10,1,-6],.6,'rgba(150,146,170,.7)');
        c.fillStyle=SS.pants;c.fillRect(-12,-3,24,6);c.fillStyle=SS.glove;c.fillRect(-12,-3,24,1);
        c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(-10.6,-21);c.quadraticCurveTo(-10,-29,-1,-28);c.lineTo(-2.6,-24);c.quadraticCurveTo(-7.4,-24.6,-8,-18.6);c.closePath();},SS.hood,SS.hoodS,'#D8D4E4',.8,1.2);}},
      board:{b:[-4,-24,6,24],d(c){
        const p=c=>{c.beginPath();c.moveTo(-1.6,-21);c.quadraticCurveTo(0,-23.6,1.6,-21);c.lineTo(1.6,21);c.quadraticCurveTo(0,23.6,-1.6,21);c.closePath();};
        cel(c,p,SS.board,SS.boardS,SS.boardL,.5,1.2);c.fillStyle=SS.boardS;c.fillRect(-1.6,-3,3.2,6);
        [[-15],[15]].forEach(([y])=>{c.fillStyle='#B8BCCB';c.fillRect(1.6,y-2.6,1.4,5.2);[[y-2.6],[y+2.6]].forEach(([w])=>{c.beginPath();c.arc(3.8,w,1.6,0,Math.PI*2);c.fillStyle=SS.wheel;c.fill();c.lineWidth=.5;c.strokeStyle=INK;c.stroke();});});}},
      hairB:{b:[-20,-26,10,14],d(c){const p=c=>{c.beginPath();c.moveTo(6,-11);c.quadraticCurveTo(0,-14,-4,-13);c.lineTo(-7,-18);c.lineTo(-9,-12);c.lineTo(-17,-14);c.lineTo(-12.6,-7);c.lineTo(-19,-4);c.lineTo(-12,-1);c.lineTo(-15,6);c.lineTo(-8,3);c.lineTo(-6,10);c.lineTo(-2,4);c.quadraticCurveTo(2,-4,6,-11);c.closePath();};
        cel(c,p,SS.hair,SS.hairS,SS.hairL,1.2,1.4);
        /* topknot tied with an orange band */
        cel(c,c=>{c.beginPath();c.moveTo(-6,-13);c.quadraticCurveTo(-10,-22,-4,-25);c.quadraticCurveTo(-6,-19,-2,-17);c.lineTo(-1,-23);c.quadraticCurveTo(2,-18,-1,-13);c.closePath();},SS.hair,SS.hairS,SS.hairL,.6,1.2);
        cel(c,c=>{c.beginPath();c.rect(-5.4,-15.6,4.4,2.4);},SS.band,'#C25A10',null,.3,1);}},
      hairF:{b:[-12,-19,15,13],d(c){const p=c=>{c.beginPath();c.moveTo(-8.4,-6.6);c.quadraticCurveTo(-3,-15,5,-13.6);c.lineTo(8.6,-16.6);c.lineTo(9,-11);c.quadraticCurveTo(12.4,-8,12,-3);c.lineTo(10,-4.4);c.lineTo(9.6,1.6);c.lineTo(7,-3.6);c.lineTo(5.6,1);c.lineTo(4,-5);c.lineTo(1.4,-1);c.lineTo(.6,-7);c.quadraticCurveTo(-4,-5.6,-8.4,-6.6);c.closePath();
          c.moveTo(-1.6,-6);c.quadraticCurveTo(-3.6,3,-1,10);c.lineTo(1,7);c.quadraticCurveTo(.6,1,1.2,-5);c.closePath();};
        cel(c,p,SS.hair,SS.hairS,SS.hairL,1,1.3);}},
      head_idle:{b:[-15,-15,15,20],d:ssHead('idle')},head_attack:{b:[-15,-15,15,20],d:ssHead('attack')},
      head_hurt:{b:[-15,-15,15,20],d:ssHead('hurt')},head_blink:{b:[-15,-15,15,20],d:ssHead('blink')}
    },
    poses:{stand:{lean:.18,fa1:1,fa2:1.5,ba1:-.2,ba2:.5,fl1:.55,fl2:-.7,bl1:-.48,bl2:-.4}},
    idle:(t)=>{const b=Math.sin(t*4.6);return {lean:.18+b*.02,fa1:1+b*.04,fa2:1.5,ba1:-.2,ba2:.5,fl1:.55,fl2:-.7-b*.04,bl1:-.48,bl2:-.4};},
    run:(ph)=>({lean:.6,fa1:-1.1+Math.sin(ph)*.2,fa2:.3,ba1:-.9-Math.sin(ph)*.2,ba2:.3}),
    render(c,f,t,j,m){
      const id='skate_surge',HS=1.1;
      if((Math.abs(f.vx||0)>200||f.dashT>0||f.zip)&&!silent(m)){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const y=j.hy-6-i*8;c.globalAlpha=.25+.15*Math.sin(t*30+i);c.fillStyle='#6FE0E0';c.fillRect(-28-i*3,y,18+i*2,1.4);}c.restore();}
      rig(c,f,t,j,m,id,{HS,backHand(bk){part(c,id,'board',j.bW[0],j.bW[1],j.bF+1.2,bk);part(c,id,'hand',j.bW[0],j.bW[1],j.bF,bk);}});
      fistTrail(f,j);
    }
  };
  heroArt.comet='captain_comet';heroArt.raccoon='midnight_raccoon';heroArt.skate='skate_surge';
