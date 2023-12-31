import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './model/user.model';
import { Session } from './model/session.model';
import { Product } from '../product/model/product.model';

@Module({
  imports: [SequelizeModule.forFeature([User, Session, Product])],
  controllers: [UserController],
  providers: [UserService],
  exports: [SequelizeModule.forFeature([User]), UserService],
})
export class UserModule {}
