'use strict';
// ===================== CỬ ĐỘNG CHÂN THẬT =====================
// 1) Bước chân theo QUÃNG ĐƯỜNG đi thật (không theo đồng hồ) -> hết cảnh "lướt": đi chậm bước chậm, đi nhanh bước nhanh.
// 2) Thú 4 chân vẽ lại: chân 2 đốt có khớp gối, bước chéo cặp, thân nhún, đầu gật, đuôi vẫy, tai giật, thở khi đứng.
// 3) Đòn đánh: sói/cáo vồ (bật nhảy, há miệng cắn), heo húc (cúi đầu lao tới), rắn mổ.
var GAITPH=null,STEED_FORE=false; // STEED_FORE: thú cưỡi đang chạy lên/xuống -> vẽ xoay chéo // pha bước chân đang dùng cho đối tượng đang vẽ (hàm vẽ đọc biến này)
const GAIT=new WeakMap(),GAITK=new Map();
function gaitOf(e,x,y,k){let g=k!=null?GAITK.get(k):GAIT.get(e);if(!g){g={x,y,p:Math.random()*6};k!=null?GAITK.set(k,g):GAIT.set(e,g);}
  const d=Math.hypot(x-g.x,y-g.y);g.x=x;g.y=y;if(d<60)g.p+=d*(k&&String(k).startsWith('m')?0.11:0.085);return g.p;}
// ---------- nhân vật: bước theo quãng đường ----------
const _drawPlayerAN=drawPlayer;drawPlayer=function(){GAITPH=gaitOf(player,player.x,player.y);STEED_FORE=!!(player.riding&&!player.flying&&(player.dir==='up'||player.dir==='down'));try{_drawPlayerAN();}finally{GAITPH=null;STEED_FORE=false;}};
const _drawChibiAN=drawChibi;drawChibi=function(...a){const f=STEED_FORE,x=a[1];if(f){ctx.save();ctx.translate(x,0);ctx.scale(0.78,1);ctx.translate(-x,0);}try{return _drawChibiAN(...a);}finally{if(f)ctx.restore();STEED_FORE=false;}};
const _dmbAN=drawMonsterBody;drawMonsterBody=function(m,...a){if(typeof GAITPH==='number')return _dmbAN(m,...a);
  const base=Object.prototype.hasOwnProperty.call(m,'x')?m:Object.getPrototypeOf(m)||m;GAITPH=gaitOf(base,base.x,base.y);try{return _dmbAN(m,...a);}finally{GAITPH=null;}};
const _drawMobAN=drawMob;drawMob=function(m){GAITPH=gaitOf(m,m.x,m.y);try{_drawMobAN(m);}finally{GAITPH=null;}};
// ---------- thú 4 chân ----------
function qLeg(hx,hy,L1,L2,ang,bend,front,col,dark,paw,hoof){const k=front?1:-1;
  const kx=hx+Math.sin(ang)*L1,ky=hy+Math.cos(ang)*L1,a2=ang-k*bend,fx_=kx+Math.sin(a2)*L2,fy=Math.min(0,ky+Math.cos(a2)*L2);
  ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(30,20,16,.85)';ctx.lineWidth=5.4;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(kx,ky);ctx.lineTo(fx_,fy);ctx.stroke();
  ctx.strokeStyle=col;ctx.lineWidth=3.8;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(kx,ky);ctx.lineTo(fx_,fy);ctx.stroke();
  ctx.fillStyle=hoof?'#2a1e18':dark;ctx.beginPath();ctx.ellipse(fx_+1.2,fy-0.8,hoof?2.2:2.8,1.8,0,0,6.29);ctx.fill();}
function drawQuad(x,y,s,face,moving,atk,flash,P){const t=nowT,sd=(x*0.37+y*0.11)%6.28;beast(x,y,s,face,flash);
  const ph=typeof GAITPH==='number'?GAITPH:t*9,mv=moving?1:0,ap=atk>0?clamp(1-atk/0.25,0,1):0,as=Math.sin(ap*Math.PI);
  const c1=P.col,c2=shade(c1,-0.32),c3=shade(c1,0.35),belly=P.belly||c3,H=P.h,BL=P.len;
  // đòn: vồ (bật lên lao tới) hoặc húc
  let fwd=0,lift=0,pitch=0;if(ap>0){if(P.charge){fwd=as*13;pitch=as*0.18;lift=as*1.5;}else{fwd=as*12;lift=Math.sin(ap*Math.PI)*9;pitch=ap<0.5?-as*0.3:as*0.2;}}
  const bob=mv?-Math.abs(Math.sin(ph))*1.7:Math.sin(t*2.4+sd)*0.5,breath=mv?0:Math.sin(t*2.4+sd)*0.025;
  ctx.translate(fwd,-lift);ctx.rotate(pitch+(mv?Math.sin(ph*2)*0.035:0));
  const by=-H-6+bob;// tâm thân
  // chân xa (tối hơn)
  const legA=(o)=>mv?Math.sin(ph+o)*0.55:0,legB=(o)=>mv?Math.max(0,Math.cos(ph+o))*1.0:0.12;
  const atkFront=ap>0&&!P.charge?-0.9*as:0;
  qLeg(BL*0.62,by+3,H*0.52,H*0.55,legA(Math.PI)+atkFront,legB(Math.PI),true,c2,c2,0,P.hoof);
  qLeg(-BL*0.62,by+3,H*0.52,H*0.55,legA(0)+(ap>0?0.4*as:0),legB(0),false,c2,c2,0,P.hoof);
  // đuôi
  ctx.save();ctx.translate(-BL-1,by-2);const tw=Math.sin(t*(mv?9:3)+sd)*(mv?0.35:0.25);
  const nT=P.tails||1;for(let i=0;i<nT;i++){ctx.save();ctx.rotate(-0.5+tw+(nT>1?(i-(nT-1)/2)*0.22:0)+(ap>0?-0.4*as:0));
    if(P.tail==='short'){ctx.strokeStyle=c2;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-5,-2,-4,-7,-7,-6);ctx.stroke();}
    else{const len=P.tail==='fox'?22:16;const g=ctx.createLinearGradient(0,0,-len,0);g.addColorStop(0,c1);g.addColorStop(P.tail==='fox'?0.75:1,P.tail==='fox'?c1:c2);if(P.tail==='fox')g.addColorStop(1,'#fff8ee');
      ctx.fillStyle=g;ctx.strokeStyle='rgba(30,20,16,.8)';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(0,-3);ctx.bezierCurveTo(-len*0.4,-8,-len*0.85,-6,-len,-1);ctx.bezierCurveTo(-len*0.8,4,-len*0.35,5,0,3);ctx.closePath();ctx.fill();ctx.stroke();}
    ctx.restore();}ctx.restore();
  // thân
  ctx.save();ctx.translate(0,by);ctx.scale(1,1+breath);
  const g=ctx.createLinearGradient(0,-9,0,9);g.addColorStop(0,c3);g.addColorStop(0.55,c1);g.addColorStop(1,c2);
  ctx.fillStyle=g;ctx.strokeStyle='rgba(30,20,16,.85)';ctx.lineWidth=0.9;ctx.beginPath();
  ctx.moveTo(-BL,-1);ctx.bezierCurveTo(-BL,-8,-BL*0.3,-9.5*P.bh,BL*0.25,-8.5*P.bh);ctx.bezierCurveTo(BL*0.8,-8*P.bh,BL+2,-5,BL+1,1);ctx.bezierCurveTo(BL,6,BL*0.5,7.5,0,7);ctx.bezierCurveTo(-BL*0.6,7.5,-BL-1,6,-BL,-1);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=belly;ctx.globalAlpha=0.55;ctx.beginPath();ctx.ellipse(1,5,BL*0.6,2.4,0,0,6.29);ctx.fill();ctx.globalAlpha=1;
  if(P.mane){ctx.strokeStyle=P.mane;ctx.lineWidth=1.3;for(let i=0;i<7;i++){const xx=-BL*0.6+i*BL*0.22;ctx.beginPath();ctx.moveTo(xx,-8.2*P.bh);ctx.lineTo(xx+1.2,-11.5*P.bh-(i%2)*1.5);ctx.stroke();}}
  if(P.stripes){ctx.strokeStyle=P.stripes;ctx.lineWidth=1.6;for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(i*BL*0.3,-8*P.bh);ctx.quadraticCurveTo(i*BL*0.3+2,-2,i*BL*0.3-1,3);ctx.stroke();}}
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-BL*0.8,-6);ctx.bezierCurveTo(-BL*0.3,-9*P.bh,BL*0.3,-8.5*P.bh,BL*0.6,-7);ctx.stroke();
  ctx.restore();
  // chân gần
  qLeg(BL*0.62,by+3,H*0.52,H*0.55,legA(0)+atkFront,legB(0),true,c1,c2,0,P.hoof);
  qLeg(-BL*0.62,by+3,H*0.52,H*0.55,legA(Math.PI)+(ap>0?0.4*as:0),legB(Math.PI),false,c1,c2,0,P.hoof);
  // đầu
  const nod=mv?Math.sin(ph*2+0.6)*1.2:Math.sin(t*1.3+sd)*0.6,look=!mv&&Math.sin(t*0.5+sd)>0.8?-0.18:0,headDown=P.charge&&ap>0?as*0.5:0;
  ctx.save();ctx.translate(BL+1,by-4+nod);ctx.rotate(look+headDown);P.head(c1,c2,c3,ap,t,sd);ctx.restore();
  ctx.restore();}
// đầu từng loài (gốc tọa độ = cổ, mặt quay sang phải)
const jawOpen=ap=>ap>0.25&&ap<0.95?Math.sin((ap-0.25)/0.7*Math.PI)*0.5:0;
function earPair(c1,c2,x1,x2,ty,t,sd,round){const tw=Math.sin(t*0.9+sd)>0.93?-0.35:0;
  for(const [ex,k] of [[x1,0.85],[x2,1]]){ctx.save();ctx.translate(ex,-5);ctx.rotate(tw*k);ctx.fillStyle=k<1?c2:c1;ctx.strokeStyle='rgba(30,20,16,.85)';ctx.lineWidth=0.8;ctx.beginPath();
    if(round){ctx.ellipse(0,-3,2.8,3.4,0,0,6.29);}else{ctx.moveTo(-2.6,0);ctx.lineTo(0.4,ty);ctx.lineTo(3,0);ctx.closePath();}ctx.fill();ctx.stroke();
    if(!round&&k===1){ctx.fillStyle='#e8a0a0';ctx.beginPath();ctx.moveTo(-1.2,-0.5);ctx.lineTo(0.4,ty*0.65);ctx.lineTo(1.7,-0.5);ctx.closePath();ctx.fill();}ctx.restore();}}
function eye(x,y,col,blinkSd){const bl=((nowT+blinkSd)%3.9)<0.12;if(bl){ctx.strokeStyle='#1a1010';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(x-1.6,y);ctx.lineTo(x+1.6,y);ctx.stroke();return;}
  ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y,1.9,1.4,-0.2,0,6.29);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(x+0.2,y,0.7,1.2,0,0,6.29);ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(x-0.6,y-0.9,0.8,0.8);}
function headWolf(c1,c2,c3,ap,t,sd){const j=jawOpen(ap);earPair(c1,c2,1.5,5.5,-8.5,t,sd);
  ctx.fillStyle=c1;ctx.strokeStyle='rgba(30,20,16,.85)';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(-2,-6);ctx.quadraticCurveTo(6,-10,12,-5);ctx.lineTo(19,-2.5);ctx.quadraticCurveTo(20,0,17.5,0.8);ctx.lineTo(9,1.5);ctx.quadraticCurveTo(2,4,-2,3);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.save();ctx.translate(9,1.3);ctx.rotate(j);ctx.fillStyle=c3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(9,-0.5);ctx.quadraticCurveTo(8.5,2.2,4,2.3);ctx.closePath();ctx.fill();ctx.stroke();if(j>0.1){ctx.fillStyle='#fff';ctx.fillRect(2,-0.6,0.9,1.4);ctx.fillRect(5,-0.6,0.9,1.4);}ctx.restore();
  if(j>0.1){ctx.fillStyle='#8a2a2a';ctx.beginPath();ctx.moveTo(10,1);ctx.lineTo(17,0.4);ctx.lineTo(16,2.6);ctx.closePath();ctx.fill();}
  ctx.fillStyle=c3;ctx.beginPath();ctx.moveTo(0,-1);ctx.lineTo(-3,3);ctx.lineTo(1,2.5);ctx.lineTo(0,6);ctx.lineTo(4,3);ctx.closePath();ctx.fill();
  ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(18.8,-1.6,1.3,0,6.29);ctx.fill();eye(9,-4.4,'#ffd23f',sd);}
function headFox(c1,c2,c3,ap,t,sd){const j=jawOpen(ap);earPair(c1,c2,0.5,4.5,-10.5,t,sd);
  ctx.fillStyle=c1;ctx.strokeStyle='rgba(30,20,16,.85)';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(-2,-5.5);ctx.quadraticCurveTo(5,-9.5,10,-4.5);ctx.lineTo(18,-1.2);ctx.quadraticCurveTo(18.5,0.6,16.5,1);ctx.lineTo(8,1.6);ctx.quadraticCurveTo(1,4,-2,3);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff6ea';ctx.beginPath();ctx.moveTo(1,0.5);ctx.quadraticCurveTo(8,-0.5,16.5,1);ctx.quadraticCurveTo(9,4.5,1,3.4);ctx.closePath();ctx.fill();
  ctx.save();ctx.translate(8,1.4);ctx.rotate(j);ctx.fillStyle='#fff6ea';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(8,0);ctx.lineTo(3,2);ctx.closePath();ctx.fill();ctx.restore();
  ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(17.8,-0.4,1.1,0,6.29);ctx.fill();eye(8.5,-3.8,'#ffb040',sd);}
function headBoar(c1,c2,c3,ap,t,sd){earPair(c2,c2,-1,2.5,-7,t,sd,false);
  ctx.fillStyle=c1;ctx.strokeStyle='rgba(30,20,16,.85)';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(-3,-7);ctx.quadraticCurveTo(7,-9,12,-2);ctx.lineTo(15,2);ctx.quadraticCurveTo(14,7,8,7);ctx.quadraticCurveTo(0,8,-3,5);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#d89a8a';ctx.beginPath();ctx.ellipse(15,3,2.6,3.2,0.2,0,6.29);ctx.fill();ctx.stroke();ctx.fillStyle='#6a2a2a';ctx.beginPath();ctx.arc(15.2,2,0.6,0,6.29);ctx.arc(15.2,4.2,0.6,0,6.29);ctx.fill();
  ctx.fillStyle='#fff8e0';ctx.beginPath();ctx.moveTo(10,5);ctx.quadraticCurveTo(14,4,15,0);ctx.lineTo(13.5,4.5);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#2a1a10';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(4,-4.5);ctx.lineTo(8,-3.8);ctx.stroke();eye(6.5,-2.6,'#e8c060',sd);}
const Q_WOLF=col=>({col:col||'#8d939b',h:12,len:12,bh:1,head:headWolf,tail:'bush'});
const Q_FOX=(col,tails)=>({col:col||'#e88a3a',belly:'#fff6ea',h:10,len:11,bh:0.9,head:headFox,tail:'fox',tails:tails||1});
const Q_BOAR={col:'#7a5236',h:9,len:13,bh:1.15,head:headBoar,tail:'short',hoof:true,charge:true,mane:'#3a2414'};
drawWolf=function(x,y,s,face,moving,atk,flash,col){drawQuad(x,y,s,face,moving,atk,flash,Q_WOLF(col));};
drawFox=function(x,y,s,face,moving,atk,flash,col,tails,boss){const P=Q_FOX(col,tails);if(boss){P.h=12;P.len=13;}drawQuad(x,y,s,face,moving,atk,flash,P);};
drawBoar=function(x,y,s,face,moving,atk,flash){drawQuad(x,y,s,face,moving,atk,flash,Q_BOAR);};
// rắn: thân uốn sóng chạy dọc theo hướng bò, đầu ngẩng, mổ khi tấn công
drawSnake=function(x,y,s,face,moving,atk,flash,col){const t=nowT,c1=col||'#5a9a4a',c2=shade(c1,-0.35),c3=shade(c1,0.4);beast(x,y,s,face,flash);
  const ph=(typeof GAITPH==='number'?GAITPH*1.3:t*2)+(moving?0:0),ap=atk>0?clamp(1-atk/0.25,0,1):0,as=Math.sin(ap*Math.PI),N=12,pts=[];
  for(let i=0;i<N;i++){const u=i/(N-1),xx=-u*30,yy=-3-Math.sin(ph*2.2-u*6)*(moving?2.6:1.2)*u;pts.push([xx,yy]);}
  const strokeBody=(w0,col)=>{for(let i=N-2;i>=0;i--){ctx.strokeStyle=col;ctx.lineWidth=w0*(1-i/(N-1)*0.75);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(pts[i+1][0],pts[i+1][1]);ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();}};
  strokeBody(11.5,'rgba(30,20,16,.8)');strokeBody(9.8,c1);ctx.globalAlpha=0.45;ctx.save();ctx.translate(0,1.8);strokeBody(4,c3);ctx.restore();ctx.globalAlpha=1;
  ctx.fillStyle=c2;for(let i=1;i<N-1;i+=1){const [xx,yy]=pts[i];ctx.beginPath();ctx.ellipse(xx,yy-1.8*(1-i/N),1.6*(1-i/N*0.6),0.9,0,0,6.29);ctx.fill();}
  const rise=8+as*3,hx=3+as*14,hy=-rise-as*2+Math.sin(t*2)*0.6;ctx.strokeStyle=c1;ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,-4);ctx.quadraticCurveTo(2,-rise*0.8,hx-2,hy+2);ctx.stroke();
  ctx.save();ctx.translate(hx,hy);ctx.rotate(as*0.3);ctx.fillStyle=c1;ctx.strokeStyle='rgba(30,20,16,.85)';ctx.lineWidth=0.9;ctx.beginPath();ctx.ellipse(2,0,6.5,4.5,0,0,6.29);ctx.fill();ctx.stroke();
  const j=jawOpen(ap);if(j>0.1){ctx.fillStyle='#7a1a2a';ctx.beginPath();ctx.moveTo(4,1);ctx.lineTo(9,2+j*6);ctx.lineTo(9,0.5);ctx.closePath();ctx.fill();ctx.fillStyle='#fff';ctx.fillRect(6,1,0.8,1.6);}
  if(j>0.1||((t*1.4)%2.4)<0.2){ctx.strokeStyle='#e0304a';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(8,1);ctx.lineTo(12,1.5);ctx.lineTo(14,0);ctx.moveTo(12,1.5);ctx.lineTo(14,3);ctx.stroke();}
  eye(3,-1.6,'#ffd040',x);ctx.restore();ctx.restore();};
// ---------- đòn đánh của người: chém, đâm, nhảy bổ ----------
const _atkPoseAN=atkPose;const eo=u=>1-(1-u)*(1-u);
atkPose=function(type,st,p){const s=Math.sin(p*Math.PI),k=(st|0)%3;
  if(!type||type==='sword'||type==='saber'){
    if(k===1){if(p<0.3){const w=p/0.3;return{aF:1.2+w*1.8,wA:-0.6-w*1.1,rot:-0.06*w,lunge:-2*w};} // chém: vung kiếm ra sau đầu
      const u=eo((p-0.3)/0.7);return{aF:3.0-u*2.7,wA:-1.7+u*3.1,rot:0.16*Math.sin(u*Math.PI),lunge:-2+u*11*(1-0.4*u)};}
    if(k===2){if(p<0.35){const w=p/0.35;return{aF:1.57-w*0.9,wA:0,rot:-0.08*w,lunge:-4*w};} // đâm: rụt tay lấy đà
      const u=(p-0.35)/0.65,th=Math.sin(Math.min(1,u*1.6)*Math.PI/2)*(1-Math.max(0,u-0.7)/0.3*0.6);return{aF:0.67+th*0.95,wA:0,rot:0.12*th,lunge:-4+th*18};}
    const up=p<0.45?eo(p/0.45):1,dn=p<0.45?0:eo((p-0.45)/0.55); // nhảy bổ: bật cao, giơ kiếm, bổ xuống
    return{aF:0.4+up*2.7-dn*2.6,wA:-0.8-up*0.9+dn*2.6,lift:Math.sin(p*Math.PI)*15,lunge:s*10,rot:-0.1*up+0.22*dn*(1-dn*0.5)};}
  const r=_atkPoseAN(type,st,p)||{};
  if(type==='dagger'||type==='hammer'){r.lunge=(r.lunge||0)+s*5;r.rot=(r.rot||0)+s*0.08;if(k===0)r.lift=Math.max(r.lift||0,s*8);}
  else r.lunge=(r.lunge||0)+s*2;return r;};
// ---------- tốc độ di chuyển từ tốn hơn ----------
const _statsAN=stats;stats=function(){const s=_statsAN();if(player.sect&&s.move)s.move*=player.riding?0.7:0.82;return s;};
// ---------- thú cưỡi, thú nuôi: "đồng hồ ảo" chạy theo quãng đường khi di chuyển, theo thời gian thật khi đứng ----------
const VCLK=new Map();
function vclock(key,x,y,moving,rate){let c=VCLK.get(key);const now=nowT;if(!c){c={x,y,last:now,v:now};VCLK.set(key,c);}
  const rd=Math.min(0.1,Math.max(0,now-c.last)),d=Math.hypot(x-c.x,y-c.y);c.x=x;c.y=y;c.last=now;
  c.v+=moving&&d>0.01&&d<80?d*rate:moving?rd*1.3:rd;return c.v;}
function withClock(v,fn){const save=nowT;nowT=v;try{fn();}finally{nowT=save;}}
const _drawSteedAN=drawSteed;drawSteed=function(k,x,y,face,moving,sd){const v=vclock('s'+k+'|'+(sd||0),x,y,moving,0.0062);withClock(v,()=>{if(STEED_FORE){ctx.save();ctx.translate(x,y);ctx.scale(0.78,1);ctx.translate(-x,-y);}try{_drawSteedAN(k,x,y,face,moving,sd);}finally{if(STEED_FORE)ctx.restore();}});};
const _drawPetAtAN=drawPetAt;drawPetAt=function(k,x,y,face,moving,atk,lv){const v=vclock('p'+k,x,y,moving,0.0085);withClock(v,()=>_drawPetAtAN(k,x,y,face,moving,atk,lv));};
// ---------- TẠM KHÓA THÚ CƯỠI (đã có Truyền Tống Sứ; mở lại: đổi MOUNT_LOCK=false) ----------
var MOUNT_LOCK=true;
if(MOUNT_LOCK){const _ur=updateRiding;updateRiding=function(){_ur();player.riding=false;};
  const _bhML=buildHotbar;buildHotbar=function(){_bhML();const b=$('mountBtn');if(b)b.style.display='none';};
  const _rsML=renderShop;renderShop=function(){if(shopTab==='mount')shopTab='item';const t=$('shTab_mount');if(t)t.style.display='none';return _rsML.apply(this,arguments);};}
