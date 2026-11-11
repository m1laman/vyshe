const dialog = document.querySelector('#order');
const quiz = document.querySelector('#quiz');
const fields = quiz.querySelector('.quiz-fields');
const actions = quiz.querySelector('.quiz-actions');
const submit = quiz.querySelector('button[type="submit"]');
const quizStatus = document.querySelector('#quiz-status');
const closeQuiz = dialog.querySelector('.close');
const serviceInput = quiz.elements['fi-select-service'];
const serviceList = quiz.querySelector('#service-options');
const serviceEmpty = quiz.querySelector('#service-empty');
const serviceOptions = [...serviceList.children];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const smallScreen = window.matchMedia('(max-width: 760px)');

function normalizeService(value) {
  return value.trim().toLocaleLowerCase('ru').replaceAll('ё', 'е');
}

function highlightService(option) {
  serviceList.querySelector('[aria-selected="true"]')?.setAttribute('aria-selected', 'false');
  if (!option) {
    serviceInput.removeAttribute('aria-activedescendant');
    return;
  }
  option.setAttribute('aria-selected', 'true');
  serviceInput.setAttribute('aria-activedescendant', option.id);
  option.scrollIntoView({ block: 'nearest' });
}

function closeServiceList() {
  serviceList.hidden = serviceEmpty.hidden = true;
  serviceInput.setAttribute('aria-expanded', 'false');
  highlightService(null);
}

function filterServices() {
  const prefix = normalizeService(serviceInput.value);
  let hasMatches = false;
  for (const option of serviceOptions) {
    option.hidden = !normalizeService(option.textContent).startsWith(prefix);
    if (!option.hidden) hasMatches = true;
  }
  highlightService(null);
  serviceList.scrollTop = 0;
  serviceList.hidden = !hasMatches;
  serviceEmpty.hidden = hasMatches;
  serviceInput.setAttribute('aria-expanded', String(hasMatches));
}

function chooseService(option) {
  serviceInput.value = option.textContent;
  serviceInput.setCustomValidity('');
  closeServiceList();
}

serviceInput.addEventListener('focus', filterServices);
serviceInput.addEventListener('click', () => {
  if (serviceList.hidden) filterServices();
});
serviceInput.addEventListener('input', () => {
  serviceInput.setCustomValidity('');
  filterServices();
});
serviceInput.addEventListener('blur', closeServiceList);
serviceList.addEventListener('mousedown', event => {
  if (event.target.closest('[role="option"]')) event.preventDefault();
});
serviceList.addEventListener('click', event => {
  const option = event.target.closest('[role="option"]');
  if (option) chooseService(option);
});

serviceInput.addEventListener('keydown', event => {
  if (event.isComposing) return;
  if (event.key === 'Escape' && (!serviceList.hidden || !serviceEmpty.hidden)) {
    event.preventDefault();
    event.stopPropagation();
    closeServiceList();
    return;
  }

  const active = serviceList.querySelector('[aria-selected="true"]');
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    if (serviceList.hidden) filterServices();
    const matches = serviceOptions.filter(option => !option.hidden);
    if (!matches.length) return;
    event.preventDefault();
    const index = matches.indexOf(active);
    const next = event.key === 'ArrowDown'
      ? Math.min(index + 1, matches.length - 1)
      : (index < 0 ? matches.length - 1 : Math.max(index - 1, 0));
    highlightService(matches[next]);
  } else if (event.key === 'Enter' && !serviceList.hidden) {
    event.preventDefault();
    const matches = serviceOptions.filter(option => !option.hidden);
    if (active || matches.length === 1) chooseService(active || matches[0]);
  }
});

document.querySelectorAll('[data-order]').forEach(button => {
  button.addEventListener('click', () => {
    quiz.reset();
    serviceInput.value = button.dataset.order;
    serviceInput.setCustomValidity('');
    closeServiceList();
    quizStatus.hidden = true;
    fields.hidden = actions.hidden = false;
    dialog.showModal();
  });
});

closeQuiz.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (submit.disabled || event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right
    || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) dialog.close();
});
dialog.addEventListener('cancel', event => {
  if (submit.disabled) event.preventDefault();
});
dialog.addEventListener('close', closeServiceList);

quiz.addEventListener('submit', async event => {
  event.preventDefault();
  if (!dialog.open || submit.disabled || actions.hidden) return;

  const serviceName = normalizeService(serviceInput.value);
  const selectedService = serviceOptions.find(option => normalizeService(option.textContent) === serviceName);
  if (!selectedService) {
    serviceInput.setCustomValidity('Выберите услугу из списка.');
    serviceInput.reportValidity();
    return;
  }
  chooseService(selectedService);
  const data = new FormData(quiz);
  fields.disabled = submit.disabled = closeQuiz.disabled = true;
  quizStatus.hidden = false;
  quizStatus.textContent = 'Отправляем заявку…';
  try {
    const response = await fetch(quiz.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data,
      redirect: 'error',
      signal: AbortSignal.timeout(30_000)
    });
    if (!response.ok || (await response.json()).success !== true) {
      throw new Error('Submission was not accepted');
    }

    quiz.reset();
    fields.hidden = actions.hidden = true;
    quizStatus.textContent = 'Заявка принята.';
  } catch {
    quizStatus.textContent = 'Не удалось подтвердить отправку. Данные остались в форме. Попробуйте ещё раз.';
  } finally {
    fields.disabled = submit.disabled = closeQuiz.disabled = false;
  }
});

const menuButton=document.querySelector('.menu-btn'),menu=document.querySelector('.mobile-menu');
function setMobileMenu(open){
  menu.hidden=!open;
  menuButton.setAttribute('aria-expanded',String(open));
  menuButton.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
  menuButton.textContent=open?'×':'☰';
}
menuButton.addEventListener('click',()=>setMobileMenu(menu.hidden));
const servicesNav=document.querySelector('.services-nav');
const servicesToggle=document.querySelector('.services-toggle');
const servicesDropdown=document.querySelector('#services-dropdown');
const desktopNavigation=window.matchMedia('(min-width: 1001px)');
let servicesCloseTimer;
let servicesAnimation=null;
function setServicesOpen(open){
  clearTimeout(servicesCloseTimer);
  const wasOpen=servicesToggle.getAttribute('aria-expanded')==='true';
  if(open===wasOpen)return;
  const wasHidden=servicesDropdown.hidden;
  const currentStyle=wasHidden?null:getComputedStyle(servicesDropdown);
  const startOpacity=wasHidden?'0':currentStyle.opacity;
  const startTransform=wasHidden?'translateY(-10px)':currentStyle.transform;
  if(servicesAnimation){servicesAnimation.cancel();servicesAnimation=null;}
  servicesNav.classList.toggle('is-open',open);
  servicesToggle.setAttribute('aria-expanded',String(open));
  servicesToggle.setAttribute('aria-label',open?'Закрыть список услуг':'Открыть список услуг');
  servicesDropdown.inert=!open;
  servicesDropdown.setAttribute('aria-hidden',String(!open));
  const moving=!reducedMotion.matches&&typeof servicesDropdown.animate==='function'&&desktopNavigation.matches;
  if(!moving){servicesDropdown.hidden=!open;servicesNav.classList.remove('is-animating');return;}
  servicesDropdown.hidden=false;
  servicesNav.classList.add('is-animating');
  const animation=servicesDropdown.animate(
    [{opacity:startOpacity,transform:startTransform},{opacity:open?1:0,transform:open?'translateY(0)':'translateY(-8px)'}],
    {duration:open?230:160,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'}
  );
  servicesAnimation=animation;
  animation.finished.then(()=>{
    if(servicesAnimation!==animation)return;
    servicesDropdown.hidden=!open;
    servicesNav.classList.remove('is-animating');
    animation.cancel();servicesAnimation=null;
  }).catch(()=>{});
}
servicesNav.addEventListener('pointerenter',event=>{if(desktopNavigation.matches&&event.pointerType==='mouse')setServicesOpen(true);});
servicesNav.addEventListener('pointerleave',()=>{servicesCloseTimer=setTimeout(()=>{if(!servicesNav.contains(document.activeElement))setServicesOpen(false);},180);});
servicesNav.addEventListener('focusout',event=>{if(!servicesNav.contains(event.relatedTarget))setServicesOpen(false);});
servicesToggle.addEventListener('click',()=>setServicesOpen(servicesToggle.getAttribute('aria-expanded')!=='true'));
servicesNav.addEventListener('keydown',event=>{
  if(event.key==='ArrowDown'&&event.target.closest('.services-link, .services-toggle')){
    event.preventDefault();setServicesOpen(true);servicesDropdown.querySelector('a').focus();
  }
});
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  if(!servicesDropdown.hidden){
    const focusInside=servicesNav.contains(document.activeElement);
    setServicesOpen(false);
    if(focusInside)servicesToggle.focus();
  }
  if(!menu.hidden){setMobileMenu(false);menuButton.focus();}
});
document.addEventListener('pointerdown',event=>{if(!servicesNav.contains(event.target))setServicesOpen(false);});
desktopNavigation.addEventListener('change',()=>{setServicesOpen(false);setMobileMenu(false);});

// The same local artwork is split into mountain and foreground planes.
// Scroll events schedule one frame only while the first screen is visible.
const hero=document.querySelector('.hero');
const mountains=hero?.querySelector('.hero-mountains');
const city=hero?.querySelector('.hero-city');
let heroFrame=0,heroVisible=true;
function paintHero(){
  heroFrame=0;
  if(!hero||!mountains||!city)return;
  if(reducedMotion.matches){mountains.style.transform='';city.style.transform='';hero.classList.remove('has-parallax');return;}
  const rect=hero.getBoundingClientRect();
  if(rect.bottom<0||rect.top>window.innerHeight)return;
  const travel=Math.min(Math.max(0,hero.offsetTop-rect.top),rect.height);
  const mountainShift=Math.min(smallScreen.matches?12:48,travel*(smallScreen.matches?0.045:0.14));
  const cityShift=Math.min(smallScreen.matches?3:10,travel*.025);
  mountains.style.transform=`translate3d(0,${mountainShift.toFixed(2)}px,0)`;
  city.style.transform=`translate3d(0,${cityShift.toFixed(2)}px,0)`;
  hero.classList.add('has-parallax');
}
function requestHeroFrame(){if(hero&&!heroFrame&&heroVisible&&!document.hidden)heroFrame=requestAnimationFrame(paintHero);}
if(hero){
  window.addEventListener('scroll',requestHeroFrame,{passive:true});
  window.addEventListener('resize',requestHeroFrame,{passive:true});
  document.addEventListener('visibilitychange',requestHeroFrame);
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      heroVisible=entries[0].isIntersecting;
      hero.classList.toggle('has-parallax',heroVisible&&!reducedMotion.matches);
      if(heroVisible)requestHeroFrame();
    });
    observer.observe(hero);
  }
  requestHeroFrame();
}
reducedMotion.addEventListener('change',()=>{
  if(servicesAnimation){servicesAnimation.cancel();servicesAnimation=null;}
  servicesNav.classList.remove('is-animating');
  servicesDropdown.hidden=servicesToggle.getAttribute('aria-expanded')!=='true';
  if(heroFrame){cancelAnimationFrame(heroFrame);heroFrame=0;}
  paintHero();
});
let active='all';const search=document.querySelector('#price-search');function filterPrices(){const query=(search?.value||'').toLocaleLowerCase('ru').trim();let total=0;document.querySelectorAll('.price-group').forEach(group=>{let count=0;group.querySelectorAll('.price-rows>a').forEach(row=>{const visible=(active==='all'||group.dataset.group===active)&&row.textContent.toLocaleLowerCase('ru').includes(query);row.hidden=!visible;if(visible)count++;});group.hidden=count===0;total+=count;});const empty=document.querySelector('#no-results');if(empty)empty.hidden=total>0;}
search?.addEventListener('input',filterPrices);document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{active=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b===button));filterPrices();}));
