import {
  Table, Column, Model, DataType, CreatedAt, UpdatedAt, ForeignKey, BelongsTo,
} from 'sequelize-typescript';
import { Iniciativa } from './ini-iniciativa.model';

@Table({ tableName: 'ini_comparativas', underscored: true, timestamps: true })
export class Comparativa extends Model {
  @Column({ type: DataType.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true })
  declare id: number;

  @ForeignKey(() => Iniciativa)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare iniciativa_id: number;

  @BelongsTo(() => Iniciativa)
  declare iniciativa: Iniciativa;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare pais: string;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare estado_region: string | null;

  @Column({ type: DataType.SMALLINT, allowNull: false })
  declare anio: number;

  @Column({ type: DataType.STRING(500), allowNull: false })
  declare nombre_ley: string;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare tema: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare resumen: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare impacto: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare que_funciono: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare que_no_funciono: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare relevancia_edomex: string | null;

  @CreatedAt declare created_at: Date;
  @UpdatedAt declare updated_at: Date;
}
