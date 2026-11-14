'use strict';
// ===================== NHẠC CỔ PHONG (game tự soạn, tự tổng hợp — không dùng nhạc của ai) =====================
// Nhạc cụ tổng hợp: đàn tranh (mô phỏng dây gảy Karplus–Strong, có nhấn/luyến, vuốt dây), cổ cầm, tỳ bà (vê), sáo trúc (hơi thở + rung),
// trống, mõ, chuông chùa. Mỗi bản đồ một bài riêng: giọng, điệu thức ngũ cung, nhịp độ, nhạc cụ khác nhau;
// giai điệu soạn theo câu đoạn A A' B A'' (16 ô nhịp), lặp lại có biến tấu. Đánh boss / tỷ thí: bản biến tấu dồn dập của chính bài vùng đó.
const NH={buf:new Map(),bus:null,key:'',piece:null,step:0,next:0,loop:0,noise:null,lastEr:null,curve:null};
function nhInit(){const a=AU.ctx;if(NH.bus||!a)return;NH.bus=a.createGain();NH.bus.gain.value=0.9;NH.bus.connect(AU.musG);
  const len=Math.round(a.sampleRate*2.8),ir=a.createBuffer(2,len,a.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3);}
  const rv=a.createConvolver();rv.buffer=ir;const rg=a.createGain();rg.gain.value=0.42;NH.bus.connect(rg);rg.connect(rv);rv.connect(AU.musG);
  const nb=a.createBuffer(1,a.sampleRate,a.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;NH.noise=nb;}
// ---- dây gảy (Karplus–Strong), tạo sẵn 1 lần cho mỗi cao độ ----
function ksBuf(f,dur,bright,loss){const a=AU.ctx,sr=a.sampleRate,P=Math.max(2,Math.round(sr/f)),key=P+'|'+bright+'|'+loss+'|'+dur;let b=NH.buf.get(key);if(b)return b;
  const N=Math.round(sr*dur),out=new Float32Array(N),line=new Float32Array(P);let pv=0;
  for(let i=0;i<P;i++){pv+=((Math.random()*2-1)-pv)*bright;line[i]=pv;}let m=0;for(let i=0;i<P;i++)m+=line[i];m/=P;for(let i=0;i<P;i++)line[i]-=m;
  // vị trí gảy gần đầu dây -> tiếng sáng, có "phím" đặc trưng đàn tranh
  const pp=Math.max(1,Math.round(P*0.13));for(let i=P-1;i>=pp;i--)line[i]-=line[i-pp]*0.6;
  let idx=0;for(let i=0;i<N;i++){const c=line[idx],n=line[idx+1<P?idx+1:0];out[i]=c;line[idx]=loss*0.5*(c+n);idx=idx+1<P?idx+1:0;}
  let mx=1e-6;for(let i=0;i<Math.min(N,P*30);i++)mx=Math.max(mx,Math.abs(out[i]));const k=0.9/mx;for(let i=0;i<N;i++)out[i]*=k;
  // mềm phần cuối để không bị "cụt"
  const tail=Math.min(N,Math.round(sr*0.08));for(let i=0;i<tail;i++)out[N-1-i]*=i/tail;
  b=a.createBuffer(1,N,sr);b.copyToChannel(out,0);NH.buf.set(key,b);return b;}
function str(f,t,vol,o){o=o||{};const a=AU.ctx,sr=a.sampleRate,P=Math.max(2,Math.round(sr/f)),src=a.createBufferSource(),dur=o.dur||2.4;src.buffer=ksBuf(f,dur,o.bright||0.6,o.loss||0.996);
  const r=P*f/sr;src.playbackRate.setValueAtTime(r,t);
  if(o.bend){src.playbackRate.setValueAtTime(r,t+0.1);src.playbackRate.linearRampToValueAtTime(r*Math.pow(2,o.bend/12),t+0.28);src.playbackRate.linearRampToValueAtTime(r,t+0.5);}  // nhấn
  if(o.slide){src.playbackRate.setValueAtTime(r*Math.pow(2,-o.slide/12),t);src.playbackRate.linearRampToValueAtTime(r,t+0.09);}                                                   // luyến lên
  if(o.vib){const l=a.createOscillator(),lg=a.createGain();l.frequency.value=5.5;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(r*0.012,t+0.35);l.connect(lg);lg.connect(src.playbackRate);l.start(t);l.stop(t+dur);}
  const fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=o.lp||7000;const g=a.createGain();g.gain.value=vol;const p=a.createStereoPanner?a.createStereoPanner():null;
  src.connect(fl);fl.connect(g);if(p){p.pan.value=o.pan||0;g.connect(p);p.connect(NH.bus);}else g.connect(NH.bus);src.start(t);src.stop(t+dur);}
const zheng=(f,t,v,o)=>str(f,t,v,Object.assign({bright:0.62,loss:0.9962,lp:7500,pan:0.15},o));
const guqin=(f,t,v,o)=>str(f,t,v,Object.assign({bright:0.32,loss:0.9982,lp:1900,dur:3.2,pan:-0.2},o));
function pipa(f,t,dur,v,o){const n=Math.max(1,Math.floor(dur/0.065));for(let i=0;i<n;i++)str(f,t+i*0.065,v*(i?0.55+0.25*Math.sin(i):1),Object.assign({bright:0.75,loss:0.985,lp:6000,dur:0.5,pan:0.25},o));}
function gliss(fs,t,v,dir){t=Math.max(t,AU.ctx.currentTime+0.01);const L=dir<0?fs.slice().reverse():fs;L.forEach((f,i)=>zheng(f,t+i*0.032,v*(0.5+i/L.length*0.5),{dur:1.6}));}
function dizi(f,t,dur,v,o){o=o||{};const a=AU.ctx,o1=a.createOscillator(),o2=a.createOscillator(),g=a.createGain(),g2=a.createGain(),lfo=a.createOscillator(),lg=a.createGain();
  o1.type='sine';o2.type='sine';o2.frequency.value=f*2;g2.gain.value=0.16;o1.frequency.setValueAtTime(f*(o.grace?0.89:0.97),t);o1.frequency.linearRampToValueAtTime(f,t+(o.grace?0.1:0.05));
  lfo.frequency.value=5+Math.random();lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*0.011,t+Math.min(0.6,dur*0.6));lfo.connect(lg);lg.connect(o1.frequency);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+0.07);g.gain.setValueAtTime(v*0.92,Math.max(t+0.08,t+dur-0.18));g.gain.linearRampToValueAtTime(0.0001,t+dur+0.05);
  const bn=a.createBufferSource(),bf=a.createBiquadFilter(),bg=a.createGain();bn.buffer=NH.noise;bf.type='bandpass';bf.frequency.value=f*2.2;bf.Q.value=3;bg.gain.setValueAtTime(0.0001,t);bg.gain.linearRampToValueAtTime(v*0.35,t+0.04);bg.gain.linearRampToValueAtTime(v*0.06,t+0.2);bg.gain.linearRampToValueAtTime(0.0001,t+dur);
  bn.connect(bf);bf.connect(bg);bg.connect(NH.bus);o1.connect(g);o2.connect(g2);g2.connect(g);g.connect(NH.bus);
  [o1,o2,lfo].forEach(x=>{x.start(t);x.stop(t+dur+0.1);});bn.start(t,Math.random()*0.5);bn.stop(t+dur+0.1);}
function bell(f,t,v){const a=AU.ctx;for(const [k,d,vv] of [[1,4.5,1],[2.76,2.6,0.5],[5.4,1.4,0.32],[8.93,0.8,0.18],[0.5,5,0.4]]){const o=a.createOscillator(),g=a.createGain();o.frequency.value=f*k;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v*vv,t+0.006);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(NH.bus);o.start(t);o.stop(t+d);}}
function mo(t,v){const a=AU.ctx,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(980,t);o.frequency.exponentialRampToValueAtTime(760,t+0.05);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.12);o.connect(g);g.connect(NH.bus);o.start(t);o.stop(t+0.13);}
function trong(t,v,low){const a=AU.ctx,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(low?95:150,t);o.frequency.exponentialRampToValueAtTime(low?42:70,t+0.25);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+(low?0.6:0.3));o.connect(g);g.connect(NH.bus);o.start(t);o.stop(t+0.65);
  const n=a.createBufferSource(),nf=a.createBiquadFilter(),ng=a.createGain();n.buffer=NH.noise;nf.type='lowpass';nf.frequency.value=900;ng.gain.setValueAtTime(v*0.5,t);ng.gain.exponentialRampToValueAtTime(0.0001,t+0.09);n.connect(nf);nf.connect(ng);ng.connect(NH.bus);n.start(t,Math.random()*0.5);n.stop(t+0.1);}
function chieng(t,v){const a=AU.ctx,n=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();n.buffer=NH.noise;f.type='bandpass';f.frequency.value=3200;f.Q.value=0.8;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.9);n.connect(f);f.connect(g);g.connect(NH.bus);n.start(t);n.stop(t+0.95);}
// ---- nhạc cụ thêm: nhị hồ (kéo vĩ, luyến trượt), tiêu (sáo dọc trầm), nền dàn dây ----
function erhu(f,t,dur,v,o){o=o||{};const a=AU.ctx,from=o.from&&Math.abs(Math.log2(o.from/f))<1?o.from:f,g=a.createGain(),lp=a.createBiquadFilter(),b1=a.createBiquadFilter(),b2=a.createBiquadFilter(),lfo=a.createOscillator(),lg=a.createGain(),os=[];
  for(const dt of [0,7]){const x=a.createOscillator();x.type='sawtooth';x.detune.value=dt;x.frequency.setValueAtTime(from,t);x.frequency.exponentialRampToValueAtTime(f,t+(from!==f?0.14:0.02));lg.connect(x.frequency);x.connect(lp);os.push(x);}
  lfo.frequency.value=5.6;lg.gain.setValueAtTime(0,t);lg.gain.setValueAtTime(0,t+Math.min(0.25,dur*0.4));lg.gain.linearRampToValueAtTime(f*0.016,t+Math.min(0.7,dur*0.8));lfo.connect(lg);
  lp.type='lowpass';lp.frequency.value=2800;lp.Q.value=0.6;b1.type='peaking';b1.frequency.value=850;b1.gain.value=7;b1.Q.value=1.3;b2.type='peaking';b2.frequency.value=2300;b2.gain.value=5;b2.Q.value=1.5;
  lp.connect(b1);b1.connect(b2);b2.connect(g);g.connect(NH.bus);const e=t+dur;
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v*0.75,t+0.16);g.gain.linearRampToValueAtTime(v,t+Math.max(0.2,dur*0.55));g.gain.linearRampToValueAtTime(v*0.85,Math.max(t+0.25,e-0.15));g.gain.linearRampToValueAtTime(0.0001,e+0.12);
  const bn=a.createBufferSource(),bf=a.createBiquadFilter(),bg=a.createGain();bn.buffer=NH.noise;bn.loop=true;bf.type='bandpass';bf.frequency.value=3200;bf.Q.value=0.9;bg.gain.setValueAtTime(0.0001,t);bg.gain.linearRampToValueAtTime(v*0.05,t+0.1);bg.gain.linearRampToValueAtTime(0.0001,e+0.1);bn.connect(bf);bf.connect(bg);bg.connect(NH.bus);
  os.forEach(x=>{x.start(t);x.stop(e+0.15);});lfo.start(t);lfo.stop(e+0.15);bn.start(t,Math.random()*0.5);bn.stop(e+0.15);}
const xiao=(f,t,dur,v,o)=>dizi(f,t,dur,v,Object.assign({},o));
function pad(fs,t,dur,v){const a=AU.ctx,lp=a.createBiquadFilter(),g=a.createGain();lp.type='lowpass';lp.frequency.value=1100;lp.Q.value=0.4;lp.connect(g);g.connect(NH.bus);
  g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+Math.min(1.6,dur*0.4));g.gain.setValueAtTime(v,Math.max(t+0.5,t+dur-1.2));g.gain.linearRampToValueAtTime(0.0001,t+dur+0.6);
  for(const f of fs)for(const d of [-8,0,8]){const o=a.createOscillator();o.type='sawtooth';o.frequency.value=f;o.detune.value=d+(Math.random()-0.5)*4;const og=a.createGain();og.gain.value=1/(fs.length*3);o.connect(og);og.connect(lp);o.start(t);o.stop(t+dur+0.7);}}
// ---- kèn sô-na (lảnh, mũi, rung mạnh) và chũm chọe ----
function ken(f,t,dur,v){const a=AU.ctx,g=a.createGain(),bp=a.createBiquadFilter(),pk=a.createBiquadFilter(),sh=a.createWaveShaper(),lfo=a.createOscillator(),lg=a.createGain(),os=[];
  if(!NH.curve){const c=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;c[i]=Math.tanh(x*2.2);}NH.curve=c;}sh.curve=NH.curve;
  for(const [ty,dt] of [['sawtooth',0],['square',-5]]){const x=a.createOscillator();x.type=ty;x.detune.value=dt;x.frequency.setValueAtTime(f*0.92,t);x.frequency.exponentialRampToValueAtTime(f,t+0.06);lg.connect(x.frequency);x.connect(sh);os.push(x);}
  lfo.frequency.value=6.4;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(0,t+0.15);lg.gain.linearRampToValueAtTime(f*0.022,t+0.45);lfo.connect(lg);
  bp.type='bandpass';bp.frequency.value=1500;bp.Q.value=0.9;pk.type='peaking';pk.frequency.value=3100;pk.gain.value=6;pk.Q.value=1.4;sh.connect(bp);bp.connect(pk);pk.connect(g);g.connect(NH.bus);
  const e=t+dur;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+0.04);g.gain.setValueAtTime(v*0.9,Math.max(t+0.05,e-0.08));g.gain.linearRampToValueAtTime(0.0001,e+0.06);
  os.forEach(x=>{x.start(t);x.stop(e+0.1);});lfo.start(t);lfo.stop(e+0.1);}
function choe(t,v){const a=AU.ctx,n=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();n.buffer=NH.noise;f.type='highpass';f.frequency.value=5500;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.55);n.connect(f);f.connect(g);g.connect(NH.bus);n.start(t,Math.random()*0.4);n.stop(t+0.6);}
// ---- soạn nhạc ----
const PENT=[0,2,4,7,9],MODE={cung:0,thuong:1,gioc:2,chuy:3,vu:4};
const NHI=n=>261.63*Math.pow(2,n/12);
function degHz(tonic,mode,deg,scale){const S=scale||PENT,L=S.length,i=mode+deg,o=Math.floor(i/L),k=((i%L)+L)%L;return tonic*Math.pow(2,(o*12+S[k]-S[mode])/12);}
// [giọng, điệu, nhịp/phút, bè chính (êm), bè chính (thăng), bè sôi nổi, độc tấu lúc trầm, bộ gõ riêng, thang riêng]
const PIECE_DEF={
  trukhe:[2,'cung',100,'zheng','dizi','ken','xiao','mo'],        vanmong:[0,'vu',88,'zheng','erhu','pipa','xiao',''],
  thienson:[4,'thuong',80,'xiao','dizi','erhu','guqin',''],        lacnhat:[9,'vu',108,'pipa','erhu','ken','guqin','trong',[0,1,4,7,8]],
  uminh:[2,'vu',74,'guqin','erhu','pipa','guqin','bell'],          langtieu:[5,'cung',80,'guqin','xiao','dizi','guqin','bell'],
  hoadiem:[7,'chuy',116,'pipa','erhu','ken','guqin','trong'],      longcung:[3,'cung',92,'zheng','dizi','ken','xiao',''],
  tinhha:[0,'chuy',86,'zheng','erhu','ken','guqin','bell'],        thaico:[7,'vu',112,'dizi','erhu','ken','xiao','ngua'],
  huyethai:[4,'vu',98,'pipa','erhu','ken','guqin','trong'],        loiam:[10,'thuong',90,'guqin','xiao','pipa','guqin','mo'],
  thanmoc:[9,'cung',84,'dizi','zheng','erhu','xiao','bell'],       honnguyen:[2,'chuy',78,'zheng','erhu','ken','guqin','bell']};
const THEME_DEF={spring:'trukhe',marsh:'vanmong',snow:'thienson',desert:'lacnhat',dark:'uminh',heaven:'langtieu',volcano:'hoadiem',sea:'longcung',star:'tinhha',wild:'thaico',blood:'huyethai',thunder:'loiam',jade:'thanmoc',void:'honnguyen'};
function nhRand(seed){let s=seed>>>0||1;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296;}
function nhHash(str){let h=2166136261;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
// nhịp theo độ sôi (đơn vị: móc kép, 16 = 1 ô nhịp)
const RHY=[[[8,8],[12,4],[6,2,8],[16]],                                   // 0: êm, thưa
  [[4,4,8],[6,2,4,4],[4,4,4,4],[8,4,4],[6,2,8]],                          // 1: vừa
  [[4,4,4,4],[2,2,4,4,4],[4,2,2,4,4],[6,2,4,2,2],[4,4,2,2,4]],            // 2: thăng
  [[2,2,2,2,4,4],[2,2,2,2,2,2,2,2],[4,2,2,2,2,4],[1,1,2,4,2,2,4],[3,1,2,2,4,4]]]; // 3: sôi
// [tên, số ô nhịp, độ sôi, bè ('A' êm | 'B' thăng | 'C' sôi | 'S' độc tấu trầm), dịch giọng mô-típ, nốt kết, đỉnh]
const SECS=[['dao',2,0,'-',0,0],['A',4,1,'A',0,2],['A2',4,1,'A',0,0],['B',4,2,'B',2,3],['C',4,3,'C',3,4],['C2',4,3,'C',4,0,10],
  ['tram',4,0,'S',-2,0],['B2',4,2,'B',3,3,8],['A3',4,2,'A',0,0],['ket',2,0,'-',0,0]];
let SEC_AT=[];{let b=0;for(const s of SECS){for(let i=0;i<s[1];i++)SEC_AT.push([s,i]);b+=s[1];}}
const ROOTS={A:[0,0,-2,0],A2:[0,-1,-2,0],B:[3,2,1,-1],C:[0,3,1,2],C2:[3,4,2,0],tram:[0,-2,-1,0],B2:[3,2,4,0],A3:[0,-1,-2,0],dao:[0,0],ket:[0,0]};
function nhPiece(id,battle){const base=PIECE_DEF[id]?id:(THEME_DEF[(MAPS[id]||{}).theme]||'trukhe'),D=PIECE_DEF[base],R=nhRand(nhHash(base+'v3'));
  const tonic=NHI(D[0])*(D[0]>6?0.5:1),mode=MODE[D[1]],scale=D[8],tempo=battle?Math.round(D[2]*1.22):D[2];
  const walk=(d,lo,hi,big)=>{const r=R();d+=r<0.34?1:r<0.68?-1:r<0.8?2:r<0.9?-2:(big&&R()<0.5?3:-1);return Math.max(lo,Math.min(hi,d));};
  const mkMotif=(en)=>{const m=[];let d=R()<0.5?0:2;for(let bar=0;bar<2;bar++){const L=RHY[en],rh=L[Math.floor(R()*L.length)];let s=0;rh.forEach((len,k)=>{if(bar||k)d=walk(d,-1,6,en>=2);m.push({s:bar*16+s,len,deg:d});s+=len;});}return m;};
  const M1=mkMotif(1),M2=mkMotif(3);
  const phrase=(motif,en,shift,endDeg,peak)=>{const lo=-2,hi=peak||8;const out=motif.map(n=>({s:n.s,len:n.len,deg:Math.max(lo,Math.min(hi,n.deg+shift+(R()<0.25?(R()<0.5?1:-1):0)))}));
    let d=out[out.length-1].deg;for(let bar=2;bar<4;bar++){const L=RHY[en],rh=bar===3?(en>=3?[2,2,4,8]:en>=2?[4,4,8]:[4,12]):L[Math.floor(R()*L.length)];let s=0;
      rh.forEach((len,k)=>{const last=bar===3&&k===rh.length-1;if(last)d=endDeg;else if(peak&&bar===2&&k===0)d=peak;else d=walk(d,lo,hi,en>=2);out.push({s:bar*16+s,len,deg:d});s+=len;});}
    out.forEach(n=>{n.orn=n.len>=6&&R()<0.4?'bend':R()<0.14?'slide':'';});return out;};
  const mel=[];let b0=0;for(const S of SECS){const [name,bars,en,role,shift,endDeg,peak]=S;
    if(role!=='-'){let ph;if(role==='S'){ph=[];let d=0;for(let bar=0;bar<4;bar++){const rh=RHY[0][Math.floor(R()*RHY[0].length)];let s=0;rh.forEach((len,k)=>{d=bar===3&&k===rh.length-1?0:walk(d,-3,4);ph.push({s:bar*16+s,len,deg:d,orn:R()<0.3?'bend':''});s+=len;});}}
      else ph=phrase(role==='C'?M2:M1,en,shift,endDeg,peak);
      ph.forEach(n=>mel.push(Object.assign({},n,{s:n.s+b0*16,sec:name,role,en})));}
    b0+=bars;}
  mel.sort((a,b)=>a.s-b.s);const byStep=new Map();for(const n of mel){if(!byStep.has(n.s))byStep.set(n.s,[]);byStep.get(n.s).push(n);}
  return{id:base,D,tonic,mode,scale,tempo,battle,byStep,len:b0*16,hz:deg=>degHz(tonic,mode,deg,scale),chord:[0,mode===4||mode===2?1:2,3]};}
function playLead(ins,f,t,dur,v,n){const o={bend:n.orn==='bend'?2:0,slide:n.orn==='slide'?2:0};
  if(ins==='erhu'){erhu(f,t,Math.max(0.25,dur*0.98),0.13*v,{from:NH.lastEr});NH.lastEr=f;}
  else if(ins==='ken')ken(f*2,t,Math.max(0.12,dur*0.92),0.07*v);
  else if(ins==='dizi')dizi(f*2,t,Math.max(0.2,dur*0.95),0.13*v,{grace:n.orn!==''});
  else if(ins==='xiao')xiao(f,t,Math.max(0.3,dur*0.95),0.16*v,{grace:n.orn!==''});
  else if(ins==='pipa'){if(dur>0.45)pipa(f*2,t,Math.min(dur,1.4),0.3*v);else str(f*2,t,0.38*v,{bright:0.78,loss:0.99,lp:6500,dur:0.8});}
  else if(ins==='guqin')guqin(f,t,0.62*v,o);
  else zheng(f*2,t,0.5*v,Object.assign(o,{vib:dur>0.8}));}
function nhSchedule(P,s,t,sd){if(s>=P.len)return;const D=P.D,hz=P.hz,bar=Math.floor(s/16),i16=s%16,[S,bIn]=SEC_AT[bar],sec=S[0],town=!!P.town,loopOdd=NH.loop%2===1;
  let en=S[2];if(P.battle)en=Math.max(2,en);if(town)en=Math.min(en,1);
  const hum=()=>(Math.random()-0.5)*0.012,ROOT=(ROOTS[sec]||[0])[bIn]||0,barDur=sd*16;
  // giai điệu
  const ns=P.byStep.get(s);if(ns)for(const n of ns){let ins=n.role==='A'?D[3]:n.role==='B'?D[4]:n.role==='C'?D[5]:D[6];
    if(loopOdd&&n.role==='A')ins=D[4];if(loopOdd&&n.role==='B')ins=D[3];if(sec==='C2'&&loopOdd)ins='erhu';if(town&&ins==='ken')ins=D[3];
    const dur=n.len*sd,v=(town?0.85:1)*(en>=3?1.12:en===0?0.85:1);playLead(ins,hz(n.deg),t+hum(),dur,v,n);
    // bè phụ ở các nốt dài
    if(n.len>=6&&en>=1&&(sec==='A2'||sec==='A3'||sec==='B2'||sec==='C2')){const ci=ins==='zheng'||ins==='pipa'?'xiao':'zheng',cf=hz(n.deg-2);if(ci==='xiao')xiao(cf,t+sd*2,Math.max(0.3,dur-sd*2),0.08);else zheng(cf*2,t+sd*2,0.22,{dur:2});}}
  // dạo đầu / kết
  if(sec==='dao'&&s===0){const fs=[];for(let k=-2;k<8;k++)fs.push(hz(k)*2);gliss(fs,t,0.18,1);guqin(hz(-5),t+barDur*0.5,0.45);if(D[7]==='bell')bell(hz(0)*2,t+barDur,0.12);}
  if(sec==='dao'&&s===20)zheng(hz(4)*2,t,0.3,{vib:true});
  if(sec==='ket'&&bIn===0&&i16===0){guqin(hz(-5),t,0.5);zheng(hz(0)*2,t,0.35,{vib:true});const fs=[];for(let k=7;k>=-2;k--)fs.push(hz(k)*2);gliss(fs,t+barDur,0.14,1);}
  // nền dàn dây (to ở đoạn sôi, mỏng ở đoạn trầm)
  if(i16===0&&bar%2===0&&sec!=='ket')pad(P.chord.map(c=>hz(ROOT+c-5)),t,barDur*2,[0.045,0.06,0.075,0.095][en]);
  // trầm: cổ cầm theo độ sôi
  if(sec!=='dao'&&sec!=='ket'){if(i16===0)guqin(hz(ROOT-5),t,0.4);if(en>=2&&i16===8)guqin(hz(ROOT-5+(en>=3?3:0)),t,0.3);if(en>=3&&(i16===4||i16===12))guqin(hz(ROOT-5),t,0.22);}
  // đàn rải: êm = móc đơn thưa, sôi = móc kép dồn
  const arp=[0,1,2,3,2,1];
  if(sec!=='dao'&&sec!=='ket'&&en>=1){const every=en>=3?2:en===2?2:4;if(i16%every===0&&i16>0){const k=(i16/every)|0,f=hz(ROOT+arp[k%arp.length]+(en>=3?2:0));
      if(en>=3&&D[5]!=='pipa')str(f*2,t+hum(),0.13,{bright:0.75,loss:0.985,lp:6500,dur:0.6,pan:-0.35});else zheng(f*2,t+hum(),en>=2?0.14:0.11,{dur:1.6,pan:-0.35});}}
  // vuốt dây chuyển đoạn
  if(bIn===0&&i16===0&&bar>0&&sec!=='ket'&&!town){const fs=[];for(let k=-3;k<6;k++)fs.push(hz(k)*2);gliss(fs,t-0.3,en>=2?0.15:0.1,1);}
  // bộ gõ riêng của vùng (luôn có, nhẹ)
  const perc=D[7];
  if(perc==='mo'&&i16%8===0&&en<=1)mo(t,i16===0?0.13:0.08);
  if(perc==='bell'&&bIn===0&&i16===0&&sec!=='dao')bell(hz(0)*(P.id==='uminh'?1.06:2),t,0.1);
  if(perc==='ngua'&&en>=1&&!town){if(i16%4===0)trong(t,0.22,true);if(i16%8===6)trong(t,0.13,false);}
  // trống theo độ sôi: 2 = trống nhẹ, 3 = trống dồn + chũm chọe + chiêng mở đoạn
  if(!town){if(en===2){if(i16===0||i16===8)trong(t,0.3,true);if(i16===6||i16===14)trong(t,0.16,false);}
    if(en>=3){if(i16%4===0)trong(t,0.36,true);if(i16%4===2)trong(t,0.18,false);if(i16===4||i16===12)choe(t,0.09);if(bIn===0&&i16===0)chieng(t,0.14);if(bIn===3&&i16>=8&&i16%1===0)trong(t,0.2,false);}
    if(perc==='trong'&&en===1&&i16===0)trong(t,0.26,true);}}
function inTown(){const S=CM&&CM.gen&&CM.gen.safe;if(!S||typeof player==='undefined')return false;const x=player.x/T,y=player.y/T;return x>=S.x0-2&&x<=S.x1+2&&y>=S.y0-2&&y<=S.y1+2;}
// thay bộ tạo nhạc cũ (nhạc tự chọn mp3 / YouTube vẫn được ưu tiên như trước)
musicTick=function(){const a=AU.ctx;if(!a||!AU.music||AU.custom)return;nhInit();if(!NH.bus)return;
  const battle=AU.mood==='battle',id=(typeof curMapId!=='undefined'&&curMapId)||'trukhe',key=id+(battle?'|b':'');
  if(key!==NH.key){NH.key=key;NH.piece=nhPiece(id,battle);NH.step=battle?16*10:0;NH.loop=0;NH.lastEr=null;NH.next=Math.max(a.currentTime+0.25,NH.next||0);}
  const P=NH.piece;P.town=!battle&&inTown();const sd=60/(P.tempo*(P.town?0.92:1))/4;
  while(NH.next<a.currentTime+0.5){try{nhSchedule(P,NH.step,NH.next,sd);}catch(e){}NH.next+=sd;NH.step++;
    if(NH.step>=P.len+(P.battle?0:8)){NH.step=P.battle?16*10:0;NH.loop++;}}};
if(AU.timer){clearInterval(AU.timer);AU.timer=setInterval(musicTick,90);}
