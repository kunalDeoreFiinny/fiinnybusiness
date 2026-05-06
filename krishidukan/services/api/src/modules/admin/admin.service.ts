import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ERP_API_KEY_BYTES } from '@krishidukan/shared';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getPendingShops(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [shops, total] = await Promise.all([
      this.prisma.shop.findMany({
        where: { status: 'pending_review' },
        include: { licenses: true },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.shop.count({ where: { status: 'pending_review' } }),
    ]);
    return { shops, total, page, limit };
  }

  async getShopById(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        licenses: true,
        subscription: true,
        _count: { select: { inventory: true, views: true } },
      },
    });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async approveShop(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: { licenses: { take: 1 } },
    });
    if (!shop) throw new NotFoundException('Shop not found');
    if (shop.licenses.length === 0) {
      throw new BadRequestException('Cannot approve shop without at least one license document');
    }

    const rawApiKey = crypto.randomBytes(ERP_API_KEY_BYTES).toString('hex');
    const apiKeyHash = await bcrypt.hash(rawApiKey, 10);

    const [updatedShop] = await this.prisma.$transaction([
      this.prisma.shop.update({
        where: { id },
        data: { status: 'active', erpApiKeyHash: apiKeyHash },
      }),
      this.prisma.subscription.upsert({
        where: { shopId: id },
        create: {
          shopId: id,
          plan: 'free',
          startDate: new Date(),
          status: 'trialing',
        },
        update: {},
      }),
    ]);

    return { shop: updatedShop, erpApiKey: rawApiKey };
  }

  async rejectShop(id: string, reason: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) throw new NotFoundException('Shop not found');
    return this.prisma.shop.update({
      where: { id },
      data: { status: 'rejected', adminNotes: reason },
    });
  }

  async suspendShop(id: string, reason?: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) throw new NotFoundException('Shop not found');
    return this.prisma.shop.update({
      where: { id },
      data: {
        status: 'suspended',
        adminNotes: reason ?? shop.adminNotes,
      },
    });
  }

  async getAllShops(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as 'active' | 'pending_review' | 'suspended' | 'rejected' } : {};
    const [shops, total] = await Promise.all([
      this.prisma.shop.findMany({
        where,
        include: { _count: { select: { licenses: true, inventory: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.shop.count({ where }),
    ]);
    return { shops, total, page, limit };
  }

  async getSummary() {
    const [
      totalShops, activeShops, pendingShops, suspendedShops,
      totalFarmers, totalSearches, searchesLast7Days,
      topProducts,
    ] = await Promise.all([
      this.prisma.shop.count(),
      this.prisma.shop.count({ where: { status: 'active' } }),
      this.prisma.shop.count({ where: { status: 'pending_review' } }),
      this.prisma.shop.count({ where: { status: 'suspended' } }),
      this.prisma.userFarmer.count(),
      this.prisma.searchLog.count(),
      this.prisma.searchLog.count({
        where: { timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.searchLog.groupBy({
        by: ['productId'],
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalShops, activeShops, pendingShops, suspendedShops,
      totalFarmers, totalSearches, searchesLast7Days,
      topProducts,
    };
  }
}
