/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { eq, desc, or, ilike, sql, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { users, identities } from '../../../database/schema';
import { BaseRepository, InjectDatabase } from '../../../core/database';

@Injectable()
export class UserRepository extends BaseRepository<any, typeof users> {
  constructor(@InjectDatabase() db: NodePgDatabase<any>) {
    super(db, users);
  }

  async findById(id: string) {
    return this.findOne(id);
  }

  async findByEmailOrPhone(identifier: string) {
    const result = await this.db
      .select({ user: users })
      .from(identities)
      .innerJoin(users, eq(identities.userId, users.id))
      .where(eq(identities.providerId, identifier))
      .limit(1);
    return result[0]?.user || null;
  }

  async findActiveUsers(limit = 100, offset = 0) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.status, true))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
    return result;
  }

  async findDeletedUsers(limit = 100, offset = 0) {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.isDeleted, true))
      .orderBy(desc(users.deletedAt))
      .limit(limit)
      .offset(offset);
    return result;
  }

  async softDelete(id: string, deletedBy?: string) {
    await this.db
      .update(users)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        status: false,
      })
      .where(eq(users.id, id));
  }

  async recover(id: string) {
    await this.db
      .update(users)
      .set({
        isDeleted: false,
        deletedAt: null,
        recoveredAt: new Date(),
        status: true,
      })
      .where(eq(users.id, id));
  }

  async updateStatus(id: string, status: boolean) {
    const result = await this.db
      .update(users)
      .set({ status })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateEmailVerification(id: string, emailVerified: boolean) {
    const result = await this.db
      .update(users)
      .set({ emailVerified })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updatePhoneVerification(id: string, phoneVerified: boolean) {
    const result = await this.db
      .update(users)
      .set({ phoneVerified })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async terminate(id: string) {
    await this.db.delete(users).where(eq(users.id, id));
  }

  /**
   * Find paginated users with optional search, sort, and filter
   */
  async findPaginated(
    skip: number,
    limit: number,
    search?: string,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
  ): Promise<{
    data: any[];
    total: number;
  }> {
    // Build where condition for search
    const whereCondition = search
      ? or(
          ilike(users.id, `%${search}%`),
          // Add more searchable fields if needed
        )
      : undefined;

    // Get total count
    const [{ value: total }] = await this.db
      .select({ value: count() })
      .from(users)
      .where(whereCondition);

    // Determine sort column
    const sortColumn =
      sortBy === 'createdAt'
        ? users.createdAt
        : sortBy === 'updatedAt'
          ? users.updatedAt
          : users.createdAt;

    // Get paginated data
    const orderBy = sortOrder === 'asc' ? sortColumn : desc(sortColumn);

    const data = await this.db
      .select()
      .from(users)
      .where(whereCondition)
      .orderBy(orderBy)
      .limit(limit)
      .offset(skip);

    return {
      data,
      total: Number(total),
    };
  }
}
