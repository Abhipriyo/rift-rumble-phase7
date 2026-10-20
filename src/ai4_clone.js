/* 2) Shadow Clone: a small neural network (13-24-10 MLP, tanh, softmax) trained by behaviour cloning.
      Written from scratch: forward pass, backprop, class-weighted cross-entropy, Adam.
      Evaluation (Phase 4): every 5th recorded example goes to a held-out validation set that is NEVER
      used for training. Validation loss and action agreement are computed on that set only. */
const CA=['idle','toward','away','jump','attack','launch','special','dashT','dashA','guard'];
const CA_LBL=['WAIT','CHASE','BACK OFF','JUMP','ATTACK','LAUNCH','SPECIAL','DASH IN','DASH OUT','GUARD'];
const NI=13,NH=24,NO=10;
const CA_CAT=[5,5,5,2,0,0,4,3,3,1];  /* Attack, Guard, Jump, Dash, Special, Move/wait */
const CAT_LBL=['Attack','Guard','Jump','Dash','Special','Move / wait'];
function rndArr(n,s){const a=new Float32Array(n);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*s;return a;}
const CLONE={X:[],Y:[],VX:[],VY:[],cnt:new Float32Array(NO),seen:0,lossHist:[],lossEma:null,acc:0,steps:0,trainT:0,sampleT:0,histT:0,accT:0,
  val:{n:0,loss:null,acc:null,base:null,baseLbl:null,trainAcc:null},
  duel:{on:false},lastDuel:null,sess:new Float32Array(NO),
  init(){this.P=[rndArr(NI*NH,Math.sqrt(3/NI)),new Float32Array(NH),rndArr(NH*NO,Math.sqrt(3/NH)),new Float32Array(NO)];
    this.M=this.P.map(a=>new Float32Array(a.length));this.V=this.P.map(a=>new Float32Array(a.length));this.t=0;this.steps=0;this.lossEma=null;this.lossHist=[];this.acc=0;
    this.val={n:this.VX.length,loss:null,acc:null,base:null,baseLbl:null,trainAcc:null};},
  add(x,y){if(y<0||y>=NO)return;this.seen++;
    if(this.seen%5===0){this.VX.push(x);this.VY.push(y);if(this.VX.length>600){this.VX.shift();this.VY.shift();}return 'val';}
    this.X.push(x);this.Y.push(y);this.cnt[y]++;if(this.X.length>3000){this.cnt[this.Y[0]]--;this.X.shift();this.Y.shift();}return 'train';},
  forward(x,cache){
    const W1=this.P[0],b1=this.P[1],W2=this.P[2],b2=this.P[3];const h=new Float32Array(NH);
    for(let j=0;j<NH;j++){let s=b1[j];const o=j*NI;for(let i=0;i<NI;i++)s+=W1[o+i]*x[i];h[j]=Math.tanh(s);}
    const z=new Float32Array(NO);let mx=-1e9;
    for(let k=0;k<NO;k++){let s=b2[k];const o=k*NH;for(let j=0;j<NH;j++)s+=W2[o+j]*h[j];z[k]=s;if(s>mx)mx=s;}
    let sum=0;for(let k=0;k<NO;k++){z[k]=Math.exp(z[k]-mx);sum+=z[k];}for(let k=0;k<NO;k++)z[k]/=sum;
    if(cache)cache.h=h;return z;
  },
  argmax(p){let bi=0;for(let k=1;k<NO;k++)if(p[k]>p[bi])bi=k;return bi;},
  /* one Adam step on a minibatch drawn from the TRAINING set only */
  step(bs){
    const N=this.X.length;if(N<20)return;bs=bs||32;const W2=this.P[2];
    const g=this.P.map(a=>new Float32Array(a.length));const gW1=g[0],gb1=g[1],gW2=g[2],gb2=g[3];
    let tot=0;for(let k=0;k<NO;k++)tot+=this.cnt[k];
    let loss=0,wsum=0;const dh=new Float32Array(NH);
    for(let n=0;n<bs;n++){
      const r=Math.floor(Math.random()*N);const x=this.X[r],y=this.Y[r];const c={};const p=this.forward(x,c);const h=c.h;
      const w=clamp(tot/(NO*Math.max(1,this.cnt[y])),.25,4);wsum+=w;loss+=-Math.log(Math.max(1e-7,p[y]))*w;dh.fill(0);
      for(let k=0;k<NO;k++){const dz=(p[k]-(k===y?1:0))*w;gb2[k]+=dz;const o=k*NH;for(let j=0;j<NH;j++){gW2[o+j]+=dz*h[j];dh[j]+=dz*W2[o+j];}}
      for(let j=0;j<NH;j++){const da=dh[j]*(1-h[j]*h[j]);gb1[j]+=da;const o=j*NI;for(let i=0;i<NI;i++)gW1[o+i]+=da*x[i];}
    }
    const lr=.008,B1=.9,B2=.999;this.t++;const c1=1-Math.pow(B1,this.t),c2=1-Math.pow(B2,this.t);
    for(let q=0;q<4;q++){const Pq=this.P[q],Gq=g[q],M=this.M[q],V=this.V[q];
      for(let i=0;i<Pq.length;i++){const gi=Gq[i]/wsum+(q%2===0?1e-4*Pq[i]:0);M[i]=B1*M[i]+(1-B1)*gi;V[i]=B2*V[i]+(1-B2)*gi*gi;Pq[i]-=lr*(M[i]/c1)/(Math.sqrt(V[i]/c2)+1e-8);}}
    loss/=wsum;this.lossEma=this.lossEma==null?loss:this.lossEma*.95+loss*.05;this.steps++;
  },
  /* metrics: held-out (validation) loss + agreement, majority-class baseline, and training-set agreement for comparison */
  evalAll(){
    const v=this.val;v.n=this.VX.length;
    const NT=this.X.length;if(NT>=20){let ok=0;const m=Math.min(300,NT);for(let n=NT-m;n<NT;n++)if(this.argmax(this.forward(this.X[n]))===this.Y[n])ok++;v.trainAcc=ok/m;}else v.trainAcc=null;
    let mj=0;for(let k=1;k<NO;k++)if(this.cnt[k]>this.cnt[mj])mj=k;v.baseLbl=mj;
    if(v.n<30||NT<20){v.loss=null;v.acc=null;v.base=null;this.acc=0;return;}
    let L=0,ok=0,bo=0;for(let n=0;n<v.n;n++){const p=this.forward(this.VX[n]),y=this.VY[n];L+=-Math.log(Math.max(1e-7,p[y]));if(this.argmax(p)===y)ok++;if(y===mj)bo++;}
    v.loss=L/v.n;v.acc=ok/v.n;v.base=bo/v.n;this.acc=v.acc;
  },
  evalAcc(){this.evalAll();},
  pretrain(n){for(let i=0;i<n;i++)this.step(32);this.evalAll();},
  reset(){this.X=[];this.Y=[];this.VX=[];this.VY=[];this.seen=0;this.cnt.fill(0);this.sess.fill(0);this.lastDuel=null;this.duel={on:false};this.init();try{localStorage.removeItem('rrClone');}catch(e){}}
};
CLONE.init();
function saveClone(){try{const n=CLONE.X.length,s=Math.max(0,n-1500),r=a=>Array.from(a,v=>Math.round(v*1000)/1000);
  localStorage.setItem('rrClone',JSON.stringify({v:2,seen:CLONE.seen,X:CLONE.X.slice(s).map(r),Y:CLONE.Y.slice(s),VX:CLONE.VX.map(r),VY:CLONE.VY.slice()}));}catch(e){}}
try{const d=JSON.parse(localStorage.getItem('rrClone')||'null');const okx=x=>Array.isArray(x)&&x.length===NI&&x.every(v=>isFinite(v)),oky=y=>Number.isInteger(y)&&y>=0&&y<NO;
  if(d&&d.v===2&&Array.isArray(d.X)&&Array.isArray(d.Y)&&Array.isArray(d.VX)&&Array.isArray(d.VY)){
    d.X.forEach((x,i)=>{const y=d.Y[i];if(okx(x)&&oky(y)){CLONE.X.push(x.map(Number));CLONE.Y.push(y);CLONE.cnt[y]++;}});
    d.VX.forEach((x,i)=>{const y=d.VY[i];if(okx(x)&&oky(y)){CLONE.VX.push(x.map(Number));CLONE.VY.push(y);}});
    CLONE.seen=Math.max(Number(d.seen)||0,CLONE.X.length+CLONE.VX.length);CLONE.pretrain(200);}
  else if(d&&Array.isArray(d.X)&&Array.isArray(d.Y)&&d.X.length===d.Y.length){d.X.forEach((x,i)=>{const y=d.Y[i];if(okx(x)&&oky(y))CLONE.add(x.map(Number),y);});CLONE.pretrain(200);}
}catch(e){}

/* duel bookkeeping: what the clone actually chose, what you actually did, and how the fight went */
function startDuel(){CLONE.duel={on:true,t0:G.time,clone:new Float32Array(NO),player:new Float32Array(NO),agree:0,n:0,byClone:0,toClone:0,mode:G.mode};CLONE.evalAll();
  CLONE.duel.pre={acc:CLONE.val.acc,base:CLONE.val.base,n:CLONE.val.n,loss:CLONE.val.loss,train:CLONE.X.length};}
function catDist(cnt){const o=[0,0,0,0,0,0];let s=0;for(let k=0;k<NO;k++){o[CA_CAT[k]]+=cnt[k];s+=cnt[k];}return s?o.map(v=>v/s):o;}
function endDuel(outcome){const D=CLONE.duel;if(!D||!D.on)return null;D.on=false;
  const you=catDist(CLONE.cnt),cl=catDist(D.clone);let tv=0;for(let i=0;i<6;i++)tv+=Math.abs(you[i]-cl[i]);
  let nc=0;for(let k=0;k<NO;k++)nc+=D.clone[k];
  const rep={outcome,dur:G.time-D.t0,you,clone:cl,sim:nc>=20?1-tv/2:null,nClone:nc,nTrainLbl:CLONE.X.length,agree:D.n>=20?D.agree/D.n:null,nAgree:D.n,
    byClone:D.byClone,toClone:D.toClone,pre:D.pre,mode:D.mode};
  CLONE.lastDuel=rep;return rep;}
