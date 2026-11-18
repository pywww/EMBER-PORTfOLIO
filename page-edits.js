/* Saved visual edits are kept separately so subsequent development can read them. */
(() => {
  const selectorFor = el => {
    if (el.id) return '#' + CSS.escape(el.id);
    const parent = el.parentElement;
    if (!parent || el === document.querySelector('main')) return 'main';
    const siblings = [...parent.children].filter(e => e.tagName === el.tagName);
    return selectorFor(parent) + ' > ' + el.tagName.toLowerCase() + ':nth-of-type(' + (siblings.indexOf(el) + 1) + ')';
  };
  const items = [...document.querySelectorAll('main, main header, main h1, main h2, main h3, main h4, main p, main dt, main dd, main section, main article, main figure, main img, main .preview-placeholder, main .summary, main .summary-label, main .problem-copy, main .user-cards, main .scenario-list, main .position-summary, main .project-meta')];
  const originals = new Map(items.map(el => [el, {selector:selectorFor(el), html:el.innerHTML, style:el.getAttribute('style'), hidden:el.hidden}]));
  const textTags = ['H1','H2','H3','H4','P','DT','DD'];
  const properties = ['fontSize','fontWeight','lineHeight','letterSpacing','color','backgroundColor','textAlign','maxWidth','width','padding','marginTop','marginBottom','gap','borderRadius','gridTemplateColumns'];
  let rules = document.createElement('style');
  rules.dataset.savedEdits = 'true'; document.head.append(rules);
  function apply(data) {
    for (const [el, original] of originals) {
      if (textTags.includes(el.tagName)) el.innerHTML = original.html;
      if (original.style === null) el.removeAttribute('style'); else el.setAttribute('style', original.style);
      el.hidden = original.hidden;
    }
    const css = ['main[hidden],main [hidden]{display:none!important}'], warnings = [];
    for (const edit of data.edits || []) {
      let el;
      try { el = document.querySelector(edit.selector); } catch { warnings.push(edit.selector); continue; }
      if (!el || el.tagName.toLowerCase() !== edit.tag || !originals.has(el)) { warnings.push(edit.selector); continue; }
      if (typeof edit.text === 'string' && textTags.includes(el.tagName)) el.textContent = edit.text;
      if (edit.hidden) el.hidden = true;
      for (const [scope, styles] of Object.entries(edit.styles || {})) {
        // Values are CSS property values, never markup or arbitrary selectors.
        const safe = Object.entries(styles).filter(([key,value]) => properties.includes(key) && !/[{};<>]|url\s*\(/i.test(String(value))).map(([key,value]) => key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()) + ':' + value + '!important').join(';');
        if (!safe) continue;
        const rule = edit.selector + '{' + safe + '}';
        css.push(scope === 'mobile' ? '@media(max-width:600px){'+rule+'}' : scope === 'desktop' ? '@media(min-width:601px){'+rule+'}' : rule);
      }
    }
    rules.textContent = css.join('\n');
    return warnings;
  }
  window.PortfolioEdits = {items, originals, properties, textTags, apply, selectorFor, ready:null};
  window.PortfolioEdits.ready = fetch('./adspark-edits.json', {cache:'no-store'}).then(r => {if (!r.ok) throw new Error('load');return r.json();}).then(data => {apply(data);return data;}).catch(() => ({version:1,page:'adspark.html',edits:[]}));
})();
