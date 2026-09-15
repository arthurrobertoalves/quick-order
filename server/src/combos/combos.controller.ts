import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CombosService } from './combos.service.js';

@Controller('combos')
export class CombosController {
  constructor(private readonly combosService: CombosService) {}

  @Get()
  findAll() {
    return this.combosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.combosService.findOne(id);
  }
}
