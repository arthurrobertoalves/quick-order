import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { toNumber } from '../common/decimal.util.js';

@Injectable()
export class CombosService {
  constructor(private readonly prisma: PrismaService) {}

  private serialize(combo: {
    price: unknown;
    items?: { quantity: number; product: { price: unknown } & Record<string, unknown> }[];
    [key: string]: unknown;
  }) {
    return {
      ...combo,
      price: toNumber(combo.price as never),
      items: combo.items?.map((item) => ({
        ...item,
        product: { ...item.product, price: toNumber(item.product.price as never) },
      })),
    };
  }

  async findAll() {
    const combos = await this.prisma.combo.findMany({
      where: { active: true },
      include: { items: { include: { product: { include: { category: true } } } } },
      orderBy: { id: 'asc' },
    });
    return combos.map((combo) => this.serialize(combo));
  }

  async findOne(id: number) {
    const combo = await this.prisma.combo.findUnique({
      where: { id },
      include: { items: { include: { product: { include: { category: true } } } } },
    });
    if (!combo || !combo.active) {
      throw new NotFoundException(`Combo ${id} não encontrado.`);
    }
    return this.serialize(combo);
  }
}
