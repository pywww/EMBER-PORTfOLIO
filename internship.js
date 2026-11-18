document.querySelectorAll('.evidence-card[href="#"]').forEach(link=>link.addEventListener('click',event=>event.preventDefault()));

const workStack = document.querySelector('.work-stack');
const workStage = workStack?.querySelector('.work-stage');
const stageCards = workStage ? [...workStage.querySelectorAll('.work-card')] : [];
const desktopStack = matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
let stackFrame = 0;
function updateWorkStage() {
  stackFrame = 0;
  if (!workStack || !workStage) return;
  const active = desktopStack.matches && stageCards.length === 3;
  workStack.classList.toggle('stack-ready', active);
  if (!active) { stageCards.forEach(card => card.style.removeProperty('transform')); return; }
  const progress = Math.max(0, 80 - workStack.getBoundingClientRect().top);
  const frontCard = progress >= 700 ? 2 : progress >= 80 ? 1 : 0;
  const gap = workStack.clientWidth * 0.042;
  const start = workStage.clientHeight + 20;
  stageCards.forEach((card, index) => {
    const depth = Math.max(0, frontCard - index);
    const offset = index <= frontCard ? index * gap : start;
    card.style.transform = `translateY(${offset}px) scale(${1 - depth * .025})`;
  });
}
function scheduleWorkStage() { if (!stackFrame) stackFrame = requestAnimationFrame(updateWorkStage); }
window.addEventListener('scroll', scheduleWorkStage, { passive: true });
window.addEventListener('resize', scheduleWorkStage);
desktopStack.addEventListener('change', scheduleWorkStage);
updateWorkStage();
