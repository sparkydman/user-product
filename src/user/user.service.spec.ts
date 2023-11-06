import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UserService } from './user.service';
import {
  CreateUserDto,
  LoginDto,
  LoginResponse,
  UserEntity,
  UserEntityWithProducts,
} from './dto/user.dto';
import { User } from './model/user.model';
import { Session } from './model/session.model';
import { Product } from '../product/model/product.model';
import { createMock } from '@golevelup/nestjs-testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as config from 'config';
import { SessionEntity } from './dto/session.dto';
import { JwtHandler } from '../utils/jwt';
import { IJwtVerifyResponse } from '../interfaces/jwt.interface';
import { dummyProduct } from './user.controller.spec';
import { ProductEntity } from '../product/dto/product.dto';

const dummyUser = (): UserEntity => ({
  email: 'dummy@example.com',
  name: 'dummy',
  password: 'password',
  role: 'user',
  id: 1,
});
const dummyUser2 = (): UserEntity => ({
  email: 'dummy2@example.com',
  name: 'dummy2',
  password: 'password',
  role: 'user',
  id: 2,
});
const dummySession = (): SessionEntity => ({
  session: 'sessiontoken',
  userId: dummyUser().id,
  isActive: true,
  lastLogin: new Date(),
});
const dummyJwt = (
  payload: string | object,
  isValid: boolean,
  expired: boolean,
): IJwtVerifyResponse => ({
  decode: payload,
  valid: isValid,
  expired: expired,
});

describe('UserService', () => {
  let service: UserService;
  let mockProductModel: typeof Product;
  let mockUserModel: typeof User;
  let mockSessionModel: typeof Session;
  const dummy1 = dummyUser();
  const dummy2 = dummyUser2();
  const sessionData = dummySession();
  let mockJwtHandler: JwtHandler;
  let jwtResponse: IJwtVerifyResponse;
  let token: string;

  beforeEach(async () => {
    const jh = new JwtHandler(config.get<string>('private_key'));

    mockProductModel = createMock<typeof Product>();
    mockUserModel = createMock<typeof User>();
    mockSessionModel = createMock<typeof Session>();
    mockJwtHandler = createMock<JwtHandler>();
    jwtResponse = dummyJwt(dummy1, true, false);
    token = jh.genToken(dummy1, { expiresIn: '2h' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Session),
          useValue: mockSessionModel,
        },
        {
          provide: getModelToken(Product),
          useValue: mockProductModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should should throw bad request exception user exist', async () => {
    const data: CreateUserDto = dummy1;
    jest
      .spyOn(mockUserModel, 'findOne')
      .mockImplementation(() => Promise.resolve(dummy1 as any));
    await expect(service.create(data)).rejects.toThrow(BadRequestException);
  });

  it('should should create a new user', async () => {
    const data: CreateUserDto = dummy1;
    const hashPass = 'hashPassword';
    const expected = { ...dummy1, password: hashPass };
    jest
      .spyOn(mockUserModel, 'findOne')
      .mockImplementation(() => Promise.resolve(null));
    jest
      .spyOn(bcrypt, 'genSalt')
      .mockImplementation(() => Promise.resolve('10'));
    jest
      .spyOn(bcrypt, 'hash')
      .mockImplementation(() => Promise.resolve(hashPass));

    jest
      .spyOn(mockUserModel, 'create')
      .mockImplementation(() => Promise.resolve(expected));

    const res = await service.create(data);

    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      where: { email: data.email },
      raw: true,
    });
    expect(mockUserModel.create).toHaveBeenCalledWith(data, {
      returning: true,
    });
    expect(res).toBe(expected);
  });

  it('should thorw bad request exception for non existing user', async () => {
    //Arrange
    const loginData: LoginDto = dummy1;
    jest.spyOn(mockUserModel, 'findOne').mockImplementation(null);

    //Act and Assert
    await expect(service.login(loginData)).rejects.toThrow(BadRequestException);
  });

  it('should thorw bad request exception for wrong password', async () => {
    //Arrange
    const loginData: LoginDto = dummy1;
    jest
      .spyOn(mockUserModel, 'findOne')
      .mockImplementation(() => Promise.resolve(dummy1 as any));
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation(() => Promise.resolve(false));

    //Act and Assert
    await expect(service.login(loginData)).rejects.toThrow(BadRequestException);
  });

  it('should log user in', async () => {
    //Arrange
    const loginData: LoginDto = dummy1;
    jest
      .spyOn(mockUserModel, 'findOne')
      .mockImplementation(() => Promise.resolve(dummy1 as any));
    jest
      .spyOn(bcrypt, 'compare')
      .mockImplementation(() => Promise.resolve(true));
    jest.spyOn(mockSessionModel, 'upsert').mockResolvedValue(null);

    //Act
    const res = await service.login(loginData);

    //Assert
    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      where: { email: loginData.email },
      raw: true,
    });
    expect(bcrypt.compare).toHaveBeenCalled();
    expect(mockSessionModel.upsert).toHaveBeenCalled();
    expect(res).toEqual<LoginResponse>(
      expect.objectContaining<UserEntity>(dummy1),
    );
  });

  it('should get all users', async () => {
    //Arrange
    const users: UserEntity[] = [dummy1, dummy2];
    jest.spyOn(mockUserModel, 'findAll').mockResolvedValue(users as any);

    //Act
    const result = await service.findAll();

    //Assert
    expect(mockUserModel.findAll).toHaveBeenCalledWith({
      attributes: { exclude: ['password'] },
    });
    expect(result).toBe(users);
  });

  it('should throw NotFoundException for user not exist', async () => {
    //Arrange
    const user: UserEntity = dummy1;
    jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(null);

    //Assert
    await expect(service.findOneById(user.id)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should get a user with id', async () => {
    //Arrange
    const user: UserEntity = dummy1;
    jest
      .spyOn(mockUserModel, 'findOne')
      .mockImplementation(() => Promise.resolve(user as any));

    //Act
    const result = await service.findOneById(user.id);

    //Assert
    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      where: { id: user.id },
      raw: true,
      attributes: { exclude: ['password'] },
    });
    expect(result).toBe(user);
  });

  it('should get a user with email', async () => {
    //Arrange
    const user: UserEntity = dummy1;
    jest
      .spyOn(mockUserModel, 'findOne')
      .mockImplementation(() => Promise.resolve(user as any));

    //Act
    const result = await service.findOneByEmail(user.email);

    //Assert
    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      where: { email: user.email },
      raw: true,
      attributes: { exclude: ['password'] },
    });
    expect(result).toBe(user);
  });

  it('should update a user', async () => {
    //Arrange
    const user: UserEntity = dummy1;
    const data: CreateUserDto = dummy1;
    const response = {
      message: 'User updated successfully',
    };
    jest.spyOn(service, 'findOneById').mockResolvedValue(user);
    jest.spyOn(mockUserModel, 'update').mockResolvedValue(null);

    //Act
    const result: any = await service.update(user.id, data);

    //Assert
    expect(service.findOneById).toHaveBeenCalledWith(user.id);
    expect(mockUserModel.update).toHaveBeenCalled();
    expect(result.message).toBe(response.message);
  });

  it('should delete a user', async () => {
    //Arrange
    const user: UserEntity = dummy1;
    const response = {
      message: 'User deleted successfully',
    };
    jest.spyOn(service, 'findOneById').mockResolvedValue(user);
    jest.spyOn(mockUserModel, 'destroy').mockResolvedValue(null);

    //Act
    const result: any = await service.remove(user.id);

    //Assert
    expect(service.findOneById).toHaveBeenCalledWith(user.id);
    expect(mockUserModel.destroy).toHaveBeenCalledWith({
      where: { id: user.id },
    });
    expect(result.message).toBe(response.message);
  });

  it('should get a user session', async () => {
    //Arrange
    const user: UserEntity = dummy1;
    const response: SessionEntity = sessionData;
    jest
      .spyOn(mockSessionModel, 'findOne')
      .mockResolvedValue(sessionData as any);

    //Act
    const result: any = await service.getUserSession(user.id);

    //Assert
    expect(mockSessionModel.findOne).toHaveBeenCalledWith({
      where: { userId: user.id },
      raw: true,
    });
    expect(result).toBe(response);
  });

  it('should logout user', async () => {
    //Arrange
    const user: UserEntity = dummy1;
    jest.spyOn(mockSessionModel, 'update').mockResolvedValue(null);

    //Act
    await service.logout(user.id);

    //Assert
    expect(mockSessionModel.update).toHaveBeenCalledWith(
      { session: null, isActive: false },
      { where: { userId: user.id } },
    );
  });

  it('should throw BadReuestException for invalid token', async () => {
    //Arrange
    const jwtRes: any = jwtResponse;
    jwtRes.valid = false;
    jest.spyOn(mockJwtHandler, 'verifyToken').mockReturnValue(jwtRes);

    //Assert
    await expect(service.refreshToken('token')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException for not existing user', async () => {
    //Arrange
    const jwtRes: any = jwtResponse;
    jwtRes.decode.userId = 1;
    jest.spyOn(mockJwtHandler, 'verifyToken').mockImplementation(() => jwtRes);
    jest.spyOn(service, 'findOneById').mockResolvedValue(null);

    //Assert
    await expect(service.refreshToken(token)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should generate new access token', async () => {
    //Arrange
    const jwtRes: any = jwtResponse;
    jwtRes.decode.userId = 1;
    jest.spyOn(service, 'findOneById').mockResolvedValue(dummy1);

    //Act
    const res: any = await service.refreshToken(token);

    //Assert
    expect(service.findOneById).toHaveBeenCalledWith(jwtRes.decode.userId);
    expect(res).toMatchObject({ accessToken: expect.anything() });
  });

  it('should return user with list of products', async () => {
    //Arrange
    const data: UserEntityWithProducts<ProductEntity[]> = {
      ...dummy1,
      products: [dummyProduct],
    };
    jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(data as any);

    //Act
    const res = await service.userWithProducts(dummy1.id);

    //Assert
    expect(mockUserModel.findOne).toHaveBeenCalledWith({
      where: { id: dummy1.id },
      include: [Product],
      attributes: { exclude: ['password'] },
    });
    expect(res).toBe(data);
  });

  it('should return list of users with list of products', async () => {
    //Arrange
    const data: UserEntityWithProducts<ProductEntity[]>[] = [
      {
        ...dummy1,
        products: [dummyProduct],
      },
    ];
    jest.spyOn(mockUserModel, 'findAll').mockResolvedValue(data as any);

    //Act
    const res = await service.usersWithProducts([dummy1.id]);

    //Assert
    expect(mockUserModel.findAll).toHaveBeenCalledWith({
      where: { id: [dummy1.id] },
      include: [Product],
      attributes: { exclude: ['password'] },
    });
    expect(res).toBe(data);
  });
});
