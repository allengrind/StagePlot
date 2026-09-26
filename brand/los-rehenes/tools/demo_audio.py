"""Temp score + sound design for the intro demo, driven by intro-demo/timeline.js.

This is a placeholder to sell the idea of picture/sound sync; the real
intro will be cut to the new music. Reuses the synth primitives in audio.py.
"""
import json
import pathlib

import numpy as np

import audio as A
from audio import SR, adsr, buf, filt, kick, noise, noise_hit, place, reverb, saw, tt, whoosh, bitcrush

ROOT = pathlib.Path(__file__).resolve().parent.parent / "intro-demo"
src = (ROOT / "timeline.js").read_text()
D = json.loads(src[src.index("{"):src.rindex("}") + 1])
A.OUT = ROOT / "audio"
RNG = np.random.default_rng(11)
BEAT = 60 / D["bpm"]


def pad_chord(freqs, dur, cutoff=900, attack=1.5):
    t = tt(dur)
    s = sum(saw(f * d, dur) for f in freqs for d in (0.997, 1.003)) / (2 * len(freqs))
    s = np.stack([s, np.roll(s, 300)], 1)
    s = filt(s, "lowpass", cutoff)
    env = np.minimum(t / attack, 1) * np.minimum((dur - t) / 1.0, 1)
    return s * env[:, None]


def hat(open_=False):
    d = 0.25 if open_ else 0.05
    n = filt(noise(d, False)[:, 0], "highpass", 7000)
    return n * adsr(len(n), 0.001, 0.08 if open_ else 0.015)


def snare():
    d = 0.3
    body = np.sin(2 * np.pi * 190 * tt(d)) * adsr(int(d * SR), 0.001, 0.05)
    n = filt(noise(d, False)[:, 0], "bandpass", [1500, 8000]) * adsr(int(d * SR), 0.001, 0.09)
    return body * 0.5 + n * 0.8


def main():
    mix = buf(D["dur"])
    a1, a2, a3, a4 = D["a1"], D["a2"], D["a3"], D["a4"]
    Dm = [73.42, 110.0, 146.83, 174.61]      # D2 A2 D3 F3
    Bb = [58.27, 116.54, 146.83, 174.61]     # Bb1 Bb2 D3 F3

    # ---- ACT 1: dark pad + star shimmer + riser into act 2
    place(mix, reverb(pad_chord(Dm, a2["start"] + 0.4, 700, 3.0), 3.0, 0.35), 0, 0.5)
    for _ in range(28):                                            # twinkles
        t0 = RNG.uniform(0.8, 10)
        f = RNG.choice([1174.7, 1396.9, 1760.0, 2349.3, 2793.8])
        p = np.sin(2 * np.pi * f * tt(1.2)) * adsr(int(1.2 * SR), 0.005, 0.35)
        place(mix, reverb(p[:, None].repeat(2, 1), 2.5, 0.6), t0, 0.05, 0)
    ridge_d = a1["ridge"][1] - a1["ridge"][0]                      # neon trace hum
    hum = np.sin(2 * np.pi * 110 * tt(ridge_d)) * 0.5 + filt(noise(ridge_d, False)[:, 0], "bandpass", [2000, 5000]) * 0.2
    hum *= np.hanning(len(hum))
    place(mix, hum, a1["ridge"][0], 0.08)
    place(mix, reverb(noise_hit(0.6, 300, 4000, 0.3), 2.5, 0.5), a1["title"][0], 0.25)   # soft title hit
    r0, r1 = a1["riser"]
    place(mix, whoosh(r1 - r0, 300, 9000, -0.5, 0.5, 2.5), r0, 0.35)
    place(mix, whoosh(0.6, 500, 6000, 0, 0, 1.0) * np.hanning(int(0.6 * SR))[:, None], a1["out"], 0.2)

    # ---- ACT 2: beat at 100 BPM, glitch on clip changes, chaos, tape stop, sub drop
    g0, lock = D["grid0"], a2["lock"]
    n_beats = int(round((lock - g0) / BEAT))
    for i in range(n_beats):
        t0 = g0 + i * BEAT
        chaos = t0 >= a2["chaos"][0]
        place(mix, kick(150, 48, 0.5, 0.03, 0.16), t0, 0.55)
        if i % 2 == 1:
            place(mix, reverb(snare()[:, None].repeat(2, 1), 0.9, 0.2), t0, 0.35)
        for k in range(2 if not chaos else 4):
            place(mix, hat(), t0 + k * BEAT / (2 if not chaos else 4), 0.18, pan=0.3)
    # bass line under act 2 (D, D, Bb, C per clip)
    roots = [36.71, 36.71, 29.14, 32.70, 36.71]
    for (name, s, *_), f in zip(a2["clips"], roots):
        t = tt(a2["clipDur"])
        b = np.tanh(2 * np.sin(2 * np.pi * f * 2 * t)) * adsr(len(t), 0.01, 1.2)
        place(mix, filt(b, "lowpass", 400), s, 0.35)
        # VHS glitch burst on every clip change
        d = 0.16
        sq = np.sign(np.sin(2 * np.pi * RNG.choice([440, 660, 880]) * tt(d))) * 0.5 + noise(d, False)[:, 0] * 0.5
        sq = bitcrush(sq[:, None], 12, 4)[:, 0] * adsr(int(d * SR), 0.001, 0.06)
        place(mix, sq, s, 0.3, pan=RNG.uniform(-0.6, 0.6))
    c0, c1 = a2["chaos"]
    chaos = filt(noise(c1 - c0), "bandpass", [600, 9000]) * np.linspace(0.2, 1, int((c1 - c0) * SR))[:, None] ** 2
    chaos = bitcrush(chaos, 6, 5)
    place(mix, chaos, c0, 0.18)
    for _ in range(10):
        t0 = RNG.uniform(c0, c1 - 0.1)
        d = RNG.uniform(0.04, 0.1)
        z = bitcrush((np.sign(np.sin(2 * np.pi * RNG.uniform(200, 2000) * tt(d))) * adsr(int(d * SR), 0.001, d / 2))[:, None], 8, 3)[:, 0]
        place(mix, z, t0, 0.25, pan=RNG.uniform(-0.9, 0.9))
    ts = 0.4
    t = tt(ts)
    f = 300 * (1 - t / ts) ** 2 + 25
    place(mix, filt(np.tanh(3 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * (1 - t / ts) ** 0.5, "lowpass", 2500), lock - ts, 0.25)
    drop = np.zeros((int(3 * SR), 2))
    place(drop, kick(120, 36, 2.6, 0.12, 1.0, drive=2.2), 0, 1.0)
    place(drop, noise_hit(0.25, 2000, 12000, 0.03), 0, 0.5)
    place(mix, reverb(drop, 2.0, 0.25), lock, 0.95)

    # ---- ACT 3: driving pulse + big hit on each member card
    cards = a3["cards"]
    end3 = cards[-1][1] + a3["cardDur"]
    place(mix, reverb(pad_chord(Bb, end3 - cards[0][1], 1400, 0.3), 2.0, 0.25), cards[0][1], 0.3)
    t = cards[0][1] + BEAT
    while t < end3 - 0.05:
        place(mix, kick(140, 50, 0.4, 0.025, 0.12), t, 0.45)
        place(mix, hat(True), t + BEAT / 2, 0.12, pan=-0.3)
        t += BEAT
    for name, s, *_ in cards:
        place(mix, whoosh(0.35, 3000, 400, 0, 0, 3), s - 0.35, 0.3)
        hit = np.zeros((int(2 * SR), 2))
        place(hit, kick(190, 45, 1.2, 0.04, 0.3, drive=2.0), 0, 1.0)
        metal = sum(np.sin(2 * np.pi * f * tt(0.8)) for f in (523, 787, 1193, 1741)) / 4 * adsr(int(0.8 * SR), 0.001, 0.1)
        place(hit, metal, 0, 0.3)
        place(hit, noise_hit(0.5, 800, 10000, 0.08), 0, 0.4)
        place(mix, reverb(hit, 1.6, 0.3), s, 0.9)

    # ---- ACT 4: neon riser, flicker zaps, boom, hum, tail
    s4, boom = a4["start"], a4["boom"]
    rd = boom - s4
    t = tt(rd)
    fr = 55 * 2 ** (t / rd * 1.6)
    r = sum(saw(fr * d, rd) for d in (1, 1.006, 0.994, 2.003)) / 4
    r = A.sweep_filter(np.stack([r, r], 1), "lowpass", 200, 7000) * (t / rd)[:, None] ** 1.8
    place(mix, r, s4, 0.35)
    place(mix, whoosh(rd, 400, 9000, -0.6, 0.6, 2.2), s4, 0.25)
    for a, b in a4["flicker"]:
        d = min(b - a, 0.09) + 0.02
        z = np.sign(np.sin(2 * np.pi * 120 * tt(d))) * 0.5 + filt(noise(d, False)[:, 0], "highpass", 3000) * 0.6
        place(mix, z * adsr(len(z), 0.001, 0.03), a, 0.35)
    big = np.zeros((int(4 * SR), 2))
    place(big, kick(200, 34, 3.2, 0.06, 1.0, drive=2.5), 0, 1.0)
    place(big, noise_hit(1.2, 150, 7000, 0.25), 0, 0.6)
    big = reverb(big, 3.4, 0.4)
    place(mix, big, boom, 1.0)
    place(mix, reverb(pad_chord(Dm + [220.0], D["dur"] - boom, 2200, 0.05), 3.5, 0.4), boom, 0.35)
    for _ in range(26):
        c = filt(noise(0.012, False)[:, 0], "highpass", 5000) * adsr(int(0.012 * SR), 0.0005, 0.003)
        place(mix, c, boom + RNG.uniform(0.05, 1.0), RNG.uniform(0.05, 0.15), pan=RNG.uniform(-1, 1))
    e0, e1 = a4["end"]
    fade = np.ones(len(mix))
    i0, i1 = int(e0 * SR), int(e1 * SR)
    fade[i0:i1] = np.linspace(1, 0, i1 - i0)
    fade[i1:] = 0
    mix *= fade[:, None]
    A.finish(mix, "demo")


if __name__ == "__main__":
    main()
