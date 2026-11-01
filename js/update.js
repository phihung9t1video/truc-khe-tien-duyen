'use strict';
// ===================== CẬP NHẬT =====================
// Mỗi lần phát hành, version.json trên GitHub Pages ghi số phiên bản mới, đường dẫn gói game (www.zip) và mã SHA-256 của gói.
// App Android: bấm "Cập nhật ngay" là tải gói về và chạy bản mới ngay trong app (plugin Capacitor Updater), không cần cài lại APK.
// Chỉ khi bản mới đổi phần lõi Android (version.json có "apk": true) mới phải tải APK.
// Trang web: tải lại trang là có bản mới.
const UPDATE_URL='https://phihung9t1video.github.io/truc-khe-tien-duyen/version.json';
const APK_URL='https://github.com/phihung9t1video/truc-khe-tien-duyen/releases/latest/download/truc-khe-tien-duyen.apk';
const isApp=()=>!!(window.Capacitor&&typeof window.Capacitor.isNativePlatform==='function'&&window.Capacitor.isNativePlatform());
const updater=()=>isApp()&&window.Capacitor.Plugins&&window.Capacitor.Plugins.CapacitorUpdater||null;
const verNum=v=>String(v||'0').split('.').slice(0,3).reduce((a,n)=>a*1000+(parseInt(n,10)||0),0);
// báo cho plugin biết bản đang chạy khởi động tốt (nếu không, plugin tự quay về bản trước)
try{const U=updater();if(U)U.notifyAppReady();}catch(e){}
let updSkip='',updBusy=false;
async function checkUpdate(){
  if(!window.APP_VERSION||location.protocol==='file:'||/^(localhost|127\.)/.test(location.hostname)&&!isApp())return;
  try{const r=await fetch(UPDATE_URL+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const j=await r.json();
    if(j&&verNum(j.version)>verNum(window.APP_VERSION)&&updSkip!==j.version)showUpdate(j);}catch(e){}}
async function liveUpdate(j,setMsg){const U=updater();
  let lis=null;try{lis=await U.addListener('download',i=>{if(i&&i.percent!=null)setMsg(`Đang tải bản mới... ${Math.round(i.percent)}%`);});}catch(e){}
  setMsg('Đang tải bản mới...');
  const opt={url:j.zip,version:j.version};if(j.sha256)opt.checksum=j.sha256;
  const b=await U.download(opt);
  try{if(lis&&lis.remove)lis.remove();}catch(e){}
  setMsg('Đang cài bản mới...');if(typeof save==='function')save();
  await U.set({id:b.id});}// app tự khởi động lại vào bản mới
function showUpdate(j){if(document.getElementById('updBox'))return;const app=isApp(),live=app&&!!updater()&&j.zip&&!j.apk;
  const d=document.createElement('div');d.id='updBox';
  d.style.cssText='position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font-family:inherit';
  const esc2=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const how=live?'Bấm Cập nhật ngay, game tự tải và chạy bản mới trong vài giây. Nhân vật vẫn được giữ nguyên.':app?'Bản này cần cài lại ứng dụng: bấm Tải bản mới, tải xong mở file để cài đè. Nhân vật vẫn được giữ nguyên.':'Tải lại trang để chơi bản mới. Nhân vật vẫn được giữ nguyên.';
  d.innerHTML=`<div class="panel" style="width:min(440px,92vw);padding:16px 18px;line-height:1.55;font-size:14px">
    <h3 class="serif" style="margin:0 0 6px;color:#ffd77a">Đã có bản mới ${esc2(j.version)}</h3>
    <div>Bạn đang dùng bản <b>${esc2(window.APP_VERSION)}</b>.</div>
    ${j.notes?`<div style="margin-top:6px;color:#ddd">Có gì mới: ${esc2(j.notes)}</div>`:''}
    <div id="updMsg" style="margin-top:6px;color:#aaa;font-size:12.5px">${how}</div>
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" id="updGo">${live?'Cập nhật ngay':app?'Tải bản mới':'Tải lại trang'}</button><button class="btn gray" id="updLater">Để sau</button></div></div>`;
  document.body.appendChild(d);
  const msg=t=>{const m=document.getElementById('updMsg');if(m){m.style.color='#ffe9a0';m.textContent=t;}};
  document.getElementById('updGo').onclick=async()=>{if(updBusy)return;if(typeof save==='function')save();
    if(live){updBusy=true;document.getElementById('updGo').disabled=true;document.getElementById('updLater').disabled=true;
      try{await liveUpdate(j,msg);}catch(e){updBusy=false;document.getElementById('updGo').disabled=false;document.getElementById('updLater').disabled=false;
        msg('Cập nhật chưa được (mạng yếu hoặc gói lỗi). Bấm lại để thử, hoặc tải APK ở trang GitHub.');}}
    else if(app)location.href=APK_URL;else location.reload();};
  document.getElementById('updLater').onclick=()=>{if(updBusy)return;updSkip=j.version;d.remove();};}
setTimeout(checkUpdate,4000);
setInterval(checkUpdate,30*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkUpdate();});
