'use strict';
// ===================== THÊM THÚ CƯỠI, THÚ NUÔI, HÀO QUANG =====================
// Mỗi giai đoạn cấp có nhiều loại; cấp cao có rồng, kỳ lân, phượng hoàng, huyền vũ. Thần thú (có glow) phát sáng.
Object.assign(MOUNTS,{
  hongma:{name:'Hồng Tông Mã',lv:15,spd:0.62,hp:0.06,def:0.02,price:8000,col:'#b8462a',mane:'#2a1408',kind:'horse',desc:'Ngựa lông đỏ son, chạy bền.'},
  hoaloc:{name:'Hoa Lộc',lv:25,spd:0.85,hp:0.09,def:0.05,price:28000,col:'#d8904a',mane:'#fff6e0',kind:'deer',desc:'Hươu sao lông vàng điểm hoa trắng.'},
  bachho:{name:'Bạch Hổ',lv:35,spd:1.02,hp:0.12,def:0.08,price:80000,col:'#f2f2f6',mane:'#2a3a7a',kind:'tiger',desc:'Hổ trắng vằn lam, oai phong lẫm liệt.'},
  thanhma:{name:'Thanh Thông Mã',lv:40,spd:1.08,hp:0.13,def:0.09,price:110000,col:'#6a8ac0',mane:'#f0f4ff',kind:'horse',desc:'Tuấn mã lông xanh xám, bờm bạc.'},
  banglan:{name:'Băng Kỳ Lân',lv:60,spd:1.45,hp:0.22,def:0.14,price:600000,col:'#6ab8f0',mane:'#e8fbff',kind:'qilin',glow:'#9fe8ff',divine:true,desc:'Thần thú băng giá, vó đạp sương tuyết.'},
  huyenvu:{name:'Huyền Vũ',lv:70,spd:1.5,hp:0.34,def:0.26,price:1200000,col:'#3a6a58',mane:'#2a3a30',kind:'turtle',glow:'#7affc8',divine:true,desc:'Rùa thần cõng núi, đuôi là linh xà. Phòng thủ cực cao.'},
  hoaphung:{name:'Hỏa Phượng Hoàng',lv:80,spd:1.62,hp:0.26,def:0.16,price:2200000,col:'#ff5a2a',mane:'#ffd040',kind:'phoenix',fly:true,glow:'#ffb040',divine:true,desc:'Phượng hoàng lửa, cánh tung hỏa diễm.'},
  thanhlong:{name:'Thanh Long',lv:90,spd:1.7,hp:0.3,def:0.2,price:3000000,col:'#2a9a8a',mane:'#9ff0e0',kind:'dragon',fly:true,glow:'#7affe8',divine:true,desc:'Rồng xanh trấn giữ phương Đông, cưỡi mây đạp gió.'},
  kimlan:{name:'Kim Kỳ Lân',lv:100,spd:1.75,hp:0.32,def:0.22,price:4000000,col:'#ffc840',mane:'#fff4c0',kind:'qilin',glow:'#ffe080',divine:true,desc:'Kỳ lân vàng, điềm lành của trời đất.'},
  bangphung:{name:'Băng Phượng',lv:110,spd:1.8,hp:0.3,def:0.2,price:5000000,col:'#8ad8ff',mane:'#ffffff',kind:'phoenix',fly:true,glow:'#bff4ff',divine:true,desc:'Phượng băng, mỗi lần vỗ cánh rắc tuyết bạc.'},
  xichlong:{name:'Xích Long',lv:120,spd:1.86,hp:0.34,def:0.22,price:6500000,col:'#d83a2a',mane:'#ffb040',kind:'dragon',fly:true,glow:'#ff8040',divine:true,desc:'Rồng lửa đỏ rực, hơi thở như dung nham.'},
  loiho:{name:'Lôi Điện Hổ',lv:130,spd:1.9,hp:0.34,def:0.24,price:8000000,col:'#3a3a8a',mane:'#ffe060',kind:'tiger',glow:'#a8b8ff',divine:true,desc:'Hổ thần mang sấm sét, vằn lóe tia điện.'},
  bachtrach:{name:'Bạch Trạch',lv:140,spd:1.95,hp:0.36,def:0.26,price:10000000,col:'#f4f4ff',mane:'#b8a8ff',kind:'qilin',glow:'#d8c8ff',divine:true,desc:'Thần thú thông hiểu vạn vật, lông trắng tỏa ánh tím.'},
  kimlong:{name:'Kim Long',lv:150,spd:2.0,hp:0.38,def:0.28,price:12000000,col:'#ffc030',mane:'#fff0a0',kind:'dragon',fly:true,glow:'#ffe060',divine:true,desc:'Rồng vàng của bậc đế vương.'},
  ngusac:{name:'Ngũ Sắc Phượng',lv:165,spd:2.05,hp:0.38,def:0.28,price:15000000,col:'#ff4a9a',mane:'#6affd0',kind:'phoenix',fly:true,rainbow:true,glow:'#ff9ae0',divine:true,desc:'Phượng hoàng năm sắc, lông vũ đổi màu cầu vồng.'},
  huyenquy:{name:'Thái Cổ Huyền Quy',lv:180,spd:2.1,hp:0.5,def:0.4,price:19000000,col:'#8a6a2a',mane:'#ffd860',kind:'turtle',glow:'#ffd860',divine:true,desc:'Rùa thần thái cổ mai vàng, vững như núi Thái Sơn.'},
  tolong:{name:'Tổ Long',lv:195,spd:2.2,hp:0.45,def:0.34,price:25000000,col:'#6a2ac8',mane:'#ffd040',kind:'dragon',fly:true,glow:'#d890ff',divine:true,desc:'Thủy tổ của loài rồng, vảy tím viền vàng.'}
});
MOUNTS.hac.fly=true;
const mountRideY=M=>M.fly?-40:M.kind==='turtle'?-32:-24;
Object.assign(PETS,{
  linhtho:{name:'Linh Thố',lv:25,price:15000,draw:'rabbit',col:'#ffffff',s:0.55,mult:0.32,range:30,cd:0.9,desc:'Thỏ ngọc nhanh nhẹn.'},
  hoho:{name:'Hổ Con',lv:35,price:40000,draw:'tigercub',col:'#f0a040',s:0.6,mult:0.36,range:32,cd:1.0,desc:'Hổ con vằn đen, cắn rất đau.'},
  tieulan:{name:'Tiểu Hỏa Lân',lv:58,price:200000,draw:'qilin',col:'#ff7a3a',s:0.6,mult:0.5,range:32,cd:0.95,desc:'Kỳ lân con, móng có lửa.'},
  linhquy:{name:'Linh Quy',lv:65,price:300000,draw:'turtle',col:'#5aa86a',s:0.6,mult:0.52,range:150,cd:1.3,shot:'water',desc:'Rùa linh phun thủy cầu.'},
  thanhloan:{name:'Thanh Loan',lv:70,price:800000,divine:true,draw:'phoenix',col:'#5ac8ff',glow:'#9fe8ff',s:0.7,mult:0.78,range:150,cd:1.2,shot:'ice',skill:{name:'Loan Minh',cd:10,type:'heal',v:0.12,desc:'Hồi 12% sinh lực cho chủ khi chủ dưới 70% máu.'},desc:'Chim loan xanh, tiếng hót chữa thương.'},
  tieulong:{name:'Tiểu Thanh Long',lv:80,price:1400000,divine:true,draw:'dragon',col:'#3ac8a0',glow:'#7affd8',s:0.75,mult:0.85,range:150,cd:1.1,shot:'water',skill:{name:'Long Tức',cd:9,type:'aoe',v:1.6,desc:'Phun hơi rồng, 160% công lực của chủ lên quái quanh mục tiêu.'},desc:'Rồng con xanh ngọc.'},
  bachtrachpet:{name:'Tiểu Bạch Trạch',lv:90,price:2000000,divine:true,draw:'qilin',col:'#f4f0ff',glow:'#d8c8ff',s:0.75,mult:0.9,range:32,cd:0.9,skill:{name:'Thông Tuệ',cd:14,type:'buff',v:0.25,desc:'Tăng 25% bạo kích cho chủ trong 8 giây.'},desc:'Thần thú trắng tỏa ánh tím.'},
  hoaphungpet:{name:'Hỏa Phượng Non',lv:100,price:3000000,divine:true,draw:'phoenix',col:'#ff6a2a',glow:'#ffb040',s:0.75,mult:0.98,range:150,cd:1.0,shot:'fire',skill:{name:'Phượng Hỏa',cd:9,type:'aoe',v:1.9,desc:'Thiêu đốt quái quanh mục tiêu, 190% công lực của chủ.'},desc:'Phượng hoàng lửa non.'},
  huyenvupet:{name:'Huyền Vũ Linh Quy',lv:115,price:4500000,divine:true,draw:'turtle',col:'#2a6a5a',glow:'#7affc8',s:0.8,mult:0.95,range:150,cd:1.2,shot:'water',skill:{name:'Huyền Vũ Hộ Thể',cd:10,type:'heal',v:0.15,desc:'Hồi 15% sinh lực cho chủ khi chủ dưới 70% máu.'},desc:'Rùa thần nhỏ, đuôi linh xà.'},
  kimlanpet:{name:'Kim Lân Thần Thú',lv:130,price:6500000,divine:true,draw:'qilin',col:'#ffc840',glow:'#ffe080',s:0.8,mult:1.08,range:34,cd:0.9,skill:{name:'Kim Quang',cd:13,type:'buff',v:0.3,desc:'Tăng 30% bạo kích cho chủ trong 8 giây.'},desc:'Kỳ lân vàng nhỏ.'},
  loilong:{name:'Lôi Long',lv:145,price:9000000,divine:true,draw:'dragon',col:'#6a7aff',glow:'#b8c8ff',s:0.8,mult:1.15,range:150,cd:1.0,shot:'ice',skill:{name:'Lôi Long Kích',cd:9,type:'aoe',v:2.2,desc:'Giáng sét, 220% công lực của chủ lên quái quanh mục tiêu.'},desc:'Rồng sấm sét.'},
  thatsac:{name:'Thất Sắc Phượng',lv:160,price:12000000,divine:true,draw:'phoenix',col:'#ff4a9a',glow:'#ff9ae0',rainbow:true,s:0.8,mult:1.22,range:150,cd:1.0,shot:'fire',skill:{name:'Thất Sắc Quang',cd:10,type:'heal',v:0.18,desc:'Hồi 18% sinh lực cho chủ khi chủ dưới 70% máu.'},desc:'Phượng hoàng bảy sắc.'},
  thaicolong:{name:'Thái Cổ Thần Long',lv:175,price:16000000,divine:true,draw:'dragon',col:'#d8a020',glow:'#ffe060',s:0.85,mult:1.3,range:150,cd:0.95,shot:'fire',skill:{name:'Thần Long Bãi Vĩ',cd:9,type:'aoe',v:2.6,desc:'260% công lực của chủ lên quái quanh mục tiêu.'},desc:'Thần long thái cổ vảy vàng.'},
  honnguyenlan:{name:'Hỗn Nguyên Kỳ Lân',lv:190,price:22000000,divine:true,draw:'qilin',col:'#8a3ad8',glow:'#e0a8ff',s:0.85,mult:1.4,range:34,cd:0.85,skill:{name:'Hỗn Nguyên Ấn',cd:8,type:'poison',v:0.5,desc:'Ấn hỗn nguyên lên mục tiêu: rút máu 6 giây, mục tiêu chịu thêm 20% sát thương.'},desc:'Kỳ lân hỗn nguyên, mạnh nhất trong các thần thú.'}
});
// kỹ năng thần thú mới (theo loại)
const _petSkillOld=petSkill;
petSkill=function(P,tg){const S=P.skill;if(!S||!S.type)return _petSkillOld(P,tg);const st=stats(),pw=petPower(player.pet);
  if(S.type==='heal'){if(player.hp<st.maxhp*0.7&&!player.dead){PET.skillCd=S.cd;healPlayer(Math.round(st.maxhp*S.v));addRing(player.x,player.y-10,46,P.glow,0.6);sfx('heal');}}
  else if(S.type==='buff'){PET.skillCd=S.cd;addBuff({id:'pbuf',t:8,max:8,crit:S.v,icon:'✦',col:P.glow,name:S.name});addRing(PET.x,PET.y-10,60,P.glow,0.6);sfx('slam');}
  else if(S.type==='aoe'&&tg){PET.skillCd=S.cd;fx.push({k:'fire',x:tg.x,y:tg.y,r:90,t:0,life:1.1});addRing(tg.x,tg.y,90,P.glow,0.5,3);sfx('fire');
    for(const m of mobs){if(m.dead||Math.hypot(m.x-tg.x,m.y-tg.y)>90)continue;hurtMob(m,dmgCalc(st.atk*S.v*pw,m.armor,1,st.crit));}}
  else if(S.type==='poison'&&tg){PET.skillCd=S.cd;addParts(tg.x,tg.y-tg.t.hh/2,P.glow,18,90);if(!tg.dead){tg.burnT=6;tg.burnKind='poison';tg.burnDmg=Math.max(1,Math.round(st.atk*S.v));tg.markT=6;tg.markAmt=Math.max(tg.markAmt||0,0.2);}}};

// ---------- vẽ thú cưỡi mới ----------
function hueCol(t,o,l){return`hsl(${((t*60+o)%360)|0},90%,${l||60}%)`;}
function steedAura(M,t,front){if(!M.glow)return;
  if(!front){ctx.save();ctx.globalCompositeOperation='lighter';const p=.75+.25*Math.sin(t*3),g=ctx.createRadialGradient(0,-26,4,0,-26,48);g.addColorStop(0,M.glow+'55');g.addColorStop(1,M.glow+'00');ctx.globalAlpha=p;ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-26,48,0,6.29);ctx.fill();
    ctx.strokeStyle=M.glow;ctx.lineWidth=1.4;ctx.globalAlpha=.5*p;ctx.beginPath();ctx.ellipse(0,0,30,8,0,0,6.29);ctx.stroke();ctx.restore();}
  else if(Math.random()<0.4){const m=ctx.getTransform(),x=(m.e/m.a)||0;fx.push({k:'p',x:STEED_POS.x+rnd(-24,24),y:STEED_POS.y-rnd(4,44),vx:rnd(-6,6),vy:-rnd(18,40),col:Math.random()<.5?M.glow:'#ffffff',t:0,life:0.8,sz:rnd(1.4,2.4)});}}
const STEED_POS={x:0,y:0};
function drawDragonMount(M,t,moving){const sp=moving?6:2.4,hov=-24-Math.sin(t*2)*3,C=M.col,L2=shade(C,.35),D=shade(C,-.35),B=shade(C,.6);
  ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(-6,0,36,6,0,0,6.29);ctx.fill();
  const N=22,pts=[];for(let i=0;i<N;i++){const s=i/(N-1);pts.push([30-s*82,hov-8+Math.sin(t*sp-s*6.5)*7*Math.min(1,s*2.2)-(s>0.85?(s-0.85)*30:0)]);}
  // mây dưới thân
  for(let i=0;i<5;i++){const [x,y]=pts[3+i*4];ctx.fillStyle='rgba(255,255,255,.55)';ctx.beginPath();ctx.ellipse(x,y+12,10,3.5,0,0,6.29);ctx.fill();}
  // chân sau, chân trước (vuốt)
  const claw=(i,o)=>{const [x,y]=pts[i];const a=Math.sin(t*sp+o)*0.4;ctx.strokeStyle=D;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,y+3);ctx.lineTo(x+4*Math.cos(a),y+11);ctx.stroke();
    ctx.strokeStyle='#fff6d0';ctx.lineWidth=1.2;for(const d of [-2,0,2]){ctx.beginPath();ctx.moveTo(x+4*Math.cos(a),y+11);ctx.lineTo(x+4*Math.cos(a)+d+2,y+14);ctx.stroke();}};
  claw(13,1);claw(5,0);
  // thân (từ đuôi tới cổ)
  for(let i=N-1;i>=0;i--){const [x,y]=pts[i],r=i<2?7:9-i*0.32;if(r<1.5)continue;
    ctx.fillStyle=OUTL;ctx.beginPath();ctx.arc(x,y,r+1,0,6.29);ctx.fill();const g=ctx.createLinearGradient(0,y-r,0,y+r);g.addColorStop(0,M.rainbow?hueCol(t,i*12,70):L2);g.addColorStop(.5,C);g.addColorStop(1,D);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.29);ctx.fill();
    ctx.fillStyle=B;ctx.beginPath();ctx.ellipse(x,y+r*.55,r*.7,r*.35,0,0,6.29);ctx.fill();
    if(i%2===0&&i>1){ctx.fillStyle=M.mane;ctx.beginPath();ctx.moveTo(x-3,y-r+1);ctx.quadraticCurveTo(x-1,y-r-6-Math.sin(t*5+i)*1.5,x+3,y-r+1);ctx.closePath();ctx.fill();}}
  // vảy sáng
  ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=.8;for(let i=3;i<N-4;i+=2){const [x,y]=pts[i];ctx.beginPath();ctx.arc(x,y-1,3,Math.PI*1.1,Math.PI*1.9);ctx.stroke();}
  // đầu rồng
  const [hx,hy]=pts[0];ctx.save();ctx.translate(hx+4,hy-6);
  ctx.fillStyle=M.mane;for(let i=0;i<5;i++){const a=-2.4+i*0.35+Math.sin(t*4+i)*0.15;ctx.beginPath();ctx.moveTo(-4,0);ctx.quadraticCurveTo(-4+Math.cos(a)*10,Math.sin(a)*10,-6+Math.cos(a)*16,Math.sin(a)*14-2);ctx.lineTo(-2,2);ctx.closePath();ctx.fill();}
  bPath(()=>{ctx.moveTo(-6,-5);ctx.quadraticCurveTo(4,-11,14,-5);ctx.lineTo(19,-3);ctx.quadraticCurveTo(21,0,18,2);ctx.lineTo(8,3);ctx.quadraticCurveTo(0,6,-6,4);ctx.closePath();},vGrad(-11,6,L2,C,D),OUTL,1.1);
  bPath(()=>{ctx.moveTo(4,3);ctx.quadraticCurveTo(12,7,18,4);ctx.lineTo(17,2);ctx.lineTo(8,3);ctx.closePath();},B,OUTL,.8);
  ctx.strokeStyle='#fff6c8';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(0,-7);ctx.quadraticCurveTo(-4,-16,-10,-19);ctx.moveTo(-3,-13);ctx.lineTo(1,-17);ctx.moveTo(3,-7);ctx.quadraticCurveTo(0,-15,-4,-20);ctx.stroke();
  ctx.strokeStyle=M.mane;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(17,1);ctx.bezierCurveTo(10,8+Math.sin(t*3)*3,0,10,-12,8+Math.sin(t*3+1)*4);ctx.moveTo(16,-3);ctx.bezierCurveTo(10,-10,2,-6+Math.sin(t*3)*3,-10,-10);ctx.stroke();
  ctx.fillStyle=M.glow||'#fff';ctx.beginPath();ctx.ellipse(7,-4.5,2.2,1.5,0,0,6.29);ctx.fill();ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(7.6,-4.5,.7,1.3,0,0,6.29);ctx.fill();
  ctx.fillStyle='#fff';for(const tx of [10,13,16]){ctx.beginPath();ctx.moveTo(tx,2.5);ctx.lineTo(tx+1,5);ctx.lineTo(tx+2,2.5);ctx.fill();}
  ctx.restore();
  // yên trên lưng
  const [sx,sy]=pts[8];ctx.save();ctx.translate(sx-2,sy+22);bSaddleCrane();ctx.restore();}
function drawPhoenixMount(M,t,moving){const fl=Math.sin(t*(moving?8:2.6)),hov=-16-Math.sin(t*2)*2.5,R=M.rainbow;
  const C=M.col,G=M.mane,col=i=>R?hueCol(t,i*50,60):[G,shade(C,.2),C,shade(C,-.25),shade(C,-.45)][i%5];
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(0,0,24,5,0,0,6.29);ctx.fill();
  ctx.translate(0,hov);
  // đuôi lông vũ dài
  for(let i=0;i<5;i++){const a=0.25+i*0.13,w=Math.sin(t*2.5+i)*4,L=40+i*5;ctx.save();ctx.translate(-14,-22);ctx.rotate(a);
    bPath(()=>{ctx.moveTo(0,0);ctx.bezierCurveTo(-L*.4,-4+w*.3,-L*.7,6+w,-L,4+w);ctx.bezierCurveTo(-L*.7,10+w,-L*.4,4,0,2);ctx.closePath();},col(i),'rgba(60,20,10,.4)',.7);
    ctx.fillStyle=G;ctx.beginPath();ctx.arc(-L+5,5+w,3,0,6.29);ctx.fill();ctx.fillStyle='#2a4aa0';ctx.beginPath();ctx.arc(-L+5,5+w,1.4,0,6.29);ctx.fill();ctx.restore();}
  const wing=(s,back)=>{ctx.save();ctx.translate(-2,-26);ctx.rotate(-s*(0.15+fl*0.5));ctx.globalAlpha=back?.85:1;
    for(let i=0;i<6;i++){const len=38-i*3.5,yy=-i*0.8*s;ctx.beginPath();ctx.moveTo(0,yy);ctx.quadraticCurveTo(-len*.5,yy-(18-i*1.6)*s,-len,yy-(10-i)*s-fl*6*s);ctx.quadraticCurveTo(-len*.6,yy-2*s,0,yy+3);ctx.closePath();
      ctx.fillStyle=col(i);ctx.fill();ctx.strokeStyle='rgba(80,20,10,.35)';ctx.lineWidth=.8;ctx.stroke();}ctx.restore();};
  wing(-1,true);
  bPath(()=>{ctx.moveTo(-16,-24);ctx.bezierCurveTo(-11,-34,9,-34,15,-26);ctx.bezierCurveTo(11,-17,-8,-15,-16,-24);ctx.closePath();},vGrad(-34,-16,R?hueCol(t,0,75):G,C,shade(C,-.35)),OUTL,1);
  ctx.strokeStyle=OUTL;ctx.lineWidth=5;const nk=()=>{ctx.beginPath();ctx.moveTo(11,-28);ctx.bezierCurveTo(19,-33,15,-42,21,-47);};nk();ctx.stroke();ctx.strokeStyle=R?hueCol(t,90):C;ctx.lineWidth=3.6;nk();ctx.stroke();
  bPath(()=>ctx.ellipse(22.5,-48.5,4,3.4,0,0,6.29),R?hueCol(t,120):C);
  for(let i=0;i<3;i++){ctx.strokeStyle=G;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(21,-51);ctx.quadraticCurveTo(17-i*2,-57,13-i*3,-58+i*2+Math.sin(t*4+i));ctx.stroke();ctx.fillStyle=G;ctx.beginPath();ctx.arc(13-i*3,-58+i*2+Math.sin(t*4+i),1.4,0,6.29);ctx.fill();}
  bPath(()=>{ctx.moveTo(26,-49);ctx.lineTo(32,-47);ctx.lineTo(26,-46.5);ctx.closePath();},'#ffd860',false);
  ctx.fillStyle='#111';ctx.beginPath();ctx.arc(23.8,-49,.9,0,6.29);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(24.1,-49.4,.35,0,6.29);ctx.fill();
  bSaddleCrane();wing(1,false);
  if(Math.random()<0.3)fx.push({k:'p',x:STEED_POS.x+rnd(-30,10)*(STEED_POS.f||1),y:STEED_POS.y-rnd(10,30),vx:rnd(-10,10),vy:-rnd(10,30),col:R?hueCol(nowT,rnd(0,360)):Math.random()<.5?G:C,t:0,life:0.6,sz:2});}
function drawTurtleMount(M,t,moving){const C=M.col,L2=shade(C,.3),D=shade(C,-.35),SH=M.mane,ph=moving?t*7:0,gold=M.kind==='turtle'&&M.glow==='#ffd860';
  // đuôi linh xà
  ctx.save();const w=Math.sin(t*2.5);ctx.strokeStyle=OUTL;ctx.lineWidth=6;const sn=()=>{ctx.beginPath();ctx.moveTo(-24,-12);ctx.bezierCurveTo(-36,-10,-40,-26+w*3,-30,-34);ctx.quadraticCurveTo(-26,-38,-22,-36);};sn();ctx.stroke();ctx.strokeStyle=shade(SH,.25);ctx.lineWidth=4.2;sn();ctx.stroke();
  bPath(()=>ctx.ellipse(-21,-36.5,4,3,0.2,0,6.29),shade(SH,.25));ctx.fillStyle='#ffe040';ctx.beginPath();ctx.arc(-20,-37.4,.9,0,6.29);ctx.fill();ctx.restore();
  // chân
  for(const [lx,o,near] of [[-16,Math.PI,false],[16,0,false],[-14,0,true],[18,Math.PI,true]]){const a=moving?Math.sin(ph+o)*3:0;bPath(()=>ctx.ellipse(lx+a,-3,5.5,4.5,0,0,6.29),near?C:D);ctx.fillStyle='#fff6d0';for(const d of [-3,0,3]){ctx.beginPath();ctx.arc(lx+a+d,0,.9,0,6.29);ctx.fill();}}
  // đầu
  const nod=Math.sin(t*1.6)*1.2;bPath(()=>{ctx.moveTo(18,-14);ctx.quadraticCurveTo(26,-18+nod,30,-16+nod);ctx.lineTo(30,-10+nod);ctx.quadraticCurveTo(24,-8,18,-8);ctx.closePath();},vGrad(-18,-8,L2,C,D));
  bPath(()=>ctx.ellipse(33,-14+nod,6.5,5,0,0,6.29),vGrad(-19,-9,L2,C,D),OUTL,1);ctx.fillStyle='#111';ctx.beginPath();ctx.arc(35,-16+nod,1.1,0,6.29);ctx.fill();ctx.fillStyle=M.glow||'#fff';ctx.beginPath();ctx.arc(35.3,-16.4+nod,.4,0,6.29);ctx.fill();
  // mai rùa
  const shell=()=>{ctx.moveTo(-28,-9);ctx.bezierCurveTo(-28,-38,26,-40,26,-9);ctx.closePath();};
  bPath(shell,vGrad(-38,-8,shade(SH,.35),SH,shade(SH,-.4)),OUTL,1.2);
  ctx.save();ctx.beginPath();shell();ctx.clip();ctx.strokeStyle=gold?'#ffe890':'rgba(255,255,255,.35)';ctx.lineWidth=1.2;
  for(const [hx,hy] of [[-1,-28],[-14,-20],[12,-20],[-1,-14],[-22,-12],[20,-12]]){ctx.beginPath();for(let k=0;k<6;k++){const a=k/6*6.29;const X=hx+Math.cos(a)*6.5,Y=hy+Math.sin(a)*4.6;k?ctx.lineTo(X,Y):ctx.moveTo(X,Y);}ctx.closePath();ctx.stroke();}ctx.restore();
  bPath(()=>{ctx.moveTo(-29,-9);ctx.lineTo(27,-9);ctx.lineTo(25,-6);ctx.lineTo(-27,-6);ctx.closePath();},gold?'#ffd860':shade(C,.15));
  ctx.save();ctx.translate(-1,-4);bSaddle('#2a6a5a','#ffd23f');ctx.restore();}
const STEED_DRAW={dragon:drawDragonMount,phoenix:drawPhoenixMount,turtle:drawTurtleMount};

// ---------- thú nuôi chibi mới ----------
function petRabbit(P,C,D,L2,t,moving,atk){const hop=moving?-Math.abs(Math.sin(t*9))*4:0;ctx.translate(0,hop);
  bPath(()=>ctx.ellipse(-8,-8,3.2,3,0,0,6.29),'#ffffff');
  for(const [lx,o] of [[-4,1],[4,-1]])bPath(()=>ctx.ellipse(lx,-2,3.4,2.2,0,0,6.29),D);
  bPath(()=>ctx.ellipse(0,-8,8,6.5,0,0,6.29),vGrad(-14,-2,L2,C,shade(C,-.15)),OUTL,1);
  ctx.save();ctx.translate(5,-18);for(const [ex,a] of [[-3,-0.25],[3,0.2]]){ctx.save();ctx.translate(ex,-6);ctx.rotate(a+Math.sin(t*3+ex)*0.08);bPath(()=>ctx.ellipse(0,-7,2.8,8,0,0,6.29),C);bPath(()=>ctx.ellipse(0,-7,1.4,6,0,0,6.29),'#f6b8c8',false);ctx.restore();}
  bPath(()=>ctx.ellipse(0,0,9,8,0,0,6.29),vGrad(-8,8,L2,C,shade(C,-.15)),OUTL,1);bPath(()=>ctx.ellipse(7.5,2,1.3,1,0,0,6.29),'#ff8aa0',false);chibiEyes(0,-1,1.9,'#d0405a',1.1);ctx.restore();}
function petTigerCub(P,C,D,L2,t,moving,atk){petBeast(Object.assign({},P,{draw:'wolf'}),C,D,L2,t,moving,atk);
  ctx.strokeStyle='#2a1a10';ctx.lineWidth=1.3;for(const [x1,y1,x2,y2] of [[-4,-15,-2,-11],[0,-16,1,-12],[4,-15,4,-11],[2,-27,4,-24],[8,-27,7,-24]]){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();}}
function petQilin(P,C,D,L2,t,moving,atk){const div=!!P.divine;petBeast(Object.assign({},P,{draw:'wolf'}),C,D,L2,t,moving,atk);
  ctx.save();ctx.translate(6,-20);bPath(()=>{ctx.moveTo(-1,-8);ctx.quadraticCurveTo(0,-16,4,-19);ctx.quadraticCurveTo(2,-12,2,-8);ctx.closePath();},'#ffe27a',OUTL,.7);
  for(let i=0;i<4;i++){ctx.fillStyle=i%2?'#ff7a2a':'#ffd040';ctx.beginPath();ctx.moveTo(-8,-4+i*3);ctx.quadraticCurveTo(-14-Math.sin(t*6+i)*2,-6+i*3,-15,-10+i*3);ctx.quadraticCurveTo(-11,-6+i*3,-7,-7+i*3);ctx.closePath();ctx.fill();}ctx.restore();
  ctx.fillStyle='rgba(255,220,120,.6)';for(const [sx,sy] of [[-4,-11],[0,-12],[4,-11]]){ctx.beginPath();ctx.arc(sx,sy,1.5,0,Math.PI);ctx.fill();}}
function petTurtle(P,C,D,L2,t,moving,atk){const st=moving?Math.sin(t*8):0;
  for(const [lx,o] of [[-7,1],[6,-1]])bPath(()=>ctx.ellipse(lx+st*o,-2,3.2,2.4,0,0,6.29),C);
  ctx.save();ctx.translate(11,-10+Math.sin(t*2)*0.6);bPath(()=>ctx.ellipse(0,0,7.5,6.5,0,0,6.29),vGrad(-6,6,L2,C,D),OUTL,1);chibiEyes(.5,-1,1.6,'#3a8a5a',1.4);ctx.strokeStyle='#2a1a1a';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(2,2.4,1.5,0.2,Math.PI-0.2);ctx.stroke();ctx.restore();
  const sh=()=>{ctx.moveTo(-12,-4);ctx.bezierCurveTo(-12,-22,9,-22,9,-4);ctx.closePath();};bPath(sh,vGrad(-20,-4,shade(C,.15),shade(C,-.2),shade(C,-.45)),OUTL,1);
  ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(-1.5,-11,5,3.5,0,0,6.29);ctx.moveTo(-6.5,-11);ctx.lineTo(-11,-8);ctx.moveTo(3.5,-11);ctx.lineTo(8,-8);ctx.moveTo(-1.5,-14.5);ctx.lineTo(-1.5,-19);ctx.stroke();
  if(P.divine){ctx.strokeStyle=shade(C,.3);ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-12,-6);ctx.bezierCurveTo(-18,-6,-18,-14+Math.sin(t*3)*2,-14,-17);ctx.stroke();bPath(()=>ctx.arc(-14,-17.5,2,0,6.29),shade(C,.3));}}
function petDragon(P,C,D,L2,t,moving,atk){const fl=Math.sin(t*2.6)*2.5;ctx.translate(0,-10+fl);
  ctx.fillStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.ellipse(-2,10-fl,12,3,0,0,6.29);ctx.fill();
  for(let i=6;i>=1;i--){const x=-2-i*3.6,y=Math.sin(t*4-i*0.9)*3+i*0.6,r=6-i*0.6;bPath(()=>ctx.arc(x,y,r,0,6.29),vGrad(y-r,y+r,P.rainbow?hueCol(t,i*30,70):L2,C,D),OUTL,.8);
    if(i%2){ctx.fillStyle=shade(C,.5);ctx.beginPath();ctx.moveTo(x-2,y-r+.5);ctx.lineTo(x,y-r-3.5);ctx.lineTo(x+2,y-r+.5);ctx.fill();}}
  bPath(()=>ctx.ellipse(-1,2,6,5,0,0,6.29),vGrad(-3,7,L2,C,D),OUTL,.9);
  ctx.save();ctx.translate(5,-8);
  ctx.strokeStyle='#fff6c8';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-3,-7);ctx.quadraticCurveTo(-6,-13,-10,-14);ctx.moveTo(2,-8);ctx.quadraticCurveTo(0,-14,-3,-17);ctx.stroke();
  bPath(()=>ctx.ellipse(0,0,9.5,8.5,0,0,6.29),vGrad(-8,8,L2,C,D),OUTL,1);bPath(()=>ctx.ellipse(7,3,5,3.6,0,0,6.29),shade(C,.5),OUTL,.7);
  ctx.fillStyle='#2a1a1a';ctx.beginPath();ctx.arc(9,2,.7,0,6.29);ctx.arc(10.5,2.6,.6,0,6.29);ctx.fill();
  ctx.strokeStyle=shade(C,.55);ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(9,4.5);ctx.bezierCurveTo(6,9,1,9+Math.sin(t*3)*2,-4,8);ctx.stroke();
  chibiEyes(-.5,-2,1.9,P.glow||'#ffd040',1.9);ctx.restore();}
function petPhoenix(P,C,D,L2,t,moving,atk){const fl=Math.sin(t*(moving?12:5)),hov=Math.sin(t*2.4)*2;ctx.translate(0,-10+hov);const R=P.rainbow,col=i=>R?hueCol(t,i*60,62):[C,shade(C,.3),shade(C,-.2)][i%3];
  ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.ellipse(0,10-hov,10,2.6,0,0,6.29);ctx.fill();
  for(let i=0;i<3;i++){ctx.save();ctx.translate(-6,0);ctx.rotate(0.35+i*0.25+Math.sin(t*3+i)*0.08);bPath(()=>{ctx.moveTo(0,0);ctx.bezierCurveTo(-8,-2,-14,4,-18,2);ctx.bezierCurveTo(-14,7,-8,4,0,2);ctx.closePath();},col(i),OUTL,.6);ctx.fillStyle='#ffd860';ctx.beginPath();ctx.arc(-15,3.5,1.6,0,6.29);ctx.fill();ctx.restore();}
  const wing=s=>{ctx.save();ctx.translate(-1,-3);ctx.rotate(-s*(0.3+fl*0.5));bPath(()=>{ctx.moveTo(0,0);ctx.quadraticCurveTo(-6,-10*s,-13,-8*s);ctx.quadraticCurveTo(-8,-2*s,0,2);ctx.closePath();},col(s>0?1:2),OUTL,.7);ctx.restore();};
  wing(-1);bPath(()=>ctx.ellipse(0,0,8,7,0,0,6.29),vGrad(-7,7,R?hueCol(t,0,75):L2,C,D),OUTL,1);
  ctx.save();ctx.translate(5,-9);for(let i=0;i<3;i++){ctx.strokeStyle='#ffd860';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(-1,-6);ctx.quadraticCurveTo(-3-i*2,-12,-6-i*3,-12+i*1.5);ctx.stroke();ctx.fillStyle='#ffd860';ctx.beginPath();ctx.arc(-6-i*3,-12+i*1.5,1.2,0,6.29);ctx.fill();}
  bPath(()=>ctx.ellipse(0,0,7.5,6.8,0,0,6.29),vGrad(-7,7,R?hueCol(t,40,75):L2,C,D),OUTL,1);bPath(()=>{ctx.moveTo(6,0);ctx.lineTo(11,1.5);ctx.lineTo(6,3);ctx.closePath();},'#ffcc40',OUTL,.6);
  chibiEyes(.5,-1,1.6,'#3a2a80',1.6);ctx.restore();wing(1);}
const PET_DRAW={rabbit:petRabbit,tigercub:petTigerCub,qilin:petQilin,turtle:petTurtle,dragon:petDragon,phoenix:petPhoenix};

// ---------- hào quang Trùng Lâu / Thần khí ----------
function setAuraLv(){const n=typeof setCount==='function'?setCount('trunglau'):0;let l=n>=10?3:n>=6?2:n>=2?1:0;if(player.eq&&player.eq.weapon&&player.eq.weapon.god)l=Math.max(l,1);return l;}
function drawSetAura(x,y,fy,lv,front){if(!lv)return;const t=nowT,cy=y+fy;ctx.save();ctx.globalCompositeOperation='lighter';
  if(!front){const R=22+lv*5;for(let k=0;k<lv;k++){ctx.strokeStyle=k%2?'rgba(255,210,80,.75)':'rgba(255,70,110,.75)';ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(x,y,R-k*6,(R-k*6)*0.38,0,t*(k%2?-1.2:1.5),t*(k%2?-1.2:1.5)+4.6);ctx.stroke();}
    for(let k=0;k<6;k++){const a=t*1.5+k*1.047;ctx.fillStyle='rgba(255,220,120,.9)';ctx.beginPath();ctx.arc(x+Math.cos(a)*R,y+Math.sin(a)*R*0.38,1.6,0,6.29);ctx.fill();}
    const g=ctx.createRadialGradient(x,cy-26,4,x,cy-26,30+lv*8);g.addColorStop(0,`rgba(255,90,120,${0.12+lv*0.06})`);g.addColorStop(1,'rgba(255,90,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,cy-26,30+lv*8,0,6.29);ctx.fill();}
  else{if(lv>=3){const h=90,a=.18+.08*Math.sin(t*3),g=ctx.createLinearGradient(0,cy-h,0,cy);g.addColorStop(0,'rgba(255,220,140,0)');g.addColorStop(1,`rgba(255,200,120,${a})`);ctx.fillStyle=g;ctx.fillRect(x-14,cy-h,28,h);}
    if(Math.random()<0.15+lv*0.12)fx.push({k:'p',x:x+rnd(-14,14),y:cy-rnd(0,36),vx:rnd(-6,6),vy:-rnd(20,45),col:Math.random()<.5?'#ff5a7a':'#ffd860',t:0,life:0.9,sz:rnd(1.3,2.3)});}
  ctx.restore();}
