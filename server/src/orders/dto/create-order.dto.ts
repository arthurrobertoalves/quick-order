import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsPositive,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod, OrderItemType } from '@prisma/client';

export class CreateOrderItemDto {
  @IsEnum(OrderItemType)
  type: OrderItemType;

  @IsInt()
  @IsPositive()
  id: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  @MinLength(2, { message: 'Informe o nome do cliente.' })
  customerName: string;

  @IsEnum(PaymentMethod, { message: 'Forma de pagamento inválida.' })
  paymentMethod: PaymentMethod;

  @IsArray()
  @ArrayMinSize(1, { message: 'O pedido não pode estar vazio.' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}
