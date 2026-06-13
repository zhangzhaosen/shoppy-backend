import { User } from '@/generated/prisma/client';
import { UsersService } from '@/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {  ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt'
import type { Response } from 'express';
import ms, { StringValue } from 'ms'
import { TokenPayload } from './token-payload.interface';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService, 
    private readonly configService: ConfigService, 
    private readonly jwtService: JwtService
  ) { }

  async login(user: User, response: Response){
    const expires = new Date()
    expires.setMilliseconds(expires.getMilliseconds() 
    + ms(this.configService.getOrThrow<StringValue>('JWT_EXPIRATION')))
    const tokenPayload : TokenPayload  = {
      userId: user.id
    }

    const token = this.jwtService.sign(tokenPayload)
    response.cookie('Authentication', token, {
      expires,
      httpOnly: true,
      secure: true,
     
    })

    return {tokenPayload}

  }
  async verifyUser(email: string, password: string) {
    try {
      const user = await this.userService.getUser({ email });
      const authenticated = await bcrypt.compare(password, user.password);
      console.log('AuthService->verifyUser, email, password', email, password)
      console.log('AuthService->verifyUser', user, authenticated)
      if (!authenticated) {
        throw new UnauthorizedException()
      }
      return user
    } catch (error) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }
}
