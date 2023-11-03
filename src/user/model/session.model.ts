import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { User } from './user.model';

@Table
export class Session extends Model {
  @Column({ type: DataType.TEXT, allowNull: true })
  session: string;
  @Column({ defaultValue: new Date() })
  lastLogin: Date;
  @Column
  isActive: boolean;
  @ForeignKey(() => User)
  @Column({ primaryKey: true })
  userId: number;
}
