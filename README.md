# dynamic-form-nuxt

A Nuxt 3 app that renders a **dynamic, schema-driven form** from the boom.yugme.com
page-builder API — e.g.

```
https://api.boom.yugme.com/api/pages/blog/complete-guide-for-businesses-on-sending-otp-messages
```

Each page component returned by the API carries its own `definition.fields`
schema alongside its `data`. This app walks that schema recursively and
renders the right input for each field type (`text`, `textarea`, `richtext`,
`url`, `image`, `boolean`, `array`). Array fields behave like a **shopping
cart**: add a row, remove a row, reorder rows — each row is itself built
from the array's `children` field definitions, recursively.

## Structure

```
composables/usePageSchema.ts   # fetch + types + empty-row helpers
components/DynamicField.vue    # recursive field renderer (leaf + array/cart)
components/DynamicForm.vue     # renders one component's full field list
pages/index.vue                # slug input, fetch, render, export blog.json
```

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000, enter an endpoint (e.g. `blog`) and slug
(e.g. `complete-guide-for-businesses-on-sending-otp-messages`), then hit
**Fetch**.

## Configuration

The API base defaults to `https://api.boom.yugme.com/api/pages` and can be
overridden with an env var:

```bash
NUXT_PUBLIC_API_BASE=https://your-api.example.com/api/pages npm run dev
```

## Pushing this to a new repository

```bash
git init
git add .
git commit -m "Initial dynamic form (Nuxt) driven by blog.json schema"
git branch -M main
git remote add origin <your-new-repo-url>
git push -u origin main
```

## Notes / next steps

- `pages/index.vue` currently only *fetches* the page and lets you edit +
  export the resulting `blog.json`. Wire `downloadJson`/`toBlogJson()` up to
  a `POST`/`PUT` call once you have a save endpoint, and this becomes a full
  edit-and-publish flow.
- Field types are matched against what the current API returns
  (`text`, `textarea`, `richtext`, `url`, `image`, `boolean`, `array`). Add
  another `v-else-if` branch in `DynamicField.vue` if new types show up
  (e.g. `select`, `date`).
- The referenced `duckey-dec/dynamic-form` repo wasn't reachable while
  building this (private or not indexed) — if it has conventions you want
  mirrored (naming, file layout, styling), share its README/key files and
  this can be aligned to match.
