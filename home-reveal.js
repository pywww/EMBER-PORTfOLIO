/* Render the opening reveal off the main thread to keep the video and UI smooth. */
(() => {
  const overlay = document.getElementById('home-opening-veil');
  if (!overlay) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { overlay.remove(); return; }
  let worker;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    overlay.remove();
    document.documentElement.classList.remove('home-opening');
    worker?.terminate();
    clearTimeout(safetyTimer);
  };
  const safetyTimer = setTimeout(finish, 6000);
  try {
    if (!overlay.transferControlToOffscreen || !window.Worker) throw new Error('Offscreen canvas unavailable');
    worker = new Worker('./home-reveal-worker.js?v=20261104-no-center-orb-1');
    worker.onmessage = event => {
      if (event.data === 'first-frame') overlay.style.background = 'transparent';
      if (event.data === 'reveal-content') document.documentElement.classList.remove('home-opening');
      if (event.data?.type === 'done' || event.data === 'error') finish();
    };
    worker.onerror = finish;
    const surface = overlay.transferControlToOffscreen();
    worker.postMessage({ surface, width: innerWidth, height: innerHeight }, [surface]);
  } catch { finish(); }
})();
