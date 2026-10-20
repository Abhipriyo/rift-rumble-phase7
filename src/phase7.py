"""Phase 7: hero signature mechanics, arena mechanics, the five art-pack enemies (Rift Lord final boss),
Boss Rush + Challenge modes, visual polish (lighting, impacts, KO blasts, interpolation, HUD) and
concept-sheet styled title/select screens. Applied after phase6.py."""
p='rift-rumble.html';s=open(p).read()
def rep(o,n,c=1):
    global s
    k=s.count(o);assert k==c,(o[:90],k);s=s.replace(o,n)

# ---------------- HTML ----------------
i=s.index('    <div class="overlay" id="ovTitle">');j=s.index('    <div class="overlay" id="ovSelect" hidden>')
s=s[:i]+'''    <div class="overlay ttl7" id="ovTitle">
      <div class="logo7" role="img" aria-label="Rift Rumble"><div class="lg"><span>RIFT</span><span>RUMBLE</span></div><span class="jpl7" aria-hidden="true">リフトランブル</span></div>
      <p class="tag7">Four universes. Twelve heroes. <em>Endless chaos.</em></p>
      <div class="uni7" id="uni7"></div>
      <div class="strip7" id="strip7"></div>
      <div class="row"><button class="big" type="button" id="startBtn">PRESS START</button><button class="big alt" type="button" id="rushBtn">BOSS RUSH</button><button class="big alt" type="button" id="chalBtn">CHALLENGES</button><button class="big alt" type="button" id="echoBtn">ECHO DUEL</button></div>
      <div class="row2"><button class="mini" type="button" id="profBtn">Profile</button><button class="mini" type="button" id="helpBtn1">Controls</button><button class="mini" type="button" id="setBtn">Settings</button><button class="mini annToggle" type="button" hidden></button><button class="mini voiceToggle" type="button" hidden></button></div>
      <p id="artStatus" style="color:var(--muted);font-size:12px">Loading character art...</p>
      <p style="color:var(--muted);font-size:12px">On a phone, the mode buttons open full screen play. Turn your phone sideways. Works with touch, keyboard or a game controller.</p>
    </div>

    <div class="overlay" id="ovChal" hidden>
      <h2>CHALLENGES</h2>
      <p class="sub">Fixed rules and no power-ups. Results are saved in your profile on this device.</p>
      <div class="chals" id="chalList"></div>
      <div class="row"><button class="big alt" type="button" id="chalBack">Back</button></div>
    </div>

'''+s[j:]
rep('      <h2>CHOOSE YOUR FIGHTER</h2>\n','      <h2>CHOOSE YOUR FIGHTER</h2>\n      <p id="modeInfo7" class="modeInfo7"></p>\n')
rep('      <div class="heroes" id="heroGrid"></div>\n','      <div class="heroes" id="heroGrid"></div>\n      <div class="mechInfo7" id="mechInfo7"></div>\n')
rep('      <h2>WIPED OUT!</h2>','      <h2 id="overTitle">WIPED OUT!</h2>')
rep('''          <p class="sub">Defaults follow your device's reduce-motion setting.</p>''','''          <div class="segRow"><span id="lblGfx">Graphics</span><div class="seg" id="segGfx" role="group" aria-labelledby="lblGfx"></div></div>
          <p class="sub">Shake and flash defaults follow your device's reduce-motion setting. Graphics: Standard turns off character lighting and atmosphere effects. Auto keeps them on unless this device struggles to draw them.</p>''')

css=r'''.ttl7{justify-content:flex-start;gap:10px;background:radial-gradient(ellipse at 50% -10%,rgba(90,30,150,.6),rgba(10,4,24,.93) 68%),rgba(10,4,24,.6)}
.logo7{display:flex;flex-direction:column;align-items:center;margin-top:4px;line-height:.82;user-select:none}
.logo7 .lg{display:flex;gap:.2em;font-family:var(--display);font-size:clamp(50px,10vw,112px);transform:skew(-11deg) rotate(-3deg);letter-spacing:.02em}
.logo7 .lg span{background:linear-gradient(180deg,#FFF6A8 0%,#FFD23F 38%,#FF8A1F 72%,#FF3D3D 100%);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-stroke:2px #2A0A12;filter:drop-shadow(4px 4px 0 #D7263D) drop-shadow(8px 8px 0 #1B0B33)}
.jpl7{font:700 15px "Noto Sans JP","Hiragino Sans",sans-serif;letter-spacing:.35em;color:#FFE6F2;margin-top:10px;text-shadow:0 0 12px #FF3D8B}
.tag7{max-width:none!important;font:600 12px var(--body);letter-spacing:.24em;color:#9FD8FF;text-transform:uppercase;margin:0}.tag7 em{color:#FF5CA8;font-style:normal}
.uni7{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;width:100%;max-width:900px}
.narrow .uni7{grid-template-columns:repeat(2,minmax(0,1fr))}
.uniB7{position:relative;display:flex;align-items:center;gap:8px;min-height:46px;padding:6px 14px;border:0;background:linear-gradient(110deg,rgba(14,6,30,.95) 35%,var(--u1) 160%);color:#fff;font:400 17px var(--display);letter-spacing:.06em;cursor:pointer;clip-path:polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%);text-align:left;box-shadow:inset 0 -3px 0 var(--u1)}
.uniB7::before{content:'';position:absolute;inset:0;border:2px solid var(--u1);opacity:.7;pointer-events:none}
.uniB7:hover{filter:brightness(1.25)}.uniB7:focus-visible,.hero7:focus-visible{outline:none}
.uniB7:focus-visible::after,.hero7:focus-visible::after{content:'';position:absolute;inset:3px 9%;border:3px solid var(--hero,#3EE6FF);pointer-events:none}
.em7{flex:0 0 auto;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;border:2px solid var(--u1);color:var(--u1);font:700 15px "Noto Sans JP",sans-serif;background:rgba(0,0,0,.55);box-shadow:0 0 12px var(--u1)}
.strip7{display:grid;grid-template-columns:repeat(12,minmax(66px,1fr));gap:3px;width:100%;max-width:1120px;overflow-x:auto;padding:2px 2px 6px}
.narrow .strip7{grid-template-columns:repeat(6,minmax(0,1fr))}
.hero7{position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;padding:0 4px 6px;border:0;background:linear-gradient(180deg,var(--u1) -40%,#1A0B36 55%,#0E0620 100%);color:#fff;cursor:pointer;clip-path:polygon(13% 0,100% 0,87% 100%,0 100%);min-width:0;box-shadow:inset 0 -3px 0 var(--u1)}
.hero7 canvas{width:100%;height:auto;aspect-ratio:92/112;display:block}
.hero7 strong{font:400 11px var(--display);letter-spacing:.04em;line-height:1.05;text-align:center;margin-top:-6px;text-shadow:0 2px 0 #000}
.hero7 .jp7{font-size:9px;color:var(--u2);line-height:1.1}.hero7 .rl7{font:700 8px var(--body);letter-spacing:.06em;color:var(--u1);line-height:1.1;text-align:center}
.hero7:hover{filter:brightness(1.3)}
.tab7{clip-path:polygon(10px 0,100% 0,calc(100% - 10px) 100%,0 100%);border-radius:0!important;border:0!important;background:linear-gradient(110deg,#1A0D36 35%,var(--u1) 190%)!important;color:#E9DDFF!important;padding:6px 20px!important;display:inline-flex;align-items:center;gap:8px;box-shadow:inset 0 -3px 0 var(--u1)}
.tab7[aria-selected="true"]{background:linear-gradient(110deg,var(--u1),var(--u2))!important;color:#fff!important;text-shadow:0 2px 0 rgba(0,0,0,.45)}
.em7s{font:700 13px "Noto Sans JP",sans-serif;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.45);border:1.5px solid currentColor}
.hc7{border-radius:6px;border-color:color-mix(in srgb,var(--u1) 60%,#3A2463)}
.hc7 .jp7{font:700 12px "Noto Sans JP",sans-serif;color:var(--u2);margin-top:-2px}
.chip7{font:700 11px var(--body);letter-spacing:.08em}
.modeInfo7{color:#9FD8FF;font-size:14px;max-width:62ch}
.mechInfo7{width:100%;max-width:880px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;text-align:left}
.narrow .mechInfo7{grid-template-columns:1fr}
.mi7{background:var(--panel);border:2px solid var(--line);border-left:4px solid #FFE14D;border-radius:8px;padding:6px 10px;display:flex;flex-direction:column;gap:2px;font-size:13px}
.mi7 b{font:700 11px var(--body);letter-spacing:.08em;color:#FFE14D}.mi7.weak{border-left-color:#FF2E63}.mi7.weak b{color:#FF7A9A}.mi7.arena{border-left-color:#7FE7FF}.mi7.arena b{color:#7FE7FF}
.chals{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:10px;width:100%;max-width:880px}
.chal{text-align:left;background:linear-gradient(160deg,var(--panel-2),var(--panel));border:2px solid var(--line);border-radius:12px;padding:10px 12px;color:var(--ink);font:inherit;cursor:pointer;display:flex;flex-direction:column;gap:4px}
.chal strong{font:400 22px var(--display);letter-spacing:.04em;color:var(--zap)}.chal span{font-size:13px}.chal small{color:var(--muted);font-size:12px}
.narrow .hero7 strong{font-size:9px;letter-spacing:0}.narrow .hero7 .rl7{display:none}.narrow .hero7 .jp7{font-size:8px}
.narrow .uniB7{font-size:14px;padding:6px 10px;min-height:40px}.narrow .em7{width:24px;height:24px;font-size:12px}
.chal.done{border-color:#7DFF8A}.chal.done small{color:#B8FFC4}.chal:hover,.chal:focus-visible{border-color:var(--zap)}
</style>'''
rep('</style>',css)

# ---------------- settings: graphics quality ----------------
rep("diff:'normal',keys:JSON.parse(JSON.stringify(KEYDEF))};}","diff:'normal',gfx:'auto',keys:JSON.parse(JSON.stringify(KEYDEF))};}")
rep("if(d.diff in DIFFS)o.diff=d.diff;","if(d.diff in DIFFS)o.diff=d.diff;if(d.gfx==='auto'||d.gfx==='high'||d.gfx==='standard')o.gfx=d.gfx;")
rep("  seg('segDiff',","  seg('segGfx',[['auto','Auto'],['high','High'],['standard','Standard']],SET.gfx,v=>{SET.gfx=v;setSave();renderSettings();});\n  seg('segDiff',")

# ---------------- profile: mode records ----------------
rep("echo:{played:0,won:0},heroes:{},unis:{},medals:{},recent:[]};}","echo:{played:0,won:0},heroes:{},unis:{},medals:{},recent:[],modes:{rush:{runs:0,clears:0,best:0},chal:{}}};}")
rep("  if(d.echo&&typeof d.echo==='object'){o.echo.played=num(d.echo.played);o.echo.won=Math.min(num(d.echo.won),o.echo.played);}",
    "  if(d.echo&&typeof d.echo==='object'){o.echo.played=num(d.echo.played);o.echo.won=Math.min(num(d.echo.won),o.echo.played);}\n"
    "  if(d.modes&&typeof d.modes==='object'){const r=d.modes.rush&&typeof d.modes.rush==='object'?d.modes.rush:{};o.modes.rush={runs:num(r.runs),clears:Math.min(num(r.clears),num(r.runs)),best:num(r.best)};\n"
    "    const ch=d.modes.chal;if(ch&&typeof ch==='object')['perfect','fists','onelife','sky','blitz','slayer'].forEach(k=>{const v=ch[k];if(v&&typeof v==='object')o.modes.chal[k]={tries:num(v.tries),clears:Math.min(num(v.clears),num(v.tries)),best:num(v.best)};});}")

# ---------------- game hooks ----------------
rep("G.mode=selMode==='echo'?'echo':'endless';","G.mode=selMode==='echo'?'echo':selMode==='bossrush'?'bossrush':selMode==='challenge'?'challenge':'endless';")
rep("  updateProjs(dt);\n","  updateProjs(dt);arenaTick7(dt);fxTick7(dt);modeTick7(dt);\n")
rep("  drawSky(t,dt);\n  c.save();c.translate(VW/2,VH/2);","  drawSky(t,dt);if(G.screen!=='title'&&G.screen!=='select')drawAtmos7(c,t);\n  c.save();c.translate(VW/2,VH/2);")
rep("  plats.forEach(p=>drawPlat(c,p));\n","  plats.forEach(p=>drawPlat(c,p));drawArena7Back(c,t);\n")
rep("  drawSuperFx(c,t);drawFx(c,t);\n","  drawSuperFx(c,t);drawFx(c,t);drawFx7(c,t);drawArena7Front(c,t);\n")
rep("  c.restore();drawKO(c);c.restore();\n","  c.restore();drawKO(c);drawScreen7(c,t);c.restore();\n")
rep("drawHUD(c,t);drawBossHUD(c,t);","drawHUD(c,t);drawHUD7(c,t);drawBossHUD(c,t);")
rep("  if(f.onGround){c.fillStyle='rgba(10,4,24,.4)';ell(c,f.x,f.y+2,f.w*.75,6);c.fill();}\n","  shadow7(c,f);\n")
rep("rr(c,x0,y0,262,108,16);c.fillStyle='rgba(18,8,34,.78)';c.fill();c.strokeStyle='rgba(255,255,255,.12)';c.lineWidth=2;c.stroke();","hudPanel7(c,x0,y0,262,108,H.color);")
rep("rr(c,cx-110,10,220,46,14);c.fillStyle='rgba(18,8,34,.72)';c.fill();","hudPanel7(c,cx-130,10,260,46,'#FFE14D');")
rep("c.fillText(G.mode==='echo'?'ECHO DUEL':'WAVE '+G.wave+'  ·  BEST '+best,cx,28);","c.fillText(modeLabel7(),cx,28);")
rep("const yy=58/K;","const yy=58/K+(G.ePanel7?74:0);")
rep("    if(f.pers&&PERS[f.pers]){c.font='600 11px Fredoka, sans-serif';","    if(f.pers&&PERS[f.pers]&&labelOK7(f)){c.font='600 11px Fredoka, sans-serif';")
# bug fix: delayed rings (negative start time, e.g. the boss-defeat rings) threw a negative-radius error when drawn
rep("  fx.forEach(e=>{const p=e.t/e.dur;","  fx.forEach(e=>{const p=e.t/e.dur;if(p<0)return;")
# fixed-step interpolation
rep("while(PERF.acc>=STEP-1e-9&&steps<8&&G.screen==='play'){update(STEP);","while(PERF.acc>=STEP-1e-9&&steps<8&&G.screen==='play'){snapPrev7();update(STEP);")
rep("  render(t,G.screen==='play'?fdt:0);\n  const u2=performance.now();","  const _i7=G.screen==='play'?applyInterp7(PERF.acc/STEP):0;render(t,G.screen==='play'?fdt:0);if(_i7)restoreInterp7();\n  const u2=performance.now();")

rep("  PERF.cnt++;","  PERF.cnt++;autoGfx7();")
rep("window.__rr={SET,","window.__rr={MECH,ARENA7,NEWEN,CHALS,fx7,endMode7,makeNew,chalById,LORD_PAIR,BOSS_PAIRS,rushList,modeRec7,hudPanel7,snapPrev7,applyInterp7,get lowGfx7(){return lowGfx7;},set lowGfx7(v){lowGfx7=v;slowF7=0;},restoreInterp7,inKi7,inShadow7,arenaGrav7,gravScale7,breakProp7,heroHit7,drawBust7,"
    "get __makeEnemy(){return makeEnemy;},get selChal(){return selChal;},set selChal(v){selChal=v;},get selMode(){return selMode;},set selMode(v){selMode=v;},startWave,afterWave,koFighter,applyHit,physics,openChal7,SET,")

# ---------------- modules ----------------
mods=''.join(open(f).read()+'\n' for f in ['p7_enemies.js','p7_heroes.js','p7_arena.js','p7_modes.js','p7_fx.js','p7_ui.js'])
mark='/* ================= SCREENS + LAYOUT ================= */'
rep(mark,mods+mark)
open(p,'w').write(s);print('phase7 ok')
