import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOrCreate(keycloakUser: any): Promise<User> {
    const user = await this.userModel.findOne({ keycloakId: keycloakUser.sub });
    if (user) return user;

    const newUser = new this.userModel({
      keycloakId: keycloakUser.sub,
      email: keycloakUser.email,
      firstName: keycloakUser.given_name,
      lastName: keycloakUser.family_name,
      roles: keycloakUser.realm_access.roles,
    });

    return newUser.save();
  }

  async updateRoles(keycloakId: string, roles: string[]): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { keycloakId },
      { $set: { roles } },
      { new: true }
    );
  }
}