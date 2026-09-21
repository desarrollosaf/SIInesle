import { Table, Column, Model, DataType, CreatedAt } from 'sequelize-typescript';

@Table({ tableName: 'ini_auditoria', underscored: true, timestamps: true, updatedAt: false })
export class Auditoria extends Model {
  @Column({ type: DataType.BIGINT.UNSIGNED, primaryKey: true, autoIncrement: true })
  declare id: number;

  @Column({ type: DataType.STRING(20), allowNull: false })
  declare usuario_rfc: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare usuario_nombre: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare accion: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare registro: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  declare resultado: string;

  @CreatedAt declare created_at: Date;
}
