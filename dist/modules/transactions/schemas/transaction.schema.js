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
exports.TransactionSchema = exports.Transaction = exports.CartItemRef = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let CartItemRef = class CartItemRef {
    productId;
    quantity;
};
exports.CartItemRef = CartItemRef;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], CartItemRef.prototype, "productId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, min: 1 }),
    __metadata("design:type", Number)
], CartItemRef.prototype, "quantity", void 0);
exports.CartItemRef = CartItemRef = __decorate([
    (0, mongoose_1.Schema)({
        _id: false,
    })
], CartItemRef);
const CartItemRefSchema = mongoose_1.SchemaFactory.createForClass(CartItemRef);
let Transaction = class Transaction {
    _id;
    userId;
    amount;
    currency;
    cardHolder;
    cardMaskedNumber;
    reference;
    status;
    cart;
};
exports.Transaction = Transaction;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String }),
    __metadata("design:type", String)
], Transaction.prototype, "_id", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transaction.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Transaction.prototype, "amount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'COP' }),
    __metadata("design:type", String)
], Transaction.prototype, "currency", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transaction.prototype, "cardHolder", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Transaction.prototype, "cardMaskedNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Transaction.prototype, "reference", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, enum: ['PENDING', 'APPROVED', 'DECLINED', 'FAILED'], default: 'PENDING' }),
    __metadata("design:type", String)
], Transaction.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [CartItemRefSchema], default: [] }),
    __metadata("design:type", Array)
], Transaction.prototype, "cart", void 0);
exports.Transaction = Transaction = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id ? ret._id.toString() : undefined;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    })
], Transaction);
exports.TransactionSchema = mongoose_1.SchemaFactory.createForClass(Transaction);
//# sourceMappingURL=transaction.schema.js.map