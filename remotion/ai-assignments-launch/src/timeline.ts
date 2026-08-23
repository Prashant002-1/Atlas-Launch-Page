// Master timeline — 30fps, 2400 frames (80s).
// All beats in frames. Scene bounds chosen around measured VO stem lengths.
export const FPS = 30;
export const W = 1920;
export const H = 1080;
export const DUR = 2400;

const s = (sec: number) => Math.round(sec * FPS);

export const SC = {
  s1: { from: s(0), to: s(8) }, //   open — the plain fact
  s2: { from: s(8), to: s(17) }, //  problem — answer vs thinking
  s3: { from: s(17), to: s(25) }, // pivot — on your terms
  s45: { from: s(25), to: s(52) }, // reveal + architecture (continuous window world)
  s6: { from: s(52), to: s(63) }, // student + evidence
  s7: { from: s(63), to: s(71.5) }, // dark thesis cut
  s8: { from: s(71.5), to: s(80) }, // close on paper
} as const;

// inside s45
export const S45 = {
  reveal: s(25), //   kicker + name
  windowIn: s(28.2), // composer window enters (right)
  select: s(30.4), //  segmented control lands on AI Assignment
  coexistLine: s(32.3),
  handoff: s(35.6), //  window glides left, becomes course-agent chat
  typeStart: s(37.2),
  typeEnd: s(40.4),
  reply: s(41.2),
  capsule: s(42.2), //  assignment-agent capsule compiles (right)
  terms: [s(42.9), s(43.6), s(44.3), s(45.0)],
  fanout: s(46.8), //   capsule ships to the class row
  bigLine: s(48.0), //  "your agent builds the agent your students meet"
  exit: s(51.2),
} as const;

export const VO_AT = {
  vo1: s(1.2),
  vo2: s(8.8),
  vo3: s(17.8),
  vo4: s(25.8),
  vo5: s(37.0),
  vo6: s(52.8),
  vo7: s(63.8),
  vo8: s(72.3),
} as const;

export const sec = s;
