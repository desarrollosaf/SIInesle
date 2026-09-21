import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ComparativasService } from './comparativas.service';
import type { ComparativaPayload } from './comparativas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('comparativas')
export class ComparativasController {
  constructor(private readonly service: ComparativasService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  crear(@Body() body: ComparativaPayload) {
    return this.service.crear(body);
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() body: Partial<ComparativaPayload>) {
    return this.service.actualizar(+id, body);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.service.eliminar(+id);
  }
}
