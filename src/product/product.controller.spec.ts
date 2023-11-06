import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto, ProductEntity } from './dto/product.dto';
import { Product } from './model/product.model';
import { Request } from '@nestjs/common';
import { createMock } from '@golevelup/nestjs-testing';
import { UserEntity } from '../user/dto/user.dto';

const mockedProduct = (): ProductEntity => {
  const p = new ProductEntity({
    companyName: 'aaaaaaaaaaaaaaaa',
    numberOfProducts: 3,
    numberOfUsers: 3,
    percentage: 100,
    id: 1,
    userId: 1,
  });

  return p;
};
const mockedUser = (): UserEntity => {
  const p = new UserEntity({
    name: 'example',
    email: 'example@example.com',
    id: 1,
    password: 'password',
    photo: null,
    role: 'user',
  });

  return p;
};

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;
  const createResult: ProductEntity = mockedProduct();
  const request: Request = createMock<Request>();
  request['user'] = mockedUser();

  beforeEach(async () => {
    service = new ProductService(Product);
    controller = new ProductController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create new prduct', async () => {
    const dto: CreateProductDto = {
      companyName: 'aaaa',
      numberOfProducts: 1,
      numberOfUsers: 1,
      percentage: 100,
    };
    jest
      .spyOn(service, 'create')
      .mockImplementation(() => Promise.resolve(createResult));

    const result = await controller.create(dto, request);

    expect(result).toBe(createResult);
  });

  it('should get all products', async () => {
    const dto: ProductEntity[] = [mockedProduct()];
    jest
      .spyOn(service, 'findAll')
      .mockImplementation(() => Promise.resolve([mockedProduct()]));

    const result = await controller.findAll();

    expect(result).toEqual(dto);
  });

  it('should get a product', async () => {
    const dto: ProductEntity = mockedProduct();

    jest
      .spyOn(service, 'findOneById')
      .mockImplementation(() => Promise.resolve(mockedProduct()));

    const result = await controller.findOne('1');

    expect(result).toEqual(dto);
  });

  it('should update a product', async () => {
    const dto: ProductEntity = mockedProduct();

    jest
      .spyOn(service, 'update')
      .mockImplementation(() => Promise.resolve({ message: 'updated' }));

    const result = await controller.update('1', dto);

    expect(result).toEqual(expect.objectContaining({ message: 'updated' }));
  });

  it('should delete a product', async () => {
    jest
      .spyOn(service, 'remove')
      .mockImplementation(() => Promise.resolve({ message: 'delete' }));

    const result = await controller.remove('1');

    expect(result).toEqual(expect.objectContaining({ message: 'delete' }));
  });
});
