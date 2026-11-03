'use strict';
// ===================== HOẠT ĐỘNG: HẰNG NGÀY · TRÙM THẾ GIỚI · PHÓ BẢN · LÔI ĐÀI =====================
// Mở bằng nút "Hoạt động". Bang hội nằm ở banghoi.js (cùng bảng này, tab cuối).
const HD={tab:'daily'};
const dayKey=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();};
const fmtN=n=>Math.round(n).toLocaleString('vi-VN');
const mmss=s=>{s=Math.max(0,Math.ceil(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;return(h?h+':'+String(m).padStart(2,'0'):m)+':'+String(x).padStart(2,'0');};
// bảng chung
(()=>{const p=document.createElement('div');p.id='panelHD';p.className='panel modal';p.hidden=true;p.style.width='620px';
  p.innerHTML='<button class="close">✕</button><h3 class="serif">Hoạt động</h3><div id="hdTabs"></div><div id="hdBody" style="max-height:64vh;overflow-y:auto;margin-top:8px"></div>';
  $('hud').appendChild(p);p.querySelector('.close').onclick=()=>{p.hidden=true;$('tip').hidden=true;};PANELS.push('panelHD');
  const b=document.createElement('button');b.id='btnHD';b.textContent='Hoạt động';b.onclick=()=>{openPanel('panelHD');renderHD();};$('menuBtns').insertBefore(b,$('btnSet'));
  const st=document.createElement('style');st.textContent=`#hdTabs{display:flex;gap:4px;flex-wrap:wrap}#hdTabs button{flex:1;min-width:90px;padding:7px 4px;border-radius:8px;border:1px solid #6a5634;background:linear-gradient(#3a2e22,#241c14);color:#e8d6a8;font-weight:bold;cursor:pointer;font-family:inherit;font-size:13px}
#hdTabs button.sel{background:linear-gradient(#8a6a2a,#5a4218);color:#fff6d0;border-color:#ffd77a}.hdrow{display:flex;align-items:center;gap:10px;border:1px solid #4a3e2a;border-radius:9px;padding:8px;margin:6px 0;background:rgba(0,0,0,.3)}
.hdrow .ic{font-size:24px;width:34px;text-align:center}.hdrow .tx{flex:1;font-size:13px}.hdrow .tx b{color:#ffe9b0}.hdbar{height:6px;background:#2a2218;border-radius:3px;overflow:hidden;margin-top:4px}.hdbar i{display:block;height:100%;background:linear-gradient(90deg,#5ae07a,#c8ff9a)}
.hdrow button,.hdbtn{padding:6px 10px;border-radius:7px;border:1px solid #6a5634;background:linear-gradient(#5a4628,#33281a);color:#ffe9b0;cursor:pointer;font-family:inherit;font-size:13px}.hdrow button:disabled,.hdbtn:disabled{opacity:.45;cursor:default}
.hdnote{color:#aaa;font-size:12px;margin:4px 0}#wbBanner{position:absolute;left:50%;top:66px;transform:translateX(-50%);z-index:6;padding:5px 12px;border-radius:10px;border:1px solid #ff7a4a;background:rgba(40,8,4,.82);color:#ffe0c0;font-size:13px;text-align:center;pointer-events:auto;box-shadow:0 0 12px rgba(255,90,40,.5)}
#wbBanner button{margin-left:8px;padding:3px 8px;border-radius:6px;border:1px solid #ffb07a;background:#6a2a14;color:#fff;cursor:pointer;font-family:inherit}#wbBanner .rk{font-size:11.5px;color:#ffd0a0;margin-top:2px}`;document.head.appendChild(st);})();
const HD_TABS=[['daily','Hằng ngày'],['wb','Trùm thế giới'],['pb','Phó bản'],['ld','Lôi đài'],['guild','Bang hội']];
function renderHD(){if($('panelHD').hidden)return;$('hdTabs').innerHTML=HD_TABS.map(([k,n])=>`<button data-t="${k}" class="${HD.tab===k?'sel':''}">${n}</button>`).join('');
  $('hdTabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{HD.tab=b.dataset.t;sfx('click');renderHD();});
  const f={daily:renderDaily,wb:renderWB,pb:renderPB,ld:renderLD,guild:typeof renderGuild==='function'?renderGuild:()=>{$('hdBody').innerHTML='';}}[HD.tab];f($('hdBody'));}
setInterval(()=>{if(started&&!$('panelHD').hidden&&HD.tab!=='guild')renderHD();},1000);
// ---------- móc sự kiện ----------
const _killMobHD=killMob;killMob=function(m){const r=_killMobHD(m);if(CM.pb)m.respawn=1e9;if(m.wb)wbOnDead(m);if(!m.summoned&&!m.isFoe){dailyAdd('kill',1);if(m.t.boss)dailyAdd('boss',1);}return r;};
const _silentKillHD=silentKill;silentKill=function(m){const was=m.dead;_silentKillHD(m);if(CM.pb)m.respawn=1e9;if(!was&&m.wb)wbOnDead(m);};
const _gatherDoneHD=gatherDone;gatherDone=function(h){const r=_gatherDoneHD(h);dailyAdd('herb',1);return r;};
const _hurtMobHD=hurtMob;hurtMob=function(m,r){const hp0=m.hp;_hurtMobHD(m,r);if(m.wb&&!m.isFoe)WB.dmg+=Math.max(0,hp0-Math.max(0,m.hp));};
const _loadMapHD=loadMap;loadMap=function(...a){const prev=curMapId;const r=_loadMapHD.apply(this,a);
  if(prev&&MAPS[prev]&&MAPS[prev].pb&&prev!==curMapId){delete MAPS[prev];PB.cur=null;}wbEnsure();return r;};
// ===================== 1. NHIỆM VỤ HẰNG NGÀY =====================
const DAILY=[
  {k:'kill',n:'Diệt quái',d:'Hạ 150 quái bất kỳ',need:150,ic:'⚔',rw:'exp'},
  {k:'boss',n:'Săn trùm',d:'Hạ 2 trùm (trùm bản đồ hoặc trùm phó bản)',need:2,ic:'☠',rw:'cn'},
  {k:'herb',n:'Hái thuốc',d:'Hái 10 cây thuốc',need:10,ic:'❀',rw:'pot'},
  {k:'wb',n:'Trùm thế giới',d:'Tham gia đánh Trùm thế giới 1 lần',need:1,ic:'🔥',rw:'cn2'},
  {k:'pb',n:'Phó bản',d:'Vượt qua 1 phó bản',need:1,ic:'⛩',rw:'luck',lv:20},
  {k:'pvp',n:'Lôi đài',d:'Tỷ thí 1 trận',need:1,ic:'⚡',rw:'gold',lv:10},
  {k:'don',n:'Cống hiến bang',d:'Cống hiến cho bang hội 1 lần',need:1,ic:'🏯',rw:'gold'}];
function dailyData(){const k=dayKey();if(!player.daily||player.daily.day!==k)player.daily={day:k,c:{},got:{},bonus:false,pb:0};return player.daily;}
function dailyAdd(k,n){if(!player.sect)return;const D=dailyData();const T=DAILY.find(x=>x.k===k);if(!T)return;const before=D.c[k]||0;D.c[k]=Math.min(T.need,before+n);
  if(before<T.need&&D.c[k]>=T.need){toast(`Hoàn thành nhiệm vụ ngày: ${T.n}`,'#9fffb0');log(`Nhiệm vụ hằng ngày "${T.n}" xong, mở Hoạt động để nhận thưởng`,'#9fffb0');}}
function dailyReward(T){const l=player.lv,e=Math.round(expNeed(l)*0.04);gainExp(e);let msg=`${fmtN(e)} kinh nghiệm`;
  if(T.rw==='exp'){player.gold+=l*300;msg+=`, ${fmtN(l*300)} lượng`;}
  else if(T.rw==='gold'){player.gold+=l*800;msg+=`, ${fmtN(l*800)} lượng`;}
  else if(T.rw==='pot'){player.hpPot+=20;player.mpPot+=20;msg+=', 20 Kim Sang Dược, 20 Ngưng Thần Đan';}
  else if(T.rw==='luck'){player.luck=(player.luck||0)+2;msg+=', 2 May Mắn Phù';}
  else if(T.rw==='cn'&&typeof giveCN==='function'&&l>=20){giveCN(newCN(CN_KEYS[rint(0,5)],rollCNq(0.05)),'Thưởng ngày');}
  else if(T.rw==='cn2'&&typeof giveCN==='function'&&l>=20){giveCN(newCN(CN_KEYS[rint(0,5)],Math.max(2,rollCNq(0.1))),'Thưởng ngày');}
  else{player.gold+=l*300;msg+=`, ${fmtN(l*300)} lượng`;}return msg;}
function renderDaily(B){const D=dailyData(),list=DAILY.filter(T=>!T.lv||player.lv>=T.lv),done=list.filter(T=>D.got[T.k]).length,need=Math.min(5,list.length);
  const now=new Date(),mid=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1);
  let h=`<div class="hdnote">Làm mới sau <b style="color:#ffe27a">${mmss((mid-now)/1000)}</b>. Đã nhận ${done}/${list.length}. Nhận đủ ${need} nhiệm vụ được thêm phần thưởng lớn.</div>`;
  for(const T of list){const c=D.c[T.k]||0,ok=c>=T.need,got=D.got[T.k];
    h+=`<div class="hdrow"><div class="ic">${T.ic}</div><div class="tx"><b>${T.n}</b> · ${T.d}<div class="hdbar"><i style="width:${c/T.need*100}%"></i></div>${c}/${T.need}</div><button data-dk="${T.k}" ${ok&&!got?'':'disabled'}>${got?'Đã nhận':ok?'Nhận':'Chưa xong'}</button></div>`;}
  h+=`<div class="hdrow" style="border-color:#c9a227"><div class="ic">🎁</div><div class="tx"><b>Thưởng chuyên cần</b> · Nhận đủ ${need} nhiệm vụ trong ngày: Tam Bội Kinh Nghiệm 30 phút, Chân Nguyên phẩm Huyền trở lên, 20% nhận Thần Đỉnh</div><button id="dkBonus" ${done>=need&&!D.bonus?'':'disabled'}>${D.bonus?'Đã nhận':'Nhận'}</button></div>`;
  B.innerHTML=h;
  B.querySelectorAll('[data-dk]').forEach(b=>b.onclick=()=>{const T=DAILY.find(x=>x.k===b.dataset.dk);if(D.got[T.k]||(D.c[T.k]||0)<T.need)return;D.got[T.k]=1;const m=dailyReward(T);sfx('coin');log(`Nhận thưởng "${T.n}": ${m}`,'#ffe27a');save();renderHD();});
  if($('dkBonus'))$('dkBonus').onclick=()=>{if(D.bonus)return;D.bonus=true;addExpBuff(2,1800);if(typeof giveCN==='function'&&player.lv>=20)giveCN(newCN(CN_KEYS[rint(0,5)],Math.max(2,rollCNq(0.1))),'Chuyên cần');
    if(typeof giveTD==='function'&&player.lv>=30&&Math.random()<0.2){let g=0;for(let i=0;i<TD_LIST.length;i++)if(player.lv>=TD_LIST[i].lv)g=i;giveTD(g,'Chuyên cần');}sfx('level');save();renderHD();};}
// ===================== 2. TRÙM THẾ GIỚI =====================
// Mỗi 3 giờ (0h, 3h, 6h... 21h) trùm thế giới xuất hiện cùng lúc ở 5 bản đồ, tồn tại 20 phút.
// Ai gây sát thương đều được thưởng theo phần sát thương của mình; người ra đòn cuối nhận thêm đồ của trùm.
const WB_EVERY=3,WB_LEN=20*60;
const WB_LOC=[{map:'vanmong',lv:24,name:'Hắc Thủy Long Vương'},{map:'uminh',lv:55,name:'U Minh Quỷ Vương'},{map:'longcung',lv:83,name:'Bích Hải Giao Vương'},{map:'huyethai',lv:133,name:'Huyết Ma Thiên Vương'},{map:'honnguyen',lv:199,name:'Hỗn Độn Thiên Ma'}];
const WB={dmg:0,key:null,got:{},rank:new Map(),sendT:0};
function wbNow(){const d=new Date(),h=d.getHours(),s=d.getMinutes()*60+d.getSeconds();const slot=h-h%WB_EVERY,into=(h-slot)*3600+s;
  const key=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+'-'+slot;return{active:into<WB_LEN,left:WB_LEN-into,next:WB_EVERY*3600-into,key};}
function wbLocHere(){return WB_LOC.findIndex(L=>L.map===curMapId);}
function wbEnsure(){const n=wbNow(),i=wbLocHere();if(n.key!==WB.key){WB.key=n.key;WB.dmg=0;WB.rank.clear();}
  const ex=mobs.find(m=>m.wb);if(!n.active||i<0||WB.got[n.key+i]){if(ex&&!ex.dead){const j=mobs.indexOf(ex);if(j>=0)mobs.splice(j,1);if(player.target===ex)player.target=null;}return;}
  if(ex)return;const L=WB_LOC[i],bk=Object.keys(CM.zones).find(k=>MT[k]&&MT[k].boss&&!k.startsWith('e_'));if(!bk)return;const B=MT[bk];
  const t=Object.assign({},B,{name:'【Trùm thế giới】 '+L.name,lv:[L.lv,L.lv],hp:Math.round(B.hp*70*Math.pow(1.02,L.lv-(B.lv?B.lv[0]:L.lv))),atk:Math.round(B.atk*1.25),def:Math.round(B.def*1.15),exp:Math.round(B.exp*2),boss:true,aggro:280,scale:(B.scale||1.6)*1.4,loot:1,wbBoss:true});
  const m={type:bk,t};spawnMob(m);const z=CM.zones[bk];let x=z.x*T+16,y=z.y*T+16;
  for(let r=0;r<8&&!canStand(x,y);r++)for(let a=0;a<8;a++){const xx=z.x*T+16+Math.cos(a*0.785)*r*32,yy=z.y*T+16+Math.sin(a*0.785)*r*32;if(canStand(xx,yy)){x=xx;y=yy;break;}}
  Object.assign(m,{x,y,hx:x,hy:y,lv:L.lv,i:9000+i,wb:true});m.maxhp=m.hp=t.hp;m.atk=t.atk;m.armor=t.def;mobs.push(m);
  log(`${L.name} đang hoành hành ở ${CM.name}!`,'#ff8a5a');}
function wbOnDead(m){const n=wbNow(),i=wbLocHere(),k=n.key+i;if(WB.got[k])return;WB.got[k]=1;const share=Math.min(1,WB.dmg/m.maxhp);
  setTimeout(()=>{const j=mobs.indexOf(m);if(j>=0)mobs.splice(j,1);},1500);
  if(share<0.002){log(`${m.t.name} đã bị hạ. Bạn chưa kịp gây sát thương nên không có thưởng.`,'#ccc');return;}
  const L=WB_LOC[i],gap=Math.max(0,player.lv-L.lv-10),k2=Math.max(0.2,1-gap*0.06),e=Math.round(expNeed(player.lv)*(0.08+Math.min(0.5,share*2.5))*k2),g=Math.round(L.lv*400*(1+share*12));
  gainExp(e);player.gold+=g;dailyAdd('wb',1);let extra='';
  if(typeof giveCN==='function'&&player.lv>=20)giveCN(newCN(CN_KEYS[rint(0,5)],share>=0.15?Math.max(3,rollCNq(0.15)):Math.max(2,rollCNq(0.08))),'Trùm thế giới');
  if(typeof giveTD==='function'&&player.lv>=30&&Math.random()<(share>=0.1?0.25:0.08)){let gg=0;for(let x=0;x<TD_LIST.length;x++)if(L.lv>=TD_LIST[x].lv-10)gg=x;giveTD(gg,'Trùm thế giới');}
  if(L.lv>=80&&Math.random()<(share>=0.2?0.15:0.04)){const S=SETS.trunglau,it=makeSetItem(S.pieces[rint(0,S.pieces.length-1)],'trunglau');addItem(it);extra=`, ${it.name}`;toast(`Trùm thế giới rơi ${it.name}!`,S.col);}
  toast(`Hạ ${L.name}! Phần của bạn: ${(share*100).toFixed(1)}%`,'#ffd23f');log(`Trùm thế giới: bạn gây ${(share*100).toFixed(1)}% sát thương, nhận ${fmtN(e)} kinh nghiệm, ${fmtN(g)} lượng${extra}`,'#ffd23f');sfx('level');save();}
// bảng xếp hạng sát thương (gửi qua phòng bản đồ)
function wbTick(dt){if(!started)return;const n=wbNow();
  if(n.key!==WB.key||(n.active&&wbLocHere()>=0&&!mobs.some(m=>m.wb)&&!WB.got[n.key+wbLocHere()])||(!n.active&&mobs.some(m=>m.wb)))wbEnsure();
  WB.sendT-=dt;const wb=mobs.find(m=>m.wb&&!m.dead);if(wb&&WB.dmg>0&&WB.sendT<=0&&NET.status==='on'&&NET.mapRoom){WB.sendT=6;netCast(NET.mapRoom,'xwb',{id:NET.id,name:player.name,d:Math.round(WB.dmg),map:curMapId});}
  wbBanner(n,wb);}
function wbBanner(n,wb){let b=$('wbBanner');if(!b){b=document.createElement('div');b.id='wbBanner';$('hud').appendChild(b);}
  const soon=!n.active&&n.next<=300;if(!n.active&&!soon){b.hidden=true;return;}b.hidden=false;
  if(soon){b.innerHTML=`🔥 Trùm thế giới xuất hiện sau <b>${mmss(n.next)}</b> <button id="wbGo">Xem</button>`;}
  else if(wb){const rows=[[player.name,WB.dmg],...[...WB.rank.values()].map(r=>[r.name,r.d])].sort((a,c)=>c[1]-a[1]).slice(0,3);
    b.innerHTML=`🔥 <b>${esc(wb.t.name.replace('【Trùm thế giới】 ',''))}</b> · máu ${(wb.hp/wb.maxhp*100).toFixed(1)}% · còn ${mmss(n.left)}<div class="rk">${rows.map((r,i)=>`${i+1}. ${esc(r[0])} ${(r[1]/wb.maxhp*100).toFixed(1)}%`).join(' · ')}</div>`;}
  else b.innerHTML=`🔥 Trùm thế giới đang xuất hiện · còn <b>${mmss(n.left)}</b> <button id="wbGo">Đi đánh</button>`;
  if($('wbGo'))$('wbGo').onclick=()=>{HD.tab='wb';openPanel('panelHD');renderHD();};}
function renderWB(B){const n=wbNow();let h=`<div class="hdnote">Mỗi 3 giờ (0h, 3h, 6h, 9h, 12h, 15h, 18h, 21h) trùm thế giới xuất hiện cùng lúc ở 5 bản đồ, tồn tại 20 phút. Mọi người cùng đánh; ai gây sát thương đều được thưởng theo phần sát thương: kinh nghiệm, lượng, Chân Nguyên, có thể nhận Thần Đỉnh và đồ Trùng Lâu (trùm cấp 80 trở lên).</div>
  <div class="hdnote" style="color:#ffd0a0;font-size:14px">${n.active?`Đang diễn ra · còn <b>${mmss(n.left)}</b>`:`Lần tới sau <b>${mmss(n.next)}</b>`}</div>`;
  WB_LOC.forEach((L,i)=>{const M=MAPS[L.map],ok=player.lv>=M.minLv,got=WB.got[n.key+i];
    h+=`<div class="hdrow"><div class="ic">🔥</div><div class="tx"><b>${L.name}</b> · cấp ${L.lv}<br>Tại ${M.name} (bản đồ cấp ${M.lvText})${got?' · <span style="color:#9fffb0">đã hạ</span>':''}</div><button data-wbg="${L.map}" ${ok?'':'disabled'}>${ok?'Đi tới':'Cần cấp '+M.minLv}</button></div>`;});
  B.innerHTML=h;B.querySelectorAll('[data-wbg]').forEach(b=>b.onclick=()=>{const id=b.dataset.wbg;$('panelHD').hidden=true;if(id===curMapId){const z=WB_LOC.find(L=>L.map===id);log('Trùm ở khu trùm của bản đồ này','#ffb36b');return;}
    if(navTo(id,null,null))log(`Đang tìm đường tới ${MAPS[id].name}... (hoặc dùng Truyền Tống Sứ ở thành để tới nhanh)`,'#8fd8ff');});}
// ===================== 3. PHÓ BẢN TỔ ĐỘI =====================
// Vào phó bản: một bản đồ riêng cho bạn (hoặc cả tổ đội), quái mạnh hơn và không hồi sinh. Diệt sạch quái và trùm trong 15 phút để nhận thưởng.
// Mỗi ngày vào được 3 lần. Đội trưởng bấm vào thì cả đội (cùng đủ cấp) được đưa vào cùng phó bản.
const PB_LIST=[{id:'pb1',name:'Lang Sơn Động',lv:20,src:'thienson'},{id:'pb2',name:'U Minh Quỷ Vực',lv:45,src:'uminh'},{id:'pb3',name:'Long Cung Bí Cảnh',lv:75,src:'longcung'},
  {id:'pb4',name:'Huyết Hải Ma Quật',lv:115,src:'huyethai'},{id:'pb5',name:'Thần Mộc Cấm Địa',lv:165,src:'thanmoc'}];
const PB_TIME=15*60,PB_MAX=3;
const PB={cur:null,t:0,done:false,inst:null,total:0};
function pbBuild(P,inst){const S=JSON.parse(JSON.stringify(MAPS[P.src])),zones={};
  for(const k in S.zones){const b=MT[k];if(!b)continue;const key='pb_'+k;
    MT[key]=Object.assign({},b,{name:b.name,hp:Math.round(b.hp*(b.boss?8:3)),atk:Math.round(b.atk*1.35),def:Math.round(b.def*1.15),exp:Math.round(b.exp*(b.boss?2:3)),loot:Math.min(1,(b.loot||0.2)*2),aggro:b.boss?220:Math.max(170,b.aggro||0),elite:b.elite});
    const z=S.zones[k];zones[key]=Object.assign({},z,{n:b.boss?1:Math.max(4,Math.ceil(z.n*0.8))});}
  Object.assign(S,{name:'Phó bản: '+P.name,zones,npcs:[],portals:[],herbs:{name:'',zones:[]},minLv:999,lvText:'phó bản cấp '+P.lv,pb:{id:P.id,back:P.src,lv:P.lv,name:P.name},inst});
  S.regions=[{n:P.name,x:S.revive[0],y:S.revive[1],r:6}];return S;}
function pbEnter(P,inst,fromLeader){if(CM.pb)return log('Bạn đang ở trong phó bản','#ffb36b');if(player.lv<P.lv)return log(`Cần đạt cấp ${P.lv}`,'#ff9a8a');
  const D=dailyData();if((D.pb||0)>=PB_MAX)return log(`Hôm nay đã vào phó bản ${PB_MAX} lần`,'#ffb36b');
  D.pb=(D.pb||0)+1;const id=P.id+'_'+inst;MAPS[id]=pbBuild(P,inst);auto&&player.autoMode==='here'&&(player.autoMode='quest');navGoal=null;player.target=null;
  Object.assign(PB,{cur:P,t:PB_TIME,done:false,inst,total:0});loadMap(id);PB.total=mobs.filter(m=>!m.summoned).length;
  toast(`Vào phó bản ${P.name}`,'#ffd23f');log(`Phó bản ${P.name}: diệt sạch ${PB.total} quái và trùm trong 15 phút. (Còn ${PB_MAX-D.pb} lượt hôm nay)`,'#ffd23f');save();
  if(!fromLeader&&typeof inParty==='function'&&inParty()&&isLeader()&&NET.status==='on')netCast('tk_world','xpb',{id:NET.id,pb:P.id,inst,members:PARTY.members.map(m=>m.id)});}
function pbLeave(msg){if(!CM.pb)return;const back=CM.pb.back;PB.cur=null;loadMap(back);if(msg)log(msg,'#ccc');}
function pbTick(dt){if(!CM.pb||!started)return;let b=$('pbBar');if(!b){b=document.createElement('div');b.id='pbBar';b.style.cssText='position:absolute;left:50%;top:66px;transform:translateX(-50%);z-index:6;padding:5px 12px;border-radius:10px;border:1px solid #c9a227;background:rgba(20,14,4,.85);color:#ffe9b0;font-size:13px;pointer-events:auto';$('hud').appendChild(b);}
  const alive=mobs.filter(m=>!m.dead&&!m.summoned&&!m.isFoe).length;b.hidden=false;
  if(!PB.done){PB.t-=dt;b.innerHTML=`⛩ ${esc(CM.pb.name)} · còn <b>${alive}</b> quái · ${mmss(PB.t)} <button id="pbOut" class="hdbtn" style="padding:2px 8px">Rời</button>`;
    if(alive===0&&mobs.length>0){PB.done=true;pbReward();}else if(PB.t<=0){PB.done=true;pbLeave('Hết giờ, phó bản thất bại');return;}}
  else b.innerHTML=`⛩ Đã vượt phó bản! <button id="pbOut" class="hdbtn" style="padding:2px 8px">Về thành</button>`;
  $('pbOut').onclick=()=>pbLeave('Đã rời phó bản');}
setInterval(()=>{const b=$('pbBar');if(b&&!CM.pb)b.hidden=true;},1000);
function pbReward(){const P=CM.pb,l=player.lv,gap=Math.max(0,l-P.lv-15),k=Math.max(0.25,1-gap*0.05),e=Math.round(expNeed(l)*0.22*k),g=P.lv*1500;
  gainExp(e);player.gold+=g;dailyAdd('pb',1);dailyAdd('boss',1);
  const tier=Math.max(0,TIER_LV.reduce((a,v,i)=>P.lv+5>=v?i:a,0)),w=SECTS[player.sect].wtype;addItem(makeItem(['weapon','armor','helmet','boots','gloves','ring','necklace'][rint(0,6)],tier,Math.random()<0.25?4:3,w));
  if(typeof giveCN==='function')giveCN(newCN(CN_KEYS[rint(0,5)],Math.max(2,rollCNq(0.1))),'Phó bản');
  if(typeof giveTD==='function'&&l>=30&&Math.random()<0.3){let gg=0;for(let x=0;x<TD_LIST.length;x++)if(P.lv>=TD_LIST[x].lv-10)gg=x;giveTD(gg,'Phó bản');}
  if(P.lv>=115&&Math.random()<0.05){const S=SETS.trunglau,it=makeSetItem(S.pieces[rint(0,S.pieces.length-1)],'trunglau');addItem(it);toast(`Phó bản rơi ${it.name}!`,S.col);}
  toast(`Vượt phó bản ${P.name}!`,'#ffd23f');log(`Vượt phó bản ${P.name}: ${fmtN(e)} kinh nghiệm, ${fmtN(g)} lượng, trang bị và Chân Nguyên`,'#ffd23f');sfx('level');save();}
function renderPB(B){const D=dailyData(),left=PB_MAX-(D.pb||0),lead=typeof inParty!=='function'||!inParty()||isLeader();
  let h=`<div class="hdnote">Phó bản là bản đồ riêng cho bạn hoặc cả tổ đội: quái mạnh gấp 3, trùm mạnh gấp 8, không hồi sinh. Diệt sạch trong 15 phút để nhận kinh nghiệm lớn, trang bị Truyền thuyết/Thần thoại, Chân Nguyên; có thể nhận Thần Đỉnh và (phó bản cấp 115+) đồ Trùng Lâu.
  Đang ở tổ đội thì chỉ đội trưởng bấm vào, cả đội (đủ cấp, còn lượt) được đưa vào cùng. Hôm nay còn <b style="color:#ffe27a">${left}/${PB_MAX}</b> lượt.</div>`;
  if(CM.pb)h+=`<div class="hdrow"><div class="tx">Bạn đang ở trong <b>${esc(CM.pb.name)}</b>.</div><button id="pbLeaveBtn">Rời phó bản</button></div>`;
  for(const P of PB_LIST){const ok=player.lv>=P.lv;h+=`<div class="hdrow"><div class="ic">⛩</div><div class="tx"><b>${P.name}</b> · cấp ${P.lv}+<br>Quái của ${MAPS[P.src].name}, mạnh hơn nhiều</div><button data-pb="${P.id}" ${ok&&left>0&&lead&&!CM.pb?'':'disabled'}>${!ok?'Cần cấp '+P.lv:!lead?'Chờ đội trưởng':'Vào'}</button></div>`;}
  B.innerHTML=h;if($('pbLeaveBtn'))$('pbLeaveBtn').onclick=()=>{pbLeave('Đã rời phó bản');renderHD();};
  B.querySelectorAll('[data-pb]').forEach(b=>b.onclick=()=>{const P=PB_LIST.find(x=>x.id===b.dataset.pb);$('panelHD').hidden=true;pbEnter(P,NET.id||('solo'+Date.now()%1e6),false);});}
// ===================== 4. LÔI ĐÀI (xếp hạng tỷ thí theo mùa) =====================
// Mỗi tháng là một mùa. Thắng tỷ thí được cộng điểm, thua bị trừ (theo điểm đối thủ). Hết mùa: thưởng theo bậc rồi điểm về 1000.
const LD_TIERS=[[0,'Đồng','#c8885a'],[1100,'Bạc','#d8e0ea'],[1250,'Vàng','#ffd23f'],[1400,'Bạch Kim','#9fe8ff'],[1600,'Kim Cương','#c8a8ff'],[1850,'Vương Giả','#ff6a8a']];
const ldSeason=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');};
const ldTier=r=>{let t=LD_TIERS[0];for(const x of LD_TIERS)if(r>=x[0])t=x;return t;};
function ldData(){const pv=player.pvp||(player.pvp={w:0,l:0,d:0});const s=ldSeason();
  if(pv.s!==s){if(pv.s&&pv.sw+pv.sl>0){const t=ldTier(pv.r||1000),i=LD_TIERS.indexOf(t),g=Math.round(player.lv*2000*(1+i*1.5));player.gold+=g;
      setTimeout(()=>{toast(`Mùa lôi đài ${pv.s} kết thúc: bậc ${t[1]}`,t[2]);log(`Thưởng mùa lôi đài ${pv.s} (bậc ${t[1]}): ${fmtN(g)} lượng`,t[2]);if(i>=3&&typeof giveCN==='function')giveCN(newCN(CN_KEYS[rint(0,5)],i>=5?4:3),'Thưởng mùa');},2000);}
    Object.assign(pv,{s,r:1000,sw:0,sl:0});}return pv;}
// cộng/trừ điểm sau mỗi trận (điểm đối thủ lấy từ thông tin họ gửi đi)
const _duelFinishLD=duelFinish;duelFinish=function(res){const o=NET.others.get(DUEL.id),or=o&&o.pr?o.pr:1000,pv=ldData(),my=pv.r||1000;
  _duelFinishLD(res);if(res!=='win'&&res!=='lose')return;const sc=res==='win'?1:0,exp=1/(1+Math.pow(10,(or-my)/400)),d=Math.round(32*(sc-exp));
  pv.r=Math.max(0,my+d);if(res==='win')pv.sw=(pv.sw||0)+1;else pv.sl=(pv.sl||0)+1;dailyAdd('pvp',1);log(`Điểm lôi đài: ${d>=0?'+':''}${d} → ${pv.r} (${ldTier(pv.r)[1]})`,ldTier(pv.r)[2]);save();};
function renderLD(B){const pv=ldData(),t=ldTier(pv.r||1000),d=new Date(),end=new Date(d.getFullYear(),d.getMonth()+1,1);
  let h=`<div class="hdrow" style="border-color:${t[2]}"><div class="ic" style="color:${t[2]}">⚡</div><div class="tx"><b style="color:${t[2]};font-size:16px">${t[1]}</b> · ${pv.r||1000} điểm<br>Mùa ${pv.s}: ${pv.sw||0} thắng / ${pv.sl||0} thua · kết thúc sau ${mmss((end-d)/1000)}</div></div>
  <div class="hdnote">Thắng tỷ thí được cộng điểm, thua bị trừ (đánh người điểm cao hơn được cộng nhiều hơn). Hết mùa (đầu mỗi tháng) nhận thưởng lượng theo bậc; Bạch Kim trở lên thêm Chân Nguyên phẩm Địa/Thiên. Bậc: ${LD_TIERS.map(x=>`<span style="color:${x[2]}">${x[1]}</span> ${x[0]}`).join(' · ')}</div>
  <div style="color:#ffd77a;font-weight:bold;margin-top:8px">Người chơi cùng bản đồ (khiêu chiến)</div>`;
  const near=[...NET.others.values()].filter(o=>o.look&&o.lv>=DUEL_MINLV);
  h+=near.length?near.map(o=>{const tt=ldTier(o.pr||1000);return`<div class="hdrow"><div class="tx"><b>${esc(o.name)}</b> · cấp ${o.lv|0} · <span style="color:${tt[2]}">${tt[1]} ${o.pr||1000}</span></div><button data-ld="${o.id}" ${player.lv>=DUEL_MINLV&&!DUEL.state?'':'disabled'}>Khiêu chiến</button></div>`;}).join(''):'<div class="hdnote">Chưa có ai cùng bản đồ. Rủ bạn bè tới cùng bản đồ để tỷ thí.</div>';
  h+=`<div style="color:#ffd77a;font-weight:bold;margin-top:8px">Bảng xếp hạng mùa này</div><div id="ldTop" class="hdnote">Đang tải...</div>`;
  B.innerHTML=h;B.querySelectorAll('[data-ld]').forEach(b=>b.onclick=()=>{const o=NET.others.get(b.dataset.ld);if(o){duelInvite(o);$('panelHD').hidden=true;}});
  if(!HD.ldT||Date.now()-HD.ldT>15000){HD.ldT=Date.now();ldLoadTop();}else ldShowTop();}
async function ldLoadTop(){try{const r=await rpcx('tk_pvp_top',{p_season:ldSeason()});HD.ldTop=r.ok&&Array.isArray(r.data)?r.data:null;}catch(e){HD.ldTop=null;}ldShowTop();}
function ldShowTop(){const el=$('ldTop');if(!el)return;const L=HD.ldTop;
  if(!L){el.textContent='Chưa tải được bảng xếp hạng (cần mạng và máy chủ đã cập nhật).';return;}if(!L.length){el.textContent='Mùa này chưa ai tỷ thí.';return;}
  el.innerHTML=L.map((x,i)=>{const t=ldTier(x.r);return`<div>${i+1}. <b>${esc(x.name)}</b> · cấp ${x.lv} · <span style="color:${t[2]}">${t[1]} ${x.r}</span> · ${x.w} thắng / ${x.l} thua</div>`;}).join('');}
// ---------- tin nhắn mạng (sự kiện bắt đầu bằng 'x') ----------
function xOnMsg(ev,p,topic){
  if(ev==='xwb'){if(p.map===curMapId)WB.rank.set(p.id,{name:String(p.name||'').slice(0,14),d:+p.d||0});return;}
  if(ev==='xpb'){if(!Array.isArray(p.members)||!p.members.includes(NET.id)||!(typeof isMate==='function'&&isMate(p.id)))return;const P=PB_LIST.find(x=>x.id===p.pb);if(!P||CM.pb)return;
    if(player.lv<P.lv)return log(`Đội trưởng vào phó bản ${P.name} nhưng bạn chưa đủ cấp ${P.lv}`,'#ffb36b');log(`Đội trưởng đưa cả đội vào phó bản ${P.name}`,'#ffd23f');pbEnter(P,p.inst,true);return;}
  if(ev.startsWith('xg')&&typeof guildOnMsg==='function')guildOnMsg(ev,p,topic);}
// ---------- vòng lặp ----------
setInterval(()=>{if(!started)return;wbTick(0.5);pbTick(0.5);},500);
