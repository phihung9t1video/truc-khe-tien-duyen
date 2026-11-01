// Chép bản game (index.html + js) sang thư mục www để đóng gói APK.
// Ghi số phiên bản vào js/version.js (app biết mình là bản nào).
// Nén www thành dist/www.zip (gói cập nhật trực tiếp cho app) và ghi version.json:
//   số phiên bản, ghi chú, đường dẫn gói trên GitHub Releases, mã SHA-256 để app kiểm tra gói không bị hỏng/sửa.
// Đặt biến môi trường APP_NEED_APK=1 khi bản mới đổi phần lõi Android (app sẽ bảo tải APK thay vì cập nhật trực tiếp).
import fs from 'fs';
import crypto from 'crypto';
import zlib from 'zlib';
const REPO = 'phihung9t1video/truc-khe-tien-duyen';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = process.env.APP_VERSION_NAME || pkg.version;
const notes = (process.env.APP_NOTES || '').slice(0, 300);
fs.writeFileSync('js/version.js', `window.APP_VERSION=${JSON.stringify(version)};\n`);
const out = 'www';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out + '/js', { recursive: true });
const top = ['index.html', 'icon.png', 'icon-512.png', 'manifest.webmanifest'];
for (const f of top) fs.copyFileSync(f, out + '/' + f);
for (const f of fs.readdirSync('js')) fs.copyFileSync('js/' + f, out + '/js/' + f);
// gói cập nhật: tự ghi file zip (deflate) bằng Node, đường dẫn dùng dấu "/" như Android cần
function crc32(buf){let c,crc=0xFFFFFFFF;for(let n=0;n<buf.length;n++){c=(crc^buf[n])&0xFF;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;crc=(crc>>>8)^c;}return(crc^0xFFFFFFFF)>>>0;}
function makeZip(files){const parts=[],central=[];let off=0;
  for(const [name,data] of files){const nm=Buffer.from(name,'utf8'),comp=zlib.deflateRawSync(data,{level:9}),crc=crc32(data);
    const lh=Buffer.alloc(30);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0x0800,6);lh.writeUInt16LE(8,8);lh.writeUInt32LE(0,10);
    lh.writeUInt32LE(crc,14);lh.writeUInt32LE(comp.length,18);lh.writeUInt32LE(data.length,22);lh.writeUInt16LE(nm.length,26);lh.writeUInt16LE(0,28);
    parts.push(lh,nm,comp);
    const ch=Buffer.alloc(46);ch.writeUInt32LE(0x02014b50,0);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt16LE(0x0800,8);ch.writeUInt16LE(8,10);ch.writeUInt32LE(0,12);
    ch.writeUInt32LE(crc,16);ch.writeUInt32LE(comp.length,20);ch.writeUInt32LE(data.length,24);ch.writeUInt16LE(nm.length,28);ch.writeUInt32LE(off,42);
    central.push(ch,nm);off+=30+nm.length+comp.length;}
  const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(off,16);
  return Buffer.concat([...parts,cd,end]);}
fs.mkdirSync('dist', { recursive: true });
const files=[...top.map(f=>[f,fs.readFileSync(out+'/'+f)]),...fs.readdirSync(out+'/js').map(f=>['js/'+f,fs.readFileSync(out+'/js/'+f)])];
fs.writeFileSync('dist/www.zip', makeZip(files));
const sha256 = crypto.createHash('sha256').update(fs.readFileSync('dist/www.zip')).digest('hex');
const info = { version, notes, zip: `https://github.com/${REPO}/releases/download/v${version}/www.zip`, sha256 };
if (process.env.APP_NEED_APK === '1') info.apk = true;
fs.writeFileSync('version.json', JSON.stringify(info, null, 2) + '\n');
console.log('Da chep game sang www/ va tao dist/www.zip (phien ban ' + version + ')');
