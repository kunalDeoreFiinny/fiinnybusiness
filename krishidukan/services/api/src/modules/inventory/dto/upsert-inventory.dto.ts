import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertInventoryDto {
  @ApiProperty({ description: 'Selling price in INR' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @ApiProperty({ description: 'Maximum retail price in INR' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  mrp!: number;

  @ApiProperty({ description: 'Current stock quantity' })
  @IsNumber()
  @Min(0)
  quantity!: number;
}
