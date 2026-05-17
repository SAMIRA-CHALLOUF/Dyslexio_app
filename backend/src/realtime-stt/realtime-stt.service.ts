import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { execFile, spawn, ChildProcessWithoutNullStreams } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Socket } from 'socket.io';
import * as readline from 'readline';

interface SttSession {
  headerChunk: Buffer | null;
  chunks: Buffer[];
  interval: NodeJS.Timeout;
  isTranscribing: boolean;
}

interface PendingRequest {
  resolve: (r: { text: string; language: string }) => void;
  reject:  (err: unknown) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistent Whisper process — ONE instance shared across all sessions.
// The model is loaded once; each transcription is a stdin/stdout round-trip.
// ─────────────────────────────────────────────────────────────────────────────
class WhisperProcess {
  private proc!: ChildProcessWithoutNullStreams;
  private queue: PendingRequest[] = [];
  private ready = false;
  private readonly logger = new Logger('WhisperProcess');

  constructor(
    private readonly workerScript: string,
    private readonly language: string | null,
  ) {
    this.spawn();
  }

  private spawn() {
    const args = [
      this.workerScript,
      '--model',  process.env.WHISPER_MODEL  || 'small',
      '--device', process.env.WHISPER_DEVICE || 'cpu',
      '--compute', process.env.WHISPER_COMPUTE || 'int8',
    ];
    if (this.language) args.push('--language', this.language);

    this.proc = spawn(
      process.env.PYTHON_PATH || 'python3',
      args,
      { stdio: ['pipe', 'pipe', 'pipe'] },
    );

    // Read one JSON line per response
    const rl = readline.createInterface({ input: this.proc.stdout });
    rl.on('line', (line) => {
      const pending = this.queue.shift();
      if (!pending) return;
      try {
        const parsed = JSON.parse(line);
        if (parsed.error) pending.reject(parsed.error);
        else              pending.resolve(parsed);
      } catch {
        pending.reject(`Bad JSON from worker: ${line}`);
      }
    });

    this.proc.stderr.on('data', (d: Buffer) => {
      const msg = d.toString();
      if (msg.includes('Model ready')) this.ready = true;
      this.logger.debug(`[worker] ${msg.trim()}`);
    });

    this.proc.on('exit', (code) => {
      this.logger.warn(`Worker exited (${code}). Restarting…`);
      this.ready = false;
      setTimeout(() => this.spawn(), 1000);
    });
  }

  transcribe(filePath: string, language?: string): Promise<{ text: string; language: string }> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
      const req = JSON.stringify({ file: filePath, language: language ?? undefined });
      this.proc.stdin.write(req + '\n');
    });
  }

  kill() { this.proc.kill(); }
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class RealtimeSttService implements OnModuleDestroy {
  private readonly logger = new Logger(RealtimeSttService.name);
  private readonly sessions = new Map<string, SttSession>();
  private transcriptionLanguage: string | null = 'fr';

  // Single persistent worker for all sessions
  private readonly whisper: WhisperProcess;

  constructor() {
    const workerScript = path.resolve(
      process.cwd(), 'src', 'realtime-stt', 'whisper_streaming_worker.py',
    );
    this.whisper = new WhisperProcess(workerScript, this.transcriptionLanguage);
    this.logger.log('RealtimeSttService initialized');
  }

  onModuleDestroy() { this.whisper.kill(); }

  // ── Session lifecycle ──────────────────────────────────────────────────────

  handleConnection(client: Socket) {
    const interval = setInterval(() => this.processChunks(client), 2000);
    this.sessions.set(client.id, { headerChunk: null, chunks: [], interval, isTranscribing: false });
    this.logger.log(`STT session started: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const session = this.sessions.get(client.id);
    if (session) {
      clearInterval(session.interval);
      this.sessions.delete(client.id);
      this.logger.log(`STT session ended: ${client.id}`);
    }
  }

  addAudioChunk(client: Socket, chunk: Buffer) {
    const session = this.sessions.get(client.id);
    if (!session) return;
    if (!session.headerChunk) session.headerChunk = chunk;
    session.chunks.push(chunk);
  }

  setLanguage(lang: string) {
    this.transcriptionLanguage = lang;
    this.logger.log(`Language set to: ${lang}`);
  }

  // ── Processing ─────────────────────────────────────────────────────────────

  async processChunks(client: Socket) {
    const session = this.sessions.get(client.id);
    if (!session || session.chunks.length === 0 || session.isTranscribing) return;

    session.isTranscribing = true;

    const isFirstBatch = session.headerChunk === session.chunks[0];
    const chunksToProcess = isFirstBatch
      ? [...session.chunks]
      : [session.headerChunk!, ...session.chunks];

    const audioBuffer = Buffer.concat(chunksToProcess);
    session.chunks = [];

    const tempWavPath = path.join(os.tmpdir(), `stt_${client.id}_${Date.now()}.wav`);

    try {
      // Pipe WebM buffer directly into FFmpeg stdin — no temp .webm file needed
      await this.convertWithFfmpeg(audioBuffer, tempWavPath);
      const result = await this.whisper.transcribe(tempWavPath, this.transcriptionLanguage ?? undefined);

      if (result.text) client.emit('transcription', { text: result.text });
    } catch (error) {
      this.logger.error(`Transcription error [${client.id}]: ${error}`);
      client.emit('server_error', 'Transcription failed');
    } finally {
      session.isTranscribing = false;
      fs.unlink(tempWavPath, () => {});
    }
  }

  // Accepts a Buffer and pipes it to ffmpeg stdin → no intermediate .webm file
  private convertWithFfmpeg(input: Buffer, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-y',
        '-fflags', '+discardcorrupt',
        '-f', 'webm',
        '-i', 'pipe:0',          // read from stdin
        '-ar', '16000',
        '-ac', '1',
        '-f', 'wav',
        outputPath,
      ]);

      let stderr = '';
      ff.stderr.on('data', (d: Buffer) => (stderr += d.toString()));
      ff.on('close', (code) => (code === 0 ? resolve() : reject(`FFmpeg: ${stderr}`)));
      ff.on('error', reject);

      ff.stdin.write(input);
      ff.stdin.end();
    });
  }
}