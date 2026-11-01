'use strict';
// ===================== QUÁI DÙNG CHUNG TRÊN MỖI BẢN ĐỒ =====================
// Mọi máy cùng bản đồ sinh cùng một danh sách quái (cùng thứ tự, mỗi con có số m.i).
// "Chủ bãi" = người có mã online nhỏ nhất trong số người đang ở bản đồ: máy đó tính quái (di chuyển, hồi sinh)
// và gửi vị trí + máu + sống/chết 2 lần/giây. Ai đánh quái thì gửi sát thương đi để mọi máy cùng trừ máu.
// Người hạ gục trên máy mình mới nhận kinh nghiệm/đồ; quái chết do người khác đánh thì chỉ biến mất.
const MS={hitQ:{},hitT:0,posT:0,lastHostMsg:-99,hostId:null};
const mobById=i=>mobs.find(m=>m.i===i);
function mobHostId(){let h=NET.id;for(const o of NET.others.values())if(o.id&&o.id<h)h=o.id;return h;}
const mobIsHost=()=>NET.status!=='on'||!NET.others.size||mobHostId()===NET.id;
// có chủ bãi ở máy khác đang gửi dữ liệu (trong 3 giây gần đây)
function mobHostRemote(){return !mobIsHost()&&nowT-MS.lastHostMsg<3;}
function mobHitQ(i,v){if(NET.status!=='on'||!NET.others.size)return;MS.hitQ[i]=(MS.hitQ[i]||0)+v;}
function silentKill(m){if(m.dead)return;m.dead=true;m.fade=0.6;m.respawn=m.t.boss?90:12;m.hp=0;if(player.target===m){player.target=null;player.pend=null;}}
// quái do chủ bãi điều khiển: trôi dần tới vị trí chủ bãi gửi (trừ khi đang đuổi đánh chính mình)
function mobNetMove(m,dt){if(m.netX==null||!mobHostRemote())return false;if(m.state==='chase'&&dist(m,player)<(m.t.aggro||150)+60&&!player.dead)return false;
  if(m.freezeT>0||m.stunT>0)return false;const dx=m.netX-m.x,dy=m.netY-m.y,d=Math.hypot(dx,dy);
  if(d>200){m.x=m.netX;m.y=m.netY;}else if(d>1){const k=Math.min(1,dt*6);m.x+=dx*k;m.y+=dy*k;m.moving=d>4;if(Math.abs(dx)>1)m.face=dx>0?1:-1;}else m.moving=false;
  m.atkCd-=dt;m.atkAnim-=dt;m.hitFlash-=dt;if(m.state==='chase')m.state='idle';return true;}
function mobOnMsg(ev,p){if(p.map!==curMapId)return;
  if(ev==='mhit'){for(const [i,v] of p.h||[]){const m=mobById(i);if(!m||m.dead)continue;m.hp-=Math.max(0,+v||0);m.hitFlash=0.1;if(m.hp<=0)silentKill(m);}return;}
  if(ev==='mpos'){if(!(p.id<NET.id))return;MS.lastHostMsg=nowT;
    for(const [i,x,y,h,lv] of p.a||[]){const m=mobById(i);if(!m)continue;
      if(h<0){if(!m.dead)silentKill(m);continue;}
      if(m.dead){spawnMob(m);if(lv)m.lv=lv;m.x=x;m.y=y;m.hp=m.maxhp*h/1000;}
      else{const hp=m.maxhp*h/1000;if(hp<m.hp-1)m.hp=hp;}
      m.netX=x;m.netY=y;}}}
// mỗi khung hình (gọi từ netTick): gửi sát thương đã gom; chủ bãi gửi trạng thái quái
function mobSyncTick(dt){if(NET.status!=='on'||!NET.mapRoom||!started)return;
  MS.hitT-=dt;if(MS.hitT<=0){MS.hitT=0.2;const h=Object.entries(MS.hitQ).map(([i,v])=>[+i,Math.round(v)]);if(h.length){netCast(NET.mapRoom,'mhit',{id:NET.id,map:curMapId,h});MS.hitQ={};}}
  if(!NET.others.size||!mobIsHost())return;
  MS.posT-=dt;if(MS.posT<=0){MS.posT=0.5;
    netCast(NET.mapRoom,'mpos',{id:NET.id,map:curMapId,a:mobs.filter(m=>m.i!=null).map(m=>[m.i,Math.round(m.x),Math.round(m.y),m.dead?-1:Math.round(m.hp/m.maxhp*1000),m.lv])});}}
