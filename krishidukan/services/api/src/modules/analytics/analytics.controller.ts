import { Controller, Post, Get, Body, Param, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { AnalyticsService } from './analytics.service';
import { AdminGuard } from '../../common/guards/admin.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload, ActionType, UserRole } from '@krishidukan/shared';

class LogEventDto {
  @IsString() shopId!: string;
  @IsEnum(ActionType) action!: ActionType;
  @IsOptional() @IsString() productId?: string;
}

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Public()
  @Post('event')
  @ApiOperation({ summary: 'Log a farmer interaction event (view, call, direction)' })
  logEvent(@Body() dto: LogEventDto, @CurrentUser() user?: JwtPayload) {
    return this.analyticsService.logEvent(dto.shopId, dto.action, user?.sub, dto.productId);
  }

  @ApiBearerAuth()
  @Get('shop/:id')
  @ApiOperation({ summary: 'Get analytics stats for a shop (owner or admin)' })
  getShopStats(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const isOwner = user.shopId === id;
    const isAdmin = user.role === UserRole.ADMIN;
    if (!isOwner && !isAdmin) throw new BadRequestException('Access denied');
    return this.analyticsService.getShopStats(id);
  }
}
