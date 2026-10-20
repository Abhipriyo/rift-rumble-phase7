  /* =================================================================
     KI FIGHTERS
     ================================================================= */
  function smirk(c,kind,col){
    if(kind==='attack'){c.beginPath();c.moveTo(5.6,7);c.lineTo(9.2,6.6);c.lineTo(8.6,8.8);c.lineTo(6,8.8);c.closePath();c.fillStyle='#4A0F1A';c.fill();c.lineWidth=.6;c.strokeStyle=INK;c.stroke();c.fillStyle='#FFFFFF';c.fillRect(6,7,3,.6);}
    else if(kind==='hurt')line(c,[5.8,7.8,6.8,7.1,7.8,7.8,8.8,7.1],.7,INK);
    else{c.beginPath();c.moveTo(6,7.4);c.quadraticCurveTo(7.6,7.9,9,6.7);c.lineWidth=.75;c.strokeStyle=col||'#6A2A2A';c.stroke();}
  }
  function bolt(c,x0,y0,x1,y1,seed,col){const n=5;const pts=[x0,y0];for(let i=1;i<n;i++){const k=i/n;pts.push(x0+(x1-x0)*k+Math.sin(seed*7.3+i*2.1)*2.4,y0+(y1-y0)*k+Math.cos(seed*5.1+i*1.7)*2.4);}pts.push(x1,y1);
    c.save();c.shadowColor=col;c.shadowBlur=8;line(c,pts,1.6,col);line(c,pts,.6,'#FFFFFF');c.restore();}

  /* ---------- KENJI KABOOM (brawler) ---------- */
  const KK={skin:'#EDB98E',skinS:'#C98962',hair:'#1A1420',hairS:'#0C090F',hairL:'#56466C',red:'#E8283C',redS:'#A0121F',redL:'#FF7A6A',
    gi:'#26202A',giS:'#141016',giL:'#5C5066',vest:'#CFC9D6',vestS:'#948CA2',wrap:'#F1E8DA',wrapS:'#C2B5A2',glove:'#1E1A22',metal:'#B8BCCB',metalS:'#7A7F94',pants:'#2E1C22',pantsS:'#170D11',pantsL:'#6A4652'};
  function kkHead(kind){return function(c){
    cel(c,c=>capsule(c,5,4.6,7.5),KK.skin,KK.skinS,null,.6,1.2);
    faceShape(c,KK.skin,KK.skinS);
    eyes(c,kind,{iris:'#C0392B',irisD:'#3A0A08',irisL:'#FF8A6A',stern:true,brow:INK});
    line(c,[10.1,3.4,9.5,4.7],.6,INK);smirk(c,kind);
  };}
  defs.kenji_kaboom={name:'Kenji Kaboom',len:{th:18,sh:18,ft:3.4,to:24,hd:10.5,ua:12,fa:12},
    parts:{
      thigh:{b:[-7,-6,7,23],d(c){cel(c,c=>capsule(c,10,7.8,18),KK.pants,KK.pantsS,KK.pantsL,1.3);line(c,[2.4,2,1.6,16],.6,'rgba(150,100,120,.45)');}},
      shin:{b:[-7,-5,7,22],d(c){cel(c,c=>capsule(c,8,6.4,18),KK.pants,KK.pantsS,KK.pantsL,1.1);
        c.save();capsule(c,8,6.4,18);c.clip();c.fillStyle=KK.wrap;c.fillRect(-5,11,10,8);for(let y=11.6;y<19;y+=2)line(c,[-4,y,4,y+1.2],.5,KK.wrapS);c.restore();
        c.save();capsule(c,8,6.4,18);c.lineWidth=1.2;c.strokeStyle=INK;c.stroke();c.restore();}},
      foot:{b:[-5,-5,10,5],d(c){cel(c,footPath(8,3.4),KK.glove,'#0C0A0E',KK.giL,.6,1.1);c.fillStyle=KK.red;c.fillRect(-3.8,2,12,1.2);}},
      uarm:{b:[-6,-5,6,15],d(c){cel(c,c=>capsule(c,8.6,7.4,12),KK.skin,KK.skinS,'#FFE0C4',1,1.3);
        line(c,[-1.4,4,1.8,6.6],.6,'rgba(150,90,60,.6)');
        cel(c,c=>{c.beginPath();c.rect(-4.4,1.4,8.8,2.4);},KK.red,KK.redS,null,.3,.9);}},
      farm:{b:[-5,-4,5,15],d(c){cel(c,c=>capsule(c,7,6,12),KK.skin,KK.skinS,null,.8,1.2);
        c.save();capsule(c,7,6,12);c.clip();c.fillStyle=KK.wrap;c.fillRect(-4,3,8,6);for(let y=3.4;y<9;y+=1.8)line(c,[-3.6,y,3.6,y+1],.45,KK.wrapS);c.restore();
        cel(c,c=>{c.beginPath();c.rect(-3.6,8.6,7.2,2.6);},KK.metal,KK.metalS,'#FFFFFF',.3,1);}},
      hand:{b:[-5,-5,5,6],d(c){fist(c,3.7,KK.glove,'#0C0A0E',KK.giL);c.beginPath();c.arc(1.8,-.6,1.3,0,Math.PI*2);c.fillStyle=KK.skin;c.fill();}},
      torso:{b:[-13,-30,13,5],d(c){const body=torsoPath(16,19,24.6);cel(c,body,KK.gi,KK.giS,KK.giL,1.5,1.5);
        c.save();body(c);c.clip();
        c.beginPath();c.moveTo(-3,-25);c.lineTo(5.6,-25);c.lineTo(1.6,-12);c.closePath();c.fillStyle=KK.skin;c.fill();line(c,[-3,-25,1.6,-12,5.6,-25],.9,KK.giS);
        line(c,[-.4,-22,2.6,-22.4],.5,'rgba(150,90,60,.6)');
        c.fillStyle=KK.red;c.fillRect(-12,-8,25,4.6);c.fillStyle=KK.redS;c.fillRect(-12,-4.4,25,1);line(c,[-12,-8,13,-8],.6,KK.redL);
        c.restore();
        /* hood bunched on the shoulders */
        cel(c,c=>{c.beginPath();c.moveTo(-10.6,-21);c.quadraticCurveTo(-9,-28.6,-1,-27.8);c.lineTo(-3,-24);c.quadraticCurveTo(-7.6,-24,-8,-18.6);c.closePath();},KK.vest,KK.vestS,'#FFFFFF',.8,1.2);
        cel(c,c=>{c.beginPath();c.moveTo(1.6,-5.6);c.lineTo(6,-5.6);c.lineTo(5.2,1.4);c.lineTo(2.4,.6);c.closePath();},KK.red,KK.redS,null,.3,1);}},
      hairB:{b:[-22,-21,10,12],d(c){
        const p=c=>{c.beginPath();c.moveTo(6,-11);c.quadraticCurveTo(0,-14,-4,-12.4);c.lineTo(-6,-19.4);c.lineTo(-8.6,-12.6);c.lineTo(-15.6,-17);c.lineTo(-12.6,-9.4);c.lineTo(-20.4,-8.4);c.lineTo(-13.4,-3.6);c.lineTo(-19,2.6);c.lineTo(-11.6,1.4);c.lineTo(-13,8);c.lineTo(-7,3.6);c.lineTo(-2,6);c.quadraticCurveTo(2,-4,6,-11);c.closePath();};
        cel(c,p,KK.hair,KK.hairS,KK.hairL,1.2,1.4);
        c.save();p(c);c.clip();c.fillStyle=KK.red;[[-6,-19.4,-7.6,-15.4,-5.2,-15.6],[-15.6,-17,-14,-13.6,-12.6,-15.4],[-20.4,-8.4,-16.4,-7.6,-17.4,-5.4],[-19,2.6,-15.6,.4,-16,2.8],[-13,8,-11.6,4.6,-10.6,6.4]].forEach(a=>{c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(a[2],a[3]);c.lineTo(a[4],a[5]);c.closePath();c.fill();});c.restore();}},
      hairF:{b:[-12,-23,15,8],d(c){
        const p=c=>{c.beginPath();c.moveTo(-9,-6);c.quadraticCurveTo(-8,-12,-3,-13);c.lineTo(-1,-21);c.lineTo(2,-13.6);c.lineTo(6.6,-20);c.lineTo(6.6,-12);c.lineTo(12.4,-15);c.lineTo(10,-8.4);c.lineTo(13,-7);c.lineTo(10.6,-4.6);c.lineTo(-9,-4.6);c.closePath();};
        cel(c,p,KK.hair,KK.hairS,KK.hairL,1,1.3);
        c.save();p(c);c.clip();c.fillStyle=KK.red;[[-1,-21,-1.6,-16.6,1,-17],[6.6,-20,5.4,-16,7.6,-16.4],[12.4,-15,10,-13.4,11.6,-12]].forEach(a=>{c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(a[2],a[3]);c.lineTo(a[4],a[5]);c.closePath();c.fill();});c.restore();
        cel(c,c=>{c.beginPath();c.moveTo(-10,-7);c.quadraticCurveTo(0,-9,10.6,-6.4);c.lineTo(10.8,-3.6);c.quadraticCurveTo(0,-6.2,-10,-4.2);c.closePath();},KK.red,KK.redS,KK.redL,.4,1.1);
        cel(c,c=>{c.beginPath();c.moveTo(2,-4.4);c.lineTo(4.6,1.2);c.lineTo(5.4,-4.2);c.lineTo(8,-.4);c.lineTo(8.2,-4);c.closePath();},KK.hair,KK.hairS,null,.3,1.1);}},
      head_idle:{b:[-15,-15,15,20],d:kkHead('idle')},head_attack:{b:[-15,-15,15,20],d:kkHead('attack')},
      head_hurt:{b:[-15,-15,15,20],d:kkHead('hurt')},head_blink:{b:[-15,-15,15,20],d:kkHead('blink')}
    },
    poses:{stand:{lean:.12,fa1:1,fa2:1.7,ba1:.55,ba2:1.9,fl1:.42,fl2:-.45,bl1:-.4,bl2:-.25},
      victory:{lean:-.05,fa1:2.9,fa2:.25,ba1:.6,ba2:1.9,fl1:.42,fl2:-.42,bl1:-.42,bl2:-.2}},
    idle:(t)=>{const b=Math.sin(t*4);return {lean:.12+b*.02,fa1:1+b*.04,fa2:1.7,ba1:.55,ba2:1.9+b*.05,fl1:.42,fl2:-.45,bl1:-.4,bl2:-.25};},
    render(c,f,t,j,m){
      const id='kenji_kaboom';
      const b2=chain(f,'b2',5,3.8,hl(j,-9.4,-5.4),[-.9,.3],{g:300,bias:900,damp:.86,fl:[700,6.5]});
      const b1=chain(f,'b1',6,4,hl(j,-9.8,-4.6),[-.96,.12],{g:260,bias:1000,damp:.86,fl:[800,6]});
      rig(c,f,t,j,m,id,{HS:1.1,behind(){ribbon(c,b2,2.6,1.6,mc(KK.redS,m),m,true);ribbon(c,b1,3,1.8,mc(KK.red,m),m,true);}});
      if((f.awake>0||f.sup||f.charge!=null)&&!silent(m)){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<6;i++){const ph=(t*1.6+i/6)%1;const p=tl(j,-8+i*3.2,-6-ph*30);c.globalAlpha=(1-ph)*.6;c.fillStyle=i%2?'#FF8A3D':'#FFD24D';
        c.beginPath();c.arc(p[0],p[1],2.4*(1-ph)+.5,0,Math.PI*2);c.fill();}c.restore();}
      fistTrail(f,j);
    }
  };

  /* ---------- LILA THUNDERFIST (speedster) ---------- */
  const LT={hair:'#1C2050',hairS:'#0E1030',hairL:'#5A6CC8',skin:'#F6D3C0',skinS:'#D9A592',top:'#1E2550',topS:'#10142E',topL:'#5E6AB0',
    blue:'#3FB7FF',blueG:'#9DE3FF',guard:'#2A2E44',guardS:'#15182A',guardL:'#6A7096',pants:'#1A1E3A',pantsS:'#0D1022',pantsL:'#4E5690',tie:'#8FD3FF'};
  function ltHead(kind){return function(c){
    cel(c,c=>capsule(c,4.4,4,7.5),LT.skin,LT.skinS,null,.6,1.2);
    c.fillStyle=LT.top;c.fillRect(-2.6,5,5.4,1.8);c.beginPath();c.arc(.4,7.6,.9,0,Math.PI*2);c.fillStyle=LT.blue;c.fill();
    faceShape(c,LT.skin,LT.skinS);
    eyes(c,kind,{iris:'#2E8BFF',irisD:'#0A2A6A',irisL:'#9DE3FF',lash:true,brow:'#2A2E60'});
    line(c,[10.1,3.5,9.6,4.6],.6,INK);
    if(kind==='attack'){c.beginPath();c.ellipse(7.6,7.4,1.5,1.2,0,0,Math.PI*2);c.fillStyle='#5A0F2A';c.fill();c.lineWidth=.6;c.strokeStyle=INK;c.stroke();}
    else if(kind==='hurt')line(c,[6,7.6,7,7,8,7.7,9,7.1],.7,INK);
    else{c.beginPath();c.moveTo(6.4,7.2);c.quadraticCurveTo(7.6,7.8,8.8,7);c.lineWidth=.7;c.strokeStyle='#8A2E4A';c.stroke();}
  };}
  defs.lila_thunderfist={name:'Lila Thunderfist',len:{th:18,sh:18,ft:3.4,to:23,hd:10.5,ua:11.5,fa:11.5},
    parts:{
      thigh:{b:[-6,-6,6,23],d(c){cel(c,c=>capsule(c,9,7,18),LT.pants,LT.pantsS,LT.pantsL,1.2);line(c,[3.2,1,2.6,17],.7,LT.blue);}},
      shin:{b:[-6,-5,6,22],d(c){cel(c,c=>capsule(c,7,5.8,18),LT.pants,LT.pantsS,LT.pantsL,1);
        cel(c,c=>{c.beginPath();c.moveTo(-3.6,9);c.lineTo(3.8,9);c.lineTo(3.4,19);c.lineTo(-3.2,19);c.closePath();},LT.guard,LT.guardS,LT.guardL,.5,1.1);line(c,[1.6,10,1.6,18],.7,LT.blue);}},
      foot:{b:[-5,-5,10,5],d(c){cel(c,footPath(8.2,3.4),LT.guard,LT.guardS,LT.guardL,.6,1.1);c.fillStyle=LT.blue;c.fillRect(-3.8,2.2,12,1.1);}},
      uarm:{b:[-6,-5,6,15],d(c){cel(c,c=>capsule(c,7,6.2,11.5),LT.skin,LT.skinS,null,.8,1.2);cel(c,c=>{c.beginPath();c.rect(-3.8,6.6,7.6,2);},LT.top,LT.topS,null,.3,.9);}},
      farm:{b:[-5,-4,5,15],d(c){cel(c,c=>capsule(c,6.6,5.8,11.5),LT.guard,LT.guardS,LT.guardL,.8,1.2);
        cel(c,c=>{c.beginPath();c.moveTo(-3.6,1);c.lineTo(3.6,1);c.lineTo(3,4);c.lineTo(-3,4);c.closePath();},LT.top,LT.topS,null,.3,.9);
        glowLine(c,[1.6,5,-.6,7.4,1.2,8.6,-.8,11],.7,LT.blueG,2.5);}},
      hand:{b:[-5,-5,5,6],d(c){fist(c,3.4,LT.guard,LT.guardS,LT.guardL);}},
      torso:{b:[-12,-29,12,5],d(c){const body=torsoPath(14,17,23.4);cel(c,body,LT.skin,LT.skinS,null,1.2,1.4);
        c.save();body(c);c.clip();
        cel(c,c=>{c.beginPath();c.moveTo(-12,-24);c.lineTo(12,-24);c.lineTo(11,-12.4);c.quadraticCurveTo(0,-10.4,-11,-12.4);c.closePath();},LT.top,LT.topS,LT.topL,1,1.3);
        line(c,[-4,-24,-1,-17],.8,LT.blue);line(c,[5,-24,3,-17],.8,LT.blue);
        line(c,[-1,-8,1.6,-6.4],.5,'rgba(170,110,100,.6)');
        c.fillStyle=LT.pants;c.fillRect(-12,-3.4,24,7);c.fillStyle=LT.blue;c.fillRect(-12,-3.4,24,1.2);
        c.restore();}},
      hairB:{b:[-17,-16,10,20],d(c){const p=c=>{c.beginPath();c.ellipse(-1,-2,11.2,11.6,0,0,Math.PI*2);c.moveTo(-11,-3);c.quadraticCurveTo(-13.4,8,-10,16);c.lineTo(-7,12);c.lineTo(-5,16.6);c.lineTo(-2.6,10);c.quadraticCurveTo(-1,4,-1,-2);c.closePath();};
        cel(c,p,LT.hair,LT.hairS,LT.hairL,1.4,1.4);}},
      hairF:{b:[-12,-17,15,15],d(c){
        const p=c=>{c.beginPath();c.moveTo(-8,-7);c.quadraticCurveTo(-3,-15.4,5.6,-13);c.quadraticCurveTo(11,-11,12,-4.6);c.lineTo(10.4,-1);c.lineTo(9.4,-5);c.lineTo(7.6,1);c.lineTo(6.2,-5.4);c.lineTo(3.8,-.6);c.lineTo(2.8,-6.4);c.lineTo(.4,-2.4);c.lineTo(-.6,-7.4);c.quadraticCurveTo(-4,-6,-8,-7);c.closePath();
          c.moveTo(-1.6,-6);c.quadraticCurveTo(-3.6,4,-.6,12);c.lineTo(1.4,8.4);c.quadraticCurveTo(.8,1,1.4,-5);c.closePath();};
        cel(c,p,LT.hair,LT.hairS,LT.hairL,1,1.3);
        c.beginPath();c.moveTo(1,-11.6);c.quadraticCurveTo(5,-12,8,-9.4);c.lineWidth=1.1;c.strokeStyle='rgba(120,140,240,.6)';c.stroke();}},
      head_idle:{b:[-15,-15,15,20],d:ltHead('idle')},head_attack:{b:[-15,-15,15,20],d:ltHead('attack')},
      head_hurt:{b:[-15,-15,15,20],d:ltHead('hurt')},head_blink:{b:[-15,-15,15,20],d:ltHead('blink')}
    },
    poses:{stand:{lean:.15,fa1:1.05,fa2:1.6,ba1:.5,ba2:1.8,fl1:.5,fl2:-.6,bl1:-.45,bl2:-.35}},
    idle:(t)=>{const b=Math.sin(t*4.4);return {lean:.15+b*.02,fa1:1.05+b*.04,fa2:1.6,ba1:.5,ba2:1.8,fl1:.5,fl2:-.6-b*.03,bl1:-.45,bl2:-.35};},
    run:(ph)=>({lean:.55,fa1:-1+Math.sin(ph)*.2,fa2:.3,ba1:-1.1-Math.sin(ph)*.2,ba2:.3}),
    render(c,f,t,j,m){
      const id='lila_thunderfist',HS=1.12;
      const pt=chain(f,'pt',9,4.8,hl(j,-7*HS,-9*HS),[-.62,.78],{g:560,bias:380,damp:.86,fl:[300,3.6]});
      rig(c,f,t,j,m,id,{HS,behind(){ribbon(c,pt,9.5,2,mc(LT.hair,m),m,true);if(!silent(m)){c.save();c.globalAlpha=.5;c.beginPath();c.moveTo(pt[1][0],pt[1][1]);for(let i=2;i<6;i++)c.lineTo(pt[i][0],pt[i][1]-1);c.lineWidth=1.2;c.strokeStyle=LT.hairL;c.stroke();c.restore();}},
        head(HS){const p=pt[0];cel(c,c=>{c.beginPath();c.ellipse(p[0],p[1],2.2,1.6,-.6,0,Math.PI*2);},mc(LT.tie,m),mc('#3C8FCF',m),null,.3,1);}});
      if(!silent(m)&&(f.act||f.awake>0||f.sup||f.castT>0)){[j.fW,j.bW].forEach((w,i)=>{const s=Math.floor(t*30)+i*3;bolt(c,w[0],w[1],w[0]+Math.sin(s)*7,w[1]+Math.cos(s*1.3)*7,s,LT.blueG);});}
      fistTrail(f,j);
    }
  };

  /* ---------- MOCHI MONK (heavy hitter) ---------- */
  const MM={skin:'#E8B48A',skinS:'#C2865E',skinL:'#FFD9B8',robe:'#F2A81E',robeS:'#C07A0E',robeL:'#FFD36A',navy:'#24284A',navyS:'#13152A',navyL:'#565C94',
    bead:'#1A1418',beadL:'#5A4E58',tat:'#3A2A40',wood:'#7A4A2A',woodL:'#B07A4A'};
  function mmHead(kind){return function(c){
    cel(c,c=>capsule(c,6.4,6,7.5),MM.skin,MM.skinS,null,.6,1.2);
    const hd=c=>{c.beginPath();c.ellipse(.2,-2,10.2,10.8,0,0,Math.PI*2);c.moveTo(-2,6);c.lineTo(3,9.8);c.lineTo(7,9);c.lineTo(9.6,4.4);c.lineTo(9.8,0);c.lineTo(0,0);c.closePath();};
    c.save();hd(c);c.lineWidth=2.8;c.strokeStyle=INK;c.stroke();c.fillStyle=MM.skin;c.fill();c.clip();
    c.beginPath();c.ellipse(-7,0,6.6,12,0,0,Math.PI*2);c.fillStyle=MM.skinS;c.fill();
    c.beginPath();c.ellipse(1,-9.6,5,2.2,-.2,0,Math.PI*2);c.fillStyle='rgba(255,240,220,.55)';c.fill();c.restore();
    cel(c,c=>{c.beginPath();c.ellipse(-8.6,1,1.8,2.8,0,0,Math.PI*2);},MM.skin,MM.skinS,null,.3,1);
    eyes(c,kind,{iris:'#3A2416',irisD:'#120A04',irisL:'#8A5A3A',stern:true,brow:INK});
    if(kind!=='blink'&&kind!=='hurt'){line(c,[2.2,-4.4,7.6,-3],1.6,INK);line(c,[8.6,-3.2,10.8,-4],1.3,INK);}
    line(c,[10.1,3.4,9.4,4.8],.7,INK);smirk(c,kind,'#6A3A2A');
    c.beginPath();c.arc(1,-6.6,.6,0,Math.PI*2);c.arc(3,-7,.6,0,Math.PI*2);c.fillStyle='#A06A4A';c.fill();
  };}
  defs.mochi_monk={name:'Mochi Monk',len:{th:18,sh:17,ft:3.6,to:25,hd:11,ua:12.5,fa:12},
    parts:{
      thigh:{b:[-9,-7,9,23],d(c){cel(c,c=>capsule(c,13,10.4,18),MM.robe,MM.robeS,MM.robeL,1.4,1.5);line(c,[-2,2,-3,16],.7,'rgba(160,96,10,.6)');line(c,[3,2,3.6,16],.7,'rgba(160,96,10,.6)');}},
      shin:{b:[-8,-5,8,21],d(c){cel(c,c=>capsule(c,10,8,17),MM.robe,MM.robeS,MM.robeL,1.2,1.4);
        cel(c,c=>{c.beginPath();c.moveTo(-4.4,10);c.lineTo(4.6,10);c.lineTo(4,18);c.lineTo(-3.8,18);c.closePath();},MM.navy,MM.navyS,MM.navyL,.5,1.1);}},
      foot:{b:[-5,-5,11,5],d(c){cel(c,footPath(9,3.6),MM.skin,MM.skinS,null,.6,1.1);c.fillStyle=MM.wood;c.fillRect(-4.2,2.4,13.4,1.6);line(c,[3.6,-3,1.4,1.6],.8,MM.navy);}},
      uarm:{b:[-8,-6,8,16],d(c){cel(c,c=>capsule(c,11,9.4,12.5),MM.skin,MM.skinS,MM.skinL,1.2,1.4);
        c.save();capsule(c,11,9.4,12.5);c.clip();c.strokeStyle=MM.tat;c.lineWidth=1;[[-3,1,2,4,-1,8],[1,-1,4,3,2,6],[-4,7,-1,10,3,9]].forEach(a=>{c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(a[2],a[3],a[4],a[5]);c.stroke();});c.restore();}},
      farm:{b:[-7,-5,7,15],d(c){cel(c,c=>capsule(c,9.6,8,12),MM.skin,MM.skinS,MM.skinL,1,1.3);
        for(let i=0;i<4;i++){c.beginPath();c.arc(-3.6+i*2.4,8.8,1.4,0,Math.PI*2);c.fillStyle=MM.bead;c.fill();c.lineWidth=.5;c.strokeStyle=INK;c.stroke();c.beginPath();c.arc(-4+i*2.4,8.4,.5,0,Math.PI*2);c.fillStyle=MM.beadL;c.fill();}}},
      hand:{b:[-7,-6,7,7],d(c){fist(c,4.8,MM.skin,MM.skinS,MM.skinL);}},
      torso:{b:[-16,-33,16,6],d(c){const body=torsoPath(20,25,25.6);cel(c,body,MM.skin,MM.skinS,MM.skinL,1.6,1.6);
        c.save();body(c);c.clip();
        line(c,[-1,-20,2,-17,6,-18],.8,'rgba(150,90,60,.55)');line(c,[-6,-12,-2,-11],.7,'rgba(150,90,60,.45)');
        cel(c,c=>{c.beginPath();c.moveTo(-14,-24);c.lineTo(-7,-28);c.lineTo(10,-6);c.lineTo(14,3);c.lineTo(-14,3);c.closePath();},MM.robe,MM.robeS,MM.robeL,1.2,1.4);
        line(c,[-6,-25,9,-5],.8,MM.robeS);line(c,[-10,-16,2,-2],.6,'rgba(160,96,10,.6)');
        c.fillStyle=MM.navy;c.fillRect(-14,-6,28,5);c.fillStyle=MM.navyL;c.fillRect(-14,-6,28,.8);
        c.restore();}},
      beads:{b:[-12,-6,12,14],d(c){for(let i=0;i<11;i++){const a=Math.PI*(.05+i*.09);const x=Math.cos(a)*9.6,y=Math.sin(a)*8.4;const r=i===5?2.4:1.7;
        c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=MM.bead;c.fill();c.lineWidth=.6;c.strokeStyle=INK;c.stroke();c.beginPath();c.arc(x-.5,y-.5,r*.35,0,Math.PI*2);c.fillStyle=MM.beadL;c.fill();}}},
      head_idle:{b:[-15,-15,15,20],d:mmHead('idle')},head_attack:{b:[-15,-15,15,20],d:mmHead('attack')},
      head_hurt:{b:[-15,-15,15,20],d:mmHead('hurt')},head_blink:{b:[-15,-15,15,20],d:mmHead('blink')}
    },
    poses:{stand:{lean:.06,fa1:.85,fa2:1.5,ba1:.4,ba2:1.7,fl1:.5,fl2:-.55,bl1:-.48,bl2:-.3}},
    idle:(t)=>{const b=Math.sin(t*2.4);return {lean:.06+b*.015,fa1:.85,fa2:1.5+b*.05,ba1:.4,ba2:1.7,fl1:.5,fl2:-.55,bl1:-.48,bl2:-.3};},
    run:(ph)=>({lean:.3,fa1:-.4+Math.sin(ph)*.6,fa2:1.3,ba1:.4-Math.sin(ph)*.6,ba2:1.3}),
    render(c,f,t,j,m){
      const id='mochi_monk';
      const s1=chain(f,'s1',4,4.2,tl(j,-11,-5),[-.25,.97],{g:640,bias:260,fl:[220,4]});
      rig(c,f,t,j,m,id,{HS:1.04,behind(){ribbon(c,s1,4.4,3.8,mc(MM.navy,m),m);},
        afterLegs(){const p=tl(j,1.4,-26.2);part(c,id,'beads',p[0],p[1],-j.lean,m);}});
      fistTrail(f,j);
    }
  };
  heroArt.kenji='kenji_kaboom';heroArt.lila='lila_thunderfist';heroArt.mochi='mochi_monk';
