'use strict';
// ===================== VÙNG TIÊN GIỚI (60–90) =====================
// Ba bản đồ mới nối tiếp Lăng Tiêu Tiên Cảnh, mỗi bản đồ có trùm riêng; thêm bậc trang bị 11–13 và độ hiếm Thần thoại.
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
MAPS.hoadiem=cloneMap('lacnhat',{name:'Hỏa Diệm Sơn',lvText:'60–70',minLv:60,theme:'volcano',wx:0.78,wy:0.38,seed:61616,safeName:'Viêm Hỏa Trấn',herb:'Hỏa Liên',
  mobs:['hoalang','dungxa','hoama','viemma'],regions:['Hỏa Lang Nhai','Dung Nham Cốc','Hỏa Ma Doanh','Viêm Ma Điện','Nham Tương Hồ'],
  npcs:[{id:'firemonk',name:'Viêm Sơn Đại Sư',look:'taoist'},{id:'firehealer',name:'Băng Tâm Y Nữ',look:'oasisdoc'},{id:'firesmith',name:'Hỏa Luyện Tượng',look:'darksmith'}],
  portals:[{x:6.5,y:25,to:'langtieu',tx:52.5,ty:26.5,minLv:1},{x:60,y:26.5,to:'longcung',tx:9,ty:24.5,minLv:70}]});
MAPS.longcung=cloneMap('vanmong',{name:'Bích Hải Long Cung',lvText:'70–80',minLv:70,theme:'sea',wx:0.9,wy:0.64,seed:71717,safeName:'Thủy Tinh Cung',herb:'San Hô Linh',
  mobs:['giaolong','vebinh','haiyeu','longvuong'],regions:['Giao Long Đàm','Vệ Binh Doanh','Hải Yêu Trại','Long Vương Điện','San Hô Đàm'],
  npcs:[{id:'seasage',name:'Quy Thừa Tướng',look:'fisher'},{id:'seahealer',name:'Bạng Tiên Tử',look:'fairy'},{id:'seasmith',name:'Long Cung Thiết Tượng',look:'ironsmith'}],
  portals:[{x:5.5,y:24.5,to:'hoadiem',tx:57.5,ty:26.5,minLv:1},{x:32.5,y:3.5,to:'tinhha',tx:32.5,ty:42.5,minLv:80}]});
MAPS.tinhha=cloneMap('langtieu',{name:'Cửu Thiên Tinh Hà',lvText:'80–90',minLv:80,theme:'star',wx:0.93,wy:0.14,seed:81818,safeName:'Tinh Thần Điện',herb:'Tinh Thần Hoa',
  mobs:['tinhlinh','tinhho','thienma','hondon'],regions:['Tinh Linh Nhai','Tinh Hồ Uyển','Thiên Ma Doanh','Hỗn Độn Đài','Tinh Hải'],
  npcs:[{id:'starsage',name:'Tử Vi Tinh Quân',look:'immortal'},{id:'starhealer',name:'Chức Nữ',look:'fairy'},{id:'starsmith',name:'Thiên Xảo Tinh Tượng',look:'celestialsmith'}],
  portals:[{x:29.5,y:43.5,to:'longcung',tx:32.5,ty:6.5,minLv:1}]});
MAPS.langtieu.portals.push({x:55.5,y:26.5,to:'hoadiem',tx:9.5,ty:25.5,minLv:60});
// dàn lại vị trí trên bản đồ thế giới cho đủ chỗ
for(const [id,x] of Object.entries({trukhe:0.08,vanmong:0.22,thienson:0.36,lacnhat:0.5,uminh:0.63,langtieu:0.66}))MAPS[id].wx=x;
for(const id in MAPS)for(const n of MAPS[id].npcs)NPC_INDEX[n.id]=Object.assign({map:id},n);

QUESTS.push(
  {map:'hoadiem',title:'Hỏa Diệm Sơn',giver:'firemonk',type:'talk',n:1,short:'Qua Truyền Tống Trận phía đông Lăng Tiêu, gặp Viêm Sơn Đại Sư',
    desc:'Sau khi Đọa Tiên ngã xuống, ma khí tràn xuống Hỏa Diệm Sơn. Truyền Tống Trận ở cuối đường phía đông Lăng Tiêu Tiên Cảnh, cần cấp 60.',reward:{exp:300000,gold:10000,hp:20,mp:20}},
  {map:'hoadiem',title:'Hỏa Lang Cuồng Bạo',giver:'firemonk',type:'kill',target:'hoalang',n:20,short:'Hạ Hỏa Lang ở đồi phía nam',desc:'Bầy Hỏa Lang bị ma khí thiêu đốt, tấn công dân trấn. Hạ 20 con.',reward:{exp:500000,gold:12000,hp:15}},
  {map:'hoadiem',title:'Hỏa Liên Giải Nhiệt',giver:'firehealer',type:'gather',n:6,short:'Hái Hỏa Liên',desc:'Ta cần 6 đóa Hỏa Liên mọc giữa dung nham để chữa bỏng cho dân trấn.',reward:{exp:520000,gold:12500,mp:20}},
  {map:'hoadiem',title:'Dung Nham Xà',giver:'firemonk',type:'kill',target:'dungxa',n:20,short:'Hạ Dung Nham Xà ở thung lũng đông nam',desc:'Rắn dung nham phun lửa từ khe đá. Hạ 20 con.',reward:{exp:620000,gold:14000,hp:15,item:{slot:'boots',tier:10,rar:2}}},
  {map:'hoadiem',title:'Hỏa Ma Binh',giver:'firemonk',type:'kill',target:'hoama',n:22,short:'Hạ Hỏa Ma Binh ở doanh trại phía bắc',desc:'Viêm Ma Vương luyện ra một đạo Hỏa Ma Binh. Hạ 22 tên.',reward:{exp:720000,gold:15000,hp:15}},
  {map:'hoadiem',title:'Viêm Ma Lệnh',giver:'firesmith',type:'drop',target:'hoama',n:6,item:'Viêm ma lệnh',chance:0.4,short:'Đoạt Viêm ma lệnh',desc:'Đoạt 6 tấm Viêm ma lệnh, lão rèn cho thiếu hiệp một thần binh Hỗn Nguyên.',reward:{exp:700000,gold:15000,item:{slot:'weapon',tier:10,rar:2}}},
  {map:'hoadiem',title:'Viêm Ma Vương',giver:'firemonk',type:'kill',target:'viemma',n:1,short:'Hạ Viêm Ma Vương',desc:'Viêm Ma Vương ngự trong Viêm Ma Điện phía đông bắc, phóng hỏa cầu và gọi Hỏa Ma Binh. Nên đạt cấp 70 trở lên!',reward:{exp:1200000,gold:40000,hp:30,item:{slot:'armor',tier:10,rar:3}}},
  {map:'longcung',title:'Bích Hải Long Cung',giver:'seasage',type:'talk',n:1,short:'Qua Truyền Tống Trận phía đông Hỏa Diệm Sơn, gặp Quy Thừa Tướng',desc:'Long Cung dưới đáy biển bị Hắc Long Vương chiếm. Truyền Tống Trận ở cuối đường phía đông Hỏa Diệm Sơn, cần cấp 70.',reward:{exp:600000,gold:15000,hp:20,mp:20}},
  {map:'longcung',title:'Giao Long Quấy Nhiễu',giver:'seasage',type:'kill',target:'giaolong',n:20,short:'Hạ Giao Long ở đầm phía nam',desc:'Giao Long theo Hắc Long Vương làm loạn. Hạ 20 con.',reward:{exp:900000,gold:17000,hp:15}},
  {map:'longcung',title:'San Hô Linh',giver:'seahealer',type:'gather',n:6,short:'Hái San Hô Linh',desc:'Ta cần 6 nhánh San Hô Linh để luyện ngọc trai hộ thân.',reward:{exp:950000,gold:17500,mp:20}},
  {map:'longcung',title:'Vệ Binh Phản Chủ',giver:'seasage',type:'kill',target:'vebinh',n:22,short:'Hạ Long Cung Vệ Binh',desc:'Một đạo vệ binh đã phản theo Hắc Long Vương. Hạ 22 tên.',reward:{exp:1100000,gold:19000,hp:15,item:{slot:'helmet',tier:11,rar:2}}},
  {map:'longcung',title:'Hải Yêu Ca',giver:'seasage',type:'kill',target:'haiyeu',n:22,short:'Hạ Hải Yêu ở trại phía đông nam',desc:'Hải Yêu hát mê hoặc người qua đường rồi bắn băng tiễn. Hạ 22 con.',reward:{exp:1250000,gold:20000,hp:15}},
  {map:'longcung',title:'Long Lân',giver:'seasmith',type:'drop',target:'vebinh',n:6,item:'Long lân',chance:0.4,short:'Đoạt Long lân từ vệ binh',desc:'Đoạt 6 mảnh Long lân, lão rèn một thần binh Tinh Hà.',reward:{exp:1200000,gold:20000,item:{slot:'weapon',tier:11,rar:2}}},
  {map:'longcung',title:'Hắc Long Vương',giver:'seasage',type:'kill',target:'longvuong',n:1,short:'Hạ Hắc Long Vương',desc:'Hắc Long Vương cuộn mình trong Long Vương Điện, phun băng khí đóng băng cả biển. Nên đạt cấp 80 trở lên!',reward:{exp:2000000,gold:60000,hp:30,item:{slot:'necklace',tier:11,rar:3}}},
  {map:'tinhha',title:'Cửu Thiên Tinh Hà',giver:'starsage',type:'talk',n:1,short:'Qua Truyền Tống Trận phía bắc Long Cung, gặp Tử Vi Tinh Quân',desc:'Hỗn Độn Ma Thần thức tỉnh nơi tận cùng tinh hà. Truyền Tống Trận ở cuối đường phía bắc Long Cung, cần cấp 80.',reward:{exp:1000000,gold:20000,hp:20,mp:20}},
  {map:'tinhha',title:'Tinh Linh Lạc Lối',giver:'starsage',type:'kill',target:'tinhlinh',n:22,short:'Hạ Tinh Linh ở Tinh Linh Nhai',desc:'Tinh Linh bị hỗn độn nhiễm, bắn ám quang từ xa. Hạ 22 con.',reward:{exp:1500000,gold:22000,hp:15}},
  {map:'tinhha',title:'Tinh Thần Hoa',giver:'starhealer',type:'gather',n:6,short:'Hái Tinh Thần Hoa',desc:'Ta cần 6 đóa Tinh Thần Hoa để dệt lại dải ngân hà bị xé rách.',reward:{exp:1550000,gold:22500,mp:20}},
  {map:'tinhha',title:'Tinh Hồ Bốn Đuôi',giver:'starsage',type:'kill',target:'tinhho',n:22,short:'Hạ Tinh Hồ ở Tinh Hồ Uyển',desc:'Tinh Hồ nhanh như sao băng. Hạ 22 con.',reward:{exp:1800000,gold:25000,hp:15,item:{slot:'gloves',tier:12,rar:2}}},
  {map:'tinhha',title:'Thiên Ma Tướng',giver:'starsage',type:'kill',target:'thienma',n:24,short:'Hạ Thiên Ma Tướng',desc:'Đại quân Thiên Ma Tướng canh giữ Hỗn Độn Đài. Hạ 24 tên.',reward:{exp:2100000,gold:28000,hp:15}},
  {map:'tinhha',title:'Hỗn Độn Thạch',giver:'starsmith',type:'drop',target:'thienma',n:6,item:'Hỗn độn thạch',chance:0.4,short:'Đoạt Hỗn độn thạch',desc:'Đoạt 6 viên Hỗn độn thạch, ta rèn thần binh Hồng Mông.',reward:{exp:2000000,gold:28000,item:{slot:'weapon',tier:12,rar:3}}},
  {map:'tinhha',title:'Hỗn Độn Ma Thần',giver:'starsage',type:'kill',target:'hondon',n:1,short:'Hạ Hỗn Độn Ma Thần',desc:'Trận chiến cuối cùng nơi tận cùng tinh hà. Hỗn Độn Ma Thần phóng ám hỏa và gọi Thiên Ma Tướng. Nên đạt cấp 90!',reward:{exp:4000000,gold:120000,hp:50,item:{slot:'armor',tier:12,rar:4}}}
);
