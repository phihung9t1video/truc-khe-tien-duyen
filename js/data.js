'use strict';
// ===================== NGŨ HÀNH & TƯƠNG KHẮC =====================
// Mỗi môn phái và mỗi loại quái mang một hệ. Hệ khắc: gây thêm 20% sát thương, nhận ít hơn 15%.
const EL={
  kim:{n:'Kim',c:'#ffe08a',i:'金'},moc:{n:'Mộc',c:'#7dff9a',i:'木'},thuy:{n:'Thủy',c:'#7fd0ff',i:'水'},
  hoa:{n:'Hỏa',c:'#ff8a5a',i:'火'},tho:{n:'Thổ',c:'#e0b070',i:'土'},am:{n:'Ám',c:'#c890ff',i:'暗'}};
const EL_BEATS={kim:['moc'],moc:['tho'],tho:['thuy','am'],thuy:['hoa'],hoa:['kim'],am:['hoa','moc']};
const EL_UP=1.2,EL_DOWN=0.85;
function elMul(a,d){if(!a||!d)return 1;if(EL_BEATS[a]&&EL_BEATS[a].includes(d))return EL_UP;if(EL_BEATS[d]&&EL_BEATS[d].includes(a))return EL_DOWN;return 1;}
const elBeatenBy=e=>Object.keys(EL_BEATS).filter(k=>EL_BEATS[k].includes(e));

// ===================== MÔN PHÁI =====================
const SECTS={
  kiem:{name:'Thiên Kiếm Tông',color:'#8fc4ff',role:'Cận chiến · Đánh nhóm',el:'kim',
    desc:'Kiếm tu cận chiến. Sinh lực và phòng thủ khá, xoay kiếm diệt cả bầy quái, tuyệt kỹ gọi vạn kiếm từ trời.',
    strong:'Đánh cả bầy quái rất nhanh, vừa công vừa thủ, dễ chơi nhất. Khắc Mộc.',
    weak:'Không có chiêu hồi máu, phải áp sát mới đánh được. Sợ Hỏa.',
    look:{robe:'#f7f9fd',trim:'#6fa8e0',belt:'#3f74b8',pants:'#e4ebf5',boot:'#5a6a86',sash:'#9fd0ff',iris:'#2f62a8',crown:'#e6edf5',inner:'#dcecff'},
    wtype:'sword',base:{hp:105,hpL:34,mp:40,mpL:10,atk:11,atkL:4.2,def:5,defL:2.5},range:46,proj:null,
    skills:['phivan','kiemkhi','hothe','vankiem']},
  hoa:{name:'Xích Diễm Cốc',color:'#ffa070',role:'Đánh xa · Sát thương cao',el:'hoa',
    desc:'Hỏa tu đánh xa bằng quạt. Công lực cực mạnh, thiêu đốt kẻ địch từ xa nhưng thân thể yếu.',
    strong:'Sát thương cao nhất, đốt cháy cả vùng, đứng xa vẫn đánh được. Khắc Kim.',
    weak:'Máu và phòng thủ thấp, bị áp sát là nguy. Sợ Thủy và Ám.',
    look:{robe:'#fff3ea',trim:'#e0552b',belt:'#b8321a',pants:'#f3e2d6',boot:'#7a3a2a',sash:'#ffb070',iris:'#a8321a',crown:'#f0c040',inner:'#ffe2cc'},
    wtype:'fan',base:{hp:88,hpL:27,mp:50,mpL:14,atk:12.5,atkL:4.9,def:3,defL:1.8},range:210,proj:'fire',
    skills:['liethoa','hoalong','viemthan','phuonghoang']},
  thuy:{name:'Bích Thủy Các',color:'#7fe8d8',role:'Tầm trung · Khống chế',el:'thuy',
    desc:'Thủy tu thổi tiêu. Làm chậm và đóng băng kẻ địch, tự hồi phục giỏi, bền bỉ khi luyện công lâu.',
    strong:'Đóng băng, làm chậm khiến kẻ địch không chạm được mình. Tự hồi máu. Khắc Hỏa.',
    weak:'Sát thương trung bình, hồi máu chỉ cho bản thân. Sợ Thổ.',
    look:{robe:'#f0fbf8',trim:'#3fb5a5',belt:'#2a8a80',pants:'#dff2ee',boot:'#3a6a66',sash:'#b8f0ff',iris:'#2a8a80',crown:'#cfe8ff',inner:'#d8f6f0'},
    wtype:'flute',base:{hp:95,hpL:30,mp:60,mpL:16,atk:11.5,atkL:4.4,def:4,defL:2.1},range:180,proj:'water',
    skills:['hanbang','hoixuan','bangphong','thuylong']},
  duoc:{name:'Bách Thảo Cốc',color:'#a8f07a',role:'Dược sư · Hồi máu cho nhóm',el:'moc',
    desc:'Dược sư dùng trượng thần mộc. Hồi máu và tăng phòng thủ cho cả tổ đội, đánh bằng độc châm thấm dần.',
    strong:'Hồi máu cho cả tổ đội, độc ngấm xuyên qua phòng thủ nên khắc phái Thổ.',
    weak:'Sát thương trực tiếp thấp nhất, giết quái chậm khi đi một mình. Sợ Kim và Ám.',
    look:{robe:'#f4fbe8',trim:'#6abf4a',belt:'#3f8a2a',pants:'#e6f2d8',boot:'#4a6a3a',sash:'#c8f0a0',iris:'#3f8a2a',crown:'#d8f0c0',inner:'#e8f8d8'},
    wtype:'staff',base:{hp:94,hpL:30,mp:70,mpL:18,atk:11.5,atkL:4.5,def:4,defL:2.0},range:190,proj:'leaf',
    skills:['bichdiep','thanhmoc','vanmoc','linhvuc']},
  the:{name:'Hậu Thổ Môn',color:'#e8c070',role:'Hộ vệ · Chịu đòn',el:'tho',
    desc:'Võ tăng cầm chùy đá. Thân thể cứng như núi, gầm lên kéo hết quái về mình, phản lại sát thương.',
    strong:'Máu và phòng thủ cao nhất, choáng kẻ địch, phản đòn. Khắc Thủy và Ám.',
    weak:'Đánh chậm, công lực thấp, tầm đánh ngắn nhất. Sợ độc của Mộc.',
    look:{robe:'#f6efe2',trim:'#b8863a',belt:'#8a5a20',pants:'#ece0cc',boot:'#6a4a2a',sash:'#e8c070',iris:'#8a5a20',crown:'#d8b060',inner:'#f0e2c8'},
    wtype:'hammer',base:{hp:128,hpL:41,mp:40,mpL:10,atk:10.5,atkL:3.9,def:7,defL:3.3},range:48,proj:null,aspd:0.95,
    skills:['lietdia','sonnhac','kimcang','thaison']},
  am:{name:'Ảnh Nguyệt Lâu',color:'#c8a0ff',role:'Sát thủ · Bạo kích',el:'am',
    desc:'Sát thủ dùng song chủy. Lướt tới sau lưng địch, ẩn thân, bạo kích liên hoàn hạ gục mục tiêu trong chớp mắt.',
    strong:'Bạo kích cao nhất, đánh nhanh nhất, lướt tới mục tiêu tức thì. Khắc Hỏa và Mộc.',
    weak:'Máu mỏng nhất, chủ yếu đánh từng mục tiêu. Sợ Thổ.',
    look:{robe:'#3a3448',trim:'#9a6ad8',belt:'#5a3a8a',pants:'#2e2a3a',boot:'#1e1a28',sash:'#c8a0ff',iris:'#7a4ad0',crown:'#8a7aa8',inner:'#4a4060'},
    wtype:'dagger',base:{hp:86,hpL:27,mp:45,mpL:12,atk:12.5,atkL:5.0,def:3.5,defL:1.9},range:40,proj:null,aspd:0.62,crit:0.12,
    skills:['anhsat','docnguyet','anthan','huyetnguyet']}
};

// ===================== VÕ CÔNG =====================
const SKILLS={
  phivan:{name:'Phi Vân Trảm',icon:'✦',col:'#9fd3ff',lv:1,mp:12,cd:4,kind:'aoeSelf',r:95,mult:1.8,desc:'Xoay kiếm chém mọi kẻ địch quanh thân, 180% công lực.'},
  kiemkhi:{name:'Kiếm Khí Trảm',icon:'☄',col:'#c8ecff',lv:3,mp:16,cd:5,kind:'wave',range:270,mult:2.4,desc:'Phóng luồng kiếm khí xuyên thẳng, trúng mọi kẻ địch trên đường, 240% công lực.'},
  hothe:{name:'Hộ Thể Kiếm Cương',icon:'⛨',col:'#ffe08a',lv:6,mp:22,cd:20,kind:'buff',buff:{id:'shield',dur:8,dr:0.4},desc:'Kiếm cương hộ thể trong 8 giây, giảm 40% sát thương nhận vào.'},
  vankiem:{name:'Vạn Kiếm Quy Tông',icon:'⚔',col:'#ffffff',lv:10,mp:45,cd:25,kind:'rain',range:250,r:120,hits:7,mult:1.1,desc:'Tuyệt kỹ: vạn kiếm từ trời giáng xuống vùng mục tiêu, 7 đợt, mỗi đợt 110% công lực.'},
  liethoa:{name:'Liệt Hỏa Chưởng',icon:'✹',col:'#ff8a3d',lv:1,mp:12,cd:3,kind:'proj',fx:'fire',range:270,mult:2.4,desc:'Phóng chưởng lửa vào mục tiêu, 240% công lực.'},
  hoalong:{name:'Hỏa Long Quyển',icon:'♨',col:'#ff6a2a',lv:3,mp:20,cd:7,kind:'aoeTarget',range:250,r:90,mult:2.0,burn:{dur:4,mult:0.25},desc:'Cuộn lửa thiêu đốt vùng quanh mục tiêu, 200% công lực và gây bỏng 4 giây.'},
  viemthan:{name:'Viêm Thần Hộ Thể',icon:'☀',col:'#ffcf40',lv:6,mp:22,cd:20,kind:'buff',buff:{id:'fury',dur:10,atk:0.35},desc:'Lửa thần nhập thể, tăng 35% công lực trong 10 giây.'},
  phuonghoang:{name:'Phượng Hoàng Liệt Diễm',icon:'❂',col:'#ffb040',lv:10,mp:45,cd:22,kind:'phoenix',range:330,mult:4.0,desc:'Tuyệt kỹ: triệu hồi hỏa phượng hoàng lao qua, thiêu mọi kẻ địch trên đường, 400% công lực.'},
  hanbang:{name:'Hàn Băng Tiễn',icon:'❄',col:'#9fe8ff',lv:1,mp:10,cd:3,kind:'proj',fx:'ice',range:260,mult:2.0,slow:{dur:3,amt:0.45},desc:'Bắn mũi băng tiễn, 200% công lực và làm chậm 45% trong 3 giây. Khắc chế sát thủ và cận chiến.'},
  hoixuan:{name:'Hồi Xuân Quyết',icon:'✚',col:'#7dff9a',lv:3,mp:22,cd:12,kind:'heal',pct:0.35,hot:{dur:5,pct:0.03},desc:'Hồi ngay 35% sinh lực, sau đó hồi thêm 3% mỗi giây trong 5 giây. Chỉ hồi cho bản thân.'},
  bangphong:{name:'Băng Phong Trận',icon:'❅',col:'#c8f4ff',lv:6,mp:24,cd:10,kind:'aoeSelf',r:115,mult:1.6,freeze:1.6,desc:'Băng trận quanh thân, 160% công lực và đóng băng kẻ địch 1,6 giây.'},
  thuylong:{name:'Thủy Long Ngâm',icon:'≋',col:'#6fd8ff',lv:10,mp:45,cd:24,kind:'dragon',r:170,mult:3.0,healPct:0.2,desc:'Tuyệt kỹ: thủy long cuộn quanh thân, 300% công lực lên kẻ địch xung quanh, làm chậm và hồi 20% sinh lực.'},
  // Bách Thảo Cốc (dược sư)
  bichdiep:{name:'Bích Diệp Phi Châm',icon:'❦',col:'#9fff8a',lv:1,mp:10,cd:3,kind:'proj',fx:'leaf',range:260,mult:1.9,poison:{dur:6,mult:0.4},desc:'Phóng lá độc vào mục tiêu, 190% công lực và trúng độc 6 giây. Độc bỏ qua phòng thủ, khắc chế phái Thổ.'},
  thanhmoc:{name:'Thanh Mộc Hồi Sinh',icon:'✚',col:'#7dff9a',lv:3,mp:24,cd:9,kind:'groupHeal',r:360,pct:0.3,hot:{dur:6,pct:0.025},desc:'Hồi 30% sinh lực cho bản thân và mọi đồng đội trong tổ đội ở gần, sau đó hồi thêm 2,5% mỗi giây trong 6 giây.'},
  vanmoc:{name:'Vạn Mộc Hộ Trận',icon:'♣',col:'#c8f0a0',lv:6,mp:26,cd:22,kind:'groupBuff',r:360,buff:{id:'wood',dur:12,defm:0.35,pct:0.015},desc:'Rễ cây thần bao bọc cả tổ đội 12 giây: tăng 35% phòng thủ và hồi 1,5% sinh lực mỗi giây.'},
  linhvuc:{name:'Bách Thảo Linh Vực',icon:'✿',col:'#b8ffb0',lv:10,mp:48,cd:26,kind:'field',r:150,dur:6,mult:0.9,healPct:0.06,desc:'Tuyệt kỹ: mở vườn linh thảo quanh thân 6 giây. Mỗi giây hồi 6% sinh lực cho cả tổ đội, gây 90% công lực và làm chậm kẻ địch trong vùng.'},
  // Hậu Thổ Môn (hộ vệ)
  lietdia:{name:'Liệt Địa Chùy',icon:'⛰',col:'#e8c070',lv:1,mp:12,cd:5,kind:'aoeSelf',r:95,mult:1.6,stun:1.0,desc:'Nện chùy xuống đất, 160% công lực lên kẻ địch xung quanh và làm choáng 1 giây.'},
  sonnhac:{name:'Sơn Nhạc Hống',icon:'☗',col:'#ffd27a',lv:3,mp:16,cd:12,kind:'taunt',r:240,buff:{id:'rock',dur:6,dr:0.3},desc:'Gầm vang như núi lở, kéo mọi quái trong vùng lao vào mình và giảm 30% sát thương nhận vào trong 6 giây. Che chắn cho đồng đội.'},
  kimcang:{name:'Kim Cang Bất Hoại',icon:'◈',col:'#ffe9a0',lv:6,mp:24,cd:22,kind:'buff',buff:{id:'diamond',dur:9,dr:0.45,reflect:0.4},desc:'Thân hóa kim cang 9 giây: giảm 45% sát thương nhận vào và phản lại 40% sát thương cho kẻ đánh mình.'},
  thaison:{name:'Thái Sơn Áp Đỉnh',icon:'▲',col:'#f0b060',lv:10,mp:45,cd:24,kind:'quake',range:220,r:135,mult:3.4,stun:2.2,desc:'Tuyệt kỹ: gọi núi đá giáng xuống vùng mục tiêu, 340% công lực và làm choáng 2,2 giây.'},
  // Ảnh Nguyệt Lâu (sát thủ)
  anhsat:{name:'Ảnh Sát',icon:'✧',col:'#d8b8ff',lv:1,mp:12,cd:5,kind:'dash',range:280,mult:2.6,desc:'Lướt như bóng tới sau lưng mục tiêu và đâm một nhát 260% công lực, bạo kích dễ hơn.'},
  docnguyet:{name:'Độc Nguyệt Tiêu',icon:'☾',col:'#b48cff',lv:3,mp:16,cd:7,kind:'proj',fx:'dark',range:250,mult:1.9,mark:{dur:6,amt:0.25},desc:'Phóng ám tiêu hình trăng khuyết, 190% công lực và đánh dấu mục tiêu: chịu thêm 25% sát thương trong 6 giây.'},
  anthan:{name:'Ẩn Thân Quyết',icon:'◐',col:'#a088d0',lv:6,mp:22,cd:20,kind:'buff',buff:{id:'stealth',dur:7,dodge:0.45,crit:0.35,atk:0.15},desc:'Hòa vào bóng tối 7 giây: né 45% đòn đánh, tăng 35% bạo kích và 15% công lực.'},
  huyetnguyet:{name:'Huyết Nguyệt Liên Sát',icon:'✺',col:'#ff6a9a',lv:10,mp:42,cd:20,kind:'multi',range:200,hits:7,mult:1.15,desc:'Tuyệt kỹ: lướt quanh mục tiêu chém 7 nhát liên hoàn, mỗi nhát 115% công lực, bạo kích tăng mạnh.'}
};

// ===================== QUÁI =====================
const MT={
  wolf:{name:'Sói Xám',lv:[1,3],hp:105,atk:9,def:3,spd:90,exp:15,gold:[2,4],aggro:0,range:30,cd:1.2,hpP:.06,mpP:.04,hh:32,hw:22,tier:0,loot:.16,draw:'wolf',col:'#8d939b'},
  boar:{name:'Lợn Rừng',lv:[4,6],hp:250,atk:20,def:8,spd:82,exp:40,gold:[5,9],aggro:80,range:32,cd:1.3,hpP:.08,mpP:.05,hh:32,hw:24,tier:1,loot:.18,draw:'boar'},
  bandit:{name:'Sơn Tặc',lv:[7,9],hp:440,atk:33,def:13,spd:100,exp:85,gold:[10,18],aggro:130,range:34,cd:1.2,hpP:.1,mpP:.07,hh:62,hw:16,tier:2,loot:.2,draw:'human',look:'bandit'},
  boss:{name:'Hắc Phong Trại Chủ',lv:[12,12],hp:7000,atk:64,def:20,spd:95,exp:900,gold:[250,350],aggro:180,range:50,cd:1.4,boss:true,hpP:1,mpP:1,hh:92,hw:26,tier:3,loot:1,draw:'human',look:'boss',scale:1.45,bskill:'slam',add:'bandit'},
  snake:{name:'Thủy Xà',lv:[12,14],hp:900,atk:75,def:24,spd:85,exp:150,gold:[18,28],aggro:90,range:34,cd:1.2,hpP:.08,mpP:.05,hh:30,hw:24,tier:3,loot:.18,draw:'snake',col:'#3f9f7f'},
  fox:{name:'Hồ Yêu',lv:[15,17],hp:1200,atk:90,def:30,spd:110,exp:210,gold:[22,34],aggro:120,range:32,cd:1.1,hpP:.08,mpP:.05,hh:34,hw:24,tier:4,loot:.18,draw:'fox',tails:2,col:'#e8823a'},
  pirate:{name:'Thủy Tặc',lv:[17,19],hp:1550,atk:105,def:36,spd:100,exp:270,gold:[28,42],aggro:130,range:34,cd:1.2,hpP:.1,mpP:.06,hh:62,hw:16,tier:4,loot:.2,draw:'human',look:'pirate'},
  foxboss:{name:'Cửu Vĩ Yêu Hồ',lv:[21,21],hp:11000,atk:140,def:48,spd:110,exp:4000,gold:[900,1200],aggro:200,range:58,cd:1.3,boss:true,hpP:1,mpP:1,hh:66,hw:40,tier:5,loot:1,draw:'fox',tails:9,col:'#f2a64e',scale:1.9,bskill:'fire',add:'fox'},
  snowwolf:{name:'Tuyết Lang',lv:[20,22],hp:1500,atk:110,def:44,spd:100,exp:340,gold:[34,50],aggro:120,range:30,cd:1.1,hpP:.08,mpP:.05,hh:32,hw:22,tier:5,loot:.18,draw:'wolf',col:'#e3eaf3'},
  icespirit:{name:'Băng Tinh',lv:[23,25],hp:1800,atk:120,def:50,spd:70,exp:430,gold:[40,58],aggro:150,range:165,cd:1.7,hpP:.08,mpP:.06,hh:44,hw:18,tier:5,loot:.2,draw:'spirit',ranged:true},
  cultist:{name:'Ma Giáo Đồ',lv:[26,28],hp:2300,atk:140,def:58,spd:100,exp:540,gold:[48,70],aggro:140,range:34,cd:1.1,hpP:.1,mpP:.06,hh:62,hw:16,tier:6,loot:.2,draw:'human',look:'cultist'},
  iceboss:{name:'Băng Phách Ma Tôn',lv:[31,31],hp:20000,atk:190,def:72,spd:95,exp:12000,gold:[2000,2600],aggro:200,range:56,cd:1.3,boss:true,hpP:1,mpP:1,hh:98,hw:26,tier:6,loot:1,draw:'human',look:'iceboss',scale:1.55,bskill:'ice',add:'cultist'}
};

// ===================== TRANG BỊ =====================
const EQ_KEYS=['weapon','helmet','armor','vest','gloves','wrist','boots','amulet','necklace','ring1','ring2'];
const SLOTS=['weapon','helmet','armor','vest','gloves','wrist','boots','amulet','necklace','ring'];
const SLOTNAME={weapon:'Vũ khí',helmet:'Mũ',armor:'Áo',vest:'Giáp',gloves:'Bao tay',wrist:'Hộ uyển',boots:'Bao chân',amulet:'Hộ phù',necklace:'Dây chuyền',ring:'Nhẫn',ring1:'Nhẫn',ring2:'Nhẫn'};
const SLOTICON={weapon:'⚔',helmet:'冠',armor:'衣',vest:'甲',gloves:'✋',wrist:'腕',boots:'履',amulet:'符',necklace:'◎',ring:'◯',ring1:'◯',ring2:'◯'};
const WICON={sword:'⚔',fan:'扇',flute:'笛',staff:'杖',hammer:'鎚',dagger:'匕'};
const TIER_PRE=['Bố','Thanh Đồng','Huyền Thiết','Tử Kim','Lưu Vân','Hàn Ngọc','Xích Viêm','Thiên Tinh','Long Lân','Tiên Thiên'];
const SLOT_SUF={helmet:'Đầu Quan',armor:'Trường Bào',vest:'Hộ Giáp',gloves:'Thủ Sáo',wrist:'Hộ Uyển',boots:'Hộ Cước',amulet:'Hộ Phù',necklace:'Hạng Liên',ring:'Giới Chỉ',sword:'Kiếm',fan:'Phiến',flute:'Tiêu',staff:'Trượng',hammer:'Chùy',dagger:'Song Chủy'};
// chỉ số cơ bản theo bậc t (0..9)
const SLOT_STATS={
  weapon:t=>({atk:7+9*t}),
  helmet:t=>({def:2+2.5*t,hp:12+16*t}),
  armor:t=>({def:3+3.5*t,hp:20+26*t}),
  vest:t=>({def:3+3.2*t}),
  gloves:t=>({atk:1.5+2*t,crit:1+0.3*t}),
  wrist:t=>({atk:1+1.2*t,def:1+1.2*t}),
  boots:t=>({def:1.5+2*t,spd:4+1.6*t}),
  amulet:t=>({hp:14+20*t,mp:10+12*t}),
  necklace:t=>({mp:12+14*t,atk:1+1.4*t}),
  ring:t=>({atk:1+1.8*t,crit:1+0.25*t})
};
const MAXTIER=17;
const RARITY=[
  {n:'Thường',c:'#e6e6e6',m:1,b:0},
  {n:'Tinh xảo',c:'#72e872',m:1.2,b:1},
  {n:'Hiếm',c:'#5cb4ff',m:1.45,b:2},
  {n:'Truyền thuyết',c:'#ffb340',m:1.85,b:3}
];
const TIER_LV=[1,4,7,11,15,20,26,32,42,52];
const STATNAME={atk:'Công lực',def:'Phòng thủ',hp:'Sinh lực',mp:'Nội lực',crit:'Bạo kích',spd:'Tốc độ'};
const BAG_MAX=40;
// cường hóa từng món: tối đa +15, thất bại chỉ mất lượng
const REF_MAX=15;
const refRate=r=>r<5?100:[80,70,60,50,40,35,30,25,20,15][r-5];
const refCost=it=>Math.round((it.slot==='weapon'?40:18)*(1+it.tier*0.6)*((it.ref||0)+1)**2);
// chỉ số cộng thêm của món đồ khi cường hóa +r
function refBonus(it){const r=it&&it.ref||0;if(!r)return{};
  if(it.slot==='weapon')return{atk:r*(3+it.tier*2)};
  const base=SLOT_STATS[it.slot](it.tier),o={};for(const k of ['atk','def','hp','mp'])if(base[k])o[k]=Math.max(1,Math.round(base[k]*0.1*r));return o;}


// ===================== GIAO DIỆN TỪNG VÙNG =====================
const THEMES={
  spring:{grass:'#5aa646',light:'rgba(150,210,95,.22)',dark:'rgba(35,105,40,.22)',pathE:'#b08a52',pathI:'#d8b97e',peb:['#bfa06a','#e6cf9c'],shore:'#8f7d52',water:'#4a92d2',deep:'#3a7cc0',
    floor:['#c9c3b2','#bfb9a8','#d3cdbd','#c2bcab'],floorBase:'#a9a392',arena:'#54453b',arenaPeb:['#3e322b','#6a584b'],tuft:['#3c8a32','#78c050'],flowers:['#fff27a','#ff9cc4','#ffffff','#c7a6ff'],
    weather:'petal',tint:'rgba(255,214,160,.05)',music:'calm',tree:'#2f7a2e',roof:'#a63a28',herb:'linh'},
  marsh:{grass:'#4c8c66',light:'rgba(130,205,165,.2)',dark:'rgba(18,70,52,.26)',pathE:'#5e4a2c',pathI:'#8f7650',peb:['#6e5838','#a68a5e'],shore:'#6a6444',water:'#3f8a94',deep:'#2c6c78',
    floor:['#a07e54','#8e6e48','#ac8a5e','#987650'],floorBase:'#6e5232',arena:'#3a3a32',arenaPeb:['#2a2a24','#55554a'],tuft:['#2f6f4a','#7ab874'],flowers:['#ffffff','#ffc8ec','#c8f0ff'],
    weather:'firefly',tint:'rgba(40,110,100,.10)',music:'marsh',tree:'#2a5e3e',roof:'#9a7a3a',herb:'lotus'},
  snow:{grass:'#e4ebf4',light:'rgba(255,255,255,.55)',dark:'rgba(140,168,206,.24)',pathE:'#a8b6c8',pathI:'#ccd7e3',peb:['#b4c0ce','#f2f6fa'],shore:'#c4d8ea',water:'#6aa2cc',deep:'#4e86b4',
    floor:['#a8aeb8','#9ca3ad','#b4bac4','#a2a8b2'],floorBase:'#868c96',arena:'#4a5466',arenaPeb:['#3a4252','#6a7486'],tuft:['#b4c6da','#98b0ca'],flowers:['#9fe0ff','#c8f0ff','#ffffff'],
    weather:'snow',tint:'rgba(170,200,255,.07)',music:'snow',tree:'#3e6a5a',roof:'#4a5a78',herb:'snowlotus'}
};

// ===================== CÁC BẢN ĐỒ =====================
const MAPS={
  trukhe:{name:'Đại Lý',lvText:'1–12',minLv:1,theme:'spring',wx:0.2,wy:0.7,
    gen:{seed:20261031,river:{x:30},lakes:[],safe:{x0:3,y0:3,x1:16,y1:15,gates:[['e',8,10],['s',9,11]]},houses:[[5,4],[12,4],[4,11]],well:[7,12],
      arena:{x0:49,y0:34,x1:61,y1:45,gap:['w',36,38]},roads:[[17,9,61,9],[10,16,10,37],[10,37,48,37]],dens:0.085},
    safeName:'Trúc Khê Thôn',revive:[10.5,12.5],
    zones:{wolf:{x:18,y:26,r:5,n:9},boar:{x:42,y:20,r:6,n:9},bandit:{x:39,y:41,r:5,n:9},boss:{x:55,y:40,r:0,n:1}},
    herbs:{name:'Linh Thảo',zones:[{x:22,y:17,r:4,n:5},{x:46,y:29,r:4,n:4}]},
    regions:[{n:'Rừng Sói Xám',x:18,y:26,r:9},{n:'Linh Thảo Pha',x:22,y:17,r:5},{n:'Đồng Cỏ Bên Sông',x:42,y:20,r:10},{n:'Hẻm Sơn Tặc',x:39,y:41,r:8},{n:'Hắc Phong Trại',x:55,y:40,r:8}],
    npcs:[{id:'elder',name:'Trưởng Làng',kind:'quest',look:'elder',x:9.5,y:9.3},{id:'healer',name:'Y Sư',kind:'healer',look:'healer',x:6.5,y:7.7},{id:'smith',name:'Thợ Rèn',kind:'smith',look:'smith',x:13.5,y:7.7}],
    portals:[{x:60,y:9.5,to:'vanmong',tx:9,ty:24.5,minLv:12}]},
  vanmong:{name:'Nhĩ Hải',lvText:'12–21',minLv:12,theme:'marsh',wx:0.5,wy:0.48,
    gen:{seed:777123,river:null,lakes:[[24,13,6,4],[22,37,5,3],[38,26,6,5],[52,15,6,4]],safe:{x0:3,y0:19,x1:14,y1:30,gates:[['e',24,26],['n',8,10]]},houses:[[4,20],[10,20],[4,26]],well:null,
      arena:{x0:47,y0:34,x1:61,y1:45,gap:['w',38,40]},roads:[[15,25,46,25],[9,18,9,8],[9,8,40,8],[32,8,32,3],[30,25,30,39],[30,39,47,39]],dens:0.075},
    safeName:'Song Lang Ngư Thôn',revive:[11.5,27.5],
    zones:{snake:{x:22,y:29,r:5,n:9},fox:{x:40,y:11,r:5,n:9},pirate:{x:37,y:41,r:5,n:9},foxboss:{x:55,y:40,r:0,n:1}},
    herbs:{name:'Thủy Liên',zones:[{x:30,y:32,r:3,n:5},{x:17,y:11,r:3,n:4}]},
    regions:[{n:'Đầm Thủy Xà',x:22,y:29,r:8},{n:'Hồ Ly Lâm',x:40,y:11,r:8},{n:'Thủy Trại',x:37,y:41,r:7},{n:'Yêu Hồ Động',x:55,y:40,r:8},{n:'Liên Hoa Đàm',x:30,y:32,r:4}],
    npcs:[{id:'fisher',name:'Ngư Ông',kind:'quest',look:'fisher',x:7.5,y:23.8},{id:'herbalist',name:'Dược Cô',kind:'healer',look:'herbalist',x:11.5,y:23.8},{id:'merchant',name:'Thương Nhân',kind:'smith',look:'merchant',x:9.5,y:28.6}],
    portals:[{x:5.5,y:24.5,to:'trukhe',tx:57.5,ty:9.5,minLv:1},{x:32.5,y:3.5,to:'thienson',tx:32.5,ty:42.5,minLv:20}]},
  thienson:{name:'Ngọc Long Tuyết Sơn',lvText:'20–31',minLv:20,theme:'snow',wx:0.8,wy:0.26,
    gen:{seed:5550123,river:null,lakes:[[32,22,6,3]],safe:{x0:24,y0:35,x1:40,y1:45,gates:[['n',31,33]]},houses:[[25,37],[36,37],[25,41]],well:null,
      arena:{x0:40,y0:3,x1:55,y1:13,gap:['s',46,48]},roads:[[32,34,32,16],[14,30,50,30],[15,30,15,36],[16,30,16,16],[32,16,47,16],[47,16,47,14]],dens:0.075},
    safeName:'Lệ Giang Cổ Thành',revive:[34.5,42.5],
    zones:{snowwolf:{x:15,y:38,r:5,n:9},icespirit:{x:48,y:32,r:5,n:8},cultist:{x:17,y:14,r:5,n:9},iceboss:{x:47,y:8,r:0,n:1}},
    herbs:{name:'Tuyết Liên',zones:[{x:24,y:20,r:3,n:5},{x:44,y:22,r:3,n:4}]},
    regions:[{n:'Tuyết Lang Cốc',x:15,y:38,r:8},{n:'Băng Tinh Nguyên',x:48,y:32,r:8},{n:'Ma Giáo Doanh',x:17,y:14,r:8},{n:'Băng Phách Điện',x:47,y:8,r:8},{n:'Hàn Băng Hồ',x:32,y:22,r:6}],
    npcs:[{id:'taoist',name:'Thanh Hư Đạo Trưởng',kind:'quest',look:'taoist',x:32.5,y:39.2},{id:'daotong',name:'Đạo Đồng',kind:'healer',look:'daotong',x:29,y:39.6},{id:'ironsmith',name:'Thiết Tượng',kind:'smith',look:'ironsmith',x:37.5,y:41.5}],
    portals:[{x:29.5,y:43.5,to:'vanmong',tx:32.5,ty:6.5,minLv:1}]}
};
// ===================== VÙNG CAO CẤP (31–60) =====================
Object.assign(MT,{
  sandwolf:{name:'Sa Lang',lv:[31,33],hp:2800,atk:170,def:66,spd:105,exp:720,gold:[60,85],aggro:120,range:30,cd:1.1,hpP:.08,mpP:.05,hh:32,hw:22,tier:7,loot:.18,draw:'wolf',col:'#c8a060'},
  sandsnake:{name:'Sa Xà',lv:[34,36],hp:3200,atk:190,def:74,spd:90,exp:860,gold:[70,95],aggro:100,range:34,cd:1.2,hpP:.08,mpP:.05,hh:30,hw:24,tier:7,loot:.18,draw:'snake',col:'#b8783a'},
  nomad:{name:'Mã Tặc',lv:[37,39],hp:3700,atk:215,def:82,spd:105,exp:1000,gold:[80,110],aggro:140,range:34,cd:1.1,hpP:.1,mpP:.06,hh:62,hw:16,tier:7,loot:.2,draw:'human',look:'nomad'},
  sandking:{name:'Sa Mạc Lang Vương',lv:[42,42],hp:30000,atk:260,def:95,spd:115,exp:20000,gold:[3000,4000],aggro:220,range:60,cd:1.2,boss:true,hpP:1,mpP:1,hh:70,hw:40,tier:8,loot:1,draw:'wolf',col:'#a8783a',scale:2.2,bskill:'slam',add:'sandwolf'},
  ghost:{name:'U Linh',lv:[41,43],hp:4000,atk:240,def:90,spd:75,exp:1200,gold:[90,120],aggro:150,range:165,cd:1.6,hpP:.08,mpP:.06,hh:44,hw:18,tier:8,loot:.2,draw:'spirit',col:'#b48cff',ranged:true,shot:'edark'},
  darkfox:{name:'Ám Hồ',lv:[44,46],hp:4600,atk:270,def:98,spd:115,exp:1400,gold:[100,135],aggro:130,range:32,cd:1.05,hpP:.08,mpP:.05,hh:34,hw:24,tier:8,loot:.18,draw:'fox',tails:3,col:'#6a4aa0'},
  ghoul:{name:'Thi Quỷ',lv:[47,49],hp:5200,atk:300,def:106,spd:95,exp:1650,gold:[110,150],aggro:140,range:34,cd:1.1,hpP:.1,mpP:.06,hh:62,hw:16,tier:8,loot:.2,draw:'human',look:'ghoul'},
  ghostking:{name:'U Minh Quỷ Vương',lv:[52,52],hp:45000,atk:350,def:120,spd:100,exp:35000,gold:[5000,6500],aggro:220,range:56,cd:1.25,boss:true,hpP:1,mpP:1,hh:98,hw:26,tier:9,loot:1,draw:'human',look:'ghostking',scale:1.6,bskill:'fire',bshot:'edark',add:'ghoul'},
  cloudspirit:{name:'Vân Linh',lv:[51,53],hp:5700,atk:335,def:114,spd:80,exp:1900,gold:[130,170],aggro:150,range:170,cd:1.5,hpP:.08,mpP:.06,hh:44,hw:18,tier:9,loot:.2,draw:'spirit',col:'#ffd870',ranged:true,shot:'egold'},
  skyfox:{name:'Thiên Hồ',lv:[54,56],hp:6300,atk:370,def:122,spd:120,exp:2200,gold:[145,190],aggro:130,range:32,cd:1.0,hpP:.08,mpP:.05,hh:34,hw:24,tier:9,loot:.18,draw:'fox',tails:5,col:'#f4f0ff'},
  guard:{name:'Thiên Binh',lv:[57,59],hp:6900,atk:405,def:130,spd:105,exp:2550,gold:[160,210],aggro:140,range:36,cd:1.1,hpP:.1,mpP:.06,hh:62,hw:16,tier:9,loot:.2,draw:'human',look:'guard'},
  fallen:{name:'Đọa Tiên Ma Quân',lv:[60,60],hp:65000,atk:460,def:145,spd:105,exp:60000,gold:[9000,12000],aggro:220,range:58,cd:1.2,boss:true,hpP:1,mpP:1,hh:100,hw:26,tier:9,loot:1,draw:'human',look:'fallen',scale:1.65,bskill:'ice',bshot:'egold',add:'guard'}
});
Object.assign(THEMES,{
  desert:{grass:'#dcbc82',light:'rgba(255,240,200,.35)',dark:'rgba(170,120,60,.22)',pathE:'#a8865a',pathI:'#d4b47e',peb:['#b89868','#ecd4a4'],shore:'#c8b07a',water:'#3aa0b8',deep:'#2a80a0',
    floor:['#d8b484','#ccA676','#e0be90','#d0ac7c'],floorBase:'#b08a5a',arena:'#7a4a2a',arenaPeb:['#5a3218','#9a6a42'],tuft:['#b8a050','#8a7a3a'],flowers:['#ff8a5a','#ffd060','#ff6a8a'],
    weather:'sand',tint:'rgba(255,190,110,.08)',music:'desert',tree:'#7a8a3a',roof:'#c87a3a',herb:'desertflower'},
  dark:{grass:'#3c4c40',light:'rgba(120,160,130,.14)',dark:'rgba(10,20,15,.35)',pathE:'#3e3630',pathI:'#5e5244',peb:['#4a4038','#7a6c5c'],shore:'#33332a',water:'#4a3a6a',deep:'#33264e',
    floor:['#5a5a62','#50505a','#64646c','#56565e'],floorBase:'#3e3e46',arena:'#2a2030',arenaPeb:['#1a1420','#4a3a50'],tuft:['#2a3a2e','#4a6a52'],flowers:['#b080ff','#80ffd0','#ff80c0'],
    weather:'spirit',tint:'rgba(40,20,70,.22)',music:'dark',tree:'#1e2e24',roof:'#4a3a5a',herb:'ghostflower'},
  heaven:{grass:'#cfe6d8',light:'rgba(255,255,255,.5)',dark:'rgba(180,200,255,.2)',pathE:'#e0cc96',pathI:'#fff0c4',peb:['#f0dca8','#ffffff'],shore:'#ffffff',water:'#c4dcff',deep:'#a8c4f0',
    floor:['#dcf2ea','#cce8de','#e6f8f2','#d4ece4'],floorBase:'#a8c8bc',arena:'#5a4a7a',arenaPeb:['#3a2e52','#7a6a9a'],tuft:['#a8d8b8','#e8fff0'],flowers:['#ffd0f0','#fff8b0','#c8e8ff'],
    weather:'glow',tint:'rgba(255,240,200,.07)',music:'heaven',tree:'#7ab89a',roof:'#e0b040',herb:'jadeflower'}
});
MAPS.thienson.portals.push({x:3.5,y:30.5,to:'lacnhat',tx:9.5,ty:25.5,minLv:30});
MAPS.thienson.gen.roads.push([3,30,14,30]);
Object.assign(MAPS.trukhe,{wx:0.1,wy:0.78});Object.assign(MAPS.vanmong,{wx:0.28,wy:0.56});Object.assign(MAPS.thienson,{wx:0.46,wy:0.26});
Object.assign(MAPS,{
  lacnhat:{name:'Đôn Hoàng Minh Sa',lvText:'30–42',minLv:30,theme:'desert',wx:0.64,wy:0.5,
    gen:{seed:31313,river:null,lakes:[[22,14,4,3],[36,18,4,3]],safe:{x0:4,y0:20,x1:16,y1:31,gates:[['e',25,27],['n',9,11]]},houses:[[5,21],[11,21],[5,27]],well:null,
      arena:{x0:46,y0:3,x1:61,y1:14,gap:['s',52,54]},roads:[[17,26,61,26],[53,26,53,15],[10,19,10,9],[10,9,40,9],[30,26,30,40]],dens:0.05},
    safeName:'Đôn Hoàng Thành',revive:[12.5,28.5],
    zones:{sandwolf:{x:26,y:35,r:5,n:9},sandsnake:{x:44,y:37,r:5,n:9},nomad:{x:28,y:12,r:5,n:9},sandking:{x:54,y:8,r:0,n:1}},
    herbs:{name:'Sa Mạc Linh Hoa',zones:[{x:20,y:41,r:3,n:5},{x:40,y:14,r:3,n:4}]},
    regions:[{n:'Sa Lang Khâu',x:26,y:35,r:8},{n:'Hoàng Sa Cốc',x:44,y:37,r:8},{n:'Mã Tặc Doanh',x:28,y:12,r:8},{n:'Lang Vương Thành',x:54,y:8,r:8},{n:'Lục Châu Hồ',x:36,y:18,r:5}],
    npcs:[{id:'caravan',name:'Lão Thương Đà',kind:'quest',look:'caravan',x:9.5,y:24},{id:'oasisdoc',name:'Lục Châu Y Nữ',kind:'healer',look:'oasisdoc',x:13.5,y:25},{id:'swordsmith',name:'Đao Tượng',kind:'smith',look:'swordsmith',x:10.5,y:29.4}],
    portals:[{x:6.5,y:25,to:'thienson',tx:6.5,ty:30.5,minLv:1},{x:60,y:26.5,to:'uminh',tx:10.5,ty:43.5,minLv:40}]},
  uminh:{name:'Phong Đô Quỷ Thành',lvText:'40–52',minLv:40,theme:'dark',wx:0.82,wy:0.74,
    gen:{seed:41414,river:null,lakes:[[30,20,6,4],[46,35,4,3]],safe:{x0:3,y0:34,x1:15,y1:45,gates:[['n',8,10],['e',39,41]]},houses:[[4,35],[11,35],[4,40]],well:null,
      arena:{x0:44,y0:3,x1:61,y1:15,gap:['w',8,10]},roads:[[9,33,9,9],[9,9,44,9],[16,40,57,40],[30,40,30,26]],dens:0.1},
    safeName:'Phong Đô Trấn',revive:[13.5,42.5],
    zones:{ghost:{x:22,y:28,r:5,n:8},darkfox:{x:44,y:28,r:5,n:9},ghoul:{x:24,y:15,r:5,n:9},ghostking:{x:54,y:9,r:0,n:1}},
    herbs:{name:'U Minh Hoa',zones:[{x:37,y:32,r:3,n:5},{x:16,y:21,r:3,n:4}]},
    regions:[{n:'U Linh Trủng',x:22,y:28,r:8},{n:'Ám Hồ Lâm',x:44,y:28,r:8},{n:'Thi Quỷ Cốc',x:24,y:15,r:8},{n:'Quỷ Vương Điện',x:54,y:9,r:8},{n:'Tử Thủy Đàm',x:30,y:20,r:6}],
    npcs:[{id:'exorcist',name:'Trừ Ma Pháp Sư',kind:'quest',look:'exorcist',x:9.5,y:38.8},{id:'shaman',name:'Vu Y',kind:'healer',look:'shaman',x:13,y:39.6},{id:'darksmith',name:'Hắc Thiết Tượng',kind:'smith',look:'darksmith',x:11.5,y:43.6}],
    portals:[{x:7.5,y:43.5,to:'lacnhat',tx:57.5,ty:26.5,minLv:1},{x:56.5,y:40.5,to:'langtieu',tx:32.5,ty:42.5,minLv:50}]},
  langtieu:{name:'Nga Mi Kim Đỉnh',lvText:'50–60',minLv:50,theme:'heaven',wx:0.86,wy:0.2,
    gen:{seed:51515,river:null,lakes:[[12,14,7,5],[52,24,6,5],[18,35,4,3]],safe:{x0:24,y0:35,x1:40,y1:45,gates:[['n',31,33]]},houses:[[25,37],[36,37],[25,41]],well:null,
      arena:{x0:22,y0:3,x1:42,y1:12,gap:['s',31,33]},roads:[[32,34,32,13],[8,26,56,26],[48,26,48,14],[10,26,10,31]],dens:0.06},
    safeName:'Báo Quốc Tự',revive:[34.5,42.5],
    zones:{cloudspirit:{x:10,y:30,r:5,n:8},skyfox:{x:46,y:37,r:5,n:9},guard:{x:48,y:12,r:5,n:9},fallen:{x:32,y:7,r:0,n:1}},
    herbs:{name:'Ngọc Linh Chi',zones:[{x:20,y:20,r:3,n:5},{x:42,y:31,r:3,n:4}]},
    regions:[{n:'Vân Hải Nhai',x:10,y:30,r:8},{n:'Thiên Hồ Uyển',x:46,y:37,r:8},{n:'Thiên Binh Doanh',x:48,y:12,r:8},{n:'Đọa Tiên Đài',x:32,y:7,r:8},{n:'Vân Hải',x:12,y:14,r:7}],
    npcs:[{id:'immortal',name:'Thái Thượng Tiên Ông',kind:'quest',look:'immortal',x:32.5,y:39.2},{id:'fairy',name:'Bách Hoa Tiên Tử',kind:'healer',look:'fairy',x:29,y:39.6},{id:'celestialsmith',name:'Thiên Công',kind:'smith',look:'celestialsmith',x:37.5,y:41.5}],
    portals:[{x:29.5,y:43.5,to:'uminh',tx:53.5,ty:40.5,minLv:1}]}
});

const NPC_INDEX={};
for(const id in MAPS)for(const n of MAPS[id].npcs)NPC_INDEX[n.id]=Object.assign({map:id},n);

// ===================== NHIỆM VỤ =====================
const QUESTS=[
  {map:'trukhe',title:'Diệt Sói Xám',giver:'elder',type:'kill',target:'wolf',n:10,short:'Hạ Sói Xám ở rừng phía nam làng',
    desc:'Bầy sói xám ở khu rừng phía nam làng đang tấn công gia súc. Thiếu hiệp hãy hạ giúp lão 10 con.',reward:{exp:90,gold:30,hp:3}},
  {map:'trukhe',title:'Linh Thảo Cứu Người',giver:'healer',type:'gather',n:6,short:'Hái Linh Thảo (cây phát sáng)',
    desc:'Dân làng bị sói cắn cần thuốc. Hãy hái giúp ta 6 cây Linh Thảo mọc ở Linh Thảo Pha phía bắc rừng sói. Cây phát sáng xanh, nhấp vào để hái.',reward:{exp:160,gold:40,mp:5}},
  {map:'trukhe',title:'Săn Lợn Rừng',giver:'elder',type:'kill',target:'boar',n:12,short:'Hạ Lợn Rừng bên kia sông',
    desc:'Lợn rừng phá nương rẫy ở đồng cỏ bên kia sông. Qua cầu phía đông làng và hạ 12 con.',reward:{exp:280,gold:80,hp:5,item:{slot:'armor',tier:1,rar:2}}},
  {map:'trukhe',title:'Ngự Kiếm Phi Hành',giver:'elder',type:'level',n:7,short:'Tu luyện đạt cấp 7',
    desc:'Căn cơ của thiếu hiệp đã vững. Khi tu vi đạt cấp 7, lão sẽ truyền cho thuật Ngự Kiếm Phi Hành để đi lại giang hồ.',reward:{exp:120,gold:60,fly:true}},
  {map:'trukhe',title:'Trừ Sơn Tặc',giver:'elder',type:'kill',target:'bandit',n:14,short:'Hạ Sơn Tặc ở hẻm đông nam',
    desc:'Bọn sơn tặc chặn đường ở hẻm núi đông nam, cướp của khách buôn. Hạ 14 tên để răn đe chúng.',reward:{exp:700,gold:150,hp:5}},
  {map:'trukhe',title:'Mật Thư Sơn Trại',giver:'smith',type:'drop',target:'bandit',n:5,item:'Mật thư',chance:0.4,short:'Đoạt Mật thư từ Sơn Tặc',
    desc:'Lão nghe nói bọn sơn tặc định tập kích làng. Thiếu hiệp hãy đoạt 5 bức mật thư từ chúng để biết kế hoạch. Đổi lại lão tặng một món binh khí tốt.',reward:{exp:550,gold:120,item:{slot:'weapon',tier:2,rar:2}}},
  {map:'trukhe',title:'Phá Hắc Phong Trại',giver:'elder',type:'kill',target:'boss',n:1,short:'Hạ Hắc Phong Trại Chủ',
    desc:'Kẻ cầm đầu là Hắc Phong Trại Chủ, võ công cao cường, ẩn náu ở góc đông nam. Khi bị thương nặng hắn sẽ nổi giận và gọi đồng bọn. Nên đạt cấp 11 trở lên rồi hãy đi!',reward:{exp:1600,gold:500,hp:10,item:{slot:'jade',tier:3,rar:3}}},
  {map:'vanmong',title:'Đường Tới Vân Mộng',giver:'fisher',type:'talk',n:1,short:'Qua Truyền Tống Trận, gặp Ngư Ông',
    desc:'Ngư Ông ở Song Lang Ngư Thôn, Nhĩ Hải, đang cần người giúp. Truyền Tống Trận nằm ở cuối con đường phía đông Trúc Khê Thôn, cần cấp 12 trở lên.',reward:{exp:400,gold:100,hp:5,mp:5}},
  {map:'vanmong',title:'Thủy Xà Hoành Hành',giver:'fisher',type:'kill',target:'snake',n:12,short:'Hạ Thủy Xà ở đầm phía nam',
    desc:'Lũ Thủy Xà ở đầm phía nam làng cắn chết cá và tấn công thuyền chài. Hạ giúp lão 12 con.',reward:{exp:1500,gold:200,hp:5}},
  {map:'vanmong',title:'Thủy Liên Giải Độc',giver:'herbalist',type:'gather',n:6,short:'Hái Thủy Liên (sen phát sáng)',
    desc:'Nhiều ngư dân trúng độc rắn. Ta cần 6 đóa Thủy Liên mọc ở Liên Hoa Đàm và ven hồ phía bắc để bào chế thuốc giải.',reward:{exp:1800,gold:220,mp:8}},
  {map:'vanmong',title:'Hồ Yêu Mê Hoặc',giver:'fisher',type:'kill',target:'fox',n:12,short:'Hạ Hồ Yêu ở Hồ Ly Lâm',
    desc:'Đám Hồ Yêu ở rừng phía đông bắc mê hoặc người qua đường. Hạ 12 con để giải cứu dân làng.',reward:{exp:2600,gold:280,hp:6,item:{slot:'boots',tier:4,rar:2}}},
  {map:'vanmong',title:'Diệt Thủy Tặc',giver:'fisher',type:'kill',target:'pirate',n:14,short:'Hạ Thủy Tặc ở Thủy Trại',
    desc:'Bọn Thủy Tặc lập trại phía đông nam, cướp thuyền buôn trên đầm. Hạ 14 tên.',reward:{exp:3600,gold:350,hp:6}},
  {map:'vanmong',title:'Hải Đồ Bí Mật',giver:'merchant',type:'drop',target:'pirate',n:5,item:'Hải đồ',chance:0.4,short:'Đoạt Hải đồ từ Thủy Tặc',
    desc:'Thủy Tặc giữ những tấm hải đồ dẫn tới hang ổ của yêu hồ. Đoạt cho ta 5 tấm, ta sẽ tặng thiếu hiệp một binh khí quý.',reward:{exp:3000,gold:300,item:{slot:'weapon',tier:4,rar:2}}},
  {map:'vanmong',title:'Cửu Vĩ Yêu Hồ',giver:'fisher',type:'kill',target:'foxboss',n:1,short:'Hạ Cửu Vĩ Yêu Hồ',
    desc:'Kẻ đứng sau mọi tai họa là Cửu Vĩ Yêu Hồ ở Yêu Hồ Động góc đông nam. Nó phun hỏa cầu và gọi bầy hồ yêu khi nổi giận. Nên đạt cấp 19 trở lên!',reward:{exp:6000,gold:1200,hp:10,item:{slot:'jade',tier:5,rar:3}}},
  {map:'thienson',title:'Lên Thiên Sơn',giver:'taoist',type:'talk',n:1,short:'Qua Truyền Tống Trận phía bắc, gặp Đạo Trưởng',
    desc:'Thanh Hư Đạo Trưởng ở Lệ Giang Cổ Thành cảm nhận được ma khí trỗi dậy. Truyền Tống Trận ở cuối đường phía bắc Nhĩ Hải, cần cấp 20 trở lên.',reward:{exp:2000,gold:300,hp:5,mp:5}},
  {map:'thienson',title:'Tuyết Lang Cốc',giver:'taoist',type:'kill',target:'snowwolf',n:14,short:'Hạ Tuyết Lang ở thung lũng tây nam',
    desc:'Bầy Tuyết Lang bị ma khí làm cho điên loạn, tấn công khách hành hương. Hạ 14 con.',reward:{exp:6000,gold:500,hp:6}},
  {map:'thienson',title:'Tuyết Liên Ngàn Năm',giver:'daotong',type:'gather',n:6,short:'Hái Tuyết Liên trên núi',
    desc:'Sư phụ cần 6 đóa Tuyết Liên để luyện đan trấn áp ma khí. Tuyết Liên mọc gần Hàn Băng Hồ.',reward:{exp:6500,gold:520,mp:10}},
  {map:'thienson',title:'Băng Tinh Dị Biến',giver:'taoist',type:'kill',target:'icespirit',n:14,short:'Hạ Băng Tinh ở cánh đồng phía đông',
    desc:'Băng Tinh ở cánh đồng phía đông hấp thụ ma khí, bắn băng tiễn từ xa. Hạ 14 con, cẩn thận đừng đứng yên.',reward:{exp:8000,gold:620,hp:6,item:{slot:'armor',tier:5,rar:2}}},
  {map:'thienson',title:'Ma Giáo Xâm Nhập',giver:'taoist',type:'kill',target:'cultist',n:16,short:'Hạ Ma Giáo Đồ ở doanh trại phía bắc',
    desc:'Ma Giáo đã dựng doanh trại phía tây bắc. Hạ 16 tên Ma Giáo Đồ.',reward:{exp:10000,gold:800,hp:8}},
  {map:'thienson',title:'Ma Giáo Lệnh Bài',giver:'ironsmith',type:'drop',target:'cultist',n:6,item:'Lệnh bài',chance:0.4,short:'Đoạt Lệnh bài Ma Giáo',
    desc:'Lệnh bài Ma Giáo có thể mở cổng Băng Phách Điện. Đoạt cho ta 6 tấm, ta sẽ rèn tặng thiếu hiệp một thần binh.',reward:{exp:9000,gold:700,item:{slot:'weapon',tier:6,rar:2}}},
  {map:'thienson',title:'Băng Phách Ma Tôn',giver:'taoist',type:'kill',target:'iceboss',n:1,short:'Hạ Băng Phách Ma Tôn',
    desc:'Băng Phách Ma Tôn đang luyện ma công trong Băng Phách Điện ở đỉnh núi đông bắc. Hắn có thể đóng băng cả trời đất. Nên đạt cấp 29 trở lên!',reward:{exp:20000,gold:3000,hp:15,item:{slot:'armor',tier:6,rar:3}}}
];

QUESTS.push(
  {map:'lacnhat',title:'Sa Mạc Lạc Nhật',giver:'caravan',type:'talk',n:1,short:'Qua Truyền Tống Trận phía bắc Ngọc Long Tuyết Sơn, gặp Lão Thương Đà',
    desc:'Đạo Trưởng nhờ thiếu hiệp mang tin tới Đôn Hoàng Thành ở Đôn Hoàng Minh Sa. Truyền Tống Trận ở cuối con đường phía bắc Ngọc Long Tuyết Sơn, cần cấp 30.',reward:{exp:8000,gold:800,hp:8,mp:8}},
  {map:'lacnhat',title:'Bầy Sa Lang',giver:'caravan',type:'kill',target:'sandwolf',n:15,short:'Hạ Sa Lang ở đồi cát phía nam',
    desc:'Đoàn lạc đà bị bầy Sa Lang tấn công mỗi đêm. Hạ 15 con.',reward:{exp:22000,gold:1200,hp:8}},
  {map:'lacnhat',title:'Linh Hoa Giữa Sa Mạc',giver:'oasisdoc',type:'gather',n:6,short:'Hái Sa Mạc Linh Hoa',
    desc:'Thương nhân bị say nắng hàng loạt. Ta cần 6 đóa Sa Mạc Linh Hoa mọc rải rác trong sa mạc.',reward:{exp:24000,gold:1300,mp:10}},
  {map:'lacnhat',title:'Sa Xà Hoàng Sa',giver:'caravan',type:'kill',target:'sandsnake',n:15,short:'Hạ Sa Xà ở Hoàng Sa Cốc',
    desc:'Sa Xà ẩn dưới cát ở thung lũng đông nam, độc tính cực mạnh. Hạ 15 con.',reward:{exp:30000,gold:1500,hp:8,item:{slot:'helmet',tier:7,rar:2}}},
  {map:'lacnhat',title:'Diệt Mã Tặc',giver:'caravan',type:'kill',target:'nomad',n:16,short:'Hạ Mã Tặc ở doanh trại phía bắc',
    desc:'Bọn Mã Tặc cướp bóc khắp sa mạc. Hạ 16 tên.',reward:{exp:38000,gold:1800,hp:8}},
  {map:'lacnhat',title:'Bản Đồ Kho Báu',giver:'swordsmith',type:'drop',target:'nomad',n:6,item:'Mảnh bản đồ',chance:0.4,short:'Đoạt Mảnh bản đồ từ Mã Tặc',
    desc:'Mã Tặc giữ các mảnh bản đồ kho báu của Lang Vương. Đoạt 6 mảnh, ta rèn tặng thiếu hiệp một binh khí.',reward:{exp:36000,gold:1700,item:{slot:'weapon',tier:7,rar:2}}},
  {map:'lacnhat',title:'Sa Mạc Lang Vương',giver:'caravan',type:'kill',target:'sandking',n:1,short:'Hạ Sa Mạc Lang Vương',
    desc:'Sa Mạc Lang Vương khổng lồ chiếm cứ thành cổ phía đông bắc. Nên đạt cấp 40 trở lên!',reward:{exp:70000,gold:5000,hp:15,item:{slot:'necklace',tier:8,rar:3}}},
  {map:'uminh',title:'Phong Đô Quỷ Thành',giver:'exorcist',type:'talk',n:1,short:'Qua Truyền Tống Trận phía đông sa mạc, gặp Trừ Ma Pháp Sư',
    desc:'Âm khí bốc lên từ Phong Đô Quỷ Thành. Trừ Ma Pháp Sư đang lập doanh trại ở đó. Truyền Tống Trận ở cuối đường phía đông sa mạc, cần cấp 40.',reward:{exp:30000,gold:2000,hp:10,mp:10}},
  {map:'uminh',title:'Siêu Độ U Linh',giver:'exorcist',type:'kill',target:'ghost',n:16,short:'Hạ U Linh ở bãi tha ma',
    desc:'U Linh bắn âm hỏa từ xa, đừng đứng yên. Siêu độ 16 U Linh.',reward:{exp:60000,gold:2500,hp:10}},
  {map:'uminh',title:'U Minh Hoa',giver:'shaman',type:'gather',n:6,short:'Hái U Minh Hoa phát sáng tím',
    desc:'Cần 6 đóa U Minh Hoa để luyện bùa trừ tà.',reward:{exp:64000,gold:2600,mp:12}},
  {map:'uminh',title:'Ám Hồ Mê Lâm',giver:'exorcist',type:'kill',target:'darkfox',n:16,short:'Hạ Ám Hồ ở rừng phía đông',
    desc:'Ám Hồ ba đuôi mê hoặc người lạc vào rừng. Hạ 16 con.',reward:{exp:80000,gold:3000,hp:10,item:{slot:'gloves',tier:8,rar:2}}},
  {map:'uminh',title:'Thi Quỷ Cốc',giver:'exorcist',type:'kill',target:'ghoul',n:18,short:'Hạ Thi Quỷ ở thung lũng phía bắc',
    desc:'Thi Quỷ tràn ra từ thung lũng phía bắc. Hạ 18 tên.',reward:{exp:100000,gold:3500,hp:10}},
  {map:'uminh',title:'Hồn Châu',giver:'darksmith',type:'drop',target:'ghoul',n:6,item:'Hồn châu',chance:0.4,short:'Đoạt Hồn châu từ Thi Quỷ',
    desc:'Hồn châu có thể rèn thành binh khí trấn ma. Đoạt 6 viên.',reward:{exp:95000,gold:3300,item:{slot:'weapon',tier:8,rar:2}}},
  {map:'uminh',title:'U Minh Quỷ Vương',giver:'exorcist',type:'kill',target:'ghostking',n:1,short:'Hạ U Minh Quỷ Vương',
    desc:'U Minh Quỷ Vương ngự trong Quỷ Vương Điện phía đông bắc, phóng âm hỏa và gọi thi quỷ. Nên đạt cấp 50 trở lên!',reward:{exp:180000,gold:9000,hp:20,item:{slot:'amulet',tier:9,rar:3}}},
  {map:'langtieu',title:'Nga Mi Kim Đỉnh',giver:'immortal',type:'talk',n:1,short:'Qua Truyền Tống Trận phía đông nam U Minh, gặp Tiên Ông',
    desc:'Thiên giới có biến, một vị tiên nhân sa vào ma đạo. Truyền Tống Trận ở cuối đường phía đông Phong Đô Quỷ Thành, cần cấp 50.',reward:{exp:90000,gold:4000,hp:10,mp:10}},
  {map:'langtieu',title:'Vân Linh Loạn Động',giver:'immortal',type:'kill',target:'cloudspirit',n:18,short:'Hạ Vân Linh ở Vân Hải Nhai',
    desc:'Vân Linh bị ma khí nhiễm, bắn kim quang từ xa. Hạ 18 con.',reward:{exp:150000,gold:5000,hp:12}},
  {map:'langtieu',title:'Ngọc Linh Chi',giver:'fairy',type:'gather',n:6,short:'Hái Ngọc Linh Chi',
    desc:'Bách hoa trong tiên cảnh đang héo úa. Ta cần 6 cây Ngọc Linh Chi để cứu chúng.',reward:{exp:160000,gold:5200,mp:15}},
  {map:'langtieu',title:'Thiên Hồ Lạc Lối',giver:'immortal',type:'kill',target:'skyfox',n:18,short:'Hạ Thiên Hồ ở Thiên Hồ Uyển',
    desc:'Thiên Hồ năm đuôi bị mê hoặc, tấn công tiên đồng. Hạ 18 con.',reward:{exp:190000,gold:6000,hp:12,item:{slot:'vest',tier:9,rar:2}}},
  {map:'langtieu',title:'Thiên Binh Phản Loạn',giver:'immortal',type:'kill',target:'guard',n:20,short:'Hạ Thiên Binh phản loạn',
    desc:'Một đạo Thiên Binh đã theo Đọa Tiên. Hạ 20 tên.',reward:{exp:230000,gold:7000,hp:12}},
  {map:'langtieu',title:'Thiên Lệnh',giver:'celestialsmith',type:'drop',target:'guard',n:6,item:'Thiên lệnh',chance:0.4,short:'Đoạt Thiên lệnh từ Thiên Binh',
    desc:'Thu hồi 6 tấm Thiên lệnh, ta sẽ rèn cho thiếu hiệp một thần binh tiên giới.',reward:{exp:220000,gold:6800,item:{slot:'weapon',tier:9,rar:2}}},
  {map:'langtieu',title:'Đọa Tiên Ma Quân',giver:'immortal',type:'kill',target:'fallen',n:1,short:'Hạ Đọa Tiên Ma Quân',
    desc:'Đọa Tiên Ma Quân chiếm Đọa Tiên Đài ở đỉnh tiên cảnh. Đây là trận chiến cuối cùng. Nên đạt cấp 58 trở lên!',reward:{exp:400000,gold:20000,hp:30,item:{slot:'armor',tier:9,rar:3}}}
);
for(const q of QUESTS)if(q.reward&&q.reward.item){const it=q.reward.item;if(it.slot==='jade')it.slot='amulet';}

// hệ ngũ hành của từng loại quái
Object.entries({wolf:'moc',boar:'tho',bandit:'kim',boss:'kim',snake:'thuy',fox:'hoa',pirate:'thuy',foxboss:'hoa',snowwolf:'thuy',icespirit:'thuy',cultist:'am',iceboss:'thuy',
  sandwolf:'tho',sandsnake:'tho',nomad:'kim',sandking:'tho',ghost:'am',darkfox:'am',ghoul:'moc',ghostking:'am',cloudspirit:'kim',skyfox:'hoa',guard:'kim',fallen:'hoa'}).forEach(([k,e])=>MT[k].el=e);
