'use strict';
// ===================== NHẠC CỔ PHONG (game tự soạn, tự tổng hợp — không dùng nhạc của ai) =====================
// Nhạc cụ tổng hợp: đàn tranh (mô phỏng dây gảy Karplus–Strong, có nhấn/luyến, vuốt dây), cổ cầm, tỳ bà (vê), sáo trúc (hơi thở + rung),
// trống, mõ, chuông chùa. Mỗi bản đồ một bài riêng: giọng, điệu thức ngũ cung, nhịp độ, nhạc cụ khác nhau;
// giai điệu soạn theo câu đoạn A A' B A'' (16 ô nhịp), lặp lại có biến tấu. Đánh boss / tỷ thí: bản biến tấu dồn dập của chính bài vùng đó.
const NH={buf:new Map(),bus:null,key:'',piece:null,step:0,next:0,loop:0,noise:null};
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
function gliss(fs,t,v,dir){const L=dir<0?fs.slice().reverse():fs;L.forEach((f,i)=>zheng(f,t+i*0.032,v*(0.5+i/L.length*0.5),{dur:1.6}));}
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
// ---- soạn nhạc ----
const PENT=[0,2,4,7,9],MODE={cung:0,thuong:1,gioc:2,chuy:3,vu:4};
const NHI=n=>261.63*Math.pow(2,n/12); // n = nửa cung so với Đô
function degHz(tonic,mode,deg,scale){const S=scale||PENT,L=S.length,i=mode+deg,o=Math.floor(i/L),k=((i%L)+L)%L;return tonic*Math.pow(2,(o*12+S[k]-S[mode])/12);}
// [giọng (nửa cung so với Đô), điệu, nhịp/phút, đàn chính, đàn phụ, bộ gõ, sáo ở đoạn B, thang riêng]
const PIECE_DEF={
  trukhe:[2,'cung',78,'zheng','guqin','mo',1],       vanmong:[0,'vu',66,'zheng','zheng','',1],
  thienson:[4,'thuong',58,'dizi','zheng','',0],       lacnhat:[9,'vu',86,'pipa','guqin','trong',0,[0,1,4,7,8]],
  uminh:[2,'vu',50,'guqin','guqin','bell',0],         langtieu:[5,'cung',60,'guqin','zheng','bell',1],
  hoadiem:[7,'chuy',94,'pipa','guqin','trong',0],     longcung:[3,'cung',70,'zheng','zheng','',1],
  tinhha:[0,'chuy',64,'zheng','guqin','bell',1],      thaico:[7,'vu',90,'dizi','guqin','ngua',0],
  huyethai:[4,'vu',74,'pipa','guqin','trong',0],      loiam:[10,'thuong',68,'guqin','zheng','mo',1],
  thanmoc:[9,'cung',62,'dizi','zheng','bell',0],      honnguyen:[2,'chuy',56,'zheng','guqin','bell',1]};
const THEME_DEF={spring:'trukhe',marsh:'vanmong',snow:'thienson',desert:'lacnhat',dark:'uminh',heaven:'langtieu',volcano:'hoadiem',sea:'longcung',star:'tinhha',wild:'thaico',blood:'huyethai',thunder:'loiam',jade:'thanmoc',void:'honnguyen'};
function nhRand(seed){let s=seed>>>0||1;return()=>(s=(s*1664525+1013904223)>>>0)/4294967296;}
function nhHash(str){let h=2166136261;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0;}
const RHY_SLOW=[[4,4],[2,2,4],[6,2],[3,1,4],[2,2,2,2],[8]],RHY_MID=[[2,2,2,2],[3,1,2,2],[2,1,1,4],[4,2,2],[1,1,2,2,2],[2,2,4],[3,1,3,1]];
function nhPiece(id,battle){const base=PIECE_DEF[id]?id:(THEME_DEF[(MAPS[id]||{}).theme]||'trukhe'),D=PIECE_DEF[base],R=nhRand(nhHash(base));
  const tonic=NHI(D[0])*(D[0]>6?0.5:1),mode=MODE[D[1]],scale=D[7],tempo=battle?Math.round(D[2]*1.4):D[2],slow=tempo<64;
  // giai điệu: 4 câu × 4 ô nhịp × 8 phách móc
  const phrase=(startDeg,endDeg,lo,hi)=>{const notes=[];let d=startDeg;for(let bar=0;bar<4;bar++){const rh=(slow?RHY_SLOW:RHY_MID)[Math.floor(R()*(slow?RHY_SLOW:RHY_MID).length)];let s=0;
      rh.forEach((len,k)=>{const lastNote=bar===3&&k===rh.length-1;if(lastNote)d=endDeg;else if(bar>0||k>0){const r=R();d+=r<0.36?1:r<0.72?-1:r<0.82?2:r<0.92?-2:(R()<0.5?3:-3);d=Math.max(lo,Math.min(hi,d));}
        notes.push({s:bar*8+s,len:lastNote?Math.max(len,4):len,deg:d,orn:R()<0.18?'bend':R()<0.12?'slide':''});s+=len;});}return notes;};
  const A=phrase(0,2,-1,6),A2=A.slice(0,-1).concat([Object.assign({},A[A.length-1],{deg:0})]),B=phrase(4,3,1,8),A3=A2.map(n=>Object.assign({},n));
  const mel=[];[A,A2,B,A3].forEach((P,pi)=>P.forEach(n=>mel.push(Object.assign({},n,{s:n.s+pi*32,sec:pi===2?'B':'A'}))));
  return{id:base,D,tonic,mode,scale,tempo,battle,mel,len:128,hz:deg=>degHz(tonic,mode,deg,scale)};}
function nhSchedule(P,s,t,stepDur){if(s>=P.len)return;const D=P.D,lead=D[3],acc=D[4],perc=D[5],flute=D[6],hz=P.hz,loopOdd=NH.loop%2===1,bar=Math.floor(s/8),inBar=s%8;
  const hum=()=>(Math.random()-0.5)*0.012;
  // giai điệu
  for(const n of P.mel)if(n.s===s){const f=hz(n.deg)*(lead==='guqin'?1:2),dur=n.len*stepDur,useFlute=(n.sec==='B'&&flute)||lead==='dizi'||(loopOdd&&flute&&n.sec==='A'&&lead!=='guqin');
    const v=0.46+Math.random()*0.08;
    if(useFlute)dizi(f*(lead==='dizi'?1:1),t+hum(),Math.max(0.25,dur*0.95),0.14,{grace:n.orn!==''});
    else if(lead==='pipa'||P.battle&&dur>stepDur*2.5)pipa(f,t+hum(),Math.min(dur,stepDur*4),0.3);
    else if(lead==='guqin')guqin(f,t+hum(),0.62,{bend:n.orn==='bend'?2:0,slide:n.orn==='slide'?2:0});
    else zheng(f,t+hum(),v,{bend:n.orn==='bend'?(n.deg%2?2:1):0,slide:n.orn==='slide'?2:0,vib:dur>stepDur*3});}
  // đệm: trầm ở đầu ô nhịp, rải hợp âm ngũ cung
  const rootDeg=[0,0,-2,0, 0,-1,-2,0, 3,2,1,-1, 0,-2,-1,0][bar%16];
  if(inBar===0){guqin(hz(rootDeg-5),t,0.4);if(acc==='zheng'&&!P.battle)zheng(hz(rootDeg),t+stepDur*0.02,0.12,{dur:3});}
  if(acc==='zheng'&&[2,4,6].includes(inBar)&&!slowSkip(P,inBar))zheng(hz(rootDeg+[0,2,1,3][(inBar/2)|0]),t+hum(),0.16,{dur:1.8,pan:-0.3});
  if(acc==='guqin'&&inBar===4)guqin(hz(rootDeg-3),t,0.22);
  // vuốt dây ở đầu mỗi câu (trừ câu đầu)
  if(s%32===0&&s>0&&(lead==='zheng'||acc==='zheng')){const fs=[];for(let k=-3;k<6;k++)fs.push(hz(k)*2);gliss(fs,t-0.28,0.14,1);}
  // bộ gõ
  if(perc==='mo'&&inBar%4===0)mo(t,inBar===0?0.16:0.1);
  if(perc==='bell'&&s%32===0)bell(hz(0)*(P.id==='uminh'?1.06:2),t,0.12);
  if(perc==='trong'){if(inBar===0)trong(t,0.4,true);if(inBar===3||inBar===6)trong(t,0.22,false);}
  if(perc==='ngua'){if(inBar%2===0)trong(t,0.25,true);if(inBar%4===3)trong(t,0.15,false);} // nhịp vó ngựa thảo nguyên
  if(P.battle){if(inBar%2===0)trong(t,0.38,true);if(inBar===4)trong(t,0.25,false);if(s%32===0)chieng(t,0.12);}}
function slowSkip(P,inBar){return P.tempo<60&&inBar===6;}
// thay bộ tạo nhạc cũ (nhạc tự chọn mp3 / YouTube vẫn được ưu tiên như trước)
musicTick=function(){const a=AU.ctx;if(!a||!AU.music||AU.custom)return;nhInit();if(!NH.bus)return;
  const battle=AU.mood==='battle',id=(typeof curMapId!=='undefined'&&curMapId)||'trukhe',key=id+(battle?'|b':'');
  if(key!==NH.key){NH.key=key;NH.piece=nhPiece(id,battle);NH.step=0;NH.loop=0;NH.next=Math.max(a.currentTime+0.25,NH.next||0);}
  const P=NH.piece,stepDur=60/P.tempo/2;
  while(NH.next<a.currentTime+0.5){try{nhSchedule(P,NH.step,NH.next,stepDur);}catch(e){}NH.next+=stepDur;NH.step++;
    if(NH.step>=P.len+(P.battle?0:8)){NH.step=0;NH.loop++;}}};   // nghỉ 1 ô nhịp giữa hai lượt (trừ khi đánh nhau)
if(AU.timer){clearInterval(AU.timer);AU.timer=setInterval(musicTick,90);}
