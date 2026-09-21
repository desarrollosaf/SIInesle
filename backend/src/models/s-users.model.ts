import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 's_users', paranoid: false, timestamps: false })
export class SUsers extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false })
  declare id: number;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare username: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare password: string;

  @Column({ type: DataType.STRING(7), allowNull: true })
  declare salt: string;

  @Column({ type: DataType.STRING(50), allowNull: true })
  declare email: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare id_user: number;

  @Column({ type: DataType.STRING(100), allowNull: true, field: 'Level' })
  declare Level: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare rango: number;
}
