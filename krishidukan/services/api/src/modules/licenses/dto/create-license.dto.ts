import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LicenseType } from '@krishidukan/shared';

export class CreateLicenseDto {
  @ApiProperty({ enum: LicenseType })
  @IsEnum(LicenseType)
  licenseType!: LicenseType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  licenseNumber!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  issueDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}
