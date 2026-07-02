import argparse
import sys
import warnings
import os

os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

warnings.filterwarnings("ignore")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--file", required=True)
    parser.add_argument("--language", default="fr")
    parser.add_argument("--model", default="small")
    args = parser.parse_args()

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.stderr.write("faster-whisper not installed.\n")
        sys.exit(1)

    try:
        model = WhisperModel(args.model, device="cpu", compute_type="default")
        
        segments, _ = model.transcribe(
            args.file,
            language=args.language,
            beam_size=5,
            vad_filter=True
        )

        texts = []
        for seg in segments:
            texts.append(seg.text.strip())
            
        print(" ".join(texts))
    except Exception as e:
        sys.stderr.write(f"Error: {str(e)}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()