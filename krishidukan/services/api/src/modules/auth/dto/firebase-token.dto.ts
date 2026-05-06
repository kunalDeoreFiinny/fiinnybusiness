import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FirebaseTokenDto {
  @ApiProperty({ description: 'Firebase ID token from client-side phone OTP auth' })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}
