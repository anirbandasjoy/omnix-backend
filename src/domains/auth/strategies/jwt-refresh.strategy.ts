/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    if (!payload.sub || !payload.userId) {
      throw new UnauthorizedException('Invalid refresh token payload');
    }

    const refreshToken = req.headers.authorization?.replace('Bearer ', '');
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const user = await this.authService.validateRefreshToken(
      payload.userId,
      refreshToken,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      deviceId: payload.deviceId,
    };
  }
}
