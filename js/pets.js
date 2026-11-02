'use strict';
// ===================== THÚ NUÔI =====================
// Thú nuôi đi theo chủ và cùng đánh quái. Thú thường mua ở Cửa hàng. Thần thú mạnh hơn, có kỹ năng riêng,
// mua giá cao hoặc may mắn nhận được khi hạ trùm (tỉ lệ thấp). Thú nuôi không bị thương, lên cấp theo số quái cùng hạ.
const PETS={
  soicon:{name:'Sói Con',lv:5,price:800,draw:'wolf',col:'#a0a6ae',s:0.55,mult:0.22,range:30,cd:1.1,desc:'Cắn nhanh, theo sát chủ.'},
  lontoc:{name:'Heo Rừng Con',lv:8,price:1500,draw:'boar',s:0.5,mult:0.26,range:32,cd:1.3,desc:'Húc mạnh, chậm mà chắc.'},
  tieuho:{name:'Tiểu Hỏa Hồ',lv:14,price:4000,draw:'fox',col:'#f08a3a',tails:2,s:0.55,mult:0.3,range:30,cd:1.0,desc:'Hồ ly lửa nhanh nhẹn.'},
  tieulinh:{name:'Tiểu Thủy Linh',lv:20,price:9000,draw:'spirit',col:'#9fe0ff',s:0.6,mult:0.3,range:150,cd:1.4,shot:'water',desc:'Tinh linh nhỏ, bắn thủy cầu từ xa.'},
  // thần thú
  thienlang:{name:'Thiên Lang',lv:30,price:90000,divine:true,draw:'wolf',col:'#f4f0e0',glow:'#ffe08a',s:0.75,mult:0.5,range:32,cd:0.9,
    skill:{name:'Lang Hống',cd:14,desc:'Tru lên, tăng 20% bạo kích cho chủ trong 8 giây.'},desc:'Sói thần lông trắng ánh vàng.'},
  huyenbang:{name:'Huyền Băng Linh',lv:36,price:150000,divine:true,draw:'spirit',col:'#c8f4ff',glow:'#9fe8ff',s:0.85,mult:0.42,range:160,cd:1.2,shot:'ice',
    skill:{name:'Băng Tâm Quyết',cd:10,desc:'Hồi 12% sinh lực cho chủ khi chủ dưới 70% máu.'},desc:'Tinh linh băng nghìn năm, giỏi chữa thương.'},
  cuuvi:{name:'Cửu Vĩ Linh Hồ',lv:45,price:280000,divine:true,draw:'fox',col:'#ffd070',tails:9,glow:'#ffb040',s:0.75,mult:0.62,range:150,cd:1.0,shot:'fire',
    skill:{name:'Hồ Hỏa Liệt Diễm',cd:9,desc:'Phun lửa thiêu mọi quái quanh mục tiêu, 150% công lực của chủ.'},desc:'Hồ ly chín đuôi, thần thú bậc nhất.'},
  uminhlong:{name:'U Minh Ảnh Xà',lv:52,price:420000,divine:true,draw:'snake',col:'#8a5ad0',glow:'#c890ff',s:0.85,mult:0.7,range:34,cd:0.95,
    skill:{name:'Ảnh Độc',cd:8,desc:'Phun độc lên mục tiêu, ngấm 6 giây và khiến mục tiêu chịu thêm 15% sát thương.'},desc:'Rắn thần bóng tối, độc xuyên giáp.'}
};
const PET_MAXLV=10,petNeed=l=>40*l*l;
const PET={x:0,y:0,face:1,moving:false,atkCd:0,atkAnim:0,skillCd:3,flash:0,idleT:0,ox:-32,oy:8,lunge:0,ldx:0,ldy:0};
const petDef=()=>player.pet&&PETS[player.pet]?PETS[player.pet]:null;
const petLv=k=>((player.petExp||{})[k]||{}).lv||1;
const petPower=k=>1+0.06*(petLv(k)-1);
function setPet(k){player.pet=k;PET.x=player.x-30;PET.y=player.y;player.petOn=true;log(`${PETS[k].divine?'Thần thú':'Thú nuôi'} ${PETS[k].name} đi theo bạn`,PETS[k].divine?'#ffd23f':'#9fffb0');refreshPanels();}
function givePet(k,how){player.pets=player.pets||[];if(player.pets.includes(k))return false;player.pets.push(k);if(!player.pet||PETS[k].mult>PETS[player.pet].mult)setPet(k);
  const P=PETS[k];toast(`${how||'Nhận được'} ${P.divine?'thần thú':'thú nuôi'} ${P.name}!`,P.divine?'#ffd23f':'#9fffb0');sfx('level');save();return true;}
function petTarget(){const t=player.target;if(t&&!t.dead&&dist(t,player)<320)return t;let b=null,bd=200;for(const m of mobs){if(m.dead||m.isFoe||m.state!=='chase')continue;const d=dist(m,player);if(d<bd){bd=d;b=m;}}return b;}
function petTick(dt){const P=petDef();if(!P||!player.petOn||!started){return;}
  PET.atkCd-=dt;PET.atkAnim-=dt;PET.lunge-=dt;PET.skillCd-=dt;PET.flash-=dt;
  if(Math.hypot(PET.x-player.x,PET.y-player.y)>360){PET.x=player.x-player.face*30;PET.y=player.y+6;}
  const tg=player.dead?null:petTarget();let gx,gy,stopR;
  if(tg){gx=tg.x-Math.sign(tg.x-PET.x||1)*(P.range>60?P.range*0.8:P.range*0.7);gy=tg.y+4;stopR=6;}
  else if(player.moving||player.path.length){gx=player.x-player.face*32;gy=player.y+8;stopR=14;PET.idleT=rnd(0.5,1.5);}
  else{// chủ đứng yên: thú chạy loanh quanh, lúc chạy lúc đứng
    PET.idleT-=dt;if(PET.idleT<=0){PET.idleT=rnd(0.8,2.2);if(Math.random()<0.8){const a=rnd(0,Math.PI*2),r=Math.random()<0.2?rnd(80,120):rnd(28,75);PET.ox=Math.cos(a)*r;PET.oy=Math.sin(a)*r*0.55+6;}}
    gx=player.x+PET.ox;gy=player.y+PET.oy;stopR=4;}
  const dx=gx-PET.x,dy=gy-PET.y,d=Math.hypot(dx,dy),idle=!tg&&!player.moving&&!player.path.length,sp=(idle&&d<130?75:Math.max(stats().move*1.25,d>120?380:200))*dt;
  if(d>stopR){const k=Math.min(1,sp/d);PET.x+=dx*k;PET.y+=dy*k;PET.moving=true;if(Math.abs(dx)>2)PET.face=dx>0?1:-1;}else PET.moving=false;
  if(tg){const dd=dist(tg,PET);if(dd<=P.range+8){PET.face=tg.x>=PET.x?1:-1;
      if(PET.atkCd<=0){PET.atkCd=P.cd;PET.atkAnim=0.25;const st=stats(),pw=P.mult*petPower(player.pet);
        if(P.shot){// đánh xa: bắn đạn thật bay tới mục tiêu
          const kind=P.shot==='fire'?'fire':P.shot==='ice'?'ice':'water',c=SHOT_PCOL[kind];addParts(PET.x+PET.face*8,PET.y-16,c[0],8,70);addRing(PET.x,PET.y-14,18,c[2],0.3);
          shots.push({kind,x:PET.x+PET.face*8,y:PET.y-16,tg,spd:440,mult:pw,slow:P.shot==='ice'?{dur:1.5,amt:0.3}:null});sfx('cast');}
        else{// cận chiến: lao tới cắn rồi lùi lại
          PET.lunge=0.28;const L=Math.max(1,dist(tg,PET));PET.ldx=(tg.x-PET.x)/L;PET.ldy=(tg.y-PET.y)/L;
          timers.push({t:0.1,fn:()=>{if(tg.dead)return;const hx=tg.x,hy=tg.y-tg.t.hh/2,col=P.glow||'#ffffff';
            addSlash(hx,hy,PET.face,col);fx.push({k:'s',x:hx+6,y:hy+6,face:-PET.face,col,t:0,life:0.2});addParts(hx,hy,col,10,110);addRing(hx,hy,22,col,0.25,2);sfx('hit');
            hurtMob(tg,dmgCalc(stats().atk*pw,tg.armor,1,stats().crit));}});}}
      if(P.skill&&PET.skillCd<=0)petSkill(P,tg);}}
  else if(P.skill&&player.pet==='huyenbang'&&PET.skillCd<=0)petSkill(P,null);}
function petSkill(P,tg){const st=stats();
  if(player.pet==='thienlang'){PET.skillCd=P.skill.cd;addBuff({id:'howl',t:8,max:8,crit:0.2,icon:'☾',col:'#ffe08a',name:P.skill.name});addRing(PET.x,PET.y-10,60,'#ffe08a',0.6);sfx('slam');}
  else if(player.pet==='huyenbang'){if(player.hp<st.maxhp*0.7&&!player.dead){PET.skillCd=P.skill.cd;healPlayer(Math.round(st.maxhp*0.12));addRing(player.x,player.y-10,46,'#9fe8ff',0.6);sfx('heal');}}
  else if(player.pet==='cuuvi'&&tg){PET.skillCd=P.skill.cd;fx.push({k:'fire',x:tg.x,y:tg.y,r:80,t:0,life:1.1});sfx('fire');
    for(const m of mobs){if(m.dead||Math.hypot(m.x-tg.x,m.y-tg.y)>80)continue;hurtMob(m,dmgCalc(st.atk*1.5*petPower('cuuvi'),m.armor,1,st.crit));}}
  else if(player.pet==='uminhlong'&&tg){PET.skillCd=P.skill.cd;addParts(tg.x,tg.y-tg.t.hh/2,'#b48cff',16,90);
    if(!tg.dead){tg.burnT=6;tg.burnKind='poison';tg.burnDmg=Math.max(1,Math.round(st.atk*0.35));tg.markT=6;tg.markAmt=Math.max(tg.markAmt||0,0.15);}}}
// thú nuôi lên cấp khi cùng chủ hạ quái; trùm có tỉ lệ rơi thần thú
function petOnKill(m){const k=player.pet;if(k&&player.petOn){const pe=player.petExp=player.petExp||{},e=pe[k]=pe[k]||{lv:1,x:0};
    if(e.lv<PET_MAXLV){e.x+=m.t.boss?20:1;if(e.x>=petNeed(e.lv)){e.x=0;e.lv++;toast(`${PETS[k].name} lên cấp ${e.lv}`,'#9fffb0');log(`${PETS[k].name} lên cấp ${e.lv}, sức đánh tăng`,'#9fffb0');}}}
  if(m.t.boss&&!m.summoned&&Math.random()<0.06){const pool=Object.keys(PETS).filter(x=>PETS[x].divine&&player.lv>=PETS[x].lv-5&&!(player.pets||[]).includes(x));
    if(pool.length)givePet(pool[(Math.random()*pool.length)|0],`${m.t.name} để lại`);}}
function drawPetAt(k,x,y,face,moving,atk,lv){const P=PETS[k];if(!P)return;
  if(P.glow){const g=ctx.createRadialGradient(x,y-10,2,x,y-10,26);g.addColorStop(0,P.glow+'55');g.addColorStop(1,P.glow+'00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y-10,26,0,Math.PI*2);ctx.fill();
    if(Math.random()<0.15)fx.push({k:'p',x:x+rnd(-10,10),y:y-rnd(4,24),vx:0,vy:-25,col:P.glow,t:0,life:0.6,sz:1.6});}
  drawShadow(x,y,14*P.s,0.25);
  if(P.draw==='wolf')drawWolf(x,y,P.s,face,moving,atk,false,P.col);
  else if(P.draw==='boar')drawBoar(x,y,P.s,face,moving,atk,false);
  else if(P.draw==='fox')drawFox(x,y,P.s,face,moving,atk,false,P.col,P.tails,P.tails>=9);
  else if(P.draw==='spirit')drawSpirit(x,y-6,P.s,face,moving,atk,false,P.col);
  else if(P.draw==='snake')drawSnake(x,y,P.s,face,moving,atk,false,P.col);
  if(lv!=null)label(`${P.name}${lv>1?' · '+lv:''}`,x,y-40*P.s-12,P.divine?'#ffd23f':'#cfe8c0',9);}
function drawPet(list){if(petDef()&&player.petOn&&!player.dead){const q=PET.lunge>0?Math.sin((1-PET.lunge/0.28)*Math.PI)*16:0;
    list.push({y:PET.y,f:()=>drawPetAt(player.pet,PET.x+PET.ldx*q,PET.y+PET.ldy*q,PET.face,PET.moving,PET.atkAnim,petLv(player.pet))});}
  if(typeof NET!=='undefined')for(const o of NET.others.values()){if(!o.pt||!PETS[o.pt])continue;
    if(o.ptx==null){o.ptx=o.x-30;o.pty=o.y;}if(!o.mv){o.ptT=(o.ptT||0)-0.016;if(o.ptT<=0){o.ptT=rnd(1.2,3.5);const a=rnd(0,6.28),r=rnd(28,70);o.pox=Math.cos(a)*r;o.poy=Math.sin(a)*r*0.55+6;}}else{o.pox=-(o.face||1)*32;o.poy=8;}
    const gx=o.x+(o.pox??-32),gy=o.y+(o.poy??8),dx=gx-o.ptx,dy=gy-o.pty,d=Math.hypot(dx,dy);
    if(d>400){o.ptx=gx;o.pty=gy;}else if(d>3){const k=o.mv?0.08:Math.min(1,1.6/d);o.ptx+=dx*k;o.pty+=dy*k;}o.ptf=Math.abs(dx)>2?(dx>0?1:-1):(o.ptf||1);
    list.push({y:o.pty,f:()=>drawPetAt(o.pt,o.ptx,o.pty,o.ptf,d>3,0,null)});}}
// ---------- cửa hàng: thẻ Thú nuôi ----------
function renderPetTab(){let h=`<div class="shgm">Thú nuôi đi theo và cùng đánh quái, lên cấp khi cùng bạn hạ quái (tối đa cấp ${PET_MAXLV}). <b style="color:#ffd23f">Thần thú</b> có kỹ năng riêng; đánh trùm có tỉ lệ nhỏ được tặng thần thú.</div>`;
  h+=Object.entries(PETS).map(([k,P])=>{const own=(player.pets||[]).includes(k),cur=player.pet===k&&player.petOn,lock=!isGM()&&player.lv<P.lv;
    return`<div class="shr"><canvas class="shm" width="180" height="126" data-pv="${k}"></canvas><div class="shd"><b style="color:${P.divine?'#ffd23f':'#cfe8c0'}">${P.divine?'✦ Thần thú · ':''}${P.name}</b> <span style="color:${lock?'#ff7a6a':'#9f9'}">cấp ${P.lv}</span>${own?` <span style="color:#9fd3ff">(thú cấp ${petLv(k)})</span>`:''}<br>
      <span>${P.desc} Sức đánh ${Math.round(P.mult*100)}% công lực của chủ${P.shot?', đánh xa':''}.${P.skill?` <b style="color:#ffe9a0">${P.skill.name}</b>: ${P.skill.desc}`:''}</span></div>
      <div class="shp">${own?(cur?`<b style="color:#9fffb0">Đang đi theo</b><button data-petoff="1">Cất đi</button>`:`<button data-petuse="${k}">Gọi ra</button>`):`${priceTxt(P.price)}<button data-pet="${k}" ${lock?'disabled':''}>Mua</button>`}</div></div>`;}).join('');
  return h;}
function bindPetTab(b){b.querySelectorAll('[data-pet]').forEach(e=>e.onclick=()=>{const k=e.dataset.pet,P=PETS[k];if(!isGM()&&player.lv<P.lv)return;if(!shopPay(P.price))return;givePet(k,'Đã mua');setPet(k);save();renderShop();});
  b.querySelectorAll('[data-petuse]').forEach(e=>e.onclick=()=>{setPet(e.dataset.petuse);save();renderShop();});
  b.querySelectorAll('[data-petoff]').forEach(e=>e.onclick=()=>{player.petOn=false;log('Đã cất thú nuôi','#ccc');save();renderShop();});
  b.querySelectorAll('canvas[data-pv]').forEach(c=>withCtx(c,()=>{ctx.scale(2.1,2.1);drawPetAt(c.dataset.pv,43,54,1,false,0,null);}));}
(()=>{const tabs=$('shTab_mount').parentNode;tabs.insertAdjacentHTML('beforeend','<button id="shTab_pet">Thú nuôi</button>');
  $('shTab_pet').onclick=()=>{shopTab='pet';sfx('click');renderShop();};
  const _rs=renderShop;renderShop=function(){if(shopTab!=='pet'){$('shTab_pet').classList.remove('sel');return _rs();}
    if($('panelShop').hidden)return;['item','eq','mount'].forEach(t=>$('shTab_'+t).classList.remove('sel'));$('shTab_pet').classList.add('sel');
    $('shopGold').innerHTML=isGM()?'<span class="gmtag">GM</span> Mua mọi thứ miễn phí, không giới hạn cấp':`Lượng: <b style="color:#ffd977">${player.gold.toLocaleString('vi-VN')}</b>`;
    const b=$('shopBody');b.innerHTML=renderPetTab();bindPetTab(b);};})();
// tự động mua thú nuôi thường khi dư dả
function autoPet(){if(isGM())return;let best=null;for(const [k,P] of Object.entries(PETS))if(!P.divine&&player.lv>=P.lv&&player.gold>=P.price*3&&!(player.pets||[]).includes(k)&&(!player.pet||P.mult>PETS[player.pet].mult))best=k;if(best){player.gold-=PETS[best].price;givePet(best,'Tự mua');}}
