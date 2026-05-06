import {
  Controller, Get, Put, Delete, Post,
  Param, Body, BadRequestException, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { UpsertInventoryDto } from './dto/upsert-inventory.dto';
import { ErpSyncDto } from './dto/erp-sync.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ErpApiKeyGuard } from '../../common/guards/erp-api-key.guard';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload, ERP_API_KEY_HEADER } from '@krishidukan/shared';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @ApiBearerAuth()
  @Get('my-shop')
  @ApiOperation({ summary: 'Get all inventory items for own shop' })
  getMyShop(@CurrentUser() user: JwtPayload) {
    if (!user.shopId) throw new BadRequestException('No shop associated with this account');
    return this.inventoryService.findByShop(user.shopId);
  }

  @ApiBearerAuth()
  @Put(':productId')
  @ApiOperation({ summary: 'Add or update a product in own shop inventory' })
  upsert(
    @Param('productId') productId: string,
    @Body() dto: UpsertInventoryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!user.shopId) throw new BadRequestException('No shop associated with this account');
    return this.inventoryService.upsert(user.shopId, productId, dto);
  }

  @ApiBearerAuth()
  @Delete(':productId')
  @ApiOperation({ summary: 'Remove a product from own shop inventory' })
  remove(@Param('productId') productId: string, @CurrentUser() user: JwtPayload) {
    if (!user.shopId) throw new BadRequestException('No shop associated with this account');
    return this.inventoryService.remove(user.shopId, productId);
  }

  @Public()
  @UseGuards(ErpApiKeyGuard)
  @Post('erp-sync/:shopId')
  @ApiOperation({ summary: 'Bulk sync inventory from ERP system' })
  @ApiHeader({ name: ERP_API_KEY_HEADER, description: 'Per-shop ERP API key', required: true })
  erpSync(@Param('shopId') shopId: string, @Body() dto: ErpSyncDto) {
    return this.inventoryService.bulkUpsertFromErp(shopId, dto);
  }
}
