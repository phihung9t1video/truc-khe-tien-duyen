'use strict';
// ===================== ĐỊA DANH THẬT =====================
// Mỗi bản đồ ứng với một vùng có thật của Trung Quốc; vị trí trên Bản đồ thế giới đặt theo kinh độ / vĩ độ thật
// (nhích nhẹ vài nơi quá gần nhau). Hướng đi giữa các vùng ghi trong mô tả theo đúng địa lý.
const DIADANH={
  trukhe:{name:'Đại Lý',lab:'b',safe:'Trúc Khê Thôn',geo:[100.5,24.4],desc:'Cố đô Nam Chiếu dưới chân Thương Sơn. Đi về phía đông là Nhĩ Hải.',
    reg:['Thương Sơn Lâm','Hồ Điệp Tuyền','Hỷ Châu Điền Dã','Long Thủ Quan Hạp','Hắc Phong Trại']},
  vanmong:{name:'Nhĩ Hải',lab:'r',safe:'Song Lang Ngư Thôn',geo:[103.2,26.0],desc:'Hồ lớn phía đông Đại Lý, hình như vành tai. Đi lên phía bắc tới Ngọc Long Tuyết Sơn.',
    reg:['Hải Thiệt Đầm','Kim Toa Lâm','Thủy Trại','Yêu Hồ Động','Tiểu Phổ Đà']},
  thienson:{name:'Ngọc Long Tuyết Sơn',lab:'l',safe:'Lệ Giang Cổ Thành',geo:[99.0,28.6],desc:'Núi tuyết phía bắc Lệ Giang. Vượt cao nguyên về phía bắc là Đôn Hoàng.',
    reg:['Vân Sam Bình','Mao Ngưu Bình','Ma Giáo Doanh','Băng Phách Điện','Lam Nguyệt Cốc']},
  lacnhat:{name:'Đôn Hoàng Minh Sa',lab:'b',safe:'Đôn Hoàng Thành',geo:[94.7,40.1],desc:'Cồn cát biết hát nơi đầu Con đường tơ lụa. Đi về đông nam xuống Phong Đô.',
    reg:['Minh Sa Khâu','Nhã Đan Cốc','Mã Tặc Doanh','Ngọc Môn Quan','Nguyệt Nha Tuyền']},
  uminh:{name:'Phong Đô Quỷ Thành',lab:'b',safe:'Phong Đô Trấn',geo:[108.2,29.9],desc:'Thành quỷ bên bờ Trường Giang. Đi về phía tây tới Nga Mi Sơn.',
    reg:['Quỷ Môn Quan','Danh Sơn Lâm','Vọng Hương Đài','Thiên Tử Điện','Nại Hà Kiều']},
  langtieu:{name:'Nga Mi Kim Đỉnh',lab:'t',safe:'Báo Quốc Tự',geo:[103.3,29.5],desc:'Đỉnh vàng giữa biển mây đất Thục. Đi xa về tây bắc tới Hỏa Diệm Sơn.',
    reg:['Xả Thân Nhai','Cửu Lão Động','Thanh Âm Các','Kim Đỉnh','Vân Hải']},
  hoadiem:{name:'Hỏa Diệm Sơn',lab:'t',safe:'Thổ Lỗ Phồn Thành',geo:[89.2,42.9],desc:'Núi đỏ rực ở bồn địa Thổ Lỗ Phồn. Đi suốt về phía đông ra biển Bồng Lai.',
    reg:['Thiên Phật Động','Bồ Đào Câu','Giao Hà Cố Thành','Cao Xương Cố Thành','Ngải Đinh Hồ']},
  longcung:{name:'Bồng Lai Đông Hải',lab:'t',safe:'Bồng Lai Các',geo:[121.0,37.8],desc:'Mũi đất nơi Bát Tiên vượt biển. Đi vào đất liền về phía tây nam tới Thái Sơn.',
    reg:['Trường Đảo','Lao Sơn','Hải Yêu Trại','Long Vương Điện','Bát Tiên Độ']},
  tinhha:{name:'Thái Sơn',lab:'l',safe:'Đại Miếu',geo:[116.6,36.2],desc:'Đứng đầu Ngũ Nhạc. Đi xa về phía bắc tới thảo nguyên Hô Luân.',
    reg:['Thập Bát Bàn','Bích Hà Từ','Nam Thiên Môn','Ngọc Hoàng Đỉnh','Nhật Quan Phong']},
  thaico:{name:'Hô Luân Thảo Nguyên',lab:'b',safe:'Mục Dân Bộ Lạc',geo:[119.7,49.2],desc:'Đồng cỏ mênh mông cực bắc. Đi về tây nam tới Trương Dịch.',
    reg:['Hô Luân Hồ','Ngạch Nhĩ Cổ Nạp','Hoang Tộc Doanh','Lang Thần Tế Đàn','Bối Nhĩ Hồ']},
  huyethai:{name:'Trương Dịch Đan Hà',lab:'r',safe:'Trương Dịch Thành',geo:[100.4,38.9],desc:'Núi bảy sắc đỏ như máu ở Hà Tây. Đi về đông nam tới Võ Đang.',
    reg:['Thất Thải Sơn','Hắc Hà','Ma Tướng Doanh','Mã Đề Tự','Huyết Trì']},
  loiam:{name:'Võ Đang Sơn',lab:'r',safe:'Ngọc Hư Cung',geo:[111.0,32.4],desc:'Kim Điện trên đỉnh thường bị sét đánh mà không hề hấn. Đi về phía tây tới Cửu Trại Câu.',
    reg:['Nam Nham','Thiên Trụ Phong','Tử Tiêu Cung','Kim Điện','Lôi Trì']},
  thanmoc:{name:'Cửu Trại Câu',lab:'l',safe:'Tạng Trại',geo:[103.9,33.2],desc:'Thung lũng hồ ngọc giữa rừng già. Đi xa về phía tây tới Côn Lôn.',
    reg:['Ngũ Hoa Hải','Trường Hải','Nặc Nhật Lãng','Kính Hải','Trân Châu Than']},
  honnguyen:{name:'Côn Lôn Sơn',lab:'b',safe:'Côn Lôn Sơn Khẩu',geo:[90.0,35.9],desc:'Tổ của vạn núi, nơi tiên nhân cư ngụ. Điểm cuối hành trình.',
    reg:['Ngọc Châu Phong','Dao Trì','Thần Tướng Doanh','Thiên Đế Đài','Nhược Thủy']}
};
// phép chiếu giãn vùng trung tâm / tây nam (nhiều địa danh) mà vẫn giữ đúng thứ tự hướng
const pw=(K,V,v)=>{if(v<=K[0])return V[0];for(let i=1;i<K.length;i++)if(v<=K[i])return V[i-1]+(v-K[i-1])/(K[i]-K[i-1])*(V[i]-V[i-1]);return V[V.length-1];};
const GEO_X=lon=>pw([73,88,96,104,112,124,135],[0.04,0.17,0.30,0.52,0.70,0.86,0.97],lon),GEO_Y=lat=>1-pw([18,21,26,30,34,40,46,54],[0.02,0.08,0.25,0.40,0.55,0.73,0.86,0.96],lat);
for(const id in DIADANH){const M=MAPS[id],D=DIADANH[id];if(!M)continue;M.name=D.name;M.lab=D.lab;M.safeName=D.safe;M.desc=D.desc;M.wx=GEO_X(D.geo[0]);M.wy=GEO_Y(D.geo[1]);
  if(Array.isArray(M.regions))M.regions.forEach((r,i)=>{if(D.reg[i]){if(typeof r==='string')M.regions[i]=D.reg[i];else r.n=D.reg[i];}});}
// đường viền lãnh thổ (giản lược) vẽ mờ trên Bản đồ thế giới
const CN_OUTLINE=[[73.5,39.5],[75,37],[78,35.5],[79,32.5],[81,30],[85,28.2],[89,27.8],[92,27.8],[97,28.2],[98.5,25],[97.6,24],[99.5,22.1],[101.7,21.2],[105.5,23],[106.7,22],[108,21.5],[110.5,21.2],[113.5,22.2],[117,23.5],[119.5,25.5],[121.5,28.5],[122,30.8],[120.5,33],[119.2,35],[122.5,37],[120.5,37.8],[118,38.5],[119.5,39.8],[121.5,39],[124.3,40],[128,41.8],[130.5,42.6],[131,44.8],[133.5,45],[134.7,48.3],[132,47.8],[127.5,49.8],[125.5,53],[121,53.3],[119.5,50.5],[117,49.6],[116,48],[118.5,47],[115.5,45.5],[111.5,43.7],[107,42.4],[104,41.8],[100,42.5],[96.5,42.8],[95.5,44.5],[90.8,45.5],[87.8,49.1],[85.5,47],[82.5,45.4],[80.2,42.1],[76.5,40.5]];
const CN_RIVERS=[[[91,33.5],[95,33],[97,31],[99,28],[100.5,26.5],[102.5,26],[104.5,28.8],[106.5,29.5],[108.5,30.5],[111,30.6],[113,29.8],[115,29.7],[117.5,30.8],[119,32],[121.5,31.5]], // Trường Giang
  [[96,35],[99,35.5],[102,36],[104,37],[106,39.5],[107.5,40.8],[110,40.6],[111,39],[110.5,35.5],[113,34.8],[116,35.5],[118.5,37.5]]]; // Hoàng Hà
function drawChinaOutline(c,W,H){const P=([lo,la])=>[GEO_X(lo)*W,GEO_Y(la)*H];c.save();
  c.beginPath();CN_OUTLINE.forEach((p,i)=>{const [x,y]=P(p);i?c.lineTo(x,y):c.moveTo(x,y);});c.closePath();
  const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'rgba(196,170,120,.20)');g.addColorStop(1,'rgba(120,160,110,.20)');c.fillStyle=g;c.fill();
  c.strokeStyle='rgba(230,205,150,.45)';c.lineWidth=2;c.stroke();
  c.strokeStyle='rgba(110,180,240,.45)';c.lineWidth=3;c.lineJoin='round';
  for(const R of CN_RIVERS){c.beginPath();R.forEach((p,i)=>{const [x,y]=P(p);i?c.lineTo(x,y):c.moveTo(x,y);});c.stroke();}
  c.font='italic 13px "Palatino Linotype",serif';c.fillStyle='rgba(150,200,240,.6)';c.textAlign='center';
  c.fillText('Trường Giang',P([112,31.6])[0],P([112,31.6])[1]);c.fillText('Hoàng Hà',P([108.5,41.6])[0],P([108.5,41.6])[1]);
  c.fillText('Đông Hải',P([125.5,30])[0],P([125.5,30])[1]);c.restore();}
