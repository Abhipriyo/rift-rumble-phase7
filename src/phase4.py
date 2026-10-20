"""Phase 4: adaptive enemy tactics, multi-phase bosses, held-out Shadow Clone evaluation, Echo Duel mode,
upgraded AI Lab and a developer debug view. Applied after integrate.py, roster.py and final.py."""
p='rift-rumble.html';s=open(p).read()
R=lambda f:open(f).read()
def rep(o,n,c=1):
    global s
    k=s.count(o);assert k==c,(o[:90],k);s=s.replace(o,n)
def region(a,b,new,keep_b=True):
    global s
    i=s.index(a);j=s.index(b,i)
    s=s[:i]+new+s[j:]

# ---------------- HTML: AI Lab ----------------
i=s.index('<section class="brain" aria-label="AI lab">');j=s.index('</section>',i)+len('</section>')
s=s[:i]+'''<section class="brain" aria-label="AI lab">
    <h3>AI LAB</h3>
    <p>Every number here is calculated live in this browser from your own play. If something cannot be measured yet, it says so. Your moves never leave the page; only announcer recaps go to a language model, and only when you switch it on.</p>
    <div class="lab">
    <div class="labcard">
      <h4>Move predictor</h4>
      <p class="sub">A sequence model (n-gram with backoff) predicts your next action. Hunter enemies position themselves against its guess. Evaluation set: every action you take this run, each predicted <em>before</em> it happens.</p>
      <div class="stat" id="predNext">Next move guess: unavailable</div>
      <div class="bars" id="predBars"></div>
      <dl class="kv" id="predStats"></dl>
      <div class="chips" id="predRecent" aria-label="Recent predictions"></div>
      <p class="sub" id="predNote"></p>
    </div>
    <div class="labcard">
      <h4>Shadow Clone network</h4>
      <p class="sub">A neural network (13 inputs, 24 hidden units, 10 actions) learns to copy your decisions. Every 5th example is held out and never trained on, so the agreement below is measured on decisions it has not seen.</p>
      <canvas id="lossChart" width="320" height="90" aria-label="Training and validation loss of the Shadow Clone network over time"></canvas>
      <dl class="kv" id="cloneStats"></dl>
      <div id="duelRep"></div>
      <p class="sub">Limits: it copies 10 coarse actions from 13 numbers describing the situation, sampled 10 times a second. Agreement measures imitation, not fighting skill. Held-out examples come from your own sessions, so this is not a test on new players.</p>
      <div class="row2"><button class="mini" id="resetClone" type="button">Forget my moves</button></div>
    </div>
    <div class="labcard">
      <h4>Habit tracker and enemy tactics</h4>
      <p class="sub"><strong>Observed</strong>: decaying counts of what you actually did.</p>
    <div class="bars">
      <span>Blasting</span><div class="bar"><i id="bBlast"></i></div><span class="num" id="nBlast">0%</span>
      <span>Melee</span><div class="bar"><i id="bMelee"></i></div><span class="num" id="nMelee">0%</span>
      <span>Air attacks</span><div class="bar"><i id="bAir"></i></div><span class="num" id="nAir">0%</span>
      <span>Dashing</span><div class="bar"><i id="bDash"></i></div><span class="num" id="nDash">0%</span>
    </div>
      <p class="sub"><strong>Inferred</strong>: counter-strategies switched on from those observations.</p>
      <ul class="inf" id="counter"></ul>
      <dl class="kv" id="tacStats"></dl>
      <details class="tactics"><summary>Enemy personalities</summary><ul id="persList"></ul></details>
    </div>
    <div class="labcard">
      <h4>AI announcer</h4>
      <p class="sub" id="annSub">Checking which AI is available...</p>
      <div class="stat" id="annLast">Built-in lines react to your combos, knockouts and close calls.</div>
      <div class="row2"><button class="mini annToggle" type="button" hidden></button><button class="mini voiceToggle" type="button" hidden></button></div>
    </div>
    </div>
    <p class="sub devnote">Developer view: press <kbd>`</kbd> (backtick) during a match, or add <code>?debug</code> to the address, to see each enemy's state, candidate actions, chosen action and model inputs.</p>
  </section>'''+s[j:]

# ---------------- HTML: title button + Echo Duel overlays ----------------
rep('<button class="big" type="button" id="startBtn">PRESS START</button>','<button class="big" type="button" id="startBtn">PRESS START</button><button class="big alt" type="button" id="echoBtn">ECHO DUEL</button>')
rep('    <div class="overlay" id="ovOver" hidden>','''    <div class="overlay" id="ovLearn" hidden>
      <div class="sp"></div>
      <h2>TRAINING YOUR CLONE</h2>
      <p id="learnTxt"></p>
      <div class="pbar" role="progressbar" aria-label="Training progress"><i id="learnBar"></i></div>
      <canvas id="learnChart" width="320" height="90" aria-label="Loss during training"></canvas>
      <dl class="kv wide" id="learnKV"></dl>
      <p class="sub">Real training steps running in your browser right now. Blue: training loss. Pink: validation loss on held-out examples.</p>
      <p class="sub" id="learnNote"></p>
      <div class="sp"></div>
    </div>

    <div class="overlay" id="ovEcho" hidden>
      <h2 id="echoTitle">ECHO DUEL REPORT</h2>
      <p id="echoRes"></p>
      <div class="echogrid"><section><h3>How closely it copies you</h3><div id="echoImit"></div></section><section><h3>How the fight went</h3><div id="echoFight"></div></section></div>
      <p class="sub" id="echoLim"></p>
      <div class="row"><button class="big" type="button" id="echoAgain">Duel again</button><button class="big alt" type="button" id="echoMore">Train more</button><button class="big alt" type="button" id="echoSwitch">Change fighter</button></div>
    </div>

    <div class="overlay" id="ovOver" hidden>''')
# ---------------- CSS ----------------
css='''.kv{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;margin:0;font-size:13px}
.kv dt{color:var(--muted)}.kv dd{margin:0;text-align:right;font-variant-numeric:tabular-nums}
.kv.wide{width:100%;max-width:460px}
.chips{display:flex;flex-wrap:wrap;gap:4px}
.chip{font-size:11px;border-radius:8px;padding:1px 6px;border:1px solid var(--line)}
.chip.ok{background:rgba(125,255,138,.15);color:#B8FFC4}.chip.bad{background:rgba(255,46,99,.12);color:#FFB3C6}
.inf{margin:0;padding-left:18px;font-size:13px}.inf li{margin:2px 0}
.tactics{font-size:13px}.tactics summary{cursor:pointer;color:var(--ink)}.tactics ul{margin:4px 0;padding-left:18px}
.cmp{display:grid;grid-template-columns:auto minmax(0,1fr);gap:2px 8px;align-items:center;font-size:12px;margin:4px 0}
.cmp span{grid-row:span 2}.cmp .bar{height:7px}.cmp .bar.you i{background:#3EE6FF}.cmp .bar.cl i{background:#FF8FCA}
.cmp .cmpLeg{grid-column:1/-1;grid-row:auto;color:var(--muted);font-size:11px}
.pbar{width:min(460px,90%);height:14px;background:var(--panel);border:2px solid var(--line);border-radius:8px;overflow:hidden}
.pbar i{display:block;height:100%;width:0;background:var(--zap)}
#ovLearn canvas{width:min(460px,90%);height:auto;aspect-ratio:320/90;border-radius:8px}
.echogrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;width:100%;max-width:820px;text-align:left}
.echogrid section{background:var(--panel);border:2px solid var(--line);border-radius:12px;padding:10px 12px;min-width:0}
.echogrid h3{margin:0 0 6px;font-family:var(--display);font-weight:400;font-size:20px;letter-spacing:.04em}
@media (max-width:640px){.echogrid{grid-template-columns:minmax(0,1fr)}}
.devnote{margin-top:8px}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]

# ---------------- JS: replace AI subsystems ----------------
region('function enemyStrike(e){','function koFighter(f){',R('ai4_enemy.js'))
region('const PRED={','const ACT_PRI=',R('ai4_pred.js'))
rep("function markAct(a){if(!P)return;if(!P.pendAct||ACT_PRI[a]>=ACT_PRI[P.pendAct])P.pendAct=a;PRED.observe(a);}",
    "function markAct(a){if(!P)return;if(!P.pendAct||ACT_PRI[a]>=ACT_PRI[P.pendAct])P.pendAct=a;PRED.observe(a);obsPush(a);}")
region('/* 2) Shadow Clone:','/* the same 13 features',R('ai4_clone.js'))
region('function cloneAI(e,dt,dx,dy){','/* 3) Announcer',R('ai4_cloneai.js'))
region('function aiTick(dt){','/* ================= UPDATE',R('ai4_aitick.js'))
region('let predRows=null;','/* ================= FIGHTERS',R('ai4_lab.js')+'\n')
rep("  const sh=ENEMY_SHOT[cosId];if(sh){e.shotKind=sh[0];e.shotColor=sh[1];}","  const sh=ENEMY_SHOT[cosId];if(sh){e.shotKind=sh[0];e.shotColor=sh[1];}\n  if(role!=='clone'&&role!=='boss')assignPers(e);")
# applyHit: guard break, guardian counter trigger, boss interrupt, blink cancel
rep("    if(t.guard){\n      if(t.guardT<.16){perfectGuard(t,h);return false;}",
    "    if(t.guard&&h.unblock&&t.guardT>=.16){pop(t.x,t.y-t.h-14,'GUARD BREAK!','#FF2E63',28);t.guard=false;}\n    if(t.guard){\n      if(t.guardT<.16){perfectGuard(t,h);return false;}")
rep("  if(blocked)pop(t.x,t.y-t.h-14,'BLOCK','#7FE7FF',26);","  if(blocked){pop(t.x,t.y-t.h-14,'BLOCK','#7FE7FF',26);t.blockedHitT=G.time;}")
rep("  t.wind=0;t.act=null;t.punchT=0;t.slamming=false;","  if(t.bs&&!blocked)bossInterrupt(t);t.blink=null;\n  t.wind=0;t.act=null;t.punchT=0;t.slamming=false;")
rep("e.role!=='boss'&&Math.random()<blockP()*.5","e.role!=='boss'&&e.pers!=='berserker'&&e.pers!=='mimic'&&Math.random()<blockP()*.5")
rep("if(f.role==='clone')ann('cloneKO',{},3);else if","if(f.role==='boss')bossDefeated(f);if(f.role==='clone'){ann('cloneKO',{},3);endDuel('player');if(G.mode==='echo'&&G.echo)G.echo.endT=1.4;}else if")
rep("  enemies.push(e);\n}","  enemies.push(e);if(role==='clone')startDuel();\n}")
rep("function updateWaves(dt){\n","function updateWaves(dt){\n  if(G.mode==='echo'){echoUpdate(dt);return;}\n")
rep("function startWave(){\n  G.wave++;","function startWave(){\n  if(G.mode==='echo'){G.wave=1;G.queue=[];G.waveDone=false;return;}\n  G.wave++;")
rep("function startGame(){\n  audioInit();","function startGame(){\n  if(CLONE.duel.on)endDuel('ended');G.mode=selMode==='echo'?'echo':'endless';G.echo=null;STATS.reset();HUNT.reset();OBS.ev=[];OBS.dist=null;G.bossCard=null;\n  audioInit();")
rep("  ['ovTitle','ovSelect','ovUpg','ovPause','ovOver','ovHelp'].forEach(id=>show(id,false));","  ['ovTitle','ovSelect','ovUpg','ovPause','ovOver','ovHelp','ovLearn','ovEcho'].forEach(id=>show(id,false));")
rep("function gameOver(){\n  G.screen='over';saveClone();","function gameOver(){\n  if(CLONE.duel.on)endDuel('clone');\n  if(G.mode==='echo'){echoFinish(G.echo&&G.echo.phase==='duel'?'lose':'trainfail');return;}\n  G.screen='over';saveClone();")
rep("function openSelect(){G.screen='select';['ovTitle','ovOver','ovPause','ovHelp','ovUpg'].forEach(id=>show(id,false));show('ovSelect',true);",
    "function openSelect(){G.screen='select';['ovTitle','ovOver','ovPause','ovHelp','ovUpg','ovLearn','ovEcho'].forEach(id=>show(id,false));show('ovSelect',true);"
    "$('ovSelect').querySelector('h2').textContent=selMode==='echo'?'ECHO DUEL: PICK A FIGHTER':'CHOOSE YOUR FIGHTER';$('fightBtn').textContent=selMode==='echo'?'START TRAINING':'FIGHT!';")
rep("$('startBtn').addEventListener('click',()=>{audioInit();","$('echoBtn').addEventListener('click',()=>{selMode='echo';audioInit();if(root.classList.contains('touch')&&!isFs())enterFs();openSelect();});\n"
    "$('echoAgain').addEventListener('click',()=>{if(G.echo&&P)startEchoDuel();});$('echoMore').addEventListener('click',startEcho);$('echoSwitch').addEventListener('click',openSelect);\n"
    "$('startBtn').addEventListener('click',()=>{selMode='endless';audioInit();")
rep("$('fightBtn').addEventListener('click',startGame);","$('fightBtn').addEventListener('click',()=>selMode==='echo'?startEcho():startGame());")
rep("b.addEventListener('dblclick',()=>{selHero=id;startGame();});","b.addEventListener('dblclick',()=>{selHero=id;selMode==='echo'?startEcho():startGame();});")
rep("$('quitBtn').addEventListener('click',()=>{P=null;","$('quitBtn').addEventListener('click',()=>{if(CLONE.duel.on)endDuel('ended');P=null;")
# rendering hooks
rep("  enemies.forEach(e=>drawFighter(c,e,t));\n  if(P&&P.alive)drawFighter(c,P,t);","  enemies.forEach(e=>drawFighter(c,e,t));\n  if(P&&P.alive)drawFighter(c,P,t);\n  drawEnemyFx(c,t);if(DEBUG)drawDebug(c,t);")
rep("  if(G.screen!=='title'&&G.screen!=='select')drawHUD(c,t);","  if(G.screen!=='title'&&G.screen!=='select'){drawHUD(c,t);drawBossHUD(c,t);drawEchoHUD(c,t);if(DEBUG)drawDebugScreen(c);}")
rep("  drawCutin(c,t);drawBanner(c);drawAnn(c);","  drawCutin(c,t);drawBanner(c);drawBossCard(c,t);drawAnn(c);")
rep("  let ty=64;","  let ty=64+(bossOf()?46:0)+(G.mode==='echo'&&G.echo&&G.echo.phase==='train'?40:0);")
rep("c.fillText('WAVE '+G.wave+'  ·  BEST '+best,cx,28);","c.fillText(G.mode==='echo'?'ECHO DUEL':'WAVE '+G.wave+'  ·  BEST '+best,cx,28);")
rep("    if(f.role==='clone'){const lbl='AI: '","    if(f.pers&&PERS[f.pers]){c.font='600 11px Fredoka, sans-serif';c.lineWidth=3;c.strokeText(PERS[f.pers].n,f.x,yy-20);c.fillStyle=PERS[f.pers].c;c.fillText(PERS[f.pers].n,f.x,yy-20);}\n    if(f.role==='clone'){const lbl='AI: '")
rep("  c.save();c.translate(f.x,f.y);\n","  c.save();if(f.blink)c.globalAlpha=Math.max(.15,f.blink.t/.38);c.translate(f.x,f.y);\n")
rep("  if(G.screen==='play')update(dt);\n","  if(G.screen==='play')update(dt);\n  else if(G.screen==='learn')echoLearnTick();\n")
rep("  boss:['Here comes the boss!","  bossKO:['{boss} is going back into the rift in pieces!','Boss down! {boss} did not see that one coming!'],\n  boss:['Here comes the boss!")
extra=R('ai4_extra.js')+'''
function drawEchoHUD(c,t){
  const E=G.echo;if(G.mode!=='echo'||!E||E.phase!=='train')return;const n=Math.min(ECHO_NEED,CLONE.seen-E.start),w=Math.min(360,VW-40),x=VW/2-w/2,y=62;
  rr(c,x,y,w,34,10);c.fillStyle='rgba(18,8,34,.82)';c.fill();c.strokeStyle='rgba(62,230,255,.6)';c.lineWidth=2;c.stroke();
  c.font='600 12px Fredoka, sans-serif';c.textAlign='left';c.fillStyle='#E9FDFF';c.fillText('Recording your decisions: '+n+' / '+ECHO_NEED+'   ·   '+Math.floor(E.t)+' s',x+10,y+14);
  rr(c,x+10,y+20,w-20,7,3);c.fillStyle='#3A2463';c.fill();rr(c,x+10,y+20,(w-20)*Math.min(1,Math.max(n/ECHO_NEED,E.t/ECHO_MAX)),7,3);c.fillStyle='#3EE6FF';c.fill();
}
function persList(){const ul=$('persList');if(!ul||ul.dataset.done)return;ul.dataset.done='1';Object.keys(PERS).forEach(k=>{const li=document.createElement('li');const b=document.createElement('strong');b.textContent=PERS[k].n;b.style.color=PERS[k].c;li.appendChild(b);
  li.appendChild(document.createTextNode(' · '+PERS[k].d));ul.appendChild(li);});const li=document.createElement('li');const b=document.createElement('strong');b.textContent='BOSSES';li.appendChild(b);
  li.appendChild(document.createTextNode(' · Three phases (at 60% and 120% damage) each add a move. Every attack is telegraphed, then leaves an opening. Repeat one move 4 times in 6 s and the boss starts countering it; guard too much and it switches to guard breaks.'));ul.appendChild(li);}
persList();
'''
rep("/* ================= SCREENS + LAYOUT ================= */",extra+"\n/* ================= SCREENS + LAYOUT ================= */")
rep("window.__rr={ART,ARENAS,CLONE,PRED,ANN,startWave,G,AI,","window.__rr={ART,ARENAS,CLONE,PRED,ANN,startWave,G,AI,PERS,BATK,BOSSDEF,OBS,HUNT,STATS,startEcho,startEchoDuel,echoFinish,bossOf,endDuel,spawnEnemy,renderBrain,get DEBUG(){return DEBUG;},")
open(p,'w').write(s);print('phase4 ok')
