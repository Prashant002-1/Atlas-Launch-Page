import React from "react";
import { C, T } from "../theme";

// Floating macOS-style window — the only container product UI ever appears in.
// Paper-lift surface, hairline ink border, Product Float shadow (brand DESIGN.md).
export const MacWindow: React.FC<{
  title: string;
  width: number;
  children: React.ReactNode;
  right?: React.ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}> = ({ title, width, children, right, style, bodyStyle }) => (
  <div
    style={{
      width,
      borderRadius: 13,
      background: C.paperLift,
      boxShadow:
        "0 0 0 1px rgba(10,31,25,0.10), 0 28px 64px rgba(10,31,25,0.10), 0 6px 18px rgba(10,31,25,0.06)",
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        height: 46,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "0 20px",
        background: "#edf1e9",
        borderBottom: "1px solid rgba(10,31,25,0.08)",
      }}
    >
      <span style={{ width: 12, height: 12, borderRadius: 6, background: "#de6e62" }} />
      <span style={{ width: 12, height: 12, borderRadius: 6, background: "#e2b95b" }} />
      <span style={{ width: 12, height: 12, borderRadius: 6, background: "#7cc38b" }} />
      <span style={{ ...T.label, fontSize: 13, color: "#5b6b62", marginLeft: 12 }}>{title}</span>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>{right}</div>
    </div>
    <div style={{ padding: 30, ...bodyStyle }}>{children}</div>
  </div>
);
