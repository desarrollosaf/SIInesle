import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ForeignKeyConstraintError, Op, Transaction, UniqueConstraintError } from 'sequelize';
import { Iniciativa } from '../models/ini-iniciativa.model';
import { Legislatura } from '../models/ini-legislatura.model';
import { Estatus } from '../models/ini-estatus.model';
import { Legislador } from '../models/ini-legislador.model';
import { Partido } from '../models/ini-partido.model';
import { Tema } from '../models/ini-tema.model';
import { Comision } from '../models/ini-comision.model';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateIniciativaDto } from './dto/create-iniciativa.dto';
import { UpdateIniciativaDto } from './dto/update-iniciativa.dto';
import { ImportarIniciativasDto } from './dto/importar-iniciativas.dto';
import { ImportarIniciativaFilaDto } from './dto/importar-iniciativa-fila.dto';

export interface UsuarioAuditoria {
  rfc: string;
  nombre: string;
}

const INCLUDES = [
  { model: Legislatura },
  { model: Estatus },
  { model: Legislador, through: { attributes: [] } },
  { model: Partido, through: { attributes: [] } },
  { model: Tema, through: { attributes: [] } },
  { model: Comision, through: { attributes: [] } },
];

@Injectable()
export class IniciativasService {
  constructor(
    @InjectModel(Iniciativa) private readonly iniciativaModel: typeof Iniciativa,
    @InjectModel(Legislatura) private readonly legislaturaModel: typeof Legislatura,
    @InjectModel(Estatus) private readonly estatusModel: typeof Estatus,
    @InjectModel(Legislador) private readonly legisladorModel: typeof Legislador,
    @InjectModel(Partido) private readonly partidoModel: typeof Partido,
    @InjectModel(Tema) private readonly temaModel: typeof Tema,
    @InjectModel(Comision) private readonly comisionModel: typeof Comision,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async findAll(filtros: { q?: string; estatus_id?: string; legislatura_id?: string } = {}) {
    const where: any = {};

    if (filtros.q) {
      where[Op.or] = [
        { numero: { [Op.like]: `%${filtros.q}%` } },
        { titulo: { [Op.like]: `%${filtros.q}%` } },
        { subtema: { [Op.like]: `%${filtros.q}%` } },
      ];
    }
    if (filtros.estatus_id) where.estatus_id = filtros.estatus_id;
    if (filtros.legislatura_id) where.legislatura_id = filtros.legislatura_id;

    return this.iniciativaModel.findAll({
      where,
      include: INCLUDES,
      order: [['id', 'DESC']],
    });
  }

  async findPendientes() {
    return this.iniciativaModel.findAll({
      where: { recomendacion: { [Op.or]: [null, ''] } },
      include: INCLUDES,
      order: [['id', 'DESC']],
    });
  }

  async getEstadisticas() {
    const [total, iniciativas] = await Promise.all([
      this.iniciativaModel.count(),
      this.iniciativaModel.findAll({ include: [{ model: Estatus }], attributes: ['id', 'recomendacion'] }),
    ]);

    const porEstatusMap = new Map<string, number>();
    for (const ini of iniciativas) {
      const nombre = ini.estatus?.nombre ?? 'Sin estatus';
      porEstatusMap.set(nombre, (porEstatusMap.get(nombre) ?? 0) + 1);
    }

    const enEstudio = porEstatusMap.get('En estudio') ?? 0;
    const aprobadas = porEstatusMap.get('Aprobada') ?? 0;
    const pendientesAnalisis = iniciativas.filter((i) => !i.recomendacion).length;

    return {
      total,
      enEstudio,
      aprobadas,
      pendientesAnalisis,
      porEstatus: [...porEstatusMap.entries()].map(([estatus, total]) => ({ estatus, total })),
    };
  }

  async findOne(id: number) {
    const iniciativa = await this.iniciativaModel.findByPk(id, { include: INCLUDES });
    if (!iniciativa) throw new NotFoundException('Iniciativa no encontrada.');
    return iniciativa;
  }

  async crear(dto: CreateIniciativaDto, usuario?: UsuarioAuditoria) {
    this.validarReglasNegocio(dto);
    const { legislador_ids, partido_ids, tema_ids, comision_ids, ...datos } = dto;

    // Todo en una sola transacción: si falla la sincronización de catálogos
    // (p. ej. un id de catálogo que ya no existe), la iniciativa tampoco se
    // crea. Sin esto quedaba un registro a medias, sin sus relaciones.
    let iniciativa: Iniciativa;
    try {
      iniciativa = await this.iniciativaModel.sequelize!.transaction(async (transaction) => {
        const nueva = await this.iniciativaModel.create({ ...datos } as any, { transaction });
        await this.sincronizarCatalogos(
          nueva, { legislador_ids, partido_ids, tema_ids, comision_ids }, transaction,
        );
        return nueva;
      });
    } catch (e) {
      throw this.traducirErrorGuardado(e, dto.numero);
    }

    if (usuario) {
      await this.auditoriaService.registrar(
        usuario.rfc, usuario.nombre, 'Registro de iniciativa', `Iniciativa ${dto.numero}`, 'Correcto',
      );
    }
    return this.findOne(iniciativa.id);
  }

  async actualizar(id: number, dto: UpdateIniciativaDto, usuario?: UsuarioAuditoria) {
    const iniciativa = await this.findOne(id);
    this.validarReglasNegocio(dto);
    const { legislador_ids, partido_ids, tema_ids, comision_ids, ...datos } = dto;

    try {
      await this.iniciativaModel.sequelize!.transaction(async (transaction) => {
        await iniciativa.update(datos, { transaction });
        await this.sincronizarCatalogos(
          iniciativa, { legislador_ids, partido_ids, tema_ids, comision_ids }, transaction,
        );
      });
    } catch (e) {
      throw this.traducirErrorGuardado(e, dto.numero ?? iniciativa.numero);
    }

    if (usuario) {
      await this.auditoriaService.registrar(
        usuario.rfc, usuario.nombre, 'Edición de iniciativa', `Iniciativa ${iniciativa.numero}`, 'Correcto',
      );
    }
    return this.findOne(id);
  }

  async eliminar(id: number, usuario?: UsuarioAuditoria) {
    const iniciativa = await this.findOne(id);
    const numero = iniciativa.numero;
    await iniciativa.destroy();

    if (usuario) {
      await this.auditoriaService.registrar(
        usuario.rfc, usuario.nombre, 'Eliminación de iniciativa', `Iniciativa ${numero}`, 'Correcto',
      );
    }
    return { ok: true };
  }

  async importar(dto: ImportarIniciativasDto, usuario?: UsuarioAuditoria) {
    const agregarCatalogos = dto.agregarCatalogos !== false;
    const siExiste = dto.siExiste ?? 'omitir';

    let creadas = 0;
    let actualizadas = 0;
    let omitidas = 0;
    const catalogosCreados: Record<string, Set<string>> = {
      legisladores: new Set(), partidos: new Set(), temas: new Set(),
      comisiones: new Set(), legislaturas: new Set(), estatus: new Set(),
    };
    const errores: { fila: number; numero: string; motivo: string }[] = [];

    for (let i = 0; i < dto.filas.length; i++) {
      const fila = dto.filas[i];
      try {
        const existente = await this.iniciativaModel.findOne({ where: { numero: fila.numero } });
        if (existente && siExiste === 'omitir') { omitidas++; continue; }

        const legislaturaId = fila.legislatura
          ? await this.resolverCatalogo(this.legislaturaModel, fila.legislatura, agregarCatalogos, catalogosCreados.legislaturas)
          : null;
        const estatusId = fila.estatus
          ? await this.resolverCatalogo(this.estatusModel, fila.estatus, agregarCatalogos, catalogosCreados.estatus)
          : null;

        const legisladorIds = await this.resolverCatalogoMulti(this.legisladorModel, fila.promotores, agregarCatalogos, catalogosCreados.legisladores);
        const partidoIds = await this.resolverCatalogoMulti(this.partidoModel, fila.partidos, agregarCatalogos, catalogosCreados.partidos);
        const temaIds = await this.resolverCatalogoMulti(this.temaModel, fila.temas, agregarCatalogos, catalogosCreados.temas);
        const comisionIds = await this.resolverCatalogoMulti(this.comisionModel, fila.comisiones, agregarCatalogos, catalogosCreados.comisiones);

        const datos = this.mapearFilaImportacion(fila, legislaturaId, estatusId);

        await this.iniciativaModel.sequelize!.transaction(async (transaction) => {
          let iniciativa: Iniciativa;
          if (existente) {
            await existente.update(datos as any, { transaction });
            iniciativa = existente;
            actualizadas++;
          } else {
            iniciativa = await this.iniciativaModel.create(datos as any, { transaction });
            creadas++;
          }

          await this.sincronizarCatalogos(iniciativa, {
            legislador_ids: legisladorIds, partido_ids: partidoIds, tema_ids: temaIds, comision_ids: comisionIds,
          }, transaction);
        });
      } catch (e: any) {
        omitidas++;
        errores.push({ fila: i + 1, numero: fila.numero, motivo: e?.message ?? 'Error desconocido' });
      }
    }

    if (usuario) {
      await this.auditoriaService.registrar(
        usuario.rfc, usuario.nombre, 'Carga masiva CSV', dto.nombreArchivo || 'archivo.csv',
        `${creadas} altas, ${actualizadas} actualizaciones, ${omitidas} omitidas`,
      );
    }

    return {
      total: dto.filas.length,
      creadas,
      actualizadas,
      omitidas,
      catalogosCreados: Object.fromEntries(
        Object.entries(catalogosCreados).map(([k, v]) => [k, [...v]]),
      ),
      errores,
    };
  }

  private mapearFilaImportacion(fila: ImportarIniciativaFilaDto, legislaturaId: number | null, estatusId: number | null) {
    return {
      numero: fila.numero,
      fecha_presentacion: fila.fecha_presentacion,
      legislatura_id: legislaturaId,
      titulo: fila.titulo,
      subtema: fila.subtema || null,
      resumen: fila.resumen || null,
      estatus_id: estatusId,
      enlace: fila.enlace || null,
      palabras_clave: fila.palabras_clave || null,
      nivel_viabilidad_tecnica: (fila.nivel_viabilidad_tecnica || null) as any,
      nivel_viabilidad_juridica: (fila.nivel_viabilidad_juridica || null) as any,
      problema: fila.problema || null,
      objetivo: fila.objetivo || null,
      resumen_general: fila.resumen_general || null,
      beneficios: fila.beneficios || null,
      riesgos: fila.riesgos || null,
      que_funcionaria: fila.que_funcionaria || null,
      que_podria_fracasar: fila.que_podria_fracasar || null,
      recomendacion: fila.recomendacion || null,
    };
  }

  private async resolverCatalogo(model: any, nombre: string, crear: boolean, creados: Set<string>): Promise<number | null> {
    const valor = nombre.trim();
    if (!valor) return null;

    const existente = await model.findOne({ where: { nombre: valor } });
    if (existente) return existente.id;
    if (!crear) return null;

    const nuevo = await model.create({ nombre: valor, status: 1 });
    creados.add(valor);
    return nuevo.id;
  }

  private async resolverCatalogoMulti(model: any, nombres: string[], crear: boolean, creados: Set<string>): Promise<number[]> {
    const ids: number[] = [];
    for (const nombre of nombres ?? []) {
      const id = await this.resolverCatalogo(model, nombre, crear, creados);
      if (id) ids.push(id);
    }
    return ids;
  }

  private validarReglasNegocio(datos: { fecha_presentacion?: string; palabras_clave?: string }) {
    if (datos.fecha_presentacion) {
      const hoy = new Date().toISOString().slice(0, 10);
      if (datos.fecha_presentacion > hoy) {
        throw new BadRequestException('La fecha de presentación no puede ser futura.');
      }
    }

    if (datos.palabras_clave !== undefined) {
      const distintas = new Set(
        datos.palabras_clave.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean),
      );
      if (distintas.size < 3) {
        throw new BadRequestException('Ingrese al menos tres palabras clave diferentes.');
      }
    }
  }

  private async sincronizarCatalogos(
    iniciativa: Iniciativa,
    ids: { legislador_ids?: number[]; partido_ids?: number[]; tema_ids?: number[]; comision_ids?: number[] },
    transaction: Transaction,
  ) {
    if (ids.legislador_ids !== undefined) await (iniciativa as any).$set('legisladores', ids.legislador_ids, { transaction });
    if (ids.partido_ids !== undefined) await (iniciativa as any).$set('partidos', ids.partido_ids, { transaction });
    if (ids.tema_ids !== undefined) await (iniciativa as any).$set('temas', ids.tema_ids, { transaction });
    if (ids.comision_ids !== undefined) await (iniciativa as any).$set('comisiones', ids.comision_ids, { transaction });
  }

  /**
   * Los errores de MariaDB llegan como excepciones sin manejar y NestJS los
   * convierte en un 500 genérico que no dice nada útil. Aquí se traducen los
   * dos casos reales que puede tronar este guardado a un mensaje claro.
   */
  private traducirErrorGuardado(error: unknown, numero: string): Error {
    if (error instanceof UniqueConstraintError) {
      return new ConflictException(`Ya existe una iniciativa con el número ${numero}.`);
    }
    if (error instanceof ForeignKeyConstraintError) {
      return new BadRequestException(
        'Uno de los valores de catálogo seleccionados (legislatura, estatus, promovente, '
        + 'partido, tema o comisión) ya no existe. Actualice la página e intente de nuevo.',
      );
    }
    return error as Error;
  }
}
