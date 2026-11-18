(() => {
  'use strict';
  // Keep the original articles as the no-script reading layout, then give each
  // illustrated point the same copy/gallery composition as Project 1.
  document.querySelectorAll('#experience .fm-section-body > article, #reflection .fm-section-body > article').forEach(panel => {
    const figures = [...panel.querySelectorAll('.screen-shot')];
    if (!figures.length) return;
    const titles = figures.map(figure => {
      const label = figure.querySelector('figcaption');
      return (label && [...label.childNodes].map(node => node.textContent.trim()).filter(Boolean).join(' · ')) || figure.closest('.review-item')?.querySelector('h4')?.textContent.trim() || figure.querySelector('img').alt;
    });
    let copy = panel.querySelector(':scope > .story-copy');
    if (!copy) {
      copy = document.createElement('div');
      copy.className = 'story-copy';
      const heading = panel.querySelector(':scope > .wide-story-heading');
      if (heading) {
        copy.append(...heading.firstElementChild.childNodes, ...heading.lastElementChild.childNodes);
        const explanation = panel.querySelector('.input-explanation');
        if (explanation) copy.append(explanation);
      } else {
        copy.append(panel.querySelector('.reflection-heading'));
        if (panel.classList.contains('next-direction')) {
          panel.querySelectorAll(':scope > .reading-copy, :scope > .future-flow').forEach(item => copy.append(item));
        }
        panel.querySelectorAll('.review-item').forEach(item => {
          [...item.children].filter(child => child.matches('h4,p')).forEach(child => copy.append(child));
        });
        const takeaway = panel.querySelector(':scope > .decision-takeaway');
        if (takeaway) copy.append(takeaway);
        const validation = panel.querySelector(':scope > .validation-task');
        if (validation) copy.append(validation);
      }
    }
    const note = panel.querySelector('.panel-note');
    if (note) copy.append(note);
    const gallery = document.createElement('div');
    gallery.className = 'fm-gallery';
    gallery.setAttribute('role', 'region');
    gallery.setAttribute('aria-roledescription', '轮播');
    gallery.setAttribute('aria-label', copy.querySelector('h3').textContent.trim() + '配图');
    const galleryStage = document.createElement('div');
    galleryStage.className = 'fm-gallery-stage';
    galleryStage.append(...figures);
    const galleryCaption = document.createElement('p');
    galleryCaption.className = 'fm-gallery-caption';
    galleryCaption.setAttribute('aria-live', 'polite');
    galleryCaption.setAttribute('aria-atomic', 'true');
    let active = 0;
    let suppressClick = false;
    figures.forEach((figure, index) => {
      const visual = figure.querySelector('[data-zoom]');
      visual.addEventListener('click', event => {
        if (suppressClick || index !== active) {
          event.preventDefault();
          event.stopImmediatePropagation();
          if (!suppressClick) show(index);
        }
      }, true);
    });
    // Respond to physical mouse movement, not stationary-pointer enter events
    // caused by the cards moving underneath it during the transition.
    let lastMouse = null;
    let hoverTarget = -1;
    let hoverTimer = 0;
    galleryStage.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      if (lastMouse?.x === event.clientX && lastMouse?.y === event.clientY) return;
      lastMouse = { x: event.clientX, y: event.clientY };
      const figure = event.target.closest('.screen-shot');
      const index = figures.indexOf(figure);
      if (index < 0 || index === active) {
        hoverTarget = -1;
        clearTimeout(hoverTimer);
        return;
      }
      if (index === hoverTarget) return;
      hoverTarget = index;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => {
        if (hoverTarget === index) show(index);
      }, 180);
    });
    galleryStage.addEventListener('pointerleave', () => {
      lastMouse = null;
      hoverTarget = -1;
      clearTimeout(hoverTimer);
    });
    function show(index) {
      clearTimeout(hoverTimer);
      active = (index + figures.length) % figures.length;
      figures.forEach((figure, i) => {
        const offset = figures.length > 2 ? (i - active + figures.length + 1) % figures.length - 1 : i - active;
        // Keep only the active image and its immediate neighbours on stage.
        figure.hidden = Math.abs(offset) > 1;
        figure.dataset.position = offset < 0 ? 'prev' : offset > 0 ? 'next' : 'center';
        figure.dataset.active = String(i === active);
        figure.setAttribute('aria-hidden', String(i !== active));
        figure.querySelector('[data-zoom]').tabIndex = i === active ? 0 : -1;
      });
      galleryCaption.textContent = titles[active];
    }
    gallery.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key) || figures.length < 2) return;
      event.preventDefault();
      show(active + (event.key === 'ArrowRight' ? 1 : -1));
      figures[active].querySelector('[data-zoom]').focus({ preventScroll: true });
    });
    let touchStart = null;
    galleryStage.addEventListener('pointerdown', event => {
      if (event.pointerType === 'touch') touchStart = { x: event.clientX, y: event.clientY };
    });
    galleryStage.addEventListener('pointerup', event => {
      if (!touchStart) return;
      const dx = event.clientX - touchStart.x;
      const dy = event.clientY - touchStart.y;
      touchStart = null;
      if (figures.length > 1 && Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        show(active + (dx < 0 ? 1 : -1));
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 350);
      }
    });
    galleryStage.addEventListener('pointercancel', () => { touchStart = null; });
    gallery.append(galleryStage, galleryCaption);
    panel.replaceChildren(copy, gallery);
    panel.classList.add('fm-gallery-layout');
    // Lead the waiting/results gallery with the generated try-on result.
    const primary = figures.findIndex(figure => figure.classList.contains('primary-shot'));
    show(primary >= 0 ? primary : 0);
  });

  // Enhance the original articles; without JavaScript every point stays readable.
  document.querySelectorAll('.fm-tabs').forEach(tablist => {
    const body = tablist.parentElement;
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = [...body.children].filter(element => element.tagName === 'ARTICLE');
    if (tabs.length !== panels.length) return;
    panels.forEach((panel, index) => {
      panel.id = tabs[index].getAttribute('aria-controls');
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', tabs[index].id);
      panel.tabIndex = 0;
    });
    const select = (index, focus = false) => {
      const active = (index + tabs.length) % tabs.length;
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === active));
        tab.tabIndex = i === active ? 0 : -1;
        panels[i].hidden = i !== active;
      });
      if (focus) {
        tabs[active].focus({ preventScroll: true });
        tabs[active].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
      }
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        const next = event.key === 'ArrowRight' ? index + 1 : event.key === 'ArrowLeft' ? index - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : null;
        if (next === null) return;
        event.preventDefault();
        select(next, true);
      });
    });
    body.classList.add('fm-tabs-enhanced');
    select(0);
    tablist.hidden = false;
  });

  const spotlightCards = document.querySelectorAll('.direction-summary li, #problem .scene-card');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const summaryReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  spotlightCards.forEach(card => {
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const clearSpotlight = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      card.classList.remove('spotlight-active');
    };
    const moveSpotlight = event => {
      if (!finePointer.matches || summaryReducedMotion.matches || event.pointerType === 'touch') return;
      const bounds = card.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        card.style.setProperty('--spotlight-x', `${pointerX}px`);
        card.style.setProperty('--spotlight-y', `${pointerY}px`);
        card.classList.add('spotlight-active');
        frame = 0;
      });
    };
    card.addEventListener('pointerenter', moveSpotlight);
    card.addEventListener('pointermove', moveSpotlight);
    card.addEventListener('pointerleave', clearSpotlight);
    card.addEventListener('pointercancel', clearSpotlight);
    finePointer.addEventListener('change', clearSpotlight);
    summaryReducedMotion.addEventListener('change', clearSpotlight);
    window.addEventListener('blur', clearSpotlight);
  });

  const dialog = document.querySelector('.fm-lightbox');
  const image = dialog.querySelector('.zoom-image');
  const stage = dialog.querySelector('.zoom-stage');
  const caption = dialog.querySelector('#zoom-caption');
  const closeButton = dialog.querySelector('.zoom-close');
  const sizeButton = dialog.querySelector('.zoom-size');
  let opener = null;

  const resetSize = () => {
    stage.classList.remove('actual-size');
    sizeButton.setAttribute('aria-pressed', 'false');
    sizeButton.textContent = '查看原尺寸';
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  };

  document.querySelectorAll('[data-zoom]').forEach(button => {
    button.addEventListener('click', () => {
      const thumbnail = button.querySelector('img');
      if (typeof dialog.showModal !== 'function') {
        window.open(button.dataset.full || thumbnail.currentSrc || thumbnail.src, '_blank', 'noopener');
        return;
      }
      opener = button;
      resetSize();
      image.src = button.dataset.full || thumbnail.currentSrc || thumbnail.src;
      image.alt = thumbnail.alt;
      caption.textContent = button.dataset.caption || thumbnail.alt;
      dialog.showModal();
      document.documentElement.classList.add('fm-modal-open');
      closeButton.focus();
    });
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [sizeButton, closeButton];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('fm-modal-open');
    resetSize();
    image.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'/%3E";
    opener?.focus({ preventScroll: true });
  });
  sizeButton.addEventListener('click', () => {
    const actual = stage.classList.toggle('actual-size');
    sizeButton.setAttribute('aria-pressed', String(actual));
    sizeButton.textContent = actual ? '适应窗口' : '查看原尺寸';
    stage.scrollTop = 0;
    stage.scrollLeft = 0;
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: '0px 0px -25px 0px' });
    document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
    // A hash jump may reach a section before the first observer callback.
    const showHashTarget = () => {
      const id = location.hash.slice(1);
      const section = id && document.getElementById(id);
      if (!section) return;
      if (section.classList.contains('reveal')) section.classList.add('is-visible');
      section.querySelectorAll('.reveal').forEach(element => element.classList.add('is-visible'));
    };
    showHashTarget();
    window.addEventListener('hashchange', showHashTarget);
    reducedMotion.addEventListener('change', event => {
      if (event.matches) {
        document.body.classList.remove('motion-ready');
        observer.disconnect();
      }
    });
  }
})();
