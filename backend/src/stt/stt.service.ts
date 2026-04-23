import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { WaveFile } from 'wavefile';

// Import de Transformers.js (100% local, pas de code C++ sur Windows)
import { env, pipeline } from '@xenova/transformers';

// Configuration 100% locale :
// L'IA tourne directement sur votre processeur (pas d'API cloud).
// Le modèle sera sauvegardé dans le dossier "models" de votre backend.
// Lors du premier lancement, il téléchargera les poids du modèle (environ 50 Mo), ensuite il sera 100% hors-ligne.
env.localModelPath = path.join(process.cwd(), 'models');
env.allowLocalModels = true;
// Vous pouvez passer env.allowRemoteModels à false une fois le modèle téléchargé.
env.allowRemoteModels = true;

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class SttService {
  private readonly logger = new Logger(SttService.name);
  private transcriber: any = null;

  constructor() {
    this.initTranscriber();
  }

  // Chargement du modèle en cache
  private async initTranscriber() {
    this.logger.log('Chargement du modèle Whisper (ONNX CPU)...');
    try {
      this.transcriber = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-small', // Modèle beaucoup plus performant pour les langues étrangères que "tiny"
        {
          quantized: true, // true limite la RAM, false augmente la précision mais prend 1 Go de RAM
        },
      );
      this.logger.log('Modèle Whisper 100% local chargé !');
    } catch (e) {
      this.logger.error('Erreur chargement modèle:', e);
    }
  }

  async transcribe(filePath: string, language?: string): Promise<string> {
    const wavPath = filePath + '-converted.wav';

    try {
      if (!this.transcriber) {
        throw new Error('Modèle IA non chargé');
      }

      this.logger.log(`Conversion de ${filePath} en WAV 16kHz...`);
      await new Promise((resolve, reject) => {
        ffmpeg(filePath)
          .toFormat('wav')
          .audioFrequency(16000)
          .audioChannels(1)
          .on('end', resolve)
          .on('error', reject)
          .save(wavPath);
      });

      this.logger.log(
        `Début de la transcription Transformers.js pour ${wavPath}`,
      );

      const wavBuffer = fs.readFileSync(wavPath);
      const wav = new WaveFile(wavBuffer);
      wav.toBitDepth('32f');
      wav.toSampleRate(16000);
      let audioData: any = wav.getSamples();
      
      if (Array.isArray(audioData)) {
        if (audioData.length > 0) {
          audioData = audioData[0]; // mono
        }
      }
      // Guarantee Float32Array
      if (audioData instanceof Float64Array) {
        audioData = new Float32Array(audioData);
      } else if (!(audioData instanceof Float32Array)) {
        audioData = new Float32Array(audioData);
      }

      const transcribeOptions: any = {
        chunk_length_s: 30,
        stride_length_s: 5,
        task: 'transcribe',
      };

      // Pour maximiser la justesse du texte :
      transcribeOptions.return_timestamps = false;
      // transcribeOptions.beam_size = 5; // Optionnel : Décommentez pour un résultat encore plus précis, mais 5x plus lent

      if (language) {
        // Map 2-letter codes to full languages for Whisper just to be safe
        const langMap: { [key: string]: string } = {
          'fr': 'french',
          'en': 'english',
          'es': 'spanish',
          'it': 'italian',
          'de': 'german',
          'ar': 'arabic'
        };
        const mappedLang = langMap[language.toLowerCase()] || language;
        this.logger.log(`Langue STT demandée : ${language}, assignée à Whisper : ${mappedLang}`);
        transcribeOptions.language = mappedLang;
      } else {
        this.logger.log('Aucune langue STT reçue, Whisper détectera automatiquement.');
      }

      const transcript = await this.transcriber(audioData, transcribeOptions);

      const fullText = transcript?.text || '';
      this.logger.log(`Transcription terminée : ${fullText}`);

      return fullText;
    } catch (error) {
      if (error instanceof Error) {
        this.logger.error(
          `Erreur de transcription : ${error.message}`,
          error.stack,
        );
        return 'Erreur lors de la transcription : ' + error.message;
      }
      return 'Erreur lors de la transcription';
    } finally {
      [filePath, wavPath].forEach((file) => {
        if (fs.existsSync(file)) {
          try {
            fs.unlinkSync(file);
          } catch (e) {}
        }
      });
    }
  }
}
