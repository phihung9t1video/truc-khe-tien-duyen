'use strict';
// ===================== CỬA HÀNG & THÚ CƯỠI =====================
const MOUNTS={
  ngua:{name:'Tuấn Mã',lv:10,spd:0.5,hp:0.05,def:0,price:3000,col:'#9a6a3a',mane:'#3a2414',kind:'horse',desc:'Ngựa nâu khỏe, tăng 50% tốc độ.'},
  loc:{name:'Bạch Lộc',lv:20,spd:0.75,hp:0.08,def:0.04,price:15000,col:'#f2ece0',mane:'#d8c8a8',kind:'deer',desc:'Hươu trắng tiên sơn, tăng 75% tốc độ.'},
  ho:{name:'Hắc Hổ',lv:30,spd:0.95,hp:0.1,def:0.07,price:45000,col:'#3a3640',mane:'#e8b040',kind:'tiger',desc:'Hổ đen vằn vàng, tăng 95% tốc độ.'},
  lan:{name:'Hỏa Kỳ Lân',lv:45,spd:1.15,hp:0.14,def:0.1,price:140000,col:'#d8502a',mane:'#ffd040',kind:'qilin',desc:'Thần thú lửa, tăng 115% tốc độ.'},
  hac:{name:'Tiên Hạc',lv:55,spd:1.35,hp:0.2,def:0.12,price:350000,col:'#ffffff',mane:'#202020',kind:'crane',desc:'Hạc tiên chở người bay lượn, tăng 135% tốc độ.'}
};
const SHOP_ITEMS=[
  {id:'hp5',name:'5 Kim Sang Dược',icon:'♥',col:'#ff6a5a',price:30,desc:'Hồi 40% sinh lực mỗi bình.',buy:()=>{player.hpPot+=5;}},
  {id:'hp50',name:'50 Kim Sang Dược',icon:'♥',col:'#ff6a5a',price:280,desc:'Gói lớn, rẻ hơn mua lẻ.',buy:()=>{player.hpPot+=50;}},
  {id:'mp5',name:'5 Ngưng Thần Đan',icon:'◆',col:'#5ab4ff',price:30,desc:'Hồi 50% nội lực mỗi viên.',buy:()=>{player.mpPot+=5;}},
  {id:'mp50',name:'50 Ngưng Thần Đan',icon:'◆',col:'#5ab4ff',price:280,desc:'Gói lớn, rẻ hơn mua lẻ.',buy:()=>{player.mpPot+=50;}},
  {id:'exp2',name:'Song Bội Kinh Nghiệm Đan',icon:'✦',col:'#ffe27a',price:6000,desc:'Dùng ngay: nhân đôi kinh nghiệm thêm 30 phút. Ăn nhiều viên thì cộng dồn thời gian.',buy:()=>{addExpBuff(1,1800);}},
  {id:'tp',name:'Hồi Thành Phù',icon:'⌂',col:'#9fd3ff',price:250,desc:'Về ngay thành an toàn của bản đồ đang đứng. Dùng trong Túi đồ.',buy:()=>{player.tp=(player.tp||0)+1;}},
  {id:'tp10',name:'10 Hồi Thành Phù',icon:'⌂',col:'#9fd3ff',price:2200,desc:'Gói 10 tấm.',buy:()=>{player.tp=(player.tp||0)+10;}}
];
const EQ_SHOP=['weapon','helmet','armor','vest','gloves','wrist','boots','amulet','necklace','ring'];
const shopTierFor=lv=>{let t=0;for(let i=0;i<TIER_LV.length;i++)if(TIER_LV[i]<=lv)t=i;return t;};
const eqPrice=(tier,rar)=>Math.round((8+tier*24)*(1+rar*0.9)*6);
let shopTab='item',gmTier=9,gmRar=3;
function shopPay(price){if(isGM())return true;if(player.gold<price){log('Không đủ lượng','#ff9a8a');sfx('hurt');return false;}player.gold-=price;return true;}
const priceTxt=p=>isGM()?'<span style="color:#ffd23f">Miễn phí (GM)</span>':`<b style="color:#ffd977">${p.toLocaleString('vi-VN')}</b> lượng`;
function renderShop(){if($('panelShop').hidden)return;const b=$('shopBody');
  ['item','eq','mount'].forEach(t=>$('shTab_'+t).classList.toggle('sel',shopTab===t));
  $('shopGold').innerHTML=isGM()?'<span class="gmtag">GM</span> Mua mọi thứ miễn phí, không giới hạn cấp':`Lượng: <b style="color:#ffd977">${player.gold.toLocaleString('vi-VN')}</b>`;
  let h='';
  if(shopTab==='item')h=SHOP_ITEMS.map(it=>`<div class="shr"><span class="shi" style="color:${it.col}">${it.icon}</span><div class="shd"><b>${it.name}</b><br><span>${it.desc}</span></div><div class="shp">${priceTxt(it.price)}<button data-buy="${it.id}">Mua</button></div></div>`).join('');
  else if(shopTab==='eq'){const gm=isGM(),tier=gm?gmTier:shopTierFor(player.lv),rar=gm?gmRar:1;
    if(gm)h+=`<div class="shr"><span class="shi" style="color:${SETS.trunglau.col}">✦</span><div class="shd"><b style="color:${SETS.trunglau.col}">Bộ ${SETS.trunglau.name}</b><br><span>5 món Thần thoại mạnh nhất, có điểm thưởng khi mặc đủ bộ</span></div><div class="shp">${priceTxt(0)}<button id="gmSetBtn">Nhận cả bộ</button></div></div>`;
    if(gm)h+=`<div class="shgm">Bậc <select id="gmTier">${TIER_PRE.map((n,i)=>`<option value="${i}"${i===gmTier?' selected':''}>${i+1} · ${n}</option>`).join('')}</select> Độ hiếm <select id="gmRar">${RARITY.map((r,i)=>`<option value="${i}"${i===gmRar?' selected':''}>${r.n}</option>`).join('')}</select></div>`;
    else h+=`<div class="shgm">Bán đồ <b style="color:${RARITY[1].c}">Tinh xảo</b> bậc ${tier+1} (${TIER_PRE[tier]}), hợp với cấp của bạn. Đồ Hiếm và Truyền thuyết phải đánh quái, đánh trùm mới có.</div>`;
    const rows=[];const mine=SECTS[player.sect].wtype;
    for(const S of [SECTS[player.sect],...Object.values(SECTS).filter(x=>x!==SECTS[player.sect])])rows.push(['weapon',S.wtype,S]);
    for(const sl of EQ_SHOP)if(sl!=='weapon')rows.push([sl,null,null]);
    h+=rows.map(([sl,wt,S])=>{const nm=TIER_PRE[tier]+' '+(wt?SLOT_SUF[wt]:SLOT_SUF[sl]),ic=wt?WICON[wt]:SLOTICON[sl];
      const who=wt?(wt===mine?' · <b style="color:#9fffb0">phái của bạn</b>':` · <span style="color:${S.color}">${S.name}</span> (bạn không dùng được, để giao dịch)`):'';
      return`<div class="shr"><span class="shi" style="color:${RARITY[rar].c}">${ic}</span><div class="shd"><b style="color:${RARITY[rar].c}">${nm}</b><br><span>${SLOTNAME[sl]} · yêu cầu cấp ${TIER_LV[tier]}${who}</span></div><div class="shp">${priceTxt(eqPrice(tier,rar))}<button data-eq="${sl}" data-wt="${wt||''}">Mua</button></div></div>`;}).join('');}
  else h=Object.entries(MOUNTS).map(([k,m])=>{const own=(player.mounts||[]).includes(k),cur=player.mount===k,lock=!isGM()&&player.lv<m.lv;
    return`<div class="shr"><canvas class="shm" width="120" height="84" data-mv="${k}"></canvas><div class="shd"><b>${m.name}</b> <span style="color:${lock?'#ff7a6a':'#9f9'}">cấp ${m.lv}</span><br><span>${m.desc} Sinh lực +${Math.round(m.hp*100)}%${m.def?', phòng thủ +'+Math.round(m.def*100)+'%':''}.</span></div>
      <div class="shp">${own?(cur?'<b style="color:#9fffb0">Đang dùng</b>':`<button data-use="${k}">Dùng</button>`):`${priceTxt(m.price)}<button data-mount="${k}" ${lock?'disabled':''}>Mua</button>`}</div></div>`;}).join('');
  b.innerHTML=h;
  b.querySelectorAll('[data-buy]').forEach(e=>e.onclick=()=>{const it=SHOP_ITEMS.find(x=>x.id===e.dataset.buy);if(!shopPay(it.price))return;it.buy();sfx('coin');log(`Đã mua ${it.name}`,'#ffd977');save();renderShop();});
  b.querySelectorAll('[data-eq]').forEach(e=>e.onclick=()=>{if(player.inv.length>=BAG_MAX)return log('Túi đồ đã đầy','#ff9a8a');const gm=isGM(),tier=gm?gmTier:shopTierFor(player.lv),rar=gm?gmRar:1;
    if(!shopPay(eqPrice(tier,rar)))return;const it=makeItem(e.dataset.eq,tier,rar,e.dataset.wt||SECTS[player.sect].wtype);if(gm)it.lvReq=1;addItem(it);save();renderShop();});
  b.querySelectorAll('[data-mount]').forEach(e=>e.onclick=()=>{const k=e.dataset.mount,m=MOUNTS[k];if(!isGM()&&player.lv<m.lv)return;if(!shopPay(m.price))return;
    player.mounts=player.mounts||[];player.mounts.push(k);setMount(k);toast(`Đã mua thú cưỡi ${m.name}`,'#ffd23f');sfx('level');save();renderShop();});
  b.querySelectorAll('[data-use]').forEach(e=>e.onclick=()=>{setMount(e.dataset.use);save();renderShop();});
  if($('gmSetBtn'))$('gmSetBtn').onclick=()=>{const S=SETS.trunglau;if(player.inv.length+S.pieces.length>BAG_MAX)return log('Túi đồ không đủ chỗ','#ff9a8a');for(const sl of S.pieces){const it=makeSetItem(sl,'trunglau');it.lvReq=1;player.inv.push(it);}refreshPanels();save();toast(`Đã nhận bộ ${S.name} vào túi`,S.col);renderShop();};
  if($('gmTier')){$('gmTier').onchange=e=>{gmTier=+e.target.value;renderShop();};$('gmRar').onchange=e=>{gmRar=+e.target.value;renderShop();};}
  b.querySelectorAll('canvas[data-mv]').forEach(c=>withCtx(c,()=>{ctx.scale(2,2);drawShadow(30,36,16,0.3);drawSteed(c.dataset.mv,30,36,1,false,0.5);}));}
// ---------- thú cưỡi ----------
function setMount(k){player.mount=k;player.mountOn=true;refreshPanels();if(typeof updateMountBtn==='function')updateMountBtn();log(`Đang dùng thú cưỡi ${MOUNTS[k].name}`,'#ffd23f');}
const mountObj=()=>player.mount&&MOUNTS[player.mount]&&player.mountOn?MOUNTS[player.mount]:null;
// có đang ngồi trên thú cưỡi không (tự xuống khi ra đòn, khi bay)
function updateRiding(){const M=mountObj();const tg=player.target&&!player.target.dead&&dist(player,player.target)<220;
  player.riding=!!(M&&!player.flying&&!player.dead&&player.atkAnim<=0&&!tg&&!player.gather&&player.channel<=0);}
function drawSteed(k,x,y,face,moving,sd){const M=MOUNTS[k];if(!M)return;const t=nowT+(sd||0),ph=moving?t*13:0;
  ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='rgba(30,20,20,.75)';ctx.lineWidth=1;
  if(M.kind==='crane'){const fl=Math.sin(t*(moving?9:3)),hov=-14-Math.sin(t*2)*2;ctx.translate(0,hov);
    ctx.fillStyle='#202020';ctx.beginPath();ctx.moveTo(-14,-20);ctx.lineTo(-30,-16);ctx.lineTo(-27,-22);ctx.closePath();ctx.fill();
    const wing=s=>{ctx.save();ctx.translate(-2,-24);ctx.rotate(s*(0.2+fl*0.5));ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-14,-22*s,-34,-14*s-fl*6*s);ctx.quadraticCurveTo(-20,-4*s,0,2);ctx.closePath();
      const g=ctx.createLinearGradient(0,0,-34,0);g.addColorStop(0,'#ffffff');g.addColorStop(0.7,'#eef2f6');g.addColorStop(1,'#303030');ctx.fillStyle=g;ctx.fill();ctx.stroke();ctx.restore();};
    wing(1);
    ctx.beginPath();ctx.ellipse(0,-22,17,8,0,0,Math.PI*2);ctx.fillStyle='#ffffff';ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(13,-25);ctx.bezierCurveTo(22,-30,16,-44,24,-48);ctx.lineWidth=3.2;ctx.strokeStyle='#ffffff';ctx.stroke();ctx.lineWidth=1;ctx.strokeStyle='rgba(30,20,20,.75)';
    ctx.beginPath();ctx.arc(25,-49,3.4,0,Math.PI*2);ctx.fillStyle='#ffffff';ctx.fill();ctx.stroke();ctx.fillStyle='#e02020';ctx.beginPath();ctx.arc(25,-52,1.6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e8c040';ctx.beginPath();ctx.moveTo(28,-49);ctx.lineTo(36,-47);ctx.lineTo(28,-47.5);ctx.closePath();ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(26,-49.5,0.7,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#d0a030';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-2,-15);ctx.lineTo(-8,-6);ctx.moveTo(2,-15);ctx.lineTo(-4,-6);ctx.stroke();
    wing(-0.6);ctx.restore();return;}
  const C=M.col,D=shade(C,-0.28),L2=shade(C,0.3);
  const leg=(lx,phase,near)=>{const a=moving?Math.sin(ph+phase)*0.55:0;ctx.save();ctx.translate(lx,-15);ctx.rotate(a);ctx.beginPath();ctx.roundRect(-2.3,0,4.6,15,2);ctx.fillStyle=near?C:D;ctx.fill();ctx.stroke();
    ctx.fillStyle=M.kind==='tiger'?shade(C,-0.4):'#2a2020';ctx.beginPath();ctx.roundRect(-2.6,12.5,5.2,3,1);ctx.fill();ctx.restore();
    if(M.kind==='qilin'&&moving&&Math.random()<0.15)fx.push({k:'p',x:x+lx*face,y:y-1,vx:rnd(-10,10),vy:-30,col:Math.random()<.5?'#ffd040':'#ff6a2a',t:0,life:0.5,sz:2});};
  leg(-13,Math.PI,false);leg(13,0,false);
  const bob=moving?-Math.abs(Math.sin(ph))*1.6:0;ctx.translate(0,bob);
  // đuôi
  ctx.save();const tw=Math.sin(t*4)*3;ctx.strokeStyle=M.kind==='tiger'?C:M.mane;ctx.lineWidth=M.kind==='horse'?4:M.kind==='deer'?3:3;ctx.beginPath();ctx.moveTo(-19,-25);
  if(M.kind==='tiger')ctx.quadraticCurveTo(-32,-30+tw,-30,-40+tw);else if(M.kind==='deer')ctx.quadraticCurveTo(-24,-28,-25,-24+tw*0.3);else ctx.quadraticCurveTo(-30,-22+tw,-28,-8+tw);ctx.stroke();ctx.restore();
  // thân
  const g=ctx.createLinearGradient(0,-32,0,-13);g.addColorStop(0,L2);g.addColorStop(1,D);ctx.beginPath();ctx.ellipse(0,-23,21,9.5,0,0,Math.PI*2);ctx.fillStyle=g;ctx.fill();ctx.stroke();
  if(M.kind==='tiger'){ctx.strokeStyle=M.mane;ctx.lineWidth=2;for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*7-2,-32);ctx.quadraticCurveTo(i*7+2,-25,i*7-1,-16);ctx.stroke();}ctx.lineWidth=1;ctx.strokeStyle='rgba(30,20,20,.75)';}
  if(M.kind==='qilin'){ctx.fillStyle='rgba(255,210,80,.55)';for(let i=-3;i<=3;i++)for(let j=0;j<2;j++){ctx.beginPath();ctx.arc(i*5,-27+j*5,2,0,Math.PI);ctx.fill();}}
  if(M.kind==='deer'){ctx.fillStyle='rgba(200,160,110,.5)';for(const [sx,sy] of [[-8,-27],[-2,-29],[5,-27],[-5,-23]]){ctx.beginPath();ctx.arc(sx,sy,1.4,0,Math.PI*2);ctx.fill();}}
  // yên
  ctx.fillStyle='#a0302a';ctx.beginPath();ctx.ellipse(-1,-31,9,3.6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e0b040';ctx.fillRect(-2,-31,2,9);
  // cổ + đầu
  const hd=M.kind==='tiger'?{nx:16,ny:-32,hx:24,hy:-31}:{nx:18,ny:-38,hx:26,hy:-40};
  ctx.beginPath();ctx.moveTo(11,-29);ctx.quadraticCurveTo(hd.nx,hd.ny-2,hd.hx-3,hd.hy-3);ctx.lineTo(hd.hx+2,hd.hy+3);ctx.quadraticCurveTo(hd.nx+2,hd.ny+8,17,-17);ctx.closePath();ctx.fillStyle=C;ctx.fill();ctx.stroke();
  ctx.beginPath();if(M.kind==='tiger')ctx.ellipse(hd.hx+2,hd.hy,8,6.5,0,0,Math.PI*2);else ctx.ellipse(hd.hx+2,hd.hy+1,8,4.6,0.45,0,Math.PI*2);ctx.fillStyle=C;ctx.fill();ctx.stroke();
  ctx.fillStyle='#111';ctx.beginPath();ctx.arc(hd.hx+3,hd.hy-1.5,1.1,0,Math.PI*2);ctx.fill();
  if(M.kind==='qilin'){ctx.fillStyle='#ffe08a';ctx.beginPath();ctx.ellipse(hd.hx+3,hd.hy-2,1.2,1.2,0,0,Math.PI*2);ctx.fill();}
  // tai
  ctx.fillStyle=D;ctx.beginPath();ctx.moveTo(hd.hx-2,hd.hy-4);ctx.lineTo(hd.hx-4,hd.hy-10);ctx.lineTo(hd.hx+1,hd.hy-5);ctx.closePath();ctx.fill();ctx.stroke();
  // bờm, sừng, gạc
  if(M.kind==='horse'||M.kind==='qilin'){ctx.strokeStyle=M.mane;ctx.lineWidth=2.4;for(let i=0;i<5;i++){const q=i/5,mx=11+(hd.hx-14)*q,my=-30+(hd.hy+1)*q*0.3-q*8;ctx.beginPath();ctx.moveTo(mx,my);ctx.quadraticCurveTo(mx-4,my+2+Math.sin(t*5+i),mx-6,my+6);ctx.stroke();}ctx.lineWidth=1;}
  if(M.kind==='qilin'){ctx.fillStyle='#ffe080';ctx.beginPath();ctx.moveTo(hd.hx+1,hd.hy-5);ctx.lineTo(hd.hx+5,hd.hy-15);ctx.lineTo(hd.hx+4,hd.hy-4);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.save();ctx.shadowColor='#ff8a20';ctx.shadowBlur=12;ctx.strokeStyle='rgba(255,160,40,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-23,23,11,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  if(M.kind==='deer'){ctx.strokeStyle='#c8a070';ctx.lineWidth=1.6;const ax=hd.hx-1,ay=hd.hy-5;ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax-3,ay-12);ctx.moveTo(ax-2,ay-7);ctx.lineTo(ax-7,ay-10);ctx.moveTo(ax-3,ay-12);ctx.lineTo(ax-6,ay-16);ctx.moveTo(ax-3,ay-12);ctx.lineTo(ax+1,ay-16);
    ctx.moveTo(ax+3,ay);ctx.lineTo(ax+5,ay-11);ctx.moveTo(ax+5,ay-11);ctx.lineTo(ax+9,ay-14);ctx.stroke();ctx.lineWidth=1;}
  if(M.kind==='tiger'){ctx.fillStyle='#f0e8d8';ctx.beginPath();ctx.ellipse(hd.hx+6,hd.hy+2,3.5,2.6,0,0,Math.PI*2);ctx.fill();}
  ctx.translate(0,-bob);leg(-9,0,true);leg(16,Math.PI,true);
  ctx.restore();}
// ---------- dùng vật phẩm ----------
function useTP(){if(!(player.tp>0))return log('Không có Hồi Thành Phù','#ff9a8a');if(player.dead)return;if(typeof inDuel==='function'&&inDuel())return log('Đang tỷ thí, không dùng được','#ffb36b');
  player.tp--;const r=revivePos();player.x=r.x;player.y=r.y;player.path=[];player.target=null;navGoal=null;fadeT=0.7;sfx('fly');addRing(player.x,player.y-10,60,'#9fd3ff',0.8);log(`Đã về ${CM.safeName}`,'#9fd3ff');save();refreshPanels();}
// tự động mua thú cưỡi tốt hơn khi dư dả
function autoMount(){if(isGM())return;let best=null;for(const [k,m] of Object.entries(MOUNTS))if(player.lv>=m.lv&&player.gold>=m.price*2&&(!player.mount||m.spd>MOUNTS[player.mount].spd)&&!(player.mounts||[]).includes(k))best=k;
  if(best){player.gold-=MOUNTS[best].price;player.mounts=(player.mounts||[]).concat(best);setMount(best);log(`Tự mua thú cưỡi ${MOUNTS[best].name}`,'#ffd23f');}}
// ---------- giao diện ----------
$('btnShop').onclick=()=>{openPanel('panelShop');renderShop();};
['item','eq','mount'].forEach(t=>$('shTab_'+t).onclick=()=>{shopTab=t;sfx('click');renderShop();});
PANELS.push('panelShop');
function updateMountBtn(){const b=$('mountBtn');if(!b)return;const M=player.mount&&MOUNTS[player.mount];b.classList.toggle('on',!!(M&&player.mountOn));$('mountTxt').textContent=!M?'CHƯA CÓ':player.mountOn?'ĐANG CƯỠI':'ĐANG TẮT';}
const _bh=buildHotbar;
buildHotbar=function(){_bh();$('flyBtn').insertAdjacentHTML('beforebegin','<button class="slot wide" id="mountBtn" data-tip="mount">THÚ CƯỠI<span id="mountTxt">CHƯA CÓ</span></button>');
  $('mountBtn').onclick=()=>{if(!player.mount){openPanel('panelShop');shopTab='mount';renderShop();return;}player.mountOn=!player.mountOn;sfx('fly');updateMountBtn();save();};updateMountBtn();};
const _tip2=tipContent;
tipContent=function(key){if(key==='mount'){const M=player.mount&&MOUNTS[player.mount];return M?`<div class="tn" style="color:#ffd23f">${M.name}</div>${M.desc}<br>Sinh lực +${Math.round(M.hp*100)}%${M.def?', phòng thủ +'+Math.round(M.def*100)+'%':''}<br>Tự xuống khi đánh nhau, tự lên lại khi di chuyển.`:'<div class="tn">Thú cưỡi</div>Chưa có. Mua ở Cửa hàng (cấp 10 trở lên).';}return _tip2(key);};
// túi đồ: hàng vật phẩm dùng được
const _rb=renderBag;
renderBag=function(){_rb();let r=$('bagUse');if(!r){r=document.createElement('div');r.id='bagUse';$('bagDetail').before(r);}
  r.innerHTML=`<span>⌂ Hồi Thành Phù: <b>${player.tp||0}</b></span> <button id="useTpBtn" ${player.tp>0?'':'disabled'}>Dùng</button>${expMul()>1?` <span style="color:#ffe27a;margin-left:12px">✦ Đang nhân kinh nghiệm <b>x${expMul()}</b>${expTime(2)>0?` · Tam bội còn ${Math.ceil(expTime(2)/60)} phút`:''}${expTime(1)>0?` · Song bội còn ${Math.ceil(expTime(1)/60)} phút`:''}</span>`:''}`;
  $('useTpBtn').onclick=()=>{useTP();};};
