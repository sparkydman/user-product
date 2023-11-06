import { ModelCtor, Sequelize } from 'sequelize-typescript';
import { NestApplication } from '@nestjs/core';
import * as config from 'config';
import { ProductService } from '../../product/product.service';
import { UserService } from '../../user/user.service';
import { User } from '../../user/model/user.model';
import { Session } from '../../user/model/session.model';
import { CreateUserDto } from '../../user/dto/user.dto';
import { Product } from '../../product/model/product.model';
import { CreateProductDto } from '../../product/dto/product.dto';
import { SessionEntity } from '../../user/dto/session.dto';

export async function createTestDB(models: ModelCtor[]): Promise<Sequelize> {
  const tempDB = new Sequelize({
    dialect: 'postgres',
    host: config.get<string>('db_host'),
    port: config.get<number>('db_port'),
    username: config.get<string>('db_username'),
    password: config.get<string>('db_password'),
    database: config.get<string>('db_name'),
    logging: false,
    // synchronize: true,
    // autoLoadModels: true,
  });

  tempDB.addModels(models);

  await tempDB.sync();

  return tempDB;
}

export async function migrateData(app: NestApplication) {
  const productService = app.get(ProductService);
  const userService = app.get(UserService);

  const user = await userService.create({
    email: 'abc@abc.com',
    password: 'password',
    name: 'abc',
    photo: null,
  });

  await productService.create({
    companyName: 'abcde',
    numberOfProducts: 1,
    numberOfUsers: 1,
    percentage: 100,
    userId: user.id,
  });

  const user2 = await userService.create({
    email: 'xyz@xyz.com',
    password: 'password',
    name: 'xyz',
    photo: null,
  });

  await productService.create({
    companyName: 'xyzde',
    numberOfProducts: 2,
    numberOfUsers: 2,
    percentage: 100,
    userId: user2.id,
  });
}

export async function createUser(user: CreateUserDto): Promise<User> {
  return User.create(user);
}

export async function createProduct(
  product: CreateProductDto,
): Promise<Product> {
  return Product.create(product);
}

export async function createSession(session: SessionEntity): Promise<Session> {
  return Session.create(session);
}
