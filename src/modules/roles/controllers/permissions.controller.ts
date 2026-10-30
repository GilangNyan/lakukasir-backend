import { Body, Controller, Delete, ForbiddenException, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { ScopeGuard } from '../../../common/guards/scope.guard.js';
import { RolesService } from '../roles.service.js';
import { Scope } from '../../../common/enums/scope.enum.js';
import { CreatePermissionDto } from '../dto/create-permission.dto.js';
import { RequireScopes } from '../../../common/decorators/require-scope.decorator.js';
import { CurrentUser } from '../../../common/decorators/current-user.decorator.js';
import type { UserPayload } from '../../../common/interfaces/request-with-user.interface.js';

@Controller('permissions')
@UseGuards(JwtAuthGuard, ScopeGuard)
export class PermissionsController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @RequireScopes(Scope.ADMIN)
  getAllPermissions() {
    return this.rolesService.getAllPermissions();
  }

  @Get(':roleId')
  @RequireScopes(Scope.ADMIN, Scope.STORE)
  getPermissionsByRole(@Param('roleId') roleId: string) {
    return this.rolesService.getPermissionByRole(roleId);
  }

  @Get(':roleId/name')
  @RequireScopes(Scope.ADMIN, Scope.STORE)
  getPermissionsNameByRole(@Param('roleId') roleId: string) {
    return this.rolesService.getPermissionNameByRole(roleId);
  }
  
  @Get('me')
  @RequireScopes(Scope.ADMIN, Scope.STORE)
  getMyPermissionsName(@CurrentUser() currentUser: UserPayload) {
    const roleId = currentUser.roleId;
    if (!roleId) {
      throw new ForbiddenException('User does not have a role');
    }

    return this.rolesService.getPermissionNameByRole(roleId);
  }

  @Post()
  @RequireScopes(Scope.ADMIN)
  createPermission(@Body() body: CreatePermissionDto) {
    return this.rolesService.createPermission(body);
  }

  @Delete(':id')
  @RequireScopes(Scope.ADMIN)
  deletePermission(@Param('id') id: string) {
    return this.rolesService.deletePermission(id);
  }
}
