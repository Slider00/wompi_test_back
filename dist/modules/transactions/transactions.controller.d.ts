import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    create(req: any, createDto: CreateTransactionDto): Promise<import("./schemas/transaction.schema").TransactionDocument>;
    updateStatus(id: string, updateDto: UpdateTransactionStatusDto): Promise<import("./schemas/transaction.schema").TransactionDocument>;
    findAll(req: any): Promise<import("./schemas/transaction.schema").TransactionDocument[]>;
}
