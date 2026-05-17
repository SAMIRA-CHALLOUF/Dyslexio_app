import sys, io, time
import numpy as np
from faster_whisper import WhisperModel

sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

MODEL_SIZE    = "medium"
LANGUAGE      = None
SAMPLE_RATE   = 16000
CHUNK_SECONDS = 5
BEAM_SIZE     = 3

BYTES_PER_SAMPLE  = 2                              # int16
CHUNK_BYTES       = SAMPLE_RATE * CHUNK_SECONDS * BYTES_PER_SAMPLE

print("Loading model...", file=sys.stderr, flush=True)
model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
print("Model ready.", file=sys.stderr, flush=True)

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

            max_val = np.max(np.abs(audio))
            if max_val < 0.01:
                print("[silence]", flush=True)
                continue

            t0 = time.time()
            segments, info = model.transcribe(
                audio,
                beam_size=BEAM_SIZE,
                language=LANGUAGE,
                vad_filter=True,
                vad_parameters=dict(min_silence_duration_ms=300),
            )
            text    = " ".join(s.text.strip() for s in segments).strip()
            elapsed = time.time() - t0

            if text:
                print(f"[{info.language.upper()}] ({elapsed:.1f}s) 👉  {text}", flush=True)
            else:
                print("[no speech detected]", flush=True)

    except Exception as e:
        print(f"[ERROR] {e}", file=sys.stderr, flush=True)
        break