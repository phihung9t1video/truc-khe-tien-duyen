'use strict';
// ===================== NHẠC RIÊNG =====================
// Người chơi tự chọn file nhạc có sẵn trên máy mình cho từng bản đồ (hoặc một bài cho mọi bản đồ).
// Nhạc chỉ lưu trong bộ nhớ trình duyệt/app của máy đó (IndexedDB), không gửi lên mạng.
const MYM={db:null,el:null,url:null,key:null};
function mymDB(){return new Promise((res,rej)=>{if(MYM.db)return res(MYM.db);const r=indexedDB.open('tk_music',1);r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>{MYM.db=r.result;res(MYM.db);};r.onerror=()=>rej(r.error);});}
async function mymGet(k){const db=await mymDB();return new Promise(res=>{const q=db.transaction('f').objectStore('f').get(k);q.onsuccess=()=>res(q.result||null);q.onerror=()=>res(null);});}
async function mymPut(k,v){const db=await mymDB();return new Promise(res=>{const t=db.transaction('f','readwrite');v?t.objectStore('f').put(v,k):t.objectStore('f').delete(k);t.oncomplete=()=>res(true);t.onerror=()=>res(false);});}
async function mymNames(){const db=await mymDB();return new Promise(res=>{const out={};const c=db.transaction('f').objectStore('f').openCursor();c.onsuccess=()=>{const x=c.result;if(!x)return res(out);out[x.key]=x.value&&x.value.name||'?';x.continue();};c.onerror=()=>res(out);});}
// phát nhạc riêng cho bản đồ hiện tại (nếu có), không có thì trả về nhạc tự tạo của game
async function mymApply(){if(!started)return;let rec=null,key=null;try{rec=await mymGet(curMapId);key=curMapId;if(!rec){rec=await mymGet('*');key='*';}}catch(e){}
  if(!MYM.el){MYM.el=new Audio();MYM.el.loop=true;MYM.el.volume=0.55;}
  if(!rec||!AU.music){MYM.el.pause();AU.custom=false;MYM.key=null;return;}
  if(MYM.key!==key+'|'+rec.t){if(MYM.url)URL.revokeObjectURL(MYM.url);MYM.url=URL.createObjectURL(rec.blob);MYM.el.src=MYM.url;MYM.key=key+'|'+rec.t;}
  AU.custom=true;try{await MYM.el.play();}catch(e){}}
// đổi bản đồ / bật tắt nhạc -> đổi bài
const _loadMapMym=loadMap;loadMap=function(...a){const r=_loadMapMym.apply(this,a);setTimeout(mymApply,50);return r;};
setInterval(()=>{if(!started||!MYM.el)return;if(!AU.music&&!MYM.el.paused){MYM.el.pause();AU.custom=false;}else if(AU.music&&MYM.key&&MYM.el.paused&&!document.hidden)MYM.el.play().catch(()=>{});},1500);
addEventListener('pointerdown',()=>{if(started&&AU.music&&MYM.key&&MYM.el&&MYM.el.paused)MYM.el.play().catch(()=>{});},{passive:true});
// giao diện trong Cài đặt
(()=>{const m=$('optMusic');if(!m)return;const box=document.createElement('div');box.id='mymBox';box.style.cssText='margin:6px 0 4px;padding:8px;border:1px solid #5a4a30;border-radius:8px;background:rgba(0,0,0,.25);font-size:13px';
  box.innerHTML=`<div style="color:#ffd77a;font-weight:bold;margin-bottom:4px">Nhạc riêng (chọn file nhạc trên máy bạn)</div><div id="mymInfo" style="color:#ccc;margin-bottom:6px"></div>
    <button class="btn" id="mymMap" style="width:auto;display:inline-block;margin:2px">Chọn bài cho bản đồ này</button><button class="btn" id="mymAll" style="width:auto;display:inline-block;margin:2px">Chọn bài cho mọi bản đồ</button>
    <button class="btn gray" id="mymDel" style="width:auto;display:inline-block;margin:2px">Bỏ bài của bản đồ này</button><button class="btn gray" id="mymDelAll" style="width:auto;display:inline-block;margin:2px">Bỏ hết nhạc riêng</button>
    <div style="color:#999;font-size:11.5px;margin-top:4px">Nhạc chỉ lưu và phát trên máy này, không gửi lên mạng. Bản đồ không có bài riêng sẽ dùng "bài cho mọi bản đồ", không có nữa thì dùng nhạc của game.</div>
    <input type="file" id="mymFile" accept="audio/*" hidden>`;
  m.parentNode.parentNode.insertBefore(box,m.parentNode.nextSibling);
  let target=null;const f=$('mymFile');
  $('mymMap').onclick=()=>{target=curMapId;f.value='';f.click();};$('mymAll').onclick=()=>{target='*';f.value='';f.click();};
  f.onchange=async()=>{const file=f.files&&f.files[0];if(!file||!target)return;if(file.size>40e6)return log('File quá lớn (tối đa 40 MB)','#ff9a8a');
    const ok=await mymPut(target,{blob:file,name:file.name,t:Date.now()});log(ok?`Đã đặt nhạc "${file.name}" cho ${target==='*'?'mọi bản đồ':MAPS[target].name}`:'Không lưu được file nhạc',ok?'#9fffb0':'#ff9a8a');
    if(ok&&!AU.music){AU.music=true;m.checked=true;auSet('music',true);save();}mymInfo();mymApply();};
  $('mymDel').onclick=async()=>{await mymPut(curMapId,null);log(`Đã bỏ nhạc riêng của ${MAPS[curMapId].name}`,'#ccc');mymInfo();mymApply();};
  $('mymDelAll').onclick=async()=>{const n=await mymNames();for(const k in n)await mymPut(k,null);log('Đã bỏ hết nhạc riêng','#ccc');mymInfo();mymApply();};
  window.mymInfo=async()=>{const n=await mymNames(),cnt=Object.keys(n).filter(k=>k!=='*').length;
    $('mymInfo').innerHTML=`Bản đồ này (${MAPS[curMapId]?MAPS[curMapId].name:''}): <b style="color:#9fffb0">${n[curMapId]?esc(n[curMapId]):'chưa có'}</b><br>Mọi bản đồ: <b style="color:#9fffb0">${n['*']?esc(n['*']):'chưa có'}</b> · Đã đặt riêng cho ${cnt} bản đồ`;};})();
const _renderSetMym=renderSet;renderSet=function(){_renderSetMym();if(window.mymInfo)mymInfo();};
