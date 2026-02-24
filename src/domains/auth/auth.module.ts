import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { DatabaseModule } from '../../core/database';
import { CacheModule } from '../../core/cache';
import { AuthService } from './services/auth.service';
import { DeviceRepository } from './repositories/device.repository';
import { SessionRepository } from './repositories/session.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { AuthController } from '../../presentation/http/v1/auth/auth.controller';
import { EmailModule } from '../../infrastructure/email';
import { ActivityModule } from '../activity';
import { UserModule } from '../user';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CacheModule,
    EmailModule,
    ActivityModule,
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('jwt.accessTokenSecret'),
        signOptions: {
          expiresIn: config.get('jwt.accessTokenExpiration', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    DeviceRepository,
    SessionRepository,
    RefreshTokenRepository,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
