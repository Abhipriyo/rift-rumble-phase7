import re
p='rift-rumble.html';s=open(p).read()
art=open('art_module.js').read()
MARK='  /* ---------- pose overrides (render-only) ---------- */'
assert art.count(MARK)==1
extra=''.join(open(f).read()+'\n' for f in ['art_enemies.js','art_ki.js','art_cape.js','art_mighty.js','art_new.js'] if __import__('os').path.exists(f))
art=art.replace(MARK,extra+MARK);arena=open('arena_module.js').read()
assert arena.count('  const A={sh:shinobi()};')==1
arena=arena.replace('  const A={sh:shinobi()};',open('arena_more.js').read()+'\n  const A={sh:shinobi(),ki:dojo,cape:metro,mighty:cosmos};')
def rep(old,new,count=1):
    global s
    n=s.count(old)
    assert n==count,(old[:80],n)
    s=s.replace(old,new)
rep("const PK=['lean','ht','fa1','fa2','ba1','ba2','fl1','fl2','bl1','bl2'];","const PK=['lean','ht','fa1','fa2','ba1','ba2','fl1','fl2','bl1','bl2','wr'];")
rep("const BASE={lean:.06,ht:0,fa1:.9,fa2:1.6,ba1:.6,ba2:1.8,fl1:.32,fl2:-.4,bl1:-.28,bl2:-.22};","const BASE={lean:.06,ht:0,fa1:.9,fa2:1.6,ba1:.6,ba2:1.8,fl1:.32,fl2:-.4,bl1:-.28,bl2:-.22,wr:0};")
rep("  hover:mk({lean:.1,fa1:.4,fa2:.6,ba1:-.3,ba2:.6,fl1:.2,fl2:-.3,bl1:-.1,bl2:-.5})\n};","  hover:mk({lean:.1,fa1:.4,fa2:.6,ba1:-.3,ba2:.6,fl1:.2,fl2:-.3,bl1:-.1,bl2:-.5}),\n  victory:mk({lean:-.05,fa1:2.9,fa2:.2,ba1:.4,ba2:1.9,fl1:.4,fl2:-.4,bl1:-.4,bl2:-.2})\n};")
rep("/* ================= HEROES + UNIVERSES ================= */",art+"\n"+arena+"\n/* ================= HEROES + UNIVERSES ================= */")
rep("enemies:{grunt:['Bandit','bandit']","enemies:{grunt:['Shadow Assassin','bandit']")
rep("  return baseFighter({team:'hero',kind:G.hero,cos:COS[G.hero],","  return baseFighter({team:'hero',kind:G.hero,cos:COS[G.hero],artId:ART.heroArt[G.hero]||null,")
rep("  const e=baseFighter({team:'enemy',role,name,cosId,cos:COS[cosId],custom:CUSTOM[cosId],","  const e=baseFighter({team:'enemy',role,name,cosId,cos:COS[cosId],custom:CUSTOM[cosId],artId:(role==='clone'?ART.heroArt[cosId]:ART.enemyArt[cosId])||null,")
rep("function snap(f){return {x:f.x,y:f.y,face:f.face,pose:Object.assign({},f.pose),onGround:f.onGround,t:0,kind:f.kind,cos:f.cos,custom:f.custom,id:f.id,mood:f.mood};}",
    "function snap(f){return {x:f.x,y:f.y,face:f.face,pose:Object.assign({},f.pose),onGround:f.onGround,t:0,kind:f.kind,cos:f.cos,custom:f.custom,id:f.id,mood:f.mood,artId:f.artId,role:f.role,h:f.h};}")
rep("drawBodyAt(c,{pose:s.pose,onGround:s.onGround,id:s.id,cos:s.cos,custom:s.custom,mood:s.mood,vx:0,act:null,punchT:0,wind:0},t);",
    "drawBodyAt(c,{pose:s.pose,onGround:s.onGround,id:s.id,cos:s.cos,custom:s.custom,mood:s.mood,vx:0,act:null,punchT:0,wind:0,artId:s.artId,face:s.face,h:s.h,x:s.x,y:s.y},t);")
rep("function drawBodyAt(c,f,t){\n  if(f.custom){f.custom(c,f,t);return;}","function drawBodyAt(c,f,t){\n  if(f.custom){f.custom(c,f,t);return;}\n  if(f.artId&&ART.draw(c,f,t))return;")
rep("function drawFighter(c,f,t){","""function drawCharacter(c,f,heroId,t){
  if(f.artId===undefined)f.artId=ART.heroArt[heroId]||null;
  if(f.artId&&ART.draw(c,f,t))return;
  drawRig(c,f,COS[heroId],t);
}
function drawFighter(c,f,t){""")
rep("  if(f.handTrail.length>2){const H=","  if(f.handTrail.length>2&&!f._artSlash){const H=")
a=s.index("function poseFor(f){");b=s.index("function updateCam(dt){")
old_pf=s[a:b]
new_pf=old_pf.replace("POSE[f.act.t<d.act[0]?d.pose[0]:d.pose[1]]","PZ(f,f.act.t<d.act[0]?d.pose[0]:d.pose[1])")
new_pf=re.sub(r"POSE\.([a-zA-Z]+)",lambda m:"PZ(f,'"+m.group(1)+"')",new_pf)
new_pf=new_pf.replace("runPose(f.runPh)","(ART.run(f)||runPose(f.runPh))").replace("idlePose(G.time+f.id)","(ART.idle(f,G.time+f.id)||idlePose(G.time+f.id))")
tgt="    if(f.act){const d=f.act.def;return PZ(f,f.act.t<d.act[0]?d.pose[0]:d.pose[1]);}\n    if(f.charge!=null)"
assert tgt in new_pf
new_pf=new_pf.replace(tgt,"    if(f.act){const d=f.act.def;return PZ(f,f.act.t<d.act[0]?d.pose[0]:d.pose[1]);}\n    if(G.waveDone&&f.onGround&&!f.guard&&f.dashT<=0)return PZ(f,'victory');\n    if(f.charge!=null)",1)
s=s[:a]+"const PZ=(f,name)=>ART.pose(f,name);\n"+new_pf+s[b:]
rep("const cyc=(t*.6+pc.f.id*.37)%3;const tp=cyc<1?idlePose(t):cyc<1.15?POSE.jabW:cyc<1.35?POSE.fin:cyc<2?idlePose(t):cyc<2.2?POSE.charge:POSE.cast;",
    "const cyc=(t*.6+pc.f.id*.37)%3;const idl=ART.idle(pc.f,t)||idlePose(t);const tp=cyc<1?idl:cyc<1.15?PZ(pc.f,'jabW'):cyc<1.35?PZ(pc.f,'fin'):cyc<2?idl:cyc<2.2?PZ(pc.f,'charge'):PZ(pc.f,'cast');")
rep("c.save();c.translate(160,182);c.scale(2.1,2.1);drawRig(c,pc.f,COS[pc.id],t);c.restore();});","c.save();c.translate(160,182);c.scale(2.1,2.1);drawCharacter(c,pc.f,pc.id,t);c.restore();});")
rep("previewCards.push({cvs,id,f:{id:uid++,mood:'idle',onGround:true,preview:true,pose:Object.assign({},BASE),vx:0,act:null,face:1,wind:0}});",
    "previewCards.push({cvs,id,f:{id:uid++,mood:'idle',onGround:true,preview:true,pose:Object.assign({},BASE),vx:0,act:null,face:1,wind:0,artId:ART.heroArt[id]||null}});")
rep("c.save();c.translate(Math.min(200,VW*.2),cy+120);c.scale(3.4,3.4);drawRig(c,fk,COS[G.hero],t);c.restore();c.restore();",
    "c.save();c.translate(Math.min(200,VW*.2),cy+120);c.scale(3.4,3.4);fk.artId=P.artId;fk.pose=PZ(P,'cast');drawCharacter(c,fk,G.hero,t);c.restore();c.restore();")
rep("c.translate(x0+38,y0+52);c.scale(1.7,1.7);COS[G.hero].head(c,port,t);c.restore();",
    "c.translate(x0+38,y0+52);c.scale(1.7,1.7);if(!(P.artId&&ART.portrait(c,P.artId,port,t)))COS[G.hero].head(c,port,t);c.restore();")
rep("function drawSky(t,dt){\n  const c=ctx;","function drawSky(t,dt){\n  const c=ctx;\n  if(ARENAS.sky(G.uni,c,t,dt))return;")
rep("function drawPlat(c,p){\n","function drawPlat(c,p){\n  if(ARENAS.platform(G.uni,c,p))return;\n")
rep("    case 'petal':c.rotate(q.spin*.5);c.fillStyle=q.color;ell(c,0,0,q.r,q.r*.5);c.fill();c.stroke();break;",
    "    case 'petal':{c.rotate(q.spin*.5);const r=q.r*1.2;c.beginPath();c.moveTo(-r,0);c.quadraticCurveTo(-r*.2,-r*.75,r*.75,-r*.25);c.lineTo(r*.45,0);c.lineTo(r*.75,r*.25);c.quadraticCurveTo(-r*.2,r*.75,-r,0);c.closePath();\n      c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.35;c.fillStyle=q.color;c.beginPath();c.arc(0,0,r*1.6,0,Math.PI*2);c.fill();c.restore();c.fillStyle=q.color;c.fill();c.lineWidth=1.2;c.stroke();break;}")
rep('<p style="color:var(--muted);font-size:13px">On a phone, PRESS START opens full screen play.',
    '<p id="artStatus" style="color:var(--muted);font-size:12px">Loading character art...</p>\n      <p style="color:var(--muted);font-size:13px">On a phone, PRESS START opens full screen play.')
rep("requestAnimationFrame(loop);\nwindow.__rr=","""(async()=>{
  let note='Art: classic renderer';
  try{await ART.loadPNG('assets/');const ids=Object.keys(ART.defs);
    note='New art: '+ids.map(id=>ART.defs[id].name+' ('+(ART.status[id]==='png'?'PNG sprites':ART.status[id]==='baked'?'built-in sprites':'classic fallback')+')').join(' · ');}catch(e){}
  const el=$('artStatus');if(el)el.textContent=note;
})();
requestAnimationFrame(loop);
window.__rr=""")
rep("window.__rr={G,AI,","window.__rr={ART,ARENAS,CLONE,PRED,ANN,startWave,G,AI,")

rep('<div class="row"><button class="big" type="button" id="startBtn">PRESS START</button>',
    '<div class="row"><button class="big" type="button" id="newArtBtn">TRY THE NEW ART</button><button class="big alt" type="button" id="startBtn">PRESS START</button>')
rep(".hcard .role{",".badge{display:inline-block;font:700 11px var(--body);letter-spacing:.08em;background:var(--danger);color:#fff;border-radius:6px;padding:2px 6px;margin-left:6px;vertical-align:middle}\n.tab .badge{font-size:10px;padding:1px 5px}\n.hcard .role{")
rep("const nm=document.createElement('strong');nm.textContent=H.name;b.appendChild(nm);",
    "const nm=document.createElement('strong');nm.textContent=H.name;b.appendChild(nm);if(ART.isNew(id)){const bd=document.createElement('span');bd.className='badge';bd.textContent='NEW ART';nm.appendChild(bd);}")
rep("b.textContent=UNIS[k].name;b.setAttribute('aria-selected',k===selUni?'true':'false');",
    "b.textContent=UNIS[k].name;if(UNIS[k].heroes.some(h=>ART.isNew(h))){const bd=document.createElement('span');bd.className='badge';bd.textContent='NEW';b.appendChild(bd);}b.setAttribute('aria-selected',k===selUni?'true':'false');")
rep("$('startBtn').addEventListener('click',",
    "$('newArtBtn').addEventListener('click',()=>{audioInit();selUni='sh';if(!ART.isNew(selHero))selHero='hana';G.uni='sh';if(root.classList.contains('touch')&&!isFs())enterFs();openSelect();});\n$('startBtn').addEventListener('click',")

open(p,'w').write(s)
print('ok')
