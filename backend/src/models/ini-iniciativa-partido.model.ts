import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Iniciativa } from './ini-iniciativa.model';
import { Partido } from './ini-partido.model';

@Table({ tableName: 'ini_iniciativa_partidos', underscored: true, timestamps: false })
export class IniciativaPartido extends Model {
  @ForeignKey(() => Iniciativa)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare iniciativa_id: number;

  @ForeignKey(() => Partido)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare partido_id: number;
}
