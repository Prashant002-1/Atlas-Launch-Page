# Atlas product film

## Intent

This film appears after the living-field hero. Its job is to make the central
problem and the product response visible in less than half a minute: a finished
answer no longer proves who learned, so Atlas keeps the teacher's terms, the
student's work, and the teacher's review together.

The film uses only real Atlas product captures. Titles frame what is already on
screen. They never rename product concepts, invent controls, or describe the
implementation.

## Format

- Canvas: 1920 by 1080, 16:9
- Duration: 28 seconds
- Sound: silent by design for muted website autoplay
- Motion: deterministic GSAP timeline only
- Website use: muted autoplay without player controls, with a static poster and
  reduced-motion fallback

## Visual system

The product interface is the image. Warm paper, measured rules, and one dark
green annotation card give the captures a clear editorial frame without turning
them into a slide deck. Transitions use a narrow vertical ink line that reveals
the next state. There are no camera zooms, device mockups, floating browser
chrome, or decorative replicas of the product.

### Palette

- Paper: `#f1f4ee`
- Paper lift: `#f7f9f4`
- Paper sink: `#e5ebe2`
- Ink: `#0a1f19`
- Ink soft: `#2f4a41`
- Muted ink: `#5f7168`
- Pine: `#14543d`
- Rules: ink at 16 to 32 percent opacity

### Typography

- Display and body: Geist Sans
- Labels: Geist Mono
- Sentence case throughout
- Short display lines only, with supporting copy limited to one sentence

### Product windows

- Preserve each capture at its native 16:9 proportion
- Use one-pixel ink rules and restrained paper shadows
- Crop only to fit the frame; never recolor, relabel, or reconstruct the UI
- Keep all names and product states consistent with the clean Mei Chen demo

## Narrative and timeline

### 1. Finished answer, 0 to 5.75 seconds

`A finished answer is not enough.` The final-work surface appears, then a narrow
ink-line wipe reveals the transcript that produced it. A small note names what
is otherwise missing: the questions, choices, and revisions.

### 2. Teacher sets the terms, 5.75 to 11.95 seconds

`Set how the agent teaches.` The real course-agent surface enters behind a
restrained annotation card. The supporting line names the choices a teacher can
set without turning them into implementation language.

### 3. Student does the work, 11.95 to 17.95 seconds

`The student does the work.` The real assessed session fills the frame. The
agent questions and challenges without choosing the student's answer.

### 4. Teacher sees the learning, 17.95 to 24.8 seconds

`See how the answer was made.` The same frame moves from transcript to final
work to rubric. A small label changes with the visible surface.

### 5. End frame, 24.8 to 28 seconds

`Stop guessing. See the learning.` Atlas remains present in the upper-left
lockup. There is no exit animation.

## Transition rules

- Primary transition: right-to-left clip-path reveal, 0.75 to 0.9 seconds
- Internal evidence transition: vertical ink-line wipe, 0.85 to 1.35 seconds
- Motion uses `power1`, `power2`, and `power3` easing according to visual weight
- Screenshots never zoom, pan, tilt, or simulate a presentation camera
- Every scene enters through a reveal; the transition itself replaces the prior
  scene

## Accessibility and fidelity

- Adjacent page copy carries the same argument, so the film is supplementary
- Reduced-motion visitors receive the poster without autoplay
- All film text clears WCAG AA contrast checks
- All product captures come from the current local Atlas product in light mode
