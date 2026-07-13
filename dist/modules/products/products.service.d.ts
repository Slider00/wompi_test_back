import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { ProductDocument } from './schemas/product.schema';
import { CartItemDto } from './dto/decrease-stock.dto';
export declare class ProductsService implements OnModuleInit {
    private readonly productModel;
    constructor(productModel: Model<ProductDocument>);
    onModuleInit(): Promise<void>;
    findAll(): Promise<ProductDocument[]>;
    decreaseStock(cart: CartItemDto[]): Promise<void>;
}
