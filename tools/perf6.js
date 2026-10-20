// Phase 6 profiling: a busy fight (wave 12, max enemies, specials firing) measured with Chromium CPU throttling.
// Reports the game's own per-frame update/render cost and real frame intervals. Headless Chromium, not a real phone.
const { chromium } = require('playwright');
const URL='http://127.0.0.1:8765/rift-rumble.html';
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function run(b,name,opts,rate){
  const ctx=await b.newContext(opts);const p=await ctx.newPage();
  if(opts.isMobile)await p.route('**/rift-rumble.html',async rt=>{const res=await rt.fetch();rt.fulfill({response:res,body:(await res.text()).replace('<meta charset="utf-8">','<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">')});});
  await p.goto(URL);await wait(800);
  const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate});
  await p.evaluate(()=>{const R=window.__rr;R.setHero('kenji');R.startGame();});await wait(600);
  await p.evaluate(()=>{const R=window.__rr,G=R.G;G.wave=12;R.P.inv=999;R.P.stocks=9;for(let i=0;i<7;i++)R.spawnEnemy(['grunt','shooter','heavy'][i%3]);G.queue=['grunt','grunt','shooter','heavy'];});
  await wait(1500);
  const res=await p.evaluate(async()=>{const R=window.__rr,P=R.PERF;const fr=[];let last=performance.now();const t0=last;let upd=[],ren=[];
    const tick=()=>new Promise(r=>requestAnimationFrame(r));let i=0;
    while(performance.now()-t0<6000){await tick();const n=performance.now();fr.push(n-last);last=n;upd.push(P.upd);ren.push(P.ren);
      if(i++%20===0){R.press('attack');if(i%60===1)R.press('special');}R.P.inv=999;}
    fr.sort((a,b)=>a-b);const avg=a=>a.reduce((s,x)=>s+x,0)/a.length;const q=k=>fr[Math.floor(fr.length*k)];
    return {frames:fr.length,fps:+(1000/avg(fr)).toFixed(1),p50:+q(.5).toFixed(1),p95:+q(.95).toFixed(1),upd:+avg(upd).toFixed(2),ren:+avg(ren).toFixed(2),
      enemies:R.enemies.length,projs:R.projs.length,fx:R.fx.length,spf:+P.spf.toFixed(2)};});
  await ctx.close();return name+' (CPU ÷'+rate+'): '+JSON.stringify(res);
}
(async()=>{const b=await chromium.launch({args:['--proxy-bypass-list=<-loopback>']});
  const out=[];
  out.push(await run(b,'desktop 1280x720',{viewport:{width:1280,height:720}},1));
  out.push(await run(b,'desktop 1280x720',{viewport:{width:1280,height:720}},4));
  out.push(await run(b,'phone 844x390 @2x',{viewport:{width:844,height:390},hasTouch:true,isMobile:true,deviceScaleFactor:2},6));
  await b.close();console.log(out.join('\n'));})();
