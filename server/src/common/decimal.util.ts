import type { Decimal } from '@prisma/client/runtime/library';

export function toNumber(value: Decimal | number): number {
  return typeof value === 'number' ? value : Number(value);
}
