import { Table, Column, Model, DataType, ForeignKey } from 'sequelize-typescript';
import { Iniciativa } from './ini-iniciativa.model';
import { Tema } from './ini-tema.model';

@Table({ tableName: 'ini_iniciativa_temas', underscored: true, timestamps: false })
export class IniciativaTema extends Model {
  @ForeignKey(() => Iniciativa)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare iniciativa_id: number;

  @ForeignKey(() => Tema)
  @Column({ type: DataType.BIGINT.UNSIGNED, allowNull: false })
  declare tema_id: number;
}
