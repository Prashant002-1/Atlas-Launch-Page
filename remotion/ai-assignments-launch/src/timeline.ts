// Master timeline v2 — 30fps, 3900 frames (130s). Brisk pace baked in.
// VO stems are slices of ONE recorded take (single narrator), tempo 1.13.
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DUR = 3900;

const s = (sec: number) => Math.round(sec * FPS);

export const SC = {
  s1: { from: s(0), to: s(6.4) }, //     the plain fact
  s2: { from: s(6.4), to: s(14.4) }, //  answer vs thinking
  s3: { from: s(14.4), to: s(21.6) }, // pivot (underline)
  s4: { from: s(21.6), to: s(30.4) }, // reveal: a new assignment type
  s5: { from: s(30.4), to: s(47.4) }, // THE RAMBLE (the driver)
  s6: { from: s(47.4), to: s(64.8) }, // agent rubric + ship to class
  s7: { from: s(64.8), to: s(84.0) }, // the student's side (+ sketch)
  s8: { from: s(84.0), to: s(91.6) }, // friction line
  s9: { from: s(91.6), to: s(106.0) }, // draft grade
  s10: { from: s(106.0), to: s(116.5) }, // dark thesis + punch
  s11: { from: s(116.0), to: s(130.0) }, // close on paper
} as const;

export const VO_AT = {
  v1: s(0.9),
  v2: s(7.1),
  v3: s(15.1),
  v4: s(22.3),
  v5: s(31.0),
  v6: s(40.2),
  v7: s(48.6),
  v8: s(65.4),
  v9: s(84.6),
  v10: s(92.3),
  v11: s(106.8),
  v12: s(112.2),
} as const;

// the teacher's ramble — the example that drives the film
export const RAMBLE =
  "Be curious, a little playful. Dissect the topic with them. When someone gets stuck, explain it with analogies the way 3Blue1Brown would, and if it helps, sketch a quick animation so they can see it. Give hints, never the answer. Let them build the intuition first, then lead them the rest of the way. Ask what they are citing, I care that the course readings show up. Push them to apply it to something real, then test their thesis. One more thing. Half the class missed problem 7 on the midterm. If this student was one of them, tell them this connects, and teach it properly this time.";

export const T5 = {
  winIn: s(30.8),
  typeStart: s(33.0),
  typeEnd: s(46.2),
  send: s(46.8),
} as const;

export const T6 = {
  shrink: s(47.4), //   course window glides left, compact ack
  ack: s(48.2),
  link: s(48.2),
  card: s(48.6), //     AGENT RUBRIC compiles
  rows: [s(49.0), s(49.6), s(50.2), s(50.8), s(51.4), s(52.0), s(52.6)],
  headline: s(53.6), // your rubric, your agent, no two alike
  headlineOut: s(58.4),
  fanout: s(56.0),
  cap1: s(58.2), //     personal for each student
  cap2: s(61.4), //     every conversation recorded
  bigLine: s(59.0),
  exit: s(64.2),
} as const;

export const T7 = {
  win: s(64.6),
  a1: s(65.8),
  a2: s(69.2),
  stu: s(72.0),
  a3: s(74.6),
  sketch: s(75.4),
  chip: s(80.4),
  exit: s(83.4),
} as const;

export const T9 = {
  kicker: s(92.2),
  win: s(92.6),
  rows: [s(93.4), s(94.4), s(95.4)],
  mark: s(97.0),
  buttons: s(98.6),
  publish: s(100.8),
  headline: s(101.8),
  exit: s(105.4),
} as const;

export const sec = s;
