import { Injectable } from '@nestjs/common';
import User from '@functions/auth/User';
import { emailVerificationData, refreshToken, SignInData, SignUpData } from 'types/auth';

@Injectable({})
export default class AuthService {
  private user: User;
  constructor() {
    this.user = new User()
  }
  signUp(info: SignUpData) {
    return this.user.signup(info)
  }
  signIn(info: SignInData) {
    console.log('level2: ', info)
    return this.user.signin(info)
  }
  verifyEmail(info: emailVerificationData) {
    return this.user.verifyEmail(info)
  }
  refreshToken(info: refreshToken) {
    return this.user.refreshToken(info)
  }
}