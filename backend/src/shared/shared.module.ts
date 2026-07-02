import { Module } from '@nestjs/common';
import { MailerService } from './services/mailer.service';

/**
 * Module partagé contenant les services réutilisables
 */
@Module({
  providers: [MailerService],
  exports: [MailerService],
})
export class SharedModule {}
