import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../core/database';
import { CacheModule } from '../../core/cache';
import { JwtCoreModule } from '../../core/jwt/jwt.module';
import { UserRepository } from './repositories/user.repository';
import { IdentityRepository } from './repositories/identity.repository';
import { ProfileRepository } from './repositories/profile.repository';
import { UserService } from './services/user.service';
import { UsersController } from '../../presentation/http/v1/users/users.controller';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CacheModule,
    JwtCoreModule,
    forwardRef(() => AuthModule),
    forwardRef(() => RbacModule),
    forwardRef(() => ActivityModule),
  ],
  controllers: [UsersController],
  providers: [
    UserRepository,
    IdentityRepository,
    ProfileRepository,
    UserService,
  ],
  exports: [UserRepository, IdentityRepository, ProfileRepository, UserService],
})
export class UserModule {}
