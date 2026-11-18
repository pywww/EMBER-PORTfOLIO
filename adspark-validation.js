/* Keep the exported pyramid geometry; align each layer's guide to its heading. */
(() => {
  const diagram = document.querySelector('.validation-pyramid');
  const content = document.querySelector('.validation-assessment-content');
  const headings = [...document.querySelectorAll('.validation-layer h4')];
  if (!diagram || !content || headings.length !== 3) return;
  const original = diagram.getAttribute('src');
  let template, activeUrl, signature, frame;
  const queue = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(align);
  };
  function align() {
    if (!template) return;
    if (matchMedia('(max-width:600px)').matches) {
      if (signature !== 'stacked') {
        diagram.src = original;
        if (activeUrl) URL.revokeObjectURL(activeUrl);
        activeUrl = null;
        signature = 'stacked';
      }
      return;
    }
    const rect = diagram.getBoundingClientRect();
    const scale = rect.width / 340;
    if (!scale) return;
    const centers = headings.map(heading => {
      const r = heading.getBoundingClientRect();
      return (r.top + r.height / 2 - rect.top) / scale;
    });
    const nextSignature = [rect.width, ...centers].map(n => n.toFixed(2)).join(',');
    if (signature === nextSignature) return;
    signature = nextSignature;
    const svg = template.cloneNode(true);
    const root = svg.querySelector('g');
    const parts = [...root.children];
    // Export order: business shape, product shape, model shape, then three guides.
    [[0, 7, 8], [1, 5, 6], [2, 3, 4]].forEach((indices, index) => {
      const level = 2 - index;
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `translate(0 ${centers[level] - [43,161,279][level]})`);
      indices.forEach(i => {
        // Nudge only the top cap down by 8 CSS pixels; its guide stays aligned.
        if (level === 0 && i === 2) parts[i].setAttribute('transform', `translate(0 ${8 / scale})`);
        group.append(parts[i]);
      });
      root.append(group);
    });
    const height = Math.max(384, centers[2] + 80);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 340 ${height}`);
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], {type:'image/svg+xml'}));
    const previous = activeUrl;
    activeUrl = url;
    diagram.src = url;
    if (previous) URL.revokeObjectURL(previous);
  }
  fetch(original).then(response => {
    if (!response.ok) throw new Error('Pyramid asset unavailable');
    return response.text();
  }).then(source => {
    const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
    if (parsed.querySelector('parsererror')) return;
    template = parsed.documentElement;
    const observer = new ResizeObserver(queue);
    observer.observe(content);
    headings.forEach(heading => observer.observe(heading.parentElement));
    window.addEventListener('resize', queue);
    document.fonts.ready.then(queue);
    queue();
  }).catch(() => {}); // The original exported asset remains the fallback.
})();
