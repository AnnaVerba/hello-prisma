import { Injectable } from '@nestjs/common';
import { JwtService as JWT, JwtSignOptions } from '@nestjs/jwt';

import { config } from 'dotenv';
config();
@Injectable()
export class JwtService extends JWT {
  private readonly refreshTokenOption: JwtSignOptions;
  constructor() {
    const accessOpt = {
      secret: process.env['ACCESS_SECRET'],
      expiresIn: process.env['ACCESS_TOKEN_EXPIRE_TIME'],
    };
    const refreshOpt = {
      secret: process.env['ACCESS_SECRET'],
      expiresIn: process.env['REFRESH_TOKEN_EXPIRE_TIME'],
    } as JwtSignOptions;
    const { secret, expiresIn } = accessOpt;
    super({ secret, signOptions: { expiresIn } });
    this.refreshTokenOption = refreshOpt;
  }

  signToken(data, options?: JwtSignOptions): string {
    return this.sign(data, options);
  }

  verifyToken(token: string, options?: JwtSignOptions) {
    return this.verify(token, options);
  }

  generateAccessToken(data): string {
    return this.signToken(data);
  }

  verifyAccess(token: string) {
    return this.verifyToken(token);
  }

  generateRefreshToken(data): string {
    return this.signToken(data, this.refreshTokenOption);
  }

  verifyRefresh(token: string) {
    return this.verifyToken(token, this.refreshTokenOption);
  }

  generateTokens(data) {
    return {
      accessToken: this.generateAccessToken(data),
      refreshToken: this.generateRefreshToken(data),
    };
  }
}
