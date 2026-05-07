import {
  Controller, Post, Get, Delete, Param, Body,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { LicensesService } from './licenses.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload, UserRole } from '@krishidukan/shared';

interface MulterFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

@ApiTags('licenses')
@ApiBearerAuth()
@Controller('licenses')
export class LicensesController {
  constructor(private licensesService: LicensesService) {}

  @Post()
  @ApiOperation({ summary: 'Upload a license document for own shop' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('document', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async upload(
    @Body() dto: CreateLicenseDto,
    @UploadedFile() file: MulterFile | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('Document file is required');
    if (!user.shopId) throw new BadRequestException('Shop not found for this account');

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF, JPG, PNG, or WEBP files are allowed');
    }

    return this.licensesService.create(user.shopId, dto, file.buffer, file.mimetype, file.originalname);
  }

  @Get('my-shop')
  @ApiOperation({ summary: 'List licenses for own shop' })
  getMyLicenses(@CurrentUser() user: JwtPayload) {
    if (!user.shopId) throw new BadRequestException('Shop not found');
    return this.licensesService.findByShopId(user.shopId);
  }

  @Get(':id/url')
  @ApiOperation({ summary: 'Get 15-min signed URL for a license document' })
  async getSignedUrl(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const isAdmin = user.role === UserRole.ADMIN;
    const url = await this.licensesService.getSignedUrl(id, user.shopId ?? null, isAdmin);
    return { url };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a license' })
  delete(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    if (!user.shopId) throw new BadRequestException('Shop not found');
    return this.licensesService.delete(id, user.shopId);
  }
}
