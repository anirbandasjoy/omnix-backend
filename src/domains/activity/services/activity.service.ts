/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Injectable } from '@nestjs/common';
import { lt } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { InjectDatabase } from '../../../core/database/decorators';
import { ActivityType } from '../../../core/enums';
import { ActivityRepository } from '../repositories/activity.repository';
import { UserActivities } from '@/database/schemas';

interface LogActivityOptions {
  userId?: string;
  type: ActivityType | string;
  action: string;
  description?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class ActivityService {
  constructor(
    @InjectDatabase() private readonly db: NodePgDatabase<any>,
    private readonly activityRepo: ActivityRepository,
  ) {}

  async log(options: LogActivityOptions) {
    await this.activityRepo.create({
      userId: options.userId || null,
      type: options.type as string,
      action: options.action,
      description: options.description,
      metadata: options.metadata ? JSON.stringify(options.metadata) : null,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
    });
  }

  async getUserActivities(
    userId: string,
    options?: { limit?: number; offset?: number; type?: ActivityType },
  ) {
    return this.activityRepo.findByUserId(
      userId,
      options?.limit || 100,
      options?.offset || 0,
    );
  }

  async getRecentActivities(limit = 50) {
    return this.db
      .select()
      .from(UserActivities)
      .orderBy(UserActivities.createdAt)
      .limit(limit);
  }

  async getActivityById(id: string) {
    return this.activityRepo.findOne(id);
  }

  async getUserActivityCount(userId: string) {
    return this.activityRepo.count({ userId });
  }

  async getActivitiesByType(type: ActivityType, limit = 100) {
    return this.activityRepo.findByType(type, limit, 0);
  }

  async cleanupOldActivities(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Use lt for date comparison
    await this.db
      .delete(UserActivities)
      .where(lt(UserActivities.createdAt, cutoffDate));
  }
}
