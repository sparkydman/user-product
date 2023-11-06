import { Model, Table, Column, HasMany } from 'sequelize-typescript';
import { Product } from '../../product/model/product.model';
import { UserEntity } from '../dto/user.dto';

@Table({ updatedAt: false, createdAt: false })
export class User extends Model<UserEntity> {
  @Column
  name: string;

  @Column
  email: string;

  @Column
  password: string;

  @Column
  photo: string;

  @Column({ defaultValue: 'user' })
  role: string;

  @HasMany(() => Product)
  products: Product[];
}
