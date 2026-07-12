import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({
    example: 'user@wompi.com',
    description: 'Email address of the user verifying the OTP',
  })
  @IsEmail({}, { message: 'Por favor ingrese un correo válido' })
  email!: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code sent via email',
  })
  @IsString()
  @Length(6, 6, { message: 'El código OTP debe ser de 6 dígitos' })
  code!: string;
}
