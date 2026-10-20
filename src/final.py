"""All 12 heroes now use the new art, so the temporary 'TRY THE NEW ART' entry point and NEW ART badges are removed."""
p='rift-rumble.html';s=open(p).read()
def rep(o,n,c=1):
    global s
    assert s.count(o)==c,(o[:80],s.count(o));s=s.replace(o,n)
rep('<button class="big" type="button" id="newArtBtn">TRY THE NEW ART</button><button class="big alt" type="button" id="startBtn">PRESS START</button>','<button class="big" type="button" id="startBtn">PRESS START</button>')
rep("if(UNIS[k].heroes.some(h=>ART.isNew(h))){const bd=document.createElement('span');bd.className='badge';bd.textContent='NEW';b.appendChild(bd);}","")
rep("if(ART.isNew(id)){const bd=document.createElement('span');bd.className='badge';bd.textContent='NEW ART';nm.appendChild(bd);}","")
rep("$('newArtBtn').addEventListener('click',()=>{audioInit();selUni='sh';if(!ART.isNew(selHero))selHero='hana';G.uni='sh';if(root.classList.contains('touch')&&!isFs())enterFs();openSelect();});\n","")
rep("note='New art: '+ids.map(id=>ART.defs[id].name+' ('+(ART.status[id]==='png'?'PNG sprites':ART.status[id]==='baked'?'built-in sprites':'classic fallback')+')').join(' · ');}catch(e){}",
    "const n=k=>ids.filter(id=>ART.status[id]===k).length,png=n('png'),bk=n('baked'),fl=ids.length-png-bk;note='Character art: '+png+'/'+ids.length+' from PNG sprites'+(bk?', '+bk+' built-in':'')+(fl?', '+fl+' classic fallback':'');}catch(e){}")
open(p,'w').write(s);print('final ok')
