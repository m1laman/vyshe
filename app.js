const form = document.querySelector('#request');
const service = document.querySelector('#service');
const workers = document.querySelector('#workers');
const date = document.querySelector('#date');
const feedback = document.querySelector('#feedback');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const today = new Date();
const localDate = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
date.min = localDate;
date.value = localDate;
document.querySelectorAll('[data-service]').forEach(button => {
  button.addEventListener('click', () => {
    service.value = button.dataset.service;
    feedback.hidden = true;
    document.querySelector('#order').scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth' });
    service.focus({ preventScroll: true });
  });
});
document.querySelectorAll('[data-step]').forEach(button => {
  button.addEventListener('click', () => {
    const current = Number(workers.value) || 1;
    workers.value = String(Math.max(1, Math.min(100, current + Number(button.dataset.step))));
    feedback.hidden = true;
  });
});
form.addEventListener('input', () => { feedback.hidden = true; });
form.addEventListener('change', () => { feedback.hidden = true; });
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const formattedDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(`${data.get('date')}T12:00:00`));
  const title = document.createElement('b');
  title.textContent = 'Так будет выглядеть ваша заявка';
  const summary = document.createElement('p');
  summary.textContent = `${data.get('service')} · Рабочих: ${data.get('workers')} · ${formattedDate} · ${data.get('location')}`;
  const note = document.createElement('p');
  note.textContent = 'Это демонстрация. Данные остались только на этой странице.';
  feedback.replaceChildren(title, summary, note);
  feedback.hidden = false;
  feedback.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'nearest' });
});
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  mobileNav.hidden = true;
}
menuToggle.addEventListener('click', () => {
  const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!expanded));
  menuToggle.setAttribute('aria-label', expanded ? 'Открыть меню' : 'Закрыть меню');
  mobileNav.hidden = expanded;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });
