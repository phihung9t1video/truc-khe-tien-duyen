'use strict';
// ===================== TƯƠNG TÁC NGƯỜI CHƠI =====================
// Nhấp trái vào người chơi khác: chọn, hiện ở khung trên cùng (như chọn quái).
// Nhấp phải (hoặc chạm) vào khung đó / vào nhân vật: bảng thao tác gồm mời tổ đội, kết bạn, giao dịch, tuyên chiến, nhắn riêng.
let selOther=null,selPortT=0;
const IS_TOUCH2='ontouchstart' in window||navigator.maxTouchPoints>0;
function selectOther(o){selOther=o.id;player.target=null;player.pend=null;sfx('click');selPortT=0;}
function selObj(){if(!selOther)return null;const o=NET.others.get(selOther);if(!o){selOther=null;return null;}return o;}
// gọi từ updateUI khi không có quái được chọn
function renderSelOther(){const o=selObj(),tf=$('tframe');if(!o){tf.dataset.other='';$('tport').hidden=true;return false;}
  tf.hidden=false;tf.dataset.other=o.id;const S=SECTS[o.sect],E=S&&EL[S.el],mate=isMate(o.id),foe=DUEL.state==='on'&&DUEL.id===o.id;
  $('tname').textContent=`${o.name} · Cấp ${o.lv|0}`;$('tname').style.color=foe?'#ff8a7a':mate?'#9fffb0':'#8fd8ff';
  const hf=o.hf==null?1:o.hf;$('thpb').style.width=Math.max(0,Math.min(1,hf))*100+'%';$('thpt').textContent=o.mh?`${Math.round(hf*o.mh).toLocaleString('vi-VN')} / ${o.mh.toLocaleString('vi-VN')}`:'';
  const me=SECTS[player.sect].el;
  $('tstatus').innerHTML=S?`<span style="color:${S.color}">${S.name}</span> · <span style="color:${E.c}">Hệ ${E.n}</span>${elMul(me,S.el)>1?' <span style="color:#9fffb0">(bạn khắc)</span>':elMul(S.el,me)>1?' <span style="color:#ff9a8a">(khắc bạn)</span>':''}${mate?' · Đồng đội':''}${isFriend(o.id)?' · Bạn bè':''}<br><span style="color:#999">${IS_TOUCH2?'Chạm vào khung này':'Nhấp chuột phải vào khung này'} để mở thao tác</span>`:'';
  $('tport').hidden=false;selPortT-=0.1;if(selPortT<=0&&o.look){selPortT=1;drawPortrait($('tport'),o.look,o.wv);}
  return true;}
// ---------- bảng thao tác ----------
function openPMenu(x,y){const o=selObj();if(!o)return;const m=$('pmenu');
  const items=[];
  if(!isMate(o.id))items.push(['👥 Mời tổ đội',()=>netInvite(o)]);
  if(!inParty())items.push(['🙋 Xin vào đội',()=>netAskJoin(o)]);
  items.push(isFriend(o.id)?['💔 Xóa bạn bè',()=>friendRemove(o.id)]:['🤝 Kết bạn',()=>friendReq(o)]);
  items.push(['⇄ Giao dịch',()=>tradeReq(o)]);
  items.push(['⚔ Tuyên chiến (tỷ thí)',()=>duelInvite(o)]);
  items.push(['✉ Nhắn riêng',()=>whisperTo(o.id,o.name)]);
  items.push(['ⓘ Xem thông tin',()=>openPlayerDlg(o)]);
  items.push(['✕ Bỏ chọn',()=>{selOther=null;}]);
  m.innerHTML=`<div class="pmh">${esc(o.name)} · ${o.lv|0}</div>`+items.map((it,k)=>`<button data-k="${k}">${it[0]}</button>`).join('');
  m.hidden=false;const w=m.offsetWidth,h=m.offsetHeight;m.style.left=Math.max(4,Math.min(innerWidth-w-4,x))+'px';m.style.top=Math.max(4,Math.min(innerHeight-h-4,y))+'px';
  m.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();m.hidden=true;sfx('click');items[+b.dataset.k][1]();});sfx('click');}
document.addEventListener('mousedown',e=>{const m=$('pmenu');if(!m.hidden&&!m.contains(e.target))m.hidden=true;},true);
$('tframe').addEventListener('contextmenu',e=>{e.preventDefault();if($('tframe').dataset.other)openPMenu(e.clientX,e.clientY);});
$('tframe').addEventListener('click',e=>{if($('tframe').dataset.other&&(IS_TOUCH2||e.target.id==='tport'))openPMenu(e.clientX,e.clientY+10);});
// nhấp phải thẳng vào nhân vật người chơi khác trên bản đồ
cv.addEventListener('contextmenu',e=>{if(!started)return;const p=pickAt(toWorld(e.offsetX,e.offsetY));if(p&&p.other){selectOther(p.other);openPMenu(e.clientX,e.clientY);}});

// ---------- bạn bè ----------
const isFriend=id=>(player.friends||[]).some(f=>f.id===id);
function friendAdd(id,name){player.friends=player.friends||[];if(!isFriend(id))player.friends.push({id,name:String(name).slice(0,14)});save();if(!$('panelFriends').hidden)renderFriends();}
function friendRemove(id){player.friends=(player.friends||[]).filter(f=>f.id!==id);save();log('Đã xóa khỏi danh sách bạn bè','#ccc');if(!$('panelFriends').hidden)renderFriends();}
function friendReq(o){if(NET.status!=='on')return log('Chưa kết nối mạng','#ff9a8a');if(isFriend(o.id))return;
  netCast('tk_world','freq',{id:NET.id,name:player.name,lv:player.lv,to:o.id});log(`Đã gửi lời mời kết bạn tới ${o.name}`,'#9fd3ff');}
let friendTab='online';
function onlineRows(){const rows=[...NET.world.values()].filter(o=>o.id!==NET.id).sort((a,b)=>(b.map===curMapId)-(a.map===curMapId)||b.lv-a.lv);
  if(NET.status!=='on')return'<div style="color:#ff9a8a">Chưa kết nối mạng.</div>';
  if(!rows.length)return'<div style="color:#999">Chưa có ai khác đang online. Người chơi ở mọi máy (web, điện thoại) cùng hiện ở đây khi vào game.</div>';
  return rows.map(o=>{const S=SECTS[o.sect],same=o.map===curMapId,M=MAPS[o.map];
    return`<div class="frow"><span style="color:#7dff9a">●</span> <b style="color:${o.gm?'#ffd23f':S?S.color:'#fff'}">${o.gm?'[GM] ':''}${esc(o.name)}</b> <span style="color:#aaa">cấp ${o.lv} · ${S?S.name:''} · ${same?'<b style="color:#9fffb0">cùng vùng</b>':M?M.name:''}</span>${isFriend(o.id)?' <span style="color:#9fd3ff">(bạn bè)</span>':''}${isMate(o.id)?' <span style="color:#9fffb0">(đồng đội)</span>':o.pa?' <span style="color:#ffd977">(tự nhận vào đội)</span>':o.pt?' <span style="color:#aaa">(có đội)</span>':''}
      <div style="margin-top:3px"><button data-ow="${o.id}">Nhắn</button> ${isFriend(o.id)?'':`<button data-of="${o.id}">Kết bạn</button> `}${isMate(o.id)?'':`<button data-op="${o.id}">Mời tổ đội</button> `}${!inParty()&&!isMate(o.id)?`<button data-oj="${o.id}">Xin vào đội</button> `:''}<button data-ot="${o.id}">Giao dịch</button> ${same?`<button data-os="${o.id}">Chọn</button>`:M?`<button data-og="${o.id}">Đi tới</button>`:''}</div></div>`;}).join('');}
function renderFriends(){$('fTabOnline').classList.toggle('sel',friendTab==='online');$('fTabFriends').classList.toggle('sel',friendTab==='friends');
  const autoBar=`<div class="frow" style="background:#2a2232">Tự nhận người xin vào đội: <button id="fPAuto">${partyAutoOn()?'BẬT':'TẮT'}</button> <span style="color:#999;font-size:12px">(bật thì ai bấm "Xin vào đội" sẽ vào ngay, không cần đồng ý)</span></div>`;
  const bindAuto=()=>{if($('fPAuto'))$('fPAuto').onclick=()=>{sfx('click');partyAutoSet(!partyAutoOn());};};
  if(friendTab==='online'){const b=$('friendList');b.innerHTML=autoBar+onlineRows();bindAuto();const get=id=>NET.world.get(id);
    b.querySelectorAll('[data-oj]').forEach(e=>e.onclick=()=>{const o=get(e.dataset.oj);if(o)netAskJoin(o);});
    b.querySelectorAll('[data-ow]').forEach(e=>e.onclick=()=>{const o=get(e.dataset.ow);if(o){whisperTo(o.id,o.name);$('panelFriends').hidden=true;}});
    b.querySelectorAll('[data-of]').forEach(e=>e.onclick=()=>{const o=get(e.dataset.of);if(o)friendReq(o);});
    b.querySelectorAll('[data-op]').forEach(e=>e.onclick=()=>{const o=get(e.dataset.op);if(o)netInvite(o);});
    b.querySelectorAll('[data-ot]').forEach(e=>e.onclick=()=>{const o=get(e.dataset.ot);if(o){$('panelFriends').hidden=true;tradeReq(o);}});
    b.querySelectorAll('[data-os]').forEach(e=>e.onclick=()=>{const o=NET.others.get(e.dataset.os);if(o){selectOther(o);$('panelFriends').hidden=true;}else log('Người này đang ở xa, hãy lại gần','#ffb36b');});
    b.querySelectorAll('[data-og]').forEach(e=>e.onclick=()=>{const o=get(e.dataset.og);if(!o||!MAPS[o.map])return;if(auto){auto=false;}player.target=null;player.npc=null;player.gather=null;
      if(navTo(o.map,null,null)){log(`Đang tìm đường tới ${MAPS[o.map].name} gặp ${o.name}...`,'#8fd8ff');$('panelFriends').hidden=true;}});
    return;}
  const L=player.friends||[];const b=$('friendList');
  if(!L.length){b.innerHTML='<div style="color:#999">Chưa có bạn bè. Nhấp vào người chơi khác, nhấp chuột phải vào khung tên trên cùng rồi chọn Kết bạn.</div>';return;}
  b.innerHTML=L.map(f=>{const w=NET.world.get(f.id),near=NET.others.get(f.id),on=!!(w||near),map=w&&MAPS[w.map]?MAPS[w.map].name:near?CM.name:'';
    return`<div class="frow"><span style="color:${on?'#7dff9a':'#777'}">●</span> <b>${esc(f.name)}</b> <span style="color:#aaa">${on?`cấp ${(w||near).lv|0} · ${map}`:'không online'}</span>
      <span style="float:right">${on&&!inParty()&&!isMate(f.id)?`<button data-j="${f.id}">Xin vào đội</button> `:''}<button data-w="${f.id}">Nhắn</button> <button data-x="${f.id}">Xóa</button></span></div>`;}).join('');
  b.innerHTML=autoBar+b.innerHTML;bindAuto();
  b.querySelectorAll('[data-j]').forEach(e=>e.onclick=()=>{const f=L.find(x=>x.id===e.dataset.j);if(f)netAskJoin(f);});
  b.querySelectorAll('[data-w]').forEach(e=>e.onclick=()=>{const f=L.find(x=>x.id===e.dataset.w);whisperTo(f.id,f.name);$('panelFriends').hidden=true;});
  b.querySelectorAll('[data-x]').forEach(e=>e.onclick=()=>friendRemove(e.dataset.x));}

// ---------- nhắn riêng ----------
NET.wsp=null;
function whisperTo(id,name){NET.wsp={id,name};const i=$('chatIn');i.placeholder=`Nhắn riêng cho ${name} (Esc để về chat thế giới)`;i.classList.add('wsp');i.focus();}
function whisperOff(){NET.wsp=null;const i=$('chatIn');i.placeholder='Chat thế giới...';i.classList.remove('wsp');}
$('chatIn').addEventListener('keydown',e=>{if(e.key==='Escape')whisperOff();});
const _worldChat=netSendChat;
netSendChat=function(text){if(!NET.wsp)return _worldChat(text);text=text.replace(/\s+/g,' ').trim().slice(0,120);if(!text)return;
  if(NET.status!=='on'){netAddChat('Hệ thống','Chưa kết nối mạng, không gửi được.',0);return;}
  netCast('tk_world','wsp',{id:NET.id,name:player.name,to:NET.wsp.id,text});NET.chat.push({name:player.name,text,lv:0,t:Date.now(),w:'out',to:NET.wsp.name});if(NET.chat.length>40)NET.chat.shift();renderChat();};
renderChat=function(){const b=$('chatLog');if(!b)return;b.innerHTML=NET.chat.slice(-8).map(c=>c.w==='out'?`<div style="color:#e0b0ff"><b>[Riêng] Bạn → ${esc(c.to)}:</b> ${esc(c.text)}</div>`:
  c.w==='in'?`<div style="color:#e0b0ff"><b>[Riêng] ${esc(c.name)} → bạn:</b> ${esc(c.text)}</div>`:
  `<div><b style="color:${c.name==='Hệ thống'?'#ffb36b':c.name===player.name?'#9fffb0':'#8fd8ff'}">${esc(c.name)}${c.lv?' ['+c.lv+']':''}:</b> ${esc(c.text)}</div>`).join('');b.scrollTop=b.scrollHeight;};

// ---------- giao dịch ----------
const TRADE_MAX=12;
const TRD={id:null,name:'',state:null,my:[],myGold:0,their:[],theirGold:0,myLock:false,theirLock:false,myOk:false,theirOk:false,lost:0,t:0};
function tradeRoom(){return 'tk_world';}
function tradeReset(){Object.assign(TRD,{id:null,name:'',state:null,my:[],myGold:0,their:[],theirGold:0,myLock:false,theirLock:false,myOk:false,theirOk:false,lost:0,t:0});$('panelTrade').hidden=true;}
function tradeReq(o){if(NET.status!=='on')return log('Chưa kết nối mạng','#ff9a8a');if(TRD.state)return log('Bạn đang giao dịch với người khác','#ffb36b');
  netCast(tradeRoom(),'treq',{id:NET.id,name:player.name,to:o.id});Object.assign(TRD,{id:o.id,name:o.name,state:'ask',t:20});log(`Đã gửi lời mời giao dịch tới ${o.name}`,'#9fd3ff');}
function tradeOpen(){TRD.state='open';PANELS.forEach(p=>$(p).hidden=true);$('panelTrade').hidden=false;renderTrade();sfx('click');}
function tradeSendOffer(){TRD.myLock=false;TRD.theirLock=false;TRD.myOk=false;TRD.theirOk=false;
  const items=TRD.my.map(uid=>player.inv.find(x=>x.uid===uid)).filter(Boolean);
  netCast(tradeRoom(),'toff',{id:NET.id,to:TRD.id,items,gold:TRD.myGold});renderTrade();}
function tradeCancel(silent){if(TRD.state&&TRD.id)netCast(tradeRoom(),'tcan',{id:NET.id,to:TRD.id});if(!silent)log('Đã hủy giao dịch','#ccc');tradeReset();}
// món nhận được: dựng lại từ dữ liệu, giới hạn chỉ số trong mức tối đa có thể có của bậc/độ hiếm đó
function cleanItem(x){if(!x||typeof x!=='object'||!SLOT_STATS[x.slot])return null;const tier=clamp(x.tier|0,0,MAXTIER),rar=clamp(x.rar|0,0,RARITY.length-1);
  const wt=x.slot==='weapon'?(WICON[x.wtype]?x.wtype:'sword'):null,it=makeItem(x.slot,tier,rar,wt);
  const base=SLOT_STATS[x.slot](tier),m=RARITY[rar].m,b=RARITY[rar].b,maxAdd={crit:2+Math.ceil(tier/3),atk:Math.ceil((tier+1)*3*0.8),hp:(tier+1)*20,mp:(tier+1)*15,def:Math.ceil((tier+1)*2*0.8)};
  const st={};for(const k in (x.st||{})){if(!(k in maxAdd)&&!(k in base))continue;const cap=Math.max(1,Math.round((base[k]||0)*m))+b*(maxAdd[k]||0);const v=clamp(Math.round(+x.st[k]||0),0,cap);if(v)st[k]=v;}
  if(Object.keys(st).length)it.st=st;it.ref=clamp(x.ref|0,0,REF_MAX);
  if(x.god&&x.slot==='weapon'){const s=makeGodWeapon(wt);s.ref=it.ref;return s;}
  if(x.set&&SETS[x.set]&&SETS[x.set].pieces.includes(x.slot)){const s=makeSetItem(x.slot,x.set);s.ref=it.ref;return s;}return it;}
function tradeCommit(){const give=TRD.my.map(uid=>player.inv.find(x=>x.uid===uid));
  if(give.some(x=>!x)||player.gold<TRD.myGold){log('Giao dịch lỗi: đồ hoặc lượng đã thay đổi','#ff9a8a');tradeCancel(true);return;}
  player.inv=player.inv.filter(x=>!TRD.my.includes(x.uid));player.gold-=TRD.myGold;
  const got=TRD.their.map(cleanItem).filter(Boolean);for(const it of got)player.inv.push(it);player.gold+=TRD.theirGold;
  log(`Giao dịch với ${TRD.name} thành công: nhận ${got.length} món${TRD.theirGold?', '+TRD.theirGold.toLocaleString('vi-VN')+' lượng':''}`,'#ffd977');toast('Giao dịch thành công','#ffd977');sfx('coin');
  tradeReset();refreshPanels();save();}
function renderTrade(){if($('panelTrade').hidden)return;const ic=it=>it.slot==='weapon'?WICON[it.wtype]:SLOTICON[it.slot];
  const cell=(it,attr)=>it?`<div class="cell" ${attr} data-tip="tr:${it.uid}" style="border-color:${RARITY[it.rar].c}66"><div class="ic" style="color:${RARITY[it.rar].c}">${ic(it)}</div><span style="color:${RARITY[it.rar].c}">${esc(it.name)}${it.ref?' +'+it.ref:''}</span></div>`:'<div class="cell" style="cursor:default"></div>';
  const mine=TRD.my.map(uid=>player.inv.find(x=>x.uid===uid)).filter(Boolean);
  $('trTitle').textContent=`Giao dịch với ${TRD.name}`;
  $('trMine').innerHTML=Array.from({length:TRADE_MAX},(_,i)=>cell(mine[i],mine[i]?`data-rm="${mine[i].uid}"`:'')).join('');
  $('trTheirs').innerHTML=Array.from({length:TRADE_MAX},(_,i)=>cell(TRD.their[i]?Object.assign({},TRD.their[i],{uid:'t'+i}):null,'')).join('');
  $('trTheirGold').textContent=TRD.theirGold.toLocaleString('vi-VN')+' lượng';
  $('trMyGold').disabled=TRD.myLock;if(document.activeElement!==$('trMyGold'))$('trMyGold').value=TRD.myGold||'';
  const bag=player.inv.filter(x=>!TRD.my.includes(x.uid));
  $('trBag').innerHTML=bag.map(it=>cell(it,`data-add="${it.uid}"`)).join('')||'<div style="color:#999">Túi trống</div>';
  $('trState').innerHTML=`Bạn: <b>${TRD.myOk?'Đã đồng ý':TRD.myLock?'Đã khóa':'Đang chọn'}</b> · ${esc(TRD.name)}: <b>${TRD.theirOk?'Đã đồng ý':TRD.theirLock?'Đã khóa':'Đang chọn'}</b>`;
  $('trLock').textContent=TRD.myLock?'Đã khóa':'Khóa đồ';$('trLock').disabled=TRD.myLock;
  $('trOk').disabled=!(TRD.myLock&&TRD.theirLock)||TRD.myOk;
  $('panelTrade').querySelectorAll('[data-rm]').forEach(e=>e.onclick=()=>{if(TRD.myLock)return;TRD.my=TRD.my.filter(u=>u!==+e.dataset.rm);tradeSendOffer();});
  $('panelTrade').querySelectorAll('[data-add]').forEach(e=>e.onclick=()=>{if(TRD.myLock)return;if(TRD.my.length>=TRADE_MAX)return log(`Tối đa ${TRADE_MAX} món mỗi lần`,'#ffb36b');TRD.my.push(+e.dataset.add);tradeSendOffer();});}
$('trMyGold').addEventListener('change',e=>{if(TRD.myLock)return;TRD.myGold=clamp(Math.floor(+e.target.value||0),0,player.gold);tradeSendOffer();});
$('trMyGold').addEventListener('keydown',e=>e.stopPropagation());
$('trLock').onclick=()=>{if(!TRD.state)return;TRD.myLock=true;netCast(tradeRoom(),'tlock',{id:NET.id,to:TRD.id});renderTrade();};
$('trOk').onclick=()=>{if(!(TRD.myLock&&TRD.theirLock))return;
  if(player.inv.length-TRD.my.length+TRD.their.length>BAG_MAX)return log('Túi đồ không đủ chỗ','#ff9a8a');
  TRD.myOk=true;netCast(tradeRoom(),'tok',{id:NET.id,to:TRD.id});if(TRD.theirOk)tradeCommit();else renderTrade();};
$('trCancel').onclick=()=>tradeCancel();
$('panelTrade').querySelector('.close').onclick=()=>tradeCancel();

// ---------- tin nhắn mạng ----------
function socialOnMsg(ev,p){if(p.to!==NET.id)return;
  if(ev==='wsp'){NET.chat.push({name:String(p.name).slice(0,14),text:String(p.text||'').slice(0,120),lv:0,t:Date.now(),w:'in'});if(NET.chat.length>40)NET.chat.shift();renderChat();sfx('pick');return;}
  if(ev==='freq'){if(isFriend(p.id)){netCast('tk_world','facc',{id:NET.id,name:player.name,to:p.id});return;}
    openDlg('Lời mời kết bạn',`<b style="color:#9fd3ff">${esc(p.name)}</b> (cấp ${p.lv|0}) muốn kết bạn với bạn.`,
      [{t:'Đồng ý',fn:()=>{friendAdd(p.id,p.name);netCast('tk_world','facc',{id:NET.id,name:player.name,to:p.id});closeDlg();log(`Đã kết bạn với ${p.name}`,'#9fd3ff');}},
       {t:'Từ chối',gray:true,fn:()=>{netCast('tk_world','fno',{id:NET.id,name:player.name,to:p.id});closeDlg();}}]);return;}
  if(ev==='facc'){if(!isFriend(p.id)){friendAdd(p.id,p.name);log(`${p.name} đã đồng ý kết bạn`,'#9fd3ff');}return;}
  if(ev==='fno'){log(`${p.name} đã từ chối kết bạn`,'#ccc');return;}
  if(ev==='treq'){if(TRD.state){netCast(tradeRoom(),'tno',{id:NET.id,name:player.name,to:p.id,busy:1});return;}
    openDlg('Lời mời giao dịch',`<b style="color:#ffd977">${esc(p.name)}</b> muốn giao dịch với bạn.`,
      [{t:'Đồng ý',fn:()=>{closeDlg();Object.assign(TRD,{id:p.id,name:p.name});netCast(tradeRoom(),'tacc',{id:NET.id,name:player.name,to:p.id});tradeOpen();}},
       {t:'Từ chối',gray:true,fn:()=>{netCast(tradeRoom(),'tno',{id:NET.id,name:player.name,to:p.id});closeDlg();}}]);return;}
  if(p.id!==TRD.id)return;
  if(ev==='tno'&&TRD.state==='ask'){log(`${p.name} ${p.busy?'đang bận':'đã từ chối giao dịch'}`,'#ccc');tradeReset();}
  else if(ev==='tacc'&&TRD.state==='ask')tradeOpen();
  else if(TRD.state!=='open')return;
  else if(ev==='toff'){TRD.their=(Array.isArray(p.items)?p.items:[]).slice(0,TRADE_MAX);TRD.theirGold=clamp(Math.floor(+p.gold||0),0,1e8);TRD.myLock=TRD.theirLock=TRD.myOk=TRD.theirOk=false;renderTrade();}
  else if(ev==='tlock'){TRD.theirLock=true;renderTrade();}
  else if(ev==='tok'){TRD.theirOk=true;if(TRD.myOk)tradeCommit();else renderTrade();}
  else if(ev==='tcan'){log(`${TRD.name} đã hủy giao dịch`,'#ccc');tradeReset();}}
function socialTick(dt){
  if(TRD.state==='ask'){TRD.t-=dt;if(TRD.t<=0){log(`${TRD.name} không trả lời lời mời giao dịch`,'#ccc');tradeReset();}}
  else if(TRD.state==='open'){if(NET.others.has(TRD.id)||NET.world.has(TRD.id))TRD.lost=0;else{TRD.lost+=dt;if(TRD.lost>8){log(`${TRD.name} đã rời đi, giao dịch bị hủy`,'#ccc');tradeReset();}}}}
setInterval(()=>socialTick(0.5),500);
// chú giải cho món trong khung giao dịch
const _tip=tipContent;
tipContent=function(key){const [k,v]=key.split(':');if(k!=='tr')return _tip(key);
  if(String(v)[0]==='t'){const x=TRD.their[+String(v).slice(1)];const it=cleanItem(x);return it?itemHTML(it,null):'';}
  const it=player.inv.find(x=>x.uid===+v);return it?itemHTML(it):'';};
$('btnFriends').onclick=()=>{openPanel('panelFriends');renderFriends();};
(()=>{const t=document.createElement('div');t.className='tabs';t.innerHTML='<button id="fTabOnline" class="sel">Đang online</button><button id="fTabFriends">Bạn bè</button>';$('friendList').before(t);
  $('fTabOnline').onclick=()=>{friendTab='online';sfx('click');renderFriends();};$('fTabFriends').onclick=()=>{friendTab='friends';sfx('click');renderFriends();};
  $('netStat').style.cursor='pointer';$('netStat').title='Xem ai đang online';$('netStat').onclick=()=>{friendTab='online';openPanel('panelFriends');renderFriends();};
  setInterval(()=>{if(!$('panelFriends').hidden&&friendTab==='online')renderFriends();},3000);})();
PANELS.push('panelFriends');
