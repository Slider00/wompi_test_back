import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { OtpDocument } from './schemas/otp.schema';
import { MailService } from './services/mail.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly mailService;
    private readonly otpModel;
    constructor(usersService: UsersService, jwtService: JwtService, mailService: MailService, otpModel: Model<OtpDocument>);
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string;
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
        };
    }>;
    sendOtp(sendOtpDto: SendOtpDto): Promise<{
        message: string;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
