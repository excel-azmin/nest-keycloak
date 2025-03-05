import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, token, done) => {
        const publicKey = await authService.getPublicKey();
        done(null, publicKey);
      },
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    const user = await this.userService.findOrCreate({
      sub: payload.sub,
      email: payload.email,
      given_name: payload.given_name || '',
      family_name: payload.family_name || '',
      realm_access: payload.realm_access || { roles: [] },
    });

    return {
      keycloakId: user.keycloakId,
      email: user.email,
      roles: user.roles,
    };
  }
}
