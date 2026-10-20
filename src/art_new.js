  /* =================================================================
     PHASE 7 ENEMIES from the art pack's enemy_references (09-13):
     Aerial Drone (custom draw, see p7_enemies.js), Rift Minion, Elite Ronin, Corrupted Hero, Rift Lord.
     Same pipeline as the other rift enemies: vector parts -> baked textures/PNGs -> shared rig.
     ================================================================= */

  /* ---------- RIFT MINION (small purple rift imp: pointed ears, little horns, glowing magenta eyes and claws) ---------- */
  const RM7={skin:'#6A3FA0',skinS:'#3E2266',skinL:'#B48CF0',dark:'#241338',darkS:'#140A22',glow:'#FF4FD8',glowD:'#B0168F',cloth:'#2E1A47',clothS:'#1A0E2B',horn:'#1B1026',hornL:'#5A4A70',tooth:'#F6EEFF'};
  function rmHead(kind){return function(c){
    /* ears (behind the head) */
    cel(c,c=>{c.beginPath();c.moveTo(-6,-4);c.quadraticCurveTo(-17,-10,-21,-3);c.quadraticCurveTo(-14,-1,-6,3);c.closePath();},RM7.skin,RM7.skinS,RM7.skinL,.8,1.2);
    line(c,[-8,-1.6,-17,-4],.7,RM7.glowD);
    /* horns */
    cel(c,c=>{c.beginPath();c.moveTo(-3,-9);c.quadraticCurveTo(-5,-15,-1,-19);c.quadraticCurveTo(-.6,-14,1.6,-10);c.closePath();},RM7.horn,'#0A060F',RM7.hornL,.5,1.1);
    cel(c,c=>{c.beginPath();c.moveTo(4,-10);c.quadraticCurveTo(5,-16,10,-18);c.quadraticCurveTo(8,-13,7.6,-8.6);c.closePath();},RM7.horn,'#0A060F',RM7.hornL,.5,1.1);
    const hd=c=>{c.beginPath();c.moveTo(-9,2);c.quadraticCurveTo(-10,-10,0,-11);c.quadraticCurveTo(10,-11,11.6,-2);c.quadraticCurveTo(13,4,10,7.6);c.quadraticCurveTo(4,11,-2,9.6);c.quadraticCurveTo(-8,8,-9,2);c.closePath();};
    cel(c,hd,RM7.skin,RM7.skinS,RM7.skinL,1.2,1.4);
    /* brow ridge */
    line(c,[2,-4.6,7,-3,11,-4.4],.8,RM7.skinS);
    /* eyes */
    c.save();c.shadowColor=RM7.glow;c.shadowBlur=3*S;
    if(kind==='hurt'){line(c,[3,-2.6,6.4,.6],1.1,'#FFC2F2');line(c,[6.4,-2.6,3,.6],1.1,'#FFC2F2');line(c,[8.6,-2.4,10.8,.4],1,'#FFC2F2');line(c,[10.8,-2.4,8.6,.4],1,'#FFC2F2');}
    else if(kind==='blink'){line(c,[3,-.6,7,-.6],1,RM7.glow);line(c,[8.6,-.8,11,-.8],.9,RM7.glow);}
    else{const h=kind==='attack'?1.6:2.4;c.fillStyle='#FFE8FB';c.beginPath();c.ellipse(5,-1,2.6,h,-.15,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(10,-1.2,1.5,h*.85,-.2,0,Math.PI*2);c.fill();
      c.fillStyle=RM7.glow;c.beginPath();c.ellipse(5.5,-1,1.5,h*.8,-.15,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(10.3,-1.2,.9,h*.7,-.2,0,Math.PI*2);c.fill();}
    c.restore();
    /* toothy grin */
    const op=kind==='attack'?2.4:kind==='hurt'?1.4:.8;
    c.beginPath();c.moveTo(3,4.4);c.quadraticCurveTo(7.6,5.4+op*.3,11.2,3.4);c.quadraticCurveTo(8,6.6+op,3.4,5.6+op*.4);c.closePath();c.fillStyle='#2A0A2E';c.fill();c.lineWidth=.6;c.strokeStyle=INK;c.stroke();
    c.fillStyle=RM7.tooth;[[4.6,4.8],[6.6,5.2],[8.6,5],[10.2,4.2]].forEach(([x,y])=>{c.beginPath();c.moveTo(x-.7,y);c.lineTo(x,y+1.4);c.lineTo(x+.7,y);c.closePath();c.fill();});
  };}
  defs.rift_minion={name:'Rift Minion',baseH:54,len:{th:10,sh:10.5,ft:2.6,to:14,hd:11,ua:8.5,fa:8},
    parts:{
      thigh:{b:[-5,-4,5,14],d(c){cel(c,c=>capsule(c,6.4,5.2,10),RM7.skin,RM7.skinS,RM7.skinL,.9,1.2);}},
      shin:{b:[-5,-4,5,14],d(c){cel(c,c=>capsule(c,5.2,4.2,10.5),RM7.skin,RM7.skinS,null,.8,1.1);glowLine(c,[1.2,2,.8,8],.55,RM7.glow,2);}},
      foot:{b:[-4,-4,9,4],d(c){cel(c,footPath(6.4,2.8),RM7.dark,RM7.darkS,RM7.hornL,.5,1);c.fillStyle=RM7.tooth;[[5.4,2.6],[7,2]].forEach(([x,y])=>{c.beginPath();c.moveTo(x-.6,y-1.2);c.lineTo(x+1.2,y+.6);c.lineTo(x-.2,y+.4);c.closePath();c.fill();});}},
      uarm:{b:[-4,-4,4,11],d(c){cel(c,c=>capsule(c,5.2,4.4,8.5),RM7.skin,RM7.skinS,RM7.skinL,.8,1.1);}},
      farm:{b:[-4,-4,4,11],d(c){cel(c,c=>capsule(c,4.6,4,8),RM7.skin,RM7.skinS,RM7.skinL,.7,1.1);glowLine(c,[1,1.4,-.6,4,1,6.6],.6,RM7.glow,2.5);}},
      hand:{b:[-5,-4,5,9],d(c){c.save();c.shadowColor=RM7.glow;c.shadowBlur=3*S;c.fillStyle=RM7.glow;
        [[-1.8,.3],[0,.6],[1.8,.3]].forEach(([x,a])=>{c.beginPath();c.moveTo(x-.8,1.2);c.lineTo(x+a,7.4);c.lineTo(x+.8,1.2);c.closePath();c.fill();});c.restore();
        fist(c,2.7,RM7.skin,RM7.skinS,RM7.skinL,false);}},
      torso:{b:[-9,-18,9,4],d(c){
        const body=c=>{c.beginPath();c.moveTo(-5.6,2);c.lineTo(5.6,2);c.quadraticCurveTo(8.6,-6,6.4,-12.6);c.quadraticCurveTo(4.6,-15.4,0,-15.4);c.quadraticCurveTo(-5.4,-15.4,-6.6,-12);c.quadraticCurveTo(-8.4,-5,-5.6,2);c.closePath();};
        cel(c,body,RM7.skin,RM7.skinS,RM7.skinL,1.2,1.3);
        c.save();body(c);c.clip();
        c.beginPath();c.ellipse(2,-5,5.4,6,0,0,Math.PI*2);c.fillStyle='rgba(180,140,240,.35)';c.fill();
        glowLine(c,[0,-13,1.6,-9,-.4,-6.4,1.4,-3],.7,RM7.glow,2.5);
        c.fillStyle=RM7.cloth;c.fillRect(-8,-2.4,16,4.6);line(c,[-8,-2.4,8,-2.4],.6,RM7.glowD);c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(-2,1);c.lineTo(4,1);c.lineTo(3,8);c.lineTo(.6,5.6);c.lineTo(-1.4,8.4);c.closePath();},RM7.cloth,RM7.clothS,null,.4,1);}},
      head_idle:{b:[-23,-21,14,13],d:rmHead('idle')},head_attack:{b:[-23,-21,14,13],d:rmHead('attack')},
      head_hurt:{b:[-23,-21,14,13],d:rmHead('hurt')},head_blink:{b:[-23,-21,14,13],d:rmHead('blink')}
    },
    poses:{
      stand:{lean:.3,fl1:.8,fl2:-1.3,bl1:-.5,bl2:-1,fa1:.9,fa2:1.4,ba1:.4,ba2:1.6,ht:-.05},
      jabW:{lean:.05,fa1:.2,fa2:2,ba1:.6,ba2:1.6},jab:{lean:.5,fa1:1.7,fa2:0,ba1:.3,ba2:1.6,fl1:.9,fl2:-.6,bl1:-.7,bl2:-.2},
      jump:{lean:.3,fl1:1.3,fl2:-2.1,bl1:.6,bl2:-1.8,fa1:2.4,fa2:.6,ba1:-.8,ba2:.8},guard:{fa1:1.3,fa2:2.1,ba1:1.2,ba2:2.2}
    },
    idle:(t)=>{const b=Math.sin(t*6);return {lean:.3+b*.04,fl1:.8,fl2:-1.3,bl1:-.5,bl2:-1,fa1:.9+b*.08,fa2:1.4,ba1:.4-b*.06,ba2:1.6,ht:-.05+b*.04};},
    run:(ph)=>({lean:.62,fa1:-1+Math.sin(ph)*.4,fa2:.6,ba1:.5-Math.sin(ph)*.4,ba2:1.4}),
    portrait(p){p('head_idle',0,0,0,1);},
    render(c,f,t,j,m){
      const id='rift_minion';
      const tail=chain(f,'tl',6,3,tl(j,-5,-2),[-.9,.3],{g:220,bias:700,damp:.86,fl:[600,7]});
      rig(c,f,t,j,m,id,{eyes:[[5,-1],[10,-1.2]],behind(){ribbon(c,tail,2.6,.8,mc(RM7.skinS,m),m,true);
        if(!silent(m)){const e=tail[tail.length-1];c.save();c.shadowColor=RM7.glow;c.shadowBlur=6;c.fillStyle=RM7.glow;c.beginPath();c.moveTo(e[0]-1.8,e[1]);c.lineTo(e[0],e[1]-3.4);c.lineTo(e[0]+1.8,e[1]);c.lineTo(e[0],e[1]+2.6);c.closePath();c.fill();c.restore();}}});
      if(!silent(m)){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const ph=(t*1.4+i*.33+(f.id||0)*.21)%1;const w=i%2?j.fW:j.bW;c.globalAlpha=(1-ph)*.75;c.fillStyle='#FF4FD8';
        c.beginPath();c.arc(w[0]-ph*3,w[1]-ph*10,.9*(1-ph)+.3,0,Math.PI*2);c.fill();}c.restore();
        slash(c,f,t,'cl',along(j.fW,j.fF,7),along(j.fW,j.fF,1),'#FF4FD8',f.punchT>0);}
      f._hand=along(j.fW,j.fF,5);f._artSlash=true;
    }
  };

  /* ---------- ELITE RONIN (wide red-trimmed kasa, black-and-crimson lacquered armour, glowing red katana) ---------- */
  const ER={cloth:'#1C1620',clothS:'#0E0A12',clothL:'#5A4A62',lac:'#9E1C24',lacS:'#5E0C14',lacL:'#FF6B5A',iron:'#2C2632',ironS:'#16121A',ironL:'#7A6E86',
    gold:'#E0A040',goldS:'#8A5A1A',hat:'#4A3A2E',hatS:'#2A2018',hatL:'#9A8064',red:'#FF3B2E',redD:'#7A0E12',steel:'#E6E9F5',steelS:'#8A90AA'};
  function erHead(kind){return function(c){
    const hd=c=>{c.beginPath();c.ellipse(0,-1,9.2,9.8,0,0,Math.PI*2);c.moveTo(-2,6);c.lineTo(3,9.4);c.lineTo(7,8.4);c.lineTo(9.2,4.2);c.lineTo(9,0);c.lineTo(0,0);c.closePath();};
    cel(c,hd,ER.cloth,ER.clothS,ER.clothL,1,1.4);
    /* menpo (iron face guard) */
    cel(c,c=>{c.beginPath();c.moveTo(.6,1.4);c.quadraticCurveTo(6,1,10.4,1.8);c.lineTo(10.2,6.4);c.quadraticCurveTo(7,9.6,2.6,8.6);c.closePath();},ER.iron,ER.ironS,ER.ironL,.5,1.1);
    line(c,[3,4.4,9.4,4],.5,ER.ironL);line(c,[3.4,6.2,8.6,6.2],.5,ER.ironL);
    cel(c,c=>{c.beginPath();c.moveTo(-.4,-3.6);c.quadraticCurveTo(5,-5,10.6,-3.6);c.lineTo(10.6,1.2);c.quadraticCurveTo(5,2.4,-.2,1.2);c.closePath();},'#0A0709','#040304',null,.3,1);
    c.save();c.shadowColor=ER.red;c.shadowBlur=3.5*S;c.fillStyle=kind==='hurt'?'#FFB0A8':ER.red;
    if(kind==='hurt'){line(c,[3.4,-2.4,6.6,.6],1.1,'#FFB0A8');line(c,[6.6,-2.4,3.4,.6],1.1,'#FFB0A8');}
    else{const h=kind==='blink'?.25:kind==='attack'?.7:1;c.beginPath();c.moveTo(2.6,-1.4);c.lineTo(7.4,-1.6);c.lineTo(7,-1.2+h*1.2);c.lineTo(2.8,-.6+h*.8);c.closePath();c.fill();
      c.beginPath();c.moveTo(8.4,-1.6);c.lineTo(10.6,-1.8);c.lineTo(10.5,-1.1+h);c.lineTo(8.5,-.8+h*.7);c.closePath();c.fill();}
    c.restore();
  };}
  defs.elite_ronin={name:'Elite Ronin',baseH:78,len:{th:17,sh:18,ft:3.2,to:23.5,hd:10,ua:12.5,fa:12.5},
    parts:{
      thigh:{b:[-8,-6,8,22],d(c){cel(c,c=>{c.beginPath();c.moveTo(-5.4,-2);c.lineTo(5.6,-2);c.lineTo(7.4,18);c.lineTo(-6.6,18.4);c.closePath();},ER.cloth,ER.clothS,ER.clothL,1.1,1.3);
        cel(c,c=>{c.beginPath();c.moveTo(-5.8,-1);c.lineTo(5.8,-1);c.lineTo(5.6,10);c.lineTo(-5.4,10.6);c.closePath();},ER.lac,ER.lacS,ER.lacL,.8,1.2);
        c.save();c.beginPath();c.rect(-6,-1,12,11.6);c.clip();plateRows(c,-6,6,1.4,10.6,3,ER.lacS,ER.gold);c.restore();}},
      shin:{b:[-6,-5,6,21],d(c){cel(c,c=>capsule(c,6.6,5.4,18),ER.cloth,ER.clothS,null,1);
        cel(c,c=>{c.beginPath();c.moveTo(-1,-1.2);c.quadraticCurveTo(5.6,.6,4.6,14);c.lineTo(-1.6,14);c.closePath();},ER.iron,ER.ironS,ER.ironL,.6,1.1);
        line(c,[1,2,3,12],.55,ER.gold);}},
      foot:{b:[-5,-5,10,5],d(c){cel(c,footPath(8,3.4),ER.iron,ER.ironS,ER.ironL,.6,1.1);line(c,[-3.6,1.6,7.6,1.6],.5,ER.gold);}},
      uarm:{b:[-6,-5,6,16],d(c){cel(c,c=>capsule(c,7.4,6.2,12.5),ER.cloth,ER.clothS,ER.clothL,1);}},
      farm:{b:[-6,-4,6,16],d(c){cel(c,c=>capsule(c,6.8,5.8,12.5),ER.lac,ER.lacS,ER.lacL,.8,1.2);plateRows(c,-3,3,2,11,3,ER.lacS);glowLine(c,[1.6,2,-.4,6,1.4,10],.6,ER.red,2);}},
      hand:{b:[-5,-5,5,5],d(c){cel(c,c=>{c.beginPath();c.arc(0,.4,3.3,0,Math.PI*2);},ER.iron,ER.ironS,ER.ironL,.5,1.1);}},
      pauldron:{b:[-9,-6,9,13],d(c){
        cel(c,c=>{c.beginPath();c.moveTo(-7.4,-3);c.quadraticCurveTo(0,-6.6,7.6,-3);c.lineTo(8.4,10.6);c.quadraticCurveTo(0,8.4,-7.6,11);c.closePath();},ER.lac,ER.lacS,ER.lacL,.9,1.2);
        c.save();c.beginPath();c.moveTo(-7.4,-3);c.quadraticCurveTo(0,-6.6,7.6,-3);c.lineTo(8.4,10.6);c.quadraticCurveTo(0,8.4,-7.6,11);c.closePath();c.clip();plateRows(c,-9,9,-2,11,3.2,ER.lacS,ER.gold);c.restore();}},
      torso:{b:[-13,-29,13,5],d(c){const body=torsoPath(16,19,25);cel(c,body,ER.cloth,ER.clothS,ER.clothL,1.4,1.4);
        c.save();body(c);c.clip();
        cel(c,c=>{c.beginPath();c.moveTo(-9,-22);c.quadraticCurveTo(0,-24.6,9.6,-22);c.lineTo(9,-6);c.quadraticCurveTo(0,-4.6,-9,-6);c.closePath();},ER.lac,ER.lacS,ER.lacL,.9,1.2);
        plateRows(c,-10,10,-20,-6,3.4,ER.lacS,ER.gold);
        c.shadowColor=ER.red;c.shadowBlur=2.5*S;line(c,[-3,-20,0,-15,-2,-11,1,-7],.7,ER.red);c.shadowBlur=0;
        c.fillStyle=ER.redD;c.fillRect(-12,-5.6,24,3.6);line(c,[-12,-5.6,12,-5.6],.5,ER.gold);c.restore();
        /* crimson scarf knot */
        cel(c,c=>{c.beginPath();c.ellipse(-4,-23.6,3,2.2,0,0,Math.PI*2);},ER.red,ER.redD,null,.4,.9);}},
      kasa:{b:[-23,-14,25,4],d(c){
        const p=c=>{c.beginPath();c.moveTo(-21.6,-.4);c.quadraticCurveTo(-8,-8,1,-12.6);c.quadraticCurveTo(10,-8,23.4,-.6);c.quadraticCurveTo(1,2.6,-21.6,-.4);c.closePath();};
        cel(c,p,ER.hat,ER.hatS,ER.hatL,1.2,1.4);
        c.save();p(c);c.clip();c.strokeStyle='rgba(154,128,100,.45)';c.lineWidth=.5;for(let i=-7;i<=7;i++){c.beginPath();c.moveTo(1,-12.6);c.lineTo(1+i*3.4,2);c.stroke();}
        c.fillStyle=ER.red;c.beginPath();c.moveTo(-21.6,-.4);c.quadraticCurveTo(1,2.6,23.4,-.6);c.lineTo(23,-2.2);c.quadraticCurveTo(1,1,-21.2,-2);c.closePath();c.fill();c.restore();}},
      katana:{b:[-3,-12,3,50],d(c){
        cel(c,c=>{c.beginPath();c.rect(-1.5,-11,3,12.6);},'#120D10','#050304',null,.3,.9);
        c.fillStyle=ER.red;for(let y=-10;y<1;y+=2.4){c.beginPath();c.moveTo(0,y);c.lineTo(1.2,y+1.2);c.lineTo(0,y+2.4);c.lineTo(-1.2,y+1.2);c.closePath();c.fill();}
        cel(c,c=>{c.beginPath();c.ellipse(0,2.4,3.4,1.3,0,0,Math.PI*2);},ER.gold,ER.goldS,null,.3,.8);
        const bl=c=>{c.beginPath();c.moveTo(-1.1,3.6);c.quadraticCurveTo(-1.8,24,.2,44);c.lineTo(1.2,47.2);c.quadraticCurveTo(1.8,24,1.3,3.6);c.closePath();};
        c.save();bl(c);c.lineWidth=1.5;c.strokeStyle=INK;c.stroke();const g=c.createLinearGradient(-1.4,0,1.4,0);g.addColorStop(0,ER.steelS);g.addColorStop(.55,ER.steel);g.addColorStop(1,'#FFFFFF');c.fillStyle=g;c.fill();c.clip();
        c.shadowColor=ER.red;c.shadowBlur=2.5*S;c.beginPath();c.moveTo(.9,4);c.quadraticCurveTo(1.4,24,.8,46);c.lineWidth=1.1;c.strokeStyle=ER.red;c.stroke();c.restore();}},
      head_idle:{b:[-14,-14,14,14],d:erHead('idle')},head_attack:{b:[-14,-14,14,14],d:erHead('attack')},
      head_hurt:{b:[-14,-14,14,14],d:erHead('hurt')},head_blink:{b:[-14,-14,14,14],d:erHead('blink')}
    },
    poses:{
      stand:{lean:.2,fl1:.8,fl2:-1.2,bl1:-.55,bl2:-.9,fa1:.9,fa2:1.1,wr:1.2,ba1:.5,ba2:1.6},
      jabW:{lean:-.1,fa1:-.9,fa2:.8,wr:-1,ba1:.6,ba2:1.5},jab:{lean:.5,fa1:1.9,fa2:.1,wr:.5,ba1:-.8,ba2:.7,fl1:.9,fl2:-.6,bl1:-.7,bl2:-.2},
      crossW:{lean:.05,fa1:-.3,fa2:1.4,wr:1.4,ba1:.2,ba2:1.4},cross:{lean:.5,fa1:1.6,fa2:0,wr:.2,ba1:-.7,ba2:.8},
      guard:{fa1:1.4,fa2:1.4,wr:-.2,ba1:1.2,ba2:1.8},
      jump:{lean:.3,fl1:1.2,fl2:-2,bl1:.5,bl2:-1.7,fa1:-.6,fa2:.8,ba1:-.9,ba2:.6,wr:1},
      dash:{lean:.7,fa1:-1.2,fa2:.2,ba1:-1.3,ba2:.2,wr:-1.3},cast:{fa1:1.5,fa2:0,wr:.2}
    },
    idle:(t)=>{const b=Math.sin(t*3.2);return {lean:.2+b*.02,fl1:.8,fl2:-1.2,bl1:-.55,bl2:-.9,fa1:.9+b*.03,fa2:1.1,wr:1.2,ba1:.5,ba2:1.6};},
    run:(ph)=>({lean:.6,fa1:-1.1,fa2:.25,ba1:-1.2,ba2:.3,wr:-1.3}),
    portrait(p){p('head_idle',0,0,0,1);p('kasa',0,-7,0,.9);},
    render(c,f,t,j,m){
      const id='elite_ronin',bk=m||'shade';
      const sc=chain(f,'sc',6,4.4,tl(j,-5,-23),[-.7,.6],{g:420,bias:640,damp:.86,fl:[520,5]});
      ribbon(c,sc,4.6,2,mc(ER.red,m),m,true);
      part(c,id,'uarm',j.bSh[0],j.bSh[1],j.bU,bk);part(c,id,'farm',j.bE[0],j.bE[1],j.bF,bk);part(c,id,'hand',j.bW[0],j.bW[1],j.bF,bk);
      part(c,id,'thigh',-2,j.hy,j.bT,bk);part(c,id,'shin',j.bK[0],j.bK[1],j.bS,bk);part(c,id,'foot',j.bA[0],j.bA[1],-j.bS*.2,bk);
      part(c,id,'torso',0,j.hy,-j.lean,m);
      part(c,id,'thigh',0,j.hy,j.fT,m);part(c,id,'shin',j.fK[0],j.fK[1],j.fS,m);part(c,id,'foot',j.fA[0],j.fA[1],-j.fS*.2,m);
      part(c,id,'head_'+face(f),j.head[0],j.head[1],-j.ha,m);
      const hp=hl(j,0,-7.2);part(c,id,'kasa',hp[0],hp[1],-j.ha*.6,m);
      part(c,id,'uarm',j.fSh[0],j.fSh[1],j.fU,m);
      part(c,id,'pauldron',j.fSh[0],j.fSh[1]+1,-j.lean-(j.fU-.6)*.3,m);
      part(c,id,'farm',j.fE[0],j.fE[1],j.fF,m);
      part(c,id,'katana',j.fW[0],j.fW[1],j.fWp,m);part(c,id,'hand',j.fW[0],j.fW[1],j.fF,m);
      if(!silent(m)){
        c.save();c.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const ph=(t*1.1+i*.25+(f.id||0)*.1)%1;const b=along(j.fW,j.fWp,8+i*9);c.globalAlpha=(1-ph)*.6;c.fillStyle='#FF5A3C';
          c.beginPath();c.arc(b[0]-ph*5,b[1]-ph*12,1*(1-ph)+.3,0,Math.PI*2);c.fill();}c.restore();
        slash(c,f,t,'kb',along(j.fW,j.fWp,46),along(j.fW,j.fWp,12),'#FF3B2E',activeWin(f)||f.punchT>0);}
      f._hand=along(j.fW,j.fWp,44);f._foot=j.fA;f._artSlash=true;
    }
  };

  /* ---------- CORRUPTED HERO (fallen hero: cracked white mask, ivory armour eaten by void, magenta wrist blade, long white hair) ---------- */
  const CH={ivory:'#E9E4F2',ivoryS:'#A9A0BF',ivoryL:'#FFFFFF',void:'#2A1440',voidS:'#160A24',voidL:'#6E4A9A',glow:'#FF3BD4',glowD:'#9A1083',cloth:'#3A2456',clothS:'#21133A',hair:'#ECE6F7',hairS:'#9C90B8',red:'#FF2E63'};
  function chHead(kind){return function(c){
    const hd=c=>{c.beginPath();c.ellipse(0,-1,9.4,10,0,0,Math.PI*2);c.moveTo(-2,6);c.lineTo(3,9.6);c.lineTo(7.2,8.6);c.lineTo(9.4,4.2);c.lineTo(9.2,0);c.lineTo(0,0);c.closePath();};
    cel(c,hd,CH.void,CH.voidS,CH.voidL,1,1.4);
    /* white noh mask, cracked on the rear half */
    const mask=c=>{c.beginPath();c.moveTo(-.8,-8.6);c.quadraticCurveTo(7,-9.6,10.6,-4);c.quadraticCurveTo(11.6,3,9.4,7.6);c.quadraticCurveTo(5,10.6,.6,8.4);c.lineTo(2.4,3.4);c.lineTo(-.4,.6);c.lineTo(1.6,-3);c.closePath();};
    cel(c,mask,CH.ivory,CH.ivoryS,CH.ivoryL,.7,1.2);
    line(c,[1.4,-3,4,-1,2.6,2.2,5,4.4],.55,CH.voidS);
    /* red war stripes */
    line(c,[8.2,-6.6,9.8,-2.6],.8,CH.red);line(c,[6.6,-7.4,7.6,-4.2],.6,CH.red);
    c.save();c.shadowColor=CH.glow;c.shadowBlur=3.5*S;
    if(kind==='hurt'){line(c,[3.6,-2.6,6.6,.4],1.1,'#FFC6F2');line(c,[6.6,-2.6,3.6,.4],1.1,'#FFC6F2');}
    else{const h=kind==='blink'?.3:kind==='attack'?1:1.6;c.fillStyle=CH.glow;c.beginPath();c.ellipse(5,-1.4,2.3,h,-.1,0,Math.PI*2);c.fill();
      c.fillStyle='#16081F';c.beginPath();c.ellipse(9.6,-1.8,1.2,h*.6,-.2,0,Math.PI*2);c.fill();}
    c.restore();
    line(c,[5.6,5,9.4,4.4],.6,CH.ivoryS);
  };}
  defs.corrupted_hero={name:'Corrupted Hero',baseH:78,len:{th:17,sh:18.5,ft:3,to:23,hd:10,ua:12.5,fa:12.5},
    parts:{
      thigh:{b:[-6,-5,6,21],d(c){cel(c,c=>capsule(c,8.2,6.6,17),CH.cloth,CH.clothS,CH.voidL,1.2);
        cel(c,c=>{c.beginPath();c.moveTo(-4.8,-1);c.lineTo(5,-1);c.lineTo(4.6,9);c.lineTo(-4.2,9.4);c.closePath();},CH.ivory,CH.ivoryS,CH.ivoryL,.7,1.1);
        glowLine(c,[-2,2,.6,5,-1,8.6],.6,CH.glow,2);}},
      shin:{b:[-6,-5,6,21],d(c){cel(c,c=>capsule(c,6.8,5.4,18.5),CH.void,CH.voidS,null,1);
        cel(c,c=>{c.beginPath();c.moveTo(-.4,-1.4);c.quadraticCurveTo(5.4,1,4.4,13.4);c.lineTo(.6,13.4);c.closePath();},CH.ivory,CH.ivoryS,CH.ivoryL,.5,1);
        glowLine(c,[2,3,1.2,7,2.6,11],.55,CH.glow,2);}},
      foot:{b:[-5,-5,10,5],d(c){cel(c,footPath(8,3.4),CH.ivory,CH.ivoryS,CH.ivoryL,.6,1.1);line(c,[4.4,-1,4.6,3],.6,INK);}},
      uarm:{b:[-6,-5,6,16],d(c){cel(c,c=>capsule(c,7.2,6.2,12.5),CH.cloth,CH.clothS,CH.voidL,1);}},
      farm:{b:[-6,-4,6,16],d(c){cel(c,c=>capsule(c,6.6,5.6,12.5),CH.ivory,CH.ivoryS,CH.ivoryL,.8,1.2);
        c.save();capsule(c,6.6,5.6,12.5);c.clip();c.fillStyle=CH.void;c.beginPath();c.moveTo(-4,6);c.quadraticCurveTo(0,4,4,8);c.lineTo(4,14);c.lineTo(-4,14);c.closePath();c.fill();c.restore();
        glowLine(c,[-1.4,5,1.2,8,-.6,11.4],.7,CH.glow,2.5);}},
      hand:{b:[-5,-5,5,5],d(c){cel(c,c=>{c.beginPath();c.arc(0,.4,3.2,0,Math.PI*2);},CH.void,CH.voidS,CH.voidL,.5,1.1);}},
      pauldron:{b:[-8,-6,8,10],d(c){
        cel(c,c=>{c.beginPath();c.moveTo(-6,-3.6);c.quadraticCurveTo(0,-7,6.4,-3.4);c.lineTo(6,5);c.quadraticCurveTo(0,3,-5.6,5.4);c.closePath();},CH.ivory,CH.ivoryS,CH.ivoryL,.8,1.1);
        line(c,[-4,-1,0,1.4,-1,3.6],.6,CH.voidS);glowLine(c,[2,-3,3.4,0,2,2.6],.6,CH.glow,2);}},
      torso:{b:[-12,-28,12,4],d(c){const body=torsoPath(14,17,24.6);cel(c,body,CH.cloth,CH.clothS,CH.voidL,1.4,1.4);
        c.save();body(c);c.clip();
        cel(c,c=>{c.beginPath();c.moveTo(-6,-23);c.quadraticCurveTo(3,-25,9,-21);c.lineTo(8.6,-11);c.quadraticCurveTo(1,-8,-6.4,-11);c.closePath();},CH.ivory,CH.ivoryS,CH.ivoryL,.8,1.2);
        /* void corruption eating the chest plate */
        c.fillStyle=CH.void;c.beginPath();c.moveTo(-7,-15);c.quadraticCurveTo(-2,-18,0,-13);c.quadraticCurveTo(3,-9,-1,-6);c.lineTo(-8,-6);c.closePath();c.fill();
        c.shadowColor=CH.glow;c.shadowBlur=3*S;c.fillStyle=CH.glow;c.beginPath();c.arc(2.6,-16.4,2,0,Math.PI*2);c.fill();
        line(c,[2.6,-16.4,-1,-13,-3,-9,-6,-7],.7,CH.glow);line(c,[2.6,-16.4,6,-13.4],.6,CH.glow);c.shadowBlur=0;
        c.fillStyle=CH.clothS;c.fillRect(-11,-5.6,22,3.6);line(c,[-11,-5.6,11,-5.6],.5,CH.glowD);c.restore();}},
      hairB:{b:[-15,-14,6,12],d(c){cel(c,c=>{c.beginPath();c.moveTo(4,-10.6);c.quadraticCurveTo(-6,-13.4,-11.6,-6);c.quadraticCurveTo(-14,2,-10,9);c.quadraticCurveTo(-6,4,-3,6);c.quadraticCurveTo(-1,-2,4,-6);c.closePath();},CH.hair,CH.hairS,'#FFFFFF',.9,1.2);
        line(c,[-9,-5,-10.6,3],.6,CH.glowD);}},
      head_idle:{b:[-14,-14,14,14],d:chHead('idle')},head_attack:{b:[-14,-14,14,14],d:chHead('attack')},
      head_hurt:{b:[-14,-14,14,14],d:chHead('hurt')},head_blink:{b:[-14,-14,14,14],d:chHead('blink')}
    },
    poses:{
      stand:{lean:.25,fl1:.85,fl2:-1.3,bl1:-.5,bl2:-.9,fa1:.7,fa2:1.5,ba1:-.2,ba2:1.4},
      jabW:{lean:0,fa1:.2,fa2:2,ba1:.4,ba2:1.4},jab:{lean:.5,fa1:1.65,fa2:0,ba1:-.6,ba2:1,fl1:.9,fl2:-.7,bl1:-.7,bl2:-.2},
      dash:{lean:.8,fa1:1.5,fa2:0,ba1:-1.4,ba2:.3},guard:{fa1:1.2,fa2:2,ba1:1.1,ba2:2},
      jump:{lean:.3,fl1:1.2,fl2:-2,bl1:.5,bl2:-1.7,fa1:-.6,fa2:.8,ba1:-.9,ba2:.6}
    },
    idle:(t)=>{const b=Math.sin(t*3.4);return {lean:.25+b*.02,fl1:.85,fl2:-1.3,bl1:-.5,bl2:-.9,fa1:.7+b*.04,fa2:1.5,ba1:-.2,ba2:1.4,ht:b*.03};},
    run:(ph)=>({lean:.6,fa1:-1.1,fa2:.4,ba1:-1.2,ba2:.3}),
    portrait(p){p('hairB',0,0,0,1);p('head_idle',0,0,0,1);},
    render(c,f,t,j,m){
      const id='corrupted_hero';
      const hr=chain(f,'hr',7,4.2,hl(j,-8,-2),[-.85,.5],{g:260,bias:820,damp:.87,fl:[680,6]});
      const cp=chain(f,'cp',6,4.6,tl(j,-5,-21),[-.5,.85],{g:500,bias:520,damp:.86,fl:[480,5]});
      rig(c,f,t,j,m,id,{eyes:[[5,-1.4]],behind(){ribbon(c,cp,8,3,mc(CH.cloth,m),m,true);ribbon(c,hr,6,1.4,mc(CH.hair,m),m,true);
          if(!silent(m)){c.save();c.globalAlpha=.8;ribbon(c,hr.slice(2),1.4,.6,CH.glow,m,true);c.restore();}},
        front(){part(c,id,'hand',j.fW[0],j.fW[1],j.fF,m);
          if(!silent(m)){const a=along(j.fW,j.fF,2),b=along(j.fW,j.fF,22);c.save();c.globalCompositeOperation='lighter';c.lineCap='round';
            c.strokeStyle='rgba(255,59,212,.45)';c.lineWidth=4.4;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke();
            c.strokeStyle='#FFD6F6';c.lineWidth=1.3;c.stroke();c.restore();}}});
      if(!silent(m)){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const ph=(t*.8+i*.2+(f.id||0)*.17)%1;const b=tl(j,-6+i*3,-4-i*4);c.globalAlpha=(1-ph)*.6;c.fillStyle='#FF3BD4';
          c.beginPath();c.arc(b[0]-ph*6,b[1]-ph*14,1.1*(1-ph)+.3,0,Math.PI*2);c.fill();}c.restore();
        slash(c,f,t,'wb',along(j.fW,j.fF,22),along(j.fW,j.fF,4),'#FF3BD4',f.punchT>0||activeWin(f));}
      f._hand=along(j.fW,j.fF,20);f._artSlash=true;
    }
  };

  /* ---------- RIFT LORD (final boss: horned obsidian demon king, magenta rift cracks, void cape, rift greatsword) ---------- */
  const RL={obs:'#241A2E',obsS:'#120B18',obsL:'#5E4A72',plate:'#3A2A48',plateS:'#1C1226',plateL:'#8A6EA6',glow:'#FF2FB4',glowH:'#FFB0E8',glowD:'#8E0E6A',
    horn:'#16101C',hornL:'#6A5480',skin:'#4A2A52',skinS:'#2A1630',cape:'#1A0E26',capeS:'#0B0612',gold:'#C79A4A'};
  function rlCracks(c,pts,w){c.save();c.shadowColor=RL.glow;c.shadowBlur=3.5*S;line(c,pts,w||.9,RL.glow);c.shadowBlur=0;line(c,pts,(w||.9)*.4,RL.glowH);c.restore();}
  function rlHead(kind){return function(c){
    /* great curved horns */
    cel(c,c=>{c.beginPath();c.moveTo(-6,-8);c.quadraticCurveTo(-20,-12,-22,-30);c.quadraticCurveTo(-14,-20,-1,-13);c.closePath();},RL.horn,'#08050B',RL.hornL,.8,1.4);
    cel(c,c=>{c.beginPath();c.moveTo(3,-12);c.quadraticCurveTo(8,-28,22,-33);c.quadraticCurveTo(13,-22,10,-8);c.closePath();},RL.horn,'#08050B',RL.hornL,.8,1.4);
    rlCracks(c,[-15,-20,-18,-25],.6);rlCracks(c,[13,-24,17,-28],.6);
    const hd=c=>{c.beginPath();c.moveTo(-11,-2);c.quadraticCurveTo(-10.6,-13,0,-13.6);c.quadraticCurveTo(10,-13.4,12.6,-5);c.lineTo(14,1.6);c.lineTo(12.4,4.4);c.lineTo(13.4,9);c.quadraticCurveTo(8,14,0,12.6);c.quadraticCurveTo(-9,11,-11,-2);c.closePath();};
    cel(c,hd,RL.plate,RL.plateS,RL.plateL,1.2,1.5);
    /* crown spikes */
    [[-6,-12.6,-5,-20],[-1,-13.6,0,-22],[4,-13.4,6,-20]].forEach(([x1,y1,x2,y2])=>cel(c,c=>{c.beginPath();c.moveTo(x1-2.2,y1+.4);c.lineTo(x2,y2);c.lineTo(x1+2.4,y1+.2);c.closePath();},RL.gold,'#6E4E1E','#FFE3A0',.4,1));
    /* visor slit + face */
    cel(c,c=>{c.beginPath();c.moveTo(0,-5.6);c.quadraticCurveTo(7,-8,13,-5);c.lineTo(13.4,2);c.quadraticCurveTo(7,3.6,.4,1.6);c.closePath();},RL.obsS,'#050307',null,.3,1);
    c.save();c.shadowColor=RL.glow;c.shadowBlur=4*S;c.fillStyle=kind==='hurt'?RL.glowH:RL.glow;
    if(kind==='hurt'){line(c,[3.6,-3.6,7.4,.4],1.3,RL.glowH);line(c,[7.4,-3.6,3.6,.4],1.3,RL.glowH);}
    else{const h=kind==='blink'?.3:kind==='attack'?1.9:1.3;c.beginPath();c.moveTo(2.6,-2);c.lineTo(8,-3.4);c.lineTo(7.6,-2+h);c.lineTo(3,-1+h*.7);c.closePath();c.fill();
      c.beginPath();c.moveTo(9.4,-3.4);c.lineTo(12.8,-4);c.lineTo(12.6,-2.6+h*.7);c.lineTo(9.6,-2.2+h*.6);c.closePath();c.fill();}
    c.restore();
    /* jaw with glowing maw */
    const op=kind==='attack'?3:kind==='hurt'?2:1;
    c.save();c.beginPath();c.moveTo(4.6,5.6);c.quadraticCurveTo(9,5+op*.2,13,5.4);c.lineTo(12.6,6+op);c.quadraticCurveTo(8.6,7.2+op,5,6.6+op*.6);c.closePath();c.fillStyle=RL.glowD;c.fill();
    c.shadowColor=RL.glow;c.shadowBlur=3*S;c.fillStyle='rgba(255,47,180,.9)';c.fill();c.restore();
    [6,8.4,10.8].forEach(x=>{c.beginPath();c.moveTo(x-.8,5.4);c.lineTo(x,7.4);c.lineTo(x+.8,5.4);c.closePath();c.fillStyle='#F2E6FF';c.fill();});
    rlCracks(c,[-6,2,-3,6,-5,9],.7);
  };}
  defs.rift_lord={name:'Rift Lord',baseH:100,len:{th:21,sh:22,ft:4.6,to:31,hd:12.5,ua:17.5,fa:16.5},
    parts:{
      thigh:{b:[-11,-7,11,26],d(c){cel(c,c=>capsule(c,15,12,21),RL.obs,RL.obsS,RL.obsL,1.4,1.5);
        cel(c,c=>{c.beginPath();c.moveTo(-8,-1.6);c.lineTo(8,-1.6);c.lineTo(7,13);c.lineTo(-7,14);c.closePath();},RL.plate,RL.plateS,RL.plateL,.9,1.3);
        rlCracks(c,[-3,1,1,6,-2,11]);}},
      shin:{b:[-9,-6,9,26],d(c){cel(c,c=>capsule(c,12,9.6,22),RL.obs,RL.obsS,null,1.2);
        cel(c,c=>{c.beginPath();c.moveTo(-1,-2);c.quadraticCurveTo(9,1,7,18);c.lineTo(-2,18);c.closePath();},RL.plate,RL.plateS,RL.plateL,.7,1.2);
        cel(c,c=>{c.beginPath();c.moveTo(4,2);c.lineTo(11,-1);c.lineTo(6.6,7);c.closePath();},RL.horn,'#08050B',RL.hornL,.4,1);
        rlCracks(c,[2,5,0,11,3,16]);}},
      foot:{b:[-6,-6,14,6],d(c){cel(c,footPath(11,4.6),RL.plate,RL.plateS,RL.plateL,.7,1.2);
        c.fillStyle='#EDE2FA';[[9.6,3.6],[12,2.4]].forEach(([x,y])=>{c.beginPath();c.moveTo(x-1,y-1.6);c.lineTo(x+2,y+1);c.lineTo(x-.4,y+.8);c.closePath();c.fill();});}},
      uarm:{b:[-9,-7,9,22],d(c){cel(c,c=>capsule(c,12.4,10.4,17.5),RL.obs,RL.obsS,RL.obsL,1.2);rlCracks(c,[0,3,2,9,-1,14]);}},
      farm:{b:[-9,-6,9,21],d(c){cel(c,c=>capsule(c,11.6,10,16.5),RL.plate,RL.plateS,RL.plateL,1,1.4);plateRows(c,-4,4,3,15,3.4,RL.plateS);
        cel(c,c=>{c.beginPath();c.moveTo(-5,3);c.lineTo(-12,0);c.lineTo(-5.6,9);c.closePath();},RL.horn,'#08050B',RL.hornL,.4,1);rlCracks(c,[2.6,2,1,8,3,13]);}},
      hand:{b:[-8,-7,8,10],d(c){fist(c,5.2,RL.plate,RL.plateS,RL.plateL,true);rlCracks(c,[-2,-2,2,1],.6);}},
      pauldron:{b:[-14,-12,14,13],d(c){
        const p=c=>{c.beginPath();c.moveTo(-11,-2);c.quadraticCurveTo(0,-9,11.6,-2);c.lineTo(12,9);c.quadraticCurveTo(0,6,-11.6,9.6);c.closePath();};
        cel(c,p,RL.plate,RL.plateS,RL.plateL,1,1.4);
        [[-7,-4,-10,-11],[0,-6,0,-12],[7,-4,10,-11]].forEach(([x1,y1,x2,y2])=>cel(c,c=>{c.beginPath();c.moveTo(x1-2.4,y1+1);c.lineTo(x2,y2);c.lineTo(x1+2.4,y1+1);c.closePath();},RL.horn,'#08050B',RL.hornL,.4,1));
        rlCracks(c,[-6,0,-1,3,4,1,8,5]);}},
      torso:{b:[-19,-38,19,6],d(c){const body=torsoPath(22,30,34);cel(c,body,RL.obs,RL.obsS,RL.obsL,1.6,1.6);
        c.save();body(c);c.clip();
        cel(c,c=>{c.beginPath();c.moveTo(-13,-32);c.quadraticCurveTo(0,-36,14,-32);c.lineTo(12,-12);c.quadraticCurveTo(0,-8,-12,-12);c.closePath();},RL.plate,RL.plateS,RL.plateL,1.1,1.4);
        plateRows(c,-14,14,-10,-2,3.4,RL.plateS,RL.gold);
        /* rift core */
        c.shadowColor=RL.glow;c.shadowBlur=5*S;c.fillStyle=RL.glow;c.beginPath();c.moveTo(1,-28);c.lineTo(5,-23);c.lineTo(1,-17);c.lineTo(-3,-23);c.closePath();c.fill();
        c.fillStyle=RL.glowH;c.beginPath();c.moveTo(1,-26);c.lineTo(3,-23);c.lineTo(1,-20);c.lineTo(-1,-23);c.closePath();c.fill();c.shadowBlur=0;
        rlCracks(c,[1,-17,-2,-12,1,-7,-3,-2]);rlCracks(c,[5,-23,10,-20,12,-14]);rlCracks(c,[-3,-23,-9,-26,-12,-20]);
        c.restore();}},
      sword:{b:[-7,-16,7,70],d(c){
        cel(c,c=>{c.beginPath();c.rect(-2.2,-15,4.4,16);},'#140C18','#050307',null,.4,1);
        c.fillStyle=RL.gold;for(let y=-14;y<0;y+=3){c.beginPath();c.moveTo(0,y);c.lineTo(1.8,y+1.5);c.lineTo(0,y+3);c.lineTo(-1.8,y+1.5);c.closePath();c.fill();}
        cel(c,c=>{c.beginPath();c.moveTo(-7,0);c.quadraticCurveTo(0,-3,7,0);c.lineTo(5,4);c.lineTo(-5,4);c.closePath();},RL.plate,RL.plateS,RL.plateL,.5,1.1);
        const bl=c=>{c.beginPath();c.moveTo(-4.4,4);c.lineTo(-5.4,40);c.lineTo(-2,58);c.lineTo(0,66);c.lineTo(2.4,58);c.lineTo(5.4,40);c.lineTo(4.4,4);c.closePath();};
        c.save();bl(c);c.lineWidth=1.8;c.strokeStyle=INK;c.stroke();c.fillStyle='#1E1426';c.fill();c.clip();
        c.fillStyle='#3A2A4C';c.beginPath();c.moveTo(-4.4,4);c.lineTo(-5.4,40);c.lineTo(-2,58);c.lineTo(0,66);c.lineTo(0,4);c.closePath();c.fill();
        c.shadowColor=RL.glow;c.shadowBlur=5*S;line(c,[0,8,-.6,26,.6,42,0,60],1.6,RL.glow);c.shadowBlur=0;line(c,[0,8,-.6,26,.6,42,0,60],.6,RL.glowH);
        line(c,[-3,14,-1,20],.6,RL.glow);line(c,[3,30,1,36],.6,RL.glow);c.restore();}},
      head_idle:{b:[-25,-36,25,16],d:rlHead('idle')},head_attack:{b:[-25,-36,25,16],d:rlHead('attack')},
      head_hurt:{b:[-25,-36,25,16],d:rlHead('hurt')},head_blink:{b:[-25,-36,25,16],d:rlHead('blink')}
    },
    poses:{
      stand:{lean:.12,fl1:.6,fl2:-.9,bl1:-.45,bl2:-.7,fa1:.7,fa2:.9,wr:1.4,ba1:.35,ba2:1.1},
      jabW:{lean:-.2,fa1:-1.4,fa2:.9,wr:-.9,ba1:.6,ba2:1.2},jab:{lean:.45,fa1:1.9,fa2:.1,wr:.6,ba1:-.6,ba2:.6,fl1:.8,fl2:-.5,bl1:-.6,bl2:-.2},
      guard:{fa1:1.5,fa2:1.3,wr:-.3,ba1:1.2,ba2:1.6},cast:{lean:-.1,fa1:2.6,fa2:.2,wr:.4,ba1:2.4,ba2:.3},
      jump:{lean:.2,fl1:1.1,fl2:-1.8,bl1:.4,bl2:-1.4,fa1:-.4,fa2:.8,ba1:-.8,ba2:.6,wr:1}
    },
    idle:(t)=>{const b=Math.sin(t*2.2);return {lean:.12+b*.02,fl1:.6,fl2:-.9,bl1:-.45,bl2:-.7,fa1:.7+b*.03,fa2:.9,wr:1.4,ba1:.35,ba2:1.1,ht:b*.03};},
    run:(ph)=>({lean:.35,fa1:.2+Math.sin(ph)*.25,fa2:.6,wr:1.2,ba1:-.4-Math.sin(ph)*.3,ba2:.8}),
    portrait(p){p('head_idle',0,4,0,.8);},
    render(c,f,t,j,m){
      const id='rift_lord',bk=m||'shade';
      /* tattered void cape: three strips */
      [[-8,-30,0],[-12,-28,1],[-4,-31,2]].forEach(([x,y,k])=>{const ch=chain(f,'cape'+k,7,6.4,tl(j,x,y),[-.35-k*.12,.92],{g:420,bias:420,damp:.86,fl:[380,3.6+k]});
        ribbon(c,ch,12-k*2,4,mc(k===1?RL.capeS:RL.cape,m),m,true);
        if(!silent(m)&&k===0){c.save();c.globalAlpha=.7;ribbon(c,ch.slice(3),1.2,.5,RL.glow,m,true);c.restore();}});
      part(c,id,'uarm',j.bSh[0],j.bSh[1],j.bU,bk);part(c,id,'farm',j.bE[0],j.bE[1],j.bF,bk);part(c,id,'hand',j.bW[0],j.bW[1],j.bF,bk);
      part(c,id,'thigh',-3,j.hy,j.bT,bk);part(c,id,'shin',j.bK[0],j.bK[1],j.bS,bk);part(c,id,'foot',j.bA[0],j.bA[1],-j.bS*.2,bk);
      part(c,id,'torso',0,j.hy,-j.lean,m);
      part(c,id,'thigh',0,j.hy,j.fT,m);part(c,id,'shin',j.fK[0],j.fK[1],j.fS,m);part(c,id,'foot',j.fA[0],j.fA[1],-j.fS*.2,m);
      part(c,id,'head_'+face(f),j.head[0],j.head[1],-j.ha,m);
      part(c,id,'uarm',j.fSh[0],j.fSh[1],j.fU,m);
      part(c,id,'pauldron',j.fSh[0],j.fSh[1]+1,-j.lean-(j.fU-.6)*.3,m);
      part(c,id,'farm',j.fE[0],j.fE[1],j.fF,m);
      part(c,id,'sword',j.fW[0],j.fW[1],j.fWp,m);part(c,id,'hand',j.fW[0],j.fW[1],j.fF,m);
      if(!silent(m)){
        c.save();c.globalCompositeOperation='lighter';
        for(let i=0;i<7;i++){const ph=(t*.7+i*.143+(f.id||0)*.1)%1;const b=tl(j,-12+i*4,-6-((i*7)%5)*6);c.globalAlpha=(1-ph)*.7;c.fillStyle=i%2?'#FF2FB4':'#B57CFF';
          c.beginPath();c.arc(b[0]+Math.sin(ph*6+i)*3,b[1]-ph*30,1.6*(1-ph)+.4,0,Math.PI*2);c.fill();}
        const g=tl(j,1,-23);const pulse=.5+.5*Math.sin(t*4);const rg=c.createRadialGradient(g[0],g[1],0,g[0],g[1],14);rg.addColorStop(0,'rgba(255,47,180,'+(.35+.25*pulse)+')');rg.addColorStop(1,'rgba(255,47,180,0)');
        c.fillStyle=rg;c.globalAlpha=1;c.fillRect(g[0]-14,g[1]-14,28,28);
        c.restore();
        slash(c,f,t,'gs',along(j.fW,j.fWp,64),along(j.fW,j.fWp,16),'#FF2FB4',f.punchT>0||activeWin(f));
      }
      f._hand=along(j.fW,j.fWp,60);f._foot=j.fA;f._artSlash=true;
    }
  };
  defs.rift_grunt.portrait=p=>{p('head_idle',0,0,0,1);p('hat',0,-7.6,0,1);};
  Object.assign(enemyArt,{rift_minion:'rift_minion',elite_ronin:'elite_ronin',corrupted_hero:'corrupted_hero',rift_lord:'rift_lord'});
