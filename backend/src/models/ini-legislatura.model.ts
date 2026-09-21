import { Table, Column, Model, DataType, CreatedAt, UpdatedAt, DeletedAt, HasMany } from 'sequelize-typescript';
import { Iniciativa } from './ini-iniciativa.model';

@Table({ tableName: 'ini_legislaturas', underscored: true, timestamps: true, paranoid: true })
export class Legislatura extends Model {
  @Column({ type: DataType.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(255), allowNull: false, unique: true })
  declare nombre: string;

  @Column({ type: DataType.TINYINT, allowNull: false, defaultValue: 1 })
  declare status: number;

  @HasMany(() => Iniciativa)
  declare iniciativas: Iniciativa[];

  @CreatedAt declare created_at: Date;
  @UpdatedAt declare updated_at: Date;
  @DeletedAt declare deleted_at: Date | null;
}
