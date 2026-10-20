"""Roster lock: only the 12 heroes and 8 enemies from the Rift Rumble art sheet exist in the game.
Every enemy slot keeps its original gameplay numbers (role stats in EDEF, hitbox overrides, flight),
only the identity (name, art, fallback costume, projectile look) changes."""
import re
p='rift-rumble.html';s=open(p).read()
def rep(old,new,count=1):
    global s
    n=s.count(old)
    assert n==count,(old[:90],n)
    s=s.replace(old,new)

# ---- hero role labels exactly as on the art sheet
for hid,old,new in [('lila','Speed and lightning','Speedster'),('rokuro','Sword and scroll','Swordsman'),('hana','Petal sorcerer','Sword sorcerer'),
                    ('comet','Flying powerhouse','Flying fighter'),('raccoon','Gadget vigilante','Gadget fighter'),('jaguar','Claw rushdown','Claws fighter')]:
    rep(hid+":{name:",hid+":{name:")
    rep("role:'"+old+"'","role:'"+new+"'")

# ---- enemy slots. pair = [display name, enemy id, slot options]; options carry the slot's original
#      hitbox/flight so gameplay is identical to the previous enemy in that slot.
a=s.index("  ki:{name:'KI FIGHTERS'");b=s.index("};",a)
s=s[:a]+"""  ki:{name:'KI FIGHTERS',tag:'Martial artists holding the mountain dojo against the rift.',heroes:['kenji','lila','mochi'],
    enemies:{grunt:['Rift Grunt','rift_grunt'],shooter:['Rift Caster','rift_caster'],heavy:['Rift Beast','rift_beast'],boss:['ONI BRUTE','oni_brute']},shot:'#B57CFF',shotKind:'talisman'},
  sh:{name:'SHINOBI CLAN',tag:'Night rooftops, paper lanterns and shadow assassins.',heroes:['nyanja','rokuro','hana'],
    enemies:{grunt:['Shadow Assassin','shadow_assassin'],shooter:['Rift Caster','rift_caster'],heavy:['Oni Brute','oni_brute'],boss:['RIFT BEAST','rift_beast']},shot:'#B57CFF',shotKind:'talisman'},
  cape:{name:'CAPED LEAGUE',tag:'Neon city streets overrun by rift creatures.',heroes:['comet','raccoon','skate'],
    enemies:{grunt:['Rift Grunt','rift_grunt'],shooter:['Rift Caster','rift_caster'],heavy:['Mecha Sentinel','mecha_sentinel'],boss:['RIFT BEAST','rift_beast']},shot:'#B57CFF',shotKind:'talisman'},
  mighty:{name:'MIGHTY VANGUARD',tag:'A cosmic outpost on the edge of the rift.',heroes:['titan','gravity','jaguar'],
    enemies:{grunt:['Void Stalker','void_stalker'],shooter:['Rift Caster','rift_caster',{fly:true,w:50,h:44,art:'rift_caster_float'}],heavy:['Rift Beast','rift_beast',{w:64,h:74,art:'rift_beast_prowl'}],boss:['MECHA SENTINEL','mecha_sentinel',{h:110}]},shot:'#B57CFF',shotKind:'talisman'}
"""+s[b:]
rep("const EDEF={","/* projectile look per enemy (visual only; damage and speed still come from the role) */\nconst ENEMY_SHOT={rift_caster:['talisman','#B57CFF'],rift_beast:['eki','#C77DFF'],oni_brute:['eki','#FF2E4D'],mecha_sentinel:['ray','#5DB8FF']};\nconst EDEF={")

a=s.index("function makeEnemy(role,x,y){");b=s.index("const rect=f=>",a)
s=s[:a]+"""function makeEnemy(role,x,y){
  const d=EDEF[role];const u=UNIS[G.uni];const pair=role==='clone'?['Shadow '+HEROES[G.hero].name,G.hero]:u.enemies[role];const name=pair[0],cosId=pair[1],o=pair[2]||{};
  const scale=Math.min(1+G.wave*.015,1.25);
  const e=baseFighter({team:'enemy',role,name,cosId,cos:COS[cosId],custom:CUSTOM[cosId],artId:(role==='clone'?ART.heroArt[cosId]:(o.art||ART.enemyArt[cosId]))||null,x,y,w:d.w,h:d.h,face:-1,
    weight:d.weight*(role==='boss'?1+G.wave*.02:scale),cd:rnd(.6,1.4),dodgeCd:0,jcd:0,bmode:'walk',bt:1.5,slamming:false,
    dmgMul:1+Math.min(G.wave*.05,.6),bowlCd:0,spawnT:.9,fly:!!o.fly,combo:0});
  if(role==='clone')Object.assign(e,{maxJumps:2,jumps:2,specCd:1,dashCd:0,decT:.5,intent:0,intentP:0,lastMove:null,lastEnd:-9,weight:1.9+G.wave*.02,auraColor:'#FF2E63'});
  if(o.w)e.w=o.w;
  if(o.h)e.h=o.h;
  const sh=ENEMY_SHOT[cosId];if(sh){e.shotKind=sh[0];e.shotColor=sh[1];}
  if(role!=='clone'&&e.cos)e.cos=Object.assign({},e.cos,{scale:e.h/78});
  return e;
}
"""+s[b:]
rep("color:u.shot,kind:u.shotKind,spin:0,attacker:e});","color:e.shotColor||u.shot,kind:e.shotKind||u.shotKind,spin:0,attacker:e});")

# ---- remove the old enemy costumes; add simple on-design costumes used only if the new art fails to load
a=s.index("  gymbot:{");b=s.index("const CUSTOM={",a);b=s.index("\n};\n",b)+4
s=s[:a]+"""  /* fallback costumes for the 7 rift enemies (classic renderer only; the ART module normally draws them) */
  rift_grunt:{top:'#2E2A3A',sleeve:'#2E2A3A',fore:'#3E3250',glove:'#FF2E4D',pants:'#1E1A28',boots:'#141019',
    torso(c){c.fillStyle=col('#8E0F2C');c.fillRect(-10,-6,20,3);},
    head(c,f,t){headBase(c,'#1E1A28');if(!OVR){c.fillStyle='#F4F1FF';c.fillRect(3,-3,10,2.6);}c.beginPath();c.moveTo(-22,-6);c.lineTo(0,-21);c.lineTo(22,-6);c.closePath();fsC(c,'#2A2433');}},
  shadow_assassin:{top:'#221E33',sleeve:'#221E33',fore:'#3E3250',glove:'#191626',pants:'#221E33',boots:'#191626',
    torso(c){c.fillStyle=col('#8E0F2C');c.fillRect(-10,-6,20,3);},
    head(c,f,t){headBase(c,'#191626');if(!OVR){c.fillStyle='#FF2E4D';c.fillRect(3,-3,10,2.6);}}},
  oni_brute:{top:'#3A2630',sleeve:'#8E8A96',fore:'#2A1A22',glove:'#6E6A78',pants:'#2A1A22',boots:'#141019',bulk:1.35,tw:1.5,gloveSize:1.5,
    torso(c){c.fillStyle=col('#D7263D');c.fillRect(-14,-8,28,3);},
    head(c,f,t){headBase(c,'#8E8A96');c.beginPath();c.moveTo(-10,-8);c.lineTo(-16,-24);c.lineTo(-3,-12);c.closePath();fsC(c,'#1A1420');c.beginPath();c.moveTo(4,-12);c.lineTo(12,-25);c.lineTo(11,-7);c.closePath();fsC(c,'#1A1420');
      if(!OVR){c.fillStyle='#FF2E4D';circ(c,7,-2,2.6);c.fill();}}},
  rift_caster:{top:'#3B2560',sleeve:'#3B2560',glove:'#B57CFF',pants:'#2A1A44',boots:'#160F24',
    torso(c){c.fillStyle=col('#C9A04A');c.fillRect(-10,-8,20,3);},
    head(c,f,t){c.beginPath();c.arc(0,-1,15,0,Math.PI*2);fsC(c,'#E9E4F2');circ(c,4,1,9);fsC(c,'#120A20');if(!OVR){c.fillStyle='#D6A8FF';c.fillRect(3,-1,8,2.2);}}},
  mecha_sentinel:{top:'#D8D6EA',sleeve:'#2A2C44',fore:'#D8D6EA',glove:'#D8D6EA',pants:'#2A2C44',boots:'#D8D6EA',bulk:1.3,tw:1.4,gloveSize:1.4,
    torso(c){if(!OVR){c.fillStyle='#5DB8FF';circ(c,0,-14,3.4);c.fill();}},
    head(c,f,t){rr(c,-12,-13,25,24,6);c.lineWidth=2.4;fsC(c,'#D8D6EA');rr(c,0,-4,14,6,3);fsC(c,'#1A1C30');if(!OVR){c.fillStyle='#5DB8FF';c.fillRect(2,-3,10,3);}}},
  void_stalker:{top:'#1A0F2A',sleeve:'#1A0F2A',glove:'#B57CFF',pants:'#1A0F2A',boots:'#1A0F2A',
    head(c,f,t){headBase(c,'#1A0F2A');c.beginPath();c.moveTo(-6,-10);c.lineTo(-10,-22);c.lineTo(0,-13);c.closePath();fsC(c,'#1A0F2A');if(!OVR){c.fillStyle='#E7C6FF';c.fillRect(3,-2,9,2.4);}}},
  rift_beast:{top:'#2A2236',sleeve:'#2A2236',glove:'#3A2F4A',pants:'#2A2236',boots:'#1A1424',bulk:1.4,tw:1.5,gloveSize:1.4,
    head(c,f,t){c.beginPath();c.arc(-4,-2,17,0,Math.PI*2);fsC(c,'#E9E4F2');headBase(c,'#2A2236');if(!OVR){c.fillStyle='#E7C6FF';c.fillRect(4,-3,8,2.4);}}}
};
const CUSTOM={};
"""+s[b:]
# announcer start lines no longer mention invaders/robots that are not in the roster
rep("'Ladies, gentlemen and confused robots, it is {hero}!','{hero} has arrived. Somebody tell the invaders to stretch!'",
    "'Ladies, gentlemen and confused rift monsters, it is {hero}!','{hero} has arrived. Somebody tell the rift to stretch!'")
# enemy talisman projectile (Rift Caster ofuda)
rep("    case 'ray':","""    case 'talisman':{c.rotate(Math.atan2(q.vy,q.vx)+Math.sin(q.t*14||0)*.25);c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.45;c.fillStyle=q.color;rr(c,-14,-10,28,20,6);c.fill();c.restore();
      c.fillStyle='#F4EEFF';c.strokeStyle='#2A1440';c.lineWidth=1.6;rr(c,-10,-6,20,12,1.5);c.fill();c.stroke();c.strokeStyle=q.color;c.lineWidth=1.6;c.beginPath();c.moveTo(-6,0);c.lineTo(6,0);c.moveTo(-3,-3.5);c.lineTo(-3,3.5);c.moveTo(2,-3.5);c.quadraticCurveTo(5,0,2,3.5);c.stroke();break;}
    case 'ray':""")
open(p,'w').write(s)
print('roster ok')
