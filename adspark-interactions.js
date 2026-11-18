(() => {
  const cards = document.querySelectorAll('.case-problem .user-card, .case-problem .need-card');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  cards.forEach(card => {
    card.classList.add('spotlight-card');
    let frame = 0;
    let x = 0;
    let y = 0;
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      card.classList.remove('spotlight-active');
    };
    const move = event => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType === 'touch') return;
      const bounds = card.getBoundingClientRect();
      x = event.clientX - bounds.left;
      y = event.clientY - bounds.top;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        card.style.setProperty('--spotlight-x', `${x}px`);
        card.style.setProperty('--spotlight-y', `${y}px`);
        card.classList.add('spotlight-active');
        frame = 0;
      });
    };
    card.addEventListener('pointerenter', move);
    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', clear);
    card.addEventListener('pointercancel', clear);
    finePointer.addEventListener('change', clear);
    reducedMotion.addEventListener('change', clear);
    window.addEventListener('blur', clear);
  });
})();
