/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { profiles } from '../../../database/schemas';
import { BaseRepository, InjectDatabase } from '../../../core/database';

@Injectable()
export class ProfileRepository extends BaseRepository<any, typeof profiles> {
  constructor(@InjectDatabase() db: NodePgDatabase<any>) {
    super(db, profiles);
  }

  async findByUserId(userId: string) {
    return this.findOneByCondition({ userId });
  }

  async updateByUserId(userId: string, data: any) {
    const result = await this.db
      .update(profiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }

  async updateAvatar(userId: string, avatarId: string) {
    const result = await this.db
      .update(profiles)
      .set({ avatarId, updatedAt: new Date() })
      .where(eq(profiles.userId, userId))
      .returning();
    return result[0];
  }
}
