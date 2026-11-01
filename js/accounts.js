'use strict';
// ===================== TÀI KHOẢN =====================
// Tài khoản lưu trên máy chủ (Supabase, bảng tk_accounts): đăng nhập ở máy nào cũng được, nhân vật đi theo tài khoản.
// Máy nào đăng nhập sau sẽ nắm phiên; máy trước tự ngừng lưu để không ghi đè nhau.
// Mỗi máy chơi tối đa 6 nhân vật cùng lúc (6 tab/cửa sổ). Trên máy có lưu bản sao để chơi tiếp khi mất mạng.
// Khi máy chủ chưa bật bảng tài khoản (chưa chạy supabase/schema.sql), game tự dùng tài khoản lưu trên máy như trước.
const PLAY_MAX=6,ACC_KEY='tk_accounts',LIVE_KEY='tk_live',LEGACY_SKEY='trukhe_tienduyen_v2';
// Tài khoản GM duy nhất. Chỉ lưu dấu kiểm tra băm chậm (PBKDF2 400.000 vòng), không lưu mật khẩu.
const GM_USER='khatmau01',GM_SALT='tk-khatmau01-v1',GM_CHECK='5d9289b09f3d7a9a356e55ebff87ff546f9c3f012ca20b391961b6b5b4132493';
const ACC={cur:null,srv:'unknown',syncing:false,lost:false};
const accList=()=>{try{const a=JSON.parse(localStorage.getItem(ACC_KEY));return Array.isArray(a)?a:[];}catch(e){return[];}};
const accWrite=a=>localStorage.setItem(ACC_KEY,JSON.stringify(a));
const accFind=u=>accList().find(a=>a.user===u);
function accPut(acc){const a=accList(),i=a.findIndex(x=>x.user===acc.user);if(i<0)a.push(acc);else a[i]=Object.assign(a[i],acc);accWrite(a);return accFind(acc.user);}
const isGM=()=>!!(ACC.cur&&ACC.cur.gm&&ACC.cur.user===GM_USER);
async function gmDerive(pw){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveBits']);
  const b=new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(GM_SALT),iterations:400000},key,512));
  const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',ids=Array.from(b.slice(32),x=>A[x%32]).join('');
  return{check:Array.from(b.slice(0,32),x=>x.toString(16).padStart(2,'0')).join(''),id:ids.slice(0,8),sec:ids.slice(8,20)};}
function accUpdate(fields){if(!ACC.cur)return;const a=accList(),i=a.findIndex(x=>x.user===ACC.cur.user);if(i<0)return;Object.assign(a[i],fields);Object.assign(ACC.cur,fields);accWrite(a);}
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');}
const rndStr=n=>Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b%32]).join('');
const A32='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// danh tính online cố định theo tên tài khoản (bạn bè, tổ đội nhận ra nhau ở mọi máy)
async function netIdFor(user){const h=await sha('tk-net:'+user);let s='';for(let i=0;i<8;i++)s+=A32[parseInt(h.substr(i*2,2),16)%32];return s;}
// gọi hàm trên máy chủ, trả về cả lý do lỗi
async function rpcx(fn,args){if(!netEnabled())return{ok:false,off:true};
  try{const r=await fetch(NET.cfg.url.replace(/\/$/,'')+'/rest/v1/rpc/'+fn,{method:'POST',headers:{'Content-Type':'application/json',apikey:NET.cfg.key,Authorization:'Bearer '+NET.cfg.key},body:JSON.stringify(args)});
    const t=await r.text();let j=null;try{j=t?JSON.parse(t):null;}catch(e){}
    if(r.ok){ACC.srv='ok';return{ok:true,data:j};}
    const missing=r.status===404||(j&&j.code==='PGRST202');if(missing)ACC.srv='missing';
    return{ok:false,status:r.status,msg:j&&j.message||'',missing};}
  catch(e){return{ok:false,net:true};}}
// ---------- giới hạn 6 nhân vật cùng lúc trên một máy ----------
const TAB_ID=rndStr(10);
const liveMap=()=>{try{return JSON.parse(localStorage.getItem(LIVE_KEY))||{};}catch(e){return{};}};
function liveOthers(){const m=liveMap(),now=Date.now();return Object.entries(m).filter(([k,v])=>k!==TAB_ID&&v&&now-v.t<7000);}
function liveBeat(){if(!ACC.cur)return;const m=liveMap(),now=Date.now();for(const k in m)if(!m[k]||now-m[k].t>15000)delete m[k];m[TAB_ID]={u:ACC.cur.user,t:now};try{localStorage.setItem(LIVE_KEY,JSON.stringify(m));}catch(e){}}
function liveLeave(){const m=liveMap();delete m[TAB_ID];try{localStorage.setItem(LIVE_KEY,JSON.stringify(m));}catch(e){}}
setInterval(liveBeat,2000);addEventListener('pagehide',liveLeave);
function playCheck(user){const o=liveOthers();if(o.some(([k,v])=>v.u===user))return'Tài khoản này đang được mở ở một tab khác trên máy này';
  if(o.length>=PLAY_MAX)return`Máy này đang chơi đủ ${PLAY_MAX} nhân vật cùng lúc. Đóng bớt một tab rồi đăng nhập lại.`;return null;}
// danh tính online theo tài khoản
netIdent=function(){if(ACC.cur){NET.id=ACC.cur.netId;NET.secret=ACC.cur.netSecret;}else if(!NET.id){NET.id=rndStr(8);NET.secret=rndStr(12);}};
// ---------- lưu ----------
const _save0=save;
save=function(){_save0();if(ACC.cur&&player.sect){const c=ACC.cur;if(c.name!==player.name||c.lv!==player.lv||c.sect!==player.sect)accUpdate({name:player.name,lv:player.lv,sect:player.sect});}};
const localData=()=>{try{return JSON.parse(localStorage.getItem(SKEY));}catch(e){return null;}};
// đẩy nhân vật lên máy chủ (tài khoản máy chủ)
async function accSync(silent){const c=ACC.cur;if(!c||!c.server||!c.token||ACC.lost||!player.sect)return false;
  if(ACC.syncing){ACC.again=true;return ACC.syncing;}ACC.syncing=accSyncRun(silent).finally(()=>{ACC.syncing=false;if(ACC.again){ACC.again=false;accSync(true);}});return ACC.syncing;}
async function accSyncRun(silent){const c=ACC.cur;save();const d=localData();if(!d)return false;
  const r=await rpcx('tk_acc_save',{p_user:c.user,p_token:c.token,p_data:d,p_ts:d.ts||Date.now()});
  if(r.ok){accUpdate({syncedTs:d.ts});if(!silent)log('Đã lưu nhân vật lên máy chủ','#8fd8ff');return true;}
  if(r.msg==='session'){ACC.lost=true;removeEventListener('beforeunload',save);liveLeave();
    openDlg('Tài khoản đăng nhập ở nơi khác',`Tài khoản <b>${esc(c.user)}</b> vừa được đăng nhập ở một máy khác. Máy này dừng lại để hai nơi không ghi đè nhân vật của nhau.`,[{t:'Về màn hình đăng nhập',fn:()=>{sessionStorage.removeItem('tk_cur');location.reload();}}]);return false;}
  if(!silent)log('Chưa lưu lên máy chủ được (mất mạng?), sẽ thử lại sau','#ff9a8a');return false;}
setInterval(()=>{if(started&&ACC.cur&&ACC.cur.server)accSync(true);},30000);
addEventListener('beforeunload',()=>{const c=ACC.cur;if(!c||!c.server||!c.token||ACC.lost||!netEnabled())return;try{save();const d=localData();if(!d)return;
  fetch(NET.cfg.url.replace(/\/$/,'')+'/rest/v1/rpc/tk_acc_save',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json',apikey:NET.cfg.key,Authorization:'Bearer '+NET.cfg.key},body:JSON.stringify({p_user:c.user,p_token:c.token,p_data:d,p_ts:d.ts||Date.now()})});}catch(e){}});
// nút Xếp hạng gọi cloudSave: tài khoản máy chủ lưu vào tk_accounts; GM lưu riêng (không lên bảng xếp hạng)
const _cloudSave0=cloudSave;
cloudSave=async function(silent){if(ACC.cur&&ACC.cur.server)return accSync(silent);if(!isGM())return _cloudSave0(silent);if(!netEnabled()||!player.sect)return false;save();
  try{await rpc('tk_save',{p_id:NET.id,p_secret:NET.secret,p_name:player.name,p_sect:'GM',p_lv:player.lv,p_exp:player.exp,p_data:JSON.parse(localStorage.getItem(SKEY))});if(!silent)log('Đã lưu nhân vật GM lên mạng (không hiện trên bảng xếp hạng)','#8fd8ff');return true;}
  catch(e){if(!silent)log('Chưa lưu lên mạng được (máy chủ chưa bật bảng lưu trữ)','#ff9a8a');return false;}};
// mã khôi phục: tải nhân vật trên mạng vào tài khoản đang đăng nhập
cloudLoad=async function(code){if(!netEnabled())throw new Error('off');const m=String(code).trim().toUpperCase().match(/^([A-Z0-9]{8})-([A-Z0-9]{12})$/);if(!m)throw new Error('ma');
  const data=await rpc('tk_load',{p_id:m[1],p_secret:m[2]});if(!data)throw new Error('khong');
  if(!(ACC.cur&&ACC.cur.server))accUpdate({netId:m[1],netSecret:m[2]});netIdent();localStorage.setItem(SKEY,JSON.stringify(data));return data;};

function accLogin(acc){ACC.cur=acc;ACC.lost=false;SKEY='tk_save_'+acc.user;sessionStorage.setItem('tk_cur',acc.user);netIdent();liveBeat();}
const userOk=u=>/^[a-z0-9_]{3,16}$/.test(u);
// nhận dữ liệu từ máy chủ: lấy bản mới hơn giữa máy chủ và bản sao trên máy
function mergeServerData(user,data,ts){const key='tk_save_'+user;let loc=null;try{loc=JSON.parse(localStorage.getItem(key));}catch(e){}
  if(data&&(!loc||(ts||0)>=(loc.ts||0)))localStorage.setItem(key,JSON.stringify(data));}
async function accRegister(user,pw,pw2,_gm,useLegacy){
  user=String(user||'').trim().toLowerCase();
  if(!userOk(user))return'Tên đăng nhập 3–16 ký tự, chỉ gồm chữ không dấu, số, dấu _';
  if(String(pw).length<4)return'Mật khẩu cần ít nhất 4 ký tự';
  if(pw!==pw2)return'Hai lần nhập mật khẩu không khớp';
  if(user===GM_USER)return'Tên đăng nhập này đã có người dùng';
  const chk=playCheck(user);if(chk)return chk;
  const salt=rndStr(16),acc={user,salt,hash:await sha(salt+':'+pw),netId:await netIdFor(user),netSecret:rndStr(12),gm:false,created:Date.now(),name:'',lv:0,sect:''};
  const r=await rpcx('tk_acc_register',{p_user:user,p_pass:pw});
  if(r.ok){acc.server=true;const L=await rpcx('tk_acc_login',{p_user:user,p_pass:pw});if(L.ok)acc.token=L.data.token;}
  else if(r.msg==='taken')return'Tên đăng nhập này đã có người dùng';
  else if(!r.missing&&!r.off)return'Không kết nối được máy chủ. Tạo tài khoản cần có mạng.';
  else if(accFind(user))return'Tên đăng nhập này đã có trên máy';
  if(useLegacy){const old=localStorage.getItem(LEGACY_SKEY);if(old){localStorage.setItem('tk_save_'+user,old);localStorage.removeItem(LEGACY_SKEY);
    try{const s=JSON.parse(old);acc.name=s.name;acc.lv=s.lv;acc.sect=s.sect;}catch(e){}}}
  return accPut(acc);}
async function accCheck(user,pw){user=String(user||'').trim().toLowerCase();pw=String(pw);
  if(user===GM_USER){const d=await gmDerive(pw);if(d.check!==GM_CHECK)return'Sai mật khẩu';const chk=playCheck(GM_USER);if(chk)return chk;
    let acc=accFind(GM_USER);
    if(!acc){const salt=rndStr(16);acc=accPut({user:GM_USER,salt,hash:await sha(salt+':'+pw),netId:d.id,netSecret:d.sec,gm:true,created:Date.now(),name:'',lv:0,sect:''});}
    else if(acc.netId!==d.id||!acc.gm)acc=accPut({user:GM_USER,netId:d.id,netSecret:d.sec,gm:true});
    if(netEnabled()){try{const data=await rpc('tk_load',{p_id:d.id,p_secret:d.sec});if(data)mergeServerData(GM_USER,data,data.ts||0);}catch(e){}}
    return acc;}
  if(!userOk(user))return'Tên đăng nhập không đúng';
  const chk=playCheck(user);if(chk)return chk;
  const loc=accFind(user),locOk=loc&&(await sha(loc.salt+':'+pw))===loc.hash;
  const L=await rpcx('tk_acc_login',{p_user:user,p_pass:pw});
  if(L.ok){const salt=rndStr(16);mergeServerData(user,L.data.data,L.data.ts);
    return accPut({user,salt,hash:await sha(salt+':'+pw),netId:await netIdFor(user),netSecret:loc&&loc.netSecret||rndStr(12),gm:false,server:true,token:L.data.token,created:loc&&loc.created||Date.now(),name:loc&&loc.name||'',lv:loc&&loc.lv||0,sect:loc&&loc.sect||''});}
  if(L.msg==='bad_pass')return'Sai mật khẩu';
  if(L.msg==='no_user'){// tài khoản cũ chỉ có trên máy: đưa lên máy chủ
    if(!loc)return'Tài khoản không tồn tại';if(!locOk)return'Sai mật khẩu';
    const R=await rpcx('tk_acc_register',{p_user:user,p_pass:pw});if(R.msg==='taken')return'Tên này đã có người khác dùng trên máy chủ. Hãy tạo tài khoản mới với tên khác.';
    const L2=await rpcx('tk_acc_login',{p_user:user,p_pass:pw});if(L2.ok){const a=accPut({user,server:true,token:L2.data.token,netId:await netIdFor(user)});toast('Đã đưa tài khoản lên máy chủ','#8fd8ff');return a;}
    return loc;}
  // không có mạng hoặc máy chủ chưa bật bảng tài khoản: dùng bản sao trên máy
  if(!loc)return L.missing||L.off?'Không có tài khoản này trên máy':'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
  if(!locOk)return'Sai mật khẩu';
  if(loc.server)toast('Mất mạng: đang chơi bằng bản lưu trên máy','#ffb36b');
  return accPut({user,token:null});}
function accForget(user){accWrite(accList().filter(a=>a.user!==user));}

// ---------- màn hình đăng nhập ----------
function enterAfterLogin(acc){accLogin(acc);auInit();const s=loadSave();if(s){applySave(s);enterGame(false);setTimeout(()=>accSync(true),1500);}else{$('startMenu').hidden=true;$('create').hidden=false;}}
function accShowLogin(msg){const box=$('startMenu');const a=accList(),legacy=localStorage.getItem(LEGACY_SKEY);let ls=null;try{ls=legacy&&JSON.parse(legacy);}catch(e){}
  const n=liveOthers().length;
  box.innerHTML=`<div class="acch">Đăng nhập</div>
    <input id="lgUser" placeholder="Tên đăng nhập" maxlength="16" autocomplete="username" spellcheck="false">
    <input id="lgPass" type="password" placeholder="Mật khẩu" maxlength="72" autocomplete="current-password">
    <div id="lgMsg">${msg||''}</div>
    <button class="btn big" id="lgGo">Vào game</button>
    <button class="btn" id="lgNew">Tạo tài khoản mới</button>
    ${ls&&ls.name?`<button class="btn gray" id="lgLegacy">Tạo tài khoản cho nhân vật cũ: ${esc(ls.name)} · cấp ${ls.lv|0}</button>`:''}
    <div style="font-size:11.5px;color:#999;margin-top:6px">Đăng nhập được ở mọi máy. Mỗi máy chơi tối đa ${PLAY_MAX} nhân vật cùng lúc${n?` (đang mở ${n})`:''}.</div>
    ${a.length?`<div style="font-size:12px;color:#ccc;margin-top:8px">Tài khoản đã dùng trên máy này:</div><div class="accl">${a.map(x=>`<div class="accr" data-u="${x.user}"><b>${esc(x.user)}</b>${x.gm&&x.user===GM_USER?' <span class="gmtag">GM</span>':''} <span>${x.name?esc(x.name)+' · '+(SECTS[x.sect]?SECTS[x.sect].name:'')+' · cấp '+(x.lv|0):'chưa có nhân vật'}</span><button data-del="${x.user}" title="Xóa khỏi danh sách trên máy này">✕</button></div>`).join('')}</div>`:''}`;
  const go=async()=>{$('lgMsg').textContent='Đang kiểm tra...';$('lgGo').disabled=true;const r=await accCheck($('lgUser').value,$('lgPass').value);$('lgGo').disabled=false;
    if(typeof r==='string'){$('lgMsg').textContent=r;return;}enterAfterLogin(r);};
  $('lgGo').onclick=go;$('lgPass').onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')go();};$('lgUser').onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')$('lgPass').focus();};
  $('lgNew').onclick=()=>accShowRegister(false);if($('lgLegacy'))$('lgLegacy').onclick=()=>accShowRegister(true);
  box.querySelectorAll('.accr').forEach(r=>r.onclick=e=>{if(e.target.dataset.del)return;$('lgUser').value=r.dataset.u;$('lgPass').focus();});
  box.querySelectorAll('[data-del]').forEach(b=>b.onclick=e=>{e.stopPropagation();const u=b.dataset.del,x=accFind(u);
    if(x&&!x.server&&!confirm(`"${u}" chỉ lưu trên máy này (chưa có trên máy chủ). Xóa khỏi danh sách sẽ không đăng nhập lại được. Vẫn xóa?`))return;
    accForget(u);if(!(x&&x.server))localStorage.removeItem('tk_save_'+u);accShowLogin(x&&x.server?`Đã bỏ "${u}" khỏi máy này. Tài khoản vẫn còn trên máy chủ, đăng nhập lại lúc nào cũng được.`:`Đã xóa "${u}" khỏi máy này`);});
  const last=sessionStorage.getItem('tk_cur');if(last&&accFind(last)){$('lgUser').value=last;}}
function accShowRegister(legacy){const box=$('startMenu');
  box.innerHTML=`<div class="acch">${legacy?'Tạo tài khoản cho nhân vật cũ':'Tạo tài khoản'}</div>
    <input id="rgUser" placeholder="Tên đăng nhập (3–16 ký tự không dấu)" maxlength="16" autocomplete="username" spellcheck="false">
    <input id="rgPass" type="password" placeholder="Mật khẩu (ít nhất 4 ký tự)" maxlength="72" autocomplete="new-password">
    <input id="rgPass2" type="password" placeholder="Nhập lại mật khẩu" maxlength="72" autocomplete="new-password">
    <div id="lgMsg" style="color:#bbb">Tài khoản lưu trên máy chủ, đăng nhập được ở mọi máy. Hãy nhớ mật khẩu.</div>
    <button class="btn big" id="rgGo">${legacy?'Tạo tài khoản và chơi tiếp':'Tạo tài khoản và tạo nhân vật'}</button><button class="btn gray" id="rgBack">Quay lại</button>`;
  box.querySelectorAll('input').forEach(i=>i.onkeydown=e=>e.stopPropagation());
  $('rgBack').onclick=()=>accShowLogin();
  $('rgGo').onclick=async()=>{$('lgMsg').textContent='Đang tạo...';$('rgGo').disabled=true;const r=await accRegister($('rgUser').value,$('rgPass').value,$('rgPass2').value,'',legacy);$('rgGo').disabled=false;
    if(typeof r==='string'){$('lgMsg').style.color='#ffb36b';$('lgMsg').textContent=r;return;}
    if(!r.server)toast('Máy chủ chưa bật tài khoản: tạm lưu trên máy này','#ffb36b');enterAfterLogin(r);};}
// tạo nhân vật xong thì đẩy lên máy chủ ngay
const _enterGame0=enterGame;
enterGame=function(isNew){_enterGame0(isNew);if(isNew)setTimeout(()=>accSync(true),1000);};
// nút Quay lại ở bước tạo nhân vật: về màn hình đăng nhập
$('backBtn').onclick=()=>{$('create').hidden=true;$('startMenu').hidden=false;ACC.cur=null;liveLeave();accShowLogin();};
// mã khôi phục ở bước tạo nhân vật
(()=>{const c=$('create');const d=document.createElement('div');d.id='crRestore';d.innerHTML=`<a href="#" id="crRestoreLink">Có mã khôi phục từ bản cũ? Tải nhân vật bằng mã</a>
  <div id="crRestoreBox" hidden><input id="crCode" placeholder="VÍ DỤ: ABCD2345-ABCDEFGH2345" spellcheck="false"><button class="btn" id="crCodeGo" style="width:auto;display:inline-block;margin:0 0 0 6px">Tải</button><span id="crCodeMsg"></span></div>`;c.appendChild(d);
  $('crRestoreLink').onclick=e=>{e.preventDefault();$('crRestoreBox').hidden=!$('crRestoreBox').hidden;};$('crCode').onkeydown=e=>e.stopPropagation();
  $('crCodeGo').onclick=async()=>{$('crCodeMsg').textContent=' Đang tải...';try{await cloudLoad($('crCode').value);$('crCodeMsg').textContent='';$('create').hidden=true;applySave(loadSave());enterGame(false);setTimeout(()=>accSync(true),1500);}
    catch(e){$('crCodeMsg').textContent=e.message==='ma'?' Mã không đúng định dạng':' Không tìm thấy nhân vật, hoặc chưa kết nối mạng';}};})();
// cài đặt: đăng xuất, đổi mật khẩu
(()=>{const r=$('resetBtn');
  const b=document.createElement('button');b.className='btn';b.id='logoutBtn';b.textContent='Đăng xuất (đổi tài khoản)';r.parentNode.insertBefore(b,r);
  b.onclick=async()=>{b.disabled=true;await accSync(true);save();removeEventListener('beforeunload',save);liveLeave();sessionStorage.removeItem('tk_cur');location.reload();};
  const p=document.createElement('button');p.className='btn gray';p.id='passBtn';p.textContent='Đổi mật khẩu';r.parentNode.insertBefore(p,r);
  p.onclick=async()=>{const c=ACC.cur;if(!c||!c.server||isGM())return log(isGM()?'Tài khoản GM đổi mật khẩu theo cách riêng (nhờ người làm game)':'Tài khoản này chưa có trên máy chủ, chưa đổi được mật khẩu','#ffb36b');
    const o=prompt('Mật khẩu hiện tại:');if(o==null)return;const n1=prompt('Mật khẩu mới (ít nhất 4 ký tự):');if(n1==null)return;const n2=prompt('Nhập lại mật khẩu mới:');if(n2==null)return;
    if(n1!==n2)return log('Hai lần nhập mật khẩu mới không khớp','#ff9a8a');
    const R=await rpcx('tk_acc_passwd',{p_user:c.user,p_old:o,p_new:n1});
    if(!R.ok)return log(R.msg==='bad_pass'?'Mật khẩu hiện tại không đúng':R.msg==='bad_new'?'Mật khẩu mới cần 4–72 ký tự':'Không kết nối được máy chủ','#ff9a8a');
    const salt=rndStr(16);const L=await rpcx('tk_acc_login',{p_user:c.user,p_pass:n1});accUpdate({salt,hash:await sha(salt+':'+n1),token:L.ok?L.data.token:c.token});toast('Đã đổi mật khẩu','#9fffb0');};
  r.onclick=async()=>{if(!resetArm){resetArm=true;r.textContent='Bấm lần nữa để XÓA nhân vật của tài khoản này';return;}removeEventListener('beforeunload',save);localStorage.removeItem(SKEY);
    const c=ACC.cur;if(c&&c.server&&c.token){const t=Date.now();await rpcx('tk_acc_save',{p_user:c.user,p_token:c.token,p_data:{reset:1,ts:t},p_ts:t});}if(ACC.cur)accUpdate({name:'',lv:0,sect:''});location.reload();};})();
$('startMenu').hidden=false;accShowLogin();
