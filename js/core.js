'use strict';
// ===================== TIỆN ÍCH CHUNG =====================
const $=id=>document.getElementById(id);
const cv=$('c');
let ctx=cv.getContext('2d');
let VW=0,VH=0,Z=1,DPR=1,vignette=null;
function resize(){
  DPR=Math.min(2,window.devicePixelRatio||1);VW=innerWidth;VH=innerHeight;
  cv.width=Math.round(VW*DPR);cv.height=Math.round(VH*DPR);cv.style.width=VW+'px';cv.style.height=VH+'px';
  Z=VH>=1000?1.7:VH>=780?1.5:VH>=560?1.25:1;
  vignette=document.createElement('canvas');vignette.width=Math.max(1,VW>>1);vignette.height=Math.max(1,VH>>1);
  const g=vignette.getContext('2d'),w=vignette.width,h=vignette.height,r=g.createRadialGradient(w/2,h/2,Math.min(w,h)*0.42,w/2,h/2,Math.max(w,h)*0.75);
  r.addColorStop(0,'rgba(0,0,0,0)');r.addColorStop(1,'rgba(12,6,24,.5)');g.fillStyle=r;g.fillRect(0,0,w,h);
}
addEventListener('resize',resize);resize();

let seed=1;
const srand=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};
const rnd=(a,b)=>a+Math.random()*(b-a),rint=(a,b)=>Math.floor(rnd(a,b+1));
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

// ===================== BẢN ĐỒ HIỆN TẠI =====================
const T=32;let MW=64,MH=48; // kích thước đổi theo bản đồ (gen.size)
const G=0,TR=1,WA=2,PA=3,RO=4,HO=5,FL=6,FE=7,BR=8,DK=9;
const BLK=[0,1,1,0,1,1,0,1,0,0];
let map=new Uint8Array(MW*MH);
let reach=new Uint8Array(MW*MH);
let curMapId='trukhe',CM=MAPS.trukhe,TH=THEMES.spring;
let SAFE={x0:3,y0:3,x1:16,y1:15},LIGHTS=[],TORCHES=[],FLAGS=[];
const idx=(x,y)=>y*MW+x;
const getT=(x,y)=>(x<0||y<0||x>=MW||y>=MH)?TR:map[idx(x,y)];
const setT=(x,y,t)=>{if(x>=0&&y>=0&&x<MW&&y<MH)map[idx(x,y)]=t;};
const blocked=(x,y)=>BLK[getT(x,y)]===1;
const walkable=(x,y)=>!blocked(Math.floor(x/T),Math.floor(y/T));
const canStand=(x,y)=>walkable(x-7,y-4)&&walkable(x+7,y-4)&&walkable(x-7,y+4)&&walkable(x+7,y+4);
const inSafe=o=>{const tx=o.x/T,ty=o.y/T;return tx>=SAFE.x0&&tx<SAFE.x1+1&&ty>=SAFE.y0&&ty<SAFE.y1+1;};
const revivePos=()=>({x:CM.revive[0]*T,y:CM.revive[1]*T});

function genMap(def){const sz=def.gen.size;MW=sz?sz[0]:64;MH=sz?sz[1]:48;map=new Uint8Array(MW*MH);
  const g=def.gen;seed=g.seed;map.fill(G);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(x<2||y<2||x>=MW-2||y>=MH-2)setT(x,y,TR);
  if(g.river)for(let y=0;y<MH;y++){const cx=Math.round(g.river.x+Math.sin(y*0.25)*2.5+Math.sin(y*0.07+1)*2);for(let d=-1;d<=1;d++)setT(cx+d,y,WA);}
  for(const [cx,cy,rx,ry] of g.lakes){const ph=srand()*6;
    for(let y=cy-ry-2;y<=cy+ry+2;y++)for(let x=cx-rx-2;x<=cx+rx+2;x++){const a=Math.atan2(y-cy,x-cx),k=1+0.16*Math.sin(a*3+ph);if(((x-cx)/(rx*k))**2+((y-cy)/(ry*k))**2<=1)setT(x,y,WA);}}
  const S=g.safe;SAFE={x0:S.x0,y0:S.y0,x1:S.x1,y1:S.y1};
  for(let y=S.y0;y<=S.y1;y++)for(let x=S.x0;x<=S.x1;x++){const e=x===S.x0||x===S.x1||y===S.y0||y===S.y1;setT(x,y,e?FE:FL);}
  LIGHTS=[];
  for(const [side,a,b] of S.gates){for(let k=a;k<=b;k++){if(side==='e')setT(S.x1,k,FL);else if(side==='w')setT(S.x0,k,FL);else if(side==='n')setT(k,S.y0,FL);else setT(k,S.y1,FL);}
    if(side==='e')LIGHTS.push([S.x1-0.5,a-0.6],[S.x1-0.5,b+1.6]);else if(side==='w')LIGHTS.push([S.x0+1.5,a-0.6],[S.x0+1.5,b+1.6]);
    else if(side==='n')LIGHTS.push([a-0.6,S.y0+1.4],[b+1.6,S.y0+1.4]);else LIGHTS.push([a-0.6,S.y1-0.6],[b+1.6,S.y1-0.6]);}
  for(const [hx,hy] of g.houses)for(let y=0;y<3;y++)for(let x=0;x<3;x++)setT(hx+x,hy+y,HO);
  const A=g.arena;TORCHES=[];FLAGS=[];
  if(A){for(let y=A.y0;y<=A.y1;y++)for(let x=A.x0;x<=A.x1;x++){
      let wall=(x===A.x0)||(x===A.x1&&A.x1<MW-3)||(y===A.y0&&A.y0>2)||(y===A.y1&&A.y1<MH-3);
      const [gs,g0,g1]=A.gap;if((gs==='w'&&x===A.x0||gs==='e'&&x===A.x1)&&y>=g0&&y<=g1)wall=false;if((gs==='n'&&y===A.y0||gs==='s'&&y===A.y1)&&x>=g0&&x<=g1)wall=false;
      setT(x,y,wall?RO:DK);}
    TORCHES=[[A.x0+1,A.y0+1],[A.x0+1,A.y1-2],[A.x1-2,A.y0+1]];FLAGS=[[A.x0+3,A.y0+2],[A.x1-3,A.y0+2],[A.x0+3,A.y1-1]];}
  const road=(x,y)=>{const t=getT(x,y);if(t===WA)setT(x,y,BR);else if(t===G||t===TR)setT(x,y,PA);};
  for(const [x0,y0,x1,y1] of g.roads){for(let x=Math.min(x0,x1);x<=Math.max(x0,x1);x++)road(x,y0);for(let y=Math.min(y0,y1);y<=Math.max(y0,y1);y++)road(x1,y);}
  for(const p of def.portals){const px=Math.floor(p.x),py=Math.floor(p.y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const t=getT(px+dx,py+dy);if(t===G||t===TR&&px+dx>=2&&py+dy>=2&&px+dx<MW-2&&py+dy<MH-2)setT(px+dx,py+dy,G);}if(getT(px,py)!==FL)setT(px,py,PA);}
  const zl=Object.values(def.zones).concat(def.herbs.zones);
  const nearZone=(x,y,pad)=>zl.some(z=>Math.hypot(x-z.x,y-z.y)<z.r+pad)||def.portals.some(p=>Math.hypot(x-p.x,y-p.y)<2.5);
  for(let y=2;y<MH-2;y++)for(let x=2;x<MW-2;x++){
    if(getT(x,y)!==G)continue;
    let dens=nearZone(x,y,1)?0.025:g.dens;
    if(getT(x+1,y)===PA||getT(x-1,y)===PA||getT(x,y+1)===PA||getT(x,y-1)===PA)dens*=0.3;
    const r=srand();if(r<dens*0.75)setT(x,y,TR);else if(r<dens)setT(x,y,RO);
  }
  for(let k=0;k<16;k++){
    const cx=2+Math.floor(srand()*(MW-4)),cy=2+Math.floor(srand()*(MH-4));
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
      const x=cx+dx,y=cy+dy;
      if(getT(x,y)!==G||nearZone(x,y,2))continue;
      if(x>=S.x0-2&&x<=S.x1+2&&y>=S.y0-2&&y<=S.y1+2)continue;
      if(srand()<0.5)setT(x,y,TR);
    }
  }
  reach=new Uint8Array(MW*MH);
  const st=[idx(Math.floor(def.revive[0]),Math.floor(def.revive[1]))];reach[st[0]]=1;
  while(st.length){const c=st.pop(),x=c%MW,y=(c/MW)|0;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(blocked(nx,ny))continue;const ni=idx(nx,ny);if(reach[ni])continue;reach[ni]=1;st.push(ni);}}
  for(let i=0;i<MW*MH;i++)if(!reach[i]&&map[i]===G)map[i]=TR;
}

// ===================== TÌM ĐƯỜNG =====================
function nearestFree(tx,ty){let best=null,bd=1e9;for(let r=1;r<5&&!best;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const x=tx+dx,y=ty+dy;if(!blocked(x,y)&&reach[idx(x,y)]){const d=dx*dx+dy*dy;if(d<bd){bd=d;best=[x,y];}}}return best;}
function findPath(sx,sy,tx,ty){
  if(blocked(tx,ty)){const f=nearestFree(tx,ty);if(!f)return null;[tx,ty]=f;}
  if(blocked(sx,sy)){const f=nearestFree(sx,sy);if(f)[sx,sy]=f;}
  const N=MW*MH,start=idx(sx,sy),goal=idx(tx,ty);
  if(start===goal)return[];
  const g=new Float32Array(N).fill(Infinity),came=new Int32Array(N).fill(-1),closed=new Uint8Array(N),heap=[];
  const push=(f,i)=>{heap.push([f,i]);let k=heap.length-1;while(k>0){const q=(k-1)>>1;if(heap[q][0]<=heap[k][0])break;[heap[q],heap[k]]=[heap[k],heap[q]];k=q;}};
  const pop=()=>{const top=heap[0],l=heap.pop();if(heap.length){heap[0]=l;let k=0;for(;;){const a=2*k+1,b=a+1;let m=k;if(a<heap.length&&heap[a][0]<heap[m][0])m=a;if(b<heap.length&&heap[b][0]<heap[m][0])m=b;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];k=m;}}return top;};
  const h=i=>{const dx=Math.abs(i%MW-tx),dy=Math.abs(((i/MW)|0)-ty);return Math.max(dx,dy)+0.414*Math.min(dx,dy);};
  g[start]=0;push(h(start),start);let it=0;
  while(heap.length&&it++<40000){const cur=pop()[1];if(cur===goal)break;if(closed[cur])continue;closed[cur]=1;const cx=cur%MW,cy=(cur/MW)|0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;if(blocked(nx,ny))continue;
      if(dx&&dy&&(blocked(cx+dx,cy)||blocked(cx,cy+dy)))continue;const ni=idx(nx,ny);if(closed[ni])continue;
      const ng=g[cur]+(dx&&dy?1.414:1);if(ng<g[ni]){g[ni]=ng;came[ni]=cur;push(ng+h(ni),ni);}}}
  if(came[goal]<0)return null;
  const out=[];for(let c=goal;c!==start;c=came[c])out.push({x:(c%MW)*T+T/2,y:((c/MW)|0)*T+T/2});return out.reverse();
}
function los(ax,ay,bx,by){const d=Math.hypot(bx-ax,by-ay),n=Math.ceil(d/8);for(let i=1;i<=n;i++){const x=ax+(bx-ax)*i/n,y=ay+(by-ay)*i/n;if(!canStand(x,y))return false;}return true;}
function smooth(pts,sx,sy){const out=[];let cx=sx,cy=sy,i=0;while(i<pts.length){let j=pts.length-1;while(j>i&&!los(cx,cy,pts[j].x,pts[j].y))j--;out.push(pts[j]);cx=pts[j].x;cy=pts[j].y;i=j+1;}return out;}
function pathPts(ax,ay,bx,by){
  if(los(ax,ay,bx,by))return[{x:bx,y:by}];
  const raw=findPath(Math.floor(ax/T),Math.floor(ay/T),Math.floor(bx/T),Math.floor(by/T));
  if(!raw)return null;
  if(raw.length&&canStand(bx,by)&&Math.floor(bx/T)===Math.floor(raw[raw.length-1].x/T)&&Math.floor(by/T)===Math.floor(raw[raw.length-1].y/T))raw[raw.length-1]={x:bx,y:by};
  return smooth(raw,ax,ay);
}
function followPath(e,spd,dt){
  if(!e.path.length){e.moving=false;return;}
  const p=e.path[0],dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy),s=spd*dt;
  if(Math.abs(dx)>1)e.face=dx>0?1:-1;
  if(d>0.5)e.dir=Math.abs(dy)>Math.abs(dx)*1.3?(dy>0?'down':'up'):'side';
  if(d<=s){e.x=p.x;e.y=p.y;e.path.shift();}else{e.x+=dx/d*s;e.y+=dy/d*s;}
  e.moving=true;
}
function freeSpot(cx,cy,r0){for(let k=0;k<180;k++){const r=r0*(1+Math.floor(k/60)),x=Math.round(cx+rnd(-r,r)),y=Math.round(cy+rnd(-r,r));if(blocked(x,y)||!reach[idx(x,y)])continue;const o={x:x*T+T/2,y:y*T+T/2};if(inSafe(o))continue;return o;}return{x:cx*T+T/2,y:cy*T+T/2};}
