"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var TransactionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const transaction_schema_1 = require("./schemas/transaction.schema");
const products_service_1 = require("../products/products.service");
const wompi_service_1 = require("./wompi.service");
let TransactionsService = TransactionsService_1 = class TransactionsService {
    transactionModel;
    productsService;
    wompiService;
    logger = new common_1.Logger(TransactionsService_1.name);
    constructor(transactionModel, productsService, wompiService) {
        this.transactionModel = transactionModel;
        this.productsService = productsService;
        this.wompiService = wompiService;
    }
    async create(userId, createDto) {
        const { amount, currency, cardHolder, cardMaskedNumber, reference, cart, cardNumber, expiry, cvv } = createDto;
        const existingRef = await this.transactionModel.findOne({ reference }).exec();
        if (existingRef) {
            throw new common_1.BadRequestException(`La referencia de transacción ${reference} ya existe`);
        }
        const [expMonth, expYear] = expiry.split('/');
        if (!expMonth || !expYear) {
            throw new common_1.BadRequestException('El formato de expiración debe ser MM/AA o MM/AAAA');
        }
        const formattedMonth = expMonth.trim().padStart(2, '0');
        const formattedYear = expYear.trim().slice(-2);
        const cardToken = await this.wompiService.tokenizeCard(cardNumber, cvv, formattedMonth, formattedYear, cardHolder);
        const wompiTx = await this.wompiService.createTransaction(amount, cardHolder.toLowerCase().replace(/\s+/g, '') + '@wompi.test', cardToken, reference);
        let mappedStatus = 'PENDING';
        if (wompiTx.status === 'APPROVED') {
            mappedStatus = 'APPROVED';
        }
        else if (wompiTx.status === 'DECLINED') {
            mappedStatus = 'DECLINED';
        }
        else if (wompiTx.status === 'ERROR' || wompiTx.status === 'FAILED') {
            mappedStatus = 'FAILED';
        }
        const newTransaction = new this.transactionModel({
            _id: wompiTx.id,
            userId,
            amount,
            currency: currency || 'COP',
            cardHolder,
            cardMaskedNumber,
            reference,
            status: mappedStatus,
            cart,
        });
        if (mappedStatus === 'APPROVED') {
            await this.productsService.decreaseStock(cart);
        }
        return newTransaction.save();
    }
    async updateStatus(id, status) {
        const transaction = await this.transactionModel.findById(id).exec();
        if (!transaction) {
            throw new common_1.NotFoundException(`Transacción con ID ${id} no encontrada`);
        }
        const wompiStatus = await this.wompiService.getTransactionStatus(id);
        let mappedStatus = transaction.status;
        if (wompiStatus === 'APPROVED') {
            mappedStatus = 'APPROVED';
        }
        else if (wompiStatus === 'DECLINED') {
            mappedStatus = 'DECLINED';
        }
        else if (wompiStatus === 'PENDING') {
            mappedStatus = 'PENDING';
        }
        else if (wompiStatus === 'ERROR' || wompiStatus === 'FAILED') {
            mappedStatus = 'FAILED';
        }
        if (transaction.status === 'PENDING' && mappedStatus === 'APPROVED') {
            await this.productsService.decreaseStock(transaction.cart);
        }
        transaction.status = mappedStatus;
        return transaction.save();
    }
    async findAllByUserId(userId) {
        const transactions = await this.transactionModel.find({ userId }).sort({ createdAt: -1 }).exec();
        for (const tx of transactions) {
            if (tx.status === 'PENDING') {
                try {
                    const wompiStatus = await this.wompiService.getTransactionStatus(tx.id);
                    let mappedStatus = tx.status;
                    if (wompiStatus === 'APPROVED') {
                        mappedStatus = 'APPROVED';
                        await this.productsService.decreaseStock(tx.cart);
                    }
                    else if (wompiStatus === 'DECLINED') {
                        mappedStatus = 'DECLINED';
                    }
                    else if (wompiStatus === 'ERROR' || wompiStatus === 'FAILED') {
                        mappedStatus = 'FAILED';
                    }
                    if (mappedStatus !== tx.status) {
                        tx.status = mappedStatus;
                        await tx.save();
                        this.logger.log(`Sincronización: Transacción ${tx.id} actualizada de PENDING a ${mappedStatus}`);
                    }
                }
                catch (error) {
                    this.logger.error(`Error al sincronizar transacción pendiente ${tx.id}:`, error.message);
                }
            }
        }
        return transactions;
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = TransactionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(transaction_schema_1.Transaction.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        products_service_1.ProductsService,
        wompi_service_1.WompiService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map