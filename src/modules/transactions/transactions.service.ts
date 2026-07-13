import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ProductsService } from '../products/products.service';
import { WompiService } from './wompi.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    private readonly productsService: ProductsService,
    private readonly wompiService: WompiService,
  ) {}

  async create(userId: string, createDto: CreateTransactionDto): Promise<TransactionDocument> {
    const { amount, currency, cardHolder, cardMaskedNumber, reference, cart, cardNumber, expiry, cvv } = createDto;

    // 1. Validar referencia única local
    const existingRef = await this.transactionModel.findOne({ reference }).exec();
    if (existingRef) {
      throw new BadRequestException(`La referencia de transacción ${reference} ya existe`);
    }

    // 2. Separar mes y año de expiración y asegurar formato de 2 dígitos (Wompi exige exactamente 2 dígitos)
    const [expMonth, expYear] = expiry.split('/');
    if (!expMonth || !expYear) {
      throw new BadRequestException('El formato de expiración debe ser MM/AA o MM/AAAA');
    }
    const formattedMonth = expMonth.trim().padStart(2, '0');
    const formattedYear = expYear.trim().slice(-2);

    // 3. Tokenizar tarjeta en Wompi
    const cardToken = await this.wompiService.tokenizeCard(
      cardNumber,
      cvv,
      formattedMonth,
      formattedYear,
      cardHolder,
    );

    // 4. Crear la transacción en Wompi (obtiene ID de Wompi y estado inicial)
    const wompiTx = await this.wompiService.createTransaction(
      amount,
      cardHolder.toLowerCase().replace(/\s+/g, '') + '@wompi.test', // Email de ejemplo para el recibo
      cardToken,
      reference,
    );

    // Mapear estado de Wompi al del front
    let mappedStatus = 'PENDING';
    if (wompiTx.status === 'APPROVED') {
      mappedStatus = 'APPROVED';
    } else if (wompiTx.status === 'DECLINED') {
      mappedStatus = 'DECLINED';
    } else if (wompiTx.status === 'ERROR' || wompiTx.status === 'FAILED') {
      mappedStatus = 'FAILED';
    }

    // 5. Guardar transacción local en MongoDB vinculando el ID de Wompi
    const newTransaction = new this.transactionModel({
      _id: wompiTx.id, // ID oficial de la transacción de Wompi
      userId,
      amount,
      currency: currency || 'COP',
      cardHolder,
      cardMaskedNumber,
      reference,
      status: mappedStatus,
      cart,
    });

    // Si se aprueba de forma síncrona de inmediato, descontamos stock
    if (mappedStatus === 'APPROVED') {
      await this.productsService.decreaseStock(cart);
    }

    return newTransaction.save();
  }

  async updateStatus(id: string, status?: string): Promise<TransactionDocument> {
    const transaction = await this.transactionModel.findById(id).exec();
    if (!transaction) {
      throw new NotFoundException(`Transacción con ID ${id} no encontrada`);
    }

    // Consultamos el estado real directo de Wompi
    const wompiStatus = await this.wompiService.getTransactionStatus(id);

    // Mapeamos el estado de Wompi a los esperados por el frontend
    let mappedStatus = transaction.status;
    if (wompiStatus === 'APPROVED') {
      mappedStatus = 'APPROVED';
    } else if (wompiStatus === 'DECLINED') {
      mappedStatus = 'DECLINED';
    } else if (wompiStatus === 'PENDING') {
      mappedStatus = 'PENDING';
    } else if (wompiStatus === 'ERROR' || wompiStatus === 'FAILED') {
      mappedStatus = 'FAILED';
    }

    // Si el estado anterior era PENDING y el nuevo es APPROVED, restamos stock
    if (transaction.status === 'PENDING' && mappedStatus === 'APPROVED') {
      await this.productsService.decreaseStock(transaction.cart);
    }

    transaction.status = mappedStatus;
    return transaction.save();
  }

  async findAllByUserId(userId: string): Promise<TransactionDocument[]> {
    return this.transactionModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }
}
