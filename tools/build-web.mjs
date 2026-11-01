// Chép bản game (index.html + js) sang thư mục www để đóng gói APK
import fs from 'fs';
const out = 'www';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out + '/js', { recursive: true });
for (const f of ['index.html','icon.png','icon-512.png','manifest.webmanifest']) fs.copyFileSync(f, out + '/' + f);
for (const f of fs.readdirSync('js')) fs.copyFileSync('js/' + f, out + '/js/' + f);
console.log('Da chep game sang www/');
