import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
} from 'sequelize-typescript';
import { User } from './user.model';
import { SessionEntity } from '../dto/session.dto';

@Table({ updatedAt: false, createdAt: false })
export class Session extends Model<SessionEntity> {
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
