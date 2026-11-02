'use strict';
// ===================== ÁNH SÁNG & KHÔNG KHÍ =====================
// Bản đồ thường: sáng sủa, có nắng chéo từ góc trên trái, tia nắng, bướm bay, chim bay ngang trời.
// Bản đồ u tối theo bối cảnh (U Minh, Huyết Hải, Hỗn Nguyên): tối hẳn, chỉ sáng quanh nhân vật và đèn đuốc.
const DARK_THEMES=['dark','blood','void'];
const isDarkMap=()=>DARK_THEMES.includes(CM.theme);
const BFLY_THEMES=['spring','marsh','jade','wild','heaven','sea','snow'];
const AMB={bfly:[],birds:[],birdT:6,dustT:0};
function ambientWorld(dt,cx,cy,vw,vh,withEnt){if(!withEnt)return;
  // bụi dưới chân khi chạy
  AMB.dustT-=dt;if(player.moving&&!player.flying&&!player.dead&&AMB.dustT<=0){AMB.dustT=player.riding?0.07:0.14;
    const col=TH.snow||CM.theme==='snow'?'rgba(255,255,255,.8)':'rgba(190,160,120,.7)';fx.push({k:'p',x:player.x+rnd(-6,6),y:player.y-rnd(0,2),vx:rnd(-14,14),vy:-rnd(4,14),col,t:0,life:0.45,sz:rnd(1.6,2.8)});}
  // bướm
  if(!isDarkMap()&&BFLY_THEMES.includes(CM.theme)){
    while(AMB.bfly.length<9)AMB.bfly.push({x:cx+rnd(0,vw),y:cy+rnd(0,vh),ph:rnd(0,6),c:['#ffe27a','#ff9ad8','#9fe0ff','#ffffff','#ffb060'][rint(0,4)],tx:0,ty:0,t:0});
    for(const b of AMB.bfly){b.t-=dt;if(b.t<=0){b.t=rnd(1.5,4);b.tx=b.x+rnd(-90,90);b.ty=b.y+rnd(-60,60);}
      b.x+=(b.tx-b.x)*dt*0.6+Math.sin(nowT*3+b.ph)*12*dt;b.y+=(b.ty-b.y)*dt*0.6+Math.cos(nowT*4.3+b.ph)*10*dt;
      if(b.x<cx-60||b.x>cx+vw+60||b.y<cy-60||b.y>cy+vh+60){b.x=cx+rnd(0,vw);b.y=cy+rnd(0,vh);b.tx=b.x;b.ty=b.y;}
      const f=Math.abs(Math.sin(nowT*16+b.ph)),hy=b.y-16-Math.sin(nowT*2+b.ph)*4;
      ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.ellipse(b.x+4,b.y+2,3,1.2,0,0,6.29);ctx.fill();
      ctx.fillStyle=b.c;for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(b.x+s*2.4*f,hy-1,2.8*f+.4,3.4,s*0.5,0,6.29);ctx.fill();ctx.beginPath();ctx.ellipse(b.x+s*1.8*f,hy+2,1.8*f+.3,2.2,-s*0.4,0,6.29);ctx.fill();}
      ctx.fillStyle='#2a1a10';ctx.fillRect(b.x-.5,hy-2.5,1,5);}}
  else AMB.bfly.length=0;}
function ambientPost(dt,cx,cy,withEnt){const dark=isDarkMap();
  if(dark){ctx.fillStyle=TH.tint;ctx.fillRect(0,0,VW,VH);
    if(withEnt){const px=(player.x-cx)*Z,py=(player.y-16-cy)*Z,r0=90*Z,r1=360*Z,g=ctx.createRadialGradient(px,py,r0,px,py,r1);
      g.addColorStop(0,'rgba(4,0,12,0)');g.addColorStop(1,'rgba(4,0,12,.62)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
      // đèn lồng, đuốc trong bóng tối
      ctx.save();ctx.globalCompositeOperation='lighter';for(const [lx,ly] of LIGHTS.concat(TORCHES)){const X=(lx*T-cx)*Z,Y=(ly*T-12-cy)*Z;if(X<-200||Y<-200||X>VW+200||Y>VH+200)continue;
        const r=110*Z,g2=ctx.createRadialGradient(X,Y,2,X,Y,r);g2.addColorStop(0,'rgba(255,170,80,.28)');g2.addColorStop(1,'rgba(255,170,80,0)');ctx.fillStyle=g2;ctx.fillRect(X-r,Y-r,r*2,r*2);}ctx.restore();}
    ctx.drawImage(vignette,0,0,VW,VH);return;}
  // sáng sủa: chỉ ám nhẹ màu vùng
  ctx.globalAlpha=.45;ctx.fillStyle=TH.tint;ctx.fillRect(0,0,VW,VH);ctx.globalAlpha=1;
  ctx.save();ctx.globalCompositeOperation='screen';
  let g=ctx.createRadialGradient(-VW*0.05,-VH*0.15,10,-VW*0.05,-VH*0.15,Math.max(VW,VH)*1.15);g.addColorStop(0,'rgba(255,246,220,.30)');g.addColorStop(.5,'rgba(255,240,210,.10)');g.addColorStop(1,'rgba(255,240,210,0)');ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  // tia nắng chéo
  const sh=nowT*6;for(let i=0;i<4;i++){const x0=((i*VW*0.38+sh*(i%2?1:0.6))%(VW*1.6))-VW*0.3,w=60+i*35,a=0.05+0.025*Math.sin(nowT*0.5+i);
    const lg=ctx.createLinearGradient(x0,0,x0+w,0);lg.addColorStop(0,'rgba(255,250,220,0)');lg.addColorStop(.5,`rgba(255,250,220,${a})`);lg.addColorStop(1,'rgba(255,250,220,0)');
    ctx.fillStyle=lg;ctx.beginPath();ctx.moveTo(x0,0);ctx.lineTo(x0+w,0);ctx.lineTo(x0+w-VH*0.55,VH);ctx.lineTo(x0-VH*0.55,VH);ctx.closePath();ctx.fill();}
  ctx.restore();
  // chim bay ngang trời (cả bóng dưới đất)
  if(withEnt&&CM.theme!=='star'){AMB.birdT-=dt;if(AMB.birdT<=0&&!AMB.birds.length){AMB.birdT=rnd(14,30);const n=rint(4,7),y0=rnd(VH*0.1,VH*0.5),dir=Math.random()<.5?1:-1;
      for(let i=0;i<n;i++)AMB.birds.push({x:dir>0?-40-i*18:VW+40+i*18,y:y0+Math.abs(i-n/2)*10,dir,ph:rnd(0,6)});}
    for(const b of AMB.birds){b.x+=b.dir*90*dt;const f=Math.sin(nowT*9+b.ph)*4;
      ctx.fillStyle='rgba(0,0,0,.10)';ctx.beginPath();ctx.ellipse(b.x+40,b.y+120,5,2,0,0,6.29);ctx.fill();
      ctx.strokeStyle='rgba(40,40,50,.75)';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(b.x-7,b.y-f);ctx.quadraticCurveTo(b.x-3,b.y-2,b.x,b.y);ctx.quadraticCurveTo(b.x+3,b.y-2,b.x+7,b.y-f);ctx.stroke();}
    AMB.birds=AMB.birds.filter(b=>b.x>-200&&b.x<VW+200);}
  ctx.globalAlpha=.4;ctx.drawImage(vignette,0,0,VW,VH);ctx.globalAlpha=1;}
// bóng đổ có hướng (nắng từ trên trái → bóng ngả xuống phải)
drawShadow=function(x,y,w,a=0.3){const ox=isDarkMap()?0:w*0.22,g=ctx.createRadialGradient(x+ox,y+1,1,x+ox,y+1,w*1.15);g.addColorStop(0,`rgba(0,0,0,${a*1.1})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x+ox,y+1,w*1.15,w*0.42,isDarkMap()?0:0.12,0,Math.PI*2);ctx.fill();};
