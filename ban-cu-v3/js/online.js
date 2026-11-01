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
      const oo=NET.others.get(p.id);oo.look=buildLook(p.sect,p.gender,{armor:{rar:p.ar||0}});oo.wv=weaponVis({rar:p.wr||0,tier:p.wt||0},SECTS[p.sect].wtype,p.rf||0);}
    else if(ev==='bye')NET.others.delete(p.id);
    else if(ev==='hello'){NET.world.set(p.id,{name:p.name,lv:p.lv,map:p.map,seen:nowT});}
    else if(ev==='chat'){netAddChat(p.name,String(p.text||'').slice(0,120),p.lv);}};}
function netSyncRoom(){if(NET.status!=='on')return;const room='tk_map_'+curMapId;if(NET.mapRoom===room)return;
  if(NET.mapRoom){netCast(NET.mapRoom,'bye',{id:NET.id});netLeave(NET.mapRoom);}NET.others.clear();NET.mapRoom=room;netJoin(room);NET.sendT=0;}
function netHello(){if(!player.sect)return;netCast('tk_world','hello',{id:NET.id,name:player.name,lv:player.lv,map:curMapId});}
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
      mv:player.moving?1:0,fl:player.flying?1:0,at:player.atkAnim>0?1:0,dead:player.dead?1:0,wr:w?w.rar:0,wt:w?w.tier:0,rf:player.refine,ar:a?a.rar:0});}
  for(const [k,o] of NET.others){if(nowT-o.seen>6){NET.others.delete(k);continue;}
    const dx=o.tx-o.x,dy=o.ty-o.y,d=Math.hypot(dx,dy);if(d>400){o.x=o.tx;o.y=o.ty;}else{const s=Math.min(1,dt*8);o.x+=dx*s;o.y+=dy*s;}o.atk=o.at?(o.atk>0?o.atk-dt:0.25):0;}
  for(const [k,o] of NET.world)if(nowT-o.seen>25)NET.world.delete(k);
  NET.cloudT-=dt;if(NET.cloudT<=0){NET.cloudT=60;cloudSave(true);}}
function drawOthers(list){if(!NET.others.size)return;
  for(const o of NET.others.values()){if(!o.look)continue;list.push({y:o.y,f:()=>{
    const fy=o.fl?-16-Math.sin(nowT*3)*3:0;drawShadow(o.x,o.y,o.fl?10:13,o.fl?0.18:0.3);
    if(o.dead){ctx.save();ctx.globalAlpha=0.5;}
    if(o.fl)drawFlySword(o.x,o.y+fy+1,o.dir==='side'?o.face:1,o.wv.type==='sword'?o.wv.col:'#bfe0ff',o.wv.glow||'#9fd3ff');
    drawChibi(o.look,o.x,o.y+fy,1,o.dir||'down',o.face||1,!!o.mv&&!o.fl,o.atk||0,false,o.wv,o.x*0.01);
    if(o.dead)ctx.restore();
    label(`${o.name} · ${o.lv}`,o.x,o.y-68+fy,'#8fd8ff',11);}});}}
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
