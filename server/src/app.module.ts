import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { ProductsModule } from './products/products.module.js';
import { CombosModule } from './combos/combos.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CategoriesModule,
    ProductsModule,
    CombosModule,
    OrdersModule,
    HealthModule,
  ],
})
export class AppModule {}
