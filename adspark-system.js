(() => {
  const section = document.querySelector('.case-system');
  const dialog = document.querySelector('.system-dialog');
  if (!section || !dialog) return;
  const title = dialog.querySelector('h2');
  const slide = dialog.querySelector('.system-slide');
  const caption = dialog.querySelector('.system-caption');
  const dots = dialog.querySelector('.system-dots');
  const arrows = [...dialog.querySelectorAll('.system-arrow')];
  const groups = {
    knowledge: {title:'把文字约束与视觉参考分开组织', note:'品牌规范与视觉参考在 Prompt 编排时汇合。', slides:[['品牌文字知识库','品牌 SOP：分层组织品牌定位、话术与约束。','brand-knowledge.png'],['视觉锚点图册','视觉图册：组织参考图片及必须出现、禁止出现和可变化项。','visual-anchors.png']]},
    writeback: {title:'按素材 ID 写回，让历史记录可查询', note:'按 material_id 查询已有记录，通过 Find／Update／Insert 新增或更新。投放指标依赖人工回填，尚未接入投放 API。', slides:[['WriteBackFlow 工作流','按素材 ID 查询，经 UpsertRouter 分流至 UpdateRow 或 InsertRow。','writeback-workflow.png'],['数据库字段结构','数据库表结构：素材信息、Prompt、图片链接与审核等字段；字段描述中的数值不代表实际投放结果。','database-schema.png']]}
  };
  let group, index = 0, opener, savedOverflow;
  function render(value) {
    index = (value + group.slides.length) % group.slides.length;
    const [name, description, file] = group.slides[index];
    slide.replaceChildren();
    const original = document.createElement('div'); original.className = 'system-evidence-image';
    const image = document.createElement('img'); image.src = `./assets/adspark-05/${file}`; image.alt = `${name}：${description}`;
    original.append(image); slide.append(original); caption.textContent = description;
    [...dots.children].forEach((button,i) => button.setAttribute('aria-current',String(i === index)));
  }
  function open(mode, trigger) {
    opener = trigger; savedOverflow = document.body.style.overflow;
    dialog.dataset.mode = mode === 'diagram' ? 'diagram' : 'evidence';
    const diagramMode = mode === 'diagram';
    [caption,dots,...arrows,dialog.querySelector('.system-badge')].forEach(el => el.hidden = diagramMode);
    if (diagramMode) {
      title.textContent = 'Adspark 系统架构图';
      const img = section.querySelector('img').cloneNode(); img.loading = 'eager'; slide.replaceChildren(img);
    } else {
      group = groups[mode]; title.textContent = group.title;
      dots.replaceChildren();
      group.slides.forEach((_,i) => {const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label',`第${i+1}张图片`); b.addEventListener('click',() => render(i)); dots.append(b)});
      render(0);
    }
    dialog.showModal(); document.body.style.overflow = 'hidden'; dialog.querySelector('.system-close').focus();
  }
  section.querySelectorAll('[data-evidence]').forEach(b => b.addEventListener('click',() => open(b.dataset.evidence,b)));
  section.querySelector('.system-diagram').addEventListener('click',e => {e.preventDefault(); open('diagram',e.currentTarget)});
  dialog.querySelector('.system-close').addEventListener('click',() => dialog.close());
  dialog.addEventListener('close',() => {document.body.style.overflow = savedOverflow; opener?.focus({preventScroll:true})});
  dialog.addEventListener('click',e => {if (e.target === dialog) {const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
  arrows[0].addEventListener('click',() => render(index-1)); arrows[1].addEventListener('click',() => render(index+1));
  dialog.addEventListener('keydown',e => {if(dialog.dataset.mode==='evidence' && ['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();render(index+(e.key==='ArrowRight'?1:-1))}});
  let startX;
  dialog.querySelector('.system-carousel').addEventListener('touchstart',e => {startX=e.touches.length===1?e.touches[0].clientX:undefined},{passive:true});
  dialog.querySelector('.system-carousel').addEventListener('touchend',e => {if(dialog.dataset.mode==='evidence' && startX!==undefined){const delta=e.changedTouches[0].clientX-startX;if(Math.abs(delta)>50)render(index+(delta<0?1:-1))}startX=undefined},{passive:true});
})();
