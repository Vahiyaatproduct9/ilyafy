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
    const token = info.refreshToken;
    return this.user.refreshToken(token)
  }
  deleteUser(token: string) {
    return this.user.deleteUser(token);
  }
  connectUser(info) {
    return this.connection.connectUser(info)
  }
  disconnectUser(token: string) {
    return this.connection.disconnectUser(token);
  }
  searchUser(info: string) {
    return this.connection.search(info)
  }
  pokeUser(token: string) {
    return this.user.pokeUser(token);
  }
  async getRoommate(token: string) {
    const result = await this.user.getRoommate(token);
    return result;
  }
}