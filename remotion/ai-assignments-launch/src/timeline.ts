// Master timeline v3 — 30fps, 3540 frames (118s). High energy, calm air.
// VO: ONE Puck take, sliced at paragraph silences, tempo 1.05.
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DUR = 3540;

const s = (sec: number) => Math.round(sec * FPS);

export const SC = {
  s1: { from: s(0), to: s(5.2) }, //     the fact (no flicks, no dead air)
  s2: { from: s(5.2), to: s(13.0) }, //  you're grading the AI's work
  s3: { from: s(13.0), to: s(19.6) }, // pivot (underline)
  s4: { from: s(19.6), to: s(27.6) }, // reveal
  s5: { from: s(27.6), to: s(51.0) }, // THE BUILD: prompt becomes rubric, live
  s6: { from: s(51.0), to: s(58.0) }, // ship to class
  s7: { from: s(58.0), to: s(74.0) }, // the student's side (+ sketch)
  s8: { from: s(74.0), to: s(80.8) }, // friction
  s9: { from: s(80.8), to: s(93.2) }, // draft grade
  s10: { from: s(93.2), to: s(103.6) }, // dark thesis + punch
  s11: { from: s(103.2), to: s(118.0) }, // close
} as const;

export const VO_AT = {
  v1: s(0.7),
  v2: s(5.9),
  v3: s(13.6),
  v4: s(20.2),
  v5: s(28.3),
  v6: s(35.6),
  v7: s(44.6),
  v8: s(58.8),
  v9: s(74.5),
  v10: s(81.4),
  v11: s(93.8),
  v12: s(98.4),
} as const;

export const RAMBLE =
  "Be curious, a little playful. Dissect the topic with them. When someone gets stuck, explain it with analogies the way 3Blue1Brown would, and if it helps, sketch a quick animation so they can see it. Give hints, never the answer. Let them build the intuition first, then lead them the rest of the way. Ask what they are citing, I care that the course readings show up. Push them to apply it to something real, then test their thesis. One more thing. Half the class missed problem 7 on the midterm. If this student was one of them, tell them this connects, and teach it properly this time.";

// the build: typing progress drives rubric rows; each row fires as its
// source phrase completes in the prompt
export const T5 = {
  winIn: s(27.9),
  cardIn: s(30.0), //   empty rubric shell arrives early, fills live
  typeStart: s(28.6),
  typeEnd: s(43.4),
  rows: [s(31.2), s(33.6), s(35.4), s(37.4), s(39.2), s(41.0), s(42.9)],
  send: s(43.8),
  pulse: s(44.2),
  headline: s(45.2),
  exit: s(50.6),
} as const;

export const T6 = {
  fanout: s(51.6),
  dots: s(51.8),
  bigLine: s(53.0),
  cap1: s(54.2),
  cap2: s(56.0),
  exit: s(57.4),
} as const;

export const T7 = {
  win: s(58.3),
  a1: s(59.2),
  a2: s(61.6),
  stu: s(63.6),
  a3: s(65.6),
  sketch: s(66.2),
  chip: s(70.6),
  exit: s(73.4),
} as const;

export const T9 = {
  kicker: s(81.2),
  win: s(81.6),
  rows: [s(82.4), s(83.4), s(84.4)],
  mark: s(86.0),
  buttons: s(87.6),
  publish: s(89.6),
  headline: s(90.4),
  exit: s(92.7),
} as const;

export const sec = s;
