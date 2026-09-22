import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Iniciativa } from '../models/ini-iniciativa.model';
import { Legislatura } from '../models/ini-legislatura.model';
import { Estatus } from '../models/ini-estatus.model';
import { Legislador } from '../models/ini-legislador.model';
import { Partido } from '../models/ini-partido.model';
import { Tema } from '../models/ini-tema.model';
import { Comision } from '../models/ini-comision.model';

const INCLUDES = [
  { model: Legislatura },
  { model: Estatus },
  { model: Legislador, through: { attributes: [] } },
  { model: Partido, through: { attributes: [] } },
  { model: Tema, through: { attributes: [] } },
  { model: Comision, through: { attributes: [] } },
];

@Injectable()
export class PublicoService {
  constructor(
    @InjectModel(Iniciativa) private readonly iniciativaModel: typeof Iniciativa,
  ) {}

  /**
   * Solo devuelve los campos de consulta ciudadana: nunca riesgos, niveles
   * de viabilidad, sus justificaciones, "qué funcionaría/fracasaría" ni la
   * recomendación final, y nunca expedientes en estatus "Borrador".
   */
  async findAll() {
    const iniciativas = await this.iniciativaModel.findAll({
      include: INCLUDES,
      order: [['fecha_presentacion', 'DESC']],
    });

    return iniciativas
      .filter((i) => i.estatus?.nombre !== 'Borrador')
      .map((i) => ({
        id: i.id,
        numero: i.numero,
        fecha_presentacion: i.fecha_presentacion,
        titulo: i.titulo,
        resumen: i.resumen,
        subtema: i.subtema,
        enlace: i.enlace,
        palabras_clave: i.palabras_clave,
        problema: i.problema,
        objetivo: i.objetivo,
        beneficios: i.beneficios,
        estatus: i.estatus?.nombre ?? null,
        legislatura: i.legislatura?.nombre ?? null,
        legisladores: (i.legisladores ?? []).map((x) => x.nombre),
        partidos: (i.partidos ?? []).map((x) => x.nombre),
        temas: (i.temas ?? []).map((x) => x.nombre),
        comisiones: (i.comisiones ?? []).map((x) => x.nombre),
      }));
  }
}
