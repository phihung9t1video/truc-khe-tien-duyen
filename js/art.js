'use strict';
// ===================== TIỆN ÍCH VẼ =====================
const OL='rgba(48,30,44,.5)';
let RS=1;
function shade(hex,p){const n=parseInt(hex.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;const f=v=>Math.round(p<0?v*(1+p):v+(255-v)*p);return`rgb(${f(r)},${f(g)},${f(b)})`;}
function hairG(L,hy){const g=ctx.createLinearGradient(0,hy-16,0,hy+28);g.addColorStop(0,shade(L.hair,0.32));g.addColorStop(0.45,L.hair);g.addColorStop(1,shade(L.hair,-0.25));return g;}
function fs(fill){ctx.fillStyle=fill;ctx.fill();ctx.stroke();}
function P(c,col,x,y,w=1,h=1){c.fillStyle=col;c.fillRect(x,y,w,h);}
function mkSprite(w,h,ax,ay,fn){const c=document.createElement('canvas');c.width=Math.ceil(w*RS);c.height=Math.ceil(h*RS);const g=c.getContext('2d');g.scale(RS,RS);g.translate(ax,ay);g.lineJoin='round';g.lineCap='round';fn(g);c.ax=ax;c.ay=ay;c.w=w;c.h=h;return c;}
function blit(spr,x,y){ctx.drawImage(spr,x-spr.ax,y-spr.ay,spr.w,spr.h);}

// ===================== NGOẠI HÌNH =====================
const NPC_LOOK={
  elder:{robe:'#7a5aa8',trim:'#e0c060',belt:'#e0c060',boot:'#3a2a50',skin:'#f1c9a5',hair:'#e9e9e9',beard:'#f4f4f4',beardLen:8,crown:'#e0c060',sash:'#e8d9ff',male:true,inner:'#cdb8ee',weapon:{type:'staff',len:34,col:'#8a5a2a'}},
  healer:{robe:'#eef8f2',trim:'#5fbf8f',belt:'#3f9f6f',boot:'#4a7a5a',skin:'#f9dcc6',hair:'#2a1a14',ribbon:true,band:'#ff9fc4',longHair:true,sash:'#ffb8d2',iris:'#2f7f55',female:true,blush:true,flower:'#ff9fc4',inner:'#ffe0ec'},
  smith:{robe:'#8a5a34',trim:'#5e3c20',belt:'#222222',boot:'#2a1a10',skin:'#d9a066',hair:'#222222',headband:'#cccccc',apron:'#3a2a20',male:true,inner:'#6a4428',weapon:{type:'hammer',len:16,col:'#777777'}},
  fisher:{robe:'#6f8aa0',trim:'#3e5466',belt:'#5a3a22',boot:'#3a2a1e',skin:'#d9a576',hair:'#bdbdbd',beard:'#d8d8d8',beardLen:5,hat:'straw',male:true,inner:'#9fb4c4',weapon:{type:'staff',len:36,col:'#a8844a'}},
  herbalist:{robe:'#f4f0ff',trim:'#9a7ad8',belt:'#7a5ab8',boot:'#5a4a7a',skin:'#f9dcc6',hair:'#3a2420',longHair:true,sideBuns:true,sash:'#d8c4ff',iris:'#6a4aa8',female:true,blush:true,flower:'#c8a8ff',inner:'#e6dcff'},
  merchant:{robe:'#9a6a3a',trim:'#e0b050',belt:'#5a3a1a',boot:'#3a2414',skin:'#e8b88a',hair:'#2a2020',cap:'#5a2a1a',male:true,inner:'#c89a5a',beard:'#2a2020',beardLen:1},
  taoist:{robe:'#e8ecf0',trim:'#5a6a86',belt:'#3a4a66',boot:'#2a3448',skin:'#f1c9a5',hair:'#dcdcdc',beard:'#f4f4f4',beardLen:11,crown:'#3a4a66',sash:'#c8d8f0',male:true,inner:'#cfd8e6',weapon:{type:'whisk',len:14,col:'#8a5a2a'}},
  daotong:{robe:'#bfe0ff',trim:'#3a6aa8',belt:'#3a6aa8',boot:'#2a3a5a',skin:'#fbe2cc',hair:'#1a1a22',sideBuns:true,male:true,blush:true,inner:'#e2f0ff',scale:0.85},
  ironsmith:{robe:'#5a5a62',trim:'#2a2a30',belt:'#8a5a2a',boot:'#1a1a1e',skin:'#d09a6a',hair:'#3a2a1a',headband:'#a83a2a',apron:'#3a2a20',male:true,beard:'#3a2a1a',beardLen:3,inner:'#4a4a52',weapon:{type:'hammer',len:18,col:'#8a8a92'}},
  bandit:{robe:'#6b5236',trim:'#3a2a1a',belt:'#2a1a10',boot:'#2a1a10',skin:'#e3ad78',hair:'#1a1a1a',headband:'#c0392b',brow:true,messy:true,male:true,inner:'#4a3a28',weapon:{type:'saber',len:19,col:'#bdbdbd'}},
  boss:{robe:'#2a2a33',trim:'#9b1c1c',belt:'#c9a227',boot:'#120c08',skin:'#d79a6a',hair:'#0d0d0d',beard:'#111111',beardLen:4,headband:'#c0392b',brow:true,messy:true,armor:'#4a4a56',male:true,inner:'#3a1a1a',weapon:{type:'saber',len:30,col:'#e6e6e6',glow:'#ff3020'}},
  pirate:{robe:'#2f6a72',trim:'#1a3a40',belt:'#6a4a22',boot:'#1a2024',skin:'#d49a68',hair:'#141414',headband:'#2a8ad0',brow:true,messy:true,male:true,inner:'#24484e',weapon:{type:'saber',len:21,col:'#cfd6dc'}},
  cultist:{robe:'#2e2240',trim:'#a8243a',belt:'#a8243a',boot:'#140c1c',skin:'#c8a08a',hair:'#0e0a14',hood:'#1e1630',mask:true,glowEye:'#ff3a3a',brow:true,male:true,inner:'#1a1226',weapon:{type:'saber',len:22,col:'#d8c0ff',glow:'#a040ff'}},
  iceboss:{robe:'#dfeefa',trim:'#3a7ab8',belt:'#9fd8ff',boot:'#2a4a6a',skin:'#e6eef6',hair:'#f4fbff',longHair:true,crown:'#9fe8ff',iceCrown:true,glowEye:'#6fe8ff',brow:true,armor:'#9fc4e8',male:true,sash:'#bfeaff',sashGlow:'#7fd8ff',inner:'#b8d8f0',weapon:{type:'saber',len:32,col:'#dff6ff',glow:'#6fd8ff'}}
};
Object.assign(NPC_LOOK,{
  caravan:{robe:'#c89a5a',trim:'#7a3a1a',belt:'#5a2a10',boot:'#4a2a14',skin:'#c88a5a',hair:'#3a2a20',beard:'#e8e0d0',beardLen:6,headband:'#f0e6d0',male:true,inner:'#e8c890',weapon:{type:'staff',len:34,col:'#9a6a3a'}},
  oasisdoc:{robe:'#fff4e0',trim:'#e07a3a',belt:'#c05a2a',boot:'#8a4a2a',skin:'#e0a878',hair:'#2a1a14',longHair:true,sideBuns:true,sash:'#ffc890',iris:'#8a4a1a',female:true,blush:true,flower:'#ff8a5a',inner:'#ffe4c0'},
  swordsmith:{robe:'#8a6a4a',trim:'#4a3020',belt:'#2a1a10',boot:'#2a1a10',skin:'#c88a5a',hair:'#1a1410',headband:'#c04020',apron:'#4a3020',male:true,beard:'#1a1410',beardLen:2,inner:'#6a5038',weapon:{type:'hammer',len:18,col:'#9a9aa2'}},
  nomad:{robe:'#b8864a',trim:'#6a3a1a',belt:'#3a2010',boot:'#2a1a10',skin:'#b87a4a',hair:'#141010',headband:'#e8d8b0',brow:true,messy:true,male:true,mask:true,inner:'#8a5a2a',weapon:{type:'saber',len:22,col:'#d8d8d0'}},
  exorcist:{robe:'#f0e6c8',trim:'#a8243a',belt:'#a8243a',boot:'#3a2a1a',skin:'#e8c4a0',hair:'#1a1a1a',crown:'#3a3a3a',sash:'#ffd060',male:true,inner:'#e0d4b0',weapon:{type:'whisk',len:14,col:'#8a5a2a'}},
  shaman:{robe:'#3a4a3a',trim:'#9ad060',belt:'#6a8a3a',boot:'#2a3a2a',skin:'#d8b090',hair:'#1a201a',longHair:true,ribbon:true,band:'#9ad060',female:true,blush:true,iris:'#4a8a3a',inner:'#4a5a42',flower:'#c0ff80'},
  darksmith:{robe:'#3a3a44',trim:'#7a3ad0',belt:'#2a2a30',boot:'#14141a',skin:'#b8a090',hair:'#2a2a30',headband:'#7a3ad0',apron:'#24242a',male:true,beard:'#2a2a30',beardLen:3,inner:'#2e2e36',weapon:{type:'hammer',len:18,col:'#6a6a7a'}},
  ghoul:{robe:'#4a5a4a',trim:'#2a2a2a',belt:'#3a2a2a',boot:'#1a1a1a',skin:'#9ab8a0',hair:'#d8e0d0',messy:true,glowEye:'#a0ff80',brow:true,male:true,inner:'#3a4038',weapon:{type:'saber',len:20,col:'#9aa090'}},
  ghostking:{robe:'#1e1428',trim:'#8a3ad0',belt:'#c9a227',boot:'#0e0a14',skin:'#b8b0c8',hair:'#e8e0f0',longHair:true,crown:'#6a3aa0',glowEye:'#c060ff',brow:true,armor:'#3a2a50',male:true,sash:'#a060ff',sashGlow:'#a060ff',inner:'#2a1a3a',weapon:{type:'saber',len:32,col:'#e0c8ff',glow:'#a040ff'}},
  immortal:{robe:'#fffaf0',trim:'#e0b040',belt:'#e0b040',boot:'#c0a060',skin:'#f8dcc4',hair:'#f4f4f4',beard:'#ffffff',beardLen:12,crown:'#e0b040',sash:'#fff0b0',sashGlow:'#ffe080',male:true,inner:'#fff0d0',weapon:{type:'whisk',len:14,col:'#c09040'}},
  fairy:{robe:'#fff0f8',trim:'#ff8ac8',belt:'#e070b0',boot:'#d080b0',skin:'#fbe2d0',hair:'#3a2030',longHair:true,sideBuns:true,sash:'#ffc8e8',sashGlow:'#ffb0e0',iris:'#c04a8a',female:true,blush:true,flower:'#ff9ad8',inner:'#ffe0f0'},
  celestialsmith:{robe:'#e8d8a8',trim:'#b08020',belt:'#806010',boot:'#604a10',skin:'#e8c098',hair:'#c0a060',headband:'#e0b040',apron:'#a07a30',male:true,beard:'#c0a060',beardLen:4,inner:'#d8c490',weapon:{type:'hammer',len:18,col:'#f0d070'}},
  guard:{robe:'#e8eef8',trim:'#c9a227',belt:'#c9a227',boot:'#8a7a50',skin:'#f0c8a0',hair:'#1a1a1a',crown:'#c9a227',armor:'#f0d888',brow:true,male:true,inner:'#d8e0ee',weapon:{type:'saber',len:24,col:'#fff4d0',glow:'#ffe080'}},
  fallen:{robe:'#2a2438',trim:'#e0b040',belt:'#e0b040',boot:'#14101c',skin:'#e0d0e8',hair:'#f8f0ff',longHair:true,crown:'#e0b040',iceCrown:true,glowEye:'#ffd040',brow:true,armor:'#5a4a7a',male:true,sash:'#ffe080',sashGlow:'#ffc040',inner:'#3a2e4a',weapon:{type:'saber',len:34,col:'#fff6d0',glow:'#ffc040'}}
});
function buildLook(sect,gender,eq){
  const S=SECTS[sect],L=Object.assign({skin:'#f9dcc6',hair:'#17161f'},S.look);
  if(gender==='f'){L.female=true;L.blush=true;L.longHair=true;L.sideBuns=true;L.flower=S.look.sash;L.crown=null;L.hair='#241a26';}
  else{L.male=true;L.pony=true;}
  const a=eq&&eq.armor;
  if(a&&a.rar>=4){L.trim='#ff5a8a';L.sash='#ffb0d0';L.sashGlow='#ff70a8';}
  else if(a&&a.rar>=3){L.trim='#e8b84a';L.sash='#ffe7a0';L.sashGlow='#ffd060';}
  else if(a&&a.rar>=2){L.sashGlow=S.look.sash;}
  return L;
}
function weaponVis(it,wtype,refine){
  const r=it?it.rar:0,glow=r>=2?RARITY[r].c:(refine>=5?'#9fd3ff':null);
  if(wtype==='fan')return{type:'fan',col:['#e8c0a0','#9fe09f','#8fc8ff','#ffb060','#ff7aa8'][r],glow};
  if(wtype==='flute')return{type:'flute',len:20,col:['#7fbf9f','#6fe08f','#6fb8ff','#ffc860','#ff7aa8'][r],glow};
  if(wtype==='staff')return{type:'staff',len:30+(it?it.tier:0)*0.8,col:['#8a6a3a','#7a8a3a','#5a7a9a','#a8802a','#a83a5a'][r],orb:['#9fff8a','#b8ff9a','#9fe0ff','#ffe080','#ff8ab8'][r],glow:glow||'#9fff8a'};
  if(wtype==='hammer')return{type:'hammer',big:true,len:21+(it?it.tier:0)*0.6,col:['#a89a88','#a8c0a0','#9ab8d8','#ffd27a','#ff8ab0'][r],glow};
  if(wtype==='dagger')return{type:'dagger',len:14+(it?it.tier:0)*0.5,col:['#c8c0d8','#d0f0d0','#c8b0ff','#ffd8a0','#ff9ac0'][r],glow:glow||(refine>=3?'#b48cff':null)};
  return{type:'sword',len:22+(it?it.tier:0)*1.2,col:['#cfd8e6','#d8f2d8','#bfe0ff','#ffe08a','#ffb0cc'][r],glow};
}

// ===================== VŨ KHÍ =====================
function drawWeapon(W,x,y,a){
  ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.lineWidth=0.8;
  if(W.type==='staff'){ctx.beginPath();ctx.roundRect(-W.len*0.35,-1.4,W.len,2.8,1.4);fs(W.col);
    if(W.orb){if(W.glow){ctx.shadowColor=W.glow;ctx.shadowBlur=10;}ctx.beginPath();ctx.arc(W.len*0.65+2,0,3.4,0,Math.PI*2);fs(W.orb);ctx.shadowBlur=0;ctx.fillStyle='#6abf4a';ctx.beginPath();ctx.ellipse(W.len*0.65-3,-3,3,1.4,-0.6,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(W.len*0.65-3,3,3,1.4,0.6,0,Math.PI*2);ctx.fill();}
    else{ctx.beginPath();ctx.arc(W.len*0.65,0,2.6,0,Math.PI*2);fs('#e0c060');}}
  else if(W.type==='hammer'){if(W.big){ctx.beginPath();ctx.roundRect(-4,-1.6,W.len,3.2,1.4);fs('#6a4020');if(W.glow){ctx.shadowColor=W.glow;ctx.shadowBlur=10;}const g=ctx.createLinearGradient(0,-8,0,8);g.addColorStop(0,shade(W.col,0.35));g.addColorStop(1,shade(W.col,-0.2));ctx.beginPath();ctx.roundRect(W.len-8,-7.5,12,15,3);fs(g);ctx.shadowBlur=0;ctx.fillStyle='#c9a227';ctx.fillRect(W.len-9,-2,14,4);}
    else{ctx.beginPath();ctx.roundRect(-3,-1.2,W.len,2.4,1);fs('#7a4f28');ctx.beginPath();ctx.roundRect(W.len-5,-4.5,7,9,1.5);fs(W.col);}}
  else if(W.type==='whisk'){ctx.beginPath();ctx.roundRect(-3,-1.1,W.len,2.2,1);fs(W.col);ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=0.9;const wv=Math.sin(nowT*3);for(let k=-3;k<=3;k++){ctx.beginPath();ctx.moveTo(W.len-1,k*0.4);ctx.quadraticCurveTo(W.len+6,k*1.4+wv,W.len+11,k*2.2+wv*2);ctx.stroke();}}
  else if(W.type==='fan'){const op=W.open||0;if(W.glow){ctx.shadowColor=W.glow;ctx.shadowBlur=9;}
    if(op<0.12){ctx.beginPath();ctx.roundRect(-2,-1.7,15,3.4,1.4);fs('#6a2a18');ctx.shadowBlur=0;ctx.fillStyle=W.col;ctx.fillRect(4,-1,8,2);}
    else{const A=0.4+op*1.7;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,15,-A/2,A/2);ctx.closePath();const g=ctx.createRadialGradient(0,0,2,0,0,15);g.addColorStop(0,'#fff6e8');g.addColorStop(1,W.col);fs(g);ctx.shadowBlur=0;
      ctx.strokeStyle='rgba(110,40,20,.45)';ctx.lineWidth=0.6;for(let k=0;k<=6;k++){const aa=-A/2+k*A/6;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(aa)*15,Math.sin(aa)*15);ctx.stroke();}}}
  else if(W.type==='flute'){if(W.glow){ctx.shadowColor=W.glow;ctx.shadowBlur=9;}
    const g=ctx.createLinearGradient(0,-1.5,0,1.5);g.addColorStop(0,shade(W.col,0.45));g.addColorStop(1,W.col);ctx.beginPath();ctx.roundRect(-5,-1.5,W.len,3,1.5);fs(g);ctx.shadowBlur=0;
    ctx.fillStyle='rgba(20,40,30,.75)';for(let k=1;k<5;k++){ctx.beginPath();ctx.arc(-3+k*3.6,0,0.6,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle='#d03a2a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-5,0);ctx.quadraticCurveTo(-8,3+Math.sin(nowT*6),-7,7);ctx.stroke();}
  else{if(W.glow){ctx.shadowColor=W.glow;ctx.shadowBlur=11;}
    const wd=W.type==='saber'?2.2:1.4,tip=W.type==='saber'?1.4:1;
    ctx.beginPath();ctx.moveTo(3,-wd);ctx.lineTo(W.len,-wd*tip);ctx.quadraticCurveTo(W.len+4,0,W.len,wd);ctx.lineTo(3,wd);ctx.closePath();
    const g=ctx.createLinearGradient(0,-wd,0,wd);g.addColorStop(0,'#ffffff');g.addColorStop(1,W.col);fs(g);ctx.shadowBlur=0;
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=0.5;ctx.beginPath();ctx.moveTo(5,-wd*0.3);ctx.lineTo(W.len-2,-wd*0.3);ctx.stroke();ctx.strokeStyle=OL;ctx.lineWidth=0.8;
    ctx.beginPath();ctx.roundRect(1,-3.6,2.4,7.2,1);fs('#c9a227');
    ctx.beginPath();ctx.roundRect(-5,-1.2,6,2.4,1);fs('#5a2a14');
    if(W.type==='sword'){ctx.strokeStyle='#c0392b';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-5,0);ctx.quadraticCurveTo(-8,3+Math.sin(nowT*6),-7,7);ctx.stroke();}}
  ctx.restore();
}

// ===================== NHÂN VẬT (chibi mềm) =====================
function cShoes(L,sw,dir){const c=L.boot||'#4a3a30';
  if(dir==='side'){for(const k of [-1,1]){const o=k*sw*4.5;ctx.beginPath();ctx.ellipse(1.5+o,-1,3.6,1.9,0,0,Math.PI*2);fs(k<0?shade(c,-0.25):c);}}
  else for(const k of [-1,1]){const l=Math.max(0,k*sw)*1.6;ctx.beginPath();ctx.ellipse(k*3.6,-0.9-l,2.6,1.9,0,0,Math.PI*2);fs(c);}}
function cRobe(L,dir,b,hs,tr){const side=dir==='side',down=dir==='down',up=dir==='up',sh=side?6:7.5,wa=side?5.2:6.3,he=side?9.2:11;
  const inn=L.inner||shade(L.robe,0.25),gi=ctx.createLinearGradient(0,-20,0,0);gi.addColorStop(0,inn);gi.addColorStop(1,shade(inn,-0.15));
  ctx.beginPath();ctx.moveTo(-wa+1,-19+b);ctx.lineTo(wa-1,-19+b);ctx.quadraticCurveTo(he-2+tr*0.3,-9,he-1.6+hs*0.6+tr,-0.6);ctx.quadraticCurveTo(tr*0.5,1.3,-he+1.6+hs*0.6+tr,-0.6);ctx.quadraticCurveTo(-he+2+tr*0.3,-9,-wa+1,-19+b);ctx.closePath();fs(gi);
  const g=ctx.createLinearGradient(-he,-30,he,0);g.addColorStop(0,shade(L.robe,0.14));g.addColorStop(0.55,L.robe);g.addColorStop(1,shade(L.robe,-0.22));
  const path=()=>{ctx.beginPath();ctx.moveTo(-sh,-28.5+b);ctx.lineTo(sh,-28.5+b);ctx.quadraticCurveTo(wa+1.2,-23+b,wa,-19+b);ctx.quadraticCurveTo(he-0.6+tr*0.4,-10,he+hs+tr,-2.2);
    if(down){ctx.quadraticCurveTo(he*0.55+hs*0.5,-1,2.4+hs*0.4,-1.8);ctx.quadraticCurveTo(1.2,-10,0.5,-17.5+b);ctx.lineTo(-0.5,-17.5+b);ctx.quadraticCurveTo(-1.2,-10,-2.4+hs*0.4,-1.8);ctx.quadraticCurveTo(-he*0.55+hs*0.5,-1,-he+hs+tr,-2.2);}
    else ctx.quadraticCurveTo(tr*0.5+hs*0.3,0.3,-he+hs+tr,-2.2);
    ctx.quadraticCurveTo(-he+0.6+tr*0.4,-10,-wa,-19+b);ctx.quadraticCurveTo(-wa-1.2,-23+b,-sh,-28.5+b);ctx.closePath();};
  path();ctx.fillStyle=g;ctx.fill();
  ctx.save();ctx.clip();
  ctx.fillStyle=L.trim;ctx.beginPath();ctx.moveTo(-16,-4.4+hs*0.2);ctx.quadraticCurveTo(0,-2.6,16,-4.4+hs*0.2);ctx.lineTo(16,3);ctx.lineTo(-16,3);ctx.closePath();ctx.fill();
  if(down){ctx.strokeStyle=L.trim;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(2.4+hs*0.4,-1.8);ctx.quadraticCurveTo(1.2,-10,0.5,-17.5+b);ctx.moveTo(-2.4+hs*0.4,-1.8);ctx.quadraticCurveTo(-1.2,-10,-0.5,-17.5+b);ctx.stroke();}
  if(side){ctx.fillStyle=L.trim;ctx.fillRect(3,-19+b,2.2,18);}
  if(up){ctx.strokeStyle='rgba(0,0,0,.12)';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(0,-27+b);ctx.lineTo(hs*0.5,-3);ctx.stroke();}
  ctx.strokeStyle='rgba(0,0,0,.10)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-3.5,-16+b);ctx.quadraticCurveTo(-5,-8,-6.5+hs,-3);ctx.moveTo(4,-16+b);ctx.quadraticCurveTo(5.5,-8,6.5+hs,-3);ctx.stroke();
  ctx.fillStyle='rgba(30,20,60,.10)';ctx.fillRect(he-4.5+tr,-30,9,33);
  ctx.strokeStyle='rgba(255,255,255,.38)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-sh+0.9,-27.6+b);ctx.quadraticCurveTo(-wa-0.3,-22+b,-wa+0.7,-19+b);ctx.quadraticCurveTo(-he+1.5,-10,-he+1.2+hs+tr,-3.6);ctx.stroke();
  ctx.restore();path();ctx.stroke();
  if(L.apron&&!up){ctx.beginPath();ctx.roundRect(side?0:-5.5,-21+b,side?7:11,17,2.5);fs(L.apron);}
  if(down){ctx.save();ctx.strokeStyle=L.trim;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-5.2,-28.6+b);ctx.lineTo(1.6,-20.5+b);ctx.moveTo(5.2,-28.6+b);ctx.lineTo(-0.6,-22.6+b);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.moveTo(-3,-28.6+b);ctx.lineTo(3,-28.6+b);ctx.lineTo(0,-25.2+b);ctx.closePath();ctx.fillStyle=L.skin;ctx.fill();}
  else if(side){ctx.save();ctx.strokeStyle=L.trim;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(2,-28.6+b);ctx.lineTo(5.3,-21+b);ctx.stroke();ctx.restore();}
  ctx.beginPath();ctx.roundRect(-wa-1.4,-21.4+b,2*(wa+1.4),3.4,1.4);fs(L.belt);
  if(!up){const px=side?-2.5:3,wv=Math.sin(nowT*4+b)*0.8;
    ctx.save();ctx.strokeStyle=L.belt;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(px-1.5,-18.4+b);ctx.lineTo(px-1+wv,-12);ctx.stroke();
    ctx.strokeStyle=shade(L.belt,0.3);ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(px+1,-18.2+b);ctx.lineTo(px+1+wv*0.3,-12.6);ctx.stroke();
    ctx.strokeStyle='#d0303a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px+1+wv*0.3,-10);ctx.lineTo(px+1+wv,-6);ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.arc(px+1+wv*0.3,-11.4,1.7,0,Math.PI*2);fs('#7fe0b0');}}
function cEyes(L,xs,hy,sd){const blink=((nowT+sd*13)%4.3)<0.13;
  for(const ex of xs){const d=Math.sign(ex)||1;
    if(blink){ctx.save();ctx.strokeStyle='#2a1810';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(ex-2.3,hy+2.8);ctx.quadraticCurveTo(ex,hy+4,ex+2.3,hy+2.8);ctx.stroke();ctx.restore();}
    else{const ig=ctx.createLinearGradient(0,hy-0.6,0,hy+5.8);ig.addColorStop(0,'#120a06');ig.addColorStop(1,L.glowEye||L.iris||'#5a3a2a');
      ctx.save();if(L.glowEye){ctx.shadowColor=L.glowEye;ctx.shadowBlur=6;}
      ctx.beginPath();ctx.ellipse(ex,hy+2.7,L.male?2:2.2,L.male?2.7:3.05,0,0,Math.PI*2);ctx.fillStyle=ig;ctx.fill();ctx.restore();
      ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex+0.75,hy+1.5,0.95,0,Math.PI*2);ctx.fill();ctx.globalAlpha=0.8;ctx.beginPath();ctx.arc(ex-0.6,hy+4.2,0.45,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.save();ctx.strokeStyle='#140b07';ctx.lineWidth=L.female?1.45:1.05;ctx.beginPath();ctx.moveTo(ex-2.6,hy+0.7);ctx.quadraticCurveTo(ex,hy-1,ex+2.6,hy+0.5);if(L.female)ctx.lineTo(ex+3.3*(xs.length===1?1:d),hy-0.4);ctx.stroke();ctx.restore();}
    ctx.save();
    if(L.brow){ctx.strokeStyle='#1a1010';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(ex-2.4*d,hy-0.6);ctx.lineTo(ex+2.2*d,hy-2.2);ctx.stroke();}
    else if(L.beard){ctx.strokeStyle=L.beard;ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(ex-2.6,hy-1);ctx.quadraticCurveTo(ex,hy-2,ex+2.6,hy-1.2);ctx.stroke();}
    else{ctx.strokeStyle=L.female?'rgba(40,24,24,.6)':'#221618';ctx.lineWidth=L.female?0.9:1.2;ctx.beginPath();ctx.moveTo(ex-2.3,hy-1.3);ctx.quadraticCurveTo(ex,hy-(L.female?2.4:2),ex+2.3,hy-1.6);ctx.stroke();}
    ctx.restore();
    if(L.blush){ctx.fillStyle='rgba(255,110,120,.32)';ctx.beginPath();ctx.ellipse(ex+d*1.6,hy+6.1,1.9,1.05,0,0,Math.PI*2);ctx.fill();}}}
function flowerAt(x,y,col){for(let k=0;k<5;k++){const a=k/5*Math.PI*2;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x+Math.cos(a)*1.7,y+Math.sin(a)*1.7,1.4,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#ffe080';ctx.beginPath();ctx.arc(x,y,0.9,0,Math.PI*2);ctx.fill();}
function cHead(L,dir,hy,bun,sd){const R=10,H=hairG(L,hy),side=dir==='side',down=dir==='down',up=dir==='up';
  if(!up){ctx.fillStyle='rgba(70,30,30,.16)';ctx.beginPath();ctx.ellipse(side?1:0,hy+R-0.6,5,2.2,0,0,Math.PI*2);ctx.fill();}
  const SG=ctx.createRadialGradient(-2.5,hy-1.5,1.5,0,hy,R+1);SG.addColorStop(0,shade(L.skin,0.14));SG.addColorStop(1,shade(L.skin,-0.1));
  ctx.beginPath();ctx.arc(0,hy,R,0,Math.PI*2);fs(up?H:SG);
  if(side){ctx.beginPath();ctx.ellipse(-2.2,hy+2,1.7,2.3,0,0,Math.PI*2);fs(shade(L.skin,-0.06));}
  const lw=Math.sin(nowT*2.6+sd*4)*0.8;
  if(down){
    ctx.beginPath();ctx.moveTo(-R-0.7,hy+3.5);ctx.arc(0,hy,R+0.7,Math.PI*1.02,Math.PI*1.98);ctx.lineTo(R+0.7,hy+3.5);
    ctx.quadraticCurveTo(R-1.2,hy-0.5,7,hy-0.6);ctx.quadraticCurveTo(5.8,hy+2.4,3.6,hy+1.6);ctx.quadraticCurveTo(2.6,hy-2.2,0.6,hy-1.4);ctx.quadraticCurveTo(-0.6,hy+2.2,-2.8,hy+1.4);
    ctx.quadraticCurveTo(-3.8,hy-1.8,-6,hy-0.8);ctx.quadraticCurveTo(-7.4,hy+2,-8.6,hy+1.2);ctx.quadraticCurveTo(-R+0.4,hy-0.6,-R-0.7,hy+3.5);ctx.closePath();fs(H);
    for(const k of [-1,1]){ctx.beginPath();ctx.moveTo(k*(R-0.4),hy-2);ctx.quadraticCurveTo(k*(R+1.6),hy+6,k*(R-1.6)+lw,hy+(L.female?13:10.5));ctx.quadraticCurveTo(k*(R-2.6),hy+5,k*(R-3.2),hy+1.5);ctx.closePath();fs(H);}
    ctx.save();ctx.strokeStyle='rgba(0,0,0,.16)';ctx.lineWidth=0.6;ctx.beginPath();ctx.moveTo(-3,hy-8);ctx.quadraticCurveTo(-4,hy-4,-4.6,hy+0.4);ctx.moveTo(3.4,hy-8);ctx.quadraticCurveTo(4.4,hy-4,4.8,hy+0.6);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,.42)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,hy,R-1.6,Math.PI*1.2,Math.PI*1.42);ctx.stroke();ctx.restore();
    cEyes(L,[-4,4],hy,sd);
    ctx.fillStyle='rgba(170,80,70,.35)';ctx.beginPath();ctx.ellipse(0,hy+5.4,0.6,0.4,0,0,Math.PI*2);ctx.fill();
    if(!L.mask){ctx.save();ctx.strokeStyle=L.female?'#c0505a':'rgba(90,40,30,.8)';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(-1.2,hy+7.2);ctx.quadraticCurveTo(0,hy+8.1,1.2,hy+7.2);ctx.stroke();ctx.restore();}
  }else if(side){
    ctx.beginPath();ctx.moveTo(-R+1.2,hy+8.5);ctx.arc(0,hy,R+0.7,Math.PI*0.85,Math.PI*1.9);ctx.quadraticCurveTo(R*0.7,hy-2,R*0.62,hy+0.6);ctx.quadraticCurveTo(4.5,hy-1,3,hy-1.6);ctx.quadraticCurveTo(1.8,hy+1.6,0.4,hy+2.4);ctx.quadraticCurveTo(-3,hy+5.5,-R+1.2,hy+8.5);ctx.closePath();fs(H);
    ctx.beginPath();ctx.moveTo(-1,hy+1);ctx.quadraticCurveTo(-0.6,hy+8,-2+lw,hy+(L.female?13:10));ctx.quadraticCurveTo(-3.2,hy+6,-3.4,hy+1.5);ctx.closePath();fs(H);
    ctx.save();ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,hy,R-1.6,Math.PI*1.25,Math.PI*1.55);ctx.stroke();ctx.restore();
    cEyes(L,[5.2],hy,sd);
    if(!L.mask){ctx.save();ctx.strokeStyle=L.female?'#c0505a':'rgba(90,40,30,.8)';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(7.4,hy+7.4);ctx.lineTo(8.8,hy+7);ctx.stroke();ctx.restore();}
  }else{ctx.save();ctx.strokeStyle=shade(L.hair,0.3);ctx.lineWidth=0.9;for(const k of [-4,0,4]){ctx.beginPath();ctx.moveTo(k*0.5,hy-R+2);ctx.quadraticCurveTo(k,hy,k*1.2,hy+R-2);ctx.stroke();}ctx.restore();}
  if(L.mask&&!up){ctx.beginPath();if(side){ctx.moveTo(2,hy+3.5);ctx.quadraticCurveTo(10,hy+3,10,hy+5);ctx.quadraticCurveTo(8,hy+10,1,hy+9);}else{ctx.moveTo(-8,hy+3.5);ctx.quadraticCurveTo(0,hy+2.8,8,hy+3.5);ctx.quadraticCurveTo(6,hy+10.5,0,hy+10.5);ctx.quadraticCurveTo(-6,hy+10.5,-8,hy+3.5);}ctx.closePath();fs('#1a1220');}
  if(L.messy)for(let i=-2;i<=2;i++){const a=-Math.PI/2+i*0.5+(side?-0.4:0),x1=Math.cos(a-0.22)*R,y1=hy+Math.sin(a-0.22)*R,x2=Math.cos(a+0.22)*R,y2=hy+Math.sin(a+0.22)*R;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.quadraticCurveTo(Math.cos(a)*(R+2),hy+Math.sin(a)*(R+2),Math.cos(a)*(R+4.5),hy+Math.sin(a)*(R+4.5));ctx.lineTo(x2,y2);ctx.closePath();fs(H);}
  if(L.headband){ctx.save();ctx.strokeStyle=L.headband;ctx.lineWidth=2.4;ctx.beginPath();
    if(side)ctx.arc(0,hy+1,R-0.2,Math.PI*0.95,Math.PI*1.85);else ctx.arc(0,hy+1,R-0.2,Math.PI*1.12,Math.PI*1.88);ctx.stroke();
    const tx=side?-R+0.5:(up?0:R-1),dx=side?-1:1,wv=Math.sin(nowT*6)*2;
    ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(tx,hy-2);ctx.quadraticCurveTo(tx+dx*6,hy,tx+dx*9,hy+5+wv);ctx.stroke();ctx.restore();}
  if(L.hood){ctx.save();ctx.strokeStyle=L.hood;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,hy,R+1.6,Math.PI*(side?0.75:0.82),Math.PI*(side?2.0:2.18));ctx.stroke();ctx.restore();
    ctx.beginPath();ctx.moveTo(-3,hy-R-3);ctx.quadraticCurveTo(0,hy-R-9,4,hy-R-3);ctx.closePath();fs(L.hood);}
  else if(L.sideBuns){const bs=side?[[-5,hy-8]]:[[-8,hy-8],[8,hy-8]];for(const [bx,by] of bs){ctx.beginPath();ctx.arc(bx,by,3.6,0,Math.PI*2);fs(H);
      ctx.save();ctx.strokeStyle=L.sash||L.band||'#ff9fc4';ctx.lineWidth=1.5;const wv=Math.sin(nowT*5+bx)*1.5,sx=Math.sign(bx||-1);ctx.beginPath();ctx.moveTo(bx,by+2);ctx.quadraticCurveTo(bx+sx*3,by+6,bx+sx*2+wv,by+11);ctx.stroke();ctx.restore();}}
  else if(!L.hat&&!L.cap){ctx.beginPath();ctx.arc(bun.x,bun.y,4.2,0,Math.PI*2);fs(H);}
  if(L.band&&!L.sideBuns&&!L.hat){ctx.beginPath();ctx.roundRect(bun.x-4.6,bun.y+1.4,9.2,2.4,1);fs(L.band);}
  if(L.crown){const X=bun.x,Y=bun.y,hh=L.iceCrown?9:5.8;if(L.iceCrown){ctx.save();ctx.shadowColor='#7fe8ff';ctx.shadowBlur=8;}
    ctx.beginPath();ctx.moveTo(X-4.6,Y+1.6);ctx.lineTo(X-3.9,Y-hh*0.62);ctx.lineTo(X-1.4,Y-1.2);ctx.lineTo(X,Y-hh);ctx.lineTo(X+1.4,Y-1.2);ctx.lineTo(X+3.9,Y-hh*0.62);ctx.lineTo(X+4.6,Y+1.6);ctx.closePath();fs(L.crown);
    if(L.iceCrown)ctx.restore();
    ctx.save();ctx.strokeStyle='#c9a227';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(X-8,Y+0.8);ctx.lineTo(X+8,Y-0.4);ctx.stroke();ctx.fillStyle='#4aa8ff';ctx.beginPath();ctx.arc(X,Y-1,1.2,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(L.hat==='straw'){const g=ctx.createLinearGradient(0,hy-20,0,hy-3);g.addColorStop(0,'#f0dc98');g.addColorStop(1,'#b8984a');
    ctx.beginPath();ctx.moveTo(-17,hy-3.5);ctx.quadraticCurveTo(0,hy-7,17,hy-3.5);ctx.quadraticCurveTo(6,hy-12,0.5,hy-20);ctx.quadraticCurveTo(-6,hy-12,-17,hy-3.5);ctx.closePath();fs(g);
    ctx.save();ctx.strokeStyle='rgba(120,90,30,.45)';ctx.lineWidth=0.6;for(let k=-3;k<=3;k++){ctx.beginPath();ctx.moveTo(0.5,hy-19);ctx.lineTo(k*5,hy-4.8);ctx.stroke();}ctx.restore();}
  if(L.cap){ctx.beginPath();ctx.ellipse(0,hy-6.5,R+0.6,6.5,0,Math.PI,0);ctx.closePath();fs(L.cap);ctx.beginPath();ctx.roundRect(-R-1.5,hy-7.2,2*R+3,2.4,1.2);fs(shade(L.cap,0.2));}
  if(L.flower&&!up)flowerAt(side?-1:6.5,hy-8,L.flower);
  if(L.beard&&!up){const bx=side?5:0,bw=side?4.5:6.5,bl=L.beardLen||4,wv=Math.sin(nowT*2+sd)*0.6;
    ctx.beginPath();ctx.moveTo(bx-bw,hy+4.5);ctx.quadraticCurveTo(bx-bw*0.7,hy+12+bl,bx+wv,hy+13+bl);ctx.quadraticCurveTo(bx+bw*0.7,hy+12+bl,bx+bw,hy+4.5);ctx.quadraticCurveTo(bx,hy+8,bx-bw,hy+4.5);ctx.closePath();fs(L.beard);
    ctx.save();ctx.strokeStyle=L.beard;ctx.lineWidth=1.9;ctx.beginPath();ctx.moveTo(bx-4.5,hy+7.5);ctx.quadraticCurveTo(bx,hy+5,bx+4.5,hy+7.5);ctx.stroke();ctx.restore();}}
const easeOut=p=>1-(1-p)*(1-p);
const spinK=p=>{const c=Math.cos(p*Math.PI*2);return (c<0?-1:1)*Math.max(0.18,Math.abs(c));};
function atkPose(type,st,p){const s=Math.sin(p*Math.PI);
  switch(type){
    case 'fan': // hỏa: quạt lửa, xoay người, vung cả hai tay
      if(st===1)return{aF:2.2,aB:-0.6,spin:spinK(p),open:1,lift:s*3};
      if(st===2)return{aF:3.0-p*2.2,aB:2.6-p*2.0,open:s,lunge:s*3};
      return{aF:0.35+s*1.45,open:s,lunge:s*2};
    case 'flute': // thủy: chỉ tiêu, nâng tiêu lên thổi, quét tiêu
      if(st===1)return{aF:2.3,aB:2.1,wA:-0.15,lift:s*1.5,notes:true};
      if(st===2)return{aF:2.8-p*2.4,lunge:s*3};
      return{aF:0.35+s*1.3,wA:0.1,lunge:s*2};
    case 'staff': // dược sư: giơ trượng thi pháp, gõ trượng, xoay trượng
      if(st===1)return{aF:1.1+s*0.6,wA:-1.2+s*0.7,lunge:s*3};
      if(st===2)return{aF:1.6,wA:p*Math.PI*2,lift:s*2};
      return{aF:2.2+s*0.9,aB:1.8+s*0.6,wA:-Math.PI/2,lift:s*4};
    case 'hammer':{ // hộ vệ: bổ chùy từ trên xuống, quét ngang, hất lên
      if(st===1)return{aF:1.5,wA:-1.4+p*2.8,rot:(p-0.5)*0.3,lunge:s*3};
      if(st===2)return{aF:0.3+easeOut(p)*2.6,lift:s*5,rot:-s*0.12};
      const u=p<0.45?p/0.45:1-(p-0.45)/0.55;return{aF:0.6+u*2.6,aB:0.4+u*2.2,rot:p<0.45?-0.12*u:0.18*(1-u),lunge:p>0.45?4:0,lift:p<0.45?u*4:0};}
    case 'dagger': // sát thủ: đâm tay phải, đâm tay trái, xoay người chém
      if(st===1)return{aF:0.4,aB:1.4+s*0.3,lunge:s*6};
      if(st===2)return{aF:1.8,aB:1.8,spin:spinK(p),lift:s*3};
      return{aF:1.3+s*0.4,wA:0,lunge:s*6};
    default: // kiếm, đao: chém dọc, chém ngang, đâm thẳng
      if(st===1)return{aF:1.55,wA:-1.3+p*2.6,rot:(p-0.5)*0.2,lunge:s*3};
      if(st===2)return{aF:1.57,wA:0,lunge:s*8};
      return{aF:2.7-p*2.5};
  }}
function drawChibi(L,x,y,s,dir,face,moving,atk,flash,W,sd){
  const t=nowT;sd=sd==null?(x*0.013+y*0.007):sd;W=W||L.weapon;s*=L.scale||1;
  const side=dir==='side',up=dir==='up';
  ctx.save();ctx.translate(x,y);ctx.scale(side&&face<0?-s:s,s);
  if(flash)ctx.filter='brightness(2.2)';
  ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=OL;ctx.lineWidth=0.85;
  const ph=t*10+sd*7,sw=moving?Math.sin(ph):0,bob=moving?Math.abs(Math.cos(ph)):0,b=moving?-bob*1.4:Math.sin(t*2.2+sd*5)*0.45;
  if(moving&&side)ctx.rotate(0.07);
  const hs=Math.sin(t*(moving?9:2.2)+sd*3)*(moving?1.5:0.45),tr=side&&moving?-2.2:0;
  let aF,aB;
  if(side){aF=moving?sw*0.7:0.25;aB=moving?-sw*0.7:-0.1;}
  else{aF=0.18+(moving?sw*0.12:0);aB=-0.18+(moving?sw*0.12:0);}
  const ap=atk>0?clamp(1-atk/0.25,0,1):-1;let wA=null,A=null;
  if(ap>=0){A=atkPose(W?W.type:'sword',(W&&W.style)||0,ap);aF=A.aF;if(A.aB!=null)aB=A.aB;if(A.wA!=null)wA=A.wA;
    const lg=A.lunge||0;if(side)ctx.translate(lg,-(A.lift||0));else ctx.translate(0,-(A.lift||0)+(up?-lg*0.4:lg*0.4));if(A.rot)ctx.rotate(A.rot);if(A.spin)ctx.scale(A.spin,1);}
  if(W&&W.type==='fan')W=Object.assign({},W,{open:ap>=0?(A.open||0):0});
  const sg=up?-1:1;
  const sF={x:side?1.5:7.5*sg,y:-27.5+b},sB={x:side?-1.5:-7.5*sg,y:-27.5+b};
  const hand=(sh,a)=>({x:sh.x+Math.sin(a)*sg*12,y:sh.y+Math.cos(a)*12});
  const weapon=()=>{if(!W)return;const h=hand(sF,aF);let ang;
    if(ap>=0)ang=wA!=null?wA:Math.atan2(Math.cos(aF),Math.sin(aF)*sg);else ang=W.type==='staff'?-Math.PI/2:(sg>0?-1.1:-Math.PI+1.1);
    drawWeapon(W,h.x,h.y,ang);
    if(A&&A.notes&&Math.random()<0.25)fx.push({k:'t',x:x+(side?face*14:0),y:y-44,txt:Math.random()<.5?'♪':'♫',col:'#bff4ff',size:12,t:0,life:0.9});};
  // song chủy: tay sau cũng cầm một con dao
  const weaponB=()=>{if(!W||W.type!=='dagger')return;const h=hand(sB,aB);const ang=ap>=0?Math.atan2(Math.cos(aB),Math.sin(aB)*sg):(sg>0?-1.1:-Math.PI+1.1);drawWeapon(W,h.x,h.y,ang);};
  const arm=(sh,a)=>{ctx.save();ctx.translate(sh.x,sh.y);ctx.rotate(-a*sg);
    const fl=Math.sin(nowT*4+sh.x)*0.7+(moving?-sw*0.8:0),gg=ctx.createLinearGradient(-4,0,5,12);gg.addColorStop(0,shade(L.robe,0.1));gg.addColorStop(1,shade(L.robe,-0.15));
    ctx.beginPath();ctx.moveTo(-2.6,-1);ctx.lineTo(2.6,-1);ctx.quadraticCurveTo(4.8,5,6.4+fl,11.6);ctx.quadraticCurveTo(0.6,13.4,-5.4+fl,11.6);ctx.quadraticCurveTo(-3.8,5,-2.6,-1);ctx.closePath();fs(gg);
    ctx.beginPath();ctx.moveTo(6.4+fl,11.6);ctx.quadraticCurveTo(0.6,13.4,-5.4+fl,11.6);ctx.lineTo(-5+fl,9.7);ctx.quadraticCurveTo(0.6,11.3,6+fl,9.7);ctx.closePath();fs(L.trim);
    ctx.beginPath();ctx.arc(0.5,12.7,2.2,0,Math.PI*2);fs(L.skin);ctx.restore();};
  const hy=-40+b,bun={x:side?-3:0,y:hy-11};
  const longHair=()=>{const wv=Math.sin(t*3+sd)*1.6;ctx.beginPath();
    if(side){const bk=moving?-5:-1;ctx.moveTo(-1,hy-9);ctx.quadraticCurveTo(-15+bk,hy+2,-12+bk*1.4+wv,hy+26);ctx.quadraticCurveTo(-8+bk,hy+18,-4,hy+8);ctx.closePath();}
    else{ctx.moveTo(-10,hy);ctx.quadraticCurveTo(-13,hy+15,-8+wv*0.5,hy+26);ctx.quadraticCurveTo(0,hy+28,8+wv*0.5,hy+26);ctx.quadraticCurveTo(13,hy+15,10,hy);ctx.closePath();}
    fs(hairG(L,hy));};
  const pony=()=>{const wv=Math.sin(t*3.4+sd)*1.8;ctx.beginPath();
    if(side){const bk=moving?-5:-1;ctx.moveTo(bun.x-1,bun.y-2);ctx.quadraticCurveTo(-13+bk,hy-2,-12+bk*1.5+wv,hy+21);ctx.quadraticCurveTo(-9+bk,hy+8,bun.x+1,bun.y+3);ctx.closePath();}
    else{ctx.moveTo(-3.5,hy-8);ctx.quadraticCurveTo(-5,hy+10,wv*0.6,hy+23);ctx.quadraticCurveTo(5,hy+10,3.5,hy-8);ctx.closePath();}
    fs(hairG(L,hy));};
  const sash=()=>{if(!L.sash)return;const wv=Math.sin(t*3+sd)*2,wv2=Math.cos(t*2.6+sd)*2;
    const path=()=>{ctx.beginPath();if(side){const bk=moving?-6:-3;ctx.moveTo(4,-24+b);ctx.bezierCurveTo(-6,-36+b,-14+bk,-22+wv,-19+bk*1.5,-9+wv2);ctx.moveTo(-1,-20+b);ctx.bezierCurveTo(-8,-14+b,-13+bk,-6+wv2,-21+bk*1.6,-1+wv);}
      else{ctx.moveTo(-13+wv*0.3,-3+wv);ctx.bezierCurveTo(-17,-18+wv2,-15,-34+b,0,-33+b);ctx.bezierCurveTo(15,-34+b,17,-18+wv,13+wv2*0.3,-3+wv2);}};
    ctx.save();if(L.sashGlow){ctx.shadowColor=L.sashGlow;ctx.shadowBlur=8;}path();ctx.strokeStyle=shade(L.sash,-0.25);ctx.globalAlpha=0.85;ctx.lineWidth=3.6;ctx.stroke();ctx.shadowBlur=0;ctx.globalAlpha=1;
    path();ctx.strokeStyle=L.sash;ctx.lineWidth=2.3;ctx.stroke();path();ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=0.7;ctx.stroke();ctx.restore();};
  const ribbons=()=>{if(!L.ribbon)return;ctx.save();ctx.strokeStyle=L.band;ctx.lineWidth=2;
    for(const k of [-1,1]){const wv=Math.sin(t*6+k)*2.5;ctx.beginPath();ctx.moveTo(bun.x,bun.y+2);
      if(side)ctx.quadraticCurveTo(bun.x-8,bun.y+3+k*2,bun.x-14+wv*0.5,bun.y+7+k*3+wv);
      else ctx.quadraticCurveTo(bun.x+k*6,bun.y+5,bun.x+k*8+wv*0.4,bun.y+13+wv);
      ctx.stroke();}ctx.restore();};
  if(side){arm(sB,aB);weaponB();}
  if(up){weapon();weaponB();}
  if(!up){sash();if(L.longHair)longHair();if(L.pony)pony();ribbons();}
  cShoes(L,sw,dir);
  cRobe(L,dir,b,hs,tr);
  if(up){if(L.longHair)longHair();if(L.pony)pony();sash();}
  if(L.armor)for(const px of (side?[1.5]:[-8,8])){const ag=ctx.createLinearGradient(0,-32,0,-24);ag.addColorStop(0,shade(L.armor,0.3));ag.addColorStop(1,L.armor);ctx.beginPath();ctx.ellipse(px,-27+b,5.8,4,0,Math.PI,0);ctx.closePath();fs(ag);
    ctx.save();ctx.strokeStyle='#c9a227';ctx.lineWidth=1.1;ctx.beginPath();ctx.ellipse(px,-27.6+b,4.2,2.6,0,Math.PI,0);ctx.stroke();ctx.restore();}
  if(side){arm(sF,aF);weapon();}
  else if(dir==='down'){arm(sB,aB);weaponB();arm(sF,aF);weapon();}
  else{arm(sB,aB);arm(sF,aF);}
  cHead(L,dir,hy,bun,sd);
  if(up)ribbons();
  ctx.restore();
}

// ===================== QUÁI THÚ =====================
function beast(x,y,s,face,flash){ctx.save();ctx.translate(x,y);ctx.scale(face<0?-s:s,s);if(flash)ctx.filter='brightness(2.2)';ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=OL;ctx.lineWidth=1;}
function drawWolf(x,y,s,face,moving,atk,flash,col){const t=nowT;beast(x,y,s,face,flash);
  const ph=t*12,sw=moving?Math.sin(ph):0,b=moving?-Math.abs(Math.cos(ph))*1.3:Math.sin(t*3+x)*0.4,ap=atk>0?clamp(1-atk/0.25,0,1):0;
  ctx.translate(Math.sin(ap*Math.PI)*6,0);
  const c1=col||'#8d939b',c2=shade(c1,-0.3),c3=shade(c1,0.35);
  const leg=(lx,o,c)=>{ctx.beginPath();ctx.roundRect(lx+o-1.8,-11+b*0.5,3.6,11-b*0.5,1.6);fs(c);};
  leg(-6,sw*3,c2);leg(9,-sw*3,c2);
  const wv=Math.sin(t*7)*2;
  ctx.beginPath();ctx.moveTo(-12,-16+b);ctx.quadraticCurveTo(-22,-23+b+wv,-24,-12+b+wv);ctx.quadraticCurveTo(-18,-12+b,-12,-11+b);ctx.closePath();fs(c1);
  const g=ctx.createLinearGradient(0,-22+b,0,-7+b);g.addColorStop(0,c3);g.addColorStop(1,c2);
  ctx.beginPath();ctx.ellipse(-1,-14.5+b,13.5,7,0,0,Math.PI*2);fs(g);
  leg(-9,-sw*3,c1);leg(6,sw*3,c1);
  ctx.beginPath();ctx.moveTo(7,-21+b);ctx.lineTo(9.5,-29+b);ctx.lineTo(13,-22+b);ctx.closePath();fs(c1);
  ctx.beginPath();ctx.moveTo(7,-22+b);ctx.quadraticCurveTo(15,-27+b,19,-19.5+b);ctx.lineTo(25.5,-16.5+b);ctx.quadraticCurveTo(26.5,-11.5+b,21,-11.5+b);ctx.quadraticCurveTo(13,-8.5+b,7,-13+b);ctx.closePath();fs(c1);
  ctx.beginPath();ctx.moveTo(12,-23+b);ctx.lineTo(15.5,-30.5+b);ctx.lineTo(17.5,-21+b);ctx.closePath();fs(c1);
  ctx.fillStyle='#e8a0a0';ctx.beginPath();ctx.moveTo(13.5,-23+b);ctx.lineTo(15.3,-28+b);ctx.lineTo(16.3,-22.5+b);ctx.closePath();ctx.fill();
  ctx.fillStyle=c3;ctx.beginPath();ctx.moveTo(18,-14.5+b);ctx.quadraticCurveTo(22,-13+b,25,-14+b);ctx.quadraticCurveTo(24,-11.6+b,20,-11.8+b);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.ellipse(17,-19+b,1.8,1.2,-0.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(17.2,-19.8+b,1,1.6);
  ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(25.4,-15.5+b,1.4,0,Math.PI*2);ctx.fill();
  if(ap>0){ctx.fillStyle='#fff';ctx.fillRect(20,-12.4+b,1,1.8);ctx.fillRect(22.5,-12.4+b,1,1.8);}
  ctx.fillStyle=c3;ctx.beginPath();ctx.moveTo(6,-20+b);ctx.lineTo(3.5,-15+b);ctx.lineTo(6.5,-16+b);ctx.lineTo(5.5,-11+b);ctx.lineTo(9.5,-13.5+b);ctx.closePath();ctx.fill();
  ctx.restore();}
function drawBoar(x,y,s,face,moving,atk,flash){const t=nowT;beast(x,y,s,face,flash);
  const ph=t*12,sw=moving?Math.sin(ph):0,b=moving?-Math.abs(Math.cos(ph))*1.2:Math.sin(t*2.5+x)*0.4,ap=atk>0?clamp(1-atk/0.25,0,1):0;
  ctx.translate(Math.sin(ap*Math.PI)*7,0);
  const c1='#7a4a2a',c2='#4f2f18',c3='#a8744a',m='#2a160a';
  const leg=(lx,o,c)=>{ctx.beginPath();ctx.roundRect(lx+o-2,-9,4,9,1.5);fs(c);ctx.fillStyle='#1a0f08';ctx.fillRect(lx+o-2,-2,4,2);};
  leg(-7,sw*2.5,c2);leg(8,-sw*2.5,c2);
  ctx.save();ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-15,-16+b);ctx.quadraticCurveTo(-19,-19+b,-17,-21+b);ctx.quadraticCurveTo(-15,-22+b,-16,-19+b);ctx.stroke();ctx.restore();
  for(let i=0;i<7;i++){const px=-11+i*3.2;ctx.beginPath();ctx.moveTo(px-2,-20.5+b);ctx.lineTo(px+0.5,-26.5+b-(i%2)*1.5);ctx.lineTo(px+2.5,-20.5+b);ctx.closePath();fs(m);}
  const g=ctx.createLinearGradient(0,-24+b,0,-6+b);g.addColorStop(0,c3);g.addColorStop(1,c2);
  ctx.beginPath();ctx.ellipse(-1,-14+b,15,8.8,0,0,Math.PI*2);fs(g);
  leg(-10,-sw*2.5,c1);leg(5,sw*2.5,c1);
  ctx.beginPath();ctx.moveTo(8,-21+b);ctx.quadraticCurveTo(18,-21+b,21,-16+b);ctx.lineTo(22,-10+b);ctx.quadraticCurveTo(15,-6+b,9,-8.5+b);ctx.closePath();fs(c1);
  ctx.beginPath();ctx.moveTo(10,-20+b);ctx.lineTo(11.5,-26+b);ctx.lineTo(15,-20.5+b);ctx.closePath();fs(c2);
  ctx.beginPath();ctx.ellipse(22,-13+b,3,3.8,0,0,Math.PI*2);fs('#d29a7a');
  ctx.fillStyle='#3a1a10';ctx.fillRect(21.2,-14.5+b,1,1.4);ctx.fillRect(22.8,-12.5+b,1,1.4);
  ctx.beginPath();ctx.moveTo(17.5,-10+b);ctx.quadraticCurveTo(21.5,-8.5+b,22.5,-15+b);ctx.lineTo(20.5,-11.5+b);ctx.closePath();fs('#fffbe8');
  ctx.fillStyle='#1a0a05';ctx.beginPath();ctx.arc(15.5,-17+b,1.3,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff5040';ctx.fillRect(15.6,-17.6+b,0.8,0.8);
  ctx.restore();}
function drawSnake(x,y,s,face,moving,atk,flash,col){const t=nowT;beast(x,y,s,face,flash);
  const c1=col,c2=shade(col,-0.4),c3=shade(col,0.35),ap=atk>0?clamp(1-atk/0.25,0,1):0,wig=moving?8:2.5;
  const pts=[];for(let i=0;i<=12;i++){const u=i/12;let px=-22+u*30+(i>9?Math.sin(ap*Math.PI)*8:0);let py=-4+Math.sin(u*7-t*wig+x*0.1)*2.4*(1-u*0.5);if(i>8)py-=(i-8)*4.6;pts.push([px,py,1.6+u*4.6]);}
  ctx.fillStyle='rgba(30,40,30,.45)';for(const [px,py,r] of pts){ctx.beginPath();ctx.arc(px,py,r+0.8,0,Math.PI*2);ctx.fill();}
  pts.forEach(([px,py,r],i)=>{const g=ctx.createRadialGradient(px-r*0.3,py-r*0.45,0.4,px,py,r);g.addColorStop(0,c3);g.addColorStop(1,c1);ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,r,0,Math.PI*2);ctx.fill();
    if(i%2===0&&i<11){ctx.fillStyle=c2;ctx.beginPath();ctx.ellipse(px,py-r*0.35,r*0.45,r*0.25,0,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='rgba(240,230,170,.55)';ctx.beginPath();ctx.ellipse(px,py+r*0.55,r*0.6,r*0.28,0,0,Math.PI*2);ctx.fill();});
  const [hx,hy]=pts[12];
  ctx.beginPath();ctx.ellipse(hx-1,hy+3,8,6,0,0,Math.PI*2);ctx.fillStyle=c2;ctx.fill();
  const hg=ctx.createLinearGradient(hx,hy-6,hx,hy+4);hg.addColorStop(0,c3);hg.addColorStop(1,c1);ctx.beginPath();ctx.ellipse(hx+4,hy-1,7.6,5,-0.12,0,Math.PI*2);fs(hg);
  ctx.fillStyle='#ffe040';ctx.beginPath();ctx.ellipse(hx+6.5,hy-2.6,1.7,1.3,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#000';ctx.fillRect(hx+6.3,hy-3.7,0.7,2.4);
  if((t*1.5+x*0.01)%1<0.25||ap>0){ctx.strokeStyle='#e0304a';ctx.lineWidth=0.9;ctx.beginPath();ctx.moveTo(hx+11,hy);ctx.lineTo(hx+15,hy);ctx.lineTo(hx+17,hy-1.6);ctx.moveTo(hx+15,hy);ctx.lineTo(hx+17,hy+1.6);ctx.stroke();}
  ctx.restore();}
function drawFox(x,y,s,face,moving,atk,flash,col,tails,boss){const t=nowT;beast(x,y,s,face,flash);
  const ph=t*13,sw=moving?Math.sin(ph):0,b=moving?-Math.abs(Math.cos(ph))*1.4:Math.sin(t*2.6+x)*0.4,ap=atk>0?clamp(1-atk/0.25,0,1):0;
  ctx.translate(Math.sin(ap*Math.PI)*6,0);
  const c1=col,c2=shade(col,-0.3),c3=shade(col,0.3),wh='#fff6ec';
  const n=tails||1,TL=boss?24:20;
  ctx.save();if(boss){ctx.shadowColor='#ffb060';ctx.shadowBlur=10;}
  for(let k=0;k<n;k++){const a=Math.PI+0.12+(n>1?k*(1.2/(n-1)):0.5)+Math.sin(t*2.4+k*0.8)*0.1;ctx.save();ctx.translate(-11,-16+b);ctx.rotate(a);
    const g=ctx.createLinearGradient(0,0,TL,0);g.addColorStop(0,c2);g.addColorStop(0.65,c1);g.addColorStop(0.85,wh);g.addColorStop(1,wh);
    ctx.beginPath();ctx.moveTo(0,-3.5);ctx.bezierCurveTo(TL*0.4,-9,TL*0.9,-6.5,TL,0);ctx.bezierCurveTo(TL*0.9,6.5,TL*0.4,9,0,3.5);ctx.closePath();fs(g);ctx.restore();}
  ctx.restore();
  const leg=(lx,o,c)=>{ctx.beginPath();ctx.roundRect(lx+o-1.6,-10+b*0.5,3.2,10-b*0.5,1.5);fs(c);ctx.fillStyle='#2a1a14';ctx.fillRect(lx+o-1.6,-2.5,3.2,2.5);};
  leg(-6,sw*3,c2);leg(8,-sw*3,c2);
  const g=ctx.createLinearGradient(0,-21+b,0,-8+b);g.addColorStop(0,c3);g.addColorStop(1,c2);ctx.beginPath();ctx.ellipse(-1,-14.5+b,12,6.5,0,0,Math.PI*2);fs(g);
  leg(-9,-sw*3,c1);leg(5,sw*3,c1);
  ctx.fillStyle=wh;ctx.beginPath();ctx.ellipse(8,-12+b,4,4.6,0.3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.moveTo(6,-21+b);ctx.lineTo(8.5,-31+b);ctx.lineTo(12.5,-22+b);ctx.closePath();fs(c1);
  ctx.beginPath();ctx.moveTo(6.5,-21.5+b);ctx.quadraticCurveTo(14,-27+b,18,-19+b);ctx.lineTo(25,-15.5+b);ctx.quadraticCurveTo(25,-12.5+b,20,-12.2+b);ctx.quadraticCurveTo(12,-9.5+b,6.5,-13.5+b);ctx.closePath();fs(c1);
  ctx.fillStyle=wh;ctx.beginPath();ctx.moveTo(16,-15+b);ctx.quadraticCurveTo(21,-13.5+b,24.5,-14.6+b);ctx.quadraticCurveTo(23,-12.3+b,19,-12.4+b);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(11.5,-22.5+b);ctx.lineTo(15,-32+b);ctx.lineTo(17.5,-20.5+b);ctx.closePath();fs(c1);
  ctx.fillStyle='#2a1a14';ctx.beginPath();ctx.moveTo(13.6,-28+b);ctx.lineTo(15,-32+b);ctx.lineTo(16,-28.4+b);ctx.closePath();ctx.fill();
  ctx.fillStyle=boss?'#ff4a2a':'#ffe46a';ctx.save();if(boss){ctx.shadowColor='#ff4a2a';ctx.shadowBlur=6;}ctx.beginPath();ctx.ellipse(16,-19+b,1.9,1.1,-0.35,0,Math.PI*2);ctx.fill();ctx.restore();ctx.fillStyle='#000';ctx.fillRect(16.1,-19.8+b,0.8,1.5);
  ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(24.8,-15.2+b,1.3,0,Math.PI*2);ctx.fill();
  if(boss)for(let k=0;k<3;k++){const a=t*2+k*2.1,fx=Math.cos(a)*22,fy=-22+Math.sin(a)*8;const fg=ctx.createRadialGradient(fx,fy,0.5,fx,fy,5);fg.addColorStop(0,'#e0f4ff');fg.addColorStop(0.5,'rgba(90,170,255,.8)');fg.addColorStop(1,'rgba(90,170,255,0)');ctx.fillStyle=fg;ctx.beginPath();ctx.arc(fx,fy,5,0,Math.PI*2);ctx.fill();}
  ctx.restore();}
function drawSpirit(x,y,s,face,moving,atk,flash,col){col=col||'#a8e6ff';const cl=shade(col,0.45),cd=shade(col,-0.35);const t=nowT;ctx.save();ctx.translate(x,y);ctx.scale(s,s);if(flash)ctx.filter='brightness(2)';
  const fy=-26+Math.sin(t*2.4+x*0.05)*3,ap=atk>0?1:0;
  const gl=ctx.createRadialGradient(0,fy,2,0,fy,24+ap*6);gl.addColorStop(0,col+'99');gl.addColorStop(1,col+'00');ctx.fillStyle=gl;ctx.beginPath();ctx.arc(0,fy,24+ap*6,0,Math.PI*2);ctx.fill();
  ctx.lineJoin='round';ctx.strokeStyle='rgba(60,130,190,.7)';ctx.lineWidth=0.9;
  const g=ctx.createLinearGradient(-9,fy-16,9,fy+14);g.addColorStop(0,'#ffffff');g.addColorStop(0.45,col);g.addColorStop(1,cd);
  ctx.beginPath();ctx.moveTo(0,fy-17);ctx.lineTo(9.5,fy-1);ctx.lineTo(0,fy+15);ctx.lineTo(-9.5,fy-1);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.moveTo(0,fy-17);ctx.lineTo(-2,fy-1);ctx.lineTo(0,fy+15);ctx.moveTo(-9.5,fy-1);ctx.lineTo(9.5,fy-1);ctx.stroke();
  ctx.fillStyle='#ffffff';ctx.shadowColor='#bff4ff';ctx.shadowBlur=8;ctx.beginPath();ctx.arc(-2.6,fy-3,1.1,0,Math.PI*2);ctx.arc(2.6,fy-3,1.1,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  for(let k=0;k<3;k++){const a=t*1.8+k*2.094,sx=Math.cos(a)*15,sy=fy+Math.sin(a)*5;ctx.fillStyle=Math.sin(a)>0?cl:col;ctx.beginPath();ctx.moveTo(sx,sy-4);ctx.lineTo(sx+2.2,sy);ctx.lineTo(sx,sy+4);ctx.lineTo(sx-2.2,sy);ctx.closePath();ctx.fill();}
  ctx.restore();}
function drawMonsterBody(m,x,y,flash){const t=m.t,s=t.scale||1,mv=m.moving&&m.freezeT<=0;
  if(t.draw==='wolf')drawWolf(x,y,s,m.face,mv,m.atkAnim,flash,t.col);
  else if(t.draw==='boar')drawBoar(x,y,1.1*s,m.face,mv,m.atkAnim,flash);
  else if(t.draw==='snake')drawSnake(x,y,s,m.face,mv,m.atkAnim,flash,t.col);
  else if(t.draw==='fox')drawFox(x,y,s,m.face,mv,m.atkAnim,flash,t.col,t.tails,t.boss);
  else if(t.draw==='spirit')drawSpirit(x,y,s,m.face,mv,m.atkAnim,flash,t.col);
  else drawChibi(NPC_LOOK[t.look],x,y,s,m.dir||'side',m.face,mv,m.atkAnim,flash);}

// ===================== PHI KIẾM, LINH THẢO, CỔNG =====================
function drawFlySword(x,y,face,col,glow){ctx.save();ctx.translate(x,y);ctx.scale(face,1);
  ctx.shadowColor=glow||'#9fd3ff';ctx.shadowBlur=14;ctx.lineWidth=0.9;ctx.strokeStyle=OL;
  ctx.beginPath();ctx.moveTo(-18,-2.2);ctx.lineTo(24,-2.2);ctx.quadraticCurveTo(31,0,24,2.2);ctx.lineTo(-18,2.2);ctx.closePath();
  const g=ctx.createLinearGradient(0,-2.2,0,2.2);g.addColorStop(0,'#ffffff');g.addColorStop(1,col||'#bfe0ff');ctx.fillStyle=g;ctx.fill();ctx.stroke();ctx.shadowBlur=0;
  ctx.fillStyle='#c9a227';ctx.beginPath();ctx.roundRect(-21,-4.5,3,9,1);ctx.fill();ctx.stroke();
  ctx.fillStyle='#5a2a14';ctx.beginPath();ctx.roundRect(-28,-1.6,7,3.2,1);ctx.fill();ctx.restore();}
function drawHerb(h){if(h.dead)return;const x=h.x,y=h.y,p=0.6+0.4*Math.sin(nowT*3+x),k=TH.herb;
  const gc={lotus:'255,170,220',snowlotus:'170,230,255',desertflower:'255,160,90',ghostflower:'190,140,255',jadeflower:'255,240,170'}[k]||'140,255,200';
  const g=ctx.createRadialGradient(x,y-10,1,x,y-10,22);g.addColorStop(0,`rgba(${gc},${0.4*p})`);g.addColorStop(1,`rgba(${gc},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y-10,22,0,Math.PI*2);ctx.fill();
  ctx.lineCap='round';
  if(k==='desertflower'||k==='ghostflower'||k==='jadeflower'||k==='firelotus'||k==='coral'||k==='starflower'){const P2={desertflower:['#5a8a3a','#ff6a3a','#ffd060'],ghostflower:['#3a5a4a','#b080ff','#e0c8ff'],jadeflower:['#6aa880','#fff0a0','#ffffff'],firelotus:['#4a3020','#ff5a1a','#ffe060'],coral:['#c84a6a','#ff8ab0','#fff0f6'],starflower:['#3a3a8a','#a8a0ff','#ffffff']}[k];
    ctx.strokeStyle=P2[0];ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-10);ctx.stroke();if(k==='desertflower'){ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y-3);ctx.lineTo(x-5,y-6);ctx.lineTo(x-5,y-10);ctx.moveTo(x,y-4);ctx.lineTo(x+5,y-7);ctx.lineTo(x+5,y-11);ctx.stroke();}
    for(let i=0;i<6;i++){const a=i/6*Math.PI*2+nowT*0.3;ctx.fillStyle=P2[1];ctx.beginPath();ctx.ellipse(x+Math.cos(a)*3.6,y-13+Math.sin(a)*2.2,2.2,4,a+Math.PI/2,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle=P2[2];ctx.shadowColor=P2[1];ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x,y-13,2.4+p*0.7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  else if(k==='lotus'){ctx.fillStyle='#3f8a52';ctx.beginPath();ctx.ellipse(x,y-2,11,4.5,0,0.3,Math.PI*2-0.3);ctx.lineTo(x,y-2);ctx.fill();
    for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*0.42;ctx.fillStyle=i%2?'#ffb8d8':'#ff8cc0';ctx.beginPath();ctx.ellipse(x+Math.cos(a)*4,y-9+Math.sin(a)*4,2.6,5.6,a+Math.PI/2,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#ffe070';ctx.shadowColor='#ffd0f0';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x,y-9,2.2+p*0.6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  else if(k==='snowlotus'){ctx.strokeStyle='#5a8a7a';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y-8);ctx.stroke();
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;ctx.fillStyle=i%2?'#ffffff':'#d8f2ff';ctx.beginPath();ctx.ellipse(x+Math.cos(a)*4,y-11+Math.sin(a)*2.4,2.2,4.6,a+Math.PI/2,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#bff4ff';ctx.shadowColor='#9fe8ff';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x,y-11,2.4+p*0.6,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
  else{ctx.strokeStyle='#2f7a3a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+2,y-8,x,y-14);ctx.stroke();
    ctx.fillStyle='#4fbf5a';for(const s of [-1,1]){ctx.beginPath();ctx.ellipse(x+s*5,y-5,5,2.2,s*0.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(x+s*4,y-10,4,1.8,s*0.6,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#bfffe8';ctx.shadowColor='#6fffc8';ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x,y-15,3+p,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}}
function drawPortal(p,locked){const x=p.x*T,y=p.y*T,t=nowT,c=locked?'255,120,110':'130,210,255';
  const g=ctx.createRadialGradient(x,y,4,x,y,34);g.addColorStop(0,`rgba(${c},.5)`);g.addColorStop(1,`rgba(${c},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,34,17,0,0,Math.PI*2);ctx.fill();
  ctx.save();ctx.translate(x,y);ctx.scale(1,0.5);ctx.lineWidth=2;
  for(let k=0;k<2;k++){ctx.save();ctx.rotate(t*(k?-0.8:0.6));ctx.strokeStyle=`rgba(${c},${k?0.7:0.95})`;ctx.setLineDash(k?[6,5]:[14,6]);ctx.beginPath();ctx.arc(0,0,k?20:28,0,Math.PI*2);ctx.stroke();ctx.restore();}
  ctx.setLineDash([]);ctx.fillStyle=`rgba(${c},.9)`;for(let k=0;k<8;k++){const a=t*0.6+k*Math.PI/4;ctx.beginPath();ctx.arc(Math.cos(a)*24,Math.sin(a)*24,2,0,Math.PI*2);ctx.fill();}ctx.restore();
  const lg=ctx.createLinearGradient(0,y-90,0,y);lg.addColorStop(0,`rgba(${c},0)`);lg.addColorStop(1,`rgba(${c},.35)`);ctx.fillStyle=lg;ctx.fillRect(x-16,y-90,32,90);
  for(let k=0;k<5;k++){const q=(t*0.5+k/5)%1;ctx.globalAlpha=Math.sin(q*Math.PI);ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(x+Math.sin(k*2.1+t)*12,y-q*80,1.5,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  const M=MAPS[p.to];label(`➤ ${M.name}`,x,y-58,locked?'#ff9a8a':'#bfe8ff',12);label(locked?`Cần cấp ${p.minLv}`:`Cấp ${M.lvText}`,x,y-44,locked?'#ff9a8a':'#ffe9a8',10);}

// ===================== CÂY (sprite đung đưa) =====================
function canopy(c,bl,C,line){c.strokeStyle=line;c.lineWidth=2.2;for(const b of bl){c.beginPath();c.arc(b[0],b[1],b[2],0,Math.PI*2);c.stroke();}
  for(const b of bl){const g=c.createRadialGradient(b[0]-b[2]*0.4,b[1]-b[2]*0.45,1,b[0],b[1],b[2]);g.addColorStop(0,C[0]);g.addColorStop(0.55,C[1]);g.addColorStop(1,C[2]);c.fillStyle=g;c.beginPath();c.arc(b[0],b[1],b[2],0,Math.PI*2);c.fill();}}
function trunk(c,h,col){const g=c.createLinearGradient(-3,0,3,0);g.addColorStop(0,shade(col,0.15));g.addColorStop(1,shade(col,-0.25));c.fillStyle=g;c.strokeStyle='rgba(40,25,15,.4)';c.lineWidth=0.9;
  c.beginPath();c.moveTo(-3.4,0);c.quadraticCurveTo(-2,-h*0.5,-2.4,-h);c.lineTo(2.4,-h);c.quadraticCurveTo(2,-h*0.5,3.4,0);c.closePath();c.fill();c.stroke();}
function treeShadow(c,w){const g=c.createRadialGradient(0,0,1,0,0,w);g.addColorStop(0,'rgba(0,0,0,.28)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.ellipse(0,0,w,w*0.36,0,0,Math.PI*2);c.fill();}
function makeTrees(theme){const out=[],W=70,H=84,AX=35,AY=72;seed=4242;
  const add=(n,fn)=>{for(let i=0;i<n;i++)out.push(mkSprite(W,H,AX,AY,c=>{treeShadow(c,17);fn(c);}));};
  if(theme==='spring'){
    add(4,c=>{trunk(c,16,'#7a5030');const bl=[[0,-30,13.5],[-10,-22,10],[10,-22,10],[-5,-39,9],[6,-38,9],[srand()*6-3,-27,8]];canopy(c,bl,['#9ade6c','#4aa840','#2c7a30'],'rgba(25,70,25,.35)');
      for(let i=0;i<6;i++){c.fillStyle='rgba(230,255,180,.5)';c.beginPath();c.arc(-9+srand()*16,-42+srand()*16,1.4,0,Math.PI*2);c.fill();}});
    add(3,c=>{trunk(c,8,'#6a4428');for(let k=0;k<3;k++){const w=16-k*3.8,y0=-6-k*10;c.beginPath();c.moveTo(-w,y0);c.quadraticCurveTo(0,y0+4,w,y0);c.quadraticCurveTo(w*0.3,y0-9,1,y0-18);c.quadraticCurveTo(-w*0.3,y0-9,-w,y0);c.closePath();
      const g=c.createLinearGradient(-w,0,w,0);g.addColorStop(0,'#52b068');g.addColorStop(1,'#1d5c34');c.fillStyle=g;c.strokeStyle='rgba(15,50,25,.4)';c.lineWidth=1;c.fill();c.stroke();}});
    add(2,c=>{trunk(c,16,'#6e4630');canopy(c,[[0,-30,13.5],[-10,-22,10],[10,-22,10],[-5,-39,9],[6,-38,9]],['#ffe8f0','#f7a6c8','#d8749e'],'rgba(140,50,90,.3)');
      for(let i=0;i<9;i++){c.fillStyle=srand()<.5?'#ffffff':'#ffd6e6';c.beginPath();c.arc(-12+srand()*24,-44+srand()*26,1.3,0,Math.PI*2);c.fill();}});
  }else if(theme==='marsh'){
    add(4,c=>{trunk(c,18,'#5a4630');canopy(c,[[0,-32,12],[-9,-26,9],[9,-26,9],[0,-40,8]],['#bfe68a','#7cbf5a','#4a8a3e'],'rgba(30,70,30,.3)');
      c.lineWidth=1.1;for(let i=0;i<22;i++){const sx=-17+i*1.6,top=-26-Math.sqrt(Math.max(0,150-sx*sx))*0.6,len=18+srand()*14;c.strokeStyle=srand()<.5?'rgba(150,210,110,.95)':'rgba(100,170,80,.95)';c.beginPath();c.moveTo(sx,top);c.quadraticCurveTo(sx*1.1,top+len*0.5,sx*1.15+srand()*2,top+len);c.stroke();}});
    add(3,c=>{for(let i=0;i<11;i++){const sx=-8+srand()*16,h=20+srand()*18,lean=srand()*6-3;c.strokeStyle=srand()<.5?'#7aa84e':'#a8b860';c.lineWidth=1.4;c.beginPath();c.moveTo(sx,0);c.quadraticCurveTo(sx+lean*0.5,-h*0.6,sx+lean,-h);c.stroke();
      if(srand()<0.45){c.fillStyle='#6a4022';c.beginPath();c.ellipse(sx+lean,-h+3,1.6,4,0,0,Math.PI*2);c.fill();}}});
    add(2,c=>{trunk(c,8,'#4a3a28');c.beginPath();c.ellipse(0,-30,9,24,0,0,Math.PI*2);const g=c.createLinearGradient(-9,0,9,0);g.addColorStop(0,'#4a8a5a');g.addColorStop(1,'#1e4a34');c.fillStyle=g;c.strokeStyle='rgba(15,40,25,.4)';c.fill();c.stroke();
      c.fillStyle='rgba(160,220,170,.35)';c.beginPath();c.ellipse(-3,-38,3,9,0,0,Math.PI*2);c.fill();});
  }else if(theme==='desert'){
    add(4,c=>{const g=c.createLinearGradient(-5,0,5,0);g.addColorStop(0,'#8ab04a');g.addColorStop(1,'#4a7a2a');c.fillStyle=g;c.strokeStyle='rgba(30,60,20,.45)';c.lineWidth=1;
      const arm=(x0,y0,dir,h1,h2)=>{c.beginPath();c.moveTo(x0,y0);c.lineTo(x0+dir*7,y0);c.quadraticCurveTo(x0+dir*9,y0,x0+dir*9,y0-3);c.lineTo(x0+dir*9,y0-h2);c.quadraticCurveTo(x0+dir*9,y0-h2-3.5,x0+dir*6,y0-h2-3.5);c.quadraticCurveTo(x0+dir*4,y0-h2-3.5,x0+dir*4,y0-h2);c.lineTo(x0+dir*4,y0-4.5);c.lineTo(x0,y0-4.5);c.closePath();c.fill();c.stroke();};
      arm(3,-16-srand()*6,1,0,10+srand()*6);arm(-3,-22-srand()*6,-1,0,8+srand()*6);
      c.beginPath();c.roundRect(-4.5,-40-srand()*6,9,40,4.5);c.fill();c.stroke();c.strokeStyle='rgba(255,255,220,.4)';c.beginPath();c.moveTo(-1.5,-36);c.lineTo(-1.5,-2);c.stroke();
      if(srand()<0.5){c.fillStyle='#ff6a8a';c.beginPath();c.arc(0,-42,2.4,0,Math.PI*2);c.fill();}});
    add(3,c=>{trunk(c,30,'#8a6a42');for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*0.5;c.save();c.translate(0,-30);c.rotate(a+Math.PI/2);const g=c.createLinearGradient(0,0,20,0);g.addColorStop(0,'#6a9a3a');g.addColorStop(1,'#9ac85a');c.fillStyle=g;c.strokeStyle='rgba(40,70,20,.4)';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(10,-6,22,4);c.quadraticCurveTo(10,0,0,3);c.closePath();c.fill();c.stroke();c.restore();}
      c.fillStyle='#6a4a2a';c.beginPath();c.arc(-2,-29,2,0,Math.PI*2);c.arc(2,-28,2,0,Math.PI*2);c.fill();});
    add(2,c=>{for(let i=0;i<9;i++){const a=-Math.PI/2+(i-4)*0.32,l=10+srand()*8;c.strokeStyle=srand()<.5?'#a88a4a':'#8a7038';c.lineWidth=1.4;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(Math.cos(a)*l*0.5,Math.sin(a)*l*0.6-2,Math.cos(a)*l,Math.sin(a)*l);c.stroke();}});
  }else if(theme==='dark'){
    add(4,c=>{trunk(c,22,'#2e2630');c.strokeStyle='#2e2630';c.lineWidth=2.4;const br=[[0,-20,-14,-34],[0,-16,13,-30],[-6,-28,-18,-42],[5,-26,16,-44],[0,-22,-2,-48]];for(const [a,b2,cx,cy] of br){c.beginPath();c.moveTo(a,b2);c.quadraticCurveTo((a+cx)/2+4,(b2+cy)/2,cx,cy);c.stroke();}
      c.fillStyle='rgba(160,110,220,.55)';for(let i=0;i<5;i++){c.beginPath();c.arc(-12+srand()*24,-46+srand()*20,2+srand()*2,0,Math.PI*2);c.fill();}});
    add(3,c=>{trunk(c,14,'#3a3a2e');canopy(c,[[0,-28,13],[-10,-20,9.5],[10,-20,9.5],[-4,-37,8.5],[5,-36,8.5]],['#4a6a5a','#2a4a3a','#142a20'],'rgba(5,15,10,.45)');
      for(let i=0;i<4;i++){c.fillStyle='rgba(160,255,200,.6)';c.beginPath();c.arc(-9+srand()*18,-36+srand()*18,1.2,0,Math.PI*2);c.fill();}});
    add(2,c=>{for(const [mx,ms,mc] of [[-6,8,'#8a4ac0'],[5,11,'#6a3aa0'],[0,6,'#b07ae0']]){c.fillStyle='#d8d0c0';c.fillRect(mx-1.5,-ms*1.4,3,ms*1.4);const g=c.createRadialGradient(mx,-ms*1.4,1,mx,-ms*1.4,ms);g.addColorStop(0,shade(mc,0.4));g.addColorStop(1,mc);c.fillStyle=g;c.strokeStyle='rgba(30,10,40,.4)';c.beginPath();c.ellipse(mx,-ms*1.4,ms,ms*0.6,0,Math.PI,0);c.closePath();c.fill();c.stroke();
      c.fillStyle='rgba(255,230,255,.7)';c.beginPath();c.arc(mx-ms*0.3,-ms*1.6,1,0,Math.PI*2);c.fill();}});
  }else if(theme==='heaven'){
    add(4,c=>{trunk(c,16,'#a08a6a');canopy(c,[[0,-30,13.5],[-10,-22,10],[10,-22,10],[-5,-39,9],[6,-38,9]],['#ffffff','#fff0c8','#e8c87a'],'rgba(160,120,40,.25)');
      for(let i=0;i<8;i++){c.fillStyle=srand()<.5?'#ffe8a0':'#ffffff';c.beginPath();c.arc(-12+srand()*24,-44+srand()*26,1.3,0,Math.PI*2);c.fill();}});
    add(3,c=>{trunk(c,8,'#8a7a6a');for(let k=0;k<3;k++){const w=16-k*3.8,y0=-6-k*10;c.beginPath();c.moveTo(-w,y0);c.quadraticCurveTo(0,y0+4,w,y0);c.quadraticCurveTo(w*0.3,y0-9,1,y0-18);c.quadraticCurveTo(-w*0.3,y0-9,-w,y0);c.closePath();
      const g=c.createLinearGradient(-w,0,w,0);g.addColorStop(0,'#8ad8b0');g.addColorStop(1,'#3a8a6a');c.fillStyle=g;c.strokeStyle='rgba(30,80,60,.35)';c.lineWidth=1;c.fill();c.stroke();}});
    add(2,c=>{c.save();c.shadowColor='#bfe8ff';c.shadowBlur=10;for(const [cx,h2,w] of [[0,40,7],[-8,26,5],[8,30,5]]){const g=c.createLinearGradient(cx-w,0,cx+w,0);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#9fd8ff');c.fillStyle=g;c.strokeStyle='rgba(80,140,200,.5)';c.beginPath();c.moveTo(cx-w,0);c.lineTo(cx-w*0.6,-h2*0.8);c.lineTo(cx,-h2);c.lineTo(cx+w*0.6,-h2*0.8);c.lineTo(cx+w,0);c.closePath();c.fill();c.stroke();}c.restore();});
  }else if(theme==='volcano'){
    add(4,c=>{trunk(c,20,'#2a1e1a');c.strokeStyle='#2a1e1a';c.lineWidth=2.4;const br=[[0,-18,-13,-32],[0,-15,12,-30],[-5,-26,-15,-40],[4,-24,14,-42]];for(const [a,b2,cx,cy] of br){c.beginPath();c.moveTo(a,b2);c.quadraticCurveTo((a+cx)/2+3,(b2+cy)/2,cx,cy);c.stroke();}
      c.fillStyle='rgba(255,120,40,.85)';for(const [a,b2,cx,cy] of br){c.beginPath();c.arc(cx,cy,1.8,0,Math.PI*2);c.fill();}});
    add(3,c=>{for(const [cx,h2,w,col] of [[0,34,7,'#2a2030'],[-9,22,5,'#3a2a3a'],[9,26,5,'#2a2030']]){c.beginPath();c.moveTo(cx-w,0);c.lineTo(cx-w*0.4,-h2);c.lineTo(cx+w*0.5,-h2*0.85);c.lineTo(cx+w,0);c.closePath();c.fillStyle=col;c.strokeStyle='rgba(255,120,60,.6)';c.lineWidth=1;c.fill();c.stroke();
      c.strokeStyle='rgba(255,140,60,.8)';c.beginPath();c.moveTo(cx-w*0.2,-h2*0.2);c.lineTo(cx,-h2*0.6);c.stroke();}});
    add(2,c=>{trunk(c,10,'#4a3428');canopy(c,[[0,-24,11],[-8,-18,8],[8,-18,8],[0,-32,7]],['#ffd080','#ff7a2a','#a8301a'],'rgba(90,20,10,.4)');});
  }else if(theme==='sea'){
    add(4,c=>{const cols=['#ff7aa0','#ff9a6a','#c87aff','#ff6a8a'];const col=cols[(srand()*cols.length)|0];c.strokeStyle=col;c.lineCap='round';
      const br=(x,y,a,l,w)=>{if(l<5)return;const x2=x+Math.cos(a)*l,y2=y+Math.sin(a)*l;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();br(x2,y2,a-0.45,l*0.7,w*0.72);br(x2,y2,a+0.5,l*0.68,w*0.72);};
      br(0,0,-Math.PI/2,15,4.6);c.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<5;i++){c.beginPath();c.arc(-12+srand()*24,-40+srand()*22,1.2,0,Math.PI*2);c.fill();}});
    add(3,c=>{for(let i=0;i<7;i++){const sx=-9+i*3,h=24+srand()*20,wv=srand()*8-4;c.strokeStyle=srand()<.5?'#2a9a6a':'#4ac08a';c.lineWidth=2.6;c.beginPath();c.moveTo(sx,0);c.bezierCurveTo(sx+wv,-h*0.3,sx-wv,-h*0.65,sx+wv*0.6,-h);c.stroke();}});
    add(2,c=>{c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(0,-2,13,4,0,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(-13,-2);c.quadraticCurveTo(0,-26,13,-2);c.closePath();
      const g=c.createLinearGradient(0,-24,0,0);g.addColorStop(0,'#fff0f6');g.addColorStop(1,'#d8a8c0');c.fillStyle=g;c.strokeStyle='rgba(120,60,90,.4)';c.lineWidth=1;c.fill();c.stroke();
      c.strokeStyle='rgba(150,80,110,.35)';for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(0,-20);c.lineTo(k*5,-2);c.stroke();}c.fillStyle='#ffffff';c.beginPath();c.arc(0,-7,3,0,Math.PI*2);c.fill();});
  }else if(theme==='star'){
    add(4,c=>{c.save();c.shadowColor='#b8a0ff';c.shadowBlur=12;for(const [cx,h2,w] of [[0,42,6],[-8,28,4.5],[8,32,4.5],[-3,20,3.5]]){const g=c.createLinearGradient(cx-w,0,cx+w,0);g.addColorStop(0,'#f0e8ff');g.addColorStop(1,'#8a6ae0');c.fillStyle=g;c.strokeStyle='rgba(80,60,160,.5)';c.lineWidth=1;
      c.beginPath();c.moveTo(cx-w,0);c.lineTo(cx,-h2);c.lineTo(cx+w,0);c.closePath();c.fill();c.stroke();}c.restore();});
    add(3,c=>{trunk(c,16,'#3a3060');canopy(c,[[0,-30,13],[-10,-22,9.5],[10,-22,9.5],[-5,-39,8.5],[6,-38,8.5]],['#c8e8ff','#6a8ae0','#2a3a8a'],'rgba(20,20,70,.4)');
      for(let i=0;i<9;i++){c.fillStyle=srand()<.5?'#ffffff':'#ffe8a0';c.beginPath();c.arc(-12+srand()*24,-44+srand()*26,1.1,0,Math.PI*2);c.fill();}});
    add(2,c=>{trunk(c,22,'#2a2848');c.strokeStyle='#2a2848';c.lineWidth=2;for(const [a,b2,cx,cy] of [[0,-20,-12,-36],[0,-17,12,-34],[0,-22,0,-46]]){c.beginPath();c.moveTo(a,b2);c.lineTo(cx,cy);c.stroke();}
      c.save();c.shadowColor='#fff4a0';c.shadowBlur=10;c.fillStyle='#fff8d0';for(const [x,y] of [[-12,-37],[12,-35],[0,-47]]){c.beginPath();c.arc(x,y,2.6,0,Math.PI*2);c.fill();}c.restore();});
  }else{
    add(5,c=>{trunk(c,8,'#5a4434');for(let k=0;k<3;k++){const w=16-k*3.8,y0=-6-k*10;c.beginPath();c.moveTo(-w,y0);c.quadraticCurveTo(0,y0+4,w,y0);c.quadraticCurveTo(w*0.3,y0-9,1,y0-18);c.quadraticCurveTo(-w*0.3,y0-9,-w,y0);c.closePath();
      const g=c.createLinearGradient(-w,0,w,0);g.addColorStop(0,'#3e7a68');g.addColorStop(1,'#1a4038');c.fillStyle=g;c.strokeStyle='rgba(20,40,40,.4)';c.lineWidth=1;c.fill();c.stroke();
      c.fillStyle='#f6faff';c.beginPath();c.moveTo(-w*0.7,y0-4);c.quadraticCurveTo(-w*0.2,y0-6,1,y0-17);c.quadraticCurveTo(w*0.2,y0-6,w*0.6,y0-3.5);c.quadraticCurveTo(0,y0-7.5,-w*0.7,y0-4);c.fill();}});
    add(2,c=>{trunk(c,22,'#5a4a42');c.strokeStyle='#5a4a42';c.lineWidth=2;const br=[[0,-22,-12,-38],[0,-18,11,-34],[-6,-30,-16,-36],[5,-28,14,-42],[0,-22,2,-46]];for(const [a,b2,cx,cy] of br){c.beginPath();c.moveTo(a,b2);c.quadraticCurveTo((a+cx)/2,(b2+cy)/2-3,cx,cy);c.stroke();}
      c.strokeStyle='#ffffff';c.lineWidth=1.5;for(const [a,b2,cx,cy] of br){c.beginPath();c.moveTo((a+cx)/2,(b2+cy)/2-4);c.lineTo(cx,cy-1);c.stroke();}});
    add(2,c=>{trunk(c,16,'#5a4a42');canopy(c,[[0,-30,13],[-10,-22,9.5],[10,-22,9.5],[-5,-39,8.5],[6,-38,8.5]],['#ffffff','#cfe2f2','#8fb0cc'],'rgba(60,90,120,.3)');});
  }
  return out;}

// ===================== NHÀ (sprite) =====================
function makeHouse(theme){theme={volcano:'dark',sea:'marsh',star:'heaven'}[theme]||theme;return mkSprite(150,140,26,34,c=>{
  const sh=c.createRadialGradient(48,96,4,48,96,62);sh.addColorStop(0,'rgba(0,0,0,.3)');sh.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=sh;c.beginPath();c.ellipse(48,96,62,12,0,0,Math.PI*2);c.fill();
  c.strokeStyle='rgba(40,20,10,.45)';c.lineWidth=1;
  const rr=(x,y,w,h,col,r=1.5)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=col;c.fill();c.stroke();};
  const lin=(x0,y0,x1,y1,a,b)=>{const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g;};
  const lantern=(x,y)=>{c.strokeStyle='rgba(60,20,10,.6)';c.beginPath();c.moveTo(x,y-6);c.lineTo(x,y-2);c.stroke();const g=c.createRadialGradient(x,y+3,1,x,y+3,12);g.addColorStop(0,'rgba(255,200,120,.45)');g.addColorStop(1,'rgba(255,200,120,0)');c.fillStyle=g;c.beginPath();c.arc(x,y+3,12,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(x,y+3,4.2,5.4,0,0,Math.PI*2);c.fillStyle=lin(x-4,0,x+4,0,'#ff6a4a','#b8261a');c.fill();c.stroke();c.fillStyle='#e0b040';c.fillRect(x-2.5,y-2.6,5,1.6);c.fillRect(x-2.5,y+7.6,5,1.6);c.strokeStyle='#d0303a';c.beginPath();c.moveTo(x,y+9);c.lineTo(x,y+14);c.stroke();};
  if(theme==='desert'){
    rr(4,40,88,56,lin(0,40,0,96,'#e8c48a','#c89a5a'),8);c.strokeStyle='rgba(120,70,30,.3)';for(let i=0;i<5;i++){c.beginPath();c.moveTo(10,52+i*9);c.lineTo(86,52+i*9);c.stroke();}
    c.strokeStyle='rgba(40,20,10,.45)';c.beginPath();c.moveTo(14,42);c.quadraticCurveTo(14,4,48,2);c.quadraticCurveTo(82,4,82,42);c.closePath();c.fillStyle=lin(0,0,0,42,'#f4f0e8','#c8b89a');c.fill();c.stroke();
    c.fillStyle='#e0b040';c.beginPath();c.moveTo(48,-8);c.lineTo(51,2);c.lineTo(45,2);c.closePath();c.fill();
    c.beginPath();c.moveTo(36,96);c.lineTo(36,66);c.quadraticCurveTo(48,52,60,66);c.lineTo(60,96);c.closePath();c.fillStyle='#5a3a20';c.fill();c.stroke();
    for(const wx of [18,72]){c.beginPath();c.moveTo(wx-6,74);c.lineTo(wx-6,62);c.quadraticCurveTo(wx,54,wx+6,62);c.lineTo(wx+6,74);c.closePath();c.fillStyle='#3a2414';c.fill();c.stroke();}
    c.fillStyle='#c0402a';c.fillRect(4,40,88,4);lantern(2,50);lantern(94,50);
  }else if(theme==='dark'){
    rr(6,84,84,12,'#3e3e46',2);rr(12,44,72,42,lin(0,44,0,86,'#5a5a64','#3a3a44'),1);c.strokeStyle='rgba(0,0,0,.3)';for(let y=52;y<86;y+=8){c.beginPath();c.moveTo(12,y);c.lineTo(84,y);c.stroke();}
    c.fillStyle='rgba(60,90,60,.5)';for(let i=0;i<6;i++){c.beginPath();c.ellipse(14+i*13,86-i%3*10,5,3,0,0,Math.PI*2);c.fill();}
    rr(38,58,20,28,'#140e1a',2);c.fillStyle='rgba(180,120,255,.6)';c.beginPath();c.arc(48,70,3,0,Math.PI*2);c.fill();
    c.strokeStyle='rgba(10,5,15,.5)';c.beginPath();c.moveTo(-12,40);c.quadraticCurveTo(0,48,12,46);c.lineTo(30,14);c.quadraticCurveTo(48,6,66,14);c.lineTo(84,46);c.quadraticCurveTo(96,48,108,40);c.lineTo(100,52);c.quadraticCurveTo(48,58,-4,52);c.closePath();c.fillStyle=lin(0,6,0,56,'#4a3a5a','#241a30');c.fill();c.stroke();
    c.fillStyle='#120c18';c.beginPath();c.moveTo(60,20);c.lineTo(72,30);c.lineTo(64,34);c.closePath();c.fill();
    const lg=(x,y)=>{const g=c.createRadialGradient(x,y,1,x,y,14);g.addColorStop(0,'rgba(170,110,255,.6)');g.addColorStop(1,'rgba(170,110,255,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,14,0,Math.PI*2);c.fill();c.fillStyle='#d0b0ff';c.beginPath();c.arc(x,y,2.4,0,Math.PI*2);c.fill();};lg(6,56);lg(90,56);
  }else if(theme==='heaven'){
    rr(-4,86,104,10,lin(0,86,0,96,'#ffffff','#c8e0d8'),3);rr(8,82,80,6,'#e8f4f0',2);
    rr(12,42,72,42,lin(0,42,0,84,'#fffaf0','#e8dcc0'),1);for(const px of [12,46,80])rr(px,42,5,42,lin(px,0,px+5,0,'#e04a3a','#a82a22'),1);
    rr(37,56,22,28,'#c83a2a',2);c.fillStyle='#ffd860';for(let i=0;i<3;i++)for(let j=0;j<2;j++){c.beginPath();c.arc(41+j*14,62+i*7,1.2,0,Math.PI*2);c.fill();}
    c.strokeStyle='rgba(120,80,10,.45)';c.beginPath();c.moveTo(-18,38);c.quadraticCurveTo(-4,48,10,46);c.lineTo(28,12);c.quadraticCurveTo(48,4,68,12);c.lineTo(86,46);c.quadraticCurveTo(100,48,114,38);c.lineTo(106,54);c.quadraticCurveTo(48,60,-10,54);c.closePath();c.fillStyle=lin(0,4,0,56,'#ffe070','#c8901a');c.fill();c.stroke();
    c.strokeStyle='rgba(140,90,0,.35)';for(let i=0;i<=12;i++){c.beginPath();c.moveTo(28+i*3.4,13);c.quadraticCurveTo(14+i*6,34,-10+i*10,53);c.stroke();}
    rr(24,4,48,9,'#a87010',3);c.save();c.shadowColor='#fff0a0';c.shadowBlur=10;c.fillStyle='#fff4c0';c.beginPath();c.arc(48,0,5,0,Math.PI*2);c.fill();c.restore();
    c.fillStyle='rgba(255,255,255,.75)';for(const [cx,cy] of [[-10,92],[104,90],[48,98]]){c.beginPath();c.ellipse(cx,cy,14,5,0,0,Math.PI*2);c.fill();}
    lantern(4,56);lantern(92,56);
  }else if(theme==='marsh'){
    for(const px of [12,38,62,84])rr(px,66,4,30,'#4a3420',1);
    rr(4,64,88,8,lin(0,64,0,72,'#9a7448','#6e4e2c'),2);
    rr(12,30,72,36,lin(0,30,0,66,'#a07a4c','#7a5634'),2);c.strokeStyle='rgba(60,35,15,.35)';for(let x=18;x<84;x+=6){c.beginPath();c.moveTo(x,32);c.lineTo(x,64);c.stroke();}
    rr(40,40,16,24,'#3e2814',2);rr(62,38,14,12,'#2a1c10',1);c.strokeStyle='rgba(200,170,110,.7)';for(let y=40;y<50;y+=2.4){c.beginPath();c.moveTo(62,y);c.lineTo(76,y);c.stroke();}
    c.strokeStyle='rgba(40,20,10,.45)';c.beginPath();c.moveTo(-14,38);c.quadraticCurveTo(20,14,48,-6);c.quadraticCurveTo(76,14,110,38);c.lineTo(104,44);c.quadraticCurveTo(48,36,-8,44);c.closePath();c.fillStyle=lin(0,-6,0,44,'#e8cc80','#a8843a');c.fill();c.stroke();
    c.strokeStyle='rgba(120,90,40,.5)';c.lineWidth=0.8;for(let i=0;i<26;i++){const x=-8+i*4.5;c.beginPath();c.moveTo(48+(x-48)*0.15,-2);c.lineTo(x,40+Math.sin(i)*2);c.stroke();}
    c.strokeStyle='rgba(255,240,190,.5)';for(let i=0;i<10;i++){const x=4+i*9;c.beginPath();c.moveTo(48+(x-48)*0.2,4);c.lineTo(x+2,36);c.stroke();}
    c.strokeStyle='rgba(80,60,40,.6)';c.lineWidth=0.6;for(let i=0;i<5;i++){c.beginPath();c.moveTo(86,40+i*4);c.lineTo(100,46+i*4);c.moveTo(86+i*3,40);c.lineTo(92+i*3,62);c.stroke();}
    lantern(8,44);
  }else if(theme==='snow'){
    rr(-2,84,100,12,lin(0,84,0,96,'#b8bec8','#8a909a'),2);
    rr(10,40,76,46,lin(0,40,0,86,'#d6dae0','#aeb4bc'),1);c.strokeStyle='rgba(80,90,100,.25)';for(let y=48;y<86;y+=8){c.beginPath();c.moveTo(10,y);c.lineTo(86,y);c.stroke();}
    for(const px of [10,44,80])rr(px,40,6,46,lin(px,0,px+6,0,'#c0453a','#8a2a22'),1);
    rr(37,54,22,32,'#8a2a22',2);c.fillStyle='#e0b040';for(let i=0;i<3;i++)for(let j=0;j<2;j++){c.beginPath();c.arc(41+j*14,60+i*8,1.2,0,Math.PI*2);c.fill();}
    c.strokeStyle='rgba(30,30,40,.45)';c.beginPath();c.moveTo(-18,38);c.quadraticCurveTo(-4,48,10,46);c.lineTo(28,12);c.quadraticCurveTo(48,4,68,12);c.lineTo(86,46);c.quadraticCurveTo(100,48,114,38);c.lineTo(106,54);c.quadraticCurveTo(48,60,-10,54);c.closePath();c.fillStyle=lin(0,4,0,56,'#56688a','#2c3650');c.fill();c.stroke();
    c.fillStyle='#f8fbff';c.beginPath();c.moveTo(-14,39);c.quadraticCurveTo(-2,46,12,44);c.lineTo(29,13);c.quadraticCurveTo(48,6,67,13);c.lineTo(84,44);c.quadraticCurveTo(98,46,110,39);c.quadraticCurveTo(96,44,86,40);c.quadraticCurveTo(80,30,72,22);c.quadraticCurveTo(48,16,26,22);c.quadraticCurveTo(18,32,10,40);c.quadraticCurveTo(-2,44,-14,39);c.fill();
    c.fillStyle='rgba(200,235,255,.9)';for(let i=0;i<10;i++){const x=-4+i*11;c.beginPath();c.moveTo(x,54+Math.sin(i)*1.5);c.lineTo(x+2,62+i%3*2);c.lineTo(x+4,54+Math.sin(i)*1.5);c.fill();}
    rr(24,4,48,9,'#2a3046',3);c.fillStyle='#e0b040';c.beginPath();c.arc(22,8,4,0,Math.PI*2);c.arc(74,8,4,0,Math.PI*2);c.fill();
    lantern(4,56);lantern(92,56);
  }else{
    rr(-2,88,100,8,'#9a9488',2);
    rr(8,44,80,46,lin(0,44,0,90,'#f2e4c2','#d6c098'),1);
    for(const px of [8,45,83])rr(px,44,5,46,lin(px,0,px+5,0,'#9a4428','#6a2a18'),1);
    rr(6,40,84,6,'#7a3420',1);
    rr(37,58,22,32,lin(0,58,0,90,'#7a4422','#5a3016'),2);c.strokeStyle='rgba(40,20,10,.35)';c.strokeRect(39.5,61,7.5,26);c.strokeRect(49,61,7.5,26);c.fillStyle='#e0b040';c.beginPath();c.arc(46,75,1.3,0,Math.PI*2);c.arc(50,75,1.3,0,Math.PI*2);c.fill();
    for(const wx of [22,74]){c.beginPath();c.arc(wx,66,9,0,Math.PI*2);c.fillStyle='#3a2614';c.fill();c.strokeStyle='rgba(40,20,10,.45)';c.stroke();c.strokeStyle='#c9a46a';c.lineWidth=1;c.beginPath();c.moveTo(wx-9,66);c.lineTo(wx+9,66);c.moveTo(wx,57);c.lineTo(wx,75);c.moveTo(wx-6,60);c.lineTo(wx+6,72);c.moveTo(wx+6,60);c.lineTo(wx-6,72);c.stroke();c.lineWidth=1;}
    c.strokeStyle='rgba(60,15,8,.5)';c.beginPath();c.moveTo(-18,38);c.quadraticCurveTo(-4,48,10,46);c.lineTo(28,12);c.quadraticCurveTo(48,4,68,12);c.lineTo(86,46);c.quadraticCurveTo(100,48,114,38);c.lineTo(106,54);c.quadraticCurveTo(48,60,-10,54);c.closePath();c.fillStyle=lin(0,4,0,56,'#c84e34','#7e2618');c.fill();c.stroke();
    c.strokeStyle='rgba(70,15,8,.35)';c.lineWidth=1;for(let i=0;i<=12;i++){c.beginPath();c.moveTo(28+i*3.4,13);c.quadraticCurveTo(14+i*6,34,-10+i*10,53);c.stroke();}
    c.strokeStyle='rgba(255,200,170,.35)';c.beginPath();c.moveTo(30,13);c.quadraticCurveTo(48,6,66,13);c.stroke();
    rr(24,4,48,9,'#5a1a10',3);c.fillStyle='#e0b040';c.beginPath();c.arc(22,8,4,0,Math.PI*2);c.arc(74,8,4,0,Math.PI*2);c.fill();
    lantern(4,56);lantern(92,56);
  }});}

// ===================== ĐỊA HÌNH (vẽ mềm) =====================
function smoothBlob(c,pts){const n=pts.length,mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];c.beginPath();let m=mid(pts[0],pts[1]);c.moveTo(m[0],m[1]);
  for(let i=1;i<=n;i++){const p=pts[i%n],q=pts[(i+1)%n];m=mid(p,q);c.quadraticCurveTo(p[0],p[1],m[0],m[1]);}c.closePath();}
function vRock(c,cx,cy,theme){theme={volcano:'dark',sea:'marsh',star:'snow'}[theme]||theme;const g0=c.createRadialGradient(cx,cy+9,1,cx,cy+9,15);g0.addColorStop(0,'rgba(0,0,0,.25)');g0.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g0;c.beginPath();c.ellipse(cx,cy+9,15,5,0,0,Math.PI*2);c.fill();
  const pts=[];for(let i=0;i<7;i++){const a=i/7*Math.PI*2,r=10+srand()*3.5;pts.push([cx+Math.cos(a)*r*1.15,cy+1+Math.sin(a)*r*(Math.sin(a)<0?0.95:0.7)]);}
  smoothBlob(c,pts);const g=c.createLinearGradient(cx,cy-12,cx,cy+10);
  if(theme==='snow'){g.addColorStop(0,'#c8d2de');g.addColorStop(1,'#7a8698');}else if(theme==='desert'){g.addColorStop(0,'#e0a870');g.addColorStop(1,'#9a5a32');}else if(theme==='dark'){g.addColorStop(0,'#6a6a74');g.addColorStop(1,'#2e2e36');}else if(theme==='heaven'){g.addColorStop(0,'#ffffff');g.addColorStop(1,'#a8d0c0');}else if(theme==='marsh'){g.addColorStop(0,'#9aa290');g.addColorStop(1,'#56604e');}else{g.addColorStop(0,'#b4b4ac');g.addColorStop(1,'#66665f');}
  c.fillStyle=g;c.fill();c.strokeStyle='rgba(30,30,25,.4)';c.lineWidth=1;c.stroke();
  c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=1.5;c.beginPath();c.arc(cx-2,cy-2,7,Math.PI*1.1,Math.PI*1.5);c.stroke();
  if(theme==='snow'){c.fillStyle='#f8fbff';c.beginPath();c.ellipse(cx-1,cy-6,9,4,0,Math.PI,0);c.quadraticCurveTo(cx+4,cy-3,cx-1,cy-4);c.fill();}
  else if(srand()<0.5){c.fillStyle=theme==='marsh'?'rgba(80,150,70,.8)':'rgba(90,160,70,.7)';c.beginPath();c.ellipse(cx+4,cy+6,4.5,1.8,0,0,Math.PI*2);c.fill();}}
function vFence(c,ox,oy,vert){c.strokeStyle='rgba(40,25,10,.5)';c.lineWidth=1;const post='#8a5a30',rail='#a8723e';
  const rr=(x,y,w,h,col)=>{c.beginPath();c.roundRect(x,y,w,h,1.5);c.fillStyle=col;c.fill();c.stroke();};
  if(vert){rr(ox+10,oy,3,32,rail);rr(ox+19,oy,3,32,rail);rr(ox+12,oy+4,8,5,post);rr(ox+12,oy+20,8,5,post);}
  else{rr(ox,oy+12,32,3.2,rail);rr(ox,oy+20,32,3.2,rail);rr(ox+3,oy+7,5,20,post);rr(ox+24,oy+7,5,20,post);c.fillStyle='rgba(0,0,0,.15)';c.fillRect(ox,oy+27,32,2);}}
function vLantern(c,cx,cy){c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.ellipse(cx,cy+10,9,3,0,0,Math.PI*2);c.fill();
  c.strokeStyle='rgba(30,30,25,.55)';c.lineWidth=1;const st='#a8a89e';
  const rr=(x,y,w,h,col)=>{c.beginPath();c.roundRect(x,y,w,h,1.5);c.fillStyle=col;c.fill();c.stroke();};
  rr(cx-6,cy+5,12,4,st);rr(cx-2.5,cy-6,5,11,st);rr(cx-7,cy-14,14,8,'#8e8e86');c.fillStyle='#ffd27a';c.fillRect(cx-4,cy-12.5,8,5);
  c.beginPath();c.moveTo(cx-9,cy-14);c.quadraticCurveTo(cx,cy-23,cx+9,cy-14);c.closePath();c.fillStyle='#7a7a72';c.fill();c.stroke();}
function vFlag(c,x,y){c.strokeStyle='rgba(20,10,5,.7)';c.lineWidth=1;c.fillStyle='#4a2a14';c.fillRect(x-1.5,y-44,3,44);
  c.beginPath();c.moveTo(x+1.5,y-43);c.quadraticCurveTo(x+12,y-40,x+22,y-43);c.lineTo(x+20,y-30);c.quadraticCurveTo(x+11,y-27,x+1.5,y-30);c.closePath();c.fillStyle='#1a1418';c.fill();c.stroke();
  c.fillStyle='#c0392b';c.beginPath();c.arc(x+11,y-36.5,4,0,Math.PI*2);c.fill();}
let mapCv=null,miniBase=null,TREE_SPR=[],HOUSE_SPR=null;
function renderMap(){
  RS=Math.min(2,Math.max(1,Z*DPR));const S=T,th=CM.theme;
  mapCv=document.createElement('canvas');mapCv.width=MW*S*RS;mapCv.height=MH*S*RS;const c=mapCv.getContext('2d');c.scale(RS,RS);
  seed=CM.gen.seed+99;c.lineJoin='round';c.lineCap='round';
  const W=MW*S,H=MH*S,ctr=(x,y)=>[x*S+S/2,y*S+S/2];
  const each=fn=>{for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)fn(getT(x,y),x,y);};
  const disc=(x,y,r,col)=>{c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
  const tmp=document.createElement('canvas');tmp.width=mapCv.width;tmp.height=mapCv.height;const tc=tmp.getContext('2d');
  const band=(test,r,col,blur)=>{const g=blur?tc:c;if(blur){tc.setTransform(1,0,0,1,0,0);tc.clearRect(0,0,tmp.width,tmp.height);tc.setTransform(RS,0,0,RS,0,0);}
    g.strokeStyle=col;g.fillStyle=col;g.lineWidth=2*r;g.lineCap='round';
    for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){if(!test(getT(x,y),x,y))continue;const [cx,cy]=ctr(x,y);
      for(const [dx,dy] of [[1,0],[0,1],[1,1],[-1,1]]){if(!test(getT(x+dx,y+dy),x+dx,y+dy))continue;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+dx*S,cy+dy*S);g.stroke();}
      g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.fill();}
    if(blur){c.save();c.setTransform(1,0,0,1,0,0);c.filter='blur('+(blur*RS).toFixed(1)+'px)';c.drawImage(tmp,0,0);c.restore();}};
  const isPath=t=>t===PA||t===BR,isWater=t=>t===WA||t===BR,isArena=(t,x,y)=>(t===DK||t===RO)&&CM.gen.arena&&x>=CM.gen.arena.x0&&x<=CM.gen.arena.x1&&y>=CM.gen.arena.y0&&y<=CM.gen.arena.y1;
  c.fillStyle=TH.grass;c.fillRect(0,0,W,H);
  for(let i=0;i<1100;i++){const x=srand()*W,y=srand()*H,r=18+srand()*70,l=srand()<0.5;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,l?TH.light:TH.dark);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}
  band(isArena,24,TH.arena,4);
  each((t,x,y)=>{if(isArena(t,x,y)){const [cx,cy]=ctr(x,y);for(let i=0;i<4;i++)disc(cx-14+srand()*28,cy-14+srand()*28,1+srand()*2,TH.arenaPeb[srand()<.5?0:1]);
    if(srand()<0.15){c.strokeStyle='rgba(10,8,6,.45)';c.lineWidth=1;c.beginPath();c.moveTo(cx-8,cy);c.lineTo(cx-2,cy+3);c.lineTo(cx+3,cy-2);c.lineTo(cx+9,cy+2);c.stroke();}}});
  band(isPath,15.5,TH.pathE,3);band(isPath,12.5,TH.pathI,1.2);
  each((t,x,y)=>{if(t===PA){const [cx,cy]=ctr(x,y);for(let i=0;i<3;i++)disc(cx-11+srand()*22,cy-11+srand()*22,1+srand()*1.4,TH.peb[srand()<.5?0:1]);}});
  each((t,x,y)=>{if(t===FL||t===FE||t===HO){const ox=x*S,oy=y*S;c.fillStyle=TH.floorBase;c.fillRect(ox,oy,S,S);
    if(th==='marsh'){for(let k=0;k<4;k++){c.fillStyle=TH.floor[(srand()*4)|0];c.fillRect(ox,oy+k*8+0.5,S,7);c.fillStyle='rgba(0,0,0,.18)';c.fillRect(ox+((x*7+k*13)%28),oy+k*8+0.5,1,7);}}
    else for(let k=0;k<4;k++){const sx=ox+(k%2)*16,sy=oy+(k>>1)*16;c.beginPath();c.roundRect(sx+1,sy+1,14,14,3.5);c.fillStyle=TH.floor[(srand()*4)|0];c.fill();c.fillStyle='rgba(255,255,255,.18)';c.fillRect(sx+3,sy+2.5,8,1.5);}}});
  band(isWater,22.5,TH.shore,3.5);band(isWater,18.5,TH.water,1.6);band(isWater,10,TH.deep,1.6);
  each((t,x,y)=>{if(t!==WA)return;const [cx,cy]=ctr(x,y);
    if(th==='marsh'&&srand()<0.35){const px=cx-10+srand()*20,py=cy-10+srand()*20,r=4+srand()*3;c.fillStyle=srand()<.5?'#4f9a5a':'#3f8a4e';c.beginPath();c.moveTo(px,py);c.arc(px,py,r,0.4,Math.PI*2-0.1);c.closePath();c.fill();
      if(srand()<0.3){c.fillStyle='#ffb0d4';c.beginPath();c.arc(px,py-1,2,0,Math.PI*2);c.fill();}}
    else if(th==='snow'&&srand()<0.3){c.fillStyle='rgba(235,248,255,.8)';smoothBlob(c,[[cx-8,cy-4],[cx+2,cy-7],[cx+9,cy-1],[cx+3,cy+6],[cx-7,cy+4]]);c.fill();}
    else{c.strokeStyle='rgba(255,255,255,.3)';c.lineWidth=1.1;const px=cx-10+srand()*16,py=cy-10+srand()*20;c.beginPath();c.moveTo(px,py);c.quadraticCurveTo(px+3,py-2,px+7,py);c.stroke();}});
  each((t,x,y)=>{if(t===BR){const ox=x*S,oy=y*S,vert=getT(x,y-1)===BR||getT(x,y+1)===BR||getT(x,y-1)===PA&&getT(x-1,y)===WA;
    c.save();if(vert){c.translate(ox+S/2,oy+S/2);c.rotate(Math.PI/2);c.translate(-S/2,-S/2);}else c.translate(ox,oy);
    c.fillStyle='rgba(0,0,0,.25)';c.fillRect(0,26,S,4);c.fillStyle='#a06c3a';c.fillRect(0,5,S,22);c.strokeStyle='#6e4422';c.lineWidth=1.1;for(let k=0;k<S;k+=6.4){c.beginPath();c.moveTo(k,5);c.lineTo(k,27);c.stroke();}
    c.fillStyle='#6e4422';c.fillRect(0,3,S,3.5);c.fillRect(0,25.5,S,3.5);c.fillRect(14,0,4,6);c.fillRect(14,24,4,6);c.restore();}});
  each((t,x,y)=>{if(t!==G)return;const ox=x*S,oy=y*S;
    if(srand()<0.55){const px=ox+4+srand()*24,py=oy+8+srand()*20;c.strokeStyle=TH.tuft[srand()<.5?0:1];c.lineWidth=1.1;c.beginPath();c.moveTo(px-3,py-5);c.quadraticCurveTo(px-1,py-1,px,py);c.moveTo(px,py-7);c.lineTo(px,py);c.moveTo(px+3,py-5);c.quadraticCurveTo(px+1,py-1,px,py);c.stroke();}
    if(srand()<0.08){const px=ox+6+srand()*20,py=oy+6+srand()*20,col=TH.flowers[(srand()*TH.flowers.length)|0];
      if(th==='snow'){c.fillStyle=col;c.beginPath();c.moveTo(px,py-3);c.lineTo(px+1.5,py);c.lineTo(px,py+3);c.lineTo(px-1.5,py);c.closePath();c.fill();}
      else{for(let k=0;k<5;k++){const a=k/5*Math.PI*2;disc(px+Math.cos(a)*2,py+Math.sin(a)*2,1.6,col);}disc(px,py,1.2,'#ffcf40');}}});
  for(let k=0;k<12;k++){const A=CM.gen.arena;if(!A)break;const x=A.x0+1+Math.floor(srand()*(A.x1-A.x0-1)),y=A.y0+1+Math.floor(srand()*(A.y1-A.y0-1));if(getT(x,y)!==DK)continue;const [cx,cy]=ctr(x,y);
    c.strokeStyle='#e8e0d0';c.lineWidth=2.4;c.beginPath();c.moveTo(cx-7,cy+4);c.lineTo(cx+7,cy+1);c.stroke();disc(cx-7,cy+4,2.2,'#e8e0d0');disc(cx+7,cy+1,2.2,'#e8e0d0');}
  each((t,x,y)=>{if(t===RO){const [cx,cy]=ctr(x,y);vRock(c,cx,cy,th);}else if(t===FE){vFence(c,x*S,y*S,(x===SAFE.x0||x===SAFE.x1)&&y!==SAFE.y0&&y!==SAFE.y1);}});
  for(const [lx,ly] of LIGHTS)vLantern(c,lx*S,ly*S);
  for(const [fx_,fy_] of FLAGS)vFlag(c,fx_*S+16,fy_*S+30);
  if(CM.gen.well){const [wx,wy]=CM.gen.well;c.save();c.scale(2,2);P(c,'#6d6d6d',wx*16+2,wy*16+2,14,12);P(c,'#1e3f6b',wx*16+4,wy*16+4,10,7);P(c,'#7a3b20',wx*16+1,wy*16-6,2,10);P(c,'#7a3b20',wx*16+15,wy*16-6,2,10);P(c,'#8e2b1f',wx*16-1,wy*16-8,20,3);c.restore();}
  miniBase=document.createElement('canvas');miniBase.width=192;miniBase.height=144;const m=miniBase.getContext('2d');m.imageSmoothingEnabled=true;m.drawImage(mapCv,0,0,192,144);
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++){const t=getT(x,y);if(t===TR){m.fillStyle=TH.tree;m.beginPath();m.arc(x*3+1.5,y*3+1.5,1.7,0,Math.PI*2);m.fill();}else if(t===HO){m.fillStyle=TH.roof;m.fillRect(x*3,y*3,3,3);}}
  TREE_SPR=makeTrees(th);HOUSE_SPR=makeHouse(th);
}

// ===================== HIỆU ỨNG =====================
function label(txt,x,y,col,size=10,font){ctx.font=`bold ${size}px ${font||'"Segoe UI",Arial'}`;ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.8)';ctx.strokeText(txt,x,y);ctx.fillStyle=col;ctx.fillText(txt,x,y);}
function drawFx(f){const a=1-f.t/f.life,p=f.t/f.life;ctx.globalAlpha=Math.max(0,Math.min(1,a));
  switch(f.k){
    case 't':{const s=f.size*(p<0.15?1+(0.15-p)*3:1);label(f.txt,f.x,f.y-f.t*36,f.col,s,f.serif?'"Palatino Linotype","Times New Roman",serif':null);break;}
    case 'p':ctx.fillStyle=f.col;ctx.beginPath();ctx.arc(f.x,f.y,f.sz||2,0,Math.PI*2);ctx.fill();break;
    case 'r':{ctx.strokeStyle=f.col;ctx.lineWidth=f.w||3;const r=f.r*(0.35+0.65*p);ctx.beginPath();ctx.ellipse(f.x,f.y,r,r*0.55,0,0,Math.PI*2);ctx.stroke();break;}
    case 's':{ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(f.x-f.face*6,f.y,22,-Math.PI/2-1.2+p*0.8,-Math.PI/2+1.2+p*0.8);ctx.stroke();ctx.strokeStyle=f.col||'#9fd3ff';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(f.x-f.face*6,f.y,17,-Math.PI/2-1+p*0.8,-Math.PI/2+1+p*0.8);ctx.stroke();break;}
    case 'spin':{ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.55);for(let k=0;k<3;k++){const a0=p*Math.PI*4+k*Math.PI*2/3;ctx.strokeStyle=k?f.col:'#ffffff';ctx.lineWidth=k?3:4;ctx.beginPath();ctx.arc(0,0,f.r*(0.5+0.5*p),a0,a0+1.4);ctx.stroke();}ctx.restore();break;}
    case 'sword':{const fall=Math.min(1,f.t/0.22),yy=f.y-(1-fall)*170;ctx.save();ctx.translate(f.x,yy);ctx.rotate(Math.PI/2);ctx.globalAlpha=Math.min(1,a*1.6);
      drawWeapon({type:'sword',len:30,col:'#e8f6ff',glow:'#9fd3ff'},-30,0,0);ctx.restore();
      if(fall>=1){ctx.globalAlpha=a*0.6;ctx.strokeStyle='#cfefff';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,f.y,18*(1+p),7*(1+p),0,0,Math.PI*2);ctx.stroke();}break;}
    case 'fire':{for(let k=0;k<14;k++){const ang=k/14*Math.PI*2+f.t*2,rr=f.r*(0.25+0.7*((k*37)%10)/10),fx=f.x+Math.cos(ang)*rr,fy=f.y+Math.sin(ang)*rr*0.55,h=10+Math.sin(nowT*15+k)*4;
        const g=ctx.createRadialGradient(fx,fy-h/2,1,fx,fy-h/2,h);g.addColorStop(0,'rgba(255,240,150,.95)');g.addColorStop(0.5,'rgba(255,120,30,.7)');g.addColorStop(1,'rgba(200,30,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(fx,fy-h/2,h*0.55,h,0,0,Math.PI*2);ctx.fill();}
      ctx.strokeStyle='rgba(255,120,40,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r,f.r*0.55,0,0,Math.PI*2);ctx.stroke();break;}
    case 'ice':{for(let k=0;k<12;k++){const ang=k/12*Math.PI*2,rr=f.r*(0.45+0.5*((k*53)%10)/10),cx=f.x+Math.cos(ang)*rr,cy=f.y+Math.sin(ang)*rr*0.55,h=(14+(k%3)*6)*Math.min(1,f.t/0.15);
        ctx.fillStyle='rgba(200,245,255,.85)';ctx.strokeStyle='rgba(80,160,220,.9)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(cx-4,cy);ctx.lineTo(cx,cy-h);ctx.lineTo(cx+4,cy);ctx.closePath();ctx.fill();ctx.stroke();}
      ctx.strokeStyle='rgba(180,240,255,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r,f.r*0.55,0,0,Math.PI*2);ctx.stroke();break;}
    case 'beam':{const g=ctx.createLinearGradient(0,f.y-160,0,f.y);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,f.col);ctx.fillStyle=g;const w=22*(1-p*0.5);ctx.globalAlpha=a*0.55;ctx.fillRect(f.x-w/2,f.y-160,w,160);break;}
    case 'quake':{ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.55);ctx.strokeStyle='rgba(120,80,40,.85)';ctx.lineWidth=2.5;
      for(let k=0;k<9;k++){const an=k/9*Math.PI*2+0.3,L=f.r*(0.55+0.4*((k*37)%10)/10)*Math.min(1,p*3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(an)*L*0.5,Math.sin(an)*L*0.5+4);ctx.lineTo(Math.cos(an+0.15)*L,Math.sin(an+0.15)*L);ctx.stroke();}
      ctx.strokeStyle='rgba(230,190,120,.9)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,f.r*(0.3+0.7*p),0,Math.PI*2);ctx.stroke();ctx.restore();
      for(let k=0;k<6;k++){const an=k*1.05+f.x,rr=f.r*0.6*p;ctx.fillStyle='rgba(150,110,70,.8)';ctx.beginPath();ctx.arc(f.x+Math.cos(an)*rr,f.y+Math.sin(an)*rr*0.55-Math.sin(p*Math.PI)*22,3+k%3,0,Math.PI*2);ctx.fill();}break;}
    case 'rock':{const yy=f.y-170*(1-p);ctx.globalAlpha=1;ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(f.x,f.y,30*p,11*p,0,0,Math.PI*2);ctx.fill();
      const g=ctx.createRadialGradient(f.x-8,yy-30,4,f.x,yy-20,34);g.addColorStop(0,'#e8d0a0');g.addColorStop(1,'#7a5a38');ctx.fillStyle=g;ctx.strokeStyle='rgba(60,40,20,.8)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(f.x-30,yy);ctx.lineTo(f.x-22,yy-34);ctx.lineTo(f.x+4,yy-46);ctx.lineTo(f.x+28,yy-28);ctx.lineTo(f.x+30,yy);ctx.closePath();ctx.fill();ctx.stroke();break;}
    case 'heal':{const col=f.col||'#7dff9a';ctx.strokeStyle=col;ctx.lineWidth=3;const r=f.r*(0.3+0.7*p);ctx.beginPath();ctx.ellipse(f.x,f.y,r,r*0.5,0,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle=col;for(let k=0;k<10;k++){const an=k/10*Math.PI*2+p*2;ctx.save();ctx.translate(f.x+Math.cos(an)*r,f.y+Math.sin(an)*r*0.5-p*30);ctx.rotate(an);ctx.beginPath();ctx.ellipse(0,0,4,2,0,0,Math.PI*2);ctx.fill();ctx.restore();}break;}
    case 'field':{const fade=Math.min(1,f.t/0.3,(f.life-f.t)/0.4);ctx.globalAlpha=Math.max(0,fade);
      const g=ctx.createRadialGradient(f.x,f.y,4,f.x,f.y,f.r);g.addColorStop(0,'rgba(160,255,140,.32)');g.addColorStop(1,'rgba(80,200,80,.04)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r,f.r*0.55,0,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='rgba(180,255,160,.8)';ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.lineDashOffset=-f.t*20;ctx.beginPath();ctx.ellipse(f.x,f.y,f.r,f.r*0.55,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
      for(let k=0;k<12;k++){const an=k/12*Math.PI*2+f.t*0.6,rr=f.r*(0.35+0.55*((k*53)%10)/10),fx_=f.x+Math.cos(an)*rr,fy_=f.y+Math.sin(an)*rr*0.55,sw=Math.sin(nowT*3+k)*2;
        ctx.strokeStyle='#4ab03a';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(fx_,fy_);ctx.quadraticCurveTo(fx_+sw,fy_-6,fx_+sw*1.5,fy_-11);ctx.stroke();
        ctx.fillStyle=['#fff8a0','#ffc8f0','#ffffff'][k%3];ctx.beginPath();ctx.arc(fx_+sw*1.5,fy_-12,2.3,0,Math.PI*2);ctx.fill();}break;}
    case 'dragon':{ctx.save();ctx.translate(f.x,f.y);ctx.scale(1,0.6);
      for(let k=0;k<26;k++){const q=k/26,ang=p*Math.PI*5-q*3,rr=f.r*(0.35+0.6*p)*(0.7+0.3*Math.sin(q*9)),x=Math.cos(ang)*rr,y=Math.sin(ang)*rr-q*20;
        ctx.fillStyle=`rgba(${120+q*80|0},${210+q*40|0},255,${0.9-q*0.6})`;ctx.beginPath();ctx.arc(x,y,9*(1-q*0.7),0,Math.PI*2);ctx.fill();
        if(k===0){ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(x+3,y-3,2,0,Math.PI*2);ctx.fill();}}ctx.restore();break;}
  }
  ctx.globalAlpha=1;}
function drawShot(s){
  if(s.kind==='leaf'||s.kind==='leafb'){const a=Math.atan2(s.vy||0,s.vx||1),k=s.kind==='leaf'?1:0.7;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(a+Math.sin(nowT*20)*0.3);ctx.shadowColor='#9fff8a';ctx.shadowBlur=10;
    ctx.fillStyle='#b8ff8a';ctx.strokeStyle='#3f8a2a';ctx.lineWidth=0.8;ctx.beginPath();ctx.moveTo(10*k,0);ctx.quadraticCurveTo(0,-6*k,-9*k,0);ctx.quadraticCurveTo(0,6*k,10*k,0);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.moveTo(8*k,0);ctx.lineTo(-8*k,0);ctx.stroke();ctx.restore();return;}
  if(s.kind==='dark'){const a=nowT*18;ctx.save();ctx.translate(s.x,s.y);ctx.rotate(a);ctx.shadowColor='#b48cff';ctx.shadowBlur=12;ctx.fillStyle='#e8d8ff';
    ctx.beginPath();ctx.arc(0,0,9,0.4,Math.PI*2-0.4);ctx.arc(3,0,6.5,Math.PI*2-0.6,0.6,true);ctx.closePath();ctx.fill();ctx.restore();return;}
  if(s.kind==='fire'||s.kind==='ember'||s.kind==='efire'){const r=s.kind==='ember'?5:8;const g=ctx.createRadialGradient(s.x,s.y,1,s.x,s.y,r*2);g.addColorStop(0,'#fffbe0');g.addColorStop(0.35,s.kind==='efire'?'#ff6a2a':'#ffb040');g.addColorStop(1,'rgba(255,60,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(s.x,s.y,r*2,0,Math.PI*2);ctx.fill();}
  else if(s.kind==='edark'||s.kind==='egold'){const c1=s.kind==='edark'?'#c890ff':'#fff0a0',c2=s.kind==='edark'?'rgba(120,40,200,0)':'rgba(255,190,40,0)';const g=ctx.createRadialGradient(s.x,s.y,1,s.x,s.y,15);g.addColorStop(0,'#ffffff');g.addColorStop(0.35,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.beginPath();ctx.arc(s.x,s.y,15,0,Math.PI*2);ctx.fill();}
  else if(s.kind==='water'){const g=ctx.createRadialGradient(s.x,s.y,1,s.x,s.y,10);g.addColorStop(0,'#ffffff');g.addColorStop(0.4,'#7fdcff');g.addColorStop(1,'rgba(40,140,255,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(s.x,s.y,10,0,Math.PI*2);ctx.fill();}
  else if(s.kind==='ice'||s.kind==='eice'){const a=Math.atan2(s.vy||0,s.vx||1);ctx.save();ctx.translate(s.x,s.y);ctx.rotate(a);ctx.shadowColor='#9fe8ff';ctx.shadowBlur=10;ctx.fillStyle='#e8fbff';ctx.strokeStyle='#5ab0e0';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-4,-4);ctx.lineTo(-10,0);ctx.lineTo(-4,4);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  else if(s.kind==='wave'){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.ang);ctx.shadowColor='#9fd3ff';ctx.shadowBlur=14;
    ctx.fillStyle='rgba(225,245,255,.9)';ctx.beginPath();ctx.moveTo(-4,-22);ctx.quadraticCurveTo(14,0,-4,22);ctx.quadraticCurveTo(4,0,-4,-22);ctx.fill();
    ctx.fillStyle='rgba(140,200,255,.5)';ctx.beginPath();ctx.moveTo(-14,-16);ctx.quadraticCurveTo(0,0,-14,16);ctx.quadraticCurveTo(-8,0,-14,-16);ctx.fill();ctx.restore();}
  else if(s.kind==='phoenix'){ctx.save();ctx.translate(s.x,s.y);ctx.rotate(s.ang);ctx.shadowColor='#ff8a20';ctx.shadowBlur=24;const fl=Math.sin(nowT*18)*0.5;
    const g=ctx.createLinearGradient(-30,0,24,0);g.addColorStop(0,'rgba(255,60,0,0)');g.addColorStop(0.6,'#ff9a30');g.addColorStop(1,'#fff3c0');
    ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(24,0);ctx.quadraticCurveTo(4,-6,-30,-3);ctx.lineTo(-30,3);ctx.quadraticCurveTo(4,6,24,0);ctx.fill();
    for(const sgn of [-1,1]){ctx.fillStyle='rgba(255,170,60,.9)';ctx.beginPath();ctx.moveTo(8,0);ctx.quadraticCurveTo(-2,sgn*(26+fl*10),-18,sgn*(30+fl*12));ctx.quadraticCurveTo(-6,sgn*10,-8,0);ctx.closePath();ctx.fill();}
    ctx.fillStyle='#fff8e0';ctx.beginPath();ctx.arc(20,0,4,0,Math.PI*2);ctx.fill();ctx.restore();}}
function drawPortrait(cnv,L,W){const c=cnv.getContext('2d'),old=ctx;ctx=c;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cnv.width,cnv.height);
  c.save();c.beginPath();c.arc(cnv.width/2,cnv.height/2,cnv.width/2,0,Math.PI*2);c.clip();
  const g=c.createRadialGradient(cnv.width/2,cnv.height/2,4,cnv.width/2,cnv.height/2,cnv.width/2);g.addColorStop(0,'#4a6a8a');g.addColorStop(1,'#152030');c.fillStyle=g;c.fillRect(0,0,cnv.width,cnv.height);
  const s=cnv.width/25;drawChibi(L,cnv.width/2,cnv.height*0.55+40*s,s,'down',1,false,0,false,W,0.3);c.restore();ctx=old;}

// ngoại hình quái cấp 60–90
Object.assign(NPC_LOOK,{
  firedemon:{robe:'#5a2018',trim:'#ff7a2a',belt:'#2a0a08',boot:'#1a0a08',skin:'#d8a088',hair:'#ff5a1a',messy:true,glowEye:'#ffb040',armor:'#8a3a20',brow:true,male:true,inner:'#7a2a18',weapon:{type:'saber',len:24,col:'#ffb070',glow:'#ff6a2a'}},
  flamelord:{robe:'#3a1010',trim:'#ffb040',belt:'#ffb040',boot:'#1a0808',skin:'#e0b090',hair:'#ff7a2a',longHair:true,crown:'#ff8a2a',iceCrown:true,glowEye:'#ff4020',brow:true,armor:'#a83a18',male:true,sash:'#ff9a40',sashGlow:'#ff5a1a',inner:'#5a1a10',weapon:{type:'saber',len:34,col:'#ffd080',glow:'#ff5a1a'}},
  seaguard:{robe:'#2a5a7a',trim:'#7fe8d8',belt:'#1a3a5a',boot:'#1a2a3a',skin:'#c8e0e0',hair:'#1a4a5a',armor:'#5aa8b8',brow:true,male:true,inner:'#3a7a9a',weapon:{type:'staff',len:30,col:'#bff0ff'}},
  demongeneral:{robe:'#1a1428',trim:'#c890ff',belt:'#3a2a5a',boot:'#0a0812',skin:'#c8b8d8',hair:'#e8e0ff',longHair:true,glowEye:'#c890ff',brow:true,armor:'#4a3a6a',male:true,inner:'#2a2040',weapon:{type:'saber',len:28,col:'#e8d8ff',glow:'#a070ff'}},
  chaosgod:{robe:'#0a0a14',trim:'#ffd040',belt:'#ffd040',boot:'#050508',skin:'#d8c8e8',hair:'#ffffff',longHair:true,crown:'#c890ff',iceCrown:true,glowEye:'#ff40ff',brow:true,armor:'#2a1a40',male:true,sash:'#ff80ff',sashGlow:'#ff40ff',inner:'#1a1028',weapon:{type:'saber',len:36,col:'#ffffff',glow:'#ff60ff'}}
});
