import { ProductsService } from './products.service';
import { DecreaseStockDto } from './dto/decrease-stock.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    findAll(): Promise<import("./schemas/product.schema").ProductDocument[]>;
    decreaseStock(decreaseStockDto: DecreaseStockDto): Promise<void>;
}
