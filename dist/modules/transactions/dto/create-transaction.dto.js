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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTransactionDto = exports.TransactionCartItemDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class TransactionCartItemDto {
    productId;
    quantity;
}
exports.TransactionCartItemDto = TransactionCartItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'prod-1', description: 'ID of the product' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TransactionCartItemDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2, description: 'Quantity purchased' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TransactionCartItemDto.prototype, "quantity", void 0);
class CreateTransactionDto {
    amount;
    currency;
    cardHolder;
    cardMaskedNumber;
    reference;
    cardNumber;
    expiry;
    cvv;
    cart;
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 249900, description: 'Amount in COP' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(100),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'COP', default: 'COP', required: false }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Julian Perez', description: 'Name of the cardholder' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "cardHolder", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '**** **** **** 1234', description: 'Masked credit card number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "cardMaskedNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'WMP-123456789', description: 'Unique payment reference code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '4242424242424242', description: 'Credit card number' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "cardNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '12/25', description: 'Card expiration date MM/AA' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "expiry", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123', description: 'Card security code CVC' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "cvv", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TransactionCartItemDto], description: 'Items purchased in this transaction' }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => TransactionCartItemDto),
    __metadata("design:type", Array)
], CreateTransactionDto.prototype, "cart", void 0);
//# sourceMappingURL=create-transaction.dto.js.map