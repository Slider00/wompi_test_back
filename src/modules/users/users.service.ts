import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(email: string, passwordPlain: string, name: string): Promise<UserDocument> {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(passwordPlain, salt);

    const newUser = new this.userModel({
      email,
      password: passwordHash,
      name,
    });

    return newUser.save();
  }

  async findOneByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findOneByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async verifyUser(email: string): Promise<void> {
    await this.userModel.updateOne({ email: email.toLowerCase() }, { isVerified: true }).exec();
  }

  async deleteUnverifiedUser(email: string): Promise<void> {
    await this.userModel.deleteOne({ email: email.toLowerCase(), isVerified: false }).exec();
  }
}
