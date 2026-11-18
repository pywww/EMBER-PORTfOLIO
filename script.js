const hero=document.querySelector('.hero'),video=document.querySelector('.hero-video'),oceanWake=document.querySelector('.ocean-wake'),menuButton=document.querySelector('.menu-toggle'),mobileMenu=document.querySelector('.mobile-menu'),backdrop=document.querySelector('.mobile-backdrop');
const copy={en:{navAbout:'ABOUT',navInternship:'INTERNSHIP',navProjects:'PROJECTS',navNotes:'FIELD_NOTES',heroLine1:'I question, shape,',heroLine2:'and build',heroLine3:'products.',thinkingTitle:'[ PRODUCT_THINKING ]',thinkingBody:'Turning ambiguous problems into clear product choices.',buildingTitle:'[ BUILDING ]',buildingBody:'Vibe-coded prototypes that make ideas testable.',explorationTitle:'[ EXPLORATION ]',explorationBody:'Connecting AI capabilities with real human needs.',cta:'EXPLORE PROJECTS',cardBadge:'AI PRODUCT MANAGER — PORTFOLIO',cardBody:'Exploring how AI becomes a useful product — through real work, rapid prototypes, and considered decisions.',cardLink:'VIEW_PRODUCT_APPROACH',drawerTitle:'[ AI PROJECTS ]',drawerBody:'Two independent product case studies will live here.',projectOne:'01. Vibe Coding project A',projectTwo:'02. Vibe Coding project B'},zh:{navAbout:'关于我',navInternship:'实习经历',navProjects:'AI 项目',navNotes:'产品笔记',heroLine1:'从问题出发，',heroLine2:'让想法成形，',heroLine3:'落地产品',thinkingTitle:'[ 产品思考 ]',thinkingBody:'把模糊的问题转化为清晰的产品判断。',buildingTitle:'[ 动手构建 ]',buildingBody:'用 Vibe Coding 把想法变成可验证的原型。',explorationTitle:'[ 持续探索 ]',explorationBody:'连接 AI 能力与真实用户需求。',cta:'探索项目',cardBadge:'AI 产品经理 — 个人作品集',cardBody:'通过真实业务、快速原型与审慎判断，探索如何让 AI 成为真正有用的产品。',cardLink:'了解我的产品方法',drawerTitle:'[ AI 项目 ]',drawerBody:'这里将呈现两个独立的产品案例。',projectOne:'01. Vibe Coding 项目 A',projectTwo:'02. Vibe Coding 项目 B'}};
const setMenu=open=>{menuButton.setAttribute('aria-expanded',String(open));mobileMenu.setAttribute('aria-hidden',String(!open));mobileMenu.classList.toggle('is-open',open)};
const syncNodeConnectors=()=>{
  [['.node-1-connector','.node-1','left'],['.node-3-connector','.node-3','right']].forEach(([lineSelector,boxSelector,edge])=>{
    const line=document.querySelector(lineSelector),box=document.querySelector(boxSelector);
    if(!line||!box)return;
    line.setAttribute('x2',String(box.offsetLeft+(edge==='right'?box.offsetWidth:0)));
    line.setAttribute('y2',String(box.offsetTop));
  });

  const diagonal=document.querySelector('.node-2-connector');
  const horizontal=document.querySelector('.node-2-horizontal');
  const box=document.querySelector('.node-2');
  const label=document.querySelector('.label-2');
  const description=label?.querySelector('p');
  const exploration=document.querySelector('.node-3-connector');
  if(!diagonal||!horizontal||!box||!label||!description||!exploration)return;

  const explorationRun=hero.clientWidth*.05;
  const explorationRise=hero.clientHeight*.08;
  if(!explorationRun||!explorationRise)return;

  const slope=explorationRise/explorationRun;
  const lineY=label.offsetTop+description.offsetTop;
  const boxX=box.offsetLeft;
  const boxY=box.offsetTop;
  const joinX=boxX-Math.abs(lineY-boxY)/slope;
  const textRight=label.offsetLeft+label.offsetWidth;

  diagonal.setAttribute('x1',String(boxX));
  diagonal.setAttribute('y1',String(boxY));
  diagonal.setAttribute('x2',String(joinX));
  diagonal.setAttribute('y2',String(lineY));
  horizontal.setAttribute('x1',String(textRight));
  horizontal.setAttribute('y1',String(lineY));
  horizontal.setAttribute('x2',String(joinX));
  horizontal.setAttribute('y2',String(lineY));
  const thirdBox=document.querySelector('.node-3'),thirdLabel=document.querySelector('.label-3'),thirdLine=document.querySelector('.node-3-horizontal');
  if(thirdBox&&thirdLabel&&thirdLine){const x=thirdBox.offsetLeft+thirdBox.offsetWidth,y=thirdBox.offsetTop,targetY=thirdLabel.offsetTop+(thirdLabel.querySelector('p')?.offsetTop||0),joinX=Math.min(thirdLabel.offsetLeft-12,x+Math.max(0,targetY-y)/slope);exploration.setAttribute('x1',String(joinX));exploration.setAttribute('y1',String(targetY));exploration.setAttribute('x2',String(x));exploration.setAttribute('y2',String(y));thirdLine.setAttribute('x1',String(joinX));thirdLine.setAttribute('y1',String(targetY));thirdLine.setAttribute('x2',String(thirdLabel.offsetLeft-12));thirdLine.setAttribute('y2',String(targetY));}
};
const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)'),reducedMotion=window.matchMedia('(prefers-reduced-motion:reduce)');
const setupOceanWake=()=>{
  if(!oceanWake||!finePointer.matches||reducedMotion.matches)return;
  const context=oceanWake.getContext('2d'),mask=document.createElement('canvas'),maskContext=mask.getContext('2d'),texture=new Image(),traces=[];
  let hoverSpot=null,lastTrailPoint=null;
  let frame=0,lastStamp=0,canvasWidth=0,canvasHeight=0,scale=1;
  texture.src='./assets/ocean-microcosm-reveal-v2.png';
  const resizeWake=()=>{const bounds=hero.getBoundingClientRect();scale=Math.min(window.devicePixelRatio||1,2);canvasWidth=bounds.width;canvasHeight=bounds.height;[oceanWake,mask].forEach(canvas=>{canvas.width=Math.round(canvasWidth*scale);canvas.height=Math.round(canvasHeight*scale)});oceanWake.style.width=`${canvasWidth}px`;oceanWake.style.height=`${canvasHeight}px`;context.setTransform(scale,0,0,scale,0,0);maskContext.setTransform(scale,0,0,scale,0,0)};
  const stampSize=320,createMistStamp=seed=>{const stamp=document.createElement('canvas'),stampContext=stamp.getContext('2d'),center=stampSize/2,drawBlob=(x,y,radius,phase,opacity)=>{const points=32;stampContext.beginPath();for(let index=0;index<=points;index+=1){const angle=index/points*Math.PI*2,contour=.76+Math.sin(angle*3+seed+phase)*.18+Math.sin(angle*5-seed*.7)*.1+Math.sin(angle*7+seed*.4)*.04,pointRadius=radius*contour,xPoint=x+Math.cos(angle)*pointRadius,yPoint=y+Math.sin(angle)*pointRadius;index?stampContext.lineTo(xPoint,yPoint):stampContext.moveTo(xPoint,yPoint)}stampContext.closePath();stampContext.fillStyle=`rgba(255,255,255,${opacity})`;stampContext.fill()};stamp.width=stampSize;stamp.height=stampSize;stampContext.filter='blur(6px)';drawBlob(center,center,116,0,.62);drawBlob(center+25*Math.cos(seed),center+18*Math.sin(seed),76,1.9,.28);drawBlob(center-26*Math.sin(seed*.7),center+16*Math.cos(seed*.7),52,4.1,.12);for(let index=0;index<5;index+=1){const angle=seed+index*1.61,reach=86+Math.sin(seed+index)*13;drawBlob(center+Math.cos(angle)*reach,center+Math.sin(angle)*reach,19+Math.sin(seed*1.6+index)*5,index*1.7,.095)}stampContext.filter='blur(3px)';drawBlob(center+10*Math.cos(seed*1.8),center+8*Math.sin(seed*1.8),88,2.7,.16);return stamp},mistStamps=Array.from({length:6},(_,index)=>createMistStamp(index*1.37));
  const paintMist=(trace,progress,intensity=1)=>{const radius=trace.radius*(1-progress*.82),opacity=Math.pow(1-progress,1.35)*.56*intensity,diameter=radius*2.45;maskContext.save();maskContext.globalAlpha=opacity;maskContext.drawImage(trace.stamp,trace.x-diameter/2,trace.y-diameter/2,diameter,diameter);maskContext.restore()};
  const drawTexture=()=>{if(texture.complete&&texture.naturalWidth){const sourceRatio=texture.naturalWidth/texture.naturalHeight,canvasRatio=canvasWidth/canvasHeight;let width=canvasWidth,height=canvasHeight,x=0,y=0;if(sourceRatio>canvasRatio){width=canvasHeight*sourceRatio;x=(canvasWidth-width)/2}else{height=canvasWidth/sourceRatio;y=(canvasHeight-height)/2}context.drawImage(texture,x,y,width,height)}else{context.fillStyle='rgba(104,177,199,.42)';context.fillRect(0,0,canvasWidth,canvasHeight)}};
const renderWake=now=>{context.clearRect(0,0,canvasWidth,canvasHeight);maskContext.clearRect(0,0,canvasWidth,canvasHeight);maskContext.globalCompositeOperation='lighter';for(let index=traces.length-1;index>=0;index-=1){const trace=traces[index],progress=Math.min(1,(now-trace.born)/trace.life);if(progress>=1){traces.splice(index,1);continue}const tailPosition=traces.length===1?1:index/(traces.length-1),tailTaper=tailPosition<.4?.32+.68*(tailPosition/.4):1;paintMist({...trace,radius:trace.radius*tailTaper},progress)}let hoverSettling=false;if(hoverSpot){hoverSpot.x+=(hoverSpot.targetX-hoverSpot.x)*.022;hoverSpot.y+=(hoverSpot.targetY-hoverSpot.y)*.022;hoverSettling=Math.abs(hoverSpot.targetX-hoverSpot.x)+Math.abs(hoverSpot.targetY-hoverSpot.y)>.4;paintMist(hoverSpot,0,1.35)}maskContext.globalCompositeOperation='source-over';if(traces.length||hoverSpot){drawTexture();context.globalCompositeOperation='destination-in';context.drawImage(mask,0,0,canvasWidth,canvasHeight);context.globalCompositeOperation='source-over'}if(traces.length||hoverSettling)frame=requestAnimationFrame(renderWake);else frame=0};
  const setHoverSpot=event=>{const bounds=hero.getBoundingClientRect(),targetX=event.clientX-bounds.left,targetY=event.clientY-bounds.top;if(!hoverSpot)hoverSpot={x:targetX,y:targetY,targetX,targetY,stamp:mistStamps[Math.floor(Math.random()*mistStamps.length)]};hoverSpot.targetX=targetX;hoverSpot.targetY=targetY;hoverSpot.radius=Math.max(230,Math.min(bounds.width,bounds.height)*.27);if(!frame)frame=requestAnimationFrame(renderWake)};
  const leaveWake=event=>{setHoverSpot(event);const now=performance.now(),bounds=hero.getBoundingClientRect(),x=event.clientX-bounds.left,y=event.clientY-bounds.top,previous=lastTrailPoint||{x,y},distance=Math.hypot(x-previous.x,y-previous.y),baseRadius=Math.max(158,Math.min(bounds.width,bounds.height)*.19);if(now-lastStamp<32&&distance<28)return;const steps=Math.min(7,Math.max(1,Math.ceil(distance/30)));for(let index=1;index<=steps;index+=1){const progress=index/steps,taper=.18+progress*.82;traces.push({x:previous.x+(x-previous.x)*progress,y:previous.y+(y-previous.y)*progress,radius:baseRadius*taper,born:now,life:7000,stamp:hoverSpot.stamp})}if(traces.length>48)traces.splice(0,traces.length-48);lastTrailPoint={x,y};lastStamp=now;if(!frame)frame=requestAnimationFrame(renderWake)};
  const clearHoverSpot=()=>{hoverSpot=null;lastTrailPoint=null;if(!traces.length)context.clearRect(0,0,canvasWidth,canvasHeight)};
  resizeWake();window.addEventListener('resize',resizeWake);hero.addEventListener('pointerenter',setHoverSpot,{passive:true});hero.addEventListener('pointermove',leaveWake,{passive:true});hero.addEventListener('pointerleave',clearHoverSpot,{passive:true});
};
setupOceanWake();
menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));backdrop.addEventListener('click',()=>setMenu(false));mobileMenu.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false)});video.addEventListener('error',()=>hero.classList.add('video-error'));video.addEventListener('canplay',()=>hero.classList.remove('video-error'));window.setTimeout(()=>{if(video.readyState<2)hero.classList.add('video-error')},2500);
document.documentElement.lang='en';window.addEventListener('resize',syncNodeConnectors);window.addEventListener('load',syncNodeConnectors);syncNodeConnectors();
