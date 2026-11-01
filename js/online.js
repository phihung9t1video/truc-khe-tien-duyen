'use strict';
// ===================== ONLINE (Supabase Realtime + RPC, không cần thư viện) =====================
// Thấy người chơi khác cùng bản đồ, chat thế giới, bảng xếp hạng, lưu nhân vật lên mạng.
const NET={cfg:window.ONLINE_CFG||null,ws:null,ref:1,status:'off',others:new Map(),world:new Map(),chat:[],mapRoom:null,
  sendT:0,hbT:0,helloT:0,retryT:0,cloudT:20,lastChat:0,rpcOk:null,id:null,secret:null};
function netEnabled(){return !!(NET.cfg&&NET.cfg.url&&NET.cfg.key);}
function netIdent(){
  let id=localStorage.getItem('tk_net_id'),sec=localStorage.getItem('tk_net_secret');
  const rnd=n=>Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b%32]).join('');
  if(!id){id=rnd(8);localStorage.setItem('tk_net_id',id);}if(!sec){sec=rnd(12);localStorage.setItem('tk_net_secret',sec);}
  NET.id=id;NET.secret=sec;}
const recoveryCode=()=>`${NET.id}-${NET.secret}`;
function netSend(obj){if(NET.ws&&NET.ws.readyState===1){obj.ref=String(NET.ref++);NET.ws.send(JSON.stringify(obj));}}
function netJoin(room){netSend({topic:'realtime:'+room,event:'phx_join',payload:{config:{broadcast:{self:false,ack:false},presence:{key:''},private:false}}});}
function netLeave(room){netSend({topic:'realtime:'+room,event:'phx_leave',payload:{}});}
function netCast(room,event,payload){netSend({topic:'realtime:'+room,event:'broadcast',payload:{type:'broadcast',event,payload}});}
function netConnect(){
  if(!netEnabled()||NET.ws)return;netIdent();
  const url=NET.cfg.url.replace(/^http/,'ws').replace(/\/$/,'')+'/realtime/v1/websocket?apikey='+encodeURIComponent(NET.cfg.key)+'&vsn=1.0.0';
  NET.status='connecting';
  let ws;try{ws=new WebSocket(url);}catch(e){NET.status='off';NET.retryT=10;return;}
  NET.ws=ws;
  ws.onopen=()=>{NET.status='on';NET.mapRoom=null;netJoin('tk_world');netSyncRoom();netHello();};
  ws.onclose=()=>{NET.ws=null;NET.status='off';NET.others.clear();NET.retryT=8;};
  ws.onerror=()=>{};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(_){return;}
    if(m.event!=='broadcast'||!m.payload)return;const ev=m.payload.event,p=m.payload.payload;if(!p||p.id===NET.id)return;
    if(ev==='pos'){const o=NET.others.get(p.id);if(o){Object.assign(o,p,{tx:p.x,ty:p.y,seen:nowT});}else NET.others.set(p.id,Object.assign({},p,{tx:p.x,ty:p.y,seen:nowT,look:null}));
      const oo=NET.others.get(p.id);oo.look=buildLook(p.sect,p.gender,{armor:{rar:p.ar||0}},Array.isArray(p.ap)?{h:p.ap[0],hc:p.ap[1],sk:p.ap[2],ey:p.ap[3],acc:p.ap[4],cl:p.ap[5],bd:p.ap[6]}:null);oo.wv=weaponVis({rar:p.wr||0,tier:p.wt||0},SECTS[p.sect].wtype,p.rf||0);}
    else if(ev==='bye'){NET.others.delete(p.id);if(m.topic==='realtime:tk_world')NET.world.delete(p.id);}
    else if(ev==='hello'){const isNew=!NET.world.has(p.id);NET.world.set(p.id,{id:p.id,name:String(p.name||'').slice(0,14),lv:p.lv|0,map:p.map,sect:p.sect,gm:p.gm?1:0,seen:nowT});
      if(isNew&&nowT-(NET.lastHelloBack||-9)>2){NET.lastHelloBack=nowT;netHello();}}
    else if(ev==='chat'){netAddChat(p.name,String(p.text||'').slice(0,120),p.lv);}
    else if(ev[0]==='p')partyOnMsg(ev,p);
    else if(ev[0]==='d'&&typeof duelOnMsg==='function')duelOnMsg(ev,p);
    else if((ev==='wsp'||ev[0]==='f'||ev[0]==='t')&&typeof socialOnMsg==='function')socialOnMsg(ev,p);};}
addEventListener('pagehide',()=>{try{if(NET.status==='on')netCast('tk_world','bye',{id:NET.id});}catch(e){}});
function netSyncRoom(){if(NET.status!=='on')return;const room='tk_map_'+curMapId;if(NET.mapRoom===room)return;
  if(NET.mapRoom){netCast(NET.mapRoom,'bye',{id:NET.id});netLeave(NET.mapRoom);}NET.others.clear();NET.mapRoom=room;netJoin(room);NET.sendT=0;}
function netHello(){if(!player.sect||!started)return;netCast('tk_world','hello',{id:NET.id,name:player.name,lv:player.lv,map:curMapId,sect:player.sect,gm:typeof isGM==='function'&&isGM()?1:0});}
function netAddChat(name,text,lv){NET.chat.push({name,text,lv,t:Date.now()});if(NET.chat.length>40)NET.chat.shift();if(typeof renderChat==='function')renderChat();}
function netSendChat(text){text=text.replace(/\s+/g,' ').trim().slice(0,120);if(!text)return;
  if(NET.status!=='on'){netAddChat('Hệ thống','Chưa kết nối mạng, không gửi được.',0);return;}
  if(Date.now()-NET.lastChat<2000){netAddChat('Hệ thống','Gửi chậm lại một chút nhé.',0);return;}
  NET.lastChat=Date.now();netCast('tk_world','chat',{id:NET.id,name:player.name,text,lv:player.lv});netAddChat(player.name,text,player.lv);}
function netTick(dt){
  if(!netEnabled())return;
  if(!NET.ws){NET.retryT-=dt;if(NET.retryT<=0)netConnect();return;}
  if(NET.status!=='on')return;
  NET.hbT-=dt;if(NET.hbT<=0){NET.hbT=25;netSend({topic:'phoenix',event:'heartbeat',payload:{}});}
  if(!started||!player.sect)return;
  netSyncRoom();
  NET.helloT-=dt;if(NET.helloT<=0){NET.helloT=10;netHello();}
  NET.sendT-=dt;if(NET.sendT<=0){NET.sendT=0.35;const w=player.eq.weapon,a=player.eq.armor;
    netCast(NET.mapRoom,'pos',{id:NET.id,name:player.name,sect:player.sect,gender:player.gender,lv:player.lv,x:Math.round(player.x),y:Math.round(player.y),dir:player.dir,face:player.face,
      mv:player.moving?1:0,fl:player.flying?1:0,at:player.atkAnim>0?1:0,dead:player.dead?1:0,wr:w?w.rar:0,wt:w?w.tier:0,rf:wRef(),ar:a?a.rar:0,cs:player.combo||0,hf:Math.round(player.hp/stats().maxhp*100)/100,mh:stats().maxhp,df:stats().def,st:player.stunT>0?1:0,mt:player.riding?player.mount:0,pt:player.petOn&&player.pet?player.pet:0,ap:player.ap?[player.ap.h|0,player.ap.hc|0,player.ap.sk|0,player.ap.ey|0,player.ap.acc|0,player.ap.cl|0,player.ap.bd|0]:0,gm:typeof isGM==='function'&&isGM()?1:0});}
  for(const [k,o] of NET.others){if(nowT-o.seen>6){NET.others.delete(k);continue;}
    const dx=o.tx-o.x,dy=o.ty-o.y,d=Math.hypot(dx,dy);if(d>400){o.x=o.tx;o.y=o.ty;}else{const s=Math.min(1,dt*8);o.x+=dx*s;o.y+=dy*s;}o.atk=o.at?(o.atk>0?o.atk-dt:0.25):0;}
  for(const [k,o] of NET.world)if(nowT-o.seen>25)NET.world.delete(k);
  partyTick(dt);
  NET.cloudT-=dt;if(NET.cloudT<=0){NET.cloudT=60;cloudSave(true);}}
function drawOthers(list){if(!NET.others.size)return;
  for(const o of NET.others.values()){if(!o.look)continue;list.push({y:o.y,f:()=>{
    const fy=o.fl?-16-Math.sin(nowT*3)*3:0;drawShadow(o.x,o.y,o.fl?10:13,o.fl?0.18:0.3);
    if(o.dead){ctx.save();ctx.globalAlpha=0.5;}
    if(o.fl)drawFlySword(o.x,o.y+fy+1,o.dir==='side'?o.face:1,o.wv.type==='sword'?o.wv.col:'#bfe0ff',o.wv.glow||'#9fd3ff');
    const rM=o.mt&&typeof MOUNTS!=='undefined'&&MOUNTS[o.mt];let rdy=0;if(rM){drawSteed(o.mt,o.x,o.y,o.face||1,!!o.mv,o.x*0.01);rdy=rM.kind==='crane'?-40:-24;}
    drawChibi(o.look,o.x,o.y+fy+rdy,1,rM?'side':(o.dir||'down'),o.face||1,!!o.mv&&!o.fl&&!rM,o.atk||0,false,Object.assign({},o.wv,{style:o.cs||0}),o.x*0.01);
    if(o.dead)ctx.restore();
    const mate=isMate(o.id),foe=typeof DUEL!=='undefined'&&DUEL.state==='on'&&DUEL.id===o.id;
    if(foe&&player.target===DUEL.foe){ctx.strokeStyle='#ff4040';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(o.x,o.y,20,8,0,0,Math.PI*2);ctx.stroke();}
    label(`${o.gm?'[GM] ':''}${foe?'[Tỷ thí] ':mate?'[Đội] ':''}${o.name} · ${o.lv}`,o.x,o.y-68+fy+rdy,o.gm?'#ffd23f':foe?'#ff8a7a':mate?'#9fffb0':'#8fd8ff',11);
    if((mate||foe)&&o.hf!=null)hpBar(o.x,o.y-64+fy,34,o.hf,foe?'#e0402a':'#5fe07a');
    if(o.st)for(let k=0;k<3;k++){const a=nowT*5+k*2.1;label('★',o.x+Math.cos(a)*12,o.y-80+fy+Math.sin(a)*3,'#ffe27a',9);}}});}}
// ===================== BẢNG XẾP HẠNG & LƯU ĐÁM MÂY (cần chạy supabase/schema.sql) =====================
async function rpc(fn,args){const r=await fetch(NET.cfg.url.replace(/\/$/,'')+'/rest/v1/rpc/'+fn,{method:'POST',headers:{'Content-Type':'application/json',apikey:NET.cfg.key,Authorization:'Bearer '+NET.cfg.key},body:JSON.stringify(args)});
  if(!r.ok){NET.rpcOk=false;throw new Error('rpc '+r.status);}NET.rpcOk=true;const t=await r.text();return t?JSON.parse(t):null;}
async function cloudSave(silent){if(!netEnabled()||!player.sect)return false;netIdent();save();
  try{await rpc('tk_save',{p_id:NET.id,p_secret:NET.secret,p_name:player.name,p_sect:player.sect,p_lv:player.lv,p_exp:player.exp,p_data:JSON.parse(localStorage.getItem(SKEY))});
    if(!silent)log('Đã lưu nhân vật lên mạng','#8fd8ff');return true;}catch(e){if(!silent)log('Chưa lưu lên mạng được (máy chủ chưa bật bảng lưu trữ)','#ff9a8a');return false;}}
async function cloudLoad(code){if(!netEnabled())throw new Error('off');const m=String(code).trim().toUpperCase().match(/^([A-Z0-9]{8})-([A-Z0-9]{12})$/);if(!m)throw new Error('ma');
  const data=await rpc('tk_load',{p_id:m[1],p_secret:m[2]});if(!data)throw new Error('khong');
  localStorage.setItem('tk_net_id',m[1]);localStorage.setItem('tk_net_secret',m[2]);NET.id=m[1];NET.secret=m[2];localStorage.setItem(SKEY,JSON.stringify(data));return data;}
async function fetchTop(){return await rpc('tk_top',{});}

// ===================== TỔ ĐỘI (tối đa 5 người, đồng bộ qua kênh tk_world) =====================
// Đội trưởng giữ danh sách và phát lại mỗi 8 giây. Hồi máu, bùa và kinh nghiệm được gửi tới đồng đội cùng bản đồ ở gần.
const PARTY={leader:null,members:[],lastSet:0,st:new Map(),stT:0,setT:0};
const PARTY_MAX=5;
const inParty=()=>!!PARTY.leader;
const isLeader=()=>PARTY.leader===NET.id;
const isMate=id=>inParty()&&id!==NET.id&&PARTY.members.some(m=>m.id===id);
function partyReset(msg){const was=inParty();PARTY.leader=null;PARTY.members=[];PARTY.st.clear();if(was&&msg)log(msg,'#ffb36b');if(typeof renderParty==='function')renderParty();}
function partyBroadcastSet(){if(!isLeader())return;PARTY.setT=8;netCast('tk_world','pset',{id:NET.id,members:PARTY.members});if(typeof renderParty==='function')renderParty();}
function netInvite(o){if(NET.status!=='on'){log('Chưa kết nối mạng','#ff9a8a');return;}
  if(inParty()&&!isLeader()){log('Chỉ đội trưởng mới mời được người khác','#ffb36b');return;}
  if(inParty()&&PARTY.members.length>=PARTY_MAX){log('Tổ đội đã đủ 5 người','#ffb36b');return;}
  if(isMate(o.id))return;
  netCast('tk_world','pinv',{id:NET.id,name:player.name,lv:player.lv,sect:player.sect,to:o.id});log(`Đã gửi lời mời tổ đội tới ${o.name}`,'#9fffb0');}
function netLeaveParty(){if(!inParty())return;netCast('tk_world','pleave',{id:NET.id});partyReset('Bạn đã rời tổ đội');}
function partyOnMsg(ev,p){
  if(ev==='pinv'&&p.to===NET.id){
    if(inParty()){netCast('tk_world','pno',{id:NET.id,name:player.name,to:p.id,busy:1});return;}
    const S=SECTS[p.sect];sfx('quest');
    openDlg('Lời mời tổ đội',`<b style="color:#9fffb0">${esc(p.name)}</b> (cấp ${p.lv|0}${S?' · '+S.name:''}) mời bạn vào tổ đội.<br><br>Trong tổ đội: thấy máu của nhau, dược sư hồi máu được cho cả đội, và nhận thêm 30% kinh nghiệm khi đồng đội ở gần hạ quái.`,
      [{t:'Đồng ý',fn:()=>{netCast('tk_world','pacc',{id:NET.id,name:player.name,to:p.id});closeDlg();log('Đã đồng ý, đang vào tổ đội...','#9fffb0');}},
       {t:'Từ chối',gray:true,fn:()=>{netCast('tk_world','pno',{id:NET.id,name:player.name,to:p.id});closeDlg();}}]);return;}
  if(ev==='pno'&&p.to===NET.id){log(`${p.name} ${p.busy?'đang ở tổ đội khác':'đã từ chối lời mời'}`,'#ffb36b');return;}
  if(ev==='pacc'&&p.to===NET.id){
    if(!inParty()){PARTY.leader=NET.id;PARTY.members=[{id:NET.id,name:player.name}];}
    if(!isLeader()||PARTY.members.length>=PARTY_MAX)return;
    if(!PARTY.members.some(m=>m.id===p.id))PARTY.members.push({id:p.id,name:String(p.name).slice(0,14)});
    log(`${p.name} đã vào tổ đội`,'#9fffb0');partyBroadcastSet();return;}
  if(ev==='pset'){const mine=Array.isArray(p.members)&&p.members.some(m=>m.id===NET.id);
    if(mine){if(inParty()&&PARTY.leader!==p.id)return;
      const fresh=!inParty();PARTY.leader=p.id;PARTY.members=p.members.slice(0,PARTY_MAX).map(m=>({id:String(m.id),name:String(m.name).slice(0,14)}));PARTY.lastSet=Date.now();
      if(fresh){log('Đã vào tổ đội','#9fffb0');toast('Đã vào tổ đội','#9fffb0');}if(typeof renderParty==='function')renderParty();}
    else if(inParty()&&PARTY.leader===p.id&&!isLeader())partyReset('Bạn đã bị mời ra khỏi tổ đội');return;}
  if(!isMate(p.id))return;
  if(ev==='pleave'){const nm=(PARTY.members.find(m=>m.id===p.id)||{}).name||'';PARTY.members=PARTY.members.filter(m=>m.id!==p.id);PARTY.st.delete(p.id);log(`${nm} đã rời tổ đội`,'#ffb36b');
    if(PARTY.members.length<=1){partyReset('Tổ đội đã giải tán');return;}
    if(PARTY.leader===p.id)PARTY.leader=PARTY.members[0].id;if(isLeader())partyBroadcastSet();if(typeof renderParty==='function')renderParty();return;}
  if(ev==='pst'){PARTY.st.set(p.id,{name:p.name,lv:p.lv,hp:p.hp,map:p.map,sect:p.sect,dead:p.dead,seen:Date.now()});return;}
  if(ev==='pheal'&&Array.isArray(p.to)&&p.to.includes(NET.id)){recvHeal(+p.pct||0,p.hot||null,p.name);return;}
  if(ev==='pbuff'&&Array.isArray(p.to)&&p.to.includes(NET.id)&&p.buff){const b=p.buff;recvBuff({id:String(b.id),dur:+b.dur||5,defm:+b.defm||0,pct:+b.pct||0,icon:b.icon,col:b.col,name:String(b.name||'')},p.name);return;}
  if(ev==='pkill'&&p.map===curMapId&&!player.dead&&Math.hypot(player.x-p.x,player.y-p.y)<700){const e=Math.max(1,Math.round((+p.exp||0)*0.3));
    addText(player.x,player.y-74,'+'+e+' (tổ đội)','#c8f0a0',12);gainExp(e);}}
// đồng đội cùng bản đồ trong bán kính r quanh mình
function matesNear(r){if(!inParty())return[];const out=[];for(const o of NET.others.values())if(isMate(o.id)&&!o.dead&&Math.hypot(o.x-player.x,o.y-player.y)<=r)out.push(o);return out;}
function netPartyHeal(r,pct,hot){const ms=matesNear(r);if(!ms.length)return 0;netCast('tk_world','pheal',{id:NET.id,name:player.name,to:ms.map(o=>o.id),pct,hot});
  for(const o of ms){addParts(o.x,o.y-20,'#7dff9a',10,60);addText(o.x,o.y-60,'+Hồi máu','#7dff9a',12);}return ms.length;}
function netPartyBuff(r,b){const ms=matesNear(r);if(!ms.length)return 0;netCast('tk_world','pbuff',{id:NET.id,name:player.name,to:ms.map(o=>o.id),buff:b});
  for(const o of ms)addRing(o.x,o.y-20,40,b.col||'#c8f0a0',0.6);return ms.length;}
function netPartyLow(r,thr){return matesNear(r).filter(o=>o.hf!=null&&o.hf<thr).length;}
function netPartyKill(e,x,y){if(inParty()&&NET.status==='on')netCast('tk_world','pkill',{id:NET.id,exp:e,map:curMapId,x:Math.round(x),y:Math.round(y)});}
function partyTick(dt){if(!inParty())return;
  PARTY.stT-=dt;if(PARTY.stT<=0){PARTY.stT=2;const st=stats();netCast('tk_world','pst',{id:NET.id,name:player.name,lv:player.lv,hp:Math.round(player.hp/st.maxhp*100)/100,map:curMapId,sect:player.sect,dead:player.dead?1:0});}
  if(isLeader()){PARTY.setT-=dt;
    const gone=PARTY.members.filter(m=>m.id!==NET.id&&(!PARTY.st.has(m.id)?false:Date.now()-PARTY.st.get(m.id).seen>120000));
    if(gone.length){PARTY.members=PARTY.members.filter(m=>!gone.includes(m));for(const g of gone)log(`${g.name} mất kết nối, rời tổ đội`,'#ffb36b');
      if(PARTY.members.length<=1){partyReset('Tổ đội đã giải tán');return;}partyBroadcastSet();}
    if(PARTY.setT<=0)partyBroadcastSet();}
  else if(Date.now()-PARTY.lastSet>90000)partyReset('Mất liên lạc với đội trưởng, tổ đội đã giải tán');}
