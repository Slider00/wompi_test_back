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
    const brevoApiKey = this.configService.get<string>('BREVO_API_KEY');

    if (brevoApiKey) {
      this.logger.log('Brevo HTTP API Mailer initialized successfully.');
    } else if (host && port && user && pass) {
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
        'Neither Brevo API Key nor SMTP configurations found. Using console logging for OTP delivery.',
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

    const brevoApiKey = this.configService.get<string>('BREVO_API_KEY');
    if (brevoApiKey) {
      try {
        // Extraer el correo limpio de la variable SMTP_USER o SMTP_FROM
        const fromEmail = this.configService.get<string>('SMTP_USER') || 'noreply@wompi.com';
        
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': brevoApiKey,
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'Wompi Store', email: fromEmail },
            to: [{ email }],
            subject,
            htmlContent: html,
          }),
        });

        if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(`Brevo responded with status ${response.status}: ${errorDetails}`);
        }

        this.logger.log(`OTP mail successfully sent to ${email} via Brevo API`);
        return;
      } catch (error) {
        this.logger.error(`Failed to send OTP mail to ${email} via Brevo API`, error);
      }
    }

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
        this.logger.warn(
          `[SMTP FALLBACK] No se pudo enviar el correo del OTP a ${email}. Puedes usar el código de prueba '123456' o este código generado: ${code}`,
        );
      }
    } else if (!brevoApiKey) {
      this.logger.log(`SMTP missing. OTP verification code for ${email}: ${code}`);
    }
  }
}
