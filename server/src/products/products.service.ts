import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { toNumber } from '../common/decimal.util.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize(product: {
    id: number;
    name: string;
    description: string | null;
    price: unknown;
    imageUrl: string | null;
    active: boolean;
    categoryId: number;
    upgradeToProductId: number | null;
    category?: unknown;
  }) {
    return {
      ...product,
      price: toNumber(product.price as never),
    };
  }

  async findAll(categoryId?: number) {
    const products = await this.prisma.product.findMany({
      where: { active: true, ...(categoryId ? { categoryId } : {}) },
      include: { category: true },
      orderBy: { id: 'asc' },
    });
    return products.map((product) => this.serialize(product));
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, upgradeTo: true },
    });
    if (!product || !product.active) {
      throw new NotFoundException(`Produto ${id} não encontrado.`);
    }
    return {
      ...this.serialize(product),
      upgradeTo: product.upgradeTo ? this.serialize(product.upgradeTo) : null,
    };
  }
}
