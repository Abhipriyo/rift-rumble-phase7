function aiTick(dt){
  const cl=enemies.find(e=>e.role==='clone'&&e.alive);
  if(P&&P.alive&&!P.sup&&P.stun<=0&&P.dizzy<=0){
    CLONE.sampleT-=dt;
    if(CLONE.sampleT<=0){CLONE.sampleT=.1;const tgt=nearestEnemy(P.x,P.y,700);
      if(tgt){let lab=P.pendAct;P.pendAct=null;
        if(lab==='dash')lab=sign(P.dashDir)===sign(tgt.x-P.x)?'dashT':'dashA';
        if(!lab){const ax=axisX();if(P.guard)lab='guard';else if(Math.abs(ax)>.15)lab=sign(ax)===sign(tgt.x-P.x)?'toward':'away';else lab='idle';}
        const x=feats(P,tgt,'enemy'),y=CA.indexOf(lab);
        const dd=Math.abs(tgt.x-P.x);OBS.dist=OBS.dist==null?dd:OBS.dist*.97+dd*.03;
        /* during a duel the network is frozen, so these are genuinely unseen situations for it */
        if(cl&&CLONE.duel.on&&y>=0&&CLONE.X.length>=20){const p=CLONE.forward(x);CLONE.duel.n++;if(CLONE.argmax(p)===y)CLONE.duel.agree++;CLONE.duel.player[y]++;}
        if(G.mode==='echo'&&G.echo&&G.echo.phase==='train'&&y>=0)CLONE.sess[y]++;
        CLONE.add(x,y);}}
  }
  const frozen=!!cl||(G.mode==='echo'&&G.echo&&G.echo.phase!=='train');
  CLONE.trainT-=dt;if(CLONE.trainT<=0&&!frozen){CLONE.trainT=.2;for(let i=0;i<3;i++)CLONE.step(32);}
  CLONE.accT-=dt;if(CLONE.accT<=0){CLONE.accT=2;CLONE.evalAll();
    if(CLONE.lossEma!=null){CLONE.lossHist.push({tr:CLONE.lossEma,va:CLONE.val.loss});if(CLONE.lossHist.length>90)CLONE.lossHist.shift();}}
  if(P&&P.alive&&P.pct>=120&&!G.dangerSaid){G.dangerSaid=true;ann('danger',{hero:HEROES[G.hero].name,n:Math.round(P.pct)},1);}
  for(const k in ANN.cool)ANN.cool[k]-=dt;
}

