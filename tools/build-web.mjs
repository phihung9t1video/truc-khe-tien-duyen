// Chép bản game (index.html + js) sang thư mục www để đóng gói APK.
// Đồng thời ghi số phiên bản vào js/version.js (app biết mình là bản nào)
// và version.json (bản mới nhất, GitHub Pages phục vụ để app báo cập nhật).
import fs from 'fs';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = process.env.APP_VERSION_NAME || pkg.version;
const notes = (process.env.APP_NOTES || '').slice(0, 300);
fs.writeFileSync('js/version.js', `window.APP_VERSION=${JSON.stringify(version)};\n`);
fs.writeFileSync('version.json', JSON.stringify({ version, notes }, null, 2) + '\n');
const out = 'www';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out + '/js', { recursive: true });
for (const f of ['index.html','icon.png','icon-512.png','manifest.webmanifest']) fs.copyFileSync(f, out + '/' + f);
for (const f of fs.readdirSync('js')) fs.copyFileSync('js/' + f, out + '/js/' + f);
console.log('Da chep game sang www/ (phien ban ' + version + ')');
