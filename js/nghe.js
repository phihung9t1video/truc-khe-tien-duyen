'use strict';
// ===================== NGHỀ NGHIỆP =====================
// Thu thập: Câu cá (đứng gần nước), Khai khoáng (gần đá/núi), Hái dược (hái cây thuốc), Săn thú (đánh quái rơi da/tơ).
// Chế tạo: Luyện đan (thuốc tăng sức mạnh 30 phút, Tẩy Tủy Đan tăng chỉ số vĩnh viễn), May mặc (áo giáp...), Rèn đúc (vũ khí, trang sức).
// Nguyên liệu có 5 bậc theo cấp bản đồ. Tay nghề 1–100: càng cao càng mở bậc mới, đồ càng dễ ra Thần thoại / Tuyệt phẩm.
const PF_MATS={
  herb:{n:'Dược liệu',l:['Thanh Linh Thảo','Tuyết Liên','Hỏa Linh Chi','Huyết Sâm','Thần Mộc Quả'],c:'#7aff9a',ic:'❀'},
  fish:{n:'Cá',l:['Cá Chép Vàng','Cá Hồi Linh','Bích Hải Ngư','Huyết Long Ngư','Thần Long Ngư'],c:'#7ad8ff',ic:'🐟'},
  ore:{n:'Khoáng',l:['Thiết Khoáng','Huyền Thiết','Tinh Kim','Huyết Tinh Thạch','Hỗn Nguyên Tinh'],c:'#d8c8a8',ic:'⛏'},
  hide:{n:'Da / tơ',l:['Da Thú','Tơ Linh Tằm','Da Giao Long','Huyết Ma Bì','Thiên Tằm Ti'],c:'#ffb07a',ic:'🧶'}};
const PF_SKILLS={fish:'Câu cá',mine:'Khai khoáng',herb:'Hái dược',alch:'Luyện đan',tailor:'May mặc',smith:'Rèn đúc'};
const PF_TIER_LV=[20,50,85,130,180],PF_TIER_SK=[0,20,40,60,80],PF_TIER_NAME=['Sơ','Trung','Cao','Huyền','Thần'];
const pfTierOfMap=()=>{const l=CM.pb?CM.pb.lv:(CM.minLv||1);return l>=150?4:l>=100?3:l>=60?2:l>=30?1:0;};
function pfData(){if(!player.prof||!player.prof.lv)player.prof={lv:{},xp:{},mat:{},buf:{},perm:{atk:0,hp:0,def:0,cnt:{}}};const P=player.prof;for(const k in PF_SKILLS){P.lv[k]=P.lv[k]||1;P.xp[k]=P.xp[k]||0;}return P;}
const pfNeed=l=>Math.round(20+l*l*1.2);
function pfXp(k,x){const P=pfData();if(P.lv[k]>=100)return;P.xp[k]+=x;while(P.lv[k]<100&&P.xp[k]>=pfNeed(P.lv[k])){P.xp[k]-=pfNeed(P.lv[k]);P.lv[k]++;toast(`${PF_SKILLS[k]} lên cấp ${P.lv[k]}`,'#9fffb0');}}
function pfGive(type,t,n,quiet){const P=pfData(),k=type+t;P.mat[k]=Math.min(9999,(P.mat[k]||0)+n);if(!quiet){const M=PF_MATS[type];addText(player.x,player.y-70,`+${n} ${M.l[t]}`,M.c,13);log(`Nhận ${n} ${M.l[t]}`,M.c);}}
const pfHas=(type,t)=>pfData().mat[type+t]||0;
// ---------- thu thập ----------
const PFA={kind:null,t:0,tot:0,rep:false};
function nearTile(set,r){const tx=Math.floor(player.x/T),ty=Math.floor(player.y/T);for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(set.includes(getT(tx+dx,ty+dy)))return true;return false;}
const canFish=()=>!inSafe(player)&&nearTile([WA,BR],2),canMine=()=>!inSafe(player)&&nearTile([RO,MO],1);
function pfStart(kind,rep){if(player.dead||player.riding&&false)return;if(kind==='fish'&&!canFish())return log('Hãy đứng sát bờ nước (ngoài thành) để câu cá','#ffb36b');
  if(kind==='mine'&&!canMine())return log('Hãy đứng sát tảng đá hoặc chân núi (ngoài thành) để khai khoáng','#ffb36b');
  if(auto){auto=false;log('Đã tắt tự động để làm nghề','#ccc');}player.path=[];player.target=null;navGoal=null;
  const sk=pfData().lv[kind];Object.assign(PFA,{kind,tot:Math.max(2.2,5-sk*0.025),rep:!!rep});PFA.t=PFA.tot;PFA.x=player.x;PFA.y=player.y;sfx('click');}
function pfTick(dt){const b=pfBar();if(!PFA.kind){b.hidden=true;return;}
  if(player.dead||Math.hypot(player.x-PFA.x,player.y-PFA.y)>6||player.target){PFA.kind=null;b.hidden=true;log('Đã dừng làm nghề','#ccc');return;}
  PFA.t-=dt;const k=PFA.kind;b.hidden=false;b.innerHTML=`${k==='fish'?'🎣 Đang câu cá':'⛏ Đang khai khoáng'} <div style="height:5px;background:#2a2218;border-radius:3px;margin-top:3px;overflow:hidden"><i style="display:block;height:100%;width:${(1-PFA.t/PFA.tot)*100}%;background:#ffd77a"></i></div>${PFA.rep?'<span style="font-size:11px;color:#9fffb0">tự lặp lại · bấm nút lần nữa hoặc đi chỗ khác để dừng</span>':''}`;
  if(Math.random()<dt*3)fx.push({k:'p',x:player.x+player.face*18+rnd(-4,4),y:player.y-rnd(0,6),vx:rnd(-10,10),vy:-20,col:k==='fish'?'#bfe8ff':'#d8c8a8',t:0,life:0.5,sz:1.8});
  if(PFA.t>0)return;const t=pfTierOfMap(),sk=pfData().lv[k],sm=k==='fish'?'fish':'mine';let n=1+(Math.random()<sk/150?1:0);
  if(k==='fish'&&Math.random()<0.04+sk/2000){const g=(t+1)*player.lv*30;player.gold+=g;log(`Câu được Kim Lý Ngư, bán được ${fmtN(g)} lượng!`,'#ffd23f');}
  pfGive(k==='fish'?'fish':'ore',t,n);pfXp(sm,4+t*2);sfx('gather');if(typeof dailyAdd==='function'&&k==='fish')dailyAdd('fish',1);
  if(PFA.rep&&(k==='fish'?canFish():canMine())){PFA.t=PFA.tot=Math.max(2.2,5-pfData().lv[k]*0.025);}else PFA.kind=null;}
function pfBar(){let b=$('pfBar');if(!b){b=document.createElement('div');b.id='pfBar';b.style.cssText='position:absolute;left:50%;bottom:130px;transform:translateX(-50%);z-index:6;padding:5px 12px;border-radius:10px;border:1px solid #c9a227;background:rgba(20,14,4,.85);color:#ffe9b0;font-size:13px;text-align:center;min-width:180px;pointer-events:none';$('hud').appendChild(b);}return b;}
// nút nhanh trên màn hình khi đứng gần nước / đá
(()=>{const q=document.createElement('div');q.id='pfQuick';q.style.cssText='position:absolute;right:12px;bottom:130px;z-index:6;display:flex;flex-direction:column;gap:6px';q.innerHTML='<button id="pfQFish" class="hdbtn" hidden>🎣 Câu cá</button><button id="pfQMine" class="hdbtn" hidden>⛏ Khai khoáng</button>';$('hud').appendChild(q);
  const tg=k=>{if(PFA.kind===k){PFA.kind=null;return;}pfStart(k,true);};$('pfQFish').onclick=()=>tg('fish');$('pfQMine').onclick=()=>tg('mine');
  setInterval(()=>{if(!started)return;$('pfQFish').hidden=!canFish();$('pfQMine').hidden=!canMine();$('pfQFish').textContent=PFA.kind==='fish'?'■ Dừng câu':'🎣 Câu cá';$('pfQMine').textContent=PFA.kind==='mine'?'■ Dừng đào':'⛏ Khai khoáng';},400);})();
// hái thuốc ra dược liệu; đánh quái rơi da/tơ
const _gatherPF=gatherDone;gatherDone=function(h){const r=_gatherPF(h);const sk=pfData().lv.herb;pfGive('herb',pfTierOfMap(),1+(Math.random()<sk/120?1:0));pfXp('herb',5+pfTierOfMap()*2);return r;};
const _killPF=killMob;killMob=function(m){const r=_killPF(m);if(!m.summoned&&!m.isFoe&&Math.random()<(m.t.boss?1:m.t.elite?0.4:0.12)){pfGive('hide',pfTierOfMap(),m.t.boss?3:1,!m.t.boss);}return r;};
// ---------- chế tạo ----------
const PF_PILLS=[
  {id:'atk',n:'Cuồng Lực Đan',d:'Công lực +15% trong 30 phút',need:[['herb',3],['fish',1]],buf:'atk',v:0.15},
  {id:'def',n:'Kim Cang Đan',d:'Phòng thủ +20% trong 30 phút',need:[['herb',3],['fish',1]],buf:'def',v:0.2},
  {id:'hp',n:'Sinh Cơ Đan',d:'Sinh lực +15% trong 30 phút',need:[['herb',3],['fish',1]],buf:'hp',v:0.15},
  {id:'crit',n:'Bạo Huyết Đan',d:'Bạo kích +8% trong 30 phút',need:[['herb',2],['fish',2]],buf:'crit',v:0.08},
  {id:'perm',n:'Tẩy Tủy Đan',d:'Vĩnh viễn: công lực, sinh lực, phòng thủ tăng (mỗi bậc dùng tối đa 10 viên)',need:[['herb',6],['fish',4],['ore',2]],perm:true}];
const PF_TAILOR=['armor','vest','helmet','boots','gloves','wrist'],PF_SMITH=['weapon','ring','necklace','amulet'];
const pfGold=t=>Math.round(200*Math.pow(4,t)*(1+t));
function pfCanMake(need,t){return need.every(([ty,n])=>pfHas(ty,t)>=n);}
function pfTake(need,t){const P=pfData();for(const [ty,n] of need)P.mat[ty+t]-=n;}
function pfMakePill(p,t){const P=pfData();if(P.lv.alch<PF_TIER_SK[t])return log(`Luyện đan cần tay nghề ${PF_TIER_SK[t]}`,'#ff9a8a');if(!pfCanMake(p.need,t))return log('Thiếu nguyên liệu','#ff9a8a');
  if(p.perm){const c=P.perm.cnt[t]||0;if(c>=10)return log('Đã dùng đủ 10 Tẩy Tủy Đan bậc này','#ffb36b');const g=pfGold(t)*3;if(player.gold<g)return log(`Cần ${fmtN(g)} lượng`,'#ff9a8a');player.gold-=g;}
  pfTake(p.need,t);pfXp('alch',6+t*4);const sk=P.lv.alch,dbl=Math.random()<sk/250;
  if(p.perm){P.perm.cnt[t]=(P.perm.cnt[t]||0)+1;P.perm.atk+=6*(t+1)*(t+1);P.perm.hp+=60*(t+1)*(t+1);P.perm.def+=3*(t+1)*(t+1);toast(`Dùng Tẩy Tủy Đan bậc ${PF_TIER_NAME[t]}: chỉ số tăng vĩnh viễn`,'#ffd23f');}
  else{const sec=1800*(1+t*0.25)*(dbl?2:1);P.buf[p.buf]={v:p.v*(1+t*0.2),t:Math.max((P.buf[p.buf]||{}).t||0,0)+sec};toast(`${p.n} (${PF_TIER_NAME[t]}): ${p.d.replace('30 phút',Math.round(sec/60)+' phút')}${dbl?' · luyện khéo, gấp đôi thời gian!':''}`,'#9fffb0');}
  sfx('heal');save();renderPF();}
function pfMakeGear(kind,slot,t){const P=pfData(),sk=P.lv[kind];if(sk<PF_TIER_SK[t])return log(`${PF_SKILLS[kind]} cần tay nghề ${PF_TIER_SK[t]}`,'#ff9a8a');
  const need=kind==='tailor'?[['hide',4],['herb',2]]:[['ore',4],['hide',2]];if(!pfCanMake(need,t))return log('Thiếu nguyên liệu','#ff9a8a');const g=pfGold(t);if(player.gold<g)return log(`Cần ${fmtN(g)} lượng`,'#ff9a8a');
  if(player.inv.length>=BAG_MAX)return log('Túi đồ đã đầy','#ff9a8a');player.gold-=g;pfTake(need,t);pfXp(kind,8+t*5);
  const tier=Math.max(0,TIER_LV.reduce((a,v,i)=>PF_TIER_LV[t]>=v?i:a,0)),r=Math.random(),rar=r<sk/400?4:r<0.35+sk/300?3:2,top=sk>=80&&Math.random()<0.06;
  const it=makeItem(slot,tier,top?Math.max(3,rar):rar,SECTS[player.sect].wtype);const k=top?1.35:1.15;for(const s in it.st)it.st[s]=Math.round(it.st[s]*k);it.name=(top?'Tuyệt phẩm ':'Chế tác · ')+it.name;it.crafted=top?2:1;it.price=Math.round(it.price*1.5);
  player.inv.push(it);toast(`${top?'TUYỆT PHẨM! ':''}Chế được ${it.name} (${RARITY[it.rar].n})`,top?'#ff6aff':RARITY[it.rar].c);log(`${PF_SKILLS[kind]}: chế được ${it.name} (${RARITY[it.rar].n})`,RARITY[it.rar].c);sfx(top?'level':'equip');save();renderPF();}
// thuốc và Tẩy Tủy Đan cộng vào chỉ số
const _statsPF=stats;stats=function(){const s=_statsPF();if(!player.sect)return s;const P=pfData(),B=P.buf;
  s.atk=Math.round((s.atk+P.perm.atk)*(1+((B.atk&&B.atk.t>0)?B.atk.v:0)));s.def=Math.round((s.def+P.perm.def)*(1+((B.def&&B.def.t>0)?B.def.v:0)));
  s.maxhp=Math.round((s.maxhp+P.perm.hp)*(1+((B.hp&&B.hp.t>0)?B.hp.v:0)));if(B.crit&&B.crit.t>0)s.crit+=B.crit.v;return s;};
setInterval(()=>{if(!started||!player.prof)return;for(const k in player.prof.buf){const b=player.prof.buf[k];if(b.t>0)b.t-=1;}},1000);
setInterval(()=>{if(started)pfTick(0.1);},100);
// ---------- bảng Nghề ----------
const PFU={tab:'gather',tier:0};
(()=>{const p=document.createElement('div');p.id='panelPF';p.className='panel modal';p.hidden=true;p.style.width='620px';
  p.innerHTML='<button class="close">✕</button><h3 class="serif">Nghề nghiệp</h3><div id="pfTabs" style="display:flex;gap:4px;flex-wrap:wrap"></div><div id="pfBody" style="max-height:62vh;overflow-y:auto;margin-top:8px"></div>';
  $('hud').appendChild(p);p.querySelector('.close').onclick=()=>{p.hidden=true;$('tip').hidden=true;};PANELS.push('panelPF');
  const b=document.createElement('button');b.id='btnPF';b.textContent='Nghề';b.onclick=()=>{openPanel('panelPF');renderPF();};$('menuBtns').insertBefore(b,$('btnSet'));})();
const PF_TABS=[['gather','Thu thập'],['alch','Luyện đan'],['tailor','May mặc'],['smith','Rèn đúc'],['bag','Nguyên liệu']];
function pfSkillRow(k){const P=pfData(),l=P.lv[k];return`<div style="font-size:12px;color:#cfc0a0">${PF_SKILLS[k]} cấp <b style="color:#ffe27a">${l}</b>/100${l<100?` · ${P.xp[k]}/${pfNeed(l)}`:''}</div>`;}
function pfMatTxt(need,t){return need.map(([ty,n])=>{const h=pfHas(ty,t);return`<span style="color:${h>=n?'#9fffb0':'#ff9a8a'}">${PF_MATS[ty].l[t]} ${h}/${n}</span>`;}).join(' · ');}
function pfTierSel(sk){return`<div style="margin:4px 0">Bậc: ${PF_TIER_NAME.map((n,i)=>`<button class="hdbtn" data-pft="${i}" style="${PFU.tier===i?'border-color:#ffd77a;color:#fff':''}" ${sk>=PF_TIER_SK[i]?'':'disabled'}>${n}${sk<PF_TIER_SK[i]?' ('+PF_TIER_SK[i]+')':''}</button>`).join(' ')}</div>`;}
function renderPF(){if($('panelPF').hidden)return;$('pfTabs').innerHTML=PF_TABS.map(([k,n])=>`<button data-k="${k}" class="hdbtn" style="flex:1;${PFU.tab===k?'border-color:#ffd77a;background:linear-gradient(#8a6a2a,#5a4218);color:#fff6d0':''}">${n}</button>`).join('');
  $('pfTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{PFU.tab=b.dataset.k;sfx('click');renderPF();});const P=pfData(),B=$('pfBody'),t=pfTierOfMap();let h='';
  if(PFU.tab==='gather'){h=`<div class="hdnote">Nguyên liệu bậc <b style="color:#ffe27a">${PF_TIER_NAME[t]}</b> ở bản đồ này (bậc theo cấp bản đồ). Tay nghề càng cao làm càng nhanh, càng dễ được gấp đôi.</div>
    <div class="hdrow"><div class="ic">🎣</div><div class="tx"><b>Câu cá</b> · đứng sát bờ nước (ngoài thành). Có lúc câu được Kim Lý Ngư bán được nhiều lượng.${pfSkillRow('fish')}</div><button id="pfFish" ${canFish()?'':'disabled'}>${canFish()?'Câu (tự lặp)':'Ra gần nước'}</button></div>
    <div class="hdrow"><div class="ic">⛏</div><div class="tx"><b>Khai khoáng</b> · đứng sát tảng đá hoặc chân núi (ngoài thành).${pfSkillRow('mine')}</div><button id="pfMine" ${canMine()?'':'disabled'}>${canMine()?'Đào (tự lặp)':'Ra gần đá'}</button></div>
    <div class="hdrow"><div class="ic">❀</div><div class="tx"><b>Hái dược</b> · hái cây thuốc mọc trên bản đồ (nhấp vào cây thuốc) để có dược liệu.${pfSkillRow('herb')}</div></div>
    <div class="hdrow"><div class="ic">🧶</div><div class="tx"><b>Săn thú</b> · đánh quái có lúc rơi da/tơ (trùm và tinh anh rơi nhiều hơn).</div></div>`;}
  else if(PFU.tab==='alch'){h=`<div class="hdnote">Luyện đan từ dược liệu và cá cùng bậc. Thuốc bậc cao mạnh hơn và lâu hơn. Tay nghề cao có thể luyện khéo, gấp đôi thời gian.</div>${pfSkillRow('alch')}${pfTierSel(P.lv.alch)}`;
    for(const p of PF_PILLS){const c=p.perm?(P.perm.cnt[PFU.tier]||0):0,b=P.buf[p.buf];h+=`<div class="hdrow"><div class="ic">💊</div><div class="tx"><b>${p.n}</b> · ${p.d}${p.perm?` (đã dùng ${c}/10, cần thêm ${fmtN(pfGold(PFU.tier)*3)} lượng)`:b&&b.t>0?` · <span style="color:#9fffb0">đang có ${Math.ceil(b.t/60)} phút</span>`:''}<br>${pfMatTxt(p.need,PFU.tier)}</div><button data-pill="${p.id}">Luyện</button></div>`;}
    h+=`<div class="hdnote">Tẩy Tủy Đan đã dùng: công lực +${P.perm.atk}, sinh lực +${P.perm.hp}, phòng thủ +${P.perm.def}</div>`;}
  else if(PFU.tab==='tailor'||PFU.tab==='smith'){const k=PFU.tab,need=k==='tailor'?[['hide',4],['herb',2]]:[['ore',4],['hide',2]],list=k==='tailor'?PF_TAILOR:PF_SMITH;
    h=`<div class="hdnote">${k==='tailor'?'May áo, giáp, mũ, giày, găng, hộ uyển':'Rèn vũ khí, nhẫn, dây chuyền, hộ phù'} bậc ${PF_TIER_NAME[PFU.tier]} (đồ cấp ${PF_TIER_LV[PFU.tier]}). Đồ chế tác mạnh hơn đồ thường 15%; tay nghề càng cao càng dễ ra Truyền thuyết, Thần thoại. Tay nghề 80+ có cơ hội ra <b style="color:#ff8aff">Tuyệt phẩm</b> (mạnh hơn 35%).</div>${pfSkillRow(k)}${pfTierSel(P.lv[k])}
      <div class="hdnote">Mỗi món: ${pfMatTxt(need,PFU.tier)} · ${fmtN(pfGold(PFU.tier))} lượng</div>`;
    for(const sl of list){const nm=sl==='weapon'?SLOT_SUF[SECTS[player.sect].wtype]:SLOT_SUF[sl];h+=`<div class="hdrow"><div class="ic">${itemIcon({slot:sl,wtype:SECTS[player.sect].wtype,tier:Math.max(0,TIER_LV.reduce((a,v,i)=>PF_TIER_LV[PFU.tier]>=v?i:a,0)),rar:3},'sm')}</div><div class="tx"><b>${nm}</b> · ${SLOTNAME[sl]}</div><button data-gear="${sl}">Chế tạo</button></div>`;}}
  else{h='<div class="hdnote">Nguyên liệu đang có:</div>';for(const ty in PF_MATS){const M=PF_MATS[ty];h+=`<div class="hdrow"><div class="ic">${M.ic}</div><div class="tx"><b style="color:${M.c}">${M.n}</b><br>${M.l.map((n,i)=>`${n}: <b>${pfHas(ty,i)}</b>`).join(' · ')}</div></div>`;}}
  B.innerHTML=h;
  if($('pfFish'))$('pfFish').onclick=()=>{$('panelPF').hidden=true;pfStart('fish',true);};if($('pfMine'))$('pfMine').onclick=()=>{$('panelPF').hidden=true;pfStart('mine',true);};
  B.querySelectorAll('[data-pft]').forEach(b=>b.onclick=()=>{PFU.tier=+b.dataset.pft;renderPF();});
  B.querySelectorAll('[data-pill]').forEach(b=>b.onclick=()=>pfMakePill(PF_PILLS.find(p=>p.id===b.dataset.pill),PFU.tier));
  B.querySelectorAll('[data-gear]').forEach(b=>b.onclick=()=>pfMakeGear(PFU.tab,b.dataset.gear,PFU.tier));}
// hiển thị thuốc đang có trên thanh hỗ trợ
setInterval(()=>{if(!started||!player.prof)return;const el=$('buffs');if(!el)return;el.querySelectorAll('.pfb').forEach(o=>o.remove());
  const B=player.prof.buf,names={atk:['Cuồng Lực','⚔'],def:['Kim Cang','🛡'],hp:['Sinh Cơ','❤'],crit:['Bạo Huyết','✸']};
  const h=Object.entries(B).filter(([k,b])=>b.t>0&&names[k]).map(([k,b])=>`<div class="buff pfb" style="color:#9fffb0"><i>${names[k][1]}</i><em>${names[k][0]}</em><span>${Math.floor(b.t/60)}:${String(Math.floor(b.t%60)).padStart(2,'0')}</span></div>`).join('');
  if(h)el.insertAdjacentHTML('beforeend',h);},500);
