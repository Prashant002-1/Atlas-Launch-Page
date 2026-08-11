# Atlas product film

## Intent

This film begins after the living-field hero. It does not replace the hero or borrow its blobs as a page-wide motif. Its job is to make the Atlas operating model legible through the real product: teachers set the terms, students work inside them, and the work becomes evidence that can improve the course.

The product UI is the visual authority. Every interface shown in the film is a light-mode capture from the current local Atlas product. Titles and annotations may frame a capture, but they must never invent controls, states, data, or product behavior.

## Format

- Canvas: 1920 by 1080, 16:9
- Duration: 41 seconds
- Sound: silent by design for muted website autoplay
- Energy: measured and editorial, with one faster evidence sequence near the end
- Motion: deterministic GSAP timeline only
- Website use: muted autoplay with controls and a static poster fallback

## Visual system

The film lives on the same warm light paper as the launch page, but takes a new post-hero shape: an editorial evidence table crossed with an instrument panel. Large fields of paper make room for precise product windows, registration marks, measured rules, and small monospaced labels. The effect should feel authored and scholarly, not like a generic SaaS montage.

### Palette

- Paper: `#f1f4ee`
- Paper lift: `#f7f9f4`
- Ink: `#0a1f19`
- Ink soft: `#2f4a41`
- Pine: `#14543d`
- Mint: `#72d49a`
- Wash: `#e6eee6`
- Clay: `#bf5f3b`
- Rules: ink at 10 to 24 percent opacity

### Typography

- Display and body: Geist Sans, using the launch page's local variable font
- Labels and evidence notes: Geist Mono
- Headline maximum: 112px, short lines only
- No full-frame paragraph blocks
- Use sentence case throughout

### Product windows

- Preserve the captures at their native 16:9 aspect ratio
- Place them in restrained paper frames with a one-pixel ink rule and subtle shadow
- Use cropping and camera movement to guide attention, never reconstructed UI
- Avoid rounded device mockups, gradient halos, fake browser chrome, and floating glass cards

## Narrative and timeline

### 1. The missing evidence, 0 to 5 seconds

Open on paper and one statement: `The answer stopped telling you how the student got there.` A real final-work capture enters beneath it. The frame establishes the problem without showing detector software or making a compliance claim.

Transition: vertical push into the teacher surface.

### 2. Set the terms, 4.6 to 12 seconds

Show the real natural-language configuration conversation, then move laterally to the resolved course-agent record. The visual relationship is prompt to record, not chat spectacle. Title: `Set the terms.` Supporting line: `Describe how the agent should teach, challenge, and respond.`

Transition: horizontal push from configuration to student work.

### 3. Work inside them, 11.6 to 22 seconds

Show the real assessed student session. Begin with the full split layout, then pan to the conversation where the student asks a question and Atlas replies within the course context. Continue to the real course-record note. Title: `The student does the work.` Supporting line: `Questions, hints, revisions, and the assignment stay in one governed session.`

Transition: calm focus pull from student work to the teacher's view of the same session.

### 4. See the learning, 21.6 to 31 seconds

Sequence three real teacher surfaces: transcript with highlighted evidence, final work with revisions, and rubric review. The pace increases slightly, but the UI remains readable. Title: `The journey becomes evidence.` Supporting line: `Review the reasoning, the revisions, and the result together.`

Transition: horizontal push into class results.

### 5. Improve the course, 30.6 to 38 seconds

Show the real class-results surface and the real student learning profile. Title: `Then improve what comes next.` Supporting line: `Patterns become practice for the class and direction for each student.`

Transition: color dip to paper.

### 6. End frame, 37.6 to 41 seconds

Atlas mark, the line `Set the terms. See the learning.`, and a small `atlas-lms.com` label. No exit animation.

## Transition rules

- Primary transition: clean horizontal or vertical push, 0.6 seconds, `power3.inOut`
- Topic-change transition: focus pull using modest blur, 0.8 seconds total
- Final transition: brief dip to paper
- Every scene receives an entrance
- No scene exits except through its transition, and no exit on the final frame

## Accessibility and fidelity

- The website must provide the same narrative in adjacent HTML, so the film is not the only way to understand Atlas
- Reduced-motion visitors receive the poster and no autoplay
- All film text must meet readable contrast on paper
- The captures must remain light mode and must not be colorized, relabeled, or altered
