// Master timeline v4 — 30fps, 3300 frames (110s). Hard cuts, no air between beats.
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DUR = 3300;

const s = (sec: number) => Math.round(sec * FPS);

export const SC = {
  s1: { from: s(0), to: s(4.6) },
  s2: { from: s(4.6), to: s(11.6) },
  s3: { from: s(11.6), to: s(17.4) },
  s4: { from: s(17.4), to: s(24.6) },
  s5: { from: s(24.6), to: s(45.4) }, // dictation → rubric, no chrome
  s6: { from: s(45.4), to: s(52.0) },
  s7: { from: s(52.0), to: s(67.6) },
  s8: { from: s(67.6), to: s(73.6) },
  s9: { from: s(73.6), to: s(85.8) },
  s10: { from: s(85.8), to: s(96.2) },
  s11: { from: s(95.8), to: s(110.0) },
} as const;

export const VO_AT = {
  v1: s(0.6),
  v2: s(5.2),
  v3: s(12.2),
  v4: s(18.0),
  v5: s(25.2),
  v6: s(32.4),
  v7: s(41.0),
  v8: s(52.9),
  v9: s(68.2),
  v10: s(74.2),
  v11: s(86.4),
  v12: s(91.0),
} as const;

export const RAMBLE =
  "Be curious, a little playful. Dissect the topic with them. When someone gets stuck, explain it with analogies the way 3Blue1Brown would, and if it helps, sketch a quick animation so they can see it. Give hints, never the answer. Let them build the intuition first, then lead them the rest of the way. Ask what they are citing, I care that the course readings show up. Push them to apply it to something real, then test their thesis. One more thing. Half the class missed problem 7 on the midterm. If this student was one of them, tell them this connects, and teach it properly this time.";

export const T5 = {
  typeStart: s(25.6),
  typeEnd: s(39.6),
  rows: [s(27.8), s(30.2), s(32.2), s(34.0), s(35.8), s(37.6), s(39.4)],
  recede: s(40.2), //  dictation recedes, the line lands
  headline: s(40.6),
  exit: s(44.9),
} as const;

export const T6 = {
  fanout: s(45.8),
  dots: s(46.0),
  bigLine: s(47.2),
  cap1: s(48.2),
  cap2: s(50.0),
  exit: s(51.5),
} as const;

export const T7 = {
  win: s(52.3),
  a1: s(53.3),
  a2: s(55.4),
  stu: s(57.2),
  a3: s(59.0),
  sketch: s(59.6),
  chip: s(64.2),
  exit: s(67.0),
} as const;

export const T9 = {
  kicker: s(74.0),
  win: s(74.4),
  rows: [s(75.2), s(76.0), s(76.8)],
  mark: s(78.0),
  buttons: s(79.4),
  publish: s(81.4),
  headline: s(82.6),
  exit: s(85.3),
} as const;

export const sec = s;
