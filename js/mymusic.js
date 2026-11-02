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
  if(!rec||!AU.music){MYM.el.pause();ytStop();AU.custom=false;MYM.key=null;return;}
  if(rec.yt){MYM.el.pause();AU.custom=true;MYM.key='yt|'+rec.yt;ytPlay(rec.yt,rec.list);return;}ytStop();
  if(MYM.key!==key+'|'+rec.t){if(MYM.url)URL.revokeObjectURL(MYM.url);MYM.url=URL.createObjectURL(rec.blob);MYM.el.src=MYM.url;MYM.key=key+'|'+rec.t;}
  AU.custom=true;try{await MYM.el.play();}catch(e){}}
// đổi bản đồ / bật tắt nhạc -> đổi bài
const _loadMapMym=loadMap;loadMap=function(...a){const r=_loadMapMym.apply(this,a);setTimeout(mymApply,50);return r;};
setInterval(()=>{if(!started||!MYM.el)return;if(!AU.music&&YT_.on){ytStop();AU.custom=false;MYM.key=null;}if(!AU.music&&!MYM.el.paused){MYM.el.pause();AU.custom=false;}else if(AU.music&&MYM.key&&MYM.el.paused&&!document.hidden)MYM.el.play().catch(()=>{});},1500);
addEventListener('pointerdown',()=>{if(started&&AU.music&&MYM.key&&MYM.el&&MYM.el.paused)MYM.el.play().catch(()=>{});},{passive:true});
// giao diện trong Cài đặt
(()=>{const m=$('optMusic');if(!m)return;const box=document.createElement('div');box.id='mymBox';box.style.cssText='margin:6px 0 4px;padding:8px;border:1px solid #5a4a30;border-radius:8px;background:rgba(0,0,0,.25);font-size:13px';
  box.innerHTML=`<div style="color:#ffd77a;font-weight:bold;margin-bottom:4px">Nhạc riêng (chọn file nhạc trên máy bạn)</div><div id="mymInfo" style="color:#ccc;margin-bottom:6px"></div>
    <button class="btn" id="mymMap" style="width:auto;display:inline-block;margin:2px">Chọn bài cho bản đồ này</button><button class="btn" id="mymAll" style="width:auto;display:inline-block;margin:2px">Chọn bài cho mọi bản đồ</button>
    <button class="btn gray" id="mymDel" style="width:auto;display:inline-block;margin:2px">Bỏ bài của bản đồ này</button><button class="btn gray" id="mymDelAll" style="width:auto;display:inline-block;margin:2px">Bỏ hết nhạc riêng</button>
    <div style="margin-top:6px"><input id="ytUrl" placeholder="Dán link YouTube (bài hát hoặc danh sách phát)" style="width:100%;box-sizing:border-box;padding:6px;border-radius:6px;border:1px solid #6a5634;background:#1e1810;color:#ffe9b0" spellcheck="false"></div>
    <button class="btn" id="ytMap" style="width:auto;display:inline-block;margin:2px">Dùng link cho bản đồ này</button><button class="btn" id="ytAll" style="width:auto;display:inline-block;margin:2px">Dùng link cho mọi bản đồ</button>
    <div style="color:#999;font-size:11.5px;margin-top:4px">Nhạc YouTube phát trong một khung nhỏ ở góc màn hình (YouTube bắt buộc khung phải hiện ra); kéo khung để dời chỗ, bấm ✕ để tắt. Nhạc chỉ lưu và phát trên máy này, không gửi lên mạng. Bản đồ không có bài riêng sẽ dùng "bài cho mọi bản đồ", không có nữa thì dùng nhạc của game.</div>
    <input type="file" id="mymFile" accept="audio/*" hidden>`;
  m.parentNode.parentNode.insertBefore(box,m.parentNode.nextSibling);
  let target=null;const f=$('mymFile');
  $('mymMap').onclick=()=>{target=curMapId;f.value='';f.click();};$('mymAll').onclick=()=>{target='*';f.value='';f.click();};
  f.onchange=async()=>{const file=f.files&&f.files[0];if(!file||!target)return;if(file.size>40e6)return log('File quá lớn (tối đa 40 MB)','#ff9a8a');
    const ok=await mymPut(target,{blob:file,name:file.name,t:Date.now()});log(ok?`Đã đặt nhạc "${file.name}" cho ${target==='*'?'mọi bản đồ':MAPS[target].name}`:'Không lưu được file nhạc',ok?'#9fffb0':'#ff9a8a');
    if(ok&&!AU.music){AU.music=true;m.checked=true;auSet('music',true);save();}mymInfo();mymApply();};
  $('ytUrl').onkeydown=e=>e.stopPropagation();
  const ytSet=async t=>{const p=ytParse($('ytUrl').value);if(!p)return log('Link YouTube không đúng','#ff9a8a');await mymPut(t,{yt:p.id,list:p.list,name:'YouTube '+(p.list?'danh sách '+p.list.slice(0,8):p.id),t:Date.now()});
    log(`Đã đặt nhạc YouTube cho ${t==='*'?'mọi bản đồ':MAPS[t].name}`,'#9fffb0');if(!AU.music){AU.music=true;m.checked=true;auSet('music',true);save();}$('ytUrl').value='';mymInfo();MYM.key=null;mymApply();};
  $('ytMap').onclick=()=>ytSet(curMapId);$('ytAll').onclick=()=>ytSet('*');
  $('mymDel').onclick=async()=>{await mymPut(curMapId,null);log(`Đã bỏ nhạc riêng của ${MAPS[curMapId].name}`,'#ccc');mymInfo();mymApply();};
  $('mymDelAll').onclick=async()=>{const n=await mymNames();for(const k in n)await mymPut(k,null);log('Đã bỏ hết nhạc riêng','#ccc');mymInfo();mymApply();};
  window.mymInfo=async()=>{const n=await mymNames(),cnt=Object.keys(n).filter(k=>k!=='*').length;
    $('mymInfo').innerHTML=`Bản đồ này (${MAPS[curMapId]?MAPS[curMapId].name:''}): <b style="color:#9fffb0">${n[curMapId]?esc(n[curMapId]):'chưa có'}</b><br>Mọi bản đồ: <b style="color:#9fffb0">${n['*']?esc(n['*']):'chưa có'}</b> · Đã đặt riêng cho ${cnt} bản đồ`;};})();
const _renderSetMym=renderSet;renderSet=function(){_renderSetMym();if(window.mymInfo)mymInfo();};

// ---------- trình phát YouTube (khung nhỏ, kéo được) ----------
const YT_={api:null,player:null,on:false,cur:null,box:null};
function ytParse(u){u=String(u||'').trim();if(!u)return null;let id=null,list=null;
  const mL=u.match(/[?&]list=([\w-]+)/);if(mL)list=mL[1];
  const m1=u.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);if(m1)id=m1[1];else if(/^[\w-]{11}$/.test(u))id=u;
  return id||list?{id:id||'',list}:null;}
function ytLoadApi(){if(YT_.api)return YT_.api;YT_.api=new Promise(res=>{window.onYouTubeIframeAPIReady=()=>res(window.YT);const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.onerror=()=>res(null);document.head.appendChild(s);});return YT_.api;}
function ytBox(){if(YT_.box)return YT_.box;const b=document.createElement('div');b.id='ytBox';
  b.style.cssText='position:fixed;left:10px;bottom:96px;width:220px;z-index:40;background:#120e0a;border:1px solid #c9a227;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.6);overflow:hidden;touch-action:none';
  b.innerHTML='<div id="ytHead" style="display:flex;align-items:center;gap:6px;padding:3px 6px;background:linear-gradient(#4a3a20,#2a2010);color:#ffe9b0;font-size:12px;cursor:move"><span style="flex:1">♪ Nhạc YouTube</span><button id="ytX" style="background:none;border:0;color:#ffb0a0;font-size:15px;cursor:pointer">✕</button></div><div id="ytPl" style="width:220px;height:200px"></div>';
  document.body.appendChild(b);YT_.box=b;
  $('ytX').onclick=()=>{ytStop();AU.custom=false;MYM.key='off';log('Đã tắt nhạc YouTube (mở lại trong Cài đặt hoặc khi đổi bản đồ)','#ccc');};
  let dr=null;const h=$('ytHead');h.onpointerdown=e=>{if(e.target.id==='ytX')return;dr={x:e.clientX,y:e.clientY,l:b.offsetLeft,t:b.offsetTop};h.setPointerCapture(e.pointerId);};
  h.onpointermove=e=>{if(!dr)return;b.style.left=Math.max(0,Math.min(innerWidth-60,dr.l+e.clientX-dr.x))+'px';b.style.top=Math.max(0,Math.min(innerHeight-30,dr.t+e.clientY-dr.y))+'px';b.style.bottom='auto';};
  h.onpointerup=()=>{dr=null;};return b;}
async function ytPlay(id,list){const key=id+'|'+(list||'');if(YT_.on&&YT_.cur===key)return;const YT=await ytLoadApi();if(!YT){log('Không tải được trình phát YouTube (kiểm tra mạng)','#ff9a8a');return;}
  const b=ytBox();b.hidden=false;YT_.on=true;YT_.cur=key;
  const pv={autoplay:1,loop:1,playsinline:1,rel:0};if(list){pv.listType='playlist';pv.list=list;}else pv.playlist=id;
  if(YT_.player&&YT_.player.loadVideoById){try{if(list)YT_.player.loadPlaylist({list,listType:'playlist'});else YT_.player.loadVideoById(id);YT_.player.setLoop(true);return;}catch(e){}}
  YT_.player=new YT.Player('ytPl',{width:220,height:200,videoId:id||undefined,playerVars:pv,events:{onReady:e=>{try{e.target.setVolume(55);e.target.playVideo();}catch(x){}},
    onError:e=>log(e.data===101||e.data===150||e.data===153?'Video này không cho phát ngoài YouTube, hãy chọn bài khác':'YouTube báo lỗi khi phát bài này','#ff9a8a')}});}
function ytStop(){if(!YT_.on)return;YT_.on=false;YT_.cur=null;try{YT_.player&&YT_.player.stopVideo();}catch(e){}if(YT_.box)YT_.box.hidden=true;}
