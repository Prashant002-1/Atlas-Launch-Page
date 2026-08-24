import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Kicker } from "../text/Reveal";
import { MacWindow } from "../ui/MacWindow";
import { C, F, PAD_X, T } from "../theme";
import { clamp, settle, exitIn, glide } from "../ease";
import { RAMBLE, T5, sec } from "../timeline";

// The driver — the teacher just talks. The window listens.
export const S5Ramble: React.FC = () => {
  const frame = useCurrentFrame();

  const winIn = interpolate(frame, [T5.winIn, T5.winIn + 26], [0, 1], { ...clamp, easing: settle });
  // hand-off toward S6's compact window: glide + shrink + fade
  const hand = interpolate(frame, [sec(47.4), sec(48.2)], [0, 1], { ...clamp, easing: glide });
  const fadeOut = interpolate(frame, [sec(47.7), sec(48.2)], [0, 1], { ...clamp, easing: exitIn });

  // accelerating type: starts deliberate, ends quick
  const p = interpolate(frame, [T5.typeStart, T5.typeEnd], [0, 1], clamp);
  const typed = RAMBLE.slice(0, Math.round(RAMBLE.length * Math.pow(p, 1.22)));
  const sent = frame >= T5.send;
  const caretOn = !sent && frame % 20 < 12;
  const sendPress = interpolate(frame, [T5.send - 4, T5.send], [0, 1], clamp);

  const gx = 340 - hand * 190;
  const gy = 200 + hand * 160;
  const scale = 1 - hand * 0.16;

  return (
    <AbsoluteFill>
      <Kicker at={sec(31.2)} exitAt={sec(47.2)} style={{ position: "absolute", left: PAD_X, top: 128 }}>
        Just tell it what you want
      </Kicker>
      <div
        style={{
          position: "absolute",
          left: PAD_X,
          top: 168,
          ...T.sub,
          fontSize: 27,
          color: C.muted,
          opacity:
            interpolate(frame, [sec(31.8), sec(32.4)], [0, 1], { ...clamp, easing: settle }) *
            (1 - interpolate(frame, [sec(46.9), sec(47.4)], [0, 1], clamp)),
        }}
      >
        Write it. Speak it. Ramble.
      </div>

      <div
        style={{
          position: "absolute",
          left: gx,
          top: gy,
          opacity: winIn * (1 - fadeOut),
          transform: `translateY(${(1 - winIn) * 60}px) scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <MacWindow
          title="Course agent"
          width={1180}
          right={
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width={14} height={14} viewBox="0 0 24 24">
                <rect x={9} y={3} width={6} height={12} rx={3} fill="none" stroke={C.muted} strokeWidth={2} />
                <path d="M5 11 a7 7 0 0 0 14 0 M12 18 v3" fill="none" stroke={C.muted} strokeWidth={2} strokeLinecap="round" />
              </svg>
              <span style={{ ...T.label, fontSize: 12, color: C.muted }}>Type or speak</span>
            </span>
          }
        >
          {/* the ramble grows upward; newest line always visible */}
          <div
            style={{
              position: "relative",
              height: 398,
              overflow: "hidden",
              border: "1px solid rgba(10,31,25,0.18)",
              background: "#fbfcf9",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                padding: "20px 26px",
                fontFamily: F.sans,
                fontSize: 22.5,
                lineHeight: 1.52,
                color: "#22352c",
                letterSpacing: "-0.004em",
              }}
            >
              {typed.length === 0 ? (
                <span style={{ color: C.muted, opacity: 0.65 }}>
                  Describe the assignment, and how it should teach…
                </span>
              ) : (
                typed
              )}
              <span
                style={{
                  display: "inline-block",
                  width: 2.5,
                  height: 25,
                  background: C.clay,
                  verticalAlign: -4,
                  opacity: caretOn ? 1 : 0,
                }}
              />
            </div>
            {/* top fade so overflowing earlier lines dissolve, not clip */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: 56,
                background: "linear-gradient(to bottom, #fbfcf9, rgba(251,252,249,0))",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <div
              style={{
                ...T.label,
                fontSize: 13.5,
                color: C.paperLift,
                background: C.ink,
                opacity: sent ? 0.55 : 1,
                padding: "12px 24px",
                transform: `scale(${1 - sendPress * 0.04})`,
              }}
            >
              Send to agent
            </div>
          </div>
        </MacWindow>
      </div>
    </AbsoluteFill>
  );
};
