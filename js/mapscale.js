'use strict';
// ===================== BẢN ĐỒ RỘNG GẤP NHIỀU LẦN =====================
// Giãn mọi bản đồ thêm MAP_GROW lần mỗi chiều (diện tích ×MAP_GROW²).
// Làng an toàn và võ đài GIỮ NGUYÊN kích thước, chỉ dời theo tâm; các khu quái, đường, hồ, núi, cổng truyền tống thì giãn ra.
const MAP_GROW=2;
function growMap(id,f){const M=MAPS[id],g=M.gen;if(!g||M.pb||g._grown)return;g._grown=true;const sz=g.size||[64,48];
  const box=(b,pad)=>b&&{x0:b.x0-pad,y0:b.y0-pad,x1:b.x1+pad,y1:b.y1+pad,dx:Math.round(((b.x0+b.x1)/2)*(f-1)),dy:Math.round(((b.y0+b.y1)/2)*(f-1))};
  const SB=box(g.safe,2),AB=box(g.arena,2),inB=(B,x,y)=>B&&x>=B.x0&&x<=B.x1&&y>=B.y0&&y<=B.y1;
  // điểm trong làng / võ đài: dời nguyên khối; ngoài ra: giãn
  const P=(x,y,half)=>{if(inB(SB,x,y))return[x+SB.dx,y+SB.dy];if(inB(AB,x,y))return[x+AB.dx,y+AB.dy];const k=half?v=>Math.round(v*f*2)/2:v=>Math.round(v*f);return[k(x),k(y)];};
  g.size=[Math.round(sz[0]*f),Math.round(sz[1]*f)];if(g.river)g.river.x=Math.round(g.river.x*f);
  g.lakes=(g.lakes||[]).map(([x,y,w,h])=>[Math.round(x*f),Math.round(y*f),Math.round(w*f),Math.round(h*f)]);
  const mvBox=(b,B)=>{if(!b)return;b.x0+=B.dx;b.x1+=B.dx;b.y0+=B.dy;b.y1+=B.dy;};
  if(g.safe){const s=g.safe;s.gates=(s.gates||[]).map(([side,a,b])=>side==='n'||side==='s'?[side,a+SB.dx,b+SB.dx]:[side,a+SB.dy,b+SB.dy]);mvBox(s,SB);}
  if(g.arena){const A=g.arena;if(A.gap)A.gap=A.gap[0]==='n'||A.gap[0]==='s'?[A.gap[0],A.gap[1]+AB.dx,A.gap[2]+AB.dx]:[A.gap[0],A.gap[1]+AB.dy,A.gap[2]+AB.dy];mvBox(A,AB);}
  g.houses=(g.houses||[]).map(([x,y])=>[x+SB.dx,y+SB.dy]);if(g.well)g.well=[g.well[0]+SB.dx,g.well[1]+SB.dy];
  // đường: mỗi đầu mút dời/giãn riêng, nên đường vẫn nối đúng cổng làng
  g.roads=(g.roads||[]).map(([x0,y0,x1,y1])=>{const a=P(x0,y0),b=P(x1,y1);return[a[0],a[1],b[0],b[1]];});
  if(M.revive)M.revive=P(M.revive[0],M.revive[1],true);
  for(const k in M.zones){const z=M.zones[k],p=P(z.x,z.y);z.x=p[0];z.y=p[1];if(z.r)z.r=Math.round(z.r*1.35);if(z.n>1)z.n=Math.round(z.n*1.6);}
  if(M.herbs)M.herbs.zones.forEach(z=>{const p=P(z.x,z.y);z.x=p[0];z.y=p[1];z.n=Math.round(z.n*1.5);});
  (M.regions||[]).forEach(r=>{if(typeof r!=='object')return;const p=P(r.x,r.y);r.x=p[0];r.y=p[1];r.r=Math.round(r.r*f*0.8);});
  M.npcs.forEach(n=>{const p=P(n.x,n.y,true);n.x=p[0];n.y=p[1];});
  M.portals.forEach(p=>{const q=P(p.x,p.y,true);p.x=q[0];p.y=q[1];});
  for(const o in MAPS)for(const p of MAPS[o].portals)if(p.to===id&&p.tx!=null){const q=P(p.tx,p.ty,true);p.tx=q[0];p.ty=q[1];}}
for(const id in MAPS)growMap(id,MAP_GROW);
for(const id in MAPS)for(const n of MAPS[id].npcs)NPC_INDEX[n.id]=Object.assign({map:id},n);
