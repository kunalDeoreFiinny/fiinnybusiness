import { IsArray, IsString, IsNumber, IsOptional, ValidateNested, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErpSyncItemDto {
  @ApiProperty() @IsString() productId!: string;
  @ApiProperty() @IsNumber() @Min(0) quantity!: number;
  @ApiProperty() @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() price!: number;
  @ApiProperty() @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() mrp!: number;
}

export class ErpSyncDto {
  @ApiProperty({ type: [ErpSyncItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ErpSyncItemDto)
  items!: ErpSyncItemDto[];

  @ApiPropertyOptional({ description: 'ERP internal reference/bill number' })
  @IsOptional()
  @IsString()
  shopErpRef?: string;
}
