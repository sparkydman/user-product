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
} from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import {
  createUserSchema,
  CreateUserDto,
  LoginDto,
  loginUserSchema,
} from './dto/user.dto';
import { ZodValidationPipe } from 'src/decorators/validation.pipe';
import { Public } from 'src/decorators/auth.guard';
import { Roles } from 'src/decorators/permission.guard';
import { Role } from 'src/utils/enums';

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
    return response.status(200).json({
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
    return response.status(200).json({
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
  @Get(':email')
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
