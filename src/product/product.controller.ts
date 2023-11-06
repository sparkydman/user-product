import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  Req,
  Request,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, createProductSchema } from './dto/product.dto';
import { ZodValidationPipe } from '../decorators/validation.pipe';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createProductSchema))
  create(@Body() createProductDto: CreateProductDto, @Req() request: Request) {
    const user = request['user'];
    createProductDto.userId = user.id;
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOneById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: CreateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
