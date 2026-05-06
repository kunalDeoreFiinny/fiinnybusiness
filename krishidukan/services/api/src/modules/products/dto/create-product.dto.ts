import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCategory } from '@krishidukan/shared';

export class CreateProductDto {
  @ApiProperty() @IsString() @IsNotEmpty() name!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() brand?: string;
  @ApiProperty({ enum: ProductCategory }) @IsEnum(ProductCategory) category!: ProductCategory;
  @ApiPropertyOptional() @IsOptional() @IsString() defaultImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() aliases?: string[];
}
