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
DUR = 110.0
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
        tau = 3.5 if f < 200 else 2.3 if f < 500 else 1.7
    dur = int(min(tau * 4.0, 7.0) * SR)
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
        lp += 0.19 * (s - lp)
        v = env * lp
        if tt < 0.03:  # hammer breath
            seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
            v += (seed / 0x3FFFFFFF - 1.0) * (0.03 - tt) * 0.7 * math.exp(-tt / 0.01)
        add(i0 + j, v * gl * 0.5, v * gr * 0.5, v * vel * 0.30)


# ------------------------------------------------------------------- strings
def string_note(t0, f, dur_s, vel=0.3, atk=1.4, rel=2.4, pan=0.0, dark=0.22):
    dur = int((dur_s + rel) * SR)
    i0 = int(t0 * SR)
    gl = vel * (1 - max(0, pan) * 0.8)
    gr = vel * (1 + min(0, pan) * 0.8)
    det = [0.0, 0.0035, -0.0032, 0.0068, -0.0061, 0.0102, -0.0096]
    amp = [1.0, 0.62, 0.62, 0.38, 0.38, 0.22, 0.22]
    ph = [0.0, 1.1, 2.3, 3.7, 4.9, 0.7, 2.9]
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
        vib = 1.0 + 0.0022 * math.sin(TAU * 5.1 * tt) * min(1.0, tt / 1.2)
        s = 0.0
        for k in range(7):
            fk = f * (1 + det[k]) * vib
            # saw-lite: 4 harmonics
            s += amp[k] * (
                0.22 * math.sin(TAU * 0.5 * fk * tt)
                + math.sin(TAU * fk * tt + ph[k])
                + 0.5 * math.sin(TAU * 2 * fk * tt + ph[k])
                + 0.28 * math.sin(TAU * 3 * fk * tt)
                + 0.16 * math.sin(TAU * 4 * fk * tt)
            )
        lp += dark * (s - lp)
        v = env * lp * 0.15
        add(i0 + j, v * gl, v * gr, v * vel * 0.62)


# ------------------------------------------------------------------ ostinato
def pulse(t0, f, vel=0.2, pan=0.0):
    dur = int(0.34 * SR)
    i0 = int(t0 * SR)
    gl = vel * (1 - max(0, pan) * 0.8)
    gr = vel * (1 + min(0, pan) * 0.8)
    lp = 0.0
    for j in range(dur):
        tt = j / SR
        env = math.exp(-tt / 0.15) * min(1.0, tt / 0.014)
        s = (
            math.sin(TAU * f * tt)
            + 0.5 * math.sin(TAU * 2.004 * f * tt)
            + 0.25 * math.sin(TAU * 3.01 * f * tt)
        )
        lp += 0.16 * (s - lp)
        v = env * lp * 0.5
        add(i0 + j, v * gl, v * gr, v * vel * 0.3)


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


def riser(t0, dur, vel=0.18):
    n = int(dur * SR)
    i0 = int(t0 * SR)
    seed = 555
    lp = 0.0
    for j in range(n):
        tt = j / n
        seed = (seed * 1103515245 + 12345) & 0x7FFFFFFF
        w = (seed / 0x3FFFFFFF) - 1.0
        coef = 0.02 + 0.33 * tt * tt
        lp += coef * (w - lp)
        v = lp * vel * (tt ** 2.2)
        add(i0 + j, v, v * 0.94, v * 0.35)


# ------------------------------------------------------------------- program
D1, A1, D2, A2, D3, F3, Fs3, A3, B3, Cs4 = 36.71, 55.0, 73.42, 110.0, 146.83, 174.61, 185.0, 220.0, 246.94, 277.18
D4, E4, F4, Fs4, A4, D5, E5, Fs5 = 293.66, 329.63, 349.23, 369.99, 440.0, 587.33, 659.26, 739.99

# Act I: sparse felt piano, a shadow of strings
piano(1.2, D4, 0.32, -0.15)
piano(3.0, A3, 0.24, 0.15)
piano(5.5, F4, 0.3, 0.1)
piano(7.6, D4, 0.22, -0.1)
string_note(8.0, D2, 6.5, 0.15, atk=2.2)
piano(12.4, E4, 0.26, 0.12)
piano(14.2, Fs4, 0.3, -0.1)
string_note(12.8, A2, 4.0, 0.12, atk=1.8)
piano(16.2, A4, 0.2, 0.1)

# reveal warms
string_note(18.2, D3, 5.8, 0.16, atk=1.4, pan=-0.2)
string_note(18.9, Fs3, 5.2, 0.13, atk=1.6, pan=0.2)
string_note(19.6, A3, 4.6, 0.11, atk=1.8)
piano(18.6, D4, 0.32, -0.1)
piano(19.1, Fs4, 0.26, 0.05)
piano(19.7, A4, 0.28, 0.15)
piano(20.7, E5, 0.18, -0.15)

# THE DICTATION: ostinato grows with the typing
tp = 26.4
k = 0
while tp < 44.4:
    grow = min(1.0, (tp - 26.4) / 10.0)
    vel = 0.05 + 0.14 * grow
    pulse(tp, D2 if k % 2 == 0 else A1, vel, -0.12 if k % 2 == 0 else 0.12)
    tp += 0.319
    k += 1
string_note(26.2, D2, 18.0, 0.15, atk=2.8)
string_note(28.8, A2, 15.5, 0.13, atk=2.6, pan=0.15)
string_note(32.8, E4, 11.0, 0.08, atk=3.0, pan=-0.2)
piano(27.9, D4, 0.2, -0.1)
piano(32.3, A3, 0.18, 0.12)
piano(35.9, Fs4, 0.22, -0.08)
piano(39.5, E4, 0.2, 0.1)
for t, f in [(40.0, A3), (41.2, B3), (42.4, Cs4), (43.6, D4)]:
    string_note(t, f, 2.0, 0.12, atk=0.7, rel=1.3, pan=0.1)
piano(40.7, D5, 0.22, 0.15)

riser(43.4, 2.2, 0.5)

# SHIP: peak one
string_note(45.6, D3, 5.8, 0.2, atk=1.0, pan=-0.15)
string_note(45.6, A3, 5.8, 0.16, atk=1.2, pan=0.15)
string_note(46.0, Fs3, 5.4, 0.15, atk=1.4)
string_note(46.6, E4, 4.4, 0.1, atk=1.6, pan=-0.25)
for t, f, v in [(46.2, D5, 0.3), (46.9, A4, 0.26), (47.6, Fs4, 0.24), (48.4, D4, 0.28)]:
    piano(t, f, v, 0.1 - (t - 46.2) * 0.1)
tp = 45.8
k = 0
while tp < 51.0:
    fade = min(1.0, max(0.15, (51.0 - tp) / 2.4))
    pulse(tp, D2 if k % 2 == 0 else A1, 0.17 * fade, -0.12 if k % 2 == 0 else 0.12)
    tp += 0.319
    k += 1

# the student: intimate
string_note(52.6, D2, 13.5, 0.1, atk=3.2)
piano(53.5, Fs4, 0.22, -0.12)
piano(57.0, D4, 0.2, 0.1)
piano(59.9, D5, 0.16, -0.2, tau=1.1)
piano(60.35, E5, 0.15, 0.0, tau=1.1)
piano(60.8, Fs5, 0.16, 0.2, tau=1.1)
piano(64.4, A3, 0.2, 0.05)

# friction: bare
piano(68.4, D2, 0.34, 0.0, tau=3.4)
piano(68.42, D3, 0.22, 0.0, tau=2.8)
piano(70.6, F4, 0.2, 0.1)
string_note(71.4, A2, 2.0, 0.08, atk=1.2)

# grading: warmth returns
string_note(74.2, D3, 10.0, 0.14, atk=1.8, pan=-0.15)
string_note(75.0, Fs3, 9.2, 0.12, atk=2.0, pan=0.15)
string_note(75.8, A3, 8.4, 0.1, atk=2.2)
piano(75.0, D4, 0.24, -0.1)
for t, f in [(78.1, D4), (78.4, Fs4), (78.7, A4), (79.0, D5)]:
    piano(t, f, 0.17, 0.1)
piano(83.0, A4, 0.18, -0.1)

# dark, then the rise
string_note(86.2, D2, 8.6, 0.2, atk=1.5, dark=0.16)
string_note(87.0, F3, 7.8, 0.15, atk=1.8, dark=0.16, pan=-0.2)
string_note(87.8, A2, 7.0, 0.13, atk=2.0, dark=0.16, pan=0.2)
i0 = int(86.1 * SR)
for j in range(int(8.9 * SR)):
    tt = j / SR
    env = min(1.0, tt / 2.0) * min(1.0, max(0.0, (8.9 - tt) / 1.1))
    v = 0.16 * env * math.sin(TAU * D1 * tt)
    add(i0 + j, v, v, 0.0)
riser(88.7, 2.2, 0.62)
string_note(90.6, D3, 4.4, 0.2, atk=1.1, pan=-0.15)
string_note(90.6, A3, 4.4, 0.17, atk=1.2, pan=0.15)
string_note(91.4, D4, 3.6, 0.15, atk=0.9)
string_note(92.2, Fs4, 3.0, 0.12, atk=0.8, pan=-0.2)
timp(90.95, 0.5)
timp(92.85, 0.62)
tp = 90.7
k = 0
while tp < 95.0:
    pulse(tp, D2 if k % 2 == 0 else A1, 0.2, -0.1 if k % 2 == 0 else 0.1)
    tp += 0.2394
    k += 1

# resolve: D major at rest
string_note(96.3, D3, 9.4, 0.15, atk=2.2, pan=-0.1)
string_note(96.9, Fs3, 8.6, 0.12, atk=2.4, pan=0.15)
string_note(97.5, A3, 7.8, 0.1, atk=2.6)
string_note(98.3, D4, 6.8, 0.08, atk=2.8, pan=-0.2)
for t, f, v in [(97.0, D5, 0.24), (97.8, A4, 0.2), (98.7, Fs4, 0.18), (99.6, D4, 0.22)]:
    piano(t, f, v, 0.08)
piano(101.3, A4, 0.14, -0.1)
piano(102.7, D5, 0.13, 0.1)
piano(105.0, D4, 0.15, 0.0, tau=3.2)

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
    fb = [0.83, 0.82, 0.808, 0.795]
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

revL = reverb(send, [1583, 1907, 2053, 2251], [(225, 0.7), (77, 0.7)])
revR = reverb(send, [1637, 1963, 2113, 2309], [(241, 0.7), (83, 0.7)])

for i in range(N):
    dryL[i] += revL[i] * 1.0
    dryR[i] += revR[i] * 1.0

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
