import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({
    example: 'user@wompi.com',
    description: 'Email address where the OTP code will be sent',
  })
  @IsEmail({}, { message: 'Por favor ingrese un correo válido' })
  email!: string;
}
