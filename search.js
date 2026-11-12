(() => {
  const modal = document.querySelector('#site-search-dialog');
  const input = modal.querySelector('#site-search-input');
  const list = modal.querySelector('#site-search-results');
  const count = modal.querySelector('#site-search-count');
  const empty = modal.querySelector('#site-search-empty');
  const rows = [...list.children];
  const normalize = value => value.toLocaleLowerCase('ru').replaceAll('ё', 'е')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const indexed = rows.map(row => ({ row, text: normalize(row.querySelector('strong').textContent) }));
  const visibleLinks = () => rows.filter(row => !row.hidden).map(row => row.querySelector('a'));

  function filter() {
    const words = normalize(input.value).split(' ').filter(Boolean);
    let matches = 0;
    for (const { row, text } of indexed) {
      row.hidden = !words.every(word => text.includes(word));
      if (!row.hidden) matches++;
    }
    count.textContent = words.length ? `Найдено услуг: ${matches}` : `Все услуги: ${matches}`;
    empty.hidden = matches !== 0;
    list.scrollTop = 0;
  }

  document.querySelectorAll('[data-site-search]').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelector('.services-toggle[aria-expanded="true"]')?.click();
      document.querySelector('.menu-btn[aria-expanded="true"]')?.click();
      input.value = '';
      filter();
      if (!modal.open) modal.showModal();
      input.focus();
    });
  });
  modal.querySelector('[data-search-close]').addEventListener('click', () => modal.close());
  modal.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.isComposing) return;
    event.preventDefault();
    event.stopPropagation();
    modal.close();
  });
  modal.addEventListener('click', event => {
    if (event.target !== modal) return;
    const rect = modal.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
  });
  input.addEventListener('input', filter);
  input.addEventListener('keydown', event => {
    if (event.isComposing) return;
    const links = visibleLinks();
    if (!links.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      links[event.key === 'ArrowDown' ? 0 : links.length - 1].focus();
    } else if (event.key === 'Enter' && links.length === 1) {
      event.preventDefault();
      links[0].click();
    }
  });
  list.addEventListener('keydown', event => {
    const links = visibleLinks();
    const index = links.indexOf(event.target);
    if (index < 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      links[Math.min(index + 1, links.length - 1)].focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index === 0) input.focus();
      else links[index - 1].focus();
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      links[event.key === 'Home' ? 0 : links.length - 1].focus();
    }
  });
})();
