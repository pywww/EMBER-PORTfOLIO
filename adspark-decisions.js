/* Four decisions, independent manual galleries, and a native image dialog. */
(async () => {
  // Apply saved edits before setting interactive state; the editor restores visibility.
  await window.PortfolioEdits?.ready;
  const root = document.querySelector('.case-decisions');
  if (!root) return;
  const tablist = root.querySelector('.decision-tabs');
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const panels = [...root.querySelectorAll('[data-decision]')];
  const dialog = document.createElement('dialog');
  dialog.className = 'decision-lightbox';
  dialog.setAttribute('aria-labelledby', 'decision-zoom-title');
  dialog.innerHTML = '<div class="decision-lightbox-header"><h2 id="decision-zoom-title"></h2><button type="button" aria-label="关闭图片">×</button></div><div class="decision-lightbox-media"></div>';
  document.body.append(dialog);
  let opener = null;
  const closeZoom = () => dialog.close();
  dialog.querySelector('button').addEventListener('click', closeZoom);
  dialog.addEventListener('click', event => { if (event.target === dialog) closeZoom(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('decision-zoom-open');
    opener?.focus({preventScroll:true});
  });
  function zoom(slide, trigger) {
    const original = slide.querySelector('.gallery-original');
    if (!original) return;
    if (typeof dialog.showModal !== 'function') {
      window.open(original.href, '_blank', 'noopener');
      return;
    }
    opener = trigger;
    dialog.querySelector('h2').textContent = slide.dataset.slideTitle;
    const image = document.createElement('img');
    image.src = original.href;
    image.alt = original.querySelector('img').alt;
    dialog.querySelector('.decision-lightbox-media').replaceChildren(image);
    dialog.showModal();
    document.body.classList.add('decision-zoom-open');
  }
  panels.forEach((panel, panelIndex) => {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabs[panelIndex].id);
    panel.tabIndex = 0;
    const gallery = panel.querySelector('.decision-gallery');
    const slides = [...gallery.querySelectorAll('.gallery-slide')];
    const stage = document.createElement('div');
    stage.className = 'gallery-stage';
    stage.append(...slides);
    if (panel.dataset.decision === 'chat') {
      const reference = slides[1].querySelector('img');
      const referenceRatio = Number(reference.getAttribute('width')) / Number(reference.getAttribute('height'));
      stage.style.setProperty('--workbench-ratio', referenceRatio);
      slides.forEach(slide => {
        const image = slide.querySelector('img');
        const ratio = Number(image.getAttribute('width')) / Number(image.getAttribute('height'));
        slide.style.setProperty('--chat-relative-width', ratio / referenceRatio);
      });
    }
    const caption = document.createElement('div');
    caption.className = 'gallery-caption';
    gallery.dataset.count = String(slides.length);
    let active = 0;
    let ignoreClickUntil = 0;
    let hoverTimer = null;
    const navigation = document.createElement('div');
    navigation.className = 'gallery-navigation';
    const previews = ['prev', 'next'].map(side => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `gallery-preview gallery-preview-${side}`;
      button.addEventListener('click', () => { if (Date.now() >= ignoreClickUntil) show(Number(button.dataset.index)); });
      // Stable side hit areas avoid retriggering hover as the pictures move.
      button.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'mouse' || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
        clearTimeout(hoverTimer);
        const target = Number(button.dataset.index);
        hoverTimer = setTimeout(() => show(target), 180);
      });
      button.addEventListener('pointerleave', () => clearTimeout(hoverTimer));
      navigation.prepend(button);
      return button;
    });
    const dots = document.createElement('div');
    dots.className = 'gallery-dots';
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', '选择图片');
    const dotButtons = slides.map((slide, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery-dot';
      button.setAttribute('aria-label', `第${index + 1}张：${slide.dataset.slideTitle}`);
      button.addEventListener('click', () => show(index));
      dots.append(button);
      return button;
    });
    const status = document.createElement('span');
    status.className = 'gallery-status';
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    function show(index) {
      clearTimeout(hoverTimer);
      active = (index + slides.length) % slides.length;
      if (panel.dataset.decision === 'brief') {
        const image = slides[active].querySelector('img');
        if (image) stage.style.setProperty('--portrait-ratio', Number(image.getAttribute('width')) / Number(image.getAttribute('height')));
      }
      slides.forEach((slide, i) => {
        slide.dataset.active = String(i === active);
        let position = i - active;
        if (slides.length > 2) position = (i - active + slides.length + 1) % slides.length - 1;
        slide.dataset.position = position < 0 ? 'prev' : position > 0 ? 'next' : 'center';
        const visual = slide.querySelector('.gallery-visual');
        if (i === active) {
          visual.removeAttribute('role');
          visual.removeAttribute('aria-label');
          visual.removeAttribute('tabindex');
        } else {
          visual.tabIndex = -1;
        }
        const original = slide.querySelector('.gallery-original');
        if (original) {
          original.tabIndex = i === active ? 0 : -1;
          original.setAttribute('aria-hidden', String(i !== active));
        }
        slide.querySelector('figcaption').setAttribute('aria-hidden', 'true');
      });
      caption.textContent = slides[active].querySelector('figcaption').textContent;
      previews.forEach((button, index) => {
        const target = slides.findIndex(slide => slide.dataset.position === (index === 0 ? 'prev' : 'next'));
        button.hidden = target < 0;
        if (target < 0) return;
        button.dataset.index = String(target);
        button.setAttribute('aria-label', `居中查看${slides[target].dataset.slideTitle}`);
      });
      status.textContent = `第${active + 1}张，共${slides.length}张：${slides[active].dataset.slideTitle}`;
      dotButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
    }
    slides.forEach((slide, index) => {
      const visual = slide.querySelector('.gallery-visual');
      visual.addEventListener('click', event => {
        if (Date.now() < ignoreClickUntil) { event.preventDefault(); event.stopPropagation(); return; }
        if (index !== active) { event.preventDefault(); event.stopPropagation(); show(index); }
      }, true);
      visual.addEventListener('keydown', event => {
        if (index !== active && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          show(index);
          const original = slide.querySelector('.gallery-original');
          if (original) original.focus({preventScroll:true});
          else dotButtons[index].focus({preventScroll:true});
        }
      });
      const original = slide.querySelector('.gallery-original');
      original?.addEventListener('click', event => {
        if (Date.now() < ignoreClickUntil) { event.preventDefault(); return; }
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        zoom(slide, original);
      });
    });
    gallery.addEventListener('keydown', event => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      if (event.target.closest('.gallery-original')) dotButtons[(active + step + slides.length) % slides.length].focus({preventScroll:true});
      show(active + step);
    });
    let startTouch = null;
    gallery.addEventListener('touchstart', event => {
      startTouch = event.touches.length === 1 && event.target.closest('.gallery-stage')
        ? {x:event.touches[0].clientX, y:event.touches[0].clientY} : null;
    }, {passive:true});
    gallery.addEventListener('touchend', event => {
      if (!startTouch || !event.changedTouches.length) return;
      const dx = event.changedTouches[0].clientX - startTouch.x;
      const dy = event.changedTouches[0].clientY - startTouch.y;
      startTouch = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        ignoreClickUntil = Date.now() + 350;
        show(active + (dx < 0 ? 1 : -1));
      }
    }, {passive:true});
    gallery.addEventListener('touchcancel', () => { startTouch = null; }, {passive:true});
    navigation.hidden = slides.length < 2;
    dots.hidden = slides.length < 2;
    stage.append(navigation);
    gallery.append(stage, caption, dots, status);
    show(panel.dataset.decision === 'chat' ? 1 : 0);
    const footerObserver = new ResizeObserver(() => {
      panel.style.setProperty('--gallery-footer', `${gallery.offsetHeight - stage.offsetHeight}px`);
    });
    footerObserver.observe(gallery);
  });
  function select(index, focus = false) {
    const active = (index + tabs.length) % tabs.length;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === active));
      tab.tabIndex = i === active ? 0 : -1;
      panels[i].dataset.active = String(i === active);
      panels[i].setAttribute('aria-hidden', String(i !== active));
      panels[i].tabIndex = i === active ? 0 : -1;
    });
    if (focus) tabs[active].focus({preventScroll:true});
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('keydown', event => {
      const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
      if (next === null) return;
      event.preventDefault();
      select(next, true);
    });
  });
  function followAnchor() {
    const id = decodeURIComponent(location.hash.slice(1));
    const index = panels.findIndex(panel => panel.id === id || [...panel.querySelectorAll('[id]')].some(element => element.id === id));
    if (index !== -1) select(index);
  }
  select(0);
  root.classList.add('decisions-enhanced');
  tablist.hidden = false;
  followAnchor();
  window.addEventListener('hashchange', followAnchor);
})();
