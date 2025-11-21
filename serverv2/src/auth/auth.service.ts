import { Injectable } from '@nestjs/common';
import User from '@functions/auth/User';
import { emailVerificationData, refreshToken, SignInData, SignUpData } from 'types/auth';
import Connection from '@functions/connect/connect';

@Injectable({})
export default class AuthService {
  private user: User;
  private connection: Connection;
  constructor() {
    this.user = new User()
    this.connection = new Connection();
  }
  signUp(info: SignUpData) {
    return this.user.signup(info)
  }
  signIn(info: SignInData) {
    return this.user.signin(info)
  }
  verifyEmail(info: emailVerificationData) {
    return this.user.verifyEmail(info)
  }
  refreshToken(info: refreshToken) {
    return this.user.refreshToken(info)
  }
  connectUser(info: { accessToken: string; email: string; }) {
    return this.connection.connectUser(info)
  }
  searchUser(info: string) {
    return this.connection.search(info)
  }
}