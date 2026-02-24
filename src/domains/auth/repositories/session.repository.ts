import { Injectable } from '@nestjs/common';
import { eq, and, desc, sql, lt } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sessions } from '../../../database/schema';
import { BaseRepository, InjectDatabase } from '../../../core/database';

type Session = typeof sessions.$inferSelect;

@Injectable()
export class SessionRepository extends BaseRepository<any, typeof sessions> {
  constructor(@InjectDatabase() db: NodePgDatabase<any>) {
    super(db, sessions);
  }

  async findByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.lastActivity));
    return result;
  }

  async findActiveByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.userId, userId), eq(sessions.isActive, true)))
      .orderBy(desc(sessions.lastActivity));
    return result;
  }

  async findByDeviceId(deviceId: string) {
    const result = await this.db
      .select()
      .from(sessions)
      .where(eq(sessions.deviceId, deviceId))
      .orderBy(desc(sessions.lastActivity));
    return result;
  }

  async findActiveByDeviceId(deviceId: string) {
    const result = await this.db
      .select()
      .from(sessions)
      .where(and(eq(sessions.deviceId, deviceId), eq(sessions.isActive, true)))
      .orderBy(desc(sessions.lastActivity));
    return result;
  }

  async findByToken(token: string): Promise<Session | null> {
    return this.findOneByCondition({ token }) as Promise<Session | null>;
  }

  async findActiveByToken(token: string): Promise<Session | null> {
    return this.findOneByCondition({
      token,
      isActive: true,
    }) as Promise<Session | null>;
  }

  async updateLastActivity(id: string) {
    const result = await this.db
      .update(sessions)
      .set({ lastActivity: new Date(), updatedAt: new Date() })
      .where(eq(sessions.id, id))
      .returning();
    return result[0];
  }

  async deactivateByDeviceId(deviceId: string) {
    await this.db
      .update(sessions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(sessions.deviceId, deviceId));
  }

  async deactivateByUserId(userId: string, exceptSessionId?: string) {
    if (exceptSessionId) {
      await this.db
        .update(sessions)
        .set({ isActive: false, updatedAt: new Date() })
        .where(and(eq(sessions.userId, userId), eq(sessions.isActive, true)));
    } else {
      await this.db
        .update(sessions)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(sessions.userId, userId));
    }
  }

  async deactivate(id: string) {
    const result = await this.db
      .update(sessions)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(sessions.id, id))
      .returning();
    return result[0];
  }

  async deleteExpired() {
    await this.db
      .delete(sessions)
      .where(
        and(eq(sessions.isActive, true), lt(sessions.expiresAt, new Date())),
      );
  }

  async cleanupExpiredSessions() {
    await this.db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
  }

  async countActiveSessions(userId: string) {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(sessions)
      .where(and(eq(sessions.userId, userId), eq(sessions.isActive, true)));
    return result[0]?.count || 0;
  }
}
