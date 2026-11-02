'use strict';
// ===================== GÓC NHÌN NGHIÊNG (giả 3D) =====================
// Cả thế giới được vẽ ra một tấm phụ, rồi chiếu lên màn hình theo từng dải ngang: dải dưới (gần) giữ nguyên,
// dải trên (xa) thu nhỏ dần -> như camera nghiêng nhìn chéo xuống mặt đất. Phía xa có sương mờ.
// Tắt/bật trong Cài đặt ("Góc nhìn 3D").
const TILT={stop:0.7,N:44,off:null,octx:null,strips:[],ws:0,hs:0,key:''};
const tiltOn=()=>{try{return localStorage.getItem('tk_tilt')!=='0';}catch(e){return true;}};
function tiltSetup(){const key=VW+'x'+VH+'x'+DPR;if(key===TILT.key&&TILT.off)return;TILT.key=key;
  const N=TILT.N,S=[];let acc=0;
  for(let i=N-1;i>=0;i--){const v0=i*VH/N,v1=(i+1)*VH/N,t=(v0+v1)/2/VH,k=TILT.stop+(1-TILT.stop)*Math.pow(t,1.15),hs=(v1-v0)/k;acc+=hs;S[i]={v0,v1,k,hs,bot:acc};}
  TILT.hs=acc;TILT.ws=VW/TILT.stop;for(const s of S)s.sy=acc-s.bot;TILT.strips=S;
  TILT.off=document.createElement('canvas');TILT.off.width=Math.ceil(TILT.ws*DPR);TILT.off.height=Math.ceil(TILT.hs*DPR);TILT.octx=TILT.off.getContext('2d');}
function tiltSrc(sx,sy){const S=TILT.strips,N=TILT.N,i=clamp(Math.floor(sy/VH*N),0,N-1),s=S[i];
  return{x:(TILT.ws-VW/s.k)/2+sx/s.k,y:s.sy+(sy-s.v0)/(s.v1-s.v0)*s.hs};}
const _drawFlat=draw;
draw=function(dt){if(!tiltOn())return _drawFlat(dt);tiltSetup();
  const vw=TILT.ws/Z,vh=TILT.hs/Z,ps=tiltSrc(VW/2,VH*0.6);
  cam.x=MW*T<vw?(MW*T-vw)/2:clamp(player.x-ps.x/Z,0,MW*T-vw);
  cam.y=MH*T<vh?(MH*T-vh)/2:clamp(player.y-ps.y/Z,0,MH*T-vh);
  const sv={c:ctx,w:VW,h:VH};ctx=TILT.octx;VW=TILT.ws;VH=TILT.hs;
  try{ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0b0b0b';ctx.fillRect(0,0,TILT.off.width,TILT.off.height);drawWorld(dt,cam.x,cam.y,true);}
  finally{ctx=sv.c;VW=sv.w;VH=sv.h;}
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0b0b0b';ctx.fillRect(0,0,cv.width,cv.height);ctx.imageSmoothingEnabled=true;
  for(const s of TILT.strips){const sw=VW/s.k,sx=(TILT.ws-sw)/2;ctx.drawImage(TILT.off,sx*DPR,s.sy*DPR,sw*DPR,s.hs*DPR,0,Math.floor(s.v0*DPR),cv.width,Math.ceil((s.v1-s.v0)*DPR)+1);}
  // sương phía xa
  ctx.setTransform(DPR,0,0,DPR,0,0);const dark=typeof isDarkMap==='function'&&isDarkMap(),g=ctx.createLinearGradient(0,0,0,VH*0.5);
  const hz=dark?'8,2,18':CM.theme==='volcano'?'60,24,12':CM.theme==='snow'?'235,242,255':CM.theme==='desert'?'255,236,200':CM.theme==='star'?'40,30,80':'225,238,255';
  g.addColorStop(0,`rgba(${hz},${dark?.6:.42})`);g.addColorStop(1,`rgba(${hz},0)`);ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH*0.5);
  if(fadeT>0){ctx.fillStyle=`rgba(255,255,255,${Math.min(1,fadeT/0.7)*0.85})`;ctx.fillRect(0,0,VW,VH);}
  drawMini();};
const _toWorldFlat=toWorld;
toWorld=(sx,sy)=>{if(!tiltOn()||!TILT.off)return _toWorldFlat(sx,sy);const s=tiltSrc(sx,sy);return{x:s.x/Z+cam.x,y:s.y/Z+cam.y};};
// ô cài đặt
(()=>{const m=$('optMusic');if(!m)return;const row=document.createElement('div');row.className='setrow';row.innerHTML='<span>Góc nhìn 3D (nghiêng)</span><input type="checkbox" id="optTilt">';
  m.parentNode.parentNode.insertBefore(row,m.parentNode);const c=$('optTilt');c.checked=tiltOn();
  c.onchange=()=>{try{if(c.checked)localStorage.removeItem('tk_tilt');else localStorage.setItem('tk_tilt','0');}catch(e){}sfx('click');};})();
