import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    // Validate that required configuration values are present
    const secret = configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const jwtOptions: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      audience: configService.get<string>('jwt.audience'),
      issuer: configService.get<string>('jwt.issuer'),
    };

    super(jwtOptions);
  }

  async validate(payload: any) {
    // Optionally validate the payload
    if (!payload.sub || !payload.username) {
      throw new UnauthorizedException('Invalid JWT payload');
    }
    return { userId: payload.sub, username: payload.username };
  }
}