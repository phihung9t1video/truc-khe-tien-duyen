// ===================== CHẾ ĐỘ 3D (THỬ NGHIỆM) — TRÚC KHÊ THÔN =====================
// Dùng Three.js (MIT, miễn phí). Luật chơi giữ nguyên; chỉ thay phần vẽ của bản đồ Trúc Khê Thôn bằng cảnh 3D:
// địa hình có đồi núi, cây, nhà, hàng rào, đèn lồng, sông có mặt nước, nhân vật/quái/NPC dạng khối, nắng đổ bóng, sương xa.
// Kéo chuột/ngón tay để xoay camera, lăn chuột/chụm 2 ngón để phóng to; nhấp đất để đi, nhấp quái để đánh.
import * as THREE from './three.min.js';
const V3={on:false,built:null,scene:null,renderer:null,cam:null,ground:null,objs:new Map(),pick:[],yaw:0.0,pitch:0.85,dist:16,tgt:new THREE.Vector3(),hf:null,water:null,herbs:[],portals:[],sun:null,ov:null,oc:null};
const MAPS3D=['trukhe'];
const want3D=()=>{try{return localStorage.getItem('tk_3d')==='1';}catch(e){return false;}};
const hasGL=(()=>{try{const c=document.createElement('canvas');return !!(c.getContext('webgl2')||c.getContext('webgl'));}catch(e){return false;}})();
const col=c=>new THREE.Color(c||'#888');
// ---------- độ cao địa hình ----------
function hAt(x,z){const H=V3.hf;if(!H)return 0;x=Math.max(0,Math.min(MW-0.001,x));z=Math.max(0,Math.min(MH-0.001,z));const i=Math.floor(x),j=Math.floor(z),fx=x-i,fz=z-j,W=MW+1;
  const a=H[j*W+i],b=H[j*W+i+1],c=H[(j+1)*W+i],d=H[(j+1)*W+i+1];return a*(1-fx)*(1-fz)+b*fx*(1-fz)+c*(1-fx)*fz+d*fx*fz;}
function buildHeights(){const W=MW+1,Hh=MH+1,tv=new Float32Array(MW*MH);let s=CM.gen.seed||1;const rr=()=>(s=(s*16807)%2147483647)/2147483647;
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=getT(x,y);tv[y*MW+x]=t===MO?2.6+rr()*1.6:t===CH?-2.4:t===WA?-0.9:t===BR?-0.9:0;}
  let H=new Float32Array(W*Hh);for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){let sum=0,n=0;for(const [dx,dy] of [[-1,-1],[0,-1],[-1,0],[0,0]]){const x=i+dx,y=j+dy;if(x>=0&&y>=0&&x<MW&&y<MH){sum+=tv[y*MW+x];n++;}}H[j*W+i]=n?sum/n:0;}
  for(let k=0;k<2;k++){const N=new Float32Array(H.length);for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){let sum=0,n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=i+dx,y=j+dy;if(x>=0&&y>=0&&x<W&&y<Hh){sum+=H[y*W+x];n++;}}N[j*W+i]=sum/n;}H=N;}
  for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){let h=H[j*W+i];const t=getT(Math.min(MW-1,i),Math.min(MH-1,j));
    if(t===MO||t===CH)h*=1.6+0.4*Math.sin(i*1.7+j*2.3);
    for(const [hx,hy,r] of (typeof HILLS!=='undefined'?HILLS:[])){const d=Math.hypot(i-hx,j-hy);if(d<r*1.4)h+=0.9*Math.exp(-(d*d)/(r*r*0.5));}
    if(t===G||t===TR)h+=Math.sin(i*0.37)*Math.cos(j*0.29)*0.12;H[j*W+i]=h;}
  V3.hf=H;}
// ---------- dựng cảnh ----------
function makeMat(c,o){return new THREE.MeshLambertMaterial(Object.assign({color:col(c)},o||{}));}
function buildScene(){disposeScene();const S=new THREE.Scene();V3.scene=S;V3.objs.clear();V3.pick=[];V3.herbs=[];V3.portals=[];
  const sky=col('#bfe0ff');S.background=sky;S.fog=new THREE.Fog(sky,22,58);
  S.add(new THREE.HemisphereLight(0xeaf6ff,0x4a6a3a,0.95));
  const sun=new THREE.DirectionalLight(0xfff2d8,1.55);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-28;sc.right=28;sc.top=28;sc.bottom=-28;sc.near=1;sc.far=90;sun.shadow.bias=-0.0006;S.add(sun);S.add(sun.target);V3.sun=sun;
  buildHeights();
  // địa hình
  const W=MW+1,Hh=MH+1,pos=new Float32Array(W*Hh*3),cols=new Float32Array(W*Hh*3),idx=[];const gC=col(TH.grass),pC=col(TH.pathI||'#c8a878'),fC=col(TH.floorBase||'#b8b0a0'),rk=[col('#9a9284'),col('#c8c0b0')],snow=col('#ffffff'),sand=col('#d8c898'),dark=col('#2a2018'),tmp=new THREE.Color();
  for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){const k=j*W+i,h=V3.hf[k];pos.set([i,h,j],k*3);const t=getT(Math.min(MW-1,i),Math.min(MH-1,j));
    if(t===PA||t===BR)tmp.copy(pC);else if(t===FL||t===FE||t===HO)tmp.copy(fC);else if(t===WA)tmp.copy(sand);else if(t===CH)tmp.copy(dark);else if(h>1.2){tmp.copy(rk[0]).lerp(rk[1],Math.min(1,(h-1.2)/3));if(h>4.2)tmp.lerp(snow,Math.min(1,(h-4.2)/1.2));}
    else{tmp.copy(gC);const n=Math.sin(i*0.9)*Math.cos(j*0.7)*0.06+Math.sin(i*0.21+j*0.17)*0.05;tmp.offsetHSL(0,0,n+(h>0.3?0.04:0));}cols.set([tmp.r,tmp.g,tmp.b],k*3);}
  for(let j=0;j<MH;j++)for(let i=0;i<MW;i++){const a=j*W+i,b=a+1,c=a+W,d=c+1;idx.push(a,c,b,b,c,d);}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));gg.setAttribute('color',new THREE.BufferAttribute(cols,3));gg.setIndex(idx);gg.computeVertexNormals();
  const ground=new THREE.Mesh(gg,new THREE.MeshLambertMaterial({vertexColors:true}));ground.receiveShadow=true;S.add(ground);V3.ground=ground;
  // mặt nước
  const wm=new THREE.MeshPhongMaterial({color:col(TH.water||'#3a8ad0'),transparent:true,opacity:0.82,shininess:90,specular:0xbfe8ff});const water=new THREE.Mesh(new THREE.PlaneGeometry(MW,MH,1,1),wm);water.rotation.x=-Math.PI/2;water.position.set(MW/2,-0.32,MH/2);S.add(water);V3.water=water;
  // cầu gỗ
  const plank=makeMat('#a06c3a');for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(getT(x,y)===BR){const m=new THREE.Mesh(new THREE.BoxGeometry(1.02,0.12,1.02),plank);m.position.set(x+0.5,-0.08,y+0.5);m.receiveShadow=true;m.castShadow=true;S.add(m);}
  // cây (dùng instancing cho nhẹ)
  const trees=[];let s=CM.gen.seed*3+1;const rr=()=>(s=(s*16807)%2147483647)/2147483647;for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(getT(x,y)===TR)trees.push([x+0.5+(rr()-.5)*.4,y+0.5+(rr()-.5)*.4,0.75+rr()*0.5,rr()]);
  const inst=(geo,mat,list,f)=>{if(!list.length)return;const m=new THREE.InstancedMesh(geo,mat,list.length);const o=new THREE.Object3D();list.forEach((t,i)=>{f(o,t);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.castShadow=true;m.receiveShadow=true;S.add(m);};
  const round=trees.filter(t=>t[3]<0.45),pine=trees.filter(t=>t[3]>=0.45&&t[3]<0.8),pink=trees.filter(t=>t[3]>=0.8);
  inst(new THREE.CylinderGeometry(0.1,0.15,1,6),makeMat('#6a4424'),trees,(o,t)=>{o.position.set(t[0],hAt(t[0],t[1])+0.5*t[2],t[1]);o.scale.set(t[2],t[2],t[2]);o.rotation.set(0,0,0);});
  const ico=new THREE.IcosahedronGeometry(0.8,1);inst(ico,makeMat(TH.tree||'#3a7a2e',{flatShading:true}),round,(o,t)=>{o.position.set(t[0],hAt(t[0],t[1])+1.35*t[2],t[1]);o.scale.set(t[2],t[2]*0.95,t[2]);o.rotation.set(0,t[3]*6,0);});
  inst(ico,makeMat('#f0a0c8',{flatShading:true}),pink,(o,t)=>{o.position.set(t[0],hAt(t[0],t[1])+1.3*t[2],t[1]);o.scale.set(t[2]*1.05,t[2]*0.9,t[2]*1.05);o.rotation.set(0,t[3]*6,0);});
  inst(new THREE.ConeGeometry(0.7,1.9,7),makeMat('#2a5e34',{flatShading:true}),pine,(o,t)=>{o.position.set(t[0],hAt(t[0],t[1])+1.45*t[2],t[1]);o.scale.set(t[2],t[2],t[2]);o.rotation.set(0,t[3]*6,0);});
  // cây cổ thụ
  for(const b of (typeof BIGTREES!=='undefined'?BIGTREES:[])){const x=b.x/T,z=b.y/T,k=b.r/60,h0=hAt(x,z),g=new THREE.Group();
    const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.22*k,0.42*k,2.6*k,8),makeMat('#5a3a20'));tr.position.y=1.3*k;tr.castShadow=true;g.add(tr);
    const leaf=makeMat(b.v%4===1?'#e898c0':TH.tree||'#3a7a2e',{flatShading:true});for(const [dx,dy,dz,r] of [[0,3.1,0,1.7],[1.1,2.7,0.3,1.2],[-1.0,2.8,-0.4,1.25],[0.2,3.6,-0.6,1.1],[-0.3,2.6,0.9,1.1]]){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(r*k,1),leaf);m.position.set(dx*k,dy*k,dz*k);m.castShadow=true;m.receiveShadow=true;g.add(m);}
    g.position.set(x,h0,z);S.add(g);}
  // đá
  const rocks=[];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(getT(x,y)===RO)rocks.push([x+0.5,y+0.5,0.35+rr()*0.25,rr()]);
  inst(new THREE.DodecahedronGeometry(1,0),makeMat('#9a968c',{flatShading:true}),rocks,(o,t)=>{o.position.set(t[0],hAt(t[0],t[1])+t[2]*0.5,t[1]);o.scale.set(t[2]*1.3,t[2],t[2]*1.1);o.rotation.set(t[3],t[3]*4,0);});
  // hàng rào
  const fen=[];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(getT(x,y)===FE)fen.push([x+0.5,y+0.5]);
  inst(new THREE.BoxGeometry(0.14,0.7,0.14),makeMat('#8a5a32'),fen,(o,t)=>{o.position.set(t[0],hAt(t[0],t[1])+0.35,t[1]);o.scale.set(1,1,1);o.rotation.set(0,0,0);});
  inst(new THREE.BoxGeometry(1,0.08,0.08),makeMat('#a0703a'),fen,(o,t)=>{const v=getT(Math.floor(t[0]),Math.floor(t[1])-1)===FE||getT(Math.floor(t[0]),Math.floor(t[1])+1)===FE;o.position.set(t[0],hAt(t[0],t[1])+0.5,t[1]);o.rotation.set(0,v?Math.PI/2:0,0);});
  // nhà
  for(const [hx,hy] of CM.gen.houses){const g=new THREE.Group(),cx=hx+1.5,cz=hy+1.5;
    const wall=new THREE.Mesh(new THREE.BoxGeometry(2.5,1.5,2.3),makeMat('#f2e8d4'));wall.position.y=0.75;g.add(wall);
    for(const sx of [-1.2,1.2])for(const sz of [-1.1,1.1]){const p=new THREE.Mesh(new THREE.BoxGeometry(0.16,1.6,0.16),makeMat('#7a3a22'));p.position.set(sx,0.8,sz);g.add(p);}
    const roof=new THREE.Mesh(new THREE.ConeGeometry(2.35,1.25,4,1),makeMat(TH.roof||'#a63a28',{flatShading:true}));roof.rotation.y=Math.PI/4;roof.scale.set(1.25,1,1.15);roof.position.y=2.1;g.add(roof);
    const door=new THREE.Mesh(new THREE.BoxGeometry(0.6,0.95,0.06),makeMat('#5a2e18'));door.position.set(0,0.48,1.17);g.add(door);
    for(const sx of [-0.8,0.8]){const w=new THREE.Mesh(new THREE.BoxGeometry(0.45,0.4,0.06),makeMat('#ffe6a0',{emissive:col('#5a3a10')}));w.position.set(sx,0.95,1.17);g.add(w);}
    g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});g.position.set(cx,hAt(cx,cz),cz);S.add(g);}
  // đèn lồng
  for(const [lx,ly] of (typeof LIGHTS!=='undefined'?LIGHTS:[])){const g=new THREE.Group();const p=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.07,1.1,6),makeMat('#4a2a14'));p.position.y=0.55;g.add(p);
    const l=new THREE.Mesh(new THREE.SphereGeometry(0.18,10,8),new THREE.MeshBasicMaterial({color:0xffb050}));l.position.y=1.15;l.scale.y=1.2;g.add(l);g.position.set(lx,hAt(lx,ly),ly);S.add(g);}
  // cổng dịch chuyển
  for(const p of CM.portals){const m=new THREE.Mesh(new THREE.TorusGeometry(0.75,0.09,8,28),new THREE.MeshBasicMaterial({color:0x8fe8ff}));m.position.set(p.x,hAt(p.x,p.y)+0.85,p.y);S.add(m);V3.portals.push(m);}
  V3.built=curMapId;}
function disposeScene(){if(!V3.scene)return;V3.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.map)m.map.dispose();m.dispose();});}});V3.scene=null;V3.objs.clear();}
// ---------- nhân vật, quái ----------
function label(txt,color){const c=document.createElement('canvas');c.width=256;c.height=48;const g=c.getContext('2d');g.font='bold 26px "Segoe UI",Arial';g.textAlign='center';g.lineWidth=5;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(txt,128,34);g.fillStyle=color||'#fff';g.fillText(txt,128,34);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));s.scale.set(2.6,0.49,1);s.renderOrder=10;return s;}
function makeHuman(L,sc,name,ncol){const g=new THREE.Group(),robe=makeMat(L.robe||'#e8e8f0'),trim=makeMat(L.trim||'#c9a227'),skin=makeMat(L.skin||'#f9dcc6'),hair=makeMat(L.hair||'#222');
  const legs=[];for(const sx of [-0.1,0.1]){const l=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.42,0.14),makeMat(L.boot||'#3a2a20'));l.position.set(sx,0.21,0);g.add(l);legs.push(l);}
  const body=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.33,0.72,10),robe);body.position.y=0.66;g.add(body);
  const belt=new THREE.Mesh(new THREE.CylinderGeometry(0.215,0.215,0.07,10),trim);belt.position.y=0.78;g.add(belt);
  const arms=[];for(const sx of [-0.26,0.26]){const a=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.08,0.45,6),robe);a.position.set(sx,0.8,0);a.geometry.translate(0,-0.18,0);a.position.y=1.0;g.add(a);arms.push(a);}
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.27,14,12),skin);head.position.y=1.28;g.add(head);
  const hc=new THREE.Mesh(new THREE.SphereGeometry(0.29,14,12,0,Math.PI*2,0,Math.PI*0.55),hair);hc.position.y=1.31;hc.rotation.x=-0.25;g.add(hc);
  const back=new THREE.Mesh(new THREE.SphereGeometry(0.22,10,8),hair);back.position.set(0,1.18,-0.16);back.scale.set(1,1.3,0.7);g.add(back);
  for(const sx of [-0.09,0.09]){const e=new THREE.Mesh(new THREE.SphereGeometry(0.035,6,6),makeMat('#141018'));e.position.set(sx,1.28,0.25);g.add(e);}
  const wpn=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.7,0.05),new THREE.MeshLambertMaterial({color:0xdfe8f0,emissive:0x203040}));wpn.position.set(0.3,0.75,0.1);wpn.rotation.x=0.4;g.add(wpn);
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});g.scale.setScalar(sc||1.25);
  if(name){const lb=label(name,ncol);lb.position.y=1.85;g.add(lb);g.userData.label=lb;}
  g.userData.legs=legs;g.userData.arms=arms;return g;}
function makeBeast(t){const g=new THREE.Group(),c=t.col||(t.draw==='boar'?'#7a5236':t.draw==='fox'?'#e88a3a':t.draw==='snake'?'#5a9a4a':'#9aa0a8'),m=makeMat(c),d=makeMat(shadeHex(c,-.35)),s=(t.scale||1)*(t.boss?1.4:1);
  if(t.draw==='snake'){for(let i=0;i<6;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(0.2-i*0.02,10,8),m);b.position.set(0,0.18,-i*0.24);g.add(b);}const h=new THREE.Mesh(new THREE.SphereGeometry(0.24,10,8),m);h.position.set(0,0.32,0.2);h.scale.z=1.3;g.add(h);}
  else if(t.draw==='spirit'){const b=new THREE.Mesh(new THREE.SphereGeometry(0.42,16,12),new THREE.MeshLambertMaterial({color:col(c),emissive:col(c).multiplyScalar(0.5),transparent:true,opacity:0.8}));b.position.y=0.9;g.add(b);g.userData.float=true;}
  else{const body=new THREE.Mesh(new THREE.SphereGeometry(0.42,14,10),m);body.scale.set(0.8,0.7,1.3);body.position.y=0.55;g.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.27,12,10),m);head.position.set(0,0.75,0.58);g.add(head);
    const snout=new THREE.Mesh(new THREE.SphereGeometry(0.13,8,6),t.draw==='boar'?makeMat('#e0a090'):d);snout.position.set(0,0.68,0.82);snout.scale.z=1.4;g.add(snout);
    if(t.draw!=='boar')for(const sx of [-0.13,0.13]){const e=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.2,5),d);e.position.set(sx,1.0,0.52);g.add(e);}
    if(t.draw==='boar')for(const sx of [-0.1,0.1]){const tk=new THREE.Mesh(new THREE.ConeGeometry(0.03,0.16,5),makeMat('#fff8e0'));tk.position.set(sx,0.62,0.9);tk.rotation.x=-1;g.add(tk);}
    const legs=[];for(const [sx,sz] of [[-0.18,0.32],[0.18,0.32],[-0.18,-0.32],[0.18,-0.32]]){const l=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.07,0.38,6),d);l.geometry.translate(0,-0.19,0);l.position.set(sx,0.4,sz);g.add(l);legs.push(l);}g.userData.legs=legs;
    const tail=new THREE.Mesh(new THREE.ConeGeometry(0.08,t.draw==='fox'?0.6:0.35,6),t.draw==='fox'?makeMat('#fff0e0'):m);tail.position.set(0,0.62,-0.62);tail.rotation.x=-2.2;g.add(tail);}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});g.scale.setScalar(s*1.1);if(t.boss){const lb=label(t.name,'#ff9a7a');lb.position.y=1.7/(s*1.1)+0.6;lb.scale.set(2.6/(s*1.1),0.49/(s*1.1),1);g.add(lb);}return g;}
function objFor(key,make){let o=V3.objs.get(key);if(!o){o=make();o.userData.lx=null;V3.scene.add(o);V3.objs.set(key,o);}o.userData.seen=true;return o;}
function place(o,x,y,moving,face,dt,atk){const X=x/T,Z=y/T,h=hAt(X,Z),u=o.userData;if(u.lx!=null){const dx=X-u.lx,dz=Z-u.lz;if(dx*dx+dz*dz>1e-6)u.rot=Math.atan2(dx,dz);}else if(face)u.rot=face>0?Math.PI/2:-Math.PI/2;
  u.lx=X;u.lz=Z;o.position.set(X,h+(u.float?0.15*Math.sin(nowT*2.5):0),Z);if(u.rot!=null){let d=u.rot-o.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));o.rotation.y+=d*Math.min(1,dt*10);}
  const w=moving?Math.sin(nowT*12)*0.6:0;if(u.legs)u.legs.forEach((l,i)=>l.rotation.x=(i%2?w:-w)*(u.legs.length>2&&i>1?-1:1));if(u.arms)u.arms.forEach((a,i)=>a.rotation.x=atk>0?-1.6:(i?-w:w)*0.8);}
// ---------- cập nhật mỗi khung hình ----------
function update3D(dt){for(const o of V3.objs.values())o.userData.seen=false;
  const p=objFor('player',()=>makeHuman(playerLook||{},1.25,player.name,'#9fffb0'));place(p,player.x,player.y,player.moving,player.face,dt,player.atkAnim);p.visible=!player.dead;
  for(const n of npcs){const o=objFor('npc_'+n.id,()=>{const g=makeHuman(NPC_LOOK[n.look]||{},1.2,n.name,'#ffe27a');g.userData.npc=n;return g;});place(o,n.x,n.y,false,n.face||1,dt,0);if(!V3.pick.includes(o))V3.pick.push(o);}
  for(const m of mobs){if(m.isFoe)continue;const key=m;const o=objFor(key,()=>{const g=m.t.draw==='human'||!m.t.draw||NPC_LOOK[m.t.look]&&m.t.draw!=='wolf'&&m.t.draw!=='boar'&&m.t.draw!=='fox'&&m.t.draw!=='snake'&&m.t.draw!=='spirit'?makeHuman(NPC_LOOK[m.t.look]||{robe:'#6a3a3a'},(m.t.scale||1)*1.2,m.t.boss?m.t.name:null,'#ff9a7a'):makeBeast(m.t);g.userData.mob=m;return g;});
    o.visible=!m.dead;if(!m.dead){place(o,m.x,m.y,m.moving,m.face,dt,m.atkAnim);if(!V3.pick.includes(o))V3.pick.push(o);}}
  if(typeof NET!=='undefined')for(const ot of NET.others.values()){if(!ot.look)continue;const o=objFor('o_'+ot.id,()=>makeHuman(ot.look,1.25,ot.name,'#8fd8ff'));place(o,ot.x,ot.y,!!ot.mv,ot.face,dt,ot.atk||0);}
  for(const [k,o] of V3.objs)if(!o.userData.seen){V3.scene.remove(o);V3.objs.delete(k);const i=V3.pick.indexOf(o);if(i>=0)V3.pick.splice(i,1);}
  // vòng chọn mục tiêu
  let ring=V3.ring;if(!ring){ring=V3.ring=new THREE.Mesh(new THREE.RingGeometry(0.55,0.7,32),new THREE.MeshBasicMaterial({color:0xff5040,transparent:true,opacity:0.8,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;V3.scene.add(ring);}
  const tg=player.target;if(tg&&!tg.dead){ring.visible=true;ring.position.set(tg.x/T,hAt(tg.x/T,tg.y/T)+0.05,tg.y/T);ring.scale.setScalar((tg.t.scale||1)*(tg.t.boss?1.8:1));}else ring.visible=false;
  for(const pt of V3.portals)pt.rotation.y+=dt*1.5;if(V3.water)V3.water.material.opacity=0.8+0.04*Math.sin(nowT*1.5);
  // camera theo nhân vật
  const X=player.x/T,Z=player.y/T;V3.tgt.lerp(new THREE.Vector3(X,hAt(X,Z)+0.9,Z),Math.min(1,dt*6));const c=V3.cam,cp=Math.cos(V3.pitch);
  c.position.set(V3.tgt.x+Math.sin(V3.yaw)*V3.dist*cp,V3.tgt.y+Math.sin(V3.pitch)*V3.dist,V3.tgt.z+Math.cos(V3.yaw)*V3.dist*cp);c.lookAt(V3.tgt);
  V3.sun.position.set(V3.tgt.x-14,V3.tgt.y+24,V3.tgt.z-10);V3.sun.target.position.copy(V3.tgt);}
// chữ bay (sát thương, kinh nghiệm...) vẽ lên lớp 2D trong suốt phía trên cảnh 3D
function drawOverlay(){const c=V3.oc,cv2=V3.ov;if(cv2.width!==Math.round(innerWidth*DPR)||cv2.height!==Math.round(innerHeight*DPR)){cv2.width=Math.round(innerWidth*DPR);cv2.height=Math.round(innerHeight*DPR);}
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv2.width,cv2.height);c.setTransform(DPR,0,0,DPR,0,0);const v=new THREE.Vector3();
  for(const f of fx){if(f.k!=='t')continue;const X=f.x/T,Z=f.y/T;v.set(X,hAt(X,Z)+1.6+f.t*1.2,Z).project(V3.cam);if(v.z>1)continue;const sx=(v.x+1)/2*innerWidth,sy=(1-v.y)/2*innerHeight,a=1-f.t/f.life;
    c.globalAlpha=Math.max(0,Math.min(1,a*1.5));c.font=`bold ${f.size||14}px ${f.serif?'serif':'"Segoe UI",Arial'}`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.8)';c.strokeText(f.txt,sx,sy);c.fillStyle=f.col||'#fff';c.fillText(f.txt,sx,sy);}c.globalAlpha=1;}
// ---------- bật / tắt ----------
function ensureRenderer(){if(V3.renderer)return;const r=new THREE.WebGLRenderer({antialias:true});r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));r.setSize(innerWidth,innerHeight);r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;
  r.domElement.id='c3d';r.domElement.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;display:none;touch-action:none';const c2=$('c');c2.parentNode.insertBefore(r.domElement,c2.nextSibling);V3.renderer=r;
  V3.cam=new THREE.PerspectiveCamera(48,innerWidth/innerHeight,0.1,200);addEventListener('resize',()=>{r.setSize(innerWidth,innerHeight);V3.cam.aspect=innerWidth/innerHeight;V3.cam.updateProjectionMatrix();});
  const ov=document.createElement('canvas');ov.style.cssText='position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;display:none';r.domElement.parentNode.insertBefore(ov,r.domElement.nextSibling);V3.ov=ov;V3.oc=ov.getContext('2d');
  bindInput(r.domElement);}
function active(){return V3.on;}
function setActive(on){on=!!(on&&hasGL&&started&&MAPS3D.includes(curMapId));if(on===V3.on&&(!on||V3.built===curMapId))return;
  if(on){ensureRenderer();if(V3.built!==curMapId)buildScene();V3.renderer.domElement.style.display='block';V3.ov.style.display='block';$('c').style.display='none';V3.tgt.set(player.x/T,0,player.y/T);}
  else if(V3.renderer){V3.renderer.domElement.style.display='none';V3.ov.style.display='none';$('c').style.display='block';}V3.on=on;}
// game gọi draw mỗi khung hình
const _draw2D=draw;
draw=function(dt){if(want3D()&&MAPS3D.includes(curMapId)&&hasGL&&started){setActive(true);if(V3.on){update3D(dt);V3.renderer.render(V3.scene,V3.cam);drawOverlay();if(typeof drawMini==='function')drawMini();return;}}else if(V3.on)setActive(false);_draw2D(dt);};
const _loadMap3=loadMap;loadMap=function(...a){const r=_loadMap3.apply(this,a);if(V3.built&&V3.built!==curMapId){V3.built=null;if(V3.on)setActive(false);}if(want3D()&&MAPS3D.includes(curMapId))V3.built=null;return r;};
// ---------- điều khiển ----------
function bindInput(el){let down=null,pinch=null;const ptrs=new Map();
  el.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});try{el.setPointerCapture(e.pointerId);}catch(_){}if(ptrs.size===1)down={x:e.clientX,y:e.clientY,t:performance.now(),moved:false,yaw:V3.yaw,pitch:V3.pitch,btn:e.button};
    if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),dist:V3.dist};down=null;}});
  el.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&ptrs.size===2){const [a,b]=[...ptrs.values()];V3.dist=Math.max(6,Math.min(34,pinch.dist*pinch.d/Math.max(20,Math.hypot(a.x-b.x,a.y-b.y))));return;}
    if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dx)+Math.abs(dy)>8)down.moved=true;if(down.moved){V3.yaw=down.yaw-dx*0.008;V3.pitch=Math.max(0.25,Math.min(1.35,down.pitch+dy*0.006));}});
  const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(!down||ptrs.size)return;const d=down;down=null;if(d.moved||d.btn!==0)return;click3D(e.clientX,e.clientY);};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);down=null;pinch=null;});
  el.addEventListener('wheel',e=>{e.preventDefault();V3.dist=Math.max(6,Math.min(34,V3.dist*(e.deltaY>0?1.1:0.9)));},{passive:false});el.addEventListener('contextmenu',e=>e.preventDefault());}
function click3D(sx,sy){if(!started||player.dead)return;const rc=new THREE.Raycaster(),v=new THREE.Vector2(sx/innerWidth*2-1,-(sy/innerHeight)*2+1);rc.setFromCamera(v,V3.cam);
  const hits=rc.intersectObjects(V3.pick,true);for(const h of hits){let o=h.object;while(o&&!o.userData.mob&&!o.userData.npc)o=o.parent;if(!o)continue;
    if(o.userData.mob&&!o.userData.mob.dead){navGoal=null;player.target=o.userData.mob;player.npc=null;player.gather=null;player.repath=0;return;}
    if(o.userData.npc){navGoal=null;player.npc=o.userData.npc;player.target=null;player.gather=null;player.repath=0;return;}}
  const g=rc.intersectObject(V3.ground,false)[0];if(!g)return;const wx=g.point.x*T,wy=g.point.z*T;
  for(const h of herbs)if(!h.dead&&Math.hypot(h.x-wx,h.y-wy)<28){navGoal=null;player.gather=h;player.target=null;player.npc=null;player.repath=0;return;}
  groundMove(wx,wy);}
// ---------- nút bật/tắt ----------
(()=>{const b=document.createElement('button');b.id='btn3D';b.textContent='3D';b.title='Chế độ 3D thử nghiệm (hiện chỉ có ở Trúc Khê Thôn)';$('menuBtns').insertBefore(b,$('btnSet'));
  const sync=()=>{b.style.background=want3D()?'linear-gradient(#5aa0e0,#2a5a9a)':'';b.style.color=want3D()?'#fff':'';};sync();
  b.onclick=()=>{if(!hasGL)return log('Máy này không hỗ trợ 3D (WebGL)','#ff9a8a');const on=!want3D();try{on?localStorage.setItem('tk_3d','1'):localStorage.removeItem('tk_3d');}catch(e){}sync();sfx('click');
    log(on?(MAPS3D.includes(curMapId)?'Đã bật 3D thử nghiệm. Kéo để xoay camera, lăn chuột / chụm 2 ngón để phóng to.':'Đã bật 3D thử nghiệm: hiện chỉ có ở Trúc Khê Thôn, các bản đồ khác vẫn 2D.'):'Đã tắt 3D, về chế độ 2D','#8fd8ff');};})();
window.V3=V3;
