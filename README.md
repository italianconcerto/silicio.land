# silicio.land

Personal static blog. Plain HTML and CSS, deployed through DigitalOcean App Platform.

## English article previews

After editing the bilingual article, run `node scripts/generate-english.mjs` and commit
the generated `.en.html` page. This serves English metadata without JavaScript for
social previews. Share its URL instead of `?lang=en`.

## Local preview

```sh
python3 -m http.server 8000
```
