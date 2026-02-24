import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../database/schema';

@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly logger = new Logger(DrizzleService.name);
  public readonly db: NodePgDatabase<typeof schema>;
  private readonly pool: Pool;

  constructor() {
    const databaseUrl =
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/auth2x_ultra';

    this.pool = new Pool({
      connectionString: databaseUrl,
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    this.db = drizzle(this.pool, { schema });

    this.logger.log('Database connection established');
  }

  async onModuleDestroy() {
    try {
      await this.pool.end();
      this.logger.log('Database connection closed');
    } catch (error) {
      this.logger.error('Error closing database connection', error);
    }
  }

  /**
   * Health check for database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }

  /**
   * Get database pool statistics
   */
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }
}
