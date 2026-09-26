const pairs = [
  {
    before: 'Самостоятельно ищете врача и пытаетесь понять, кому можно доверять',
    after: 'Команда подбирает специалиста под конкретную задачу и отвечает за медицинскую маршрутизацию',
  },
  {
    before: 'Собираете анализы, заключения и историю по разным клиникам',
    after: 'Вся медицинская история семьи собрана в одном месте и сохраняется годами',
  },
  {
    before: 'Каждый раз заново объясняете врачу весь контекст',
    after: 'Ваш постоянный врач уже знает историю, динамику и предыдущие решения, и вводит в курс дела каждого нового специалиста',
  },
];

document.querySelector('#concepts').innerHTML = `
  <section class="comparison" aria-label="Сравнение сопровождения">
    <h1>Внедрить единую систему управления здоровьем</h1>
    <div class="composition">
      <aside class="intro">
        <img src="assets/clover.svg" width="36" height="36" alt="">
        <p>Одна команда держит всю картину здоровья семьи в поле зрения.</p>
        <div class="intro-foot" aria-hidden="true"><span>01</span><i></i><span>03</span></div>
      </aside>
      <ol class="stories">
        ${pairs.map((pair, index) => `
          <li class="story">
            <div class="story-head"><span class="number">${String(index + 1).padStart(2, '0')}</span><span>С ЕС Клиникой</span></div>
            <p class="answer">${pair.after}</p>
            <div class="context"><span class="context-label">Без ЕС Клиники</span><p>${pair.before}</p></div>
          </li>
        `).join('')}
      </ol>
    </div>
  </section>
`;
