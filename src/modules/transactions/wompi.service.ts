import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class WompiService {
  private readonly logger = new Logger(WompiService.name);
  private readonly baseUrl: string;
  private readonly publicKey: string;
  private readonly privateKey: string;
  private readonly integritySecret: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('WOMPI_BASE_URL') || '';
    this.publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY') || '';
    this.privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY') || '';
    this.integritySecret = this.configService.get<string>('WOMPI_INTEGRITY_SECRET') || '';
  }

  /**
   * Obtiene el token de aceptación (acceptance_token) del comercio desde Wompi.
   */
  /**
   * Obtiene el token de aceptación (acceptance_token) del comercio desde Wompi.
   */
  async getAcceptanceToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/merchants/${this.publicKey}`);
      const body = await response.json() as any;

      if (!response.ok) {
        throw new Error(this.extractWompiError(body, 'Error al consultar comercio'));
      }

      return body.data.presigned_acceptance.acceptance_token;
    } catch (error: any) {
      this.logger.error('Error obteniendo acceptance token:', error.message);
      throw new InternalServerErrorException(`Wompi Merchant Error: ${error.message}`);
    }
  }

  /**
   * Tokeniza los datos de la tarjeta de crédito de forma segura en Wompi.
   */
  async tokenizeCard(
    number: string,
    cvc: string,
    expMonth: string,
    expYear: string,
    cardHolder: string,
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.publicKey}`,
        },
        body: JSON.stringify({
          number: number.replace(/\s/g, ''),
          cvc,
          exp_month: expMonth,
          exp_year: expYear,
          card_holder: cardHolder,
        }),
      });

      const body = await response.json() as any;
      if (!response.ok) {
        throw new Error(this.extractWompiError(body, 'Error al tokenizar tarjeta'));
      }

      return body.data.id;
    } catch (error: any) {
      this.logger.error('Error al tokenizar tarjeta:', error.message);
      throw new InternalServerErrorException(`Wompi Tokenization Error: ${error.message}`);
    }
  }

  /**
   * Genera la firma de integridad SHA256 obligatoria por Wompi.
   */
  generateIntegritySignature(reference: string, amountInCents: number, currency: string): string {
    const dataConcat = `${reference}${amountInCents}${currency}${this.integritySecret}`;
    return crypto.createHash('sha256').update(dataConcat).digest('hex');
  }

  /**
   * Registra y ejecuta la transacción de pago directa en Wompi.
   */
  async createTransaction(
    amount: number,
    email: string,
    cardToken: string,
    reference: string,
  ): Promise<{ id: string; status: string }> {
    try {
      const acceptanceToken = await this.getAcceptanceToken();
      const amountInCents = amount * 100; // Wompi requiere montos en centavos
      const currency = 'COP';

      const signature = this.generateIntegritySignature(reference, amountInCents, currency);

      const response = await fetch(`${this.baseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.privateKey}`,
        },
        body: JSON.stringify({
          acceptance_token: acceptanceToken,
          amount_in_cents: amountInCents,
          currency,
          signature,
          customer_email: email,
          payment_method: {
            type: 'CARD',
            token: cardToken,
            installments: 1,
          },
          reference,
        }),
      });

      const body = await response.json() as any;
      if (!response.ok) {
        throw new Error(this.extractWompiError(body, 'Error al crear la transacción en Wompi'));
      }

      return {
        id: body.data.id,
        status: body.data.status,
      };
    } catch (error: any) {
      this.logger.error('Error al crear transacción en Wompi:', error.message);
      throw new InternalServerErrorException(`Wompi Transaction Error: ${error.message}`);
    }
  }

  /**
   * Consulta el estado en tiempo real de una transacción en Wompi.
   */
  async getTransactionStatus(wompiTxId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/transactions/${wompiTxId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.privateKey}`,
        },
      });

      const body = await response.json() as any;
      if (!response.ok) {
        throw new Error(this.extractWompiError(body, 'Error al consultar estado de transacción'));
      }

      return body.data.status;
    } catch (error: any) {
      this.logger.error(`Error consultando estado en Wompi (${wompiTxId}):`, error.message);
      return 'ERROR';
    }
  }

  /**
   * Helper para extraer mensajes de error detallados o de validación de Wompi.
   */
  private extractWompiError(body: any, defaultMsg: string): string {
    if (!body || !body.error) return defaultMsg;
    if (body.error.reason) return body.error.reason;
    if (body.error.messages) {
      const messages = body.error.messages;
      const details = Object.keys(messages)
        .map((field) => `${field}: ${messages[field].join(', ')}`)
        .join(' | ');
      return `Validation error - ${details}`;
    }
    return defaultMsg;
  }
}
