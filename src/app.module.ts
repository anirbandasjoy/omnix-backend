import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { DatabaseModule } from './core/database';
import { CacheModule } from './core/cache';
import { QueueModule } from './core/queue';
import {
  appConfig,
  databaseConfig,
  redisConfig,
  jwtConfig,
  oauthConfig,
  emailConfig,
  awsConfig,
} from './core/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { InfrastructureModule } from './infrastructure';
import { AuthModule } from './domains/auth';
import { UserModule } from './domains/user';
import { ActivityModule } from './domains/activity';
import { MediaModule } from './domains/media';
import { RbacModule } from './domains/rbac';
import { SystemModule } from './domains/system/system.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        jwtConfig,
        oauthConfig,
        emailConfig,
        awsConfig,
      ],
    }),

    // Throttling (Rate Limiting)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per ttl
      },
    ]),

    // Email Module
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('email.host', 'smtp.gmail.com'),
          port: config.get<number>('email.port', 587),
          auth: {
            user: config.get<string>('email.user'),
            pass: config.get<string>('email.password'),
          },
        },
        defaults: {
          from: `"${config.get<string>('email.fromName', 'Auth2X Ultra')}" <${config.get<string>('email.from')}>`,
        },
        template: {
          dir: process.cwd() + '/src/infrastructure/email/templates',
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),

    // Core modules
    DatabaseModule,
    CacheModule,
    QueueModule,

    // Infrastructure
    InfrastructureModule,

    // Domain modules
    AuthModule,
    UserModule,
    ActivityModule,
    MediaModule,
    RbacModule,
    SystemModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
