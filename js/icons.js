'use strict';
// ===================== BIỂU TƯỢNG VẬT PHẨM (hình màu) =====================
// Mỗi món có hình riêng: chất liệu đổi theo bậc (sắt → đồng → thép lam → ngọc → vàng → huyết kim → tử tinh),
// đá quý đổi theo độ hiếm; nền ô phát sáng theo độ hiếm; đồ bộ và Thần khí có hiệu ứng riêng.
const ICON_MAT=[ // [sáng, giữa, tối]
  ['#f2f5f8','#a3acb6','#4b535d'],['#ffe6bf','#c98a4c','#64391a'],['#f4fbff','#8db8dc','#34557a'],['#eafff4','#55cf9e','#16664a'],
  ['#fff7cc','#ffc43c','#86560e'],['#ffe3da','#e2484c','#661018'],['#f7ecff','#b48cff','#46288a']];
const ICON_SET=['#ffe9ef','#ff4a6a','#64081e'],ICON_GOD=['#fffbe2','#ffd23c','#a06400'];
const ICON_GEM=['#e4e4e4','#5dff82','#4fb0ff','#ffb12e','#ff3d8f'];
const iconMat=t=>t<=2?0:t<=5?1:t<=8?2:t<=10?3:t<=12?4:t<=14?5:6;
(()=>{let d='';
  const lin=(id,c)=>`<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".45" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient>`;
  ICON_MAT.forEach((c,i)=>d+=lin('tkm'+i,c));d+=lin('tkmS',ICON_SET)+lin('tkmG',ICON_GOD);
  ICON_GEM.forEach((c,i)=>d+=`<radialGradient id="tkg${i}" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="${c}"/><stop offset="1" stop-color="${shadeHex(c,-.55)}"/></radialGradient>`);
  d+=`<linearGradient id="tkwd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5a32"/><stop offset=".5" stop-color="#5a3418"/><stop offset="1" stop-color="#2e1a0a"/></linearGradient>`;
  d+=`<linearGradient id="tkpp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#e8d6b0"/></linearGradient>`;
  d+=`<radialGradient id="tkgl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
  const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('aria-hidden','true');s.style.cssText='position:absolute;width:0;height:0;overflow:hidden';s.innerHTML='<defs>'+d+'</defs>';
  document.body.appendChild(s);
  const st=document.createElement('style');st.textContent=`
.itile{display:inline-block;width:38px;height:38px;border-radius:9px;position:relative;overflow:hidden;vertical-align:middle;flex:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.12),0 1px 3px rgba(0,0,0,.6)}
.itile svg{position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 1.5px 1px rgba(0,0,0,.65))}
.itile.r0{background:radial-gradient(circle at 50% 38%,#55575c,#17181b 72%)}
.itile.r1{background:radial-gradient(circle at 50% 38%,#2f7a3c,#0f1d12 72%);box-shadow:inset 0 0 0 1px #5dff8255}
.itile.r2{background:radial-gradient(circle at 50% 38%,#2a5ea8,#0c1426 72%);box-shadow:inset 0 0 0 1px #4fb0ff77}
.itile.r3{background:radial-gradient(circle at 50% 38%,#b2701a,#2a1606 72%);box-shadow:inset 0 0 0 1px #ffb12eaa,0 0 8px #ffb12e66;animation:itPulse 2.4s ease-in-out infinite}
.itile.r4{background:radial-gradient(circle at 50% 38%,#b0185c,#2a0616 72%);box-shadow:inset 0 0 0 1.5px #ff3d8fcc,0 0 10px #ff3d8f88;animation:itPulse 1.8s ease-in-out infinite}
.itile.set{background:radial-gradient(circle at 50% 38%,#c01c3c,#2a040c 72%);box-shadow:inset 0 0 0 1.5px #ffd23f,0 0 12px #ff4a6aaa}
.itile.god{background:radial-gradient(circle at 50% 40%,#ffe27a,#a05a00 45%,#2a1400 75%);box-shadow:inset 0 0 0 1.5px #fff2a0,0 0 14px #ffd23fcc}
.itile.god::before{content:'';position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent 0 8%,#fff6 10%,transparent 12% 33%,#fff6 35%,transparent 37% 58%,#fff6 60%,transparent 62% 83%,#fff6 85%,transparent 87%);animation:itSpin 6s linear infinite}
.itile.r4::after,.itile.set::after,.itile.god::after{content:'';position:absolute;top:0;left:-60%;width:40%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.55),transparent);animation:itShine 2.6s ease-in-out infinite}
.itile.big{width:46px;height:46px;border-radius:10px}.itile.sm{width:30px;height:30px;border-radius:7px}
@keyframes itPulse{50%{filter:brightness(1.18)}}@keyframes itSpin{to{transform:rotate(360deg)}}@keyframes itShine{0%{left:-60%}55%,100%{left:130%}}
.cell .ic{line-height:0;margin-bottom:2px;text-shadow:none}.eqbox .eqic .itile{width:34px;height:34px}`;
  document.head.appendChild(st);})();
function shadeHex(hex,p){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const f=p<0?0:255,a=Math.abs(p);r=Math.round(r+(f-r)*a);g=Math.round(g+(f-g)*a);b=Math.round(b+(f-b)*a);return'#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1);}
// hình từng loại (khung 48×48). M: chất liệu, E: viền tối, G: đá quý, C: màu đá (dùng cho tua, lông vũ)
const ICON_DRAW={
  sword:(M,E,G,C)=>`<g transform="rotate(45 24 24)"><path d="M24 2.5 27.2 8v22h-6.4V8Z" fill="${M}" stroke="${E}" stroke-width=".9"/><path d="M24 6.5v22" stroke="#fff" stroke-opacity=".6" stroke-width="1.1"/>
    <path d="M14.5 30.2Q24 34.5 33.5 30.2v3.4Q24 38 14.5 33.6Z" fill="url(#tkm4)" stroke="#5a3a08" stroke-width=".8"/><circle cx="24" cy="33.4" r="2.2" fill="${G}" stroke="#3a2406" stroke-width=".6"/>
    <rect x="22" y="35.5" width="4" height="8" rx="1" fill="#3a2414"/><path d="M22 37.5h4M22 40h4M22 42.4h4" stroke="#c9a060" stroke-width=".7"/><circle cx="24" cy="45" r="2.3" fill="url(#tkm4)" stroke="#5a3a08" stroke-width=".6"/></g>`,
  dagger:(M,E,G,C)=>{const d=r=>`<g transform="rotate(${r} 24 24)"><path d="M24 5 26.4 9v15h-4.8V9Z" fill="${M}" stroke="${E}" stroke-width=".8"/><path d="M24 8v15" stroke="#fff" stroke-opacity=".55" stroke-width=".9"/><rect x="18.5" y="24" width="11" height="2.6" rx="1.2" fill="url(#tkm4)" stroke="#5a3a08" stroke-width=".6"/><rect x="22.4" y="26.6" width="3.2" height="7" rx=".8" fill="#2e1a10"/><circle cx="24" cy="35" r="1.8" fill="${G}"/></g>`;return d(-32)+d(32);},
  fan:(M,E,G,C)=>`<path d="M24 41 4.5 23A27 27 0 0 1 43.5 23Z" fill="url(#tkpp)" stroke="${E}" stroke-width="1"/>
    <path d="M9 22.5q6-6 10-1t9-4 11 3" fill="none" stroke="${C}" stroke-opacity=".75" stroke-width="2.2" stroke-linecap="round"/><circle cx="33" cy="15" r="3" fill="#e2484c" fill-opacity=".8"/>
    <g stroke="${M}" stroke-width="1.6" stroke-linecap="round"><path d="M24 41 6 23.5M24 41 10.5 15.5M24 41 17 10.8M24 41V9.3M24 41 31 10.8M24 41 37.5 15.5M24 41 42 23.5"/></g>
    <path d="M4.5 23A27 27 0 0 1 43.5 23" fill="none" stroke="${M}" stroke-width="2.2"/><circle cx="24" cy="41" r="3" fill="${G}" stroke="${E}" stroke-width=".7"/><path d="M24 44v3" stroke="${C}" stroke-width="1.6"/>`,
  flute:(M,E,G,C)=>`<g transform="rotate(-38 24 24)"><rect x="3" y="20.5" width="40" height="7" rx="3.5" fill="${M}" stroke="${E}" stroke-width=".9"/><path d="M5 22.4h36" stroke="#fff" stroke-opacity=".5" stroke-width="1"/>
    <g fill="#1a1a1a" fill-opacity=".75"><circle cx="17" cy="24" r="1.3"/><circle cx="22" cy="24" r="1.3"/><circle cx="27" cy="24" r="1.3"/><circle cx="32" cy="24" r="1.3"/></g>
    <rect x="7" y="20.1" width="2.4" height="7.8" fill="url(#tkm4)"/><rect x="37" y="20.1" width="2.4" height="7.8" fill="url(#tkm4)"/></g>
    <path d="M36.5 32q1 5-1 10" fill="none" stroke="${C}" stroke-width="1.4"/><circle cx="36.4" cy="32" r="2.3" fill="${G}"/><path d="M33.5 41l2 6 2-6Z" fill="${C}"/>`,
  staff:(M,E,G,C)=>`<g transform="rotate(30 24 24)"><rect x="22.3" y="14" width="3.4" height="33" rx="1.6" fill="url(#tkwd)"/><path d="M22.3 26h3.4M22.3 36h3.4" stroke="url(#tkm4)" stroke-width="1.6"/>
    <circle cx="24" cy="9" r="10" fill="url(#tkgl)" opacity=".55"/><path d="M15.5 12Q15 2 24 1q-6 4-5 11Z M32.5 12Q33 2 24 1q6 4 5 11Z" fill="${M}" stroke="${E}" stroke-width=".7"/>
    <circle cx="24" cy="9.2" r="5.2" fill="${G}" stroke="${E}" stroke-width=".7"/><circle cx="22.3" cy="7.4" r="1.4" fill="#fff" fill-opacity=".85"/><path d="M20 14.5h8l-1.5 2.5h-5Z" fill="${M}" stroke="${E}" stroke-width=".6"/></g>`,
  hammer:(M,E,G,C)=>`<g transform="rotate(-35 24 24)"><rect x="22.4" y="16" width="3.2" height="30" rx="1.5" fill="url(#tkwd)"/><path d="M22.4 40h3.2M22.4 43h3.2" stroke="#c9a060" stroke-width=".8"/>
    <path d="M10 6h28l2 3v8l-2 3H10l-2-3V9Z" fill="${M}" stroke="${E}" stroke-width="1"/><path d="M10 7.5h28" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"/>
    <rect x="8" y="10" width="32" height="2.2" fill="${E}" fill-opacity=".35"/><circle cx="24" cy="13" r="3.2" fill="${G}" stroke="${E}" stroke-width=".7"/>
    <g fill="url(#tkm4)"><circle cx="12.5" cy="16.5" r="1.2"/><circle cx="35.5" cy="16.5" r="1.2"/><circle cx="12.5" cy="9" r="1.2"/><circle cx="35.5" cy="9" r="1.2"/></g></g>`,
  helmet:(M,E,G,C)=>`<path d="M24 3q3 3 2 9" fill="none" stroke="${C}" stroke-width="3.5" stroke-linecap="round"/><path d="M8.5 30A15.5 15.5 0 0 1 39.5 30Z" fill="${M}" stroke="${E}" stroke-width="1"/>
    <path d="M13 27a11 11 0 0 1 10-11" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/><path d="M5 29.5h38l-2.5 6h-33Z" fill="url(#tkm4)" stroke="#5a3a08" stroke-width=".9"/>
    <path d="M14 35.5 12 44l6-3 1-5.5M34 35.5 36 44l-6-3-1-5.5" fill="${M}" stroke="${E}" stroke-width=".8"/><path d="M24 15l4 6.5-4 6.5-4-6.5Z" fill="${G}" stroke="${E}" stroke-width=".7"/>`,
  armor:(M,E,G,C)=>`<path d="M17 5h14l12 8-4.5 8-4.5-3v25H14V18l-4.5 3L5 13Z" fill="${M}" stroke="${E}" stroke-width="1"/><path d="M17 5 24 17 31 5" fill="none" stroke="url(#tkm4)" stroke-width="2.4"/>
    <path d="M24 17v26" stroke="${E}" stroke-opacity=".5" stroke-width="1"/><path d="M8 12.5l6 4M40 12.5l-6 4" stroke="#fff" stroke-opacity=".4" stroke-width="1.2"/>
    <rect x="13.5" y="27" width="21" height="4.6" rx="1" fill="url(#tkm4)" stroke="#5a3a08" stroke-width=".8"/><circle cx="24" cy="29.3" r="2.4" fill="${G}" stroke="${E}" stroke-width=".6"/>
    <path d="M14 43h20" stroke="url(#tkm4)" stroke-width="2"/>`,
  vest:(M,E,G,C)=>{let sc='';for(let r=0;r<4;r++)for(let c=0;c<5;c++){const x=15.2+c*4.4+(r%2?2.2:0),y=17+r*5;if(x<34)sc+=`<path d="M${x-2.2} ${y}a2.2 2.6 0 0 0 4.4 0" fill="none" stroke="${E}" stroke-opacity=".55" stroke-width=".9"/>`;}
    return`<path d="M7 9q5-4 9-1l8 3 8-3q4-3 9 1l-2 9-3 1v24H13V19l-3-1Z" fill="${M}" stroke="${E}" stroke-width="1"/>${sc}
    <path d="M7 9q5-4 9-1l1 7-8 1Z M41 9q-5-4-9-1l-1 7 8 1Z" fill="url(#tkm4)" stroke="#5a3a08" stroke-width=".7"/><circle cx="24" cy="14" r="2.6" fill="${G}" stroke="${E}" stroke-width=".6"/>
    <path d="M13 40h22" stroke="url(#tkm4)" stroke-width="2.2"/>`;},
  gloves:(M,E,G,C)=>`<path d="M14 44V27l-3.5-5.5q-1-2 1-2.5t3.5 2.5l1 1V9q0-2.2 2-2.2t2 2.2v10h1V6q0-2.2 2.1-2.2T25.2 6v13h1V7.5q0-2.2 2-2.2t2 2.2V20h1v-9q0-2.2 2-2.2t2 2.2v18l-2 7v8Z" fill="${M}" stroke="${E}" stroke-width="1"/>
    <path d="M18 9v9M23 6.5v11M28 8v10M33 11v8" stroke="#fff" stroke-opacity=".45" stroke-width="1.1"/><rect x="12.5" y="34" width="23" height="6" rx="1.5" fill="url(#tkm4)" stroke="#5a3a08" stroke-width=".8"/><circle cx="24" cy="37" r="2.2" fill="${G}"/>`,
  wrist:(M,E,G,C)=>`<path d="M12 7h24l-2.5 34h-19Z" fill="${M}" stroke="${E}" stroke-width="1"/><path d="M15 9l2 30" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"/>
    <path d="M11.5 12h25M12.6 34h22.8" stroke="url(#tkm4)" stroke-width="3"/><path d="M24 17l5.5 6.5L24 30l-5.5-6.5Z" fill="url(#tkm4)" stroke="#5a3a08" stroke-width=".7"/><circle cx="24" cy="23.5" r="2.6" fill="${G}"/>`,
  boots:(M,E,G,C)=>`<path d="M14 4h14v22l12 6q3 1.5 3 5v5H8v-6l6-5Z" fill="${M}" stroke="${E}" stroke-width="1"/><path d="M17 6v19" stroke="#fff" stroke-opacity=".5" stroke-width="1.5"/>
    <rect x="12.5" y="3" width="17" height="5.5" rx="1.5" fill="url(#tkm4)" stroke="#5a3a08" stroke-width=".8"/><path d="M8 42h35" stroke="#1a1008" stroke-width="3"/><path d="M28 27l4 3" stroke="url(#tkm4)" stroke-width="2"/><circle cx="21" cy="5.8" r="1.8" fill="${G}"/>`,
  amulet:(M,E,G,C)=>`<path d="M24 2v7" stroke="#c03030" stroke-width="1.6"/><circle cx="24" cy="21" r="12.5" fill="${M}" stroke="${E}" stroke-width="1.1"/><circle cx="24" cy="21" r="5.2" fill="#1a1a1a" fill-opacity=".55"/>
    <circle cx="24" cy="21" r="9" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/><path d="M24 12.5v3M24 26.5v3M15.5 21h3M29.5 21h3" stroke="${E}" stroke-width="1.2"/><circle cx="24" cy="21" r="3" fill="${G}"/>
    <path d="M24 33.5v4" stroke="url(#tkm4)" stroke-width="2.4"/><path d="M21 37.5h6l1.5 9h-9Z" fill="${C}" stroke="${E}" stroke-opacity=".5" stroke-width=".6"/><path d="M22.5 39v7M25.5 39v7" stroke="#000" stroke-opacity=".25"/>`,
  necklace:(M,E,G,C)=>{let b='';for(let i=0;i<=10;i++){const a=Math.PI*(0.08+0.84*i/10),x=24-18*Math.cos(a),y=4+16*Math.sin(a);b+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="${M}" stroke="${E}" stroke-width=".5"/>`;}
    return b+`<path d="M24 22l-5 2 5 21 5-21Z" fill="url(#tkm4)" stroke="#5a3a08" stroke-width=".8"/><path d="M24 25.5l-3.4 6.5 3.4 10 3.4-10Z" fill="${G}" stroke="${E}" stroke-width=".6"/><path d="M23 29l-1 3" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/>`;},
  ring:(M,E,G,C)=>`<ellipse cx="24" cy="30" rx="14" ry="12" fill="none" stroke="${E}" stroke-width="6.5"/><ellipse cx="24" cy="30" rx="14" ry="12" fill="none" stroke="${M}" stroke-width="4.5"/>
    <path d="M13 26a12 10 0 0 1 8-6" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/><path d="M17 15h14l-2 5H19Z" fill="url(#tkm4)" stroke="#5a3a08" stroke-width=".7"/>
    <path d="M24 3l8 6-8 9-8-9Z" fill="${G}" stroke="${E}" stroke-width=".8"/><path d="M16 9h16M24 3v15M20 9l4 9 4-9" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width=".7"/>`
};
const ICON_SPARK='<path d="M39 5l1.3 3.4L43.7 9.7 40.3 11 39 14.4 37.7 11 34.3 9.7 37.7 8.4Z" fill="#fff"/>';
function itemIconSVG(slot,wtype,tier,rar,set,god){const key=slot==='weapon'?(ICON_DRAW[wtype]?wtype:'sword'):slot,fn=ICON_DRAW[key]||ICON_DRAW.ring;
  const mi=god?'G':set?'S':iconMat(tier|0),c=god?ICON_GOD:set?ICON_SET:ICON_MAT[mi],gi=god?3:set?4:clamp(rar|0,0,4);
  return`<svg viewBox="0 0 48 48">${fn(`url(#tkm${mi})`,c[2],`url(#tkg${gi})`,ICON_GEM[gi])}${god||set||rar>=3?ICON_SPARK:''}</svg>`;}
// ô biểu tượng hoàn chỉnh của một món
function itemIcon(it,size){if(!it)return'';const cls=it.god?'god':it.set?'set':'r'+(it.rar|0);
  return`<span class="itile ${cls}${size?' '+size:''}">${itemIconSVG(it.slot,it.wtype,it.tier,it.rar,it.set,it.god)}</span>`;}
// vật phẩm tiêu hao (cửa hàng)
const CONS_DRAW={
  hp:()=>`<path d="M24 6q3 0 3 3v3q8 3 8 13a11 11 0 0 1-22 0q0-10 8-13V9q0-3 3-3Z" fill="url(#tkcR)" stroke="#5a0a0a" stroke-width="1"/><rect x="20.5" y="3" width="7" height="5" rx="1.5" fill="url(#tkwd)"/><path d="M17.5 22q1-5 5-7" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M19 31h10M24 26v10" stroke="#fff" stroke-width="2.4"/>`,
  mp:()=>`<path d="M24 6q3 0 3 3v3q8 3 8 13a11 11 0 0 1-22 0q0-10 8-13V9q0-3 3-3Z" fill="url(#tkcB)" stroke="#0a2a5a" stroke-width="1"/><rect x="20.5" y="3" width="7" height="5" rx="1.5" fill="url(#tkwd)"/><path d="M17.5 22q1-5 5-7" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M24 25l4 6-4 6-4-6Z" fill="#dff4ff"/>`,
  exp2:()=>`<circle cx="24" cy="24" r="17" fill="url(#tkgl)" opacity=".5"/><circle cx="24" cy="25" r="11" fill="url(#tkg3)" stroke="#7a4a00" stroke-width="1"/><text x="24" y="30" font-size="13" font-weight="900" text-anchor="middle" fill="#7a3a00">2</text>`,
  exp3:()=>`<circle cx="24" cy="24" r="20" fill="url(#tkgl)" opacity=".6"/><path d="M24 4q5 6 2 10 6-2 6 6" fill="none" stroke="#ff6a20" stroke-width="2"/><circle cx="24" cy="26" r="12" fill="url(#tkg4)" stroke="#6a0a20" stroke-width="1"/><text x="24" y="31.5" font-size="14" font-weight="900" text-anchor="middle" fill="#fff">3</text>`,
  tp:()=>`<rect x="9" y="11" width="30" height="26" rx="2" fill="url(#tkpp)" stroke="#6a4a20" stroke-width="1"/><rect x="6" y="9" width="5" height="30" rx="2.5" fill="url(#tkwd)"/><rect x="37" y="9" width="5" height="30" rx="2.5" fill="url(#tkwd)"/><path d="M18 17h12M18 21h12M18 25h8" stroke="#3a2a1a" stroke-width="1.4"/><circle cx="28" cy="30" r="4" fill="#d02a2a"/><path d="M26 30h4M28 28v4" stroke="#fff" stroke-width="1"/>`,
  luck:()=>`<path d="M14 5h20v38l-10-5-10 5Z" fill="#ffe25a" stroke="#a07000" stroke-width="1"/><path d="M19 11h10M24 11v6M19 20q5 4 10 0M20 27l8 6M28 27l-8 6" stroke="#c81a1a" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  revive:()=>`<circle cx="24" cy="24" r="20" fill="url(#tkgl)" opacity=".55"/><circle cx="24" cy="24" r="12" fill="#fff" stroke="#7a5a00" stroke-width="1.2"/><path d="M24 12a12 12 0 0 1 0 24a6 6 0 0 1 0-12a6 6 0 0 0 0-12Z" fill="#2a2a2a"/><circle cx="24" cy="18" r="2" fill="#2a2a2a"/><circle cx="24" cy="30" r="2" fill="#fff"/><circle cx="24" cy="24" r="12" fill="none" stroke="url(#tkm4)" stroke-width="2"/>`,
  petfood:()=>`<circle cx="24" cy="26" r="13" fill="url(#tkg1)" stroke="#1a5a2a" stroke-width="1"/><g fill="#1a4a22" fill-opacity=".8"><ellipse cx="24" cy="30" rx="4.5" ry="3.6"/><circle cx="18.5" cy="24" r="2"/><circle cx="22" cy="20.5" r="2"/><circle cx="26" cy="20.5" r="2"/><circle cx="29.5" cy="24" r="2"/></g>`,
  dichdung:()=>`<circle cx="24" cy="20" r="13" fill="url(#tkm4)" stroke="#6a4a08" stroke-width="1"/><circle cx="24" cy="20" r="10" fill="#cfeaff"/><path d="M18 16q4-5 9-2" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="21.5" y="33" width="5" height="11" rx="2" fill="url(#tkwd)"/><circle cx="31" cy="12" r="2" fill="#ff8ad0"/>`
};
(()=>{const d=`<radialGradient id="tkcR" cx=".35" cy=".4" r=".75"><stop offset="0" stop-color="#ff9a8a"/><stop offset=".5" stop-color="#e01a2a"/><stop offset="1" stop-color="#6a0610"/></radialGradient><radialGradient id="tkcB" cx=".35" cy=".4" r=".75"><stop offset="0" stop-color="#a8e0ff"/><stop offset=".5" stop-color="#1a7ae0"/><stop offset="1" stop-color="#06205a"/></radialGradient>`;
  const s=document.querySelector('svg[aria-hidden] defs');if(s)s.insertAdjacentHTML('beforeend',d);})();
const CONS_OF={hp5:'hp',hp50:'hp',mp5:'mp',mp50:'mp',exp2:'exp2',exp3:'exp3',tp:'tp',tp10:'tp',luck:'luck',luck10:'luck',revive:'revive',petfood:'petfood',dichdung:'dichdung'};
const CONS_RAR={exp2:3,exp3:4,revive:4,petfood:2,luck:2,dichdung:2,tp:1,hp:0,mp:0};
function consIcon(id,size){const k=CONS_OF[id]||id,f=CONS_DRAW[k];if(!f)return'';return`<span class="itile r${CONS_RAR[k]|0}${size?' '+size:''}"><svg viewBox="0 0 48 48">${f()}</svg></span>`;}
