import {
  Injectable, ConflictException, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopStatus } from '@krishidukan/shared';

@Injectable()
export class ShopsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateShopDto, firebaseUid: string) {
    const existing = await this.prisma.shop.findFirst({
      where: { OR: [{ phone: dto.phone }, { firebaseUid }] },
    });
    if (existing) {
      throw new ConflictException('A shop with this phone or account already exists');
    }

    return this.prisma.shop.create({
      data: {
        ...dto,
        firebaseUid,
        status: 'pending_review',
      },
    });
  }

  async findByFirebaseUid(firebaseUid: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { firebaseUid },
      include: { licenses: true, subscription: true },
    });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async findById(id: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) throw new NotFoundException('Shop not found');
    if (shop.status !== 'active') throw new NotFoundException('Shop not found');
    return shop;
  }

  async update(firebaseUid: string, dto: UpdateShopDto) {
    const shop = await this.prisma.shop.findUnique({ where: { firebaseUid } });
    if (!shop) throw new NotFoundException('Shop not found');
    return this.prisma.shop.update({
      where: { id: shop.id },
      data: dto,
    });
  }

  async setErpApiKeyHash(shopId: string, hash: string) {
    return this.prisma.shop.update({
      where: { id: shopId },
      data: { erpApiKeyHash: hash },
    });
  }
}
