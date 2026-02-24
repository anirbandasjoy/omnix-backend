import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../../core/database';
import { CacheModule } from '../../core/cache';
import { JwtCoreModule } from '../../core/jwt/jwt.module';
import { RbacService } from './services/rbac.service';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { AdminController } from '../../presentation/http/v1/admin/admin.controller';
import { UserModule } from '../user/user.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CacheModule,
    JwtCoreModule,
    forwardRef(() => UserModule),
    forwardRef(() => ActivityModule),
  ],
  controllers: [AdminController],
  providers: [RbacService, RoleRepository, PermissionRepository],
  exports: [RbacService, RoleRepository, PermissionRepository],
})
export class RbacModule {}
