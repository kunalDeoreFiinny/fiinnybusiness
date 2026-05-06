import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { FirebaseAdminService } from '../../firebase-admin/firebase-admin.service';
import { JwtPayload, AuthResponse, UserRole } from '@krishidukan/shared';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private firebase: FirebaseAdminService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async loginWithFirebaseToken(idToken: string): Promise<AuthResponse> {
    let decoded;
    try {
      decoded = await this.firebase.verifyIdToken(idToken);
    } catch {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }

    const phone = decoded.phone_number;
    if (!phone) {
      throw new UnauthorizedException('Phone number not found in token');
    }

    const { role, shopId } = await this.resolveRole(decoded.uid, phone);

    const payload: JwtPayload = {
      sub: decoded.uid,
      phone,
      role,
      shopId: shopId ?? null,
    };

    const accessToken = this.jwt.sign(payload);
    return {
      accessToken,
      role,
      shopId: shopId ?? null,
      expiresIn: this.config.get('JWT_EXPIRES_IN', '7d'),
    };
  }

  private async resolveRole(
    uid: string,
    phone: string,
  ): Promise<{ role: UserRole; shopId: string | null }> {
    const adminPhones = (process.env['ADMIN_PHONES'] ?? '').split(',').map((p) => p.trim());
    if (adminPhones.includes(phone)) {
      return { role: UserRole.ADMIN, shopId: null };
    }

    const shop = await this.prisma.shop.findUnique({ where: { firebaseUid: uid } });
    if (shop) {
      return { role: UserRole.SHOP_OWNER, shopId: shop.id };
    }

    const farmer = await this.prisma.userFarmer.findUnique({ where: { firebaseUid: uid } });
    if (farmer) {
      return { role: UserRole.FARMER, shopId: null };
    }

    return { role: UserRole.FARMER, shopId: null };
  }
}
