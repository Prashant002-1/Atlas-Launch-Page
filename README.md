# Atlas Launch Page

The public site for Atlas, an open exploration of what a learning management system looks like when AI is part of the course.

Live at [atlas-lms.com](https://atlas-lms.com).

The site walks through the idea in three layers:

1. **AI Assignments**: a teacher describes the work in ordinary language, a student works with a course-grounded agent, and the process returns as evidence.
2. **Assessment**: claims, revisions, sources, and the teacher's criteria stay connected, and the teacher makes the final judgment.
3. **Atlas Course and Atlas LMS**: the same context carried across a term, then across a whole learning record.

Fork it, borrow the concepts, or use it as a reference for a static product site with a small serverless form. Design decisions are written down in [DESIGN.md](DESIGN.md) and [PRODUCT.md](PRODUCT.md).

## Routes

- `/` presents the complete story, with the AI Assignments film and an illustrated instructor dashboard.
- `/products/` introduces AI Assignments, Atlas Course, and Atlas LMS.
- `/products/ai-assignments/`, `/products/course/`, and `/products/lms/` walk through each layer.
- `/assessment/` explains evidence-linked teacher review.
- `/integrations/` describes the connection points the design anticipates, none of which are live.
- `/about/`, `/security/`, and `/notes/` cover why the project exists, how the design treats data, and working notes.
- `/learn-more/` is a short survey for anyone curious about the project or how it was built.
- `/contact/` takes questions, feedback, privacy requests, and security concerns.
- `/privacy/` and `/terms/` cover the website and its forms.

Both forms post to `/api/inquiry`, a single Vercel function that validates the submission and forwards it by email. There is no database.

## Stack

Static HTML and CSS, a few small vanilla JavaScript modules, [Lenis](https://lenis.darkroom.engineering/) for smooth scrolling, and one serverless function. Fonts are Geist and Geist Mono, self-hosted. No build step.

`remotion/ai-assignments-launch/` holds the source of the AI Assignments film, built with [Remotion](https://www.remotion.dev/). Its binary assets are tracked as reproducible sources; see its own `DESIGN.md` for the build.

## Local preview

```sh
npm install
npm run dev
```

Open `http://localhost:4173`. The static site works without any configuration.

To exercise the form function locally, run `npx vercel dev` with the variables from `.env.example` set.

## Verification

```sh
npm run verify
```

This runs the API tests, HTML validation, CSS validation, and a local reference check for every public asset and route. Pull requests and pushes to `main` run the same gate in GitHub Actions.

## Deployment

The site deploys to Vercel as a static project with one function. Release steps are in [docs/RELEASING.md](docs/RELEASING.md).

The forms need three environment variables in the deployment:

- `RESEND_API_KEY` authorizes delivery through [Resend](https://resend.com).
- `ATLAS_ACCESS_RECIPIENT` is the private inbox that receives submissions.
- `ATLAS_ACCESS_FROM` is a sender address on a Resend-verified domain.

Variable names belong in documentation. Values never belong in Git. Until all three are configured, the forms return an unavailable response and keep the visitor's entries on the page.

Each submission is sent to the recipient inbox with the visitor's email as `Reply-To`. The recipient and sender are server-only and never returned to the browser. A provider acceptance produces the on-page confirmation; it is not proof of inbox delivery.

## License

Code is released under the [MIT License](LICENSE). The Atlas name and mark, the editorial artwork, and the film identify this project; please credit the source if you reuse them. Lenis is included under its own license in `vendor/`.
