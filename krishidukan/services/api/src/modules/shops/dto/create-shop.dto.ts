import {
  IsString, IsNotEmpty, IsOptional, IsNumber,
  Min, Max, Matches, Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GST_REGEX, PHONE_REGEX, PINCODE_REGEX } from '@krishidukan/shared';

export class CreateShopDto {
  @ApiProperty() @IsString() @IsNotEmpty() ownerName!: string;
  @ApiProperty() @IsString() @IsNotEmpty() businessName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(GST_REGEX, { message: 'Invalid GST number format' })
  gst?: string;

  @ApiProperty() @IsString() @IsNotEmpty() addressLine!: string;
  @ApiProperty() @IsString() @IsNotEmpty() city!: string;
  @ApiProperty() @IsString() @IsNotEmpty() state!: string;

  @ApiProperty()
  @IsString()
  @Matches(PINCODE_REGEX, { message: 'Invalid pincode' })
  pincode!: string;

  @ApiProperty() @IsNumber() @Min(-90) @Max(90) lat!: number;
  @ApiProperty() @IsNumber() @Min(-180) @Max(180) lng!: number;

  @ApiProperty()
  @IsString()
  @Matches(PHONE_REGEX, { message: 'Phone must be in +91XXXXXXXXXX format' })
  phone!: string;
}
