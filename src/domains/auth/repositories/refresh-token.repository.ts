/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { eq, and, desc, sql, lt } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { refreshTokens } from '../../../database/schema';
import { BaseRepository, InjectDatabase } from '../../../core/database';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<
  any,
  typeof refreshTokens
> {
  constructor(@InjectDatabase() db: NodePgDatabase<any>) {
    super(db, refreshTokens);
  }

  async findByToken(token: string) {
    return this.findOneByCondition({ token });
  }

  async findActiveByToken(token: string) {
    return this.findOneByCondition({ token, isRevoked: false });
  }

  async findByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.userId, userId))
      .orderBy(desc(refreshTokens.createdAt));
    return result;
  }

  async findActiveByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.isRevoked, false),
        ),
      )
      .orderBy(desc(refreshTokens.createdAt));
    return result;
  }

  async findByDeviceId(deviceId: string) {
    const result = await this.db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.deviceId, deviceId))
      .orderBy(desc(refreshTokens.createdAt));
    return result;
  }

  async findActiveByDeviceId(deviceId: string) {
    const result = await this.db
      .select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.deviceId, deviceId),
          eq(refreshTokens.isRevoked, false),
        ),
      )
      .orderBy(desc(refreshTokens.createdAt));
    return result;
  }

  async findActiveByUserIdAndDeviceId(userId: string, deviceId: string) {
    return this.findOneByCondition({ userId, deviceId, isRevoked: false });
  }

  async revoke(id: string, revokedBy?: string) {
    const result = await this.db
      .update(refreshTokens)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
        updatedAt: new Date(),
        ...(revokedBy && { revokedBy }),
      })
      .where(eq(refreshTokens.id, id))
      .returning();
    return result[0];
  }

  async revokeByDeviceId(deviceId: string) {
    await this.db
      .update(refreshTokens)
      .set({
        isRevoked: true,
        revokedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(refreshTokens.deviceId, deviceId));
  }

  async revokeAllByUserId(userId: string, exceptTokenId?: string) {
    if (exceptTokenId) {
      await this.db
        .update(refreshTokens)
        .set({
          isRevoked: true,
          revokedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(refreshTokens.userId, userId),
            eq(refreshTokens.isRevoked, false),
          ),
        );
    } else {
      await this.db
        .update(refreshTokens)
        .set({
          isRevoked: true,
          revokedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(refreshTokens.userId, userId));
    }
  }

  async deleteExpired() {
    await this.db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, new Date()));
  }

  async countActiveTokens(userId: string) {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.isRevoked, false),
        ),
      );
    return result[0]?.count || 0;
  }

  async cleanupExpiredTokens() {
    await this.db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, new Date()));
  }
}
