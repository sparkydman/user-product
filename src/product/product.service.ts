import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/product.dto';
import { Product } from './model/product.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}
  async create(createProductDto: CreateProductDto) {
    return this.productModel.create(createProductDto);
  }

  async findAll() {
    return this.productModel.findAll();
  }

  async findOneById(id: number) {
    return this.productModel.findOne({ where: { id } });
  }

  async findAllByUserId(id: number) {
    return this.productModel.findOne({ where: { userId: id } });
  }

  async update(id: number, updateProductDto: CreateProductDto) {
    return this.productModel.update(updateProductDto, { where: { id } });
  }

  async remove(id: number) {
    return this.productModel.destroy({ where: { id } });
  }
}
