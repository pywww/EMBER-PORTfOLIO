/* About-only motion. Native scrolling keeps cards and their dates in one track. */
(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const viewport = document.querySelector('.experience-viewport');
  const section = document.querySelector('.about-experience');
  const items = [...viewport.querySelectorAll('.experience-item')];
  let frame = 0;
  let wheelFrame = 0;
  let wheelTarget = viewport.scrollLeft;
  let wheelPosition = viewport.scrollLeft;
  let lastWheelFrame = 0;
  let lastWheelTime = 0;
  let lastWheelDirection = 0;
  let releasedDirection = 0;
  let previousSectionTop = section.getBoundingClientRect().top;
  function updateProgress() {
    const travel = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
    const progress = viewport.scrollLeft / travel * (items.length - 1);
    items.forEach((item, index) => {
      item.style.setProperty('--progress', Math.max(0, Math.min(1, progress - index)));
      item.classList.toggle('is-reached', index <= progress + .001);
    });
  }
  function queueExperience() {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; updateProgress(); });
  }
  function animateWheel(time) {
    const elapsed = lastWheelFrame ? Math.min(time - lastWheelFrame, 50) : 16;
    lastWheelFrame = time;
    const distance = wheelTarget - wheelPosition;
    wheelPosition += distance * (1 - Math.exp(-elapsed / 150));
    viewport.scrollLeft = wheelPosition;
    if (Math.abs(wheelTarget - wheelPosition) >= .3) {
      wheelFrame = requestAnimationFrame(animateWheel);
    } else {
      viewport.scrollLeft = wheelTarget;
      wheelPosition = wheelTarget;
      wheelFrame = 0;
      lastWheelFrame = 0;
    }
  }
  window.addEventListener('wheel', event => {
    if (event.ctrlKey || !event.deltaY) return;
    if (event.target instanceof Element && event.target.closest('dialog')) return;
    lastWheelTime = performance.now();
    lastWheelDirection = Math.sign(event.deltaY);
    if (!event.cancelable) return;
    const rect = section.getBoundingClientRect();
    const travel = viewport.scrollWidth - viewport.clientWidth;
    const delta = event.deltaY * (event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? innerHeight : 1);
    if (travel <= 0) return;
    if (!wheelFrame) wheelPosition = wheelTarget = viewport.scrollLeft;
    const anchor = Math.min(110, Math.max(65, innerHeight * .12));
    if (releasedDirection && Math.sign(delta) !== releasedDirection) releasedDirection = 0;
    const enteringDown = delta > 0 && releasedDirection !== 1 && wheelTarget < travel - 1 && rect.top > anchor + 2 && rect.top - delta <= anchor;
    const enteringUp = delta < 0 && releasedDirection !== -1 && rect.top < anchor - 2 && rect.top - delta >= anchor;
    const atExperience = rect.top <= anchor + 2 && rect.bottom > anchor + 40;
    if (enteringDown || enteringUp) {
      event.preventDefault();
      if (enteringUp) {
        wheelTarget = travel;
        wheelPosition = travel;
        viewport.scrollLeft = travel;
      }
      window.scrollBy({ top: rect.top - anchor, behavior: 'instant' });
      return;
    }
    if (!atExperience) return;
    if ((delta > 0 && wheelTarget >= travel - 1) || (delta < 0 && wheelTarget <= 1)) {
      if (wheelFrame && Math.abs(wheelTarget - wheelPosition) > 2) {
        event.preventDefault();
        return;
      }
      cancelAnimationFrame(wheelFrame);
      wheelFrame = 0;
      lastWheelFrame = 0;
      wheelTarget = delta > 0 ? travel : 0;
      wheelPosition = wheelTarget;
      viewport.scrollLeft = wheelTarget;
      releasedDirection = Math.sign(delta);
      return;
    }
    event.preventDefault();
    if (rect.top < anchor - 2) window.scrollBy({ top: rect.top - anchor, behavior: 'instant' });
    wheelTarget = Math.max(0, Math.min(travel, wheelTarget + Math.max(-132, Math.min(132, delta * .55))));
    if (reducedMotion.matches) {
      viewport.scrollLeft = wheelTarget;
      wheelPosition = wheelTarget;
    } else if (!wheelFrame) {
      wheelFrame = requestAnimationFrame(animateWheel);
    }
  }, { capture: true, passive: false });
  window.addEventListener('scroll', () => {
    const top = section.getBoundingClientRect().top;
    const anchor = Math.min(110, Math.max(65, innerHeight * .12));
    const travel = viewport.scrollWidth - viewport.clientWidth;
    const crossedDown = previousSectionTop > anchor && top < anchor - 2 && wheelTarget < travel - 1;
    const crossedUp = previousSectionTop < anchor && top > anchor + 2;
    if (performance.now() - lastWheelTime < 250 && travel > 0 &&
        releasedDirection !== lastWheelDirection &&
        ((lastWheelDirection > 0 && crossedDown) || (lastWheelDirection < 0 && crossedUp))) {
      if (crossedUp) {
        wheelTarget = travel;
        wheelPosition = travel;
        viewport.scrollLeft = travel;
      }
      window.scrollBy({ top: top - anchor, behavior: 'instant' });
      previousSectionTop = anchor;
    } else {
      previousSectionTop = top;
    }
  }, { passive: true });
  items.forEach(item => {
    const card = item.querySelector('.experience-card');
    card.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--spotlight-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--spotlight-y', `${event.clientY - rect.top}px`);
    });
  });
  viewport.addEventListener('scroll', () => {
    if (!wheelFrame) wheelPosition = wheelTarget = viewport.scrollLeft;
    queueExperience();
  }, { passive: true });
  window.addEventListener('resize', () => {
    wheelTarget = Math.min(viewport.scrollWidth - viewport.clientWidth, viewport.scrollLeft);
    wheelPosition = wheelTarget;
    queueExperience();
  });
  new ResizeObserver(queueExperience).observe(viewport);
  queueExperience();

  const wall = document.querySelector('.photo-wall');
  const photos = [...wall.querySelectorAll('.photo-tile')];
  // Animate only an unseen wall; the final state remains usable without JavaScript.
  if ('IntersectionObserver' in window && !reducedMotion.matches && wall.getBoundingClientRect().top > innerHeight) {
    wall.classList.add('is-reveal-ready');
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      wall.classList.add('is-revealed');
      observer.disconnect();
    }, { rootMargin: '0px 0px -56px 0px', threshold: 0 });
    observer.observe(wall);
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) { wall.classList.remove('is-reveal-ready'); observer.disconnect(); }
    });
  }
  photos.forEach(tile => {
    const width = parseFloat(tile.style.getPropertyValue('--w')) * 1717;
    const height = parseFloat(tile.style.getPropertyValue('--h')) * 820;
    tile.style.setProperty('--tile-ratio', String(width / height));
  });
  // Rank tile centers along the collage's top-left to bottom-right diagonal.
  const photoPositions = photos.map(tile => {
    const x = parseFloat(tile.style.getPropertyValue('--x'));
    const y = parseFloat(tile.style.getPropertyValue('--y'));
    const width = parseFloat(tile.style.getPropertyValue('--w'));
    const height = parseFloat(tile.style.getPropertyValue('--h'));
    return { tile, diagonal: x + width / 2 + y + height / 2 };
  });
  photoPositions.sort((a, b) => a.diagonal - b.diagonal);
  photoPositions.forEach(({ tile }, index) => {
    tile.style.setProperty('--arrival-delay', `${index * 100}ms`);
  });
  // Back faces follow the positions in the approved photo-wall reference.
  const backByFront = new Map([
    [1, 5], [2, 10], [3, 13], [4, 6], [5, 3],
    [12, 4], [7, 9], [8, 14], [9, 1], [10, 12],
    [11, 8], [6, 2], [13, 7], [14, 11]
  ]);
  const numberOf = tile => Number(tile.querySelector('img').getAttribute('src').match(/photo-(\d+)/)?.[1]);
  const photoByNumber = new Map(photos.map(tile => [numberOf(tile), tile]));
  photos.forEach(tile => {
    const backNumber = backByFront.get(numberOf(tile));
    const backImage = photoByNumber.get(backNumber).querySelector('img');
    const flip = document.createElement('span');
    const front = tile.querySelector('.photo-reveal');
    const back = document.createElement('span');
    const backPhoto = document.createElement('img');
    flip.className = 'photo-flip';
    front.classList.add('photo-face', 'photo-face-front');
    back.className = 'photo-face photo-face-back';
    if (backNumber === 11) tile.classList.add('photo-back-face-high');
    back.setAttribute('aria-hidden', 'true');
    backPhoto.src = numberOf(tile) === 8
      ? './assets/about/photo-14-back-clean.webp'
      : backImage.getAttribute('src');
    backPhoto.alt = '';
    backPhoto.loading = 'lazy';
    backPhoto.decoding = 'async';
    back.append(backPhoto);
    tile.append(flip);
    flip.append(front, back);
    tile.setAttribute('aria-label', `${tile.querySelector('.photo-face-front img').alt}，翻转查看${backImage.alt}`);
  });
  photos.forEach(tile => {
    const toggle = () => {
      const flipped = tile.classList.toggle('is-flipped');
      tile.setAttribute('aria-pressed', String(flipped));
    };
    tile.addEventListener('pointerenter', event => {
      if (finePointer.matches && event.pointerType === 'mouse') tile.setAttribute('aria-pressed', 'true');
    });
    tile.addEventListener('pointerleave', event => {
      if (finePointer.matches && event.pointerType === 'mouse') tile.setAttribute('aria-pressed', 'false');
    });
    tile.addEventListener('click', event => {
      if (finePointer.matches && event.detail !== 0) return;
      photos.forEach(photo => {
        if (photo === tile) return;
        photo.classList.remove('is-flipped');
        photo.setAttribute('aria-pressed', 'false');
      });
      toggle();
    });
    tile.addEventListener('blur', () => {
      if (!finePointer.matches) return;
      tile.classList.remove('is-flipped');
      tile.setAttribute('aria-pressed', 'false');
    });
  });
  document.addEventListener('pointerdown', event => {
    if (event.target.closest('.photo-tile')) return;
    photos.forEach(tile => { tile.classList.remove('is-flipped'); tile.setAttribute('aria-pressed', 'false'); });
  });
  reducedMotion.addEventListener('change', () => {
    halt();
  });

  const dialog = document.querySelector('#contact-dialog');
  document.querySelector('.about-contact-button').addEventListener('click', () => dialog.showModal());
  const copyStatus = dialog.querySelector('.contact-copy-status');
  dialog.querySelectorAll('.contact-copy').forEach(button => {
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copyValue);
        copyStatus.textContent = button.dataset.copyValue.includes('@') ? '邮箱已复制' : '电话号码已复制';
      } catch {
        copyStatus.textContent = '复制失败，请手动选择并复制。';
      }
    });
  });
  dialog.addEventListener('close', () => { copyStatus.textContent = ''; });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
})();
