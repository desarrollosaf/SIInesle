import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'ini_accesos_modulos', paranoid: false, timestamps: true, underscored: true })
export class IniAccesosModulos extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare rfc: string;

  @Column({ type: DataType.STRING(50), allowNull: false })
  declare modulo: string;

  @Column({ type: DataType.TINYINT, allowNull: false, defaultValue: 1 })
  declare activo: number;

  @CreatedAt declare created_at: Date;
  @UpdatedAt declare updated_at: Date;
}
