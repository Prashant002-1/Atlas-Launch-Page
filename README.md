# Atlas Launch Page

The temporary public launch page for Atlas. It is deliberately isolated from
the authenticated Atlas-LMS application.

## What lives here

- A dependency-free static site
- One public page with the launch hero, personal layer, and closing contact
- The fixed Atlas mark and vendored brand fonts
- Optimized Atlas halftone artwork
- A locally vendored Lenis 1.3.25 scroll layer with reduced-motion support
- Privacy-friendly Vercel Web Analytics for page views and visitors
- Vercel routing and security headers
- Launch-ready metadata, sitemap, 404 handling, and accessible navigation
- No application source, APIs, environment variables, or secrets

## Local preview

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

The only public product route is `/`. Previous `/product` and `/about` links
redirect to the launch page.

The full multi-page draft is archived locally at
`../Atlas-Launch-Page-Archive-2026-07-28`.

## Production

This directory is linked locally to the Vercel project
`atlas-lms-coming-soon`. The intended custom domains are `atlas-lms.com` and
`www.atlas-lms.com`.

The project is backed by a private GitHub repository for source history and
future collaboration. It is not connected to Vercel's Git integration yet, so
production deploys remain explicit Vercel CLI deploys from this directory.

Lenis is vendored under its MIT license in `vendor/LENIS-LICENSE`.
