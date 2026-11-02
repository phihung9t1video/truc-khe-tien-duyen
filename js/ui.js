'use strict';
// ===================== THÔNG BÁO =====================
function log(msg,col='#f4ead6'){const L=$('logBody')||$('log'),d=document.createElement('div');d.textContent=msg;d.style.color=col;L.appendChild(d);while(L.children.length>7)L.firstChild.remove();
  setTimeout(()=>{d.style.transition='opacity 1s';d.style.opacity=0;setTimeout(()=>d.remove(),1000);},7000);}
function toast(msg,col){const d=document.createElement('div');d.textContent=msg;if(col)d.style.color=col;$('toast').appendChild(d);while($('toast').children.length>3)$('toast').firstChild.remove();setTimeout(()=>d.remove(),3000);}

// ===================== THANH KỸ NĂNG =====================
function buildHotbar(){const hb=$('hotbar');hb.innerHTML='';
  skillList().forEach((s,i)=>{const b=document.createElement('button');b.className='slot';b.id='sk'+i;b.dataset.tip='skill:'+i;
    b.innerHTML=`<em>${i+1}</em><b style="color:${s.col}">${s.icon}</b><small>${s.name}</small><div class="cd"></div><div class="cdt"></div>`;b.onclick=()=>trySkill(i);hb.appendChild(b);});
  hb.insertAdjacentHTML('beforeend',`<div class="sep"></div>
    <button class="slot" id="pot0" data-tip="pot:hp"><em>7</em><span class="cnt" id="hpc">0</span><b style="color:#ff6a5a">♥</b><small>Kim Sang Dược</small></button>
    <button class="slot" id="pot1" data-tip="pot:mp"><em>8</em><span class="cnt" id="mpc">0</span><b style="color:#5ab4ff">◆</b><small>Ngưng Thần Đan</small></button>
    <div class="sep"></div>
    <button class="slot wide" id="flyBtn" data-tip="fly">NGỰ KIẾM<span id="flyTxt">CHƯA HỌC</span></button>
    <button class="slot wide" id="autoBtn" data-tip="auto">TỰ ĐỘNG<span id="autoTxt">ĐANG TẮT</span></button>
    <button class="slot wide" id="hereBtn" data-tip="here">LUYỆN TẠI CHỖ<span id="hereTxt">ĐANG TẮT</span></button>`);
  $('pot0').onclick=()=>usePot('hp');$('pot1').onclick=()=>usePot('mp');
  $('flyBtn').onclick=()=>{if(!started||player.dead)return;setFly(!player.flying);player.navFly=false;};
  $('autoBtn').onclick=toggleAuto;$('hereBtn').onclick=toggleAutoHere;}
function toggleAuto(){if(!started||player.dead)return;const was=auto&&player.autoMode!=='here';auto=!was;player.autoMode='quest';autoRest=false;navGoal=null;closeDlg();sfx('click');
  log(auto?'Bật tự động: tự làm nhiệm vụ, tìm đường qua các vùng, đánh quái, ra chiêu, uống thuốc, trả nhiệm vụ':'Đã tắt chế độ tự động',auto?'#7dff9a':'#f4ead6');}
// luyện tại chỗ: đứng luyện quanh vị trí hiện tại, ở bất kỳ bản đồ nào, không chạy đi làm nhiệm vụ
function toggleAutoHere(){if(!started||player.dead)return;const was=auto&&player.autoMode==='here';auto=!was;player.autoMode='here';autoRest=false;navGoal=null;closeDlg();sfx('click');
  if(auto){const A=player.autoAnchor={map:curMapId,x:player.x,y:player.y};A.zone=anchorZone(player.x,player.y);const nm=A.zone?MT[A.zone].name:'quái';log(`Luyện tại chỗ: chỉ đánh ${nm} ở bãi gần đây. Hết thuốc sẽ về thành mua rồi quay lại bãi này.`,'#7dff9a');}
  else log('Đã tắt luyện tại chỗ','#f4ead6');}

// ===================== CẬP NHẬT HUD =====================
let lastQ='',lastReg='',regT=0,lastBuff='',portraitT=0;
function regionName(){if(inSafe(player))return CM.safeName;const tx=player.x/T,ty=player.y/T;for(const r of CM.regions)if(Math.hypot(tx-r.x,ty-r.y)<r.r)return r.n;return CM.name;}
function onMapLoaded(){lastReg='';$('miniName').textContent=CM.name;}
function inArenaNow(){const A=CM.gen.arena;return A&&player.x/T>=A.x0&&player.x/T<=A.x1+1&&player.y/T>=A.y0&&player.y/T<=A.y1+1;}
function updateUI(){if(!player.sect||!$('hpc'))return;const st=stats();
  $('pname').textContent=player.name;$('psect').textContent=SECTS[player.sect].name;$('plvBadge').textContent=player.lv;
  $('hpb').style.width=(player.hp/st.maxhp*100)+'%';$('hpt').textContent=`Sinh lực ${Math.ceil(player.hp)} / ${st.maxhp}`;
  $('mpb').style.width=(player.mp/st.maxmp*100)+'%';$('mpt').textContent=`Nội lực ${Math.floor(player.mp)} / ${st.maxmp}`;
  $('pgold').textContent=`Lượng: ${player.gold.toLocaleString('vi-VN')}   ·   Công ${st.atk}   ·   Phòng ${st.def}`;
  if(player.lv>=MAXLV){$('expb').style.width='100%';$('expt').textContent='Đã đạt cấp tối đa';}
  else{const n=expNeed(player.lv);$('expb').style.width=(player.exp/n*100)+'%';$('expt').textContent=`Cấp ${player.lv} — Kinh nghiệm ${player.exp.toLocaleString('vi-VN')} / ${n.toLocaleString('vi-VN')} (${(player.exp/n*100).toFixed(1)}%)`;}
  const m=player.target;
  if(m&&!m.dead){$('tframe').hidden=false;$('tframe').dataset.other='';$('tport').hidden=true;$('tname').textContent=`${m.t.name} · Cấp ${m.lv}${m.enraged?' · NỔI GIẬN':''}`;$('tname').style.color=m.t.boss?'#ff9a3d':m.lv-player.lv>=3?'#ff7a6a':'#fff';
    $('thpb').style.width=(m.hp/m.maxhp*100)+'%';$('thpt').textContent=`${Math.max(0,Math.ceil(m.hp)).toLocaleString('vi-VN')} / ${m.maxhp.toLocaleString('vi-VN')}`;
    const em=elMul(SECTS[player.sect].el,m.t.el),E=EL[m.t.el];
    $('tstatus').innerHTML=(E?`<span style="color:${E.c}">Hệ ${E.n}</span>${em>1?' <span style="color:#9fffb0">(bạn khắc)</span>':em<1?' <span style="color:#ff9a8a">(khắc bạn)</span>':''}`:'')+[m.freezeT>0?'Đóng băng':'',m.stunT>0?'Choáng':'',m.slowT>0?'Bị làm chậm':'',m.burnT>0?(m.burnKind==='poison'?'Trúng độc':'Đang bỏng'):'',m.markT>0?'Bị đánh dấu':''].filter(Boolean).map(x=>' · '+x).join('');}
  else if(!(typeof renderSelOther==='function'&&renderSelOther()))$('tframe').hidden=true;
  skillList().forEach((s,i)=>{const el=$('sk'+i);if(!el)return;const locked=player.lv<s.lv;el.classList.toggle('locked',locked);
    el.querySelector('.cd').style.height=(player.cds[i]/s.cd*100)+'%';
    el.querySelector('.cdt').textContent=locked?`Cấp ${s.lv}`:player.cds[i]>0?Math.ceil(player.cds[i]):'';
    el.style.opacity=!locked&&player.mp<s.mp?0.55:1;});
  $('hpc').textContent=player.hpPot;$('mpc').textContent=player.mpPot;
  $('flyBtn').classList.toggle('on',player.flying);$('flyTxt').textContent=!player.flyUnlocked?'CHƯA HỌC':player.flying?'ĐANG BAY':'ĐANG TẮT';
  const aq=auto&&player.autoMode!=='here',ah=auto&&player.autoMode==='here';$('autoBtn').classList.toggle('on',aq);$('autoTxt').textContent=aq?(autoRest?'ĐANG NGHỈ':'ĐANG BẬT'):'ĐANG TẮT';
  if($('hereBtn')){$('hereBtn').classList.toggle('on',ah);$('hereTxt').textContent=ah?(autoRest?'ĐANG NGHỈ':'ĐANG BẬT'):'ĐANG TẮT';}
  const q=curQ();let qh;
  if(!q)qh='<b>Nhiệm vụ</b><br>Đã hoàn thành toàn bộ cốt truyện!<br><span class="go">Tiếp tục tu luyện, săn trang bị Truyền thuyết</span>';
  else{const o=questObjective(),where=o&&o.map!==curMapId?`<br><span style="color:#ffb36b">Ở ${MAPS[o.map].name}</span>`:'';
    qh=`<b>${q.title}</b><br>${q.short}${q.type==='talk'?'':`: <b>${qProgress()}/${q.n}</b>`}`+(qDone()&&q.type!=='talk'?`<br><span style="color:#7dff9a">✔ Về gặp ${npcName(q.giver)} nhận thưởng</span>`:'')+where+`<br><span class="go">➤ Nhấp để tự tìm đường</span>`;}
  if(qh!==lastQ){($('questBody')||$('quest')).innerHTML=qh;lastQ=qh;}
  const bh=player.buffs.map(b=>`<div class="buff" style="color:${b.col}" title="${b.name}">${b.icon}<span>${Math.ceil(b.t)}</span></div>`).join('')+(player.slowT>0?'<div class="buff" style="color:#9fe8ff" title="Bị làm chậm">❄</div>':'');
  if(bh!==lastBuff){$('buffs').innerHTML=bh;lastBuff=bh;}
  const rg=regionName();if(rg!==lastReg){lastReg=rg;$('region').textContent=rg;$('region').style.opacity=1;regT=3;}
  regT-=0.1;if(regT<=0)$('region').style.opacity=0;
  const boss=mobs.find(x=>x.t.boss);
  AU.mood=(inArenaNow()||(boss&&!boss.dead&&boss.state==='chase'))?'battle':TH.music;
  portraitT-=0.1;if(portraitT<=0){portraitT=1;drawPortrait($('portrait'),playerLook,playerW);}
  if(!$('panelChar').hidden)renderChar(false);
  if(!$('panelMap').hidden)renderMapPanel();}

// ===================== CHÚ GIẢI =====================
function itemHTML(it,cmp){if(!it)return'';if(cmp===undefined&&player.inv.includes(it))cmp=player.eq[eqKeyFor(it)];const r=RARITY[it.rar];let h=`<div class="tn" style="color:${r.c}">${it.name}${it.ref?' <span style="color:#ffd23f">+'+it.ref+'</span>':''}</div><div style="color:${r.c}">${r.n} · ${SLOTNAME[it.slot]} · Bậc ${it.tier+1}</div>`;
  h+=`<div style="color:${it.lvReq>player.lv?'#ff7a6a':'#ccc'}">Yêu cầu cấp ${it.lvReq}</div><div style="margin-top:4px">`;
  for(const k in it.st){const v=it.st[k],o=cmp&&cmp.st[k]||0,dv=v-o;h+=`${STATNAME[k]}: <b>+${v}${k==='crit'||k==='spd'?'%':''}</b>`+(cmp&&cmp!==it&&dv!==0?` <span style="color:${dv>0?'#7f7':'#f77'}">(${dv>0?'+':''}${dv})</span>`:'')+'<br>';}
  if(it.ref){const rb=refBonus(it);h+=`<span style="color:#ffd23f">Cường hóa +${it.ref}: ${Object.entries(rb).map(([k,v])=>STATNAME[k]+' +'+v).join(', ')}</span><br>`;}
  if(it.god)h+=`<div style="margin-top:4px;color:${GOD_COL}"><b>✦ THẦN KHÍ</b> — vũ khí tối thượng, ai cũng cầm được</div>`;
  if(it.set&&typeof SETS!=='undefined'&&SETS[it.set]){const S=SETS[it.set],n=setCount(it.set);h+=`<div style="margin-top:4px;color:${S.col}"><b>Bộ ${S.name}</b> (đang mặc ${n}/${S.pieces.length})</div>`+Object.entries(S.desc).map(([c,t])=>`<div style="color:${n>=+c?'#9fffb0':'#888'}">${c} món: ${t}</div>`).join('');}
  h+=`</div><div style="color:#ffd977;margin-top:3px">Giá bán: ${it.price} lượng</div>`;return h;}
function tipContent(key){const [k,v]=key.split(':');
  if(k==='skill'){const s=skillList()[+v];return`<div class="tn" style="color:${s.col}">${s.icon} ${s.name}</div><div style="color:${EL[SECTS[player.sect].el].c}">Hệ ${EL[SECTS[player.sect].el].n}</div><div style="color:${player.lv<s.lv?'#ff7a6a':'#9f9'}">Mở ở cấp ${s.lv}</div>${s.desc}<div style="margin-top:4px;color:#8ac4ff">Tốn ${s.mp} nội lực · Hồi chiêu ${s.cd} giây</div>`;}
  if(k==='pot')return v==='hp'?'<div class="tn" style="color:#ff8a7a">Kim Sang Dược</div>Hồi 40% sinh lực. Mua ở thầy thuốc trong làng.':'<div class="tn" style="color:#8ac4ff">Ngưng Thần Đan</div>Hồi 50% nội lực. Mua ở thầy thuốc trong làng.';
  if(k==='fly')return'<div class="tn" style="color:#9fd3ff">Ngự Kiếm Phi Hành</div>Đứng trên phi kiếm, tăng 70% tốc độ di chuyển. Tự xuống kiếm khi ra đòn.<br>Học được từ nhiệm vụ của Trưởng Làng (cấp 7).';
  if(k==='here')return'<div class="tn" style="color:#7dff9a">Luyện tại chỗ</div>Đứng luyện ngay vùng bạn đang đứng, ở bất kỳ bản đồ nào: tự đánh quái quanh đây, ra chiêu, uống thuốc, hết thuốc thì về thành mua rồi quay lại đúng chỗ. Không chạy đi làm nhiệm vụ. Muốn đổi chỗ luyện: tắt, đi tới chỗ mới rồi bật lại.';
  if(k==='auto')return'<div class="tn" style="color:#7dff9a">Tự động</div>Nhân vật tự làm nhiệm vụ, tự đi qua Truyền Tống Trận sang vùng mới, đánh quái, ra chiêu, uống thuốc, hái thảo dược, mặc đồ tốt hơn và trả nhiệm vụ.';
  if(k==='item'){const it=player.inv.find(x=>x.uid===+v);return it?itemHTML(it):'';}
  if(k==='eq'){const it=player.eq[v];return it?itemHTML(it,null)+'<div style="color:#aaa;margin-top:3px">Nhấp để cường hóa hoặc tháo ra</div>':`<div class="tn">${SLOTNAME[v]}</div>Chưa trang bị`;}
  return'';}
const IS_TOUCH='ontouchstart' in window||navigator.maxTouchPoints>0;let tipT=0;
document.addEventListener('mouseover',e=>{const el=e.target.closest&&e.target.closest('[data-tip]');const tip=$('tip');if(!el){tip.hidden=true;return;}const h=tipContent(el.dataset.tip);if(!h){tip.hidden=true;return;}tip.innerHTML=h;tip.hidden=false;if(IS_TOUCH){clearTimeout(tipT);tipT=setTimeout(()=>tip.hidden=true,2200);}});
document.addEventListener('mousemove',e=>{const tip=$('tip');if(tip.hidden)return;const w=tip.offsetWidth,h=tip.offsetHeight;tip.style.left=Math.min(innerWidth-w-8,e.clientX+16)+'px';tip.style.top=Math.max(8,Math.min(innerHeight-h-8,e.clientY-h-12))+'px';});

// ===================== BẢNG =====================
const PANELS=['panelChar','panelBag','panelSet','panelHelp','panelMap','panelTop'];
function openPanel(id){const was=!$(id).hidden;PANELS.forEach(p=>$(p).hidden=true);$('tip').hidden=true;if(was)return;$(id).hidden=false;sfx('click');
  if(id==='panelChar')renderChar(true);if(id==='panelBag')renderBag();if(id==='panelSet')renderSet();if(id==='panelMap')renderMapPanel();}
function refreshPanels(){if(!$('panelBag').hidden)renderBag();if(!$('panelChar').hidden)renderChar(true);}
function withCtx(cnv,fn){const old=ctx;ctx=cnv.getContext('2d');ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cnv.width,cnv.height);const k=cnv.width/parseFloat(cnv.dataset.w||cnv.width);ctx.scale(k,k);try{fn();}finally{ctx=old;}}
const EQ_LEFT=['helmet','armor','vest','gloves','wrist'],EQ_RIGHT=['necklace','amulet','ring1','ring2','boots'];
function eqSlotHTML(k){const it=player.eq[k],ic=k==='weapon'?(it?WICON[it.wtype]:WICON[SECTS[player.sect].wtype]):SLOTICON[k];
  if(!it)return`<div class="eqbox empty" data-tip="eq:${k}" data-slot="${k}"><div class="eqic">${ic}</div><div class="eqnm">${SLOTNAME[k]}</div></div>`;
  const c=RARITY[it.rar].c;return`<div class="eqbox" data-tip="eq:${k}" data-slot="${k}" style="border-color:${c};box-shadow:0 0 ${it.rar>=2?10:0}px ${c}66 inset"><div class="eqic" style="color:${c}">${ic}</div><div class="eqnm" style="color:${c}">${it.name}</div><div class="eqt">B${it.tier+1}${it.ref?' <b style="color:#ffd23f">+'+it.ref+'</b>':''}</div></div>`;}
// khung cường hóa của món đang chọn trong bảng Nhân vật
let eqSel=null;
function refineBoxHTML(it){if(!it)return'';const r=it.ref||0;
  if(r>=REF_MAX)return`<div style="color:#ffd23f;margin-top:4px">Đã cường hóa tối đa +${REF_MAX}</div>`;
  const next=Object.assign({},it,{ref:r+1}),nb=refBonus(next),cb=refBonus(it);
  const gain=Object.entries(nb).map(([k,v])=>`${STATNAME[k]} +${v-(cb[k]||0)}`).join(', ');
  return`<div style="margin-top:4px">Cường hóa lên <b style="color:#ffd23f">+${r+1}</b>: ${gain}<br>Tốn <b style="color:#ffd977">${refCost(it).toLocaleString('vi-VN')}</b> lượng · Tỉ lệ thành công <b>${refRate(r)}%</b> <span style="color:#999">(thất bại chỉ mất lượng)</span></div>`;}
function renderEqDetail(){const box=$('eqDetail');if(!box)return;const it=eqSel&&player.eq[eqSel];
  if(!it){box.innerHTML='<div style="color:#999">Nhấp vào một món đang mặc để <b style="color:#ffd23f">cường hóa</b>. Mỗi món có cường hóa riêng; khi thay đồ mới, cường hóa sẽ tự <b>chuyển sang món mới</b>.</div>';return;}
  box.innerHTML=`<div style="flex:1">${itemHTML(it,null)}${refineBoxHTML(it)}</div><div style="width:150px"><button class="btn" id="eqRef" ${(it.ref||0)>=REF_MAX?'disabled':''}>Cường hóa</button><button class="btn gray" id="eqOff">Tháo ra</button></div>`;
  $('eqRef').onclick=()=>{const ok=refineItem(it.uid);if(ok!==null)renderChar(true);};
  $('eqOff').onclick=()=>{unequip(eqSel);eqSel=null;$('tip').hidden=true;renderChar(true);};}
function renderChar(full){withCtx($('charPrev'),()=>{
    const g=ctx.createRadialGradient(110,170,10,110,170,150);g.addColorStop(0,'rgba(170,210,255,.28)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,220,260);
    ctx.strokeStyle='rgba(232,198,106,.35)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(110,232,62,16,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(110,232,46,11,0,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(110,232,34,9,0,0,Math.PI*2);ctx.fill();
    const dirs=['down','side','up','side'],di=Math.floor(nowT/2.5)%4;drawChibi(playerLook,110,230,2.8,dirs[di],di===3?-1:1,false,0,false,playerW,0.3);});
  if(!full)return;const st=stats(),S=SECTS[player.sect];
  $('charTop').innerHTML=`<span style="font-size:18px;font-weight:bold;color:#ffe9b0">${player.name}</span> &nbsp;<span style="color:${S.color}">${S.name} · ${player.gender==='f'?'Nữ':'Nam'} · Cấp ${player.lv}</span>`;
  $('eqL').innerHTML=EQ_LEFT.map(eqSlotHTML).join('');$('eqR').innerHTML=EQ_RIGHT.map(eqSlotHTML).join('');$('eqWeapon').innerHTML=eqSlotHTML('weapon');
  $('charStats').innerHTML=`<div>Sinh lực <b>${st.maxhp}</b></div><div>Nội lực <b>${st.maxmp}</b></div><div>Công lực <b>${st.atk}</b></div><div>Phòng thủ <b>${st.def}</b></div>
   <div>Bạo kích <b>${(st.crit*100).toFixed(0)}%</b></div><div>Tốc độ <b>+${(st.spd*100).toFixed(0)}%</b></div><div>Ngũ hành <b style="color:${EL[S.el].c}">${EL[S.el].n}</b></div><div>Quái đã hạ <b>${player.kills.toLocaleString('vi-VN')}</b></div><div>Tỷ thí thắng / thua <b>${(player.pvp||{}).w||0} / ${(player.pvp||{}).l||0}</b></div><div>Phiên bản <b>${window.APP_VERSION||''}</b></div>`;
  document.querySelectorAll('#panelChar .eqbox').forEach(el=>{el.classList.toggle('sel',el.dataset.slot===eqSel);el.onclick=()=>{if(player.eq[el.dataset.slot]){eqSel=el.dataset.slot;sfx('click');$('tip').hidden=true;renderChar(true);}else openPanel('panelBag');};});
  renderEqDetail();}
let bagSel=null,bagSellMode=false;
function renderBag(){const g=$('bagGrid');let h='';
  for(let i=0;i<BAG_MAX;i++){const it=player.inv[i];
    if(!it){h+='<div class="cell" style="cursor:default"></div>';continue;}
    const ic=it.slot==='weapon'?WICON[it.wtype]:SLOTICON[it.slot];
    h+=`<div class="cell${bagSel===it.uid?' sel':''}" data-tip="item:${it.uid}" data-uid="${it.uid}" style="border-color:${RARITY[it.rar].c}66"><div class="ic" style="color:${RARITY[it.rar].c}">${ic}</div><span style="color:${RARITY[it.rar].c}">${it.name}</span><span class="tb">B${it.tier+1}${it.ref?' +'+it.ref:''}</span>${isUpgrade(it)?'<span class="up">▲</span>':''}</div>`;}
  g.innerHTML=h;
  g.querySelectorAll('.cell[data-uid]').forEach(el=>el.onclick=()=>{const uid=+el.dataset.uid;
    if(bagSellMode){const it=player.inv.find(x=>x.uid===uid);if(!it)return;if((it.rar>=3||it.set)&&!confirm('Bán '+it.name+' ('+RARITY[it.rar].n+') được '+it.price+' lượng?'))return;$('tip').hidden=true;bagSel=null;sellItem(uid);renderBag();return;}
    bagSel=uid;renderBag();});
  g.classList.toggle('sellmode',bagSellMode);const sb=$('sellModeBtn');if(sb){sb.textContent=bagSellMode?'Bán nhanh: ĐANG BẬT (bấm món để bán)':'Bán nhanh: TẮT';sb.classList.toggle('on',bagSellMode);}
  const it=player.inv.find(x=>x.uid===bagSel);
  $('bagDetail').innerHTML=it?`<div style="flex:1">${itemHTML(it)}</div><div style="width:150px"><button class="btn" id="bEq">Trang bị</button><button class="btn" id="bRef" title="${(it.ref||0)<REF_MAX?'Tốn '+refCost(it).toLocaleString('vi-VN')+' lượng, tỉ lệ '+refRate(it.ref||0)+'%':'Tối đa'}">Cường hóa${(it.ref||0)<REF_MAX?' +'+((it.ref||0)+1):''}</button><button class="btn gray" id="bSell">Bán ${it.price} lượng</button></div>`:'<div style="color:#999">Nhấp vào một món đồ để xem và trang bị. Dấu <b style="color:#7f7">▲</b> là đồ tốt hơn đồ đang mặc.</div>';
  if(it){$('bRef').onclick=()=>{if(refineItem(it.uid)!==null)renderBag();};$('bEq').onclick=()=>{equipItem(it.uid);bagSel=null;$('tip').hidden=true;renderBag();};$('bSell').onclick=()=>{sellItem(it.uid);bagSel=null;$('tip').hidden=true;renderBag();};}
  $('bagGold').textContent=`Lượng: ${player.gold.toLocaleString('vi-VN')} · Túi: ${player.inv.length}/${BAG_MAX}`;}
let resetArm=false;
function renderSet(){resetArm=false;$('optMusic').checked=AU.music;$('optSfx').checked=AU.sfx;$('resetBtn').textContent='Xóa nhân vật, chơi lại từ đầu';
  if(netEnabled()){netIdent();$('netBox').hidden=false;$('recCode').textContent=recoveryCode();}else $('netBox').hidden=true;}
// ---------- chat, online, xếp hạng ----------
function renderChat(){const b=$('chatLog');if(!b)return;b.innerHTML=NET.chat.slice(-8).map(c=>`<div><b style="color:${c.name==='Hệ thống'?'#ffb36b':c.name===player.name?'#9fffb0':'#8fd8ff'}">${esc(c.name)}${c.lv?' ['+c.lv+']':''}:</b> ${esc(c.text)}</div>`).join('');b.scrollTop=b.scrollHeight;}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function renderParty(){const box=$('partyBox');if(!box)return;if(typeof inParty!=='function'||!inParty()){box.hidden=true;return;}box.hidden=false;const b=$('partyBody')||box;
  const meRow=(()=>{const st=stats(),S=SECTS[player.sect];return`<div class="pm"><b style="color:${S.color}">${PARTY.leader===NET.id?'★ ':''}${esc(player.name)}</b> <span style="color:#9fffb0">(bạn)</span> <span style="color:#ccc">${player.lv}</span><div class="bar hp"><i style="width:${Math.max(0,Math.min(1,player.hp/st.maxhp))*100}%"></i></div></div>`;})();
  const rows=meRow+PARTY.members.filter(m=>m.id!==NET.id).map(m=>{const s=PARTY.st.get(m.id)||{},o=NET.others.get(m.id),hp=o&&o.hf!=null?o.hf:s.hp,S=SECTS[s.sect||(o&&o.sect)];
    const far=s.map&&s.map!==curMapId?` <span style="color:#999">(${MAPS[s.map]?MAPS[s.map].name:''})</span>`:'';
    return`<div class="pm" data-pid="${m.id}" title="Bấm để xem thao tác"><b style="color:${S?S.color:'#fff'}">${m.id===PARTY.leader?'★ ':''}${esc(m.name)}</b> <span style="color:#ccc">${s.lv||(o&&o.lv)||''}</span>${far}<div class="bar hp"><i style="width:${Math.max(0,Math.min(1,hp==null?1:hp))*100}%"></i></div></div>`;}).join('');
  const fb=isLeader()?'<button id="pCall" class="pfb">Gọi theo đội</button>'+`<button id="pAuto" class="pfb${partyAutoOn()?' on':''}" title="Bật thì ai xin vào đội cũng được vào ngay">Tự nhận: ${partyAutoOn()?'BẬT':'TẮT'}</button>`:PARTY.follow?'<button id="pUnfol" class="pfb on">Bỏ theo</button>':'<button id="pFol" class="pfb">Theo đội</button>';
  b.innerHTML=`<div class="ph">Tổ đội ${PARTY.members.length}/${PARTY_MAX}${isLeader()?' · Bạn là đội trưởng':PARTY.follow?' · Đang theo':''}<button id="pLeave">Rời đội</button></div><div class="pbtns">${fb}</div>${rows||'<div style="color:#999">Đang chờ đồng đội...</div>'}`;
  $('pLeave').onclick=()=>{sfx('click');netLeaveParty();};
  if($('pCall'))$('pCall').onclick=()=>{sfx('click');followCall();};if($('pAuto'))$('pAuto').onclick=()=>{sfx('click');partyAutoSet(!partyAutoOn());};if($('pFol'))$('pFol').onclick=()=>{sfx('click');followStart();};if($('pUnfol'))$('pUnfol').onclick=()=>{sfx('click');followStop();};
  b.querySelectorAll('[data-pid]').forEach(el=>el.onclick=()=>{const id=el.dataset.pid,m=PARTY.members.find(x=>x.id===id);if(!m)return;sfx('click');
    const btns=[{t:'Nhắn riêng',fn:()=>{closeDlg();whisperTo(id,m.name);}}];
    if(isLeader())btns.unshift({t:'Chuyển đội trưởng',fn:()=>{closeDlg();leaderTransfer(id);}});
    if(!isLeader()&&id===PARTY.leader)btns.unshift({t:'Đến chỗ đội trưởng',fn:()=>{closeDlg();followStart();}});
    openDlg('Đội viên',`<b>${esc(m.name)}</b>${id===PARTY.leader?' · <span style="color:#ffd23f">Đội trưởng</span>':''}`,btns);});}
setInterval(()=>{if(started)renderParty();},700);
function updateNetUI(){if(!$('netStat'))return;if(!netEnabled()){$('chatBox').hidden=true;return;}$('chatBox').hidden=false;
  const n=NET.world.size+(NET.status==='on'?1:0);$('netStat').innerHTML=NET.status==='on'?`<span style="color:#7dff9a">●</span> Đang online: <b>${n}</b> <span style="color:#8fd8ff;text-decoration:underline">(xem)</span> · Cùng vùng: <b>${NET.others.size}</b>`:'<span style="color:#ff8a7a">●</span> Đang kết nối...';}
async function renderTop(){const b=$('topList');b.innerHTML='Đang tải...';
  try{const rows=(await fetchTop()||[]).filter(r=>r.sect!=='GM');b.innerHTML=rows&&rows.length?'<table><tr><th>#</th><th>Tên</th><th>Môn phái</th><th>Cấp</th></tr>'+rows.map((r,i)=>`<tr${r.name===player.name?' class="me"':''}><td>${i+1}</td><td>${esc(r.name)}</td><td>${SECTS[r.sect]?SECTS[r.sect].name:esc(r.sect)}</td><td>${r.lv}</td></tr>`).join('')+'</table>':'Chưa có ai trên bảng xếp hạng. Hãy là người đầu tiên!';}
  catch(e){b.innerHTML='Bảng xếp hạng chưa được bật trên máy chủ (cần chạy file supabase/schema.sql).';}}
$('chatIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){netSendChat(e.target.value);e.target.value='';}});
$('chatSend').onclick=()=>{netSendChat($('chatIn').value);$('chatIn').value='';};
$('btnTop').onclick=()=>{openPanel('panelTop');renderTop();cloudSave(true);};
$('cloudSaveBtn').onclick=()=>cloudSave(false);
$('copyCode').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(recoveryCode());log('Đã chép mã khôi phục','#8fd8ff');};
setInterval(updateNetUI,1000);

// ===================== BẢN ĐỒ TOÀN CẢNH =====================
let mapTab='area';
const BMW=768,BMH=576;
function renderMapPanel(){$('tabArea').classList.toggle('sel',mapTab==='area');$('tabWorld').classList.toggle('sel',mapTab==='world');
  withCtx($('bigMap'),()=>{if(mapTab==='area')drawAreaMap();else drawWorldMap();});}
function drawAreaMap(){const k=BMW/(MW*T),c=ctx;c.imageSmoothingEnabled=true;c.drawImage(mapCv,0,0,BMW,BMH);
  c.globalAlpha=0.85;c.fillStyle=TH.tree;for(const tr of TREES){c.beginPath();c.arc(tr.x*k,(tr.y-14)*k,3.3,0,Math.PI*2);c.fill();}c.globalAlpha=1;
  for(const h of HOUSES_D){c.fillStyle=TH.roof;c.beginPath();c.roundRect(h.x*k-2,h.y*k,96*k+4,96*k,3);c.fill();}
  const g=c.createRadialGradient(BMW/2,BMH/2,BMH*0.4,BMW/2,BMH/2,BMW*0.65);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(10,6,20,.45)');c.fillStyle=g;c.fillRect(0,0,BMW,BMH);
  const lab=(t,x,y,col,s=13)=>{c.font=`bold ${s}px "Palatino Linotype","Times New Roman",serif`;c.textAlign='center';c.lineWidth=3.5;c.strokeStyle='rgba(0,0,0,.85)';c.strokeText(t,x,y);c.fillStyle=col;c.fillText(t,x,y);};
  const S=SAFE;lab(CM.safeName,(S.x0+S.x1+1)/2*T*k,S.y0*T*k-6,'#ffe9a8',15);
  for(const r of CM.regions)lab(r.n,r.x*T*k,r.y*T*k-10,'#f4e6c8',13);
  for(const key in CM.zones){const z=CM.zones[key],t=MT[key];lab(`${t.name} (${t.lv[0]===t.lv[1]?t.lv[0]:t.lv[0]+'–'+t.lv[1]})`,z.x*T*k,z.y*T*k+8,t.boss?'#ff8a6a':'#ffb0a0',11);}
  for(const m of mobs){if(m.dead)continue;c.fillStyle=m.t.boss?'#ff2a2a':'#ff7a6a';c.beginPath();c.arc(m.x*k,m.y*k,m.t.boss?5:2.2,0,Math.PI*2);c.fill();}
  for(const h of herbs)if(!h.dead){c.fillStyle='#8fffd0';c.beginPath();c.arc(h.x*k,h.y*k,2.4,0,Math.PI*2);c.fill();}
  for(const p of CM.portals){const x=p.x*T*k,y=p.y*T*k,lk=player.lv<p.minLv;c.strokeStyle=lk?'#ff8a7a':'#8fd8ff';c.lineWidth=2.5;c.beginPath();c.arc(x,y,9+Math.sin(nowT*4)*1.5,0,Math.PI*2);c.stroke();
    lab(`➤ ${MAPS[p.to].name}`,x,y-14,lk?'#ff9a8a':'#bfe8ff',12);lab(lk?`Cần cấp ${p.minLv}`:`Cấp ${MAPS[p.to].lvText}`,x,y+22,lk?'#ff9a8a':'#ffe9a8',10);}
  const q=curQ();
  for(const n of npcs){const x=n.x*k,y=n.y*k,isQ=q&&q.giver===n.id;c.fillStyle=isQ?'#7dff9a':'#ffd23f';c.beginPath();c.arc(x,y,4,0,Math.PI*2);c.fill();c.strokeStyle='#000';c.lineWidth=1;c.stroke();lab(n.name,x,y-8,isQ?'#9fffb0':'#ffe9a8',10);}
  const o=questObjective();if(o&&o.map===curMapId){let ox=null,oy=null;if(o.npc){const n=npcById(o.npc);if(n){ox=n.x;oy=n.y;}}else if(o.mob){const z=CM.zones[o.mob];if(z){ox=z.x*T+16;oy=z.y*T+16;}}else if(o.gather){const z=CM.herbs.zones[0];ox=z.x*T;oy=z.y*T;}
    if(ox!=null){const pr=1+0.25*Math.sin(nowT*5);c.fillStyle='#ffd23f';c.save();c.translate(ox*k,oy*k-22);c.scale(pr,pr);c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?4:9;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();c.strokeStyle='#5a3a00';c.stroke();c.restore();}}
  const px=player.x*k,py=player.y*k;c.fillStyle='rgba(120,200,255,.35)';c.beginPath();c.arc(px,py,10+Math.sin(nowT*5)*2,0,Math.PI*2);c.fill();
  c.fillStyle='#ffffff';c.beginPath();c.arc(px,py,5,0,Math.PI*2);c.fill();c.fillStyle='#3b8fe6';c.beginPath();c.arc(px,py,3,0,Math.PI*2);c.fill();
  c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=1;c.strokeRect(cam.x*k,cam.y*k,VW/Z*k,VH/Z*k);
  $('mapHint').textContent=`${CM.name} · Cấp ${CM.lvText} — Nhấp vào bản đồ để tự đi tới đó (tự ngự kiếm nếu đã học).`;}
const WNODES=()=>Object.entries(MAPS).map(([id,M])=>({id,M,x:M.wx*BMW,y:M.wy*BMH}));
function drawWorldMap(){const c=ctx;const g=c.createLinearGradient(0,0,0,BMH);g.addColorStop(0,'#2a3446');g.addColorStop(1,'#141a26');c.fillStyle=g;c.fillRect(0,0,BMW,BMH);
  seed=11;for(let i=0;i<60;i++){c.fillStyle=`rgba(255,255,255,${0.04+srand()*0.08})`;c.beginPath();c.ellipse(srand()*BMW,srand()*BMH,30+srand()*90,10+srand()*30,0,0,Math.PI*2);c.fill();}
  const N=WNODES(),byId={};N.forEach(n=>byId[n.id]=n);
  c.lineWidth=3;c.setLineDash([8,6]);c.strokeStyle='rgba(200,220,255,.5)';for(const n of N)for(const p of n.M.portals){const o=byId[p.to];if(!o)continue;c.beginPath();c.moveTo(n.x,n.y);c.lineTo(o.x,o.y);c.stroke();}c.setLineDash([]);
  const COL={spring:'#6fcf5a',marsh:'#4fb8a0',snow:'#cfe6ff',desert:'#e8b860',dark:'#9a6ad0',heaven:'#ffe08a',volcano:'#ff7a3a',sea:'#3ab0e0',star:'#a890ff',wild:'#c8a060',blood:'#e03a4a',thunder:'#c8b0ff',jade:'#3ad08a',void:'#ffd060'};
  for(const n of N){const lk=player.lv<n.M.minLv,cur=n.id===curMapId,r=cur?34:28;
    if(cur){c.fillStyle='rgba(255,230,140,.25)';c.beginPath();c.arc(n.x,n.y,r+12+Math.sin(nowT*3)*3,0,Math.PI*2);c.fill();}
    const gg=c.createRadialGradient(n.x-8,n.y-8,4,n.x,n.y,r);gg.addColorStop(0,'#ffffff');gg.addColorStop(1,lk?'#555a66':COL[n.M.theme]||'#aaa');c.fillStyle=gg;c.beginPath();c.arc(n.x,n.y,r,0,Math.PI*2);c.fill();
    c.strokeStyle=cur?'#ffe08a':'rgba(0,0,0,.5)';c.lineWidth=cur?3:1.5;c.stroke();
    c.textAlign='center';c.font='bold 16px "Palatino Linotype","Times New Roman",serif';c.lineWidth=4;c.strokeStyle='rgba(0,0,0,.85)';c.strokeText(n.M.name,n.x,n.y+r+20);c.fillStyle=lk?'#aaa':'#ffe9b0';c.fillText(n.M.name,n.x,n.y+r+20);
    const sub=`Cấp ${n.M.lvText}${lk?' · Chưa mở':''}`;c.font='bold 12px "Segoe UI",Arial';c.strokeText(sub,n.x,n.y+r+36);c.fillStyle=lk?'#ff9a8a':'#bfe8ff';c.fillText(sub,n.x,n.y+r+36);
    if(cur){c.fillStyle='#ffe08a';c.fillText('● Bạn đang ở đây',n.x,n.y-r-10);}
    const cnt=typeof NET!=='undefined'?[...NET.world.values()].filter(o=>o.map===n.id).length:0;
    if(cnt){c.font='bold 13px "Segoe UI",Arial';const tx=`👥 ${cnt}`,w=c.measureText(tx).width+12;c.fillStyle='rgba(20,90,40,.9)';c.beginPath();c.roundRect(n.x+r-6,n.y-r-4,w,20,10);c.fill();c.fillStyle='#d8ffd8';c.textAlign='left';c.fillText(tx,n.x+r,n.y-r+11);c.textAlign='center';}}
  $('mapHint').textContent='Nhấp vào một vùng để tự tìm đường qua các Truyền Tống Trận tới đó.';}
$('bigMap').addEventListener('mousedown',e=>{if(!started||player.dead)return;const r=$('bigMap').getBoundingClientRect(),mx=(e.clientX-r.left)/r.width*BMW,my=(e.clientY-r.top)/r.height*BMH;
  if(mapTab==='area'){const k=BMW/(MW*T);groundMove(mx/k,my/k);if(player.flyUnlocked&&Math.hypot(player.x-mx/k,player.y-my/k)>320){setFly(true);player.navFly=true;}$('panelMap').hidden=true;}
  else{for(const n of WNODES())if(Math.hypot(mx-n.x,my-n.y)<36){if(n.id===curMapId){mapTab='area';renderMapPanel();return;}
      if(auto){auto=false;log('Đã tắt chế độ tự động');}player.target=null;player.npc=null;player.gather=null;
      if(navTo(n.id,null,null)){log(`Đang tìm đường tới ${n.M.name}...`,'#8fd8ff');$('panelMap').hidden=true;}return;}}});
$('tabArea').onclick=()=>{mapTab='area';renderMapPanel();};$('tabWorld').onclick=()=>{mapTab='world';renderMapPanel();};

// ===================== HỘI THOẠI NPC =====================
function openDlg(title,html,btns){$('dlgT').textContent=title;$('dlgX').innerHTML=html;const b=$('dlgB');b.innerHTML='';
  for(const o of btns.concat([{t:'Đóng',gray:true,fn:closeDlg}])){const e=document.createElement('button');e.className='btn'+(o.gray?' gray':'');e.textContent=o.t;e.onclick=()=>{sfx('click');o.fn();};b.appendChild(e);}
  $('dlg').hidden=false;}
function closeDlg(){$('dlg').hidden=true;}
const GREET={elder:'Trúc Khê Thôn tuy nhỏ nhưng là chốn bình yên. Gần đây thú dữ và sơn tặc quấy nhiễu, mong thiếu hiệp ra tay tương trợ.',
  healer:'Thiếu hiệp bị thương ư? Để ta xem nào. Ta cũng có bán linh dược đây.',smith:'Muốn binh khí sắc bén hơn thì tìm lão! Lão còn thu mua đồ cũ.',
  fisher:'Đầm Vân Mộng mênh mông, cá tôm nhiều nhưng yêu quái cũng chẳng ít. Thiếu hiệp từ xa tới, hãy giúp lão một tay.',herbalist:'Sen ở đầm này có linh tính, chữa được bách độc. Thiếu hiệp cần thuốc cứ hỏi ta.',
  merchant:'Hàng của ta đi khắp đầm lầy! Binh khí cần cường hóa, đồ cũ cần bán, cứ để ta lo.',taoist:'Vô lượng thiên tôn. Ma khí trên Thiên Sơn ngày một nặng, bần đạo đang đợi người hữu duyên.',
  daotong:'Sư phụ dặn phải tiếp đón khách hành hương chu đáo. Huynh cần đan dược không?',ironsmith:'Thép luyện bằng hàn băng Thiên Sơn là thứ thép tốt nhất thiên hạ!'};
function openNpc(n){const q=curQ();player.face=n.x>=player.x?1:-1;
  if(q&&q.type==='talk'&&q.giver===n.id&&player.qc<1){player.qc=1;}
  if(auto&&q&&q.giver===n.id&&qDone()){claimQuest();return;}
  let html=`<i>${GREET[n.id]||''}</i>`;const btns=[];
  if(q&&q.giver===n.id){html+=`<hr style="border-color:#5a4a30"><b style="color:#ffd77a">${q.title}</b><br>${q.desc}`+(q.type==='talk'?'':`<br>Tiến độ: <b>${qProgress()}/${q.n}</b>`);
    const r=q.reward,parts=[`${r.exp.toLocaleString('vi-VN')} kinh nghiệm`,`${r.gold} lượng`];if(r.hp)parts.push(`${r.hp} Kim Sang Dược`);if(r.mp)parts.push(`${r.mp} Ngưng Thần Đan`);if(r.item)parts.push(`1 ${SLOTNAME[r.item.slot]} ${RARITY[r.item.rar].n}`);if(r.fly)parts.push('thuật Ngự Kiếm Phi Hành');
    html+=`<br>Thưởng: <span style="color:#ffe27a">${parts.join(', ')}</span>`;
    if(qDone())btns.push({t:'Nhận thưởng',fn:claimQuest});}
  else if(q&&n.kind==='quest')html+=`<hr style="border-color:#5a4a30">Nhiệm vụ hiện tại: <b>${q.title}</b>. Hãy tìm <b>${npcName(q.giver)}</b> ở ${MAPS[NPC_INDEX[q.giver].map].name}.`;
  if(n.kind==='healer'){const st=stats();
    btns.push({t:'Chữa thương (miễn phí)',fn:()=>{player.hp=st.maxhp;player.mp=st.maxmp;player.slowT=0;addRing(player.x,player.y-14,50,'#7dff9a',0.6);sfx('heal');log('Đã được chữa lành thương thế','#7dff9a');}});
    btns.push({t:'Mua 5 Kim Sang Dược — 30 lượng',fn:()=>{if(player.gold<30)return log('Không đủ lượng','#ff9a8a');player.gold-=30;player.hpPot+=5;sfx('coin');openNpc(n);}});
    btns.push({t:'Mua 5 Ngưng Thần Đan — 30 lượng',fn:()=>{if(player.gold<30)return log('Không đủ lượng','#ff9a8a');player.gold-=30;player.mpPot+=5;sfx('coin');openNpc(n);}});
    html+=`<br><br>Bạn đang có <b style="color:#ffd977">${player.gold.toLocaleString('vi-VN')}</b> lượng.`;}
  if(n.kind==='smith'){html+='<br><br>Mỗi món trang bị đều cường hóa riêng được (tối đa +15). Khi thay đồ mới, cường hóa của món cũ sẽ chuyển sang món mới.';
    btns.push({t:'Cường hóa trang bị',fn:()=>{closeDlg();eqSel=eqSel||'weapon';openPanel('panelChar');}});
    btns.push({t:'Bán toàn bộ đồ Thường & Tinh xảo (trừ đồ tốt hơn)',fn:()=>{sellJunk();openNpc(n);}});
    html+=`<br>Bạn đang có <b style="color:#ffd977">${player.gold.toLocaleString('vi-VN')}</b> lượng.`;}
  openDlg(n.name,html,btns);}

// ===================== MÀN HÌNH MỞ ĐẦU =====================
let cGender='m',cSect='kiem',newArm=false;
function showStart(){const s=loadSave();
  $('contBox').innerHTML=s?`<button class="btn" id="contBtn">Tiếp tục: <b>${s.name}</b> · ${SECTS[s.sect].name} · Cấp ${s.lv}</button>`:'';
  if(s)$('contBtn').onclick=()=>{auInit();applySave(s);enterGame(false);};
  $('newBtn').onclick=()=>{if(s&&!newArm){newArm=true;$('newBtn').textContent='Bấm lần nữa: tạo mới sẽ XÓA nhân vật cũ';return;}auInit();$('startMenu').hidden=true;$('create').hidden=false;};
  $('sects').innerHTML=Object.entries(SECTS).map(([k,S])=>`<div class="sect${k===cSect?' sel':''}" data-k="${k}"><b style="color:${S.color}">${S.name}</b><div>${S.role}</div><span class="elb" style="color:${EL[S.el].c};border-color:${EL[S.el].c}">${EL[S.el].i} ${EL[S.el].n}</span></div>`).join('')+'<div id="sectInfo"></div>';
  const info=()=>{const S=SECTS[cSect],E=EL[S.el],nm=a=>a.map(e=>`<b style="color:${EL[e].c}">${EL[e].n}</b>`).join(', ')||'không';
    $('sectInfo').innerHTML=`<div>${S.desc}</div><div style="color:#9fffb0">▲ Điểm mạnh: ${S.strong}</div><div style="color:#ff9a8a">▼ Điểm yếu: ${S.weak}</div>
      <div>Hệ <b style="color:${E.c}">${E.n}</b> · Khắc: ${nm(EL_BEATS[S.el])} · Bị khắc: ${nm(elBeatenBy(S.el))}</div><div style="color:#9fd3ff">Võ công: ${S.skills.map(id=>SKILLS[id].icon+' '+SKILLS[id].name).join(' · ')}</div>`;};
  info();
  $('sects').querySelectorAll('.sect').forEach(el=>el.onclick=()=>{cSect=el.dataset.k;sfx('click');$('sects').querySelectorAll('.sect').forEach(x=>x.classList.toggle('sel',x===el));info();});
  document.querySelectorAll('.tog').forEach(el=>{el.classList.toggle('sel',el.dataset.g===cGender);el.onclick=()=>{cGender=el.dataset.g;sfx('click');document.querySelectorAll('.tog').forEach(x=>x.classList.toggle('sel',x===el));};});
  $('createBtn').onclick=()=>{const name=$('cName').value.trim()||'Vô Danh';newPlayer(name.slice(0,14),cGender,cSect);if(typeof cAp!=='undefined'){player.ap=Object.assign({},cAp);refreshLook();}loadMap('trukhe');const st=stats();player.hp=st.maxhp;player.mp=st.maxmp;enterGame(true);};
  $('backBtn').onclick=()=>{$('create').hidden=true;$('startMenu').hidden=false;};
  $('restoreBtn').hidden=!netEnabled();
  $('restoreBtn').onclick=async()=>{const code=prompt?null:null;const box=$('restoreBox');box.hidden=!box.hidden;};
  $('restoreGo').onclick=async()=>{const msg=$('restoreMsg');msg.textContent='Đang tải...';
    try{const s=await cloudLoad($('restoreIn').value);msg.textContent='Đã tải nhân vật '+s.name+' (cấp '+s.lv+')';auInit();applySave(loadSave());enterGame(false);}
    catch(e){msg.textContent=e.message==='ma'?'Mã không đúng định dạng (ví dụ ABCD2345-ABCDEFGH2345)':'Không tìm thấy nhân vật với mã này, hoặc chưa kết nối mạng.';}};}
function drawCreatePreview(){const c=$('cPreview');if($('create').hidden)return;withCtx(c,()=>{
  const L=buildLook(cSect,cGender,null,typeof cAp!=='undefined'?cAp:null),W=weaponVis(null,SECTS[cSect].wtype,0);const ph=nowT%6,dirs=['down','side','up','side'],di=Math.floor(nowT/1.5)%4;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(110,226,36,10,0,0,Math.PI*2);ctx.fill();
  drawChibi(L,110,224,2.8,dirs[di],di===3?-1:1,ph>3&&ph<5,(ph%1.5)<0.25&&ph<3?0.25-(ph%1.5):0,false,W,0.3);});}
function enterGame(isNew){$('start').hidden=true;$('hud').hidden=false;buildHotbar();started=true;auSet('music',AU.music);auSet('sfx',AU.sfx);
  lastQ='';lastReg='';$('miniName').textContent=CM.name;
  if(isNew){log(`Chào mừng ${player.name} đến Trúc Khê Thôn! Nhấp vào Trưởng Làng (dấu !) để nhận nhiệm vụ.`,'#ffd77a');toast(`${SECTS[player.sect].name} — ${player.name}`);openPanel('panelHelp');}
  else log(`Chào mừng ${player.name} trở lại ${CM.name}!`,'#ffd77a');
  updateUI();save();}

// ===================== ĐIỀU KHIỂN =====================
const mouse={x:0,y:0,down:false,hold:false,holdT:0};
const toWorld=(sx,sy)=>({x:sx/Z+cam.x,y:sy/Z+cam.y});
function pickAt(w){
  for(const n of npcs)if(Math.abs(w.x-n.x)<16&&w.y<n.y+6&&w.y>n.y-64)return{npc:n};
  if(typeof NET!=='undefined')for(const o of NET.others.values())if(Math.abs(w.x-o.x)<15&&w.y<o.y+6&&w.y>o.y-60)return{other:o};
  let best=null,bd=1e9;
  for(const m of mobs){if(m.dead)continue;const t=m.t,s=t.scale||1;if(Math.abs(w.x-m.x)<t.hw*s&&w.y<m.y+8&&w.y>m.y-t.hh){const d=Math.abs(w.x-m.x)+Math.abs(w.y-(m.y-t.hh/2));if(d<bd){bd=d;best=m;}}}
  if(best)return{mob:best};
  for(const h of herbs)if(!h.dead&&Math.abs(w.x-h.x)<14&&w.y<h.y+6&&w.y>h.y-24)return{herb:h};
  return null;}
function groundMove(x,y){if(auto){auto=false;autoRest=false;log('Đã tắt chế độ tự động');}
  navGoal=null;player.target=null;player.npc=null;player.pend=null;player.gather=null;player.channel=0;player.navFly=false;moveTo(x,y);marker={x,y,t:0};}
cv.addEventListener('mousedown',e=>{if(e.button!==0||!started||player.dead)return;mouse.x=e.offsetX;mouse.y=e.offsetY;mouse.down=true;
  const w=toWorld(e.offsetX,e.offsetY),p=pickAt(w);
  if(p&&p.other){mouse.hold=false;if(typeof DUEL!=='undefined'&&DUEL.state==='on'&&DUEL.foe&&p.other.id===DUEL.id){navGoal=null;player.target=DUEL.foe;player.npc=null;player.gather=null;player.repath=0;return;}selectOther(p.other);return;}
  if(p&&p.npc){navGoal=null;player.npc=p.npc;player.target=null;player.pend=null;player.gather=null;player.repath=0;mouse.hold=false;return;}
  if(p&&p.mob){navGoal=null;if(typeof selOther!=='undefined')selOther=null;player.target=p.mob;player.npc=null;player.gather=null;player.repath=0;mouse.hold=false;return;}
  if(p&&p.herb){navGoal=null;player.gather=p.herb;player.target=null;player.npc=null;player.repath=0;mouse.hold=false;return;}
  groundMove(w.x,w.y);mouse.hold=true;mouse.holdT=0.2;});
addEventListener('mouseup',()=>{mouse.down=false;mouse.hold=false;});
cv.addEventListener('mousemove',e=>{mouse.x=e.offsetX;mouse.y=e.offsetY;if(!started)return;const p=pickAt(toWorld(e.offsetX,e.offsetY));cv.style.cursor=p?(p.mob?'crosshair':'pointer'):'default';});
cv.addEventListener('contextmenu',e=>e.preventDefault());
function openPlayerDlg(o){const S=SECTS[o.sect],E=S&&EL[S.el];sfx('click');
  let html=`<b style="color:#8fd8ff;font-size:16px">${esc(o.name)}</b> · Cấp ${o.lv|0}<br>${S?`<span style="color:${S.color}">${S.name}</span> · ${S.role} · Hệ <b style="color:${E.c}">${E.n}</b>`:''}`;
  if(S){const me=SECTS[player.sect].el,m1=elMul(me,S.el),m2=elMul(S.el,me);html+=`<br><span style="color:#bbb">${m1>1?'Phái của bạn khắc phái này.':m2>1?'Phái này khắc phái của bạn.':'Hai phái không khắc nhau.'}</span>`;}
  const btns=[];
  if(isMate(o.id))html+='<br><br><span style="color:#9fffb0">Đang cùng tổ đội với bạn.</span>';
  else btns.push({t:'Mời vào tổ đội',fn:()=>{netInvite(o);closeDlg();}});
  btns.push({t:'Thách đấu tỷ thí',fn:()=>{duelInvite(o);closeDlg();}});
  html+='<br><span style="color:#999;font-size:12px">Tỷ thí: ai hết máu trước thì thua, không mất kinh nghiệm hay đồ. Cần cấp 10 trở lên.</span>';
  openDlg('Người chơi',html,btns);}
const tpos=t=>{const r=cv.getBoundingClientRect();return{offsetX:t.clientX-r.left,offsetY:t.clientY-r.top};};
cv.addEventListener('touchstart',e=>{e.preventDefault();auInit();const p=tpos(e.changedTouches[0]);cv.dispatchEvent(new MouseEvent('mousedown',{button:0,clientX:e.changedTouches[0].clientX,clientY:e.changedTouches[0].clientY}));mouse.x=p.offsetX;mouse.y=p.offsetY;},{passive:false});
cv.addEventListener('touchmove',e=>{e.preventDefault();const p=tpos(e.changedTouches[0]);mouse.x=p.offsetX;mouse.y=p.offsetY;},{passive:false});
cv.addEventListener('touchend',e=>{e.preventDefault();mouse.down=false;mouse.hold=false;},{passive:false});
$('mini').addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];$('mini').dispatchEvent(new MouseEvent('mousedown',{clientX:t.clientX,clientY:t.clientY}));},{passive:false});
$('bigMap').addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];$('bigMap').dispatchEvent(new MouseEvent('mousedown',{clientX:t.clientX,clientY:t.clientY}));},{passive:false});
$('mini').addEventListener('mousedown',e=>{if(!started||player.dead)return;const r=$('mini').getBoundingClientRect();groundMove((e.clientX-r.left)/r.width*MW*T,(e.clientY-r.top)/r.height*MH*T);});
$('quest').onclick=()=>{sfx('click');questNav();};
$('btnChar').onclick=()=>openPanel('panelChar');$('btnBag').onclick=()=>openPanel('panelBag');$('btnMap').onclick=()=>openPanel('panelMap');$('btnSet').onclick=()=>openPanel('panelSet');$('btnHelp').onclick=()=>openPanel('panelHelp');
$('miniBig').onclick=()=>openPanel('panelMap');
$('portrait').onclick=()=>openPanel('panelChar');$('pname').onclick=()=>openPanel('panelChar');
document.querySelectorAll('.close').forEach(b=>b.onclick=()=>{b.parentElement.hidden=true;$('tip').hidden=true;sfx('click');});
$('sellJunkBtn').onclick=sellJunk;$('sellModeBtn').onclick=()=>{bagSellMode=!bagSellMode;bagSel=null;sfx('click');renderBag();};
$('optMusic').onchange=e=>{auSet('music',e.target.checked);save();};$('optSfx').onchange=e=>{auSet('sfx',e.target.checked);save();};
$('resetBtn').onclick=()=>{if(!resetArm){resetArm=true;$('resetBtn').textContent='Bấm lần nữa để XÓA toàn bộ tiến trình';return;}removeEventListener('beforeunload',save);localStorage.removeItem(SKEY);location.reload();};
$('reviveBtn').onclick=revive;
addEventListener('keydown',e=>{if(!started||e.target.tagName==='INPUT')return;const k=e.key.toLowerCase();
  if(k>='1'&&k<='6')trySkill(+k-1);else if(k==='7')usePot('hp');else if(k==='8')usePot('mp');else if(k==='z')toggleAuto();else if(k==='f'){setFly(!player.flying);player.navFly=false;}
  else if(k==='c')openPanel('panelChar');else if(k==='b')openPanel('panelBag');else if(k==='m')openPanel('panelMap');else if(k==='escape'){closeDlg();PANELS.forEach(p=>$(p).hidden=true);}});

// ===================== VẼ THẾ GIỚI =====================
function drawShadow(x,y,w,a=0.3){const g=ctx.createRadialGradient(x,y,1,x,y,w);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,w,w*0.4,0,0,Math.PI*2);ctx.fill();}
function hpBar(x,y,w,frac,col){ctx.fillStyle='rgba(0,0,0,.7)';ctx.beginPath();ctx.roundRect(x-w/2-1,y-1,w+2,5,2);ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x-w/2,y,w*Math.max(0,frac),3,1.5);ctx.fill();}
function drawMob(m){if(m.isFoe)return; // đối thủ tỷ thí được vẽ như người chơi khác
  const t=m.t,sel=player.target===m,s=t.scale||1;
  if(m.dead){if(m.fade<=0)return;ctx.globalAlpha=m.fade/0.6;}
  if(sel&&!m.dead){ctx.strokeStyle='#ff4040';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(m.x,m.y,t.hw*s+4,(t.hw*s+4)*0.4,0,0,Math.PI*2);ctx.stroke();}
  if(t.boss&&m.slamT>0){const p=1-m.slamT/1.1,ic=t.bskill==='ice';ctx.fillStyle=ic?`rgba(120,210,255,${0.15+p*0.25})`:`rgba(255,40,20,${0.15+p*0.25})`;ctx.beginPath();ctx.ellipse(m.x,m.y,122*p,122*p*0.55,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=ic?'rgba(150,230,255,.9)':'rgba(255,60,30,.85)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(m.x,m.y,122,122*0.55,0,0,Math.PI*2);ctx.stroke();}
  if(m.enraged&&!m.dead){const g=ctx.createRadialGradient(m.x,m.y-40,5,m.x,m.y-40,75);g.addColorStop(0,'rgba(255,40,20,.25)');g.addColorStop(1,'rgba(255,40,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(m.x,m.y-40,75,0,Math.PI*2);ctx.fill();}
  if(m.slowT>0&&!m.dead){ctx.strokeStyle='rgba(120,210,255,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(m.x,m.y,t.hw*s,t.hw*s*0.4,0,0,Math.PI*2);ctx.stroke();}
  drawShadow(m.x,m.y,t.hw*0.85*s);
  let jy=0;if(t.boss&&m.slamT>0)jy=-Math.sin((1-m.slamT/1.1)*Math.PI)*14;
  const sink=m.dead?(0.6-m.fade)*20:0;
  drawMonsterBody(m,m.x,m.y+jy+sink,m.hitFlash>0);
  if(m.freezeT>0&&!m.dead){ctx.fillStyle='rgba(180,235,255,.45)';ctx.strokeStyle='rgba(120,200,255,.9)';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(m.x-t.hw*s,m.y-t.hh*0.95,t.hw*2*s,t.hh*0.95,4);ctx.fill();ctx.stroke();}
  ctx.globalAlpha=1;if(m.dead)return;
  const top=m.y-t.hh-8,diff=m.lv-player.lv,col=t.elite?'#d8a0ff':diff>=3?'#ff5a4a':diff<=-5?'#9a9a9a':t.boss?'#ff9a3d':'#ffffff';
  const ly=top-(sel||m.hp<m.maxhp?6:0);label(`${t.name} · Cấp ${m.lv}`,m.x,ly,col,t.boss?12:10);
  if(t.el){ctx.font=`bold ${t.boss?12:10}px "Segoe UI",Arial`;const tw=ctx.measureText(`${t.name} · Cấp ${m.lv}`).width;label(EL[t.el].i,m.x-tw/2-8,ly,EL[t.el].c,t.boss?12:10);}
  if(m.stunT>0)for(let k=0;k<3;k++){const a=nowT*5+k*2.1;label('★',m.x+Math.cos(a)*12,ly-12+Math.sin(a)*3,'#ffe27a',9);}
  if(m.markT>0)label('☾',m.x,ly-14,'#c8a0ff',12);
  if(sel||m.hp<m.maxhp)hpBar(m.x,top,t.boss?64:36,m.hp/m.maxhp,t.boss?'#ff5a2a':'#e0402a');}
function drawPlayer(){const p=player;
  if(marker){const a=1-marker.t/0.6;ctx.strokeStyle=`rgba(255,230,120,${a})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(marker.x,marker.y,6+marker.t*20,(6+marker.t*20)*0.45,0,0,Math.PI*2);ctx.stroke();}
  if(auto){ctx.strokeStyle=`rgba(95,224,122,${0.5+0.3*Math.sin(nowT*6)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y,22,8.5,0,0,Math.PI*2);ctx.stroke();}
  if(p.dead){drawShadow(p.x,p.y,13);ctx.save();ctx.translate(p.x+20,p.y-6);ctx.rotate(Math.PI/2);ctx.globalAlpha=0.75;drawChibi(playerLook,0,0,1,'side',1,false,0,false,playerW,0.3);ctx.restore();return;}
  const fy=p.flying?-16-Math.sin(nowT*3)*3:0;
  drawShadow(p.x,p.y,p.flying?10:13,p.flying?0.18:0.32);
  const ag=ctx.createRadialGradient(p.x,p.y-4+fy,2,p.x,p.y-4+fy,28);ag.addColorStop(0,'rgba(170,215,255,.3)');ag.addColorStop(1,'rgba(170,215,255,0)');ctx.fillStyle=ag;ctx.beginPath();ctx.ellipse(p.x,p.y-4+fy,28,13,0,0,Math.PI*2);ctx.fill();
  if(p.flying)drawFlySword(p.x,p.y+fy+1,p.dir==='side'?p.face:1,playerW.type==='sword'?playerW.col:'#bfe0ff',playerW.glow||'#9fd3ff');
  const rideM=p.riding&&typeof MOUNTS!=='undefined'&&MOUNTS[p.mount];let rdy=0;if(rideM){drawSteed(p.mount,p.x,p.y,p.face,p.moving,0);rdy=rideM.kind==='crane'?-40:-24;}
  const stl=p.buffs.some(b=>b.id==='stealth');if(stl){ctx.save();ctx.globalAlpha=0.42;}
  drawChibi(playerLook,p.x,p.y+fy+rdy,1,rideM?'side':(p.dir||'down'),p.face,p.moving&&!p.flying&&!rideM,p.atkAnim,p.hitFlash>0,Object.assign({},playerW,{style:p.combo||0}),0.3);
  if(stl)ctx.restore();
  for(const b of p.buffs){
    if(b.id==='shield'){ctx.save();ctx.globalAlpha=0.35+0.1*Math.sin(nowT*5);const g=ctx.createRadialGradient(p.x,p.y-28+fy,8,p.x,p.y-28+fy,34);g.addColorStop(0,'rgba(255,230,140,0)');g.addColorStop(1,'rgba(255,220,120,.7)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y-28+fy,34,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=0.8;for(let k=0;k<4;k++){const a=nowT*2+k*Math.PI/2;drawWeapon({type:'sword',len:12,col:'#fff0b0',glow:'#ffd060'},p.x+Math.cos(a)*30,p.y-26+fy+Math.sin(a)*10,a+Math.PI/2);}ctx.restore();}
    if(b.id==='fury'&&Math.random()<0.6)fx.push({k:'p',x:p.x+rnd(-12,12),y:p.y+fy-rnd(0,40),vx:0,vy:-60,col:Math.random()<.5?'#ffcf40':'#ff6a2a',t:0,life:0.5,sz:2.2});
    if(b.id==='wood'&&Math.random()<0.3)fx.push({k:'p',x:p.x+rnd(-14,14),y:p.y+fy-rnd(0,10),vx:rnd(-8,8),vy:-35,col:Math.random()<.5?'#9fff8a':'#5ad04a',t:0,life:0.8,sz:2.2});
    if((b.id==='rock'||b.id==='diamond')){ctx.save();ctx.globalAlpha=0.3+0.1*Math.sin(nowT*4);ctx.strokeStyle=b.id==='diamond'?'#fff0a0':'#e8c070';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p.x,p.y-26+fy,24,34,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
    if(b.id==='hot'&&Math.random()<0.25)fx.push({k:'p',x:p.x+rnd(-12,12),y:p.y+fy-rnd(0,40),vx:0,vy:-30,col:'#9fffb0',t:0,life:0.7,sz:2});}
  for(let i=0;i<6;i++){const q=(nowT*0.5+i/6)%1,mx=p.x+Math.sin(i*2.3+nowT*1.5)*15,my=p.y-4+fy-q*58;ctx.globalAlpha=Math.sin(q*Math.PI)*0.85;ctx.fillStyle=i%2?'#cfeaff':'#fff6c8';ctx.beginPath();ctx.arc(mx,my,1.4,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  label((typeof isGM==='function'&&isGM()?'[GM] ':'')+p.name+(wRef()?` · +${wRef()}`:''),p.x,p.y-68+fy+rdy,typeof isGM==='function'&&isGM()?'#ffd23f':'#9fffb0',11);
  if(p.stunT>0)for(let k=0;k<3;k++){const a=nowT*5+k*2.1;label('★',p.x+Math.cos(a)*12,p.y-80+fy+Math.sin(a)*3,'#ffe27a',9);}
  if(p.channel>0){hpBar(p.x,p.y-84,44,p.channel/1.5,'#7fffc8');label('Đang hái...',p.x,p.y-90,'#bfffe0',10);}}
function drawNpc(n){drawShadow(n.x,n.y,12);const L=NPC_LOOK[n.look];drawChibi(L,n.x,n.y,1,'down',1,false,0,false,null,n.x*0.01);
  const top=n.y-66*(L.scale||1)-(L.hat?6:0);label(n.name,n.x,top,'#ffd77a',11);
  const q=curQ();if(q&&q.giver===n.id){const done=qDone()||q.type==='talk';label(done?'?':'!',n.x,top-16+Math.sin(nowT*4)*2,done?'#7dff9a':'#ffd23f',22);}}
function drawTree(tr,withEnt){const sk=Math.sin(nowT*1.3+tr.ph)*0.035,behind=withEnt&&Math.abs(player.x-tr.x)<24&&player.y<tr.y-4&&player.y>tr.y-60;
  ctx.save();ctx.translate(tr.x,tr.y);ctx.transform(1,0,sk,1,0,0);if(behind)ctx.globalAlpha=0.5;blit(tr.spr,0,0);ctx.restore();}
const clouds=[{x:200,y:300,r:260},{x:1100,y:900,r:320},{x:1700,y:400,r:240},{x:600,y:1300,r:300}];
const parts2=[];for(let i=0;i<50;i++)parts2.push({x:Math.random()*2000,y:Math.random()*1200,vx:rnd(-20,-6),vy:rnd(14,34),rot:rnd(0,6),vr:rnd(-2,2),s:rnd(2,4.2),ph:rnd(0,6)});
function drawWeather(dt,kind){
  for(const p of parts2){
    if(kind==='snow'){p.x+=(Math.sin(nowT+p.ph)*16-6)*dt;p.y+=p.vy*1.2*dt;}
    else if(kind==='ember'){p.x+=(p.vx*0.5+Math.sin(nowT+p.ph)*10)*dt;p.y-=p.vy*0.8*dt;}
    else if(kind==='firefly'){p.x+=Math.sin(nowT*0.7+p.ph)*20*dt;p.y+=Math.cos(nowT*0.5+p.ph*2)*16*dt;}
    else if(kind==='sand'){p.x+=(60+p.vy*2)*dt;p.y+=Math.sin(nowT+p.ph)*8*dt;}
    else if(kind==='spirit'){p.x+=Math.sin(nowT*0.4+p.ph)*10*dt;p.y-=p.vy*0.5*dt;}
    else{p.x+=(p.vx+Math.sin(nowT+p.ph)*12)*dt;p.y+=p.vy*dt;}
    p.rot+=p.vr*dt;if(p.y>VH+10)p.y=-10;if(p.y<-10)p.y=VH+10;if(p.x<-10)p.x=VW+10;if(p.x>VW+10)p.x=-10;
    ctx.save();ctx.translate(p.x,p.y);
    if(kind==='snow'){ctx.globalAlpha=0.85;ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(0,0,p.s*0.7,0,Math.PI*2);ctx.fill();}
    else if(kind==='firefly'||kind==='spirit'){const a=0.4+0.6*Math.abs(Math.sin(nowT*2+p.ph*3)),col=kind==='spirit'?'200,150,255':'230,255,150';const g=ctx.createRadialGradient(0,0,0.5,0,0,7);g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();}
    else if(kind==='sand'){ctx.globalAlpha=0.35;ctx.fillStyle='#f0d8a0';ctx.fillRect(0,0,p.s*3,1);}
    else if(kind==='glow'){const a=0.3+0.5*Math.abs(Math.sin(nowT+p.ph));ctx.fillStyle=`rgba(255,240,180,${a})`;ctx.beginPath();ctx.arc(0,0,p.s*0.6,0,Math.PI*2);ctx.fill();}
    else{ctx.rotate(p.rot);ctx.globalAlpha=0.75;ctx.fillStyle=kind==='ember'?(p.ph>3?'#ffb040':'#ff6a2a'):(p.ph>3?'#ffd0e0':'#ffb0cc');ctx.beginPath();ctx.ellipse(0,0,p.s*(kind==='ember'?0.6:1),p.s*(kind==='ember'?0.6:0.55),0,0,Math.PI*2);ctx.fill();}
    ctx.restore();}
  ctx.globalAlpha=1;}
function drawWorld(dt,cx,cy,withEnt){
  const vw=VW/Z,vh=VH/Z;let sx=0,sy=0;if(withEnt&&shakeT>0){sx=rnd(-4,4);sy=rnd(-4,4);}
  ctx.setTransform(Z*DPR,0,0,Z*DPR,Math.round((-cx+sx)*Z*DPR),Math.round((-cy+sy)*Z*DPR));
  ctx.imageSmoothingEnabled=true;ctx.drawImage(mapCv,0,0,MW*T,MH*T);
  const tx0=Math.max(0,Math.floor(cx/T)),ty0=Math.max(0,Math.floor(cy/T)),tx1=Math.min(MW-1,Math.ceil((cx+vw)/T)),ty1=Math.min(MH-1,Math.ceil((cy+vh)/T));
  ctx.strokeStyle='rgba(225,240,255,.5)';ctx.lineWidth=1.2;ctx.lineCap='round';
  for(let y=ty0;y<=ty1;y++)for(let x=tx0;x<=tx1;x++){if(getT(x,y)!==WA)continue;const ph=(nowT*0.8+x*0.37+y*0.71)%1,px=x*T+6+((x*7+y*13)%14),py=y*T+8+((x*11+y*5)%14)-ph*4;
    ctx.globalAlpha=Math.sin(ph*Math.PI)*0.7;ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(px+4,py-2.5,px+9,py);ctx.stroke();}ctx.globalAlpha=1;
  for(const [fx_,fy_] of TORCHES){const X=fx_*T+16,Y=fy_*T+16;ctx.fillStyle='#5a3518';ctx.fillRect(X-2,Y-18,4,18);
    ctx.fillStyle=`rgba(255,${140+Math.random()*60|0},40,.9)`;ctx.beginPath();ctx.ellipse(X,Y-22,4+Math.random()*2,7+Math.random()*2,0,0,Math.PI*2);ctx.fill();
    const g=ctx.createRadialGradient(X,Y-20,2,X,Y-20,46);g.addColorStop(0,'rgba(255,150,50,.25)');g.addColorStop(1,'rgba(255,150,50,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(X,Y-20,46,0,Math.PI*2);ctx.fill();}
  for(const [lx,ly] of LIGHTS){const X=lx*T,Y=ly*T-10,a=0.16+0.04*Math.sin(nowT*3+lx);const g=ctx.createRadialGradient(X,Y,1,X,Y,34);g.addColorStop(0,`rgba(255,210,120,${a*2})`);g.addColorStop(1,'rgba(255,210,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(X,Y,34,0,Math.PI*2);ctx.fill();}
  for(const p of CM.portals)drawPortal(p,withEnt&&player.lv<p.minLv);
  if(withEnt){for(const f of fx)if(f.k==='fire'||f.k==='ice'||f.k==='r'&&f.w===2)drawFx(f);for(const h of herbs)drawHerb(h);}
  const list=[];
  for(const tr of TREES)if(tr.x>cx-40&&tr.x<cx+vw+40&&tr.y>cy-10&&tr.y<cy+vh+90)list.push({y:tr.y,f:()=>drawTree(tr,withEnt)});
  for(const h of HOUSES_D)list.push({y:h.base,f:()=>{const behind=withEnt&&player.x>h.x-6&&player.x<h.x+102&&player.y<h.base&&player.y>h.y-30;if(behind)ctx.globalAlpha=0.55;blit(HOUSE_SPR,h.x,h.y);ctx.globalAlpha=1;}});
  if(withEnt){for(const m of mobs)if(!m.dead||m.fade>0)list.push({y:m.y,f:()=>drawMob(m)});
    for(const n of npcs)list.push({y:n.y,f:()=>drawNpc(n)});list.push({y:player.y,f:drawPlayer});if(typeof drawOthers==='function')drawOthers(list);if(typeof drawPet==='function')drawPet(list);}
  list.sort((a,b)=>a.y-b.y);for(const e of list)e.f();
  if(withEnt){for(const s of shots)drawShot(s);for(const s of eshots)drawShot(s);for(const f of fx)if(!(f.k==='fire'||f.k==='ice'||f.k==='r'&&f.w===2))drawFx(f);}
  for(const c of clouds){c.x+=8*dt;if(c.x-c.r>MW*T)c.x=-c.r;const g=ctx.createRadialGradient(c.x,c.y,c.r*0.2,c.x,c.y,c.r);g.addColorStop(0,'rgba(10,20,40,.10)');g.addColorStop(1,'rgba(10,20,40,0)');ctx.fillStyle=g;ctx.fillRect(c.x-c.r,c.y-c.r,c.r*2,c.r*2);}
  ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle=TH.tint;ctx.fillRect(0,0,VW,VH);
  drawWeather(dt,withEnt&&inArenaNow()&&TH.weather!=='snow'?'ember':TH.weather);
  ctx.drawImage(vignette,0,0,VW,VH);}
function draw(dt){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0b0b0b';ctx.fillRect(0,0,cv.width,cv.height);
  const vw=VW/Z,vh=VH/Z;
  cam.x=MW*T<vw?(MW*T-vw)/2:clamp(player.x-vw/2,0,MW*T-vw);
  cam.y=MH*T<vh?(MH*T-vh)/2:clamp(player.y-vh/2,0,MH*T-vh);
  drawWorld(dt,cam.x,cam.y,true);
  if(fadeT>0){ctx.fillStyle=`rgba(255,255,255,${Math.min(1,fadeT/0.7)*0.85})`;ctx.fillRect(0,0,VW,VH);}
  drawMini();}
const mctx=$('mini').getContext('2d');
function drawMini(){mctx.drawImage(miniBase,0,0);const k=192/(MW*T);
  mctx.strokeStyle='rgba(255,255,255,.7)';mctx.lineWidth=1;mctx.strokeRect(cam.x*k+0.5,cam.y*k+0.5,VW/Z*k,VH/Z*k);
  for(const h of herbs)if(!h.dead){mctx.fillStyle='#7fffc8';mctx.fillRect(h.x*k-1,h.y*k-1,2,2);}
  for(const m of mobs){if(m.dead)continue;mctx.fillStyle=m.t.boss?'#ff2020':'#ff7060';const s=m.t.boss?5:2;mctx.fillRect(m.x*k-s/2,m.y*k-s/2,s,s);}
  for(const p of CM.portals){mctx.strokeStyle=player.lv>=p.minLv?'#8fd8ff':'#ff8a7a';mctx.lineWidth=1.5;mctx.beginPath();mctx.arc(p.x*T*k,p.y*T*k,4,0,Math.PI*2);mctx.stroke();}
  const q=curQ();for(const n of npcs){mctx.fillStyle=q&&q.giver===n.id?'#7dff9a':'#ffd23f';mctx.fillRect(n.x*k-2,n.y*k-2,4,4);}
  mctx.fillStyle='#ffffff';mctx.beginPath();mctx.arc(player.x*k,player.y*k,3,0,Math.PI*2);mctx.fill();mctx.fillStyle='#3b8fe6';mctx.beginPath();mctx.arc(player.x*k,player.y*k,1.8,0,Math.PI*2);mctx.fill();}
function drawStartBg(dt){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#000';ctx.fillRect(0,0,cv.width,cv.height);
  const vw=VW/Z,vh=VH/Z,span=Math.max(1,MW*T-vw),cx=(Math.sin(nowT*0.03)*0.5+0.5)*span,cy=clamp(MH*T*0.05,0,Math.max(0,MH*T-vh));
  drawWorld(dt,cx,cy,false);
  ctx.setTransform(DPR,0,0,DPR,0,0);const g=ctx.createLinearGradient(0,0,0,VH);g.addColorStop(0,'rgba(20,10,40,.4)');g.addColorStop(1,'rgba(10,5,20,.72)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  drawCreatePreview();}

// ===================== VÒNG LẶP =====================
loadMap('trukhe');
showStart();
let last=performance.now();
let lastLoopWall=Date.now(),bgLast=Date.now();
setInterval(()=>{const now=Date.now();
  if(now-lastLoopWall>1500){const el=Math.min(120,(now-bgLast)/1000);bgLast=now;
    if(started){let t=el;try{while(t>0){const s=Math.min(0.05,t);update(s);t-=s;}}catch(e){}}
    if(typeof netTick==='function')netTick(el);}
  else bgLast=now;},1000);
function loop(now){lastLoopWall=Date.now();bgLast=Date.now();const real=Math.max(0,Math.min(3,(now-last)/1000)),dt=Math.min(0.05,real);last=now;
  // khung hình thưa (cửa sổ bị che): vẫn tính đủ thời gian thật theo từng bước nhỏ
  if(started){let t=real;while(t>0.0001){const s=Math.min(0.05,t);update(s);t-=s;}draw(dt);}else{nowT+=dt;drawStartBg(dt);}
  if(typeof netTick==='function')netTick(real);
  requestAnimationFrame(loop);}
requestAnimationFrame(loop);
