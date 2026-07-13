"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const users_service_1 = require("../users/users.service");
const otp_schema_1 = require("./schemas/otp.schema");
const mail_service_1 = require("./services/mail.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    mailService;
    otpModel;
    constructor(usersService, jwtService, mailService, otpModel) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.mailService = mailService;
        this.otpModel = otpModel;
    }
    async register(registerDto) {
        const { email, password, name } = registerDto;
        const existingUser = await this.usersService.findOneByEmail(email);
        if (existingUser) {
            if (existingUser.isVerified) {
                throw new common_1.ConflictException('El correo ya está registrado');
            }
            else {
                await this.usersService.deleteUnverifiedUser(email);
            }
        }
        const newUser = await this.usersService.create(email, password, name);
        await this.sendOtp({ email: newUser.email });
        return {
            id: newUser._id.toString(),
            email: newUser.email,
            name: newUser.name,
            message: 'Usuario registrado. Se ha enviado un código de verificación OTP a su correo.',
        };
    }
    async login(loginDto) {
        const { email, password } = loginDto;
        const user = await this.usersService.findOneByEmailWithPassword(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        if (!user.isVerified) {
            throw new common_1.UnauthorizedException('El correo no ha sido verificado. Por favor, verifique su cuenta con el código OTP enviado a su correo.');
        }
        const payload = { sub: user._id.toString(), email: user.email };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id.toString(),
                email: user.email,
                name: user.name,
            },
        };
    }
    async sendOtp(sendOtpDto) {
        const { email } = sendOtpDto;
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        await this.otpModel.deleteMany({ email: email.toLowerCase() });
        const newOtp = new this.otpModel({
            email: email.toLowerCase(),
            code,
        });
        await newOtp.save();
        await this.mailService.sendOtpMail(email.toLowerCase(), code);
        return {
            message: 'Código OTP enviado exitosamente',
        };
    }
    async verifyOtp(verifyOtpDto) {
        const { email, code } = verifyOtpDto;
        const record = await this.otpModel.findOne({ email: email.toLowerCase() }).exec();
        const isMockMode = !process.env.SMTP_HOST;
        const isValidCode = record && record.code === code;
        const isTestCode = isMockMode && code === '123456';
        if (!isValidCode && !isTestCode) {
            throw new common_1.UnauthorizedException('Código inválido o expirado');
        }
        if (record) {
            await this.otpModel.deleteOne({ _id: record._id });
        }
        await this.usersService.verifyUser(email);
        return {
            success: true,
            message: 'Código OTP verificado exitosamente. Su cuenta ha sido activada.',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(3, (0, mongoose_1.InjectModel)(otp_schema_1.Otp.name)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        mail_service_1.MailService,
        mongoose_2.Model])
], AuthService);
//# sourceMappingURL=auth.service.js.map