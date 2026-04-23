/* ROLE DU FICHIER: Service generant la synthese vocale via l appel aux modeles locaux Piper/ONNX. */

import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';

// Définition des chemins absolus pointant vers le dossier contenant le moteur d'inférence vocal Piper
const PIPER_DIR = path.join(process.cwd(), 'piper');
const PIPER_EXE = path.join(PIPER_DIR, 'piper.exe');

// Dictionnaire associant chaque langue à son modèle linguistique binaire pré-entraîné (.onnx)
const VOICE_MODELS: Record<string, string> = {
  en: path.join(PIPER_DIR, 'models', 'en_US-lessac-medium.onnx'),
  fr: path.join(PIPER_DIR, 'models', 'fr_FR-upmc-medium.onnx'),
  it: path.join(PIPER_DIR, 'models', 'it_IT-riccardo-x_low.onnx'),
  es: path.join(PIPER_DIR, 'models', 'es_ES-sharvard-medium.onnx'),
  de: path.join(PIPER_DIR, 'models', 'de_DE-thorsten-high.onnx'),
};

// Interface définissant le contrat de données (payload) envoyé par le front-end
export interface TtsOptions {
  text: string;
  lang?: string;
  speed?: number; // 0.5 – 2.0  (Utilisé pour moduler le paramètre --length_scale de Piper)
  pitch?: number; // 0.5 – 2.0  (Utilisé comme proxy pour le paramètre --noise_scale de Piper)
  volume?: number; // 0.1 – 2.0  (Non actif actuellement, nécessiterait Post-Processing via l'utilitaire SoX)
}

@Injectable()
export class TtsService {
  /**
   * Fonction orchestrant la synthèse vocale en créant un processus enfant (spawn).
   * @param opts Les options de synthèse (texte, langue, vitesse, etc.)
   * @returns Un flux binaire (Buffer) représentant le fichier audio .wav généré
   */
  async synthesize(opts: TtsOptions): Promise<Buffer> {
    const { text, lang = 'en', speed = 1.0, pitch = 1.0 } = opts;

    if (!text || text.trim() === '') {
      throw new BadRequestException(
        'Aucun texte fourni pour la synthèse vocale.',
      );
    }

    const model = VOICE_MODELS[lang] ?? VOICE_MODELS['en'];

    // Sécurisation : on vérifie que l'exécutable et le modèle existent bien physiquement sur le disque
    if (!fs.existsSync(PIPER_EXE)) {
      throw new InternalServerErrorException(
        "L'exécutable moteur vocal Piper est introuvable.",
      );
    }
    if (!fs.existsSync(model)) {
      throw new InternalServerErrorException(
        `Modèle vocal manquant pour la langue : ${lang}`,
      );
    }

    // Génération d'un nom de fichier temporaire unique pour éviter les collisions si plusieurs utilisateurs génèrent du son en même temps
    const uniqueId = crypto.randomUUID();
    const outputFile = path.join(process.cwd(), `tts_${uniqueId}.wav`);

    // ── Mapping mathématique des arguments mathématiques Piper ──
    // --length_scale : Contrôle le débit de parole. Les valeurs > 1 ralentissent, < 1 accélèrent (l'inverse logique de 'speed')
    // --noise_scale  : Contrôle la variation/expressivité vocale et de l'intonation (Limité entre 0.0 et 1.0)
    const lengthScale = (1.0 / Math.max(0.1, speed)).toFixed(2); // ex: speed=2 → length_scale=0.50
    const noiseScale = Math.min(1.0, Math.max(0.0, pitch - 0.5)).toFixed(2); // normalise la valeur entre 0.5–2 vers 0–1

    const args = [
      '-m',
      model,
      '--output_file',
      outputFile,
      '--length_scale',
      lengthScale,
      '--noise_scale',
      noiseScale,
    ];

    return new Promise((resolve, reject) => {
      // Démarrage du processus exécutable Piper indépendant (sans bloquer le thread principal Node.js)
      const piper = spawn(PIPER_EXE, args, { cwd: PIPER_DIR });

      // Injection du texte à lire directement dans l'entrée standard (stdin) du programme externe
      piper.stdin.write(text);
      piper.stdin.end();

      // Écoute et log de la sortie d'erreur (stderr) souvent utilisée par les binaires CLI pour logger leur progression
      piper.stderr.on('data', (d) => console.log('[Piper CLI]', d.toString()));

      // Écouteur d'évènement déclenché quand le processus binaire se termine
      piper.on('close', (code) => {
        if (code !== 0 || !fs.existsSync(outputFile)) {
          return reject(
            new InternalServerErrorException(
              'Échec critique de la synthèse Piper.',
            ),
          );
        }

        // Lecture du fichier audio temporairement créé sur le disque dur vers la mémoire vive (RAM)
        const buffer = fs.readFileSync(outputFile);
        // Nettoyage immédiat du fichier temporaire pour éviter la saturation de l'espace disque du serveur (Garbage collection asynchrone)
        fs.unlink(outputFile, () => {});

        resolve(buffer); // Renvoie du fichier binaire directement en mémoire
      });

      // Intercepte les cas où NodeJS ne peut même pas démarrer l'application (Droits NTFS manquants, antivirus bloquant, etc)
      piper.on('error', (err) => {
        reject(
          new InternalServerErrorException(
            `Impossible de lancer le processus Piper : ${err.message}`,
          ),
        );
      });
    });
  }
}
