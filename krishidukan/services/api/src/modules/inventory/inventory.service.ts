import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpsertInventoryDto } from './dto/upsert-inventory.dto';
import { ErpSyncDto } from './dto/erp-sync.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findByShop(shopId: string) {
    return this.prisma.shopInventory.findMany({
      where: { shopId },
      include: { product: true },
      orderBy: { lastUpdated: 'desc' },
    });
  }

  async upsert(shopId: string, productId: string, dto: UpsertInventoryDto) {
    const product = await this.prisma.productMaster.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found in master catalogue');

    return this.prisma.shopInventory.upsert({
      where: { shopId_productId: { shopId, productId } },
      create: {
        shopId, productId,
        price: dto.price, mrp: dto.mrp, quantity: dto.quantity,
        inStock: dto.quantity > 0,
        source: 'manual',
      },
      update: {
        price: dto.price, mrp: dto.mrp, quantity: dto.quantity,
        inStock: dto.quantity > 0,
      },
      include: { product: true },
    });
  }

  async remove(shopId: string, productId: string) {
    const item = await this.prisma.shopInventory.findUnique({
      where: { shopId_productId: { shopId, productId } },
    });
    if (!item) throw new NotFoundException('Inventory item not found');
    if (item.shopId !== shopId) throw new ForbiddenException('Access denied');

    await this.prisma.shopInventory.delete({
      where: { shopId_productId: { shopId, productId } },
    });
    return { deleted: true };
  }

  async bulkUpsertFromErp(shopId: string, dto: ErpSyncDto) {
    const results = await Promise.allSettled(
      dto.items.map((item) =>
        this.prisma.shopInventory.upsert({
          where: { shopId_productId: { shopId, productId: item.productId } },
          create: {
            shopId, productId: item.productId,
            price: item.price, mrp: item.mrp, quantity: item.quantity,
            inStock: item.quantity > 0,
            source: 'erp',
          },
          update: {
            price: item.price, mrp: item.mrp, quantity: item.quantity,
            inStock: item.quantity > 0,
            source: 'erp',
          },
        }),
      ),
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    return { synced: succeeded, failed, shopErpRef: dto.shopErpRef };
  }
}
