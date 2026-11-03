'use strict';
// ===================== BANG HỘI =====================
// Lưu trên máy chủ (bảng tk_guilds). Lập bang (cấp 30, 200.000 lượng), vào bang, cống hiến lượng để lên cấp bang (tối đa 10),
// chat bang. Thành viên được thưởng theo cấp bang: +1% kinh nghiệm và +0,5% công lực mỗi cấp.
const GH={data:null,list:null,loading:false,t:0,chat:[],room:null};
const G_COST=200000,G_MINLV=30;
const gUser=()=>ACC.cur&&ACC.cur.server&&ACC.cur.token?ACC.cur:null;
const gErr=m=>({session:'Phiên đăng nhập đã hết hạn, hãy đăng xuất rồi đăng nhập lại',in_guild:'Bạn đã ở trong một bang',taken:'Tên bang đã có người dùng',bad_name:'Tên bang 2–16 ký tự',full:'Bang đã đủ người',
  no_guild:'Bang không còn tồn tại',not_leader:'Chỉ bang chủ làm được',self:'Không thể tự đuổi mình',bad_amount:'Số lượng không hợp lệ'})[m]||('Lỗi máy chủ: '+(m||'không rõ'));
const gLv=()=>player.guild&&player.guild.lv||0;
async function gRefresh(force){const u=gUser();if(!u||GH.loading)return;if(!force&&Date.now()-GH.t<20000)return;GH.loading=true;GH.t=Date.now();
  try{const r=await rpcx('tk_g_mine',{p_user:u.user});if(r.ok){GH.data=r.data||null;player.guild=GH.data?{id:GH.data.id,lv:GH.data.lv,name:GH.data.name}:null;gRoom();}}catch(e){}
  GH.loading=false;if(!$('panelHD').hidden&&HD.tab==='guild')renderHD();}
async function gLoadList(){const r=await rpcx('tk_g_list',{});GH.list=r.ok&&Array.isArray(r.data)?r.data:[];if(!$('panelHD').hidden&&HD.tab==='guild')renderHD();}
function gRoom(){const want=GH.data&&NET.status==='on'?'tk_guild_'+GH.data.id:null;if(want===GH.room)return;if(GH.room)netLeave(GH.room);GH.room=want;if(want)netJoin(want);}
setInterval(()=>{if(!started)return;if(NET.status!=='on')GH.room=null;gRoom();gRefresh(false);},5000);
async function gCall(fn,args,okMsg){const u=gUser();if(!u)return null;const r=await rpcx(fn,Object.assign({p_user:u.user,p_token:u.token},args));
  if(!r.ok){log(gErr(r.msg),'#ff9a8a');return null;}if(okMsg)log(okMsg,'#9fffb0');if(GH.room)netCast(GH.room,'xgu',{id:NET.id});return r;}
// thưởng theo cấp bang
const _statsG=stats;stats=function(){const s=_statsG();const l=gLv();if(l)s.atk=Math.round(s.atk*(1+l*0.005));return s;};
const _gainExpG=gainExp;gainExp=function(e){const l=gLv();return _gainExpG(l?Math.round(e*(1+l*0.01)):e);};
function guildOnMsg(ev,p,topic){if(!GH.data||topic!=='realtime:tk_guild_'+GH.data.id)return;
  if(ev==='xgc'){GH.chat.push({n:String(p.name||'').slice(0,14),t:String(p.text||'').slice(0,120)});GH.chat=GH.chat.slice(-40);if(!$('panelHD').hidden&&HD.tab==='guild')gChatShow();else log(`[Bang] ${p.name}: ${String(p.text||'').slice(0,60)}`,'#ffd77a');}
  else if(ev==='xgu')gRefresh(true);}
function gChatShow(){const el=$('gChatLog');if(!el)return;el.innerHTML=GH.chat.map(c=>`<div><b style="color:#ffd77a">${esc(c.n)}</b>: ${esc(c.t)}</div>`).join('')||'<div style="color:#888">Chưa có tin nhắn.</div>';el.scrollTop=1e6;}
function renderGuild(B){const u=gUser();
  if(!u){B.innerHTML='<div class="hdnote">Bang hội cần tài khoản lưu trên máy chủ và có mạng. Hãy đăng nhập bằng tài khoản máy chủ.</div>';return;}
  if(GH.data===null&&!GH.t){B.innerHTML='<div class="hdnote">Đang tải...</div>';gRefresh(true);return;}
  const g=GH.data;
  if(!g){if(!GH.list){GH.list=[];gLoadList();}
    let h=`<div class="hdnote">Bạn chưa vào bang nào. Thành viên được thêm <b>1% kinh nghiệm</b> và <b>0,5% công lực</b> cho mỗi cấp bang (tối đa cấp 10). Bang lên cấp nhờ thành viên cống hiến lượng.</div>
    <div class="hdrow"><div class="tx"><b>Lập bang mới</b> · cần cấp ${G_MINLV}, ${fmtN(G_COST)} lượng<br><input id="gName" maxlength="16" placeholder="Tên bang (2–16 ký tự)" style="margin-top:4px;width:95%;padding:5px;border-radius:6px;border:1px solid #6a5634;background:#1e1810;color:#ffe9b0"></div><button id="gCreate">Lập bang</button></div>
    <div style="color:#ffd77a;font-weight:bold;margin-top:8px">Các bang đang có</div>`;
    h+=GH.list.length?GH.list.map(x=>`<div class="hdrow"><div class="ic">🏯</div><div class="tx"><b>${esc(x.name)}</b> · cấp ${x.lv} · ${x.cnt}/${20+x.lv*3} người</div><button data-gj="${x.id}">Vào bang</button></div>`).join(''):'<div class="hdnote">Chưa có bang nào. Hãy là người lập bang đầu tiên!</div>';
    B.innerHTML=h;$('gName').onkeydown=e=>e.stopPropagation();
    $('gCreate').onclick=async()=>{const n=$('gName').value.trim();if(player.lv<G_MINLV)return log(`Cần đạt cấp ${G_MINLV}`,'#ff9a8a');if(player.gold<G_COST&&!isGM())return log('Không đủ lượng','#ff9a8a');
      const r=await gCall('tk_g_create',{p_name:n,p_cname:player.name},`Đã lập bang ${n}`);if(r){if(!isGM())player.gold-=G_COST;save();GH.t=0;gRefresh(true);}};
    B.querySelectorAll('[data-gj]').forEach(b=>b.onclick=async()=>{const r=await gCall('tk_g_join',{p_id:+b.dataset.gj,p_cname:player.name},'Đã vào bang');if(r){GH.t=0;gRefresh(true);}});return;}
  const lead=g.leader===u.user,mem=(g.members||[]).slice().sort((a,b)=>(b.c||0)-(a.c||0)),need=Math.pow(g.lv,2)*2000000,cur=g.exp;
  let h=`<div class="hdrow" style="border-color:#c9a227"><div class="ic">🏯</div><div class="tx"><b style="font-size:16px">${esc(g.name)}</b> · cấp ${g.lv}${g.lv>=10?' (tối đa)':''} · ${mem.length}/${20+g.lv*3} người<br>Thưởng: +${g.lv}% kinh nghiệm, +${(g.lv*0.5).toFixed(1)}% công lực
    ${g.lv<10?`<div class="hdbar"><i style="width:${Math.min(100,(cur-Math.pow(g.lv-1,2)*2000000)/(need-Math.pow(g.lv-1,2)*2000000)*100)}%"></i></div>Cống hiến: ${fmtN(cur)} / ${fmtN(need)}`:''}</div></div>
    <div class="hdrow"><div class="tx"><b>Thông báo bang</b><br>${g.notice?esc(g.notice):'<span style="color:#888">(trống)</span>'}${lead?'<br><input id="gNotice" maxlength="200" placeholder="Sửa thông báo..." style="margin-top:4px;width:95%;padding:5px;border-radius:6px;border:1px solid #6a5634;background:#1e1810;color:#ffe9b0">':''}</div>${lead?'<button id="gNoticeBtn">Lưu</button>':''}</div>
    <div class="hdrow"><div class="tx"><b>Cống hiến lượng</b> cho bang (lượng của bạn: ${fmtN(player.gold)})</div><span>${[10000,100000,1000000].map(v=>`<button data-gd="${v}">${fmtN(v)}</button>`).join(' ')}</span></div>
    <div style="color:#ffd77a;font-weight:bold;margin-top:8px">Thành viên</div>`;
  h+=mem.map((m,i)=>`<div class="hdrow" style="padding:5px 8px"><div class="tx">${i+1}. <b>${esc(m.n||m.u)}</b>${m.u===g.leader?' <span style="color:#ffd23f">★ Bang chủ</span>':''} · cống hiến ${fmtN(m.c||0)}</div>${lead&&m.u!==u.user?`<button data-gk="${esc(m.u)}">Mời ra</button>`:''}</div>`).join('');
  h+=`<div style="color:#ffd77a;font-weight:bold;margin-top:8px">Chat bang</div><div id="gChatLog" style="height:120px;overflow-y:auto;border:1px solid #4a3e2a;border-radius:8px;padding:6px;background:rgba(0,0,0,.35);font-size:13px"></div>
    <div style="display:flex;gap:6px;margin-top:4px"><input id="gChatIn" maxlength="120" placeholder="Nhắn cho cả bang..." style="flex:1;padding:6px;border-radius:6px;border:1px solid #6a5634;background:#1e1810;color:#ffe9b0"><button class="hdbtn" id="gChatGo">GHửi</button></div>
    <div style="margin-top:10px;text-align:right"><button class="hdbtn" id="gLeave">${lead&&mem.length===1?'Giải tán bang':'Rời bang'}</button></div>`;
  B.innerHTML=h;gChatShow();
  const send=()=>{const t=$('gChatIn').value.replace(/\s+/g,' ').trim().slice(0,120);if(!t)return;if(!GH.room||NET.status!=='on')return log('Chưa kết nối mạng','#ff9a8a');
    netCast(GH.room,'xgc',{id:NET.id,name:player.name,text:t});GH.chat.push({n:player.name,t});GH.chat=GH.chat.slice(-40);$('gChatIn').value='';gChatShow();};
  $('gChatGo').onclick=send;$('gChatIn').onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')send();};
  if($('gNotice')){$('gNotice').onkeydown=e=>e.stopPropagation();$('gNoticeBtn').onclick=async()=>{const r=await gCall('tk_g_notice',{p_text:$('gNotice').value},'Đã lưu thông báo bang');if(r){GH.data=r.data;renderHD();}};}
  B.querySelectorAll('[data-gd]').forEach(b=>b.onclick=async()=>{const v=+b.dataset.gd;if(player.gold<v)return log('Không đủ lượng','#ff9a8a');player.gold-=v;
    const r=await gCall('tk_g_donate',{p_amount:v,p_cname:player.name},`Đã cống hiến ${fmtN(v)} lượng cho bang`);if(!r){player.gold+=v;return;}const old=GH.data.lv;GH.data=r.data;player.guild={id:r.data.id,lv:r.data.lv,name:r.data.name};
    if(r.data.lv>old)toast(`Bang lên cấp ${r.data.lv}!`,'#ffd23f');if(typeof dailyAdd==='function')dailyAdd('don',1);sfx('coin');save();renderHD();});
  B.querySelectorAll('[data-gk]').forEach(b=>b.onclick=async()=>{const r=await gCall('tk_g_kick',{p_target:b.dataset.gk},'Đã mời thành viên ra khỏi bang');if(r){GH.data=r.data;renderHD();}});
  $('gLeave').onclick=async()=>{const r=await gCall('tk_g_leave',{},'Đã rời bang');if(r){GH.data=null;player.guild=null;GH.list=null;gRoom();save();renderHD();}};}
