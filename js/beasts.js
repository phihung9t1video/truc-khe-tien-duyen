'use strict';
// ===================== THÚ CƯỠI & THÚ NUÔI (vẽ lại) =====================
// Thú cưỡi: dáng 4 chân có khớp, bờm/đuôi bay theo gió, yên cương có tua; Kỳ Lân có vảy và lửa, Tiên Hạc vỗ cánh nhiều lớp lông.
// Thú nuôi: kiểu chibi đầu to mắt long lanh cho hợp với nhân vật; thần thú có hào quang, mây dưới chân và tia sáng.
const OUTL='rgba(28,18,16,.8)';
function bPath(fn,fill,stroke,lw){ctx.beginPath();fn();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke!==false){ctx.strokeStyle=stroke||OUTL;ctx.lineWidth=lw||1;ctx.stroke();}}
function vGrad(y0,y1,a,b,c){const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,a);if(c){g.addColorStop(.55,b);g.addColorStop(1,c);}else g.addColorStop(1,b);return g;}
// chân có khớp: hông (hx,hy), pha bước
function bLeg(hx,hy,ph,moving,col,hoof,paw,near){const sw=moving?Math.sin(ph):0,bend=moving?Math.max(0,Math.sin(ph+1.2))*0.9:0.1;
  const a1=sw*0.5,kx=hx+Math.sin(a1)*8,ky=hy+Math.cos(a1)*8,a2=a1-bend*(hx>0?-1:1)*0.6,fx_=kx+Math.sin(a2)*9,fy=Math.min(0,ky+Math.cos(a2)*9);
  ctx.lineCap='round';ctx.strokeStyle=OUTL;ctx.lineWidth=near?6.6:6.2;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(kx,ky);ctx.lineTo(fx_,fy);ctx.stroke();
  ctx.strokeStyle=near?col:shade(col,-.22);ctx.lineWidth=near?4.8:4.4;ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(kx,ky);ctx.lineTo(fx_,fy);ctx.stroke();
  if(paw){bPath(()=>ctx.ellipse(fx_+1.5,fy-1,3.6,2.4,0,0,6.29),near?col:shade(col,-.22));}
  else bPath(()=>ctx.roundRect(fx_-2.6,fy-3,5.4,3.4,1.2),hoof);
  return[fx_,fy];}
function bTail(x,y,col,kind,t,moving){const w=Math.sin(t*(moving?9:3));ctx.lineCap='round';
  if(kind==='tiger'){ctx.strokeStyle=OUTL;ctx.lineWidth=5;const p=()=>{ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-10,y-2,x-14,y-12+w*3,x-8,y-18+w*4);};p();ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=3.4;p();ctx.stroke();
    ctx.strokeStyle='#1a1410';ctx.lineWidth=3.6;for(const q of [.35,.6,.85]){ctx.beginPath();ctx.arc(x-10*q-3*q,y-6*q-12*q*q+w*3*q,1.6,0,6.29);ctx.stroke();}return;}
  for(let i=0;i<5;i++){const o=i-2;ctx.strokeStyle=i%2?col:shade(col,.25);ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-8,y+1+o,x-12+w*2,y+8+o,x-10+w*4+o,y+16+o*0.5);ctx.stroke();}}
function bSaddle(cloth,trim){bPath(()=>{ctx.moveTo(-10,-30);ctx.quadraticCurveTo(-1,-34,9,-30);ctx.lineTo(10,-20);ctx.quadraticCurveTo(0,-17,-11,-20);ctx.closePath();},vGrad(-34,-17,shade(cloth,.25),cloth,shade(cloth,-.35)));
  ctx.strokeStyle=trim;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-11,-20.5);ctx.quadraticCurveTo(0,-17.5,10,-20.5);ctx.stroke();
  for(const tx of [-9,-3,3,9]){ctx.strokeStyle=trim;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(tx,-19.5+(Math.abs(tx)>6?-.5:.6));ctx.lineTo(tx,-16.5);ctx.stroke();}
  bPath(()=>{ctx.moveTo(-7,-31);ctx.quadraticCurveTo(-1,-35,6,-31.5);ctx.quadraticCurveTo(8,-28,6,-27);ctx.quadraticCurveTo(0,-29,-7,-27);ctx.closePath();},vGrad(-35,-27,'#8a4a24','#4a2410'));
  bPath(()=>ctx.ellipse(6.5,-32,1.8,2.4,0,0,6.29),'#ffd23f');
  ctx.strokeStyle='#2a1a10';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-1,-27);ctx.lineTo(-1,-15);ctx.stroke();bPath(()=>ctx.roundRect(-3,-15.5,4,2.2,1),'#c9a227');}
function drawSteed(k,x,y,face,moving,sd){const M=MOUNTS[k];if(!M)return;const t=nowT+(sd||0),ph=moving?t*12:0;
  ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.lineJoin='round';ctx.lineCap='round';
  if(typeof STEED_POS!=='undefined'){STEED_POS.x=x;STEED_POS.y=y;STEED_POS.f=face;steedAura(M,t,0);
    if(STEED_DRAW[M.kind]){ctx.save();STEED_DRAW[M.kind](M,t,moving);ctx.restore();steedAura(M,t,1);ctx.restore();return;}}
  if(M.kind==='crane'){drawCrane(t,moving);ctx.restore();return;}
  const K=M.kind,C=M.col,D=shade(C,-.3),L2=shade(C,.32),hoof=K==='qilin'?'#ffcf40':'#2a1e18',paw=K==='tiger';
  // chân xa
  bLeg(-12,-17,ph+Math.PI,moving,C,hoof,paw,false);bLeg(13,-17,ph,moving,C,hoof,paw,false);
  const bob=moving?-Math.abs(Math.sin(ph))*1.8:Math.sin(t*2)*0.4;ctx.translate(0,bob);
  bTail(-19,-26,K==='tiger'?C:M.mane,K,t,moving);
  // thân
  const body=()=>{ctx.moveTo(-21,-23);ctx.bezierCurveTo(-23,-33,-10,-34,0,-31.5);ctx.bezierCurveTo(9,-30,15,-34,20,-30);ctx.bezierCurveTo(25,-26,23,-16,15,-15);ctx.lineTo(-13,-15);ctx.bezierCurveTo(-21,-14,-24,-18,-21,-23);ctx.closePath();};
  bPath(body,vGrad(-34,-14,L2,C,D),OUTL,1.1);
  ctx.save();ctx.beginPath();body();ctx.clip();
  bPath(()=>ctx.ellipse(1,-15,16,5,0,0,6.29),shade(C,K==='deer'||K==='tiger'?.55:.15)+'cc',false);
  if(K==='tiger'){ctx.strokeStyle='#18120e';ctx.lineWidth=2.2;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*6,-33);ctx.quadraticCurveTo(i*6+3,-27,i*6-1,-21);ctx.stroke();}}
  if(K==='deer'){ctx.fillStyle='rgba(255,255,255,.75)';for(const [sx,sy] of [[-12,-27],[-6,-29],[1,-28],[-9,-23],[6,-27],[-2,-24]]){ctx.beginPath();ctx.arc(sx,sy,1.5,0,6.29);ctx.fill();}}
  if(K==='qilin'){ctx.strokeStyle='rgba(255,220,120,.7)';ctx.lineWidth=.9;for(let r=0;r<3;r++)for(let i=-4;i<=4;i++){ctx.beginPath();ctx.arc(i*5+(r%2)*2.5,-29+r*4.5,2.6,0.1,Math.PI-0.1);ctx.stroke();}}
  ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-18,-28);ctx.bezierCurveTo(-10,-32.5,0,-31,8,-31);ctx.stroke();ctx.restore();
  // cổ + đầu
  drawSteedHead(K,M,C,D,L2,t,moving);
  bSaddle(K==='qilin'?'#7a1020':K==='tiger'?'#2a3a6a':K==='deer'?'#2a7a5a':'#a0302a','#ffd23f');
  // chân gần
  bLeg(-12,-17,ph,moving,C,hoof,paw,true);bLeg(13,-17,ph+Math.PI,moving,C,hoof,paw,true);
  if(K==='qilin'){ctx.save();ctx.globalCompositeOperation='lighter';const g=ctx.createRadialGradient(0,-22,4,0,-22,30);g.addColorStop(0,'rgba(255,140,40,.18)');g.addColorStop(1,'rgba(255,90,20,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-22,30,0,6.29);ctx.fill();ctx.restore();
    if(moving&&Math.random()<0.35)fx.push({k:'p',x:x+rnd(-14,14)*face,y:y-rnd(0,4),vx:rnd(-12,12),vy:-rnd(20,45),col:Math.random()<.5?(M.glow||'#ffd040'):(M.glow?'#ffffff':'#ff6a2a'),t:0,life:0.55,sz:2.2});}
  if(typeof steedAura==='function')steedAura(M,t,1);
  ctx.restore();}
function drawSteedHead(K,M,C,D,L2,t,moving){const nod=moving?Math.sin(t*12)*1.2:Math.sin(t*1.6)*0.8;
  if(K==='tiger'){ctx.save();ctx.translate(0,nod*.5);
    bPath(()=>{ctx.moveTo(12,-30);ctx.quadraticCurveTo(19,-34,24,-31);ctx.lineTo(22,-18);ctx.quadraticCurveTo(16,-16,12,-18);ctx.closePath();},vGrad(-34,-16,L2,C,D));
    bPath(()=>ctx.ellipse(25,-28,9.5,8.5,0,0,6.29),vGrad(-37,-19,L2,C,D),OUTL,1.1);
    for(const ex of [19.5,28]){bPath(()=>ctx.ellipse(ex,-35.5,3,3.2,0,0,6.29),C);bPath(()=>ctx.ellipse(ex,-35.2,1.5,1.7,0,0,6.29),'#f0c8b0',false);}
    bPath(()=>ctx.ellipse(30,-24.5,5,3.8,0,0,6.29),'#fff6e8');bPath(()=>ctx.ellipse(33.5,-26,1.6,1.2,0,0,6.29),'#d06a6a',false);
    ctx.strokeStyle='#18120e';ctx.lineWidth=1.6;for(const [a,b,c2,d] of [[20,-33,23,-30],[22,-35,24,-32],[18,-27,22,-27]]){ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c2,d);ctx.stroke();}
    bPath(()=>ctx.ellipse(28,-29.5,2.2,1.8,0,0,6.29),'#ffc030');bPath(()=>ctx.ellipse(28.4,-29.5,.8,1.5,0,0,6.29),'#111',false);
    ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=.6;for(const dy of [-1,1]){ctx.beginPath();ctx.moveTo(33,-24);ctx.lineTo(39,-24+dy*2.5);ctx.stroke();}
    ctx.restore();return;}
  ctx.save();ctx.translate(0,nod);
  const neck=()=>{ctx.moveTo(11,-29);ctx.bezierCurveTo(15,-36,19,-42,23,-45);ctx.lineTo(29,-41);ctx.bezierCurveTo(26,-36,22,-26,18,-17);ctx.closePath();};
  bPath(neck,vGrad(-46,-17,L2,C,D),OUTL,1.1);
  // đầu dài có mõm
  const head=()=>{ctx.moveTo(22,-46);ctx.bezierCurveTo(26,-50,32,-47,36,-41);ctx.bezierCurveTo(38,-38,36,-35,33,-35.5);ctx.bezierCurveTo(29,-36,26,-38,23,-39);ctx.closePath();};
  bPath(head,vGrad(-50,-35,L2,C,D),OUTL,1.1);
  bPath(()=>ctx.ellipse(34.5,-37.5,2.6,2.2,0.4,0,6.29),shade(C,-.15),false);
  ctx.fillStyle='#1a1010';ctx.beginPath();ctx.arc(35.4,-38.4,.7,0,6.29);ctx.fill();
  bPath(()=>ctx.ellipse(27.2,-44,1.7,1.5,0,0,6.29),'#1a1010',false);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(27.7,-44.5,.55,0,6.29);ctx.fill();
  // tai
  bPath(()=>{ctx.moveTo(23,-46);ctx.lineTo(22,-52);ctx.lineTo(25.5,-47.5);ctx.closePath();},D);
  // dây cương
  ctx.strokeStyle=K==='qilin'?'#ffd23f':'#a0302a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(25,-46);ctx.lineTo(33,-36.5);ctx.moveTo(30,-38);ctx.quadraticCurveTo(20,-33,9,-29);ctx.stroke();
  bPath(()=>ctx.arc(31,-39,1.3,0,6.29),'#ffd23f',false);
  if(K==='deer'){ctx.strokeStyle='#f0e0b8';ctx.lineWidth=2;const ant=s=>{ctx.beginPath();ctx.moveTo(24+s,-48);ctx.lineTo(21+s,-56);ctx.lineTo(18+s*2,-61);ctx.moveTo(21.8+s,-54);ctx.lineTo(26+s,-59);ctx.moveTo(19.6+s*1.5,-58.5);ctx.lineTo(16+s,-60);ctx.stroke();};ant(0);ctx.globalAlpha=.6;ant(3);ctx.globalAlpha=1;
    ctx.save();ctx.shadowColor='#bfffd8';ctx.shadowBlur=6;ctx.strokeStyle='rgba(220,255,230,.55)';ctx.lineWidth=1;ant(0);ctx.restore();}
  if(K==='qilin'){bPath(()=>{ctx.moveTo(24,-47);ctx.quadraticCurveTo(25,-56,30,-60);ctx.quadraticCurveTo(27,-53,27,-46.5);ctx.closePath();},'#ffe27a');
    ctx.strokeStyle='#ffe0a0';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(33,-35.5);ctx.quadraticCurveTo(32,-30,29,-28);ctx.stroke();}
  // bờm: ngựa đen bay, kỳ lân là lửa
  if(K==='horse'||K==='qilin'){for(let i=0;i<7;i++){const q=i/6,mx=12+q*12,my=-30-q*16,w=Math.sin(t*(moving?10:3)+i*0.9)*2.4;
      if(K==='qilin'){ctx.fillStyle=M.glow&&M.col!=='#ffc840'?(i%2?M.glow:M.mane):(i%2?'#ff6a20':'#ffc040');ctx.beginPath();ctx.moveTo(mx+2,my+2);ctx.quadraticCurveTo(mx-6,my-1+w,mx-9+w,my-7);ctx.quadraticCurveTo(mx-3,my-3,mx+3,my-2);ctx.closePath();ctx.fill();}
      else{ctx.strokeStyle=i%2?M.mane:shade(M.mane,.2);ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(mx+1,my);ctx.quadraticCurveTo(mx-5,my+2+w,mx-8+w,my+7);ctx.stroke();}}
    ctx.strokeStyle=K==='qilin'?(M.glow&&M.col!=='#ffc840'?M.mane:'#ffc040'):M.mane;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(25,-47);ctx.quadraticCurveTo(28,-46,29.5,-43);ctx.stroke();}
  ctx.restore();}
function drawCrane(t,moving){const fl=Math.sin(t*(moving?8:2.6)),hov=-16-Math.sin(t*2)*2.5;
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(0,0,22,5,0,0,6.29);ctx.fill();
  ctx.translate(0,hov);
  const wing=(s,back)=>{ctx.save();ctx.translate(-3,-25);ctx.rotate(-s*(0.15+fl*0.45));ctx.globalAlpha=back?.85:1;
    for(let i=0;i<6;i++){const a=i/5,len=36-i*3,yy=-a*4*s;ctx.beginPath();ctx.moveTo(0,yy);ctx.quadraticCurveTo(-len*.5,yy-(16-i*1.5)*s,-len,yy-(9-i)*s-fl*5*s);ctx.quadraticCurveTo(-len*.6,yy-2*s,0,yy+3);ctx.closePath();
      ctx.fillStyle=i<2?'#1c1c22':i<3?'#d8dee6':'#ffffff';ctx.fill();ctx.strokeStyle='rgba(40,40,50,.35)';ctx.lineWidth=.8;ctx.stroke();}
    ctx.restore();};
  wing(-1,true);
  bPath(()=>{ctx.moveTo(-16,-22);ctx.lineTo(-30,-17);ctx.lineTo(-28,-24);ctx.closePath();},'#1c1c22',false);
  bPath(()=>{ctx.moveTo(-17,-24);ctx.bezierCurveTo(-12,-33,8,-33,14,-25);ctx.bezierCurveTo(10,-17,-8,-15,-17,-24);ctx.closePath();},vGrad(-33,-16,'#ffffff','#f2f4f8','#c8d0dc'),OUTL,1);
  // cổ chữ S
  ctx.strokeStyle=OUTL;ctx.lineWidth=5;const nk=()=>{ctx.beginPath();ctx.moveTo(10,-28);ctx.bezierCurveTo(20,-32,14,-44,22,-50);};nk();ctx.stroke();ctx.strokeStyle='#ffffff';ctx.lineWidth=3.6;nk();ctx.stroke();
  ctx.strokeStyle='#1c1c22';ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(16,-40);ctx.bezierCurveTo(15,-45,18,-48,22,-50);ctx.stroke();
  bPath(()=>ctx.ellipse(23.5,-51,3.6,3,0,0,6.29),'#ffffff');bPath(()=>ctx.ellipse(23.5,-54,2,1.4,0,0,6.29),'#e01a2a',false);
  bPath(()=>{ctx.moveTo(26.5,-51.5);ctx.lineTo(36,-49);ctx.lineTo(26.5,-49.6);ctx.closePath();},'#d8b048',false);
  ctx.fillStyle='#111';ctx.beginPath();ctx.arc(24.6,-51.6,.8,0,6.29);ctx.fill();
  ctx.strokeStyle='#c8a038';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-3,-17);ctx.lineTo(-11,-8);ctx.moveTo(1,-17);ctx.lineTo(-7,-8);ctx.stroke();
  bSaddleCrane();
  wing(1,false);
}
function bSaddleCrane(){bPath(()=>{ctx.moveTo(-9,-30);ctx.quadraticCurveTo(-1,-34,7,-30);ctx.lineTo(7,-26);ctx.quadraticCurveTo(-1,-24,-9,-26);ctx.closePath();},vGrad(-34,-24,'#5aa8e0','#1a4a8a'));
  ctx.strokeStyle='#ffd23f';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-9,-26.3);ctx.quadraticCurveTo(-1,-24.3,7,-26.3);ctx.stroke();}

// ---------- THÚ NUÔI kiểu chibi ----------
function drawPetAt(k,x,y,face,moving,atk,lv){const P=PETS[k];if(!P)return;const t=nowT+(x*0.013),s=(P.s||0.6)/0.6*0.95,div=!!P.divine;
  const bounce=moving?-Math.abs(Math.sin(t*11))*3:Math.sin(t*2.4)*0.8,lean=atk>0?4:0;
  if(div){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.8+.2*Math.sin(t*3);const g=ctx.createRadialGradient(x,y-16*s,2,x,y-16*s,36*s);g.addColorStop(0,P.glow+'88');g.addColorStop(.5,P.glow+'33');g.addColorStop(1,P.glow+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y-16*s,36*s,0,6.29);ctx.fill();ctx.restore();
    if(Math.random()<0.18)fx.push({k:'p',x:x+rnd(-12,12)*s,y:y-rnd(4,28)*s,vx:0,vy:-22,col:Math.random()<.5?P.glow:'#ffffff',t:0,life:0.7,sz:1.7});}
  drawShadow(x,y,13*s,0.28);
  ctx.save();ctx.translate(x,y);ctx.scale(face*s,s);ctx.lineJoin='round';ctx.lineCap='round';
  if(div){ctx.save();ctx.globalAlpha=.85;for(const [cx,cr] of [[-8,5],[0,6.5],[8,5]]){ctx.fillStyle='rgba(255,255,255,.85)';ctx.beginPath();ctx.arc(cx,-1+Math.sin(t*2+cx)*.6,cr,Math.PI,0);ctx.fill();}ctx.restore();ctx.translate(0,-5);}
  ctx.translate(lean,bounce);
  const C=P.col||(P.draw==='boar'?'#8a5a3a':'#a0a6ae'),D=shade(C,-.3),L2=shade(C,.35);
  if(typeof PET_DRAW!=='undefined'&&PET_DRAW[P.draw])PET_DRAW[P.draw](P,C,D,L2,t,moving,atk);else if(P.draw==='spirit')petSpirit(C,t,div);else if(P.draw==='snake')petSnake(C,D,L2,t,moving,atk);else petBeast(P,C,D,L2,t,moving,atk);
  if(div){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=P.glow;ctx.lineWidth=1.6;ctx.globalAlpha=.75+Math.sin(t*3)*.2;ctx.beginPath();ctx.ellipse(0,-36,8,2.6,0,0,6.29);ctx.stroke();ctx.restore();}
  ctx.restore();
  if(lv!=null)label(`${P.name}${lv>1?' · '+lv:''}`,x,y-46*s-(div?6:0),div?'#ffd23f':'#cfe8c0',9);}
function chibiEyes(ex,ey,r,col,blinkT){const bl=((nowT+blinkT)%3.7)<0.12;
  for(const dx of [-r*1.9,r*1.9]){if(bl){ctx.strokeStyle='#1a1010';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(ex+dx-r,ey);ctx.quadraticCurveTo(ex+dx,ey+r*.6,ex+dx+r,ey);ctx.stroke();continue;}
    bPath(()=>ctx.ellipse(ex+dx,ey,r,r*1.2,0,0,6.29),'#1a1010',false);const g=ctx.createRadialGradient(ex+dx,ey+r*.4,0,ex+dx,ey+r*.4,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(ex+dx,ey+r*.2,r*.8,r,0,0,6.29);ctx.fill();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex+dx-r*.35,ey-r*.45,r*.42,0,6.29);ctx.fill();ctx.beginPath();ctx.arc(ex+dx+r*.35,ey+r*.35,r*.18,0,6.29);ctx.fill();}
  ctx.fillStyle='rgba(255,120,140,.45)';for(const dx of [-r*3.4,r*3.4]){ctx.beginPath();ctx.ellipse(ex+dx,ey+r*1.6,r*.9,r*.5,0,0,6.29);ctx.fill();}}
function petBeast(P,C,D,L2,t,moving,atk){const K=P.draw,step=moving?Math.sin(t*11):0;
  // đuôi
  if(K==='fox'){const n=P.tails||1;for(let i=0;i<n;i++){const a=(i-(n-1)/2)*(n>3?0.28:0.45)+Math.sin(t*3+i)*0.12;ctx.save();ctx.translate(-8,-9);ctx.rotate(-0.9+a);
      bPath(()=>{ctx.moveTo(0,0);ctx.bezierCurveTo(-4,-6,-6,-15,-1,-20);ctx.bezierCurveTo(4,-16,4,-6,0,0);},vGrad(-20,0,'#fff6e8',C),OUTL,.9);ctx.restore();}}
  else if(K==='wolf'){ctx.save();ctx.translate(-8,-10);ctx.rotate(-0.7+Math.sin(t*(moving?12:4))*0.25);bPath(()=>{ctx.moveTo(0,0);ctx.quadraticCurveTo(-6,-6,-3,-13);ctx.quadraticCurveTo(2,-7,0,0);},vGrad(-13,0,L2,C),OUTL,.9);ctx.restore();}
  else{ctx.strokeStyle=OUTL;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-9,-9);ctx.bezierCurveTo(-13,-11,-10,-15,-13,-15);ctx.stroke();}
  // chân ngắn
  for(const [lx,o] of [[-5,1],[4,-1]]){bPath(()=>ctx.roundRect(lx-2.2,-6+(moving?step*o*1.4:0),4.4,6,2),D);}
  // thân
  bPath(()=>ctx.ellipse(0,-9,9.5,7,0,0,6.29),vGrad(-16,-2,L2,C,D),OUTL,1);
  bPath(()=>ctx.ellipse(1,-6.5,5.5,3.5,0,0,6.29),K==='boar'?shade(C,.25):'#fff6ec',false);
  for(const [lx,o] of [[-2,-1],[6,1]]){bPath(()=>ctx.roundRect(lx-2.3,-5+(moving?step*o*1.4:0),4.6,5.6,2.2),C);}
  // đầu to
  ctx.save();ctx.translate(6,-20);ctx.rotate(atk>0?0.15:Math.sin(t*1.7)*0.05);
  if(K==='boar'){bPath(()=>ctx.ellipse(0,0,10,9,0,0,6.29),vGrad(-9,9,L2,C,D),OUTL,1);
    for(const ex of [-6,6])bPath(()=>{ctx.moveTo(ex-3,-6);ctx.lineTo(ex*1.25,-12);ctx.lineTo(ex+3,-7);ctx.closePath();},D);
    bPath(()=>ctx.ellipse(5,3,4.5,3.6,0,0,6.29),'#f0a8a0');ctx.fillStyle='#7a3a3a';ctx.beginPath();ctx.ellipse(3.6,3,.8,1.1,0,0,6.29);ctx.ellipse(6.4,3,.8,1.1,0,0,6.29);ctx.fill();
    for(const tx of [1,9])bPath(()=>{ctx.moveTo(tx,5.5);ctx.quadraticCurveTo(tx+1,9,tx+2.5,8);ctx.lineTo(tx+1.5,5.5);ctx.closePath();},'#fffbe8',OUTL,.6);
    chibiEyes(0,-2,1.9,'#8a5a3a',1.3);}
  else{const earC=K==='fox'?C:L2;
    for(const ex of [-6,5])bPath(()=>{ctx.moveTo(ex-3.5,-5);ctx.lineTo(ex,-15);ctx.lineTo(ex+4,-5);ctx.closePath();},earC);
    for(const ex of [-6,5])bPath(()=>{ctx.moveTo(ex-1.8,-6);ctx.lineTo(ex,-12);ctx.lineTo(ex+2.2,-6);ctx.closePath();},'#f6c0c8',false);
    bPath(()=>ctx.ellipse(0,0,10.5,9,0,0,6.29),vGrad(-9,9,L2,C,D),OUTL,1);
    bPath(()=>{ctx.moveTo(-1,2);ctx.quadraticCurveTo(5,-1,11,3);ctx.quadraticCurveTo(10,8,3,8);ctx.quadraticCurveTo(-2,7,-1,2);},'#fff6ec',false);
    bPath(()=>ctx.ellipse(10,3,1.6,1.2,0,0,6.29),'#2a1a1a',false);
    if(atk>0){bPath(()=>ctx.ellipse(6,6.5,2.4,1.6,0,0,6.29),'#c03040',false);}
    else{ctx.strokeStyle='#2a1a1a';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(7,6);ctx.quadraticCurveTo(8,7.4,9.4,6);ctx.stroke();}
    chibiEyes(0,-1.5,2,K==='fox'?'#ffb040':'#6ab0ff',2.1);}
  ctx.restore();}
function petSpirit(C,t,div){const fl=Math.sin(t*2.6)*2.5;ctx.translate(0,-6+fl);
  const g=ctx.createRadialGradient(0,-12,1,0,-12,20);g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(1,C+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-12,20,0,6.29);ctx.fill();
  bPath(()=>{ctx.moveTo(0,-30);ctx.bezierCurveTo(9,-20,12,-12,10,-6);ctx.bezierCurveTo(8,0,-8,0,-10,-6);ctx.bezierCurveTo(-12,-12,-9,-20,0,-30);},vGrad(-30,0,'#ffffff',C,shade(C,-.35)),'rgba(30,60,90,.6)',1);
  ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.ellipse(-4,-19,2.2,4,-.4,0,6.29);ctx.fill();
  ctx.save();ctx.translate(1,-9);chibiEyes(0,0,1.7,'#3a8ad0',0.7);ctx.restore();
  ctx.strokeStyle='#2a3a5a';ctx.lineWidth=.9;ctx.beginPath();ctx.arc(1,-5.5,1.6,0.2,Math.PI-0.2);ctx.stroke();
  for(let i=0;i<3;i++){const a=t*2+i*2.09,r=15;ctx.fillStyle=i%2?'#ffffff':C;ctx.beginPath();ctx.arc(Math.cos(a)*r,-12+Math.sin(a)*r*.4,1.6,0,6.29);ctx.fill();}}
function petSnake(C,D,L2,t,moving,atk){const w=Math.sin(t*(moving?8:2.5));
  for(let i=4;i>=0;i--){const x=-10+i*4.2+Math.sin(t*4+i)*(moving?1.4:.5),y=-4-i*1.2,r=5.5-i*.35;bPath(()=>ctx.ellipse(x,y,r+1,r,0,0,6.29),vGrad(y-r,y+r,L2,C,D),OUTL,.9);
    ctx.fillStyle=shade(C,.5)+'aa';ctx.beginPath();ctx.ellipse(x,y+r*.45,r*.6,r*.3,0,0,6.29);ctx.fill();}
  ctx.save();ctx.translate(9,-17+w*.8);ctx.rotate(atk>0?0.25:0);
  bPath(()=>ctx.ellipse(0,0,9,7.5,0,0,6.29),vGrad(-7,7,L2,C,D),OUTL,1);
  ctx.fillStyle=shade(C,.45);ctx.beginPath();ctx.ellipse(2,3.5,5,2.6,0,0,6.29);ctx.fill();
  chibiEyes(.5,-1.5,1.9,'#ffd040',1.7);
  if(atk>0||((t*1.3)%2.2)<0.25){ctx.strokeStyle='#e0304a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(8,3);ctx.lineTo(13,3.5);ctx.lineTo(15,2);ctx.moveTo(13,3.5);ctx.lineTo(15,5);ctx.stroke();}
  bPath(()=>{ctx.moveTo(-3,-6.5);ctx.lineTo(-1,-11);ctx.lineTo(1.5,-7);ctx.closePath();},'#ffd23f',OUTL,.6);
  ctx.restore();}
