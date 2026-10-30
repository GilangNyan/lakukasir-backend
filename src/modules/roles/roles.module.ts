import { Module } from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { RolesController } from './controllers/roles.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity.js';
import { Permission } from './entities/permission.entity.js';
import { RolePermission } from './entities/role-permission.entity.js';
import { PermissionsController } from './controllers/permissions.controller.js';
import { ScopeGuard } from '../../common/guards/scope.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
  providers: [RolesService, ScopeGuard],
  controllers: [RolesController, PermissionsController],
  exports: [RolesService],
})
export class RolesModule {}
