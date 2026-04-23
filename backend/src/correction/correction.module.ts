import { Module } from '@nestjs/common';
import { CorrectionController } from './correction.controller';
import { CorrectionService } from './correction.service';

@Module({
  controllers: [CorrectionController],
  providers: [CorrectionService],
})
export class CorrectionModule {}
