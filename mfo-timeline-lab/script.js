const stages = [
  { title: 'Заключаем годовой контракт', body: 'Обсуждаем потребности вашей семьи и условия годового сопровождения. Заключаем контракт — с этого начинается работа вашей постоянной медицинской команды.' },
  { title: 'Собираем медицинскую историю', body: 'Объединяем результаты анализов и обследований, заключения врачей, назначения, сведения о перенесённых заболеваниях и другие медицинские данные в единую историю здоровья.' },
  { title: 'Проводим первичную медицинскую оценку', body: 'Анализируем текущее состояние здоровья, образ жизни, индивидуальные и наследственные факторы риска, проводим генетическое исследование.' },
  { title: 'Формируем персональный план здоровья', body: 'Определяем необходимый объём медицинского наблюдения: обследования, скрининги, вакцинацию, контроль хронических состояний и значимых факторов риска. Только действительно необходимое, без лишних назначений.' },
  { title: 'Наблюдаем в динамике', body: 'Контролируем сроки и значимые изменения. Возвращаемся к важным вопросам тогда, когда это необходимо — без необходимости держать медицинский план в памяти самостоятельно.' },
  { title: 'Решаем возникающие медицинские вопросы', body: 'От нового симптома или изменения лабораторных показателей до сложного диагноза, госпитализации или хирургического лечения.' },
  { title: 'Подключаем внешнюю экспертизу', body: 'При необходимости находим лучшего в стране специалиста, звёздного профессора или лечебное учреждение с уникальным оборудованием, подходящее для конкретной клинической задачи, и передаём ему необходимый медицинский контекст.' },
  { title: 'Сохраняем непрерывность', body: 'Получаем результаты консультаций, обследований и лечения и учитываем их при дальнейшем наблюдении.' },
];

const pad = index => String(index + 1).padStart(2, '0');
const header = index => `<div class="concept-head"><span class="variant-label">Вариант ${index}</span><h2>Как работает Медицинский<br>Family Office</h2><img src="assets/clover.svg" width="30" height="30" alt=""></div>`;
const section = (index, className, content) => `<section class="concept ${className}" id="variant-${index}" aria-label="Вариант ${index}">${header(index)}${content}</section>`;

const clock = () => {
  const stops = stages.map((stage, index) => {
    const angle = (index * 45 - 90) * Math.PI / 180;
    const x = (50 + Math.cos(angle) * 41).toFixed(3);
    const y = (50 + Math.sin(angle) * 41).toFixed(3);
    return `<button class="clock-stop" type="button" data-clock-step="${index}" style="left:${x}%;top:${y}%" aria-label="${pad(index)}. ${stage.title}" aria-pressed="${index === 0}">${pad(index)}</button>`;
  }).join('');
  return `<div class="clock-scroll"><div class="clock-sticky"><div class="clock-dial" style="--hand-angle:-90deg"><div class="clock-rim"></div><div class="clock-face"></div><div class="clock-hand"></div><div class="clock-pivot"></div>${stops}<div class="clock-core"><img src="assets/clover.svg" width="34" height="34" alt=""></div></div><article class="clock-reading" aria-live="polite"><span class="reading-index" data-clock-index>01 <i>/ 08</i></span><h3 data-clock-title>${stages[0].title}</h3><p data-clock-body>${stages[0].body}</p><div class="reading-meter" aria-hidden="true">${stages.map((_, i) => `<i data-clock-meter="${i}"></i>`).join('')}</div></article></div></div>`;
};

const thread = () => `<div class="thread-progress" aria-hidden="true"><i></i></div><ol class="thread-list">${stages.map((stage, index) => `<li class="thread-item"><span class="thread-node" aria-hidden="true">${pad(index)}</span><details class="thread-card"><summary><span>${stage.title}</span><i aria-hidden="true"></i></summary><p>${stage.body}</p></details></li>`).join('')}</ol>`;

const map = () => `<div class="map-shell"><div class="map-board"><svg class="map-route" viewBox="0 0 1000 460" preserveAspectRatio="none" aria-hidden="true"><path class="map-route-base" d="M125 100 H875 Q955 100 955 190 V270 Q955 360 875 360 H125"/><path class="map-route-fill" d="M125 100 H875 Q955 100 955 190 V270 Q955 360 875 360 H125"/></svg><ol class="map-grid">${stages.map((stage, index) => `<li class="map-stop" style="--column:${index < 4 ? index + 1 : 8 - index};--row:${index < 4 ? 1 : 2}"><button type="button" data-map-step="${index}" aria-pressed="${index === 0}"><span class="map-dot" aria-hidden="true"></span><span class="map-number">${pad(index)}</span><strong>${stage.title}</strong><span class="map-arrow" aria-hidden="true">↗</span></button></li>`).join('')}</ol></div><article class="map-reading" aria-live="polite"><span data-map-index>01 / 08</span><h3 data-map-title>${stages[0].title}</h3><p data-map-body>${stages[0].body}</p></article></div>`;

const dossier = () => `<div class="dossier-stack">${stages.map((stage, index) => `<details class="dossier-sheet" style="--sheet:${index}"><summary><span class="sheet-number">${pad(index)}</span><strong>${stage.title}</strong><span class="sheet-plus" aria-hidden="true"></span></summary><div class="sheet-copy"><p>${stage.body}</p><img src="assets/clover.svg" width="30" height="30" alt=""></div></details>`).join('')}</div>`;

const film = () => `<div class="film-shell"><div class="film-control"><span data-film-count>01 / 08</span><div><button type="button" data-film-prev aria-label="Предыдущий этап">←</button><button type="button" data-film-next aria-label="Следующий этап">→</button></div></div><div class="film-viewport" tabindex="0" aria-label="Восемь этапов работы. Листайте по горизонтали"><div class="film-track">${stages.map((stage, index) => `<article class="film-frame"><div class="film-frame-top"><span>${pad(index)} / 08</span><img src="assets/clover.svg" width="22" height="22" alt=""></div><div><span class="film-giant" aria-hidden="true">${pad(index)}</span><h3>${stage.title}</h3><p>${stage.body}</p></div><div class="film-frame-bottom" aria-hidden="true"><i></i><span>→</span></div></article>`).join('')}</div></div><div class="film-progress" aria-hidden="true"><i></i></div></div>`;

document.querySelector('#showcase').innerHTML = [
  section(1, 'variant-clock', clock()),
  section(2, 'variant-thread', thread()),
  section(3, 'variant-map', map()),
  section(4, 'variant-dossier', dossier()),
  section(5, 'variant-film', film()),
].join('');

const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = value => Math.max(0, Math.min(1, value));

const clockRoot = document.querySelector('.variant-clock');
const clockScroll = clockRoot.querySelector('.clock-scroll');
const dial = clockRoot.querySelector('.clock-dial');
let clockActive = -1;
function showClock(index) {
  if (clockActive === index) return;
  clockActive = index;
  dial.style.setProperty('--hand-angle', `${index * 45 - 90}deg`);
  clockRoot.querySelector('[data-clock-index]').innerHTML = `${pad(index)} <i>/ 08</i>`;
  clockRoot.querySelector('[data-clock-title]').textContent = stages[index].title;
  clockRoot.querySelector('[data-clock-body]').textContent = stages[index].body;
  clockRoot.querySelectorAll('[data-clock-step]').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  clockRoot.querySelectorAll('[data-clock-meter]').forEach((meter, i) => meter.classList.toggle('filled', i <= index));
  if (!prefersReducedMotion.matches) clockRoot.querySelector('.clock-reading').animate([{ opacity: .65, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' });
}
let scrollTick = 0;
function updateScrollVisuals() {
  scrollTick = 0;
  const clockRect = clockScroll.getBoundingClientRect();
  const travel = Math.max(1, clockRect.height - innerHeight);
  const clockProgress = clamp(-clockRect.top / travel);
  showClock(Math.min(7, Math.floor(clockProgress * 8)));
  const threadRoot = document.querySelector('.variant-thread');
  const threadRect = threadRoot.getBoundingClientRect();
  const threadProgress = clamp((innerHeight * .72 - threadRect.top) / Math.max(1, threadRect.height - innerHeight * .28));
  threadRoot.style.setProperty('--thread-progress', `${threadProgress * 100}%`);
  const mapRoot = document.querySelector('.variant-map');
  const mapRect = mapRoot.getBoundingClientRect();
  const mapProgress = clamp((innerHeight * .75 - mapRect.top) / Math.max(1, mapRect.height));
  const route = mapRoot.querySelector('.map-route-fill');
  const length = route.getTotalLength();
  route.style.strokeDasharray = String(length);
  route.style.strokeDashoffset = String(length * (1 - mapProgress));
}
function scheduleScroll() { if (!scrollTick) scrollTick = requestAnimationFrame(updateScrollVisuals); }
addEventListener('scroll', scheduleScroll, { passive: true });
addEventListener('resize', scheduleScroll);
updateScrollVisuals();
clockRoot.querySelectorAll('[data-clock-step]').forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.clockStep);
  showClock(index);
  const top = clockScroll.getBoundingClientRect().top + scrollY;
  const travel = Math.max(1, clockScroll.offsetHeight - innerHeight);
  scrollTo({ top: top + travel * (index + .35) / 8, behavior: prefersReducedMotion.matches ? 'instant' : 'smooth' });
}));

const mapRoot = document.querySelector('.variant-map');
mapRoot.querySelectorAll('[data-map-step]').forEach(button => button.addEventListener('click', () => {
  const index = Number(button.dataset.mapStep);
  mapRoot.querySelectorAll('[data-map-step]').forEach((item, i) => item.setAttribute('aria-pressed', String(i === index)));
  mapRoot.querySelector('[data-map-index]').textContent = `${pad(index)} / 08`;
  mapRoot.querySelector('[data-map-title]').textContent = stages[index].title;
  mapRoot.querySelector('[data-map-body]').textContent = stages[index].body;
  mapRoot.querySelector('.map-reading').animate([{ opacity: .55, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: prefersReducedMotion.matches ? 1 : 360, easing: 'ease-out' });
}));

document.querySelectorAll('.dossier-sheet').forEach(sheet => sheet.addEventListener('toggle', () => {
  if (sheet.open) document.querySelectorAll('.dossier-sheet').forEach(other => { if (other !== sheet) other.open = false; });
}));

const filmRoot = document.querySelector('.variant-film');
const filmViewport = filmRoot.querySelector('.film-viewport');
const filmFrames = [...filmRoot.querySelectorAll('.film-frame')];
let filmActive = 0;
function updateFilm() {
  const viewportCenter = filmViewport.scrollLeft + filmViewport.clientWidth / 2;
  let closest = 0;
  let distance = Infinity;
  filmFrames.forEach((frame, index) => {
    const next = Math.abs(frame.offsetLeft + frame.offsetWidth / 2 - viewportCenter);
    if (next < distance) { distance = next; closest = index; }
  });
  filmActive = closest;
  filmRoot.querySelector('[data-film-count]').textContent = `${pad(closest)} / 08`;
  filmRoot.querySelector('.film-progress i').style.width = `${(closest + 1) / 8 * 100}%`;
  filmRoot.querySelector('[data-film-prev]').disabled = closest === 0;
  filmRoot.querySelector('[data-film-next]').disabled = closest === 7;
}
filmViewport.addEventListener('scroll', updateFilm, { passive: true });
filmRoot.querySelector('[data-film-prev]').addEventListener('click', () => filmFrames[Math.max(0, filmActive - 1)].scrollIntoView({ block: 'nearest', inline: 'center', behavior: prefersReducedMotion.matches ? 'instant' : 'smooth' }));
filmRoot.querySelector('[data-film-next]').addEventListener('click', () => filmFrames[Math.min(7, filmActive + 1)].scrollIntoView({ block: 'nearest', inline: 'center', behavior: prefersReducedMotion.matches ? 'instant' : 'smooth' }));
updateFilm();
