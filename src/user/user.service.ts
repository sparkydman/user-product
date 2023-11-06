import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CreateUserDto,
  LoginDto,
  LoginResponse,
  UserEntity,
  UserEntityWithProducts,
} from './dto/user.dto';
import { User } from './model/user.model';
import * as bcrypt from 'bcrypt';
import * as config from 'config';
import { JwtHandler } from '../utils/jwt';
import { Session } from './model/session.model';
import { SessionEntity } from './dto/session.dto';
import { Product } from '../product/model/product.model';
import { ProductEntity } from '../product/dto/product.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Session)
    private readonly sessionModel: typeof Session,
    @InjectModel(Product)
    private readonly productModel: typeof Product,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const isUserExist: UserEntity = await this.userModel.findOne({
      where: { email: createUserDto.email },
      raw: true,
    });
    if (isUserExist) {
      throw new BadRequestException(
        `User ${createUserDto.email} already exists`,
      );
    }
    const salt = await bcrypt.genSalt(config.get<number>('salt_rounds'));
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    const createdUser: UserEntity = await this.userModel.create(createUserDto, {
      returning: true,
    });
    return createdUser;
  }
  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.userModel.findOne({
      where: { email: loginDto.email },
      raw: true,
    });
    if (!user) {
      throw new BadRequestException('email or password incorrect');
    }
    const isPassword = await bcrypt.compare(loginDto.password, user.password);
    if (!isPassword) {
      throw new BadRequestException('email or password incorrect');
    }
    delete user.password;
    const tokenHandler = new JwtHandler(config.get<string>('private_key'));
    const accessToken = tokenHandler.genToken(
      { user },
      {
        expiresIn: config.get<string>('access_token_ttl'),
      },
    );
    const refreshToken = tokenHandler.genToken(
      { userId: user.id },
      {
        expiresIn: config.get<string>('refresh_token_ttl'),
      },
    );
    const session: any = {
      session: accessToken,
      isActive: true,
      userId: user.id,
    };
    await this.sessionModel.upsert(session, { returning: false });
    return {
      ...user,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userModel.findAll({ attributes: { exclude: ['password'] } });
  }

  async findOneById(id: number): Promise<UserEntity> {
    const user = await this.userModel.findOne({
      where: { id },
      raw: true,
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    const user = await this.userModel.findOne({
      where: { email },
      raw: true,
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: CreateUserDto): Promise<object> {
    const isUserExist = await this.findOneById(id);
    if (!isUserExist) {
      throw new NotFoundException(`User ${id} does not exist`);
    }
    await this.userModel.update(updateUserDto, {
      where: { id },
      validate: true,
    });
    return {
      message: 'User updated successfully',
    };
  }

  async remove(id: number): Promise<object> {
    const isUserExist = await this.findOneById(id);
    if (!isUserExist) {
      throw new NotFoundException(`User ${id} does not exist`);
    }
    await this.userModel.destroy({ where: { id } });
    return {
      message: 'User deleted successfully',
    };
  }

  async getUserSession(id: number): Promise<SessionEntity> {
    return this.sessionModel.findOne({ where: { userId: id }, raw: true });
  }

  async logout(id: number): Promise<void> {
    await this.sessionModel.update(
      { session: null, isActive: false },
      { where: { userId: id } },
    );
  }

  async refreshToken(token: string): Promise<object> {
    const handler = new JwtHandler(config.get<string>('private_key'));
    const result: any = handler.verifyToken(token);
    if (!result.valid) {
      throw new BadRequestException('Invalid refresh token');
    }
    const user = await this.findOneById(result.decode?.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const accessToken = handler.genToken(
      { user },
      {
        expiresIn: config.get<string>('access_token_ttl'),
      },
    );
    return { accessToken };
  }

  async userWithProducts(
    id: number,
  ): Promise<UserEntityWithProducts<ProductEntity[]>> {
    return this.userModel.findOne({
      where: { id },
      include: [Product],
      attributes: { exclude: ['password'] },
    });
  }

  async usersWithProducts(
    ids: number[],
  ): Promise<UserEntityWithProducts<ProductEntity[]>[]> {
    return this.userModel.findAll({
      where: { id: ids },
      include: [Product],
      attributes: { exclude: ['password'] },
    });
  }
}
