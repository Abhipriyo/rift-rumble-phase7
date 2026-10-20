"""Write index.html: the same game as rift-rumble.html, wrapped as a standalone web page
(doctype + phone viewport) for static hosts such as Vercel, Netlify or GitHub Pages."""
s=open('rift-rumble.html').read();h='<meta charset="utf-8">';assert s.startswith(h)
open('index.html','w').write('<!doctype html>\n<html lang="en">\n'+h+'\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'+s[len(h):]+'\n</html>\n')
print('index.html ok')
