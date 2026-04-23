import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EleveService } from './eleve.service';
import { EleveController } from './eleve.controller';
import { Eleve } from './eleve.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Eleve])],
  controllers: [EleveController],
  providers: [EleveService],
})
export class EleveModule {}