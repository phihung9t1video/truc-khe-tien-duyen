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
function makeMat(c,o){o=Object.assign({},o||{});delete o.flatShading;return new THREE.MeshStandardMaterial(Object.assign({color:col(c),roughness:0.82,metalness:0},o));}
const UT={value:0};
// gió: lắc đỉnh tán lá, ngọn cỏ theo thời gian (đỉnh lắc nhiều, gốc đứng yên)
function windify(m,amp,base){m.onBeforeCompile=sh=>{sh.uniforms.uT=UT;sh.vertexShader='uniform float uT;\n'+sh.vertexShader.replace('#include <begin_vertex>',
  `#include <begin_vertex>
  float wh=max(0.0,position.y-(${(base||0).toFixed(2)}));vec3 ip=vec3(0.0);
  #ifdef USE_INSTANCING
  ip=vec3(instanceMatrix[3][0],0.0,instanceMatrix[3][2]);
  #endif
  float ph=uT*1.6+ip.x*0.35+ip.z*0.27;transformed.x+=sin(ph)*${amp.toFixed(3)}*wh;transformed.z+=cos(ph*0.8)*${(amp*0.6).toFixed(3)}*wh;`);};m.customProgramCacheKey=()=>'w'+amp+'_'+(base||0);return m;}
// tán lá: nhiều khối cầu gợn mềm ghép lại
function lumpy(r,det,seed){const g=new THREE.IcosahedronGeometry(r,det);const p=g.attributes.position,nm=new Float32Array(p.count*3),v=new THREE.Vector3(),u=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);u.copy(v).normalize();const n=1+0.13*Math.sin(u.x*5.1*r+seed)*Math.cos(u.y*4.3*r+seed*1.7)+0.07*Math.sin(u.z*7.7*r+seed*0.6);v.multiplyScalar(n);p.setXYZ(i,v.x,v.y,v.z);nm[i*3]=u.x;nm[i*3+1]=u.y;nm[i*3+2]=u.z;}g.setAttribute("normal",new THREE.BufferAttribute(nm,3));return g;}
function merge(list){let n=0;const geos=list.map(([g,x,y,z,sx,sy,sz])=>{const q=(g.index?g.toNonIndexed():g).clone();q.scale(sx||1,sy||sx||1,sz||sx||1);q.translate(x,y,z);n+=q.attributes.position.count;return q;});
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3);let o=0;for(const q of geos){pos.set(q.attributes.position.array,o*3);nor.set(q.attributes.normal.array,o*3);o+=q.attributes.position.count;q.dispose();}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));return g;}
const canopyGeo=seed=>merge([[lumpy(0.64,3,seed),0,0,0],[lumpy(0.5,2,seed+1),0.42,-0.12,0.1],[lumpy(0.48,2,seed+2),-0.4,-0.1,-0.12],[lumpy(0.42,2,seed+3),0.02,0.3,-0.25]]);
const pineGeo=()=>merge([[new THREE.ConeGeometry(0.72,0.95,16,1),0,-0.45,0],[new THREE.ConeGeometry(0.58,0.85,16,1),0,0.05,0],[new THREE.ConeGeometry(0.42,0.75,16,1),0,0.5,0]]);
function buildScene(){disposeScene();const S=new THREE.Scene();V3.scene=S;V3.objs.clear();V3.pick=[];V3.herbs=[];V3.portals=[];
  const sky=col('#cfe6f7');S.fog=new THREE.Fog(sky,24,62);
  const skyM=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:{top:{value:col('#5ea6e8')},mid:{value:col('#cfe6f7')},bot:{value:col('#f4ead8')},sunDir:{value:new THREE.Vector3(-0.45,0.75,-0.35).normalize()}},
    vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'uniform vec3 top,mid,bot,sunDir;varying vec3 vP;void main(){float h=vP.y;vec3 c=h>0.0?mix(mid,top,pow(h,0.6)):mix(mid,bot,min(1.0,-h*3.0));float s=max(0.0,dot(vP,sunDir));c+=vec3(1.0,0.9,0.7)*(pow(s,64.0)*1.2+pow(s,6.0)*0.18);gl_FragColor=vec4(c,1.0);}'});
  const dome=new THREE.Mesh(new THREE.SphereGeometry(150,32,16),skyM);V3.dome=dome;S.add(dome);S.background=sky;
  S.add(new THREE.HemisphereLight(0xdfefff,0x5a7a4a,1.05));
  const sun=new THREE.DirectionalLight(0xfff0d6,2.2);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);const sc=sun.shadow.camera;sc.left=-28;sc.right=28;sc.top=28;sc.bottom=-28;sc.near=1;sc.far=90;sun.shadow.bias=-0.0004;sun.shadow.normalBias=0.03;sun.shadow.radius=5;S.add(sun);S.add(sun.target);V3.sun=sun;
  buildHeights();
  // địa hình
  const W=MW+1,Hh=MH+1,pos=new Float32Array(W*Hh*3),cols=new Float32Array(W*Hh*3),idx=[];const gC=col(TH.grass),pC=col(TH.pathI||'#c8a878'),fC=col(TH.floorBase||'#b8b0a0'),rk=[col('#9a9284'),col('#c8c0b0')],snow=col('#ffffff'),sand=col('#d8c898'),dark=col('#2a2018'),tmp=new THREE.Color();
  for(let j=0;j<Hh;j++)for(let i=0;i<W;i++){const k=j*W+i,h=V3.hf[k];pos.set([i,h,j],k*3);const t=getT(Math.min(MW-1,i),Math.min(MH-1,j));
    if(t===PA||t===BR)tmp.copy(pC);else if(t===FL||t===FE||t===HO)tmp.copy(fC);else if(t===WA)tmp.copy(sand);else if(t===CH)tmp.copy(dark);else if(h>1.2){tmp.copy(rk[0]).lerp(rk[1],Math.min(1,(h-1.2)/3));if(h>4.2)tmp.lerp(snow,Math.min(1,(h-4.2)/1.2));}
    else{tmp.copy(gC);const n=Math.sin(i*0.9)*Math.cos(j*0.7)*0.06+Math.sin(i*0.21+j*0.17)*0.05;tmp.offsetHSL(0,0,n+(h>0.3?0.04:0));}cols.set([tmp.r,tmp.g,tmp.b],k*3);}
  for(let j=0;j<MH;j++)for(let i=0;i<MW;i++){const a=j*W+i,b=a+1,c=a+W,d=c+1;idx.push(a,c,b,b,c,d);}
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(pos,3));gg.setAttribute('color',new THREE.BufferAttribute(cols,3));gg.setIndex(idx);gg.computeVertexNormals();
  const ground=new THREE.Mesh(gg,new THREE.MeshStandardMaterial({vertexColors:true,roughness:0.95,metalness:0}));ground.receiveShadow=true;S.add(ground);V3.ground=ground;
  // mặt nước
  const wm=new THREE.MeshStandardMaterial({color:col(TH.water||'#3a8ad0'),transparent:true,opacity:0.8,roughness:0.12,metalness:0.15});
  wm.onBeforeCompile=sh=>{sh.uniforms.uT=UT;sh.vertexShader='uniform float uT;varying vec2 vW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vW=position.xy;transformed.z+=sin(position.x*1.3+uT*1.7)*0.035+cos(position.y*1.7+uT*1.3)*0.03;');
    sh.fragmentShader='uniform float uT;varying vec2 vW;\n'+sh.fragmentShader.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n normal=normalize(normal+vec3(sin(vW.x*3.1+uT*2.0)*0.09+sin(vW.y*5.3-uT*1.6)*0.05,cos(vW.y*2.7+uT*1.8)*0.09,0.0));');};
  const water=new THREE.Mesh(new THREE.PlaneGeometry(MW,MH,Math.min(220,MW*2),Math.min(170,MH*2)),wm);water.rotation.x=-Math.PI/2;water.position.set(MW/2,-0.32,MH/2);S.add(water);V3.water=water;
  // cầu gỗ
  const plank=makeMat('#a06c3a');for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(getT(x,y)===BR){const m=new THREE.Mesh(new THREE.BoxGeometry(1.02,0.12,1.02),plank);m.position.set(x+0.5,-0.08,y+0.5);m.receiveShadow=true;m.castShadow=true;S.add(m);}
  // cây (dùng instancing cho nhẹ)
  const trees=[];let s=CM.gen.seed*3+1;const rr=()=>(s=(s*16807)%2147483647)/2147483647;for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(getT(x,y)===TR)trees.push([x+0.5+(rr()-.5)*.4,y+0.5+(rr()-.5)*.4,0.75+rr()*0.5,rr()]);
  const inst=(geo,mat,list,f)=>{if(!list.length)return;const m=new THREE.InstancedMesh(geo,mat,list.length);const o=new THREE.Object3D();list.forEach((t,i)=>{f(o,t);o.updateMatrix();m.setMatrixAt(i,o.matrix);});m.castShadow=true;m.receiveShadow=true;S.add(m);};
  const round=trees.filter(t=>t[3]<0.45),pine=trees.filter(t=>t[3]>=0.45&&t[3]<0.8),pink=trees.filter(t=>t[3]>=0.8);
  inst(new THREE.CylinderGeometry(0.09,0.16,1,10),makeMat('#6a4424'),trees,(o,t)=>{o.position.set(t[0],hAt(t[0],t[1])+0.5*t[2],t[1]);o.scale.set(t[2],t[2],t[2]);o.rotation.set(0,0,0);});
  const ico=canopyGeo(1.3);inst(ico,windify(makeMat(TH.tree||'#3a7a2e',{roughness:0.9}),0.06,-0.6),round,(o,t)=>{o.position.set(t[0],hAt(t[0],t[1])+1.35*t[2],t[1]);o.scale.set(t[2],t[2]*0.95,t[2]);o.rotation.set(0,t[3]*6,0);});
  inst(canopyGeo(4.1),windify(makeMat('#f2a6cc',{roughness:0.85}),0.06,-0.6),pink,(o,t)=>{o.position.set(t[0],hAt(t[0],t[1])+1.3*t[2],t[1]);o.scale.set(t[2]*1.05,t[2]*0.9,t[2]*1.05);o.rotation.set(0,t[3]*6,0);});
  inst(pineGeo(),windify(makeMat('#2e6a3a',{roughness:0.9}),0.045,-0.9),pine,(o,t)=>{o.position.set(t[0],hAt(t[0],t[1])+1.45*t[2],t[1]);o.scale.set(t[2],t[2],t[2]);o.rotation.set(0,t[3]*6,0);});
  // cỏ
  {const blade=new THREE.BufferGeometry(),bp=[],bc=[],gcol=col(TH.grass),tipc=gcol.clone().offsetHSL(0.03,0.08,0.22),basec=gcol.clone().offsetHSL(0,0,-0.02);
   for(let k=0;k<5;k++){const a=k/5*Math.PI*2+0.3,dx=Math.cos(a)*0.07,dz=Math.sin(a)*0.07,lx=Math.cos(a+1.6)*0.018,lz=Math.sin(a+1.6)*0.018,hh=0.16+(k%3)*0.05,lean=0.06;
     bp.push(dx-lx,0,dz-lz, dx+lx,0,dz+lz, dx*1.8+Math.cos(a)*lean,hh,dz*1.8+Math.sin(a)*lean);bc.push(basec.r,basec.g,basec.b,basec.r,basec.g,basec.b,tipc.r,tipc.g,tipc.b);}
   blade.setAttribute('position',new THREE.Float32BufferAttribute(bp,3));blade.setAttribute('color',new THREE.Float32BufferAttribute(bc,3));blade.computeVertexNormals();
   const gm=windify(new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:1}),0.35,0);const spots=[];
   for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=getT(x,y);if(t!==G)continue;for(let k=0;k<5;k++)spots.push([x+rr(),y+rr(),0.6+rr()*0.7,rr()]);}
   const gi=new THREE.InstancedMesh(blade,gm,spots.length),o=new THREE.Object3D();spots.forEach((t,i)=>{o.position.set(t[0],hAt(t[0],t[1]),t[1]);o.rotation.set(0,t[3]*6.28,0);o.scale.set(t[2],t[2],t[2]);o.updateMatrix();gi.setMatrixAt(i,o.matrix);});gi.receiveShadow=true;S.add(gi);}
  // cây cổ thụ
  for(const b of (typeof BIGTREES!=='undefined'?BIGTREES:[])){const x=b.x/T,z=b.y/T,k=b.r/60,h0=hAt(x,z),g=new THREE.Group();
    const tr=new THREE.Mesh(new THREE.CylinderGeometry(0.22*k,0.45*k,2.6*k,14),makeMat('#5a3a20'));tr.position.y=1.3*k;tr.castShadow=true;g.add(tr);
    const leaf=windify(makeMat(b.v%4===1?'#eaa0c6':TH.tree||'#3a7a2e',{roughness:0.9}),0.03,2.4*k);for(const [dx,dy,dz,r] of [[0,3.1,0,1.7],[1.1,2.7,0.3,1.2],[-1.0,2.8,-0.4,1.25],[0.2,3.6,-0.6,1.1],[-0.3,2.6,0.9,1.1]]){const m=new THREE.Mesh(lumpy(r*k,3,dx*7+dz),leaf);m.position.set(dx*k,dy*k,dz*k);m.castShadow=true;m.receiveShadow=true;g.add(m);}
    g.position.set(x,h0,z);S.add(g);}
  // đá
  const rocks=[];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(getT(x,y)===RO)rocks.push([x+0.5,y+0.5,0.35+rr()*0.25,rr()]);
  inst(lumpy(0.8,2,7.7),makeMat('#9a968c',{roughness:0.95}),rocks,(o,t)=>{o.position.set(t[0],hAt(t[0],t[1])+t[2]*0.5,t[1]);o.scale.set(t[2]*1.3,t[2],t[2]*1.1);o.rotation.set(t[3],t[3]*4,0);});
  // hàng rào
  const fen=[];for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(getT(x,y)===FE)fen.push([x+0.5,y+0.5]);
  inst(new THREE.BoxGeometry(0.14,0.7,0.14),makeMat('#8a5a32'),fen,(o,t)=>{o.position.set(t[0],hAt(t[0],t[1])+0.35,t[1]);o.scale.set(1,1,1);o.rotation.set(0,0,0);});
  inst(new THREE.BoxGeometry(1,0.08,0.08),makeMat('#a0703a'),fen,(o,t)=>{const v=getT(Math.floor(t[0]),Math.floor(t[1])-1)===FE||getT(Math.floor(t[0]),Math.floor(t[1])+1)===FE;o.position.set(t[0],hAt(t[0],t[1])+0.5,t[1]);o.rotation.set(0,v?Math.PI/2:0,0);});
  // nhà
  for(const [hx,hy] of CM.gen.houses){const g=new THREE.Group(),cx=hx+1.5,cz=hy+1.5;
    const wall=new THREE.Mesh(new THREE.BoxGeometry(2.5,1.5,2.3),makeMat('#f2e8d4'));wall.position.y=0.75;g.add(wall);
    for(const sx of [-1.2,1.2])for(const sz of [-1.1,1.1]){const p=new THREE.Mesh(new THREE.BoxGeometry(0.16,1.6,0.16),makeMat('#7a3a22'));p.position.set(sx,0.8,sz);g.add(p);}
    const roof=new THREE.Mesh(new THREE.ConeGeometry(2.35,1.25,4,1),makeMat(TH.roof||'#a63a28',{roughness:0.7}));roof.rotation.y=Math.PI/4;roof.scale.set(1.25,1,1.15);roof.position.y=2.1;g.add(roof);
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
function mkLabel(txt,color){const c=document.createElement('canvas');c.width=256;c.height=48;const g=c.getContext('2d');g.font='bold 26px "Segoe UI",Arial';g.textAlign='center';g.lineWidth=5;g.strokeStyle='rgba(0,0,0,.85)';g.strokeText(txt,128,34);g.fillStyle=color||'#fff';g.fillText(txt,128,34);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true}));s.scale.set(2.6,0.49,1);s.renderOrder=10;return s;}
function makeHuman(L,sc,name,ncol){const g=new THREE.Group(),robe=makeMat(L.robe||'#e8e8f0'),trim=makeMat(L.trim||'#c9a227'),skin=makeMat(L.skin||'#f9dcc6'),hair=makeMat(L.hair||'#222');
  const legs=[];for(const sx of [-0.09,0.09]){const l=new THREE.Mesh(new THREE.CapsuleGeometry(0.065,0.26,6,12),makeMat(L.boot||'#3a2a20'));l.geometry.translate(0,-0.16,0);l.position.set(sx,0.36,0);g.add(l);legs.push(l);}
  const torso=new THREE.Group();torso.position.y=0.42;g.add(torso);
  const skirt=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0.15,0.62),new THREE.Vector2(0.2,0.45),new THREE.Vector2(0.27,0.2),new THREE.Vector2(0.34,0.02),new THREE.Vector2(0.33,0)],28),robe);skirt.position.y=-0.04;torso.add(skirt);
  const chest=new THREE.Mesh(new THREE.CapsuleGeometry(0.17,0.2,8,20),robe);chest.position.y=0.62;chest.scale.set(1,1,0.82);torso.add(chest);
  const belt=new THREE.Mesh(new THREE.TorusGeometry(0.19,0.035,10,28),trim);belt.rotation.x=Math.PI/2;belt.position.y=0.45;torso.add(belt);
  const collar=new THREE.Mesh(new THREE.TorusGeometry(0.11,0.03,8,20),trim);collar.rotation.x=Math.PI/2;collar.position.y=0.82;torso.add(collar);
  const arms=[];for(const sx of [-0.23,0.23]){const a=new THREE.Mesh(new THREE.CapsuleGeometry(0.055,0.28,6,12),robe);a.geometry.translate(0,-0.17,0);a.position.set(sx,0.78,0);torso.add(a);arms.push(a);
    const hnd=new THREE.Mesh(new THREE.SphereGeometry(0.05,12,10),skin);hnd.position.set(0,-0.36,0);a.add(hnd);}
  const headG=new THREE.Group();headG.position.y=0.86;g.add(headG);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.27,32,24),skin);head.position.y=0.06;head.scale.set(1,1.02,0.96);headG.add(head);
  const hc=new THREE.Mesh(new THREE.SphereGeometry(0.29,32,20,0,Math.PI*2,0,Math.PI*0.52),hair);hc.position.y=0.09;hc.rotation.x=-0.28;headG.add(hc);
  const back=new THREE.Mesh(new THREE.SphereGeometry(0.22,24,16),hair);back.position.set(0,-0.06,-0.15);back.scale.set(1,1.35,0.72);headG.add(back);
  if(L.female){const tail=new THREE.Mesh(new THREE.CapsuleGeometry(0.08,0.3,6,12),hair);tail.position.set(0,-0.22,-0.24);tail.rotation.x=0.3;headG.add(tail);}
  else{const knot=new THREE.Mesh(new THREE.SphereGeometry(0.09,16,12),hair);knot.position.set(0,0.34,-0.06);headG.add(knot);}
  for(const sx of [-0.09,0.09]){const e=new THREE.Mesh(new THREE.SphereGeometry(0.04,16,12),makeMat('#141018',{roughness:0.3}));e.position.set(sx,0.05,0.245);e.scale.set(1,1.25,0.6);headG.add(e);
    const hl=new THREE.Mesh(new THREE.SphereGeometry(0.012,8,6),new THREE.MeshBasicMaterial({color:0xffffff}));hl.position.set(sx-0.012,0.068,0.268);headG.add(hl);
    const bl=new THREE.Mesh(new THREE.SphereGeometry(0.035,10,8),new THREE.MeshBasicMaterial({color:0xff9aa0,transparent:true,opacity:0.35}));bl.position.set(sx*1.7,-0.03,0.23);bl.scale.set(1,0.6,0.4);headG.add(bl);}
  g.userData.torso=torso;g.userData.headG=headG;
  const wpn=new THREE.Mesh(new THREE.CapsuleGeometry(0.022,0.62,4,8),new THREE.MeshStandardMaterial({color:0xe8f0f8,metalness:0.8,roughness:0.25,emissive:0x101822}));wpn.position.set(0.05,-0.3,0.12);wpn.rotation.x=1.2;arms[1].add(wpn);
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});g.scale.setScalar(sc||1.25);
  if(name){const lb=mkLabel(name,ncol);lb.position.y=1.62;g.add(lb);g.userData.label=lb;}
  g.userData.legs=legs;g.userData.arms=arms;return g;}
function makeBeast(t){const g=new THREE.Group(),c=t.col||(t.draw==='boar'?'#7a5236':t.draw==='fox'?'#e88a3a':t.draw==='snake'?'#5a9a4a':'#9aa0a8'),m=makeMat(c),d=makeMat(shadeHex(c,-.35)),s=(t.scale||1)*(t.boss?1.4:1);
  if(t.draw==='snake'){for(let i=0;i<6;i++){const b=new THREE.Mesh(new THREE.SphereGeometry(0.2-i*0.02,20,14),m);b.position.set(0,0.18,-i*0.24);g.add(b);}const h=new THREE.Mesh(new THREE.SphereGeometry(0.24,10,8),m);h.position.set(0,0.32,0.2);h.scale.z=1.3;g.add(h);}
  else if(t.draw==='spirit'){const b=new THREE.Mesh(new THREE.SphereGeometry(0.42,16,12),new THREE.MeshStandardMaterial({color:col(c),emissive:col(c).multiplyScalar(0.6),transparent:true,opacity:0.82,roughness:0.3}));b.position.y=0.9;g.add(b);g.userData.float=true;}
  else{const body=new THREE.Mesh(new THREE.SphereGeometry(0.42,28,20),m);body.scale.set(0.8,0.7,1.3);body.position.y=0.55;g.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(0.27,24,18),m);head.position.set(0,0.75,0.58);g.add(head);
    const snout=new THREE.Mesh(new THREE.SphereGeometry(0.13,8,6),t.draw==='boar'?makeMat('#e0a090'):d);snout.position.set(0,0.68,0.82);snout.scale.z=1.4;g.add(snout);
    if(t.draw!=='boar')for(const sx of [-0.13,0.13]){const e=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.2,5),d);e.position.set(sx,1.0,0.52);g.add(e);}
    if(t.draw==='boar')for(const sx of [-0.1,0.1]){const tk=new THREE.Mesh(new THREE.ConeGeometry(0.03,0.16,5),makeMat('#fff8e0'));tk.position.set(sx,0.62,0.9);tk.rotation.x=-1;g.add(tk);}
    const legs=[];for(const [sx,sz] of [[-0.18,0.32],[0.18,0.32],[-0.18,-0.32],[0.18,-0.32]]){const l=new THREE.Mesh(new THREE.CapsuleGeometry(0.06,0.26,6,12),d);l.geometry.translate(0,-0.19,0);l.position.set(sx,0.4,sz);g.add(l);legs.push(l);}g.userData.legs=legs;
    const tail=new THREE.Mesh(new THREE.ConeGeometry(0.08,t.draw==='fox'?0.6:0.35,6),t.draw==='fox'?makeMat('#fff0e0'):m);tail.position.set(0,0.62,-0.62);tail.rotation.x=-2.2;g.add(tail);}
  g.traverse(o=>{if(o.isMesh)o.castShadow=true;});g.scale.setScalar(s*1.1);if(t.boss){const lb=mkLabel(t.name,'#ff9a7a');lb.position.y=1.7/(s*1.1)+0.6;lb.scale.set(2.6/(s*1.1),0.49/(s*1.1),1);g.add(lb);}return g;}
function objFor(key,make){let o=V3.objs.get(key);if(!o){o=make();o.userData.lx=null;V3.scene.add(o);V3.objs.set(key,o);}o.userData.seen=true;return o;}
function place(o,x,y,moving,face,dt,atk){const X=x/T,Z=y/T,h=hAt(X,Z),u=o.userData;if(u.lx!=null){const dx=X-u.lx,dz=Z-u.lz;if(dx*dx+dz*dz>1e-6)u.rot=Math.atan2(dx,dz);}else if(face)u.rot=face>0?Math.PI/2:-Math.PI/2;
  u.lx=X;u.lz=Z;o.position.set(X,h+(u.float?0.15*Math.sin(nowT*2.5):0),Z);if(u.rot!=null){let d=u.rot-o.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));o.rotation.y+=d*Math.min(1,dt*10);}
  u.mv=(u.mv||0)+((moving?1:0)-(u.mv||0))*Math.min(1,dt*8);const ph=(u.ph=(u.ph||Math.random()*6)+dt*(6+6*u.mv)),w=Math.sin(ph*1.6)*0.65*u.mv;
  if(u.legs)u.legs.forEach((l,i)=>l.rotation.x=(i%2?w:-w)*(u.legs.length>2&&i>1?-1:1));
  if(u.arms)u.arms.forEach((a,i)=>{const tg=atk>0&&i===1?-2.1:(i?-w:w)*0.9+Math.sin(ph*0.5+i)*0.05*(1-u.mv);a.rotation.x+=(tg-a.rotation.x)*Math.min(1,dt*14);a.rotation.z=(i?-1:1)*0.12;});
  if(u.torso){u.torso.scale.y=1+Math.sin(ph*0.55)*0.018*(1-u.mv);u.torso.rotation.x=0.12*u.mv;o.position.y+=Math.abs(Math.sin(ph*1.6))*0.05*u.mv;}if(u.headG)u.headG.rotation.y=Math.sin(ph*0.23)*0.15*(1-u.mv);}
// ---------- nhân vật/quái: dùng lại hình vẽ 2D, dựng đứng trong cảnh 3D (kiểu HD-2D) ----------
// Mỗi đối tượng có 1 tấm vẽ riêng; mỗi khung hình vẽ lại bằng đúng hàm vẽ của bản 2D rồi hiện như tấm ảnh đứng, luôn quay về camera.
const BB_PX=40; // số điểm ảnh 2D ứng với 1 ô 3D
const shadowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,2,32,32,30);r.addColorStop(0,'rgba(0,0,0,.55)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new THREE.CanvasTexture(c);})();
function makeBB(W,H,ax,ay,sh,pick){const g=new THREE.Group(),c=document.createElement('canvas');c.width=W*2;c.height=H*2;c.dataset.w=W;const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.minFilter=THREE.LinearFilter;
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,alphaTest:0.12,depthWrite:true,fog:true}));sp.center.set(ax/W,1-ay/H);sp.scale.set(W/BB_PX,H/BB_PX,1);g.add(sp);
  if(sh){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=0.03;m.scale.set(sh,sh*0.6,1);m.renderOrder=1;g.add(m);}
  Object.assign(g.userData,{cv:c,tex,sp,W,H,ax,ay,pick});return g;}
function bbDraw(o,fn,every){const u=o.userData;u.fc=(u.fc||0)+1;if(every>1&&u.fc%every)return;withCtx(u.cv,()=>{ctx.save();ctx.translate(u.ax,u.ay);fn();ctx.restore();});u.tex.needsUpdate=true;}
// hướng nhìn trên màn hình theo hướng đi so với camera
function viewDir(o,face){const u=o.userData,vx=u.vx||0,vz=u.vz||0,cr=Math.cos(V3.yaw),sr=Math.sin(V3.yaw),right=vx*cr-vz*sr,fwd=-(vx*sr+vz*cr);
  if(Math.abs(vx)+Math.abs(vz)<1e-4)return{dir:u.dir||'down',face:u.face||face||1};const d=Math.abs(fwd)>Math.abs(right)*1.25?(fwd>0?'up':'down'):'side';u.dir=d;u.face=right>=0?1:-1;return{dir:d,face:u.face};}
function placeBB(o,x,y,dt){const X=x/T,Z=y/T,u=o.userData;if(u.lx!=null){u.vx=X-u.lx;u.vz=Z-u.lz;}u.lx=X;u.lz=Z;o.position.set(X,hAt(X,Z),Z);const d=o.position.distanceTo(V3.cam.position);return d;}
// ---------- mô hình 3D thật (KayKit, CC0): nhân vật, NPC, quái dạng người ----------
const loader=new THREE.GLTFLoader();loader.setMeshoptDecoder(THREE.MeshoptDecoder);
const MDL={},MDL_URL={mage:'js/m_mage.glb',rogue:'js/m_rogue.glb',knight:'js/m_knight.glb',barb:'js/m_barb.glb',skel:'js/m_skel.glb',skelw:'js/m_skelw.glb'};
function mdl(k){if(!k||!MDL_URL[k])return null;const M=MDL[k];if(M)return M.ready?M:null;MDL[k]={ready:false};
  loader.load(MDL_URL[k],g=>{const box=new THREE.Box3().setFromObject(g.scene),h=box.max.y-box.min.y;g.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;if(o.material){o.material.roughness=0.75;o.material.metalness=0;}}});Object.assign(MDL[k],{ready:true,scene:g.scene,anims:g.animations,h:h||2});},undefined,()=>{MDL[k].fail=true;});return null;}
const SECT_MDL={kiem:'knight',hoa:'mage',thuy:'mage',duoc:'mage',the:'barb',am:'rogue'},CASTER={hoa:1,thuy:1,duoc:1};
const npcMdl=l=>{l=l||'';return /smith|iron|forge/.test(l)?'barb':/elder|taoist|healer|doc|herb|monk|sage|immortal|fairy|shaman|daotong/.test(l)?'mage':/guard|general|warrior|captain|exorcist/.test(l)?'knight':'rogue';};
const mobMdl=t=>{if(t.draw&&t.draw!=='human')return null;const l=t.look||'';if(/ghoul|ghost|demon|skel|undead|zombie|lich|chaos|flame|dark/.test(l))return t.boss?'skelw':'skel';return t.boss?'knight':/bandit|thief|rogue|assassin|wild/.test(l)?'rogue':'barb';};
function makeModel(k,scale,name,ncol,pick){const M=MDL[k],g=new THREE.Group(),inst=THREE.SkeletonUtils.clone(M.scene),sc=scale||1;inst.scale.setScalar(1.55/M.h*sc);g.add(inst);
  const mixer=new THREE.AnimationMixer(inst),acts={};for(const a of M.anims)acts[a.name]=mixer.clipAction(a);
  for(const n of ['1H_Melee_Attack_Chop','Spellcast_Shoot','Hit_A','Death_A'])if(acts[n]){acts[n].setLoop(THREE.LoopOnce,1);acts[n].clampWhenFinished=true;}
  if(acts.Idle){acts.Idle.play();acts.Idle.time=Math.random()*2;}
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=0.03;sh.scale.set(1.0*sc,0.65*sc,1);g.add(sh);
  const hit=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,opacity:0,depthWrite:false}));hit.center.set(0.5,0);hit.scale.set(0.9*sc,1.7*sc,1);g.add(hit);
  if(name){const lb=mkLabel(name,ncol);lb.position.y=1.85*sc;g.add(lb);}
  Object.assign(g.userData,{model:true,mixer,acts,cur:'Idle',sp:hit,pick});return g;}
function animModel(o,dt,moving,atk,hurt,dead,cast){const u=o.userData,A=u.acts;let want=dead?'Death_A':moving?'Running_A':'Idle';
  if(!dead){if(atk>0&&!u.atkOn){u.atkOn=true;want=cast&&A.Spellcast_Shoot?'Spellcast_Shoot':'1H_Melee_Attack_Chop';u.lock=0.6;}else if(atk<=0)u.atkOn=false;
    if(hurt&&!u.hurtOn&&!(u.lock>0)){u.hurtOn=true;want='Hit_A';u.lock=0.35;}else if(!hurt)u.hurtOn=false;}
  u.lock=Math.max(0,(u.lock||0)-dt);if(u.lock>0&&(want==='Idle'||want==='Running_A'))want=u.cur;
  if(want!==u.cur&&A[want]){const from=A[u.cur],to=A[want];to.reset();to.setEffectiveWeight(1);to.play();if(from&&from!==to)from.crossFadeTo(to,0.18,false);u.cur=want;}
  if(A.Running_A)A.Running_A.timeScale=1.15;u.mixer.update(dt);}
function update3D(dt){UT.value=nowT;for(const o of V3.objs.values())o.userData.seen=false;
  // người chơi (cả thú cưỡi, hào quang)
  const pk=SECT_MDL[player.sect],rideNow=(player.riding&&player.mount)||player.flying;
  if(!rideNow&&mdl(pk)){const o=objFor('player_m',()=>makeModel(pk,1,player.name,'#9fffb0'));place(o,player.x,player.y,player.moving,player.face,dt,0);animModel(o,dt,player.moving,player.atkAnim,player.hitFlash>0,player.dead,CASTER[player.sect]);}
  else{const p=objFor('player',()=>makeBB(170,190,85,170,1.1));placeBB(p,player.x,player.y,dt);
  {const v=viewDir(p,player.face),rideM=player.riding&&typeof MOUNTS!=='undefined'&&MOUNTS[player.mount],ry=rideM?(typeof mountRideY==='function'?mountRideY(rideM):-24):0,fy=player.flying?-16-Math.sin(nowT*3)*3:0;
   bbDraw(p,()=>{const al=typeof setAuraLv==='function'?setAuraLv():0;if(al)drawSetAura(0,0,fy,al,0);if(player.flying)drawFlySword(0,fy+1,v.face,playerW.type==='sword'?playerW.col:'#bfe0ff',playerW.glow||'#9fd3ff');
     if(rideM)drawSteed(player.mount,0,0,v.face,player.moving,0);if(player.dead){ctx.globalAlpha=0.5;}
     drawChibi(playerLook,0,fy+ry,1,rideM?'side':v.dir,v.face,player.moving&&!player.flying&&!rideM,player.atkAnim,player.hitFlash>0,Object.assign({},playerW,{style:player.combo||0}),0.3);
     label(player.name,0,fy+ry-76,'#9fffb0',11);},1);}}
  // thú nuôi
  if(typeof petDef==='function'&&petDef()&&player.petOn&&!player.dead){const q=objFor('pet',()=>makeBB(110,110,55,92,0.6));placeBB(q,PET.x,PET.y,dt);const v=viewDir(q,PET.face);bbDraw(q,()=>drawPetAt(player.pet,0,0,v.face,PET.moving,PET.atkAnim,null),1);}
  // NPC
  for(const n of npcs){const k=npcMdl(n.look);if(mdl(k)){const o=objFor('npcm_'+n.id,()=>makeModel(k,1,n.name,'#ffe27a',{npc:n}));place(o,n.x,n.y,false,0,dt,0);animModel(o,dt,false,0,false,false,false);if(!V3.pick.includes(o))V3.pick.push(o);continue;}
    const o=objFor('npc_'+n.id,()=>makeBB(150,150,75,130,0.9,{npc:n}));const d=placeBB(o,n.x,n.y,dt);if(!V3.pick.includes(o))V3.pick.push(o);
    bbDraw(o,()=>drawNpc(Object.assign({},n,{x:0,y:0})),d<18?2:6);}
  // quái
  for(const m of mobs){if(m.isFoe)continue;const mk=mobMdl(m.t);if(mk&&mdl(mk)){const key='mm';let o=V3.objs.get(m);if(o&&!o.userData.model){V3.scene.remove(o);V3.objs.delete(m);}
      o=objFor(m,()=>makeModel(mk,(m.t.scale||1)*(m.t.boss?1.25:1),m.t.boss?m.t.name:null,'#ff9a7a',{mob:m}));o.visible=!m.dead||m.fade>0;if(!o.visible)continue;place(o,m.x,m.y,m.moving&&!m.dead,m.face,dt,0);
      animModel(o,dt,m.moving,m.atkAnim,m.hitFlash>0,m.dead,false);if(!V3.pick.includes(o))V3.pick.push(o);continue;}
    const sc=m.t.scale||1;const o=objFor(m,()=>{const W=Math.round(150*Math.max(1,sc*0.9)),H=Math.round(150*Math.max(1,sc*0.9));return makeBB(W,H,W/2,H-20,0.8*sc,{mob:m});});
    o.visible=!m.dead||m.fade>0;if(!o.visible)continue;const dd=placeBB(o,m.x,m.y,dt);if(!V3.pick.includes(o))V3.pick.push(o);
    const v=viewDir(o,m.face);bbDraw(o,()=>{if(m.dead)ctx.globalAlpha=Math.max(0,m.fade/0.6);const mm=Object.assign(Object.create(m),{face:v.face,dir:v.dir});drawMonsterBody(mm,0,0,m.hitFlash>0);
      if(!m.dead&&m.hp<m.maxhp){const w=40;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(-w/2,-m.t.hh*sc-14,w,5);ctx.fillStyle='#e04a3a';ctx.fillRect(-w/2,-m.t.hh*sc-14,w*Math.max(0,m.hp/m.maxhp),5);}
      if(m.t.boss)label(m.t.name,0,-m.t.hh*sc-20,'#ff9a7a',11);},dd<22?1:4);}
  // người chơi khác
  if(typeof NET!=='undefined')for(const ot of NET.others.values()){if(!ot.look)continue;const ok=SECT_MDL[ot.sect];if(!ot.mt&&!ot.fl&&mdl(ok)){const o=objFor('om_'+ot.id,()=>makeModel(ok,1,ot.name,'#8fd8ff'));place(o,ot.x,ot.y,!!ot.mv,ot.face,dt,0);animModel(o,dt,!!ot.mv,ot.at?1:0,false,!!ot.dead,CASTER[ot.sect]);continue;}
    const o=objFor('o_'+ot.id,()=>makeBB(170,190,85,170,1.1));placeBB(o,ot.x,ot.y,dt);const v=viewDir(o,ot.face);
    const rM=ot.mt&&typeof MOUNTS!=='undefined'&&MOUNTS[ot.mt],ry=rM?(typeof mountRideY==='function'?mountRideY(rM):-24):0;
    bbDraw(o,()=>{if(ot.sa&&typeof drawSetAura==='function')drawSetAura(0,0,0,Math.min(3,ot.sa|0),0);if(rM)drawSteed(ot.mt,0,0,v.face,!!ot.mv,ot.x*0.01);
      drawChibi(ot.look,0,ry,1,rM?'side':v.dir,v.face,!!ot.mv&&!rM,ot.atk||0,false,Object.assign({},ot.wv,{style:ot.cs||0}),ot.x*0.01);label(ot.name,0,ry-76,'#8fd8ff',11);},1);}
  for(const [k,o] of V3.objs)if(!o.userData.seen){V3.scene.remove(o);o.userData.tex&&o.userData.tex.dispose();V3.objs.delete(k);const i=V3.pick.indexOf(o);if(i>=0)V3.pick.splice(i,1);}
  // vòng chọn mục tiêu
  let ring=V3.ring;if(!ring){ring=V3.ring=new THREE.Mesh(new THREE.RingGeometry(0.55,0.7,32),new THREE.MeshBasicMaterial({color:0xff5040,transparent:true,opacity:0.8,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;V3.scene.add(ring);}
  const tg=player.target;if(tg&&!tg.dead){ring.visible=true;ring.position.set(tg.x/T,hAt(tg.x/T,tg.y/T)+0.05,tg.y/T);ring.scale.setScalar((tg.t.scale||1)*(tg.t.boss?1.8:1));}else ring.visible=false;
  for(const pt of V3.portals)pt.rotation.y+=dt*1.5;if(V3.water)V3.water.material.opacity=0.8+0.04*Math.sin(nowT*1.5);
  // camera theo nhân vật
  const X=player.x/T,Z=player.y/T;V3.tgt.lerp(new THREE.Vector3(X,hAt(X,Z)+0.9,Z),Math.min(1,dt*6));const c=V3.cam,cp=Math.cos(V3.pitch);
  c.position.set(V3.tgt.x+Math.sin(V3.yaw)*V3.dist*cp,V3.tgt.y+Math.sin(V3.pitch)*V3.dist,V3.tgt.z+Math.cos(V3.yaw)*V3.dist*cp);c.lookAt(V3.tgt);
  V3.sun.position.set(V3.tgt.x-14,V3.tgt.y+24,V3.tgt.z-10);V3.sun.target.position.copy(V3.tgt);if(V3.dome)V3.dome.position.copy(c.position);}
// chữ bay (sát thương, kinh nghiệm...) vẽ lên lớp 2D trong suốt phía trên cảnh 3D
function drawOverlay(){const c=V3.oc,cv2=V3.ov;if(cv2.width!==Math.round(innerWidth*DPR)||cv2.height!==Math.round(innerHeight*DPR)){cv2.width=Math.round(innerWidth*DPR);cv2.height=Math.round(innerHeight*DPR);}
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cv2.width,cv2.height);c.setTransform(DPR,0,0,DPR,0,0);const v=new THREE.Vector3();
  for(const f of fx){if(f.k!=='t')continue;const X=f.x/T,Z=f.y/T;v.set(X,hAt(X,Z)+1.6+f.t*1.2,Z).project(V3.cam);if(v.z>1)continue;const sx=(v.x+1)/2*innerWidth,sy=(1-v.y)/2*innerHeight,a=1-f.t/f.life;
    c.globalAlpha=Math.max(0,Math.min(1,a*1.5));c.font=`bold ${f.size||14}px ${f.serif?'serif':'"Segoe UI",Arial'}`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.8)';c.strokeText(f.txt,sx,sy);c.fillStyle=f.col||'#fff';c.fillText(f.txt,sx,sy);}c.globalAlpha=1;}
// ---------- bật / tắt ----------
function ensureRenderer(){if(V3.renderer)return;const r=new THREE.WebGLRenderer({antialias:true});r.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));r.setSize(innerWidth,innerHeight);r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;r.outputColorSpace=THREE.SRGBColorSpace;
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
  const sprites=V3.pick.map(o=>o.userData.sp).filter(Boolean),hits=rc.intersectObjects(sprites,false);for(const h of hits){const P=h.object.parent&&h.object.parent.userData.pick;if(!P)continue;
    if(P.mob&&!P.mob.dead){navGoal=null;player.target=P.mob;player.npc=null;player.gather=null;player.repath=0;return;}
    if(P.npc){navGoal=null;player.npc=P.npc;player.target=null;player.gather=null;player.repath=0;return;}}
  const g=rc.intersectObject(V3.ground,false)[0];if(!g)return;const wx=g.point.x*T,wy=g.point.z*T;
  for(const h of herbs)if(!h.dead&&Math.hypot(h.x-wx,h.y-wy)<28){navGoal=null;player.gather=h;player.target=null;player.npc=null;player.repath=0;return;}
  groundMove(wx,wy);}
// ---------- nút bật/tắt ----------
(()=>{const b=document.createElement('button');b.id='btn3D';b.textContent='3D';b.title='Chế độ 3D thử nghiệm (hiện chỉ có ở Trúc Khê Thôn)';$('menuBtns').insertBefore(b,$('btnSet'));
  const sync=()=>{b.style.background=want3D()?'linear-gradient(#5aa0e0,#2a5a9a)':'';b.style.color=want3D()?'#fff':'';};sync();
  b.onclick=()=>{if(!hasGL)return log('Máy này không hỗ trợ 3D (WebGL)','#ff9a8a');const on=!want3D();try{on?localStorage.setItem('tk_3d','1'):localStorage.removeItem('tk_3d');}catch(e){}sync();sfx('click');
    log(on?(MAPS3D.includes(curMapId)?'Đã bật 3D thử nghiệm. Kéo để xoay camera, lăn chuột / chụm 2 ngón để phóng to.':'Đã bật 3D thử nghiệm: hiện chỉ có ở Trúc Khê Thôn, các bản đồ khác vẫn 2D.'):'Đã tắt 3D, về chế độ 2D','#8fd8ff');};})();
window.V3=V3;
