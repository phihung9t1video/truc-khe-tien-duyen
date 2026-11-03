'use strict';
// ===================== TRẠNG THÁI =====================
const MAXLV=199;
// kinh nghiệm lên cấp: cấp càng cao càng gian nan (hệ số 1.4+(cấp/55)^1.35)
const expNeed=l=>Math.round(40*Math.pow(l,1.7)*(1+Math.pow(Math.max(0,l-12),1.8)/40)*(1.4+Math.pow(l/55,1.35)));
const emptyEq=()=>Object.fromEntries(EQ_KEYS.map(k=>[k,null]));
let uidN=1;
const player={sect:null};
let npcs=[];
const npcById=id=>npcs.find(n=>n.id===id);
const mobs=[],herbs=[],fx=[],shots=[],eshots=[],timers=[];
let TREES=[],HOUSES_D=[];
let auto=false,autoRest=false,autoT=0,marker=null,shakeT=0,started=false,nowT=0,fadeT=0,portalCd=0,lvWarnT=0;
let navGoal=null;
const cam={x:0,y:0};
let playerLook=null,playerW=null;
const wRef=()=>player.eq&&player.eq.weapon?player.eq.weapon.ref||0:0;
const hasBuff=id=>player.buffs.some(b=>b.id===id);
function refreshLook(){playerLook=buildLook(player.sect,player.gender,player.eq,player.ap);playerW=weaponVis(player.eq.weapon,SECTS[player.sect].wtype,wRef());}

function resetRuntime(){Object.assign(player,{path:[],target:null,npc:null,pend:null,gather:null,channel:0,atkCd:0,atkAnim:0,repath:0,moving:false,dead:false,
  combatT:0,cds:[0,0,0,0,0,0],potCd:0,hitFlash:0,dir:'down',face:1,buffs:[],flying:false,navFly:false,slowT:0,stunT:0});}
function newPlayer(name,gender,sect){
  Object.assign(player,{name,gender,sect,lv:1,exp:0,gold:30,hpPot:6,mpPot:6,inv:[],eq:emptyEq(),
    flyUnlocked:false,qi:0,qc:0,qNote:-1,kills:0,pvp:{w:0,l:0,d:0},friends:[],mount:null,mounts:[],mountOn:true,expBuffs:[],stash:[],autoSellRar:-1,luck:0,reviveC:0,ap:null,tp:0,pet:null,pets:[],petOn:true,petExp:{},cn:null,td:null,daily:null,guild:null,prof:null,map:'trukhe'});
  resetRuntime();
  player.eq.weapon=makeItem('weapon',0,0,SECTS[sect].wtype);
  player.eq.armor=makeItem('armor',0,0);
  refreshLook();
}

// ===================== BẢN ĐỒ =====================
function loadMap(id,px,py){
  partyAPI('duelOnMap');
  curMapId=id;CM=MAPS[id];TH=THEMES[CM.theme];player.map=id;
  genMap(CM);renderMap();
  seed=CM.gen.seed+7;TREES=[];
  for(let y=0;y<MH;y++)for(let x=0;x<MW;x++)if(getT(x,y)===TR)TREES.push({x:x*T+16+(srand()-0.5)*5,y:y*T+28,spr:TREE_SPR[(srand()*TREE_SPR.length)|0],ph:srand()*6});
  HOUSES_D=CM.gen.houses.map(([hx,hy])=>({x:hx*T,y:hy*T,base:(hy+3)*T-2}));
  npcs=CM.npcs.map(n=>Object.assign({},n,{x:n.x*T,y:n.y*T}));
  fx.length=0;shots.length=0;eshots.length=0;timers.length=0;
  initMobs();initHerbs();
  const r=revivePos();player.x=px!=null?px:r.x;player.y=py!=null?py:r.y;
  if(!canStand(player.x,player.y)){player.x=r.x;player.y=r.y;}
  player.path=[];player.target=null;player.npc=null;player.gather=null;player.pend=null;
  AU.mood=TH.music;portalCd=1.5;
  if(typeof onMapLoaded==='function')onMapLoaded();
}
function travel(p){
  fadeT=0.7;sfx('fly');const M=MAPS[p.to];
  loadMap(p.to,p.tx*T,p.ty*T);
  toast(`${M.name} · Cấp ${M.lvText}`,'#bfe8ff');log(`Đã tới ${M.name}`,'#bfe8ff');
  save();
  if(navGoal){const g=navGoal;navGoal=null;if(g.map!==curMapId||g.x!=null)setTimeout(()=>navTo(g.map,g.x,g.y,g.then),50);}
}
function routeNext(from,to){if(from===to)return null;const prev={},q=[from];prev[from]=null;
  while(q.length){const m=q.shift();if(m===to)break;for(const p of MAPS[m].portals)if(!(p.to in prev)){prev[p.to]={m,p};q.push(p.to);}}
  if(!(to in prev))return null;let cur=to,step=null;while(prev[cur]&&prev[cur].m!==from)cur=prev[cur].m;step=prev[cur];return step?step.p:null;}
function navTo(mapId,x,y,then){
  if(mapId===curMapId){if(x!=null){moveTo(x,y);if(player.flyUnlocked&&Math.hypot(player.x-x,player.y-y)>320){setFly(true);player.navFly=true;}}if(then)then();return true;}
  const p=routeNext(curMapId,mapId);if(!p)return false;
  if(player.lv<p.minLv){log(`Cần đạt cấp ${p.minLv} để qua Truyền Tống Trận tới ${MAPS[p.to].name}`,'#ffb36b');return false;}
  navGoal={map:mapId,x,y,then};moveTo(p.x*T,p.y*T);
  if(player.flyUnlocked&&Math.hypot(player.x-p.x*T,player.y-p.y*T)>320){setFly(true);player.navFly=true;}
  return true;}

// ===================== TRANG BỊ =====================
function makeItem(slot,tier,rar,wtype){tier=clamp(tier,0,MAXTIER);const m=RARITY[rar].m,base=SLOT_STATS[slot](tier),st={};
  for(const k in base)st[k]=Math.max(1,Math.round(base[k]*m));
  const pool=['crit','atk','hp','mp','def'];
  for(let i=0;i<RARITY[rar].b;i++){const k=pool[(Math.random()*pool.length)|0];
    const add={crit:rint(1,2)+Math.ceil(tier/3),atk:Math.ceil((tier+1)*rint(1,3)*0.8),hp:(tier+1)*rint(10,20),mp:(tier+1)*rint(8,15),def:Math.ceil((tier+1)*rint(1,2)*0.8)}[k];st[k]=(st[k]||0)+add;}
  const name=TIER_PRE[tier]+' '+(slot==='weapon'?SLOT_SUF[wtype]:SLOT_SUF[slot]);
  return{uid:uidN++,slot,tier,rar,wtype:slot==='weapon'?wtype:null,name,lvReq:TIER_LV[tier],price:Math.round((8+tier*24)*(1+rar*0.9)),st};
}
// đồ bộ (Trùng Lâu): một cấp duy nhất, Thần thoại bậc cao nhất, chỉ số x1,5, ai cũng mặc được, điểm thưởng theo số món đang mặc
function makeSetItem(slot,setId,wtype){const S=SETS[setId],wt=wtype||SECTS[player.sect].wtype,it=makeItem(slot,MAXTIER,RARITY.length-1,wt);for(const k in it.st)it.st[k]=Math.round(it.st[k]*1.5);
  it.set=setId;it.name=S.name+' '+S.suf[slot];it.lvReq=1;it.price*=5;return it;}
function makeGodWeapon(wtype){const wt=GODW[wtype]?wtype:SECTS[player.sect].wtype,it=makeItem('weapon',MAXTIER,RARITY.length-1,wt);for(const k in it.st)it.st[k]=Math.round(it.st[k]*1.8);
  it.god=1;it.name=GODW[wt];it.lvReq=1;it.price*=8;return it;}
// rơi đồ tối thượng từ trùm cuối
function dropUltimate(m,pSet,pGod){const S=SETS.trunglau;
  if(Math.random()<pSet){const it=makeSetItem(S.pieces[rint(0,S.pieces.length-1)],'trunglau');addItem(it);toast(`Rơi đồ ${S.name}: ${it.name}!`,S.col);log(`${m.t.name} để lại ${it.name}!`,S.col);}
  if(Math.random()<pGod){const it=makeGodWeapon();addItem(it);toast(`Rơi THẦN KHÍ: ${it.name}!`,GOD_COL);log(`${m.t.name} để lại Thần khí ${it.name}!`,GOD_COL);}}
const setCount=id=>EQ_KEYS.filter(k=>player.eq[k]&&player.eq[k].set===id).length;
function eqKeyFor(it){if(it.slot!=='ring')return it.slot;if(!player.eq.ring1)return'ring1';if(!player.eq.ring2)return'ring2';return itemScore(player.eq.ring1)<=itemScore(player.eq.ring2)?'ring1':'ring2';}
function itemScore(it){if(!it)return 0;const s=it.st;return(s.atk||0)*2+(s.def||0)*1.6+(s.hp||0)*0.12+(s.mp||0)*0.08+(s.crit||0)*3+(s.spd||0)*1.2;}
const wtypeOk=it=>it.slot!=='weapon'||!it.wtype||it.wtype===SECTS[player.sect].wtype;
function isUpgrade(it){return it.lvReq<=player.lv&&wtypeOk(it)&&itemScore(it)>itemScore(player.eq[eqKeyFor(it)]);}
let LOOT_TO=null; // danh sách người được chia đồ khi đang tổ đội
// tự bán: chỉ áp dụng cho đồ rơi/được chia (drop=true), không bán đồ mua ở cửa hàng hay phần thưởng nhiệm vụ
const autoSellHit=it=>player.autoSellRar>=0&&it.rar<=player.autoSellRar&&it.rar<RARITY.length-1&&!it.set&&!it.god&&!isUpgrade(it);
function addItem(it,silent,drop){
  if(LOOT_TO&&LOOT_TO.length>1){const r=LOOT_TO[rint(0,LOOT_TO.length-1)];if(r!==NET.id&&partyAPI('netSendLoot',r,it))return;}
  if(drop&&autoSellHit(it)){player.gold+=it.price;log(`Tự bán ${it.name} (${RARITY[it.rar].n}) được ${it.price} lượng`,'#ffd977');return false;}
  if(player.inv.length>=BAG_MAX){let wi=-1,ws=Infinity;player.inv.forEach((x,i)=>{const s=itemScore(x)*(1+x.rar)+(isUpgrade(x)?1e6:0);if(s<ws){ws=s;wi=i;}});
    if(wi<0||itemScore(it)*(1+it.rar)+(isUpgrade(it)?1e6:0)<=ws){player.gold+=it.price;log(`Túi đầy, tự bán ${it.name} được ${it.price} lượng`,'#ffd977');return;}
    const old=player.inv.splice(wi,1)[0];player.gold+=old.price;log(`Túi đầy, tự bán ${old.name} để lấy chỗ`,'#ffd977');}
  player.inv.push(it);
  if(!silent){log(`Nhận được [${it.name}] (${RARITY[it.rar].n})`,RARITY[it.rar].c);if(it.rar>=2)toast(`Nhận được ${it.name}`,RARITY[it.rar].c);sfx('pick');}
  if(auto&&isUpgrade(it))equipItem(it.uid);
  if(typeof refreshPanels==='function')refreshPanels();
}
function equipItem(uid){const i=player.inv.findIndex(x=>x.uid===uid);if(i<0)return;const it=player.inv[i];
  if(it.lvReq>player.lv){log(`Cần đạt cấp ${it.lvReq} mới dùng được ${it.name}`,'#ff9a8a');return;}
  if(!wtypeOk(it)){log(`${it.name} không phải binh khí của ${SECTS[player.sect].name}`,'#ff9a8a');return;}
  const key=eqKeyFor(it),old=player.eq[key];player.inv.splice(i,1);
  if(old&&(old.ref||0)>(it.ref||0)){const r=old.ref;old.ref=it.ref||0;it.ref=r;log(`Chuyển cường hóa +${r} từ ${old.name} sang ${it.name}`,'#ffd23f');}
  if(old)player.inv.push(old);player.eq[key]=it;
  const st=stats();player.hp=Math.min(player.hp,st.maxhp);player.mp=Math.min(player.mp,st.maxmp);
  refreshLook();sfx('equip');log(`Đã trang bị ${it.name}`,RARITY[it.rar].c);refreshPanels();save();}
// cường hóa một món đồ (đang mặc hoặc trong túi)
function findItem(uid){for(const k of EQ_KEYS)if(player.eq[k]&&player.eq[k].uid===uid)return player.eq[k];return player.inv.find(x=>x.uid===uid)||null;}
function refineItem(uid,silent){const it=findItem(uid);if(!it)return null;const r=it.ref||0;if(r>=REF_MAX)return null;const cost=refCost(it);
  if(player.gold<cost){if(!silent)log('Không đủ lượng để cường hóa','#ff9a8a');return null;}player.gold-=cost;
  const luck=player.luck>0?20:0;if(luck){player.luck--;if(!silent)log('Dùng 1 May Mắn Phù: +20% tỉ lệ thành công','#9fffb0');}
  const ok=Math.random()*100<refRate(r)+luck;if(ok){it.ref=r+1;if(it.slot==='weapon')refreshLook();}
  if(!silent){if(ok){addParts(player.x,player.y-20,'#ffb340',24,130);sfx('level');toast(`${it.name} cường hóa thành công +${it.ref}`,'#ffd23f');}else{sfx('hurt');log(`Cường hóa ${it.name} thất bại, chỉ mất ${cost.toLocaleString('vi-VN')} lượng`,'#ff9a8a');}save();}
  return ok;}
function unequip(slot){const it=player.eq[slot];if(!it)return;if(player.inv.length>=BAG_MAX){log('Túi đồ đã đầy','#ff9a8a');return;}
  player.eq[slot]=null;player.inv.push(it);const st=stats();player.hp=Math.min(player.hp,st.maxhp);player.mp=Math.min(player.mp,st.maxmp);refreshLook();sfx('equip');refreshPanels();}
function sellItem(uid){const i=player.inv.findIndex(x=>x.uid===uid);if(i<0)return;const it=player.inv[i];player.inv.splice(i,1);player.gold+=it.price;sfx('coin');log(`Bán ${it.name} được ${it.price} lượng`,'#ffd977');refreshPanels();}
function sellJunk(){let n=0,g=0;player.inv=player.inv.filter(it=>{if(it.rar<=1&&!isUpgrade(it)){n++;g+=it.price;return false;}return true;});
  if(n){player.gold+=g;sfx('coin');log(`Đã bán ${n} món đồ, thu ${g} lượng`,'#ffd977');}else log('Không có đồ Thường/Tinh xảo nào để bán','#ccc');refreshPanels();}
function autoEquip(){for(const it of [...player.inv])if(isUpgrade(it))equipItem(it.uid);}
function rollLoot(m){const t=m.t,w=SECTS[player.sect].wtype;
  if(m.type==='hondon')dropUltimate(m,0.12,0.03);if(m.type==='hn_de')dropUltimate(m,0.2,0.06);
  if(t.boss){for(let k=0;k<2;k++)addItem(makeItem(SLOTS[rint(0,SLOTS.length-1)],t.tier,t.tier>=10&&Math.random()<0.15?4:Math.random()<0.4?3:2,w),false,true);return;}
  if(Math.random()>t.loot)return;
  const r=Math.random(),rar=t.tier>=10&&r<0.002?4:r<0.02?3:r<0.12?2:r<0.4?1:0;
  addItem(makeItem(SLOTS[rint(0,SLOTS.length-1)],t.tier,rar,w),false,true);}

// ===================== CHỈ SỐ =====================
function stats(){const S=SECTS[player.sect].base,l=player.lv;
  const s={maxhp:S.hp+S.hpL*l,maxmp:S.mp+S.mpL*l,atk:S.atk+S.atkL*l,def:S.def+S.defL*l,crit:0.05+(SECTS[player.sect].crit||0),spd:0};
  for(const k of EQ_KEYS){const it=player.eq[k];if(!it)continue;const st=it.st,rb=refBonus(it);s.maxhp+=(st.hp||0)+(rb.hp||0);s.maxmp+=(st.mp||0)+(rb.mp||0);s.atk+=(st.atk||0)+(rb.atk||0);s.def+=(st.def||0)+(rb.def||0);s.crit+=(st.crit||0)/100;s.spd+=(st.spd||0)/100;}
  for(const b of player.buffs){if(b.atk)s.atk*=1+b.atk;if(b.defm)s.def*=1+b.defm;if(b.crit)s.crit+=b.crit;}
  if(typeof SETS!=='undefined')for(const id in SETS){const n=setCount(id),B=SETS[id].bonus;for(const c in B)if(n>=+c){const b=B[c];if(b.atk)s.atk*=1+b.atk;if(b.hp)s.maxhp*=1+b.hp;if(b.def)s.def*=1+b.def;if(b.crit)s.crit+=b.crit;}}
  const MT_=player.mount&&typeof MOUNTS!=='undefined'?MOUNTS[player.mount]:null;if(MT_){s.maxhp*=1+MT_.hp;s.def*=1+MT_.def;}
  s.maxhp=Math.round(s.maxhp);s.maxmp=Math.round(s.maxmp);s.atk=Math.round(s.atk);s.def=Math.round(s.def);
  s.move=150*(1+s.spd)*(player.flying?1.7:player.riding&&MT_?1+MT_.spd:1)*(player.slowT>0?0.6:1);return s;}

// ===================== HIỆU ỨNG =====================
function addText(x,y,txt,col,size=14,serif){fx.push({k:'t',x:x+rnd(-6,6),y,txt,col,size,t:0,life:1.1,serif});}
function addRing(x,y,r,col,life=0.4,w){fx.push({k:'r',x,y,r,col,t:0,life,w});}
function addSlash(x,y,face,col){fx.push({k:'s',x,y,face,col,t:0,life:0.22});}
function addParts(x,y,col,n=8,sp=90,sz){for(let i=0;i<n;i++)fx.push({k:'p',x,y,vx:rnd(-1,1)*sp,vy:rnd(-1,1)*sp-40,col,t:0,life:rnd(.3,.75),sz:sz||rnd(1.5,2.6),g:1});}

// ===================== QUÁI =====================
function spawnMob(m){const t=m.t,z=CM.zones[m.type];const lv=rint(t.lv[0],t.lv[1]),k=lv-t.lv[0];
  m.lv=lv;m.maxhp=Math.round(t.hp*(1+0.18*k));m.hp=m.maxhp;m.atk=Math.round(t.atk*(1+0.1*k));m.armor=Math.round(t.def*(1+0.1*k));m.spd=t.spd;
  const s=freeSpot(z.x,z.y,z.r);m.x=m.hx=s.x;m.y=m.hy=s.y;
  Object.assign(m,{dead:false,fade:0,state:'idle',path:[],atkCd:rnd(0,1),atkAnim:0,wanderT:rnd(1,4),repath:0,slamCd:5,slamT:0,fireCd:4,hitFlash:0,face:Math.random()<.5?1:-1,dir:'side',
    freezeT:0,stunT:0,markT:0,markAmt:0,slowT:0,slowAmt:0,burnT:0,burnTick:0,burnDmg:0,burnKind:'fire',enraged:false,summoned:false});}
function initMobs(){mobs.length=0;for(const k in CM.zones)for(let i=0;i<CM.zones[k].n;i++){const m={type:k,t:MT[k]};spawnMob(m);m.i=mobs.length;mobs.push(m);}}
function initHerbs(){herbs.length=0;for(const z of CM.herbs.zones)for(let i=0;i<z.n;i++){const s=freeSpot(z.x,z.y,z.r);herbs.push({x:s.x+rnd(-8,8),y:s.y+rnd(-6,6),dead:false,respawn:0});}}
function summonAdd(boss){const type=boss.t.add,m={type,t:MT[type]};const z=CM.zones[type];spawnMob(m);const a=rnd(0,7);m.x=boss.x+Math.cos(a)*60;m.y=boss.y+Math.sin(a)*40;
  if(!canStand(m.x,m.y)){m.x=boss.x;m.y=boss.y;}m.hx=boss.hx;m.hy=boss.hy;m.lv=boss.lv-2;m.maxhp=m.hp=Math.round(m.t.hp*1.2);m.atk=Math.round(m.t.atk*1.15);m.summoned=true;m.state='chase';mobs.push(m);
  addParts(m.x,m.y-20,'#6a2a2a',14,90);addRing(m.x,m.y,40,'#ff5030',0.5);}
function nearestMob(r){let b=null,bd=r;for(const m of mobs){if(m.dead)continue;const d=dist(m,player);if(d<bd){bd=d;b=m;}}return b;}

// ===================== CHIẾN ĐẤU =====================
function dmgCalc(atk,def,mult=1,crit=0.08){let v=atk*mult*rnd(0.9,1.1)-def*0.5;v=Math.max(1,v);const c=Math.random()<crit;if(c)v*=1.8;return{v:Math.round(v),crit:c};}
function hurtMob(m,r){if(m.dead)return;const em=elMul(SECTS[player.sect].el,m.t.el);let v=Math.max(1,Math.round(r.v*em*(m.markT>0?1+m.markAmt:1)));
  if(m.isFoe){partyAPI('pvpSendHit',m,v,r.crit);return;}
  m.hp-=v;m.hitFlash=0.12;player.combatT=5;if(m.i!=null)partyAPI('mobHitQ',m.i,v);
  addText(m.x,m.y-m.t.hh-6,(r.crit?'Bạo kích ':'')+v+(em>1?' ▲':em<1?' ▼':''),r.crit?'#ffd23f':em>1?'#ffe9a0':'#ffffff',r.crit?19:14);
  sfx(r.crit?'crit':'hit');if(r.crit)shakeT=Math.max(shakeT,0.08);
  if(m.state!=='chase'&&!inSafe(player))m.state='chase';
  if(m.t.elite)for(const o of mobs)if(o!==m&&!o.dead&&o.type===m.type&&o.state==='idle'&&dist(o,m)<150)o.state='chase';
  if(m.t.draw==='human'&&!m.t.boss&&!m.t.noChain)for(const o of mobs)if(o!==m&&!o.dead&&o.type===m.type&&o.state==='idle'&&dist(o,m)<150)o.state='chase';
  if(m.t.boss&&!m.enraged&&m.hp<m.maxhp*0.5){m.enraged=true;m.atk=Math.round(m.atk*1.25);m.spd*=1.2;toast(`${m.t.name} nổi giận!`,'#ff6a5a');log(`${m.t.name} nổi giận, gọi đồng bọn tới!`,'#ff6a5a');
    shakeT=0.4;sfx('slam');summonAdd(m);summonAdd(m);}
  if(m.hp<=0)killMob(m);}
function killMob(m){m.dead=true;m.fade=0.6;m.respawn=m.t.boss?90:12;player.kills++;
  addParts(m.x,m.y-14,m.t.boss?'#c0392b':'#ffffff',m.t.boss?34:12,120);
  let e=Math.round(m.t.exp*(1+0.2*(m.lv-m.t.lv[0])));const diff=player.lv-m.lv;
  if(diff>=6)e=Math.max(1,Math.round(e*0.2));else if(diff>=4)e=Math.round(e*0.6);
  if(m.summoned)e=Math.round(e*0.5);
  const g=rint(m.t.gold[0],m.t.gold[1]);
  const share=partyAPI('partyShareIds',m.x,m.y)||[],n=share.length>1?share.length:1;
  if(n>1){e=Math.max(1,Math.round(e*(1+0.15*(n-1))/n));}const gs=Math.round(g/n*(typeof tdExpMul==='function'?tdExpMul():1));player.gold+=gs;
  addText(player.x,player.y-62,'+'+e+' kinh nghiệm'+(n>1?' (chia '+n+')':''),'#ffe27a',13);
  if(Math.random()<m.t.hpP){const n=m.t.boss?5:1;player.hpPot+=n;log(`Nhặt được ${n} Kim Sang Dược`,'#ff9a8a');}
  if(Math.random()<m.t.mpP){const n=m.t.boss?5:1;player.mpPot+=n;log(`Nhặt được ${n} Ngưng Thần Đan`,'#8ac4ff');}
  if(!m.summoned){LOOT_TO=n>1?share:null;try{rollLoot(m);}finally{LOOT_TO=null;}if(typeof tlOnKill==='function')tlOnKill(m);}
  if(m.t.boss){toast(`Đã hạ gục ${m.t.name}!`,'#ffd23f');shakeT=0.6;for(const o of mobs)if(o.summoned&&!o.dead){o.dead=true;o.fade=0.6;}}
  qOnKill(m);
  if(player.target===m){player.target=null;player.pend=null;}
  if(n>1)partyAPI('netPartyKill',e,gs,m);partyAPI('petOnKill',m);
  gainExp(e);}
// nhân kinh nghiệm: ăn thêm viên thì CỘNG DỒN THỜI GIAN (Song bội x2, Tam bội x3). Đang có Tam bội thì dùng Tam bội trước, giờ Song bội để dành.
const expTime=m=>(player.expBuffs||[]).filter(b=>b.m===m).reduce((a,b)=>a+Math.max(0,b.t),0);
const expMul=()=>expTime(2)>0?3:expTime(1)>0?2:1;
function addExpBuff(m,t){const L=player.expBuffs=(player.expBuffs||[]).filter(b=>b.t>0);const e=L.find(b=>b.m===m);if(e)e.t+=t;else L.push({m,t});
  toast(`${m===2?'Tam':'Song'} bội kinh nghiệm: còn ${Math.ceil(expTime(m)/60)} phút`,'#ffe27a');}
function gainExp(e){if(player.lv>=MAXLV)return;e=Math.round(e*expMul());player.exp+=e;
  while(player.lv<MAXLV&&player.exp>=expNeed(player.lv)){player.exp-=expNeed(player.lv);player.lv++;const st=stats();player.hp=st.maxhp;player.mp=st.maxmp;
    fx.push({k:'beam',x:player.x,y:player.y,t:0,life:1.2,col:'rgba(255,230,140,.9)'});addRing(player.x,player.y-20,80,'#ffe27a',0.9);addParts(player.x,player.y-20,'#ffe27a',30,150);
    addText(player.x,player.y-80,'ĐỘT PHÁ CẤP '+player.lv,'#ffe27a',22,true);toast(`Đột phá! Đạt cấp ${player.lv}`);sfx('level');
    log(`Lên cấp ${player.lv}! Sinh lực, nội lực, công lực đều tăng.`,'#ffe27a');
    skillList().forEach(s=>{if(s.lv===player.lv){toast(`Lĩnh ngộ: ${s.name}`,'#9fd3ff');log(`Lĩnh ngộ võ công mới: ${s.name}!`,'#9fd3ff');}});
    for(const id in MAPS){const M=MAPS[id];if(M.minLv===player.lv&&player.lv>1)log(`Đã đủ cấp tới ${M.name}! Mở Bản đồ (phím M) để xem đường đi.`,'#bfe8ff');}
    afterProgress();}
  if(player.lv>=MAXLV)player.exp=0;}
function healPlayer(h){if(player.dead)return;const st=stats();player.hp=Math.min(st.maxhp,player.hp+h);addText(player.x,player.y-66,'+'+h,'#7dff9a',15);}
// nhận hồi máu / bùa từ đồng đội (qua mạng) hoặc từ chính mình
function recvHeal(pct,hot,from){if(player.dead)return;const st=stats();healPlayer(Math.round(st.maxhp*pct));addParts(player.x,player.y-20,'#7dff9a',12,70);
  if(hot)addBuff({id:'hot',t:hot.dur,max:hot.dur,pct:hot.pct,icon:'✚',col:'#7dff9a',name:'Hồi Xuân'+(from?' ('+from+')':'')});}
function recvBuff(b,from){if(player.dead||!b)return;addBuff(Object.assign({},b,{t:b.dur,max:b.dur,name:b.name+(from?' ('+from+')':'')}));addRing(player.x,player.y-20,50,b.col||'#c8f0a0',0.6);}
function hurtPlayer(r,src){if(player.dead)return;
  for(const b of player.buffs)if(b.dodge&&Math.random()<b.dodge){addText(player.x,player.y-58,'Né','#d8c8ff',14);return;}
  let v=r.v*elMul(src&&src.el,SECTS[player.sect].el);for(const b of player.buffs)if(b.dr)v=v*(1-b.dr);v=Math.max(1,Math.round(v));
  if(src&&src.m&&!src.m.dead)for(const b of player.buffs)if(b.reflect){const rv=Math.max(1,Math.round(r.v*b.reflect));hurtMob(src.m,{v:rv,crit:false});}
  player.hp-=v;player.combatT=5;player.hitFlash=0.12;sfx('hurt');
  addText(player.x,player.y-58,'-'+v,r.crit?'#ff3b3b':'#ff8a7a',r.crit?18:14);
  if(player.hp<=0){player.hp=0;die();}}
function die(){
  if(player.reviveC>0&&!(typeof inDuel==='function'&&inDuel())){player.reviveC--;const st=stats();player.hp=st.maxhp;player.mp=st.maxmp;addRing(player.x,player.y-20,80,'#ffe27a',0.9);fx.push({k:'beam',x:player.x,y:player.y,t:0,life:1.2,col:'rgba(255,230,140,.9)'});toast('Cửu Chuyển Hoàn Hồn Đan: sống lại tại chỗ','#ffe27a');log(`Dùng Hoàn Hồn Đan, sống lại không mất kinh nghiệm (còn ${player.reviveC})`,'#ffe27a');sfx('level');return;}
  partyAPI('duelOnDeath');player.dead=true;player.path=[];player.target=null;player.npc=null;player.pend=null;player.gather=null;player.flying=false;auto=false;autoRest=false;navGoal=null;
  const loss=Math.floor(player.exp*0.1);player.exp-=loss;sfx('die');
  $('deadTxt').textContent=`Bị mất ${loss} kinh nghiệm. Hãy về ${CM.safeName} dưỡng thương rồi quay lại.`;$('dead').hidden=false;
  for(const m of mobs)if(m.state==='chase')m.state='return';}
function revive(){const st=stats(),r=revivePos();player.dead=false;player.x=r.x;player.y=r.y;player.hp=st.maxhp;player.mp=st.maxmp;player.buffs=[];player.slowT=0;$('dead').hidden=true;save();}
function addBuff(b){player.buffs=player.buffs.filter(x=>x.id!==b.id);player.buffs.push(b);}
const partyAPI=(fn,...a)=>typeof window[fn]==='function'?window[fn](...a):0;
function setFly(v){if(v&&!player.flyUnlocked){log('Chưa học Ngự Kiếm Phi Hành (nhận từ nhiệm vụ Trưởng Làng)','#ffb36b');return;}
  if(player.flying===v)return;player.flying=v;sfx('fly');addParts(player.x,player.y-6,'#cfeaff',14,80);if(!v)player.navFly=false;}

// ===================== VÕ CÔNG =====================
function skillList(){return SECTS[player.sect].skills.map(id=>SKILLS[id]);}
const needsTarget=sk=>['proj','aoeTarget','rain','wave','phoenix','quake','dash','multi'].includes(sk.kind);
function trySkill(i){if(!started||player.dead)return;const sk=skillList()[i];if(!sk)return;
  if(player.lv<sk.lv){log(`${sk.name} cần đạt cấp ${sk.lv}`,'#ffb36b');return;}
  if(player.cds[i]>0)return;
  if(player.mp<sk.mp){log('Không đủ nội lực','#8ac4ff');return;}
  if(needsTarget(sk)){
    if(!player.target||player.target.dead){const n=nearestMob(sk.range+60);if(n)player.target=n;else{log('Không có mục tiêu trong tầm','#ffb36b');return;}}
    if(dist(player,player.target)>sk.range){player.pend=i;player.repath=0;return;}}
  castSkill(i);}
function castSkill(i){const sk=skillList()[i],st=stats(),tg=player.target;
  player.mp-=sk.mp;player.cds[i]=sk.cd;player.pend=null;if(player.flying)setFly(false);
  if(tg&&!tg.dead){player.face=tg.x>=player.x?1:-1;player.dir='side';}player.atkAnim=0.25;player.combo=(i+1)%3;
  switch(sk.kind){
    case 'aoeSelf':{fx.push({k:'spin',x:player.x,y:player.y-14,r:sk.r,t:0,life:0.45,col:sk.col});addRing(player.x,player.y-4,sk.r,sk.col,0.45);
      if(sk.freeze){fx.push({k:'ice',x:player.x,y:player.y,r:sk.r,t:0,life:1});sfx('ice');}else sfx('swing');
      for(const m of mobs){if(m.dead||dist(m,player)>sk.r)continue;hurtMob(m,dmgCalc(st.atk,m.armor,sk.mult,st.crit));if(sk.freeze&&!m.dead)m.freezeT=m.t.boss?sk.freeze*0.4:sk.freeze;if(sk.stun&&!m.dead)m.stunT=m.t.boss?sk.stun*0.4:sk.stun;if(!player.target&&!m.dead&&!(auto&&soloAvoid(m.t)))player.target=m;}
      if(sk.stun){fx.push({k:'quake',x:player.x,y:player.y,r:sk.r,t:0,life:0.6});shakeT=Math.max(shakeT,0.18);}break;}
    case 'wave':{const a=Math.atan2(tg.y-player.y,tg.x-player.x);shots.push({kind:'wave',x:player.x,y:player.y-18,vx:Math.cos(a),vy:Math.sin(a),spd:540,mult:sk.mult,pierce:true,hit:new Set(),travel:0,max:sk.range+40,r:28,ang:a});sfx('swing');break;}
    case 'proj':{shots.push({kind:sk.fx,x:player.x+player.face*10,y:player.y-24,tg,spd:500,mult:sk.mult,slow:sk.slow,poison:sk.poison,mark:sk.mark});sfx(sk.fx==='ice'?'ice':sk.fx==='fire'?'fire':'cast');break;}
    case 'aoeTarget':{const X=tg.x,Y=tg.y;fx.push({k:'fire',x:X,y:Y,r:sk.r,t:0,life:1.4});sfx('fire');shakeT=Math.max(shakeT,0.15);
      for(const m of mobs){if(m.dead||Math.hypot(m.x-X,m.y-Y)>sk.r)continue;hurtMob(m,dmgCalc(st.atk,m.armor,sk.mult,st.crit));if(!m.dead&&sk.burn){m.burnT=sk.burn.dur;m.burnKind='fire';m.burnDmg=Math.max(1,Math.round(st.atk*sk.burn.mult));}}break;}
    case 'rain':{const X=tg.x,Y=tg.y;sfx('fly');addRing(X,Y,sk.r,'#dff4ff',1.4,2);
      for(let k=0;k<sk.hits;k++)timers.push({t:0.1+k*0.16,fn:()=>{const a=rnd(0,Math.PI*2),r=rnd(0,sk.r*0.6),px=X+Math.cos(a)*r,py=Y+Math.sin(a)*r*0.6;fx.push({k:'sword',x:px,y:py,t:0,life:0.9});
        timers.push({t:0.22,fn:()=>{sfx('hit');addParts(px,py,'#dff4ff',8,100);shakeT=Math.max(shakeT,0.06);const s2=stats();for(const m of mobs){if(m.dead||Math.hypot(m.x-px,m.y-py)>sk.r*0.75)continue;hurtMob(m,dmgCalc(s2.atk,m.armor,sk.mult,s2.crit));}}});}});
      break;}
    case 'phoenix':{const a=Math.atan2(tg.y-player.y,tg.x-player.x);shots.push({kind:'phoenix',x:player.x,y:player.y-22,vx:Math.cos(a),vy:Math.sin(a),spd:430,mult:sk.mult,pierce:true,hit:new Set(),travel:0,max:sk.range+90,r:36,ang:a});sfx('fire');shakeT=Math.max(shakeT,0.2);break;}
    case 'buff':{addBuff(Object.assign({},sk.buff,{t:sk.buff.dur,max:sk.buff.dur,icon:sk.icon,col:sk.col,name:sk.name}));addRing(player.x,player.y-20,60,sk.col,0.6);fx.push({k:'beam',x:player.x,y:player.y,t:0,life:0.8,col:sk.col});sfx('heal');break;}
    case 'heal':{healPlayer(Math.round(st.maxhp*sk.pct));if(sk.hot)addBuff({id:'hot',t:sk.hot.dur,max:sk.hot.dur,pct:sk.hot.pct,icon:'✚',col:'#7dff9a',name:'Hồi Xuân'});
      addParts(player.x,player.y-20,'#7dff9a',18,80);addRing(player.x,player.y-10,55,'#7dff9a',0.6);sfx('heal');break;}
    case 'groupHeal':{const n=partyAPI('netPartyHeal',sk.r,sk.pct,sk.hot);recvHeal(sk.pct,sk.hot);fx.push({k:'heal',x:player.x,y:player.y,r:sk.r*0.5,t:0,life:0.9});sfx('heal');
      if(n)log(`${sk.name}: hồi máu cho bạn và ${n} đồng đội`,'#7dff9a');break;}
    case 'groupBuff':{const b=Object.assign({},sk.buff,{icon:sk.icon,col:sk.col,name:sk.name});const n=partyAPI('netPartyBuff',sk.r,b);recvBuff(b);fx.push({k:'heal',x:player.x,y:player.y,r:sk.r*0.5,t:0,life:0.9,col:'#c8f0a0'});sfx('heal');
      if(n)log(`${sk.name}: bảo hộ bạn và ${n} đồng đội`,'#c8f0a0');break;}
    case 'field':{fx.push({k:'field',follow:true,x:player.x,y:player.y,r:sk.r,t:0,life:sk.dur});sfx('heal');
      for(let k=0;k<sk.dur;k++)timers.push({t:0.2+k,fn:()=>{if(player.dead)return;const s2=stats();recvHeal(sk.healPct);partyAPI('netPartyHeal',360,sk.healPct,null);
        for(const m of mobs){if(m.dead||dist(m,player)>sk.r)continue;hurtMob(m,dmgCalc(s2.atk,m.armor,sk.mult,s2.crit));if(!m.dead){m.slowT=1.5;m.slowAmt=0.4;}}}});break;}
    case 'taunt':{let n=0;for(const m of mobs){if(m.dead||dist(m,player)>sk.r)continue;m.state='chase';m.path=[];n++;}
      addBuff(Object.assign({},sk.buff,{t:sk.buff.dur,max:sk.buff.dur,icon:sk.icon,col:sk.col,name:sk.name}));addRing(player.x,player.y-10,sk.r,sk.col,0.7,4);addRing(player.x,player.y-10,sk.r*0.6,'#fff0c0',0.5,3);
      shakeT=Math.max(shakeT,0.2);sfx('slam');if(n)addText(player.x,player.y-84,'Khiêu khích '+n,'#ffd27a',13);break;}
    case 'quake':{const X=tg.x,Y=tg.y;fx.push({k:'rock',x:X,y:Y,t:0,life:0.5});sfx('fly');
      timers.push({t:0.42,fn:()=>{const s2=stats();fx.push({k:'quake',x:X,y:Y,r:sk.r,t:0,life:0.8});shakeT=Math.max(shakeT,0.4);sfx('slam');addParts(X,Y,'#c8a070',26,170);
        for(const m of mobs){if(m.dead||Math.hypot(m.x-X,m.y-Y)>sk.r)continue;hurtMob(m,dmgCalc(s2.atk,m.armor,sk.mult,s2.crit));if(!m.dead)m.stunT=m.t.boss?sk.stun*0.4:sk.stun;}}});break;}
    case 'dash':{const a=Math.atan2(tg.y-player.y,tg.x-player.x),ox=player.x,oy=player.y;let nx=tg.x+Math.cos(a)*22,ny=tg.y+Math.sin(a)*12;if(!canStand(nx,ny)){nx=tg.x-Math.cos(a)*22;ny=tg.y-Math.sin(a)*12;}
      if(canStand(nx,ny)){for(let k=0;k<6;k++){const q=k/6;fx.push({k:'p',x:ox+(nx-ox)*q,y:oy+(ny-oy)*q-20,vx:0,vy:-10,col:'#b48cff',t:0,life:0.45,sz:4});}player.x=nx;player.y=ny;player.path=[];}
      player.face=tg.x>=player.x?1:-1;addSlash(tg.x,tg.y-tg.t.hh/2,player.face,'#d8b8ff');hurtMob(tg,dmgCalc(st.atk,tg.armor,sk.mult,st.crit+0.25));sfx('swing');break;}
    case 'multi':{for(let k=0;k<sk.hits;k++)timers.push({t:0.05+k*0.11,fn:()=>{let m=player.target;if(!m||m.dead)m=nearestMob(140);if(!m||player.dead)return;const s2=stats();
        const a=k*2.4;addSlash(m.x+Math.cos(a)*10,m.y-m.t.hh/2+Math.sin(a)*8,k%2?1:-1,'#ff6a9a');addParts(m.x,m.y-m.t.hh/2,'#ff8ab0',6,110);sfx('hit');hurtMob(m,dmgCalc(s2.atk,m.armor,sk.mult,s2.crit+0.3));}});
      fx.push({k:'r',x:tg.x,y:tg.y-10,r:50,col:'#ff6a9a',t:0,life:0.8,w:2});break;}
    case 'dragon':{fx.push({k:'dragon',x:player.x,y:player.y,r:sk.r,t:0,life:1.2});sfx('ice');shakeT=Math.max(shakeT,0.25);
      for(const m of mobs){if(m.dead||dist(m,player)>sk.r)continue;hurtMob(m,dmgCalc(st.atk,m.armor,sk.mult,st.crit));if(!m.dead){m.slowT=3;m.slowAmt=0.4;}}
      healPlayer(Math.round(st.maxhp*sk.healPct));break;}
  }}
function basicAttack(m){const st=stats(),S=SECTS[player.sect];player.atkCd=S.aspd||(S.proj?0.95:0.8);player.atkAnim=0.25;player.combo=((player.combo||0)+1)%3;if(player.flying)setFly(false);
  if(S.proj){shots.push({kind:S.proj==='fire'?'ember':S.proj==='leaf'?'leafb':'water',x:player.x+player.face*10,y:player.y-24,tg:m,spd:460,mult:1});sfx('cast');}
  else{addSlash(m.x,m.y-m.t.hh/2,player.face);hurtMob(m,dmgCalc(st.atk,m.armor,1,st.crit));sfx('swing');}}
function usePot(k){if(player.dead||!started||player.potCd>0)return;const st=stats();
  if(k==='hp'){if(player.hpPot<=0){log('Hết Kim Sang Dược, hãy mua ở thầy thuốc trong làng','#ff9a8a');return;}player.hpPot--;healPlayer(Math.round(st.maxhp*0.4));}
  else{if(player.mpPot<=0){log('Hết Ngưng Thần Đan, hãy mua ở thầy thuốc trong làng','#8ac4ff');return;}player.mpPot--;const h=Math.round(st.maxmp*0.5);player.mp=Math.min(st.maxmp,player.mp+h);addText(player.x,player.y-66,'+'+h,'#6ab4ff',15);}
  player.potCd=1;sfx('pick');}

// ===================== NHIỆM VỤ =====================
const curQ=()=>QUESTS[player.qi];
const npcName=id=>NPC_INDEX[id]?NPC_INDEX[id].name:id;
function qProgress(){const q=curQ();if(!q)return 0;return q.type==='level'?Math.min(player.lv,q.n):Math.min(player.qc,q.n);}
function qDone(){const q=curQ();return!!q&&qProgress()>=q.n;}
function qOnKill(m){const q=curQ();if(!q||qDone())return;
  if(q.type==='kill'&&q.target===m.type){player.qc++;afterProgress();}
  else if(q.type==='drop'&&q.target===m.type&&Math.random()<q.chance){player.qc++;log(`Đoạt được ${q.item} (${player.qc}/${q.n})`,'#ffe9a8');afterProgress();}}
function afterProgress(){const q=curQ();if(q&&q.type!=='talk'&&qDone()&&player.qNote!==player.qi){player.qNote=player.qi;toast(`Hoàn thành: ${q.title}`,'#9fffb0');
  log(`Hoàn thành "${q.title}"! Về gặp ${npcName(q.giver)} nhận thưởng.`,'#7dff9a');sfx('quest');}}
function claimQuest(){const q=curQ();if(!q||!qDone())return;const r=q.reward;
  player.gold+=r.gold||0;player.hpPot+=r.hp||0;player.mpPot+=r.mp||0;
  log(`Nhận thưởng: ${r.exp} kinh nghiệm, ${r.gold} lượng`,'#ffe27a');sfx('coin');
  if(r.item)addItem(makeItem(r.item.slot,r.item.tier,r.item.rar,SECTS[player.sect].wtype));
  if(r.fly){player.flyUnlocked=true;toast('Lĩnh ngộ: Ngự Kiếm Phi Hành','#9fd3ff');log('Đã học Ngự Kiếm Phi Hành! Nhấp nút phi kiếm ở thanh dưới để bay.','#9fd3ff');}
  player.qi++;player.qc=0;gainExp(r.exp);
  const nq=curQ();if(nq){log(`Nhiệm vụ mới: ${nq.title} (gặp ${npcName(nq.giver)})`,'#9fffb0');afterProgress();}
  else{toast('Hoàn thành toàn bộ cốt truyện!','#ffd23f');log('Giang hồ đã bình yên. Thiếu hiệp có thể tiếp tục tu luyện và săn trang bị Truyền thuyết.','#ffd23f');}
  closeDlg();save();}
function gatherDone(h){h.dead=true;h.respawn=25;sfx('gather');addParts(h.x,h.y-12,'#9fffd8',14,70);
  const q=curQ();if(q&&q.type==='gather'&&q.map===curMapId&&!qDone()){player.qc++;log(`Hái được ${CM.herbs.name} (${player.qc}/${q.n})`,'#9fffd8');afterProgress();}
  else{gainExp(5+player.lv*2);if(Math.random()<0.3){player.mpPot++;log(`Hái ${CM.herbs.name}, luyện được 1 Ngưng Thần Đan`,'#8ac4ff');}}}
function nearestHerb(){let b=null,bd=Infinity;for(const h of herbs){if(h.dead)continue;const d=dist(h,player);if(d<bd){bd=d;b=h;}}return b;}
const soloAvoid=t=>t.elite&&!(typeof inParty==='function'&&inParty());
function bestZoneKey(){const z=bestZone();for(const k in CM.zones)if(CM.zones[k]===z)return k;return null;}
function bestZone(){let z=null,best=-1;for(const k in CM.zones){const t=MT[k];if(t.boss||soloAvoid(t))continue;if(player.lv>=t.lv[0]-1&&t.lv[0]>best){best=t.lv[0];z=CM.zones[k];}}
  if(!z){let lo=1e9;for(const k in CM.zones){const t=MT[k];if(!t.boss&&t.lv[0]<lo){lo=t.lv[0];z=CM.zones[k];}}}return z;}
function bestMap(){let m='trukhe';for(const id in MAPS)if(player.lv>=MAPS[id].minLv&&MAPS[id].minLv>=MAPS[m].minLv)m=id;return m;}
function mobReady(type){const t=MT[type];return t.boss?(player.lv>=t.lv[0]&&player.hpPot>=8):player.lv>=t.lv[0]-(t.draw==='human'?0:1);}
// mục tiêu hiện tại của nhiệm vụ
function questObjective(){const q=curQ();if(!q)return null;
  if(qDone()||q.type==='talk')return{map:NPC_INDEX[q.giver].map,npc:q.giver};
  if(q.type==='gather')return{map:q.map,gather:true};
  if(q.type==='kill'||q.type==='drop')return{map:q.map,mob:q.target};
  return{map:bestMap(),grind:true};}
function questNav(){if(!started||player.dead)return;const o=questObjective();if(!o){log('Đã hoàn thành mọi nhiệm vụ','#ccc');return;}
  player.target=null;player.gather=null;player.npc=null;
  if(o.map!==curMapId){if(navTo(o.map,null,null,()=>questNav()))log(`Đang tìm đường tới ${MAPS[o.map].name}...`,'#8fd8ff');return;}
  if(o.npc){const n=npcById(o.npc);player.npc=n;player.repath=0;if(player.flyUnlocked&&dist(player,n)>320){setFly(true);player.navFly=true;}}
  else if(o.gather){const h=nearestHerb();if(h){player.gather=h;player.repath=0;if(player.flyUnlocked&&dist(player,h)>320){setFly(true);player.navFly=true;}}}
  else{const z=o.mob?CM.zones[o.mob]:bestZone();if(z)navTo(curMapId,z.x*T+16,z.y*T+16);}
  log('Đang tự tìm đường...','#8fd8ff');}
function moveTo(x,y){const p=pathPts(player.x,player.y,x,y);if(p){player.path=p;return true;}return false;}

// ===================== TỰ ĐỘNG =====================
// quái quanh điểm luyện (bán kính ~16 ô), bỏ qua trùm và bầy tinh anh khi đi một mình, quái quá cấp
function anchorZone(x,y){let best=null,bd=Infinity;for(const k in CM.zones){const t=MT[k];if(t.boss)continue;const z=CM.zones[k],d=Math.hypot(z.x*T+16-x,z.y*T+16-y);if(d<bd){bd=d;best=k;}}return best;}
function autoPickNear(A){if(!A.zone)A.zone=anchorZone(A.x,A.y);let best=null,bd=Infinity;for(const m of mobs){if(m.dead||m.state==='return'||m.isFoe)continue;const d=dist(m,player);
    if(m.type!==A.zone)continue;
    if(m.state==='chase'&&d<140){if(d*0.05<bd){bd=d*0.05;best=m;}continue;}if(d<bd){bd=d;best=m;}}return best;}
function autoPick(pref){let best=null,bd=Infinity;
  for(const m of mobs){if(m.dead||m.state==='return'||m.isFoe)continue;
    let d=dist(m,player);
    if(pref&&m.type!==pref)continue;
    if(m.state==='chase'&&d<140){d*=0.05;}
    else{if(soloAvoid(m.t)&&pref!==m.type)continue;if(m.t.boss&&pref!==m.type)continue;if(m.lv>player.lv+2&&pref!==m.type)continue;}
    if(d<bd){bd=d;best=m;}}
  return best;}
function autoThink(dt){autoT-=dt;if(autoT>0)return;autoT=0.2;const st=stats(),sk=skillList();
  if(player.hp<st.maxhp*0.35&&player.hpPot>0)usePot('hp');
  if(player.mp<st.maxmp*0.2&&player.mpPot>0)usePot('mp');
  const low=partyAPI('netPartyLow',360,0.6);
  sk.forEach((s,i)=>{if(player.lv<s.lv||player.cds[i]>0||player.mp<s.mp)return;
    if(s.kind==='heal'&&player.hp<st.maxhp*0.55)castSkill(i);
    else if(s.kind==='groupHeal'&&(player.hp<st.maxhp*0.6||low))castSkill(i);
    else if(s.kind==='field'&&(player.hp<st.maxhp*0.45||low>=2)&&player.combatT>0)castSkill(i);});
  if(!autoRest&&player.hp<st.maxhp*0.25&&player.hpPot===0){autoRest=true;player.target=null;player.gather=null;navGoal=null;log('Sinh lực thấp, tự về làng dưỡng thương','#ffb36b');}
  if(!autoRest&&player.hpPot<3&&player.gold>=60&&!inSafe(player)&&!(player.target&&!player.target.dead&&player.target.state==='chase')){autoRest=true;player.target=null;player.gather=null;navGoal=null;log('Sắp hết thuốc, tự về thành mua thêm','#ffb36b');}
  if(inSafe(player)&&(player.hpPot<10||player.inv.length>20)&&player.gold>=30)autoBuy();
  const R=revivePos();
  if(autoRest){player.target=null;
    if(inSafe(player)&&player.hp>=st.maxhp*0.95){autoRest=false;autoBuy();autoEquip();log('Đã hồi phục, tiếp tục hành trình','#7dff9a');}
    else if(!player.path.length&&dist(player,R)>20){moveTo(R.x,R.y);if(player.flyUnlocked&&dist(player,R)>320)setFly(true);}
    return;}
  // đích đến cũ mà không có đường đi (kẹt) thì bỏ sau 3 giây
  if(navGoal&&!player.path.length&&!player.moving){player.navStuck=(player.navStuck||0)+0.2;if(player.navStuck>3){navGoal=null;player.navStuck=0;}}else player.navStuck=0;
  if(player.npc||player.gather||navGoal)return;
  const tg=player.target;
  // bỏ mục tiêu không đáng đánh: quái đang chạy về hồi máu, hoặc Tinh anh khi đi một mình (trừ khi đang luyện tại chính bãi Tinh anh)
  if(tg&&!tg.dead&&!tg.isFoe&&(tg.state==='return'||(soloAvoid(tg.t)&&!(player.autoMode==='here'&&player.autoAnchor&&player.autoAnchor.zone===tg.type)))){player.target=null;player.pend=null;return;}
  if(tg&&!tg.dead){const d=dist(player,tg);
    let near=0;for(const m of mobs)if(!m.dead&&dist(m,player)<130)near++;
    for(let i=0;i<sk.length;i++){const s=sk[i];if(player.lv<s.lv||player.cds[i]>0||player.mp<s.mp)continue;
      const ult=s.lv>=10,worth=!ult||tg.t.boss||near>=2||tg.maxhp>=tg.t.hp*1.1;if(!worth)continue;
      if((s.kind==='aoeSelf'||s.kind==='dragon'||s.kind==='field')&&d<=s.r*0.9){castSkill(i);break;}
      if(s.kind==='taunt'&&near>=2&&d<s.r*0.7){castSkill(i);break;}
      if(s.kind==='groupBuff'&&d<220&&!hasBuff(s.buff.id)){castSkill(i);break;}
      if(needsTarget(s)&&d<=s.range){castSkill(i);break;}
      if(s.kind==='buff'&&d<200&&!player.buffs.some(b=>b.id===s.buff.id)){castSkill(i);break;}}
    return;}
  if(CM.pb){let b=null,bd=1e9;for(const m of mobs){if(m.dead||m.isFoe)continue;const d=dist(m,player);if(d<bd){bd=d;b=m;}}if(b){player.target=b;player.repath=0;}return;}
  if(player.autoMode==='here'){let A=player.autoAnchor;if(!A||A.map!==curMapId){A=player.autoAnchor={map:curMapId,x:player.x,y:player.y};}
    const m=autoPickNear(A);if(m){player.target=m;player.repath=0;return;}
    const Z=A.zone&&CM.zones[A.zone],hx=Z?Z.x*T+16:A.x,hy=Z?Z.y*T+16:A.y;
    if(!player.path.length&&Math.hypot(player.x-hx,player.y-hy)>Math.max(60,(Z?Z.r:2)*T*0.6)){moveTo(hx,hy);if(player.flyUnlocked&&Math.hypot(player.x-A.x,player.y-A.y)>360)setFly(true);}return;}
  const o=questObjective();
  if(o&&o.map!==curMapId){
    const p=routeNext(curMapId,o.map);
    if(p&&player.lv>=p.minLv&&(!o.mob||mobReady(o.mob))){autoEquip();navTo(o.map,null,null);return;}}
  else if(o){
    if(o.npc){player.target=null;player.npc=npcById(o.npc);player.repath=0;return;}
    if(o.gather){const h=nearestHerb();if(h){player.gather=h;player.repath=0;return;}}}
  const pref=o&&o.map===curMapId&&o.mob&&mobReady(o.mob)?o.mob:null;
  const m=autoPick(pref||bestZoneKey());if(m){player.target=m;player.repath=0;return;}
  const z=pref?CM.zones[pref]:bestZone();
  if(z&&!player.path.length){const zx=z.x*T+16,zy=z.y*T+16;if(Math.hypot(player.x-zx,player.y-zy)>Math.max(z.r,2)*T)moveTo(zx,zy);}}
function autoBuy(){if(typeof autoMount==='function')autoMount();partyAPI('autoPet');let a=0,b=0;while(player.hpPot<20&&player.gold>=30){player.gold-=30;player.hpPot+=5;a+=5;}while(player.mpPot<10&&player.gold>=30){player.gold-=30;player.mpPot+=5;b+=5;}
  if(a||b){log('Tự mua '+a+' Kim Sang Dược, '+b+' Ngưng Thần Đan','#ff9a8a');sfx('coin');}
  if(player.inv.length>20){const n0=player.inv.length;player.inv=player.inv.filter(x=>{if(x.rar<=1&&!isUpgrade(x)){player.gold+=x.price;return false;}return true;});if(player.inv.length<n0)log('Tự bán '+(n0-player.inv.length)+' món đồ thừa','#ffd977');}
  for(let n=0;n<40;n++){let best=null,bs=1e9;for(const k of EQ_KEYS){const it=player.eq[k];if(!it||(it.ref||0)>=10)continue;const sc=(it.ref||0)*(k==='weapon'?1:2)+(k==='weapon'?0:1);if(sc<bs){bs=sc;best=it;}}
    if(!best||player.gold<refCost(best)*3)break;if(refineItem(best.uid,true))log(`Tự cường hóa ${best.name} lên +${best.ref}`,'#ffd23f');}}
function autoFly(){if(!player.flyUnlocked)return;if(typeof mountObj==='function'&&mountObj()&&mountObj().spd>=0.7){if(player.flying)setFly(false);return;}
  const dest=player.target&&!player.target.dead?player.target:player.npc||player.gather||(player.path.length?player.path[player.path.length-1]:null);
  if(!dest){if(player.flying)setFly(false);return;}
  const d=dist(player,dest);
  if(!player.flying&&d>360)setFly(true);
  else if(player.flying&&d<150&&!navGoal)setFly(false);}

// ===================== CẬP NHẬT NGƯỜI CHƠI =====================
function updatePlayer(dt){const st=stats();
  for(let i=0;i<player.cds.length;i++)player.cds[i]=Math.max(0,player.cds[i]-dt);
  player.atkCd-=dt;player.atkAnim-=dt;player.potCd-=dt;player.combatT-=dt;player.hitFlash-=dt;player.repath-=dt;player.slowT-=dt;portalCd-=dt;lvWarnT-=dt;
  for(let i=player.buffs.length-1;i>=0;i--){const b=player.buffs[i];b.t-=dt;if(b.pct&&!player.dead)player.hp=Math.min(st.maxhp,player.hp+st.maxhp*b.pct*dt);if(b.t<=0)player.buffs.splice(i,1);}
  if(player.dead)return;
  const inV=inSafe(player),hr=inV?0.12:(player.combatT<=0?0.03:0.004);
  player.hp=Math.min(st.maxhp,player.hp+st.maxhp*hr*dt);
  player.mp=Math.min(st.maxmp,player.mp+st.maxmp*(inV?0.12:0.02)*dt);
  if(player.expBuffs&&player.expBuffs.length){const L=player.expBuffs,a=L.find(b=>b.m===2&&b.t>0)||L.find(b=>b.m===1&&b.t>0);if(a)a.t-=dt;if(L.some(b=>b.t<=0))player.expBuffs=L.filter(b=>b.t>0);}
  if(typeof updateRiding==='function'){updateRiding();const M=mountObj();if(M&&M.spd>=0.7&&player.flying&&player.navFly)setFly(false);}
  if(player.stunT>0){player.stunT-=dt;player.path=[];player.moving=false;return;}
  if(mouse.down&&mouse.hold){mouse.holdT-=dt;if(mouse.holdT<=0){mouse.holdT=0.2;const w=toWorld(mouse.x,mouse.y);moveTo(w.x,w.y);}}
  const following=partyAPI('followTick',dt);
  if(auto&&!following){autoThink(dt);autoFly();}
  if(player.npc){const n=player.npc;
    if(dist(player,n)<=54){player.path=[];player.npc=null;if(player.flying)setFly(false);openNpc(n);}
    else if(player.repath<=0){player.repath=0.5;moveTo(n.x,n.y+14);}}
  else if(player.gather){const h=player.gather;
    if(h.dead){player.gather=null;player.channel=0;}
    else if(dist(player,h)<=30){player.path=[];if(player.flying)setFly(false);player.channel+=dt;player.face=h.x>=player.x?1:-1;
      if(player.channel>=1.5){player.channel=0;player.gather=null;gatherDone(h);}}
    else{player.channel=0;if(player.repath<=0){player.repath=0.5;moveTo(h.x,h.y+6);}}}
  else if(player.target){const m=player.target;
    if(m.dead){player.target=null;player.pend=null;}
    else{const d=dist(player,m),S=SECTS[player.sect];
      const range=player.pend!=null?skillList()[player.pend].range:(S.range+(m.t.boss?12*(m.t.scale||1):0));
      if(d<=range){player.path=[];player.face=m.x>=player.x?1:-1;player.dir='side';
        if(player.pend!=null){const i=player.pend,s=skillList()[i];if(player.mp>=s.mp&&player.cds[i]<=0)castSkill(i);else player.pend=null;}
        else if(player.atkCd<=0)basicAttack(m);}
      else if(player.repath<=0){player.repath=0.3;if(!moveTo(m.x,m.y)&&auto)player.target=null;}}}
  followPath(player,st.move,dt);
  if(player.navFly&&!player.path.length&&!player.npc&&!player.gather&&!navGoal)setFly(false);
  if(player.flying&&Math.random()<0.5)fx.push({k:'p',x:player.x-player.face*18+rnd(-3,3),y:player.y-10+rnd(-2,2),vx:-player.face*20,vy:rnd(-5,5),col:Math.random()<.5?'#cfeaff':'#ffffff',t:0,life:0.5,sz:rnd(1,2)});
  if(portalCd<=0)for(const p of CM.portals){if(Math.hypot(player.x-p.x*T,player.y-p.y*T)<20){
    if(player.lv>=p.minLv){travel(p);return;}
    else if(lvWarnT<=0){lvWarnT=3;log(`Truyền Tống Trận tới ${MAPS[p.to].name} cần cấp ${p.minLv}`,'#ff9a8a');toast(`Cần đạt cấp ${p.minLv}`,'#ff9a8a');}}}}

// ===================== CẬP NHẬT QUÁI =====================
const ESHOT_COL={efire:['#ff8a3d','#ff3a1a'],eice:['#bff0ff','#7fd0ff'],edark:['#c890ff','#7a3ad0'],egold:['#fff0a0','#ffc040']};
function enemyShoot(m,kind,ang,mult){const a=ang!=null?ang:Math.atan2(player.y-14-(m.y-m.t.hh/2),player.x-m.x);
  eshots.push({kind,x:m.x,y:m.y-m.t.hh/2,vx:Math.cos(a),vy:Math.sin(a),spd:kind==='eice'?300:260,atk:m.atk*(mult||1),travel:0,el:m.t.el,m});}
function updateMob(m,dt){
  if(m.isFoe){partyAPI('foeTick',m,dt);return;}
  if(m.dead){if(m.fade>0)m.fade-=dt;if(m.summoned)return;m.respawn-=dt;if(m.respawn<=0&&!partyAPI('mobHostRemote'))spawnMob(m);return;}
  if(m.i!=null&&partyAPI('mobNetMove',m,dt))return;
  m.atkCd-=dt;m.atkAnim-=dt;m.hitFlash-=dt;m.repath-=dt;
  if(m.burnT>0){m.burnT-=dt;m.burnTick-=dt;if(m.burnTick<=0){m.burnTick=0.5;hurtMob(m,{v:m.burnDmg,crit:false});if(m.dead)return;}const pz=m.burnKind==='poison';if(Math.random()<0.4)fx.push({k:'p',x:m.x+rnd(-8,8),y:m.y-rnd(4,20),vx:0,vy:-40,col:pz?(Math.random()<.5?'#9fff6a':'#4ac03a'):(Math.random()<.5?'#ffb040':'#ff5a1a'),t:0,life:0.5,sz:2});}
  if(m.markT>0)m.markT-=dt;
  if(m.freezeT>0){m.freezeT-=dt;m.moving=false;return;}
  if(m.stunT>0){m.stunT-=dt;m.moving=false;return;}
  if(m.slowT>0)m.slowT-=dt;
  const t=m.t,d=dist(m,player),home={x:m.hx,y:m.hy},spd=m.spd*(m.slowT>0?1-m.slowAmt:1);
  if(m.state==='idle'){
    m.wanderT-=dt;
    if(m.wanderT<=0){m.wanderT=rnd(2,5);const a=rnd(0,7),r=rnd(10,t.boss?40:80),wx=m.hx+Math.cos(a)*r,wy=m.hy+Math.sin(a)*r;if(canStand(wx,wy)&&los(m.x,m.y,wx,wy))m.path=[{x:wx,y:wy}];}
    followPath(m,spd*0.4,dt);
    if(t.aggro>0&&d<t.aggro&&!player.dead&&!inSafe(player)&&!hasBuff('stealth'))m.state='chase';
    return;}
  if(m.state==='return'){
    m.hp=Math.min(m.maxhp,m.hp+m.maxhp*0.3*dt);
    if(!m.path.length){if(dist(m,home)<20){m.state='idle';m.hp=m.maxhp;if(t.boss&&m.enraged){m.enraged=false;m.atk=Math.round(m.atk/1.25);m.spd=t.spd;}}else m.path=pathPts(m.x,m.y,m.hx,m.hy)||[];if(!m.path.length){m.x=m.hx;m.y=m.hy;}}
    followPath(m,spd*1.4,dt);return;}
  if(player.dead||inSafe(player)||dist(m,home)>(t.boss?320:380)){m.state='return';m.path=[];if(player.target===m&&!auto)player.target=null;return;}
  if(t.boss){m.slamCd-=dt;m.fireCd-=dt;
    if(m.slamT>0){m.slamT-=dt;m.moving=false;
      if(m.slamT<=0){shakeT=0.4;sfx('slam');const col=t.bskill==='ice'?'#9fe8ff':'#ff5030';addRing(m.x,m.y-10,125,col,0.45,4);addParts(m.x,m.y,t.bskill==='ice'?'#dff6ff':'#7a5a40',28,170);
        if(t.bskill==='ice')fx.push({k:'ice',x:m.x,y:m.y,r:120,t:0,life:0.9});
        if(dist(m,player)<=122){hurtPlayer(dmgCalc(m.atk,stats().def,1.7),{el:t.el,m});if(t.bskill==='ice'){player.slowT=3;log('Bị băng khí làm chậm!','#9fe8ff');}}}
      return;}
    if(m.slamCd<=0&&d<130){m.slamT=1.1;m.slamCd=m.enraged?6:8;m.path=[];return;}
    if(t.bskill==='fire'&&m.fireCd<=0&&d<320){m.fireCd=m.enraged?3.5:5;const a=Math.atan2(player.y-m.y,player.x-m.x);for(const o of [-0.3,0,0.3])enemyShoot(m,t.bshot||'efire',a+o,0.7);sfx('fire');}
    if(t.bskill==='ice'&&m.fireCd<=0&&d<320){m.fireCd=m.enraged?3:4.5;const a=Math.atan2(player.y-m.y,player.x-m.x);for(const o of [-0.4,-0.2,0,0.2,0.4])enemyShoot(m,t.bshot||'eice',a+o,0.5);sfx('ice');}}
  if(d>t.range+6){
    if(los(m.x,m.y,player.x,player.y))m.path=[{x:player.x,y:player.y}];
    else if(m.repath<=0){m.repath=0.6;m.path=pathPts(m.x,m.y,player.x,player.y)||[];}
    followPath(m,spd,dt);
  }else{m.path=[];m.moving=false;m.face=player.x>=m.x?1:-1;m.dir='side';
    if(m.atkCd<=0){m.atkCd=t.cd;m.atkAnim=0.25;
      if(t.ranged){enemyShoot(m,t.shot||'eice');sfx('ice');}else hurtPlayer(dmgCalc(m.atk,stats().def),{el:t.el,m});
      }}}
function separate(){for(let i=0;i<mobs.length;i++){const a=mobs[i];if(a.dead||a.isFoe)continue;for(let j=i+1;j<mobs.length;j++){const b=mobs[j];if(b.dead||b.isFoe)continue;
  const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||0.01,min=(a.t.boss||b.t.boss)?40:22;if(d<min){const p=(min-d)/2,ux=dx/d*p,uy=dy/d*p;
    if(canStand(a.x-ux,a.y-uy)){a.x-=ux;a.y-=uy;}if(canStand(b.x+ux,b.y+uy)){b.x+=ux;b.y+=uy;}}}}}

// ===================== ĐẠN, HIỆU ỨNG =====================
const SHOT_PCOL={fire:['#ffb340','#ff5a1a','#ff8a3d'],ember:['#ffb340','#ff5a1a','#ff8a3d'],water:['#bff0ff','#6fc8ff','#9fe8ff'],ice:['#bff0ff','#6fc8ff','#9fe8ff'],
  leaf:['#c8ff9a','#5ad04a','#9fff8a'],leafb:['#c8ff9a','#5ad04a','#9fff8a'],dark:['#d8b8ff','#7a4ad0','#b48cff']};
function updateShots(dt){const st=stats();
  for(let i=shots.length-1;i>=0;i--){const s=shots[i];
    if(s.tg){const m=s.tg;if(m.dead){shots.splice(i,1);continue;}
      const tx=m.x,ty=m.y-m.t.hh/2,dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy)||1,sp=s.spd*dt;s.vx=dx/d;s.vy=dy/d;
      const SC=SHOT_PCOL[s.kind]||SHOT_PCOL.fire,small=s.kind==='ember'||s.kind==='leafb';
      if(Math.random()<0.8)fx.push({k:'p',x:s.x,y:s.y,vx:rnd(-20,20),vy:rnd(-20,20),col:SC[Math.random()<.5?0:1],t:0,life:0.3,sz:small?1.6:2.2});
      if(d<=sp+6){shots.splice(i,1);const col=SC[2];addParts(tx,ty,col,small?6:14,120);if(!small&&s.kind!=='water')addRing(tx,ty,30,col,0.3);
        hurtMob(m,dmgCalc(st.atk,m.armor,s.mult,st.crit));if(s.slow&&!m.dead){m.slowT=s.slow.dur;m.slowAmt=s.slow.amt;}
        if(s.poison&&!m.dead){m.burnT=s.poison.dur;m.burnKind='poison';m.burnDmg=Math.max(1,Math.round(st.atk*s.poison.mult));}
        if(s.mark&&!m.dead){m.markT=s.mark.dur;m.markAmt=s.mark.amt;}}
      else{s.x+=dx/d*sp;s.y+=dy/d*sp;}}
    else{const sp=s.spd*dt;s.x+=s.vx*sp;s.y+=s.vy*sp;s.travel+=sp;
      if(Math.random()<0.9){const col=s.kind==='phoenix'?(Math.random()<.5?'#ffcf60':'#ff5a1a'):'#dff4ff';fx.push({k:'p',x:s.x+rnd(-8,8),y:s.y+rnd(-8,8),vx:-s.vx*40,vy:-s.vy*40,col,t:0,life:0.45,sz:s.kind==='phoenix'?3:2});}
      for(const m of mobs){if(m.dead||s.hit.has(m))continue;if(Math.hypot(m.x-s.x,(m.y-m.t.hh/2)-s.y)<s.r+m.t.hw*0.6*(m.t.scale||1)){s.hit.add(m);hurtMob(m,dmgCalc(st.atk,m.armor,s.mult,st.crit));
        if(s.kind==='phoenix'&&!m.dead){m.burnT=3;m.burnKind='fire';m.burnDmg=Math.round(st.atk*0.3);}}}
      if(s.travel>=s.max||(!walkable(s.x,s.y+18)&&s.kind!=='phoenix'&&getT(Math.floor(s.x/T),Math.floor((s.y+18)/T))!==WA))shots.splice(i,1);}}
  for(let i=eshots.length-1;i>=0;i--){const s=eshots[i],sp=s.spd*dt;s.x+=s.vx*sp;s.y+=s.vy*sp;s.travel+=sp;
    if(Math.random()<0.7)fx.push({k:'p',x:s.x,y:s.y,vx:rnd(-15,15),vy:rnd(-15,15),col:ESHOT_COL[s.kind][Math.random()<.5?0:1],t:0,life:0.3,sz:2});
    if(!player.dead&&Math.hypot(player.x-s.x,player.y-20-s.y)<16){eshots.splice(i,1);addParts(s.x,s.y,ESHOT_COL[s.kind][0],10,100);hurtPlayer(dmgCalc(s.atk,stats().def),{el:s.el,m:s.m});if(s.kind==='eice')player.slowT=Math.max(player.slowT,1.2);continue;}
    if(s.travel>420)eshots.splice(i,1);}}
function updateFx(dt){for(let i=fx.length-1;i>=0;i--){const f=fx[i];f.t+=dt;if(f.follow){f.x=player.x;f.y=player.y;}if(f.k==='p'){f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.g)f.vy+=200*dt;}if(f.t>=f.life)fx.splice(i,1);}
  if(fx.length>900)fx.splice(0,fx.length-900);
  if(marker){marker.t+=dt;if(marker.t>0.6)marker=null;}shakeT-=dt;fadeT-=dt;}
let uiT=0,saveT=0;
function update(dt){nowT+=dt;
  for(let i=timers.length-1;i>=0;i--){const tm=timers[i];tm.t-=dt;if(tm.t<=0){timers.splice(i,1);tm.fn();}}
  updatePlayer(dt);for(const m of mobs)updateMob(m,dt);partyAPI('duelTick',dt);partyAPI('petTick',dt);
  for(let i=mobs.length-1;i>=0;i--){const m=mobs[i];if(m.summoned&&m.dead&&m.fade<=0)mobs.splice(i,1);}
  separate();updateShots(dt);updateFx(dt);
  for(const h of herbs)if(h.dead){h.respawn-=dt;if(h.respawn<=0)h.dead=false;}
  uiT-=dt;if(uiT<=0){uiT=0.1;updateUI();}
  saveT-=dt;if(saveT<=0){saveT=10;save();}}

// ===================== LƯU / TẢI =====================
let SKEY='trukhe_tienduyen_v2'; // đổi theo tài khoản khi đăng nhập (accounts.js)
function save(){if(!player.sect)return;try{localStorage.setItem(SKEY,JSON.stringify({v:3,name:player.name,gender:player.gender,sect:player.sect,lv:player.lv,exp:player.exp,gold:player.gold,
  hpPot:player.hpPot,mpPot:player.mpPot,inv:player.inv,eq:player.eq,flyUnlocked:player.flyUnlocked,qi:player.qi,qc:player.qc,qNote:player.qNote,kills:player.kills,pvp:player.pvp,friends:player.friends,mount:player.mount,mounts:player.mounts,mountOn:player.mountOn,expBuffs:player.expBuffs,stash:player.stash,autoSellRar:player.autoSellRar,luck:player.luck,reviveC:player.reviveC,ddT:player.ddT,ap:player.ap,tp:player.tp,gmSet:player.gmSet,pet:player.pet,pets:player.pets,petOn:player.petOn,petExp:player.petExp,cn:player.cn,td:player.td,daily:player.daily,guild:player.guild,prof:player.prof,
  map:CM.pb?CM.pb.back:curMapId,wv:CM.pb?0:2,x:player.x,y:player.y,music:AU.music,sfx:AU.sfx,ts:Date.now()}));}catch(e){}}
function loadSave(){try{const s=JSON.parse(localStorage.getItem(SKEY));return s&&(s.v===2||s.v===3)&&SECTS[s.sect]?s:null;}catch(e){return null;}}
function applySave(s){
  Object.assign(player,{name:s.name,gender:s.gender,sect:s.sect,lv:s.lv,exp:s.exp,gold:s.gold,hpPot:s.hpPot,mpPot:s.mpPot,inv:s.inv||[],
    eq:Object.assign(emptyEq(),s.eq,s.eq&&s.eq.jade?{amulet:s.eq.jade}:{}),flyUnlocked:!!s.flyUnlocked,qi:s.qi||0,qc:s.qc||0,qNote:s.qNote??-1,kills:s.kills||0,pvp:s.pvp||{w:0,l:0,d:0},friends:Array.isArray(s.friends)?s.friends:[],mount:s.mount||null,mounts:Array.isArray(s.mounts)?s.mounts:[],mountOn:s.mountOn!==false,expBuffs:(Array.isArray(s.expBuffs)?s.expBuffs:[]).concat(s.exp2T>0?[{m:1,t:s.exp2T}]:[],s.exp3T>0?[{m:2,t:s.exp3T}]:[]),stash:Array.isArray(s.stash)?s.stash:[],autoSellRar:s.autoSellRar??-1,luck:s.luck||0,reviveC:s.reviveC||0,ddT:s.ddT||0,ap:s.ap||null,tp:s.tp||0,gmSet:s.gmSet||0,pet:s.pet||null,pets:Array.isArray(s.pets)?s.pets:[],petOn:s.petOn!==false,petExp:s.petExp||{},cn:s.cn||null,td:s.td||null,daily:s.daily||null,guild:s.guild||null,prof:s.prof||null});
  resetRuntime();
  delete player.eq.jade;delete player.refine;
  if(s.refine&&player.eq.weapon&&!player.eq.weapon.ref)player.eq.weapon.ref=s.refine; // bản cũ: cường hóa gắn với nhân vật -> chuyển vào vũ khí đang cầm
for(const it of player.inv.concat(Object.values(player.eq)))if(it&&it.slot==='jade')it.slot='amulet';
  // đồ bộ cũ (bậc thấp, cần cấp 85) -> nâng thành đồ bộ tối thượng, ai cũng mặc được; giữ cường hóa
  // vũ khí Trùng Lâu cũ -> Thần khí
  const upSet=it=>{if(!it)return it;let n=null;if(it.slot==='weapon'&&(it.set||it.god)){if(!it.god||it.tier<MAXTIER)n=makeGodWeapon(it.wtype);}
    else if(it.set&&SETS[it.set]&&!(it.tier>=MAXTIER&&it.lvReq<=1&&SETS[it.set].suf[it.slot]&&it.name===SETS[it.set].name+' '+SETS[it.set].suf[it.slot]))n=makeSetItem(it.slot,it.set);
    if(!n)return it;n.uid=it.uid;if(it.ref)n.ref=it.ref;return n;};
  player.inv=player.inv.map(upSet);for(const k in player.eq)player.eq[k]=upSet(player.eq[k]);if(Array.isArray(player.stash))player.stash=player.stash.map(upSet);
  let mx=0;for(const it of player.inv.concat(Object.values(player.eq)))if(it&&it.uid>mx)mx=it.uid;uidN=mx+1;
  refreshLook();AU.music=s.music!==false;AU.sfx=s.sfx!==false;
  const mid=MAPS[s.map]?s.map:'trukhe';const okPos=s.v===3&&s.wv===2;if(!okPos)player.autoAnchor=null;loadMap(mid,okPos?s.x:null,okPos?s.y:null);
  const st=stats();player.hp=st.maxhp;player.mp=st.maxmp;}
addEventListener('beforeunload',save);

// trao các món tối thượng còn thiếu (đếm cả túi, kho, đồ đang mặc); equip=true thì mặc luôn
function giveUltimate(equip){const S=SETS.trunglau,all=player.inv.concat(Object.values(player.eq),player.stash||[]).filter(Boolean),have={};let n=0;
  for(const it of all)if(it.set==='trunglau')have[it.slot]=(have[it.slot]||0)+1;
  const need={};for(const sl of S.pieces)need[sl]=(need[sl]||0)+1;
  for(const sl in need)for(let k=have[sl]||0;k<need[sl];k++){const it=makeSetItem(sl,'trunglau');player.inv.push(it);n++;if(equip)equipItem(it.uid);}
  if(!all.some(it=>it.god)){const it=makeGodWeapon();player.inv.push(it);n++;if(equip)equipItem(it.uid);}
  if(equip)for(const it of [...player.inv])if((it.god||it.set)&&isUpgrade(it))equipItem(it.uid);
  return n;}
