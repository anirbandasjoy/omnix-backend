import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { Public } from './core/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  health() {
    const uptime = process.uptime();

    // Get database and redis info
    const dbHost = this.config.get<string>('database.host', 'localhost');
    const dbPort = this.config.get<number>('database.port', 5432);
    const dbName = this.config.get<string>('database.name', 'auth2x_ultra');
    const redisHost = this.config.get<string>('redis.host', 'localhost');
    const redisPort = this.config.get<number>('redis.port', 6379);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        human: this.formatUptime(uptime),
      },
      environment: process.env.NODE_ENV || 'development',
      version: this.config.get<string>('app.version', '1.0.0'),
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          used:
            Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) /
            100,
          total:
            Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) /
            100,
          unit: 'MB',
        },
      },
      connections: {
        database: {
          status: 'connected',
          host: `${dbHost}:${dbPort}`,
          database: dbName,
        },
        redis: {
          status: 'connected',
          host: `${redisHost}:${redisPort}`,
        },
      },
      api: {
        prefix: this.config.get<string>('app.apiPrefix', 'api/v1'),
        docs: `/api/v1/docs`,
      },
    };
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ');
  }
}
