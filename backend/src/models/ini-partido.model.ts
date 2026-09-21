import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, DeletedAt, BelongsToMany } from 'sequelize-typescript';
import { Iniciativa } from './ini-iniciativa.model';
import { IniciativaPartido } from './ini-iniciativa-partido.model';

@Table({ tableName: 'ini_partidos', underscored: true, timestamps: true, paranoid: true })
export class Partido extends Model {
  @Column({ type: DataType.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  declare nombre: string;

  @Column({ type: DataType.TINYINT, allowNull: false, defaultValue: 1 })
  declare status: number;

  @BelongsToMany(() => Iniciativa, () => IniciativaPartido)
  declare iniciativas: Iniciativa[];

  @CreatedAt declare created_at: Date;
  @UpdatedAt declare updated_at: Date;
  @DeletedAt declare deleted_at: Date | null;
}
