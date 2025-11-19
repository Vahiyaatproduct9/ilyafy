import { Body, Controller, Post } from '@nestjs/common';
import AuthService from './auth.service';
import * as dto from 'types/dto'

@Controller('auth/users')
export default class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signup')
  async signup(@Body() body: dto.signUpDto) {
    console.log('Signup request received:', body);
    return this.authService.signUp(body);
  }

  @Post('signin')
  async signin(@Body() body: dto.SignInDto) {
    console.log('Signin request received:', body);
    return this.authService.signIn(body);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: dto.emailVerificationDto) {
    console.log('Email verification request received:', body);
    return this.authService.verifyEmail(body);
  }

  @Post('refresh-token')
  async refreshToken(@Body() body: dto.refreshToken) {
    console.log('Refreshing Token: ', body)
    return this.authService.refreshToken(body);
  }
}