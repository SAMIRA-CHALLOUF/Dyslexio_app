import { Module } from '@nestjs/common';
import { RealtimeSttGateway } from './realtime-stt.gateway';
import { RealtimeSttService } from './realtime-stt.service';

@Module({
  providers: [RealtimeSttGateway, RealtimeSttService],
  exports:   [RealtimeSttService],
})
export class RealtimeSttModule {}