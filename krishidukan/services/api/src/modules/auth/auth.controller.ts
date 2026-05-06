import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { FirebaseTokenDto } from './dto/firebase-token.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';
import { Req } from '@nestjs/common';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(FirebaseAuthGuard)
  @Post('login')
  @ApiOperation({ summary: 'Exchange Firebase ID token for KrishiDukan JWT' })
  login(@Body() dto: FirebaseTokenDto) {
    return this.authService.loginWithFirebaseToken(dto.idToken);
  }
}
