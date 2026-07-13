import { ConfigService } from '@nestjs/config';
export declare class WompiService {
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly publicKey;
    private readonly privateKey;
    private readonly integritySecret;
    constructor(configService: ConfigService);
    getAcceptanceToken(): Promise<string>;
    tokenizeCard(number: string, cvc: string, expMonth: string, expYear: string, cardHolder: string): Promise<string>;
    generateIntegritySignature(reference: string, amountInCents: number, currency: string): string;
    createTransaction(amount: number, email: string, cardToken: string, reference: string): Promise<{
        id: string;
        status: string;
    }>;
    getTransactionStatus(wompiTxId: string): Promise<string>;
    private extractWompiError;
}
