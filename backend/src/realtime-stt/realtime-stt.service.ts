/**
 * @file realtime-stt.service.ts
 * Transcription en temps réel via AssemblyAI Streaming STT (WebSocket).
 * Remplace Whisper local — aucune installation Python requise.
 *
 * Clé API : ASSEMBLYAI_API_KEY dans .env
 * Docs    : https://www.assemblyai.com/docs/speech-to-text/streaming
 */

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Socket } from 'socket.io';
import WebSocket, { RawData } from 'ws';

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY || '';
const ASSEMBLYAI_WS_URL  = 'wss://streaming.assemblyai.com/v3/ws'; // v3 API
const SAMPLE_RATE        = 16000; // Hz — AssemblyAI exige 16 kHz PCM 16-bit

interface SttSession {
  aaiWs:          WebSocket | null;   // connexion WebSocket vers AssemblyAI
  language:       string;             // langue de la session
  reconnecting:   boolean;
  closed:         boolean;
}

// ─────────────────────────────────────────────────────────────────────────────

@Injectable()
export class RealtimeSttService implements OnModuleDestroy {
  private readonly logger   = new Logger(RealtimeSttService.name);
  private readonly sessions = new Map<string, SttSession>();
  private globalLanguage    = 'fr';

  constructor() {
    if (!ASSEMBLYAI_API_KEY) {
      this.logger.warn(
        '⚠️  ASSEMBLYAI_API_KEY manquante — la transcription ne fonctionnera pas. ' +
        'Ajoutez-la dans .env puis relancez le serveur.',
      );
    }
    this.logger.log('RealtimeSttService (AssemblyAI) initialisé');
  }

  onModuleDestroy() {
    // Ferme toutes les sessions proprement à l'arrêt du module
    for (const [id, session] of this.sessions) {
      session.closed = true;
      session.aaiWs?.close();
      this.sessions.delete(id);
    }
  }

  // ── Session lifecycle ──────────────────────────────────────────────────────

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté : ${client.id}`);
    const session: SttSession = {
      aaiWs:        null,
      language:     this.globalLanguage,
      reconnecting: false,
      closed:       false,
    };
    this.sessions.set(client.id, session);
    this.openAaiSocket(client, session);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté : ${client.id}`);
    const session = this.sessions.get(client.id);
    if (session) {
      session.closed = true;
      session.aaiWs?.close();
      this.sessions.delete(client.id);
    }
  }

  // ── Audio chunk (PCM 16-bit 16 kHz, envoyé par le frontend) ───────────────

  addAudioChunk(client: Socket, chunk: Buffer) {
    const session = this.sessions.get(client.id);
    if (!session || session.closed) return;

    const ws = session.aaiWs;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;

    // Log pour debug — à retirer après
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    this.logger.debug(`[${client.id}] chunk reçu: ${buf.length} bytes, type: ${typeof chunk}, isBuffer: ${Buffer.isBuffer(chunk)}`);

    // Envoi binaire brut vers AssemblyAI
    ws.send(buf, { binary: true });
  }

  // ── Changement de langue ───────────────────────────────────────────────────

  setLanguage(lang: string) {
    this.globalLanguage = lang;
    this.logger.log(`Langue globale → ${lang}`);

    // Redémarre les connexions ouvertes avec la nouvelle langue
    for (const [, session] of this.sessions) {
      session.language = lang;
    }
  }

  // ── Ouverture du WebSocket AssemblyAI ─────────────────────────────────────

  private openAaiSocket(client: Socket, session: SttSession) {
    if (session.closed) return;

    const params = new URLSearchParams({
      sample_rate:   String(SAMPLE_RATE),
      language_code: this.mapLanguage(session.language),
      speech_model:  'universal-streaming-multilingual', // supporte fr, ar, es, it, de...
    });

    const url = `${ASSEMBLYAI_WS_URL}?${params.toString()}`;
    this.logger.debug(`Connexion AssemblyAI : ${url}`);

    let ws: WebSocket;
    try {
      ws = new WebSocket(url, { headers: { Authorization: ASSEMBLYAI_API_KEY } });
    } catch (err) {
      this.logger.error(`Impossible d'ouvrir le WebSocket AssemblyAI : ${err}`);
      client.emit('server_error', 'STT service unavailable');
      return;
    }

    session.aaiWs = ws;

    // ── Événements WebSocket ────────────────────────────────────────────────

    ws.on('open', () => {
      this.logger.log(`[${client.id}] AssemblyAI WS ouvert`);
      session.reconnecting = false;
    });

    ws.on('message', (raw: RawData) => {
      try {
        const msg = JSON.parse(raw.toString());

        // v3 : message de début de session
        if (msg.type === 'Begin') {
          this.logger.log(`[${client.id}] Session AssemblyAI démarrée : ${msg.id}`);
        }

        // v3 : événement Turn — partiel ou final selon end_of_turn
        if (msg.type === 'Turn' && msg.transcript) {
          if (msg.end_of_turn) {
            // Transcript final (fin de phrase détectée)
            client.emit('transcription', { text: msg.transcript });
          } else {
            // Transcript partiel (en cours de dictée)
            client.emit('transcription_partial', { text: msg.transcript });
          }
        }

        // v3 : fin de session
        if (msg.type === 'Termination') {
          this.logger.log(`[${client.id}] Session terminée — durée audio : ${msg.audio_duration_seconds}s`);
        }

        // Erreur remontée par AssemblyAI
        if (msg.error) {
          this.logger.error(`[${client.id}] Erreur AssemblyAI : ${msg.error}`);
          client.emit('server_error', msg.error);
        }
      } catch {
        // message non-JSON ignoré
      }
    });

    ws.on('error', (err) => {
      this.logger.error(`[${client.id}] WS error : ${err.message}`);
    });

    ws.on('close', (code, reason) => {
      this.logger.warn(`[${client.id}] WS fermé (code ${code}) : ${reason}`);
      if (!session.closed && !session.reconnecting) {
        session.reconnecting = true;
        setTimeout(() => this.openAaiSocket(client, session), 2000);
      }
    });
  }

  // ── Mapping langue ─────────────────────────────────────────────────────────
  // AssemblyAI accepte des codes BCP-47 (ex: "fr", "en", "ar", "it", "es", "de")

  private mapLanguage(lang: string): string {
    const map: Record<string, string> = {
      fr: 'fr',
      en: 'en',
      ar: 'ar',
      it: 'it',
      es: 'es',
      de: 'de',
    };
    return map[lang] ?? 'fr';
  }
}