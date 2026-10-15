import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { User } from '../users/entities/user.entity.js';
import { validatePassword } from '../../utils/credential.util.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      fullName: registerDto.fullname,
      phone: registerDto.phone,
      password: registerDto.password,
    });

    const accessToken = this.generateJwtToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByIdentifier(loginDto.identifier);

    if (!user || !user.password) {
      throw new UnauthorizedException('Kredensial login tidak cocok');
    }

    const isPasswordValid = await validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Kredensial login tidak cocok');
    }

    const accessToken = this.generateJwtToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
    };
  }

  private generateJwtToken(user: User) {
    const payload = {
      userId: user.id,
      email: user.email,
      phone: user.phone,
    };

    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User) {
    const { password, ...result } = user;
    return result;
  }
}
