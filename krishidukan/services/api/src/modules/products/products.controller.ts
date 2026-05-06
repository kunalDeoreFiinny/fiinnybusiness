import {
  Controller, Get, Post, Param, Body, Query,
  UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AdminGuard } from '../../common/guards/admin.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ProductCategory } from '@krishidukan/shared';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List / search product master catalogue' })
  @ApiQuery({ name: 'category', enum: ProductCategory, required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('category') category?: ProductCategory,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.productsService.findAll(category, search, page, limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Add product to master catalogue (admin only)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
