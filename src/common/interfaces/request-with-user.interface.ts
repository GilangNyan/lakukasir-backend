import { Request } from 'express';

export interface UserPayload {
  userId: string;
  email?: string;
  phone?: string;
  // isSuperAdmin: boolean;
  // activeStoreId?: string
  // role?: string;
}

export interface RequestWithUser extends Request {
  user: UserPayload;
}
