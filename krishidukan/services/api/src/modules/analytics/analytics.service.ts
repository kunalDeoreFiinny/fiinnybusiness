import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActionType } from '@krishidukan/shared';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async logEvent(shopId: string, action: ActionType, userId?: string, productId?: string) {
    await this.prisma.shopView.create({
      data: { shopId, action, userId, productId },
    });
  }

  async getShopStats(shopId: string) {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalViews, totalCalls, totalDirections, recent] = await Promise.all([
      this.prisma.shopView.count({ where: { shopId, action: 'view' } }),
      this.prisma.shopView.count({ where: { shopId, action: 'call' } }),
      this.prisma.shopView.count({ where: { shopId, action: 'direction' } }),
      this.prisma.shopView.groupBy({
        by: ['action'],
        where: { shopId, timestamp: { gte: sevenDaysAgo } },
        _count: { action: true },
      }),
    ]);

    const recentMap = Object.fromEntries(recent.map((r) => [r.action, r._count.action]));

    return {
      shopId,
      totalViews,
      totalCalls,
      totalDirections,
      viewsLast7Days: recentMap['view'] ?? 0,
      callsLast7Days: recentMap['call'] ?? 0,
      directionsLast7Days: recentMap['direction'] ?? 0,
    };
  }
}
