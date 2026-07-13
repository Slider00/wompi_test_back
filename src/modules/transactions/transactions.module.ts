import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';
import { WompiService } from './wompi.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    ProductsModule,
    AuthModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, WompiService],
  exports: [TransactionsService, WompiService],
})
export class TransactionsModule {}
