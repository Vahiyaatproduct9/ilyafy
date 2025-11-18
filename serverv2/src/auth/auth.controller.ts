import { Body, Controller, Get, Post } from '@nestjs/common';
import AuthService from './auth.service';
import * as dto from 'types/dto'

@Controller('auth/users')
export default class AuthController {
  constructor(private authService: AuthService) { }

  @Post()
  async signup(@Body() body: dto.signUpDto) {
    console.log('Signup request received:', body);
    return this.authService.signUp(body);
  }

  @Get()
  async signin(@Body() body: dto.SignInDto) {
    console.log('Signin request received:', body);
    return this.authService.signIn(body);
  }

  @Get('verify-email')
  async verifyEmail(@Body() body: dto.emailVerificationDto) {
    console.log('Email verification request received:', body);
    return this.authService.verifyEmail(body);
  }

  @Get('refresh-token')
  async refreshToken(@Body() body: dto.refreshToken) {
    console.log('Refreshing Token: ', body)
    return this.authService.refreshToken(body);
  }
}