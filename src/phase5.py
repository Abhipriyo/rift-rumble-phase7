"""Phase 5: progression. Upgrade rarity/categories/caps, bounties, milestone + boss rewards, medals,
local player profile and an end-of-run summary. Applied after phase4.py."""
p='rift-rumble.html';s=open(p).read()
def rep(o,n,c=1):
    global s
    k=s.count(o);assert k==c,(o[:90],k);s=s.replace(o,n)

# ---------------- HTML ----------------
rep('<button class="big alt" type="button" id="echoBtn">ECHO DUEL</button>','<button class="big alt" type="button" id="echoBtn">ECHO DUEL</button><button class="big alt" type="button" id="profBtn">Profile</button>')
rep('      <p>Pick one power-up for the next wave.</p>\n      <div class="picks" id="upgList"></div>',
    '      <p id="upgInfo" class="upgInfo"></p>\n      <p>Pick one power-up for the next wave.</p>\n      <div class="picks" id="upgList"></div>\n'
    '      <div class="row2"><button class="mini" type="button" id="rerollBtn" hidden>Reroll</button></div>\n      <p class="sub" id="buildLine"></p>')
rep('      <p id="overTxt"></p>','      <p id="overTxt"></p>\n      <div id="sumBox" class="sumBox"></div>')
rep('<button class="big alt" type="button" id="switchBtn">Change fighter</button>','<button class="big alt" type="button" id="switchBtn">Change fighter</button><button class="big alt" type="button" id="profBtn2">Profile</button>')
rep('    <div class="overlay" id="ovOver" hidden>','''    <div class="overlay" id="ovProfile" hidden>
      <h2>PLAYER PROFILE</h2>
      <p class="sub">Saved only in this browser on this device. It is not synced to other devices or sent anywhere.</p>
      <p class="sub warn" id="profStatus"></p>
      <dl class="kv wide" id="profKV"></dl>
      <h3 class="profH">Medals <span id="profMedCount"></span></h3>
      <div class="medals" id="profMedals"></div>
      <h3 class="profH">Recent matches</h3>
      <div class="tblWrap"><table class="recent"><thead><tr><th>Date</th><th>Hero</th><th>Wave</th><th>KOs</th><th>Combo</th><th>Result</th></tr></thead><tbody id="profRecent"></tbody></table></div>
      <div class="row"><button class="big" type="button" id="profClose">Close</button><button class="big alt" type="button" id="profReset">Reset statistics</button></div>
    </div>

    <div class="overlay" id="ovOver" hidden>''')
css='''.pick .rar{font:700 11px var(--body);letter-spacing:.08em}
.upgInfo{color:#B8FFC4;font-size:14px;min-height:1px}
.sumBox{width:100%;max-width:560px;display:flex;flex-direction:column;gap:8px;text-align:left;background:var(--panel);border:2px solid var(--line);border-radius:12px;padding:10px 14px}
.sumBox .kv{font-size:14px}
@media (min-width:600px){.sumBox{max-width:760px}.sumBox .kv{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) auto;column-gap:22px}}.sumH{font-size:13px;color:var(--muted);margin-right:4px}.sumMed{margin:0;color:var(--zap);font-size:14px}
.profH{margin:4px 0 0;font-family:var(--display);font-weight:400;font-size:22px;letter-spacing:.04em}
.medals{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;width:100%;max-width:760px}
.medal{background:var(--panel);border:2px solid var(--line);border-radius:10px;padding:6px 8px;text-align:left;display:flex;flex-direction:column;opacity:.55}
.medal.got{opacity:1;border-color:var(--zap)}.medal strong{font-size:14px}.medal small{font-size:12px;color:var(--muted)}
.tblWrap{width:100%;max-width:760px;overflow-x:auto}
.recent{width:100%;border-collapse:collapse;font-size:13px}.recent th,.recent td{padding:4px 6px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap}
.recent th{color:var(--muted);font-weight:600}
.warn{color:#FFB3C6}
#ovProfile{z-index:12;background:#120828}
'''
i=s.index('</style>');s=s[:i]+css+s[i:]

# ---------------- JS ----------------
i=s.index('function showUpgrades(){');j=s.index('/* ================= TUTORIAL HINTS',i);s=s[:i]+s[j:]
rep("G.waveDone=true;G.waveDoneT=1.2;","G.waveDone=true;G.waveDoneT=1.2;waveCleared();")
rep("if(G.waveDone&&G.waveDoneT>0){G.waveDoneT-=dt;if(G.waveDoneT<=0)showUpgrades();}","if(G.waveDone&&G.waveDoneT>0){G.waveDoneT-=dt;if(G.waveDoneT<=0)afterWave();}")
rep("  if(clone){ann('clone',","  waveStarted(boss,clone);\n  if(clone){ann('clone',")
rep("      dmg*=.2;t.pct+=dmg;","      dmg*=.2*(upg('guardup')?.5:1);t.pct+=dmg;")
rep("if(t.guardT<.16){perfectGuard","if(t.guardT<.16+.06*upg('guardup')){perfectGuard")
rep("t.guardT>=.16)","t.guardT>=.16+.06*upg('guardup'))")
rep("t.stun=blocked?.14:Math.min(1.3,.16+sp*.0006);","t.stun=blocked?.14:Math.min(1.3,.16+sp*.0006)*(t.team==='hero'?1-.25*upg('recover'):1);")
rep("    if(t.shield>0&&!h.unblock){","    if(t.aegis&&!h.unblock){t.aegis=0;pop(t.x,t.y-t.h-12,'AEGIS!','#FFB03A',26);sparks(t.x,t.y-40,10,'#FFB03A',220);sfx('guard');return false;}\n    if(t.shield>0&&!h.unblock){")
rep("function heroDmgMul(){return (1+.2*upg('power'))*(P&&P.awake>0?1.3:1)*HEROES[G.hero].stats.power;}",
    "function heroDmgMul(){return (1+.2*upg('power'))*(P&&P.awake>0?1.3:1)*HEROES[G.hero].stats.power*(upg('combo')&&G.hits>=5?1.15:1);}")
rep("p.dashT=.17;p.dashCd=.38;p.inv=Math.max(p.inv,.14);","p.dashT=.17*(1+.25*upg('dodge'));p.dashCd=.38;p.inv=Math.max(p.inv,.14+.08*upg('dodge'));")
rep("if(!was&&f.team==='hero'){dust(f.x,p.y,5);f.upUsed=false;f.airDash=1;","if(!was&&f.team==='hero'){dust(f.x,p.y,5);f.upUsed=false;f.airDash=1+upg('airdash');")
rep("p.specCd=sp.cd*cdm;","p.specCd=sp.cd*cdm*Math.pow(.7,upg('sig'));")
rep("f.alive=false;G.kos++;","f.alive=false;G.kos++;if(P&&upg('vamp'))P.pct=Math.max(0,P.pct-6*upg('vamp'));")
rep("function perfectGuard(t,h){\n","function perfectGuard(t,h){\n  PROG.perfects++;medal('perfect');\n")
rep("else if(h.src==='hero'){STATS.dealt+=d;","else if(h.src==='hero'){STATS.dealt+=d;if(P&&!P.onGround)PROG.airHits++;")
rep("  ann('bossKO',{boss:f.name},3);\n}","  ann('bossKO',{boss:f.name},3);bossReward(f);\n}")
rep("endDuel('player');","endDuel('player');medal('clone');")
rep("  G.screen='over';saveClone();","  G.screen='over';saveClone();const _res=recordRun('ko');buildSummary(_res);")
rep("STATS.reset();HUNT.reset();","STATS.reset();HUNT.reset();PROG.reset();G.bounty=null;")
rep("$('quitBtn').addEventListener('click',()=>{if(CLONE.duel.on)endDuel('ended');","$('quitBtn').addEventListener('click',()=>{if(CLONE.duel.on)endDuel('ended');if(PROG.active&&G.mode==='endless'&&P)recordRun('quit');")
rep("E.phase='report';G.screen='echoReport';","E.phase='report';G.screen='echoReport';recordEcho(res);")
rep("updatePlayer(dt);updateZip(dt);aiTick(dt);","updatePlayer(dt);updateZip(dt);aiTick(dt);progTick(dt);")
rep("drawHUD(c,t);drawBossHUD(c,t);","drawHUD(c,t);drawBossHUD(c,t);drawBountyHUD(c,t);")
rep("drawEnemyFx(c,t);","drawEnemyFx(c,t);drawPlayerFx(c,t);")
rep("  let ty=64+(bossOf()?46:0)+","  let ty=64+(bossOf()?46:0)+(G.bounty&&G.mode==='endless'?30:0)+")
rep("/* ================= SCREENS + LAYOUT ================= */",open('p5.js').read()+"\n/* ================= SCREENS + LAYOUT ================= */")
rep("$('startBtn').addEventListener('click',()=>{selMode='endless';",
    "$('profBtn').addEventListener('click',()=>{audioInit();openProfile();sfx('ui');});$('profBtn2').addEventListener('click',openProfile);$('profClose').addEventListener('click',closeProfile);\n"
    "$('profReset').addEventListener('click',()=>{if(!resetArm){resetArm=true;$('profReset').textContent='Tap again to erase all stats';return;}profReset();openProfile();});\n"
    "$('rerollBtn').addEventListener('click',reroll);\n"
    "$('startBtn').addEventListener('click',()=>{selMode='endless';")
rep("window.__rr={ART,","window.__rr={PROG,PROF,UPG5,MEDALS,BOUNTY,rollUpgrades,recordRun,openProfile,profLoad,showUpgrades,get bounty(){return G.bounty;},ART,")
open(p,'w').write(s);print('phase5 ok')
