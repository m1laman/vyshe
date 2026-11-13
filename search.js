(() => {
  const search = document.querySelector('.header-search');
  const header = search.closest('header');
  const toggle = search.querySelector('[data-site-search]');
  const panel = search.querySelector('#site-search-panel');
  const input = search.querySelector('#site-search-input');
  const list = search.querySelector('#site-search-results');
  const count = search.querySelector('#site-search-count');
  const empty = search.querySelector('#site-search-empty');
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

  function closeSearch(restoreFocus = false) {
    search.classList.remove('is-open');
    header.classList.remove('search-is-open');
    toggle.setAttribute('aria-expanded', 'false');
    input.hidden = panel.hidden = true;
    search.querySelector('[data-search-close]').hidden = true;
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', () => {
    if (!search.classList.contains('is-open')) {
      document.querySelector('.services-toggle[aria-expanded="true"]')?.click();
      document.querySelector('.menu-btn[aria-expanded="true"]')?.click();
      input.value = '';
      filter();
      input.hidden = panel.hidden = false;
      search.querySelector('[data-search-close]').hidden = false;
      search.classList.add('is-open');
      header.classList.add('search-is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }
    input.focus({ preventScroll: true });
  });
  search.querySelector('[data-search-close]').addEventListener('click', () => closeSearch(true));
  search.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.isComposing) return;
    event.preventDefault();
    event.stopPropagation();
    closeSearch(true);
  });
  document.addEventListener('pointerdown', event => {
    if (!search.contains(event.target)) closeSearch();
  });
  search.addEventListener('focusout', event => {
    if (event.relatedTarget && !search.contains(event.relatedTarget)) closeSearch();
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
