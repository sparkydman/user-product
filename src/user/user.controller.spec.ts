import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './model/user.model';
import { Session } from './model/session.model';
import { Product } from '../product/model/product.model';
import { createMock } from '@golevelup/nestjs-testing';
import { Request, BadRequestException } from '@nestjs/common';
import { Request as ExpressReq, Response } from 'express';
// import express from 'express'
import {
  CreateUserDto,
  LoginDto,
  LoginResponse,
  MultiUsersDto,
  UserEntity,
  UserEntityWithProducts,
} from './dto/user.dto';
import { ProductEntity } from '../product/dto/product.dto';

const dummyUserEntity = new UserEntity({
  email: 'dummy@example.com',
  id: 1,
  name: 'dummy',
  password: 'password',
  photo: null,
  role: 'user',
});
export const dummyProduct = new ProductEntity({
  companyName: 'abc',
  id: 1,
  numberOfProducts: 1,
  numberOfUsers: 1,
  percentage: 100,
  userId: 1,
});

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let mockRequest: Request;
  let mockExpressRequest: ExpressReq;
  let mockResponse: Response;

  beforeEach(async () => {
    mockRequest = createMock<Request>();
    mockExpressRequest = createMock<ExpressReq>();
    mockResponse = createMock<Response>();
    service = new UserService(User, Session, Product);
    controller = new UserController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new user', async () => {
    const data: CreateUserDto = dummyUserEntity;

    jest
      .spyOn(service, 'create')
      .mockImplementation(() => Promise.resolve(dummyUserEntity));

    const result = await controller.create(data);

    expect(result).toBe(dummyUserEntity);
  });

  it('should login a user', async () => {
    const data: LoginDto = dummyUserEntity;
    const loginRes: LoginResponse = {
      ...dummyUserEntity,
      accessToken: '123',
      refreshToken: '321',
    };
    const res = {
      isSuccess: true,
      message: 'hi',
      data: loginRes,
    };

    mockResponse.cookie('hello', 'token', {});
    mockResponse.status(200);
    mockResponse.send(res);

    jest
      .spyOn(service, 'login')
      .mockImplementation(() => Promise.resolve(loginRes));

    await controller.login(data, mockResponse);

    expect(mockResponse.cookie).toHaveBeenCalled;
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(res);
  });

  it('should logout a user', async () => {
    const data: UserEntity = dummyUserEntity;
    mockRequest['user'] = data;
    const res = { isSuccess: true, message: 'hi', data: null };

    mockResponse.clearCookie('hi');
    mockResponse.status(200);
    mockResponse.send(res);

    jest.spyOn(service, 'logout').mockImplementation(() => Promise.resolve());

    await controller.logoutUser(mockRequest, mockResponse);

    expect(mockRequest['user']).toBe(data);
    expect(mockResponse.clearCookie).toHaveBeenCalledWith('hi');
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.send).toHaveBeenCalledWith(res);
  });

  it('should get logged in user', async () => {
    const data: UserEntity = dummyUserEntity;
    mockRequest['user'] = data;

    await controller.loggedInUser(mockRequest);

    expect(mockRequest['user']).toBe(data);
  });

  it('should get all users', async () => {
    const data: UserEntity[] = [dummyUserEntity];

    jest
      .spyOn(service, 'findAll')
      .mockImplementation(() => Promise.resolve(data));

    const res = await controller.findAll();

    expect(res).toBe(data);
  });

  it('should get a single user', async () => {
    const data: UserEntity = dummyUserEntity;

    jest
      .spyOn(service, 'findOneById')
      .mockImplementation(() => Promise.resolve(data));

    const res = await controller.findOne(data.id.toString());

    expect(res).toBe(data);
  });

  it('should throw exception when refreshToken cookie is not set', async () => {
    mockExpressRequest.cookies['refreshToken'] = undefined;

    expect(mockExpressRequest.cookies).toHaveBeenCalled;
    expect(() => controller.refresToken(mockExpressRequest)).toThrow(
      BadRequestException,
    );
  });

  it('should return access token', async () => {
    mockExpressRequest.cookies['refreshToken'] = 'refreshToken';
    const expectation = { token: 'token' };
    jest
      .spyOn(service, 'refreshToken')
      .mockImplementation(() => Promise.resolve(expectation));

    const res = await controller.refresToken(mockExpressRequest);

    expect(mockExpressRequest.cookies).toHaveBeenCalled;
    expect(mockExpressRequest.cookies['refreshToken']).toBe('refreshToken');
    expect(res).toBe(expectation);
  });

  it('should return user products', async () => {
    const expectation: UserEntityWithProducts<ProductEntity[]> = {
      ...dummyUserEntity,
      products: [dummyProduct],
    };
    jest
      .spyOn(service, 'userWithProducts')
      .mockImplementation(() => Promise.resolve(expectation));

    const res = await controller.userProducts(expectation.id.toString());

    expect(res).toBe(expectation);
  });

  it('should return users with their products', async () => {
    const expectation: UserEntityWithProducts<ProductEntity[]>[] = [
      {
        ...dummyUserEntity,
        products: [dummyProduct],
      },
    ];
    jest
      .spyOn(service, 'usersWithProducts')
      .mockImplementation(() => Promise.resolve(expectation));

    const req: MultiUsersDto = {
      userIds: [1],
    };
    const res = await controller.usersProducts(req);

    expect(res).toBe(expectation);
  });

  it('should get user by email', async () => {
    const expectation: UserEntity = dummyUserEntity;
    jest
      .spyOn(service, 'findOneByEmail')
      .mockImplementation(() => Promise.resolve(expectation));

    const res = await controller.findOneByEmail(expectation.email);

    expect(res).toBe(expectation);
  });

  it('should update user', async () => {
    const expectation: UserEntity = dummyUserEntity;
    const req: CreateUserDto = dummyUserEntity;
    jest
      .spyOn(service, 'update')
      .mockImplementation(() => Promise.resolve(expectation));

    const res = await controller.update(expectation.id.toString(), req);

    expect(res).toBe(expectation);
  });

  it('should delete user', async () => {
    const expectation = { message: 'delete' };
    jest
      .spyOn(service, 'remove')
      .mockImplementation(() => Promise.resolve(expectation));

    const res = await controller.remove('1');

    expect(res).toBe(expectation);
  });
});
