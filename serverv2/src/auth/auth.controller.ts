import { Body, Controller, Delete, Get, Headers, Post } from '@nestjs/common';
import AuthService from './auth.service';
import * as dto from 'types/dto'
import { IncomingHttpHeaders } from 'http';
import { verifyToken } from '@functions/secret/JWT';
import prisma from '@libs/prisma';
import getAccessTokenfromHeaders from '@functions/others/getAccessTokenfromHeaders';
import { httpHeader } from 'types';

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
  @Post('connect')
  async getRoom(@Body() body: { email: string }, @Headers() headers: IncomingHttpHeaders & { authorization: string }) {
    console.log('Email: ', body.email);
    const token = getAccessTokenfromHeaders(headers);
    return this.authService.connectUser({ email: body.email, accessToken: token });
  }
  @Delete('connect')
  async unpair(@Headers() headers: httpHeader) {
    const token = getAccessTokenfromHeaders(headers);
    console.log('token:', token);
    return this.authService.disconnectUser(token);
  }
  @Get('roommate')

  async getRoommate(@Headers() headers: httpHeader) {
    const token = getAccessTokenfromHeaders(headers);
    return await this.authService.getRoommate(token)
  }
  @Get('refresh-profile')
  async refreshProfile(@Headers() headers: httpHeader) {
    const token = headers.authorization.split(' ')[1];
    const { success, data, message } = verifyToken(token);
    if (!success) {
      return { success, message }
    }
    const user = await prisma.users.findUnique({
      where: { id: data?.id },
      select: {
        id: true, room_part_of: true,
        name: true, email: true
      }
    });
    return { success: true, user }
  }
  @Get('poke')
  async pokeUser(@Headers() headers: httpHeader) {
    const token = getAccessTokenfromHeaders(headers);
    return this.authService.pokeUser(token);
  }

}