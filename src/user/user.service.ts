import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDto, LoginDto, LoginResponse } from './dto/user.dto';
import { User } from './model/user.model';
import * as bcrypt from 'bcrypt';
import * as config from 'config';
import { JwtHandler } from 'src/utils/jwt';
import { Session } from './model/session.model';
import { SessionDto } from './dto/session.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Session)
    private readonly sessionModel: typeof Session,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const isUserExist = await this.userModel.findOne({
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
    await this.userModel.create(createUserDto, {
      returning: false,
    });
    return {
      message: 'user created successfully',
    };
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
      { user },
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

  async findAll() {
    return this.userModel.findAll({ attributes: { exclude: ['password'] } });
  }

  async findOneById(id: number) {
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

  async findOneByEmail(email: string) {
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

  async update(id: number, updateUserDto: CreateUserDto) {
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

  async remove(id: number) {
    const isUserExist = await this.findOneById(id);
    if (!isUserExist) {
      throw new NotFoundException(`User ${id} does not exist`);
    }
    await this.userModel.destroy({ where: { id } });
    return {
      message: 'User deleted successfully',
    };
  }

  async getUserSession(id: number): Promise<SessionDto> {
    return this.sessionModel.findOne({ where: { userId: id }, raw: true });
  }

  async logout(id: number) {
    return this.sessionModel.update(
      { session: null, isActive: false },
      { where: { userId: id } },
    );
  }
}
