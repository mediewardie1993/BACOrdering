// ---------- 3D world: walk Rie around and interact to open dialogues & mini-games ----------
(function(){
const canvas=document.getElementById('world');
const ui=document.getElementById('ui3d');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
const scene=new THREE.Scene();
scene.background=new THREE.Color(0xbfe3ff);
scene.fog=new THREE.Fog(0xbfe3ff,40,80);
const camera=new THREE.PerspectiveCamera(50,1,0.1,200);
scene.add(new THREE.HemisphereLight(0xffffff,0x7a6a55,0.85));
const sun=new THREE.DirectionalLight(0xfff1dd,0.7); sun.position.set(10,20,8); scene.add(sun);

function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);canvas.style.width=w+'px';canvas.style.height=h+'px';camera.aspect=w/h;camera.updateProjectionMatrix();}
addEventListener('resize',resize); resize();

const M=c=>new THREE.MeshLambertMaterial({color:c});
function box(w,h,d,c,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),typeof c==='number'?M(c):c);m.position.set(x,y,z);parent.add(m);return m;}
function cyl(rt,rb,h,c,x,y,z,parent=scene,seg=16){const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg),typeof c==='number'?M(c):c);m.position.set(x,y,z);parent.add(m);return m;}
function sph(r,c,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,16),typeof c==='number'?M(c):c);m.position.set(x,y,z);parent.add(m);return m;}
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'));const t=new THREE.CanvasTexture(c);return t;}
function label(text,color='#3b2a24'){
  const t=canvasTex(256,64,g=>{g.fillStyle='rgba(255,255,255,.88)';g.beginPath();g.roundRect?g.roundRect(4,8,248,48,20):g.rect(4,8,248,48);g.fill();g.fillStyle=color;g.font='bold 30px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,128,33);});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));s.scale.set(3.4,.85,1);return s;
}
function marker(){
  const t=canvasTex(64,64,g=>{g.fillStyle='#f5c23a';g.beginPath();g.arc(32,32,28,0,7);g.fill();g.fillStyle='#3b2a24';g.font='bold 44px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('!',32,35);});
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,depthTest:false}));s.scale.set(.8,.8,1);return s;
}
function blob(parent,r=.6){const m=new THREE.Mesh(new THREE.CircleGeometry(r,20),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.22}));m.rotation.x=-Math.PI/2;m.position.y=.02;parent.add(m);}

// ---- ground & environment ----
const grass=new THREE.Mesh(new THREE.PlaneGeometry(120,80),M(0x8cc768));grass.rotation.x=-Math.PI/2;scene.add(grass);
box(120,.05,5,0x5b5b63,4,.02,13);                               // road
for(let x=-40;x<50;x+=4) box(2,.06,.25,0xffffff,x,.04,13);       // road lines
box(17,.1,17,0xc9a074,-12,.05,0);                                // house floor (wood)
box(17,2.2,.4,0xf4e3d0,-12,1.1,-8.4);                            // back wall
box(.4,2.2,17,0xf4e3d0,-20.6,1.1,0);                             // left wall
box(.4,1,7,0xf4e3d0,-3.4,.5,-5);box(.4,1,5,0xf4e3d0,-3.4,.5,6);   // front low walls w/ door gap
// roof hint (eaves along the back)
box(18,.3,3,0xb5443a,-12,2.4,-9.2);
// kitchen
box(2,1,1.2,0xdedede,-17,.5,-7.2); box(1.6,.06,.9,0x222222,-17,1.03,-7.2); sph(.25,0x444444,-16.6,1.2,-7.1); // stove + pot
box(2,1,1.2,0xcfd8dc,-13.5,.5,-7.2); box(1,.1,.6,0x8ab4c8,-13.5,1.02,-7.2);                                // sink
// living room
box(3.4,.6,1.2,0x9c5b7a,-8,.3,-7.2); box(3.4,.9,.35,0x9c5b7a,-8,.75,-7.75);   // sofa
box(2.6,.7,1.6,0x8b5a2b,-12,.35,-1);                                           // dining table
box(3,.5,2,0xffffff,-17.5,.25,5);box(3,.2,2,0xe58fa6,-17.5,.55,5);box(.8,.25,1.6,0xffffff,-18.7,.75,5);  // bed
// yard: laundry tub + clothesline
cyl(.8,.6,.7,0x4a90c8,-1,.35,-6);
cyl(.05,.05,2.2,0x777777,1,1.1,-7.5);cyl(.05,.05,2.2,0x777777,6,1.1,-7.5);box(5,.03,.03,0x777777,3.5,2.1,-7.5);
[[2,0xffffff],[3.2,0xc2364b],[4.4,0x3a7bd5]].forEach(([x,c])=>box(.7,.8,.03,c,x,1.65,-7.5));
// gate & fence
for(let z=-8;z<=10;z+=1.5){ if(z>4&&z<8) continue; box(.15,1,.15,0xffffff,0,.5,z);} box(.1,.1,18,0xffffff,0,.85,1);
// jeepney
const jeep=new THREE.Group();scene.add(jeep);jeep.position.set(9,0,13);
box(5,1.6,2.2,0xd4342f,0,1.2,0,jeep);box(5.2,.2,2.4,0xcfcfcf,0,2.1,0,jeep);box(1.2,1,2.1,0xc0c0c0,2.9,.9,0,jeep);
[[1.8,1.1],[-1.8,1.1],[1.8,-1.1],[-1.8,-1.1]].forEach(([x,z])=>{const w=cyl(.45,.45,.3,0x222222,x,.45,z,jeep);w.rotation.x=Math.PI/2;});
const jl=label('JEEPNEY','#d4342f');jl.position.set(0,3,0);jeep.add(jl);
// market stall
box(4,1,1.5,0x8b5a2b,15,.5,-4); [[0xc2364b],[0xffffff]].forEach((c,i)=>box(4.2,.1,2,i?0xffffff:0xd04a5a,15,2.6+i*.1,-4.2));
cyl(.07,.07,2.5,0x6b4a2b,13.1,1.25,-3.4);cyl(.07,.07,2.5,0x6b4a2b,16.9,1.25,-3.4);
[0xe74c3c,0xf1c40f,0x27ae60,0xe67e22,0xffffff].forEach((c,i)=>sph(.22,c,13.6+i*.7,1.2,-4));
const ml=label('Palengke','#8b5a2b');ml.position.set(15,3.4,-4);scene.add(ml);
// stage
box(7,1,4,0x3b2a24,25,.5,-6);box(7,4,.3,0x5a2a35,25,2.5,-8);cyl(.04,.04,1.5,0x222222,25,1.75,-5.5);sph(.12,0x222222,25,2.55,-5.5);
const sl=label('🎤 STAGE','#c2364b');sl.position.set(25,5,-8);scene.add(sl);
for(let i=0;i<5;i++) sph(.15,[0xff6b6b,0xffd93d,0x6bcbff,0xb36bff,0x6bff95][i],22.2+i*1.4,4.3,-7.8);
// park bench
box(2.6,.15,.8,0x8b5a2b,23,.6,9);box(2.6,.6,.12,0x8b5a2b,23,1,9.4);[-1.1,1.1].forEach(x=>box(.12,.6,.7,0x444444,23+x,.3,9));
// old tree + dark cloud
cyl(.4,.6,3,0x6b4a2b,7,1.5,-6);sph(2,0x4f7a3a,7,4,-6);
const cloud=new THREE.Group();scene.add(cloud);cloud.position.set(9,3,-5);
[[0,0,0,.9],[.8,.1,0,.7],[-.8,0,0,.7],[.3,.5,0,.6]].forEach(([x,y,z,r])=>sph(r,new THREE.MeshLambertMaterial({color:0x4b4b5a,transparent:true,opacity:.85}),x,y,z,cloud));
// schools (decor, across the road)
[[ -2,'St. Jude',0xf0d58c],[ 18,'Little Stars',0x9fd3f0]].forEach(([x,n,c])=>{box(6,3.5,3,c,x,1.75,19);box(6.4,.4,3.4,0xb5443a,x,3.7,19);const l=label(n);l.position.set(x,4.6,19);scene.add(l);});
// trees
[[-26,-10],[-24,10],[30,2],[32,12],[12,6],[-2,-12],[18,-11]].forEach(([x,z])=>{cyl(.25,.35,2,0x6b4a2b,x,1,z);sph(1.3,0x5f9e45,x,2.6,z);});
// flowers
for(let i=0;i<40;i++){sph(.12,[0xff8fab,0xffd166,0xffffff][i%3],Math.random()*30-2,.12,Math.random()*6-12+ (i%2?18:0));}

// ---- characters ----
const SKIN=0xf3c2a2;
function dressTexture(){return canvasTex(128,128,g=>{g.fillStyle='#141010';g.fillRect(0,0,128,128);for(let i=0;i<26;i++){const x=Math.random()*128,y=Math.random()*128;g.fillStyle='#c2364b';g.beginPath();g.arc(x,y,4,0,7);g.fill();g.fillStyle='#5b7a3c';g.beginPath();g.arc(x+4,y-3,1.8,0,7);g.fill();}});}
function person(o){
  const g=new THREE.Group(); const s=o.scale||1; const inner=new THREE.Group(); inner.scale.setScalar(s); g.add(inner);
  const legs=[-.15,.15].map(x=>{const l=cyl(.09,.08,.8,o.legs||SKIN,x,.4,0,inner);return l;});
  legs.forEach(l=>{l.geometry.translate(0,-.4,0);l.position.y=.8;});
  const body=o.dress? cyl(.28,.5,1,o.dressMat||o.top,0,1.15,0,inner) : cyl(.3,.32,.9,o.top,0,1.2,0,inner);
  if(o.dress){ cyl(.2,.28,.35,o.dressMat||o.top,0,1.75,0,inner); }
  const arms=[-.38,.38].map(x=>{const a=cyl(.07,.07,.75,o.dress?SKIN:o.top,x,1.45,0,inner);a.geometry.translate(0,-.35,0);a.position.y=1.8;return a;});
  cyl(.09,.1,.2,SKIN,0,1.98,0,inner);
  const head=sph(.33,SKIN,0,2.3,0,inner);
  // face
  sph(.045,0x2a1a14,-.11,2.33,.3,inner);sph(.045,0x2a1a14,.11,2.33,.3,inner);
  const mouth=box(.12,.025,.02,0xb5434e,0,2.18,.31,inner);
  // hair
  if(o.hair!==null){
    const hc=o.hair||0x2a1a14;
    sph(.35,hc,0,2.42,-.1,inner);
    if(o.longHair){ box(.75,1.0,.25,hc,0,1.8,-.22,inner); box(.18,.8,.3,hc,-.33,1.9,.02,inner); box(.18,.8,.3,hc,.33,1.9,.02,inner); }
    if(o.bun) sph(.18,hc,0,2.68,-.2,inner);
  }
  if(o.earrings){ [-.33,.33].forEach(x=>{const t=new THREE.Mesh(new THREE.TorusGeometry(.06,.015,8,16),M(0xd4a23a));t.position.set(x,2.2,0);t.rotation.y=Math.PI/2;inner.add(t);}); }
  if(o.necklace){ const n=new THREE.Mesh(new THREE.TorusGeometry(.17,.012,6,24,Math.PI),M(0xd4a23a));n.position.set(0,1.95,.12);n.rotation.set(Math.PI*0.62,0,Math.PI);inner.add(n);box(.05,.07,.02,0xd4a23a,0,1.82,.22,inner);
    // dress straps
    [-.13,.13].forEach(x=>box(.05,.3,.05,0x141010,x,1.98,.08,inner)); }
  if(o.glasses){ box(.32,.05,.02,0x222222,0,2.33,.32,inner); }
  blob(g,.5*s);
  g.userData={legs,arms,head,inner};
  scene.add(g); return g;
}
function cat(color,eyes){
  const g=new THREE.Group();
  const b=sph(.32,color,0,.35,0,g);b.scale.set(1,.8,1.5);
  sph(.22,color,0,.6,.42,g);
  [-.1,.1].forEach(x=>{const e=new THREE.Mesh(new THREE.ConeGeometry(.07,.15,4),M(color));e.position.set(x,.8,.4);g.add(e);sph(.03,eyes,x*.8,.63,.6,g);});
  const t=cyl(.04,.04,.6,color,0,.6,-.5,g);t.rotation.x=.6;
  g.userData.tail=t; blob(g,.4); scene.add(g); return g;
}

const rie=person({dress:true,dressMat:new THREE.MeshLambertMaterial({map:dressTexture()}),hair:0x6b3a22,longHair:true,earrings:true,necklace:true});
rie.position.set(-10,0,4);

const NPC=[];
function npc(id,mesh,x,z,mission,talk,rot=0){mesh.position.set(x,0,z);mesh.rotation.y=rot;const l=label(CAST[id]?CAST[id].name:id);l.position.set(0,3.1*(mesh.userData.inner?mesh.userData.inner.scale.x:1)+.1,0);mesh.add(l);const mk=marker();mk.position.set(0,3.8,0);mesh.add(mk);NPC.push({id,mesh,mission,talk,mk});return mesh;}
function station(name,x,z,mission,y=2.2){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);const l=label(name);l.position.set(0,y,0);g.add(l);const mk=marker();mk.position.set(0,y+.8,0);g.add(mk);NPC.push({id:name,mesh:g,mission,mk,isStation:true});}

npc('mom',person({top:0x7a5a9e,hair:0x8a8a8a,bun:true,legs:0x5a4a6e,scale:1}),-11,1.5,null,'mom',Math.PI);
npc('joy',person({top:0x7fc8c0,hair:0x2a1a14,longHair:true,legs:0x2f4f4f}),-6,3,null,'joy');
npc('lyn',person({top:0xd97a2b,hair:0x3a2216,bun:true,legs:0x333366,glasses:true}),-15,1,null,'lyn');
npc('migo',person({top:0xffffff,legs:0x2a4a8a,hair:0x1a1010,scale:.62}),5,9.5,'school1');
npc('pao',person({top:0x7ec850,legs:0x3a5a2a,hair:0x1a1010,scale:.48}),6.5,9.5,'school2');
npc('midwardo',person({top:0x2f5d8a,legs:0x333333,hair:0x1a1010,scale:1.08}),1.5,6,'bf',null,-Math.PI/2);
npc('bea',person({top:0x6d7fa8,hair:0x2a1a14,longHair:true,legs:0x444444}),23,8.4,'friend');
npc('vendor',person({top:0xa0522d,hair:0xcccccc,bun:true,legs:0x5a3a2a}),15,-2.4,'market',null,Math.PI);
npc('manager',person({top:0x333333,hair:0x1a1010,legs:0x222222,glasses:true}),22,-3,'gig');
const sundae=cat(0xf8f6f2,0x3a7bd5); const tofi=cat(0x1b1b1b,0xf5c23a);
sundae.position.set(-8.8,.62,-7.1); tofi.position.set(-7.2,.62,-7.1); sundae.rotation.y=.3; tofi.rotation.y=-.3;
NPC.push({id:'cats',mesh:sundae,mission:'cats',mk:(()=>{const m=marker();m.position.set(.8,1.6,0);sundae.add(m);const l=label('Sundae & Tofi');l.position.set(.8,1.1,0);sundae.add(l);return m;})()});
station('🍳 Stove',-17,-6.2,'prep');
station('🍽️ Sink',-13.5,-6.2,'dishes');
station('👕 Laundry',-1,-4.8,'laundry');
station('☁️ Old memories',9,-4,'letgo',4.6);
station('🛏️ Sleep',-17.5,3.4,'sleep',1.6);

// ---- HUD ----
ui.innerHTML=`
<style>
#world{position:fixed;inset:0;display:block;touch-action:none}
#ui3d{position:fixed;inset:0;pointer-events:none;z-index:2}
#ui3d .top{position:absolute;left:8px;top:8px;display:flex;gap:8px;align-items:center;background:#2b1d19dd;color:#fff;border-radius:14px;padding:6px 12px 6px 6px;pointer-events:auto}
#ui3d .top img{width:42px;height:42px;border-radius:50%;object-fit:cover;object-position:50% 18%;border:2px solid #d4a23a}
#ui3d .top small{opacity:.85;font-size:12px}
#ui3d .bar{width:150px;height:6px;background:#ffffff33;border-radius:4px;overflow:hidden;margin:3px 0}
#ui3d .bar i{display:block;height:100%;background:#d4a23a}
#ui3d .rbtn{position:absolute;pointer-events:auto;border:0;border-radius:14px;background:#2b1d19dd;color:#fff;font-weight:700;font-size:15px;padding:10px 14px}
#act{right:24px;bottom:28px;width:110px;height:110px;background:#c2364b!important;font-size:16px!important;border-radius:50%!important;box-shadow:0 4px 0 #8e2032;border:3px solid #fff!important}
#act.off{background:#2b1d1999!important;box-shadow:none;opacity:.7}
#joy{position:absolute;left:0;top:60px;bottom:0;width:50%;pointer-events:auto}
#stick{position:absolute;left:30px;bottom:30px;width:130px;height:130px;border-radius:50%;background:#2b1d1955;border:3px solid #fff;pointer-events:none}
#stick::after{content:'⬆\\A⬅ ➡\\A⬇';white-space:pre;position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff9;font-size:14px;line-height:1.5}
#stick i{position:absolute;left:40px;top:40px;width:50px;height:50px;border-radius:50%;background:#fff;box-shadow:0 2px 6px #0005;z-index:1}
#hint{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);background:#2b1d19aa;color:#fff;padding:6px 12px;border-radius:10px;font-size:13px;white-space:nowrap}
</style>
<div id="joy"><div id="stick"><i></i></div></div>
<div class="top" id="topbar"></div>
<button class="rbtn" id="mlist" style="right:12px;top:10px">📋 Missions</button>
<button class="rbtn" id="act">💬 Talk</button>
<div id="hint">🕹️ Joystick to walk · red button to talk / start</div>`;
const actBtn=document.getElementById('act');
document.getElementById('mlist').onclick=()=>missionsPanel();
function refreshHUD(){
  const pct=Math.min(100,Math.round(S.money/GOAL*100));
  document.getElementById('topbar').innerHTML=`<img src="rie.jpg"><div><b>Day ${S.day}/${DAYS}</b> · 💰 ${peso(S.money)}<div class="bar"><i style="width:${pct}%"></i></div><small>⚡ ${S.energy} · ❤️ ${S.heart} · Chores left: ${CHORES.filter(c=>!S.done[c.id]).length}</small></div>`;
  NPC.forEach(n=>{ n.mk.visible = n.mission && n.mission!=='sleep' ? !S.done[n.mission] : false; });
  const night=S.done.gig; scene.background.set(night?0x2c3e66:0xbfe3ff); scene.fog.color.set(night?0x2c3e66:0xbfe3ff);
}

// ---- input: virtual joystick + keyboard ----
const joy=document.getElementById('joy'), stick=document.getElementById('stick'), knob=stick.firstChild;
let jv={x:0,y:0}, jo=null;
function jstart(x,y){const r=stick.getBoundingClientRect();jo={x:r.left+r.width/2,y:r.top+r.height/2};jmove(x,y);}
function jmove(x,y){if(!jo)return;let dx=x-jo.x,dy=y-jo.y;const d=Math.hypot(dx,dy),m=50;if(d>m){dx*=m/d;dy*=m/d;}jv={x:dx/m,y:dy/m};knob.style.transform=`translate(${dx}px,${dy}px)`;}
function jend(){jo=null;jv={x:0,y:0};knob.style.transform='';}
joy.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];jstart(t.clientX,t.clientY);},{passive:false});
joy.addEventListener('touchmove',e=>{e.preventDefault();const t=e.changedTouches[0];jmove(t.clientX,t.clientY);},{passive:false});
joy.addEventListener('touchend',jend);joy.addEventListener('touchcancel',jend);
let mdown=false;joy.addEventListener('mousedown',e=>{mdown=true;jstart(e.clientX,e.clientY);});addEventListener('mousemove',e=>mdown&&jmove(e.clientX,e.clientY));addEventListener('mouseup',()=>{if(mdown){mdown=false;jend();}});
const keys={};addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=1;if(e.key===' '||e.key==='e')actBtn.click();});addEventListener('keyup',e=>keys[e.key.toLowerCase()]=0);

// ---- interaction ----
let near=null;
const TALK={
  mom:()=>{const left=CHORES.filter(c=>!S.done[c.id]);return left.length?[{who:'mom',t:`Anak, ${left.length} chore${left.length>1?'s':''} left: ${left.map(l=>l.ic).join(' ')}. Kaya mo \'yan!`}]:[{who:'mom',t:'All the chores are done! Ang sipag ng anak ko. Rest a little before your gig, ha?'}];},
  joy:()=>[{who:'joy',t:['Thank you for bringing the boys, bunso. Miggy says you sing the best lullabies.','Miguel\'s teacher said he used three new picture cards this week! 🥹','If Midwardo offers to help, LET him, Rie. Hay naku.','Rent is almost covered — I can feel it. Galing mo!','Front row tonight. I\'m bringing a banner!'][S.day-1]}],
  lyn:()=>[{who:'lyn',t:['Sorry for leaving you all the chores, bunso. Overtime pays for Miguel\'s therapy.','Don\'t mix my white uniform with the colored clothes ha! 😅','Block those fake friends already. Your peace > their opinions.','You deserve a day off after this week. I\'ll cover next week, promise.','I already cried twice today and the concert hasn\'t even started.'][S.day-1]}],
};
function interact(n){
  if(!n) return;
  if(n.mission==='sleep') return endDay();
  if(n.talk) return dialogue(TALK[n.talk](),hub);
  if(n.mission && S.done[n.mission]){
    const after={school1:[{who:'migo',t:'I\'m already at school, Tita! (…this is my ghost waving 👋)'}],school2:[{who:'pao',t:'(Miguel waves bye-bye with both hands.)'}],bf:[{who:'midwardo',t:'I loved it, babe. Really. 😅 Go rest, I\'ll handle the gate.'}],friend:[{who:'bea',t:'I\'m okay for today. Go, you have a gig! 💛'}],cats:[{who:'tofi',t:'(Tofi is asleep in a loaf shape. Do not disturb.)'}]}[n.mission];
    if(after) return dialogue(after,hub);
    return toast('Already done today ✔');
  }
  if(n.mission) startMission(n.mission);
}
actBtn.onclick=()=>{ if(near) interact(near); else toast('Walk closer to someone or something with a ❗'); };

// ---- loop ----
const clock=new THREE.Clock(); let walkT=0;
const camOff=new THREE.Vector3(0,9,9);
function overlayOpen(){return document.getElementById('app').childElementCount>0;}
function tick(){
  requestAnimationFrame(tick);
  const dt=Math.min(.05,clock.getDelta());
  if(overlayOpen()) return;
  let mx=jv.x+((keys.d||keys.arrowright)?1:0)-((keys.a||keys.arrowleft)?1:0);
  let mz=jv.y+((keys.s||keys.arrowdown)?1:0)-((keys.w||keys.arrowup)?1:0);
  const mag=Math.min(1,Math.hypot(mx,mz)); const ud=rie.userData;
  if(mag>.1){
    const sp=6*mag*dt; rie.position.x=Math.max(-20,Math.min(29,rie.position.x+mx/Math.hypot(mx,mz)*sp)); rie.position.z=Math.max(-7.6,Math.min(15.5,rie.position.z+mz/Math.hypot(mx,mz)*sp));
    const target=Math.atan2(mx,mz); let d=target-rie.rotation.y; d=Math.atan2(Math.sin(d),Math.cos(d)); rie.rotation.y+=d*Math.min(1,dt*12);
    walkT+=dt*10*mag;
  } else walkT*=.8;
  const sw=Math.sin(walkT)*.6*Math.min(1,Math.abs(walkT)>0.01?1:0);
  ud.legs[0].rotation.x=sw;ud.legs[1].rotation.x=-sw;ud.arms[0].rotation.x=-sw;ud.arms[1].rotation.x=sw;ud.inner.position.y=Math.abs(Math.sin(walkT))*.06;
  // idle animations
  const t=clock.elapsedTime;
  NPC.forEach((n,i)=>{ if(n.mesh.userData.inner){n.mesh.userData.inner.position.y=Math.sin(t*2+i)*.02; const dx=rie.position.x-n.mesh.position.x,dz=rie.position.z-n.mesh.position.z; if(Math.hypot(dx,dz)<4) n.mesh.rotation.y=Math.atan2(dx,dz);} });
  tofi.userData.tail.rotation.z=Math.sin(t*2)*.4; sundae.userData.tail.rotation.z=Math.sin(t*2+1)*.4;
  cloud.position.y=3+Math.sin(t)*.2; cloud.visible=!S.done.letgo;
  // nearest interactable
  near=null; let bd=2.6;
  NPC.forEach(n=>{const p=n.mesh.getWorldPosition(new THREE.Vector3());const d=Math.hypot(p.x-rie.position.x,p.z-rie.position.z);if(d<bd){bd=d;near=n;}});
  actBtn.classList.toggle('off',!near);
  if(near){ const done=near.mission&&S.done[near.mission];
    actBtn.textContent = near.mission==='sleep'?'🌙 End the day': near.talk||done ? '💬 Talk' : near.isStation ? '▶ Start' : '💬 Talk'; }
  else actBtn.textContent='✋ Action';
  camera.position.copy(rie.position).add(camOff); camera.lookAt(rie.position.x,rie.position.y+1.2,rie.position.z);
  renderer.render(scene,camera);
}
tick();

window.hub=function(){ clearTimers(); backHandler=title; document.getElementById('app').innerHTML=''; refreshHUD(); };
window.onTitle=()=>{};
})();
