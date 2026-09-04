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
  const commentsSection = document.querySelector('[data-comments]');
  const commentsList = document.querySelector('[data-comments-list]');
  let currentLanguage = 'it';
  let activeTerm = null;
  let activeTermNote = null;
  let termNoteId = 0;
  let discussionComments = null;

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

  function commentsStatus(type) {
    const copy = {
      loading: { it: 'Caricamento commenti…', en: 'Loading comments…' },
      empty: { it: 'Ancora nessun commento.', en: 'No comments yet.' },
      error: { it: 'Commenti non disponibili. Puoi comunque aprire GitHub Discussions.', en: 'Comments unavailable. You can still open GitHub Discussions.' },
    };
    return copy[type][currentLanguage];
  }

  function renderComments() {
    if (!commentsList) return;
    commentsList.replaceChildren();

    if (discussionComments === null || discussionComments === false || discussionComments.length === 0) {
      const status = document.createElement('p');
      status.className = 'comments-status';
      status.textContent = commentsStatus(discussionComments === null ? 'loading' : discussionComments === false ? 'error' : 'empty');
      commentsList.append(status);
      return;
    }

    const dateFormatter = new Intl.DateTimeFormat(currentLanguage === 'en' ? 'en-GB' : 'it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    discussionComments.forEach((comment) => {
      const item = document.createElement('article');
      item.className = 'comment';

      const meta = document.createElement('div');
      meta.className = 'comment-meta mono';

      if (comment.user?.avatar_url) {
        const avatar = document.createElement('img');
        avatar.className = 'comment-avatar';
        avatar.src = comment.user.avatar_url;
        avatar.alt = '';
        avatar.width = 24;
        avatar.height = 24;
        avatar.loading = 'lazy';
        meta.append(avatar);
      }

      const author = document.createElement('a');
      author.className = 'comment-author';
      author.href = comment.user?.html_url || comment.html_url;
      author.target = '_blank';
      author.rel = 'noopener';
      author.textContent = comment.user?.login || 'ghost';
      meta.append(author);

      const date = document.createElement('a');
      date.className = 'comment-date';
      date.href = comment.html_url;
      date.target = '_blank';
      date.rel = 'noopener';
      date.textContent = dateFormatter.format(new Date(comment.created_at));
      meta.append(date);

      const body = document.createElement('p');
      body.className = 'comment-body';
      body.textContent = comment.body;

      item.append(meta, body);
      commentsList.append(item);
    });
  }

  async function loadComments() {
    if (!commentsSection) return;
    const repo = commentsSection.dataset.repo.split('/').map(encodeURIComponent).join('/');
    const discussionNumber = encodeURIComponent(commentsSection.dataset.discussionNumber);

    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/discussions/${discussionNumber}/comments?per_page=100`, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      discussionComments = await response.json();
    } catch {
      discussionComments = false;
    }
    renderComments();
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
    renderComments();

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
  loadComments();
})();
