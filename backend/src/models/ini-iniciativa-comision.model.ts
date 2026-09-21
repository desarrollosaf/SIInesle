import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Iniciativa } from './ini-iniciativa.model';
import { Comision } from './ini-comision.model';

@Table({ tableName: 'ini_iniciativa_comisiones', underscored: true, timestamps: false })
export class IniciativaComision extends Model {
  @ForeignKey(() => Iniciativa)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare iniciativa_id: number;

  @ForeignKey(() => Comision)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare comision_id: number;
}
