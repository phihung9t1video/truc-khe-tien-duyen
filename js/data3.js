'use strict';
// ===================== THẦN GIỚI (cấp 90 → 199) =====================
// 5 bản đồ lớn nối tiếp Thái Sơn. Quái, trùm, nhiệm vụ được sinh theo công thức để độ khó tăng đều theo cấp.
// Thêm 5 bậc trang bị (cấp 100, 120, 140, 160, 180).
TIER_PRE.push('Thái Cổ','Huyết Hải','Lôi Âm','Thần Mộc','Thiên Đế');
TIER_LV.push(100,120,140,160,180);
// giao diện vùng: mượn hình cây/nhà của vùng gốc (art), đổi màu
const themeFrom=(base,o)=>Object.assign({},THEMES[base],{art:THEMES[base].art||base},o);
Object.assign(THEMES,{
  wild:themeFrom('spring',{grass:'#4f7a3a',light:'rgba(200,190,120,.16)',dark:'rgba(30,40,10,.3)',pathE:'#7a5a32',pathI:'#a07a48',water:'#3a6a5a',deep:'#2a5248',tint:'rgba(120,90,30,.10)',tree:'#3a5a2a',roof:'#6a4a2a',weather:'sand',music:'desert'}),
  blood:themeFrom('dark',{grass:'#4a2a2e',light:'rgba(255,90,90,.10)',dark:'rgba(30,5,8,.38)',water:'#8a1418',deep:'#5a0a0e',tint:'rgba(150,20,30,.16)',flowers:['#ff3a4a','#ff8a8a','#ffd0d0'],weather:'ember',music:'dark'}),
  thunder:themeFrom('heaven',{grass:'#3e3e62',light:'rgba(200,190,255,.14)',dark:'rgba(10,10,40,.32)',pathE:'#8a7ab8',pathI:'#b8a8e8',water:'#2a2a6a',deep:'#1a1a4a',tint:'rgba(120,110,255,.12)',tree:'#5a5a9a',roof:'#c9a227',weather:'spirit',music:'heaven'}),
  jade:themeFrom('marsh',{grass:'#2e7a5a',light:'rgba(160,255,200,.16)',dark:'rgba(5,40,25,.3)',water:'#1a8a7a',deep:'#0e6a5a',tint:'rgba(40,200,140,.10)',tree:'#1e6a44',roof:'#2a8a6a',weather:'firefly',music:'marsh'}),
  void:themeFrom('star',{grass:'#1e1a2a',light:'rgba(255,220,140,.12)',dark:'rgba(0,0,0,.42)',water:'#0a0812',deep:'#05040a',tint:'rgba(255,190,60,.08)',tree:'#3a3020',roof:'#c9a227',flowers:['#ffd860','#ffffff','#ff9ad8'],weather:'glow',music:'heaven'})
});
const expAt=l=>Math.round(40*Math.pow(l,1.7)*(1+Math.pow(Math.max(0,l-12),1.8)/40));
// chỉ số quái theo cấp, nối tiếp quái cấp 87 (Thiên Ma Tướng)
function mobAt(name,lv0,lv1,o){const L=lv0,f=o.k||1;
  return Object.assign({name,lv:[lv0,lv1],hp:Math.round(14000*Math.pow(1.009,L-87)*f),atk:Math.round(730*Math.pow(1.0045,L-87)*(o.ka||1)),def:Math.round(196*Math.pow(1.004,L-87)),
    noChain:true,spd:o.spd||105,exp:Math.round(expAt(L)/480),gold:[L*4,L*5],aggro:o.aggro??140,range:o.range||34,cd:o.cd||1.05,hpP:.08,mpP:.05,hh:o.hh||62,hw:o.hw||16,tier:o.tier,loot:.2},o.x);}
function bossAt(name,lv,o){const b=mobAt(name,lv,lv,o);return Object.assign(b,{hp:b.hp*12,atk:Math.round(b.atk*1.15),def:Math.round(b.def*1.1),exp:Math.round(expAt(lv)*0.06),gold:[lv*120,lv*160],
  aggro:220,range:60,cd:1.15,boss:true,hpP:1,mpP:1,loot:1,scale:o.scale||1.7});}
Object.assign(MT,{
  // Hô Luân Thảo Nguyên 90–110
  tc_lang:mobAt('Hoang Cổ Cự Lang',92,96,{tier:13,k:.85,ka:.95,hh:34,hw:26,x:{draw:'wolf',col:'#a8803a',scale:1.3,el:'tho'}}),
  tc_thu:mobAt('Thạch Giáp Cự Thú',98,102,{tier:13,hh:36,hw:28,x:{draw:'boar',scale:1.35,el:'tho'}}),
  tc_binh:mobAt('Hoang Tộc Chiến Binh',104,108,{tier:13,k:1.1,x:{draw:'human',look:'wildwarrior',el:'kim'}}),
  tc_vuong:bossAt('Thái Cổ Lang Thần',110,{tier:13,hh:80,hw:46,scale:2.6,x:{draw:'wolf',col:'#e8c060',bskill:'slam',add:'tc_lang',el:'tho'}}),
  // Trương Dịch Đan Hà 110–130
  hh_xa:mobAt('Huyết Hải Xà',112,116,{tier:14,k:.9,hh:32,hw:26,x:{draw:'snake',col:'#c8202a',scale:1.3,el:'thuy'}}),
  hh_ho:mobAt('Huyết Ảnh Yêu Hồ',118,122,{tier:14,spd:122,hh:34,hw:24,x:{draw:'fox',col:'#a8102a',tails:5,el:'hoa'}}),
  hh_tuong:mobAt('Huyết Ma Tướng',124,128,{tier:14,k:1.1,x:{draw:'human',look:'demongeneral',el:'am'}}),
  hh_to:bossAt('Huyết Hải Ma Tổ',130,{tier:14,hh:104,hw:26,scale:1.8,x:{draw:'human',look:'flamelord',bskill:'fire',bshot:'efire',add:'hh_tuong',el:'am'}}),
  // Võ Đang Sơn 130–150
  la_linh:mobAt('Lôi Linh',132,136,{tier:15,k:.85,range:170,cd:1.45,spd:82,hh:44,hw:18,aggro:150,x:{draw:'spirit',col:'#ffe060',ranged:true,shot:'egold',el:'kim'}}),
  la_ho:mobAt('Lôi Điện Thú',138,142,{tier:15,spd:118,hh:34,hw:24,x:{draw:'wolf',col:'#8ab8ff',scale:1.25,el:'kim'}}),
  la_ve:mobAt('Lôi Thần Vệ',144,148,{tier:15,k:1.1,x:{draw:'human',look:'guard',el:'kim'}}),
  la_ton:bossAt('Lôi Âm Thiên Tôn',150,{tier:15,hh:104,hw:26,scale:1.8,x:{draw:'human',look:'thundergod',bskill:'ice',bshot:'egold',add:'la_ve',el:'kim'}}),
  // Cửu Trại Câu 150–175
  tm_linh:mobAt('Mộc Linh',153,158,{tier:16,k:.85,range:170,cd:1.45,spd:82,hh:44,hw:18,aggro:150,x:{draw:'spirit',col:'#7aff9a',ranged:true,shot:'eice',el:'moc'}}),
  tm_ho:mobAt('Thần Mộc Linh Hồ',160,166,{tier:16,spd:122,hh:34,hw:24,x:{draw:'fox',col:'#5ad07a',tails:7,el:'moc'}}),
  tm_phap:mobAt('Thụ Yêu Hộ Pháp',168,173,{tier:16,k:1.1,x:{draw:'human',look:'ghoul',el:'moc'}}),
  tm_hoang:bossAt('Thần Mộc Yêu Hoàng',175,{tier:16,hh:48,hw:46,scale:3,x:{draw:'snake',col:'#2a8a4a',bskill:'ice',add:'tm_ho',el:'moc'}}),
  // Côn Lôn Sơn 175–199
  hn_linh:mobAt('Hỗn Nguyên Tinh Linh',178,184,{tier:17,k:.85,range:175,cd:1.4,spd:85,hh:44,hw:18,aggro:150,x:{draw:'spirit',col:'#e0b8ff',ranged:true,shot:'edark',el:'am'}}),
  hn_lang:mobAt('Thần Giới Thiên Lang',186,191,{tier:17,spd:120,hh:36,hw:26,x:{draw:'wolf',col:'#fff4d0',scale:1.35,el:'kim'}}),
  hn_tuong:mobAt('Hỗn Nguyên Thần Tướng',192,197,{tier:17,k:1.1,x:{draw:'human',look:'chaosgod',el:'hoa'}}),
  hn_de:bossAt('Hỗn Nguyên Thiên Đế',199,{tier:17,hh:106,hw:28,scale:1.95,x:{draw:'human',look:'emperor',bskill:'fire',bshot:'edark',add:'hn_tuong',el:'hoa'}})
});
// bản đồ: dựng từ bố cục cũ (cỡ thường), rồi phóng to 1,5 lần như các vùng lớn
const NEWMAPS=[
  {id:'thaico',src:'lacnhat',name:'Hô Luân Thảo Nguyên',lvText:'90–110',minLv:90,theme:'wild',wx:0.6,wy:0.06,seed:91919,safeName:'Mục Dân Bộ Lạc',herb:'Thái Cổ Linh Thảo',
    mobs:['tc_lang','tc_thu','tc_binh','tc_vuong'],regions:['Cự Lang Nguyên','Thạch Thú Cốc','Hoang Tộc Doanh','Lang Thần Tế Đàn','Cổ Hồ'],
    npcs:[{id:'tc_npc1',name:'Hoang Cổ Tù Trưởng',look:'caravan'},{id:'tc_npc2',name:'Bộ Lạc Vu Y',look:'shaman'},{id:'tc_npc3',name:'Thạch Khí Tượng',look:'swordsmith'}],
    back:[6.5,25,9.5,25.5],fwd:[60,26.5,57.5,26.5]},
  {id:'huyethai',src:'uminh',name:'Trương Dịch Đan Hà',lvText:'110–130',minLv:110,theme:'blood',wx:0.45,wy:0.08,seed:11111,safeName:'Trương Dịch Thành',herb:'Huyết Liên',
    mobs:['hh_xa','hh_ho','hh_tuong','hh_to'],regions:['Huyết Xà Đàm','Huyết Hồ Lâm','Ma Tướng Doanh','Ma Tổ Điện','Huyết Trì'],
    npcs:[{id:'hh_npc1',name:'Trấn Ma Tướng Quân',look:'exorcist'},{id:'hh_npc2',name:'Huyết Y Tiên',look:'herbalist'},{id:'hh_npc3',name:'Ma Khí Tượng',look:'darksmith'}],
    back:[7.5,43.5,10.5,43.5],fwd:[56.5,40.5,53.5,40.5]},
  {id:'loiam',src:'thienson',name:'Võ Đang Sơn',lvText:'130–150',minLv:130,theme:'thunder',wx:0.3,wy:0.1,seed:13131,safeName:'Ngọc Hư Cung',herb:'Lôi Tinh Thảo',
    mobs:['la_ho','la_linh','la_ve','la_ton'],regions:['Lôi Thú Cốc','Lôi Linh Nguyên','Thần Vệ Doanh','Thiên Tôn Điện','Lôi Trì'],
    npcs:[{id:'la_npc1',name:'Lôi Âm Đại Sư',look:'taoist'},{id:'la_npc2',name:'Lôi Âm Tiểu Tăng',look:'daotong'},{id:'la_npc3',name:'Lôi Hỏa Tượng',look:'ironsmith'}],
    back:[29.5,43.5,32.5,42.5],fwd:[3.5,30.5,6.5,30.5]},
  {id:'thanmoc',src:'vanmong',name:'Cửu Trại Câu',lvText:'150–175',minLv:150,theme:'jade',wx:0.15,wy:0.14,seed:15151,safeName:'Tạng Trại',herb:'Thần Mộc Quả',
    mobs:['tm_linh','tm_ho','tm_phap','tm_hoang'],regions:['Mộc Linh Đàm','Linh Hồ Lâm','Hộ Pháp Doanh','Yêu Hoàng Điện','Thánh Thủy'],
    npcs:[{id:'tm_npc1',name:'Thần Mộc Trưởng Lão',look:'elder'},{id:'tm_npc2',name:'Bách Hoa Tiên Cô',look:'fairy'},{id:'tm_npc3',name:'Mộc Linh Tượng',look:'merchant'}],
    back:[5.5,24.5,9,24.5],fwd:[32.5,3.5,32.5,6.5]},
  {id:'honnguyen',src:'lacnhat',name:'Côn Lôn Sơn',lvText:'175–199',minLv:175,theme:'void',wx:0.08,wy:0.36,seed:19919,safeName:'Côn Lôn Sơn Khẩu',herb:'Hỗn Nguyên Thần Hoa',
    mobs:['hn_linh','hn_lang','hn_tuong','hn_de'],regions:['Tinh Linh Nhai','Thiên Lang Nguyên','Thần Tướng Doanh','Thiên Đế Đài','Hỗn Nguyên Hải'],
    npcs:[{id:'hn_npc1',name:'Hỗn Nguyên Thánh Nhân',look:'immortal'},{id:'hn_npc2',name:'Thần Giới Tiên Nữ',look:'fairy'},{id:'hn_npc3',name:'Thần Khí Tượng',look:'celestialsmith'}],
    back:[6.5,25,9.5,25.5],fwd:null}
];
// Thái Sơn có cổng mới sang Thái Cổ (tọa độ đã ở cỡ lớn)
MAPS.tinhha.portals.push({x:83.5,y:40,to:'thaico',tx:NEWMAPS[0].back[2],ty:NEWMAPS[0].back[3],minLv:90});
// cổng: mọi tọa độ đích của bản đồ mới để ở cỡ gốc; scaleMap tự phóng to đúng một lần khi phóng bản đồ đích.
// Riêng cổng quay về Tinh Hà (đã là cỡ lớn, không phóng nữa) thì để sẵn tọa độ lớn.
NEWMAPS.forEach((d,k)=>{const prev=k===0?'tinhha':NEWMAPS[k-1].id,next=NEWMAPS[k+1];
  const arrive=k===0?[80,40]:[NEWMAPS[k-1].fwd[2],NEWMAPS[k-1].fwd[3]];
  const portals=[{x:d.back[0],y:d.back[1],to:prev,tx:arrive[0],ty:arrive[1],minLv:1}];
  if(next)portals.push({x:d.fwd[0],y:d.fwd[1],to:next.id,tx:next.back[2],ty:next.back[3],minLv:next.minLv});
  MAPS[d.id]=cloneMap(d.src,Object.assign({},d,{portals}));});
for(const d of NEWMAPS){scaleMap(d.id,1.5);
  // bầy tinh anh như các vùng lớn
  const base=d.mobs[2],b=MT[base],key='e_'+base,M=MAPS[d.id],z=M.zones[base];
  MT[key]=Object.assign({},b,{name:b.name+' Tinh Anh',lv:[b.lv[1]+1,b.lv[1]+1],hp:Math.round(b.hp*3),atk:Math.round(b.atk*1.2),def:Math.round(b.def*1.15),exp:b.exp*4,gold:[b.gold[0]*3,b.gold[1]*3],loot:0.35,aggro:0,elite:true,scale:1.15});
  const dx=M.gen.size[0]/2-z.x,dy=M.gen.size[1]/2-z.y,dl=Math.hypot(dx,dy)||1,cx=Math.round(z.x+dx/dl*14),cy=Math.round(z.y+dy/dl*14);
  M.zones[key]={x:cx,y:cy,r:8,n:15};M.regions.push({n:b.name+' Tinh Anh (nên đi tổ đội)',x:cx,y:cy,r:7});}
for(const id in MAPS)for(const n of MAPS[id].npcs)NPC_INDEX[n.id]=Object.assign({map:id},n);
// nhiệm vụ: 7 nhiệm vụ mỗi bản đồ
NEWMAPS.forEach((d,k)=>{const [a,b,c,boss]=d.mobs,giver=d.npcs[0].id,healer=d.npcs[1].id,smith=d.npcs[2].id,A=MT[a],B=MT[b],C=MT[c],X=MT[boss],tier=A.tier,need=l=>expAt(l);
  const prevMap=k===0?MAPS.tinhha.name:NEWMAPS[k-1].name;
  QUESTS.push(
    {map:d.id,title:d.name,giver,type:'talk',n:1,short:`Qua Truyền Tống Trận từ ${prevMap}, gặp ${d.npcs[0].name}`,desc:`Một vùng đất mới đã mở ra. Truyền Tống Trận ở cuối đường của ${prevMap}, cần cấp ${d.minLv}.`,reward:{exp:Math.round(need(d.minLv)*0.05),gold:d.minLv*150,hp:30,mp:30}},
    {map:d.id,title:'Diệt '+A.name,giver,type:'kill',target:a,n:25,short:`Hạ ${A.name}`,desc:`${A.name} hoành hành quanh vùng. Hạ 25 con.`,reward:{exp:Math.round(need(A.lv[0])*0.12),gold:A.lv[0]*200,hp:20}},
    {map:d.id,title:d.herb,giver:healer,type:'gather',n:6,short:`Hái ${d.herb}`,desc:`Ta cần 6 cây ${d.herb} để luyện đan cho dân trong vùng.`,reward:{exp:Math.round(need(A.lv[0])*0.1),gold:A.lv[0]*200,mp:25}},
    {map:d.id,title:'Diệt '+B.name,giver,type:'kill',target:b,n:25,short:`Hạ ${B.name}`,desc:`${B.name} đông như kiến. Hạ 25 con.`,reward:{exp:Math.round(need(B.lv[0])*0.14),gold:B.lv[0]*220,hp:20,item:{slot:'boots',tier,rar:2}}},
    {map:d.id,title:'Diệt '+C.name,giver,type:'kill',target:c,n:28,short:`Hạ ${C.name}`,desc:`Đạo quân ${C.name} canh giữ đường vào sào huyệt. Hạ 28 tên.`,reward:{exp:Math.round(need(C.lv[0])*0.16),gold:C.lv[0]*240,hp:20}},
    {map:d.id,title:'Tín vật của '+C.name,giver:smith,type:'drop',target:c,n:6,item:'Tín vật',chance:0.4,short:`Đoạt Tín vật từ ${C.name}`,desc:`Đoạt 6 tín vật, ta rèn cho thiếu hiệp một thần binh bậc ${TIER_PRE[tier]}.`,reward:{exp:Math.round(need(C.lv[0])*0.14),gold:C.lv[0]*240,item:{slot:'weapon',tier,rar:3}}},
    {map:d.id,title:X.name,giver,type:'kill',target:boss,n:1,short:`Hạ ${X.name}`,desc:`${X.name} là chủ nhân của vùng đất này. Nên đạt cấp ${X.lv[0]} trở lên!`,reward:{exp:Math.round(need(X.lv[0])*0.3),gold:X.lv[0]*600,hp:50,item:{slot:'armor',tier,rar:4}}});});
// ===================== MỞ RỘNG BẢN ĐỒ =====================
// Mọi bản đồ rộng thêm 35%: bãi quái giữ nguyên cỡ nên giữa các bãi có khoảng trống để đặt đồi, núi, vực, đồng hoa.
const WIDEN=1.35;
function widenMap(id,f){const M=MAPS[id],g=M.gen,sz=g.size||[64,48],S=v=>Math.round(v*f),SF=v=>Math.round(v*f*2)/2;
  g.size=[S(sz[0]),S(sz[1])];if(g.river)g.river.x=S(g.river.x);
  g.lakes=g.lakes.map(([x,y,w,h])=>[S(x),S(y),S(w),S(h)]);
  const sf=g.safe;Object.assign(sf,{x0:S(sf.x0),y0:S(sf.y0),x1:S(sf.x1),y1:S(sf.y1)});sf.gates=sf.gates.map(([s,a,b])=>[s,S(a),S(b)+1]);
  g.houses=g.houses.map(([x,y])=>[S(x),S(y)]);if(g.well)g.well=[S(g.well[0]),S(g.well[1])];
  const A=g.arena;if(A){Object.assign(A,{x0:S(A.x0),y0:S(A.y0),x1:S(A.x1),y1:S(A.y1)});A.gap=[A.gap[0],S(A.gap[1]),S(A.gap[2])+1];}
  g.roads=g.roads.map(r=>r.map(S));M.revive=M.revive.map(SF);
  for(const k in M.zones){const z=M.zones[k];z.x=S(z.x);z.y=S(z.y);}
  M.herbs.zones.forEach(z=>{z.x=S(z.x);z.y=S(z.y);});
  M.regions.forEach(r=>{r.x=S(r.x);r.y=S(r.y);r.r=S(r.r);});
  M.npcs.forEach(n=>{n.x=SF(n.x);n.y=SF(n.y);});
  M.portals.forEach(p=>{p.x=SF(p.x);p.y=SF(p.y);});
  for(const o in MAPS)for(const p of MAPS[o].portals)if(p.to===id){p.tx=SF(p.tx);p.ty=SF(p.ty);}}
for(const id in MAPS)widenMap(id,WIDEN);
// ===================== TRUYỀN TỐNG SỨ =====================
// Mỗi thành có một Truyền Tống Sứ: trả lượng để dịch chuyển ngay tới thành của bản đồ khác.
const teleCost=id=>{const l=MAPS[id].minLv||1;return Math.round(50+l*l*3);};
for(const id in MAPS){const M=MAPS[id],sf=M.gen.safe;let x=M.revive[0]+2,y=M.revive[1]-1.5;
  x=Math.min(Math.max(x,sf.x0+1.5),sf.x1-1.5);y=Math.min(Math.max(y,sf.y0+1.5),sf.y1-1.5);
  M.npcs.push({id:'tele_'+id,name:'Truyền Tống Sứ',kind:'tele',look:'immortal',x,y});}
for(const id in MAPS)for(const n of MAPS[id].npcs)NPC_INDEX[n.id]=Object.assign({map:id},n);
