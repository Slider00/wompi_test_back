import { Model } from 'mongoose';
import { TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ProductsService } from '../products/products.service';
import { WompiService } from './wompi.service';
export declare class TransactionsService {
    private readonly transactionModel;
    private readonly productsService;
    private readonly wompiService;
    constructor(transactionModel: Model<TransactionDocument>, productsService: ProductsService, wompiService: WompiService);
    create(userId: string, createDto: CreateTransactionDto): Promise<TransactionDocument>;
    updateStatus(id: string, status?: string): Promise<TransactionDocument>;
    findAllByUserId(userId: string): Promise<TransactionDocument[]>;
}
