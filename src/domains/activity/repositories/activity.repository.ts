import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { BaseRepository, InjectDatabase } from '../../../core/database';
import { UserActivities } from '@/database/schemas';

@Injectable()
export class ActivityRepository extends BaseRepository<
  any,
  typeof UserActivities
> {
  constructor(@InjectDatabase() db: NodePgDatabase<any>) {
    super(db, UserActivities);
  }

  async findByUserId(userId: string, limit = 100, offset = 0) {
    return this.db
      .select()
      .from(UserActivities)
      .where(eq(UserActivities.userId, userId))
      .orderBy(UserActivities.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async findByType(type: string, limit = 100, offset = 0) {
    return this.db
      .select()
      .from(UserActivities)
      .where(eq(UserActivities.type, type))
      .orderBy(UserActivities.createdAt)
      .limit(limit)
      .offset(offset);
  }
}
