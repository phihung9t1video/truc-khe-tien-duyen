'use strict';
// ===================== VÙNG TIÊN GIỚI (60–90) =====================
// Ba bản đồ mới nối tiếp Nga Mi Kim Đỉnh, mỗi bản đồ có trùm riêng; thêm bậc trang bị 11–13 và độ hiếm Thần thoại.
TIER_PRE.push('Hỗn Nguyên','Tinh Hà','Hồng Mông');
TIER_LV.push(62,72,82);
RARITY.push({n:'Thần thoại',c:'#ff5a8a',m:2.3,b:4});

Object.assign(MT,{
  hoalang:{name:'Hỏa Lang',lv:[61,63],hp:7600,atk:440,def:138,spd:112,exp:3000,gold:[180,230],aggro:130,range:30,cd:1.05,hpP:.08,mpP:.05,hh:32,hw:22,tier:10,loot:.18,draw:'wolf',col:'#d8502a',el:'hoa'},
  dungxa:{name:'Dung Nham Xà',lv:[64,66],hp:8300,atk:470,def:145,spd:92,exp:3600,gold:[195,250],aggro:110,range:34,cd:1.15,hpP:.08,mpP:.05,hh:30,hw:24,tier:10,loot:.18,draw:'snake',col:'#ff7a2a',el:'hoa'},
  hoama:{name:'Hỏa Ma Binh',lv:[67,69],hp:9000,atk:505,def:152,spd:105,exp:4300,gold:[210,270],aggro:140,range:36,cd:1.1,hpP:.1,mpP:.06,hh:62,hw:16,tier:10,loot:.2,draw:'human',look:'firedemon',el:'kim'},
  viemma:{name:'Viêm Ma Vương',lv:[70,70],hp:90000,atk:560,def:165,spd:105,exp:120000,gold:[14000,18000],aggro:220,range:58,cd:1.2,boss:true,hpP:1,mpP:1,hh:100,hw:26,tier:10,loot:1,draw:'human',look:'flamelord',scale:1.7,bskill:'fire',add:'hoama',el:'hoa'},
  giaolong:{name:'Giao Long',lv:[71,73],hp:9800,atk:540,def:160,spd:95,exp:5000,gold:[230,300],aggro:120,range:36,cd:1.15,hpP:.08,mpP:.05,hh:32,hw:26,tier:11,loot:.18,draw:'snake',col:'#2ab0a0',scale:1.3,el:'thuy'},
  haiyeu:{name:'Hải Yêu',lv:[74,76],hp:10500,atk:575,def:166,spd:80,exp:5900,gold:[250,320],aggro:150,range:170,cd:1.5,hpP:.08,mpP:.06,hh:44,hw:18,tier:11,loot:.2,draw:'spirit',col:'#5ae0ff',ranged:true,shot:'eice',el:'thuy'},
  vebinh:{name:'Long Cung Vệ Binh',lv:[77,79],hp:11300,atk:610,def:174,spd:105,exp:6900,gold:[270,350],aggro:140,range:36,cd:1.1,hpP:.1,mpP:.06,hh:62,hw:16,tier:11,loot:.2,draw:'human',look:'seaguard',el:'tho'},
  longvuong:{name:'Hắc Long Vương',lv:[80,80],hp:120000,atk:660,def:185,spd:100,exp:200000,gold:[20000,26000],aggro:220,range:64,cd:1.2,boss:true,hpP:1,mpP:1,hh:46,hw:44,tier:11,loot:1,draw:'snake',col:'#1a3a6a',scale:2.8,bskill:'ice',add:'giaolong',el:'thuy'},
  tinhho:{name:'Tinh Hồ',lv:[81,83],hp:12200,atk:650,def:182,spd:122,exp:8000,gold:[300,380],aggro:130,range:32,cd:1.0,hpP:.08,mpP:.05,hh:34,hw:24,tier:12,loot:.18,draw:'fox',tails:4,col:'#a8b8ff',el:'kim'},
  tinhlinh:{name:'Tinh Linh',lv:[84,86],hp:13000,atk:690,def:188,spd:82,exp:9300,gold:[320,400],aggro:150,range:175,cd:1.45,hpP:.08,mpP:.06,hh:44,hw:18,tier:12,loot:.2,draw:'spirit',col:'#d8a0ff',ranged:true,shot:'edark',el:'am'},
  thienma:{name:'Thiên Ma Tướng',lv:[87,89],hp:14000,atk:730,def:196,spd:108,exp:10800,gold:[340,430],aggro:140,range:38,cd:1.05,hpP:.1,mpP:.06,hh:62,hw:16,tier:12,loot:.2,draw:'human',look:'demongeneral',el:'am'},
  hondon:{name:'Hỗn Độn Ma Thần',lv:[90,90],hp:160000,atk:790,def:210,spd:105,exp:350000,gold:[30000,40000],aggro:220,range:60,cd:1.15,boss:true,hpP:1,mpP:1,hh:104,hw:26,tier:12,loot:1,draw:'human',look:'chaosgod',scale:1.75,bskill:'fire',bshot:'edark',add:'thienma',el:'am'}
});

Object.assign(THEMES,{
  volcano:{grass:'#6a4a3a',light:'rgba(255,150,90,.14)',dark:'rgba(30,10,5,.32)',pathE:'#3a2a22',pathI:'#5a4232',peb:['#4a3428','#7a5a44'],shore:'#2a1a14',water:'#e8601a',deep:'#b8380e',
    floor:['#5a4a46','#504240','#64524c','#564844'],floorBase:'#3a2e2c',arena:'#3a1410',arenaPeb:['#200a08','#5a2418'],tuft:['#5a3a2a','#8a5a3a'],flowers:['#ff8a3a','#ffd060','#ff5a3a'],
    weather:'ember',tint:'rgba(255,90,30,.10)',music:'desert',tree:'#3a2a24',roof:'#8a2a1a',herb:'firelotus'},
  sea:{grass:'#3a8a9a',light:'rgba(150,240,255,.18)',dark:'rgba(10,50,80,.28)',pathE:'#c8b88a',pathI:'#ecdcaa',peb:['#d8c89a','#fff0c8'],shore:'#e8dcb0',water:'#1a70b0',deep:'#0e4a88',
    floor:['#a8d8dc','#98ccd2','#b4e2e6','#a0d2d8'],floorBase:'#6aa8b0',arena:'#1a3a5a',arenaPeb:['#0e2440','#3a6a8a'],tuft:['#2a7a6a','#7ad8c0'],flowers:['#ff8ab0','#ffd0e0','#80fff0'],
    weather:'firefly',tint:'rgba(40,140,200,.12)',music:'marsh',tree:'#2a7a6a',roof:'#2a6aa0',herb:'coral'},
  star:{grass:'#2a2a5a',light:'rgba(180,170,255,.16)',dark:'rgba(5,5,25,.35)',pathE:'#6a6aa8',pathI:'#9a9ad8',peb:['#7a7ab8','#c8c8ff'],shore:'#4a4a8a',water:'#14143a',deep:'#0a0a26',
    floor:['#4a4a7a','#424270','#545488','#484878'],floorBase:'#2e2e58',arena:'#1a0a30',arenaPeb:['#0a0418','#3a2a5a'],tuft:['#3a3a7a','#7a7ad8'],flowers:['#ffffff','#c8b0ff','#a0e0ff'],
    weather:'glow',tint:'rgba(90,60,200,.14)',music:'heaven',tree:'#3a3a7a',roof:'#5a3aa0',herb:'starflower'}
});

// bố cục dựng lại từ các bản đồ đã kiểm chứng (đổi hạt giống, hệ quái, giao diện)
const cloneMap=(src,o)=>{const S=JSON.parse(JSON.stringify(MAPS[src]));const zk=Object.keys(S.zones);const zones={};o.mobs.forEach((m,i)=>zones[m]=S.zones[zk[i]]);
  const npcs=S.npcs.map((n,i)=>Object.assign(n,o.npcs[i]));S.gen.seed=o.seed;
  return Object.assign(S,{name:o.name,lvText:o.lvText,minLv:o.minLv,theme:o.theme,wx:o.wx,wy:o.wy,safeName:o.safeName,zones,npcs,herbs:{name:o.herb,zones:S.herbs.zones},
    regions:S.regions.map((r,i)=>Object.assign(r,{n:o.regions[i]})),portals:o.portals});};
MAPS.hoadiem=cloneMap('lacnhat',{name:'Hỏa Diệm Sơn',lvText:'60–70',minLv:60,theme:'volcano',wx:0.78,wy:0.38,seed:61616,safeName:'Thổ Lỗ Phồn Thành',herb:'Hỏa Liên',
  mobs:['hoalang','dungxa','hoama','viemma'],regions:['Hỏa Lang Nhai','Dung Nham Cốc','Hỏa Ma Doanh','Viêm Ma Điện','Nham Tương Hồ'],
  npcs:[{id:'firemonk',name:'Viêm Sơn Đại Sư',look:'taoist'},{id:'firehealer',name:'Băng Tâm Y Nữ',look:'oasisdoc'},{id:'firesmith',name:'Hỏa Luyện Tượng',look:'darksmith'}],
  portals:[{x:6.5,y:25,to:'langtieu',tx:52.5,ty:26.5,minLv:1},{x:60,y:26.5,to:'longcung',tx:9,ty:24.5,minLv:70}]});
MAPS.longcung=cloneMap('vanmong',{name:'Bồng Lai Đông Hải',lvText:'70–80',minLv:70,theme:'sea',wx:0.9,wy:0.64,seed:71717,safeName:'Bồng Lai Các',herb:'San Hô Linh',
  mobs:['giaolong','vebinh','haiyeu','longvuong'],regions:['Giao Long Đàm','Vệ Binh Doanh','Hải Yêu Trại','Long Vương Điện','San Hô Đàm'],
  npcs:[{id:'seasage',name:'Quy Thừa Tướng',look:'fisher'},{id:'seahealer',name:'Bạng Tiên Tử',look:'fairy'},{id:'seasmith',name:'Long Cung Thiết Tượng',look:'ironsmith'}],
  portals:[{x:5.5,y:24.5,to:'hoadiem',tx:57.5,ty:26.5,minLv:1},{x:32.5,y:3.5,to:'tinhha',tx:32.5,ty:42.5,minLv:80}]});
MAPS.tinhha=cloneMap('langtieu',{name:'Thái Sơn',lvText:'80–90',minLv:80,theme:'star',wx:0.84,wy:0.13,seed:81818,safeName:'Đại Miếu',herb:'Tinh Thần Hoa',
  mobs:['tinhlinh','tinhho','thienma','hondon'],regions:['Tinh Linh Nhai','Tinh Hồ Uyển','Thiên Ma Doanh','Hỗn Độn Đài','Tinh Hải'],
  npcs:[{id:'starsage',name:'Tử Vi Tinh Quân',look:'immortal'},{id:'starhealer',name:'Chức Nữ',look:'fairy'},{id:'starsmith',name:'Thiên Xảo Tinh Tượng',look:'celestialsmith'}],
  portals:[{x:29.5,y:43.5,to:'longcung',tx:32.5,ty:6.5,minLv:1}]});
MAPS.langtieu.portals.push({x:55.5,y:26.5,to:'hoadiem',tx:9.5,ty:25.5,minLv:60});
// dàn lại vị trí trên bản đồ thế giới cho đủ chỗ
for(const [id,x] of Object.entries({trukhe:0.08,vanmong:0.22,thienson:0.36,lacnhat:0.5,uminh:0.63,langtieu:0.66}))MAPS[id].wx=x;
for(const id in MAPS)for(const n of MAPS[id].npcs)NPC_INDEX[n.id]=Object.assign({map:id},n);

QUESTS.push(
  {map:'hoadiem',title:'Hỏa Diệm Sơn',giver:'firemonk',type:'talk',n:1,short:'Qua Truyền Tống Trận phía tây bắc Nga Mi, gặp Viêm Sơn Đại Sư',
    desc:'Sau khi Đọa Tiên ngã xuống, ma khí tràn xuống Hỏa Diệm Sơn. Truyền Tống Trận ở cuối đường phía tây bắc Nga Mi Kim Đỉnh, cần cấp 60.',reward:{exp:300000,gold:10000,hp:20,mp:20}},
  {map:'hoadiem',title:'Hỏa Lang Cuồng Bạo',giver:'firemonk',type:'kill',target:'hoalang',n:20,short:'Hạ Hỏa Lang ở đồi phía nam',desc:'Bầy Hỏa Lang bị ma khí thiêu đốt, tấn công dân trấn. Hạ 20 con.',reward:{exp:500000,gold:12000,hp:15}},
  {map:'hoadiem',title:'Hỏa Liên Giải Nhiệt',giver:'firehealer',type:'gather',n:6,short:'Hái Hỏa Liên',desc:'Ta cần 6 đóa Hỏa Liên mọc giữa dung nham để chữa bỏng cho dân trấn.',reward:{exp:520000,gold:12500,mp:20}},
  {map:'hoadiem',title:'Dung Nham Xà',giver:'firemonk',type:'kill',target:'dungxa',n:20,short:'Hạ Dung Nham Xà ở thung lũng đông nam',desc:'Rắn dung nham phun lửa từ khe đá. Hạ 20 con.',reward:{exp:620000,gold:14000,hp:15,item:{slot:'boots',tier:10,rar:2}}},
  {map:'hoadiem',title:'Hỏa Ma Binh',giver:'firemonk',type:'kill',target:'hoama',n:22,short:'Hạ Hỏa Ma Binh ở doanh trại phía bắc',desc:'Viêm Ma Vương luyện ra một đạo Hỏa Ma Binh. Hạ 22 tên.',reward:{exp:720000,gold:15000,hp:15}},
  {map:'hoadiem',title:'Viêm Ma Lệnh',giver:'firesmith',type:'drop',target:'hoama',n:6,item:'Viêm ma lệnh',chance:0.4,short:'Đoạt Viêm ma lệnh',desc:'Đoạt 6 tấm Viêm ma lệnh, lão rèn cho thiếu hiệp một thần binh Hỗn Nguyên.',reward:{exp:700000,gold:15000,item:{slot:'weapon',tier:10,rar:2}}},
  {map:'hoadiem',title:'Viêm Ma Vương',giver:'firemonk',type:'kill',target:'viemma',n:1,short:'Hạ Viêm Ma Vương',desc:'Viêm Ma Vương ngự trong Viêm Ma Điện phía đông bắc, phóng hỏa cầu và gọi Hỏa Ma Binh. Nên đạt cấp 70 trở lên!',reward:{exp:1200000,gold:40000,hp:30,item:{slot:'armor',tier:10,rar:3}}},
  {map:'longcung',title:'Bồng Lai Đông Hải',giver:'seasage',type:'talk',n:1,short:'Qua Truyền Tống Trận phía đông Hỏa Diệm Sơn, gặp Quy Thừa Tướng',desc:'Long Cung dưới đáy biển bị Hắc Long Vương chiếm. Truyền Tống Trận ở cuối đường phía đông Hỏa Diệm Sơn, cần cấp 70.',reward:{exp:600000,gold:15000,hp:20,mp:20}},
  {map:'longcung',title:'Giao Long Quấy Nhiễu',giver:'seasage',type:'kill',target:'giaolong',n:20,short:'Hạ Giao Long ở đầm phía nam',desc:'Giao Long theo Hắc Long Vương làm loạn. Hạ 20 con.',reward:{exp:900000,gold:17000,hp:15}},
  {map:'longcung',title:'San Hô Linh',giver:'seahealer',type:'gather',n:6,short:'Hái San Hô Linh',desc:'Ta cần 6 nhánh San Hô Linh để luyện ngọc trai hộ thân.',reward:{exp:950000,gold:17500,mp:20}},
  {map:'longcung',title:'Vệ Binh Phản Chủ',giver:'seasage',type:'kill',target:'vebinh',n:22,short:'Hạ Long Cung Vệ Binh',desc:'Một đạo vệ binh đã phản theo Hắc Long Vương. Hạ 22 tên.',reward:{exp:1100000,gold:19000,hp:15,item:{slot:'helmet',tier:11,rar:2}}},
  {map:'longcung',title:'Hải Yêu Ca',giver:'seasage',type:'kill',target:'haiyeu',n:22,short:'Hạ Hải Yêu ở trại phía đông nam',desc:'Hải Yêu hát mê hoặc người qua đường rồi bắn băng tiễn. Hạ 22 con.',reward:{exp:1250000,gold:20000,hp:15}},
  {map:'longcung',title:'Long Lân',giver:'seasmith',type:'drop',target:'vebinh',n:6,item:'Long lân',chance:0.4,short:'Đoạt Long lân từ vệ binh',desc:'Đoạt 6 mảnh Long lân, lão rèn một thần binh Tinh Hà.',reward:{exp:1200000,gold:20000,item:{slot:'weapon',tier:11,rar:2}}},
  {map:'longcung',title:'Hắc Long Vương',giver:'seasage',type:'kill',target:'longvuong',n:1,short:'Hạ Hắc Long Vương',desc:'Hắc Long Vương cuộn mình trong Long Vương Điện, phun băng khí đóng băng cả biển. Nên đạt cấp 80 trở lên!',reward:{exp:2000000,gold:60000,hp:30,item:{slot:'necklace',tier:11,rar:3}}},
  {map:'tinhha',title:'Thái Sơn',giver:'starsage',type:'talk',n:1,short:'Qua Truyền Tống Trận phía bắc Long Cung, gặp Tử Vi Tinh Quân',desc:'Hỗn Độn Ma Thần thức tỉnh nơi tận cùng tinh hà. Truyền Tống Trận ở cuối đường phía bắc Long Cung, cần cấp 80.',reward:{exp:1000000,gold:20000,hp:20,mp:20}},
  {map:'tinhha',title:'Tinh Linh Lạc Lối',giver:'starsage',type:'kill',target:'tinhlinh',n:22,short:'Hạ Tinh Linh ở Tinh Linh Nhai',desc:'Tinh Linh bị hỗn độn nhiễm, bắn ám quang từ xa. Hạ 22 con.',reward:{exp:1500000,gold:22000,hp:15}},
  {map:'tinhha',title:'Tinh Thần Hoa',giver:'starhealer',type:'gather',n:6,short:'Hái Tinh Thần Hoa',desc:'Ta cần 6 đóa Tinh Thần Hoa để dệt lại dải ngân hà bị xé rách.',reward:{exp:1550000,gold:22500,mp:20}},
  {map:'tinhha',title:'Tinh Hồ Bốn Đuôi',giver:'starsage',type:'kill',target:'tinhho',n:22,short:'Hạ Tinh Hồ ở Tinh Hồ Uyển',desc:'Tinh Hồ nhanh như sao băng. Hạ 22 con.',reward:{exp:1800000,gold:25000,hp:15,item:{slot:'gloves',tier:12,rar:2}}},
  {map:'tinhha',title:'Thiên Ma Tướng',giver:'starsage',type:'kill',target:'thienma',n:24,short:'Hạ Thiên Ma Tướng',desc:'Đại quân Thiên Ma Tướng canh giữ Hỗn Độn Đài. Hạ 24 tên.',reward:{exp:2100000,gold:28000,hp:15}},
  {map:'tinhha',title:'Hỗn Độn Thạch',giver:'starsmith',type:'drop',target:'thienma',n:6,item:'Hỗn độn thạch',chance:0.4,short:'Đoạt Hỗn độn thạch',desc:'Đoạt 6 viên Hỗn độn thạch, ta rèn thần binh Hồng Mông.',reward:{exp:2000000,gold:28000,item:{slot:'weapon',tier:12,rar:3}}},
  {map:'tinhha',title:'Hỗn Độn Ma Thần',giver:'starsage',type:'kill',target:'hondon',n:1,short:'Hạ Hỗn Độn Ma Thần',desc:'Trận chiến cuối cùng nơi tận cùng tinh hà. Hỗn Độn Ma Thần phóng ám hỏa và gọi Thiên Ma Tướng. Nên đạt cấp 90!',reward:{exp:4000000,gold:120000,hp:50,item:{slot:'armor',tier:12,rar:4}}}
);

// ===================== BẢN ĐỒ LỚN (cấp 50 trở lên) =====================
// Phóng to 1,5 lần mỗi chiều (96×72 ô), quái thường đông gấp đôi (luyện lẻ được, kinh nghiệm vừa),
// thêm bầy "Tinh anh" dày đặc: máu trâu, đánh đau, kinh nghiệm gấp 4 lần, nên đi tổ đội.
const BIG={langtieu:'guard',hoadiem:'hoama',longcung:'vebinh',tinhha:'thienma'};
const ELITE={guard:'Thiên Binh Tinh Anh',hoama:'Hỏa Ma Tinh Anh',vebinh:'Long Cung Tinh Anh',thienma:'Thiên Ma Tinh Anh'};
function scaleMap(id,f){const M=MAPS[id],g=M.gen,S=v=>Math.round(v*f),SF=v=>Math.round(v*f*2)/2;
  g.size=[S(64),S(48)];if(g.river)g.river.x=S(g.river.x);
  g.lakes=g.lakes.map(([x,y,w,h])=>[S(x),S(y),S(w),S(h)]);
  const sf=g.safe;Object.assign(sf,{x0:S(sf.x0),y0:S(sf.y0),x1:S(sf.x1),y1:S(sf.y1)});sf.gates=sf.gates.map(([s,a,b])=>[s,S(a),S(b)+1]);
  g.houses=g.houses.map(([x,y])=>[S(x),S(y)]);if(g.well)g.well=[S(g.well[0]),S(g.well[1])];
  const A=g.arena;Object.assign(A,{x0:S(A.x0),y0:S(A.y0),x1:S(A.x1),y1:S(A.y1)});A.gap=[A.gap[0],S(A.gap[1]),S(A.gap[2])+1];
  g.roads=g.roads.map(r=>r.map(S));M.revive=M.revive.map(SF);
  for(const k in M.zones){const z=M.zones[k];z.x=S(z.x);z.y=S(z.y);if(!MT[k].boss){z.r=Math.round(z.r*f*1.3);z.n=Math.round(z.n*2);}}
  M.herbs.zones.forEach(z=>{z.x=S(z.x);z.y=S(z.y);z.r=S(z.r);z.n=Math.round(z.n*1.5);});
  M.regions.forEach(r=>{r.x=S(r.x);r.y=S(r.y);r.r=S(r.r);});
  M.npcs.forEach(n=>{n.x=SF(n.x);n.y=SF(n.y);});
  M.portals.forEach(p=>{p.x=SF(p.x);p.y=SF(p.y);});
  for(const o in MAPS)for(const p of MAPS[o].portals)if(p.to===id){p.tx=SF(p.tx);p.ty=SF(p.ty);}}
for(const [id,base] of Object.entries(BIG)){scaleMap(id,1.5);const b=MT[base],k='e_'+base;
  MT[k]=Object.assign({},b,{name:ELITE[base],lv:[b.lv[1]+1,b.lv[1]+1],hp:Math.round(b.hp*3),atk:Math.round(b.atk*1.2),def:Math.round(b.def*1.15),exp:b.exp*4,gold:[b.gold[0]*3,b.gold[1]*3],loot:0.35,aggro:0,elite:true,scale:1.15});
  const M=MAPS[id],z=M.zones[base];
  // bầy tinh anh đặt ở khu riêng, cạnh khu quái gốc (về phía giữa bản đồ)
  const dx=M.gen.size[0]/2-z.x,dy=M.gen.size[1]/2-z.y,dl=Math.hypot(dx,dy)||1,cx=Math.round(z.x+dx/dl*14),cy=Math.round(z.y+dy/dl*14);
  M.zones[k]={x:cx,y:cy,r:8,n:15};M.regions.push({n:ELITE[base]+' (nên đi tổ đội)',x:cx,y:cy,r:7});}
for(const id in MAPS)for(const n of MAPS[id].npcs)NPC_INDEX[n.id]=Object.assign({map:id},n);

// ===================== BỘ TRÙNG LÂU (đồ Thần thoại cao nhất) =====================
// Đủ 10 món (mọi ô trừ vũ khí, nhẫn 2 chiếc). Vũ khí là THẦN KHÍ riêng (GODW). Rơi khi hạ Hỗn Độn Ma Thần (cấp 90) và Hỗn Nguyên Thiên Đế (cấp 199). GM nhận đủ.
const SETS={trunglau:{name:'Trùng Lâu',col:'#ff4a6a',pieces:['helmet','armor','vest','gloves','wrist','boots','amulet','necklace','ring','ring'],
  suf:{helmet:'Quan',armor:'Bào',vest:'Giáp',gloves:'Thủ',wrist:'Uyển',boots:'Ngoa',amulet:'Ngọc',necklace:'Liên',ring:'Giới'},
  bonus:{2:{atk:0.05},4:{hp:0.1,def:0.08},6:{atk:0.08,crit:0.05},8:{hp:0.1,def:0.1},10:{atk:0.15,crit:0.1}},
  desc:{2:'Công lực +5%',4:'Sinh lực +10%, phòng thủ +8%',6:'Công lực +8%, bạo kích +5%',8:'Sinh lực +10%, phòng thủ +10%',10:'Công lực +15%, bạo kích +10%'}}};
// THẦN KHÍ: vũ khí tối thượng theo từng loại, một cấp duy nhất, ai cũng cầm được
const GODW={sword:'Trảm Thiên Thần Kiếm',fan:'Phong Vân Thần Phiến',flute:'Thiên Âm Thần Tiêu',staff:'Bách Thảo Thần Trượng',hammer:'Khai Sơn Thần Chùy',dagger:'U Ảnh Thần Chủy'};
const GOD_COL='#ffd040';

// ===================== BIỂU TƯỢNG TRANG BỊ (hình vẽ) =====================
const svgIcon=inner=>'<svg class="gi" viewBox="0 0 24 24" width="1.2em" height="1.2em" fill="currentColor" stroke="currentColor" stroke-width="0" style="vertical-align:-0.22em">'+inner+'</svg>';
const ICON_DK='stroke="#000" stroke-opacity=".4" fill="none"';
Object.assign(WICON,{
  sword:svgIcon('<path d="M20 2.5 21.5 4 10.5 15 9 13.5Z"/><path d="M5.5 12.5 11.5 18.5 10 20 4 14Z"/><path d="M7.5 16.5 3.2 20.8" stroke-width="2.6" stroke-linecap="round" fill="none"/>'),
  fan:svgIcon('<path d="M12 21 2.5 9.5A13 13 0 0 1 21.5 9.5Z"/><path d="M12 21V7.5M12 21 7 8.6M12 21 17 8.6M12 21 3.8 11.5M12 21 20.2 11.5" '+ICON_DK+' stroke-width=".9"/><circle cx="12" cy="20.6" r="1.5"/>'),
  flute:svgIcon('<rect x="2" y="10" width="20" height="4.2" rx="2.1"/><g fill="#000" fill-opacity=".45"><circle cx="8" cy="12.1" r="1"/><circle cx="11.3" cy="12.1" r="1"/><circle cx="14.6" cy="12.1" r="1"/><circle cx="17.9" cy="12.1" r="1"/></g><path d="M4.5 14.2q-1.5 3.5.8 7" fill="none" stroke-width="1.4"/>'),
  staff:svgIcon('<rect x="10.9" y="7.5" width="2.3" height="14.5" rx="1.1"/><circle cx="12" cy="5" r="3.4"/><path d="M7.5 8.6q4.5-2.6 9 0" fill="none" stroke-width="1.4"/>'),
  hammer:svgIcon('<rect x="10.8" y="9" width="2.4" height="13" rx="1.1"/><rect x="4.5" y="2.8" width="15" height="7.2" rx="1.6"/><path d="M4.5 6.4h15" '+ICON_DK+' stroke-width="1"/>'),
  dagger:svgIcon('<path d="M18.5 2 20 3.5 12 11.5 10.5 10Z"/><path d="M5.5 2 4 3.5 12 11.5 13.5 10Z"/><path d="M9.5 12.5 4.5 17.5M14.5 12.5 19.5 17.5" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M7.5 10.5 10.5 13.5M16.5 10.5 13.5 13.5" stroke-width="1.8" fill="none"/>')});
Object.assign(SLOTICON,{
  weapon:WICON.sword,
  helmet:svgIcon('<path d="M4 15.5a8 8 0 0 1 16 0v1.5H4z"/><rect x="2.8" y="16.4" width="18.4" height="2.8" rx="1.2"/><path d="M12 3.2v4.3" stroke-width="2"/><circle cx="12" cy="3" r="1.7"/>'),
  armor:svgIcon('<path d="M8 3h8l4.5 4.2-3 2.3V21h-11V9.5l-3-2.3Z"/><path d="M12 3.2 9.5 7.5 12 21" '+ICON_DK+' stroke-width="1"/><rect x="6.6" y="11" width="10.8" height="1.9" fill="#000" fill-opacity=".3"/>'),
  vest:svgIcon('<path d="M6 3.5h3.2L12 5.6l2.8-2.1H18l2.2 4.2-2 2V21H5.8V9.7l-2-2Z"/><path d="M8 12h8M8 15h8M8 18h8" '+ICON_DK+' stroke-width="1.1"/>'),
  gloves:svgIcon('<path d="M7 21.5v-8l-2.2-3.2V6h2.1v4.2h1V4h2.1v6.2h1V3.2h2.1v7h1V5h2.1v8.4l-1.1 3.2v4.9Z"/>'),
  wrist:svgIcon('<path d="M6 4.5h12l-1.2 15H7.2Z"/><path d="M6.8 9h10.4M7.1 13.5h9.8" '+ICON_DK+' stroke-width="1.2"/><circle cx="12" cy="17" r="1.2" fill="#000" fill-opacity=".35"/>'),
  boots:svgIcon('<path d="M7 2.8h6.4V14l7.1 3.1v4.4H4.6v-4.2L7 16Z"/><path d="M4.6 19.4h15.9" '+ICON_DK+' stroke-width="1"/>'),
  amulet:svgIcon('<rect x="6.8" y="2" width="10.4" height="20" rx="1.2"/><path d="M9.5 6h5M12 6v12M9.5 10.2l5 4.2M14.5 10.2l-5 4.2" '+ICON_DK+' stroke-width="1.2"/>'),
  necklace:svgIcon('<path d="M4.5 2.5Q12 16.5 19.5 2.5" fill="none" stroke-width="1.7"/><path d="M12 13l3.2 4.2L12 21.5l-3.2-4.3Z"/>'),
  ring:svgIcon('<circle cx="12" cy="15.2" r="6" fill="none" stroke-width="2.4"/><path d="M12 2.5l3.2 3.2L12 9 8.8 5.7Z"/>')});
SLOTICON.ring1=SLOTICON.ring;SLOTICON.ring2=SLOTICON.ring;

// ===================== VÕ CÔNG MỚI (cấp 20, cấp 40) =====================
Object.assign(SKILLS,{
  kiemanh:{name:'Kiếm Ảnh Liên Hoàn',icon:'⚚',col:'#bfe6ff',lv:20,mp:30,cd:12,kind:'multi',range:200,hits:5,mult:1.15,desc:'Phân kiếm ảnh chém liên hoàn 5 nhát, mỗi nhát 115% công lực.'},
  thienkiem:{name:'Thiên Kiếm Giáng Thế',icon:'⟰',col:'#ffffff',lv:40,mp:55,cd:28,kind:'rain',range:260,r:110,hits:4,mult:2.6,desc:'Bốn thanh thiên kiếm khổng lồ cắm xuống vùng mục tiêu, mỗi đợt 260% công lực.'},
  hoavu:{name:'Hỏa Vũ Lưu Tinh',icon:'☄',col:'#ff7a3a',lv:20,mp:34,cd:12,kind:'aoeTarget',range:280,r:115,mult:2.6,burn:{dur:5,mult:0.3},desc:'Mưa sao lửa trút xuống vùng mục tiêu, 260% công lực và thiêu đốt 5 giây.'},
  phanthien:{name:'Liệt Diễm Phần Thiên',icon:'✺',col:'#ffb040',lv:40,mp:55,cd:22,kind:'aoeSelf',r:150,mult:3.2,desc:'Bùng nổ biển lửa quanh thân, 320% công lực lên mọi kẻ địch xung quanh.'},
  bangtien:{name:'Băng Tinh Phá Không',icon:'❆',col:'#bff4ff',lv:20,mp:28,cd:9,kind:'proj',fx:'ice',range:280,mult:3.4,slow:{dur:4,amt:0.55},desc:'Mũi băng tinh xuyên không, 340% công lực và làm chậm 55% trong 4 giây.'},
  vanlybang:{name:'Vạn Lý Băng Phong',icon:'❄',col:'#e0faff',lv:40,mp:55,cd:26,kind:'aoeSelf',r:170,mult:2.6,freeze:2.2,desc:'Đóng băng cả vùng rộng quanh thân 2,2 giây, 260% công lực.'},
  docvu:{name:'Vạn Độc Vụ',icon:'☁',col:'#9fff6a',lv:20,mp:32,cd:12,kind:'aoeTarget',range:260,r:120,mult:1.4,burn:{dur:7,mult:0.45},desc:'Thả màn sương độc lên vùng mục tiêu, 140% công lực và ngấm độc 7 giây.'},
  daihoixuan:{name:'Đại Hồi Xuân Thuật',icon:'✚',col:'#b8ffb0',lv:40,mp:60,cd:30,kind:'groupHeal',r:420,pct:0.5,hot:{dur:6,pct:0.03},desc:'Hồi 50% sinh lực cho bản thân và cả tổ đội ở gần, sau đó hồi thêm 3% mỗi giây trong 6 giây.'},
  chanson:{name:'Chấn Sơn Quyền',icon:'✊',col:'#e8c070',lv:20,mp:30,cd:12,kind:'aoeSelf',r:120,mult:2.2,stun:1.4,desc:'Đấm xuống đất làm rung chuyển, 220% công lực và làm choáng 1,4 giây.'},
  minhvuong:{name:'Bất Động Minh Vương',icon:'⛊',col:'#fff0b0',lv:40,mp:50,cd:35,kind:'buff',buff:{id:'mingwang',dur:8,dr:0.6,reflect:0.6},desc:'Thân bất động như núi 8 giây: giảm 60% sát thương nhận vào, phản lại 60% sát thương.'},
  anhdoc:{name:'Ảnh Độc Tiêu',icon:'✦',col:'#c8a0ff',lv:20,mp:30,cd:10,kind:'proj',fx:'dark',range:260,mult:3.0,mark:{dur:8,amt:0.35},desc:'Phóng ám tiêu tẩm độc, 300% công lực và đánh dấu: mục tiêu chịu thêm 35% sát thương trong 8 giây.'},
  tuyetmenh:{name:'Tuyệt Mệnh Nhất Kích',icon:'✖',col:'#ff5a8a',lv:40,mp:55,cd:25,kind:'dash',range:300,mult:6.0,desc:'Lướt tới đâm một nhát chí mạng 600% công lực, bạo kích dễ hơn.'}
});
SECTS.kiem.skills.push('kiemanh','thienkiem');SECTS.hoa.skills.push('hoavu','phanthien');SECTS.thuy.skills.push('bangtien','vanlybang');
SECTS.duoc.skills.push('docvu','daihoixuan');SECTS.the.skills.push('chanson','minhvuong');SECTS.am.skills.push('anhdoc','tuyetmenh');
