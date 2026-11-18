/* A single native scroll surface and the SAME video frames across both scenes.
   No wheel hijack, duplicate video, timed scroll gate or iframe scroll trap. */
(() => {
  'use strict';
  if (window.self !== window.top || document.querySelector('.journey-track')) return;
  const hero = document.querySelector('.hero');
  const video = hero?.querySelector('video');
  if (!hero || !video) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const track = document.createElement('div');
  track.className = 'journey-track';
  hero.before(track);
  track.append(hero);
  document.documentElement.classList.add('has-home-journey');

  const nav = hero.querySelector('.top-nav');
  const menu = hero.querySelector('.mobile-menu');
  nav.classList.add('journey-nav');
  document.body.prepend(nav, menu);
  const wordmark = nav.querySelector('.wordmark');
  const home = document.createElement('a');
  home.className = wordmark.className;
  home.href = '#';
  home.innerHTML = wordmark.innerHTML;
  home.setAttribute('aria-label', '返回首页');
  wordmark.replaceWith(home);
  home.addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
    history.replaceState(null, '', location.pathname + location.search);
  });

  const about = document.createElement('section');
  about.id = 'about';
  about.className = 'about-page journey-about';
  about.tabIndex = -1;
  about.setAttribute('aria-label', 'About Ember');
  track.after(about);
  const stage = document.createElement('section');
  stage.className = 'about-page journey-about journey-stage';
  stage.setAttribute('aria-hidden', 'true');
  stage.inert = true;
  document.body.append(stage);
  const fallbackLink = document.createElement('a');
  fallbackLink.className = 'journey-fallback-link';
  fallbackLink.href = './about.html';
  fallbackLink.textContent = 'ABOUT →';
  about.append(fallbackLink);

  const ocean = document.createElement('div');
  ocean.className = 'journey-ocean';
  ocean.setAttribute('aria-hidden', 'true');
  document.body.append(ocean);
  const jellyLayer = document.createElement('div');
  jellyLayer.className = 'journey-jelly-layer';
  jellyLayer.setAttribute('aria-hidden', 'true');
  jellyLayer.hidden = true;
  document.body.append(jellyLayer);
  // A softly displaced mask lets the actual sea texture open without a geometric outline.
  const aperture = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  aperture.setAttribute('aria-hidden', 'true');
  aperture.setAttribute('width', '0'); aperture.setAttribute('height', '0');
  aperture.style.cssText = 'position:absolute;pointer-events:none';
  aperture.innerHTML = '<defs><filter id="journey-aperture-filter" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".008" numOctaves="3" seed="17" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="5"/></filter><linearGradient id="journey-edge-sheen" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a8d9ff" stop-opacity="0"/><stop offset=".16" stop-color="#e2f5ff" stop-opacity=".7"/><stop offset=".29" stop-color="#b6dfff" stop-opacity="0"/><stop offset=".55" stop-color="#c9eaff" stop-opacity=".15"/><stop offset=".69" stop-color="#a8d9ff" stop-opacity="0"/><stop offset=".84" stop-color="#e2f5ff" stop-opacity=".55"/><stop offset="1" stop-color="#a8d9ff" stop-opacity="0"/></linearGradient><mask id="journey-aperture-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" mask-type="alpha"><path fill="white" filter="url(#journey-aperture-filter)"/></mask></defs>';
  document.body.append(aperture);
  const edgeFilter = aperture.querySelector('#journey-aperture-filter').cloneNode(true);
  edgeFilter.id = 'journey-edge-filter';
  edgeFilter.querySelector('feGaussianBlur').setAttribute('stdDeviation', '3.5');
  aperture.querySelector('defs').append(edgeFilter);
  const edgeLight = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  edgeLight.setAttribute('aria-hidden', 'true');
  edgeLight.classList.add('journey-edge-light');
  edgeLight.innerHTML = '<path fill="none" stroke="url(#journey-edge-sheen)" stroke-width="16" stroke-opacity="1" stroke-linejoin="round" filter="url(#journey-edge-filter)"/><path fill="none" stroke="url(#journey-edge-sheen)" stroke-width="5" stroke-opacity=".8" stroke-linejoin="round" filter="url(#journey-edge-filter)"/>';
  document.body.append(edgeLight);
  const edgePath = edgeLight.querySelector('path');
  const edgeGlint = edgeLight.querySelectorAll('path')[1];
  const dissolveLight = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  dissolveLight.setAttribute('aria-hidden', 'true');
  dissolveLight.classList.add('journey-dissolve-light');
  dissolveLight.innerHTML = '<path fill="none" stroke="url(#journey-dissolve-sheen)" stroke-width="7" stroke-linecap="round" stroke-dasharray="16 29 4 21 11 35" filter="url(#journey-retreat-soften)"/><path fill="none" stroke="url(#journey-dissolve-sheen)" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="5 32 2 24 8 45"/>';
  document.body.append(dissolveLight);
  const dissolvePaths = dissolveLight.querySelectorAll('path');
  const dissolveGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
  dissolveGradient.id = 'journey-dissolve-sheen';
  dissolveGradient.innerHTML = '<stop offset="0" stop-color="#a8d8ef" stop-opacity="0"/><stop offset=".35" stop-color="#cceaff" stop-opacity=".65"/><stop offset=".7" stop-color="#9ccce4" stop-opacity=".3"/><stop offset="1" stop-color="#a8d8ef" stop-opacity="0"/>';
  aperture.querySelector('defs').append(dissolveGradient);
  const previousGradient = aperture.querySelector('#journey-edge-sheen');
  const edgeGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
  edgeGradient.id = 'journey-edge-sheen';
  edgeGradient.setAttribute('gradientUnits', 'userSpaceOnUse');
  edgeGradient.innerHTML = '<stop offset="0" stop-color="#e4f6ff" stop-opacity=".95"/><stop offset=".35" stop-color="#bddfff" stop-opacity=".65"/><stop offset="1" stop-color="#9acff4" stop-opacity="0"/>';
  previousGradient.replaceWith(edgeGradient);
  const apertureMask = aperture.querySelector('mask');
  apertureMask.setAttribute('mask-type', 'luminance');
  const retreatPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  retreatPath.setAttribute('fill', 'black');
  retreatPath.setAttribute('filter', 'url(#journey-retreat-soften)');
  const retreatFilter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  retreatFilter.id = 'journey-retreat-soften';
  retreatFilter.setAttribute('x', '-50%'); retreatFilter.setAttribute('y', '-50%');
  retreatFilter.setAttribute('width', '200%'); retreatFilter.setAttribute('height', '200%');
  retreatFilter.innerHTML = '<feTurbulence type="fractalNoise" baseFrequency=".008 .012" numOctaves="3" seed="17" result="mist"/><feDisplacementMap in="SourceGraphic" in2="mist" scale="55" xChannelSelector="R" yChannelSelector="G"/><feGaussianBlur stdDeviation="12"/>';
  aperture.querySelector('defs').append(retreatFilter);
  apertureMask.append(retreatPath);
  const apertureFilter = aperture.querySelector('filter');
  const aperturePath = apertureMask.querySelector('path');
  const apertureDistortion = aperture.querySelector('feDisplacementMap');
  const edgeDistortion = edgeFilter.querySelector('feDisplacementMap');
  // Add a finer, stable ripple to the same outline used by the mask and its light.
  for (const filter of [apertureFilter, edgeFilter]) {
    const ns = 'http://www.w3.org/2000/svg';
    filter.querySelector('feDisplacementMap').setAttribute('result', 'coarse-shape');
    const ripple = document.createElementNS(ns, 'feTurbulence');
    ripple.setAttribute('type', 'fractalNoise'); ripple.setAttribute('baseFrequency', '.035');
    ripple.setAttribute('numOctaves', '2'); ripple.setAttribute('seed', '9'); ripple.setAttribute('result', 'fine-noise');
    const shift = document.createElementNS(ns, 'feDisplacementMap');
    shift.setAttribute('in', 'coarse-shape'); shift.setAttribute('in2', 'fine-noise'); shift.setAttribute('xChannelSelector', 'R'); shift.setAttribute('yChannelSelector', 'G');
    filter.insertBefore(ripple, filter.querySelector('feGaussianBlur'));
    filter.insertBefore(shift, filter.querySelector('feGaussianBlur'));
  }
  const fineDistortions = [apertureFilter, edgeFilter].map(filter => filter.querySelectorAll('feDisplacementMap')[1]);

  const organism = document.createElement('div');
  organism.className = 'journey-organism';
  organism.setAttribute('aria-hidden', 'true');
  const canvas = document.createElement('canvas');
  canvas.width = 960; canvas.height = 542;
  organism.append(canvas);
  document.body.append(organism);
  const ctx = canvas.getContext('2d', { alpha: true });
  const mask = document.createElement('canvas');
  mask.width = 960; mask.height = 542;
  const m = mask.getContext('2d');
  const blend = document.createElement('canvas');
  blend.width = 960; blend.height = 542;
  const b = blend.getContext('2d');
  let maskSource = '', ready = false, active = false, frame = 0;
  let previousTime = 0, smoothedY = window.scrollY, w = innerWidth, h = innerHeight;
  let aboutTop = 0, anchorX = 0, anchorY = 0, sourceKind = 'video';
  let lastDraw = -1;
  let lastIsolation = -1;
  let isolation = 0, layout = {};
  const retiring = ['.hero-copy', '.node-system', '.grid-lines', '.ocean-atmosphere', '.ocean-wake', '.bottom-row'].map(s => hero.querySelector(s)).filter(Boolean);
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  // Smooth, repeating noise keeps the opening organic as it spreads.
  const contourNoise = (angle, count, phase) => {
    const position = ((angle / (Math.PI * 2) + 1) % 1) * count;
    const index = Math.floor(position), blend = ease(position - index);
    const sample = i => {
      const value = Math.sin((i % count) * 127.1 + phase * 311.7) * 43758.5453;
      return value - Math.floor(value);
    };
    return sample(index) * (1 - blend) + sample(index + 1) * blend - .5;
  };
  const openingShape = a => 1 + contourNoise(a, 7, 3) * .28 + contourNoise(a, 13, 8) * .12 + contourNoise(a, 27, 5) * .035;
  // Match the opening reveal's two-dimensional, multi-scale noise field.
  const fieldHash = n => Math.abs(Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1;
  const fieldNoise = (x, y) => {
    const ix = Math.floor(x), iy = Math.floor(y), fx = ease(x - ix), fy = ease(y - iy);
    return (fieldHash(ix + iy * 157) * (1 - fx) + fieldHash(ix + 1 + iy * 157) * fx) * (1 - fy)
      + (fieldHash(ix + (iy + 1) * 157) * (1 - fx) + fieldHash(ix + 1 + (iy + 1) * 157) * fx) * fy;
  };
  const revealField = (x, y) => fieldNoise(x, y) * .53 + fieldNoise(x * 2.07 + 17, y * 2.07 + 31) * .27
    + fieldNoise(x * 4.31 + 51, y * 4.31) * .13 + fieldNoise(x * 9.1, y * 9.1 + 19) * .07;
  const seaContour = (a, radius) => {
    const x = .48 + Math.cos(a) * radius / w;
    const y = .46 + Math.sin(a) * radius / h;
    const n = revealField(x * 3.5, y * 3.2);
    const warpX = (n - .5) * w * .38;
    const warpY = (revealField(x * 3.2 + 71, y * 3.7) - .5) * h * .32;
    const ridge = (revealField(x * 25 + n * 3, y * 32 + n * 4) - .5) * Math.min(w, h) * .045;
    const strength = Math.min(1, radius / (Math.min(w, h) * .23));
    return [w * .48 + Math.cos(a) * (radius + ridge * strength) + warpX * strength,
      h * .46 + Math.sin(a) * (radius + ridge * strength) + warpY * strength];
  };
  const lerp = (a, z, p) => a + (z - a) * p;
  const fallback = hero.querySelector('.hero-fallback');
  function syncVideoVisibility() {
    const playing = !reduced.matches && video.readyState >= 2 && video.videoWidth > 0 && !video.paused && !video.error;
    hero.classList.toggle('journey-video-ready', playing);
    jellyLayer.classList.toggle('is-video-ready', playing);
    if (!reduced.matches) hero.classList.toggle('video-error', !playing);
  }

  function ellipse(x, y, rx, ry) {
    m.save();
    m.translate(x * 960, y * 542);
    m.scale(rx * 960, ry * 542);
    const gradient = m.createRadialGradient(0, 0, .66, 0, 0, 1);
    gradient.addColorStop(0, '#fff');
    gradient.addColorStop(1, 'transparent');
    m.fillStyle = gradient;
    m.fillRect(-1, -1, 2, 2);
    m.restore();
  }
  function makeMask(kind) {
    m.clearRect(0, 0, 960, 542);
    m.globalCompositeOperation = 'source-over';
    if (kind === 'video') {
      // Keep the lower-right organism in its original video position.
      ellipse(.607, .604, .102, .146);
      ellipse(.623, .817, .122, .20);
      m.globalCompositeOperation = 'destination-out';
      ellipse(.46, .44, .12, .16);
    } else {
      ellipse(.79, .66, .23, .12);
      ellipse(.79, .82, .20, .18);
      m.globalCompositeOperation = 'destination-out';
      ellipse(.342, .46, .265, .16);
    }
    m.globalCompositeOperation = 'source-over';
    maskSource = kind;
  }
  function measure() {
    w = innerWidth; h = innerHeight;
    for (const el of [apertureMask, apertureFilter, edgeFilter]) {
      el.setAttribute('x', '0'); el.setAttribute('y', '0');
      el.setAttribute('width', String(w)); el.setAttribute('height', String(h));
    }
    edgeLight.setAttribute('viewBox', `0 0 ${w} ${h}`);
    dissolveLight.setAttribute('viewBox', `0 0 ${w} ${h}`);
    aboutTop = track.getBoundingClientRect().bottom + window.scrollY;
    const sourceW = sourceKind === 'video' ? 1912 : 1024;
    const sourceH = sourceKind === 'video' ? 1080 : 1536;
    const cx = sourceKind === 'video' ? .607 : .79;
    const cy = sourceKind === 'video' ? .604 : .66;
    const fit = sourceKind === 'video' ? Math.max(w / sourceW, h / sourceH) : Math.min(w / sourceW, h / sourceH);
    const localX = w / 2 + (cx - .5) * sourceW * fit;
    const localY = h / 2 + (cy - .5) * sourceH * fit;
    anchorX = w / 2 + (localX - w / 2) * 1.03 + Math.max(18, Math.min(w * .03, 56));
    anchorY = h / 2 + (localY - h / 2) * 1.03;
    organism.style.transformOrigin = `${anchorX}px ${anchorY}px`;
    canvas.style.objectFit = sourceKind === 'video' ? 'cover' : 'contain';
    for (const [key, selector] of Object.entries({experience:'.about-experience',outside:'.about-outside',wall:'.photo-wall',next:'.about-next'})) {
      const el = about.querySelector(selector);
      layout[key] = el ? el.getBoundingClientRect().top + window.scrollY : key === 'next' ? (layout.wallBottom || aboutTop + h) + h : aboutTop + h;
      if (key === 'wall') layout.wallBottom = layout[key] + (el?.offsetHeight || h);
    }
  }
  function draw() {
    if (!ctx || !b) return false;
    const kind = video.readyState >= 2 && video.videoWidth ? 'video' : 'image';
    const source = kind === 'video' ? video : fallback;
    if (kind === 'image' && (!fallback.complete || !fallback.naturalWidth)) return false;
    if (maskSource !== kind) {
      sourceKind = kind;
      canvas.height = mask.height = blend.height = kind === 'video' ? 542 : 1440;
      // Normalized mask coordinates use the same 960×542 coordinate system.
      m.setTransform(1, 0, 0, mask.height / 542, 0, 0);
      makeMask(kind);
      measure();
    }
    const height = canvas.height;
    // One owner renders the whole source; only the other two organisms fade out.
    m.save();
    m.setTransform(1, 0, 0, 1, 0, 0);
    m.globalCompositeOperation = 'destination-over';
    m.globalAlpha = 1 - isolation;
    m.fillStyle = '#fff';
    m.fillRect(0, 0, 960, height);
    m.restore();
    ctx.clearRect(0, 0, 960, height);
    ctx.drawImage(source, 0, 0, 960, height);
    b.clearRect(0, 0, 960, height);
    b.drawImage(mask, 0, 0);
    ctx.globalCompositeOperation = 'destination-in';
    ctx.drawImage(blend, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    return true;
  }
  function render(time) {
    frame = 0;
    if (document.hidden) { previousTime = 0; return; }
    const dt = Math.min(previousTime ? (time - previousTime) / 1000 : 1 / 60, .05);
    previousTime = time;
    const targetY = window.scrollY;
    // Frame-rate-independent short catch-up; no snap, stepping or long delay.
    smoothedY += (targetY - smoothedY) * (1 - Math.exp(-dt / .085));
    if (Math.abs(targetY - smoothedY) < .1) smoothedY = targetY;
    const scroll = smoothedY;
    const openingEnd = h * 1.26;
    const entranceStart = h * .82;
    const entranceEnd = h * 2.17;
    const enabled = !reduced.matches && ready;
    const opening = enabled ? ease(scroll / Math.max(1, openingEnd)) : 0;
    const entrance = enabled ? clamp((scroll - entranceStart) / Math.max(1, entranceEnd - entranceStart)) : 1;
    const fade = enabled ? 1 - ease(scroll / Math.max(1, h * .35)) : 1;
    retiring.forEach(el => el.style.setProperty('opacity', String(fade), 'important'));
    // The same layered lobes used by the hover mist form a soft, asymmetric opening.
    const radius = Math.hypot(w, h) * 1.08 * opening;
    const contour = [];
    for (let i = 0; i < 96; i++) {
      const a = i / 96 * Math.PI * 2;
      const [x, y] = seaContour(a, radius);
      contour.push(`${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const outline = `${contour.join('')}Z`;
    aperturePath.setAttribute('d', outline);
    edgePath.setAttribute('d', outline);
    edgeGlint.setAttribute('d', outline);
    const distortion = String(Math.min(42, radius * .09) * Math.sin(Math.PI * opening));
    apertureDistortion.setAttribute('scale', distortion);
    edgeDistortion.setAttribute('scale', distortion);
    fineDistortions.forEach(el => el.setAttribute('scale', String(Math.min(8, radius * .02) * Math.sin(Math.PI * opening))));
    const sheenAngle = -2.35 + opening * .22;
    const [sheenX, sheenY] = seaContour(sheenAngle, radius);
    edgeGradient.setAttribute('cx', String(sheenX));
    edgeGradient.setAttribute('cy', String(sheenY));
    edgeGradient.setAttribute('r', String(Math.max(24, radius * .46)));
    const seaScale = 1.06 - .06 * opening;
    ocean.style.transform = `scale(${seaScale})`;
    edgeLight.style.transform = `scale(${seaScale})`;
    edgeLight.style.opacity = enabled ? String(Math.sin(Math.PI * opening)) : '0';
    const sceneRetreat = ease((entrance - .02) / .62);
    // Keep the ocean continuous; it blends away as About's text enters.
    retreatPath.setAttribute('d', '');
    dissolveLight.style.opacity = '0';
    ocean.style.opacity = enabled ? String(ease(scroll / (h * .12)) * (1 - ease((entrance - .28) / .72))) : '0';
    hero.style.transform = enabled && scroll < aboutTop ? `scale(${1 + .045 * opening})` : '';
    const copy = hero.querySelector('.hero-copy');
    const nodes = hero.querySelector('.node-system');
    if (copy) copy.style.transform = enabled && scroll > 0 ? `translate3d(${-22 * opening}px,0,0)` : '';
    if (nodes) nodes.style.transform = enabled && scroll > 0 ? `translate3d(${18 * opening}px,0,0)` : '';
    // The entrance is a fixed visual layer; hand off to the real document only at its natural top.
    const onStage = enabled && targetY >= entranceStart && targetY < aboutTop;
    const showJellyLayer = enabled && targetY < aboutTop;
    // Keep one video in one layer across scroll boundaries; moving it during
    // every crossing can interrupt decoding and expose the fallback image.
    if (enabled && video.parentElement !== jellyLayer) {
      jellyLayer.append(video);
      if (video.paused && !video.error) video.play().catch(() => syncVideoVisibility());
    }
    else if (!enabled && video.parentElement === jellyLayer) hero.prepend(video);
    jellyLayer.hidden = !showJellyLayer;
    jellyLayer.classList.toggle('is-stage', onStage);
    stage.style.visibility = onStage ? 'visible' : 'hidden';
    stage.style.transform = '';
    about.classList.toggle('is-stage-hidden', onStage);
    stage.style.setProperty('--journey-background', String(enabled ? ease(entrance / .85) : 1));
    stage.style.setProperty('--journey-photo', String(enabled ? ease((entrance - .38) / .42) : 1));
    stage.style.setProperty('--journey-cave', String(enabled ? ease((entrance - .38) / .42) : 1));
    stage.style.setProperty('--journey-title', String(enabled ? ease((entrance - .08) / .28) : 1));
    stage.style.setProperty('--journey-copy', String(enabled ? ease((entrance - .16) / .30) : 1));
    stage.style.setProperty('--journey-roles', String(enabled ? ease((entrance - .23) / .30) : 1));
    stage.style.setProperty('--journey-actions', String(enabled ? ease((entrance - .30) / .30) : 1));
    organism.style.opacity = '0';
    hero.classList.remove('journey-canvas');
    syncVideoVisibility();
    if (enabled && scroll > 0) {
      video.classList.remove('anim-fade-in');
      const jellyOpacity = 1 - sceneRetreat;
      video.style.opacity = String(jellyOpacity);
      fallback.style.opacity = String(jellyOpacity);
    } else {
      video.style.opacity = ''; fallback.style.opacity = '';
    }
    const inAbout = targetY >= aboutTop - 100;
    nav.classList.toggle('is-about', inAbout);
    nav.querySelector('a[href="#about"]')?.toggleAttribute('aria-current', inAbout);
    if (inAbout) nav.querySelector('a[href="#about"]')?.setAttribute('aria-current', 'page');
    // No idle render loop on the original first screen or in reduced motion.
    if (Math.abs(targetY - smoothedY) > .1) frame = requestAnimationFrame(render);
  }
  function requestRender() { if (!frame) frame = requestAnimationFrame(render); }
  ['loadeddata', 'canplay', 'playing', 'pause', 'error', 'emptied'].forEach(type => video.addEventListener(type, () => { syncVideoVisibility(); requestRender(); }));
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', () => { measure(); requestRender(); }, { passive: true });
  document.addEventListener('visibilitychange', requestRender);
  reduced.addEventListener('change', () => { measure(); requestRender(); });
  const syncLanguage = () => {
    const lang = 'en';
    [about, stage].forEach(section => section.querySelectorAll('[data-en]').forEach(el => { el.textContent = el.dataset[lang]; }));
  };
  function goAbout(event) {
    event.preventDefault();
    menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true');
    nav.querySelector('.menu-toggle').setAttribute('aria-expanded', 'false');
    about.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
    // Focus without moving the scroll target; native Tab continues in About.
    about.focus({ preventScroll: true });
    history.replaceState(null, '', '#about');
  }
  // Reuse the current About markup and CSS, never an out-of-date second copy.
  const css = document.createElement('link');
  css.rel = 'stylesheet'; css.href = './about.css?v=20261116-card-title';
  document.head.append(css);
  fetch('./about.html', { cache: 'no-store' }).then(response => {
    if (!response.ok) throw new Error('About unavailable');
    return response.text();
  }).then(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    css.href = doc.querySelector('link[href*="about.css"]')?.getAttribute('href') || css.href;
    const main = doc.querySelector('.about-main');
    const dialog = doc.querySelector('#contact-dialog');
    if (!main || !dialog) throw new Error('About content incomplete');
    about.replaceChildren(document.importNode(main, true), document.importNode(dialog, true));
    const stageMain = document.importNode(main, true);
    [...stageMain.children].filter(child => !child.classList.contains('about-intro')).forEach(child => child.remove());
    stageMain.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    stage.replaceChildren(stageMain);
    syncLanguage();
    const behavior = document.createElement('script');
    behavior.src = doc.querySelector('script[src*="about.js"]')?.getAttribute('src') || './about.js';
    document.body.append(behavior);
    ready = true;
    measure();
    const geometryObserver = new ResizeObserver(() => { measure(); requestRender(); });
    geometryObserver.observe(track);
    geometryObserver.observe(about);
    if (location.hash === '#about') about.scrollIntoView();
    requestRender();
  }).catch(() => {
    // Leave ordinary About navigation available if loading the embedded view fails.
    track.style.height = '100svh';
  });
  measure();
  requestRender();
})();
