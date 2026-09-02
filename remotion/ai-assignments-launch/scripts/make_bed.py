#!/usr/bin/env python3
"""Ambient bed for the AI Assignments film. 80s, 44.1k stereo.

Harmonic plan (D):
  - open fifths D+A carry the whole film (neutral, modern, no sentiment)
  - F natural (minor shade) enters only under the dark thesis cut (63-71.5s)
  - the major third F# arrives only at the close (71.5s) = resolution
  - struck-sine motif notes mark scene boundaries, very quiet
"""
import math
import wave
import struct

SR = 44100
DUR = 80.0
N = int(SR * DUR)
TAU = 2.0 * math.pi


def bp(t, points):
    """piecewise-linear breakpoint envelope; points = [(t, v), ...]"""
    if t <= points[0][0]:
        return points[0][1]
    for i in range(1, len(points)):
        t1, v1 = points[i]
        t0, v0 = points[i - 1]
        if t <= t1:
            a = (t - t0) / (t1 - t0) if t1 > t0 else 1.0
            # smoothstep for gentler joins
            a = a * a * (3 - 2 * a)
            return v0 + (v1 - v0) * a
    return points[-1][1]


# macro gain of the whole bed
MACRO = [(0.0, 0.0), (2.5, 0.55), (8.0, 0.62), (17.0, 0.7), (25.0, 0.78),
         (36.0, 0.85), (52.0, 0.75), (61.5, 0.6), (63.5, 0.95), (70.8, 0.95),
         (72.5, 0.7), (77.0, 0.62), (79.2, 0.4), (80.0, 0.0)]

# layer envelopes
F_SHADE = [(0.0, 0.0), (62.4, 0.0), (64.0, 0.5), (70.6, 0.5), (71.8, 0.0), (80.0, 0.0)]
SUB = [(0.0, 0.0), (62.8, 0.0), (65.0, 0.6), (70.5, 0.6), (71.8, 0.0), (80.0, 0.0)]
RESOLVE = [(0.0, 0.0), (71.4, 0.0), (73.8, 0.55), (78.5, 0.5), (80.0, 0.25)]
SHIMMER = [(0.0, 0.0), (25.0, 0.0), (27.0, 0.5), (50.0, 0.5), (60.0, 0.25),
           (62.5, 0.0), (72.0, 0.0), (74.5, 0.45), (80.0, 0.3)]
AIR = [(0.0, 0.0), (3.0, 0.5), (62.5, 0.5), (63.5, 0.25), (71.5, 0.25), (73.0, 0.5), (80.0, 0.4)]

# struck-sine motif: (time, freq, gain, pan −1..1)
PLINKS = [
    (8.0, 220.0, 0.20, -0.25), (17.0, 293.66, 0.20, 0.25), (25.0, 440.0, 0.26, 0.15),
    (36.0, 293.66, 0.18, -0.2), (52.0, 220.0, 0.18, 0.2), (63.0, 146.83, 0.26, 0.0),
    (71.5, 293.66, 0.2, -0.15), (71.59, 369.99, 0.2, 0.0), (71.68, 440.0, 0.2, 0.15),
    (76.6, 587.33, 0.12, 0.1),
]


def synth():
    L = [0.0] * N
    R = [0.0] * N

    # --- sustained layers (sample loop) ---
    lp1L = lp2L = lp3L = 0.0
    lp1R = lp2R = lp3R = 0.0
    seedL, seedR = 12345, 67890

    for i in range(N):
        t = i / SR
        m = bp(t, MACRO)

        # drone: D2 + A2, slow independent tremolo
        lfo1 = 1.0 + 0.12 * math.sin(TAU * t / 17.0)
        lfo2 = 1.0 + 0.10 * math.sin(TAU * t / 23.0 + 1.3)
        drone = 0.30 * lfo1 * math.sin(TAU * 73.4162 * t) + 0.20 * lfo2 * math.sin(TAU * 110.0 * t)
        # slow-beating second voice a few cents off = organic width
        droneW = 0.10 * math.sin(TAU * 73.62 * t + 0.7) + 0.07 * math.sin(TAU * 110.35 * t + 2.1)

        # minor shade + sub for the dark cut
        f_sh = bp(t, F_SHADE)
        shade = f_sh * 0.16 * math.sin(TAU * 174.614 * t + 0.4)
        sub = bp(t, SUB) * 0.30 * math.sin(TAU * 36.708 * t)

        # resolution chord (F#3, A3, D4) — the third arrives only here
        r = bp(t, RESOLVE)
        resolve = r * (
            0.11 * math.sin(TAU * 184.997 * t)
            + 0.09 * math.sin(TAU * 220.0 * t + 0.9)
            + 0.08 * math.sin(TAU * 293.665 * t + 1.7)
        )

        # shimmer: high fifth, gentle tremolo
        sh = bp(t, SHIMMER)
        trem = 0.5 + 0.5 * math.sin(TAU * t / 6.3)
        shimmer = sh * 0.055 * trem * math.sin(TAU * 587.33 * t + 0.2) + sh * 0.045 * (1 - trem) * math.sin(
            TAU * 440.0 * t
        )

        # air: decorrelated filtered noise
        seedL = (seedL * 1103515245 + 12345) & 0x7FFFFFFF
        seedR = (seedR * 1103515245 + 12345) & 0x7FFFFFFF
        nL = (seedL / 0x3FFFFFFF) - 1.0
        nR = (seedR / 0x3FFFFFFF) - 1.0
        a = 0.045
        lp1L += a * (nL - lp1L); lp2L += a * (lp1L - lp2L); lp3L += a * (lp2L - lp3L)
        lp1R += a * (nR - lp1R); lp2R += a * (lp1R - lp2R); lp3R += a * (lp2R - lp3R)
        airg = bp(t, AIR) * 0.14
        wave_ = 0.75 + 0.25 * math.sin(TAU * t / 29.0)

        core = drone + shade + sub + resolve + shimmer
        L[i] = m * (core + 0.9 * droneW + airg * wave_ * lp3L * 4.0)
        R[i] = m * (core - 0.9 * droneW + airg * wave_ * lp3R * 4.0)

    # --- motif notes (short local loops) ---
    for (t0, f, g, pan) in PLINKS:
        i0 = int(t0 * SR)
        dur = int(2.2 * SR)
        gl = g * (1.0 - max(0.0, pan))
        gr = g * (1.0 + min(0.0, pan))
        for j in range(dur):
            i = i0 + j
            if i >= N:
                break
            tt = j / SR
            envd = math.exp(-tt / 0.55) * min(1.0, tt / 0.004)
            s = envd * (
                math.sin(TAU * f * tt)
                + 0.28 * math.exp(-tt / 0.22) * math.sin(TAU * f * 2.0 * tt)
                + 0.10 * math.sin(TAU * f * 1.004 * tt)
            )
            L[i] += gl * s * 0.5
            R[i] += gr * s * 0.5

    # normalize to −6 dBFS-ish peak
    peak = max(max(abs(x) for x in L), max(abs(x) for x in R))
    k = 0.5 / peak if peak > 0 else 1.0
    with wave.open("public/audio/bed.wav", "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = bytearray()
        for i in range(N):
            frames += struct.pack("<hh", int(L[i] * k * 32767), int(R[i] * k * 32767))
        w.writeframes(bytes(frames))
    print("bed.wav written", N, "samples, peak scale", round(k, 3))


if __name__ == "__main__":
    synth()
