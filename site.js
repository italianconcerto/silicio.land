(() => {
  const buttons = document.querySelectorAll('[data-lang]');
  const translatedText = document.querySelectorAll('[data-it][data-en]');
  const translatedAria = document.querySelectorAll('[data-aria-it][data-aria-en]');
  const languageBlocks = document.querySelectorAll('[data-language]');
  const titleBlocks = document.querySelectorAll('[data-title-language]');
  const description = document.querySelector('meta[name="description"]');
  const socialTitle = document.querySelector('meta[property="og:title"]');
  const socialDescription = document.querySelector('meta[property="og:description"]');

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

  function setLanguage(language, updateUrl) {
    const selected = language === 'en' ? 'en' : 'it';
    const key = selected === 'en' ? 'en' : 'it';
    const ariaKey = selected === 'en' ? 'ariaEn' : 'ariaIt';
    const titleKey = selected === 'en' ? 'documentTitleEn' : 'documentTitleIt';
    const descriptionKey = selected === 'en' ? 'descriptionEn' : 'descriptionIt';

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

    rememberLanguage(selected);

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (selected === 'en') url.searchParams.set('lang', 'en');
      else url.searchParams.delete('lang');
      history.replaceState(null, '', url);
    }
  }

  buttons.forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.lang, true)));

  const requestedLanguage = new URLSearchParams(window.location.search).get('lang');
  setLanguage(requestedLanguage || storedLanguage(), false);
})();
