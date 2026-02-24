/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Injectable } from '@nestjs/common';
import { eq, and, sql, SQL } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { PgTable } from 'drizzle-orm/pg-core';
import { GenericSchema, BaseRepository as IBaseRepository } from '../../shared';

type QueryOptions = {
  limit?: number;
  offset?: number;
};

@Injectable()
export abstract class BaseRepository<
  TSchema extends GenericSchema,
  TTable extends PgTable<any>,
> implements IBaseRepository<TSchema> {
  constructor(
    protected readonly db: NodePgDatabase<any>,
    protected readonly table: TTable,
  ) {}

  async findOne(id: string): Promise<TSchema | null> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any).id, id))
      .limit(1);
    return (result[0] as TSchema) || null;
  }

  async findOneByCondition(
    condition: Record<string, unknown>,
  ): Promise<TSchema | null> {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(condition)) {
      if (value !== undefined && value !== null) {
        conditions.push(eq((this.table as any)[key], value));
      }
    }

    if (conditions.length === 0) {
      return null;
    }

    const result = await this.db
      .select()
      .from(this.table)
      .where(and(...conditions))
      .limit(1);
    return (result[0] as TSchema) || null;
  }

  async findMany(options?: QueryOptions): Promise<TSchema[]> {
    let query = this.db.select().from(this.table);

    if (options?.limit) {
      query = query.limit(options.limit) as any;
    }
    if (options?.offset) {
      query = query.offset(options.offset) as any;
    }

    return (await query) as TSchema[];
  }

  async create(data: Record<string, unknown>): Promise<TSchema> {
    const result = await this.db
      .insert(this.table)
      .values(data as any)
      .returning();
    return result[0] as TSchema;
  }

  async update(id: string, data: Record<string, unknown>): Promise<TSchema> {
    const result = await this.db
      .update(this.table)
      .set({ ...data, updatedAt: new Date() } as any)
      .where(eq((this.table as any).id, id))
      .returning();
    return result[0] as TSchema;
  }

  async updateByCondition(
    condition: Record<string, unknown>,
    data: Record<string, unknown>,
  ): Promise<void> {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(condition)) {
      if (value !== undefined && value !== null) {
        conditions.push(eq((this.table as any)[key], value));
      }
    }

    if (conditions.length > 0) {
      await this.db
        .update(this.table)
        .set({ ...data, updatedAt: new Date() } as any)
        .where(and(...conditions));
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(this.table).where(eq((this.table as any).id, id));
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(this.table)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      } as Record<string, unknown>)
      .where(eq((this.table as any).id, id));
  }

  async exists(condition: Record<string, unknown>): Promise<boolean> {
    const conditions: SQL[] = [];
    for (const [key, value] of Object.entries(condition)) {
      if (value !== undefined && value !== null) {
        conditions.push(eq((this.table as any)[key], value));
      }
    }

    if (conditions.length === 0) {
      return false;
    }

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(this.table)
      .where(and(...conditions));
    return (result[0]?.count ?? 0) > 0;
  }

  async count(condition?: Record<string, unknown>): Promise<number> {
    let query = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(this.table);

    if (condition) {
      const conditions: SQL[] = [];
      for (const [key, value] of Object.entries(condition)) {
        if (value !== undefined && value !== null) {
          conditions.push(eq((this.table as any)[key], value));
        }
      }

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
    }

    const result = await query;
    return result[0]?.count ?? 0;
  }

  async transaction<T>(
    callback: (trx: NodePgDatabase<any>) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(callback);
  }
}
