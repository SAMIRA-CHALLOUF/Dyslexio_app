#!/usr/bin/env python3
"""
whisper-stream.py
─────────────────
Reads raw PCM (int16, 16 kHz, mono) from stdin in fixed-size chunks and
transcribes each one with faster-whisper.

Pipe audio to it:
  ffmpeg -f avfoundation -i ":0" -ar 16000 -ac 1 -f s16le - | python3 whisper-stream.py
"""

import io
import sys
import time

import numpy as np
from faster_whisper import WhisperModel

sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# ── Config ────────────────────────────────────────────────────────────────────
MODEL_SIZE    = "base"    # use "base" for CPU; "medium" is slow without a GPU
LANGUAGE      = None      # None = auto-detect; set e.g. "fr" to force French
SAMPLE_RATE   = 16_000
CHUNK_SECONDS = 5
BEAM_SIZE     = 3

# Silence gate — raise if your mic is noisy, lower in a quiet environment
SILENCE_THRESHOLD = 0.02

BYTES_PER_SAMPLE = 2                                   # int16
CHUNK_BYTES      = SAMPLE_RATE * CHUNK_SECONDS * BYTES_PER_SAMPLE

# ── Load model ────────────────────────────────────────────────────────────────
print("Loading model...", file=sys.stderr, flush=True)
model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
print("Model ready — listening.", file=sys.stderr, flush=True)

# ── Main loop ─────────────────────────────────────────────────────────────────
buffer = b""

while True:
    try:
        chunk = sys.stdin.buffer.read(4096)
        if not chunk:
            break
        buffer += chunk

        while len(buffer) >= CHUNK_BYTES:
            pcm_bytes = buffer[:CHUNK_BYTES]
            buffer    = buffer[CHUNK_BYTES:]

            audio = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0

            if np.max(np.abs(audio)) < SILENCE_THRESHOLD:
                print("[silence]", flush=True)
                continue

            t0 = time.time()
            segments, info = model.transcribe(
                audio,
                beam_size=BEAM_SIZE,
                language=LANGUAGE,
                vad_filter=True,
                vad_parameters={"min_silence_duration_ms": 300},
                condition_on_previous_text=False,
            )
            text    = " ".join(s.text.strip() for s in segments).strip()
            elapsed = time.time() - t0

            if text:
                print(f"[{info.language.upper()}] ({elapsed:.1f}s) 👉  {text}", flush=True)
            else:
                print("[no speech detected]", flush=True)

    except KeyboardInterrupt:
        print("\nStopped.", file=sys.stderr)
        break
    except Exception as exc:
        print(f"[ERROR] {exc}", file=sys.stderr, flush=True)
        break