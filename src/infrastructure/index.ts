import { Module } from '@nestjs/common';
import { StorageModule } from './storage';
import { EmailModule } from './email';

@Module({
  imports: [StorageModule, EmailModule],
  exports: [StorageModule, EmailModule],
})
export class InfrastructureModule {}
