/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { devices } from '../../../database/schema';
import { BaseRepository, InjectDatabase } from '../../../core/database';

@Injectable()
export class DeviceRepository extends BaseRepository<any, typeof devices> {
  constructor(@InjectDatabase() db: NodePgDatabase<any>) {
    super(db, devices);
  }

  async findByUserId(userId: string) {
    const result = await this.db
      .select()
      .from(devices)
      .where(eq(devices.userId, userId))
      .orderBy(desc(devices.lastSeen));
    return result;
  }

  async findByUserIdAndFingerprint(userId: string, fingerprint: string) {
    return this.findOneByCondition({ userId, fingerprint });
  }

  async findTrustedDevices(userId: string) {
    const result = await this.db
      .select()
      .from(devices)
      .where(and(eq(devices.userId, userId), eq(devices.isTrusted, true)))
      .orderBy(desc(devices.lastSeen));
    return result;
  }

  async updateLastSeen(id: string) {
    const result = await this.db
      .update(devices)
      .set({ lastSeen: new Date(), updatedAt: new Date() })
      .where(eq(devices.id, id))
      .returning();
    return result[0];
  }

  async setTrusted(id: string, isTrusted: boolean = true) {
    const result = await this.db
      .update(devices)
      .set({ isTrusted, updatedAt: new Date() })
      .where(eq(devices.id, id))
      .returning();
    return result[0];
  }

  async revokeDevice(id: string) {
    await this.db.delete(devices).where(eq(devices.id, id));
  }

  async revokeAllDevices(userId: string) {
    await this.db.delete(devices).where(eq(devices.userId, userId));
  }

  async existsByFingerprint(userId: string, fingerprint: string) {
    return this.exists({ userId, fingerprint });
  }
}
