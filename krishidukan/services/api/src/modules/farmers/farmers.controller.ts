import { Controller, Post, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FarmersService } from './farmers.service';
import { RegisterFarmerDto } from './dto/register-farmer.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@krishidukan/shared';

@ApiTags('farmers')
@ApiBearerAuth()
@Controller('farmers')
export class FarmersController {
  constructor(private farmersService: FarmersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create or update farmer profile (idempotent)' })
  register(@Body() dto: RegisterFarmerDto, @CurrentUser() user: JwtPayload) {
    return this.farmersService.upsert(user.sub, user.phone, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get own farmer profile' })
  getMe(@CurrentUser() user: JwtPayload) {
    return this.farmersService.findByFirebaseUid(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update farmer name / location' })
  update(@Body() dto: RegisterFarmerDto, @CurrentUser() user: JwtPayload) {
    return this.farmersService.upsert(user.sub, user.phone, dto);
  }
}
