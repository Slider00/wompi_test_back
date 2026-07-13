import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

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

    return {
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      message: 'Usuario registrado exitosamente. Ya puede iniciar sesión.',
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


}
