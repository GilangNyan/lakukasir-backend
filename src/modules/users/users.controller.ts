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
import { UsersService } from './users.service.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { UserPayload } from '../../common/interfaces/request-with-user.interface.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createNewUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;
    return result;
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: CreateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Get('me')
  async getMyProfile(@CurrentUser() currentUser: UserPayload) {
    const user = await this.usersService.findById(currentUser.userId);
    const { password, ...result } = user;
    return result;
  }

  @Put('me')
  async updateMyProfile(
    @CurrentUser() currentUser: UserPayload,
    @Body() updateUserDto: CreateUserDto,
  ) {
    return this.usersService.update(currentUser.userId, updateUserDto);
  }
}
