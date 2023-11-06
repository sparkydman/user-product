import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto, ProductEntity } from './dto/product.dto';
import { Product } from './model/product.model';
import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';

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

const moduleMocker = new ModuleMocker(global);

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;
  let createResult: ProductEntity;

  beforeEach(async () => {
    createResult = mockedProduct();
    const module: TestingModule = await Test.createTestingModule({
      // imports: [SequelizeModule.forFeature([Product])],
      controllers: [ProductController],
      // providers: [ProductService],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = module.get<ProductController>(ProductController);
    // service = module.get<ProductService>(ProductService);
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

    const result = await service.create(dto);

    expect(result).toBe(createResult);
  });
  it('should find product by id', async () => {
    jest
      .spyOn(service, 'findOneById')
      .mockImplementation(() => Promise.resolve(createResult));

    const result = await service.findOneById(1);

    expect(result).toBe(createResult);
  });
  it('should find all products', async () => {
    const result: ProductEntity[] = [];
    result.push(createResult);
    result.push(createResult);

    jest
      .spyOn(service, 'findAll')
      .mockImplementation(() => Promise.resolve(result));

    const res = await service.findAll();

    expect(res).toBe(result);
  });
  it('should find all products by user id', async () => {
    const result: ProductEntity[] = [];
    result.push(createResult);
    result.push(createResult);

    jest
      .spyOn(service, 'findAllByUserId')
      .mockImplementation(() => Promise.resolve(result));

    const res = await service.findAllByUserId(1);

    expect(res).toBe(result);
  });
  it('should return an object of successful update message', async () => {
    const msg = {
      message: 'hello',
    };
    jest
      .spyOn(service, 'update')
      .mockImplementation(() => Promise.resolve(msg));

    const result = await service.update(1, createResult);

    expect(result).toBe(msg);
  });
  it('should return an object of successful deleted message', async () => {
    const msg = {
      message: 'hello',
    };
    jest
      .spyOn(service, 'remove')
      .mockImplementation(() => Promise.resolve(msg));

    const result = await service.remove(1);

    expect(result).toBe(msg);
  });
});
