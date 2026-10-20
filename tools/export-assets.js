const { chromium } = require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.goto('file://'+process.cwd()+'/rift-rumble.html');await p.waitForTimeout(400);
 const out=await p.evaluate(()=>window.__rr.ART.exportAll());
 for(const [f,d] of Object.entries(out.files)){const fp=path.join('assets',f);fs.mkdirSync(path.dirname(fp),{recursive:true});fs.writeFileSync(fp,Buffer.from(d.split(',')[1],'base64'));}
 fs.writeFileSync('assets/manifest.json',JSON.stringify(out.manifest,null,2));
 console.log(Object.keys(out.files).length,'PNGs');await b.close();})();
