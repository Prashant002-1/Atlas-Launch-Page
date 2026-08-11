# Atlas Launch Page

The public product site for Atlas. It remains a sibling of the authenticated
Atlas-LMS application so the launch site can deploy independently through
Vercel.

## Site structure

- `/` keeps the existing living-field hero intact, states the problem directly,
  shows the real product film, and explains the student, course, and teacher
  agents without repeating the full product journey.
- `/how-it-works/` is a scroll-led assignment journey from teacher-authored
  terms through student work, teacher review, and grading.
- `/work-with-us/` explains the actual path from a short request to a fictional
  test classroom, fit review, integration planning, and a first real course.
- `/access/` contains the launch-access and demo-request form.
- `/pricing/` is a legacy redirect to `/access/`. Atlas is evaluating its first
  customers and will publish standard pricing later.
- `/api/launch-access` validates form submissions and delivers them through
  Resend from a Vercel Function.

The static site contains no authenticated application source.

## Design system

The homepage hero is the existing Atlas living field and instrument edge. The
expanded product narrative begins after the hero. Shared identity comes from
warm paper, deep ink, Geist type, sharp controls, and real Atlas product
surfaces. Each route uses a different system for its job: the homepage is a
direct argument with a cinematic product proof, How it works is a scroll-led
product stage, Work with us centers a fictional test-classroom pass, and Access
is a compact request form.

`PRODUCT.md` records the brand strategy and anti-references. `DESIGN.md` records
the visual tokens and route-specific composition rules. In particular, the
living field is exclusive to the homepage hero and generic SaaS card grids are
not part of the Atlas system.

The product film is authored in HyperFrames at
`hyperframes/atlas-product-film/`. Its source captures come from the local
Atlas-LMS demo state. The film does not reconstruct or relabel the UI. The web
asset is a compressed 1440 by 810 H.264 render with a static poster for reduced
motion.

HyperFrames source is kept in Git for reproducibility. Full-quality renders and
film QA frames are ignored, and the entire authoring directory is excluded from
Vercel deployments.

## Launch-access form

Copy `.env.example` into your local environment or configure these values in
Vercel:

```sh
RESEND_API_KEY=
ATLAS_ACCESS_RECIPIENT=
ATLAS_ACCESS_FROM=
```

`ATLAS_ACCESS_FROM` must use a sender authorized by the Resend account. The
function returns a clear temporary-unavailable response if the delivery
provider is not configured. It does not silently accept and lose a lead.

The form asks for identity, role, institution or individual context, area of
interest, and consent. Institution is required for organizational requests and
optional for individuals. Use case and current approach stay inside an optional
context disclosure so a visitor can send the short request without completing
an intake questionnaire.

## Local preview

For visual work on the static pages:

```sh
python3 -m http.server 4173
```

For the complete form and Vercel Function path:

```sh
npx vercel dev
```

## Verification

```sh
npm run verify
npx vercel build --yes
```

The HyperFrames film has its own gate:

```sh
cd hyperframes/atlas-product-film
npm run check
npm run render
```

## Production

This directory is linked to the Vercel project `atlas-lms-coming-soon`. The
private GitHub repository is connected to Vercel. Merges to `main` deploy to
production, while other branches receive preview deployments.

Do not deploy the launch-access form until the three delivery environment
variables are configured in the target Vercel environment.

Lenis is vendored under its MIT license in `vendor/LENIS-LICENSE`.
