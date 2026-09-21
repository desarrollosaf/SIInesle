import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Comparativa } from '../models/ini-comparativa.model';
import { Iniciativa } from '../models/ini-iniciativa.model';

export interface ComparativaPayload {
  iniciativa_id: number;
  pais: string;
  estado_region?: string | null;
  anio: number;
  nombre_ley: string;
  tema?: string | null;
  resumen?: string | null;
  impacto?: string | null;
  que_funciono?: string | null;
  que_no_funciono?: string | null;
  relevancia_edomex?: string | null;
}

@Injectable()
export class ComparativasService {
  constructor(
    @InjectModel(Comparativa) private readonly comparativaModel: typeof Comparativa,
  ) {}

  async findAll() {
    return this.comparativaModel.findAll({
      include: [{ model: Iniciativa, attributes: ['id', 'numero', 'titulo'] }],
      order: [['created_at', 'DESC']],
    });
  }

  async findOne(id: number) {
    const comparativa = await this.comparativaModel.findByPk(id);
    if (!comparativa) throw new NotFoundException('Comparativa no encontrada.');
    return comparativa;
  }

  async crear(data: ComparativaPayload) {
    return this.comparativaModel.create({ ...data } as any);
  }

  async actualizar(id: number, data: Partial<ComparativaPayload>) {
    const comparativa = await this.findOne(id);
    await comparativa.update(data);
    return comparativa;
  }

  async eliminar(id: number) {
    const comparativa = await this.findOne(id);
    await comparativa.destroy();
    return { ok: true };
  }
}
