import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Iniciativa } from './ini-iniciativa.model';
import { Legislador } from './ini-legislador.model';

@Table({ tableName: 'ini_iniciativa_legisladores', underscored: true, timestamps: false })
export class IniciativaLegislador extends Model {
  @ForeignKey(() => Iniciativa)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare iniciativa_id: number;

  @ForeignKey(() => Legislador)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare legislador_id: number;
}
