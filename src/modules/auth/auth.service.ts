import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { MailService } from './services/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @InjectModel(Otp.name) private readonly otpModel: Model<OtpDocument>,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      if (existingUser.isVerified) {
        throw new ConflictException('El correo ya está registrado');
      } else {
        // Si el usuario existe pero no está verificado, eliminamos el registro previo para poder re-registrar
        await this.usersService.deleteUnverifiedUser(email);
      }
    }

    const newUser = await this.usersService.create(email, password, name);

    // Enviar OTP automáticamente tras el registro
    await this.sendOtp({ email: newUser.email });

    return {
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      message: 'Usuario registrado. Se ha enviado un código de verificación OTP a su correo.',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findOneByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Bloquear inicio de sesión si el correo no ha sido verificado
    if (!user.isVerified) {
      throw new UnauthorizedException('El correo no ha sido verificado. Por favor, verifique su cuenta con el código OTP enviado a su correo.');
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

  async sendOtp(sendOtpDto: SendOtpDto) {
    const { email } = sendOtpDto;

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Eliminar códigos previos para este correo
    await this.otpModel.deleteMany({ email: email.toLowerCase() });

    // Guardar nuevo código en BD
    const newOtp = new this.otpModel({
      email: email.toLowerCase(),
      code,
    });
    await newOtp.save();

    // Enviar correo
    await this.mailService.sendOtpMail(email.toLowerCase(), code);

    return {
      message: 'Código OTP enviado exitosamente',
    };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { email, code } = verifyOtpDto;

    const record = await this.otpModel.findOne({ email: email.toLowerCase() }).exec();
    if (!record || record.code !== code) {
      throw new UnauthorizedException('Código inválido o expirado');
    }

    // Eliminar el código tras verificarlo con éxito
    await this.otpModel.deleteOne({ _id: record._id });

    // Activar al usuario en la base de datos
    await this.usersService.verifyUser(email);

    return {
      success: true,
      message: 'Código OTP verificado exitosamente. Su cuenta ha sido activada.',
    };
  }
}
