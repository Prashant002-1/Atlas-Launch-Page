# Atlas product film

## Intent

This silent film turns the public argument into one visible sequence. A finished
answer hides the work that produced it. Atlas moves control to the beginning,
keeps the student&rsquo;s reasoning in the course, and returns the connected record
to the teacher after submission.

The film uses real Atlas interface fragments, captured in light mode and framed
as product evidence. It never shows browser chrome, a demo identity, or a full
application screenshot.

## Format

- Canvas: 1920 by 1080, 16:9
- Duration: 23.5 seconds
- Sound: silent for muted website autoplay
- Motion: one deterministic GSAP timeline
- Website treatment: autoplay once, then hold on the final frame

## Visual system

The frame behaves like a teaching instrument laid over a course map. Contour
lines provide quiet continuity. Fine rules, state labels, and cropped product
surfaces carry the argument. Depth comes from overlap and scale, with one dark
closing field reserved for the thesis.

### Palette

- Paper: `#f1f4ee`
- Paper lift: `#f7f9f4`
- Paper sink: `#e5ebe2`
- Ink: `#0a1f19`
- Ink soft: `#2f4a41`
- Muted ink: `#5f7168`
- Pine: `#14543d`

### Typography

- Display and body: Geist Sans
- State labels: Geist Mono
- Sentence case throughout
- One claim and one supporting sentence per scene

## Narrative

### 1. The missing part, 0 to 4.7 seconds

`A finished answer hides the work.` A rubric decision appears first. A narrow
pine seam crosses the product surface and uncovers the transcript behind it.

### 2. Before the work, 4.7 to 9.3 seconds

`Set the terms first.` The course-agent controls show the teacher defining how
the agent teaches, what it may use, and where it must stop.

### 3. Inside the assignment, 9.3 to 14.56 seconds

`The agent asks. The student decides.` The student&rsquo;s reasoning session remains
the dominant surface while a measured boundary connects question to revision.

### 4. After submission, 14 to 19.3 seconds

`Open the evidence.` Transcript evidence appears first. The teacher&rsquo;s rubric
decision then opens over it, preserving the relationship between record and
judgment.

### 5. Closing thesis, 19.3 to 23.5 seconds

`Stop policing the output. Set the terms for the work.` The final frame names
the three adoption scopes: AI Assignments, Bring Your Course, and Full LMS.

## Motion rules

- Primary scene change: decisive horizontal push, 0.52 to 0.6 seconds
- Product reveal: a moving seam with a fixed-size surface opening behind it
- Evidence transition: top-down product overlap, not a camera move
- One diagonal split appears between student work and teacher review
- No idle loops, simulated cameras, random values, or asynchronous timing

## Accessibility and fidelity

- Nearby page copy carries the complete argument, so the film is supplementary
- Reduced-motion visitors receive the poster instead of autoplay
- HyperFrames contrast checks cover all film text
- Product imagery comes from current Atlas surfaces and preserves real labels
