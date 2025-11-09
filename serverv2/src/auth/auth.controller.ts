import { Body, Controller, Post } from '@nestjs/common';
import AuthService from './auth.service';
import * as auth from 'types/auth';

@Controller('auth')
export default class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signup')
  async signup(@Body() body: auth.SignUpData) {
    console.log('Signup request received:', body);
    return this.authService.signUp(body);
  }

  @Post('signin')
  async signin(@Body() body: auth.SignInData) {
    console.log('Signin request received:', body);
    return this.authService.signIn(body);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: auth.emailVerificationData) {
    console.log('Email verification request received:', body);
    return this.authService.verifyEmail(body);
  }
}