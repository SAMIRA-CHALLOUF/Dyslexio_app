import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

@Injectable()
export class SttService {
  private readonly logger = new Logger(SttService.name);

  async transcribe(filePath: string, language?: string): Promise<string> {
    this.logger.log(`Starting transcription for ${filePath}`);

    const scriptPath = path.join(process.cwd(), 'src', 'stt', 'transcribe_oneshot.py');
    const supportedLanguages = ['fr', 'en', 'es', 'de', 'ar', 'it'];
    const lang = language || 'fr';

    // Valider la langue
    if (!supportedLanguages.includes(lang)) {
      this.logger.warn(`Unsupported language requested: ${lang}, falling back to 'fr'`);
    }

    let outputFilePath: string | null = null;

    try {
      const { stdout } = await execFileAsync(
        process.env.PYTHON_PATH || 'python',
        [scriptPath, '--file', filePath, '--language', lang],
        { maxBuffer: 1024 * 1024 * 50 }, // 50MB buffer
      );

      const text = stdout.trim();
      if (!text) {
        throw new Error('Empty transcription result from Python script');
      }

      this.logger.log(`Transcription completed: ${text.substring(0, 100)}...`);
      return text;
    } catch (error: any) {
      this.logger.error('Transcription failed', {
        filePath,
        language: lang,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorCode: error?.code,
      });

      throw new InternalServerErrorException(
        'Audio transcription failed. Please try again with a valid audio file.',
      );
    } finally {
      // Cleanup: properly delete temporary files
      if (filePath) {
        try {
          await fs.unlink(filePath);
          this.logger.debug(`Deleted temporary file: ${filePath}`);
        } catch (cleanupError: any) {
          // Log but don't fail if cleanup fails
          this.logger.warn(`Failed to delete temporary file ${filePath}`, {
            error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
          });
        }
      }
    }
  }
}