import { Controller, Get } from '@nestjs/common';
import { PublicoService } from './publico.service';

// Sin JwtAuthGuard a propósito: es el portal de consulta ciudadana.
@Controller('publico')
export class PublicoController {
  constructor(private readonly service: PublicoService) {}

  @Get('iniciativas')
  findAll() {
    return this.service.findAll();
  }
}
