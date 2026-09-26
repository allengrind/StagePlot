"""Extract placeholder footage for the intro demo from the old intro video.

    python3 demo_frames.py /path/to/old-intro.mp4

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


def main(src):
    for name, (ss, dur, w, h, x, y, ow, oh) in CLIPS.items():
        d = OUT / name
        d.mkdir(parents=True, exist_ok=True)
        for f in d.glob("*.jpg"):
            f.unlink()
        subprocess.run([FF, "-y", "-loglevel", "error", "-ss", str(ss), "-t", str(dur), "-i", src,
                        "-vf", f"crop={w}:{h}:{x}:{y},scale={ow}:{oh}:flags=lanczos,fps=30",
                        "-q:v", "3", str(d / "%04d.jpg")], check=True)
        print(name, len(list(d.glob("*.jpg"))), "frames")


if __name__ == "__main__":
    main(sys.argv[1])
