# Atlas product-site QA

Date: 2026-09-02

## Direction now in the product

- The story starts with AI Assignments, moves to assessment, then expands to Atlas Course and Atlas LMS.
- The homepage hero is centered and quiet. Color is limited to two bounded particle bands rather than a full-page interaction map.
- There are no solar systems, orbit diagrams, connected balls, or node maps.
- Decorative labels that explained obvious interface objects were removed. Labels remain only where they carry real state, criteria, form meaning, or course data.
- The V7 AI Assignments film is the only product film in use.
- Products, About, Notes, LMS, and Access use distinct low-contrast editorial artwork. The homepage does not reuse it.
- Product links lead to real pages. Pricing, security, integrations, contact, company, notes, privacy, terms, access, and not-found routes are present.
- Pricing and security distinguish what is public now from what must be scoped before a student-data pilot.

## Visual review

- Homepage reviewed at 1280 by 900 and 390 by 844.
- AI Assignments, Atlas Course, Atlas LMS, Assessment, Integrations, About, Security, Pricing, Notes, Contact, and Access were reviewed at desktop width.
- Products, AI Assignments, Assessment, About, Access, and the homepage closing section were reviewed at 390 by 844.
- Homepage hero, V7 film, product ledger, teacher-language transformation, editorial image, assessment review, and LMS dashboard were reviewed in sequence.
- The LMS dashboard keeps the dark course navigation, white course work area, and green Atlas briefing rail visible together.
- Access was simplified after review: the mirrored pilot brief and its status labels were removed, leaving one editorial image and the necessary form.
- Contact was simplified after review: category labels and action hints were removed from already-clickable choices.
- No horizontal overflow was found in the reviewed routes at 858 pixels.
- The responsive CSS retains single-column product layouts, a compact navigation, and bounded horizontal dashboard treatment below the desktop breakpoints.

## Interaction review

- The compact navigation opens, changes its accessible name to Close, and dismisses with Escape.
- The Access product query selects the matching scope, including Atlas Course.
- Selecting Individual removes the institution requirement; organizational paths restore it.
- The V7 film uses explicit native playback, loads its poster, and is the only film referenced by the public site.
- The teacher brief can be replayed, while reduced-motion visitors receive the complete static result.
- The hero and closing WebGL fields pause when hidden; reduced-motion visitors receive a still frame.

## Verification

- The reference gate validates 505 local links and assets across 23 HTML/CSS files.
- Five API tests, HTML validation, CSS validation, JavaScript syntax checks, and `git diff --check` pass.
- `npm audit` reports no known dependency vulnerabilities.
- `npx vercel build --yes` completes a local preview build successfully.
- Production release evidence is recorded separately in the pull request and deployment inspection.
