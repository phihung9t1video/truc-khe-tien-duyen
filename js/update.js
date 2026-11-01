'use strict';
// ===================== BÁO CẬP NHẬT =====================
// Mỗi lần phát hành, version.json trên GitHub Pages được cập nhật. App Android (và trang web đang mở lâu)
// so sánh với phiên bản đang chạy (js/version.js) và báo khi có bản mới.
const UPDATE_URL='https://phihung9t1video.github.io/truc-khe-tien-duyen/version.json';
const APK_URL='https://github.com/phihung9t1video/truc-khe-tien-duyen/releases/latest/download/truc-khe-tien-duyen.apk';
const isApp=()=>!!(window.Capacitor&&typeof window.Capacitor.isNativePlatform==='function'&&window.Capacitor.isNativePlatform());
const verNum=v=>String(v||'0').split('.').slice(0,3).reduce((a,n)=>a*1000+(parseInt(n,10)||0),0);
let updSkip='';
async function checkUpdate(){
  if(!window.APP_VERSION||location.protocol==='file:'||/^(localhost|127\.)/.test(location.hostname)&&!isApp())return;
  try{const r=await fetch(UPDATE_URL+'?t='+Date.now(),{cache:'no-store'});if(!r.ok)return;const j=await r.json();
    if(j&&verNum(j.version)>verNum(window.APP_VERSION)&&updSkip!==j.version)showUpdate(j);}catch(e){}}
function showUpdate(j){if(document.getElementById('updBox'))return;const app=isApp();
  const d=document.createElement('div');d.id='updBox';
  d.style.cssText='position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;font-family:inherit';
  const esc2=s=>String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  d.innerHTML=`<div class="panel" style="width:min(440px,92vw);padding:16px 18px;line-height:1.55;font-size:14px">
    <h3 class="serif" style="margin:0 0 6px;color:#ffd77a">Đã có bản mới ${esc2(j.version)}</h3>
    <div>Bạn đang dùng bản <b>${esc2(window.APP_VERSION)}</b>.</div>
    ${j.notes?`<div style="margin-top:6px;color:#ddd">Có gì mới: ${esc2(j.notes)}</div>`:''}
    <div style="margin-top:6px;color:#aaa;font-size:12.5px">${app?'Bấm Tải bản mới, tải xong mở file để cài đè. Nhân vật vẫn được giữ nguyên.':'Tải lại trang để chơi bản mới. Nhân vật vẫn được giữ nguyên.'}</div>
    <div style="display:flex;gap:8px;margin-top:12px"><button class="btn" id="updGo">${app?'Tải bản mới':'Tải lại trang'}</button><button class="btn gray" id="updLater">Để sau</button></div></div>`;
  document.body.appendChild(d);
  document.getElementById('updGo').onclick=()=>{if(typeof save==='function')save();if(app)location.href=APK_URL;else location.reload();};
  document.getElementById('updLater').onclick=()=>{updSkip=j.version;d.remove();};}
setTimeout(checkUpdate,4000);
setInterval(checkUpdate,30*60*1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkUpdate();});
