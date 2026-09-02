// Atlas brand tokens — sourced from Atlas-Launch-Page/DESIGN.md
export const C = {
  paper: "#f1f4ee",
  paperLift: "#f7f9f4",
  paperSink: "#e5ebe2",
  ink: "#0a1f19",
  inkDeep: "#071712",
  inkSoft: "#2f4a41",
  muted: "#5f7168",
  pine: "#14543d",
  mint: "#72d49a",
  clay: "#bf5f3b",
  wash: "#e6eee6",
} as const;

export const F = {
  sans: "Geist, system-ui, sans-serif",
  mono: "'Geist Mono', ui-monospace, monospace",
  serifItalic: "'Spectral', Georgia, serif",
} as const;

// type scale (1920x1080 canvas)
export const T = {
  display: { fontFamily: F.sans, fontWeight: 470, letterSpacing: "-0.035em", lineHeight: 1.0 },
  headline: { fontFamily: F.sans, fontWeight: 470, letterSpacing: "-0.03em", lineHeight: 1.05 },
  sub: { fontFamily: F.sans, fontWeight: 410, letterSpacing: "-0.008em", lineHeight: 1.4 },
  label: {
    fontFamily: F.mono,
    fontWeight: 450,
    letterSpacing: "0.16em",
    textTransform: "uppercase" as const,
  },
} as const;

export const PAD_X = 150; // film-safe horizontal gutter
