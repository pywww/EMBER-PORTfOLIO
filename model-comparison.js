window.initModelComparison = function (root) {
  root.querySelectorAll('.compare-stage').forEach(stage => {
    if (stage.dataset.ready) return;
    stage.dataset.ready = 'true';
    const range = stage.querySelector('.compare-range');
    const update = () => stage.style.setProperty('--split', `${range.value}%`);
    range.addEventListener('input', update);
    update();
  });
};
window.initModelComparison(document);
