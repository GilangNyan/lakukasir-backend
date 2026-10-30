import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard.js';
import { ScopeGuard } from '../../../common/guards/scope.guard.js';
import { RolesService } from '../roles.service.js';
import { RequireScopes } from '../../../common/decorators/require-scope.decorator.js';
import { Scope } from '../../../common/enums/scope.enum.js';
import { CreateRoleDto } from '../dto/create-role.dto.js';
import { UpdateRoleDto } from '../dto/update-role.dto.js';

@Controller('roles')
@UseGuards(JwtAuthGuard, ScopeGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get(':id')
  @RequireScopes(Scope.ADMIN)
  getRole(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  @Post()
  @RequireScopes(Scope.ADMIN)
  createRole(@Body() body: CreateRoleDto) {
    return this.rolesService.create(body);
  }

  @Put(':id')
  @RequireScopes(Scope.ADMIN)
  updateRole(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.rolesService.update(id, body);
  }

  @Delete(':id')
  @RequireScopes(Scope.ADMIN)
  deleteRole(@Param('id') id: string) {
    return this.rolesService.delete(id);
  }
}
