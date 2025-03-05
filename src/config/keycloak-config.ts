import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class KeycloakService {
  private keycloakServer = process.env.KEYCLOAK_SERVER;
  private realm = process.env.KEYCLOAK_REALM;
  private clientId = process.env.KEYCLOAK_CLIENT_ID;
  private clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  private adminUsername = process.env.KEYCLOAK_ADMIN_USERNAME;
  private adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD;

  async getAdminAccessToken(): Promise<string> {
    console.log("Keycloak Admin Login Attempting...");
    
    try {
      const response = await axios.post(
        `${this.keycloakServer}/realms/${this.realm}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli', 
          client_secret: this.clientSecret,  // ADD CLIENT SECRET HERE
          username: this.adminUsername,
          password: this.adminPassword,
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
  
      console.log("Keycloak Admin Authenticated Successfully");
      return response.data.access_token;
    } catch (error) {
      console.error("Keycloak Admin Authentication Failed: ", error.response?.data || error.message);
      throw new Error("Failed to authenticate with Keycloak: " + error.response?.data?.error_description);
    }
  }
  

  async createUserInKeycloak(firstName: string, lastName : string, username: string, email: string, password: string) {
    try {
      const token = await this.getAdminAccessToken();
    const response = await axios.post(
      `${this.keycloakServer}/admin/realms/${this.realm}/users`,
      {
        firstName,
        lastName,
        username,
        email,
        enabled: true,
        credentials: [{ type: 'password', value: password, temporary: false }],
      },
      {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      }
    );

    if (response.status === 201) {
      // Retrieve user ID from location header
      const userId = response.headers.location.split('/').pop();
      return userId;
    }

    throw new Error('Failed to create user in Keycloak');
  } catch (error) {
      if (error.response && error.response.status === 409) {
        console.error(`User registration failed: User with username "${username}" or email "${email}" already exists.`);
        throw new Error('User already exists');
      } else {
        console.error('Keycloak user creation error:', error.response?.data || error.message);
        throw new Error('Failed to create user in Keycloak');
      }
    }
    
  }
  

  async getUserAccessToken(username: string, password: string) {
    const response = await axios.post(
      `${this.keycloakServer}/realms/${this.realm}/protocol/openid-connect/token`,
      new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'password',
        username,
        password,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    return response.data;
  }
}
