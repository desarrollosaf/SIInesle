import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Auditoria } from '../models/ini-auditoria.model';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectModel(Auditoria) private readonly auditoriaModel: typeof Auditoria,
  ) {}

  async findAll() {
    return this.auditoriaModel.findAll({ order: [['created_at', 'DESC']], limit: 500 });
  }

  async registrar(usuarioRfc: string, usuarioNombre: string, accion: string, registro: string, resultado: string) {
    return this.auditoriaModel.create({
      usuario_rfc: usuarioRfc,
      usuario_nombre: usuarioNombre,
      accion,
      registro,
      resultado,
    } as any);
  }
}
