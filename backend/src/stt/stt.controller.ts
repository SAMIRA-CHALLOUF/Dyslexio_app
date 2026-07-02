import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SttService } from './stt.service';

@Controller('stt')
export class SttController {
  constructor(private readonly sttService: SttService) {}

  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(
            null,
            file.fieldname + '-' + uniqueSuffix + extname(file.originalname),
          );
        },
      }),
    }),
  )
  async transcribeAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body('language') language?: string,
  ) {
    if (!file) {
      return { error: 'Aucun fichier fourni' };
    }
    const text = await this.sttService.transcribe(file.path, language);
    return { text };
  }
}
