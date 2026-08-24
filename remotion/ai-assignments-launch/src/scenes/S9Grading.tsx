import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Kicker, Line } from "../text/Reveal";
import { MacWindow } from "../ui/MacWindow";
import { C, F, PAD_X, T } from "../theme";
import { clamp, settle, exitIn } from "../ease";
import { T9, sec } from "../timeline";

const EvidenceRow: React.FC<{ at: number; k: string; q: string }> = ({ at, k, q }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + 13], [0, 1], { ...clamp, easing: settle });
  return (
    <div style={{ opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
      <div style={{ ...T.label, fontSize: 12.5, color: C.muted, marginBottom: 6 }}>{k}</div>
      <div
        style={{
          fontFamily: F.sans,
          fontSize: 17.5,
          lineHeight: 1.45,
          color: "#41544a",
          background: "#eef2ea",
          padding: "11px 14px",
          borderLeft: `2px solid ${C.clay}`,
        }}
      >
        {q}
      </div>
    </div>
  );
};

// The return — a draft grade against the teacher's rubric, evidence attached.
export const S9Grading: React.FC = () => {
  const frame = useCurrentFrame();

  const winIn = interpolate(frame, [T9.win, T9.win + 24], [0, 1], { ...clamp, easing: settle });
  const out = interpolate(frame, [T9.exit, T9.exit + 16], [0, 1], { ...clamp, easing: exitIn });
  const markP = interpolate(frame, [T9.mark, T9.mark + 26], [0, 1], { ...clamp, easing: settle });
  const markN = Math.round(interpolate(frame, [T9.mark + 4, T9.mark + 30], [0, 91], clamp));
  const btns = interpolate(frame, [T9.buttons, T9.buttons + 14], [0, 1], { ...clamp, easing: settle });
  const pub = interpolate(frame, [T9.publish, T9.publish + 8], [0, 1], clamp);
  const published = frame >= T9.publish + 10;

  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Kicker at={T9.kicker} exitAt={T9.exit - 2} style={{ position: "absolute", left: PAD_X, top: 160 }}>
        Back to you
      </Kicker>

      <div
        style={{
          position: "absolute",
          left: 964,
          top: 208,
          opacity: winIn,
          transform: `translateY(${(1 - winIn) * 56}px)`,
        }}
      >
        <MacWindow title="Draft grade" width={800}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 218px", gap: 30 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <EvidenceRow at={T9.rows[0]} k="Claim, defended" q="…breaks when the data gets thin, and here is where mine thinned…" />
              <EvidenceRow at={T9.rows[1]} k="Applied to something real" q="…ran it against the county housing series from week 4…" />
              <EvidenceRow at={T9.rows[2]} k="Course readings, cited" q="…the estimator note, section 2, says exactly this…" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 6 }}>
              <div style={{ ...T.label, fontSize: 12, color: C.muted, opacity: markP }}>
                {published ? "Published" : "Agent draft"}
              </div>
              <div
                style={{
                  fontFamily: F.sans,
                  fontSize: 88,
                  fontWeight: 490,
                  letterSpacing: "-0.03em",
                  color: C.ink,
                  opacity: markP,
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1.1,
                }}
              >
                {markN}
              </div>
              <div style={{ ...T.label, fontSize: 11.5, color: C.muted, opacity: markP, marginBottom: 22 }}>
                against your rubric
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: btns, width: "100%" }}>
                <div
                  style={{
                    ...T.label,
                    fontSize: 13,
                    color: C.inkSoft,
                    border: "1px solid rgba(10,31,25,0.22)",
                    padding: "11px 0",
                    textAlign: "center",
                  }}
                >
                  Adjust
                </div>
                <div
                  style={{
                    ...T.label,
                    fontSize: 13,
                    color: C.paperLift,
                    background: C.ink,
                    padding: "11px 0",
                    textAlign: "center",
                    transform: `scale(${1 - Math.sin(pub * Math.PI) * 0.04})`,
                    opacity: published ? 0.6 : 1,
                  }}
                >
                  {published ? "In gradebook" : "Publish"}
                </div>
              </div>
            </div>
          </div>
        </MacWindow>
      </div>

      <div style={{ position: "absolute", left: PAD_X, top: 400, width: 700 }}>
        <Line at={sec(74.8)} size={78} exitAt={T9.exit}>
          Evidence attached.
        </Line>
        <Line at={sec(75.3)} size={78} exitAt={T9.exit + 1} style={{ color: C.inkSoft }}>
          Judgment yours.
        </Line>
        <div style={{ height: 34 }} />
        <Line at={T9.headline} size={30} weight={410} color={C.muted} exitAt={T9.exit}>
          Review it, adjust it, publish it.
        </Line>
      </div>
    </AbsoluteFill>
  );
};
