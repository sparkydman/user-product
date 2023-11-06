import { Table, Column, Model, ForeignKey } from 'sequelize-typescript';
import { User } from '../../user/model/user.model';
import { ProductEntity } from '../dto/product.dto';

@Table({ updatedAt: false, createdAt: false })
export class Product extends Model<ProductEntity> {
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
