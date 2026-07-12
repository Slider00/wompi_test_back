import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@wompi.com',
    description: 'Email address of the user',
  })
  @IsEmail({}, { message: 'Por favor ingrese un correo válido' })
  email!: string;

  @ApiProperty({
    example: 'SecurePassword123',
    description: 'Password of the user (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;
}
