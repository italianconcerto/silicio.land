# silicio.land

Personal static blog. Plain HTML and CSS, deployed through DigitalOcean App Platform.

## English article previews

After editing the bilingual article, run `node scripts/generate-english.mjs` and commit
the generated `.en.html` page. This serves English metadata without JavaScript for
social previews. Share its URL instead of `?lang=en`.

## Newsletter

Buttondown hosts the newsletter at https://buttondown.com/silicio. Subscription
forms appear on the home page, About page, and article pages. Emails are in English.
The free plan does not include RSS-to-email automation.

When publishing a new article, deploy and verify its English URL first, then create
and send a Buttondown email with the article title, a short excerpt, and that URL.
Send one announcement per new article, not for edits to existing posts. Do not
announce old articles when setting up or redeploying the site.

## Local preview

```sh
python3 -m http.server 8000
```
