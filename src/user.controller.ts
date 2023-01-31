import { Controller, Get, Post, Body, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import FastifyReply from 'fastify-cookie';
import { FastifyRequest } from 'fastify';
import { User as UserModel } from '@prisma/client';

export enum TokenTypeEnum {
  accessToken = 'accessToken',
  refreshToken = 'refreshToken',
}
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async signupUser(
    @Body() userData: { name?: string; email: string; password?: string },
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) reply: FastifyReply,
  ) {
    const tokenResponse = await this.userService.createUser(userData);
    reply.cookie(TokenTypeEnum.refreshToken, tokenResponse.refreshToken);
    return { accessToken: tokenResponse.accessToken };
  }
  @Get()
  async getUser(
    @Body() userData: { name?: string; email?: string },
  ): Promise<UserModel> {
    return this.userService.user(userData);
  }
}
