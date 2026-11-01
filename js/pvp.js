'use strict';
// ===================== TỶ THÍ (đấu giữa người chơi) =====================
// Hai người cùng bản đồ thách đấu nhau. Đối thủ được đưa vào danh sách quái dưới dạng một "quái đại diện"
// (isFoe) để mọi chiêu thức, tự động, chọn mục tiêu đều dùng lại được. Sát thương được gửi qua mạng,
// máy của người bị đánh tự trừ máu theo phòng thủ, né, giảm sát thương của chính mình.
const PVP_MUL=0.15,DUEL_TIME=120,DUEL_MINLV=10;
const DUEL={id:null,name:'',state:null,t:0,foe:null,lost:0};
const inDuel=()=>DUEL.state==='on';
const duelRoom=()=>NET.mapRoom;
function duelClear(){if(DUEL.foe){const i=mobs.indexOf(DUEL.foe);if(i>=0)mobs.splice(i,1);if(player.target===DUEL.foe){player.target=null;player.pend=null;}}
  DUEL.id=null;DUEL.name='';DUEL.state=null;DUEL.foe=null;DUEL.lost=0;const b=$('duelBar');if(b)b.hidden=true;}
function duelInvite(o){
  if(DUEL.state){log('Bạn đang trong một trận tỷ thí','#ffb36b');return;}
  if(NET.status!=='on'){log('Chưa kết nối mạng','#ff9a8a');return;}
  if(player.lv<DUEL_MINLV||(o.lv|0)<DUEL_MINLV){log(`Cả hai cần đạt cấp ${DUEL_MINLV} mới tỷ thí được`,'#ffb36b');return;}
  netCast(duelRoom(),'dreq',{id:NET.id,name:player.name,lv:player.lv,sect:player.sect,to:o.id});
  Object.assign(DUEL,{id:o.id,name:o.name,state:'ask',t:20});log(`Đã gửi lời thách đấu tới ${o.name}`,'#ffb36b');}
function duelOnMsg(ev,p){
  if(ev==='dreq'&&p.to===NET.id){
    if(DUEL.state||player.lv<DUEL_MINLV||player.dead){netCast(duelRoom(),'dno',{id:NET.id,name:player.name,to:p.id,busy:1});return;}
    const S=SECTS[p.sect],E=S&&EL[S.el],me=SECTS[player.sect].el;sfx('quest');
    const hint=S?(elMul(me,S.el)>1?'Phái của bạn khắc phái này.':elMul(S.el,me)>1?'Phái này khắc phái của bạn.':'Hai phái không khắc nhau.'):'';
    openDlg('Lời thách đấu',`<b style="color:#ff9a7a">${esc(p.name)}</b> (cấp ${p.lv|0}${S?' · '+S.name+' · hệ <b style="color:'+E.c+'">'+E.n+'</b>':''}) thách bạn tỷ thí.<br><span style="color:#bbb">${hint}</span><br><br>
      Trận đấu kéo dài tối đa 2 phút, ai hết máu trước thì thua. <b>Thua không mất kinh nghiệm hay đồ.</b> Trong làng (vùng an toàn) không đánh được nhau.`,
      [{t:'Nhận lời',fn:()=>{netCast(duelRoom(),'dacc',{id:NET.id,name:player.name,to:p.id});closeDlg();duelStart(p.id,p.name);}},
       {t:'Từ chối',gray:true,fn:()=>{netCast(duelRoom(),'dno',{id:NET.id,name:player.name,to:p.id});closeDlg();}}]);return;}
  if(p.id!==DUEL.id||p.to!==NET.id)return;
  if(ev==='dno'&&DUEL.state==='ask'){log(`${p.name} ${p.busy?'đang bận':'đã từ chối lời thách đấu'}`,'#ffb36b');duelClear();return;}
  if(ev==='dacc'&&DUEL.state==='ask'){duelStart(p.id,p.name);return;}
  if(ev==='dhit')duelRecvHit(p);
  else if(ev==='dcc')duelRecvCC(p);
  else if(ev==='dend'&&DUEL.state)duelFinish(p.r==='lose'?'win':'draw');}
function duelStart(id,name){Object.assign(DUEL,{id,name,state:'count',t:3});auto=false;autoRest=false;navGoal=null;
  toast(`Tỷ thí với ${name}!`,'#ff9a7a');log(`Bắt đầu tỷ thí với ${name}. Ra khỏi làng để giao đấu.`,'#ff9a7a');sfx('slam');}
function makeFoe(o){const S=SECTS[o.sect],mh=o.mh||1000;
  return{isFoe:true,id:o.id,type:'foe',t:{name:o.name,hh:62,hw:16,el:S?S.el:null,boss:false,hp:1,lv:[o.lv|0,o.lv|0],draw:'foe',aggro:0,range:40},
    lv:o.lv|0,x:o.x,y:o.y,hx:o.x,hy:o.y,maxhp:mh,hp:(o.hf==null?1:o.hf)*mh,armor:o.df||0,spd:0,dead:false,state:'chase',path:[],hitFlash:0,fade:0,atkCd:9,atkAnim:0,repath:0,
    freezeT:0,stunT:0,slowT:0,slowAmt:0,burnT:0,burnTick:0,burnDmg:0,burnKind:'fire',markT:0,markAmt:0,enraged:false,summoned:false};}
// gửi đòn đánh tới đối thủ (gọi từ hurtMob khi mục tiêu là đối thủ)
function pvpSendHit(m,v,crit){if(!inDuel()||m!==DUEL.foe)return;
  if(inSafe(player)||inSafe(m)){addText(m.x,m.y-70,'Vùng an toàn','#cccccc',12);return;}
  netCast(duelRoom(),'dhit',{id:NET.id,to:m.id,v:Math.round(v),crit:crit?1:0});m.hitFlash=0.12;player.combatT=5;
  addText(m.x,m.y-70,(crit?'Bạo kích ':'')+Math.max(1,Math.round(v*PVP_MUL)),crit?'#ffd23f':'#ffb0a0',crit?17:13);sfx(crit?'crit':'hit');}
function duelRecvHit(p){if(!inDuel()||player.dead||inSafe(player))return;const st=stats();
  for(const b of player.buffs)if(b.dodge&&Math.random()<b.dodge){addText(player.x,player.y-58,'Né','#d8c8ff',14);return;}
  let v=Math.max(0,+p.v||0)*PVP_MUL;for(const b of player.buffs)if(b.dr)v*=1-b.dr;v=Math.max(1,Math.min(Math.round(v),Math.round(st.maxhp*0.5)));
  if(!p.rf)for(const b of player.buffs)if(b.reflect)netCast(duelRoom(),'dhit',{id:NET.id,to:DUEL.id,v:Math.round((+p.v||0)*b.reflect),crit:0,rf:1});
  player.hp-=v;player.combatT=5;player.hitFlash=0.12;sfx('hurt');addText(player.x,player.y-58,'-'+v,p.crit?'#ff3b3b':'#ff8a7a',p.crit?18:14);
  if(player.hp<=0){player.hp=1;netCast(duelRoom(),'dend',{id:NET.id,to:DUEL.id,r:'lose'});duelFinish('lose');}}
function duelRecvCC(p){if(!inDuel()||player.dead||inSafe(player))return;
  if(p.stun){player.stunT=Math.max(player.stunT||0,Math.min(1.5,(+p.stun||0)*0.6));addText(player.x,player.y-84,'Choáng','#ffe27a',13);}
  if(p.slow)player.slowT=Math.max(player.slowT,Math.min(3,+p.slow||0));}
// mỗi khung hình: hiệu ứng trên người đối thủ (độc, bỏng, choáng, làm chậm) được gửi đi
function foeTick(m,dt){m.hitFlash-=dt;if(m.markT>0)m.markT-=dt;
  if(m.burnT>0){m.burnT-=dt;m.burnTick-=dt;if(m.burnTick<=0){m.burnTick=0.5;hurtMob(m,{v:m.burnDmg,crit:false});}}
  const stun=Math.max(m.freezeT,m.stunT);if(stun>0){netCast(duelRoom(),'dcc',{id:NET.id,to:m.id,stun});m.freezeT=0;m.stunT=0;}
  if(m.slowT>0){netCast(duelRoom(),'dcc',{id:NET.id,to:m.id,slow:m.slowT});m.slowT=0;}}
function duelFinish(res){if(!DUEL.state)return;const name=DUEL.name;const pv=player.pvp||(player.pvp={w:0,l:0,d:0});
  if(res==='win'){pv.w++;toast(`Thắng tỷ thí với ${name}!`,'#ffd23f');log(`Bạn đã thắng ${name} trong trận tỷ thí`,'#ffd23f');sfx('level');
    fx.push({k:'beam',x:player.x,y:player.y,t:0,life:1.2,col:'rgba(255,230,140,.9)'});}
  else if(res==='lose'){pv.l++;toast(`Thua tỷ thí với ${name}`,'#ff9a8a');log(`Bạn đã thua ${name}. Không mất kinh nghiệm hay đồ.`,'#ff9a8a');sfx('die');
    const st=stats();player.hp=Math.max(player.hp,st.maxhp*0.3);player.stunT=0;}
  else{pv.d++;toast(`Hòa tỷ thí với ${name}`,'#ccc');log(`Trận tỷ thí với ${name} kết thúc hòa`,'#ccc');}
  duelClear();save();}
function duelOnDeath(){if(DUEL.state){if(inDuel())netCast(duelRoom(),'dend',{id:NET.id,to:DUEL.id,r:'lose'});duelFinish('lose');}}
function duelOnMap(){if(DUEL.state){if(DUEL.state!=='ask')netCast(duelRoom(),'dend',{id:NET.id,to:DUEL.id,r:'draw'});log('Rời bản đồ, trận tỷ thí bị hủy','#ccc');duelClear();}}
function duelTick(dt){if(!DUEL.state)return;const b=$('duelBar');
  if(DUEL.state==='ask'){DUEL.t-=dt;if(DUEL.t<=0){log(`${DUEL.name} không trả lời lời thách đấu`,'#ccc');duelClear();}return;}
  const o=NET.others.get(DUEL.id);
  if(!o){DUEL.lost+=dt;if(DUEL.lost>6){log(`${DUEL.name} đã rời đi, trận tỷ thí kết thúc`,'#ccc');duelFinish('draw');}return;}DUEL.lost=0;
  if(DUEL.state==='count'){DUEL.t-=dt;if(b){b.hidden=false;b.textContent=`Tỷ thí với ${DUEL.name} · bắt đầu sau ${Math.ceil(DUEL.t)}`;}
    if(DUEL.t<=0){DUEL.state='on';DUEL.t=DUEL_TIME;DUEL.foe=makeFoe(o);mobs.push(DUEL.foe);player.target=DUEL.foe;player.repath=0;toast('Bắt đầu!','#ff6a5a');sfx('slam');}return;}
  const f=DUEL.foe;f.x=o.x;f.y=o.y;f.lv=o.lv|0;if(o.mh)f.maxhp=o.mh;if(o.hf!=null)f.hp=o.hf*f.maxhp;if(o.df!=null)f.armor=o.df;
  DUEL.t-=dt;if(b){b.hidden=false;const s=Math.max(0,Math.ceil(DUEL.t));b.innerHTML=`⚔ Tỷ thí với <b>${esc(DUEL.name)}</b> · ${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}${inSafe(player)?' · <span style="color:#ffb36b">Ra khỏi làng để đánh</span>':''}`;}
  if(DUEL.t<=0)duelFinish('draw');}
