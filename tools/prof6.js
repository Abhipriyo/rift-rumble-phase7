// CPU profile of a busy fight (main thread) to see where frame time goes before optimising anything.
const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch({args:['--proxy-bypass-list=<-loopback>']});const ctx=await b.newContext({viewport:{width:1280,height:720}});const p=await ctx.newPage();
 await p.goto('http://127.0.0.1:8765/rift-rumble.html');await new Promise(r=>setTimeout(r,800));
 await p.evaluate(()=>{const R=window.__rr;R.setHero('kenji');R.startGame();});await new Promise(r=>setTimeout(r,600));
 await p.evaluate(()=>{const R=window.__rr,G=R.G;G.wave=12;R.P.inv=999;for(let i=0;i<7;i++)R.spawnEnemy(['grunt','shooter','heavy'][i%3]);});
 await new Promise(r=>setTimeout(r,1500));
 const cdp=await ctx.newCDPSession(p);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:200});await cdp.send('Profiler.start');
 await new Promise(r=>setTimeout(r,4000));const {profile}=await cdp.send('Profiler.stop');
 const dt={};const ids={};profile.nodes.forEach(n=>ids[n.id]=n);
 for(let i=0;i<profile.samples.length;i++){const n=ids[profile.samples[i]];const k=n.callFrame.functionName||n.callFrame.url.split('/').pop()||'(anon)';dt[k]=(dt[k]||0)+(profile.timeDeltas[i]||0);}
 const tot=Object.values(dt).reduce((a,b)=>a+b,0);console.log(Object.entries(dt).sort((a,b)=>b[1]-a[1]).slice(0,18).map(([k,v])=>k.padEnd(28)+(v/tot*100).toFixed(1)+'%').join('\n'));
 await b.close();})();
