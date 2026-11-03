'use strict';
// ===================== GIAO DIỆN ĐẸP CHO "HOẠT ĐỘNG" VÀ "NGHỀ" =====================
// Thẻ dạng lưới, biểu tượng vẽ màu, chân dung trùm vẽ từ hình quái trong game, thanh tiêu đề minh họa,
// huy hiệu bậc lôi đài; trên bản đồ có hoạt cảnh câu cá (cần, dây, phao) và đào khoáng (cuốc, tia lửa).
(()=>{const st=document.createElement('style');st.textContent=`
#panelHD,#panelPF{width:680px!important;max-width:96vw}
.hdban{position:relative;height:86px;border-radius:12px;overflow:hidden;margin-bottom:10px;border:1px solid rgba(255,215,122,.35);box-shadow:inset 0 0 30px rgba(0,0,0,.5)}
.hdban svg.bg{position:absolute;inset:0;width:100%;height:100%}.hdban .tt{position:absolute;left:16px;top:14px;font-family:serif;font-size:24px;font-weight:bold;color:#fff3c8;text-shadow:0 2px 6px #000,0 0 14px rgba(255,200,100,.5)}
.hdban .st{position:absolute;left:17px;top:50px;font-size:13px;color:#ffe9b0;text-shadow:0 1px 3px #000;max-width:72%}.hdban .rt{position:absolute;right:16px;top:20px;text-align:right;color:#fff;text-shadow:0 1px 4px #000;font-size:13px}
.hdban .rt b{display:block;font-size:24px;color:#ffe27a;font-family:serif}
.hdgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.hdgrid.g3{grid-template-columns:repeat(3,1fr)}
.hdcard{position:relative;border-radius:12px;padding:10px;background:linear-gradient(160deg,rgba(60,44,26,.85),rgba(18,12,8,.9));border:1px solid #5a4630;box-shadow:0 2px 8px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,230,170,.08);display:flex;gap:10px;align-items:center;min-height:74px}
.hdcard.done{border-color:#7fd88a;box-shadow:0 0 12px rgba(120,230,140,.35)}.hdcard.got{opacity:.6}.hdcard.ready{border-color:#ffd77a;box-shadow:0 0 14px rgba(255,215,122,.5);animation:hdPulse 1.6s ease-in-out infinite}
@keyframes hdPulse{50%{box-shadow:0 0 22px rgba(255,215,122,.8)}}
.hdcard .nm{font-weight:bold;color:#ffe9b0;font-size:14px}.hdcard .ds{font-size:12px;color:#cdbb98;margin-top:2px}.hdcard .bx{flex:1;min-width:0}
.hdchip{display:inline-block;padding:1px 7px;border-radius:9px;font-size:11px;margin:3px 3px 0 0;background:rgba(255,215,122,.12);border:1px solid rgba(255,215,122,.35);color:#ffe27a}
.hdchip.g{background:rgba(120,230,140,.12);border-color:rgba(120,230,140,.4);color:#a8ffb8}.hdchip.r{background:rgba(255,110,90,.12);border-color:rgba(255,110,90,.4);color:#ffb0a0}
.hdgo{padding:7px 12px;border-radius:9px;border:1px solid #c9a227;background:linear-gradient(#d8a83a,#8a5e14);color:#fff8e0;font-weight:bold;cursor:pointer;font-family:inherit;text-shadow:0 1px 2px #000;box-shadow:0 2px 6px rgba(0,0,0,.4);white-space:nowrap}
.hdgo:hover{filter:brightness(1.12)}.hdgo:disabled{background:linear-gradient(#4a3e2e,#2e261c);border-color:#5a4a34;color:#9a8a70;cursor:default;filter:none;text-shadow:none}
.hdring{flex:none;width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;color:#fff}
.hdring i{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#1a120c;font-style:normal}
.hdpor{flex:none;width:76px;height:76px;border-radius:12px;background:radial-gradient(circle at 50% 70%,rgba(255,150,80,.35),rgba(0,0,0,.6) 70%);border:1px solid rgba(255,180,120,.4);overflow:hidden}
.hdpor img{width:100%;height:100%;display:block}.hdico{flex:none;width:46px;height:46px}.hdico svg{width:100%;height:100%;filter:drop-shadow(0 2px 2px rgba(0,0,0,.6))}
.hdsec{margin:12px 0 6px;color:#ffd77a;font-weight:bold;font-family:serif;font-size:15px;display:flex;align-items:center;gap:8px}.hdsec:after{content:'';flex:1;height:1px;background:linear-gradient(90deg,rgba(255,215,122,.5),transparent)}
.hdpills{display:flex;gap:4px;flex-wrap:wrap;margin:6px 0}.hdpill{padding:5px 11px;border-radius:14px;border:1px solid #6a5634;background:#2a2016;color:#d8c8a0;cursor:pointer;font-family:inherit;font-size:12.5px}
.hdpill.sel{background:linear-gradient(#c99a3a,#7a5418);color:#fff;border-color:#ffd77a}.hdpill:disabled{opacity:.4;cursor:default}
.hdmat{display:inline-flex;align-items:center;gap:3px;padding:2px 7px 2px 3px;border-radius:10px;background:rgba(0,0,0,.35);border:1px solid #4a3e2a;font-size:11.5px;margin:3px 3px 0 0}.hdmat svg{width:18px;height:18px}
.hdmat.ok{border-color:rgba(120,230,140,.5);color:#b8ffc4}.hdmat.no{border-color:rgba(255,110,90,.5);color:#ffb0a0}
.hdtop{display:flex;align-items:center;gap:8px;padding:6px 10px;border-radius:9px;margin:4px 0;background:rgba(0,0,0,.3);border:1px solid #3e3220;font-size:13px}.hdtop .rk{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#1a1208}
#hdTabs button,#pfTabs button{border-radius:10px!important;padding:8px 6px!important}`;document.head.appendChild(st);})();
// ---------- biểu tượng ----------
const UI_IC={
  kill:['#ff7a5a','<path d="M10 38 30 18M14 40l-6-6M34 10l5 5-17 17-5-5ZM38 38 18 18M34 40l6-6M14 10l-5 5 17 17 5-5Z" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/>'],
  boss:['#b07aff','<path d="M24 8c-9 0-15 6-15 14 0 5 2 8 5 10v6h4v-3h3v3h6v-3h3v3h4v-6c3-2 5-5 5-10 0-8-6-14-15-14Z" fill="#f4ecff"/><circle cx="18" cy="23" r="4" fill="#3a1a5a"/><circle cx="30" cy="23" r="4" fill="#3a1a5a"/><path d="M22 30h4l-2-3Z" fill="#3a1a5a"/>'],
  herb:['#5ad07a','<path d="M24 42V20" stroke="#2a6a3a" stroke-width="3"/><path d="M24 22C14 22 10 14 12 8c8 0 13 6 12 14ZM24 26c8-1 13-7 12-13-7 0-12 6-12 13Z" fill="#c8ffb0"/><circle cx="24" cy="12" r="3" fill="#ff9ac8"/>'],
  wb:['#ff6a2a','<path d="M24 6c2 8 10 10 10 20a10 10 0 0 1-20 0c0-5 3-8 5-10 0 5 3 6 4 6-2-6 0-12 1-16Z" fill="#ffd060"/><path d="M24 22c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-5 5-10Z" fill="#fff6c8"/>'],
  pb:['#d8503a','<path d="M8 14h32M10 20h28" stroke="#fff3d0" stroke-width="3.4" stroke-linecap="round"/><path d="M14 20v22M34 20v22" stroke="#fff3d0" stroke-width="3.4"/><path d="M6 12q18-6 36 0" stroke="#fff3d0" stroke-width="3" fill="none"/>'],
  pvp:['#5ab4ff','<path d="M27 4 12 27h10l-3 17 17-25H26Z" fill="#fff8b0" stroke="#7a5a10" stroke-width="1.2"/>'],
  guild:['#c9a227','<path d="M24 6 8 16h32Z M10 18h28v4H10Z M14 24h4v12h-4Z M22 24h4v12h-4Z M30 24h4v12h-4Z M8 38h32v4H8Z" fill="#fff3d0"/>'],
  gift:['#ff5a8a','<rect x="9" y="20" width="30" height="20" rx="2" fill="#fff0f4"/><rect x="7" y="14" width="34" height="8" rx="2" fill="#ffd0dc"/><path d="M24 14v26" stroke="#ff5a8a" stroke-width="4"/><path d="M24 14c-3-6-11-6-10-1s10 1 10 1c3-6 11-6 10-1s-10 1-10 1" fill="none" stroke="#ff5a8a" stroke-width="2.4"/>'],
  fish:['#3aa8e0','<path d="M8 24c6-8 18-10 26-2l6-5v14l-6-5c-8 8-20 6-26-2Z" fill="#e8f8ff"/><circle cx="16" cy="22" r="2" fill="#1a3a5a"/><path d="M22 18c2 4 2 8 0 12" stroke="#7ac8f0" stroke-width="1.6" fill="none"/>'],
  ore:['#a8907a','<path d="M24 6 36 16 32 36 16 36 12 16Z" fill="#e8dcc8"/><path d="M24 6 24 36M12 16 36 16M24 6 16 36M24 6 32 36" stroke="#8a7458" stroke-width="1.2"/><path d="M18 12l3 2" stroke="#fff" stroke-width="2"/>'],
  hide:['#e08a4a','<ellipse cx="24" cy="24" rx="12" ry="14" fill="#ffe0c0"/><path d="M14 16q10 6 20 0M13 24q11 6 22 0M14 32q10 6 20 0" stroke="#c0703a" stroke-width="1.6" fill="none"/><path d="M34 36l6 6" stroke="#fff" stroke-width="2"/>'],
  alch:['#5ad0a0','<path d="M10 20h28l-3 16q-1 4-5 4H18q-4 0-5-4Z" fill="#e8fff4"/><path d="M8 18h32" stroke="#e8fff4" stroke-width="3" stroke-linecap="round"/><path d="M18 14q2-6 0-8M24 14q2-7 0-10M30 14q2-6 0-8" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/><circle cx="24" cy="29" r="4" fill="#5ad0a0"/>'],
  tailor:['#d87ad8','<path d="M12 38 34 10" stroke="#fff" stroke-width="3" stroke-linecap="round"/><ellipse cx="33" cy="11" rx="2" ry="3.2" fill="none" stroke="#fff" stroke-width="1.6" transform="rotate(40 33 11)"/><path d="M33 12q-14 6-10 16t-12 10" stroke="#ffd0ff" stroke-width="1.8" fill="none"/>'],
  smith:['#7a8aa8','<path d="M8 30h26l4-6H12Z" fill="#e8eef8"/><path d="M14 30v8h18v-8" fill="#c8d0e0"/><path d="M28 6l10 10-4 4-10-10Z" fill="#fff"/><path d="M27 15 17 25" stroke="#c9a060" stroke-width="3.4" stroke-linecap="round"/>'],
  pill:['#ffb040','<circle cx="24" cy="24" r="13" fill="#fff4d8"/><circle cx="24" cy="24" r="9" fill="#ffd060"/><circle cx="20" cy="20" r="3" fill="#fff" opacity=".9"/>']};
function uiIco(k,sz){const [c,g]=UI_IC[k]||UI_IC.gift;const id='ui'+k;return`<div class="hdico" style="${sz?`width:${sz}px;height:${sz}px`:''}"><svg viewBox="0 0 48 48"><defs><radialGradient id="${id}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="${shadeHex(c,.35)}"/><stop offset="1" stop-color="${shadeHex(c,-.45)}"/></radialGradient></defs><rect x="1" y="1" width="46" height="46" rx="11" fill="url(#${id})" stroke="${shadeHex(c,.5)}" stroke-opacity=".6"/>${g}</svg></div>`;}
function matIco(ty,t){const k={herb:'herb',fish:'fish',ore:'ore',hide:'hide'}[ty];const [c,g]=UI_IC[k];return`<svg viewBox="0 0 48 48"><rect x="1" y="1" width="46" height="46" rx="10" fill="${shadeHex(c,-.25+t*0.06)}"/>${g}</svg>`;}
function ring(p,col,txt){p=Math.max(0,Math.min(1,p));return`<div class="hdring" style="background:conic-gradient(${col} ${p*360}deg,rgba(255,255,255,.1) 0)"><i>${txt}</i></div>`;}
// thanh tiêu đề minh họa
function banner(kind,title,sub,right){const P={daily:['#3a5a8a','#1a2440','#ffd77a'],wb:['#8a2a14','#2a0804','#ff8a3a'],pb:['#4a2a5a','#140a1e','#c88aff'],ld:['#1a4a7a','#081830','#7ad8ff'],guild:['#6a4a14','#2a1a06','#ffd23f'],pf:['#2a5a3a','#0a1e12','#9fffb0']}[kind]||['#3a3a3a','#111','#fff'];
  const hills=`<path d="M0 86 L0 60 Q60 30 120 52 T260 46 T420 58 T600 40 T720 54 L720 86Z" fill="${shadeHex(P[0],-.3)}" opacity=".9"/><path d="M0 86 L0 70 Q90 50 180 66 T380 62 T560 70 T720 64 L720 86Z" fill="${shadeHex(P[1],.1)}"/>`;
  const deco={wb:'<circle cx="600" cy="30" r="40" fill="#ff6a2a" opacity=".35"/><circle cx="600" cy="30" r="22" fill="#ffd060" opacity=".5"/>',ld:'<path d="M560 10 l20 30 -12 0 8 30 -26-36 12 0Z" fill="#fff8b0" opacity=".5"/>',pb:'<path d="M540 70V30h60v40M530 30h80M535 22h70" stroke="#ffd0ff" stroke-width="4" fill="none" opacity=".35"/>',
    daily:'<circle cx="610" cy="26" r="16" fill="#fff6c8" opacity=".55"/>',guild:'<path d="M560 70V40l30-20 30 20v30Z" fill="#ffe08a" opacity=".3"/>',pf:'<path d="M560 60q20-30 40 0t40 0" stroke="#bfffd0" stroke-width="3" fill="none" opacity=".4"/>'}[kind]||'';
  return`<div class="hdban"><svg class="bg" viewBox="0 0 720 86" preserveAspectRatio="none"><defs><linearGradient id="bn${kind}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P[0]}"/><stop offset="1" stop-color="${P[1]}"/></linearGradient></defs><rect width="720" height="86" fill="url(#bn${kind})"/>${deco}${hills}</svg>
    <div class="tt">${title}</div><div class="st">${sub||''}</div>${right?`<div class="rt">${right}</div>`:''}</div>`;}
// chân dung quái vẽ bằng hình trong game
const PORT={};
function monPortrait(key,glow){if(PORT[key])return PORT[key];const t=MT[key];if(!t)return'';const c=document.createElement('canvas');c.width=c.height=152;c.dataset.w=76;
  try{withCtx(c,()=>{const s=t.scale||1,h=t.draw==='human'||!t.draw?50*s+10:(t.hh||60)*s*0.8+10,k=Math.min(1.8,64/h);ctx.translate(38,70);ctx.scale(k,k);
    if(glow){const g=ctx.createRadialGradient(0,-h/2,2,0,-h/2,h);g.addColorStop(0,glow+'88');g.addColorStop(1,glow+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-h/2,h,0,6.29);ctx.fill();}
    drawShadow(0,0,22*s,0.4);drawMonsterBody({t,face:1,moving:false,freezeT:0,atkAnim:0,dir:'side'},0,0,false);});}catch(e){}
  return PORT[key]=c.toDataURL();}
const bossOf=mapId=>{const M=MAPS[mapId];return M?Object.keys(M.zones).find(k=>MT[k]&&MT[k].boss&&!k.startsWith('e_')):null;};
// ===================== HOẠT ĐỘNG =====================
const DAILY_RW={exp:'Kinh nghiệm · Lượng',cn:'Chân Nguyên',pot:'40 bình thuốc',cn2:'Chân Nguyên Huyền+',luck:'2 May Mắn Phù',gold:'Nhiều lượng'};
const DAILY_IC={kill:'kill',boss:'boss',herb:'herb',wb:'wb',pb:'pb',pvp:'pvp',don:'guild'};
renderDaily=function(B){const D=dailyData(),list=DAILY.filter(T=>!T.lv||player.lv>=T.lv),done=list.filter(T=>D.got[T.k]).length,need=Math.min(5,list.length);
  const now=new Date(),mid=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
  let h=banner('daily','Nhiệm vụ hằng ngày',`Làm mới sau ${mmss((mid-now)/1000)} · nhận đủ ${need} nhiệm vụ được thưởng chuyên cần`,`Đã nhận<b>${done}/${list.length}</b>`)+'<div class="hdgrid">';
  for(const T of list){const c=D.c[T.k]||0,ok=c>=T.need,got=D.got[T.k];
    h+=`<div class="hdcard ${got?'got':ok?'ready':''}">${uiIco(DAILY_IC[T.k])}<div class="bx"><div class="nm">${T.n}</div><div class="ds">${T.d}</div><span class="hdchip">${DAILY_RW[T.rw]||'Phần thưởng'}</span></div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px">${ring(c/T.need,ok?'#7fe08a':'#ffb340',`${c}/${T.need}`)}<button class="hdgo" data-dk="${T.k}" ${ok&&!got?'':'disabled'}>${got?'Đã nhận':'Nhận'}</button></div></div>`;}
  h+=`</div><div class="hdcard ${D.bonus?'got':done>=need?'ready':''}" style="margin-top:8px;border-color:#c9a227">${uiIco('gift')}<div class="bx"><div class="nm">Thưởng chuyên cần</div><div class="ds">Nhận đủ ${need} nhiệm vụ trong ngày</div>
    <span class="hdchip">Tam Bội 30 phút</span><span class="hdchip">Chân Nguyên Huyền+</span><span class="hdchip">20% Thần Đỉnh</span></div>${ring(done/need,'#ffd23f',`${Math.min(done,need)}/${need}`)}<button class="hdgo" id="dkBonus" ${done>=need&&!D.bonus?'':'disabled'}>${D.bonus?'Đã nhận':'Nhận'}</button></div>`;
  B.innerHTML=h;
  B.querySelectorAll('[data-dk]').forEach(b=>b.onclick=()=>{const T=DAILY.find(x=>x.k===b.dataset.dk);if(D.got[T.k]||(D.c[T.k]||0)<T.need)return;D.got[T.k]=1;const m=dailyReward(T);sfx('coin');log(`Nhận thưởng "${T.n}": ${m}`,'#ffe27a');save();renderHD();});
  if($('dkBonus'))$('dkBonus').onclick=()=>{if(D.bonus)return;D.bonus=true;addExpBuff(2,1800);if(typeof giveCN==='function'&&player.lv>=20)giveCN(newCN(CN_KEYS[rint(0,5)],Math.max(2,rollCNq(0.1))),'Chuyên cần');
    if(typeof giveTD==='function'&&player.lv>=30&&Math.random()<0.2){let g=0;for(let i=0;i<TD_LIST.length;i++)if(player.lv>=TD_LIST[i].lv)g=i;giveTD(g,'Chuyên cần');}sfx('level');save();renderHD();};};
renderWB=function(B){const n=wbNow();
  let h=banner('wb','Trùm thế giới','Mỗi 3 giờ (0h, 3h, 6h... 21h) · 5 trùm cùng lúc · tồn tại 20 phút · thưởng theo phần sát thương',n.active?`Đang diễn ra<b>${mmss(n.left)}</b>`:`Lần tới sau<b>${mmss(n.next)}</b>`)+'<div class="hdgrid">';
  WB_LOC.forEach((L,i)=>{const M=MAPS[L.map],ok=player.lv>=M.minLv,got=WB.got[n.key+i],bk=bossOf(L.map);
    const chip=got?'<span class="hdchip g">Đã hạ</span>':n.active?'<span class="hdchip r">Đang xuất hiện</span>':`<span class="hdchip">Sau ${mmss(n.next)}</span>`;
    h+=`<div class="hdcard ${n.active&&!got&&ok?'ready':''}"><div class="hdpor"><img src="${bk?monPortrait(bk,'#ff7a3a'):''}"></div><div class="bx"><div class="nm">${L.name}</div><div class="ds">Cấp ${L.lv} · ${M.name}</div>${chip}${L.lv>=80?'<span class="hdchip">Có thể rơi Trùng Lâu</span>':''}</div>
      <button class="hdgo" data-wbg="${L.map}" ${ok?'':'disabled'}>${ok?(L.map===curMapId?'Ở đây':'Đi tới'):'Cấp '+M.minLv}</button></div>`;});
  h+='</div><div class="hdnote" style="margin-top:8px">Phần thưởng: kinh nghiệm, lượng, Chân Nguyên (phẩm cao nếu gây trên 15% sát thương), có thể nhận Thần Đỉnh. Dùng Truyền Tống Sứ ở thành để tới nhanh.</div>';
  B.innerHTML=h;B.querySelectorAll('[data-wbg]').forEach(b=>b.onclick=()=>{const id=b.dataset.wbg;if(id===curMapId)return log('Trùm ở khu trùm của bản đồ này','#ffb36b');$('panelHD').hidden=true;if(navTo(id,null,null))log(`Đang tìm đường tới ${MAPS[id].name}...`,'#8fd8ff');});};
renderPB=function(B){const D=dailyData(),left=PB_MAX-(D.pb||0),lead=typeof inParty!=='function'||!inParty()||isLeader();
  const pips=Array.from({length:PB_MAX},(_,i)=>`<span style="display:inline-block;width:12px;height:12px;border-radius:50%;margin-left:3px;background:${i<left?'#ffd23f':'#3a2e20'};box-shadow:${i<left?'0 0 6px #ffd23f':'none'}"></span>`).join('');
  let h=banner('pb','Phó bản tổ đội','Bản đồ riêng cho bạn hoặc cả đội · quái mạnh gấp 3, trùm gấp 8 · diệt sạch trong 15 phút',`Lượt hôm nay<b>${left}/${PB_MAX}</b>${pips}`);
  if(CM.pb)h+=`<div class="hdcard ready">${uiIco('pb')}<div class="bx"><div class="nm">Đang ở ${esc(CM.pb.name)}</div><div class="ds">Diệt sạch quái để nhận thưởng</div></div><button class="hdgo" id="pbLeaveBtn">Rời phó bản</button></div>`;
  if(typeof inParty==='function'&&inParty()&&!isLeader())h+='<div class="hdnote">Bạn đang ở tổ đội: chờ đội trưởng chọn phó bản, cả đội sẽ được đưa vào cùng.</div>';
  h+='<div class="hdgrid">';
  for(const P of PB_LIST){const ok=player.lv>=P.lv,bk=bossOf(P.src),th=THEMES[MAPS[P.src].theme];
    h+=`<div class="hdcard" style="background:linear-gradient(160deg,${th&&th.grass?shadeHex(th.grass,-.45):'#2a2016'},rgba(14,10,8,.95))"><div class="hdpor" style="border-color:rgba(200,140,255,.45)"><img src="${bk?monPortrait(bk,'#c88aff'):''}"></div>
      <div class="bx"><div class="nm">${P.name}</div><div class="ds">Cấp ${P.lv}+ · trùm ${bk?MT[bk].name:''}</div><span class="hdchip">Trang bị Truyền thuyết/Thần thoại</span>${P.lv>=115?'<span class="hdchip">5% Trùng Lâu</span>':''}</div>
      <button class="hdgo" data-pb="${P.id}" ${ok&&left>0&&lead&&!CM.pb?'':'disabled'}>${!ok?'Cấp '+P.lv:!lead?'Chờ':'Vào'}</button></div>`;}
  B.innerHTML=h+'</div>';if($('pbLeaveBtn'))$('pbLeaveBtn').onclick=()=>{pbLeave('Đã rời phó bản');renderHD();};
  B.querySelectorAll('[data-pb]').forEach(b=>b.onclick=()=>{const P=PB_LIST.find(x=>x.id===b.dataset.pb);$('panelHD').hidden=true;pbEnter(P,NET.id||('solo'+Date.now()%1e6),false);});};
function tierBadge(t,sz){const c=t[2];return`<svg viewBox="0 0 64 72" width="${sz}" height="${sz*1.12}"><defs><linearGradient id="tb${t[1].length}${c.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shadeHex(c,.45)}"/><stop offset="1" stop-color="${shadeHex(c,-.45)}"/></linearGradient></defs>
  <path d="M32 3 58 13v22c0 17-12 28-26 34C18 63 6 52 6 35V13Z" fill="url(#tb${t[1].length}${c.slice(1)})" stroke="${shadeHex(c,.6)}" stroke-width="2"/><path d="M32 12 50 19v16c0 12-8 20-18 25-10-5-18-13-18-25V19Z" fill="rgba(0,0,0,.25)"/>
  <path d="M35 18 24 38h8l-3 16 13-21h-8Z" fill="#fff8d0"/></svg>`;}
renderLD=function(B){const pv=ldData(),r=pv.r||1000,t=ldTier(r),i=LD_TIERS.indexOf(t),nx=LD_TIERS[i+1],d=new Date(),end=new Date(d.getFullYear(),d.getMonth()+1,1);
  let h=banner('ld','Lôi đài',`Mùa ${pv.s} · kết thúc sau ${mmss((end-d)/1000)} · thắng cộng điểm, thua trừ điểm`,`${pv.sw||0} thắng · ${pv.sl||0} thua`);
  h+=`<div class="hdcard" style="border-color:${t[2]};gap:16px">${tierBadge(t,64)}<div class="bx"><div style="font-family:serif;font-size:22px;font-weight:bold;color:${t[2]}">${t[1]}</div><div class="ds">${r} điểm${nx?` · còn ${nx[0]-r} điểm lên <b style="color:${nx[2]}">${nx[1]}</b>`:' · bậc cao nhất'}</div>
    ${nx?`<div class="hdbar" style="height:8px"><i style="width:${(r-t[0])/(nx[0]-t[0])*100}%;background:linear-gradient(90deg,${t[2]},${nx[2]})"></i></div>`:''}<div style="margin-top:6px">${LD_TIERS.map(x=>`<span title="${x[1]} ${x[0]}">${tierBadge(x,18)}</span>`).join(' ')}</div></div></div>`;
  h+='<div class="hdsec">Khiêu chiến (cùng bản đồ)</div>';const near=[...NET.others.values()].filter(o=>o.look&&o.lv>=DUEL_MINLV);
  h+=near.length?'<div class="hdgrid">'+near.map(o=>{const tt=ldTier(o.pr||1000);return`<div class="hdcard">${tierBadge(tt,38)}<div class="bx"><div class="nm">${esc(o.name)}</div><div class="ds">Cấp ${o.lv|0} · <span style="color:${tt[2]}">${tt[1]} ${o.pr||1000}</span></div></div><button class="hdgo" data-ld="${o.id}" ${player.lv>=DUEL_MINLV&&!DUEL.state?'':'disabled'}>Khiêu chiến</button></div>`;}).join('')+'</div>':'<div class="hdnote">Chưa có ai cùng bản đồ. Rủ bạn bè tới cùng bản đồ để tỷ thí.</div>';
  h+='<div class="hdsec">Bảng xếp hạng mùa</div><div id="ldTop" class="hdnote">Đang tải...</div>';
  B.innerHTML=h;B.querySelectorAll('[data-ld]').forEach(b=>b.onclick=()=>{const o=NET.others.get(b.dataset.ld);if(o){duelInvite(o);$('panelHD').hidden=true;}});
  if(!HD.ldT||Date.now()-HD.ldT>15000){HD.ldT=Date.now();ldLoadTop();}else ldShowTop();};
ldShowTop=function(){const el=$('ldTop');if(!el)return;const L=HD.ldTop;if(!L){el.textContent='Chưa tải được bảng xếp hạng (cần mạng).';return;}if(!L.length){el.textContent='Mùa này chưa ai tỷ thí.';return;}
  const md=['#ffd23f','#d8e0ea','#d8905a'];el.className='';el.innerHTML=L.map((x,i)=>{const t=ldTier(x.r);return`<div class="hdtop"><div class="rk" style="background:${md[i]||'#5a4a34'};color:${i<3?'#1a1208':'#fff'}">${i+1}</div>${tierBadge(t,22)}<b style="flex:1;color:#ffe9b0">${esc(x.name)}</b><span>cấp ${x.lv}</span><span style="color:${t[2]};width:110px;text-align:right">${t[1]} ${x.r}</span><span style="color:#aaa;width:90px;text-align:right">${x.w}T / ${x.l}B</span></div>`;}).join('');};
if(typeof renderGuild==='function'){const _rg=renderGuild;renderGuild=function(B){_rg(B);const g=typeof GH!=='undefined'&&GH.data;
  B.insertAdjacentHTML('afterbegin',banner('guild','Bang hội',g?`${esc(g.name)} · cấp ${g.lv} · ${(g.members||[]).length} thành viên`:'Lập bang hoặc gia nhập bang để nhận thưởng kinh nghiệm và công lực',g?`Thưởng<b>+${g.lv}%</b>kinh nghiệm`:''));
  B.querySelectorAll('.hdrow button,.hdbtn').forEach(b=>b.classList.add('hdgo'));};}
// ===================== NGHỀ =====================
const PF_IC={fish:'fish',mine:'ore',herb:'herb',alch:'alch',tailor:'tailor',smith:'smith'};
function pfMatChips(need,t){return need.map(([ty,n])=>{const h=pfHas(ty,t);return`<span class="hdmat ${h>=n?'ok':'no'}">${matIco(ty,t)}${PF_MATS[ty].l[t]} ${h}/${n}</span>`;}).join('');}
function pfSkillCard(k,body,btn){const P=pfData(),l=P.lv[k],p=l>=100?1:P.xp[k]/pfNeed(l);return`<div class="hdcard">${uiIco(PF_IC[k])}<div class="bx"><div class="nm">${PF_SKILLS[k]}</div><div class="ds">${body}</div></div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:4px">${ring(p,'#7fe08a','Lv'+l)}${btn||''}</div></div>`;}
function pfTierPills(sk){return`<div class="hdpills">${PF_TIER_NAME.map((n,i)=>`<button class="hdpill ${PFU.tier===i?'sel':''}" data-pft="${i}" ${sk>=PF_TIER_SK[i]?'':'disabled'}>Bậc ${n} · cấp ${PF_TIER_LV[i]}${sk<PF_TIER_SK[i]?' (tay nghề '+PF_TIER_SK[i]+')':''}</button>`).join('')}</div>`;}
renderPF=function(){if($('panelPF').hidden)return;$('pfTabs').innerHTML=PF_TABS.map(([k,n])=>`<button data-k="${k}" class="hdbtn" style="flex:1;${PFU.tab===k?'border-color:#ffd77a;background:linear-gradient(#8a6a2a,#5a4218);color:#fff6d0':''}">${n}</button>`).join('');
  $('pfTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{PFU.tab=b.dataset.k;sfx('click');renderPF();});const P=pfData(),B=$('pfBody'),t=pfTierOfMap();let h='';
  if(PFU.tab==='gather'){h=banner('pf','Thu thập',`Bản đồ này cho nguyên liệu bậc ${PF_TIER_NAME[t]} · tay nghề cao làm nhanh hơn, dễ được gấp đôi`,`Bậc<b>${PF_TIER_NAME[t]}</b>`)+'<div class="hdgrid">';
    h+=pfSkillCard('fish','Đứng sát bờ nước (ngoài thành). Có lúc câu được Kim Lý Ngư bán nhiều lượng.',`<button class="hdgo" id="pfFish" ${canFish()?'':'disabled'}>${canFish()?'Câu':'Ra gần nước'}</button>`);
    h+=pfSkillCard('mine','Đứng sát tảng đá hoặc chân núi (ngoài thành).',`<button class="hdgo" id="pfMine" ${canMine()?'':'disabled'}>${canMine()?'Đào':'Ra gần đá'}</button>`);
    h+=pfSkillCard('herb','Hái cây thuốc mọc trên bản đồ (nhấp vào cây thuốc) để có dược liệu.');
    h+=`<div class="hdcard">${uiIco('hide')}<div class="bx"><div class="nm">Săn thú</div><div class="ds">Đánh quái có lúc rơi da/tơ; trùm và tinh anh rơi nhiều hơn.</div></div></div></div>`;}
  else if(PFU.tab==='alch'){h=banner('pf','Luyện đan','Dược liệu và cá cùng bậc · thuốc bậc cao mạnh và lâu hơn · luyện khéo được gấp đôi thời gian',`Tay nghề<b>${P.lv.alch}</b>`)+pfTierPills(P.lv.alch)+'<div class="hdgrid">';
    for(const p of PF_PILLS){const c=p.perm?(P.perm.cnt[PFU.tier]||0):0,b=P.buf[p.buf],can=pfCanMake(p.need,PFU.tier)&&P.lv.alch>=PF_TIER_SK[PFU.tier];
      h+=`<div class="hdcard ${can?'ready':''}">${uiIco('pill')}<div class="bx"><div class="nm">${p.n}</div><div class="ds">${p.d}</div>${p.perm?`<span class="hdchip">Đã dùng ${c}/10 · ${fmtN(pfGold(PFU.tier)*3)} lượng</span>`:b&&b.t>0?`<span class="hdchip g">Đang có ${Math.ceil(b.t/60)} phút</span>`:''}<div>${pfMatChips(p.need,PFU.tier)}</div></div><button class="hdgo" data-pill="${p.id}" ${can?'':'disabled'}>Luyện</button></div>`;}
    h+=`</div><div class="hdnote" style="margin-top:8px">Tẩy Tủy Đan đã dùng: công lực +${P.perm.atk}, sinh lực +${P.perm.hp}, phòng thủ +${P.perm.def}</div>`;}
  else if(PFU.tab==='tailor'||PFU.tab==='smith'){const k=PFU.tab,need=k==='tailor'?[['hide',4],['herb',2]]:[['ore',4],['hide',2]],list=k==='tailor'?PF_TAILOR:PF_SMITH,sk=P.lv[k];
    const pM=Math.min(100,sk/4),pL=Math.min(100-pM,35+sk/3);h=banner('pf',k==='tailor'?'May mặc':'Rèn đúc',`${k==='tailor'?'Áo, giáp, mũ, giày, găng, hộ uyển':'Vũ khí, nhẫn, dây chuyền, hộ phù'} · mạnh hơn đồ thường 15% · tay nghề 80+ có cơ hội Tuyệt phẩm (+35%)`,`Tay nghề<b>${sk}</b>`)+pfTierPills(sk);
    h+=`<div class="hdcard" style="min-height:0"><div class="bx"><div class="ds">Mỗi món cần</div>${pfMatChips(need,PFU.tier)}<span class="hdmat ${player.gold>=pfGold(PFU.tier)?'ok':'no'}">💰 ${fmtN(pfGold(PFU.tier))} lượng</span></div>
      <div class="ds" style="text-align:right">Tỉ lệ: <span style="color:${RARITY[4].c}">Thần thoại ${pM.toFixed(0)}%</span><br><span style="color:${RARITY[3].c}">Truyền thuyết ${pL.toFixed(0)}%</span>${sk>=80?'<br><span style="color:#ff8aff">Tuyệt phẩm 6%</span>':''}</div></div><div class="hdgrid g3" style="margin-top:8px">`;
    const tier=Math.max(0,TIER_LV.reduce((a,v,i)=>PF_TIER_LV[PFU.tier]>=v?i:a,0)),can=pfCanMake(need,PFU.tier)&&sk>=PF_TIER_SK[PFU.tier]&&player.gold>=pfGold(PFU.tier);
    for(const sl of list){const nm=sl==='weapon'?SLOT_SUF[SECTS[player.sect].wtype]:SLOT_SUF[sl];h+=`<div class="hdcard" style="flex-direction:column;text-align:center;gap:6px">${itemIcon({slot:sl,wtype:SECTS[player.sect].wtype,tier,rar:4},'big')}<div class="nm">${TIER_PRE[tier]} ${nm}</div><button class="hdgo" data-gear="${sl}" ${can?'':'disabled'}>Chế tạo</button></div>`;}h+='</div>';}
  else{h=banner('pf','Nguyên liệu','Nguyên liệu dùng để luyện đan, may mặc, rèn đúc','');h+='<div class="hdgrid">';
    for(const ty in PF_MATS){const M=PF_MATS[ty];h+=`<div class="hdcard" style="align-items:flex-start">${uiIco({herb:'herb',fish:'fish',ore:'ore',hide:'hide'}[ty])}<div class="bx"><div class="nm" style="color:${M.c}">${M.n}</div>${M.l.map((n,i)=>`<span class="hdmat ${pfHas(ty,i)?'ok':''}">${matIco(ty,i)}${n} <b>${pfHas(ty,i)}</b></span>`).join('')}</div></div>`;}h+='</div>';}
  B.innerHTML=h;
  if($('pfFish'))$('pfFish').onclick=()=>{$('panelPF').hidden=true;pfStart('fish',true);};if($('pfMine'))$('pfMine').onclick=()=>{$('panelPF').hidden=true;pfStart('mine',true);};
  B.querySelectorAll('[data-pft]').forEach(b=>b.onclick=()=>{PFU.tier=+b.dataset.pft;renderPF();});
  B.querySelectorAll('[data-pill]').forEach(b=>b.onclick=()=>pfMakePill(PF_PILLS.find(p=>p.id===b.dataset.pill),PFU.tier));
  B.querySelectorAll('[data-gear]').forEach(b=>b.onclick=()=>pfMakeGear(PFU.tab,b.dataset.gear,PFU.tier));};
// ===================== HOẠT CẢNH LÀM NGHỀ TRÊN BẢN ĐỒ =====================
function waterDir(){const tx=Math.floor(player.x/T),ty=Math.floor(player.y/T);let best=null,bd=99;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const g=getT(tx+dx,ty+dy);if((g===WA||g===BR)&&dx*dx+dy*dy<bd){bd=dx*dx+dy*dy;best=[(tx+dx)*T+16,(ty+dy)*T+16];}}return best;}
const _drawPlayerPF=drawPlayer;
drawPlayer=function(){const k=PFA.kind;if(k==='fish'&&!player.dead){const w=waterDir();if(w){player.face=w[0]>=player.x?1:-1;}}
  _drawPlayerPF();if(!k||player.dead)return;const t=nowT,f=player.face,hx=player.x+f*9,hy=player.y-30;
  if(k==='fish'){const w=waterDir()||[player.x+f*50,player.y+10],bx=w[0],by=w[1]+Math.sin(t*3)*1.5,tipX=hx+f*26,tipY=hy-22;
    ctx.strokeStyle='#6a4422';ctx.lineWidth=2.2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(tipX,tipY);ctx.stroke();
    ctx.strokeStyle='rgba(240,240,240,.7)';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(tipX,tipY);ctx.quadraticCurveTo((tipX+bx)/2,Math.max(tipY,by)+6,bx,by);ctx.stroke();
    const nib=PFA.t<0.6?Math.sin(t*25)*2:0;ctx.fillStyle='#ff3a3a';ctx.beginPath();ctx.arc(bx,by-2+nib,3,Math.PI,0);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx,by-2+nib,3,0,Math.PI);ctx.fill();
    for(let i=0;i<2;i++){const p=((t*0.7+i*0.5)%1);ctx.strokeStyle=`rgba(230,245,255,${0.6*(1-p)})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(bx,by+1,4+p*14,(4+p*14)*0.35,0,0,6.29);ctx.stroke();}}
  else{const sw=Math.sin(t*9),a=-1.1+sw*0.9;ctx.save();ctx.translate(hx,hy+4);ctx.scale(f,1);ctx.rotate(a);ctx.strokeStyle='#7a4a22';ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-20);ctx.stroke();
    ctx.strokeStyle='#c8ccd4';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-8,-18);ctx.quadraticCurveTo(0,-24,9,-19);ctx.stroke();ctx.restore();
    if(sw>0.92&&Math.random()<0.6)for(let i=0;i<4;i++)fx.push({k:'p',x:player.x+f*24,y:player.y-8,vx:rnd(-40,40),vy:-rnd(30,70),col:Math.random()<.5?'#ffd77a':'#fff',t:0,life:0.35,sz:1.6});}};
