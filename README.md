# Atlas Launch Page

The public product site for Atlas. It remains a sibling of the authenticated
Atlas-LMS application so the launch site can deploy independently through
Vercel.

## Site structure

- `/` keeps the existing living-field hero intact, then introduces the product
  story, the real product film, the Atlas agent model, and routes into the rest
  of the site.
- `/how-it-works/` follows the teacher and student journey from course-agent
  configuration to assessed work, teacher review, and class patterns.
- `/work-with-us/` explains the first-course onboarding and launch process.
- `/pricing/` explains the current course, institution, and individual access
  paths without inventing fixed pricing before the launch model is stable.
- `/access/` contains the real launch-access and demo-request form.
- `/api/launch-access` validates form submissions and delivers them through
  Resend from a Vercel Function.

The static site contains no authenticated application source.

## Design system

The homepage hero is the existing Atlas living field and instrument edge. The
expanded product narrative begins after the hero. Shared identity comes from
warm paper, deep ink, Geist type, sharp controls, and real light-mode Atlas
product surfaces. Each route uses a different system for its job: the homepage
is a cinematic argument, How it works is a navigable course map, Work with us
is a launch workshop, Pricing is a scope instrument, and Access is a structured
application.

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

The form includes identity, role, institution or individual context, first
course and learner scope, areas of interest, use case, current approach,
timeline, and consent. Institution is required for organizational requests and
optional for individuals.

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
