'use strict';
// ===================== KHO ĐỒ & TỰ BÁN =====================
// Kho: 60 ô cất đồ riêng ngoài túi (mở ở đâu cũng được). Bấm món trong túi để cất vào kho, bấm món trong kho để lấy ra.
// Tự bán: chọn mức độ hiếm; đồ nhặt được có độ hiếm từ mức đó trở xuống sẽ tự bán ngay (trừ đồ tốt hơn đồ đang mặc và đồ bộ).
const STASH_MAX=60;
const AUTO_SELL_OPTS=[[-1,'Tự bán: Tắt'],[0,'Tự bán: đồ Thường'],[1,'Tự bán: Thường + Tinh xảo'],[2,'Tự bán: đến đồ Hiếm']];
(()=>{
  // nút Kho + ô chọn tự bán ở chân túi đồ
  const foot=$('bagFoot');
  foot.insertAdjacentHTML('beforeend',`<button class="btn gray" id="openStashBtn">Kho đồ</button><select id="autoSellSel" title="Tự bán đồ khi nhặt để túi không bị đầy">${AUTO_SELL_OPTS.map(([v,n])=>`<option value="${v}">${n}</option>`).join('')}</select>`);
  $('autoSellSel').onchange=e=>{player.autoSellRar=+e.target.value;save();sfx('click');log(player.autoSellRar<0?'Đã tắt tự bán':`Tự bán: ${AUTO_SELL_OPTS.find(o=>o[0]===player.autoSellRar)[1].replace('Tự bán: ','')} khi nhặt (trừ đồ tốt hơn và đồ bộ)`,'#ffd977');};
  $('autoSellSel').onkeydown=e=>e.stopPropagation();
  $('openStashBtn').onclick=()=>{openPanel('panelStash');renderStash();};
  // bảng kho
  const p=document.createElement('div');p.id='panelStash';p.className='panel modal';p.hidden=true;
  p.innerHTML=`<button class="close">✕</button><h3 class="serif">Kho đồ</h3>
    <div id="stashWrap"><div><h4>Túi đồ <span id="stBagN"></span> <span class="sth">(bấm để cất vào kho)</span></h4><div class="stGrid" id="stBag"></div></div>
    <div><h4>Kho <span id="stN"></span> <span class="sth">(bấm để lấy ra túi)</span></h4><div class="stGrid" id="stStash"></div></div></div>
    <div style="font-size:12px;color:#999;margin-top:6px">Kho lưu cùng nhân vật trên máy chủ. Rê chuột vào món đồ để xem chỉ số.</div>`;
  $('hud').appendChild(p);p.querySelector('.close').onclick=()=>{p.hidden=true;$('tip').hidden=true;};PANELS.push('panelStash');})();
function stashCell(it,attr){const ic=it.slot==='weapon'?WICON[it.wtype]:SLOTICON[it.slot],c=RARITY[it.rar].c;
  return`<div class="cell" ${attr} data-tip="st:${it.uid}" style="border-color:${c}66"><div class="ic" style="color:${c}">${ic}</div><span style="color:${c}">${esc(it.name)}${it.ref?' +'+it.ref:''}</span><span class="tb">B${it.tier+1}</span></div>`;}
function renderStash(){if($('panelStash').hidden)return;player.stash=player.stash||[];
  $('stBag').innerHTML=player.inv.map(it=>stashCell(it,`data-put="${it.uid}"`)).join('')||'<div style="color:#999">Túi trống</div>';
  $('stStash').innerHTML=player.stash.map(it=>stashCell(it,`data-take="${it.uid}"`)).join('')||'<div style="color:#999">Kho trống</div>';
  $('stBagN').textContent=`${player.inv.length}/${BAG_MAX}`;$('stN').textContent=`${player.stash.length}/${STASH_MAX}`;
  $('stBag').querySelectorAll('[data-put]').forEach(e=>e.onclick=()=>{if(player.stash.length>=STASH_MAX)return log('Kho đã đầy','#ff9a8a');const i=player.inv.findIndex(x=>x.uid===+e.dataset.put);if(i<0)return;
    player.stash.push(player.inv.splice(i,1)[0]);sfx('pick');$('tip').hidden=true;save();renderStash();});
  $('stStash').querySelectorAll('[data-take]').forEach(e=>e.onclick=()=>{if(player.inv.length>=BAG_MAX)return log('Túi đồ đã đầy','#ff9a8a');const i=player.stash.findIndex(x=>x.uid===+e.dataset.take);if(i<0)return;
    player.inv.push(player.stash.splice(i,1)[0]);sfx('pick');$('tip').hidden=true;save();renderStash();});}
// chú giải cho món trong kho
const _tipSt=tipContent;
tipContent=function(key){const [k,v]=key.split(':');if(k!=='st')return _tipSt(key);const it=player.inv.find(x=>x.uid===+v)||(player.stash||[]).find(x=>x.uid===+v);return it?itemHTML(it):'';};
// túi đồ: hiện đúng mức tự bán đang chọn
const _rbSt=renderBag;
renderBag=function(){_rbSt();const s=$('autoSellSel');if(s)s.value=String(player.autoSellRar??-1);};
