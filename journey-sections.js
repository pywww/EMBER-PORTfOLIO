/* Native document scrolling; original page markup remains the source of each section. */
(() => {
 'use strict';
 if (window.self !== window.top) return;
 const about=document.querySelector('.journey-about:not(.journey-stage)') || document.querySelector('body.about-page > .about-main');
 if(!about)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const container=document.createElement('div');container.className='journey-sections';about.after(container);
 const sources=[{id:'projects',url:'./ai-projects.html',selector:'.detail-main',page:'projects-page',css:'./projects.css?v=20261115-no-line-10'}, {id:'internship',url:'./internship.html',selector:'.internship-main',page:'internship-page',css:'./internship.css?v=20261117-work-entrance'}];
 const sections=sources.map(source=>{
  const host=document.createElement('section');host.className='journey-section';host.id=`journey-${source.id}`;host.tabIndex=-1;host.setAttribute('aria-label',source.id==='projects'?'项目':'实习经历');container.append(host);
  const root=host.attachShadow({mode:'open'});
  const base=document.createElement('style');base.textContent=`:host{display:block;--accent:#afddff;--paper:#f4f8fb;--muted:#8d9aa5;--line:rgba(175,221,255,.18);color:#edf5fb;font-family:Manrope,'Noto Sans SC',sans-serif}*{box-sizing:border-box}a{color:inherit}a:focus-visible,button:focus-visible{outline:2px solid #afddff;outline-offset:3px}.journey-content{min-height:100svh}.projects-page.journey-content{padding-top:clamp(80px,11vh,120px)}@media(prefers-reduced-motion:no-preference){.projects-page.journey-content{padding-bottom:clamp(180px,30vh,300px)}}.projects-page::before,.projects-page::after{position:absolute!important}.journey-fallback{display:block;padding:90px 7vw;color:#afddff}`;root.append(base);
  for(const href of ['./detail.css',source.css]){const link=document.createElement('link');link.rel='stylesheet';link.href=href;root.append(link);}
  if(source.id==='projects'){const ornaments=document.createElement('style');ornaments.textContent='.projects-page::before{top:clamp(8px,calc(5vw - 40px),56px);right:clamp(0px,1.5vw,28px)}.projects-page::after{bottom:clamp(60px,7vw,130px)}';root.append(ornaments);}
  if(source.id==='internship'){const transitionBackground=document.createElement('style');transitionBackground.textContent=':host(#journey-internship) .internship-page.journey-content{padding-top:clamp(48px,7vh,80px);background:linear-gradient(to bottom,#020407 0%,#020407 calc(100% - var(--water-overlap) - 230px),transparent calc(100% - var(--water-overlap)))}:host(#journey-internship) .internship-page::after{-webkit-mask-image:linear-gradient(to bottom,transparent,#000 18%,#000 68%,transparent);mask-image:linear-gradient(to bottom,transparent,#000 18%,#000 68%,transparent)}:host(#journey-internship) .page-motes,:host(#journey-internship) .internship-main::before,:host(#journey-internship) .internship-main::after{-webkit-mask-image:linear-gradient(to bottom,transparent 0,transparent clamp(850px,100svh,1100px),#000 clamp(1020px,115svh,1250px),#000 calc(100% - 480px),transparent calc(100% - 180px));mask-image:linear-gradient(to bottom,transparent 0,transparent clamp(850px,100svh,1100px),#000 clamp(1020px,115svh,1250px),#000 calc(100% - 480px),transparent calc(100% - 180px))}@media (prefers-reduced-motion:no-preference){:host(#journey-internship) .internship-page::before{top:calc(-1 * var(--rift-background-extension));height:calc(clamp(500px,65vw,900px) + var(--rift-background-extension))}}';root.append(transitionBackground);}
  if(source.id==='internship'){const rippleTone=document.createElement('style');rippleTone.textContent=':host(#journey-internship) .internship-page::after{filter:brightness(.92) saturate(.72)}';root.append(rippleTone);}
  if(source.id==='internship'){const upperBlend=document.createElement('style');upperBlend.textContent=':host(#journey-internship) .internship-page::after{background-image:linear-gradient(to bottom,transparent 0%,rgba(12,36,58,.1) 38%,rgba(12,36,58,.38) 100%),url("./assets/internship-bottom-caustics-v7.png");background-size:100% 100%,100% auto;background-position:center bottom,center bottom}';root.append(upperBlend);}
  const page=document.createElement('div');page.className=`${source.page} journey-content`;page.setAttribute('part','content');root.append(page);
  const fallback=document.createElement('a');fallback.className='journey-fallback';fallback.href=source.url;fallback.textContent=source.id==='projects'?'查看 Projects →':'查看 Internship →';page.append(fallback);
  return {source,host,root,page};
 });
 let frame=0,active=false,aboutShift=0,projectShift=0;
 const clamp=x=>Math.max(0,Math.min(1,x));
 function resetMask(el){el.style.maskImage='';el.style.webkitMaskImage='';el.classList.remove('is-rift-active');}
 function render(now){frame=0;if(document.hidden)return;let current=null;
  const rawTop=item=>item.host.getBoundingClientRect().top-(item===sections[0]?projectShift:0);
  const naturalTop=item=>rawTop(item)+(parseFloat(getComputedStyle(item.host).paddingTop)||0);
  for(const item of sections){const top=naturalTop(item),maskTop=rawTop(item);const p=clamp((1.16-top/innerHeight)/1.32);if(!reduced.matches&&item.loaded&&p>0&&p<1&&top<innerHeight){current={item,top,maskTop,p};}else resetMask(item.host);}
  const visible=[...sections].reverse().find(item=>item.loaded&&naturalTop(item)<=innerHeight*.4);
  document.querySelectorAll('.journey-nav a,.detail-nav .detail-links a').forEach(link=>{const href=link.getAttribute('href');const selected=visible?href===visible.source.url:about.getBoundingClientRect().top<=innerHeight*.4&&(href==='#about'||href==='./about.html');if(selected)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  const photoHold=reduced.matches?0:(parseFloat(getComputedStyle(about).paddingBottom)||0);
  const projectsTop=naturalTop(sections[0]);
  let nextAboutShift=!reduced.matches&&projectsTop>innerHeight?Math.max(0,innerHeight+photoHold-projectsTop):0,nextProjectShift=0;
  if(current&&window.renderJourneyRift){const mask=window.renderJourneyRift(current.p,now*.001);if(mask){const shift=Math.max(0,innerHeight-current.top);if(current.item===sections[0])nextAboutShift=shift+photoHold;else nextProjectShift=shift;const el=current.item.host;el.classList.add('is-rift-active');el.style.maskImage=`url(${mask})`;el.style.webkitMaskImage=`url(${mask})`;el.style.maskRepeat=el.style.webkitMaskRepeat='no-repeat';el.style.maskSize=el.style.webkitMaskSize='100vw 100vh';el.style.maskPosition=el.style.webkitMaskPosition=`0px ${-current.maskTop}px`;}}
  else if(window.renderJourneyRift)window.renderJourneyRift(0,now*.001);
  if(aboutShift!==nextAboutShift){aboutShift=nextAboutShift;about.style.transform=aboutShift?`translate3d(0,${aboutShift}px,0)`:'';}
  if(projectShift!==nextProjectShift){projectShift=nextProjectShift;sections[0].host.style.transform=projectShift?`translate3d(0,${projectShift}px,0)`:'';}
  active=!!current;if(active&&!reduced.matches)frame=requestAnimationFrame(render);
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(render);}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);
 function setupStack(item){const stack=item.root.querySelector('.work-stack'),stage=stack?.querySelector('.work-stage'),cards=stage?[...stage.querySelectorAll('.work-card')]:[];if(!stack||!stage)return;const desktop=matchMedia('(min-width:901px) and (prefers-reduced-motion:no-preference)');let pending=0;
  function update(){
   pending=0;
   const enabled=desktop.matches&&cards.length===3;
   stack.classList.toggle('stack-ready',enabled);
   if(!enabled){cards.forEach(card=>card.style.removeProperty('transform'));return;}
   const progress=Math.max(0,80-stack.getBoundingClientRect().top);
   const frontCard = progress >= 700 ? 2 : progress >= 80 ? 1 : 0;
   const gap=stack.clientWidth*.042,start=stage.clientHeight+20;
   cards.forEach((card,index)=>{
    const depth = Math.max(0, frontCard - index);
    const offset = index <= frontCard ? index * gap : start;
    card.style.transform = `translateY(${offset}px) scale(${1 - depth * .025})`;
   });
  }
  const request=()=>{if(!pending)pending=requestAnimationFrame(update);};addEventListener('scroll',request,{passive:true});addEventListener('resize',request);desktop.addEventListener('change',request);request();
 }
 async function load(item){try{const response=await fetch(item.source.url,{cache:'no-cache'});if(!response.ok)throw Error('load failed');const doc=new DOMParser().parseFromString(await response.text(),'text/html'),main=doc.querySelector(item.source.selector);if(!main)throw Error('missing content');item.page.replaceChildren(document.importNode(main,true));item.loaded=true;if(item.source.id==='internship'){setupStack(item);window.initGrowthReveal?.(item.root);window.initModelComparison?.(item.root);}schedule();}catch(error){console.warn('Section unavailable:',item.source.id,error);}}
 for(const item of sections)load(item);
 schedule();
})();
