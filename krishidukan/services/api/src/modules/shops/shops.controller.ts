import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload } from '@krishidukan/shared';

@ApiTags('shops')
@ApiBearerAuth()
@Controller('shops')
export class ShopsController {
  constructor(private shopsService: ShopsService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new shop (status: pending_review)' })
  create(@Body() dto: CreateShopDto, @CurrentUser() user: JwtPayload) {
    return this.shopsService.create(dto, user.sub);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get own shop profile with licenses and subscription' })
  getMyShop(@CurrentUser() user: JwtPayload) {
    return this.shopsService.findByFirebaseUid(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update own shop profile' })
  updateMyShop(@Body() dto: UpdateShopDto, @CurrentUser() user: JwtPayload) {
    return this.shopsService.update(user.sub, dto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get shop public profile (active shops only)' })
  getShop(@Param('id') id: string) {
    return this.shopsService.findById(id);
  }
}
