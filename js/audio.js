'use strict';
// ===================== ÂM THANH (tự tổng hợp, không cần file) =====================
const AU={ctx:null,master:null,sfxG:null,musG:null,music:true,sfx:true,mood:'calm',next:0,step:0,timer:null,last:{}};
function auInit(){
  if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return;}
  const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
  const a=AU.ctx=new C();
  AU.master=a.createGain();AU.master.gain.value=0.7;AU.master.connect(a.destination);
  AU.sfxG=a.createGain();AU.sfxG.gain.value=AU.sfx?0.5:0;AU.sfxG.connect(AU.master);
  AU.musG=a.createGain();AU.musG.gain.value=AU.music?0.26:0;
  const dl=a.createDelay();dl.delayTime.value=0.32;const fb=a.createGain();fb.gain.value=0.32;const wet=a.createGain();wet.gain.value=0.35;
  AU.musG.connect(AU.master);AU.musG.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(AU.master);
  AU.next=a.currentTime+0.3;
  AU.timer=setInterval(musicTick,90);
}
function auSet(kind,on){AU[kind]=on;if(!AU.ctx)return;const g=kind==='music'?AU.musG:AU.sfxG;g.gain.setTargetAtTime(on?(kind==='music'?0.26:0.5):0,AU.ctx.currentTime,0.1);}
function tone(f,dur,type,vol,dest,when=0,f2){const a=AU.ctx;if(!a)return;const t=a.currentTime+when,o=a.createOscillator(),g=a.createGain();
  o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(dest||AU.sfxG);o.start(t);o.stop(t+dur+0.05);}
let noiseBuf=null;
function noise(dur,vol,freq,ftype,when=0,f2){const a=AU.ctx;if(!a)return;
  if(!noiseBuf){noiseBuf=a.createBuffer(1,a.sampleRate,a.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
  const t=a.currentTime+when,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=noiseBuf;
  f.type=ftype||'bandpass';f.frequency.setValueAtTime(freq,t);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+dur);
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f);f.connect(g);g.connect(AU.sfxG);s.start(t);s.stop(t+dur+0.05);}
function sfx(n){if(!AU.ctx||!AU.sfx)return;const now=AU.ctx.currentTime;if(AU.last[n]&&now-AU.last[n]<0.05)return;AU.last[n]=now;
  switch(n){
    case 'swing':noise(0.14,0.35,1800,'bandpass',0,5000);break;
    case 'hit':tone(160,0.1,'square',0.08);noise(0.07,0.25,900,'lowpass');break;
    case 'crit':tone(240,0.14,'square',0.1);noise(0.1,0.35,1400);tone(900,0.12,'triangle',0.08,null,0.02);break;
    case 'cast':tone(520,0.12,'triangle',0.08,null,0,880);break;
    case 'fire':noise(0.45,0.35,600,'lowpass',0,2400);tone(180,0.3,'sawtooth',0.05,null,0,90);break;
    case 'ice':tone(1600,0.25,'sine',0.1);tone(2400,0.2,'sine',0.07,null,0.04);tone(3200,0.15,'sine',0.05,null,0.08);break;
    case 'heal':[523,659,784,1046].forEach((f,i)=>tone(f,0.35,'sine',0.09,null,i*0.07));break;
    case 'level':[392,440,523,587,659,784,880,1046].forEach((f,i)=>tone(f,0.5,'triangle',0.1,null,i*0.07));break;
    case 'quest':[587,784,880,1174].forEach((f,i)=>tone(f,0.45,'triangle',0.1,null,i*0.1));break;
    case 'coin':tone(1320,0.08,'square',0.05);tone(1760,0.12,'square',0.05,null,0.06);break;
    case 'pick':tone(880,0.1,'triangle',0.09);tone(1320,0.12,'triangle',0.07,null,0.05);break;
    case 'click':tone(700,0.04,'triangle',0.06);break;
    case 'hurt':tone(120,0.15,'sawtooth',0.07,null,0,70);break;
    case 'slam':tone(70,0.6,'sine',0.5,null,0,35);noise(0.5,0.4,400,'lowpass');break;
    case 'fly':noise(0.6,0.25,400,'bandpass',0,2400);tone(660,0.4,'sine',0.05,null,0,1320);break;
    case 'die':[392,330,262,196].forEach((f,i)=>tone(f,0.5,'triangle',0.09,null,i*0.15));break;
    case 'equip':tone(400,0.08,'square',0.05);tone(800,0.1,'triangle',0.07,null,0.05);break;
    case 'gather':[660,880].forEach((f,i)=>tone(f,0.2,'sine',0.08,null,i*0.08));break;
  }}
// nhạc nền ngũ cung kiểu đàn tranh
const SCALES={calm:[261.6,293.7,329.6,392,440,523.3,587.3,659.3,784,880],battle:[220,261.6,293.7,329.6,392,440,523.3,587.3,659.3,784],marsh:[196,233.1,261.6,293.7,349.2,392,466.2,523.3,587.3,698.5],snow:[293.7,329.6,370,440,493.9,587.3,659.3,740,880,987.8],desert:[220,233.1,277.2,293.7,329.6,349.2,415.3,440,466.2,554.4],dark:[146.8,174.6,196,220,261.6,293.7,349.2,392,440,523.3],heaven:[523.3,587.3,659.3,784,880,1046.5,1174.7,1318.5,1568,1760]};
let melIdx=4;
function pluck(f,when,vol){const a=AU.ctx,t=when,o=a.createOscillator(),o2=a.createOscillator(),g=a.createGain(),fl=a.createBiquadFilter();
  o.type='triangle';o2.type='sine';o.frequency.value=f;o2.frequency.value=f*2.002;fl.type='lowpass';fl.frequency.setValueAtTime(f*6,t);fl.frequency.exponentialRampToValueAtTime(f*1.5,t+1);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+1.6);
  o.connect(fl);o2.connect(fl);fl.connect(g);g.connect(AU.musG);o.start(t);o2.start(t);o.stop(t+1.7);o2.stop(t+1.7);}
function drum(when,vol){const a=AU.ctx,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(110,when);o.frequency.exponentialRampToValueAtTime(40,when+0.3);
  g.gain.setValueAtTime(vol,when);g.gain.exponentialRampToValueAtTime(0.0001,when+0.4);o.connect(g);g.connect(AU.musG);o.start(when);o.stop(when+0.45);}
function pad(f,when,dur){const a=AU.ctx,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0.0001,when);g.gain.linearRampToValueAtTime(0.05,when+1.2);g.gain.linearRampToValueAtTime(0.0001,when+dur);o.connect(g);g.connect(AU.musG);o.start(when);o.stop(when+dur+0.1);}
function musicTick(){const a=AU.ctx;if(!a||!AU.music||AU.custom)return;
  const battle=AU.mood==='battle',sc=SCALES[AU.mood]||SCALES.calm,stepLen=battle?0.26:AU.mood==='snow'?0.5:AU.mood==='marsh'?0.46:0.4;
  while(AU.next<a.currentTime+0.4){const t=AU.next,s=AU.step;
    if(s%16===0)pad(sc[0]/2,t,stepLen*16);
    if(s%16===8)pad(sc[battle?2:3]/2,t,stepLen*8);
    if(battle){if(s%4===0)drum(t,0.35);if(s%8===6)drum(t,0.2);}
    if(Math.random()<(battle?0.7:AU.mood==='snow'?0.4:0.55)){melIdx=clamp(melIdx+rint(-2,2),0,sc.length-1);pluck(sc[melIdx],t,battle?0.13:0.11);
      if(Math.random()<0.18)pluck(sc[clamp(melIdx-2,0,sc.length-1)],t+stepLen*0.5,0.07);}
    AU.next+=stepLen;AU.step++;}}
