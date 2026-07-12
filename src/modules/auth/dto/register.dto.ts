import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'user@wompi.com',
    description: 'Email address of the user',
  })
  @IsEmail({}, { message: 'Por favor ingrese un correo válido' })
  email!: string;

  @ApiProperty({
    example: 'SecurePassword123',
    description: 'Password for the user account (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @ApiProperty({
    example: 'Julian Perez',
    description: 'Full name of the user',
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name!: string;
}
