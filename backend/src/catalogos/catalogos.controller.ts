import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CatalogosService } from './catalogos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { usuarioDesdeRequest } from '../common/utils/usuario-request.util';

@UseGuards(JwtAuthGuard)
@Controller('catalogos')
export class CatalogosController {
  constructor(private readonly service: CatalogosService) {}

  @Get(':tipo')
  findAll(@Param('tipo') tipo: string) {
    return this.service.findAll(tipo);
  }

  @Get(':tipo/:id')
  findOne(@Param('tipo') tipo: string, @Param('id') id: string) {
    return this.service.findOne(tipo, +id);
  }

  @Post(':tipo')
  crear(@Param('tipo') tipo: string, @Body('nombre') nombre: string, @Req() req: any) {
    return this.service.crear(tipo, nombre, usuarioDesdeRequest(req));
  }

  @Put(':tipo/:id')
  actualizar(
    @Param('tipo') tipo: string,
    @Param('id') id: string,
    @Body() body: { nombre?: string; status?: number },
    @Req() req: any,
  ) {
    return this.service.actualizar(tipo, +id, body, usuarioDesdeRequest(req));
  }

  @Delete(':tipo/:id')
  eliminar(@Param('tipo') tipo: string, @Param('id') id: string, @Req() req: any) {
    return this.service.eliminar(tipo, +id, usuarioDesdeRequest(req));
  }
}
