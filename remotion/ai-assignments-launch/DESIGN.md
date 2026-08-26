# AI Assignments — launch film (Remotion)

Replaces `hyperframes/ai-assignments-film`. 1920×1080 · 30fps · 110s · single-take VO (Puck) + composed score. Scene windows overlap 0.6s: every cut is a content crossfade, never empty paper.

## The five decisions

| Decision | Choice |
|---|---|
| Register | A quiet instrument demonstrating itself — the film ends where the site begins: on paper. |
| Canvas | Course Paper `#f1f4ee`, radial lift, ≤3% grain, drifting 15° halftone lattice, two slow ink pools that re-compose for every scene. Dark ink appears once, as a narrative cut. |
| Accent budget | One signal color: **clay** `#bf5f3b` — the selected assignment type, the config pulse, indicator bars, lit class dots, the underlined pivot phrase, the sketch fan, the close rule. Ink carries all structure. Pine and mint are retired from the film (the green lives only in the paper/ink neutrals). |
| Type | Geist 470 display (−0.035em), Geist Mono labels, no italic emphasis; the one emphasized phrase gets an animated ink underline. |
| Motion | Everything settles like paper: masked line reveals, `cubic-bezier(0.16,1,0.3,1)`, 0.4–0.9s entrances, no bounce, no zoom entrances. One continuous background world instead of scene-by-scene voids. |

## The argument (beats, v5)

1. **0–4.6 · The fact** — "Every student is already using AI." beside a painted field current (128 brush strokes, baked p5.brush).
2. **4.6–11.6 · The problem, plainly** — "You're grading the AI's work. Not the student's."
3. **11.6–17.4 · The pivot** — "You can't keep AI out. You can decide how it comes in." Hand-inked underline (perfect-freehand).
4. **17.4–24.6 · The reveal** — AI Assignments in the composer beside Essay / Problem set / Quiz (the one floating window).
5. **24.6–45.4 · The dictation** — the teacher's words type straight onto the paper, no chrome; the agent takes the instructions and builds the rubric from them; then the line gets its own stage. "Your rubric. Your agent. No two alike."
6. **45.4–52 · Ship** — the rubric fans to 26 anonymous seats. "Your agent builds the agent your students meet. And works with each one." Personal for each student · every conversation recorded.
7. **52–67.6 · The student's side** — midterm-stakes opener, claim, and the agent draws the picture in-chat.
8. **67.6–73.6 · Friction** — "Cheating a conversation is harder than having one." Ghost of the field painting behind.
9. **73.6–85.8 · Draft grade** — evidence against the teacher's rubric, a drafted 91, adjust or publish.
10. **85.8–96.2 · The dark cut** — thesis, then the order: "Stop detecting AI. Start assigning it." Timpani + risers.
11. **95.8–110 · Close** — mark, wordmark, AI Assignments, request access. Stillness.

## Sound (v5)

- VO: ONE Puck take (pro), sliced into 12 stems at paragraph silences, tempo 1.05.
- Score: `scripts/make_bed2.py`. Felt piano (long decay, soft hammers), seven-voice string ensemble with sub-octave doubling, rounded pulse ostinato that grows with the typing, noise risers into both peaks, two timpani under the closing order, long stereo Schroeder hall. D center; minor shading for problem and dark cut; the major third arrives at the resolve. Mixed under VO with gentle sidechain (`scripts/mix2.sh`).

## Guardrails honored

- No statistics, no citations, no detector aesthetics.
- Product UI only as floating macOS-style windows — never full-screen, never screenshots.
- No student names, no fake grades, no invented dashboards; stand-in content is abstract (shimmer bars, unlabeled indicator bars).
- No generated video. One generated still (the engraved plate), art-directed to the brand's course-map motif and used once.

## Build

Binary assets are tracked as reproducible sources (fonts live inside `src/fontdata.ts`;
the grain plate is procedural; the engraved plate + VO stems are base64 text in
`assets-src/`). Renders are not tracked, per repo policy.

```sh
bash scripts/restore-assets.sh   # grain, plate, VO stems, score, final mix
npm install
npx remotion still src/index.ts Film out/f0900.png --frame=900   # QA stills
node bake/bake.mjs               # bake the brush plates (p5.brush, headless)
npm run render                    # 3300 frames; use --timeout=600000
```

Rendering note: on small containers use `--concurrency=1` (a second worker page froze
under software GL here) and expect ~2min per 450 frames.
