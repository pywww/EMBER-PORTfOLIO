(() => {
  const button = document.querySelector('.ending-contact-button');
  button?.addEventListener('click', () => {
    const dialog = document.querySelector('#contact-dialog');
    if (dialog && typeof dialog.showModal === 'function') dialog.showModal();
    else location.href = './about.html';
  });
})();
