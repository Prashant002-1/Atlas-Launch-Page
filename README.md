# Atlas Launch Page

The public product site for Atlas, an AI-native learning management system.

## Product order

1. AI Assignments
2. Evidence-backed assessment
3. Full-course coursework and Atlas LMS

## Routes

- `/` presents the complete product story.
- `/products/` introduces AI Assignments, Atlas Course, and Atlas LMS.
- `/products/ai-assignments/` shows the assignment workflow and the V7 product film.
- `/products/course/` shows the full-term coursework layer.
- `/products/lms/` shows the complete learning system.
- `/assessment/` explains evidence-linked teacher review.
- `/integrations/` separates planned connection points from current product truth.
- `/about/`, `/pricing/`, `/security/`, `/notes/`, and `/contact/` cover the company.
- `/privacy/` and `/terms/` cover the public site and access form.
- `/access/` collects a private pilot request.

## Visual system

The homepage uses a quiet centered hero framed by two bounded particle fields. It does not use an orbit, node graph, system map, or full-screen interaction diagram.

The product story uses a small number of decisive visuals:

- the V7 AI Assignments film;
- a physical editorial artwork about revision and evidence;
- a raw teacher instruction becoming assignment structure;
- an evidence review surface;
- the Atlas LMS dashboard.

Labels are reserved for real navigation, form fields, criteria, and product state. Explanatory micro-labels are not part of the visual language.

## Local preview

```sh
npm run dev
```

Open `http://localhost:4173`.

For the function route, use `npx vercel dev` with:

```sh
RESEND_API_KEY=
ATLAS_ACCESS_RECIPIENT=
ATLAS_ACCESS_FROM=
```

## Verification

```sh
npm run verify
```

This runs the access-form tests, HTML validation, CSS validation, and a local reference audit for every public asset and route.

Pull requests and pushes to `main` run the same gate in GitHub Actions. Production remains a separate release action so a merge is never mistaken for a verified deployment.

## Release operations

The production project is `atlas-lms-coming-soon`, serving `atlas-lms.com`. Preview, production, verification, and rollback steps are documented in [docs/RELEASING.md](docs/RELEASING.md).

The access form requires these Vercel environment variables in Preview and Production:

- `RESEND_API_KEY`
- `ATLAS_ACCESS_RECIPIENT`
- `ATLAS_ACCESS_FROM`

Variable names belong in documentation. Values never belong in Git.
