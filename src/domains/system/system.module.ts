import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtCoreModule } from '../../core/jwt/jwt.module';
import { SystemController } from '../../presentation/http/v1/system/system.controller';

@Module({
  imports: [ConfigModule, JwtCoreModule],
  controllers: [SystemController],
})
export class SystemModule {}
