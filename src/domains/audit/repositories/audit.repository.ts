import { Injectable, Logger } from '@nestjs/common';
import { eq, and, gte, lte, sql, desc, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { AuditLogs } from '../../../database/schemas';
import { BaseRepository, InjectDatabase } from '../../../core/database';
import { QueryAuditLogsDto } from '../dto/get-audit.dto';

type QueryOptions = Pick<QueryAuditLogsDto, 'limit' | 'offset'> & {
  startDate?: Date;
  endDate?: Date;
};

@Injectable()
export class AuditRepository extends BaseRepository<any, typeof AuditLogs> {
  private readonly logger = new Logger(AuditRepository.name);

  constructor(@InjectDatabase() db: NodePgDatabase<any>) {
    super(db, AuditLogs);
  }

  async findByUserId(userId: string, options?: QueryOptions) {
    const conditions = [eq(AuditLogs.userId, userId)];

    if (options?.startDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} >= ${options.startDate.toISOString()}`,
      );
    }

    if (options?.endDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} <= ${options.endDate.toISOString()}`,
      );
    }

    let query = this.db
      .select()
      .from(AuditLogs)
      .where(and(...conditions))
      .orderBy(desc(AuditLogs.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as any;
    }

    return query;
  }

  async findByCategory(category: string, options?: QueryOptions) {
    const conditions = [eq(AuditLogs.category, category as any)];

    if (options?.startDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} >= ${options.startDate.toISOString()}`,
      );
    }

    if (options?.endDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} <= ${options.endDate.toISOString()}`,
      );
    }

    let query = this.db
      .select()
      .from(AuditLogs)
      .where(and(...conditions))
      .orderBy(desc(AuditLogs.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as any;
    }

    return query;
  }

  async findBySeverity(severity: string, options?: QueryOptions) {
    const conditions = [eq(AuditLogs.severity, severity as any)];

    if (options?.startDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} >= ${options.startDate.toISOString()}`,
      );
    }

    if (options?.endDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} <= ${options.endDate.toISOString()}`,
      );
    }

    let query = this.db
      .select()
      .from(AuditLogs)
      .where(and(...conditions))
      .orderBy(desc(AuditLogs.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as any;
    }

    return query;
  }

  async findByAction(
    action: string,
    options?: Pick<QueryAuditLogsDto, 'limit' | 'offset'>,
  ) {
    let query = this.db
      .select()
      .from(AuditLogs)
      .where(eq(AuditLogs.action, action))
      .orderBy(desc(AuditLogs.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as any;
    }

    return query;
  }

  async findByEntity(
    entityType: string,
    entityId: string,
    options?: Pick<QueryAuditLogsDto, 'limit' | 'offset'>,
  ) {
    let query = this.db
      .select()
      .from(AuditLogs)
      .where(
        and(
          eq(AuditLogs.entityType, entityType),
          eq(AuditLogs.entityId, entityId),
        ),
      )
      .orderBy(desc(AuditLogs.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as any;
    }

    return query;
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: Pick<QueryAuditLogsDto, 'limit' | 'offset'>,
  ) {
    let query = this.db
      .select()
      .from(AuditLogs)
      .where(
        and(
          sql`${AuditLogs.createdAt} >= ${startDate.toISOString()}`,
          sql`${AuditLogs.createdAt} <= ${endDate.toISOString()}`,
        ),
      )
      .orderBy(desc(AuditLogs.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as any;
    }

    return query;
  }

  async findSecurityEvents(options?: QueryOptions) {
    const conditions = [eq(AuditLogs.category, 'security' as any)];

    if (options?.startDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} >= ${options.startDate.toISOString()}`,
      );
    }

    if (options?.endDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} <= ${options.endDate.toISOString()}`,
      );
    }

    let query = this.db
      .select()
      .from(AuditLogs)
      .where(and(...conditions))
      .orderBy(desc(AuditLogs.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as any;
    }

    return query;
  }

  async findErrors(options?: QueryOptions) {
    const errorSeverities = ['error', 'critical', 'emergency', 'alert'];
    const conditions = [
      sql`${AuditLogs.severity} = ANY(${errorSeverities})`,
    ] as SQL[];

    if (options?.startDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} >= ${options.startDate.toISOString()}`,
      );
    }

    if (options?.endDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} <= ${options.endDate.toISOString()}`,
      );
    }

    let query = this.db
      .select()
      .from(AuditLogs)
      .where(and(...conditions))
      .orderBy(desc(AuditLogs.createdAt));

    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as any;
    }

    return query;
  }

  async getAuditStats(startDate?: Date, endDate?: Date) {
    const conditions: SQL[] = [];

    if (startDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} >= ${startDate.toISOString()}`,
      );
    }

    if (endDate) {
      conditions.push(sql`${AuditLogs.createdAt} <= ${endDate.toISOString()}`);
    }

    let query = this.db
      .select({
        totalLogs: sql<number>`count(*)::int`,
        errorCount: sql<number>`count(*) FILTER (WHERE severity IN ('error', 'critical', 'emergency', 'alert'))::int`,
        uniqueUsers: sql<number>`count(DISTINCT user_id)::int`,
        avgDuration: sql<number>`AVG(duration)::int`,
      })
      .from(AuditLogs);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query;
    return result[0];
  }

  async getStatsByCategory(startDate?: Date, endDate?: Date) {
    const conditions: SQL[] = [];

    if (startDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} >= ${startDate.toISOString()}`,
      );
    }

    if (endDate) {
      conditions.push(sql`${AuditLogs.createdAt} <= ${endDate.toISOString()}`);
    }

    let query = this.db
      .select({
        category: AuditLogs.category,
        count: sql<number>`count(*)::int`,
      })
      .from(AuditLogs)
      .groupBy(AuditLogs.category)
      .orderBy(desc(sql`count(*)::int`));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query;
  }

  async getStatsBySeverity(startDate?: Date, endDate?: Date) {
    const conditions: SQL[] = [];

    if (startDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} >= ${startDate.toISOString()}`,
      );
    }

    if (endDate) {
      conditions.push(sql`${AuditLogs.createdAt} <= ${endDate.toISOString()}`);
    }

    let query = this.db
      .select({
        severity: AuditLogs.severity,
        count: sql<number>`count(*)::int`,
      })
      .from(AuditLogs)
      .groupBy(AuditLogs.severity)
      .orderBy(desc(sql`count(*)::int`));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query;
  }

  async cleanupOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.db
      .delete(AuditLogs)
      .where(sql`${AuditLogs.createdAt} <= ${cutoffDate.toISOString()}`)
      .returning({ deletedId: AuditLogs.id });

    this.logger.log(
      `Cleaned up ${result.length} old audit logs (older than ${daysToKeep} days)`,
    );

    return result.length;
  }

  async countByUserId(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(AuditLogs)
      .where(eq(AuditLogs.userId, userId));

    return result[0]?.count ?? 0;
  }

  async countByCategory(category: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(AuditLogs)
      .where(eq(AuditLogs.category, category as any));

    return result[0]?.count ?? 0;
  }

  async countBySeverity(severity: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(AuditLogs)
      .where(eq(AuditLogs.severity, severity as any));

    return result[0]?.count ?? 0;
  }

  async countErrors(): Promise<number> {
    const errorSeverities = ['error', 'critical', 'emergency', 'alert'];
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(AuditLogs)
      .where(sql`${AuditLogs.severity} = ANY(${errorSeverities})`);

    return result[0]?.count ?? 0;
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
    const conditions: SQL[] = [];

    if (options.category) {
      conditions.push(eq(AuditLogs.category, options.category as any));
    }

    if (options.severity) {
      conditions.push(eq(AuditLogs.severity, options.severity as any));
    }

    if (options.startDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} >= ${options.startDate.toISOString()}`,
      );
    }

    if (options.endDate) {
      conditions.push(
        sql`${AuditLogs.createdAt} <= ${options.endDate.toISOString()}`,
      );
    }

    if (options.searchTerm) {
      conditions.push(
        sql`${AuditLogs.description} ILIKE ${'%' + options.searchTerm + '%'}`,
      );
    }

    let query = this.db
      .select()
      .from(AuditLogs)
      .orderBy(desc(AuditLogs.createdAt));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    if (options.limit) {
      query = query.limit(options.limit) as any;
    }

    if (options.offset) {
      query = query.offset(options.offset) as any;
    }

    return query;
  }

  async getRecentLogs(limit = 50) {
    return this.db
      .select()
      .from(AuditLogs)
      .orderBy(desc(AuditLogs.createdAt))
      .limit(limit);
  }
}
