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
exports.UpdateTransactionStatusDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class UpdateTransactionStatusDto {
    status;
}
exports.UpdateTransactionStatusDto = UpdateTransactionStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'APPROVED',
        enum: ['PENDING', 'APPROVED', 'DECLINED', 'FAILED'],
        description: 'Updated status of the transaction',
    }),
    (0, class_validator_1.IsEnum)(['PENDING', 'APPROVED', 'DECLINED', 'FAILED'], {
        message: 'El estado debe ser PENDING, APPROVED, DECLINED o FAILED',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateTransactionStatusDto.prototype, "status", void 0);
//# sourceMappingURL=update-transaction-status.dto.js.map