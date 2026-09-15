import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderItemType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { toNumber } from '../common/decimal.util.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

const ORDER_NUMBER_OFFSET = 1000;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private toOrderNumber(id: number) {
    return ORDER_NUMBER_OFFSET + id;
  }

  async create(dto: CreateOrderDto) {
    const productIds = dto.items
      .filter((item) => item.type === OrderItemType.PRODUCT)
      .map((item) => item.id);
    const comboIds = dto.items
      .filter((item) => item.type === OrderItemType.COMBO)
      .map((item) => item.id);

    const [products, combos] = await Promise.all([
      productIds.length
        ? this.prisma.product.findMany({ where: { id: { in: productIds }, active: true } })
        : Promise.resolve([]),
      comboIds.length
        ? this.prisma.combo.findMany({ where: { id: { in: comboIds }, active: true } })
        : Promise.resolve([]),
    ]);

    const productById = new Map(products.map((product) => [product.id, product]));
    const comboById = new Map(combos.map((combo) => [combo.id, combo]));

    const linesToCreate = dto.items.map((item) => {
      const source =
        item.type === OrderItemType.PRODUCT ? productById.get(item.id) : comboById.get(item.id);
      if (!source) {
        throw new NotFoundException(
          `${item.type === OrderItemType.PRODUCT ? 'Produto' : 'Combo'} ${item.id} não encontrado.`,
        );
      }
      const unitPrice = toNumber(source.price);
      const subtotal = Math.round(unitPrice * item.quantity * 100) / 100;
      return {
        type: item.type,
        quantity: item.quantity,
        unitPrice,
        subtotal,
        productId: item.type === OrderItemType.PRODUCT ? item.id : null,
        comboId: item.type === OrderItemType.COMBO ? item.id : null,
      };
    });

    const total = Math.round(linesToCreate.reduce((sum, line) => sum + line.subtotal, 0) * 100) / 100;
    if (total <= 0) {
      throw new BadRequestException('O total do pedido deve ser maior que zero.');
    }

    const order = await this.prisma.order.create({
      data: {
        customerName: dto.customerName,
        paymentMethod: dto.paymentMethod,
        total,
        items: { create: linesToCreate },
      },
      include: {
        items: { include: { product: true, combo: true } },
      },
    });

    return this.serialize(order);
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true, combo: true } } },
    });
    if (!order) {
      throw new NotFoundException(`Pedido ${id} não encontrado.`);
    }
    return this.serialize(order);
  }

  private serialize(order: {
    id: number;
    customerName: string;
    paymentMethod: string;
    total: unknown;
    createdAt: Date;
    items: {
      id: number;
      type: string;
      quantity: number;
      unitPrice: unknown;
      subtotal: unknown;
      product: { name: string } | null;
      combo: { name: string } | null;
    }[];
  }) {
    return {
      id: order.id,
      orderNumber: this.toOrderNumber(order.id),
      customerName: order.customerName,
      paymentMethod: order.paymentMethod,
      total: toNumber(order.total as never),
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        type: item.type,
        name: item.product?.name ?? item.combo?.name ?? '',
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice as never),
        subtotal: toNumber(item.subtotal as never),
      })),
    };
  }
}
