import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TransactionsService } from './transactions.service';
import { ProductsService } from '../products/products.service';
import { WompiService } from './wompi.service';
import { Transaction } from './schemas/transaction.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let productsService: ProductsService;
  let wompiService: WompiService;

  const mockTransactionModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  };

  const mockProductsService = {
    decreaseStock: jest.fn().mockResolvedValue(null),
  };

  const mockWompiService = {
    tokenizeCard: jest.fn().mockResolvedValue('card_token_mock'),
    createTransaction: jest.fn().mockResolvedValue({ id: 'wompi_tx_id_mock', status: 'PENDING' }),
    getTransactionStatus: jest.fn().mockResolvedValue('APPROVED'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getModelToken(Transaction.name),
          useValue: mockTransactionModel,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: WompiService,
          useValue: mockWompiService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    productsService = module.get<ProductsService>(ProductsService);
    wompiService = module.get<WompiService>(WompiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a transaction successfully', async () => {
      mockTransactionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const saveMock = jest.fn().mockResolvedValue({
        id: 'wompi_tx_id_mock',
        status: 'PENDING',
      });
      
      const mockModelConstructor = jest.fn().mockImplementation(() => ({
        save: saveMock,
      }));
      
      (service as any).transactionModel = mockModelConstructor;
      (service as any).transactionModel.findOne = mockTransactionModel.findOne;

      const createDto = {
        amount: 50000,
        currency: 'COP',
        cardHolder: 'Julian Correa',
        cardMaskedNumber: '**** **** **** 4242',
        reference: 'REF-123',
        cart: [{ productId: 'prod-1', quantity: 2 }],
        cardNumber: '4242424242424242',
        expiry: '12/29',
        cvv: '123',
      };

      await service.create('user_123', createDto);

      expect(mockWompiService.tokenizeCard).toHaveBeenCalledWith(
        '4242424242424242',
        '123',
        '12',
        '29',
        'Julian Correa',
      );
      expect(mockWompiService.createTransaction).toHaveBeenCalledWith(
        50000,
        'juliancorrea@wompi.test',
        'card_token_mock',
        'REF-123',
      );
      expect(saveMock).toHaveBeenCalled();
    });

    it('should throw BadRequestException if transaction reference already exists', async () => {
      mockTransactionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ id: 'existing_tx' }),
      });
      (service as any).transactionModel = mockTransactionModel;

      const createDto = {
        amount: 50000,
        currency: 'COP',
        cardHolder: 'Julian Correa',
        cardMaskedNumber: '**** **** **** 4242',
        reference: 'REF-123',
        cart: [{ productId: 'prod-1', quantity: 2 }],
        cardNumber: '4242424242424242',
        expiry: '12/29',
        cvv: '123',
      };

      await expect(service.create('user_123', createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateStatus', () => {
    it('should update transaction status and decrease stock if it changes to APPROVED', async () => {
      const mockTx = {
        id: 'tx_123',
        status: 'PENDING',
        cart: [{ productId: 'prod-1', quantity: 2 }],
        save: jest.fn().mockResolvedValue(true),
      };

      mockTransactionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTx),
      });
      (service as any).transactionModel = mockTransactionModel;

      mockWompiService.getTransactionStatus.mockResolvedValue('APPROVED');

      await service.updateStatus('tx_123');

      expect(mockTx.status).toBe('APPROVED');
      expect(mockProductsService.decreaseStock).toHaveBeenCalledWith(mockTx.cart);
      expect(mockTx.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if transaction to update is not found', async () => {
      mockTransactionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      (service as any).transactionModel = mockTransactionModel;

      await expect(service.updateStatus('tx_invalid')).rejects.toThrow(NotFoundException);
    });
  });
});
