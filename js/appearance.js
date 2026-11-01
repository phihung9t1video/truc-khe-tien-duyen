'use strict';
// ===================== NGOẠI HÌNH NHÂN VẬT =====================
// Kiểu tóc, màu tóc, màu da, màu mắt, phụ kiện đầu, màu trang phục, râu. Lưu ở player.ap, gửi cho người chơi khác qua mạng.
const AP_HAIR=[
  {n:'Mặc định',set:null},
  {n:'Đuôi ngựa',set:{pony:true,longHair:false,sideBuns:false,messy:false}},
  {n:'Tóc dài xõa',set:{longHair:true,pony:false,sideBuns:false,messy:false}},
  {n:'Hai búi',set:{sideBuns:true,longHair:false,pony:false,messy:false}},
  {n:'Hai búi tóc dài',set:{sideBuns:true,longHair:true,pony:false,messy:false}},
  {n:'Búi cao gọn',set:{pony:false,longHair:false,sideBuns:false,messy:false}},
  {n:'Tóc rối',set:{messy:true,pony:true,longHair:false,sideBuns:false}},
  {n:'Dài và rối',set:{messy:true,longHair:true,pony:false,sideBuns:false}}];
const AP_HC=[null,'#17161f','#3a2418','#6a4028','#8a2a1a','#c8c8d0','#f4f4f8','#1a2a5a','#3a1a4a','#c89a3a','#2a5a3a'];
const AP_HC_N=['Mặc định','Đen tuyền','Nâu đen','Nâu hạt dẻ','Đỏ nâu','Bạc','Trắng tuyết','Lam đêm','Tím than','Vàng kim','Lục bích'];
const AP_SKIN=[null,'#fbe6d6','#f9dcc6','#ecc4a0','#d8a880','#b88060'];
const AP_SKIN_N=['Mặc định','Trắng sứ','Hồng nhạt','Bánh mật','Ngăm','Rám nắng'];
const AP_EYE=[null,'#2a2a3a','#6a3a1a','#2f62a8','#2a8a60','#a8321a','#7a4ad0','#c89a20'];
const AP_EYE_N=['Mặc định','Đen','Nâu','Lam','Lục','Hồng ngọc','Tím','Hổ phách'];
const AP_ACC=['Mặc định','Không đội','Tiểu kim quan','Băng đô','Hoa cài','Mạng che mặt','Nón lá','Khăn trùm'];
const AP_CLOTH=[
  {n:'Theo môn phái',set:null},
  {n:'Bạch y',set:{robe:'#fafbff',trim:'#9aa8c0',belt:'#6a7890',pants:'#eef0f6',inner:'#e8ecf6'}},
  {n:'Hắc y',set:{robe:'#2a2a34',trim:'#c9a227',belt:'#141418',pants:'#22222a',inner:'#3a3a48'}},
  {n:'Hồng y',set:{robe:'#fff0f4',trim:'#e0608a',belt:'#b03a62',pants:'#f8e0e8',inner:'#ffe0ea'}},
  {n:'Lam y',set:{robe:'#eaf4ff',trim:'#3a7ad8',belt:'#1a4a9a',pants:'#dce8f8',inner:'#d0e4ff'}},
  {n:'Lục y',set:{robe:'#effaea',trim:'#4aa84a',belt:'#2a6a2a',pants:'#dff0d8',inner:'#d8f4d0'}},
  {n:'Tử y',set:{robe:'#f4eeff',trim:'#8a5ad8',belt:'#5a3a9a',pants:'#e8e0f8',inner:'#e4d8ff'}},
  {n:'Hoàng y',set:{robe:'#fff8e4',trim:'#d8a020',belt:'#a07010',pants:'#f6ecd0',inner:'#fff0c8'}},
  {n:'Xích y',set:{robe:'#a82a2a',trim:'#ffd060',belt:'#5a1010',pants:'#8a2020',inner:'#c84040'}}];
const AP_BEARD=['Không','Râu ngắn','Râu dài'];
const _buildLook0=buildLook;
buildLook=function(sect,gender,eq,ap){const L=_buildLook0(sect,gender,eq);if(!ap)return L;
  const H=AP_HAIR[ap.h|0];if(H&&H.set)Object.assign(L,H.set);
  if(AP_HC[ap.hc|0])L.hair=AP_HC[ap.hc|0];if(AP_SKIN[ap.sk|0])L.skin=AP_SKIN[ap.sk|0];if(AP_EYE[ap.ey|0])L.iris=AP_EYE[ap.ey|0];
  const C=AP_CLOTH[ap.cl|0];if(C&&C.set){Object.assign(L,C.set);L.sash=shade(C.set.trim,0.35);const a=eq&&eq.armor;
    if(a&&a.rar>=4){L.trim='#ff5a8a';L.sash='#ffb0d0';L.sashGlow='#ff70a8';}else if(a&&a.rar>=3){L.trim='#e8b84a';L.sash='#ffe7a0';L.sashGlow='#ffd060';}else if(a&&a.rar>=2)L.sashGlow=L.sash;}
  switch(ap.acc|0){
    case 1:L.crown=null;L.flower=null;break;
    case 2:L.crown=SECTS[sect].look.crown||'#e6edf5';L.flower=null;break;
    case 3:L.crown=null;L.flower=null;L.headband=L.trim;break;
    case 4:L.crown=null;L.flower=L.sash||'#ff9ad8';break;
    case 5:L.mask=true;break;
    case 6:L.crown=null;L.flower=null;L.hat='straw';break;
    case 7:L.crown=null;L.flower=null;L.hood=shade(L.trim,-0.15);break;}
  if(ap.bd>0){L.beard=L.hair;L.beardLen=ap.bd===2?8:3;}
  return L;};
// ---------- bảng chọn (dùng cho tạo nhân vật và Dịch Dung Đan) ----------
let cAp={h:0,hc:0,sk:0,ey:0,acc:0,cl:0,bd:0};
function apRowsHTML(ap){const sw=(key,arr,names)=>arr.map((c,i)=>`<button class="apsw${(ap[key]|0)===i?' sel':''}" data-k="${key}" data-v="${i}" title="${names[i]}" style="${c?'background:'+c:''}">${c?'':'✕'}</button>`).join('');
  const tx=(key,names)=>`<select data-k="${key}">${names.map((n,i)=>`<option value="${i}"${(ap[key]|0)===i?' selected':''}>${n}</option>`).join('')}</select>`;
  return`<div class="aprow"><label>Kiểu tóc</label>${tx('h',AP_HAIR.map(x=>x.n))}<label>Phụ kiện</label>${tx('acc',AP_ACC)}</div>
    <div class="aprow"><label>Trang phục</label>${tx('cl',AP_CLOTH.map(x=>x.n))}<label>Râu</label>${tx('bd',AP_BEARD)}</div>
    <div class="aprow"><label>Màu tóc</label>${sw('hc',AP_HC,AP_HC_N)}</div>
    <div class="aprow"><label>Màu da</label>${sw('sk',AP_SKIN,AP_SKIN_N)}<label style="margin-left:10px">Màu mắt</label>${sw('ey',AP_EYE,AP_EYE_N)}</div>`;}
function apBind(box,ap,onChange){box.querySelectorAll('.apsw').forEach(b=>b.onclick=()=>{ap[b.dataset.k]=+b.dataset.v;sfx('click');box.querySelectorAll(`.apsw[data-k="${b.dataset.k}"]`).forEach(x=>x.classList.toggle('sel',x===b));onChange&&onChange();});
  box.querySelectorAll('select').forEach(s=>{s.onchange=()=>{ap[s.dataset.k]=+s.value;sfx('click');onChange&&onChange();};s.onkeydown=e=>e.stopPropagation();});}
function apRandom(ap){ap.h=rint(0,AP_HAIR.length-1);ap.hc=rint(0,AP_HC.length-1);ap.sk=rint(0,AP_SKIN.length-1);ap.ey=rint(0,AP_EYE.length-1);ap.acc=rint(0,AP_ACC.length-1);ap.cl=rint(0,AP_CLOTH.length-1);ap.bd=0;}
(()=>{const d=document.createElement('div');d.id='apBox';$('createBody').after(d);
  const render=()=>{d.innerHTML=`<div class="aph">Ngoại hình <button id="apRnd">Ngẫu nhiên</button><button id="apReset">Mặc định</button></div>`+apRowsHTML(cAp);apBind(d,cAp);
    $('apRnd').onclick=()=>{apRandom(cAp);render();};$('apReset').onclick=()=>{cAp={h:0,hc:0,sk:0,ey:0,acc:0,cl:0,bd:0};render();};};
  render();})();
// ---------- Dịch Dung Đan: đổi ngoại hình sau khi đã tạo nhân vật ----------
function openLookEditor(onDone){const ap=Object.assign({h:0,hc:0,sk:0,ey:0,acc:0,cl:0,bd:0},player.ap||{});
  openDlg('Dịch Dung Đan · Đổi ngoại hình',`<div style="display:flex;gap:10px;align-items:flex-start"><canvas id="leCv" width="240" height="280" data-w="120" style="width:120px;height:140px;border-radius:10px;background:radial-gradient(#3e5f80,#121a26);flex:none"></canvas><div id="leRows" style="flex:1"></div></div>`,
    [{t:'Áp dụng',fn:()=>{if(!(player.ddT>0)){closeDlg();return log('Cần có Dịch Dung Đan (mua ở Cửa hàng)','#ff9a8a');}player.ddT--;player.ap=ap;refreshLook();closeDlg();save();toast('Đã đổi ngoại hình','#ffd23f');onDone&&onDone();}},{t:'Ngẫu nhiên',gray:true,fn:()=>{apRandom(ap);rows();}}]);
  const draw=()=>{const c=$('leCv');if(!c||$('dlg').hidden)return;withCtx(c,()=>{ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(60,128,24,7,0,0,Math.PI*2);ctx.fill();
    const di=Math.floor(nowT/1.5)%4;drawChibi(buildLook(player.sect,player.gender,player.eq,ap),60,126,1.9,['down','side','up','side'][di],di===3?-1:1,false,0,false,playerW,0.3);});requestAnimationFrame(draw);};
  const rows=()=>{const b=$('leRows');b.innerHTML=apRowsHTML(ap);apBind(b,ap);};rows();draw();}
SHOP_ITEMS.push(
  {id:'exp3',name:'Tam Bội Kinh Nghiệm Đan',icon:'✸',col:'#ffb040',price:20000,desc:'Dùng ngay: thêm x2 kinh nghiệm trong 30 phút. Cộng dồn với Song bội và các viên khác (tối đa x10).',buy:()=>{addExpBuff(2,1800);}},
  {id:'luck',name:'May Mắn Phù',icon:'☘',col:'#9fffb0',price:1500,desc:'Lần cường hóa kế tiếp +20% tỉ lệ thành công. Tự dùng khi cường hóa.',buy:()=>{player.luck=(player.luck||0)+1;}},
  {id:'luck10',name:'10 May Mắn Phù',icon:'☘',col:'#9fffb0',price:13000,desc:'Gói 10 tấm.',buy:()=>{player.luck=(player.luck||0)+10;}},
  {id:'revive',name:'Cửu Chuyển Hoàn Hồn Đan',icon:'☯',col:'#ffe27a',price:6000,desc:'Khi bị hạ gục sẽ tự sống lại tại chỗ, đầy máu, không mất kinh nghiệm.',buy:()=>{player.reviveC=(player.reviveC||0)+1;}},
  {id:'petfood',name:'Linh Thú Đan',icon:'❂',col:'#c8f0a0',price:8000,desc:'Thú nuôi đang đi theo lên ngay 1 cấp (tối đa cấp 10).',buy:()=>{const k=player.pet;if(!k)return log('Chưa có thú nuôi đi theo','#ff9a8a');const pe=player.petExp=player.petExp||{},e=pe[k]=pe[k]||{lv:1,x:0};if(e.lv<PET_MAXLV){e.lv++;e.x=0;toast(`${PETS[k].name} lên cấp ${e.lv}`,'#9fffb0');}else log('Thú nuôi đã đạt cấp tối đa','#ccc');}},
  {id:'dichdung',name:'Dịch Dung Đan',icon:'☺',col:'#ffc8e8',price:3000,desc:'Đổi kiểu tóc, màu tóc, màu da, màu mắt, phụ kiện, trang phục.',buy:()=>{player.ddT=(player.ddT||0)+1;PANELS.forEach(p=>$(p).hidden=true);openLookEditor();}}
);
// túi đồ: hiện thêm số vật phẩm
const _rb2=renderBag;
renderBag=function(){_rb2();const r=$('bagUse');if(!r)return;r.insertAdjacentHTML('beforeend',`<div style="margin-top:4px;color:#ccc">☘ May Mắn Phù: <b>${player.luck||0}</b> · ☯ Hoàn Hồn Đan: <b>${player.reviveC||0}</b>${player.ddT>0?` · ☺ Dịch Dung Đan: <b>${player.ddT}</b> <button id="useDdBtn">Dùng</button>`:''}</div>`);if($('useDdBtn'))$('useDdBtn').onclick=()=>{PANELS.forEach(p=>$(p).hidden=true);openLookEditor();};};
