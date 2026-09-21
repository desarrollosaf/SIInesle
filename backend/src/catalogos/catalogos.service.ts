import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Legislador } from '../models/ini-legislador.model';
import { Partido } from '../models/ini-partido.model';
import { Tema } from '../models/ini-tema.model';
import { Legislatura } from '../models/ini-legislatura.model';
import { Comision } from '../models/ini-comision.model';
import { Estatus } from '../models/ini-estatus.model';
import { AuditoriaService } from '../auditoria/auditoria.service';

export type TipoCatalogo = 'legisladores' | 'partidos' | 'temas' | 'legislaturas' | 'comisiones' | 'estatus';

export interface UsuarioAuditoria {
  rfc: string;
  nombre: string;
}

const TITULOS: Record<TipoCatalogo, string> = {
  legisladores: 'Personas legisladoras y promoventes',
  partidos: 'Grupos parlamentarios y partidos',
  temas: 'Temas',
  legislaturas: 'Legislaturas',
  comisiones: 'Comisiones',
  estatus: 'Estatus',
};

@Injectable()
export class CatalogosService {
  private readonly modelos: Record<TipoCatalogo, any>;

  constructor(
    @InjectModel(Legislador) legisladorModel: typeof Legislador,
    @InjectModel(Partido) partidoModel: typeof Partido,
    @InjectModel(Tema) temaModel: typeof Tema,
    @InjectModel(Legislatura) legislaturaModel: typeof Legislatura,
    @InjectModel(Comision) comisionModel: typeof Comision,
    @InjectModel(Estatus) estatusModel: typeof Estatus,
    private readonly auditoriaService: AuditoriaService,
  ) {
    this.modelos = {
      legisladores: legisladorModel,
      partidos: partidoModel,
      temas: temaModel,
      legislaturas: legislaturaModel,
      comisiones: comisionModel,
      estatus: estatusModel,
    };
  }

  private resolverModelo(tipo: string): any {
    const modelo = this.modelos[tipo as TipoCatalogo];
    if (!modelo) throw new BadRequestException(`Catálogo "${tipo}" no reconocido.`);
    return modelo;
  }

  async findAll(tipo: string) {
    const modelo = this.resolverModelo(tipo);
    return modelo.findAll({ order: [['nombre', 'ASC']] });
  }

  async findOne(tipo: string, id: number) {
    const modelo = this.resolverModelo(tipo);
    const item = await modelo.findByPk(id);
    if (!item) throw new NotFoundException('Valor de catálogo no encontrado.');
    return item;
  }

  async crear(tipo: string, nombre: string, usuario?: UsuarioAuditoria) {
    const modelo = this.resolverModelo(tipo);
    const valor = (nombre ?? '').trim();
    if (valor.length < 2) throw new BadRequestException('El valor debe tener al menos 2 caracteres.');

    const existente = await modelo.findOne({ where: { nombre: valor } as any });
    if (existente) throw new ConflictException('Ese valor ya existe en el catálogo.');

    const item = await modelo.create({ nombre: valor, status: 1 } as any);

    if (usuario) {
      await this.auditoriaService.registrar(
        usuario.rfc, usuario.nombre, 'Alta en catálogo', `${TITULOS[tipo as TipoCatalogo]} · ${valor}`, 'Correcto',
      );
    }
    return item;
  }

  async actualizar(tipo: string, id: number, data: { nombre?: string; status?: number }, usuario?: UsuarioAuditoria) {
    const item = await this.findOne(tipo, id);
    const anterior = item.nombre;
    await item.update({
      ...(data.nombre !== undefined ? { nombre: data.nombre.trim() } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    });

    if (usuario && data.nombre !== undefined && data.nombre.trim() !== anterior) {
      await this.auditoriaService.registrar(
        usuario.rfc, usuario.nombre, 'Edición de catálogo',
        `${TITULOS[tipo as TipoCatalogo]} · ${anterior} → ${item.nombre}`, 'Correcto',
      );
    }
    return item;
  }

  async eliminar(tipo: string, id: number, usuario?: UsuarioAuditoria) {
    const item = await this.findOne(tipo, id);
    const nombre = item.nombre;
    await item.destroy();

    if (usuario) {
      await this.auditoriaService.registrar(
        usuario.rfc, usuario.nombre, 'Baja en catálogo', `${TITULOS[tipo as TipoCatalogo]} · ${nombre}`, 'Correcto',
      );
    }
    return { ok: true };
  }
}
