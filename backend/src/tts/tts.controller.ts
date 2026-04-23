import { Controller, Post, Body, Res, HttpCode } from '@nestjs/common';
import express from 'express';
import { TtsService } from './tts.service';
import * as ttsService from './tts.service';

@Controller('tts')
export class TtsController {
  constructor(private readonly ttsService: TtsService) {}

  @Post()
  @HttpCode(200)
  async synthesize(
    @Body() body: ttsService.TtsOptions,
    @Res() res: express.Response,
  ) {
    const buffer = await this.ttsService.synthesize(body);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(buffer);
  }
}
