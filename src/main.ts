import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters';
import {
  ResponseTransformInterceptor,
  LoggingInterceptor,
  CorrelationIdInterceptor,
} from './core/interceptors';
import { RequestContextMiddleware } from './core/middlewares/request-context.middleware';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { QUEUES } from './core/queue/queues.constant';
import { ZodValidationPipe } from 'nestjs-zod';
import type { EnvConfigFlat } from './core/config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService<EnvConfigFlat>>(ConfigService);

  // Global prefix (exclude root routes)
  const apiPrefix = configService.getOrThrow<string>('APP.API_PREFIX');
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health'],
  });

  // CORS
  app.enableCors({
    origin: configService.getOrThrow<string>('APP.CORS.ORIGIN'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: configService.getOrThrow<boolean>('APP.CORS.CREDENTIALS'),
  });

  // Global pipes
  app.useGlobalPipes(new ZodValidationPipe());

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new CorrelationIdInterceptor(),
    new LoggingInterceptor(),
    new ResponseTransformInterceptor(),
  );

  // Middleware
  const middleware = new RequestContextMiddleware();
  app.use((req: Request, res: Response, next: NextFunction) =>
    middleware.use(req, res, next),
  );

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Auth2X Ultra API')
    .setDescription('The Auth2X Ultra API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('admin', 'Admin and RBAC endpoints')
    .addTag('media', 'Media and avatar management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Bull Board UI for Queue Management
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/queues');

  // Only add queues that are registered
  const queuesToAdd: BullMQAdapter[] = [];

  // Directly create a new Queue instance for Bull Board
  try {
    const redisConnection = {
      host: configService.getOrThrow<string>('REDIS.HOST'),
      port: configService.getOrThrow<number>('REDIS.PORT'),
      password: configService.getOrThrow<string>('REDIS.PASSWORD'),
      db: configService.getOrThrow<number>('REDIS.DB'),
    };

    // Create a new queue instance for monitoring
    const emailQueue = new Queue(QUEUES.EMAIL, {
      connection: redisConnection,
    });

    queuesToAdd.push(new BullMQAdapter(emailQueue));
    logger.log('✅ Email queue registered for Bull Board UI');
  } catch {
    logger.warn('Failed to connect to email queue');
  }

  if (queuesToAdd.length > 0) {
    createBullBoard({
      queues: queuesToAdd,
      serverAdapter,
    });

    app.use('/queues', serverAdapter.getRouter());
    logger.log(`✅ Bull Board UI running with ${queuesToAdd.length} queue(s)`);
  } else {
    logger.warn('No queues registered for Bull Board UI');
  }

  const port = configService.getOrThrow<number>('APP.PORT');
  await app.listen(port);

  const baseUrl = `http://localhost:${port}`;

  // Display all important URLs
  logger.log('═'.repeat(60));
  logger.log('🚀 Auth2X Ultra Application Started Successfully!');
  logger.log('═'.repeat(60));
  logger.log(`📦 Base URL:           ${baseUrl}`);
  logger.log(
    `🌍 Environment:        ${configService.getOrThrow<string>('APP.NODE_ENV')}`,
  );
  logger.log('');
  logger.log('📌 Important Endpoints:');
  logger.log(`   • Health Check:      ${baseUrl}/health`);
  logger.log(`   • API Base:          ${baseUrl}/${apiPrefix}`);
  logger.log(`   • API Docs:          ${baseUrl}/${apiPrefix}/docs`);
  logger.log(`   • Queue Dashboard:   ${baseUrl}/queues`);
  logger.log(`   • System Health:     ${baseUrl}/${apiPrefix}/system/health`);
  logger.log(`   • System Info:       ${baseUrl}/${apiPrefix}/system/info`);
  logger.log('');
  logger.log('🔌 External Services:');
  logger.log(
    `   • Redis:             redis://${configService.getOrThrow<string>('REDIS.HOST')}:${configService.getOrThrow<number>('REDIS.PORT')}`,
  );
  logger.log(
    `   • PostgreSQL:        ${configService.getOrThrow<string>('DATABASE.HOST')}:${configService.getOrThrow<number>('DATABASE.PORT')}/${configService.getOrThrow<string>('DATABASE.NAME')}`,
  );
  logger.log('═'.repeat(60));
}

void bootstrap();
