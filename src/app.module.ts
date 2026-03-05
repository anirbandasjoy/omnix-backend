import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './core/guards/jwt-auth.guard';
import { RolesGuard } from './core/guards/roles.guard';
import { DatabaseModule } from './core/database';
import { CacheModule } from './core/cache';
import { QueueModule } from './core/queue';
import { config, type EnvConfig } from './core/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { InfrastructureModule } from './infrastructure';
import { AuthModule } from './domains/auth';
import { UserModule } from './domains/user';
import { ActivityModule } from './domains/activity';
import { MediaModule } from './domains/media';
import { RbacModule } from './domains/rbac';
import { SystemModule } from './domains/system/system.module';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV || 'development'}`],
      load: [config],
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
      useFactory: (config: ConfigService) => {
        const envCfg = config.get<EnvConfig>('env')!;
        const smtp = envCfg.EMAIL.SMTP;
        return {
          transport: {
            host: smtp.HOST,
            port: smtp.PORT,
            auth: {
              user: smtp.USER,
              pass: smtp.PASSWORD,
            },
          },
          defaults: {
            from: `"${smtp.FROM_NAME}" <${smtp.FROM}>`,
          },
          template: {
            dir: process.cwd() + '/src/infrastructure/email/templates',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
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
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
