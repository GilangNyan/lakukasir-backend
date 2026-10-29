import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY } from '../decorators/require-scope.decorator.js';
import type {
  RequestWithUser,
  UserPayload,
} from '../interfaces/request-with-user.interface.js';
import { Scope } from '../enums/scope.enum.js';
import { Channel } from '../enums/channel.enum.js';

@Injectable()
export class ScopeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredScopes = this.reflector.get<UserPayload['scope'][]>(
      SCOPES_KEY,
      context.getHandler(),
    );

    if (!requiredScopes?.length) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const payload = request.user;

    const channelMatchesScope =
      (payload.scope === Scope.ADMIN && payload.channel === Channel.ADMIN) ||
      ((payload.scope === Scope.IDENTITY || payload.scope === Scope.STORE) &&
        payload.channel === Channel.CLIENT);

    return channelMatchesScope && requiredScopes.includes(payload.scope);
  }
}
