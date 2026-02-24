import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { activities } from '../../../database/schema';
import { BaseRepository, InjectDatabase } from '../../../core/database';

@Injectable()
export class ActivityRepository extends BaseRepository<any, typeof activities> {
  constructor(@InjectDatabase() db: NodePgDatabase<any>) {
    super(db, activities);
  }

  async findByUserId(userId: string, limit = 100, offset = 0) {
    return this.db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(activities.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async findByType(type: string, limit = 100, offset = 0) {
    return this.db
      .select()
      .from(activities)
      .where(eq(activities.type, type))
      .orderBy(activities.createdAt)
      .limit(limit)
      .offset(offset);
  }
}
