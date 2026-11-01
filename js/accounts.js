'use strict';
// ===================== TÀI KHOẢN =====================
// Mỗi máy giữ tối đa 6 tài khoản (tên đăng nhập + mật khẩu). Mỗi tài khoản có nhân vật và danh tính online riêng,
// nên mở nhiều tab là chơi được nhiều tài khoản cùng lúc. Mật khẩu chỉ lưu dạng băm (SHA-256 + muối) trên máy này.
const ACC_MAX=6,ACC_KEY='tk_accounts',LEGACY_SKEY='trukhe_tienduyen_v2';
const GM_HASH='b29310c675bb32a878d8653ac9e8a37f2f22997602acfa7232de17a972f0be93';
const ACC={cur:null};
const accList=()=>{try{const a=JSON.parse(localStorage.getItem(ACC_KEY));return Array.isArray(a)?a:[];}catch(e){return[];}};
const accWrite=a=>localStorage.setItem(ACC_KEY,JSON.stringify(a));
const accFind=u=>accList().find(a=>a.user===u);
const isGM=()=>!!(ACC.cur&&ACC.cur.gm);
function accUpdate(fields){if(!ACC.cur)return;const a=accList(),i=a.findIndex(x=>x.user===ACC.cur.user);if(i<0)return;Object.assign(a[i],fields);Object.assign(ACC.cur,fields);accWrite(a);}
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');}
const rndStr=n=>Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b%32]).join('');
// một tài khoản chỉ được mở ở một tab
const accChan='BroadcastChannel' in window?new BroadcastChannel('tk_acc'):null;
if(accChan)accChan.onmessage=e=>{const m=e.data||{};if(m.q==='who'&&ACC.cur&&m.user===ACC.cur.user)accChan.postMessage({a:'busy',user:m.user,nonce:m.nonce});};
function accInUse(user){return new Promise(r=>{if(!accChan)return r(false);const nonce=Math.random();let busy=false;
  const h=e=>{if(e.data&&e.data.a==='busy'&&e.data.nonce===nonce)busy=true;};accChan.addEventListener('message',h);accChan.postMessage({q:'who',user,nonce});
  setTimeout(()=>{accChan.removeEventListener('message',h);r(busy);},350);});}
// danh tính online theo tài khoản
netIdent=function(){if(ACC.cur){NET.id=ACC.cur.netId;NET.secret=ACC.cur.netSecret;}else if(!NET.id){NET.id=rndStr(8);NET.secret=rndStr(12);}};
// sau mỗi lần lưu, ghi tóm tắt nhân vật vào danh sách tài khoản
const _save0=save;
save=function(){_save0();if(ACC.cur&&player.sect){const c=ACC.cur;if(c.name!==player.name||c.lv!==player.lv||c.sect!==player.sect)accUpdate({name:player.name,lv:player.lv,sect:player.sect});}};
// GM không đưa lên bảng xếp hạng
const _cloudSave0=cloudSave;
cloudSave=async function(silent){if(isGM()){if(!silent)log('Tài khoản GM không lưu lên bảng xếp hạng','#ffb36b');return false;}return _cloudSave0(silent);};
// mã khôi phục: tải nhân vật trên mạng vào tài khoản đang đăng nhập
cloudLoad=async function(code){if(!netEnabled())throw new Error('off');const m=String(code).trim().toUpperCase().match(/^([A-Z0-9]{8})-([A-Z0-9]{12})$/);if(!m)throw new Error('ma');
  const data=await rpc('tk_load',{p_id:m[1],p_secret:m[2]});if(!data)throw new Error('khong');
  accUpdate({netId:m[1],netSecret:m[2]});netIdent();localStorage.setItem(SKEY,JSON.stringify(data));return data;};

function accLogin(acc){ACC.cur=acc;SKEY='tk_save_'+acc.user;sessionStorage.setItem('tk_cur',acc.user);netIdent();}
async function accRegister(user,pw,pw2,gmCode,useLegacy){
  user=String(user||'').trim().toLowerCase();
  if(!/^[a-z0-9_]{3,16}$/.test(user))return'Tên đăng nhập 3–16 ký tự, chỉ gồm chữ không dấu, số, dấu _';
  if(String(pw).length<4)return'Mật khẩu cần ít nhất 4 ký tự';
  if(pw!==pw2)return'Hai lần nhập mật khẩu không khớp';
  const a=accList();if(a.length>=ACC_MAX)return`Máy này đã có đủ ${ACC_MAX} tài khoản. Xóa bớt một tài khoản để tạo mới.`;
  if(a.some(x=>x.user===user))return'Tên đăng nhập này đã có trên máy';
  let gm=false;if(gmCode&&String(gmCode).trim()){gm=(await sha('tk-gm:'+String(gmCode).trim().toUpperCase()))===GM_HASH;if(!gm)return'Mã GM không đúng';}
  const salt=rndStr(16),acc={user,salt,hash:await sha(salt+':'+pw),netId:rndStr(8),netSecret:rndStr(12),gm,created:Date.now(),name:'',lv:0,sect:''};
  if(useLegacy){const old=localStorage.getItem(LEGACY_SKEY);if(old){localStorage.setItem('tk_save_'+user,old);localStorage.removeItem(LEGACY_SKEY);
    const id=localStorage.getItem('tk_net_id'),sec=localStorage.getItem('tk_net_secret');if(id&&sec){acc.netId=id;acc.netSecret=sec;}
    try{const s=JSON.parse(old);acc.name=s.name;acc.lv=s.lv;acc.sect=s.sect;}catch(e){}}}
  a.push(acc);accWrite(a);return acc;}
async function accCheck(user,pw){const acc=accFind(String(user||'').trim().toLowerCase());if(!acc)return'Không có tài khoản này trên máy';
  if((await sha(acc.salt+':'+pw))!==acc.hash)return'Sai mật khẩu';if(await accInUse(acc.user))return'Tài khoản này đang được mở ở một tab khác';return acc;}
function accDelete(user){accWrite(accList().filter(a=>a.user!==user));localStorage.removeItem('tk_save_'+user);}

// ---------- màn hình đăng nhập ----------
function accShowLogin(msg){const box=$('startMenu');const a=accList(),legacy=localStorage.getItem(LEGACY_SKEY);let ls=null;try{ls=legacy&&JSON.parse(legacy);}catch(e){}
  box.innerHTML=`<div class="acch">Đăng nhập</div>
    <input id="lgUser" placeholder="Tên đăng nhập" maxlength="16" autocomplete="username" spellcheck="false">
    <input id="lgPass" type="password" placeholder="Mật khẩu" maxlength="40" autocomplete="current-password">
    <div id="lgMsg">${msg||''}</div>
    <button class="btn big" id="lgGo">Vào game</button>
    <button class="btn" id="lgNew">Tạo tài khoản mới (${a.length}/${ACC_MAX})</button>
    ${ls&&ls.name?`<button class="btn gray" id="lgLegacy">Tạo tài khoản cho nhân vật cũ: ${esc(ls.name)} · cấp ${ls.lv|0}</button>`:''}
    ${a.length?`<div class="accl">${a.map(x=>`<div class="accr" data-u="${x.user}"><b>${esc(x.user)}</b>${x.gm?' <span class="gmtag">GM</span>':''} <span>${x.name?esc(x.name)+' · '+(SECTS[x.sect]?SECTS[x.sect].name:'')+' · cấp '+(x.lv|0):'chưa có nhân vật'}</span><button data-del="${x.user}" title="Xóa tài khoản">✕</button></div>`).join('')}</div>`:''}`;
  const go=async()=>{$('lgMsg').textContent='Đang kiểm tra...';const r=await accCheck($('lgUser').value,$('lgPass').value);if(typeof r==='string'){$('lgMsg').textContent=r;return;}
    accLogin(r);auInit();const s=loadSave();if(s){applySave(s);enterGame(false);}else{box.hidden=true;$('create').hidden=false;}};
  $('lgGo').onclick=go;$('lgPass').onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')go();};$('lgUser').onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')$('lgPass').focus();};
  $('lgNew').onclick=()=>accShowRegister(false);if($('lgLegacy'))$('lgLegacy').onclick=()=>accShowRegister(true);
  box.querySelectorAll('.accr').forEach(r=>r.onclick=e=>{if(e.target.dataset.del)return;$('lgUser').value=r.dataset.u;$('lgPass').focus();});
  box.querySelectorAll('[data-del]').forEach(b=>b.onclick=async e=>{e.stopPropagation();const u=b.dataset.del;const pw=prompt(`Nhập mật khẩu của "${u}" để XÓA tài khoản và nhân vật (không lấy lại được):`);if(pw==null)return;
    const r=await accCheck(u,pw);if(typeof r==='string'){accShowLogin(r);return;}accDelete(u);accShowLogin(`Đã xóa tài khoản ${u}`);});
  const last=sessionStorage.getItem('tk_cur');if(last&&accFind(last)){$('lgUser').value=last;}}
function accShowRegister(legacy){const box=$('startMenu');
  box.innerHTML=`<div class="acch">${legacy?'Tạo tài khoản cho nhân vật cũ':'Tạo tài khoản'}</div>
    <input id="rgUser" placeholder="Tên đăng nhập (3–16 ký tự không dấu)" maxlength="16" autocomplete="username" spellcheck="false">
    <input id="rgPass" type="password" placeholder="Mật khẩu (ít nhất 4 ký tự)" maxlength="40" autocomplete="new-password">
    <input id="rgPass2" type="password" placeholder="Nhập lại mật khẩu" maxlength="40" autocomplete="new-password">
    <input id="rgGm" placeholder="Mã GM (để trống nếu không có)" maxlength="24" spellcheck="false">
    <div id="lgMsg" style="color:#bbb">Tài khoản lưu trên máy này. Hãy nhớ mật khẩu: quên thì không lấy lại được.</div>
    <button class="btn big" id="rgGo">${legacy?'Tạo tài khoản và chơi tiếp':'Tạo tài khoản và tạo nhân vật'}</button><button class="btn gray" id="rgBack">Quay lại</button>`;
  box.querySelectorAll('input').forEach(i=>i.onkeydown=e=>e.stopPropagation());
  $('rgBack').onclick=()=>accShowLogin();
  $('rgGo').onclick=async()=>{$('lgMsg').textContent='Đang tạo...';const r=await accRegister($('rgUser').value,$('rgPass').value,$('rgPass2').value,$('rgGm').value,legacy);
    if(typeof r==='string'){$('lgMsg').style.color='#ffb36b';$('lgMsg').textContent=r;return;}
    accLogin(r);auInit();if(r.gm)toast('Đã tạo tài khoản GM','#ffd23f');const s=loadSave();if(s){applySave(s);enterGame(false);}else{box.hidden=true;$('create').hidden=false;}};}
// tạo nhân vật xong: nút Quay lại về màn hình đăng nhập (đăng xuất)
$('backBtn').onclick=()=>{$('create').hidden=true;$('startMenu').hidden=false;ACC.cur=null;accShowLogin();};
// mã khôi phục ở bước tạo nhân vật
(()=>{const c=$('create');const d=document.createElement('div');d.id='crRestore';d.innerHTML=`<a href="#" id="crRestoreLink">Đã có nhân vật trên mạng? Tải bằng mã khôi phục</a>
  <div id="crRestoreBox" hidden><input id="crCode" placeholder="VÍ DỤ: ABCD2345-ABCDEFGH2345" spellcheck="false"><button class="btn" id="crCodeGo" style="width:auto;display:inline-block;margin:0 0 0 6px">Tải</button><span id="crCodeMsg"></span></div>`;c.appendChild(d);
  $('crRestoreLink').onclick=e=>{e.preventDefault();$('crRestoreBox').hidden=!$('crRestoreBox').hidden;};$('crCode').onkeydown=e=>e.stopPropagation();
  $('crCodeGo').onclick=async()=>{$('crCodeMsg').textContent=' Đang tải...';try{const s=await cloudLoad($('crCode').value);$('crCodeMsg').textContent='';$('create').hidden=true;applySave(loadSave());enterGame(false);}
    catch(e){$('crCodeMsg').textContent=e.message==='ma'?' Mã không đúng định dạng':' Không tìm thấy nhân vật, hoặc chưa kết nối mạng';}};})();
// cài đặt: đăng xuất, đổi mật khẩu
(()=>{const r=$('resetBtn');const b=document.createElement('button');b.className='btn';b.id='logoutBtn';b.textContent='Đăng xuất (đổi tài khoản)';r.parentNode.insertBefore(b,r);
  b.onclick=()=>{save();removeEventListener('beforeunload',save);sessionStorage.removeItem('tk_cur');location.reload();};
  r.onclick=()=>{if(!resetArm){resetArm=true;r.textContent='Bấm lần nữa để XÓA nhân vật của tài khoản này';return;}removeEventListener('beforeunload',save);localStorage.removeItem(SKEY);if(ACC.cur)accUpdate({name:'',lv:0,sect:''});location.reload();};})();
$('startMenu').hidden=false;accShowLogin();
