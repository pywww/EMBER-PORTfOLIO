(function(){
  'use strict';
  window.initGrowthReveal=function(root){
    const workTitle=root.querySelector('#work-title');
    const firstCard=root.querySelector('.work-stage .work-card');
    if(workTitle&&firstCard&&!firstCard.dataset.entranceReady){
      firstCard.dataset.entranceReady='true';
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){
        if(workTitle.getBoundingClientRect().top>=innerHeight){
          firstCard.classList.add('work-entrance-waiting');
          const workObserver=new IntersectionObserver(entries=>{
            if(entries.some(entry=>entry.isIntersecting||entry.boundingClientRect.top<0)){
              firstCard.classList.remove('work-entrance-waiting');
              firstCard.classList.add('work-entrance-playing');
              workObserver.disconnect();
            }
          },{threshold:0});
          workObserver.observe(workTitle);
        }
      }
    }
    const section=root.querySelector('.growth-section');
    const title=section?.querySelector('#growth-title');
    const map=section?.querySelector('.growth-map');
    if(!title||!map||map.dataset.revealReady)return;
    map.dataset.revealReady='true';
    if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
    if(title.getBoundingClientRect().top<innerHeight*1.12){map.classList.add('growth-revealed');return;}
    map.classList.add('growth-awaiting');
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting||entry.boundingClientRect.top<0)){
        map.classList.remove('growth-awaiting');map.classList.add('growth-playing');observer.disconnect();
      }
    },{rootMargin:'0px 0px 12% 0px',threshold:0});
    observer.observe(title);
  };
  window.initGrowthReveal(document);
})();
