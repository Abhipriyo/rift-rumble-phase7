  /* =================================================================
     SHARED BODY HELPERS (used by the rift enemies and the remaining heroes)
     ================================================================= */
  function torsoPath(wb,wt,h){return c=>{c.beginPath();c.moveTo(-wb/2,2.5);c.lineTo(wb/2+.4,2.5);c.quadraticCurveTo(wt/2+1.6,-h*.42,wt/2+.2,-h*.72);c.quadraticCurveTo(wt/2-.4,-h+1,wt/2-4.8,-h);
    c.lineTo(-wt/2+4.4,-h);c.quadraticCurveTo(-wt/2-1.2,-h+1,-wt/2-1.2,-h*.72);c.quadraticCurveTo(-wt/2-1.6,-h*.4,-wb/2,2.5);c.closePath();};}
  function glowLine(c,pts,w,col,blur){c.save();c.shadowColor=col;c.shadowBlur=(blur||2.5)*S;line(c,pts,w,col);c.restore();}
  function fist(c,r,base,sh,light,knuckle){cel(c,c=>{c.beginPath();c.arc(0,.6,r,0,Math.PI*2);},base,sh,light,.6,1.1);if(knuckle!==false){line(c,[-r*.5,-r*.35,r*.55,-r*.15],.55,INK);line(c,[-r*.55,r*.25,r*.55,r*.4],.55,INK);}}
  function plateRows(c,x0,x1,y0,y1,step,col,lace){for(let y=y0;y<y1;y+=step){c.fillStyle=col;c.fillRect(x0,y,x1-x0,step*.62);if(lace){c.fillStyle=lace;for(let x=x0+1.5;x<x1-1;x+=3)c.fillRect(x,y+step*.62,.8,step*.38);}}}
  function footPath(len,h){return c=>{c.beginPath();c.moveTo(-3.6,-h);c.lineTo(2,-h);c.quadraticCurveTo(len-.5,-h*.5,len,1.2);c.lineTo(len-.2,3.2);c.lineTo(-3.8,3.2);c.closePath();};}
  /* standard draw order: back arm, back leg, torso, front leg, head, front arm */
  function rig(c,f,t,j,m,id,o){
    const bk=m||'shade',T=tex[id],HS=o.HS||1;
    if(o.behind)o.behind(bk);
    part(c,id,'uarm',j.bSh[0],j.bSh[1],j.bU,bk);part(c,id,'farm',j.bE[0],j.bE[1],j.bF,bk);
    if(o.backHand)o.backHand(bk);else part(c,id,'hand',j.bW[0],j.bW[1],j.bF,bk);
    part(c,id,'thigh',-2,j.hy,j.bT,bk);part(c,id,'shin',j.bK[0],j.bK[1],j.bS,bk);part(c,id,'foot',j.bA[0],j.bA[1],-j.bS*.2,bk);
    if(o.beforeTorso)o.beforeTorso(bk);
    part(c,id,'torso',0,j.hy,-j.lean,m);
    part(c,id,'thigh',0,j.hy,j.fT,m);part(c,id,'shin',j.fK[0],j.fK[1],j.fS,m);part(c,id,'foot',j.fA[0],j.fA[1],-j.fS*.2,m);
    if(o.afterLegs)o.afterLegs();
    if(T.hairB)part(c,id,'hairB',j.head[0],j.head[1],-j.ha,m,HS);
    part(c,id,'head_'+face(f),j.head[0],j.head[1],-j.ha,m,HS);
    if(T.hairF)part(c,id,'hairF',j.head[0],j.head[1],-j.ha,m,HS);
    if(o.head)o.head(HS);
    if(m==='void')voidEyes(c,j,(o.eyes||[[5.6,1.5],[9.8,1.4]]).map(([x,y])=>[x*HS,y*HS]));
    part(c,id,'uarm',j.fSh[0],j.fSh[1],j.fU,m);
    if(T.pauldron)part(c,id,'pauldron',j.fSh[0],j.fSh[1]+1,-j.lean-(j.fU-.6)*.35,m);
    part(c,id,'farm',j.fE[0],j.fE[1],j.fF,m);
    if(o.front)o.front();else part(c,id,'hand',j.fW[0],j.fW[1],j.fF,m);
    f._foot=j.fA;
  }
  /* unarmed fighters: hand trails come from the game's own trail system (it reads f._hand / f._foot) */
  function fistTrail(f,j){f._hand=along(j.fW,j.fF,2.5);f._artSlash=false;}

  /* =================================================================
     RIFT GRUNT  (basic rift soldier: dark jingasa hat, masked face, red glowing claw gauntlets)
     ================================================================= */
  const RG={cloth:'#2E2A3A',clothS:'#1B1824',clothL:'#6C6488',armor:'#463D57',armorS:'#2A2433',armorL:'#857AA0',red:'#FF2E4D',redD:'#8E0F2C',
    rope:'#B8A27A',ropeS:'#7C6A48',hat:'#2C2535',hatS:'#17121D',hatL:'#6A5E80',mask:'#141119',maskS:'#09070D',eye:'#F4F1FF'};
  function rgHead(kind){return function(c){
    cel(c,c=>capsule(c,4.6,4.2,7.5),RG.mask,RG.maskS,null,.6,1.2);
    const hd=c=>{c.beginPath();c.ellipse(0,-1,9.4,10,0,0,Math.PI*2);c.moveTo(-2,6);c.lineTo(3,9.6);c.lineTo(7.2,8.6);c.lineTo(9.4,4.2);c.lineTo(9.2,0);c.lineTo(0,0);c.closePath();};
    cel(c,hd,RG.mask,RG.maskS,RG.clothL,1,1.4);
    cel(c,c=>{c.beginPath();c.moveTo(-.6,-3.4);c.quadraticCurveTo(5,-5,10.2,-3.6);c.lineTo(10.4,2.8);c.quadraticCurveTo(5,4,-.4,3);c.closePath();},'#0A0810','#040306',null,.3,1);
    c.save();c.shadowColor='#FFFFFF';c.shadowBlur=2.5*S;c.fillStyle=kind==='hurt'?'#FF8A9E':RG.eye;
    if(kind==='hurt'){line(c,[3,-1.6,5.8,1.2],1,'#FF8A9E');line(c,[5.8,-1.6,3,1.2],1,'#FF8A9E');line(c,[8,-1.6,9.8,1],.9,'#FF8A9E');line(c,[9.8,-1.6,8,1],.9,'#FF8A9E');}
    else{const n=kind==='attack'?.5:kind==='blink'?.15:1;c.beginPath();c.moveTo(2.4,-.6);c.lineTo(7,-1.4);c.lineTo(6.6,-.6+n*1.2);c.lineTo(2.6,.2+n*.6);c.closePath();c.fill();
      c.beginPath();c.moveTo(8.2,-1.4);c.lineTo(10.6,-1.8);c.lineTo(10.5,-.8+n*.9);c.lineTo(8.3,-.3+n*.6);c.closePath();c.fill();}
    c.restore();
    line(c,[1,5.6,9.6,5],.6,'rgba(108,100,136,.7)');line(c,[2,7.6,8.8,7.2],.5,'rgba(108,100,136,.5)');
  };}
  defs.rift_grunt={name:'Rift Grunt',len:{th:17,sh:18,ft:3,to:23,hd:10,ua:12,fa:12.5},
    parts:{
      thigh:{b:[-7,-6,7,21],d(c){cel(c,c=>capsule(c,8.8,6.8,17),RG.cloth,RG.clothS,RG.clothL,1.2);
        cel(c,c=>{c.beginPath();c.moveTo(-5.6,-2);c.lineTo(5.8,-2);c.lineTo(5.4,8.6);c.lineTo(-5.2,9.4);c.closePath();},RG.armor,RG.armorS,RG.armorL,.8,1.2);
        c.save();c.beginPath();c.rect(-6,-2,12,11.4);c.clip();plateRows(c,-6,6,1.6,9.4,2.6,RG.armorS,RG.redD);c.restore();}},
      shin:{b:[-6,-5,6,21],d(c){cel(c,c=>capsule(c,6.8,5.6,18),RG.cloth,RG.clothS,null,1);
        c.save();capsule(c,6.8,5.6,18);c.clip();for(let y=2;y<17;y+=2.6)line(c,[-4,y,4,y+1.4],.7,'#3E3850');c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(.4,-1.6);c.quadraticCurveTo(5.4,1,4.2,13.6);c.lineTo(1,13.6);c.closePath();},RG.armor,RG.armorS,RG.armorL,.5,1);
        glowLine(c,[2.6,2,2.4,11.6],.6,RG.red,2);}},
      foot:{b:[-5,-5,10,5],d(c){cel(c,footPath(8,3.4),RG.mask,RG.maskS,RG.clothL,.6,1.1);line(c,[4.4,-1,4.6,3],.6,INK);}},
      uarm:{b:[-6,-5,6,16],d(c){cel(c,c=>capsule(c,7.6,6.4,12),RG.cloth,RG.clothS,RG.clothL,1);
        cel(c,c=>{c.beginPath();c.moveTo(-4.4,-2.6);c.quadraticCurveTo(0,-5,4.6,-2.4);c.lineTo(4,4.6);c.quadraticCurveTo(0,3.4,-4,4.8);c.closePath();},RG.armor,RG.armorS,RG.armorL,.6,1.1);}},
      farm:{b:[-6,-4,6,16],d(c){cel(c,c=>capsule(c,7.2,6.2,12.5),RG.armor,RG.armorS,RG.armorL,.8,1.3);
        plateRows(c,-3,3,2,11,3,RG.armorS);glowLine(c,[1.6,1.4,-.8,4.6,1.4,7.6,-.6,10.8],.85,RG.red,3);glowLine(c,[-2.2,3,-.8,4.6],.6,RG.red,2);}},
      hand:{b:[-6,-5,6,11],d(c){
        c.save();c.shadowColor=RG.red;c.shadowBlur=3*S;c.fillStyle=RG.red;
        [[-2.2,.2],[0,.6],[2.2,.2]].forEach(([x,a])=>{c.beginPath();c.moveTo(x-1,1.6);c.lineTo(x+a+.2,9.6);c.lineTo(x+1,1.6);c.closePath();c.fill();});c.restore();
        fist(c,3.4,RG.mask,RG.maskS,RG.clothL,false);glowLine(c,[-1.8,-.6,1.8,.2],.6,RG.red,1.5);}},
      torso:{b:[-12,-29,12,5],d(c){const body=torsoPath(15,17,24.6);cel(c,body,RG.cloth,RG.clothS,RG.clothL,1.4,1.4);
        c.save();body(c);c.clip();
        c.beginPath();c.moveTo(-4,-25);c.lineTo(-.6,-25);c.lineTo(5.6,-12);c.lineTo(2.6,-12);c.closePath();c.fillStyle='#57506E';c.fill();
        cel(c,c=>{c.beginPath();c.moveTo(-1,-23);c.quadraticCurveTo(7.8,-22,8.8,-14);c.lineTo(8,-8);c.quadraticCurveTo(2,-10,-1.4,-12);c.closePath();},RG.armor,RG.armorS,RG.armorL,.8,1.1);
        c.shadowColor=RG.red;c.shadowBlur=2.5*S;line(c,[2.4,-20.4,4.6,-16.6,3,-14,5.8,-11.4],.75,RG.red);c.shadowBlur=0;
        c.fillStyle=RG.rope;c.fillRect(-11,-6.4,22,3.4);c.fillStyle=RG.ropeS;for(let x=-10;x<11;x+=2.2)c.fillRect(x,-6.4,.9,3.4);
        c.restore();
        cel(c,c=>{c.beginPath();c.ellipse(4,-4.6,2.2,1.8,0,0,Math.PI*2);},RG.rope,RG.ropeS,null,.4,.9);}},
      hat:{b:[-20,-17,20,4],d(c){
        const p=c=>{c.beginPath();c.moveTo(-17.6,-1.4);c.quadraticCurveTo(-6,-10,1,-14.4);c.quadraticCurveTo(8,-10,18.6,-1.6);c.quadraticCurveTo(1,1.2,-17.6,-1.4);c.closePath();};
        cel(c,p,RG.hat,RG.hatS,RG.hatL,1.2,1.4);
        c.save();p(c);c.clip();c.strokeStyle='rgba(120,108,150,.45)';c.lineWidth=.55;for(let i=-6;i<=6;i++){c.beginPath();c.moveTo(1,-14.4);c.lineTo(1+i*3.2,1);c.stroke();}c.restore();
        c.beginPath();c.arc(1,-14.6,1.3,0,Math.PI*2);c.fillStyle=RG.armorL;c.fill();c.lineWidth=.5;c.strokeStyle=INK;c.stroke();}},
      head_idle:{b:[-14,-14,14,14],d:rgHead('idle')},head_attack:{b:[-14,-14,14,14],d:rgHead('attack')},
      head_hurt:{b:[-14,-14,14,14],d:rgHead('hurt')},head_blink:{b:[-14,-14,14,14],d:rgHead('blink')}
    },
    poses:{
      stand:{lean:.22,fl1:.7,fl2:-1.1,bl1:-.5,bl2:-.8,fa1:1,fa2:1.2,ba1:.5,ba2:1.5},
      jabW:{lean:.05,fa1:.3,fa2:1.9,ba1:.6,ba2:1.6},jab:{lean:.4,fa1:1.6,fa2:0,ba1:.4,ba2:1.6,fl1:.8,fl2:-.6,bl1:-.7,bl2:-.2},
      cross:{lean:.45,ba1:1.6,ba2:0,fa1:.6,fa2:1.7,fl1:.8,fl2:-.6,bl1:-.7,bl2:-.2},
      jump:{lean:.25,fl1:1.2,fl2:-2,bl1:.5,bl2:-1.6,fa1:2.2,fa2:.5,ba1:-.6,ba2:.8},guard:{fa1:1.2,fa2:2,ba1:1.1,ba2:2.1}
    },
    idle:(t)=>{const b=Math.sin(t*3.6);return {lean:.22+b*.02,fl1:.7,fl2:-1.1,bl1:-.5,bl2:-.8,fa1:1+b*.04,fa2:1.2,ba1:.5,ba2:1.5};},
    run:(ph)=>({lean:.5,fa1:-.9+Math.sin(ph)*.3,fa2:.5,ba1:.4-Math.sin(ph)*.3,ba2:1.4}),
    render(c,f,t,j,m){
      const id='rift_grunt';
      const r2=chain(f,'r2',4,3.4,tl(j,4.2,-4),[-.2,.98],{g:700,bias:200,fl:[200,5]});
      rig(c,f,t,j,m,id,{eyes:[[4.8,-.6],[9.4,-1]],
        beforeTorso(){},afterLegs(){ribbon(c,r2,1.6,1.2,mc(RG.rope,m),m);},
        head(HS){const hp=hl(j,0,-7.6);part(c,id,'hat',hp[0],hp[1],-j.ha,m);}});
      if(!silent(m)){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const ph=(t*1.1+i*.29+(f.id||0)*.17)%1;const w=i%2?j.fW:j.bW;c.globalAlpha=(1-ph)*.7;c.fillStyle='#FF3A5C';
        c.beginPath();c.arc(w[0]-ph*4,w[1]-ph*12,1*(1-ph)+.3,0,Math.PI*2);c.fill();}c.restore();
        slash(c,f,t,'cl',along(j.fW,j.fF,9),along(j.fW,j.fF,1),'#FF2E4D',f.punchT>0||f.wind>0&&f.wind<.08);}
      f._hand=along(j.fW,j.fF,6);f._artSlash=true;
    }
  };

  /* =================================================================
     ONI BRUTE  (horned oni samurai: grey skin, black-and-red armour, glowing red kanabo)
     authored for a 100-unit hitbox; scaled to the slot (46x100 heavy, 86x130 boss)
     ================================================================= */
  const OB={skin:'#8E8A96',skinS:'#5E5A68',skinL:'#C9C5D2',arm:'#231A22',armS:'#120C12',armL:'#5A4652',red:'#D7263D',redG:'#FF2E4D',redD:'#7A0E1E',
    horn:'#1A1420',hornL:'#5A4E66',hair:'#17111A',hairL:'#463A4E',club:'#1E171E',clubL:'#4C3E4A',tusk:'#F1EAD8'};
  function obHead(kind){return function(c){
    cel(c,c=>capsule(c,9,8,8),OB.skin,OB.skinS,null,.8,1.3);
    /* horns */
    cel(c,c=>{c.beginPath();c.moveTo(-6,-9);c.quadraticCurveTo(-13,-16,-11,-27);c.quadraticCurveTo(-7,-18,-1,-12.6);c.closePath();},OB.horn,'#0B080D',OB.hornL,.7,1.3);
    cel(c,c=>{c.beginPath();c.moveTo(3,-12);c.quadraticCurveTo(5,-22,13,-26.4);c.quadraticCurveTo(9.4,-18,8.6,-9);c.closePath();},OB.horn,'#0B080D',OB.hornL,.7,1.3);
    const hd=c=>{c.beginPath();c.moveTo(-10.6,-2);c.quadraticCurveTo(-10,-12,-1,-12.6);c.quadraticCurveTo(9,-12.4,11.8,-5);c.lineTo(13.2,1.4);c.lineTo(12,4);c.lineTo(13,8.6);c.quadraticCurveTo(8,13.4,0,12.2);c.quadraticCurveTo(-8,11,-10.6,-2);c.closePath();};
    cel(c,hd,OB.skin,OB.skinS,OB.skinL,1.2,1.5);
    /* heavy brow, cheek scars */
    cel(c,c=>{c.beginPath();c.moveTo(0,-5.6);c.quadraticCurveTo(6,-8.4,12.4,-5.6);c.lineTo(12.4,-3.4);c.quadraticCurveTo(6,-5.6,.4,-3.2);c.closePath();},OB.skinS,'#423E4A',null,.3,1);
    line(c,[-3,1,-1,5.2],.7,'#4A4654');line(c,[-4.6,2.6,-2.2,2],.6,'#4A4654');
    /* eyes: one large glowing red eye, one narrow */
    c.save();c.shadowColor=OB.redG;c.shadowBlur=3.5*S;c.fillStyle=kind==='hurt'?'#FFB0B8':OB.redG;
    if(kind==='hurt'){line(c,[3,-3,6.6,.6],1.2,'#FFB0B8');line(c,[6.6,-3,3,.6],1.2,'#FFB0B8');}
    else{const h=kind==='blink'?.4:kind==='attack'?2.2:1.8;c.beginPath();c.ellipse(5,-1.4,2.6,h,-.12,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(10.6,-1.8,1.5,h*.6,-.2,0,Math.PI*2);c.fill();}
    c.restore();
    /* mouth + tusks */
    const open=kind==='attack'?2.6:kind==='hurt'?1.6:.9;
    c.beginPath();c.moveTo(4.6,6.4);c.quadraticCurveTo(9,6+open*.2,12.4,6.2);c.lineTo(12,6.6+open);c.quadraticCurveTo(8.4,7.4+open,4.8,7+open*.6);c.closePath();c.fillStyle='#3A0B14';c.fill();c.lineWidth=.7;c.strokeStyle=INK;c.stroke();
    [6,10.8].forEach(x=>{const y=7.2+open*.5;c.beginPath();c.moveTo(x-1,y);c.lineTo(x+.2,4.2);c.lineTo(x+1,y);c.closePath();c.fillStyle=OB.tusk;c.fill();c.lineWidth=.5;c.strokeStyle=INK;c.stroke();});
  };}
  defs.oni_brute={name:'Oni Brute',baseH:100,len:{th:21,sh:21,ft:4.2,to:31,hd:12.5,ua:17,fa:16},
    parts:{
      thigh:{b:[-10,-7,10,26],d(c){cel(c,c=>capsule(c,14,11,21),OB.arm,OB.armS,OB.armL,1.4,1.5);
        cel(c,c=>{c.beginPath();c.moveTo(-8.4,-3);c.lineTo(8.6,-3);c.lineTo(8,13);c.lineTo(-7.6,14);c.closePath();},OB.arm,OB.armS,OB.armL,1,1.3);
        c.save();c.beginPath();c.rect(-8.4,-3,17,17);c.clip();plateRows(c,-8.4,8.6,0,14,3.4,'#33262F',OB.red);c.restore();}},
      shin:{b:[-8,-6,8,25],d(c){cel(c,c=>capsule(c,10.4,8.6,21),OB.skin,OB.skinS,OB.skinL,1.2,1.4);
        cel(c,c=>{c.beginPath();c.moveTo(-1,-1.4);c.quadraticCurveTo(7.6,1,6,16.6);c.lineTo(.6,16.6);c.closePath();},OB.arm,OB.armS,OB.armL,.7,1.2);
        line(c,[1.6,2,2.4,15],.8,OB.red);line(c,[4.2,2.4,4.4,15],.6,OB.redD);}},
      foot:{b:[-6,-6,13,6],d(c){cel(c,footPath(11.2,4.4),OB.skin,OB.skinS,OB.skinL,.8,1.3);c.fillStyle=OB.armS;c.fillRect(-4.6,2.4,16,1.6);
        line(c,[7,-1,7.4,2.6],.6,INK);line(c,[9.4,-.2,9.6,2.6],.6,INK);}},
      uarm:{b:[-9,-7,9,21],d(c){cel(c,c=>capsule(c,13,11,17),OB.skin,OB.skinS,OB.skinL,1.2,1.5);
        line(c,[-2,3,1.4,7.4,-1.6,11.6],.8,'#4A4654');}},
      farm:{b:[-8,-5,8,20],d(c){cel(c,c=>capsule(c,11,9.4,16),OB.skin,OB.skinS,OB.skinL,1,1.4);
        cel(c,c=>{c.beginPath();c.moveTo(-5.6,4);c.lineTo(5.8,4);c.lineTo(5.2,15);c.lineTo(-5,15);c.closePath();},OB.arm,OB.armS,OB.armL,.6,1.2);
        glowLine(c,[-2.4,6,0,9.6,-1.6,13],.8,OB.redG,3);}},
      hand:{b:[-7,-6,7,8],d(c){fist(c,5.2,OB.skin,OB.skinS,OB.skinL);}},
      torso:{b:[-18,-37,18,6],d(c){const body=torsoPath(24,29,31);cel(c,body,OB.arm,OB.armS,OB.armL,1.6,1.6);
        c.save();body(c);c.clip();
        plateRows(c,-16,16,-26,-6,3.6,'#2E2229',OB.red);
        c.beginPath();c.moveTo(-6,-33);c.lineTo(6,-33);c.lineTo(3,-24);c.lineTo(-3,-24);c.closePath();c.fillStyle=OB.skin;c.fill();
        c.shadowColor=OB.redG;c.shadowBlur=3*S;line(c,[4,-22,8,-17,5.6,-12.6,10,-9],1,OB.redG);line(c,[-8,-20,-5.6,-15],.8,OB.redG);c.shadowBlur=0;
        c.fillStyle=OB.red;c.fillRect(-16,-6.4,32,5.2);c.fillStyle=OB.redD;c.fillRect(-16,-2.4,32,1.4);
        c.restore();
        cel(c,c=>{c.beginPath();c.arc(-1,-4,3,0,Math.PI*2);},OB.redD,'#4A0812',null,.4,1);}},
      pauldron:{b:[-12,-9,12,15],d(c){
        cel(c,c=>{c.beginPath();c.moveTo(-10,-5);c.quadraticCurveTo(0,-9.4,10.4,-4.6);c.lineTo(9,7);c.quadraticCurveTo(0,4.4,-9.4,7.4);c.closePath();},OB.arm,OB.armS,OB.armL,1,1.4);
        c.save();c.beginPath();c.moveTo(-10,-5);c.quadraticCurveTo(0,-9.4,10.4,-4.6);c.lineTo(9,7);c.quadraticCurveTo(0,4.4,-9.4,7.4);c.closePath();c.clip();plateRows(c,-11,11,-3,8,3.2,'#33262F',OB.red);c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(-9,5.6);c.quadraticCurveTo(0,3,9.2,5.6);c.lineTo(8.4,12.4);c.quadraticCurveTo(0,10,-8.6,12.8);c.closePath();},OB.arm,OB.armS,OB.armL,.8,1.3);
        line(c,[-9,5.6,9.2,5.6],.8,OB.red);}},
      hairB:{b:[-20,-16,6,18],d(c){const p=c=>{c.beginPath();c.moveTo(-2,-12);c.quadraticCurveTo(-14,-13,-15,-2);c.lineTo(-19,2);c.lineTo(-14.6,5);c.lineTo(-17.4,10.6);c.lineTo(-12,9.4);c.lineTo(-12.6,15.6);c.lineTo(-7,11);c.lineTo(-3.6,13);c.lineTo(-2,4);c.closePath();};
        cel(c,p,OB.hair,'#0A070C',OB.hairL,1.2,1.4);}},
      kanabo:{b:[-7,-12,7,52],d(c){
        cel(c,c=>{c.beginPath();c.rect(-2,-11,4,14);},'#2A1A1E','#120A0C',null,.3,1);
        c.fillStyle=OB.red;for(let y=-10;y<2;y+=2.8)c.fillRect(-2,y,4,1);
        const p=c=>{c.beginPath();c.moveTo(-3,4);c.lineTo(3.2,4);c.lineTo(5.8,46);c.quadraticCurveTo(0,50.6,-5.6,46);c.closePath();};
        cel(c,p,OB.club,'#0C080C',OB.clubL,1,1.5);
        c.save();p(c);c.clip();for(let y=9;y<46;y+=5.4){[-3.4,0,3.4].forEach((x,i)=>{c.beginPath();c.arc(x*(1+y/80)+(i===1?0:0),y+(i===1?2.7:0),1.1,0,Math.PI*2);c.fillStyle='#3A2E38';c.fill();});}
        c.shadowColor=OB.redG;c.shadowBlur=3.5*S;line(c,[3.6,8,4.8,26,3.2,30,5.2,44],1,OB.redG);line(c,[-2,14,-3.4,24,-1.6,29],.8,OB.redG);c.restore();}},
      glow:{b:[-12,-2,12,54],d(c){c.shadowColor=OB.redG;c.shadowBlur=6*S;c.fillStyle='rgba(255,46,77,.6)';c.beginPath();c.moveTo(-3.4,4);c.lineTo(3.6,4);c.lineTo(6.6,46);c.quadraticCurveTo(0,51,-6.4,46);c.closePath();c.fill();}},
      head_idle:{b:[-16,-29,16,18],d:obHead('idle')},head_attack:{b:[-16,-29,16,18],d:obHead('attack')},
      head_hurt:{b:[-16,-29,16,18],d:obHead('hurt')},head_blink:{b:[-16,-29,16,18],d:obHead('blink')}
    },
    poses:{
      stand:{lean:.12,fl1:.55,fl2:-.6,bl1:-.5,bl2:-.3,fa1:.55,fa2:1.25,wr:.75,ba1:-.1,ba2:1},
      finW:{lean:-.2,fa1:-.6,fa2:1.4,wr:2.8,ba1:.6,ba2:1.4,fl1:.6,fl2:-.7,bl1:-.55,bl2:-.3},
      fin:{lean:.5,fa1:1.7,fa2:-.05,wr:-.35,ba1:-.7,ba2:.7,fl1:.8,fl2:-.6,bl1:-.9,bl2:0},
      jabW:{fa1:.2,fa2:1.6,wr:1.6},jab:{lean:.35,fa1:1.5,fa2:.1,wr:.1},crossW:{fa1:.2,fa2:1.6,wr:1.6},cross:{lean:.4,fa1:1.5,fa2:.1,wr:.1},
      dash:{lean:.6,fa1:1.25,fa2:.2,wr:.2,ba1:-1,ba2:.6,fl1:.9,fl2:-1.2,bl1:-.8,bl2:-.4},
      jump:{lean:.1,fa1:2.4,fa2:.4,wr:.6,ba1:-.5,ba2:.8,fl1:1,fl2:-1.6,bl1:.2,bl2:-1.1},fall:{wr:.8,fa1:1.5,fa2:.6},
      hurt:{wr:.8},dizzy:{wr:1.2},guard:{fa1:1.1,fa2:1.8,wr:.9,ba1:1,ba2:2},cast:{fa1:1.5,fa2:0,wr:.3}
    },
    idle:(t)=>{const b=Math.sin(t*2.2);return {lean:.12+b*.02,fl1:.55,fl2:-.6,bl1:-.5,bl2:-.3,fa1:.55+b*.03,fa2:1.25,wr:.75,ba1:-.1,ba2:1+b*.05};},
    run:(ph)=>({lean:.3,fa1:.4+Math.sin(ph)*.15,fa2:1.2,wr:.8,ba1:Math.sin(ph)*.6,ba2:1.1}),
    render(c,f,t,j,m){
      const id='oni_brute';
      rig(c,f,t,j,m,id,{eyes:[[5,-1.4],[10.6,-1.8]],
        front(){
          const lit=f.wind>0||f.punchT>0||f.charging>0||f.slamming;
          if(lit&&!silent(m)){c.save();c.globalAlpha=.5+.3*Math.sin(t*24);part(c,id,'glow',j.fW[0],j.fW[1],j.fWp,m==='void'?'#FF2E63':null);c.restore();}
          part(c,id,'kanabo',j.fW[0],j.fW[1],j.fWp,m);part(c,id,'hand',j.fW[0],j.fW[1],j.fF,m);}});
      if(!silent(m)){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const ph=(t*.7+i*.21+(f.id||0)*.11)%1;const b=tl(j,-10+i*5,-30);c.globalAlpha=(1-ph)*.7;c.fillStyle='#FF3A5C';
        c.beginPath();c.arc(b[0]-ph*8,b[1]-ph*22,1.4*(1-ph)+.3,0,Math.PI*2);c.fill();}c.restore();
        slash(c,f,t,'club',along(j.fW,j.fWp,48),along(j.fW,j.fWp,18),'#FF2E4D',f.punchT>0||f.charging>0);}
      f._hand=along(j.fW,j.fWp,44);f._artSlash=true;
    }
  };

  /* =================================================================
     RIFT CASTER  (hooded rift sorcerer: white hood, purple robes, floating ofuda talismans)
     ================================================================= */
  const RC={robe:'#3B2560',robeS:'#24163E',robeL:'#7A5AB0',hood:'#ECE7F4',hoodS:'#B5ABC8',hoodL:'#FFFFFF',void:'#120A20',gold:'#C9A04A',goldS:'#8A6A2A',
    purple:'#B57CFF',glow:'#D6A8FF',paper:'#F4EEFF',paperS:'#C9BEDF',skin:'#BFB4D6',skinS:'#8E82AC'};
  function rcHead(kind){return function(c){
    cel(c,c=>capsule(c,4.4,4,7),RC.void,'#05030A',null,.5,1.1);
    const hood=c=>{c.beginPath();c.moveTo(-12,9);c.quadraticCurveTo(-14.6,-6,-6,-13.6);c.quadraticCurveTo(2,-17.6,8.6,-12.4);c.quadraticCurveTo(13.6,-7.6,12.6,1);c.lineTo(11.4,11.6);c.quadraticCurveTo(0,14.6,-12,9);c.closePath();};
    cel(c,hood,RC.hood,RC.hoodS,RC.hoodL,1.3,1.5);
    cel(c,c=>{c.beginPath();c.moveTo(.4,-7.4);c.quadraticCurveTo(7.6,-8.6,11.2,-4);c.lineTo(11,9);c.quadraticCurveTo(5,10.4,.8,8.6);c.quadraticCurveTo(-1.4,0,.4,-7.4);c.closePath();},RC.void,'#05030A',null,.3,1);
    line(c,[-10,-4,-6.4,-11.6],.7,'rgba(140,128,170,.6)');line(c,[-11,4,-9.4,-2],.6,'rgba(140,128,170,.5)');
    c.save();c.shadowColor=RC.purple;c.shadowBlur=3*S;c.fillStyle=kind==='hurt'?'#FFB0E0':RC.glow;
    if(kind==='hurt'){line(c,[3,-2.4,5.6,.6],1,'#FFB0E0');line(c,[5.6,-2.4,3,.6],1,'#FFB0E0');}
    else{const h=kind==='blink'?.25:kind==='attack'?1.5:1.1;c.beginPath();c.ellipse(4.6,-1,1.9,h,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(9.2,-1.2,1.2,h*.85,0,0,Math.PI*2);c.fill();}
    c.restore();
    line(c,[2.6,5,9.6,4.6],.5,'rgba(110,80,170,.6)');
  };}
  function ofuda(c,glyph){
    const p=c=>{c.beginPath();c.rect(-3.4,-6,6.8,12);};
    c.save();c.shadowColor=RC.purple;c.shadowBlur=3*S;c.fillStyle='rgba(181,124,255,.7)';p(c);c.fill();c.restore();
    cel(c,p,RC.paper,RC.paperS,null,.4,.8);
    c.save();c.shadowColor=RC.purple;c.shadowBlur=1.5*S;
    line(c,[0,-4.4,0,4.4],.7,'#7A3FD0');line(c,[-2,-2.2,2,-2.2],.6,'#7A3FD0');line(c,[-2,1.4,0,-.2,2,1.4],.6,'#7A3FD0');if(glyph)line(c,[-1.6,3.4,1.6,3.4],.5,'#7A3FD0');c.restore();
    c.fillStyle='#7A3FD0';c.fillRect(-3.4,-6,6.8,1.1);c.fillRect(-3.4,4.9,6.8,1.1);
  }
  defs.rift_caster={name:'Rift Caster',len:{th:17,sh:18,ft:3,to:23,hd:10,ua:12,fa:11},
    parts:{
      thigh:{b:[-7,-6,7,21],d(c){cel(c,c=>capsule(c,9,7.6,17),RC.robe,RC.robeS,RC.robeL,1.2);}},
      shin:{b:[-6,-5,6,21],d(c){cel(c,c=>capsule(c,7,5.6,18),RC.robeS,'#160D28',RC.robeL,1);c.save();capsule(c,7,5.6,18);c.clip();for(let y=8;y<18;y+=2.4)line(c,[-4,y,4,y+1.2],.6,'#4A3270');c.restore();}},
      foot:{b:[-5,-5,10,5],d(c){cel(c,footPath(7.6,3.2),'#1C122E','#0E0818',RC.robeL,.5,1.1);}},
      uarm:{b:[-8,-5,8,17],d(c){cel(c,c=>{c.beginPath();c.moveTo(-4,-2);c.lineTo(4.2,-2);c.lineTo(6.4,12.6);c.quadraticCurveTo(0,14.6,-6,12.6);c.closePath();},RC.robe,RC.robeS,RC.robeL,1,1.3);
        c.fillStyle=RC.gold;c.fillRect(-6.2,11.2,12.6,1.2);}},
      farm:{b:[-8,-4,8,15],d(c){cel(c,c=>{c.beginPath();c.moveTo(-3.6,-1);c.lineTo(3.8,-1);c.lineTo(6.8,10.6);c.quadraticCurveTo(0,12.4,-6.4,10.6);c.closePath();},RC.robe,RC.robeS,RC.robeL,.9,1.3);
        cel(c,c=>{c.beginPath();c.moveTo(-6.6,9.6);c.quadraticCurveTo(0,11.6,6.8,9.6);c.lineTo(6.8,11.6);c.quadraticCurveTo(0,13.4,-6.6,11.6);c.closePath();},RC.gold,RC.goldS,null,.3,.9);}},
      hand:{b:[-5,-5,5,7],d(c){cel(c,c=>{c.beginPath();c.ellipse(0,1.4,2.8,3.6,0,0,Math.PI*2);},RC.skin,RC.skinS,null,.4,1);line(c,[-1.4,3.6,-1.6,5.4],.5,INK);line(c,[.2,4,.1,5.8],.5,INK);line(c,[1.6,3.6,1.8,5.2],.5,INK);}},
      torso:{b:[-13,-30,13,5],d(c){const body=torsoPath(16,18,24);cel(c,body,RC.robe,RC.robeS,RC.robeL,1.4,1.4);
        c.save();body(c);c.clip();
        cel(c,c=>{c.beginPath();c.moveTo(-12,-25);c.lineTo(12,-25);c.lineTo(11,-15);c.quadraticCurveTo(0,-11,-11,-15);c.closePath();},RC.hood,RC.hoodS,RC.hoodL,1,1.3);
        line(c,[-6,-14,6,-4],1.4,RC.gold);line(c,[6,-14,-6,-4],1.4,RC.gold);
        c.fillStyle=RC.gold;c.fillRect(-12,-5.6,24,3);c.fillStyle=RC.goldS;c.fillRect(-12,-3.2,24,.8);
        c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(-1,-4.4);c.lineTo(2,-4.4);c.lineTo(3,4);c.lineTo(-2,4);c.closePath();},RC.gold,RC.goldS,null,.3,.9);}},
      ofuda:{b:[-6,-9,6,9],d(c){ofuda(c,true);}},
      sigil:{b:[-24,-8,24,8],d(c){c.save();c.scale(1,.32);c.shadowColor=RC.purple;c.shadowBlur=4*S;c.strokeStyle='rgba(214,168,255,.95)';c.lineWidth=1.6;
        c.beginPath();c.arc(0,0,20,0,Math.PI*2);c.stroke();c.lineWidth=1;c.beginPath();c.arc(0,0,14,0,Math.PI*2);c.stroke();
        for(let i=0;i<6;i++){const a=i/6*Math.PI*2;c.beginPath();c.moveTo(Math.cos(a)*14,Math.sin(a)*14);c.lineTo(Math.cos(a+2.1)*14,Math.sin(a+2.1)*14);c.stroke();}c.restore();}},
      head_idle:{b:[-16,-19,16,16],d:rcHead('idle')},head_attack:{b:[-16,-19,16,16],d:rcHead('attack')},
      head_hurt:{b:[-16,-19,16,16],d:rcHead('hurt')},head_blink:{b:[-16,-19,16,16],d:rcHead('blink')}
    },
    poses:{
      stand:{lean:.1,fl1:.3,fl2:-.35,bl1:-.3,bl2:-.2,fa1:.7,fa2:.5,ba1:-.5,ba2:.7},
      cast:{lean:.2,fa1:1.6,fa2:-.1,ba1:1.2,ba2:.5},jabW:{fa1:.4,fa2:1.4},jab:{lean:.3,fa1:1.6,fa2:0},cross:{lean:.35,ba1:1.6,ba2:0,fa1:.4,fa2:1.2},
      jump:{fa1:1.8,fa2:.6,ba1:-1,ba2:.6},fall:{fa1:1.2,fa2:.6,ba1:-1,ba2:.6}
    },
    idle:(t)=>{const b=Math.sin(t*2.6);return {lean:.1+b*.02,fl1:.3,fl2:-.35,bl1:-.3,bl2:-.2,fa1:.7+b*.05,fa2:.5,ba1:-.5-b*.05,ba2:.7};},
    run:(ph)=>({lean:.25,fa1:.2+Math.sin(ph)*.2,fa2:.6,ba1:-.2-Math.sin(ph)*.2,ba2:.6}),
    render(c,f,t,j,m){casterRender(c,f,t,j,m,false);}
  };
  /* the Mighty Vanguard slot flies (50x44 hitbox): same caster, seated in mid-air on a rift sigil */
  defs.rift_caster_float={name:'Rift Caster (levitating)',texOf:'rift_caster',hipY:-14,len:defs.rift_caster.len,
    parts:defs.rift_caster.parts,
    poses:{stand:{lean:.08,fl1:1.45,fl2:-2.85,bl1:1.25,bl2:-2.7,fa1:.9,fa2:.4,ba1:.3,ba2:.6},
      cast:{lean:.15,fl1:1.45,fl2:-2.85,bl1:1.25,bl2:-2.7,fa1:1.65,fa2:-.1,ba1:1.2,ba2:.5},
      hurt:{lean:-.4,ht:-.3,fl1:1.2,fl2:-2.4,bl1:1,bl2:-2.2,fa1:2.3,fa2:.5,ba1:-1.3,ba2:.5},
      dizzy:{lean:-.1,fl1:1.45,fl2:-2.85,bl1:1.25,bl2:-2.7,fa1:.2,fa2:.3,ba1:-.2,ba2:.3},
      jump:{lean:.08,fl1:1.45,fl2:-2.85,bl1:1.25,bl2:-2.7,fa1:.9,fa2:.4,ba1:.3,ba2:.6},fall:{lean:.08,fl1:1.45,fl2:-2.85,bl1:1.25,bl2:-2.7,fa1:.9,fa2:.4,ba1:.3,ba2:.6}},
    idle:(t)=>{const b=Math.sin(t*2);return {lean:.08,fl1:1.45,fl2:-2.85,bl1:1.25,bl2:-2.7,fa1:.9+b*.05,fa2:.4,ba1:.3,ba2:.6};},
    render(c,f,t,j,m){casterRender(c,f,t,j,m,true);}
  };
  function casterRender(c,f,t,j,m,float){
    const id='rift_caster',fid=f.id||0;
    if(float&&!silent(m)){c.save();c.globalAlpha=.32+.12*Math.sin(t*3+fid);part(c,id,'sigil',0,-2+Math.sin(t*2)*1,0,m);c.restore();}
    const orb=[0,1,2].map(i=>{const a=t*1.6+i*2.09+fid;return {x:Math.cos(a)*20,y:-62+Math.sin(a*1.3)*4+(float?16:0),a,back:Math.sin(a)<0};});
    const talis=(back)=>{if(silent(m)&&m!=='void')return;orb.forEach(o=>{if(o.back!==back)return;c.save();c.globalAlpha=back?.55:1;part(c,id,'ofuda',o.x,o.y,Math.sin(o.a)*.4,m,.8);c.restore();});};
    talis(true);
    rig(c,f,t,j,m,id,{eyes:[[4.6,-1],[9.2,-1.2]],
      beforeTorso(){if(!float){skirt(c,j,j.bT,mc(RC.robeS,m),mc(RC.goldS,m),m,false,false);}},
      afterLegs(){if(!float)skirt(c,j,j.fT,mc(RC.robe,m),mc(RC.gold,m),m,true,false);
        else{const A=tl(j,-9,-1.8),B=tl(j,9.6,-1.8);c.save();c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.quadraticCurveTo(B[0]+8,B[1]+6,B[0]+6,B[1]+11);c.quadraticCurveTo(0,j.hy+15,A[0]-4,A[1]+10);c.closePath();
          c.lineWidth=2.6;c.strokeStyle=silent(m)?mc(RC.robe,m):INK;c.stroke();c.fillStyle=mc(RC.robe,m);c.fill();c.restore();}}});
    /* orbiting talismans; one is held out in the casting hand */
    talis(false);
    if(f.wind>0||f.castT>0||f.punchT>0){const p=along(j.fW,j.fF,5);c.save();c.globalAlpha=.9;part(c,id,'ofuda',p[0],p[1],-j.fF+1.57,m);c.restore();}
    fistTrail(f,j);
  }

  /* =================================================================
     MECHA SENTINEL  (white-and-black guardian mech with blue energy panels)
     authored for 100 units (46x100 heavy); scaled for the 86x110 boss
     ================================================================= */
  const MS={w:'#E4E2F0',wS:'#A9A6C2',wL:'#FFFFFF',d:'#23253A',dS:'#121322',dL:'#4E5274',blue:'#3FA9FF',blueG:'#8FD8FF',org:'#FF9A3C'};
  function msGlow(c,pts,w){glowLine(c,pts,w||.9,MS.blueG,3);}
  function msHead(kind){return function(c){
    cel(c,c=>capsule(c,6,5.6,8),MS.d,MS.dS,MS.dL,.6,1.2);
    cel(c,c=>{c.beginPath();c.moveTo(-7,-6);c.lineTo(-11,-17);c.lineTo(-2,-9);c.closePath();},MS.w,MS.wS,MS.wL,.5,1.2);
    cel(c,c=>{c.beginPath();c.moveTo(3,-9);c.lineTo(9,-19);c.lineTo(8.6,-6);c.closePath();},MS.w,MS.wS,MS.wL,.5,1.2);
    const hd=c=>{c.beginPath();c.moveTo(-9.4,4);c.lineTo(-10,-5);c.quadraticCurveTo(-7,-11.6,1,-11.6);c.quadraticCurveTo(9.6,-11,11.4,-3.6);c.lineTo(12.4,3.6);c.lineTo(9.6,9.4);c.lineTo(2,10.6);c.lineTo(-6,9);c.closePath();};
    cel(c,hd,MS.w,MS.wS,MS.wL,1.2,1.5);
    cel(c,c=>{c.beginPath();c.moveTo(1,-3.6);c.lineTo(12.4,-2.8);c.lineTo(12.2,3);c.lineTo(1.6,3.2);c.closePath();},MS.d,MS.dS,null,.3,1);
    const on=kind==='hurt'?'#FF9AA8':MS.blueG,h=kind==='blink'?.3:kind==='attack'?1.6:1.1;
    c.save();c.shadowColor=on;c.shadowBlur=3*S;c.fillStyle=on;c.fillRect(3,-.2-h/2,8.6,h);c.restore();
    line(c,[-6,-2,-2,-2],.7,MS.wS);line(c,[-7,3,-1,3],.7,MS.wS);
    c.fillStyle=MS.org;c.fillRect(-4.6,-8.6,3,1.4);
  };}
  defs.mecha_sentinel={name:'Mecha Sentinel',baseH:100,len:{th:21,sh:22,ft:4.6,to:30,hd:11.5,ua:16,fa:16},
    parts:{
      thigh:{b:[-10,-7,10,26],d(c){cel(c,c=>capsule(c,11,9,21),MS.d,MS.dS,MS.dL,1.2,1.4);
        cel(c,c=>{c.beginPath();c.moveTo(-6.4,-3);c.lineTo(7.4,-3);c.lineTo(6.6,15);c.lineTo(-5,16.6);c.closePath();},MS.w,MS.wS,MS.wL,1.2,1.4);msGlow(c,[3.6,1,3,12]);}},
      shin:{b:[-9,-6,9,26],d(c){cel(c,c=>capsule(c,9,8,22),MS.d,MS.dS,MS.dL,1,1.3);
        cel(c,c=>{c.beginPath();c.moveTo(-6,-1);c.lineTo(7.6,-2);c.lineTo(7,19);c.lineTo(-4.6,19.6);c.closePath();},MS.w,MS.wS,MS.wL,1.2,1.4);
        cel(c,c=>{c.beginPath();c.rect(1.4,3,3.6,10);},MS.blue,'#1D6FB8',null,.3,.9);msGlow(c,[3.2,4,3.2,12],.7);}},
      foot:{b:[-7,-7,14,6],d(c){cel(c,footPath(12,5),MS.w,MS.wS,MS.wL,1,1.4);c.fillStyle=MS.d;c.fillRect(-5,2.2,17,2);line(c,[5,-3.6,6,2],.6,INK);}},
      uarm:{b:[-8,-6,8,20],d(c){cel(c,c=>capsule(c,10,9,16),MS.d,MS.dS,MS.dL,1,1.3);c.save();capsule(c,10,9,16);c.clip();for(let y=3;y<16;y+=3)line(c,[-5,y,5,y],.6,MS.dL);c.restore();}},
      farm:{b:[-9,-5,9,20],d(c){cel(c,c=>{c.beginPath();c.moveTo(-6,-1);c.lineTo(6.4,-1);c.lineTo(7.4,16);c.lineTo(-6.6,16);c.closePath();},MS.w,MS.wS,MS.wL,1.2,1.4);
        cel(c,c=>{c.beginPath();c.rect(-2.4,3,4.8,9);},MS.blue,'#1D6FB8',null,.3,.9);msGlow(c,[0,4,0,11]);}},
      hand:{b:[-7,-6,7,8],d(c){fist(c,5,MS.d,MS.dS,MS.dL,false);line(c,[-3,-1,3,-1],.8,MS.dL);line(c,[-3,1.6,3,1.6],.8,MS.dL);}},
      torso:{b:[-17,-36,17,6],d(c){const body=torsoPath(19,28,30);cel(c,body,MS.d,MS.dS,MS.dL,1.4,1.6);
        c.save();body(c);c.clip();
        cel(c,c=>{c.beginPath();c.moveTo(-14,-29);c.lineTo(14,-29);c.lineTo(11,-14);c.quadraticCurveTo(0,-9,-11,-14);c.closePath();},MS.w,MS.wS,MS.wL,1.2,1.4);
        for(let y=-8;y<1;y+=3.2){c.fillStyle=MS.dL;c.fillRect(-7,y,14,1.4);}
        c.restore();
        c.save();c.shadowColor=MS.blueG;c.shadowBlur=5*S;c.beginPath();c.arc(1.4,-20,4.2,0,Math.PI*2);c.fillStyle=MS.blue;c.fill();c.restore();
        c.beginPath();c.arc(1.4,-20,4.2,0,Math.PI*2);c.lineWidth=1.2;c.strokeStyle=INK;c.stroke();c.beginPath();c.arc(1.4,-20,2,0,Math.PI*2);c.fillStyle='#E6F7FF';c.fill();
        msGlow(c,[-9,-24,-4,-17],.7);msGlow(c,[11,-24,6.6,-17],.7);}},
      pauldron:{b:[-13,-10,13,13],d(c){
        cel(c,c=>{c.beginPath();c.moveTo(-11,-3);c.quadraticCurveTo(-6,-9.6,4,-9.4);c.quadraticCurveTo(12,-7,11.4,2);c.lineTo(9,9.6);c.lineTo(-9,9.6);c.closePath();},MS.w,MS.wS,MS.wL,1.4,1.5);
        cel(c,c=>{c.beginPath();c.rect(-3,-1,7.6,6);},MS.blue,'#1D6FB8',null,.3,.9);msGlow(c,[-1.6,2,3.4,2]);c.fillStyle=MS.org;c.fillRect(-8.6,5.6,4,1.6);}},
      head_idle:{b:[-14,-22,15,13],d:msHead('idle')},head_attack:{b:[-14,-22,15,13],d:msHead('attack')},
      head_hurt:{b:[-14,-22,15,13],d:msHead('hurt')},head_blink:{b:[-14,-22,15,13],d:msHead('blink')}
    },
    poses:{
      stand:{lean:.06,fl1:.5,fl2:-.5,bl1:-.45,bl2:-.3,fa1:.5,fa2:1.3,ba1:.2,ba2:1.4},
      finW:{lean:-.2,fa1:-.9,fa2:1.6,ba1:.9,ba2:1.6},fin:{lean:.5,fa1:1.62,fa2:-.05,ba1:-.8,ba2:.6,fl1:.75,fl2:-.6,bl1:-.9,bl2:0},
      dash:{lean:.55,fa1:1.4,fa2:.4,ba1:1.2,ba2:.6,fl1:.9,fl2:-1.2,bl1:-.8,bl2:-.4}
    },
    idle:(t)=>{const b=Math.sin(t*1.8);return {lean:.06,fl1:.5,fl2:-.5,bl1:-.45,bl2:-.3,fa1:.5+b*.02,fa2:1.3,ba1:.2,ba2:1.4+b*.03};},
    run:(ph)=>({lean:.2,fa1:.3+Math.sin(ph)*.35,fa2:1.2,ba1:.3-Math.sin(ph)*.35,ba2:1.2}),
    render(c,f,t,j,m){
      const id='mecha_sentinel';
      rig(c,f,t,j,m,id,{eyes:[[5,0],[10,0]]});
      if(!silent(m)&&(f.charging>0||f.slamming)){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<3;i++){const p=tl(j,-12-i*5,-16+i*3);c.globalAlpha=.5-i*.12;c.fillStyle=MS.blueG;c.beginPath();c.arc(p[0],p[1],4-i,0,Math.PI*2);c.fill();}c.restore();}
      fistTrail(f,j);
    }
  };

  /* =================================================================
     VOID STALKER  (hunched shadow beast wreathed in purple flame, long rift claws)
     ================================================================= */
  const VS={b:'#1C1030',bS:'#0B0614',bL:'#7B3FC4',glow:'#B57CFF',glowB:'#E7C6FF',claw:'#D9B8FF'};
  function vsHead(kind){return function(c){
    cel(c,c=>capsule(c,5,4.4,6),VS.b,VS.bS,null,.5,1.1);
    cel(c,c=>{c.beginPath();c.moveTo(-6,-5);c.lineTo(-9,-15);c.lineTo(-1,-8);c.closePath();},VS.b,VS.bS,VS.bL,.5,1.2);
    cel(c,c=>{c.beginPath();c.moveTo(1,-8);c.lineTo(5,-16);c.lineTo(6.6,-6);c.closePath();},VS.b,VS.bS,VS.bL,.5,1.2);
    const hd=c=>{c.beginPath();c.moveTo(-8,2);c.quadraticCurveTo(-8,-8,0,-8.4);c.quadraticCurveTo(7,-8,10,-3);c.lineTo(15,0);c.quadraticCurveTo(15.6,3,13,4.6);c.lineTo(7,7.4);c.quadraticCurveTo(0,9,-8,2);c.closePath();};
    cel(c,hd,VS.b,VS.bS,VS.bL,1,1.4);
    c.save();c.shadowColor=VS.glow;c.shadowBlur=3*S;c.fillStyle=kind==='hurt'?'#FFB0E0':VS.glowB;
    const h=kind==='blink'?.3:kind==='attack'?1.4:1;c.beginPath();c.moveTo(3,-3.4);c.lineTo(9,-2.2-h*.2);c.lineTo(8,-1+h);c.lineTo(3.4,-1.6+h*.6);c.closePath();c.fill();c.restore();
    if(kind==='attack'||kind==='hurt'){c.beginPath();c.moveTo(8,4.2);c.lineTo(14,2.4);c.lineTo(12.4,5);c.lineTo(8,6.4);c.closePath();c.fillStyle='#2A0A3A';c.fill();
      [[9.4,4.4],[11.6,3.6]].forEach(([x,y])=>{c.beginPath();c.moveTo(x,y);c.lineTo(x+.6,y+1.6);c.lineTo(x+1.2,y-.2);c.closePath();c.fillStyle='#F4EEFF';c.fill();});}
  };}
  defs.void_stalker={name:'Void Stalker',len:{th:16,sh:18,ft:4,to:22,hd:9,ua:15,fa:15},
    parts:{
      thigh:{b:[-8,-6,8,20],d(c){cel(c,c=>capsule(c,11,7,16),VS.b,VS.bS,VS.bL,1.2,1.4);}},
      shin:{b:[-6,-5,6,22],d(c){cel(c,c=>capsule(c,6.4,4.6,18),VS.b,VS.bS,VS.bL,.8,1.2);glowLine(c,[1.4,3,1,14],.6,VS.glow,2.5);}},
      foot:{b:[-5,-5,12,6],d(c){cel(c,footPath(8.6,3.4),VS.b,VS.bS,VS.bL,.5,1.1);c.save();c.shadowColor=VS.glow;c.shadowBlur=2*S;c.fillStyle=VS.claw;
        [[8,1],[6,2.2]].forEach(([x,y])=>{c.beginPath();c.moveTo(x,y-1.4);c.lineTo(x+3.6,y+1.4);c.lineTo(x,y+1);c.closePath();c.fill();});c.restore();}},
      uarm:{b:[-7,-6,7,19],d(c){cel(c,c=>capsule(c,9,7,15),VS.b,VS.bS,VS.bL,1,1.3);}},
      farm:{b:[-6,-4,6,19],d(c){cel(c,c=>capsule(c,7.4,5.4,15),VS.b,VS.bS,VS.bL,.8,1.2);glowLine(c,[1.6,2,-.4,7,1.2,12],.7,VS.glow,3);}},
      hand:{b:[-7,-5,8,19],d(c){
        c.save();c.shadowColor=VS.glow;c.shadowBlur=3*S;c.fillStyle=VS.claw;
        [[-2.6,-.5],[0,0],[2.6,.5]].forEach(([x,a])=>{c.beginPath();c.moveTo(x-1.1,1.6);c.quadraticCurveTo(x+a*2-1,10,x+a*4+1.6,17.4);c.quadraticCurveTo(x+a*2+1.2,9,x+1.1,1.6);c.closePath();c.fill();});c.restore();
        fist(c,3.4,VS.b,VS.bS,VS.bL,false);}},
      torso:{b:[-14,-28,13,6],d(c){const body=c=>{c.beginPath();c.moveTo(-7,2.5);c.lineTo(7,2.5);c.quadraticCurveTo(10,-10,8.6,-18);c.quadraticCurveTo(6,-24.4,0,-24);c.quadraticCurveTo(-9,-23,-11.6,-15);c.quadraticCurveTo(-11,-6,-7,2.5);c.closePath();};
        cel(c,body,VS.b,VS.bS,VS.bL,1.4,1.5);
        c.save();body(c);c.clip();c.shadowColor=VS.glow;c.shadowBlur=3*S;[[-2,-18,4,-16],[-3,-12,4,-10.6],[-2,-6.4,3.6,-5.2]].forEach(([a,b,cc,d])=>line(c,[a,b,(a+cc)/2,b-1.4,cc,d],.8,VS.glow));c.restore();
        c.save();c.globalAlpha=.9;[[-11,-15],[-8,-22],[-2,-24.6]].forEach(([x,y])=>{c.beginPath();c.moveTo(x-1.6,y+1.6);c.lineTo(x-3.6,y-3.4);c.lineTo(x+1.6,y);c.closePath();c.fillStyle=VS.bL;c.fill();c.lineWidth=.6;c.strokeStyle=INK;c.stroke();});c.restore();}},
      head_idle:{b:[-12,-18,18,11],d:vsHead('idle')},head_attack:{b:[-12,-18,18,11],d:vsHead('attack')},
      head_hurt:{b:[-12,-18,18,11],d:vsHead('hurt')},head_blink:{b:[-12,-18,18,11],d:vsHead('blink')}
    },
    poses:{
      stand:{lean:.85,ht:-.45,fl1:.95,fl2:-1.7,bl1:-.1,bl2:-1.3,fa1:.1,fa2:.35,ba1:-.3,ba2:.5},
      jabW:{lean:.6,ht:-.3,fa1:-.6,fa2:1.6,ba1:-.2,ba2:.8,fl1:1,fl2:-1.8,bl1:-.1,bl2:-1.3},
      jab:{lean:1,ht:-.5,fa1:1.7,fa2:.1,ba1:-.4,ba2:.4,fl1:.9,fl2:-1.1,bl1:-.7,bl2:-.5},
      cross:{lean:1,ht:-.5,ba1:1.6,ba2:.1,fa1:-.2,fa2:.5,fl1:.9,fl2:-1.1,bl1:-.7,bl2:-.5},
      jump:{lean:.9,ht:-.45,fa1:1.6,fa2:.3,ba1:1.3,ba2:.4,fl1:.2,fl2:-1.4,bl1:-.6,bl2:-1.2},fall:{lean:.6,ht:-.3,fa1:1,fa2:.5,ba1:.7,ba2:.5,fl1:.7,fl2:-1.2,bl1:-.2,bl2:-1},
      guard:{lean:.7,ht:-.35,fa1:1.1,fa2:1.9,ba1:1,ba2:2},hurt:{lean:-.2,ht:-.1},dash:{lean:1.05,ht:-.55,fa1:1.4,fa2:.2,ba1:1.2,ba2:.3}
    },
    idle:(t)=>{const b=Math.sin(t*3.2);return {lean:.85+b*.03,ht:-.45,fl1:.95,fl2:-1.7,bl1:-.1,bl2:-1.3,fa1:.1+b*.05,fa2:.35,ba1:-.3-b*.05,ba2:.5};},
    run:(ph)=>({lean:1,ht:-.5,fa1:Math.sin(ph)*.9+.3,fa2:.3,ba1:-Math.sin(ph)*.9+.3,ba2:.3}),
    render(c,f,t,j,m){
      const id='void_stalker',fid=f.id||0;
      const tail=chain(f,'tail',7,4,tl(j,-6,-1),[-.95,-.2],{g:150,bias:800,damp:.86,fl:[650,4.4]});
      const w1=chain(f,'w1',5,4.4,tl(j,-6,-20),[-.6,-.8],{g:-200,bias:700,damp:.82,fl:[900,7]});
      const w2=chain(f,'w2',5,4,tl(j,0,-24),[-.4,-.9],{g:-220,bias:700,damp:.82,fl:[900,8]});
      if(!silent(m)){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.5+.2*Math.sin(t*9+fid);ribbon(c,w1,7,1,'rgba(155,80,240,.9)',m,true);ribbon(c,w2,6,1,'rgba(181,124,255,.9)',m,true);c.restore();}
      ribbon(c,tail,5,2.4,mc(VS.b,m),m,true);
      if(!silent(m)){c.save();c.globalCompositeOperation='lighter';const e=tail[tail.length-1];const g=c.createRadialGradient(e[0],e[1],0,e[0],e[1],6);g.addColorStop(0,'rgba(231,198,255,.9)');g.addColorStop(1,'rgba(181,124,255,0)');c.fillStyle=g;c.fillRect(e[0]-6,e[1]-6,12,12);c.restore();}
      rig(c,f,t,j,m,id,{eyes:[[6,-2.4],[8.4,-2]]});
      if(!silent(m))slash(c,f,t,'cl',along(j.fW,j.fF,17),along(j.fW,j.fF,4),'#B57CFF',f.punchT>0);
      f._hand=along(j.fW,j.fF,14);f._artSlash=true;
    }
  };

  /* =================================================================
     RIFT BEAST  (rift-corrupted wolf: flowing white mane, dark hide, red glowing collar plates,
     violet crystals). 100-unit design: 46x100 heavy, 86x130 boss; prowling 64x74 variant.
     ================================================================= */
  const RB={fur:'#2C2438',furS:'#16101F',furL:'#6E5A8C',mane:'#EDE8F6',maneS:'#B9AFCB',maneL:'#FFFFFF',purple:'#B57CFF',purpleB:'#E7C6FF',red:'#FF2E4D',redD:'#8E0F2C',
    crystal:'#C77DFF',crystalS:'#7A3FD0',claw:'#ECE6F6',plate:'#3A2F4A',plateS:'#221A2C'};
  function rbHead(kind){return function(c){
    cel(c,c=>capsule(c,9,8,8),RB.fur,RB.furS,null,.6,1.2);
    cel(c,c=>{c.beginPath();c.moveTo(-8,-6);c.lineTo(-10,-20);c.lineTo(-1,-10);c.closePath();},RB.fur,RB.furS,RB.furL,.6,1.3);
    cel(c,c=>{c.beginPath();c.moveTo(-6.8,-8);c.lineTo(-8.4,-16.6);c.lineTo(-3,-10);c.closePath();},RB.purple,'#7A3FD0',null,.3,.8);
    const open=kind==='attack'?3.6:kind==='hurt'?2.2:.6;
    const hd=c=>{c.beginPath();c.moveTo(-10,2);c.quadraticCurveTo(-10,-9,-1,-10.6);c.quadraticCurveTo(7,-10.6,10,-5.4);c.lineTo(20,-2.6);c.quadraticCurveTo(22.4,-1,21,1.2);c.lineTo(11,2.6);c.lineTo(9,4);c.quadraticCurveTo(0,9,-10,2);c.closePath();};
    /* lower jaw */
    cel(c,c=>{c.beginPath();c.moveTo(8,3);c.lineTo(19,1.4+open*.6);c.quadraticCurveTo(19.4,3.6+open,16,4.4+open);c.lineTo(7,7);c.closePath();},RB.fur,RB.furS,RB.furL,.5,1.2);
    if(open>1){c.beginPath();c.moveTo(9,3.4);c.lineTo(19,1.2);c.lineTo(18.6,1.6+open*.6);c.lineTo(9,5.4);c.closePath();c.fillStyle='#3A0B1E';c.fill();
      [[12,2.4],[15,1.8],[17.4,1.4]].forEach(([x,y])=>{c.beginPath();c.moveTo(x-.6,y);c.lineTo(x,y+1.8);c.lineTo(x+.6,y);c.closePath();c.fillStyle=RB.claw;c.fill();});}
    cel(c,hd,RB.fur,RB.furS,RB.furL,1.2,1.5);
    cel(c,c=>{c.beginPath();c.ellipse(20.4,-1.6,1.8,1.4,0,0,Math.PI*2);},'#0B0710','#000',null,.2,.8);
    line(c,[10,-5,17,-3],.7,'rgba(110,90,140,.8)');
    c.save();c.shadowColor=RB.purple;c.shadowBlur=3*S;c.fillStyle=kind==='hurt'?'#FFB0E0':RB.purpleB;
    const h=kind==='blink'?.3:kind==='attack'?1.5:1.1;c.beginPath();c.moveTo(3.4,-4.4);c.lineTo(9.6,-3.6);c.lineTo(8.6,-2.6+h);c.lineTo(3.8,-2.8+h*.8);c.closePath();c.fill();c.restore();
    c.save();c.shadowColor=RB.red;c.shadowBlur=2*S;line(c,[-4,4,0,6,4,5],.8,RB.red);c.restore();
  };}
  function rbMane(c,big){
    const p=c=>{c.beginPath();c.moveTo(4,-12);c.quadraticCurveTo(-8,-18,-16,-10);c.lineTo(-24,-12);c.lineTo(-19,-5);c.lineTo(-27,-2);c.lineTo(-19,2);c.lineTo(-25,9);c.lineTo(-16,8);c.lineTo(-18,16);c.lineTo(-10,11);c.lineTo(-8,19);c.lineTo(-3,11);c.lineTo(2,16);c.lineTo(3,6);c.quadraticCurveTo(8,-4,4,-12);c.closePath();};
    cel(c,p,RB.mane,RB.maneS,RB.maneL,1.3,1.5);
    c.save();p(c);c.clip();c.strokeStyle='rgba(150,140,175,.7)';c.lineWidth=.7;[[-2,-8,-14,-4],[-4,-2,-18,2],[-3,4,-14,10],[0,-12,-10,-11]].forEach(([a,b,cc,d])=>{c.beginPath();c.moveTo(a,b);c.quadraticCurveTo((a+cc)/2,b-2,cc,d);c.stroke();});c.restore();
  }
  defs.rift_beast={name:'Rift Beast',baseH:100,len:{th:22,sh:24,ft:5,to:29,hd:12,ua:20,fa:19},
    parts:{
      thigh:{b:[-11,-7,11,27],d(c){cel(c,c=>capsule(c,16,10,22),RB.fur,RB.furS,RB.furL,1.4,1.5);
        c.save();capsule(c,16,10,22);c.clip();line(c,[-4,4,-1,10,-4,16],.8,'rgba(110,90,140,.8)');c.restore();}},
      shin:{b:[-7,-5,7,27],d(c){cel(c,c=>capsule(c,8.6,6,24),RB.fur,RB.furS,RB.furL,1,1.3);
        cel(c,c=>{c.beginPath();c.moveTo(-1,0);c.quadraticCurveTo(6.6,2,5,14);c.lineTo(1,14);c.closePath();},RB.plate,RB.plateS,RB.furL,.6,1.1);glowLine(c,[2.4,2,2.6,12],.7,RB.red,2.5);}},
      foot:{b:[-6,-6,15,6],d(c){cel(c,footPath(10,4.4),RB.fur,RB.furS,RB.furL,.8,1.2);c.fillStyle=RB.claw;
        [[10,1],[8,2.6],[5.6,3]].forEach(([x,y])=>{c.beginPath();c.moveTo(x-1,y-1.6);c.lineTo(x+3.6,y+1.4);c.lineTo(x-.6,y+1.2);c.closePath();c.fill();c.lineWidth=.5;c.strokeStyle=INK;c.stroke();});}},
      uarm:{b:[-10,-7,10,24],d(c){cel(c,c=>capsule(c,14.6,11,20),RB.fur,RB.furS,RB.furL,1.4,1.5);
        cel(c,c=>{c.beginPath();c.moveTo(-6,-4);c.quadraticCurveTo(-12,-1,-11,8);c.quadraticCurveTo(-7,4,-4,9);c.quadraticCurveTo(-3,3,-6,-4);c.closePath();},RB.mane,RB.maneS,null,.5,1.1);}},
      farm:{b:[-8,-5,8,23],d(c){cel(c,c=>capsule(c,11,9,19),RB.fur,RB.furS,RB.furL,1.1,1.4);
        cel(c,c=>{c.beginPath();c.moveTo(-5.6,6);c.lineTo(5.8,6);c.lineTo(5.2,15);c.lineTo(-5,15);c.closePath();},RB.plate,RB.plateS,RB.furL,.6,1.2);glowLine(c,[-3,10.4,3,10.4],.8,RB.red,3);}},
      hand:{b:[-8,-6,9,14],d(c){c.fillStyle=RB.claw;
        [[-3.4,-.4],[0,0],[3.4,.4]].forEach(([x,a])=>{c.beginPath();c.moveTo(x-1.4,2);c.quadraticCurveTo(x+a*3,8,x+a*5+1.4,12.4);c.quadraticCurveTo(x+a*3+1.4,7,x+1.4,2);c.closePath();c.fill();c.lineWidth=.6;c.strokeStyle=INK;c.stroke();});
        fist(c,5,RB.fur,RB.furS,RB.furL,false);}},
      torso:{b:[-19,-36,17,6],d(c){const body=c=>{c.beginPath();c.moveTo(-10,2.5);c.lineTo(9,2.5);c.quadraticCurveTo(13,-10,13,-20);c.quadraticCurveTo(12,-29.4,3,-30.6);c.lineTo(-6,-30.6);c.quadraticCurveTo(-16,-29,-16.6,-18);c.quadraticCurveTo(-15,-6,-10,2.5);c.closePath();};
        cel(c,body,RB.fur,RB.furS,RB.furL,1.6,1.6);
        c.save();body(c);c.clip();
        cel(c,c=>{c.beginPath();c.moveTo(-6,-30);c.quadraticCurveTo(6,-31,13,-22);c.lineTo(12,-15);c.quadraticCurveTo(3,-19,-5,-20);c.closePath();},RB.plate,RB.plateS,RB.furL,.8,1.2);
        c.shadowColor=RB.red;c.shadowBlur=3*S;line(c,[-4,-21,4,-19.4,11,-15.6],1.1,RB.red);line(c,[2,-27,6,-24,4,-21],.8,RB.red);c.shadowBlur=0;
        c.strokeStyle='rgba(110,90,140,.8)';c.lineWidth=.8;[[-4,-10,6,-8],[-5,-5,5,-3]].forEach(([a,b,cc,d])=>{c.beginPath();c.moveTo(a,b);c.quadraticCurveTo((a+cc)/2,b+1.6,cc,d);c.stroke();});
        c.restore();}},
      crystal:{b:[-6,-15,6,3],d(c){c.save();c.shadowColor=RB.purple;c.shadowBlur=3*S;
        cel(c,c=>{c.beginPath();c.moveTo(-3.4,2);c.lineTo(-1.6,-12);c.lineTo(.4,-14);c.lineTo(3.2,2);c.closePath();},RB.crystal,RB.crystalS,'#F4DDFF',.6,1.1);c.restore();
        line(c,[-.6,-11,.6,0],.5,'rgba(255,255,255,.7)');}},
      maneB:{b:[-29,-21,7,22],d(c){rbMane(c,true);}},
      head_idle:{b:[-13,-23,25,14],d:rbHead('idle')},head_attack:{b:[-13,-23,25,14],d:rbHead('attack')},
      head_hurt:{b:[-13,-23,25,14],d:rbHead('hurt')},head_blink:{b:[-13,-23,25,14],d:rbHead('blink')}
    },
    poses:{
      stand:{lean:.42,ht:-.35,fl1:.7,fl2:-1.3,bl1:-.4,bl2:-.9,fa1:.4,fa2:.6,ba1:.1,ba2:.7},
      finW:{lean:.05,ht:-.1,fa1:2.6,fa2:.6,ba1:.9,ba2:1.2,fl1:.7,fl2:-1.2,bl1:-.5,bl2:-.8},
      fin:{lean:.75,ht:-.6,fa1:1.1,fa2:-.1,ba1:-.6,ba2:.6,fl1:.9,fl2:-.8,bl1:-.9,bl2:-.2},
      jabW:{lean:.2,fa1:-.4,fa2:1.4},jab:{lean:.65,ht:-.5,fa1:1.5,fa2:0},cross:{lean:.65,ht:-.5,ba1:1.5,ba2:0,fa1:.2,fa2:.8},
      dash:{lean:1.1,ht:-.6,fa1:.3,fa2:.2,ba1:-.4,ba2:.4,fl1:.9,fl2:-1.4,bl1:-.9,bl2:-.6},
      jump:{lean:.5,ht:-.4,fa1:2.2,fa2:.4,ba1:1.6,ba2:.6,fl1:.6,fl2:-1.8,bl1:-.5,bl2:-1.4},fall:{lean:.3,ht:-.2,fa1:1.6,fa2:.6,ba1:1,ba2:.6},
      hurt:{lean:-.3,ht:-.2},guard:{lean:.3,fa1:1.1,fa2:1.9,ba1:1,ba2:2}
    },
    idle:(t)=>{const b=Math.sin(t*2.4);return {lean:.42+b*.03,ht:-.35,fl1:.7,fl2:-1.3,bl1:-.4,bl2:-.9,fa1:.4+b*.04,fa2:.6,ba1:.1,ba2:.7};},
    run:(ph)=>({lean:.8,ht:-.65,fa1:Math.sin(ph)*.9+.3,fa2:.4,ba1:-Math.sin(ph)*.9+.3,ba2:.4}),
    render(c,f,t,j,m){beastRender(c,f,t,j,m);}
  };
  /* prowling on all fours for the wide 64x74 heavy slot */
  const prowl=(o)=>Object.assign({lean:1.22,ht:-.62,fl1:.95,fl2:-1.75,bl1:.1,bl2:-1.35,fa1:-.15,fa2:.05,ba1:.2,ba2:-.05},o||{});
  defs.rift_beast_prowl={name:'Rift Beast (prowling)',texOf:'rift_beast',baseH:74,len:defs.rift_beast.len,parts:defs.rift_beast.parts,
    poses:{stand:prowl(),jabW:prowl({lean:1,ht:-.5,fa1:-.9,fa2:1.4}),jab:prowl({fa1:1.4,fa2:0}),cross:prowl({ba1:1.4,ba2:0}),finW:prowl({lean:.85,ht:-.42,fa1:1.9,fa2:.8}),fin:prowl({fa1:.9,fa2:-.1}),
      dash:prowl({fa1:.9,fa2:.1,ba1:-.7,ba2:.2,bl1:-.8,bl2:-.6}),jump:prowl({fa1:1.4,fa2:.2,ba1:1.1,ba2:.2,fl1:.4,fl2:-1.6,bl1:-.7,bl2:-1}),fall:prowl({fa1:.9,fa2:.2,ba1:.6,ba2:.2}),
      hurt:prowl({lean:.6,ht:-.4,fa1:1.8,fa2:.4,ba1:-.6,ba2:.4}),dizzy:prowl({lean:.9}),guard:prowl({lean:.9,fa1:1,fa2:1.6,ba1:.9,ba2:1.7})},
    idle:(t)=>{const b=Math.sin(t*2.6);return prowl({lean:1.22+b*.03,fa1:-.15+b*.04,ba1:.2-b*.04});},
    run:(ph)=>prowl({fa1:Math.sin(ph)*.7-.1,fa2:.2,ba1:-Math.sin(ph)*.7-.1,ba2:.2,fl1:.95-Math.sin(ph)*.5,bl1:.1+Math.sin(ph)*.5}),
    render(c,f,t,j,m){beastRender(c,f,t,j,m);}
  };
  function beastRender(c,f,t,j,m){
    const id='rift_beast',fid=f.id||0;
    const tail=chain(f,'tail',7,5,tl(j,-11,-2),[-.9,.1],{g:200,bias:700,damp:.86,fl:[500,3.6]});
    ribbon(c,tail,8,4,mc(RB.fur,m),m,true);ribbon(c,tail.slice(-3),6,5,mc(RB.mane,m),m,true);
    const strands=[0,1,2].map(i=>chain(f,'m'+i,6,4.6,hl(j,-8,-4+i*5),[-.92,.3+i*.12],{g:260,bias:820,damp:.86,fl:[520,4+i*.7]}));
    strands.forEach((s,i)=>ribbon(c,s,7-i,1.2,mc(i%2?RB.maneS:RB.mane,m),m,true));
    rig(c,f,t,j,m,id,{eyes:[[6.4,-3.4],[8.6,-3]],
      beforeTorso(){[[-12,-20,-.5],[-8,-27,-.25],[-2,-30,0]].forEach(([x,y,a],i)=>{const p=tl(j,x,y);part(c,id,'crystal',p[0],p[1],-j.lean-a,m,1-i*.1);});},
      afterLegs(){part(c,id,'maneB',j.head[0],j.head[1],-j.ha,m,1.22);}});
    if(!silent(m)){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<4;i++){const ph=(t*.8+i*.25+fid*.13)%1;const b=tl(j,-12+i*5,-28);c.globalAlpha=(1-ph)*.6;c.fillStyle='#C77DFF';
      c.beginPath();c.arc(b[0]-ph*10,b[1]-ph*18,1.3*(1-ph)+.3,0,Math.PI*2);c.fill();}c.restore();
      slash(c,f,t,'cl',along(j.fW,j.fF,13),along(j.fW,j.fF,2),'#C77DFF',f.punchT>0||f.charging>0);}
    f._hand=along(j.fW,j.fF,11);f._artSlash=true;
  }
