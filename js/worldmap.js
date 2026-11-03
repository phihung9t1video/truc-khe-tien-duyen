'use strict';
// ===================== BẢN ĐỒ THẾ GIỚI: DƯ ĐỒ CỔ =====================
// Nền tĩnh (giấy, biển, bờ, sông, núi, sa mạc, rừng, hình minh họa từng vùng) vẽ một lần vào canvas đệm;
// mỗi khung chỉ vẽ thêm nhãn, đường đi, cờ "đang ở đây", số người online.
const WM={bg:null};
function wmRand(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};}
const WP=(lo,la)=>[GEO_X(lo)*BMW,GEO_Y(la)*BMH];
function wmInk(c,a){c.strokeStyle='rgba(58,40,24,'+(a==null?0.85:a)+')';}
function wmMountain(c,x,y,s,snow){c.save();c.translate(x,y);c.scale(s,s);
  c.fillStyle='rgba(120,98,70,.55)';c.beginPath();c.moveTo(-12,0);c.lineTo(-2,-16);c.lineTo(3,-10);c.lineTo(6,-13);c.lineTo(14,0);c.closePath();c.fill();
  c.fillStyle='rgba(235,225,200,.9)';c.beginPath();c.moveTo(-2,-16);c.lineTo(3,-10);c.lineTo(-1,-8);c.lineTo(-5,-11);c.closePath();c.fill();
  if(snow){c.fillStyle='#fbfbf6';c.beginPath();c.moveTo(-2,-16);c.lineTo(1.5,-12);c.lineTo(-1,-10.5);c.lineTo(-4.5,-12.5);c.closePath();c.fill();}
  wmInk(c);c.lineWidth=1.3;c.lineJoin='round';c.beginPath();c.moveTo(-12,0);c.lineTo(-2,-16);c.lineTo(3,-10);c.lineTo(6,-13);c.lineTo(14,0);c.stroke();
  c.lineWidth=0.7;c.beginPath();c.moveTo(-2,-16);c.lineTo(-4,-6);c.moveTo(6,-13);c.lineTo(5,-5);c.stroke();c.restore();}
function wmTree(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='rgba(88,120,70,.75)';c.beginPath();c.arc(0,-6,4.2,0,6.29);c.arc(-3,-3.5,3.2,0,6.29);c.arc(3,-3.5,3.2,0,6.29);c.fill();
  wmInk(c,0.6);c.lineWidth=0.8;c.beginPath();c.moveTo(0,0);c.lineTo(0,-3);c.stroke();c.restore();}
function wmDune(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='rgba(205,160,90,.35)';c.beginPath();c.moveTo(-9,0);c.quadraticCurveTo(-2,-6,8,0);c.closePath();c.fill();
  wmInk(c,0.45);c.lineWidth=1;c.beginPath();c.moveTo(-9,0);c.quadraticCurveTo(-2,-6,8,0);c.stroke();c.restore();}
function wmWave(c,x,y,s){wmInk(c,0.28);c.lineWidth=1;c.beginPath();c.arc(x,y,s,Math.PI*1.1,Math.PI*1.9);c.stroke();c.beginPath();c.arc(x+s*1.6,y,s,Math.PI*1.1,Math.PI*1.9);c.stroke();}
// hình minh họa từng vùng (~46px)
const WM_ICON={
  spring(c){c.fillStyle='#b9a27a';c.fillRect(-18,-6,36,10);wmInk(c);c.lineWidth=1.2;c.strokeRect(-18,-6,36,10);
    for(let i=-18;i<18;i+=6)c.strokeRect(i,-9,3,3);c.fillStyle='#7a2a20';c.fillRect(-7,-17,14,11);c.strokeRect(-7,-17,14,11);
    c.fillStyle='#3a3a42';c.beginPath();c.moveTo(-12,-16);c.quadraticCurveTo(0,-22,12,-16);c.lineTo(9,-19);c.quadraticCurveTo(0,-26,-9,-19);c.closePath();c.fill();c.stroke();
    c.fillStyle='#2a1a10';c.beginPath();c.arc(0,4,3.2,Math.PI,0);c.fill();
    for(const dx of [-26,26]){c.fillStyle='#d8cfb8';c.fillRect(dx-2,-14,4,18);wmInk(c);c.strokeRect(dx-2,-14,4,18);c.beginPath();c.moveTo(dx-3,-14);c.lineTo(dx,-19);c.lineTo(dx+3,-14);c.stroke();}},
  marsh(c){c.fillStyle='rgba(110,170,200,.85)';c.beginPath();c.ellipse(0,-2,10,17,0.25,0,6.29);c.fill();wmInk(c);c.lineWidth=1.2;c.stroke();
    c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=1;c.beginPath();c.moveTo(-3,-8);c.lineTo(3,-9);c.moveTo(-4,2);c.lineTo(2,1);c.stroke();
    c.fillStyle='#5a4030';c.beginPath();c.moveTo(4,6);c.lineTo(12,6);c.lineTo(10,9);c.lineTo(6,9);c.closePath();c.fill();wmInk(c);c.beginPath();c.moveTo(8,6);c.lineTo(8,-1);c.lineTo(12,4);c.stroke();},
  snow(c){wmMountain(c,-6,8,1.35,true);wmMountain(c,8,9,1.0,true);},
  desert(c){c.fillStyle='rgba(222,176,96,.95)';c.beginPath();c.moveTo(-20,8);c.quadraticCurveTo(-8,-14,4,8);c.closePath();c.fill();c.beginPath();c.moveTo(-4,8);c.quadraticCurveTo(8,-6,20,8);c.closePath();c.fill();
    wmInk(c);c.lineWidth=1.2;c.beginPath();c.moveTo(-20,8);c.quadraticCurveTo(-8,-14,4,8);c.moveTo(-4,8);c.quadraticCurveTo(8,-6,20,8);c.stroke();
    c.fillStyle='rgba(120,190,200,.95)';c.beginPath();c.moveTo(-6,10);c.quadraticCurveTo(0,6,7,10);c.quadraticCurveTo(0,13,-6,10);c.fill();},
  dark(c){c.fillStyle='#3a2c3e';c.fillRect(-14,-14,5,22);c.fillRect(9,-14,5,22);c.fillStyle='#5a2030';c.fillRect(-18,-18,36,5);
    wmInk(c);c.lineWidth=1.2;c.strokeRect(-14,-14,5,22);c.strokeRect(9,-14,5,22);c.strokeRect(-18,-18,36,5);c.beginPath();c.moveTo(-20,-18);c.lineTo(-17,-22);c.lineTo(17,-22);c.lineTo(20,-18);c.stroke();
    c.fillStyle='rgba(120,230,150,.8)';c.beginPath();c.arc(0,-4,2.5,0,6.29);c.fill();c.beginPath();c.arc(-4,2,1.6,0,6.29);c.fill();},
  heaven(c){wmMountain(c,0,3,1.2,false);c.fillStyle='rgba(255,255,255,.95)';for(const [x,y,r] of [[-12,8,7],[-3,6,8],[8,8,7],[15,9,5]]){c.beginPath();c.arc(x,y,r,Math.PI,0);c.fill();}
    c.fillStyle='#e8b830';c.beginPath();c.moveTo(-4,-17);c.lineTo(0,-22);c.lineTo(4,-17);c.closePath();c.fill();wmInk(c);c.lineWidth=1;c.stroke();},
  volcano(c){c.fillStyle='#c0452a';c.beginPath();c.moveTo(-18,8);c.lineTo(-5,-12);c.lineTo(5,-12);c.lineTo(18,8);c.closePath();c.fill();wmInk(c);c.lineWidth=1.2;c.stroke();
    c.strokeStyle='#ffb040';c.lineWidth=1.6;c.beginPath();c.moveTo(-2,-12);c.lineTo(-4,-2);c.moveTo(3,-12);c.lineTo(6,0);c.stroke();
    c.fillStyle='rgba(90,80,80,.55)';c.beginPath();c.arc(0,-17,5,0,6.29);c.fill();c.beginPath();c.arc(6,-22,4,0,6.29);c.fill();},
  sea(c){c.fillStyle='#8a7050';c.beginPath();c.ellipse(-2,4,14,6,0,0,6.29);c.fill();wmInk(c);c.lineWidth=1.2;c.stroke();
    c.fillStyle='#7a2a20';c.fillRect(-4,-10,8,9);c.strokeRect(-4,-10,8,9);c.fillStyle='#3a3a42';c.beginPath();c.moveTo(-8,-9);c.quadraticCurveTo(0,-15,8,-9);c.closePath();c.fill();c.stroke();
    wmWave(c,8,10,3);wmWave(c,-16,11,3);},
  star(c){wmMountain(c,0,8,1.5,false);c.fillStyle='#c83a2a';c.fillRect(-3,-16,6,4);wmInk(c);c.lineWidth=1;c.strokeRect(-3,-16,6,4);
    c.fillStyle='#ffcc40';c.beginPath();c.arc(13,-13,4,0,6.29);c.fill();},
  wild(c){c.fillStyle='rgba(140,170,90,.6)';c.beginPath();c.ellipse(0,6,20,6,0,0,6.29);c.fill();
    c.fillStyle='#f2ead8';c.beginPath();c.moveTo(-9,4);c.lineTo(-9,-3);c.quadraticCurveTo(-3,-12,3,-3);c.lineTo(3,4);c.closePath();c.fill();wmInk(c);c.lineWidth=1.2;c.stroke();
    c.fillStyle='#7a2a20';c.fillRect(-4,-1,3,5);c.fillStyle='#f2ead8';c.beginPath();c.moveTo(6,4);c.lineTo(6,0);c.quadraticCurveTo(10,-6,14,0);c.lineTo(14,4);c.closePath();c.fill();c.stroke();},
  blood(c){for(const [col,x,y,h] of [['#d0503a',-12,8,10],['#e88a4a',0,8,14],['#c03050',12,8,9]]){c.fillStyle=col;c.beginPath();c.moveTo(x-10,y);c.quadraticCurveTo(x,y-h*2,x+10,y);c.closePath();c.fill();wmInk(c);c.lineWidth=1.1;c.stroke();}
    c.strokeStyle='rgba(255,230,180,.8)';c.lineWidth=1;c.beginPath();c.moveTo(-6,2);c.quadraticCurveTo(0,-4,6,2);c.stroke();},
  thunder(c){wmMountain(c,0,8,1.45,false);c.fillStyle='#e0b030';c.fillRect(-4,-18,8,4);wmInk(c);c.lineWidth=1;c.strokeRect(-4,-18,8,4);
    c.strokeStyle='#7a5ad8';c.lineWidth=1.8;c.beginPath();c.moveTo(14,-24);c.lineTo(9,-16);c.lineTo(13,-16);c.lineTo(7,-8);c.stroke();},
  jade(c){for(const [x,y,rx,col] of [[-8,2,8,'#3ac0b0'],[6,6,9,'#4a90e0'],[2,-6,6,'#6ad8a0']]){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,rx*0.55,0,0,6.29);c.fill();wmInk(c);c.lineWidth=1;c.stroke();}
    wmTree(c,-17,-2,1.1);wmTree(c,17,-1,1.1);},
  void(c){wmMountain(c,-8,8,1.2,true);wmMountain(c,6,8,1.55,true);c.fillStyle='rgba(255,215,90,.55)';c.beginPath();c.arc(0,-22,6,0,6.29);c.fill();}
};
function wmBuildBg(){const S=1.5,cv=document.createElement('canvas');cv.width=BMW*S;cv.height=BMH*S;const c=cv.getContext('2d');c.scale(S,S);const R=wmRand(7331);
  // giấy cũ
  const g=c.createRadialGradient(BMW*0.5,BMH*0.48,80,BMW*0.5,BMH*0.5,BMW*0.68);g.addColorStop(0,'#f1e4c3');g.addColorStop(0.7,'#e3cf9f');g.addColorStop(1,'#b99a62');c.fillStyle=g;c.fillRect(0,0,BMW,BMH);
  for(let i=0;i<900;i++){c.fillStyle='rgba('+(R()<0.5?'120,90,50':'255,250,235')+','+(0.03+R()*0.06)+')';c.fillRect(R()*BMW,R()*BMH,1+R()*2,1+R()*2);}
  for(let i=0;i<14;i++){const x=R()*BMW,y=R()*BMH,r=20+R()*60,sg=c.createRadialGradient(x,y,0,x,y,r);sg.addColorStop(0,'rgba(150,110,60,.08)');sg.addColorStop(1,'rgba(150,110,60,0)');c.fillStyle=sg;c.fillRect(x-r,y-r,r*2,r*2);}
  const land=new Path2D();CN_OUTLINE.forEach((p,i)=>{const [x,y]=WP(p[0],p[1]);i?land.lineTo(x,y):land.moveTo(x,y);});land.closePath();
  const onLand=(x,y)=>c.isPointInPath(land,x*S,y*S);
  // biển phía đông
  const sea=new Path2D(),SEA=[[108,21],[110,20.3],[113.5,22.2],[117,23.5],[119.5,25.5],[121.5,28.5],[122,30.8],[120.5,33],[119.2,35],[122.5,37],[120.5,37.8],[118,38.5],[119.5,39.8],[121.5,39],[124.3,40],[128,41.8],[130.5,42.6]];
  sea.moveTo(WP(108,21)[0],BMH);SEA.forEach(p=>{const [x,y]=WP(p[0],p[1]);sea.lineTo(x,y);});sea.lineTo(BMW,WP(0,42.6)[1]);sea.lineTo(BMW,BMH);sea.closePath();
  c.save();const out=new Path2D();out.rect(0,0,BMW,BMH);out.addPath(land);c.clip(out,'evenodd');c.fillStyle='rgba(110,155,170,.30)';c.fill(sea);c.clip(sea);for(let i=0;i<140;i++){const x=R()*BMW,y=R()*BMH;if(!onLand(x,y))wmWave(c,x,y,3+R()*2);}c.restore();
  // nhuộm miền
  c.save();c.clip(land);const tint=(lo,la,r,col)=>{const [x,y]=WP(lo,la),rr=r*BMW/62,gg=c.createRadialGradient(x,y,0,x,y,rr);gg.addColorStop(0,col);gg.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gg;c.fillRect(x-rr,y-rr,rr*2,rr*2);};
  tint(84,39.5,11,'rgba(214,170,96,.40)');tint(104,42,9,'rgba(214,176,110,.30)');tint(88,32.5,11,'rgba(170,160,170,.25)');tint(114,30,12,'rgba(120,160,90,.26)');tint(122,46,9,'rgba(140,170,90,.24)');tint(106,25,7,'rgba(110,150,90,.24)');
  for(let i=0;i<60;i++)wmDune(c,...WP(78+R()*14,37.5+R()*4),0.7+R()*0.4);for(let i=0;i<30;i++)wmDune(c,...WP(98+R()*12,40.5+R()*2.5),0.6+R()*0.4);
  const range=(pts,n,s,snow)=>{for(let i=0;i<n;i++){const t=i/(n-1)*(pts.length-1),k=Math.min(pts.length-2,Math.floor(t)),f=t-k;
      wmMountain(c,...WP(pts[k][0]+(pts[k+1][0]-pts[k][0])*f+(R()-0.5)*1.2,pts[k][1]+(pts[k+1][1]-pts[k][1])*f+(R()-0.5)),s*(0.75+R()*0.5),snow);}};
  range([[79,32],[84,29.5],[90,28.6],[96,29]],14,0.95,true);range([[77,36.5],[84,36],[92,36],[98,35]],15,0.9,true);range([[76,41.5],[82,42.5],[88,43.5],[94,43.2]],11,0.85,true);
  range([[104,34],[108,33.8],[112,33.5]],7,0.8,false);range([[98.5,32],[100,29],[101,26.8]],6,0.85,false);range([[120,52],[121,48.5],[119,45]],6,0.7,false);
  for(let i=0;i<70;i++){const [x,y]=WP(104+R()*16,24+R()*9);if(onLand(x,y))wmTree(c,x,y,0.75+R()*0.4);}
  for(let i=0;i<24;i++){const [x,y]=WP(124+R()*8,42+R()*8);if(onLand(x,y))wmTree(c,x,y,0.7+R()*0.3);}
  c.restore();
  // bờ biển / biên cương
  c.strokeStyle='rgba(58,40,24,.22)';c.lineWidth=7;c.lineJoin='round';c.stroke(land);wmInk(c,0.8);c.lineWidth=2.2;c.stroke(land);
  // sông
  for(const Rv of CN_RIVERS){c.beginPath();Rv.forEach((p,i)=>{const [x,y]=WP(p[0],p[1]);if(!i)c.moveTo(x,y);else{const q=Rv[i-1],[px,py]=WP(q[0],q[1]);c.quadraticCurveTo(px,py,(px+x)/2,(py+y)/2);}});
    c.strokeStyle='rgba(70,120,160,.75)';c.lineWidth=2.6;c.stroke();c.strokeStyle='rgba(200,230,240,.6)';c.lineWidth=0.9;c.stroke();}
  c.font='italic 13px "Palatino Linotype","Times New Roman",serif';c.textAlign='center';
  for(const [t,lo,la,col] of [['Trường Giang',113,31.4,'rgba(50,90,120,.85)'],['Hoàng Hà',108.6,41.5,'rgba(50,90,120,.85)'],['Đ ô n g   H ả i',126,31,'rgba(50,90,120,.85)'],['Sa mạc Tháp Khắc Lạp Mã Can',84,40.9,'rgba(110,80,40,.7)'],['Cao nguyên Thanh Tạng',88,33.2,'rgba(110,80,40,.7)']]){const [x,y]=WP(lo,la);c.fillStyle=col;c.fillText(t,x,y);}
  // minh họa từng vùng
  for(const id in MAPS){const M=MAPS[id],f=WM_ICON[M.theme];if(!f)continue;c.save();c.translate(M.wx*BMW,M.wy*BMH);
    c.fillStyle='rgba(60,40,20,.18)';c.beginPath();c.ellipse(0,10,22,6,0,0,6.29);c.fill();f(c);c.restore();}
  // khung viền
  c.strokeStyle='#5a3a1e';c.lineWidth=6;c.strokeRect(8,8,BMW-16,BMH-16);c.strokeStyle='#c8a050';c.lineWidth=1.5;c.strokeRect(15,15,BMW-30,BMH-30);
  c.strokeStyle='rgba(90,58,30,.6)';c.lineWidth=1;c.strokeRect(19,19,BMW-38,BMH-38);
  for(const [x,y] of [[15,15],[BMW-15,15],[15,BMH-15],[BMW-15,BMH-15]]){c.save();c.translate(x,y);c.fillStyle='#7a2a20';c.beginPath();c.moveTo(0,-9);c.lineTo(9,0);c.lineTo(0,9);c.lineTo(-9,0);c.closePath();c.fill();c.strokeStyle='#e8c060';c.lineWidth=1.2;c.stroke();c.fillStyle='#e8c060';c.beginPath();c.arc(0,0,2.4,0,6.29);c.fill();c.restore();}
  // ô tiêu đề
  c.save();c.translate(34,BMH-84);c.fillStyle='rgba(122,42,32,.92)';c.beginPath();c.roundRect(0,0,186,50,6);c.fill();c.strokeStyle='#e8c060';c.lineWidth=1.5;c.beginPath();c.roundRect(3,3,180,44,4);c.stroke();
  c.fillStyle='#f6e2a8';c.font='bold 22px "Palatino Linotype","Times New Roman",serif';c.textAlign='center';c.fillText('Cửu Châu Dư Đồ',93,27);c.font='italic 11px "Palatino Linotype",serif';c.fillText('Trúc Khê Tiên Duyên',93,42);c.restore();
  // la bàn
  c.save();c.translate(BMW-70,BMH-78);c.strokeStyle='rgba(90,58,30,.8)';c.lineWidth=1.2;c.beginPath();c.arc(0,0,30,0,6.29);c.stroke();c.beginPath();c.arc(0,0,24,0,6.29);c.stroke();
  for(let i=0;i<4;i++){c.save();c.rotate(Math.PI/4+i*Math.PI/2);c.fillStyle='rgba(90,58,30,.5)';c.beginPath();c.moveTo(0,-18);c.lineTo(3,0);c.lineTo(-3,0);c.closePath();c.fill();c.restore();}
  for(let i=0;i<4;i++){c.save();c.rotate(i*Math.PI/2);c.fillStyle=i===0?'#7a2a20':'#5a3a1e';c.beginPath();c.moveTo(0,-30);c.lineTo(5,0);c.lineTo(-5,0);c.closePath();c.fill();c.restore();}
  c.fillStyle='#3a2414';c.font='bold 12px "Palatino Linotype",serif';c.textAlign='center';c.fillText('Bắc',0,-35);c.fillText('Nam',0,46);c.fillText('Tây',-46,4);c.fillText('Đông',48,4);c.restore();
  return cv;}
drawWorldMap=function(){const c=ctx;if(!WM.bg)WM.bg=wmBuildBg();c.drawImage(WM.bg,0,0,BMW,BMH);
  const N=WNODES(),byId={};N.forEach(n=>byId[n.id]=n);
  // đường đi: nét chấm đỏ cong (xám nếu chưa đủ cấp)
  c.save();c.setLineDash([2,6]);c.lineCap='round';const done=new Set();
  for(const n of N)for(const p of n.M.portals){const o=byId[p.to];if(!o)continue;const k=[n.id,o.id].sort().join('|');if(done.has(k))continue;done.add(k);
    const mx=(n.x+o.x)/2,my=(n.y+o.y)/2,dx=o.x-n.x,dy=o.y-n.y,cx=mx-dy*0.12,cy=my+dx*0.12,open=player.lv>=Math.max(n.M.minLv,o.M.minLv);
    c.strokeStyle=open?'rgba(160,30,20,.85)':'rgba(90,70,50,.45)';c.lineWidth=open?2.6:2;c.beginPath();c.moveTo(n.x,n.y);c.quadraticCurveTo(cx,cy,o.x,o.y);c.stroke();}
  c.restore();
  for(const n of N){const lk=player.lv<n.M.minLv,cur=n.id===curMapId,sd=n.M.lab||'b';c.font='bold 13px "Palatino Linotype","Times New Roman",serif';const lw0=c.measureText(n.M.name).width+20,lx=n.x+(sd==='r'?24+lw0/2:sd==='l'?-24-lw0/2:0),ly=n.y+(sd==='b'?16:sd==='t'?-58:-17);
    if(lk){c.fillStyle='rgba(230,215,180,.55)';c.beginPath();c.arc(n.x,n.y-4,24,0,6.29);c.fill();}
    const w=lw0,h=31;
    c.save();c.translate(lx-w/2,ly);c.fillStyle=lk?'rgba(205,195,175,.94)':cur?'#fff3c8':'rgba(250,240,212,.96)';c.strokeStyle=cur?'#a8201a':'rgba(90,58,30,.9)';c.lineWidth=cur?2:1.2;
    c.beginPath();c.moveTo(4,0);c.lineTo(w-4,0);c.quadraticCurveTo(w+3,h/2,w-4,h);c.lineTo(4,h);c.quadraticCurveTo(-3,h/2,4,0);c.closePath();c.fill();c.stroke();
    c.textAlign='center';c.fillStyle=lk?'#7a6a58':'#3a1e10';c.fillText(n.M.name,w/2,14);c.font='10.5px "Segoe UI",Arial';c.fillStyle=lk?'#9a4a3a':'#6a4a2a';c.fillText('Cấp '+n.M.lvText+(lk?' · chưa mở':''),w/2,26);c.restore();
    if(cur){const b=Math.sin(nowT*4)*3;c.fillStyle='rgba(184,32,26,.16)';c.beginPath();c.arc(n.x,n.y-2,26+Math.sin(nowT*3)*3,0,6.29);c.fill();
      c.save();c.translate(n.x+18,n.y-26+b);c.strokeStyle='#3a2414';c.lineWidth=1.6;c.beginPath();c.moveTo(0,14);c.lineTo(0,-12);c.stroke();
      c.fillStyle='#b8201a';c.beginPath();c.moveTo(0,-12);c.lineTo(16,-7);c.lineTo(0,-2);c.closePath();c.fill();c.restore();}
    const cnt=typeof NET!=='undefined'?[...NET.world.values()].filter(o=>o.map===n.id).length:0;
    if(cnt){c.font='bold 12px "Segoe UI",Arial';const tx='👥 '+cnt,bw=c.measureText(tx).width+12;c.fillStyle='rgba(30,90,50,.9)';c.beginPath();c.roundRect(n.x-34-bw,n.y-30,bw,18,9);c.fill();c.fillStyle='#e0ffe0';c.textAlign='left';c.fillText(tx,n.x-28-bw,n.y-17);}}
  const D=typeof DIADANH!=='undefined'&&DIADANH[curMapId];
  $('mapHint').textContent=(D?D.name+': '+D.desc+' — ':'')+'Nhấp vào một vùng để tự tìm đường tới đó.';};
