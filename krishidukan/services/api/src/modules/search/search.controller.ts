import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { IsUUID, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { SearchService } from './search.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, DEFAULT_SEARCH_RADIUS_KM, DEFAULT_SEARCH_LIMIT } from '@krishidukan/shared';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Find shops with a product near given coordinates' })
  @ApiQuery({ name: 'productId', description: 'Product master ID (UUID)' })
  @ApiQuery({ name: 'lat', description: 'User latitude' })
  @ApiQuery({ name: 'lng', description: 'User longitude' })
  @ApiQuery({ name: 'radiusKm', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async search(
    @Query('productId') productId: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(DEFAULT_SEARCH_LIMIT), ParseIntPipe) limit = DEFAULT_SEARCH_LIMIT,
    @CurrentUser() user?: JwtPayload,
  ) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    const radius = radiusKm ? parseFloat(radiusKm) : DEFAULT_SEARCH_RADIUS_KM;

    const results = await this.searchService.searchByProduct(productId, latNum, lngNum, radius, limit, page);

    // Log async — never block the response
    setImmediate(() => {
      void this.searchService.logSearch(
        productId, latNum, lngNum, radius, results.length,
        user?.sub,
      );
    });

    return {
      results,
      total: results.length,
      productId,
      userLat: latNum,
      userLng: lngNum,
      radiusKm: radius,
    };
  }
}
