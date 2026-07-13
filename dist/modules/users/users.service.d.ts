import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
export declare class UsersService {
    private readonly userModel;
    constructor(userModel: Model<UserDocument>);
    create(email: string, passwordPlain: string, name: string): Promise<UserDocument>;
    findOneByEmail(email: string): Promise<UserDocument | null>;
    findOneByEmailWithPassword(email: string): Promise<UserDocument | null>;
    verifyUser(email: string): Promise<void>;
    deleteUnverifiedUser(email: string): Promise<void>;
}
