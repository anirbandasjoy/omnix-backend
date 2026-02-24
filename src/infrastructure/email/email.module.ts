import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { EmailService } from './services/email.service';

import { QUEUES } from '../../core/queue/queues.constant';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: QUEUES.EMAIL,
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
