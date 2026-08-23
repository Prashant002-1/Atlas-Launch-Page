import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Kicker, Line, Words } from "../text/Reveal";
import { MacWindow } from "../ui/MacWindow";
import { AssignRow, Bubble, ClassDots, TermRow } from "../ui/bits";
import { C, F, PAD_X, T } from "../theme";
import { clamp, glide, settle, exitIn } from "../ease";
import { S45, sec } from "../timeline";

const MSG =
  "A forty-minute reasoning assignment on this week’s reading. Guide with questions — never give the answer.";

export const S45Architecture: React.FC = () => {
  const frame = useCurrentFrame();

  // ---- window geometry: one rect, two lives -------------------------
  const gx = interpolate(frame, [S45.handoff, S45.handoff + 46], [1088, 150], { ...clamp, easing: glide });
  const gy = interpolate(frame, [S45.handoff, S45.handoff + 46], [268, 330], { ...clamp, easing: glide });
  const winIn = interpolate(frame, [S45.windowIn, S45.windowIn + 30], [0, 1], { ...clamp, easing: settle });
  const aliveA = interpolate(frame, [S45.handoff + 2, S45.handoff + 22], [1, 0], { ...clamp, easing: exitIn });
  const aliveB = interpolate(frame, [S45.handoff + 16, S45.handoff + 38], [0, 1], { ...clamp, easing: settle });
  const sceneOut = interpolate(frame, [S45.exit, S45.exit + 22], [0, 1], { ...clamp, easing: exitIn });

  // ---- segmented control --------------------------------------------
  const segIdx = interpolate(frame, [S45.select, S45.select + 17], [0, 3], { ...clamp, easing: glide });
  const segW = 146;
  const options = ["ESSAY", "PROBLEM SET", "QUIZ", "AI ASSIGNMENT"];

  // ---- typing --------------------------------------------------------
  const typed = MSG.slice(
    0,
    Math.round(interpolate(frame, [S45.typeStart, S45.typeEnd], [0, MSG.length], clamp))
  );
  const sent = frame >= S45.typeEnd + 10;
  const caretOn = frame < S45.typeEnd + 6 && frame % 22 < 13;

  // ---- capsule + link -------------------------------------------------
  const capIn = interpolate(frame, [S45.capsule, S45.capsule + 26], [0, 1], { ...clamp, easing: settle });
  const linkDraw = interpolate(frame, [S45.capsule - 12, S45.capsule + 18], [0, 1], { ...clamp, easing: glide });
  const pulse = interpolate(frame, [S45.capsule + 22, S45.capsule + 52], [0, 1], clamp);
  const shipPulse =
    1 + 0.02 * Math.sin(interpolate(frame, [S45.fanout, S45.fanout + 22], [0, Math.PI], clamp));

  // fan lines
  const fanN = 26;
  const fanCx = 1512;
  const fanCy = 604;
  const dotsCx = 960;
  const dotsCy = 884;
  const spread = 1260;

  return (
    <AbsoluteFill style={{ opacity: 1 - sceneOut }}>
      {/* ================= PHASE A — the reveal ================= */}
      <div style={{ position: "absolute", left: PAD_X, top: 306 }}>
        <Kicker at={S45.reveal + 12} exitAt={S45.handoff - 10}>
          A new assignment type
        </Kicker>
        <div style={{ height: 30 }} />
        <Line at={S45.reveal + 26} size={120} exitAt={S45.handoff - 8}>
          AI Assignments.
        </Line>
        <div style={{ height: 40 }} />
        <Words
          at={S45.coexistLine}
          size={33}
          color={C.muted}
          exitAt={S45.handoff - 10}
          text="Right beside the ones you already give."
        />
      </div>

      {/* ================= link + fan (behind the surfaces) ================= */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <path
          id="cfg"
          d="M 836 522 C 990 522 1090 522 1244 522"
          stroke={C.ink}
          strokeOpacity={0.16 * (1 - sceneOut)}
          strokeWidth={1.6}
          fill="none"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 * (1 - linkDraw)}
        />
        {pulse > 0 && pulse < 1 && (
          <circle cx={836 + 408 * pulse} cy={522} r={5} fill={C.clay} opacity={Math.sin(pulse * Math.PI)} />
        )}
        {Array.from({ length: fanN }).map((_, i) => {
          const x = dotsCx - spread / 2 + (spread / (fanN - 1)) * i;
          const y = dotsCy + Math.sin((i / (fanN - 1)) * Math.PI) * -26;
          const at = S45.fanout + i * 1.1;
          const p = interpolate(frame, [at, at + 16], [0, 1], { ...clamp, easing: glide });
          return (
            <path
              key={i}
              d={`M ${fanCx} ${fanCy} Q ${(fanCx + x) / 2} ${fanCy + 40}, ${x} ${y}`}
              stroke={C.clay}
              strokeOpacity={0.16 * p * (1 - sceneOut)}
              strokeWidth={1.2}
              fill="none"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={100 * (1 - p)}
            />
          );
        })}
      </svg>

      {/* ================= the window (two lives, one rect) ================= */}
      {aliveA > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: gx,
            top: gy,
            opacity: winIn * aliveA,
            transform: `translateY(${(1 - winIn) * 64}px)`,
          }}
        >
          <MacWindow title="New assignment" width={680}>
            {/* segmented type control */}
            <div
              style={{
                position: "relative",
                display: "flex",
                border: "1px solid rgba(10,31,25,0.16)",
                height: 46,
                marginBottom: 22,
                background: C.paper,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  bottom: 3,
                  left: 3 + segIdx * (segW + 4.5),
                  width: segW,
                  background: C.ink,
                }}
              />
              {options.map((o, i) => {
                const on = Math.abs(segIdx - i) < 0.5;
                return (
                  <div
                    key={o}
                    style={{
                      width: segW + 4.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      ...T.label,
                      fontSize: 12.5,
                      color: on ? C.paperLift : C.muted,
                      position: "relative",
                    }}
                  >
                    {o}
                  </div>
                );
              })}
            </div>
            {/* coexistence list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <AssignRow at={S45.select + 26} tag="Essay" barW={280} />
              <AssignRow at={S45.select + 38} tag="Quiz" barW={224} />
              <AssignRow
                at={S45.select + 50}
                tag="AI Assignment"
                tagColor={C.clay}
                tagBorder="rgba(191,95,59,0.5)"
                barW={318}
                active
              />
            </div>
          </MacWindow>
        </div>
      )}

      {aliveB > 0.01 && (
        <div style={{ position: "absolute", left: gx, top: gy, opacity: aliveB }}>
          <MacWindow title="Course agent" width={680}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* composer */}
              <div
                style={{
                  border: "1px solid rgba(10,31,25,0.20)",
                  background: "#fbfcf9",
                  padding: "17px 20px",
                  minHeight: 96,
                  fontFamily: F.sans,
                  fontSize: 20.5,
                  lineHeight: 1.45,
                  color: "#22352c",
                  opacity: sent ? 0.38 : 1,
                }}
              >
                {sent ? (
                  <span style={{ color: C.muted, opacity: 0.7 }}>Describe the next assignment…</span>
                ) : (
                  <>
                    {typed}
                    <span
                      style={{
                        display: "inline-block",
                        width: 2.5,
                        height: 24,
                        background: C.clay,
                        verticalAlign: -4,
                        opacity: caretOn ? 1 : 0,
                      }}
                    />
                  </>
                )}
              </div>
              <Bubble at={S45.typeEnd + 12} who="student" width="88%">
                {MSG}
              </Bubble>
              <Bubble at={S45.reply} who="agent" width="76%">
                Understood. Configuring the assignment agent now.
              </Bubble>
            </div>
          </MacWindow>
        </div>
      )}

      {/* ================= the assignment-agent capsule ================= */}
      <div
        style={{
          position: "absolute",
          left: 1244,
          top: 352,
          width: 536,
          opacity: capIn,
          transform: `translateY(${(1 - capIn) * 46}px) scale(${shipPulse})`,
          background: C.paperLift,
          boxShadow: "0 0 0 1px rgba(10,31,25,0.14), 0 22px 52px rgba(10,31,25,0.09)",
          padding: "26px 30px 30px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
          <span style={{ width: 11, height: 11, background: C.clay }} />
          <span style={{ ...T.label, fontSize: 14, color: C.inkSoft }}>Assignment agent</span>
          <span style={{ ...T.label, fontSize: 11.5, color: C.muted, marginLeft: "auto" }}>
            configured by your agent
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
          <TermRow at={S45.terms[0]} k="Guidance" v="Socratic — questions first." />
          <TermRow at={S45.terms[1]} k="Boundary" v="Never writes the answer." accent={C.clay} />
          <TermRow at={S45.terms[2]} k="Sources" v="Course material only." />
          <TermRow at={S45.terms[3]} k="Reports" v="Understanding, back to you." />
        </div>
      </div>

      {/* ================= the class ================= */}
      <ClassDots at={S45.fanout + 4} cx={dotsCx} cy={dotsCy} spread={spread} />
      <Kicker
        at={S45.fanout + 34}
        exitAt={S45.exit - 2}
        style={{ position: "absolute", left: 0, right: 0, top: dotsCy + 44, textAlign: "center", fontSize: 15 }}
        color={C.muted}
      >
        one per student · every conversation returns
      </Kicker>

      {/* ================= the line ================= */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 128, textAlign: "center" }}>
        <Kicker
          at={S45.handoff + 20}
          exitAt={S45.bigLine - 6}
          style={{ textAlign: "center", fontSize: 19 }}
        >
          One agent configures another
        </Kicker>
        <div style={{ height: 22 }} />
        <Line at={S45.bigLine} size={62} exitAt={S45.exit} style={{ textAlign: "center" }}>
          Your agent builds the agent your students meet.
        </Line>
        <div style={{ height: 20 }} />
        <Words
          at={S45.bigLine + 58}
          size={28}
          color={C.muted}
          exitAt={S45.exit}
          style={{ textAlign: "center" }}
          text="Configured once. Shipped to everyone."
        />
      </div>
    </AbsoluteFill>
  );
};
