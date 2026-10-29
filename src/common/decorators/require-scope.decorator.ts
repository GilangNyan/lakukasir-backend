import { SetMetadata } from '@nestjs/common';
import type { UserPayload } from '../interfaces/request-with-user.interface.js';

export const SCOPES_KEY = 'scope';
export const RequireScopes = (...scopes: UserPayload['scope'][]) =>
  SetMetadata(SCOPES_KEY, scopes);
