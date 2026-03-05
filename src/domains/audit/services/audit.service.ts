/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable, Logger } from '@nestjs/common';
import { InjectDatabase } from '../../../core/database/decorators';
import { AuditRepository } from '../repositories/audit.repository';
import { CreateAuditLogDto } from '../dto/create-audit.dto';
import { QueryAuditLogsDto } from '../dto/get-audit.dto';
import {
  AuditLogSeverity,
  AuditLogCategory,
  HttpMethod,
} from '@/database/schemas';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectDatabase() private readonly db: any,
    private readonly auditRepo: AuditRepository,
  ) {}

  // ============================================================================
  // CORE LOGGING METHODS
  // ============================================================================

  async log(options: CreateAuditLogDto) {
    try {
      await this.auditRepo.create({
        ...options,
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to log audit event: ${error?.message || error}`,
        error,
      );
    }
  }

  async logAuthEvent(options: {
    userId?: string;
    action: string;
    severity?: AuditLogSeverity | string;
    description?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    requestId?: string;
  }) {
    return this.log({
      ...options,
      category: AuditLogCategory.Authentication,
      severity: (options.severity || AuditLogSeverity.Info) as AuditLogSeverity,
    } as CreateAuditLogDto);
  }

  async logSecurityEvent(options: {
    userId?: string;
    action: string;
    severity?: AuditLogSeverity | string;
    description?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    location?: Record<string, any>;
  }) {
    return this.log({
      ...options,
      category: AuditLogCategory.Security,
      severity: (options.severity ||
        AuditLogSeverity.Warning) as AuditLogSeverity,
    } as CreateAuditLogDto);
  }

  async logApiCall(options: {
    userId?: string;
    httpMethod: HttpMethod | string;
    action: string;
    entityType?: string;
    entityId?: string;
    statusCode: number;
    duration: number;
    description?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
    sessionId?: string;
  }) {
    const severity =
      options.statusCode >= 500
        ? AuditLogSeverity.Error
        : options.statusCode >= 400
          ? AuditLogSeverity.Warning
          : AuditLogSeverity.Info;

    return this.log({
      ...options,
      httpMethod: options.httpMethod as HttpMethod,
      category: AuditLogCategory.API,
      severity,
    } as CreateAuditLogDto);
  }

  async logError(options: {
    userId?: string;
    action: string;
    errorMessage: string;
    category?: AuditLogCategory | string;
    severity?: AuditLogSeverity | string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    stackTrace?: string;
  }) {
    return this.log({
      userId: options.userId,
      category: (options.category ||
        AuditLogCategory.Error) as AuditLogCategory,
      severity: (options.severity ||
        AuditLogSeverity.Error) as AuditLogSeverity,
      action: options.action,
      entityType: options.entityType,
      entityId: options.entityId,
      errorMessage: options.errorMessage,
      metadata: options.metadata
        ? { ...options.metadata, stackTrace: options.stackTrace }
        : { stackTrace: options.stackTrace },
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    } as CreateAuditLogDto);
  }

  async logDataChange(options: {
    userId: string;
    action: 'create' | 'read' | 'update' | 'delete';
    entityType: string;
    entityId: string;
    changes?: Record<string, any>;
    description?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.log({
      userId: options.userId,
      category: options.action.toUpperCase() as AuditLogCategory,
      severity: AuditLogSeverity.Notice,
      action: `data_${options.action}`,
      entityType: options.entityType,
      entityId: options.entityId,
      description:
        options.description ||
        `User ${options.action}d ${options.entityType} (${options.entityId})`,
      metadata: {
        ...options.metadata,
        changes: options.changes,
      },
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    } as CreateAuditLogDto);
  }

  async logPermissionChange(options: {
    userId: string;
    action: string;
    targetUserId?: string;
    roleId?: string;
    permissionId?: string;
    description?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.log({
      userId: options.userId,
      category: AuditLogCategory.Permission,
      severity: AuditLogSeverity.Notice,
      action: options.action,
      entityType: options.targetUserId
        ? 'user'
        : options.roleId
          ? 'role'
          : 'permission',
      entityId:
        options.targetUserId ||
        options.roleId ||
        options.permissionId ||
        options.userId,
      description: options.description || `Permission ${options.action}`,
      metadata: {
        ...options.metadata,
        targetUserId: options.targetUserId,
        roleId: options.roleId,
        permissionId: options.permissionId,
      },
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    } as CreateAuditLogDto);
  }

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  async getUserAuditLogs(
    userId: string,
    options?: Pick<
      QueryAuditLogsDto,
      'startDate' | 'endDate' | 'limit' | 'offset'
    >,
  ) {
    return this.auditRepo.findByUserId(userId, {
      startDate: options?.startDate ? new Date(options.startDate) : undefined,
      endDate: options?.endDate ? new Date(options.endDate) : undefined,
      limit: options?.limit ?? 20,
      offset: options?.offset,
    });
  }

  async getSecurityEvents(options?: Omit<QueryAuditLogsDto, 'category'>) {
    return this.auditRepo.findSecurityEvents({
      startDate: options?.startDate ? new Date(options.startDate) : undefined,
      endDate: options?.endDate ? new Date(options.endDate) : undefined,
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });
  }

  async getErrorLogs(options?: Omit<QueryAuditLogsDto, 'severity'>) {
    return this.auditRepo.findErrors({
      startDate: options?.startDate ? new Date(options.startDate) : undefined,
      endDate: options?.endDate ? new Date(options.endDate) : undefined,
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });
  }

  async getAuditLogsByCategory(
    category: string,
    options?: Omit<QueryAuditLogsDto, 'category'>,
  ) {
    return this.auditRepo.findByCategory(category, {
      startDate: options?.startDate ? new Date(options.startDate) : undefined,
      endDate: options?.endDate ? new Date(options.endDate) : undefined,
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });
  }

  async getAuditLogsByEntity(
    entityType: string,
    entityId: string,
    options?: Pick<QueryAuditLogsDto, 'limit' | 'offset'>,
  ) {
    return this.auditRepo.findByEntity(entityType, entityId, {
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });
  }

  async getAuditLogsByAction(
    action: string,
    options?: Pick<QueryAuditLogsDto, 'limit' | 'offset'>,
  ) {
    return this.auditRepo.findByAction(action, {
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });
  }

  async getAuditLogsByDateRange(
    startDate: Date,
    endDate: Date,
    options?: Pick<QueryAuditLogsDto, 'limit' | 'offset'>,
  ) {
    return this.auditRepo.findByDateRange(startDate, endDate, {
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });
  }

  async getAuditLogsBySeverity(
    severity: string,
    options?: Omit<QueryAuditLogsDto, 'severity'>,
  ) {
    return this.auditRepo.findBySeverity(severity, {
      startDate: options?.startDate ? new Date(options.startDate) : undefined,
      endDate: options?.endDate ? new Date(options.endDate) : undefined,
      limit: options?.limit ?? 20,
      offset: options?.offset ?? 0,
    });
  }

  async getAuditStats(startDate?: Date, endDate?: Date) {
    return this.auditRepo.getAuditStats(startDate, endDate);
  }

  async getStatsByCategory(startDate?: Date, endDate?: Date) {
    return this.auditRepo.getStatsByCategory(startDate, endDate);
  }

  async getStatsBySeverity(startDate?: Date, endDate?: Date) {
    return this.auditRepo.getStatsBySeverity(startDate, endDate);
  }

  async searchLogs(options: {
    searchTerm?: string;
    category?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    return await this.auditRepo.searchLogs(options);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async cleanup(daysToKeep = 90) {
    this.logger.log(
      `Starting audit log cleanup (keeping last ${daysToKeep} days)`,
    );
    const deletedCount = await this.auditRepo.cleanupOldLogs(daysToKeep);
    this.logger.log(
      `Audit log cleanup completed: ${deletedCount} logs deleted`,
    );
    return { deletedCount };
  }

  async archive(options: { beforeDate: Date; batchSize?: number }) {
    this.logger.warn(
      `Archiving not yet implemented. Logs before ${options.beforeDate} need to be archived manually.`,
    );
    return {
      message: 'Archive feature not yet implemented',
      beforeDate: options.beforeDate,
    };
  }

  async export(options: {
    category?: string;
    startDate: Date;
    endDate: Date;
    format?: 'json' | 'csv';
  }) {
    const logs = await this.getAuditLogsByDateRange(
      options.startDate,
      options.endDate,
      { limit: 10000 },
    );

    if (options.format === 'csv') {
      const headers = [
        'id',
        'userId',
        'category',
        'severity',
        'action',
        'entityType',
        'entityId',
        'description',
        'ipAddress',
        'statusCode',
        'duration',
        'createdAt',
      ];
      const csvRows = [
        headers.join(','),
        ...(logs as any[]).map((log) =>
          headers
            .map((header) => {
              const value = log[header];
              if (
                typeof value === 'string' &&
                (value.includes(',') || value.includes('"'))
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value ?? '';
            })
            .join(','),
        ),
      ];
      return csvRows.join('\n');
    }

    return JSON.stringify(logs, null, 2);
  }

  // ============================================================================
  // CONVENIENCE METHODS
  // ============================================================================

  async getAuditLogById(id: string) {
    return this.auditRepo.findOne(id);
  }

  async getUserAuditCount(userId: string) {
    return this.auditRepo.countByUserId(userId);
  }

  async getCategoryCount(category: string) {
    return this.auditRepo.countByCategory(category);
  }

  async getSeverityCount(severity: string) {
    return this.auditRepo.countBySeverity(severity);
  }

  async getTotalErrorCount() {
    return this.auditRepo.countErrors();
  }

  async getRecentLogs(limit = 50) {
    return await this.auditRepo.getRecentLogs(limit);
  }

  async getRecentUserLogs(userId: string, limit = 50) {
    return this.auditRepo.findByUserId(userId, { limit });
  }
}
