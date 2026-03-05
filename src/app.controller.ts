import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppService } from './app.service';
import { Public } from './core/decorators/public.decorator';
import type { EnvConfigFlat } from './core/config';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService<EnvConfigFlat>,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  health() {
    const uptime = process.uptime();

    // Get typed config using dot notation
    const apiPrefix = this.configService.getOrThrow<string>('APP.API_PREFIX');

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor(uptime),
        human: this.formatUptime(uptime),
      },
      environment: this.configService.getOrThrow<string>('APP.NODE_ENV'),
      version: '1.0.0',
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
          host: `${this.configService.getOrThrow<string>('DATABASE.HOST')}:${this.configService.getOrThrow<number>('DATABASE.PORT')}`,
          database: this.configService.getOrThrow<string>('DATABASE.NAME'),
        },
        redis: {
          status: 'connected',
          host: `${this.configService.getOrThrow<string>('REDIS.HOST')}:${this.configService.getOrThrow<number>('REDIS.PORT')}`,
        },
      },
      api: {
        prefix: apiPrefix,
        docs: `/${apiPrefix}/docs`,
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
