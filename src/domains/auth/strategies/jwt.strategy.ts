/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('jwt.accessSecret'),
    });
  }

  async validate(payload: any) {
    if (!payload.sub || !payload.userId) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.authService.validateUserById(payload.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      userId: payload.userId,
      email: payload.email,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      deviceId: payload.deviceId,
    };
  }
}
