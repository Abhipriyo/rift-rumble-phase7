const PRED={c0:new Float32Array(7),c1:new Float32Array(49),c2:new Float32Array(343),raw:new Float32Array(7),h:[],n:0,hits:[],evN:0,evHit:0,baseHit:0,recent:[],
  reset(){this.c0.fill(0);this.c1.fill(0);this.c2.fill(0);this.raw.fill(0);this.h=[];this.n=0;this.hits=[];this.evN=0;this.evHit=0;this.baseHit=0;this.recent=[];},
  dist(){
    const K=7,h=this.h,out=new Array(K);
    const a=h.length>=2?h[h.length-2]:-1,b=h.length>=1?h[h.length-1]:-1;
    let n0=0,n1=0,n2=0;for(let i=0;i<K;i++){n0+=this.c0[i];if(b>=0)n1+=this.c1[b*K+i];if(a>=0)n2+=this.c2[(a*K+b)*K+i];}
    const l2=n2/(n2+2),l1=(1-l2)*n1/(n1+2),l0=1-l2-l1;let s=0;
    for(let i=0;i<K;i++){const p0=(this.c0[i]+.5)/(n0+3.5),p1=n1?this.c1[b*K+i]/n1:0,p2=n2?this.c2[(a*K+b)*K+i]/n2:0;out[i]=l2*p2+l1*p1+l0*p0;s+=out[i];}
    return out.map(x=>x/s);
  },
  top(){const d=this.dist();let bi=0;for(let k=1;k<7;k++)if(d[k]>d[bi])bi=k;return {i:bi,ev:EV[bi],p:d[bi],d};},
  /* prequential evaluation: each move is predicted BEFORE the model sees it, then the model updates.
     Baseline on the same moves: always guess the most frequent move so far (undecayed counts). */
  observe(ev){
    const i=EV.indexOf(ev);if(i<0)return;const K=7,h=this.h;
    if(this.n>=3){const tp=this.top();const ok=tp.i===i?1:0;this.hits.push(ok);if(this.hits.length>40)this.hits.shift();
      this.evN++;this.evHit+=ok;let bi=0;for(let k=1;k<7;k++)if(this.raw[k]>this.raw[bi])bi=k;if(bi===i)this.baseHit++;
      this.recent.push({p:tp.i,a:i,ok,pp:tp.p});if(this.recent.length>12)this.recent.shift();}
    const f=.985;for(let k=0;k<7;k++)this.c0[k]*=f;for(let k=0;k<49;k++)this.c1[k]*=f;for(let k=0;k<343;k++)this.c2[k]*=f;
    this.c0[i]++;this.raw[i]++;if(h.length>=1)this.c1[h[h.length-1]*K+i]++;if(h.length>=2)this.c2[(h[h.length-2]*K+h[h.length-1])*K+i]++;
    h.push(i);if(h.length>3)h.shift();this.n++;
  },
  acc(){return this.hits.length?this.hits.reduce((a,b)=>a+b,0)/this.hits.length:0;}
};
