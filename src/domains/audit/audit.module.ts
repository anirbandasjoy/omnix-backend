import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../core/database';
import { CacheModule } from '../../core/cache';
import { AuditService } from './services/audit.service';
import { AuditRepository } from './repositories/audit.repository';

@Module({
  imports: [DatabaseModule, CacheModule],
  providers: [AuditService, AuditRepository],
  exports: [AuditService, AuditRepository],
})
export class AuditModule {}
