"""Phase 6: settings (volume, comfort, difficulty, key remapping), layered audio + ambience,
fixed-timestep loop, visibility pause, effect caps and perf counters. Applied after phase5.py."""
p='rift-rumble.html';s=open(p).read()
def rep(o,n,c=1):
    global s
    k=s.count(o);assert k==c,(o[:90],k);s=s.replace(o,n)

# ---------- HTML ----------
rep('<button class="big alt" type="button" id="helpBtn1">Controls</button>','<button class="big alt" type="button" id="helpBtn1">Controls</button><button class="big alt" type="button" id="setBtn">Settings</button>')
rep('<button class="big alt" type="button" id="helpBtn3">Controls</button>','<button class="big alt" type="button" id="helpBtn3">Controls</button><button class="big alt" type="button" id="setBtn2">Settings</button>')
i=s.index('<section><h3>Keyboard</h3><dl>');j=s.index('</dl></section>',i)
s=s[:i]+'<section><h3>Keyboard</h3><dl id="kbHelp">'+s[j:]
rep('    <div class="overlay" id="ovOver" hidden>','''    <div class="overlay" id="ovSettings" hidden role="dialog" aria-labelledby="setH">
      <h2 id="setH">SETTINGS</h2>
      <p class="sub warn" id="setStatus"></p>
      <div class="setGrid">
        <section class="setSec"><h3>Sound</h3>
          <p class="sub" id="sndState"></p>
          <label class="sl"><span>Master</span><input type="range" id="set_master" min="0" max="100" step="5"><output id="val_master"></output></label>
          <label class="sl"><span>Effects</span><input type="range" id="set_sfx" min="0" max="100" step="5"><output id="val_sfx"></output></label>
          <label class="sl"><span>Ambience</span><input type="range" id="set_music" min="0" max="100" step="5"><output id="val_music"></output></label>
        </section>
        <section class="setSec"><h3>Comfort</h3>
          <div class="segRow"><span id="lblShake">Screen shake</span><div class="seg" id="segShake" role="group" aria-labelledby="lblShake"></div></div>
          <div class="segRow"><span id="lblFlash">Screen flashes</span><div class="seg" id="segFlash" role="group" aria-labelledby="lblFlash"></div></div>
          <p class="sub">Defaults follow your device's reduce-motion setting.</p>
        </section>
        <section class="setSec wide"><h3>Difficulty</h3>
          <div class="seg" id="segDiff" role="group" aria-label="Difficulty"></div><p class="sub" id="diffDesc"></p>
        </section>
        <section class="setSec wide"><h3>Keyboard</h3>
          <div class="tblWrap"><table class="keys"><tbody id="keyRows"></tbody></table></div>
          <p class="sub" id="keyMsg" aria-live="polite"></p>
          <div class="row2"><button class="mini" type="button" id="keyReset">Reset keys to default</button></div>
          <p class="sub">Esc, P, Tab, Enter and ` stay reserved. Touch and controller layouts are fixed.</p>
        </section>
      </div>
      <div class="row"><button class="big" type="button" id="setClose">Done</button></div>
    </div>

    <div class="overlay" id="ovOver" hidden>''')
css='''.setGrid{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;width:100%;max-width:760px;text-align:left}
@media (min-width:700px){.setGrid{grid-template-columns:1fr 1fr}.setSec.wide{grid-column:1/-1}}
.setSec{background:var(--panel);border:2px solid var(--line);border-radius:12px;padding:10px 12px;display:flex;flex-direction:column;gap:8px;min-width:0}
.setSec h3{margin:0;font-family:var(--display);font-weight:400;font-size:20px;letter-spacing:.04em;color:var(--zap)}
.setSec .sub{max-width:none}
.sl{display:grid;grid-template-columns:76px minmax(0,1fr) 44px;align-items:center;gap:8px;font-size:14px}
.sl input{width:100%;accent-color:var(--zap);min-height:32px;margin:0}
.sl output{text-align:right;font-variant-numeric:tabular-nums}
.segRow{display:flex;flex-direction:column;gap:4px;font-size:14px}
.seg{display:flex;gap:6px;flex-wrap:wrap}
.segb{font:600 13px var(--body);color:var(--ink);background:var(--panel-2);border:2px solid var(--line);border-radius:999px;padding:6px 14px;min-height:40px;cursor:pointer}
.segb[aria-pressed="true"]{background:var(--zap);color:var(--outline);border-color:var(--outline)}
.keys{width:100%;border-collapse:collapse;font-size:14px}.keys td{padding:3px 6px;border-bottom:1px solid var(--line)}
.keys td:nth-child(2){color:var(--zap);white-space:nowrap}.keys td.cap{color:#7FE7FF}.keys td:last-child{text-align:right}
input[type=range]:focus-visible{outline:3px solid var(--hero);outline-offset:2px}
</style>'''
rep('</style>',css)

# ---------- audio ----------
rep("SND.ctx=new A();SND.master=SND.ctx.createGain();SND.master.gain.value=.5;SND.master.connect(SND.ctx.destination);",
    "SND.ctx=new A();SND.master=SND.ctx.createGain();SND.master.gain.value=.5;SND.master.connect(SND.ctx.destination);")
rep("  }catch(e){SND.ctx=null;}\n}","  }catch(e){SND.ctx=null;}\n  if(SND.ctx)audioBuses();\n}")
rep("function audioInit(){\n  if(SND.ctx)return;","function audioInit(){\n  if(SND.ctx){if(SND.ctx.state==='suspended'&&!document.hidden)SND.ctx.resume().catch(()=>{});return;}")
rep("g.connect(SND.master);o.start(t)","g.connect(SND.sfxBus||SND.master);o.start(t)")
rep("g.connect(SND.master);s.start(t)","g.connect(SND.sfxBus||SND.master);s.start(t)")
rep("if(!SND.on||!SND.ctx||sfxCount>14)return;","if(!SND.on||!SND.ctx||sfxCount>14||!voiceOK(name))return;")
rep("      case 'clear':","""      case 'jab':noise(.07,.14,3200,2.5);tone('triangle',520,300,.05,.04);break;
      case 'kick':noise(.1,.18,1600,1.5);tone('sine',220,110,.08,.08);break;
      case 'swingH':noise(.18,.22,1100,1.2);tone('sawtooth',180,90,.16,.04);break;
      case 'launch':tone('square',300,900,.16,.06);noise(.14,.18,2000,1.5);break;
      case 'spikeS':tone('square',900,200,.16,.06);noise(.12,.2,1400,1.2);break;
      case 'block':tone('square',1400,1100,.06,.06);noise(.05,.2,5000,3);break;
      case 'combo':[660,880,1100,1320,1760].slice(0,str+1).forEach((f,i)=>tone('triangle',f,f*1.01,.1,.07,i*.05));break;
      case 'sp_ball':tone('sine',300,600,.18,.08);break;
      case 'sp_bolt':tone('square',2000,600,.1,.05);break;
      case 'sp_boomerang':noise(.3,.1,1800,4);break;
      case 'sp_homing':tone('triangle',800,1600,.2,.05);break;
      case 'sp_orb':tone('sine',200,400,.3,.08);break;
      case 'sp_snake':tone('sawtooth',400,250,.25,.04);break;
      case 'sp_spread':[0,.04,.08].forEach(d=>tone('square',700,500,.06,.04,d));break;
      case 'sp_wave':tone('sine',150,80,.35,.12);break;
      case 'sp_zip':noise(.1,.15,5000,2);tone('square',1500,2500,.08,.04);break;
      case 'bossIntro':tone('sawtooth',55,40,1.4,.18);tone('square',110,80,1.2,.06,.1);noise(1.2,.3,300,.6);break;
      case 'roar':tone('sawtooth',140,60,.8,.16);noise(.8,.35,600,.7);break;
      case 'warn':tone('square',880,880,.06,.07);tone('square',880,880,.06,.07,.12);break;
      case 'victory':[523,659,784,1046,1318].forEach((f,i)=>tone('square',f,f,.18,.06,i*.1));break;
      case 'defeat':[392,330,262,196].forEach((f,i)=>tone('sawtooth',f,f*.97,.3,.06,i*.18));break;
      case 'medal':tone('triangle',1318,1318,.12,.08);tone('triangle',1760,1760,.3,.08,.1);break;
      case 'clear':""")
# gameplay sound hooks
rep("  if(d.air&&!p.onGround)p.vy=Math.min(p.vy,n==='spike'?-60:-140);\n  sfx('whoosh');\n}",
    "  if(d.air&&!p.onGround)p.vy=Math.min(p.vy,n==='spike'?-60:-140);\n  sfx(n==='launch'||n==='airUp'||n==='rise'?'launch':n==='spike'?'spikeS':/fin|sweep|dashStrike|airFin|pounceAtk|tpStrike/.test(n)?'swingH':/jab|air1/.test(n)?'jab':'kick');\n}")
rep("p.castT=.22;note('blast',1);","p.castT=.22;note('blast',1);sfx('sp_'+sp.type);")
rep("function addHit(dmg){G.hits++;G.hitT=1.1;G.hitDmg+=dmg;","function addHit(dmg){G.hits++;G.hitT=1.1;G.hitDmg+=dmg;{const ci=[10,20,35,50].indexOf(G.hits);if(ci>=0)sfx('combo',ci+1);}")
rep("if(blocked){pop(t.x,t.y-t.h-14,'BLOCK','#7FE7FF',26);","if(blocked){pop(t.x,t.y-t.h-14,'BLOCK','#7FE7FF',26);sfx('block');")
rep("G.bossCard={t:0,dur:2,name:e.name,jp:def.jp};sfx('super');","G.bossCard={t:0,dur:2,name:e.name,jp:def.jp};sfx('bossIntro');")
rep("e.armor=40;e.vx=0;shake(10);sfx('super');","e.armor=40;e.vx=0;shake(10);sfx('roar');")
rep("bs.log.push(name+(gb?' (guard break)':''));","bs.log.push(name+(gb?' (guard break)':''));sfx('warn');")
rep("G.banner={t:0,dur:2.2,text:'BOSS DEFEATED!'","sfx('victory');G.banner={t:0,dur:2.2,text:'BOSS DEFEATED!'")
rep("G.screen='over';saveClone();const _res=recordRun('ko');","G.screen='over';sfx('defeat');saveClone();const _res=recordRun('ko');")
rep("  E.phase='report';G.screen='echoReport';","  E.phase='report';G.screen='echoReport';sfx(res==='win'?'victory':'defeat');")
rep("  PROF.data.medals[id]=Date.now();PROG.newMedals.push(id);","  PROF.data.medals[id]=Date.now();PROG.newMedals.push(id);sfx('medal');")
rep("setSndLabel();sfx('ui');});","setSndLabel();applyAudio();sfx('ui');});")

# ---------- comfort ----------
rep("function shake(n){if(!RM)G.shake=Math.max(G.shake,n);}","function shake(n){const m=shakeMul();if(m>0)G.shake=Math.max(G.shake,n*m);}")
rep("c.fillStyle='rgba(255,255,255,'+Math.min(.8,G.flash*3)+')'","c.fillStyle='rgba(255,255,255,'+Math.min(.8,G.flash*3)*flashMul()+')'")

# ---------- difficulty ----------
rep("dmgMul:1+Math.min(G.wave*.05,.6),","dmgMul:(1+Math.min(G.wave*.05,.6))*DIFF().dmg,")
rep("e.pers=p;e.react=clamp(.34-G.wave*.012,.2,.34)+(p==='guardian'?.04:p==='trickster'?-.02:0);",
    "e.pers=p;{const r0=clamp(.34-G.wave*.012,.2,.34)+(p==='guardian'?.04:p==='trickster'?-.02:0),dr=DIFF().react;e.react=dr<0?Math.max(Math.min(r0,.2),r0+dr):r0+dr;}")
rep("bs.dur=Math.max(.4,A.tele*(bs.phase===1?.9:bs.phase===2?.8:1));if(name==='counter')bs.dur=A.tele;",
    "bs.dur=Math.max(.4,A.tele*(bs.phase===1?.9:bs.phase===2?.8:1)*DIFF().tele);if(name==='counter')bs.dur=Math.max(.3,A.tele*DIFF().tele);")
rep("interrupts:0,log:[]};e.react=.3;}","interrupts:0,log:[]};e.react=Math.max(.2,.3+DIFF().react);}")

# ---------- input ----------
rep("  const k=KEYS[e.code];if(!k)return;\n  if(G.screen==='play')e.preventDefault();",
    "  if(e.ctrlKey||e.metaKey||e.altKey)return;\n  const k=KEYS[e.code];if(!k)return;\n  if(G.screen==='play')e.preventDefault();")
rep("function glyph(k){","function glyph(k){\n  if(inputMode==='key'){const f=a=>keyName(SET.keys[a][0]);if(k==='move')return f('left')+' / '+f('right');if(k==='up')return 'hold '+f('up');if(SET.keys[k])return f(k);}")
rep("G.screen='play';show('ovPause',false);show('ovHelp',false);lastT=performance.now();",
    "G.screen='play';show('ovPause',false);show('ovHelp',false);show('ovSettings',false);capAct=null;lastT=performance.now();PERF.acc=0;applyAudio();")
rep("show('ovPause',true);$('resumeBtn').focus();}","show('ovPause',true);$('resumeBtn').focus();applyAudio();}")

# ---------- caps + perf ----------
rep("  updateProjs(dt);\n","  updateProjs(dt);\n  if(projs.length>140)projs.splice(0,projs.length-140);if(fx.length>160)fx.splice(0,fx.length-160);if(pops.length>40)pops.splice(0,pops.length-40);\n")
rep("const lines=['DEBUG (press ` to hide)',","const lines=['DEBUG (press ` to hide)','perf: update '+PERF.upd.toFixed(2)+' ms · render '+PERF.ren.toFixed(2)+' ms · '+PERF.fps+' fps · '+PERF.spf.toFixed(2)+' sim steps/frame (fixed 1/120 s)',")

# ---------- fixed-timestep loop ----------
rep("""function loop(now){
  const t=now/1000;const dt=Math.max(0,Math.min(.033,(now-lastT)/1000));lastT=Math.max(lastT,now);
  pollPad();
  if(G.screen==='play')update(dt);
  else if(G.screen==='learn')echoLearnTick();
  else if(G.screen==='title'||G.screen==='select'){G.uni=selUni;idleScene(t,dt);}
  if(G.screen==='select')drawPreviews(t);
  render(t,G.screen==='play'?dt:0);
  requestAnimationFrame(loop);
}""","""/* Gameplay advances in fixed 1/120 s steps, so physics and timers do not depend on the display refresh rate. */
function frameStep(now){
  const t=now/1000;const fdt=Math.max(0,Math.min(.1,(now-lastT)/1000));lastT=Math.max(lastT,now);
  sfxCount=0;pollPad();const u0=performance.now();let steps=0;
  if(G.screen==='play'){PERF.acc+=fdt;while(PERF.acc>=STEP-1e-9&&steps<8&&G.screen==='play'){update(STEP);PERF.acc-=STEP;steps++;}if(steps>=8)PERF.acc=0;}
  else{PERF.acc=0;
    if(G.screen==='learn')echoLearnTick();
    else if(G.screen==='title'||G.screen==='select'){G.uni=selUni;idleScene(t,Math.min(fdt,.033));}}
  if(G.screen==='select')drawPreviews(t);
  const u1=performance.now();
  render(t,G.screen==='play'?fdt:0);
  const u2=performance.now();
  AMB.tick();
  if(steps)PERF.upd=PERF.upd*.9+(u1-u0)*.1;PERF.ren=PERF.ren*.9+(u2-u1)*.1;PERF.spf=PERF.spf*.95+steps*.05;PERF.steps+=steps;
  PERF.cnt++;if(now-PERF.t0>=1000){PERF.fps=Math.round(PERF.cnt*1000/(now-PERF.t0));PERF.cnt=0;PERF.t0=now;}
}
function loop(now){if(!MANUAL)frameStep(now);requestAnimationFrame(loop);}""")
rep("window.__rr={PROG,","window.__rr={SET,SND,AMB,PERF,STEP,DIFF,frameStep,applyAudio,applyKeys,openSettings,closeSettings,renderSettings,setSanitize,setLoad,keyName,KEYS,KEYDEF,set MANUAL(v){MANUAL=v;},get MANUAL(){return MANUAL;},set lastT(v){lastT=v;},capture:a=>{capAct=a;},sfx,shake,flashMul,shakeMul,startBossAtk,initBoss,glyph,audioInit,get projs(){return projs;},get fx(){return fx;},get pops(){return pops;},PROG,")

# ---------- insert phase-6 module ----------
mark='/* ================= SCREENS + LAYOUT ================= */'
rep(mark,open('p6.js').read()+'\n'+mark)
open(p,'w').write(s);print('phase6 ok')
