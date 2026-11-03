'use strict';
// ===================== CÔNG TRÌNH ĐẶC TRƯNG TỪNG VÙNG (địa danh thật) =====================
// Mỗi bản đồ có vài công trình tiêu biểu đặt gần các khu (regions); vẽ chen vào danh sách trước–sau như cây lớn,
// nên nhân vật đi ra sau công trình sẽ bị che đúng. Có biển tên nhỏ bằng chữ vàng.
let LANDMARKS=[];
// [loại, khu (chỉ số regions), tên hiển thị, tỉ lệ]
const LM_DEF={
  trukhe:[['tamthap',2,'Tam Tháp Tự',1],['citygate',3,'Long Thủ Quan',1],['paifang',0,'Thương Sơn Môn',0.9]],
  vanmong:[['boat',4,'Thuyền đánh cá',1],['boat',0,'Thuyền đánh cá',0.9],['temple',4,'Tiểu Phổ Đà',0.9],['pavilion',1,'Kim Toa Đình',0.85]],
  thienson:[['snowpeak',1,'Ngọc Long Tuyết Phong',1.3],['flags',4,'Phong Mã Kỳ',1],['pavilion',0,'Vân Sam Đình',0.85]],
  lacnhat:[['fortress',3,'Ngọc Môn Quan',1.1],['pavilion',4,'Nguyệt Nha Lâu',1],['camel',0,'Lạc đà',1]],
  uminh:[['ghostgate',0,'Quỷ Môn Quan',1.1],['bridge',4,'Nại Hà Kiều',1],['temple',3,'Thiên Tử Điện',1]],
  langtieu:[['goldstatue',3,'Phổ Hiền Kim Tượng',1.1],['temple',2,'Thanh Âm Các',0.9],['paifang',0,'Nga Mi Sơn Môn',0.9]],
  hoadiem:[['ruins',2,'Giao Hà Cố Thành',1.1],['ruins',3,'Cao Xương Cố Thành',1],['grapes',1,'Bồ Đào Giá',1]],
  longcung:[['pavilion',4,'Bồng Lai Các',1.2],['boat',0,'Thuyền vượt biển',1.1],['lighthouse',1,'Lao Sơn Hải Đăng',1]],
  tinhha:[['heavengate',2,'Nam Thiên Môn',1.2],['stele',3,'Ngũ Nhạc Độc Tôn',1],['temple',1,'Bích Hà Từ',0.9]],
  thaico:[['yurt',2,'Lều mục dân',1],['yurt',0,'Lều mục dân',0.9],['obo',3,'Ngạc Bác',1]],
  huyethai:[['strata',0,'Thất Thải Sơn',1.2],['temple',3,'Mã Đề Tự',1],['strata',1,'Đan Hà',1]],
  loiam:[['goldhall',3,'Kim Điện',1.1],['paifang',2,'Huyền Nhạc Môn',1],['temple',1,'Tử Tiêu Cung',1]],
  thanmoc:[['waterfall',2,'Nặc Nhật Lãng Bộc Bố',1.1],['flags',4,'Kinh Phiên',1],['stupa',1,'Bạch Tháp',1]],
  honnguyen:[['jadepool',1,'Dao Trì',1.1],['snowpeak',0,'Ngọc Châu Phong',1.3],['paifang',2,'Côn Lôn Thiên Môn',1]]
};
const LM_FOOT={tamthap:3,citygate:3,paifang:2,boat:2,temple:3,pavilion:2,snowpeak:4,flags:2,fortress:4,camel:1,ghostgate:3,bridge:3,goldstatue:3,ruins:3,grapes:2,lighthouse:2,heavengate:3,stele:1,yurt:2,obo:1,strata:4,goldhall:3,waterfall:3,stupa:2,jadepool:3};
const _genMapLM=genMap;genMap=function(def){_genMapLM(def);LANDMARKS=[];const L=LM_DEF[curMapIdFor(def)];if(!L||def.pb)return;
  const S=def.gen.safe,BAD=[PA,BR,HO,MO,CH,FL,FE,RO];
  const ok=(x,y,f,water)=>{if(x<f+2||y<f+2||x>=MW-f-2||y>=MH-f-2)return false;if(S&&x>=S.x0-f-1&&x<=S.x1+f+1&&y>=S.y0-f-1&&y<=S.y1+f+1)return false;
    if(def.portals.some(p=>Math.hypot(p.x-x,p.y-y)<f+4)||def.npcs.some(n=>Math.hypot(n.x-x,n.y-y)<f+3))return false;
    if(LANDMARKS.some(l=>Math.hypot(l.x/T-x,l.y/T-y)<f+(LM_FOOT[l.k]||2)+3))return false;
    for(let dy=-f;dy<=0;dy++)for(let dx=-f;dx<=f;dx++){const t=getT(x+dx,y+dy);if(water?t!==WA:(t===WA||BAD.includes(t)))return false;}return true;};
  for(const [k,ri,name,sc] of L){const R=def.regions&&def.regions[ri];if(!R)continue;const f=Math.ceil((LM_FOOT[k]||2)*sc*1.35),water=k==='boat',cx=R.x,cy=R.y,r0=(R.r||6)*0.55;let spot=null;
    for(let rad=r0;rad<r0+16&&!spot;rad+=1)for(let a=0;a<16&&!spot;a++){const an=a/16*6.283+ri,x=Math.round(cx+Math.cos(an)*rad),y=Math.round(cy+Math.sin(an)*rad*0.8);if(ok(x,y,f,water))spot=[x,y];}
    if(!spot)continue;const [x,y]=spot;if(!water)for(let dy=-f;dy<=0;dy++)for(let dx=-f;dx<=f;dx++)if(getT(x+dx,y+dy)===TR)setT(x+dx,y+dy,G);
    if(typeof BIGTREES!=='undefined')for(let i=BIGTREES.length-1;i>=0;i--)if(Math.hypot(BIGTREES[i].x/T-x,BIGTREES[i].y/T-y)<f+4)BIGTREES.splice(i,1);
    LANDMARKS.push({k,name,s:sc,x:x*T+16,y:y*T+26,ph:(x*7+y*3)%6});}};
function curMapIdFor(def){for(const id in MAPS)if(MAPS[id]===def||MAPS[id].gen===def.gen)return id;return null;}
// ---------- tiện ích vẽ ----------
const OLm='rgba(40,24,14,.9)';
function lmFill(c,st){ctx.fillStyle=c;ctx.fill();if(st!==false){ctx.strokeStyle=OLm;ctx.lineWidth=1.3;ctx.stroke();}}
function lmRect(x,y,w,h,c,st){ctx.beginPath();ctx.rect(x,y,w,h);lmFill(c,st);}
function lmRoof(cx,y,w,h,col,eave){const e=eave==null?0.28:eave;ctx.beginPath();ctx.moveTo(cx-w/2-w*e*0.3,y+h);ctx.quadraticCurveTo(cx-w/2+w*0.08,y+h*0.85,cx-w*0.3,y+h*0.2);ctx.lineTo(cx+w*0.3,y+h*0.2);
  ctx.quadraticCurveTo(cx+w/2-w*0.08,y+h*0.85,cx+w/2+w*e*0.3,y+h);ctx.quadraticCurveTo(cx,y+h*0.82,cx-w/2-w*e*0.3,y+h);ctx.closePath();
  const g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,shade(col,0.25));g.addColorStop(1,shade(col,-0.25));lmFill(g);
  ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(cx+i*w*0.08,y+h*0.25);ctx.lineTo(cx+i*w*0.13,y+h*0.9);ctx.stroke();}
  ctx.beginPath();ctx.moveTo(cx-w*0.32,y+h*0.2);ctx.lineTo(cx+w*0.32,y+h*0.2);ctx.strokeStyle=shade(col,-0.4);ctx.lineWidth=3;ctx.stroke();}
function lmShadow(x,y,rx,ry){ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(x+rx*0.12,y,rx,ry,0,0,6.29);ctx.fill();}
function lmPillar(x,y,h,col){lmRect(x-2.5,y-h,5,h,col||'#a8322a');}
// ---------- từng loại công trình (gốc tọa độ = chân, giữa) ----------
const LM_DRAW={
  tamthap(){lmShadow(0,0,70,16);const tower=(x,h,w)=>{const lv=Math.round(h/14);for(let i=0;i<lv;i++){const yy=-i*14,ww=w*(1-i/lv*0.55);lmRect(x-ww/2,yy-10,ww,10,i===0?'#e8e0cc':'#f2ece0');ctx.beginPath();ctx.moveTo(x-ww/2-4,yy-10);ctx.lineTo(x+ww/2+4,yy-10);ctx.lineTo(x+ww/2,yy-14);ctx.lineTo(x-ww/2,yy-14);ctx.closePath();lmFill('#d8d0bc');}
      ctx.beginPath();ctx.moveTo(x,-lv*14-14);ctx.lineTo(x-3,-lv*14);ctx.lineTo(x+3,-lv*14);ctx.closePath();lmFill('#8a7040');ctx.fillStyle='#3a2a20';ctx.fillRect(x-2,-8,4,8);};
    tower(-46,98,18);tower(46,98,18);tower(0,196,28);},
  citygate(){lmShadow(0,0,78,16);lmRect(-70,-46,140,46,'#b8a888');ctx.strokeStyle='rgba(60,40,20,.3)';ctx.lineWidth=1;for(let y=-40;y<0;y+=8){ctx.beginPath();ctx.moveTo(-70,y);ctx.lineTo(70,y);ctx.stroke();}
    for(let i=-70;i<70;i+=12)lmRect(i,-54,7,8,'#a89878');ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(-16,-24);ctx.quadraticCurveTo(0,-40,16,-24);ctx.lineTo(16,0);ctx.closePath();lmFill('#2a1a12');
    lmRect(-34,-80,68,26,'#a8322a');for(const px of [-28,-10,10,28])lmPillar(px,-54,26,'#7a2018');lmRoof(0,-104,92,26,'#3a3e48');lmRoof(0,-124,64,20,'#3a3e48');
    ctx.fillStyle='#f0c850';ctx.fillRect(-12,-76,24,10);ctx.fillStyle='#3a1a10';ctx.font='bold 7px serif';ctx.textAlign='center';ctx.fillText('大理',0,-68);},
  paifang(){lmShadow(0,0,54,10);for(const px of [-40,-14,14,40])lmPillar(px,0,px*px>400?52:66,'#9a2a22');lmRect(-48,-60,96,8,'#c8a040');lmRect(-22,-74,44,10,'#2a5a8a');lmRoof(0,-92,62,20,'#2a6a5a');lmRoof(-30,-70,40,14,'#2a6a5a');lmRoof(30,-70,40,14,'#2a6a5a');
    ctx.fillStyle='#f0d070';ctx.fillRect(-14,-72,28,6);},
  boat(t){const b=Math.sin(t*1.6)*2;ctx.translate(0,b);ctx.beginPath();ctx.moveTo(-40,-10);ctx.quadraticCurveTo(0,8,44,-14);ctx.lineTo(36,-4);ctx.quadraticCurveTo(0,10,-34,-2);ctx.closePath();lmFill('#7a5232');
    ctx.beginPath();ctx.moveTo(-20,-12);ctx.quadraticCurveTo(0,-30,20,-12);ctx.closePath();lmFill('#c8b088');ctx.strokeStyle=OLm;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(30,-12);ctx.lineTo(48,10);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,2,48,6,0,0.2,2.9);ctx.stroke();},
  temple(){lmShadow(0,0,62,14);lmRect(-54,-8,108,8,'#9a9080');lmRect(-44,-44,88,36,'#e8d8b8');for(const px of [-38,-14,14,38])lmPillar(px,-8,36);lmRect(-10,-34,20,26,'#5a2a18');
    lmRoof(0,-70,118,30,'#7a3a24');lmRoof(0,-92,70,22,'#7a3a24');ctx.fillStyle='#f0c850';ctx.beginPath();ctx.arc(0,-96,3,0,6.29);ctx.fill();},
  pavilion(){lmShadow(0,0,46,11);lmRect(-40,-6,80,6,'#a89a88');for(const px of [-30,-10,10,30])lmPillar(px,-6,40);ctx.strokeStyle='#7a2018';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-32,-22);ctx.lineTo(32,-22);ctx.stroke();
    lmRoof(0,-72,92,28,'#2a6a5a',0.45);lmRoof(0,-92,52,20,'#2a6a5a',0.45);ctx.beginPath();ctx.moveTo(0,-110);ctx.lineTo(-3,-92);ctx.lineTo(3,-92);ctx.closePath();lmFill('#e8c040');},
  snowpeak(){lmShadow(0,0,110,20);const pk=(x,h,w)=>{ctx.beginPath();ctx.moveTo(x-w,0);ctx.lineTo(x-w*0.15,-h);ctx.lineTo(x+w*0.1,-h*0.88);ctx.lineTo(x+w,0);ctx.closePath();const g=ctx.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,'#9aa8b8');g.addColorStop(0.5,'#6a7888');g.addColorStop(1,'#4a5664');lmFill(g);
      ctx.beginPath();ctx.moveTo(x-w*0.15,-h);ctx.lineTo(x-w*0.45,-h*0.55);ctx.lineTo(x-w*0.25,-h*0.62);ctx.lineTo(x-w*0.1,-h*0.5);ctx.lineTo(x+w*0.05,-h*0.66);ctx.lineTo(x+w*0.32,-h*0.5);ctx.lineTo(x+w*0.1,-h*0.88);ctx.closePath();lmFill('#f6f8fc');};
    pk(-60,130,80);pk(50,110,70);pk(0,190,95);},
  flags(t){lmShadow(0,0,40,8);ctx.strokeStyle='#5a3a20';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-40,0);ctx.lineTo(-40,-70);ctx.moveTo(40,0);ctx.lineTo(40,-60);ctx.stroke();
    const C=['#2a6ae0','#f4f4f0','#d8302a','#3aa04a','#f0c830'];for(let i=0;i<10;i++){const u=(i+0.5)/10,x=-40+u*80,y=-70+u*10+Math.sin(u*Math.PI)*14,w=Math.sin(t*4+i)*2;ctx.beginPath();ctx.moveTo(x-3,y);ctx.lineTo(x+3,y);ctx.lineTo(x+2+w,y+11);ctx.lineTo(x-4+w,y+11);ctx.closePath();lmFill(C[i%5],false);}
    ctx.strokeStyle='rgba(60,40,20,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-40,-70);ctx.quadraticCurveTo(0,-46,40,-60);ctx.stroke();},
  fortress(){lmShadow(0,0,96,18);ctx.beginPath();ctx.moveTo(-90,0);ctx.lineTo(-84,-64);ctx.lineTo(84,-64);ctx.lineTo(90,0);ctx.closePath();lmFill('#c8a26a');
    ctx.strokeStyle='rgba(90,60,30,.35)';ctx.lineWidth=1;for(let y=-56;y<0;y+=9){ctx.beginPath();ctx.moveTo(-88,y);ctx.lineTo(88,y);ctx.stroke();}
    for(let i=-84;i<84;i+=14)lmRect(i,-72,8,8,'#b8925a');ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(-14,-26);ctx.quadraticCurveTo(0,-40,14,-26);ctx.lineTo(14,0);ctx.closePath();lmFill('#3a2414');
    ctx.fillStyle='rgba(120,80,40,.25)';ctx.beginPath();ctx.moveTo(40,-64);ctx.lineTo(70,-64);ctx.lineTo(62,-40);ctx.closePath();ctx.fill();},
  camel(t){const s=Math.sin(t*1.2)*1.5;lmShadow(0,0,26,6);ctx.translate(0,s*0.3);ctx.strokeStyle='#8a6038';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();for(const x of [-14,-8,10,16]){ctx.moveTo(x,-22);ctx.lineTo(x,0);}ctx.stroke();
    ctx.beginPath();ctx.ellipse(0,-28,22,10,0,0,6.29);lmFill('#c8945a');ctx.beginPath();ctx.ellipse(-6,-38,8,7,0,0,6.29);ctx.ellipse(8,-37,7,6,0,0,6.29);lmFill('#c8945a');
    ctx.beginPath();ctx.moveTo(18,-30);ctx.quadraticCurveTo(30,-36,28,-52+s);ctx.lineTo(36,-52+s);ctx.lineTo(34,-46+s);ctx.quadraticCurveTo(30,-30,22,-24);ctx.closePath();lmFill('#c8945a');},
  ghostgate(t){lmShadow(0,0,70,14);for(const px of [-52,52]){lmRect(px-9,-96,18,96,'#3a3040');}lmRect(-66,-110,132,14,'#4a2030');ctx.beginPath();ctx.moveTo(-74,-110);ctx.lineTo(-62,-124);ctx.lineTo(62,-124);ctx.lineTo(74,-110);ctx.closePath();lmFill('#2a2430');
    lmRect(-26,-108,52,12,'#1a1418');ctx.fillStyle='#d83a3a';ctx.font='bold 9px serif';ctx.textAlign='center';ctx.fillText('鬼門關',0,-99);
    for(const px of [-52,52]){const a=0.6+0.4*Math.sin(t*3+px);ctx.fillStyle=`rgba(120,255,160,${a})`;ctx.beginPath();ctx.ellipse(px,-84,6,8,0,0,6.29);ctx.fill();ctx.fillStyle='#8a2020';ctx.fillRect(px-6,-92,12,3);}
    ctx.fillStyle='rgba(120,255,170,.12)';ctx.beginPath();ctx.ellipse(0,-30,40,30,0,0,6.29);ctx.fill();},
  bridge(){lmShadow(0,0,80,12);ctx.beginPath();ctx.moveTo(-80,0);ctx.quadraticCurveTo(0,-56,80,0);ctx.lineTo(70,0);ctx.quadraticCurveTo(0,-42,-70,0);ctx.closePath();lmFill('#a8322a');
    ctx.strokeStyle='#5a1a14';ctx.lineWidth=2;for(let i=-6;i<=6;i++){const x=i*11,y=-(1-(x/80)**2)*28;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-16);ctx.stroke();}
    ctx.beginPath();for(let i=-80;i<=80;i+=4){const y=-(1-(i/80)**2)*28-16;i===-80?ctx.moveTo(i,y):ctx.lineTo(i,y);}ctx.stroke();},
  goldstatue(t){lmShadow(0,0,60,14);lmRect(-50,-14,100,14,'#c8b898');lmRect(-38,-30,76,16,'#d8c8a8');
    const g=ctx.createLinearGradient(-30,0,30,0);g.addColorStop(0,'#a87818');g.addColorStop(0.45,'#ffe080');g.addColorStop(1,'#a87818');
    ctx.beginPath();ctx.ellipse(0,-50,30,20,0,0,6.29);lmFill(g);ctx.beginPath();ctx.moveTo(-18,-60);ctx.lineTo(-14,-130);ctx.lineTo(14,-130);ctx.lineTo(18,-60);ctx.closePath();lmFill(g);
    ctx.beginPath();ctx.arc(0,-142,13,0,6.29);lmFill(g);ctx.beginPath();ctx.moveTo(-12,-150);ctx.lineTo(0,-170);ctx.lineTo(12,-150);ctx.closePath();lmFill(g);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,220,120,${0.15+0.08*Math.sin(t*2)})`;ctx.beginPath();ctx.arc(0,-142,30,0,6.29);ctx.fill();ctx.restore();},
  ruins(){lmShadow(0,0,90,16);const wall=(x,w,h)=>{ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+2,-h);ctx.lineTo(x+w*0.4,-h+6);ctx.lineTo(x+w*0.6,-h-4);ctx.lineTo(x+w-2,-h+3);ctx.lineTo(x+w,0);ctx.closePath();lmFill('#c08a58');
      ctx.strokeStyle='rgba(90,50,20,.35)';ctx.lineWidth=1;for(let y=-h+10;y<0;y+=8){ctx.beginPath();ctx.moveTo(x+2,y);ctx.lineTo(x+w-2,y);ctx.stroke();}};
    wall(-88,46,54);wall(-30,30,80);lmRect(-20,-40,10,14,'#4a2a14');wall(12,52,44);wall(70,20,62);},
  grapes(){lmShadow(0,0,56,10);for(const px of [-48,-16,16,48])lmPillar(px,0,48,'#6a4a2a');ctx.beginPath();ctx.ellipse(0,-52,62,14,0,0,6.29);lmFill('#4a8a3a');
    for(let i=0;i<12;i++){const x=-50+i*9,y=-42+(i%3)*2;ctx.fillStyle='#6a2a7a';for(let k=0;k<5;k++){ctx.beginPath();ctx.arc(x+(k%2)*3,y+k*2,2.2,0,6.29);ctx.fill();}}},
  lighthouse(t){lmShadow(0,0,30,8);ctx.beginPath();ctx.moveTo(-16,0);ctx.lineTo(-10,-110);ctx.lineTo(10,-110);ctx.lineTo(16,0);ctx.closePath();lmFill('#f0ece0');for(const y of [-30,-70])lmRect(-13,y,26,10,'#a8322a');
    lmRect(-12,-128,24,18,'#3a3e48');ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,230,140,${0.5+0.4*Math.sin(t*3)})`;ctx.beginPath();ctx.arc(0,-120,10,0,6.29);ctx.fill();ctx.restore();lmRoof(0,-146,34,18,'#3a3e48');},
  heavengate(){lmShadow(0,0,70,14);for(let i=0;i<8;i++)lmRect(-36+i*2,-i*6,72-i*4,6,'#b8b0a0');lmRect(-56,-120,112,72,'#c8302a');ctx.beginPath();ctx.moveTo(-18,-48);ctx.lineTo(-18,-82);ctx.quadraticCurveTo(0,-100,18,-82);ctx.lineTo(18,-48);ctx.closePath();lmFill('#2a1a14');
    lmRoof(0,-150,140,32,'#c8902a');lmRect(-22,-116,44,12,'#1a2a5a');ctx.fillStyle='#f0d070';ctx.font='bold 9px serif';ctx.textAlign='center';ctx.fillText('南天門',0,-107);},
  stele(){lmShadow(0,0,26,7);lmRect(-20,-10,40,10,'#8a8278');lmRect(-14,-74,28,64,'#a8a094');ctx.beginPath();ctx.moveTo(-16,-74);ctx.quadraticCurveTo(0,-90,16,-74);ctx.closePath();lmFill('#a8a094');
    ctx.fillStyle='#c8302a';ctx.font='bold 9px serif';ctx.textAlign='center';['五','嶽','獨','尊'].forEach((ch,i)=>ctx.fillText(ch,0,-60+i*12));},
  yurt(t){lmShadow(0,0,40,10);ctx.beginPath();ctx.moveTo(-36,0);ctx.lineTo(-36,-28);ctx.quadraticCurveTo(0,-62,36,-28);ctx.lineTo(36,0);ctx.closePath();lmFill('#f2ead8');
    ctx.strokeStyle='#c8302a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-36,-24);ctx.quadraticCurveTo(0,-30,36,-24);ctx.stroke();ctx.strokeStyle='#2a5ab0';ctx.beginPath();ctx.moveTo(-34,-10);ctx.lineTo(34,-10);ctx.stroke();
    lmRect(-8,-22,16,22,'#a8322a');ctx.fillStyle='rgba(200,200,200,.4)';for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(4+Math.sin(t+i)*3,-56-i*10-((t*8)%10),4+i,0,6.29);ctx.fill();}},
  obo(t){lmShadow(0,0,32,8);for(let r=0;r<4;r++)for(let i=0;i<5-r;i++){ctx.beginPath();ctx.ellipse(-24+r*6+i*12,-6-r*10,7,6,0,0,6.29);lmFill(r%2?'#9a9488':'#b0a898');}
    ctx.strokeStyle='#6a4a2a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,-40);ctx.lineTo(0,-76);ctx.stroke();const C=['#2a6ae0','#f4f4f0','#d8302a','#3aa04a','#f0c830'];
    for(let i=0;i<5;i++){const a=-2.6+i*0.55;ctx.strokeStyle=C[i];ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-74);ctx.quadraticCurveTo(Math.cos(a)*24,-74+Math.sin(a)*8+Math.sin(t*3+i)*3,Math.cos(a)*40,-40);ctx.stroke();}},
  strata(){lmShadow(0,0,110,16);const C=['#d8503a','#f0a050','#e8d070','#c83a50','#f08060','#d8a0a0'];const hill=(x,w,h)=>{for(let i=0;i<6;i++){const k=1-i/6;ctx.beginPath();ctx.moveTo(x-w*k,0-(1-k)*0);ctx.quadraticCurveTo(x,-h*2*k-(i?0:0),x+w*k,0);ctx.closePath();ctx.fillStyle=C[i];ctx.fill();}
      ctx.beginPath();ctx.moveTo(x-w,0);ctx.quadraticCurveTo(x,-h*2,x+w,0);ctx.strokeStyle=OLm;ctx.lineWidth=1.3;ctx.stroke();};hill(-50,60,48);hill(40,70,64);},
  goldhall(t){lmShadow(0,0,64,14);for(let i=0;i<5;i++)lmRect(-52+i*3,-i*5,104-i*6,5,'#b8b0a0');const g=ctx.createLinearGradient(-40,0,40,0);g.addColorStop(0,'#a87818');g.addColorStop(0.5,'#ffe080');g.addColorStop(1,'#a87818');
    ctx.beginPath();ctx.rect(-40,-60,80,35);lmFill(g);for(const px of [-30,-10,10,30])lmPillar(px,-25,35,'#c89028');lmRoof(0,-86,104,28,'#e8b830');lmRoof(0,-106,64,20,'#e8b830');
    if(((t*0.7)%5)<0.25){ctx.strokeStyle='#c8b0ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-20,-220);ctx.lineTo(-8,-170);ctx.lineTo(-22,-160);ctx.lineTo(0,-108);ctx.stroke();}},
  waterfall(t){lmShadow(0,0,86,14);ctx.beginPath();ctx.moveTo(-84,0);ctx.lineTo(-70,-110);ctx.lineTo(70,-110);ctx.lineTo(84,0);ctx.closePath();lmFill('#6a7a68');
    const g=ctx.createLinearGradient(0,-110,0,0);g.addColorStop(0,'rgba(220,245,255,.95)');g.addColorStop(1,'rgba(120,210,220,.9)');ctx.fillStyle=g;ctx.fillRect(-56,-108,112,104);
    ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=1.5;for(let i=0;i<14;i++){const x=-52+i*8,o=(t*90+i*23)%100;ctx.beginPath();ctx.moveTo(x,-108+o*0.6);ctx.lineTo(x,-108+o);ctx.stroke();}
    ctx.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(-50+i*14,-4+Math.sin(t*5+i)*2,7,0,6.29);ctx.fill();}
    for(const x of [-70,70]){ctx.beginPath();ctx.arc(x,-112,16,0,6.29);lmFill('#3a8a4a');}},
  stupa(){lmShadow(0,0,40,10);lmRect(-34,-14,68,14,'#e8e4dc');lmRect(-26,-26,52,12,'#f2eee6');ctx.beginPath();ctx.moveTo(-26,-26);ctx.quadraticCurveTo(-28,-64,0,-66);ctx.quadraticCurveTo(28,-64,26,-26);ctx.closePath();lmFill('#f8f6f0');
    lmRect(-8,-76,16,10,'#e8e4dc');for(let i=0;i<6;i++)lmRect(-6+i*0.6,-84-i*7,12-i*1.2,6,'#e8c050');ctx.beginPath();ctx.arc(0,-130,4,0,6.29);lmFill('#e8c050');},
  jadepool(t){lmShadow(0,0,96,22);ctx.beginPath();ctx.ellipse(0,-8,92,26,0,0,6.29);lmFill('#d8d0c0');const g=ctx.createRadialGradient(0,-10,6,0,-8,82);g.addColorStop(0,'#9af0e0');g.addColorStop(1,'#2aa898');
    ctx.beginPath();ctx.ellipse(0,-8,80,20,0,0,6.29);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1;for(let i=0;i<3;i++){const r=((t*14+i*26)%70)+6;ctx.beginPath();ctx.ellipse(0,-8,r,r*0.25,0,0,6.29);ctx.stroke();}
    for(const x of [-70,70]){lmRect(x-3,-60,6,50,'#f0ece0');ctx.beginPath();ctx.arc(x,-64,6,0,6.29);lmFill('#f0d070');}
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(160,255,230,.12)';ctx.beginPath();ctx.ellipse(0,-30,70,40,0,0,6.29);ctx.fill();ctx.restore();}
};
function lmDraw(l){ctx.save();ctx.translate(l.x,l.y);ctx.scale(l.s*1.35,l.s*1.35);ctx.lineJoin='round';try{LM_DRAW[l.k](nowT+l.ph);}catch(e){}ctx.restore();}
function lmLabel(l){const d=Math.hypot(player.x-l.x,player.y-l.y);if(d>360)return;const a=Math.min(1,(360-d)/120);ctx.save();ctx.globalAlpha=a;ctx.font='bold 13px "Palatino Linotype","Times New Roman",serif';ctx.textAlign='center';
  const w=ctx.measureText(l.name).width+18,y=l.y+18;ctx.fillStyle='rgba(40,20,10,.72)';ctx.beginPath();ctx.roundRect(l.x-w/2,y,w,19,9);ctx.fill();ctx.strokeStyle='rgba(232,192,96,.8)';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='#ffe6a0';ctx.fillText(l.name,l.x,y+14);ctx.restore();}
if(typeof drawOthers==='function'){const _drawOthersLM=drawOthers;drawOthers=function(list){_drawOthersLM(list);const c=cam,vw=VW/Z,vh=VH/Z;
  for(const l of LANDMARKS){if(l.x<c.x-260||l.x>c.x+vw+260||l.y<c.y-80||l.y>c.y+vh+320)continue;list.push({y:l.y,f:()=>lmDraw(l)});list.push({y:l.y+1e6,f:()=>lmLabel(l)});}};}
// vẽ lên bản đồ nhỏ / bản đồ khu vực: chấm vàng có tên
