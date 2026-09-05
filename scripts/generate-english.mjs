// Regenerate the committed English page after editing the bilingual source.
import { readFileSync, writeFileSync } from 'node:fs';
const source = new URL('../posts/2026-09-04-anyone-can-hack-anyone.html', import.meta.url);
let html = readFileSync(source, 'utf8');
const title = html.match(/data-document-title-en="([^"]+)"/)[1];
const description = html.match(/data-description-en="([^"]+)"/)[1];
html = html.replace('<html lang="it">', '<html lang="en">')
  .replace('data-page-language="it"', 'data-page-language="en"')
  .replace(/<title>[^<]+<\/title>/, '<title>' + title + '</title>')
  .replace(/(<meta name="description" content=")[^"]+/, '$1' + description)
  .replace(/(<meta property="og:title" content=")[^"]+/, '$1' + title.replace(' — silicio.land', ''))
  .replace(/(<meta property="og:description" content=")[^"]+/, '$1' + description)
  .replace(/(<meta property="og:url" content="[^"]+)\.html"/, '$1.en.html"')
  .replace(/(<link rel="canonical" href="[^"]+)\.html"/, '$1.en.html"')
  .replace('content="it_IT"', 'content="en_US"')
  .replace(/(<[^>]+data-title-language="it"[^>]*)(>)/g, '$1 hidden$2')
  .replace(/(<[^>]+data-title-language="en"[^>]*?) hidden/g, '$1')
  .replace(/(<article[^>]+data-language="it"[^>]*)(>)/g, '$1 hidden$2')
  .replace(/(<article[^>]+data-language="en"[^>]*?) hidden/g, '$1')
  .replace(/(<[^>]+data-it="[^"]*" data-en="([^"]*)"[^>]*>)[^<]*(<\/[^>]+>)/g, '$1$2$3')
  .replace(/aria-label="[^"]*" data-aria-it="[^"]*" data-aria-en="([^"]*)"/g,
    (match, english) => match.replace(/aria-label="[^"]*"/, 'aria-label="' + english + '"'))
  .replace('data-lang="it" aria-pressed="true"', 'data-lang="it" aria-pressed="false"')
  .replace('data-lang="en" aria-pressed="false"', 'data-lang="en" aria-pressed="true"');
writeFileSync(new URL('../posts/2026-09-04-anyone-can-hack-anyone.en.html', import.meta.url), html);

