"""Synthesize the sound design for each animation style from timeline.json.

Everything is generated (no sample libraries → no licensing issues).
48 kHz / 24-bit stereo WAV, loudness-normalised to -14 LUFS integrated with a
-1 dBFS peak ceiling (streaming/web reference; see README for PA use).
"""
import json
import pathlib

import numpy as np
import pyloudnorm
from scipy.io import wavfile
from scipy.signal import butter, fftconvolve, sosfilt, sosfilt_zi

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / "animation" / "audio"
TL = json.loads((HERE / "timeline.json").read_text())
SR = 48000
RNG = np.random.default_rng(7)


# ---------------------------------------------------------------- primitives
def buf(dur):
    return np.zeros((int(dur * SR), 2))


def tt(dur):
    return np.arange(int(dur * SR)) / SR


def noise(dur, stereo=True):
    return RNG.standard_normal((int(dur * SR), 2 if stereo else 1))


def place(mix, sig, t0, gain=1.0, pan=0.0):
    """Mix mono/stereo sig into mix at time t0 (s); pan -1..1 (mono only)."""
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.stack([sig * l, sig * r], 1) * np.sqrt(2)
    i = int(t0 * SR)
    n = min(len(sig), len(mix) - i)
    if n > 0:
        mix[i:i + n] += sig[:n] * gain


def filt(x, kind, f, order=2):
    f = np.clip(np.atleast_1d(f), 20, SR / 2 - 100)
    sos = butter(order, f if len(f) > 1 else f[0], btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x, axis=0)


def sweep_filter(x, kind, f_start, f_end, q_bw=0.5, block=256):
    """Time-varying band/low-pass (exponential sweep), block-wise with state carry."""
    y = np.zeros_like(x)
    n = len(x)
    zi = None
    for s in range(0, n, block):
        k = s / max(n - 1, 1)
        fc = f_start * (f_end / f_start) ** k
        if kind == "bandpass":
            sos = butter(2, [fc * (1 - q_bw / 2), fc * (1 + q_bw / 2)], btype="bandpass", fs=SR, output="sos")
        else:
            sos = butter(2, min(fc, SR / 2 - 200), btype=kind, fs=SR, output="sos")
        if zi is None:
            zi = np.stack([sosfilt_zi(sos)] * x.shape[1], -1) * 0
        y[s:s + block], zi = sosfilt(sos, x[s:s + block], axis=0, zi=zi)
    return y


def reverb(x, decay=2.0, wet=0.3, predelay=0.012, bright=6000):
    """Synthetic stereo plate: decorrelated exponentially-decaying noise IR."""
    t = tt(decay * 1.5)
    ir = RNG.standard_normal((len(t), 2)) * np.exp(-6.9 * t / decay)[:, None]
    ir = filt(ir, "lowpass", bright)
    ir = np.vstack([np.zeros((int(predelay * SR), 2)), ir])
    ir /= np.sqrt((ir ** 2).sum(0))
    if x.ndim == 1:
        x = np.stack([x, x], 1)
    wet_sig = np.stack([fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)
    return x * (1 - wet) + wet_sig * wet


def adsr(n, a, d_tau, sr=SR):
    t = np.arange(n) / sr
    return np.minimum(t / max(a, 1e-4), 1) * np.exp(-np.maximum(t - a, 0) / d_tau)


def kick(f0=160, f1=42, dur=1.2, pitch_tau=0.045, amp_tau=0.35, drive=1.6):
    t = tt(dur)
    f = f1 + (f0 - f1) * np.exp(-t / pitch_tau)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * adsr(len(t), 0.001, amp_tau)
    click = filt(noise(0.006, False)[:, 0], "highpass", 2500) * np.linspace(1, 0, int(0.006 * SR))
    s[:len(click)] += click * 0.5
    return np.tanh(s * drive) / np.tanh(drive)


def noise_hit(dur=0.6, lo=300, hi=9000, tau=0.12):
    n = filt(noise(dur), "bandpass", [lo, hi])
    return n * adsr(len(n), 0.002, tau)[:, None]


def whoosh(dur, f_start=300, f_end=5000, pan_from=0.0, pan_to=0.0, swell=2.5):
    n = sweep_filter(noise(dur, False), "bandpass", f_start, f_end, 0.8)[:, 0]
    env = np.linspace(0, 1, len(n)) ** swell
    n *= env / (np.abs(n).max() + 1e-9)
    pan = np.linspace(pan_from, pan_to, len(n))
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    return np.stack([n * l, n * r], 1) * np.sqrt(2)


def saw(freq, dur):
    t = tt(dur)
    ph = np.cumsum(np.broadcast_to(freq, t.shape)) / SR
    return 2 * (ph % 1) - 1


def bitcrush(x, hold, bits):
    y = np.repeat(x[::hold], hold, axis=0)[:len(x)]
    q = 2 ** (bits - 1)
    return np.round(y * q) / q


def finish(mix, name):
    # loudness-normalise, then soft-clip anything over the ceiling (a few passes
    # so gain lost to clipping is made back up); final hard guard at the ceiling
    meter = pyloudnorm.Meter(SR)
    ceil = 10 ** (-1 / 20)
    for _ in range(4):
        mix *= 10 ** ((-14.0 - meter.integrated_loudness(mix)) / 20)
        over = np.abs(mix) > ceil * 0.7
        knee = ceil * 0.7
        mix = np.where(over, np.sign(mix) * (knee + (ceil - knee) * np.tanh((np.abs(mix) - knee) / (ceil - knee))), mix)
    mix *= min(1.0, ceil / np.abs(mix).max())
    fade = int(0.08 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
    OUT.mkdir(parents=True, exist_ok=True)
    wavfile.write(OUT / f"{name}.wav", SR, (mix * (2 ** 23 - 1)).astype(np.int32) << 8)
    print(f"{name}: {meter.integrated_loudness(mix):.1f} LUFS, peak {20*np.log10(np.abs(mix).max()):.1f} dBFS")


# ---------------------------------------------------------------- style 1: neon
def neon(cfg):
    mix = buf(cfg["dur"])
    t_imp = cfg["impact"]
    # riser: detuned saws gliding up an octave+fifth through an opening low-pass
    rd = cfg["flicker"][0][0]
    t = tt(rd)
    f = 55 * 2 ** (t / rd * 1.6)
    r = sum(saw(f * d, rd) for d in (1, 1.006, 0.994, 2.003)) / 4
    r = sweep_filter(np.stack([r, r[::-1] * 0 + r], 1), "lowpass", 200, 7000)
    r *= (t / rd)[:, None] ** 1.8
    place(mix, r, 0, 0.35)
    # filtered-noise sweep on top of the riser, drifting across the stereo field
    place(mix, whoosh(rd, 400, 9000, -0.6, 0.6, swell=2.2), 0, 0.25)
    # soft "pen" texture while the tubes draw
    d0, d1 = cfg["bandDraw"][0], cfg["innerDraw"][1]
    scratch = filt(noise(d1 - d0), "bandpass", [2500, 7000]) * 0.5
    scratch *= (0.6 + 0.4 * np.sin(2 * np.pi * 11 * tt(d1 - d0)))[:, None] * np.hanning(len(scratch))[:, None]
    place(mix, scratch, d0, 0.08)
    # neon flicker zaps: 120 Hz buzz + crackle, one per flicker-on window
    for a, b in cfg["flicker"]:
        dur = min(b - a, 0.09) + 0.02
        z = np.sign(np.sin(2 * np.pi * 120 * tt(dur))) * 0.5 + filt(noise(dur, False)[:, 0], "highpass", 3000) * 0.6
        z *= adsr(len(z), 0.001, 0.03)
        place(mix, z, a, 0.35, pan=RNG.uniform(-0.3, 0.3))
    # impact: sub kick + noise body + transformer "clunk"
    hit = np.zeros((int(3 * SR), 2))
    place(hit, kick(170, 40, 1.6, 0.05, 0.5), 0, 1.0)
    place(hit, noise_hit(0.8, 200, 6000, 0.15), 0, 0.45)
    hit = reverb(hit, decay=2.6, wet=0.35)
    place(mix, hit, t_imp, 0.9)
    # sustained neon hum after ignition (60 Hz mains: 120 Hz + harmonics)
    hd = cfg["dur"] - t_imp
    th = tt(hd)
    hum = sum(np.sin(2 * np.pi * 120 * k * th) / k ** 1.3 for k in range(1, 7)) * 0.3
    hum *= (1 - np.exp(-th / 0.05)) * np.exp(-th / 2.2)
    place(mix, hum, t_imp, 0.18)
    finish(mix, "neon")


# ---------------------------------------------------------------- style 2: glitch
def glitch(cfg):
    mix = buf(cfg["dur"])
    start, lock = cfg["start"], cfg["lock"]
    # tape/static bed under the whole unstable section (vinyl-ish crackle + hiss)
    bed_d = lock
    bed = filt(noise(bed_d), "bandpass", [800, 9000]) * 0.3
    crack = (RNG.random((len(bed), 2)) > 0.9993) * RNG.standard_normal((len(bed), 2)) * 3
    bed = (bed + crack) * np.linspace(1, 0.7, len(bed))[:, None]
    bed[:int(start * SR)] *= 1.6
    place(mix, bed, 0, 0.12)
    # data bursts on each glitch event: bit-crushed square chords + noise
    for i, e in enumerate(cfg["events"]):
        dur = RNG.uniform(0.08, 0.18)
        t = tt(dur)
        f = RNG.choice([220, 330, 440, 660, 880, 1320]) * (1 + 0.5 * np.sin(2 * np.pi * RNG.uniform(20, 60) * t))
        sq = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.5 + noise(dur, False)[:, 0] * 0.4
        sq = bitcrush(sq[:, None], RNG.integers(6, 30), RNG.integers(3, 6))[:, 0]
        sq *= adsr(len(sq), 0.001, dur * 0.6)
        place(mix, sq, e, 0.4, pan=RNG.uniform(-0.8, 0.8))
    # tape-stop pitch dive into the lock
    ts_d = 0.35
    t = tt(ts_d)
    f = 400 * (1 - t / ts_d) ** 2 + 30
    ts = np.tanh(3 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * (1 - t / ts_d) ** 0.5
    place(mix, filt(ts, "lowpass", 3000), lock - ts_d, 0.25)
    # lock: 808 sub drop + short digital click + reverb tail
    drop = np.zeros((int(3.2 * SR), 2))
    place(drop, kick(120, 38, 2.6, 0.12, 1.1, drive=2.2), 0, 1.0)
    place(drop, noise_hit(0.2, 2000, 12000, 0.02), 0, 0.5)
    drop = reverb(drop, decay=1.8, wet=0.22)
    place(mix, drop, lock, 1.0)
    # micro glitch blip later on
    b = bitcrush((np.sign(np.sin(2 * np.pi * 1760 * tt(0.06))) * adsr(int(0.06 * SR), 0.001, 0.02))[:, None], 8, 3)[:, 0]
    place(mix, b, cfg["micro"], 0.25, pan=0.5)
    finish(mix, "glitch")


# ---------------------------------------------------------------- style 3: impact
def impact(cfg):
    mix = buf(cfg["dur"])
    h1, h2, boom = cfg["hit1"], cfg["hit2"], cfg["boom"]
    w0, w1 = cfg["wipe"]
    # 1) silhouette: short whoosh into a tight punchy thud
    place(mix, whoosh(0.38, 200, 2500, 0, 0), h1 - 0.38, 0.35)
    place(mix, reverb(kick(140, 55, 0.6, 0.03, 0.18)[:, None].repeat(2, 1), 0.8, 0.2), h1, 0.8)
    # 2) contour slam: reverse-swell into metallic hit
    place(mix, whoosh(0.3, 3000, 400, 0, 0, swell=3), h2 - 0.3, 0.35)
    metal = sum(np.sin(2 * np.pi * f * tt(0.9)) for f in (523, 787, 1193, 1741)) / 4
    metal *= adsr(len(metal), 0.001, 0.12)
    hit2 = np.zeros((int(1.5 * SR), 2))
    place(hit2, kick(180, 50, 0.9, 0.035, 0.25), 0, 0.9)
    place(hit2, metal, 0, 0.35)
    place(hit2, noise_hit(0.4, 1500, 10000, 0.05), 0, 0.3)
    place(mix, reverb(hit2, 1.3, 0.25), h2, 0.85)
    # 3) wipe: swoosh panned left -> right following the light edge
    place(mix, whoosh(w1 - w0 + 0.1, 800, 6000, -0.9, 0.9, swell=0.8) * np.hanning(int((w1 - w0 + 0.1) * SR))[:, None],
          w0 - 0.05, 0.35)
    # 4) boom: riser from the end of the wipe, then layered hit + long tail
    rd = boom - w1
    place(mix, whoosh(rd, 300, 8000, 0, 0, swell=3), w1, 0.4)
    big = np.zeros((int(3.5 * SR), 2))
    place(big, kick(200, 36, 3.0, 0.06, 0.9, drive=2.5), 0, 1.0)
    place(big, noise_hit(1.2, 150, 7000, 0.25), 0, 0.6)
    place(big, metal * 0.8, 0, 0.2)
    big = reverb(big, decay=3.2, wet=0.4)
    place(mix, big, boom, 1.0)
    # sparks: tiny high crackles scattered after the boom
    for _ in range(26):
        t0 = boom + RNG.uniform(0.05, 1.0)
        c = filt(noise(0.012, False)[:, 0], "highpass", 5000) * adsr(int(0.012 * SR), 0.0005, 0.003)
        place(mix, c, t0, RNG.uniform(0.05, 0.15), pan=RNG.uniform(-1, 1))
    finish(mix, "impact")


if __name__ == "__main__":
    s = TL["styles"]
    neon(s["neon"])
    glitch(s["glitch"])
    impact(s["impact"])
