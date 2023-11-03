import { Model, Table, Column, HasMany } from 'sequelize-typescript';
import { Product } from 'src/product/model/product.model';

@Table
export class User extends Model {
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
