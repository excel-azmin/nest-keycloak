import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KeycloakService } from 'src/config/keycloak-config';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { KeycloakStrategy } from './strategies/keycloak.strategy';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module'; // Import UserModule
import { UserService } from 'src/user/user.service';

@Module({
  imports: [ConfigModule, HttpModule, UserModule], // Import UserModule here
  controllers: [AuthController],
  providers: [KeycloakService, AuthService, KeycloakStrategy, UserService],
  exports: [KeycloakService, AuthService, UserService],
})
export class AuthModule {}
