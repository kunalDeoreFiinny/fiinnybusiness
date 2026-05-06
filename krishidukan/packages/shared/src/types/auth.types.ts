import { UserRole } from '../enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  phone: string;
  role: UserRole;
  shopId?: string | null;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  accessToken: string;
  role: UserRole;
  shopId?: string | null;
  expiresIn: string;
}
