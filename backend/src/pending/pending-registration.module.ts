import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PendingRegistration } from './pending-registration.entity';
import { PendingRegistrationService } from './pending-registration.service';

@Module({
  imports: [TypeOrmModule.forFeature([PendingRegistration])],
  providers: [PendingRegistrationService],
  exports: [PendingRegistrationService],
})
export class PendingRegistrationModule {}
