import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { User } from 'src/user/model/user.model';

@Table
export class Product extends Model {
  @Column
  companyName: string;
  @Column
  numberOfUsers: number;
  @Column
  numberOfProducts: number;
  @Column
  percentage: number;
  @ForeignKey(() => User)
  @Column
  userId: number;
}
