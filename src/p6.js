/* ================= PHASE 6: SETTINGS, AUDIO, ACCESSIBILITY, PERFORMANCE ================= */
const SET_KEY='rrSettings1';
const ACTIONS=[['left','Move left'],['right','Move right'],['up','Aim up'],['down','Aim down / fast fall'],['jump','Jump'],['attack','Attack'],['special','Special'],['dash','Dash'],['guard','Guard'],['super','Super'],['awaken','Awaken']];
const KEYDEF={left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],up:['KeyW','ArrowUp'],down:['KeyS','ArrowDown'],jump:['Space'],attack:['KeyJ','KeyZ'],special:['KeyK','KeyX'],
  dash:['KeyL','KeyC'],guard:['ShiftLeft','ShiftRight','KeyU'],super:['KeyI'],awaken:['KeyO']};
const RESERVED=new Set(['Escape','KeyP','Tab','Enter','NumpadEnter','Backquote','MetaLeft','MetaRight','ControlLeft','ControlRight','AltLeft','AltRight','ContextMenu','CapsLock',
  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12']);
const DIFFS={easy:{n:'Easy',dmg:.7,react:.08,tele:1.25,d:'Enemies hit 30% softer, react 0.08 s slower, boss warnings last 25% longer.'},
  normal:{n:'Normal',dmg:1,react:0,tele:1,d:'The balance the game was tuned for.'},
  hard:{n:'Hard',dmg:1.25,react:-.04,tele:.9,d:'Enemies hit 25% harder and react 0.04 s faster (never under 0.2 s); boss warnings 10% shorter (never under 0.4 s).'}};
const SHAKES={full:1,reduced:.4,off:0},FLASHES={full:1,reduced:.15};
function setDefault(){return {master:80,sfx:90,music:45,shake:RM?'off':'full',flash:RM?'reduced':'full',diff:'normal',keys:JSON.parse(JSON.stringify(KEYDEF))};}
const SET=setDefault();let SET_STATUS='ok';
function setSanitize(d){const o=setDefault();if(!d||typeof d!=='object')return o;
  ['master','sfx','music'].forEach(k=>{const v=+d[k];if(Number.isFinite(v))o[k]=Math.round(clamp(v,0,100));});
  if(d.shake in SHAKES)o.shake=d.shake;if(d.flash in FLASHES)o.flash=d.flash;if(d.diff in DIFFS)o.diff=d.diff;
  if(d.keys&&typeof d.keys==='object'){const used=new Set();const k2={};
    ACTIONS.forEach(([a])=>{const arr=Array.isArray(d.keys[a])?d.keys[a].filter(c=>typeof c==='string'&&/^[A-Za-z0-9]{2,20}$/.test(c)&&!RESERVED.has(c)&&!used.has(c)).slice(0,3):[];
      arr.forEach(c=>used.add(c));k2[a]=arr;});
    if(ACTIONS.every(([a])=>k2[a].length))o.keys=k2;}
  return o;}
function setLoad(){let raw=null;try{raw=localStorage.getItem(SET_KEY);}catch(e){SET_STATUS='unavailable';return;}if(!raw)return;
  try{Object.assign(SET,setSanitize(JSON.parse(raw)));}catch(e){SET_STATUS='corrupt';}}
function setSave(){try{localStorage.setItem(SET_KEY,JSON.stringify(SET));}catch(e){SET_STATUS='unavailable';}}
const DIFF=()=>DIFFS[SET.diff]||DIFFS.normal;
const shakeMul=()=>SHAKES[SET.shake];
const flashMul=()=>FLASHES[SET.flash];
function applyKeys(){for(const k in KEYS)delete KEYS[k];ACTIONS.forEach(([a])=>SET.keys[a].forEach(c=>{KEYS[c]=a;}));}
const KEYNAMES={Space:'Space',ShiftLeft:'L-Shift',ShiftRight:'R-Shift',ArrowLeft:'←',ArrowRight:'→',ArrowUp:'↑',ArrowDown:'↓',Backspace:'Backspace',Minus:'-',Equal:'=',BracketLeft:'[',BracketRight:']',
  Semicolon:';',Quote:"'",Comma:',',Period:'.',Slash:'/',Backslash:'\\'};
function keyName(c){if(!c)return '?';if(KEYNAMES[c])return KEYNAMES[c];if(/^Key[A-Z]$/.test(c))return c.slice(3);if(/^Digit\d$/.test(c))return c.slice(5);if(/^Numpad/.test(c))return 'Num '+c.slice(6);return c;}
const keysOf=a=>SET.keys[a].map(keyName).join(' / ');

/* ---------- audio buses: master -> effects + ambience ---------- */
SND.last={};SND.voices=[];
function audioBuses(){const a=SND.ctx;if(!a||SND.sfxBus)return;
  try{SND.master.disconnect();}catch(e){}SND.master.connect(a.destination);
  SND.sfxBus=a.createGain();SND.sfxBus.connect(SND.master);SND.musBus=a.createGain();SND.musBus.connect(SND.master);applyAudio();}
function applyAudio(){const a=SND.ctx;if(!a||!SND.sfxBus)return;const t=a.currentTime;
  SND.master.gain.setTargetAtTime(SND.on?SET.master/100*.6:0,t,.03);SND.sfxBus.gain.setTargetAtTime(SET.sfx/100,t,.03);
  SND.musBus.gain.setTargetAtTime(SET.music/100*(G.screen==='pause'?.4:1),t,.08);}
function voiceOK(name){const a=SND.ctx,now=a.currentTime;
  if(name!=='ui'&&(SND.last[name]||-1)>now-.035)return false;SND.voices=SND.voices.filter(v=>v>now);if(SND.voices.length>=24)return false;
  SND.last[name]=now;SND.voices.push(now+.5);return true;}
function mtone(type,f1,f2,dur,vol,when,att){const a=SND.ctx;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f1,when);if(f2!==f1)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),when+dur);
  g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(vol,when+(att||.01));g.gain.exponentialRampToValueAtTime(.0001,when+dur);o.connect(g);g.connect(SND.musBus);o.start(when);o.stop(when+dur+.05);}

/* ---------- ambience: a small generative soundscape per universe (Web Audio only, no files) ---------- */
const AMB={cur:null,nodes:[],next:0,
  recipes:{
    ki:{drone:[[73.4,'triangle'],[110,'triangle']],lp:600,noise:[520,.6,.05],ev:()=>{const f=[293.7,349.2,392,440,523.3][Math.floor(Math.random()*5)];return {gap:4+Math.random()*3,play:w=>{mtone('sine',f,f,3.2,.06,w,.005);mtone('sine',f*2.76,f*2.76,1.6,.015,w,.005);}};}},
    sh:{drone:[[55,'sine'],[82.4,'sine']],lp:400,noise:[900,.8,.035],ev:()=>{const sc=[220,233.1,293.7,329.6,349.2,440,466.2];const f=sc[Math.floor(Math.random()*sc.length)];return {gap:1.2+Math.random()*2,play:w=>{mtone('triangle',f,f*.99,1.1,.05,w,.004);if(Math.random()<.4)mtone('triangle',f*1.5,f*1.5,.8,.025,w+.18,.004);}};}},
    cape:{drone:[[65.4,'sawtooth'],[98,'sawtooth']],lp:380,noise:[260,.5,.05],ev:()=>{const ch=[[261.6,329.6,392],[220,261.6,329.6],[174.6,220,261.6],[196,246.9,293.7]][Math.floor(Math.random()*4)];
      return {gap:2.4,play:w=>{ch.forEach((f,i)=>{for(let r=0;r<4;r++)mtone('square',f,f,.12,.012,w+r*.6+i*.15,.005);});}};}},
    mighty:{drone:[[55,'sine'],[82.5,'sine']],lp:900,noise:null,ev:()=>{const f=880*Math.pow(2,Math.floor(Math.random()*8)/7);return {gap:.8+Math.random()*1.8,play:w=>{mtone('sine',f,f,1.4,.025,w,.02);mtone('sine',f*2,f*2,.6,.008,w+.05,.02);}};}}
  },
  stop(){this.nodes.forEach(n=>{try{n.stop?n.stop():0;}catch(e){}try{n.disconnect();}catch(e){}});this.nodes=[];this.cur=null;},
  start(u){this.stop();const a=SND.ctx,R=this.recipes[u];if(!a||!SND.musBus||!R)return;this.cur=u;
    const lp=a.createBiquadFilter();lp.type='lowpass';lp.frequency.value=R.lp;const dg=a.createGain();dg.gain.value=.05;lp.connect(dg);dg.connect(SND.musBus);this.nodes.push(lp,dg);
    R.drone.forEach(([f,type],i)=>{const o=a.createOscillator();o.type=type;o.frequency.value=f;o.detune.value=i?6:-4;o.connect(lp);o.start();this.nodes.push(o);
      const lfo=a.createOscillator(),lg=a.createGain();lfo.frequency.value=.07+i*.05;lg.gain.value=3;lfo.connect(lg);lg.connect(o.detune);lfo.start();this.nodes.push(lfo,lg);});
    if(R.noise){const s=a.createBufferSource();s.buffer=SND.noise;s.loop=true;const bp=a.createBiquadFilter();bp.type='bandpass';bp.frequency.value=R.noise[0];bp.Q.value=R.noise[1];
      const ng=a.createGain();ng.gain.value=R.noise[2];s.connect(bp);bp.connect(ng);ng.connect(SND.musBus);s.start();this.nodes.push(s,bp,ng);}
    this.next=a.currentTime+.8;},
  tick(){const a=SND.ctx;if(!a||!SND.musBus)return;const want=SND.on&&SET.music>0&&a.state==='running'&&G.screen!=='title'?G.uni:null;
    if(want!==this.cur){if(want)this.start(want);else this.stop();}
    if(this.cur&&a.currentTime+.25>this.next){const e=this.recipes[this.cur].ev();e.play(Math.max(this.next,a.currentTime+.02));this.next=Math.max(this.next,a.currentTime)+e.gap;}}
};

/* ---------- performance counters (shown in the debug view) ---------- */
const PERF={upd:0,ren:0,spf:0,steps:0,fps:0,acc:0,t0:0,cnt:0};
const STEP=1/120;let MANUAL=false;

/* ---------- settings screen ---------- */
let capAct=null;
function seg(id,opts,cur,on){const box=$(id);box.innerHTML='';opts.forEach(([v,n])=>{const b=document.createElement('button');b.type='button';b.className='segb';b.textContent=n;b.setAttribute('aria-pressed',v===cur?'true':'false');
  b.addEventListener('click',()=>{on(v);sfx('ui');});box.appendChild(b);});}
function renderSettings(){
  ['master','sfx','music'].forEach(k=>{const r=$('set_'+k);r.value=SET[k];$('val_'+k).textContent=SET[k]+'%';});
  $('sndState').textContent=SND.on?'Sound is on':'Sound is muted (SFX button)';
  seg('segShake',[['full','Full'],['reduced','Reduced'],['off','Off']],SET.shake,v=>{SET.shake=v;setSave();renderSettings();});
  seg('segFlash',[['full','Full'],['reduced','Reduced']],SET.flash,v=>{SET.flash=v;setSave();renderSettings();});
  seg('segDiff',[['easy','Easy'],['normal','Normal'],['hard','Hard']],SET.diff,v=>{SET.diff=v;setSave();renderSettings();});
  $('diffDesc').textContent=DIFF().d+(G.screen==='pause'?' Applies to enemies that appear from now on.':'');
  const tb=$('keyRows');tb.innerHTML='';
  ACTIONS.forEach(([a,n])=>{const tr=document.createElement('tr');const td1=document.createElement('td');td1.textContent=n;const td2=document.createElement('td');
    td2.textContent=capAct===a?'Press a key... (Esc cancels)':keysOf(a);td2.className=capAct===a?'cap':'';const td3=document.createElement('td');const b=document.createElement('button');b.type='button';b.className='mini';
    b.textContent=capAct===a?'Cancel':'Change';b.setAttribute('aria-label','Change key for '+n);b.addEventListener('click',()=>{capAct=capAct===a?null:a;$('keyMsg').textContent='';renderSettings();});td3.appendChild(b);
    tr.appendChild(td1);tr.appendChild(td2);tr.appendChild(td3);tb.appendChild(tr);});
  $('setStatus').textContent=SET_STATUS==='unavailable'?'Browser storage is unavailable, so settings last only for this visit.':SET_STATUS==='corrupt'?'Saved settings were unreadable; defaults are in use.':'';
}
function bindKey(code){const a=capAct;capAct=null;
  if(RESERVED.has(code)){$('keyMsg').textContent=keyName(code)+' is reserved (pause, menus or browser) and cannot be bound.';renderSettings();return;}
  let moved='';ACTIONS.forEach(([b])=>{if(b!==a&&SET.keys[b].includes(code)){if(SET.keys[b].length>1){SET.keys[b]=SET.keys[b].filter(c=>c!==code);moved=' (removed from '+ACTIONS.find(x=>x[0]===b)[1]+')';}
      else{SET.keys[b]=[SET.keys[a][0]];moved=' (swapped with '+ACTIONS.find(x=>x[0]===b)[1]+')';}}});
  SET.keys[a]=[code].concat(SET.keys[a].slice(1).filter(c=>c!==code&&!ACTIONS.some(([b])=>b!==a&&SET.keys[b].includes(c)))).slice(0,3);
  applyKeys();setSave();$('keyMsg').textContent=ACTIONS.find(x=>x[0]===a)[1]+' is now '+keyName(code)+moved+'.';renderSettings();updateHelpKeys();}
window.addEventListener('keydown',e=>{if(!capAct)return;e.preventDefault();e.stopImmediatePropagation();if(e.code==='Escape'){capAct=null;renderSettings();return;}bindKey(e.code);},true);
function openSettings(){capAct=null;$('keyMsg').textContent='';renderSettings();show('ovSettings',true);$('ovSettings').scrollTop=0;$('setClose').focus({preventScroll:true});}
function closeSettings(){capAct=null;show('ovSettings',false);}
function updateHelpKeys(){const dl=$('kbHelp');if(!dl)return;dl.innerHTML='';
  [[['left','right'],'Move'],[['up','down'],'Aim up or down'],[['jump'],'Jump'],[['attack','special'],'Attack / Special'],[['dash','guard'],'Dash / Guard'],[['super','awaken'],'Super / Awaken']].forEach(([acts,txt])=>{
    const dt=document.createElement('dt');acts.forEach(a=>{const k=document.createElement('kbd');k.textContent=keyName(SET.keys[a][0]);dt.appendChild(k);});const dd=document.createElement('dd');dd.textContent=txt;dl.appendChild(dt);dl.appendChild(dd);});
  const dt=document.createElement('dt');const k=document.createElement('kbd');k.textContent='P';dt.appendChild(k);const dd=document.createElement('dd');dd.textContent='Pause (Esc works too)';dl.appendChild(dt);dl.appendChild(dd);}
setLoad();applyKeys();
['master','sfx','music'].forEach(k=>{const r=$('set_'+k);
  r.addEventListener('input',()=>{SET[k]=+r.value;$('val_'+k).textContent=SET[k]+'%';audioInit();applyAudio();});
  r.addEventListener('change',()=>{setSave();sfx('ui');});});
$('keyReset').addEventListener('click',()=>{SET.keys=JSON.parse(JSON.stringify(KEYDEF));capAct=null;applyKeys();setSave();renderSettings();$('keyMsg').textContent='Keys reset to the defaults.';updateHelpKeys();sfx('ui');});
$('setClose').addEventListener('click',()=>{closeSettings();sfx('ui');$(G.screen==='pause'?'resumeBtn':'setBtn').focus();});
$('setBtn').addEventListener('click',()=>{audioInit();openSettings();sfx('ui');});
$('setBtn2').addEventListener('click',()=>{openSettings();sfx('ui');});
window.addEventListener('keydown',e=>{if(capAct||e.code!=='Escape'||$('ovSettings').hidden)return;e.preventDefault();e.stopImmediatePropagation();closeSettings();$(G.screen==='pause'?'resumeBtn':'setBtn').focus();},true);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){for(const k in kHeld)kHeld[k]=false;if(G.screen==='play')togglePause();if(SND.ctx&&SND.ctx.state==='running')SND.ctx.suspend().catch(()=>{});}
  else{lastT=performance.now();PERF.acc=0;if(SND.ctx&&SND.ctx.state==='suspended')SND.ctx.resume().catch(()=>{});}});
updateHelpKeys();
