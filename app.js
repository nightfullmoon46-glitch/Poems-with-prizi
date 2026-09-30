const DATA = window.PRIZI_LITERATURE || { poems: [], stories: [] };
const app = document.querySelector('#app');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const birthdayKey = 'prizi-birthday-welcome-seen';
let birthdaySeen = false;
let birthdayStep = 0;
let quizIndex = 0;
const birthdayQuiz = [
  {
    question: 'I think you love me a lot, more than you can ever explain...',
    answers: ['YES', 'A', 'B', 'C']
  },
  {
    question: 'What would make your birthday feel most magical?',
    answers: ['A night full of stars', 'A page written just for you', 'A year of happy surprises', 'All of these']
  },
  {
    question: 'What should this new year bring you?',
    answers: ['Joy', 'Peace', 'Dreams coming true', 'All of the above']
  }
];

const mamdiParagraphs = [
  "My Mamdi used to be with me every single second.",
  "Wherever she went, she used to tell me. Whatever happened, she used to update me.",
  "She used to talk a lot - and honestly, I loved listening to her.",
  "I loved hearing about her days, her feelings, her problems, the little things that happened to her, and almost everything that existed inside her world.",
  "I miss my Mamdi. I miss her every single second.",
  "What I actually want is simple.",
  "I want **my Mamdi to always be my Mamdi**. Not someone else. Not a distant version of her.",
  "I want her to call me the way she used to. I want her to text me the way she used to.",
  "She used to call me as soon as she woke up in the morning. She would call while getting ready for the office or before going somewhere. Sometimes she would call even while taking a bath.",
  "And when she reached home from the office, she would call again.",
  "She used to call throughout the night.",
  "Even though we were in two different places, it never really felt like we were apart.",
  "She trusted me in a way that made me feel like I was her safest place.",
  "We were comfortable with everything. There was no need to think before speaking. No need to pretend. No need to be careful.",
  "I could just be myself.",
  "And then, somehow, almost overnight, everything changed.",
  "I don't know why.",
  "I don't know what happened.",
  "I just know that I still want my Mamdi.",
  "I want the girl who used to call me for no particular reason. The girl who could tell me everything. The girl who was comfortable enough to be completely herself with me.",
  "I don't want to think before talking to her.",
  "I don't want to measure every word.",
  "I just want to feel that safe place again.",
  "I don't want her to leave me alone in this darkness.",
  "I miss staring at her for hours, just like I used to - sometimes even through the whole night while she was asleep.",
  "I miss being close to her.",
  "I miss her voice.",
  "I miss her little updates.",
  "I miss knowing how her day went.",
  "I miss knowing what she was feeling.",
  "I miss **her**.",
  "And honestly, I don't know how to unlove her.",
  "Maybe I don't want to.",
  "So, if you're reading this...",
  "And if there is still a little bit of **my Mamdi** inside you, please call me like you used to.",
  "Talk to me like you used to.",
  "Be comfortable with me like you always were.",
  "And let me know everything about you again.",
  "Because somewhere inside me, I'm still waiting to know how my Mamdi is doing."
];

const formatLetterText = (value = '') => esc(value).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

function birthdayWasSeen() {
  try { return sessionStorage.getItem(birthdayKey) === 'yes'; }
  catch { return birthdaySeen; }
}

function leaveBirthday() {
  birthdaySeen = true;
  try { sessionStorage.setItem(birthdayKey, 'yes'); } catch {}
  document.body.classList.remove('birthday-mode');
  document.title = 'Poems with Prizi';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#fbf9ff');
  route();
}

function renderBirthday(moveFocus = false) {
  document.body.classList.add('birthday-mode');
  document.title = 'Happy birthday, Mam | Poems with Prizi';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#180a2b');
  const wishes = [
    'shine always', 'to my Moon', 'a year of wonder', 'you deserve every joy',
    'keep glowing', 'love, laughter, and light', 'dream beautifully', 'more moonlit nights',
    'gentle days ahead', 'so many reasons to smile', 'your brightest year yet', 'make a wish'
  ];
  let content = '';

  if (birthdayStep === 0) {
    content = `<p class="birthday-kicker">A LITTLE WISH FOR SOMEONE ONE OF A KIND</p>
      <h1 id="birthday-heading"><span class="birthday-highlight">Happiest birthday</span>, to the most beautiful person.</h1>
      <p class="birthday-subtitle">To my Moon: may your new year be as gentle, bright, and beautiful as you make the world around you.</p>
      <button class="birthday-primary" type="button" data-next>Open your birthday note <span aria-hidden="true">&rarr;</span></button>`;
  } else if (birthdayStep === 1) {
    content = `<p class="birthday-kicker">A NOTE FROM THE HEART</p>
      <h1 id="birthday-heading">I don't want to lose you this easily.</h1>
      <p class="birthday-subtitle">I don't want you to leave. I hope we keep making room for one another, if that's what we both want.</p>
      <p class="birthday-detail">Before the poems, I made you a tiny birthday quiz. No wrong answers and no pressure; just a little fun, with lots of wishes for you.</p>
      <button class="birthday-primary" type="button" data-next>Take the little quiz <span aria-hidden="true">&rarr;</span></button>`;
  } else if (birthdayStep === 2) {
    const quiz = birthdayQuiz[quizIndex];
    content = `<p class="birthday-kicker">A LITTLE BIRTHDAY QUIZ <span aria-hidden="true">&middot;</span> ${quizIndex + 1} OF ${birthdayQuiz.length}</p>
      <form class="birthday-quiz" id="birthdayQuizForm">
        <fieldset>
          <legend id="birthday-heading" tabindex="-1">${quiz.question}</legend>
          <div class="birthday-quiz-options">${quiz.answers.map((answer, index) => `<label class="birthday-option">
            <input type="radio" name="birthdayAnswer" value="${String.fromCharCode(65 + index)}" required>
            <span class="birthday-option-letter">${String.fromCharCode(65 + index)}</span>
            <span>${answer}</span>
          </label>`).join('')}</div>
        </fieldset>
        <button class="birthday-primary" type="submit">${quizIndex === birthdayQuiz.length - 1 ? 'Finish the quiz' : 'Next question'} <span aria-hidden="true">&rarr;</span></button>
      </form>`;
  } else {
    content = `<p class="birthday-kicker">ONE LAST WISH</p>
      <h1 id="birthday-heading">May this year be kind to you.</h1>
      <p class="birthday-subtitle">More laughter, softer days, and all the little things that make you feel loved. Happy birthday, Moon.</p>
      <button class="birthday-primary" type="button" data-enter>Enter Poems with Prizi <span aria-hidden="true">&rarr;</span></button>`;
  }

  app.innerHTML = `<section class="birthday-screen" aria-labelledby="birthday-heading">
    <div class="birthday-scene" aria-hidden="true"></div>
    <div class="birthday-stars" aria-hidden="true">${Array.from({ length: 22 }, (_, index) => `<i class="sky-star star-${index + 1}"></i>`).join('')}<i class="shooting-star shot-one"></i><i class="shooting-star shot-two"></i></div>
    <div class="birthday-wishes" aria-hidden="true">${wishes.map((wish, index) => `<span class="birthday-wish wish-${index + 1}">${wish}</span>`).join('')}</div>
    <div class="birthday-brand" aria-label="Poems with Prizi">
      <svg class="birthday-brand-mark" viewBox="0 0 52 52" aria-hidden="true">
        <path d="M26 46C22 42.4 5 30.4 5 18.2 5 10.7 10.1 5 17 5c3.9 0 7.1 1.9 9 5 1.9-3.1 5.1-5 9-5 6.9 0 12 5.7 12 13.2C47 30.4 30 42.4 26 46Z" fill="currentColor" />
        <text x="13.5" y="30.5" fill="#fff9ff" font-family="Georgia,serif" font-size="17">P</text>
        <text x="27" y="30.5" fill="#fff9ff" font-family="Georgia,serif" font-size="17">R</text>
      </svg>
      <span>Poems with Prizi</span>
    </div>
    <div class="birthday-content">${content}</div>
    <button class="birthday-skip" type="button" data-enter>Skip to Poems with Prizi <span aria-hidden="true">&rarr;</span></button>
  </section>`;

  app.querySelector('[data-next]')?.addEventListener('click', () => {
    birthdayStep += 1;
    renderBirthday(true);
  });
  app.querySelector('[data-enter]')?.addEventListener('click', leaveBirthday);
  app.querySelector('#birthdayQuizForm')?.addEventListener('submit', event => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    quizIndex += 1;
    if (quizIndex === birthdayQuiz.length) birthdayStep = 3;
    renderBirthday(true);
  });

  if (moveFocus) app.querySelector('#birthday-heading')?.focus({ preventScroll: true });
}

const esc = (value = '') => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}[char]));

function setActiveNavigation(category = '') {
  document.querySelectorAll('.topbar nav a').forEach(link => {
    const active = link.hash === `#/${category}`;
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function enterView() {
  if (!reducedMotion) requestAnimationFrame(() => app.classList.add('is-ready'));
  else app.classList.add('is-ready');
}

function home() {
  const poem = DATA.poems[0];
  const story = DATA.stories[0];
  const chapters = story.sections.filter(section => section.kind === 'Chapter').length;

  app.innerHTML = `<div class="home-page route-enter">
    <section class="home-intro">
      <div class="home-copy">
        <p class="eyebrow">A LITTLE ARCHIVE BY PRIZI</p>
        <h1>Poems with <em>Prizi</em></h1>
        <p class="lead">Words from the heart, gathered in one quiet place. Find a poem for the feeling you can’t quite name, or stay awhile with a story told one chapter at a time.</p>
        <div class="home-actions">
          <a class="primary-action" href="#/poems">Browse ${DATA.poems.length} poems</a>
          <a class="text-action" href="#/stories">Read the story <span aria-hidden="true">&rarr;</span></a>
        </div>
      </div>
      <figure class="home-cover">
        <img src="tik-tik-tik-cover.png" alt="The title page of Tik. Tik. Tik., Prizi’s story">
        <figcaption><span>${esc(story.title)}</span><span>${chapters} chapters</span></figcaption>
      </figure>
    </section>

    <section class="birthday-callout" aria-label="Birthday greeting">
      <p class="eyebrow">FOR SOMEONE ONE OF A KIND</p>
      <h2>Happiest birthday, to the <em>most beautiful person.</em></h2>
    </section>

    <section class="home-shelf" aria-labelledby="shelf-title">
      <div class="section-heading">
        <div><p class="eyebrow">FROM THE PAGE</p><h2 id="shelf-title">Read what feels close.</h2></div>
        <p>Original poems and the complete story, just as they were written.</p>
      </div>
      <div class="collection-grid">
        <a class="collection-card poem-collection" href="#/poems">
          <p class="eyebrow">${DATA.poems.length} POEMS</p>
          <h3>${esc(poem.title)}</h3>
          <p class="collection-excerpt">${esc(poem.excerpt)}</p>
          <span class="collection-action">Explore the poems <span aria-hidden="true">&rarr;</span></span>
        </a>
        <a class="collection-card story-collection" href="#/stories">
          <div>
            <p class="eyebrow">${chapters} CHAPTERS · COMPLETE STORY</p>
            <h3>${esc(story.title)}</h3>
            <p class="collection-excerpt">${esc(story.excerpt)}</p>
            <span class="collection-action">Open the story <span aria-hidden="true">&rarr;</span></span>
          </div>
          <img src="tik-tik-tik-cover.png" alt="">
        </a>
      </div>
    </section>

    <section class="mamdi-feature" aria-labelledby="mamdi-feature-title">
      <div>
        <p class="eyebrow">A NOTE I STILL CARRY</p>
        <h2 id="mamdi-feature-title">Dedicated to Mamdi.</h2>
      </div>
      <div class="mamdi-feature-copy">
        <p>Some words for the girl who once made distance feel like nothing at all.</p>
        <a class="text-action" href="#/mamdi">Read the dedication <span aria-hidden="true">&rarr;</span></a>
      </div>
    </section>
  </div>`;
  setActiveNavigation();
  enterView();
}

function mamdiReader() {
  app.innerHTML = `<section class="letter-wrap route-enter">
    <a class="reader-back" href="#/"><span aria-hidden="true">&larr;</span> Home</a>
    <article class="letter-reader">
      <p class="eyebrow">A LETTER FROM THE HEART</p>
      <h1>Dedicated to Mamdi</h1>
      <p class="letter-subtitle">How was my Mamdi?</p>
      <div class="letter-body">${mamdiParagraphs.map(paragraph => `<p>${formatLetterText(paragraph)}</p>`).join('')}</div>
      <p class="letter-signoff">Somewhere inside me, I'm still waiting to know how my Mamdi is doing.</p>
    </article>
  </section>`;
  setActiveNavigation('mamdi');
  enterView();
}

function category(categoryName) {
  const collection = DATA[categoryName];
  const story = categoryName === 'stories';
  const title = story ? 'Stories' : 'Poems';
  const description = story
    ? 'The complete Tik. Tik. Tik. manuscript, with all 31 chapters, the opening, and its closing letters.'
    : `${collection.length} poems from Prizi’s original collection, kept together in one place.`;

  app.innerHTML = `<section class="view route-enter">
    <div class="category-hero">
      <a class="crumb" href="#/">Home</a>
      <p class="eyebrow">THE ${title.toUpperCase()} ARCHIVE</p>
      <h1>${title}</h1>
      <p>${description}</p>
    </div>
    <div class="art-list">${collection.map((item, index) => artCard(categoryName, item, index)).join('')}</div>
  </section>`;
  setActiveNavigation(categoryName);
  enterView();
}

function artCard(categoryName, item, index) {
  const isStory = categoryName === 'stories';
  const metadata = isStory
    ? `${item.sections.filter(section => section.kind === 'Chapter').length} chapters · ${item.wordCount.toLocaleString()} words`
    : item.subtitle || item.mood;

  return `<a class="art-card${isStory ? ' story-card' : ''}" href="#/${categoryName}/${esc(item.id)}">
    <div class="art-card-copy">
      <p class="tag">${esc(metadata)}</p>
      <h2>${esc(item.title)}</h2>
      ${isStory ? `<p class="story-byline">${esc(item.subtitle)}</p>` : ''}
      <p class="excerpt">${esc(item.excerpt)}</p>
      <span class="open">${isStory ? 'Read the complete story' : 'Read poem'} <span aria-hidden="true">&rarr;</span></span>
    </div>
    ${isStory ? '<img src="tik-tik-tik-cover.png" alt="">' : `<span class="poem-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>`}
  </a>`;
}

function poemReader(poem) {
  app.innerHTML = `<section class="reader-wrap route-enter">
    <a class="reader-back" href="#/poems"><span aria-hidden="true">&larr;</span> All poems</a>
    <article class="reader poem-reader">
      <p class="eyebrow">POEM <span aria-hidden="true">·</span> ${esc(poem.mood)}</p>
      ${poem.subtitle ? `<p class="poem-context">${esc(poem.subtitle)}</p>` : ''}
      <h1>${esc(poem.title)}</h1>
      <div class="poem-body">${esc(poem.body)}</div>
      <div class="reader-mark" aria-hidden="true">P <span>♥</span> R</div>
    </article>
  </section>`;
  enterView();
}

function storyReader(story) {
  const chapterCount = story.sections.filter(section => section.kind === 'Chapter').length;
  let current = 0;

  app.innerHTML = `<section class="story-shell route-enter">
    <a class="reader-back" href="#/stories"><span aria-hidden="true">&larr;</span> All stories</a>
    <header class="story-head">
      <p class="eyebrow">${chapterCount} CHAPTERS · ${story.wordCount.toLocaleString()} WORDS</p>
      <h1>${esc(story.title)}</h1>
      <p>${esc(story.subtitle)}</p>
    </header>
    <div class="story-tools">
      <label for="storySectionSelect">Read section</label>
      <select id="storySectionSelect">${story.sections.map((section, index) => `<option value="${index}">${esc(section.title)}</option>`).join('')}</select>
      <span id="storyProgress" class="story-progress" aria-live="polite"></span>
      <progress id="storyProgressBar" max="${story.sections.length}" value="1" aria-label="Story progress"></progress>
    </div>
    <article class="story-page" id="storyPage" tabindex="-1"></article>
    <nav class="story-controls" aria-label="Story sections">
      <button id="storyPrev" type="button"><span aria-hidden="true">&larr;</span> Previous section</button>
      <button id="storyNext" type="button">Next section <span aria-hidden="true">&rarr;</span></button>
    </nav>
  </section>`;

  const picker = document.querySelector('#storySectionSelect');
  const page = document.querySelector('#storyPage');
  const progress = document.querySelector('#storyProgress');
  const progressBar = document.querySelector('#storyProgressBar');
  const previous = document.querySelector('#storyPrev');
  const next = document.querySelector('#storyNext');

  function showSection(index, scrollToPage = false) {
    current = Math.max(0, Math.min(index, story.sections.length - 1));
    const section = story.sections[current];
    picker.value = String(current);
    progress.textContent = `${current + 1} of ${story.sections.length}`;
    progressBar.value = current + 1;
    previous.disabled = current === 0;
    next.disabled = current === story.sections.length - 1;
    page.innerHTML = `<div class="story-section-enter">
      <p class="section-kind">${esc(section.kind)}</p>
      <h2>${esc(section.title)}</h2>
      ${section.subtitle ? `<p class="section-subtitle">${esc(section.subtitle)}</p>` : ''}
      <div class="story-copy">${esc(section.body)}</div>
    </div>`;
    if (scrollToPage) {
      const top = page.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
      page.focus({ preventScroll: true });
    }
  }

  picker.addEventListener('change', () => showSection(Number(picker.value), true));
  previous.addEventListener('click', () => showSection(current - 1, true));
  next.addEventListener('click', () => showSection(current + 1, true));
  showSection(0);
  setActiveNavigation('stories');
  enterView();
}

function route() {
  app.classList.remove('is-ready');
  if (!birthdayWasSeen()) {
    birthdayStep = 0;
    quizIndex = 0;
    renderBirthday();
    return;
  }
  document.body.classList.remove('birthday-mode');
  const parts = location.hash.replace(/^#\//, '').split('/').filter(Boolean);
  const categoryName = parts[0];
  window.scrollTo(0, 0);

  if (!categoryName) return home();
  if (categoryName === 'mamdi') return mamdiReader();
  if (!['poems', 'stories'].includes(categoryName)) return home();
  if (parts.length === 1) return category(categoryName);

  const item = DATA[categoryName].find(entry => entry.id === parts[1]);
  if (!item) return home();
  setActiveNavigation(categoryName);
  if (categoryName === 'stories') storyReader(item);
  else poemReader(item);
}

addEventListener('hashchange', route);
route();
