import { Controller, Post, Body, Get } from '@nestjs/common';
import { CorrectionService } from './correction.service';

@Controller('correction')
export class CorrectionController {
  constructor(private readonly correctionService: CorrectionService) {}

  @Post()
  async correct(@Body() body: { text: string; lang?: string }) {
    return this.correctionService.correct(body.text, body.lang || 'fr');
  }

  @Get('health')
  async health() {
    return this.correctionService.checkHealth();
  }
}