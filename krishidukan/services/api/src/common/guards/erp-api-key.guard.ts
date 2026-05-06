import {
  Injectable, CanActivate, ExecutionContext,
  UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { ERP_API_KEY_HEADER } from '@krishidukan/shared';
import { Request } from 'express';

@Injectable()
export class ErpApiKeyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { params: { shopId: string } }>();
    const apiKey = request.headers[ERP_API_KEY_HEADER] as string | undefined;

    if (!apiKey) {
      throw new UnauthorizedException(`${ERP_API_KEY_HEADER} header required`);
    }

    const { shopId } = request.params;
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });

    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    if (!shop.erpApiKeyHash) {
      throw new UnauthorizedException('ERP sync not configured for this shop');
    }

    const valid = await bcrypt.compare(apiKey, shop.erpApiKeyHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid ERP API key');
    }

    return true;
  }
}
