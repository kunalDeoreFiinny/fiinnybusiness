import {
  Controller, Get, Post, Body, Param,
  Query, ParseIntPipe, DefaultValuePipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { AdminService } from './admin.service';
import { AdminGuard } from '../../common/guards/admin.guard';

class RejectDto {
  @IsString() @IsNotEmpty() reason!: string;
}

class SuspendDto {
  @IsString() reason?: string;
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('shops/pending')
  @ApiOperation({ summary: 'List shops awaiting license review' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getPending(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.getPendingShops(page, limit);
  }

  @Get('shops')
  @ApiOperation({ summary: 'List all shops (filterable by status)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  getAll(
    @Query('status') status?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.adminService.getAllShops(status, page, limit);
  }

  @Get('shops/:id')
  @ApiOperation({ summary: 'Get shop detail with all licenses' })
  getShop(@Param('id') id: string) {
    return this.adminService.getShopById(id);
  }

  @Post('shops/:id/approve')
  @ApiOperation({ summary: 'Approve shop — sets status=active, generates ERP API key' })
  approve(@Param('id') id: string) {
    return this.adminService.approveShop(id);
  }

  @Post('shops/:id/reject')
  @ApiOperation({ summary: 'Reject shop with reason' })
  reject(@Param('id') id: string, @Body() dto: RejectDto) {
    return this.adminService.rejectShop(id, dto.reason);
  }

  @Post('shops/:id/suspend')
  @ApiOperation({ summary: 'Suspend an active shop' })
  suspend(@Param('id') id: string, @Body() dto: SuspendDto) {
    return this.adminService.suspendShop(id, dto.reason);
  }

  @Get('analytics/summary')
  @ApiOperation({ summary: 'Platform-wide analytics summary' })
  getSummary() {
    return this.adminService.getSummary();
  }
}
