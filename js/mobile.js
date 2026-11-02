'use strict';
// ===================== ĐIỆN THOẠI: CHẠY NỀN, CỬA SỔ NỔI, VÀO LẠI =====================
// - App Android: nút "Thu nhỏ" (và tự thu nhỏ khi bấm Home) -> game thành cửa sổ nổi, vẫn chạy, vẫn ở trong tổ đội.
// - Trình duyệt điện thoại tự dừng trang khi ẩn: khi quay lại, game tự vào lại tài khoản, tự kết nối và xin vào lại tổ đội cũ.
const TKN=()=>(window.Capacitor&&typeof Capacitor.isNativePlatform==='function'&&Capacitor.isNativePlatform()&&Capacitor.Plugins&&Capacitor.Plugins.TKNative)||null;
// cửa sổ nổi: ẩn bớt giao diện cho gọn
window.onPipChange=inPip=>{document.body.classList.toggle('pip',!!inPip);if(inPip)PANELS.forEach(p=>$(p).hidden=true);};
function pipBlocked(){openDlg('Máy đang chặn cửa sổ nổi','Điện thoại của bạn đang tắt quyền <b>Hình trong hình</b> cho game.<br><br>Bấm nút dưới để mở cài đặt, bật <b>Cho phép hình trong hình</b> (có máy ghi là <i>Picture-in-picture</i> hoặc <i>Cửa sổ nổi</i>), rồi quay lại game bấm <b>Thu nhỏ</b>.',
  [{t:'Mở cài đặt',fn:()=>{closeDlg();try{TKN().openPipSettings();}catch(e){}}},{t:'Để sau',gray:true,fn:closeDlg}]);}
(async()=>{const st=document.createElement('style');st.textContent='body.pip #hud{display:none!important}body.pip #dlg{display:none!important}';document.head.appendChild(st);
  const P=TKN();if(!P)return;let info=null;try{info=await P.info();}catch(e){return;}if(!info||!info.canPip)return;
  try{P.addListener('pipChange',e=>window.onPipChange(e&&e.inPip));}catch(e){}
  const b=document.createElement('button');b.id='btnPip';b.textContent='Thu nhỏ';b.title='Thu nhỏ game thành cửa sổ nổi, game vẫn chạy';$('menuBtns').appendChild(b);
  b.onclick=async()=>{sfx('click');try{const r=await P.pip();if(!r||!r.ok)pipBlocked();}catch(e){pipBlocked();}};
  const h=document.createElement('button');h.id='btnHide';h.textContent='Ẩn';h.title='Ẩn game xuống nền, nhân vật vẫn chạy (bấm thông báo để mở lại)';$('menuBtns').appendChild(h);
  h.onclick=()=>{sfx('click');save();log('Game chạy nền: bấm thông báo "đang chạy nền" để mở lại','#9fffb0');try{P.hide();}catch(e){}};
  const m=$('optMusic');if(m){const row=document.createElement('div');row.className='setrow';row.innerHTML='<span>Tự thu nhỏ thành cửa sổ nổi khi bấm Home</span><input type="checkbox" id="optPip">';m.parentNode.parentNode.insertBefore(row,m.parentNode);
    const c=$('optPip');c.checked=info.autoPip!==false;c.onchange=()=>{try{P.setAutoPip({on:c.checked});}catch(e){}sfx('click');};}
  if(info.pipAllowed===false)setTimeout(()=>log('Máy đang chặn cửa sổ nổi cho game: bấm Thu nhỏ để xem cách bật','#ffb36b'),5000);})();
// quay lại sau khi bị ẩn: kết nối lại, chào lại, xin vào lại đội cũ
function onBack(){if(!started)return;
  try{if(NET.ws&&NET.ws.readyState>1){NET.ws=null;}if(!NET.ws&&typeof netConnect==='function'){NET.retryT=0;netConnect();}}catch(e){}
  setTimeout(()=>{try{netHello();if(typeof accAnnounce==='function'&&ACC.cur)ACC.announced=true;}catch(e){}
    if(typeof inParty==='function'&&!inParty()&&PARTY.prev&&Date.now()-PARTY.prev.t<20*60000&&NET.status==='on'){const L=NET.world.get(PARTY.prev.id);
      netCast('tk_world','preq',{id:NET.id,name:player.name,lv:player.lv,sect:player.sect,to:PARTY.prev.id});log(`Đang xin vào lại tổ đội${L?' của '+L.name:''}...`,'#9fffb0');}},2500);}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)onBack();});
addEventListener('pageshow',e=>{if(e.persisted)onBack();});
// trang bị trình duyệt tải lại (do điện thoại dọn bộ nhớ): tự vào lại game, không bắt đăng nhập lại
setTimeout(()=>{if(started||ACC.cur)return;const u=sessionStorage.getItem('tk_resume'),acc=u&&typeof accFind==='function'&&accFind(u);
  if(!acc||!localStorage.getItem('tk_save_'+u))return;if(typeof playCheck==='function'){const m=playCheck(u);if(m)return;}
  try{enterAfterLogin(acc);toast('Đã vào lại game','#9fffb0');
    const pv=sessionStorage.getItem('tk_prevparty');if(pv){try{PARTY.prev=JSON.parse(pv);}catch(e){}setTimeout(onBack,4000);}}catch(e){}},600);
// nhớ đội trưởng để xin vào lại sau khi tải lại trang
setInterval(()=>{try{if(typeof inParty==='function'&&inParty()&&!isLeader())sessionStorage.setItem('tk_prevparty',JSON.stringify({id:PARTY.leader,t:Date.now()}));
  else if(PARTY.prev)sessionStorage.setItem('tk_prevparty',JSON.stringify(PARTY.prev));else sessionStorage.removeItem('tk_prevparty');}catch(e){}},3000);
