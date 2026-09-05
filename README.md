# silicio.land

Personal static blog. Plain HTML and CSS, deployed through DigitalOcean App Platform.

## English article previews

After editing the bilingual article, run `node scripts/generate-english.mjs` and commit
the generated `.en.html` page. This serves English metadata without JavaScript for
social previews. Share its URL instead of `?lang=en`.

## Newsletter

Brevo hosts the newsletter on its Free plan (300 email sends per day).
Subscription forms appear on the home page, About page, and article pages.
The form named "silicio.land newsletter" adds subscribers directly to the
"silicio.land" list with "No confirmation email" selected (single opt-in).
Emails are in English. Preserve the form's honeypot field when editing it.

When publishing a new article, deploy and verify its English URL first, then create
and send a Brevo campaign to the "silicio.land" list with the article title,
a short excerpt, and that URL. RSS-to-email automation is not configured.
Send one announcement per new article, not for edits to existing posts. Do not
announce old articles when setting up or redeploying the site.

## Local preview

```sh
python3 -m http.server 8000
```
