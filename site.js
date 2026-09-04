(() => {
  const buttons = document.querySelectorAll('[data-lang]');
  const translatedText = document.querySelectorAll('[data-it][data-en]');
  const translatedAria = document.querySelectorAll('[data-aria-it][data-aria-en]');
  const languageBlocks = document.querySelectorAll('[data-language]');
  const titleBlocks = document.querySelectorAll('[data-title-language]');
  const description = document.querySelector('meta[name="description"]');
  const socialTitle = document.querySelector('meta[property="og:title"]');
  const socialDescription = document.querySelector('meta[property="og:description"]');
  const terms = document.querySelectorAll('.term[data-definition]');
  const giscusSection = document.querySelector('[data-giscus]');
  let currentLanguage = 'it';
  let activeTerm = null;
  let activeTermNote = null;
  let termNoteId = 0;

  function storedLanguage() {
    try {
      return localStorage.getItem('language');
    } catch {
      return null;
    }
  }

  function rememberLanguage(language) {
    try {
      localStorage.setItem('language', language);
    } catch {
      // Language still works for current page when storage is unavailable.
    }
  }

  function closeTermNote() {
    if (!activeTerm) return;
    activeTerm.setAttribute('aria-expanded', 'false');
    activeTerm.removeAttribute('aria-controls');
    activeTermNote?.remove();
    activeTerm = null;
    activeTermNote = null;
  }

  function toggleTermNote(term) {
    if (activeTerm === term) {
      closeTermNote();
      return;
    }

    closeTermNote();
    const anchor = term.closest('p, figcaption');
    if (!anchor) return;

    const note = document.createElement('div');
    note.className = 'term-note';
    note.id = `term-note-${++termNoteId}`;
    note.setAttribute('role', 'note');
    note.textContent = term.dataset.definition;
    anchor.insertAdjacentElement('afterend', note);

    term.setAttribute('aria-expanded', 'true');
    term.setAttribute('aria-controls', note.id);
    activeTerm = term;
    activeTermNote = note;
  }

  function syncGiscusLanguage() {
    const frame = document.querySelector('iframe.giscus-frame');
    if (!frame) return;
    frame.contentWindow.postMessage({
      giscus: { setConfig: { lang: currentLanguage } },
    }, 'https://giscus.app');
  }

  function loadGiscus() {
    if (!giscusSection) return;
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.repo = giscusSection.dataset.repo;
    script.dataset.repoId = giscusSection.dataset.repoId;
    script.dataset.category = giscusSection.dataset.category;
    script.dataset.categoryId = giscusSection.dataset.categoryId;
    script.dataset.mapping = 'number';
    script.dataset.term = giscusSection.dataset.discussionNumber;
    script.dataset.strict = '1';
    script.dataset.reactionsEnabled = '1';
    script.dataset.emitMetadata = '0';
    script.dataset.inputPosition = 'top';
    script.dataset.theme = 'transparent_dark';
    script.dataset.lang = currentLanguage;
    script.dataset.loading = 'lazy';
    giscusSection.append(script);
  }

  function setLanguage(language, updateUrl) {
    const selected = language === 'en' ? 'en' : 'it';
    const key = selected === 'en' ? 'en' : 'it';
    const ariaKey = selected === 'en' ? 'ariaEn' : 'ariaIt';
    const titleKey = selected === 'en' ? 'documentTitleEn' : 'documentTitleIt';
    const descriptionKey = selected === 'en' ? 'descriptionEn' : 'descriptionIt';

    closeTermNote();
    currentLanguage = selected;
    document.documentElement.lang = selected;
    translatedText.forEach((element) => { element.textContent = element.dataset[key]; });
    translatedAria.forEach((element) => { element.setAttribute('aria-label', element.dataset[ariaKey]); });
    languageBlocks.forEach((element) => { element.hidden = element.dataset.language !== selected; });
    titleBlocks.forEach((element) => { element.hidden = element.dataset.titleLanguage !== selected; });
    buttons.forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.lang === selected)); });

    const pageTitle = document.body.dataset[titleKey];
    const pageDescription = document.body.dataset[descriptionKey];
    if (pageTitle) document.title = pageTitle;
    if (pageDescription && description) description.content = pageDescription;
    if (pageTitle && socialTitle) socialTitle.content = pageTitle.replace(' — silicio.land', '');
    if (pageDescription && socialDescription) socialDescription.content = pageDescription;
    syncGiscusLanguage();

    rememberLanguage(selected);

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (selected === 'en') url.searchParams.set('lang', 'en');
      else url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    }
  }

  buttons.forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang, true)));
  terms.forEach((term) => {
    term.setAttribute('aria-expanded', 'false');
    term.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleTermNote(term);
    });
  });
  document.addEventListener('click', closeTermNote);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeTermNote();
  });

  const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
  setLanguage(requestedLanguage || storedLanguage(), false);
  loadGiscus();
})();
