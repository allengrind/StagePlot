// Shared cue sheet for the intro demo (read by index.html and tools/demo_audio.py).
// Beat grid: 100 BPM (0.6 s) from 11.2 s.
window.DEMO = {
  "fps": 30, "dur": 50.0, "bpm": 100, "grid0": 11.2,
  "a1": { "ridge": [1.0, 6.2], "title": [5.4, 7.8], "riser": [8.0, 11.2], "out": 10.5 },
  "a2": {
    "start": 11.0, "clipDur": 2.4,
    "clips": [["arch1", 11.2, "1990", 72], ["arch2", 13.6, "1995", 72], ["arch3", 16.0, "2000", 48],
              ["arch4", 18.4, "2005", 72], ["arch5", 20.8, "2010", 72]],
    "chaos": [23.2, 25.6], "lock": 25.6, "hoy": [25.6, 27.4]
  },
  "a3": {
    "cardDur": 3.6,
    "cards": [["drums", 27.4, "BATERÍA", 78], ["bass", 31.0, "BAJO", 60], ["voice", 34.6, "VOZ", 101]]
  },
  "a4": {
    "start": 38.2, "band": [38.6, 41.2], "inner": [39.0, 41.6],
    "flicker": [[41.8, 41.85], [41.98, 42.02], [42.4, 99]], "boom": 42.4, "end": [49.0, 50.0]
  }
};
