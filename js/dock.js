'use strict';
// ===================== THU GỌN / ĐÓNG CÁC KHUNG TRÊN MÀN HÌNH =====================
// Mỗi khung (chat, tổ đội, nhiệm vụ, bản đồ nhỏ, nhật ký) có thanh nhỏ với nút:
//   ▾/▸  thu gọn còn mỗi tên khung (bấm lại để mở)
//   ✕    đóng hẳn; khung đã đóng hiện thành nút nhỏ ở góc dưới bên trái, bấm để mở lại
// Trạng thái được nhớ trên máy. Nút "Khung" trong Cài đặt mở lại tất cả.
const DOCK_KEY='tk_dock';
const dockState=(()=>{try{return JSON.parse(localStorage.getItem(DOCK_KEY))||{};}catch(e){return{};}})();
const dockSave=()=>{try{localStorage.setItem(DOCK_KEY,JSON.stringify(dockState));}catch(e){}};
const DOCKS=[];
function dockApply(d){const s=dockState[d.key]||'';d.el.classList.toggle('dk-min',s==='min');d.el.classList.toggle('dk-hide',s==='hide');
  d.btnMin.textContent=s==='min'?'▸':'▾';d.btnMin.title=s==='min'?'Mở rộng':'Thu gọn';renderDockTray();}
function dockSet(d,s){if(s)dockState[d.key]=s;else delete dockState[d.key];dockSave();dockApply(d);sfx('click');}
function makeDock(el,title,key,wrapBody){if(!el)return;
  if(wrapBody){const body=document.createElement('div');body.id=wrapBody;while(el.firstChild)body.appendChild(el.firstChild);el.appendChild(body);}
  const bar=document.createElement('div');bar.className='dkbar';bar.innerHTML=`<span class="dkt">${title}</span><span><button class="dkb" data-a="min">▾</button><button class="dkb" data-a="hide" title="Đóng khung">✕</button></span>`;
  el.insertBefore(bar,el.firstChild);
  const d={el,title,key,btnMin:bar.querySelector('[data-a="min"]')};DOCKS.push(d);
  bar.addEventListener('click',e=>{e.stopPropagation();const a=e.target.dataset&&e.target.dataset.a;
    if(a==='hide')dockSet(d,'hide');else if(a==='min'||(dockState[key]==='min'))dockSet(d,dockState[key]==='min'?'':'min');});
  ['mousedown','touchstart'].forEach(ev=>bar.addEventListener(ev,e=>e.stopPropagation(),{passive:true}));
  dockApply(d);}
function renderDockTray(){let t=$('dockTray');if(!t){t=document.createElement('div');t.id='dockTray';$('hud').appendChild(t);}
  const hid=DOCKS.filter(d=>dockState[d.key]==='hide');
  t.innerHTML=hid.map(d=>`<button data-k="${d.key}" title="Mở lại khung ${d.title}">▣ ${d.title}</button>`).join('');
  t.querySelectorAll('button').forEach(b=>b.onclick=()=>{const d=DOCKS.find(x=>x.key===b.dataset.k);if(d)dockSet(d,'');});}
makeDock($('chatBox'),'Chat','chat');
makeDock($('partyBox'),'Tổ đội','party','partyBody');
makeDock($('quest'),'Nhiệm vụ','quest','questBody');
makeDock($('miniwrap'),'Bản đồ nhỏ','mini');
makeDock($('log'),'Nhật ký','log','logBody');
// Cài đặt: nút mở lại tất cả khung
(()=>{const r=$('resetBtn');const b=document.createElement('button');b.className='btn gray';b.textContent='Hiện lại tất cả khung đã thu gọn / đóng';r.parentNode.insertBefore(b,r);
  b.onclick=()=>{for(const k in dockState)delete dockState[k];dockSave();DOCKS.forEach(dockApply);toast('Đã hiện lại tất cả khung','#9fffb0');};})();
