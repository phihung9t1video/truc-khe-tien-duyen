'use strict';
// ===================== CÂY CỔ THỤ CÓ BÓNG RÂM =====================
// Cây lớn mọc ở bãi cỏ trống: tán lá vẽ phủ lên trên nhân vật/quái (đứng dưới tán thì tán mờ đi để thấy mình),
// bóng râm dưới đất có đốm nắng lọt qua kẽ lá lay động, thân cây che trước–sau như vật thật. Đi xuyên qua được.
let BIGTREES=[],BT_SPR=[];
const BT_PAL={
  spring:[['#2f6a2a','#4a9a3a','#8ad05a'],['#b04a7a','#e88ab8','#ffd0e8']],marsh:[['#24563a','#3a8a5a','#7ac88a']],snow:[['#3a5a5a','#5a8a80','#f4fbff']],
  desert:[['#5a6a2a','#8a9a3a','#c8d070']],dark:[['#2a1e3a','#4a3a6a','#8a6ab8']],heaven:[['#3a7a6a','#7ac8a8','#e8fff4'],['#b08ad8','#d8c0ff','#fff']],
  volcano:[['#3a1a10','#7a2a10','#ff8a3a']],sea:[['#1e5a5a','#3a9a8a','#9ff0d8']],star:[['#2a2a5a','#5a5aa8','#c8c0ff']]};
function btPal(){const k=(TH&&TH.art)||CM.theme;return BT_PAL[k]||BT_PAL[{wild:'desert',blood:'volcano',thunder:'heaven',jade:'marsh',void:'star'}[k]]||BT_PAL.spring;}
// tán lá vẽ sẵn
function btMakeSpr(pal,R,seed){const c=document.createElement('canvas');c.width=c.height=Math.ceil(R*2.4);const g=c.getContext('2d'),cx=c.width/2,cy=c.height/2;let s=seed;const rr=()=>(s=(s*16807)%2147483647)/2147483647;
  const blob=(x,y,r,col)=>{const gr=g.createRadialGradient(x-r*.3,y-r*.35,r*.1,x,y,r);gr.addColorStop(0,shadeHex(col,.18));gr.addColorStop(1,shadeHex(col,-.2));g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,6.29);g.fill();};
  for(let i=0;i<14;i++){const a=rr()*6.29,d=rr()*R*.62;blob(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.8+R*.08,R*(.34+rr()*.18),pal[0]);}
  for(let i=0;i<16;i++){const a=rr()*6.29,d=rr()*R*.5;blob(cx+Math.cos(a)*d-R*.06,cy+Math.sin(a)*d*.75-R*.06,R*(.25+rr()*.15),pal[1]);}
  for(let i=0;i<10;i++){const a=-2.2+rr()*1.4,d=rr()*R*.45;blob(cx+Math.cos(a)*d-R*.12,cy+Math.sin(a)*d*.7-R*.14,R*(.12+rr()*.1),pal[2]);}
  g.globalAlpha=.55;g.fillStyle=shadeHex(pal[2],.3);for(let i=0;i<70;i++){const a=rr()*6.29,d=rr()*R*.8;g.beginPath();g.ellipse(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.8,2+rr()*2.5,1.2+rr()*1.2,rr()*3,0,6.29);g.fill();}
  g.globalAlpha=1;g.globalCompositeOperation='source-atop';const sh=g.createLinearGradient(0,cy-R,0,cy+R);sh.addColorStop(0,'rgba(255,255,220,.10)');sh.addColorStop(.6,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.28)');g.fillStyle=sh;g.fillRect(0,0,c.width,c.height);
  return c;}
// đặt cây khi tạo bản đồ (cùng hạt giống nên mọi máy giống nhau)
const _genMapBT=genMap;genMap=function(def){_genMapBT(def);BIGTREES=[];if(def.gen.terrain===false||def.pb)return;let s=(def.gen.seed*7919+13)%2147483647;const rr=()=>(s=(s*16807)%2147483647)/2147483647;
  const S=def.gen.safe,bad=(x,y)=>{if(x<4||y<4||x>=MW-4||y>=MH-4)return true;if(x>=S.x0-3&&x<=S.x1+3&&y>=S.y0-3&&y<=S.y1+3)return true;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const t=getT(x+dx,y+dy);if(t===PA||t===BR||t===HO||t===WA||t===MO||t===CH||t===FL||t===FE)return true;}
    if(def.portals.some(p=>Math.hypot(p.x-x,p.y-y)<5)||def.npcs.some(n=>Math.hypot(n.x-x,n.y-y)<5))return true;return false;};
  const n=Math.round(MW*MH/650);for(let k=0,tries=0;k<n&&tries<n*30;tries++){const x=4+Math.floor(rr()*(MW-8)),y=4+Math.floor(rr()*(MH-8));if(getT(x,y)!==G&&getT(x,y)!==TR||bad(x,y))continue;
    if(BIGTREES.some(b=>Math.hypot(b.x/T-x,b.y/T-y)<7))continue;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(getT(x+dx,y+dy)===TR)setT(x+dx,y+dy,G);
    BIGTREES.push({x:x*T+16,y:y*T+20,r:58+rr()*34,v:Math.floor(rr()*10),ph:rr()*6});k++;}};
const _renderMapBT=renderMap;renderMap=function(){_renderMapBT();const pals=btPal();BT_SPR=[];for(let i=0;i<4;i++)BT_SPR.push(btMakeSpr(pals[i%pals.length],100,1234+i*977));};
// thân cây + bóng râm: chen vào danh sách vẽ theo thứ tự trước–sau
function btTrunk(b){const x=b.x,y=b.y,r=b.r,w=r*.14,h=r*1.05;const g=ctx.createLinearGradient(x-w,0,x+w,0);g.addColorStop(0,'#7a5232');g.addColorStop(.5,'#5a3a20');g.addColorStop(1,'#2e1c0e');
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-w*1.6,y);ctx.quadraticCurveTo(x-w*.8,y-h*.3,x-w*.7,y-h);ctx.lineTo(x+w*.7,y-h);ctx.quadraticCurveTo(x+w*.8,y-h*.3,x+w*1.6,y);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(30,16,6,.45)';ctx.lineWidth=1.2;for(const o of [-.3,.15,.45]){ctx.beginPath();ctx.moveTo(x+w*o,y-2);ctx.quadraticCurveTo(x+w*(o+.2),y-h*.5,x+w*o*.6,y-h);ctx.stroke();}
  ctx.strokeStyle='#5a3a20';ctx.lineWidth=w*.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-w*.3,y-h*.75);ctx.quadraticCurveTo(x-r*.35,y-h*.95,x-r*.5,y-h*1.05);ctx.moveTo(x+w*.3,y-h*.7);ctx.quadraticCurveTo(x+r*.3,y-h*.9,x+r*.45,y-h*1.08);ctx.stroke();}
function btShade(b){const x=b.x+b.r*.18,y=b.y+4,R=b.r*1.05,t=nowT;const g=ctx.createRadialGradient(x,y,R*.1,x,y,R);g.addColorStop(0,'rgba(10,20,8,.38)');g.addColorStop(.7,'rgba(10,20,8,.22)');g.addColorStop(1,'rgba(10,20,8,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,R,R*.55,0,0,6.29);ctx.fill();
  if(typeof isDarkMap==='function'&&isDarkMap())return;ctx.save();ctx.globalCompositeOperation='lighter';for(let i=0;i<9;i++){const a=i*0.7+b.ph,d=R*(.2+((i*37)%60)/100),fx_=x+Math.cos(a)*d,fy=y+Math.sin(a)*d*.5,al=.05+.05*Math.sin(t*1.3+i*2+b.ph);
    ctx.fillStyle=`rgba(255,250,200,${Math.max(0,al)})`;ctx.beginPath();ctx.ellipse(fx_,fy,6+(i%3)*3,3+(i%2)*2,0,0,6.29);ctx.fill();}ctx.restore();}
if(typeof drawOthers==='function'){const _drawOthersBT=drawOthers;drawOthers=function(list){_drawOthersBT(list);const c=cam,vw=VW/Z,vh=VH/Z;
  for(const b of BIGTREES){if(b.x<c.x-200||b.x>c.x+vw+200||b.y<c.y-100||b.y>c.y+vh+260)continue;list.push({y:-1e9,f:()=>btShade(b)});list.push({y:b.y,f:()=>btTrunk(b)});}};}
// tán lá: vẽ sau cùng (trên nhân vật), mờ đi khi nhân vật đứng dưới
if(typeof ambientWorld==='function'){const _ambBT=ambientWorld;ambientWorld=function(dt,cx,cy,vw,vh,withEnt){
  for(const b of BIGTREES){if(b.x<cx-200||b.x>cx+vw+200||b.y<cy-100||b.y>cy+vh+260||!BT_SPR.length)continue;const spr=BT_SPR[b.v%BT_SPR.length],R=b.r,top=b.y-R*1.05-R*.35;
    const under=withEnt&&Math.hypot(player.x-b.x,(player.y-(b.y-R*.6))*1.3)<R*1.05;b.al=(b.al==null?1:b.al)+((under?0.35:0.97)-(b.al==null?1:b.al))*Math.min(1,dt*6);
    ctx.save();ctx.globalAlpha=b.al;ctx.translate(b.x,top);ctx.transform(1,0,Math.sin(nowT*1.1+b.ph)*0.025,1,0,0);const sz=R*2.4*1.15;ctx.drawImage(spr,-sz/2,-sz/2,sz,sz*.9);ctx.restore();}
  _ambBT(dt,cx,cy,vw,vh,withEnt);};}
// bản đồ nhỏ: chấm tán cây lớn
if(typeof drawMini==='function'){const _miniBT=drawMini;drawMini=function(){_miniBT();const k=192/(MW*T);mctx.fillStyle='rgba(30,80,30,.75)';for(const b of BIGTREES){mctx.beginPath();mctx.arc(b.x*k,(b.y-b.r*.6)*k,Math.max(2,b.r*k*.8),0,6.29);mctx.fill();}};}
