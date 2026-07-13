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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_schema_1 = require("./schemas/product.schema");
let ProductsService = class ProductsService {
    productModel;
    constructor(productModel) {
        this.productModel = productModel;
    }
    async onModuleInit() {
        const firstProduct = await this.productModel.findOne().exec();
        if (firstProduct && !firstProduct.icon.startsWith('/')) {
            await this.productModel.deleteMany({});
        }
        const count = await this.productModel.countDocuments();
        if (count === 0) {
            await this.productModel.insertMany([
                {
                    _id: 'prod-1',
                    name: 'Auriculares Bluetooth Pro',
                    description: 'Cancelación activa de ruido, batería de 30 horas y sonido premium.',
                    price: 249900,
                    icon: '/images/headphones.png',
                    stock: 8,
                },
                {
                    _id: 'prod-2',
                    name: 'Reloj Inteligente Fit',
                    description: 'Pantalla AMOLED, monitoreo de salud 24/7 y GPS integrado.',
                    price: 379900,
                    icon: '/images/smartwatch.png',
                    stock: 5,
                },
                {
                    _id: 'prod-3',
                    name: 'Teclado Mecánico RGB',
                    description: 'Switches mecánicos táctiles, retroiluminación RGB y conexión inalámbrica.',
                    price: 189900,
                    icon: '/images/keyboard.png',
                    stock: 4,
                },
                {
                    _id: 'prod-4',
                    name: 'Cargador Inalámbrico Rápido',
                    description: 'Carga magnética de 15W compatible con múltiples dispositivos.',
                    price: 89900,
                    icon: '/images/charger.png',
                    stock: 12,
                },
            ]);
        }
    }
    async findAll() {
        return this.productModel.find().exec();
    }
    async decreaseStock(cart) {
        const productsToUpdate = [];
        for (const item of cart) {
            const product = await this.productModel.findById(item.productId).exec();
            if (!product) {
                throw new common_1.NotFoundException(`Producto con ID ${item.productId} no encontrado`);
            }
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`);
            }
            productsToUpdate.push({
                product,
                newStock: product.stock - item.quantity,
            });
        }
        for (const update of productsToUpdate) {
            update.product.stock = update.newStock;
            await update.product.save();
        }
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_schema_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map