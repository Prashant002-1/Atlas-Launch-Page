# Atlas Launch Page

The temporary public launch page for Atlas. It is deliberately isolated from
the authenticated Atlas-LMS application.

## What lives here

- A dependency-free static site
- One public page with the launch hero, personal layer, and closing contact
- The fixed Atlas mark and vendored brand fonts
- An inline Atlas definition in the hero body. Hover, keyboard focus, or
  touch opens the same compact dictionary card without changing the logo
- The field (`field.js`): the hero is one quiet halftone surface (15°
  print screen); ink pools are a state of that surface — dots swell and
  take muted pigment where a pool lives. Pools are thrown, break under
  the pointer, re-form around their living centroid, defect unevenly to
  neighbors, mix pigment in OKLab, and ride a homing tide back to their
  thrown composition. The pools are course-knowledge regions: a quiet
  dashed route follows their live centroids, and topographic rings mark
  the largest regions so the field reads as a course map. Loudness dials
  live in the pass-B shader: pigment mute (0.62), ink peak alpha (0.48),
  resting grid alpha (0.27)
- The instrument edge: full-height ticks with the mark's needle riding the
  reader's position, opening into a glass tile of the mark on approach
- A locally vendored Lenis 1.3.25 scroll layer with reduced-motion support
- Privacy-friendly Vercel Web Analytics for page views and visitors
- Vercel routing and security headers
- Launch-ready metadata, sitemap, 404 handling, and accessible navigation
- No application source, APIs, environment variables, or secrets

## Design language

The page is one sheet composed left of an instrument edge. All content
hangs from a generous left margin; a full-height column of ticks is the
right border; the hero stands alone and immersive while the ruled
structure (left line, section rules, register crosses) carries the body.

Type is Geist — sans for everything, mono for micro-labels. Emphasis
comes from scale, weight, and placement, never from style changes.

Palette (brand plus documented field extensions):

| Token   | Value     | Use                                            |
| ------- | --------- | ---------------------------------------------- |
| paper   | `#f1f4ee` | the sheet                                      |
| ink     | `#0a1f19` | text, linework at full strength                |
| pine    | `#14543d` | deep brand green — the dominant ink pigment    |
| mint    | `#72d49a` | brand light accent — selection highlights      |
| wash    | `#e6eee6` | glass-green fill for quiet surfaces            |
| clay    | `#bf5f3b` | warm counterpoint — never for text             |

The ink field mixes pigments from a wider family (pine, sea, moss, clay,
deep ink) held close in value so every blend still reads as ink on this
paper. Reactive work is code; the strict CSP (`script-src 'self'`) stays
intact — no CDNs, no inline scripts.

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

The private GitHub repository is connected to Vercel. Pushes and merges to
`main` deploy to production, while other branches receive preview deployments.

Lenis is vendored under its MIT license in `vendor/LENIS-LICENSE`.
