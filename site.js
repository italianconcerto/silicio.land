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

  function setLanguage(language, updateUrl) {
    const selected = language === 'en' ? 'en' : 'it';
    const languagePage = document.body.dataset[selected === 'en' ? 'urlEn' : 'urlIt'];
    if (updateUrl && languagePage && new URL(languagePage, location.href).pathname !== location.pathname) {
      rememberLanguage(selected);
      const destination = new URL(languagePage, location.href);
      destination.search = location.search;
      destination.searchParams.delete('lang');
      destination.hash = location.hash;
      location.assign(destination.href);
      return;
    }
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
    document.querySelectorAll('[data-href-it][data-href-en]').forEach((element) => {
      element.href = element.dataset[selected === 'en' ? 'hrefEn' : 'hrefIt'];
    });
    buttons.forEach((button) => { button.setAttribute('aria-pressed', String(button.dataset.lang === selected)); });

    const pageTitle = document.body.dataset[titleKey];
    const pageDescription = document.body.dataset[descriptionKey];
    if (pageTitle) document.title = pageTitle;
    if (pageDescription && description) description.content = pageDescription;
    if (pageTitle && socialTitle) socialTitle.content = pageTitle.replace(' — silicio.land', '');
    if (pageDescription && socialDescription) socialDescription.content = pageDescription;
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
  const requestedPage = document.body.dataset[requestedLanguage === 'en' ? 'urlEn' : 'urlIt'];
  if (requestedLanguage && requestedPage) {
    const destination = new URL(requestedPage, location.href);
    destination.search = location.search;
    destination.searchParams.delete('lang');
    destination.hash = location.hash;
    location.replace(destination.href);
    return;
  }
  setLanguage(requestedLanguage || document.body.dataset.pageLanguage || storedLanguage(), false);

  document.querySelectorAll('.newsletter form').forEach((form) => {
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.append(status);
    let pending = false;
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (pending) return;
      pending = true;
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      form.setAttribute('aria-busy', 'true');
      status.textContent = currentLanguage === 'it' ? 'Iscrizione in corso…' : 'Subscribing…';
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        const result = await response.json();
        if (!response.ok || result.success !== true) throw new Error('Subscription failed');
        status.textContent = currentLanguage === 'it'
          ? 'Iscrizione completata. Riceverai i prossimi articoli via email.'
          : 'You are subscribed. New articles will arrive by email.';
        form.reset();
      } catch {
        status.textContent = currentLanguage === 'it'
          ? 'Non è stato possibile confermare l’iscrizione. Riprova tra poco.'
          : 'We could not confirm your subscription. Please try again shortly.';
      } finally {
        pending = false;
        button.disabled = false;
        form.removeAttribute('aria-busy');
      }
    });
  });

  const thread = document.getElementById('cusdis_thread');
  if (thread) {
    if (currentLanguage === 'it') {
      window.CUSDIS_LOCALE = {
        powered_by: 'Commenti gestiti da Cusdis',
        post_comment: 'Invia commento',
        loading: 'Caricamento',
        email: 'Email (facoltativa)',
        nickname: 'Nome',
        reply_placeholder: 'Scrivi una risposta…',
        reply_btn: 'Rispondi',
        sending: 'Invio…',
        mod_badge: 'MOD',
        content_is_required: 'Scrivi un commento',
        nickname_is_required: 'Inserisci un nome',
        comment_has_been_sent: 'Commento inviato. Verrà pubblicato dopo l’approvazione.',
      };
    }
    const commentsScript = document.createElement('script');
    commentsScript.src = 'https://cusdis.com/js/cusdis.es.js';
    commentsScript.async = true;
    commentsScript.addEventListener('load', () => {
      const frame = thread.querySelector('iframe');
      if (!frame) return;
      frame.title = currentLanguage === 'it' ? 'Commenti' : 'Comments';
      const fitComments = () => {
        const root = frame.contentDocument?.getElementById('root');
        if (!root) return;
        const resize = () => {
          frame.style.height = `${Math.max(400, Math.ceil(root.getBoundingClientRect().height) + 32)}px`;
        };
        new ResizeObserver(resize).observe(root);
        resize();
      };
      frame.addEventListener('load', fitComments, { once: true });
      if (frame.contentDocument?.readyState === 'complete') fitComments();
    });
    commentsScript.addEventListener('error', () => {
      thread.textContent = currentLanguage === 'it'
        ? 'Commenti non disponibili. Ricarica la pagina per riprovare.'
        : 'Comments unavailable. Reload the page to try again.';
    });
    document.head.append(commentsScript);
  }

  // Count production page loads after the initial language has been applied.
  if (['silicio.land', 'www.silicio.land'].includes(window.location.hostname)) {
    const measurementId = 'G-FGD581DVNF';
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      page_title: document.body.dataset.documentTitleEn || document.title,
    });
    const analyticsScript = document.createElement('script');
    analyticsScript.async = true;
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(analyticsScript);
  }
})();
