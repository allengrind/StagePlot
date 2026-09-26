"""Extract placeholder footage for the intro demo from the old intro video.

    python3 demo_frames.py /path/to/old-intro.mp4              # 50 s demo clips
    python3 demo_frames.py /path/to/old-intro.mp4 animatic     # animatic archive clips

The old video has the previous logo burned into the lower-right corner, so
every clip is cropped above it (y + h <= 440 in the 1024x576 source) and
inside any letterbox bars.
Frames land in ../intro-demo/frames/<clip>/NNNN.jpg (git-ignored: derived
from third-party material, regenerate locally).
"""
import pathlib
import subprocess
import sys

import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
OUT = pathlib.Path(__file__).resolve().parent.parent / "intro-demo" / "frames"

# name: (start s, dur s, crop w, crop h, crop x, crop y, out w, out h)
CLIPS = {
    # Act 2 — archive (4:3 inside a CRT frame)
    "arch1": (54.7, 2.8, 552, 414, 40, 0, 960, 720),
    "arch2": (64.6, 2.5, 552, 414, 180, 0, 960, 720),
    "arch3": (34.95, 2.6, 552, 414, 300, 0, 960, 720),
    "arch4": (161.9, 2.7, 552, 414, 120, 0, 960, 720),
    "arch5": (168.2, 2.7, 552, 414, 160, 0, 960, 720),
    # Act 3 — "the band today" (full frame 16:9)
    "drums": (134.05, 2.55, 664, 374, 40, 66, 1920, 1080),
    "bass":  (146.35, 2.0, 658, 370, 200, 70, 1920, 1080),
    "voice": (157.1, 3.35, 672, 378, 170, 62, 1920, 1080),
}


def arch(ss, dur, y0=0, dx=0):
    """4:3 crop inside letterbox bars, never below y=440 (burned-in logo)."""
    h = min(440 - y0, 414)
    w = h * 4 // 3 // 2 * 2
    return (ss, dur, w, h // 2 * 2, (1024 - w) // 2 + dx, y0, 960, 720)


# Animatic archive reel (Act 2), in playback order
ANIMATIC = {
    "c01": arch(34.95, 1.6, 0, 60), "c02": arch(146.4, 2.0, 70, 100), "c03": arch(50.5, 1.9, 0, 200),
    "c04": arch(54.7, 2.8, 0, -200), "c05": arch(60.5, 2.3, 0, -120), "c06": arch(64.6, 2.5),
    "c07": arch(99.6, 1.1), "c08": arch(121.45, 1.9, 62, 80), "c09": arch(126.1, 1.9, 70, 150),
    "c10": arch(149.5, 2.9, 64, 150), "c11": arch(158.0, 2.4, 76, -200), "c12": arch(161.9, 2.7),
    "c13": arch(168.2, 2.7), "c14": arch(177.6, 3.8, 58, 60),
}


def main(src, clips=CLIPS):
    for name, (ss, dur, w, h, x, y, ow, oh) in clips.items():
        d = OUT / name
        d.mkdir(parents=True, exist_ok=True)
        for f in d.glob("*.jpg"):
            f.unlink()
        subprocess.run([FF, "-y", "-loglevel", "error", "-ss", str(ss), "-t", str(dur), "-i", src,
                        "-vf", f"crop={w}:{h}:{x}:{y},scale={ow}:{oh}:flags=lanczos,fps=30",
                        "-q:v", "3", str(d / "%04d.jpg")], check=True)
        print(name, len(list(d.glob("*.jpg"))), "frames")


if __name__ == "__main__":
    main(sys.argv[1], ANIMATIC if sys.argv[2:] == ["animatic"] else CLIPS)
