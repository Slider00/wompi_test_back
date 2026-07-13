"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WompiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WompiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let WompiService = WompiService_1 = class WompiService {
    configService;
    logger = new common_1.Logger(WompiService_1.name);
    baseUrl;
    publicKey;
    privateKey;
    integritySecret;
    constructor(configService) {
        this.configService = configService;
        this.baseUrl = this.configService.get('WOMPI_BASE_URL') || '';
        this.publicKey = this.configService.get('WOMPI_PUBLIC_KEY') || '';
        this.privateKey = this.configService.get('WOMPI_PRIVATE_KEY') || '';
        this.integritySecret = this.configService.get('WOMPI_INTEGRITY_SECRET') || '';
    }
    async getAcceptanceToken() {
        try {
            const response = await fetch(`${this.baseUrl}/merchants/${this.publicKey}`);
            const body = await response.json();
            if (!response.ok) {
                throw new Error(this.extractWompiError(body, 'Error al consultar comercio'));
            }
            return body.data.presigned_acceptance.acceptance_token;
        }
        catch (error) {
            this.logger.error('Error obteniendo acceptance token:', error.message);
            throw new common_1.InternalServerErrorException(`Wompi Merchant Error: ${error.message}`);
        }
    }
    async tokenizeCard(number, cvc, expMonth, expYear, cardHolder) {
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
            const body = await response.json();
            if (!response.ok) {
                throw new Error(this.extractWompiError(body, 'Error al tokenizar tarjeta'));
            }
            return body.data.id;
        }
        catch (error) {
            this.logger.error('Error al tokenizar tarjeta:', error.message);
            throw new common_1.InternalServerErrorException(`Wompi Tokenization Error: ${error.message}`);
        }
    }
    generateIntegritySignature(reference, amountInCents, currency) {
        const dataConcat = `${reference}${amountInCents}${currency}${this.integritySecret}`;
        return crypto.createHash('sha256').update(dataConcat).digest('hex');
    }
    async createTransaction(amount, email, cardToken, reference) {
        try {
            const acceptanceToken = await this.getAcceptanceToken();
            const amountInCents = amount * 100;
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
            const body = await response.json();
            if (!response.ok) {
                throw new Error(this.extractWompiError(body, 'Error al crear la transacción en Wompi'));
            }
            return {
                id: body.data.id,
                status: body.data.status,
            };
        }
        catch (error) {
            this.logger.error('Error al crear transacción en Wompi:', error.message);
            throw new common_1.InternalServerErrorException(`Wompi Transaction Error: ${error.message}`);
        }
    }
    async getTransactionStatus(wompiTxId) {
        try {
            const response = await fetch(`${this.baseUrl}/transactions/${wompiTxId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.privateKey}`,
                },
            });
            const body = await response.json();
            if (!response.ok) {
                throw new Error(this.extractWompiError(body, 'Error al consultar estado de transacción'));
            }
            return body.data.status;
        }
        catch (error) {
            this.logger.error(`Error consultando estado en Wompi (${wompiTxId}):`, error.message);
            return 'ERROR';
        }
    }
    extractWompiError(body, defaultMsg) {
        if (!body || !body.error)
            return defaultMsg;
        if (body.error.reason)
            return body.error.reason;
        if (body.error.messages) {
            const messages = body.error.messages;
            const details = Object.keys(messages)
                .map((field) => `${field}: ${messages[field].join(', ')}`)
                .join(' | ');
            return `Validation error - ${details}`;
        }
        return defaultMsg;
    }
};
exports.WompiService = WompiService;
exports.WompiService = WompiService = WompiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WompiService);
//# sourceMappingURL=wompi.service.js.map