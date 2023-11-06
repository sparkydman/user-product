import { Injectable } from '@nestjs/common';
import { CreateProductDto, ProductEntity } from './dto/product.dto';
import { Product } from './model/product.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}
  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    const product = await this.productModel.create(createProductDto);
    return product.dataValues;
  }

  async findAll(): Promise<ProductEntity[]> {
    return this.productModel.findAll();
  }

  async findOneById(id: number): Promise<ProductEntity> {
    return this.productModel.findOne({
      where: { id },
    });
  }

  async findAllByUserId(id: number): Promise<ProductEntity[]> {
    return this.productModel.findAll({ where: { userId: id }, raw: true });
  }

  async update(
    id: number,
    updateProductDto: CreateProductDto,
  ): Promise<object> {
    await this.productModel.update(updateProductDto, { where: { id } });
    return { message: 'Product updated successfully' };
  }

  async remove(id: number) {
    await this.productModel.destroy({ where: { id } });
    return { message: 'Product deleted successfully' };
  }
}
