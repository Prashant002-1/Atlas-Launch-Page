# AI Assignments — launch film (Remotion)

Replaces `hyperframes/ai-assignments-film`. 1920×1080 · 30fps · 80s · VO + authored score.

## The five decisions

| Decision | Choice |
|---|---|
| Register | A quiet instrument demonstrating itself — the film ends where the site begins: on paper. |
| Canvas | Course Paper `#f1f4ee`, radial lift, ≤3% grain, drifting 15° halftone lattice, two slow ink pools that re-compose for every scene. Dark ink appears once, as a narrative cut. |
| Accent budget | One signal color: **clay** `#bf5f3b` — the selected assignment type, the config pulse, indicator bars, lit class dots, the signal rings, "how it comes in.", "Deliberately.", the close rule. Ink carries all structure. Pine and mint are retired from the film (the green lives only in the paper/ink neutrals). |
| Type | Geist 470 display (−0.035em), Geist Mono labels, Spectral italic twice ("how it comes in.", "Deliberately."). |
| Motion | Everything settles like paper: masked line reveals, `cubic-bezier(0.16,1,0.3,1)`, 0.4–0.9s entrances, no bounce, no zoom entrances. One continuous background world instead of scene-by-scene voids. |

## The argument (beats)

1. **0–8 · The fact** — "Every student is already using AI." Stated plainly, no stats, no tease.
2. **8–17 · The problem** — the polished page in front, the thinking dissolving behind it. "So grading became guessing."
3. **17–25 · The pivot** — "You can't keep AI out. You can decide *how it comes in.*"
4. **25–36 · The reveal** — AI Assignments: a new assignment type, in the composer, right beside Essay / Problem set / Quiz.
5. **36–52 · The architecture** (centerpiece) — one sentence to your course agent → it configures an assignment agent (terms visible) → ships one to every student. "Your agent builds the agent your students meet."
6. **52–63 · The student's side** — it guides, questions, pushes back; understanding flows back to the teacher as signal, not surveillance. No names, no grades, no dummy data.
7. **63–71.5 · The thesis** (the one dark cut) — an engraved course-map plate (clay contours on ink paper, generated still, archival drift + breathing signal rings) under "This was never about preventing AI. It's about teaching with it. *Deliberately.*" The contour motif completes an arc: route path (S3) → contour rings (S6) → the full plate here.
8. **71.5–80 · The close** — back on paper: mark, wordmark, "AI Assignments", assignments first · assessments next, request access. Ends on stillness.

## Sound

- VO: Gemini TTS pro (Charon), 8 stems, ~112 words, placed per-beat, trimmed + loudness-matched.
- Score: `scripts/make_bed.py` — synthesized bed in D. Open fifths the whole film; an F-natural shade enters only under the dark cut; the major third (F♯) arrives only at the resolve. Struck-sine motif marks scene boundaries. Sidechain-ducked under VO, mixed to −16 LUFS.

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
