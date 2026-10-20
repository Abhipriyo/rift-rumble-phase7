/* ================= PHASE 7: title + select screens styled after the concept sheet ================= */
const UNI7={ki:{em:'気',col:'#FF6A2B',col2:'#FFB13B'},sh:{em:'忍',col:'#FF3D8B',col2:'#B23CFF'},cape:{em:'★',col:'#2E9BFF',col2:'#3EE6FF'},mighty:{em:'力',col:'#A35CFF',col2:'#FF5CE1'}};
const JP7={kenji:'ケンジ',lila:'リラ',mochi:'モチ',nyanja:'ニャンジャ',rokuro:'ロクロ',hana:'ハナ',comet:'コメット',raccoon:'ミッドナイト',skate:'サージ',titan:'ティン',gravity:'グランマ',jaguar:'ジャガー'};
function drawBust7(cv,id,k){const c=cv.getContext('2d');if(!c)return;const W=cv.width,H=cv.height;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);
  const f={id:11+k,mood:'idle',onGround:true,preview:true,pose:Object.assign({},BASE),vx:0,act:null,face:1,wind:0,artId:ART.heroArt[id]||null,x:0,y:0,h:78,w:30};
  const s=W/46;
  for(let i=0;i<24;i++){const tt=i/60;const ip=ART.idle(f,tt)||idlePose(tt);for(const key of PK)f.pose[key]=ip[key]||0;
    c.save();c.globalAlpha=i<23?0:1;c.translate(W*.52,H+s*30);c.scale(s,s);drawCharacter(c,f,id,tt);c.restore();}
  c.globalCompositeOperation='source-atop';const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(255,255,255,.06)');g.addColorStop(1,'rgba(10,4,28,.45)');c.fillStyle=g;c.fillRect(0,0,W,H);c.globalCompositeOperation='source-over';}
function buildTitle7(){
  const ur=$('uni7');if(ur){ur.innerHTML='';Object.keys(UNIS).forEach(k=>{const U=UNI7[k];const b=document.createElement('button');b.type='button';b.className='uniB7';
    b.style.setProperty('--u1',U.col);b.style.setProperty('--u2',U.col2);
    const em=document.createElement('span');em.className='em7';em.textContent=U.em;const nm=document.createElement('span');nm.className='un7';nm.textContent=UNIS[k].name;
    b.appendChild(em);b.appendChild(nm);b.setAttribute('aria-label',UNIS[k].name+': choose a fighter');
    b.addEventListener('click',()=>{selUni=k;if(HEROES[selHero].uni!==k)selHero=UNIS[k].heroes[0];selMode='endless';audioInit();if(root.classList.contains('touch')&&!isFs())enterFs();openSelect();});ur.appendChild(b);});}
  const st=$('strip7');if(st){st.innerHTML='';let k=0;Object.keys(UNIS).forEach(u=>UNIS[u].heroes.forEach(id=>{const H=HEROES[id],U=UNI7[u];const b=document.createElement('button');b.type='button';b.className='hero7';
    b.style.setProperty('--u1',U.col);b.style.setProperty('--u2',U.col2);b.setAttribute('aria-label',H.name+', '+H.role);
    const cv=document.createElement('canvas');cv.width=92;cv.height=112;b.appendChild(cv);
    const nm=document.createElement('strong');nm.textContent=H.name.toUpperCase();const jp=document.createElement('span');jp.className='jp7';jp.textContent=JP7[id]||'';
    const rl=document.createElement('span');rl.className='rl7';rl.textContent=H.role.toUpperCase();b.appendChild(nm);b.appendChild(jp);b.appendChild(rl);
    b.addEventListener('click',()=>{selHero=id;selUni=u;selMode='endless';audioInit();if(root.classList.contains('touch')&&!isFs())enterFs();openSelect();});
    st.appendChild(b);try{drawBust7(cv,id,k++);}catch(e){}}));}
}
/* select screen: universe banners with emblems, signature-mechanic chips and an info panel */
const _bt7=buildTabs;
buildTabs=function(){_bt7();const box=$('uniTabs');[...box.children].forEach((b,i)=>{const k=Object.keys(UNIS)[i];const U=UNI7[k];if(!U)return;b.classList.add('tab7');b.style.setProperty('--u1',U.col);b.style.setProperty('--u2',U.col2);
  const em=document.createElement('span');em.className='em7s';em.textContent=U.em;b.insertBefore(em,b.firstChild);});
  const A=ARENA7[selUni];$('uniTag').textContent=UNIS[selUni].tag+(A?' Arena: '+A.n.toLowerCase()+'.':'');};
function mechInfo7(){const box=$('mechInfo7');if(!box)return;const M=MECH[selHero],H=HEROES[selHero],A=ARENA7[selUni];box.innerHTML='';
  const add=(cls,label,txt)=>{const d=document.createElement('div');d.className='mi7 '+cls;const b=document.createElement('b');b.textContent=label;const s=document.createElement('span');s.textContent=txt;d.appendChild(b);d.appendChild(s);box.appendChild(d);};
  if(M){add('sig',H.name.toUpperCase()+' · SIGNATURE: '+M.n,M.strength);add('weak','WEAKNESS',M.weak);}
  if(A)add('arena','ARENA · '+A.n,A.d);}
const _bh7=buildHeroes;
buildHeroes=function(){_bh7();const cards=[...$('heroGrid').children];UNIS[selUni].heroes.forEach((id,i)=>{const b=cards[i];if(!b)return;const U=UNI7[selUni];b.classList.add('hc7');b.style.setProperty('--u1',U.col);b.style.setProperty('--u2',U.col2);
  const nm=b.querySelector('strong');if(nm){const jp=document.createElement('span');jp.className='jp7';jp.textContent=JP7[id]||'';nm.after(jp);}
  const M=MECH[id];if(M){const chip=document.createElement('span');chip.className='chip7';chip.textContent='◆ '+M.n;chip.style.color=M.col;const rl=b.querySelector('.role');(rl||nm).after(chip);}
  b.addEventListener('click',mechInfo7);});mechInfo7();};
/* pause move list: add the signature mechanic */
const _ml7=moveList;moveList=function(){_ml7();const M=MECH[G.hero];const dl=$('mlList');if(!M||!dl)return;
  [['◆ '+M.n,M.strength],['Weakness',M.weak]].concat(ARENA7[G.uni]?[['Arena: '+ARENA7[G.uni].n,ARENA7[G.uni].d]]:[]).forEach(([k,v])=>{const dt=document.createElement('dt');dt.textContent=k;const dd=document.createElement('dd');dd.textContent=v;dl.appendChild(dt);dl.appendChild(dd);});};
buildTitle7();
