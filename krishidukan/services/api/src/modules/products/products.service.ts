import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductCategory } from '@krishidukan/shared';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: ProductCategory, search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = {
      isActive: true,
      ...(category ? { category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { brand: { contains: search, mode: 'insensitive' as const } },
              { aliases: { has: search } },
            ],
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      this.prisma.productMaster.findMany({ where, orderBy: { name: 'asc' }, skip, take: limit }),
      this.prisma.productMaster.count({ where }),
    ]);
    return { products, total, page, limit };
  }

  async findById(id: string) {
    const product = await this.prisma.productMaster.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.productMaster.create({ data: { ...dto, aliases: dto.aliases ?? [] } });
  }

  async upsert(dto: CreateProductDto) {
    return this.prisma.productMaster.upsert({
      where: { name_brand: { name: dto.name, brand: dto.brand ?? '' } },
      create: { ...dto, aliases: dto.aliases ?? [] },
      update: { aliases: dto.aliases ?? [], description: dto.description, defaultImage: dto.defaultImage },
    });
  }
}
