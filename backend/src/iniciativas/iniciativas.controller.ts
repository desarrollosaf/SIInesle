import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { IniciativasService } from './iniciativas.service';
import { CreateIniciativaDto } from './dto/create-iniciativa.dto';
import { UpdateIniciativaDto } from './dto/update-iniciativa.dto';
import { ImportarIniciativasDto } from './dto/importar-iniciativas.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { usuarioDesdeRequest } from '../common/utils/usuario-request.util';

@UseGuards(JwtAuthGuard)
@Controller('iniciativas')
export class IniciativasController {
  constructor(private readonly service: IniciativasService) {}

  @Get()
  findAll(@Query() query: { q?: string; estatus_id?: string; legislatura_id?: string }) {
    return this.service.findAll(query);
  }

  @Get('pendientes')
  findPendientes() {
    return this.service.findPendientes();
  }

  @Get('estadisticas')
  getEstadisticas() {
    return this.service.getEstadisticas();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Post()
  crear(@Body() dto: CreateIniciativaDto, @Req() req: any) {
    return this.service.crear(dto, usuarioDesdeRequest(req));
  }

  @Post('importar')
  importar(@Body() dto: ImportarIniciativasDto, @Req() req: any) {
    return this.service.importar(dto, usuarioDesdeRequest(req));
  }

  @Put(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateIniciativaDto, @Req() req: any) {
    return this.service.actualizar(+id, dto, usuarioDesdeRequest(req));
  }

  @Delete(':id')
  eliminar(@Param('id') id: string, @Req() req: any) {
    return this.service.eliminar(+id, usuarioDesdeRequest(req));
  }
}
