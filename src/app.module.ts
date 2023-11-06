import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CatchAllExceptions } from './decorators/error.handler';
import { AuthRequired } from './decorators/auth.guard';
import { PermissionRequired } from './decorators/permission.guard';
import { ProductModule } from './product/product.module';
import { GeneralResponse } from './decorators/response.interceptor';
import * as config from 'config';
@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: config.get<string>('db_host'),
      port: config.get<number>('db_port'),
      username: config.get<string>('db_username'),
      password: config.get<string>('db_password'),
      database: config.get<string>('db_name'),
      logging: false,
      synchronize: true,
      autoLoadModels: true,
    }),
    UserModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: CatchAllExceptions },
    { provide: APP_GUARD, useClass: AuthRequired },
    { provide: APP_GUARD, useClass: PermissionRequired },
    { provide: APP_INTERCEPTOR, useClass: GeneralResponse },
    AppService,
  ],
})
export class AppModule {}
