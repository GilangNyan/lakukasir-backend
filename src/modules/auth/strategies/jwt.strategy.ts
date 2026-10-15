import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserPayload } from '../../../common/interfaces/request-with-user.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'app.jwtSecret',
        'super-secret-jwt-key-2026',
      ),
    });
  }

  async validate(payload: UserPayload): Promise<UserPayload> {
    if (!payload || !payload.userId) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;
  }
}
