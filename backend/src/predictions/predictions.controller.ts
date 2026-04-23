import { Controller, Post, Body } from '@nestjs/common';
import { PredictionsService } from './predictions.service';

@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Post()
  async getPredictions(@Body() body: { fullText: string; lang?: string }) {
    return this.predictionsService.getPredictions(body.fullText, body.lang);
  }
}
