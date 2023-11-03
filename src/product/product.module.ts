import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './model/product.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([Product])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [SequelizeModule.forFeature([Product])],
})
export class ProductModule {}
