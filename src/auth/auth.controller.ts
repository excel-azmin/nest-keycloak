import { Controller, Post, Body, HttpException, HttpStatus, Get, Redirect, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { KeycloakService } from '../config/keycloak-config';
import { AuthService } from './auth.service';
import { Response } from 'express'; // Import Express response


class RegisterDto { 
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
}

class LoginDto {
  username: string;
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {

  private keycloakServer = process.env.KEYCLOAK_SERVER;
  private realm = process.env.KEYCLOAK_REALM;
  private clientId = process.env.KEYCLOAK_CLIENT_ID;
  private redirectUri = process.env.REDIRECT_URI || 'http://localhost:3001/api';

  constructor(
    private readonly keycloakService: KeycloakService,
    private readonly authService: AuthService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user in Keycloak' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' }) // Added 409 response
  @ApiBody({ type: RegisterDto })
  async register(@Body() { firstName, lastName, username, email, password }: RegisterDto) {
    try {
      const userId = await this.keycloakService.createUserInKeycloak(firstName, lastName, username, email, password);
      return { message: 'User registered successfully', userId };
    } catch (error) {
      if (error.message === 'User already exists') {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      }
      console.error('Failed to register user:', error.message);
      throw new HttpException('Failed to register user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

 
  @Get('register-redirect')
  @ApiOperation({ summary: 'Redirect user to Keycloak registration page' })
  async redirectToKeycloakRegistration(@Res() res: Response) {
    const registrationUrl = `${this.keycloakServer}/realms/${this.realm}/protocol/openid-connect/registrations?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}`;

    return res.redirect(registrationUrl);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user and get access token' })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({ type: LoginDto, examples: {
    example1: {
      summary: 'User Login Example',
      value: {
        username: 'john_doe',
        password: 'SecurePass123!'
      }
    }
  }})
  async login(@Body() { username, password }: LoginDto) {
    const tokens = await this.keycloakService.getUserAccessToken(username, password);
    return tokens;
  }
}
