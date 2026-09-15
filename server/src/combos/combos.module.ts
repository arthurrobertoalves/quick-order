import { Module } from '@nestjs/common';
import { CombosController } from './combos.controller.js';
import { CombosService } from './combos.service.js';

@Module({
  controllers: [CombosController],
  providers: [CombosService],
  exports: [CombosService],
})
export class CombosModule {}
