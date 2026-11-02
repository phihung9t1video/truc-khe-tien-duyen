'use strict';
// ===================== TU LUYỆN: CHÂN NGUYÊN & THẦN ĐỈNH =====================
// Chân Nguyên: 6 ô (mỗi loại một ô, mở dần theo cấp). Săn quái/trùm hoặc mua ở Cửa hàng. Tu luyện bằng kinh nghiệm + lượng.
//   Hấp thu Chân Nguyên thừa cùng loại để lên cấp nhanh. Thay viên phẩm cao hơn thì cấp đã tu được giữ lại.
// Thần Đỉnh: đặt 1 đỉnh, tăng % công lực / phòng thủ / sinh lực và % kinh nghiệm, % lượng. Trùm rơi hoặc mua ở Cửa hàng.
const CN_TYPES={
  cuong:{n:'Cương Nguyên',st:'atk',per:2.5,col:'#ff6a4a',unlock:20,desc:'Công lực'},
  ho:{n:'Hộ Nguyên',st:'def',per:1.6,col:'#6aa8ff',unlock:20,desc:'Phòng thủ'},
  sinh:{n:'Sinh Nguyên',st:'hp',per:26,col:'#5ae07a',unlock:40,desc:'Sinh lực'},
  linh:{n:'Linh Nguyên',st:'mp',per:16,col:'#5ad8ff',unlock:60,desc:'Nội lực'},
  bao:{n:'Bạo Nguyên',st:'crit',per:0.0006,col:'#ffd040',unlock:80,desc:'Bạo kích'},
  tan:{n:'Tấn Nguyên',st:'spd',per:0.0008,col:'#d890ff',unlock:100,desc:'Tốc độ'}};
const CN_KEYS=Object.keys(CN_TYPES);
const CN_Q=[{n:'Phàm',c:'#e6e6e6'},{n:'Linh',c:'#72e872'},{n:'Huyền',c:'#5cb4ff'},{n:'Địa',c:'#ffb340'},{n:'Thiên',c:'#ff4a8a'}];
const cnMax=q=>60+q*10,cnMul=q=>1+q*0.5;
const cnVal=c=>CN_TYPES[c.k].per*cnMul(c.q)*c.lv;
const cnCost=c=>({exp:Math.round(1800*Math.pow(c.lv,1.6)*(1+c.q*0.3)),gold:Math.round(400*Math.pow(c.lv,1.4)*(1+c.q*0.3))});
const cnName=c=>`${CN_Q[c.q].n} phẩm ${CN_TYPES[c.k].n}`;
const TD_LIST=[
  {n:'Thanh Đồng Đỉnh',lv:30,col:'#5aa88a',price:60000},{n:'Bạch Ngân Đỉnh',lv:50,col:'#d8e0ea',price:250000},
  {n:'Hoàng Kim Đỉnh',lv:70,col:'#ffc840',price:800000},{n:'Tử Ngọc Đỉnh',lv:90,col:'#c88aff',price:2000000},
  {n:'Huyền Thiết Đỉnh',lv:110,col:'#6a7a9a',price:4000000},{n:'Cửu Long Đỉnh',lv:130,col:'#ff6a4a',price:7000000},
  {n:'Hỗn Nguyên Đỉnh',lv:160,col:'#8a5aff',price:12000000},{n:'Thái Cổ Thần Đỉnh',lv:190,col:'#ffe27a',price:20000000}];
const tdMax=g=>50+g*10,tdPct=d=>(0.0015+d.g*0.0005)*d.lv,tdExp=d=>0.02+d.g*0.02+d.lv*0.0005;
const tdCost=d=>({exp:Math.round(4500*Math.pow(d.lv,1.7)*(1+d.g*0.4)),gold:Math.round(1500*Math.pow(d.lv,1.5)*(1+d.g*0.4))});
function cnData(){if(!player.cn||!player.cn.slots)player.cn={slots:{},bag:[]};return player.cn;}
function tdData(){if(!player.td||!Array.isArray(player.td.bag))player.td={cur:null,bag:[]};return player.td;}
let cnUid=1;const newCN=(k,q)=>({u:Date.now()%1e9+(cnUid++),k,q,lv:1});
// ---------- chỉ số ----------
function tlBonus(){const r={atk:0,def:0,hp:0,mp:0,crit:0,spd:0,pct:0,xp:0};if(!player.sect)return r;
  const C=cnData();for(const k of CN_KEYS){const c=C.slots[k];if(c&&player.lv>=CN_TYPES[k].unlock)r[CN_TYPES[k].st]+=cnVal(c);}
  const d=tdData().cur;if(d){r.pct=tdPct(d);r.xp=tdExp(d);}return r;}
const _statsTL=stats;
stats=function(){const s=_statsTL();if(!player.sect)return s;const b=tlBonus(),sp0=s.spd;
  s.atk=Math.round((s.atk+b.atk)*(1+b.pct));s.def=Math.round((s.def+b.def)*(1+b.pct));s.maxhp=Math.round((s.maxhp+b.hp)*(1+b.pct));s.maxmp=Math.round(s.maxmp+b.mp);
  s.crit+=b.crit;if(b.spd){s.spd+=b.spd;s.move*=(1+s.spd)/(1+sp0);}return s;};
const tdExpMul=()=>1+(tdData().cur?tdExp(tdData().cur):0);
// ---------- nhận được ----------
function rollCNq(bonus){const r=Math.random()-(bonus||0);return r<0.01?4:r<0.05?3:r<0.15?2:r<0.4?1:0;}
function giveCN(c,how){const C=cnData();
  const cur=C.slots[c.k];if(!cur&&player.lv>=CN_TYPES[c.k].unlock){C.slots[c.k]=c;}else C.bag.push(c);
  if(C.bag.length>40){C.bag.sort((a,b)=>a.q-b.q);const x=C.bag.shift();player.gold+=cnSell(x);}
  toast(`${how||'Nhận'} ${cnName(c)}`,CN_Q[c.q].c);log(`${how||'Nhận được'} ${cnName(c)}`,CN_Q[c.q].c);if(auto)tlAuto();if(!$('panelChar').hidden)renderTL();}
function giveTD(g,how){const D=tdData(),d={u:Date.now()%1e9+(cnUid++),g,lv:1};
  if(!D.cur)D.cur=d;else if(g>D.cur.g&&player.lv>=TD_LIST[g].lv){d.lv=Math.min(tdMax(g),D.cur.lv);D.bag.push(Object.assign(D.cur,{lv:1}));D.cur=d;}else D.bag.push(d);
  toast(`${how||'Nhận'} ${TD_LIST[g].n}`,TD_LIST[g].col);log(`${how||'Nhận được'} ${TD_LIST[g].n}`,TD_LIST[g].col);if(auto)tlAuto();if(!$('panelChar').hidden)renderTL();}
const cnSell=c=>Math.round(500*(1+c.q*c.q*2)*(1+player.lv/40));
const tdSell=d=>Math.round(TD_LIST[d.g].price*0.2);
// rơi khi hạ quái (hook vào phần thưởng của quái)
function tlOnKill(m){if(player.lv<20||m.summoned)return;const t=m.t,lvM=t.lv?t.lv[0]:1,bonus=Math.min(0.06,lvM/3000)+(t.elite?0.03:0)+(t.boss?0.08:0);
  if(Math.random()<(t.boss?0.35:t.elite?0.02:0.006))giveCN(newCN(CN_KEYS[rint(0,CN_KEYS.length-1)],rollCNq(bonus)),`${t.name} rơi`);
  if(t.boss&&player.lv>=30&&Math.random()<0.05){let g=0;for(let i=0;i<TD_LIST.length;i++)if(lvM>=TD_LIST[i].lv-10)g=i;giveTD(g,`${t.name} rơi`);}}
// ---------- tu luyện ----------
function cnTrain(k,times){const c=cnData().slots[k];if(!c)return;let n=0;
  for(let i=0;i<times;i++){if(c.lv>=cnMax(c.q))break;const co=cnCost(c);if(player.exp<co.exp){if(!n)log(`Không đủ kinh nghiệm (cần ${co.exp.toLocaleString('vi-VN')})`,'#ff9a8a');break;}
    if(player.gold<co.gold){if(!n)log(`Không đủ lượng (cần ${co.gold.toLocaleString('vi-VN')})`,'#ff9a8a');break;}player.exp-=co.exp;player.gold-=co.gold;c.lv++;n++;}
  if(n){sfx('level');addRing(player.x,player.y-20,50,CN_TYPES[k].col,0.6);log(`${CN_TYPES[k].n} tu luyện lên cấp ${c.lv}`,CN_TYPES[k].col);save();}renderTL();}
function tdTrain(times){const d=tdData().cur;if(!d)return;let n=0;
  for(let i=0;i<times;i++){if(d.lv>=tdMax(d.g))break;const co=tdCost(d);if(player.exp<co.exp){if(!n)log(`Không đủ kinh nghiệm (cần ${co.exp.toLocaleString('vi-VN')})`,'#ff9a8a');break;}
    if(player.gold<co.gold){if(!n)log(`Không đủ lượng (cần ${co.gold.toLocaleString('vi-VN')})`,'#ff9a8a');break;}player.exp-=co.exp;player.gold-=co.gold;d.lv++;n++;}
  if(n){sfx('level');addRing(player.x,player.y-20,60,TD_LIST[d.g].col,0.7);log(`${TD_LIST[d.g].n} luyện lên cấp ${d.lv}`,TD_LIST[d.g].col);save();}renderTL();}
function cnEquip(u){const C=cnData(),i=C.bag.findIndex(x=>x.u===u);if(i<0)return;const c=C.bag[i];if(player.lv<CN_TYPES[c.k].unlock)return log(`Ô ${CN_TYPES[c.k].n} mở ở cấp ${CN_TYPES[c.k].unlock}`,'#ffb36b');
  C.bag.splice(i,1);const old=C.slots[c.k];if(old){c.lv=Math.max(c.lv,Math.min(cnMax(c.q),old.lv));old.lv=1;C.bag.push(old);}C.slots[c.k]=c;sfx('equip');save();renderTL();}
function cnAbsorb(u){const C=cnData(),i=C.bag.findIndex(x=>x.u===u);if(i<0)return;const c=C.bag[i],s=C.slots[c.k];if(!s)return log('Chưa có Chân Nguyên cùng loại đang dùng','#ffb36b');
  if(s.lv>=cnMax(s.q))return log('Chân Nguyên đã đạt cấp tối đa','#ffb36b');C.bag.splice(i,1);const add=2+c.q*2;s.lv=Math.min(cnMax(s.q),s.lv+add);sfx('heal');log(`Hấp thu ${cnName(c)}: ${CN_TYPES[s.k].n} +${add} cấp`,CN_TYPES[s.k].col);save();renderTL();}
function cnSellU(u){const C=cnData(),i=C.bag.findIndex(x=>x.u===u);if(i<0)return;const g=cnSell(C.bag[i]);C.bag.splice(i,1);player.gold+=g;sfx('coin');log(`Bán Chân Nguyên được ${g.toLocaleString('vi-VN')} lượng`,'#ffd977');save();renderTL();}
function tdEquip(u){const D=tdData(),i=D.bag.findIndex(x=>x.u===u);if(i<0)return;const d=D.bag[i];if(player.lv<TD_LIST[d.g].lv)return log(`Cần cấp ${TD_LIST[d.g].lv}`,'#ffb36b');
  D.bag.splice(i,1);if(D.cur){d.lv=Math.max(d.lv,Math.min(tdMax(d.g),D.cur.lv));D.cur.lv=1;D.bag.push(D.cur);}D.cur=d;sfx('equip');save();renderTL();}
function tdSellU(u){const D=tdData(),i=D.bag.findIndex(x=>x.u===u);if(i<0)return;const g=tdSell(D.bag[i]);D.bag.splice(i,1);player.gold+=g;sfx('coin');log(`Bán Thần Đỉnh được ${g.toLocaleString('vi-VN')} lượng`,'#ffd977');save();renderTL();}
// tự động: tự dùng viên/đỉnh tốt hơn khi đang chạy tự động
function tlAuto(){const C=cnData();for(const c of [...C.bag]){const s=C.slots[c.k];if(player.lv>=CN_TYPES[c.k].unlock&&(!s||c.q>s.q))cnEquip(c.u);}
  const D=tdData();for(const d of [...D.bag])if(player.lv>=TD_LIST[d.g].lv&&(!D.cur||d.g>D.cur.g))tdEquip(d.u);}
// ---------- hình ----------
function cnIcon(k,q,sz){const T_=CN_TYPES[k],c=T_.col,s=sz||40;return`<span class="itile r${q}" style="width:${s}px;height:${s}px"><svg viewBox="0 0 48 48"><defs><radialGradient id="cn_${k}" cx=".38" cy=".32" r=".7"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${c}"/><stop offset="1" stop-color="${shadeHex(c,-.6)}"/></radialGradient></defs>
  <circle cx="24" cy="24" r="17" fill="${c}" opacity=".25"/><circle cx="24" cy="24" r="12.5" fill="url(#cn_${k})" stroke="${shadeHex(c,-.5)}" stroke-width="1"/>
  <ellipse cx="24" cy="24" rx="19" ry="6" fill="none" stroke="${CN_Q[q].c}" stroke-width="1.4" transform="rotate(-25 24 24)"/><circle cx="19.5" cy="19" r="3" fill="#fff" opacity=".8"/>
  ${q>=3?'<path d="M39 5l1.3 3.4L43.7 9.7 40.3 11 39 14.4 37.7 11 34.3 9.7 37.7 8.4Z" fill="#fff"/>':''}</svg></span>`;}
function tdIcon(g,sz){const c=TD_LIST[g].col,s=sz||40,q=Math.min(4,Math.floor(g/2)+(g>=6?1:0));return`<span class="itile r${q}${g>=7?' god':''}" style="width:${s}px;height:${s}px"><svg viewBox="0 0 48 48">
  <defs><linearGradient id="td_${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shadeHex(c,.5)}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${shadeHex(c,-.55)}"/></linearGradient></defs>
  <path d="M14 18q10-5 20 0" fill="none" stroke="${shadeHex(c,-.4)}" stroke-width="3"/><path d="M12 13v6M36 13v6" stroke="url(#td_${g})" stroke-width="3" stroke-linecap="round"/>
  <path d="M8 19h32l-3 15q-1 4-5 4H16q-4 0-5-4Z" fill="url(#td_${g})" stroke="${shadeHex(c,-.6)}" stroke-width="1.1"/>
  <path d="M12 25h24M13 30h22" stroke="${shadeHex(c,-.45)}" stroke-width="1" opacity=".7"/><circle cx="24" cy="27.5" r="3.2" fill="${shadeHex(c,.6)}" stroke="${shadeHex(c,-.5)}" stroke-width=".8"/>
  <path d="M15 38l-2 6M33 38l2 6M24 38v6" stroke="${shadeHex(c,-.4)}" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M18 16q1-6 4-8M24 15q0-7 3-10M30 16q1-5 3-7" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.3" stroke-linecap="round"/></svg></span>`;}
// ---------- giao diện: 3 tab dưới bảng Nhân vật ----------
let charTab='eq';
(()=>{const P=$('panelChar');const kids=[...P.children].filter(e=>!e.classList.contains('close')&&e.tagName!=='H3'&&e.id!=='charTop');
  const eq=document.createElement('div');eq.id='chEq';kids.forEach(k=>eq.appendChild(k));P.appendChild(eq);
  const cn=document.createElement('div');cn.id='chCN';cn.hidden=true;P.appendChild(cn);const td=document.createElement('div');td.id='chTD';td.hidden=true;P.appendChild(td);
  const bar=document.createElement('div');bar.id='chTabs';bar.innerHTML='<button data-ct="eq">Trang bị</button><button data-ct="cn">Chân Nguyên</button><button data-ct="td">Thần Đỉnh</button>';P.appendChild(bar);
  bar.querySelectorAll('button').forEach(b=>b.onclick=()=>{charTab=b.dataset.ct;sfx('click');$('tip').hidden=true;renderChar(true);});
  const st=document.createElement('style');st.textContent=`#chTabs{display:flex;gap:6px;margin-top:10px;border-top:1px solid rgba(232,198,106,.25);padding-top:8px}#chTabs button{flex:1;padding:8px 4px;border-radius:8px;border:1px solid #6a5634;background:linear-gradient(#3a2e22,#241c14);color:#e8d6a8;font-weight:bold;cursor:pointer;font-family:inherit}
#chTabs button.sel{background:linear-gradient(#8a6a2a,#5a4218);color:#fff6d0;border-color:#ffd77a;box-shadow:0 0 8px rgba(255,215,122,.4)}
.tlwrap{max-height:60vh;overflow-y:auto}.tlsum{text-align:center;margin:4px 0 8px;color:#cfc0a0;font-size:13px}.tlsum b{color:#ffe27a}
.cngrid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.cnslot{border:1px solid #5a4a30;border-radius:10px;padding:8px;background:rgba(0,0,0,.35);text-align:center;font-size:12px;position:relative}
.cnslot.lock{opacity:.55}.cnslot .nm{font-weight:bold;margin:3px 0}.cnslot .lvb{height:5px;background:#2a2218;border-radius:3px;margin:4px 0;overflow:hidden}.cnslot .lvb i{display:block;height:100%;background:linear-gradient(90deg,#ffb340,#ffe27a)}
.cnslot button,.tdbox button,.cnbag button{padding:4px 8px;margin:2px;border-radius:6px;border:1px solid #6a5634;background:linear-gradient(#4a3a26,#2e2416);color:#ffe9b0;cursor:pointer;font-size:12px;font-family:inherit}
.cnslot button:disabled{opacity:.4;cursor:default}.cncost{color:#aaa;font-size:11px}
.cnbag{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:6px}.cnbag>div{display:flex;align-items:center;gap:6px;border:1px solid #4a3e2a;border-radius:8px;padding:4px;background:rgba(0,0,0,.3);font-size:12px}
.tdbox{display:flex;gap:14px;align-items:center;border:1px solid #6a5634;border-radius:12px;padding:12px;background:radial-gradient(ellipse at 20% 50%,rgba(255,215,122,.12),rgba(0,0,0,.35) 70%)}
.tdbox .big{flex:none}.tdbox .big .itile{width:96px!important;height:96px!important;border-radius:16px}`;document.head.appendChild(st);})();
const _renderCharTL=renderChar;
renderChar=function(full){const tabs=$('chTabs');if(tabs)tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('sel',b.dataset.ct===charTab));
  $('chEq').hidden=charTab!=='eq';$('chCN').hidden=charTab!=='cn';$('chTD').hidden=charTab!=='td';
  if(charTab==='eq')return _renderCharTL(full);if(full){_renderCharTL(false);renderTL();}};
function expTxt(){return`Kinh nghiệm hiện có: <b>${Math.floor(player.exp).toLocaleString('vi-VN')}</b> · Lượng: <b>${player.gold.toLocaleString('vi-VN')}</b>`;}
function renderTL(){if($('panelChar').hidden)return;if(player.lv<20){const m='<div class="tlsum" style="padding:30px">Đạt <b>cấp 20</b> để mở tu luyện Chân Nguyên và Thần Đỉnh.</div>';$('chCN').innerHTML=m;$('chTD').innerHTML=m;return;}
  if(charTab==='cn'){const C=cnData(),b=tlBonus();let h=`<div class="tlsum">${expTxt()}</div><div class="tlsum">Tổng: Công lực <b>+${Math.round(b.atk)}</b> · Phòng thủ <b>+${Math.round(b.def)}</b> · Sinh lực <b>+${Math.round(b.hp)}</b> · Nội lực <b>+${Math.round(b.mp)}</b> · Bạo kích <b>+${(b.crit*100).toFixed(1)}%</b> · Tốc độ <b>+${(b.spd*100).toFixed(1)}%</b></div><div class="tlwrap"><div class="cngrid">`;
    for(const k of CN_KEYS){const T_=CN_TYPES[k],c=C.slots[k];
      if(player.lv<T_.unlock){h+=`<div class="cnslot lock">${cnIcon(k,0,44)}<div class="nm" style="color:${T_.col}">${T_.n}</div><div>Mở ở cấp ${T_.unlock}</div></div>`;continue;}
      if(!c){h+=`<div class="cnslot">${cnIcon(k,0,44)}<div class="nm" style="color:${T_.col}">${T_.n}</div><div style="color:#999">Chưa có · tăng ${T_.desc}</div><div class="cncost">Săn quái, trùm hoặc mua ở Cửa hàng</div></div>`;continue;}
      const mx=cnMax(c.q),co=cnCost(c),v=cnVal(c),vt=T_.st==='crit'||T_.st==='spd'?(v*100).toFixed(1)+'%':Math.round(v),full=c.lv>=mx;
      h+=`<div class="cnslot" style="border-color:${CN_Q[c.q].c}88">${cnIcon(k,c.q,44)}<div class="nm" style="color:${CN_Q[c.q].c}">${cnName(c)}</div><div>Cấp <b>${c.lv}</b>/${mx} · ${T_.desc} <b style="color:#9fffb0">+${vt}</b></div>
        <div class="lvb"><i style="width:${c.lv/mx*100}%"></i></div>${full?'<div style="color:#ffd23f">Đã tu luyện tối đa</div>':`<div class="cncost">Mỗi cấp: ${co.exp.toLocaleString('vi-VN')} kinh nghiệm · ${co.gold.toLocaleString('vi-VN')} lượng</div><button data-cnt="${k}" data-n="1">Tu luyện</button><button data-cnt="${k}" data-n="10">×10</button>`}</div>`;}
    h+='</div><div style="margin-top:10px;color:#ffd77a;font-weight:bold">Chân Nguyên trong túi ('+C.bag.length+')</div>';
    h+=C.bag.length?'<div class="cnbag">'+C.bag.slice().sort((a,b)=>b.q-a.q).map(c=>`<div>${cnIcon(c.k,c.q,32)}<div style="flex:1"><b style="color:${CN_Q[c.q].c}">${cnName(c)}</b><br>Cấp ${c.lv}</div><span><button data-cne="${c.u}">Dùng</button><button data-cna="${c.u}" title="Cộng cấp cho viên cùng loại đang dùng">Hấp thu</button><button data-cns="${c.u}">Bán</button></span></div>`).join('')+'</div>':'<div style="color:#999;font-size:12px">Trống. Hạ quái (nhất là trùm, bầy tinh anh) để nhặt Chân Nguyên, hoặc mua túi Chân Nguyên ở Cửa hàng.</div>';
    h+='</div>';$('chCN').innerHTML=h;const B=$('chCN');
    B.querySelectorAll('[data-cnt]').forEach(e=>e.onclick=()=>cnTrain(e.dataset.cnt,+e.dataset.n));B.querySelectorAll('[data-cne]').forEach(e=>e.onclick=()=>cnEquip(+e.dataset.cne));
    B.querySelectorAll('[data-cna]').forEach(e=>e.onclick=()=>cnAbsorb(+e.dataset.cna));B.querySelectorAll('[data-cns]').forEach(e=>e.onclick=()=>cnSellU(+e.dataset.cns));}
  else if(charTab==='td'){const D=tdData(),d=D.cur;let h=`<div class="tlsum">${expTxt()}</div><div class="tlwrap">`;
    if(!d)h+=`<div class="tdbox"><div class="big">${tdIcon(0,96)}</div><div>Chưa có Thần Đỉnh.<br><span style="color:#aaa">Mua Thần Đỉnh ở Cửa hàng (từ cấp 30) hoặc hạ trùm để có cơ hội nhận.</span></div></div>`;
    else{const T_=TD_LIST[d.g],mx=tdMax(d.g),co=tdCost(d),full=d.lv>=mx;
      h+=`<div class="tdbox" style="border-color:${T_.col}"><div class="big">${tdIcon(d.g,96)}</div><div style="flex:1"><div style="font-size:17px;font-weight:bold;color:${T_.col}">${T_.n}</div><div>Cấp luyện <b>${d.lv}</b>/${mx}</div><div class="cnslot" style="padding:0;border:0;background:none"><div class="lvb"><i style="width:${d.lv/mx*100}%"></i></div></div>
        <div>Công lực, phòng thủ, sinh lực <b style="color:#9fffb0">+${(tdPct(d)*100).toFixed(1)}%</b></div><div>Kinh nghiệm và lượng khi hạ quái <b style="color:#9fffb0">+${(tdExp(d)*100).toFixed(1)}%</b></div>
        ${full?'<div style="color:#ffd23f">Đã luyện tối đa. Đổi sang đỉnh bậc cao hơn để luyện tiếp.</div>':`<div class="cncost">Mỗi cấp: ${co.exp.toLocaleString('vi-VN')} kinh nghiệm · ${co.gold.toLocaleString('vi-VN')} lượng</div><button data-tdt="1">Luyện đỉnh</button><button data-tdt="10">×10</button>`}</div></div>`;}
    h+=`<div style="margin-top:10px;color:#ffd77a;font-weight:bold">Thần Đỉnh trong túi (${D.bag.length})</div>`;
    h+=D.bag.length?'<div class="cnbag">'+D.bag.map(x=>`<div>${tdIcon(x.g,32)}<div style="flex:1"><b style="color:${TD_LIST[x.g].col}">${TD_LIST[x.g].n}</b><br>Cần cấp ${TD_LIST[x.g].lv}</div><span><button data-tde="${x.u}">Dùng</button><button data-tds="${x.u}">Bán</button></span></div>`).join('')+'</div>':'<div style="color:#999;font-size:12px">Trống.</div>';
    h+='<div style="color:#999;font-size:12px;margin-top:8px">Đổi sang đỉnh mới: cấp luyện được giữ lại (không vượt quá cấp tối đa của đỉnh mới).</div></div>';$('chTD').innerHTML=h;const B=$('chTD');
    B.querySelectorAll('[data-tdt]').forEach(e=>e.onclick=()=>tdTrain(+e.dataset.tdt));B.querySelectorAll('[data-tde]').forEach(e=>e.onclick=()=>tdEquip(+e.dataset.tde));B.querySelectorAll('[data-tds]').forEach(e=>e.onclick=()=>tdSellU(+e.dataset.tds));}}
// ---------- cửa hàng ----------
SHOP_ITEMS.push(
  {id:'cnbox',iconHTML:()=>cnIcon('cuong',1,42),name:'Túi Chân Nguyên',lv:20,price:20000,desc:'Cấp 20+. Nhận ngẫu nhiên 1 Chân Nguyên phẩm Phàm, Linh hoặc Huyền.',buy:()=>{const r=Math.random();giveCN(newCN(CN_KEYS[rint(0,5)],r<0.6?0:r<0.92?1:2),'Mở túi được');}},
  {id:'cnbox2',iconHTML:()=>cnIcon('bao',4,42),name:'Hộp Chân Nguyên Thượng Phẩm',lv:80,price:600000,desc:'Cấp 80+. Nhận ngẫu nhiên 1 Chân Nguyên phẩm Huyền, Địa hoặc Thiên.',buy:()=>{const r=Math.random();giveCN(newCN(CN_KEYS[rint(0,5)],r<0.65?2:r<0.93?3:4),'Mở hộp được');}},
  ...TD_LIST.map((T_,g)=>({id:'td'+g,iconHTML:()=>tdIcon(g,42),name:T_.n,lv:T_.lv,price:T_.price,desc:`Thần Đỉnh bậc ${g+1}, cần cấp ${T_.lv}. Luyện tối đa cấp ${tdMax(g)}.`,buy:()=>giveTD(g,'Mua được')})));
// ---------- móc vào game ----------
const _gainExpTL=gainExp;
gainExp=function(e){if(player.lv>=MAXLV){player.exp=Math.min(9e15,player.exp+Math.round(e*expMul()*tdExpMul()));return;}return _gainExpTL(Math.round(e*tdExpMul()));};
