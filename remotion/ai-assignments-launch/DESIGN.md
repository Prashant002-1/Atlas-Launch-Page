# AI Assignments — launch film (Remotion)

Replaces `hyperframes/ai-assignments-film`. 1920×1080 · 30fps · 118s · single-take VO (Puck) + composed score.

## The five decisions

| Decision | Choice |
|---|---|
| Register | A quiet instrument demonstrating itself — the film ends where the site begins: on paper. |
| Canvas | Course Paper `#f1f4ee`, radial lift, ≤3% grain, drifting 15° halftone lattice, two slow ink pools that re-compose for every scene. Dark ink appears once, as a narrative cut. |
| Accent budget | One signal color: **clay** `#bf5f3b` — the selected assignment type, the config pulse, indicator bars, lit class dots, the underlined pivot phrase, the sketch fan, the close rule. Ink carries all structure. Pine and mint are retired from the film (the green lives only in the paper/ink neutrals). |
| Type | Geist 470 display (−0.035em), Geist Mono labels, no italic emphasis; the one emphasized phrase gets an animated ink underline. |
| Motion | Everything settles like paper: masked line reveals, `cubic-bezier(0.16,1,0.3,1)`, 0.4–0.9s entrances, no bounce, no zoom entrances. One continuous background world instead of scene-by-scene voids. |

## The argument (beats, v3)

1. **0–6.4 · The fact** — "Every student is already using AI."
2. **6.4–14.4 · The problem** — the polished page, the thinking dissolving behind it.
3. **14.4–21.6 · The pivot** — "You can't keep AI out. You can decide how it comes in." (animated ink underline)
4. **21.6–30.4 · The reveal** — AI Assignments, in the composer beside Essay / Problem set / Quiz.
5. **30.4–47.4 · The ramble** (the driver) — the teacher just writes what they want, 3Blue1Brown analogies, sketched animations, hints never answers, cite the readings, test the thesis, problem 7 follow up. Accelerating type, auto-scroll, type-or-speak.
6. **47.4–64.8 · Agent rubric + ship** — the ramble distills into a seven-row rubric (no icons), "Your rubric. Your agent. No two alike.", then fans out: personal for each student, every conversation recorded.
7. **64.8–84 · The student's side** — opens with the problem-7 connection, asks for the claim, and draws the picture in-chat (axes, confident fit, clay fan where data thins).
8. **84–91.6 · Friction** — "Cheating a conversation is harder than having one."
9. **91.6–106 · Draft grade** — evidence quotes against the teacher's rubric, a draft mark, adjust or publish. "Evidence attached. Judgment yours."
10. **106–116.5 · The dark cut** — thesis, then the order: "Stop detecting AI. Start assigning it."
11. **116–130 · Close** — mark, wordmark, AI Assignments, request access. Stillness.

## Sound (v2)

- VO: ONE recorded take (Puck, pro), sliced into 12 stems at paragraph silences, tempo 1.05. One narrator by construction.
- Score: `scripts/make_bed2.py`. Contemporary classical in D: felt piano motif, string ensemble, pulse ostinato through the ramble, timpani under the closing order, stereo Schroeder hall. Minor shading for the problem and the dark cut; the major third arrives at the resolve. Mixed quiet under VO (`scripts/mix2.sh`).

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
npm run render                    # out/ai-assignments.mp4 (2400 frames)
```

Rendering note: on small containers use `--concurrency=1` (a second worker page froze
under software GL here) and expect ~2min per 450 frames.
