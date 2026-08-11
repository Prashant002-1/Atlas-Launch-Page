---
name: Atlas Launch Site
description: A precise, living product narrative for teacher-controlled agentic learning.
colors:
  paper: "#f1f4ee"
  paper-lift: "#f7f9f4"
  paper-sink: "#e5ebe2"
  ink: "#0a1f19"
  ink-soft: "#2f4a41"
  muted: "#5f7168"
  pine: "#14543d"
  mint: "#72d49a"
  wash: "#e6eee6"
  clay: "#bf5f3b"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(2.9rem, 6vw + 0.4rem, 6rem)"
    fontWeight: 470
    lineHeight: 0.96
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.9rem, 3vw + 0.8rem, 3.6rem)"
    fontWeight: 470
    lineHeight: 1.06
    letterSpacing: "-0.032em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.66
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.72rem"
    fontWeight: 450
    lineHeight: 1.45
    letterSpacing: "0.06em"
rounded:
  sharp: "0px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-lift}"
    rounded: "{rounded.sharp}"
    padding: "14px 24px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sharp}"
    padding: "12px 13px"
---

# Design System: Atlas Launch Site

## 1. Overview

**Creative North Star: "The Living Course Map"**

Atlas is one precise visual identity expressed through different page grammars. The homepage is a direct argument with a cinematic product proof. How it works is a scroll-led product stage. Work with us is built around an overlapping test-classroom pass and a concrete launch path. Access is a compact request form with optional context kept out of the main path. Geist, warm paper, deep ink, real product imagery, and instrument-like precision hold these worlds together.

The living dot field belongs only to the homepage hero. Other pages may borrow the idea of orientation and bearings, but must do so with different composition and interaction systems. The site rejects generic SaaS templates, repeated editorial ruled grids, cyber imagery, fake UI, and decoration without meaning.

**Key Characteristics:**

- Warm, light, and materially flat.
- Large but controlled typography with readable supporting copy.
- Real Atlas product surfaces as the primary imagery.
- Asymmetric composition and purposeful empty space.
- One narrative interaction per page, with static and reduced-motion fallbacks.

## 2. Colors

The palette feels like paper, ink, and a restrained teaching instrument rather than a software dashboard.

### Primary

- **Atlas Ink** (`#0a1f19`): Primary type, decisive controls, and the darkest narrative beats.
- **Pine Bearing** (`#14543d`): Focus, active states, and course-map orientation.

### Secondary

- **Mint Signal** (`#72d49a`): Sparse selection and interaction feedback.
- **Clay Annotation** (`#bf5f3b`): Rare warm counterpoint for authored marks and active details, never body text.

### Neutral

- **Course Paper** (`#f1f4ee`): Default canvas.
- **Lifted Paper** (`#f7f9f4`): Quiet product framing and form surfaces.
- **Sink Paper** (`#e5ebe2`): Deliberate tonal separation.
- **Soft Ink** (`#2f4a41`): Supporting text.
- **Muted Ink** (`#5f7168`): Captions and secondary labels.

### Named Rules

**The Paper Rule.** Light mode is the public brand default. Dark sections are rare narrative cuts, not a recurring section treatment.

**The Signal Rule.** Mint and clay remain sparse. Their rarity makes them legible.

## 3. Typography

**Display Font:** Geist (with system-ui fallback)
**Body Font:** Geist (with system-ui fallback)
**Label/Mono Font:** Geist Mono

**Character:** A single rational family keeps the site exact. Scale, weight, spacing, and placement create hierarchy without decorative font switching.

### Hierarchy

- **Display** (470, `clamp(2.9rem, 6vw + 0.4rem, 6rem)`, 0.96): One dominant claim per opening view.
- **Headline** (470, `clamp(1.9rem, 3vw + 0.8rem, 3.6rem)`, 1.06): Section and product-stage claims.
- **Title** (510, `1.15rem` to `1.6rem`, 1.15): Controls, workshop stages, and summaries.
- **Body** (400, `1rem`, 1.66): Explanatory copy, generally kept within 65 characters per line.
- **Label** (450, `0.72rem`, `0.06em`): Operational metadata only, never the default introduction to every section.

### Named Rules

**The Six-Rem Rule.** Display type never exceeds 6rem and letter spacing is never tighter than `-0.04em`.

**The Label Rule.** Monospaced uppercase labels name real state or orientation. They do not decorate every heading.

## 4. Elevation

Atlas is flat by default. Depth comes from tonal paper changes, overlap, crop, scale, and motion. Product images may use either a fine border or a restrained ambient shadow, never both together. Floating overlays such as the Atlas definition card can use a compact structural shadow because their elevation communicates temporary state.

### Shadow Vocabulary

- **Temporary Overlay** (`0 18px 42px rgba(10, 31, 25, 0.12)`): Menus and definition overlays only.
- **Product Float** (`0 28px 64px rgba(10, 31, 25, 0.10)`): A single isolated product surface when overlap is part of the composition.

### Named Rules

**The Flat-By-Default Rule.** Surfaces do not become floating cards merely because they contain content.

## 5. Components

### Buttons

- **Shape:** Sharp (`0px`) and instrument-like.
- **Primary:** Atlas Ink on Lifted Paper text with `14px 24px` padding.
- **Hover / Focus:** Pine hover and a visible two-pixel Pine outline with offset.
- **Secondary / Ghost:** Transparent with an underline or one-pixel rule, never a pill.

### Cards / Containers

- **Corner Style:** Sharp (`0px`).
- **Background:** Paper tones chosen for structural meaning.
- **Shadow Strategy:** Flat unless temporary or deliberately overlapping.
- **Border:** One-pixel ink rules when a boundary communicates state.
- **Internal Padding:** 24px to 48px at desktop scale.

### Inputs / Fields

- **Style:** Paper background, one-pixel Ink rule, sharp corners, large hit areas.
- **Focus:** Two-pixel Pine outline and one-pixel offset.
- **Error / Disabled:** Explicit text state and changed control state, never color alone.

### Navigation

The global navigation is quiet and consistent. Each route has one active underline. Mobile navigation becomes a compact paper menu. Page-level navigation may take a distinct form that matches the page job, such as map stations, workshop disclosures, scope selectors, or application steps.

### Living Field

The homepage hero field is the only ambient generative surface. It behaves like diluted ink through a halftone lens, parts under the cursor, and respects reduced motion. It is never copied as a decorative background elsewhere.

### Product Frames

Real light-mode Atlas screenshots are cropped only when the product action remains legible. Interactive product stages use semantic buttons or tabs and always retain an accessible static reading order.

## 6. Do's and Don'ts

### Do:

- **Do** give each page its own spatial and interaction model while preserving Geist, Course Paper, Atlas Ink, and sharp geometry.
- **Do** use real Atlas product surfaces as evidence.
- **Do** preserve generous empty space and intentional asymmetry.
- **Do** keep every control keyboard operable and every motion treatment compatible with reduced motion.
- **Do** use product language that names the record, action, constraint, or consequence.

### Don't:

- **Don't** use generic SaaS card grids and repeated left-copy, right-screenshot sections.
- **Don't** recycle the same eyebrow, rule, column, or numbered-step grammar across every page.
- **Don't** use cyber imagery, purple gradients, glassmorphism, fake dashboards, or other AI-generated visual shorthand.
- **Don't** repeat decorative blobs or particles outside the living-field hero.
- **Don't** use detector, surveillance, or policing aesthetics.
- **Don't** invent product interfaces or claims that are not present in Atlas.
- **Don't** put dense technical architecture, implementation, or unfinished compliance claims on the public site.
- **Don't** use a hobby-project tone, excessive whimsy, or motion without narrative purpose.
