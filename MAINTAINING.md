# Refresh the public changelog

The website build exports its English product notes to `https://vangrd.bot/changelog.json`.
This repository converts that feed into `CHANGELOG.md` and the recent maintenance section in `README.md`.
Edit the canonical product notes in the application project. Do not edit generated text here.

## Refresh locally

Use Node.js 24 or later. The importer needs no packages or access to application source.

1. Download the public feed, or obtain a reviewed export with the same format.

   ```sh
   curl --fail --silent --show-error --location \
     --proto '=https' --proto-redir '=https' \
     https://vangrd.bot/changelog.json --output /tmp/vangrd-changelog.json
   ```

2. Generate the documentation.

   ```sh
   node scripts/refresh-changelog.mjs /tmp/vangrd-changelog.json
   ```

3. Check the output against that export.

   ```sh
   node scripts/refresh-changelog.mjs --check /tmp/vangrd-changelog.json
   node --test scripts/refresh-changelog.test.mjs
   git diff --check
   ```

4. Review the changed files before committing them.

The importer writes only changed content. Running it twice with the same export leaves the files unchanged.
The importer rejects invalid dates, empty fields, duplicate entries, and entries outside newest-first order.
Distinct entries can share a timestamp. It refuses a feed that removes existing dated history.
The check command exits with a failure if either generated file is stale.

## Feed format

The producer exports a JSON array of objects with exactly three string fields.

```json
[
  {
    "date": "2026-10-08T23:13",
    "title": "An authored product update",
    "body": "The authored Markdown description."
  }
]
```

The example describes the format, not an actual update.
Dates use `YYYY-MM-DDTHH:MM` without an inferred timezone.
They identify authored product notes, not deployment timestamps.
Release notes and screenshots do not provide uptime or timing measurements.
Entries preserve the canonical order, titles, and Markdown bodies.
The renderer makes links that start with `/` absolute against `https://vangrd.bot`.
The feed contains the complete history, including entries older than the website's initial page.
It contains no application code, credentials, customer records, internal identifiers, or logs.

English is the canonical history. This repository does not create separate translations.
Any future localized feed must reuse the application's existing translations and state its English fallback policy.

## Automatic refresh

[The refresh workflow](.github/workflows/refresh-changelog.yml) checks the public feed daily and supports manual dispatch.
It tests the importer, downloads the feed, generates both files, and checks the result.
It commits only when `README.md` or `CHANGELOG.md` changes.
A missing, invalid, or incomplete feed fails the job before publication.
The workflow runs only on the default branch and needs repository contents write permission.
Protected branches can block its commit. In that case, use the local refresh procedure and the repository's review process.

Deploy and verify the public feed before enabling the workflow on the default branch.
GitHub schedules can be delayed. The snapshot records the newest entry date, not a promise of instant synchronization.
The workflow does not refresh the product overview or older guide snapshots.
Review those against the canonical [website guides](https://vangrd.bot/guides) when product behavior changes.
