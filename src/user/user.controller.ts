import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  Res,
  Patch,
  Req,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request as ExpressReq } from 'express';
import { UserService } from './user.service';
import {
  createUserSchema,
  CreateUserDto,
  LoginDto,
  loginUserSchema,
  multiUsers,
  MultiUsersDto,
} from './dto/user.dto';
import { ZodValidationPipe } from '../decorators/validation.pipe';
import { Public } from '../decorators/auth.guard';
import { Roles } from '../decorators/permission.guard';
import { Role } from '../utils/enums';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('create')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Public()
  @Post('login')
  @UsePipes(new ZodValidationPipe(loginUserSchema))
  async login(@Body() loginDto: LoginDto, @Res() response: Response) {
    const user = await this.userService.login(loginDto);
    response.cookie('refreshToken', user.refreshToken, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    response.status(200).send({
      isSucess: true,
      message: 'user logged in successfully',
      data: user,
    });
  }

  @Get('me')
  loggedInUser(@Req() request: Request) {
    return request['user'];
  }

  @Get('logout')
  async logoutUser(@Req() request: Request, @Res() response: Response) {
    const user = request['user'];
    await this.userService.logout(user.id);
    response.clearCookie('refreshToken');
    response.status(200).send({
      isSucess: true,
      message: 'Logout user successfully',
      data: null,
    });
  }

  @Public()
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(+id);
  }

  @Public()
  @Get('refresh/token')
  refresToken(@Req() req: ExpressReq) {
    const token = req.cookies?.refreshToken || '';
    if (!token) {
      throw new BadRequestException('refresh token not found in the cookie');
    }
    return this.userService.refreshToken(token);
  }

  @Roles(Role.Admin)
  @Get(':id/products')
  userProducts(@Param('id') id: string) {
    return this.userService.userWithProducts(+id);
  }

  @Roles(Role.Admin)
  @Post('products')
  @UsePipes(new ZodValidationPipe(multiUsers))
  usersProducts(@Body() ids: MultiUsersDto) {
    return this.userService.usersWithProducts(ids.userIds);
  }

  @Public()
  @Get('/email/:email')
  findOneByEmail(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @Roles(Role.Admin)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: CreateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
