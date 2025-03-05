import { Injectable } from '@nestjs/common';
import KeycloakAdminClient from 'keycloak-admin';
import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class PaymentService {
  private kcAdminClient: KeycloakAdminClient;

  constructor() {
    this.kcAdminClient = new KeycloakAdminClient({
      baseUrl: process.env.KEYCLOAK_SERVER,
      realmName: 'master',
    });

    this.setupAdminClient();
  }

  private async setupAdminClient() {
    try {
      await this.kcAdminClient.auth({
        clientId: 'admin-cli',
        username: process.env.KEYCLOAK_ADMIN_USERNAME,
        password: process.env.KEYCLOAK_ADMIN_PASSWORD,
        grantType: 'password',
      });

      console.log('Keycloak Admin Authenticated Successfully');
    } catch (error) {
      console.error('Keycloak Admin Authentication Failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate Keycloak Admin');
    }
  }

  async upgradeToPaidUser(keycloakId: string): Promise<void> {
    try {
      const user = await this.kcAdminClient.users.findOne({ id: keycloakId });
      const role = await this.kcAdminClient.roles.findOneByName({
        name: 'paid_user',
      });

      await this.kcAdminClient.users.addRealmRoleMappings({
        id: user.id,
        roles: [{ id: role.id, name: role.name }],
      });

      console.log(`User ${keycloakId} upgraded to 'paid_user'`);
    } catch (error) {
      console.error('Failed to upgrade user:', error.response?.data || error.message);
      throw new Error('Failed to upgrade user role');
    }
  }
}
