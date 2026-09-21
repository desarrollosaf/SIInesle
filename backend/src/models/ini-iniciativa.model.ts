import {
  Table, Column, Model, DataType, CreatedAt, UpdatedAt,
  ForeignKey, BelongsTo, BelongsToMany, HasMany,
} from 'sequelize-typescript';
import { Legislatura } from './ini-legislatura.model';
import { Estatus } from './ini-estatus.model';
import { Legislador } from './ini-legislador.model';
import { IniciativaLegislador } from './ini-iniciativa-legislador.model';
import { Partido } from './ini-partido.model';
import { IniciativaPartido } from './ini-iniciativa-partido.model';
import { Tema } from './ini-tema.model';
import { IniciativaTema } from './ini-iniciativa-tema.model';
import { Comision } from './ini-comision.model';
import { IniciativaComision } from './ini-iniciativa-comision.model';
import { Comparativa } from './ini-comparativa.model';

export type NivelViabilidad = 'Alta' | 'Media' | 'Baja';

@Table({ tableName: 'ini_iniciativas', underscored: true, timestamps: true })
export class Iniciativa extends Model {
  @Column({ type: DataType.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(12), allowNull: false, unique: true })
  declare numero: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  declare fecha_presentacion: string;

  @ForeignKey(() => Legislatura)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare legislatura_id: number | null;

  @BelongsTo(() => Legislatura)
  declare legislatura: Legislatura;

  @Column({ type: DataType.TEXT, allowNull: false })
  declare titulo: string;

  @Column({ type: DataType.STRING(300), allowNull: true })
  declare subtema: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare resumen: string | null;

  @ForeignKey(() => Estatus)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: true })
  declare estatus_id: number | null;

  @BelongsTo(() => Estatus)
  declare estatus: Estatus;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare enlace: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare palabras_clave: string | null;

  @Column({ type: DataType.ENUM('Alta', 'Media', 'Baja'), allowNull: true })
  declare nivel_viabilidad_tecnica: NivelViabilidad | null;

  @Column({ type: DataType.ENUM('Alta', 'Media', 'Baja'), allowNull: true })
  declare nivel_viabilidad_juridica: NivelViabilidad | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare problema: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare objetivo: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare resumen_general: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare beneficios: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare riesgos: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare justificacion_tecnica: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare justificacion_juridica: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare que_funcionaria: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare que_podria_fracasar: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare recomendacion: string | null;

  @BelongsToMany(() => Legislador, () => IniciativaLegislador)
  declare legisladores: Legislador[];

  @BelongsToMany(() => Partido, () => IniciativaPartido)
  declare partidos: Partido[];

  @BelongsToMany(() => Tema, () => IniciativaTema)
  declare temas: Tema[];

  @BelongsToMany(() => Comision, () => IniciativaComision)
  declare comisiones: Comision[];

  @HasMany(() => Comparativa)
  declare comparativas: Comparativa[];

  @CreatedAt declare created_at: Date;
  @UpdatedAt declare updated_at: Date;
}
