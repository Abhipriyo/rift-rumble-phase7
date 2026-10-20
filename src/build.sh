set -e
cd /tmp/claude-0/-home-claude/904e7fc8-0ddc-50ca-95d7-417379172c13/scratchpad
cp rift-rumble.before-art.html rift-rumble.html
python3 integrate.py >/dev/null
python3 roster.py >/dev/null
python3 final.py >/dev/null
python3 phase4.py >/dev/null
python3 phase5.py >/dev/null
python3 phase6.py
python3 phase7.py
python3 -c "
import re;s=open('rift-rumble.html').read();open('g4.js','w').write(max(re.findall(r'<script>(.*?)</script>',s,re.S),key=len))"
node --check g4.js
rm -rf assets && NODE_PATH=$(npm root -g) node export.js | tail -1
echo BUILD OK
