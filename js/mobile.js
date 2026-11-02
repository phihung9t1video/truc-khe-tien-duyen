'use strict';
// ===================== ĐIỆN THOẠI: CHẠY NỀN, CỬA SỔ NỔI, VÀO LẠI =====================
// - App Android: nút "Thu nhỏ" (và tự thu nhỏ khi bấm Home) -> game thành cửa sổ nổi, vẫn chạy, vẫn ở trong tổ đội.
// - Trình duyệt điện thoại tự dừng trang khi ẩn: khi quay lại, game tự vào lại tài khoản, tự kết nối và xin vào lại tổ đội cũ.
const NATIVE=typeof window.TKNative!=='undefined'&&window.TKNative;
const canPip=()=>{try{return !!(NATIVE&&NATIVE.canPip());}catch(e){return false;}};
// cửa sổ nổi: ẩn bớt giao diện cho gọn
window.onPipChange=inPip=>{document.body.classList.toggle('pip',!!inPip);if(inPip)PANELS.forEach(p=>$(p).hidden=true);};
(()=>{const st=document.createElement('style');st.textContent='body.pip #hud{display:none!important}body.pip #dlg{display:none!important}';document.head.appendChild(st);
  if(canPip()){const b=document.createElement('button');b.id='btnPip';b.textContent='Thu nhỏ';b.title='Thu nhỏ game thành cửa sổ nổi, game vẫn chạy';$('menuBtns').appendChild(b);b.onclick=()=>{sfx('click');try{NATIVE.pip();}catch(e){}};
    const m=$('optMusic');if(m){const row=document.createElement('div');row.className='setrow';row.innerHTML='<span>Tự thu nhỏ thành cửa sổ nổi khi bấm Home</span><input type="checkbox" id="optPip">';m.parentNode.parentNode.insertBefore(row,m.parentNode);
      const c=$('optPip');try{c.checked=NATIVE.autoPip();}catch(e){c.checked=true;}c.onchange=()=>{try{NATIVE.setAutoPip(c.checked);}catch(e){}sfx('click');};}}})();
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
