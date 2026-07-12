import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        secure: Number(port) === 465,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log('SMTP Mail Transporter initialized successfully.');
    } else {
      this.logger.warn(
        'SMTP configurations missing in environment. Using console logging for OTP delivery.',
      );
    }
  }

  async sendOtpMail(email: string, code: string): Promise<void> {
    const from = this.configService.get<string>('SMTP_FROM') || '"Wompi App" <noreply@wompi.com>';
    const subject = 'Tu código de verificación OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Código de Verificación</h2>
        <p>Has solicitado un código de verificación. Usa el siguiente código para completar tu solicitud:</p>
        <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0; color: #0070f3;">
          ${code}
        </div>
        <p style="color: #666; font-size: 12px; text-align: center;">Este código expira en 5 minutos.</p>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: email,
          subject,
          html,
        });
        this.logger.log(`OTP mail successfully sent to ${email}`);
      } catch (error) {
        this.logger.error(`Failed to send OTP mail to ${email}`, error);
        throw new Error('Error al enviar el correo del OTP');
      }
    } else {
      console.log('\n------------------------------------------------------------');
      console.log(`✉️  [SIMULACIÓN DE CORREO]`);
      console.log(`Para: ${email}`);
      console.log(`Asunto: ${subject}`);
      console.log(`Código OTP: ${code}`);
      console.log('------------------------------------------------------------\n');
    }
  }
}
