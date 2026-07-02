#!/usr/bin/env python3
"""
whisper_worker.py  ─  Persistent daemon (stdin → stdout)
─────────────────────────────────────────────────────────
Spawned ONCE by RealtimeSttService. The model is loaded a single time,
then the process waits for file paths on stdin and returns JSON on stdout.

Protocol
  stdin  : one JSON line per request  →  {"file": "/tmp/stt_xxx.wav"}
  stdout : one JSON line per response →  {"text": "...", "language": "fr"}
           OR                             {"error": "message"}
"""

import argparse
import json
import sys
import warnings
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", line_buffering=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", line_buffering=True)
warnings.filterwarnings("ignore")

HALLUCINATIONS = {
    "merci", "merci.", "merci!", "thanks", "thank you",
    "sous-titres réalisés para la communauté d'amara.org",
    "sous-titres réalisés par la communauté d'amara.org",
}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model",    default="small")
    parser.add_argument("--device",   default="cpu")
    parser.add_argument("--compute",  default="int8")
    parser.add_argument("--language", default=None)
    args = parser.parse_args()

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.stderr.write("faster-whisper not installed. Run: pip install faster-whisper\n")
        sys.exit(1)

    # ── Load model ONCE ───────────────────────────────────────────────────────
    sys.stderr.write(f"[whisper_worker] Loading model '{args.model}' on {args.device}…\n")
    model = WhisperModel(args.model, device=args.device, compute_type=args.compute)
    sys.stderr.write("[whisper_worker] Model ready. Waiting for requests…\n")

    # ── Main loop: one request per stdin line ─────────────────────────────────
    for raw in sys.stdin:
        raw = raw.strip()
        if not raw:
            continue

        try:
            req = json.loads(raw)
            file_path = req["file"]
            language  = req.get("language", args.language)
        except (json.JSONDecodeError, KeyError) as e:
            _reply({"error": f"bad request: {e}"})
            continue

        try:
            segments, info = model.transcribe(
                file_path,
                beam_size=5,
                language=language,
                vad_filter=True,
                vad_parameters={"min_silence_duration_ms": 300, "speech_pad_ms": 200},
            )

            parts = [
                seg.text.strip()
                for seg in segments
                if seg.text.strip().lower() not in HALLUCINATIONS
            ]
            _reply({"text": " ".join(parts).strip(), "language": info.language or "xx"})

        except Exception as exc:
            _reply({"error": str(exc)})


def _reply(obj: dict) -> None:
    sys.stdout.write(json.dumps(obj, ensure_ascii=False) + "\n")
    sys.stdout.flush()


if __name__ == "__main__":
    main()