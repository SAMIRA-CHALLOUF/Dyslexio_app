import { Controller, Post, Body } from '@nestjs/common';
import { CorrectionService } from './correction.service';

@Controller('correction')
export class CorrectionController {
  constructor(private readonly correctionService: CorrectionService) {}

  @Post()
  async correct(@Body() body: { text: string; lang?: string }) {
    return this.correctionService.correct(body.text, body.lang || 'fr');
  }

  @Post('languagetool')
  async checkLanguageTool(@Body() body: { text: string; lang?: string }) {
    return this.correctionService.checkLanguageTool(
      body.text,
      body.lang || 'fr',
    );
  }
}
