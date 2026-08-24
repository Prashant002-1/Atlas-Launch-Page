#!/usr/bin/env python3
"""Score v2 for the AI Assignments film. 130s, 44.1k stereo.

Contemporary-classical: felt piano motif, string ensemble, low pulse
ostinato, two timpani hits under the closing order, all in a stereo hall.
Arc: sparse piano (problem) -> warming pad (reveal) -> building ostinato
(the ramble) -> peak (ship to class) -> intimate (student) -> bare (friction)
-> warm (grading) -> dark minor + rise (thesis/punch) -> D major resolve.
"""
import math
import wave
import struct

SR = 44100
DUR = 130.0
N = int(SR * DUR)
TAU = 2.0 * math.pi

dryL = [0.0] * N
dryR = [0.0] * N
send = [0.0] * N  # mono reverb send


def add(i, l, r, s):
    if 0 <= i < N:
        dryL[i] += l
        dryR[i] += r
        send[i] += s


# ---------------------------------------------------------------- felt piano
def piano(t0, f, vel=0.5, pan=0.0, tau=None):
    if tau is None:
        tau = 2.6 if f < 200 else 1.7 if f < 500 else 1.25
    dur = int(min(tau * 4.2, 6.0) * SR)
    i0 = int(t0 * SR)
    gl = vel * (1 - max(0, pan) * 0.8)
    gr = vel * (1 + min(0, pan) * 0.8)
    lp = 0.0
    seed = int(f * 100) & 0x7FFFFFFF
    for j in range(dur):
        tt = j / SR
        env = math.exp(-tt / tau) * min(1.0, tt / 0.0025)
        s = (
            1.00 * math.sin(TAU * f * tt)
            + 0.40 * math.exp(-tt / (tau * 0.5)) * math.sin(TAU * f * 2.003 * tt)
            + 0.16 * math.exp(-tt / (tau * 0.33)) * math.sin(TAU * f * 3.01 * tt)
            + 0.06 * math.exp(-tt / (tau * 0.22)) * math.sin(TAU * f * 4.06 * tt)
        )
        # felt: one-pole lowpass
        lp += 0.24 * (s - lp)
        v = env * lp
        if tt < 0.03:  # hammer breath
            seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
            v += (seed / 0x3FFFFFFF - 1.0) * (0.03 - tt) * 1.1 * math.exp(-tt / 0.01)
        add(i0 + j, v * gl * 0.5, v * gr * 0.5, v * vel * 0.30)


# ------------------------------------------------------------------- strings
def string_note(t0, f, dur_s, vel=0.3, atk=1.4, rel=2.4, pan=0.0, dark=0.22):
    dur = int((dur_s + rel) * SR)
    i0 = int(t0 * SR)
    gl = vel * (1 - max(0, pan) * 0.8)
    gr = vel * (1 + min(0, pan) * 0.8)
    det = [0.0, 0.0035, -0.0032, 0.0068, -0.0061]
    amp = [1.0, 0.62, 0.62, 0.38, 0.38]
    ph = [0.0, 1.1, 2.3, 3.7, 4.9]
    lp = 0.0
    for j in range(dur):
        tt = j / SR
        if tt < atk:
            env = (tt / atk) ** 1.6
        elif tt < dur_s:
            env = 1.0
        else:
            env = max(0.0, 1.0 - (tt - dur_s) / rel) ** 1.5
        if env <= 0.0:
            continue
        vib = 1.0 + 0.0016 * math.sin(TAU * 5.1 * tt) * min(1.0, tt / 1.2)
        s = 0.0
        for k in range(5):
            fk = f * (1 + det[k]) * vib
            # saw-lite: 4 harmonics
            s += amp[k] * (
                math.sin(TAU * fk * tt + ph[k])
                + 0.5 * math.sin(TAU * 2 * fk * tt + ph[k])
                + 0.28 * math.sin(TAU * 3 * fk * tt)
                + 0.16 * math.sin(TAU * 4 * fk * tt)
            )
        lp += dark * (s - lp)
        v = env * lp * 0.15
        add(i0 + j, v * gl, v * gr, v * vel * 0.5)


# ------------------------------------------------------------------ ostinato
def pulse(t0, f, vel=0.2, pan=0.0):
    dur = int(0.34 * SR)
    i0 = int(t0 * SR)
    gl = vel * (1 - max(0, pan) * 0.8)
    gr = vel * (1 + min(0, pan) * 0.8)
    lp = 0.0
    for j in range(dur):
        tt = j / SR
        env = math.exp(-tt / 0.10) * min(1.0, tt / 0.008)
        s = (
            math.sin(TAU * f * tt)
            + 0.5 * math.sin(TAU * 2.004 * f * tt)
            + 0.25 * math.sin(TAU * 3.01 * f * tt)
        )
        lp += 0.2 * (s - lp)
        v = env * lp * 0.5
        add(i0 + j, v * gl, v * gr, v * vel * 0.2)


# ---------------------------------------------------------------------- timp
def timp(t0, vel=0.55):
    dur = int(2.2 * SR)
    i0 = int(t0 * SR)
    seed = 991
    lp = 0.0
    for j in range(dur):
        tt = j / SR
        fenv = 58.0 * math.exp(-tt / 0.09) + 41.0
        env = math.exp(-tt / 0.55) * min(1.0, tt / 0.004)
        s = math.sin(TAU * fenv * tt * (1 + 0.5 * math.exp(-tt / 0.05)))
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
        n = (seed / 0x3FFFFFFF - 1.0) * math.exp(-tt / 0.05) * 0.7
        lp += 0.12 * ((s + n) - lp)
        v = env * lp
        add(i0 + j, v * vel, v * vel, v * vel * 0.5)


# ------------------------------------------------------------------- program
D1, A1, D2, A2, D3, F3, Fs3, A3, B3, Cs4 = 36.71, 55.0, 73.42, 110.0, 146.83, 174.61, 185.0, 220.0, 246.94, 277.18
D4, E4, F4, Fs4, A4, D5, E5, Fs5 = 293.66, 329.63, 349.23, 369.99, 440.0, 587.33, 659.26, 739.99

# Act I — sparse felt piano, a shadow of strings
piano(2.2, D4, 0.34, -0.15)
piano(4.6, A3, 0.26, 0.15)
piano(7.4, F4, 0.30, 0.1)          # minor shade for the problem
piano(10.2, D4, 0.24, -0.1)
string_note(11.0, D2, 9.0, 0.16, atk=2.6, pan=0.0)
piano(15.4, E4, 0.26, 0.12)
piano(18.2, Fs4, 0.30, -0.1)       # first brightness at "decide"
string_note(16.0, A2, 5.2, 0.13, atk=2.2)
piano(20.4, A4, 0.22, 0.1)

# Act II — reveal warms, the ramble builds
string_note(22.4, D3, 7.6, 0.16, atk=1.8, pan=-0.2)
string_note(23.2, Fs3, 6.8, 0.13, atk=2.0, pan=0.2)
string_note(24.0, A3, 6.0, 0.11, atk=2.2)
piano(23.0, D4, 0.34, -0.1)
piano(23.5, Fs4, 0.28, 0.05)
piano(24.1, A4, 0.30, 0.15)
piano(25.4, E5, 0.20, -0.15)

# ostinato through the ramble, growing
tp = 31.6
k = 0
while tp < 55.8:
    grow = min(1.0, (tp - 31.6) / 9.0)
    vel = 0.05 + 0.13 * grow
    pulse(tp, D2 if k % 2 == 0 else A1, vel, -0.12 if k % 2 == 0 else 0.12)
    tp += 0.319
    k += 1
string_note(33.0, D2, 22.0, 0.15, atk=3.2)
string_note(36.0, A2, 19.0, 0.13, atk=3.0, pan=0.15)
string_note(40.0, E4, 14.0, 0.085, atk=3.4, pan=-0.2)   # add9 shimmer
piano(33.2, D4, 0.2, -0.1)
piano(37.3, A3, 0.18, 0.12)
piano(41.4, Fs4, 0.22, -0.08)
piano(45.2, E4, 0.2, 0.1)

# rubric assembly — a rising line
for t, f in [(48.6, A3), (50.2, B3), (51.8, Cs4), (53.4, D4)]:
    string_note(t, f, 2.6, 0.12, atk=0.9, rel=1.6, pan=0.1)
piano(48.8, D5, 0.2, 0.15)
piano(53.6, Fs4, 0.24, -0.1)

# peak one: ship to class
string_note(56.0, D3, 7.0, 0.2, atk=1.2, pan=-0.15)
string_note(56.0, A3, 7.0, 0.16, atk=1.4, pan=0.15)
string_note(56.4, Fs3, 6.6, 0.15, atk=1.6)
string_note(57.0, E4, 5.6, 0.1, atk=1.8, pan=-0.25)
for t, f, v in [(56.4, D5, 0.3), (57.1, A4, 0.26), (57.9, Fs4, 0.24), (58.7, D4, 0.28)]:
    piano(t, f, v, 0.1 - (t - 56.4) * 0.1)
tp = 56.0
k = 0
while tp < 63.5:
    fade = min(1.0, max(0.15, (63.5 - tp) / 3.0))
    pulse(tp, D2 if k % 2 == 0 else A1, 0.16 * fade, -0.12 if k % 2 == 0 else 0.12)
    tp += 0.319
    k += 1

# Act III — intimate: the student
string_note(65.5, D2, 17.0, 0.1, atk=4.0)
piano(66.2, Fs4, 0.22, -0.12)
piano(70.4, D4, 0.2, 0.1)
piano(75.6, D5, 0.16, -0.2, tau=1.1)   # the sketch sparkle
piano(76.1, E5, 0.15, 0.0, tau=1.1)
piano(76.6, Fs5, 0.16, 0.2, tau=1.1)
piano(80.2, A3, 0.2, 0.05)

# friction — bare
piano(84.7, D2, 0.34, 0.0, tau=3.4)
piano(84.72, D3, 0.22, 0.0, tau=2.8)
piano(87.6, F4, 0.2, 0.1)              # one minor shade
string_note(88.5, A2, 2.6, 0.08, atk=1.6)

# grading — warmth returns
string_note(92.5, D3, 12.0, 0.14, atk=2.2, pan=-0.15)
string_note(93.3, Fs3, 11.0, 0.12, atk=2.4, pan=0.15)
string_note(94.1, A3, 10.0, 0.1, atk=2.6)
piano(93.4, D4, 0.24, -0.1)
for t, f in [(97.2, D4), (97.5, Fs4), (97.8, A4), (98.1, D5)]:
    piano(t, f, 0.17, 0.1)             # the mark counts up
piano(101.9, A4, 0.18, -0.1)

# Act IV — dark, then the rise
string_note(106.4, D2, 9.6, 0.2, atk=1.8, dark=0.16)
string_note(107.2, F3, 8.6, 0.15, atk=2.2, dark=0.16, pan=-0.2)  # minor
string_note(108.0, A2, 7.8, 0.13, atk=2.4, dark=0.16, pan=0.2)
# sub pedal
i0 = int(106.2 * SR)
for j in range(int(9.6 * SR)):
    tt = j / SR
    env = min(1.0, tt / 2.5) * min(1.0, max(0.0, (9.6 - tt) / 1.4))
    v = 0.16 * env * math.sin(TAU * D1 * tt)
    add(i0 + j, v, v, 0.0)
# the rise under the order
string_note(111.6, D3, 4.6, 0.2, atk=1.4, pan=-0.15)
string_note(111.6, A3, 4.6, 0.17, atk=1.5, pan=0.15)
string_note(112.4, D4, 3.8, 0.15, atk=1.2)
string_note(113.2, Fs4, 3.2, 0.12, atk=1.0, pan=-0.2)
timp(112.05, 0.5)
timp(113.95, 0.62)
tp = 111.9
k = 0
while tp < 115.4:
    pulse(tp, D2 if k % 2 == 0 else A1, 0.2, -0.1 if k % 2 == 0 else 0.1)
    tp += 0.2394
    k += 1

# resolve — D major, first full triad at rest
string_note(116.3, D3, 10.5, 0.15, atk=2.6, pan=-0.1)
string_note(116.9, Fs3, 9.6, 0.12, atk=2.8, pan=0.15)
string_note(117.5, A3, 8.8, 0.1, atk=3.0)
string_note(118.3, D4, 7.6, 0.08, atk=3.2, pan=-0.2)
for t, f, v in [(117.2, D5, 0.24), (118.0, A4, 0.2), (118.9, Fs4, 0.18), (119.8, D4, 0.22)]:
    piano(t, f, v, 0.08)
piano(121.3, A4, 0.14, -0.1)
piano(122.7, D5, 0.13, 0.1)
piano(125.5, D4, 0.15, 0.0, tau=3.2)

# ---------------------------------------------------------------------- air
lp1 = lp2 = lp3 = 0.0
seed = 424242
for i in range(N):
    t = i / SR
    seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
    n = (seed / 0x3FFFFFFF) - 1.0
    lp1 += 0.05 * (n - lp1)
    lp2 += 0.05 * (lp1 - lp2)
    lp3 += 0.05 * (lp2 - lp3)
    g = 0.05 * (0.75 + 0.25 * math.sin(TAU * t / 31.0)) * min(1.0, t / 3.0) * min(1.0, max(0.0, (DUR - t) / 2.0))
    dryL[i] += g * lp3 * 4.0
    dryR[i] += g * lp3 * 3.6

# -------------------------------------------------------------------- reverb
def reverb(sig, combs, aps):
    out = [0.0] * N
    bufs = [[0.0] * d for d in combs]
    idx = [0] * len(combs)
    fb = [0.805, 0.792, 0.78, 0.766]
    for i in range(N):
        x = sig[i]
        acc = 0.0
        for c in range(4):
            b = bufs[c]
            j = idx[c]
            y = b[j]
            b[j] = x + y * fb[c]
            idx[c] = (j + 1) % combs[c]
            acc += y
        out[i] = acc * 0.25
    for dl, g in aps:
        buf = [0.0] * dl
        j = 0
        for i in range(N):
            y = buf[j]
            v = out[i] + y * g
            buf[j] = v
            j = (j + 1) % dl
            out[i] = y - v * g
    return out

revL = reverb(send, [1319, 1637, 1811, 1931], [(225, 0.7), (77, 0.7)])
revR = reverb(send, [1361, 1693, 1867, 1997], [(241, 0.7), (83, 0.7)])

for i in range(N):
    dryL[i] += revL[i] * 0.85
    dryR[i] += revR[i] * 0.85

peak = max(max(abs(x) for x in dryL), max(abs(x) for x in dryR))
kk = 0.55 / peak if peak > 0 else 1.0
with wave.open("public/audio/bed.wav", "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    frames = bytearray()
    for i in range(N):
        frames += struct.pack("<hh", int(dryL[i] * kk * 32767), int(dryR[i] * kk * 32767))
    w.writeframes(bytes(frames))
print("bed.wav v2 written,", N, "samples, peak scale", round(kk, 3))
