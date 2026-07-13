import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WompiService } from './wompi.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('WompiService', () => {
  let service: WompiService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        WOMPI_BASE_URL: 'https://api-sandbox.co.uat.wompi.dev/v1',
        WOMPI_PUBLIC_KEY: 'pub_key_test',
        WOMPI_PRIVATE_KEY: 'prv_key_test',
        WOMPI_INTEGRITY_SECRET: 'integrity_secret_test',
      };
      return (config as any)[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WompiService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<WompiService>(WompiService);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAcceptanceToken', () => {
    it('should return acceptance token successfully', async () => {
      const mockResponse = {
        data: {
          presigned_acceptance: {
            acceptance_token: 'token_123',
          },
        },
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const token = await service.getAcceptanceToken();
      expect(token).toBe('token_123');
      expect(global.fetch).toHaveBeenCalledWith('https://api-sandbox.co.uat.wompi.dev/v1/merchants/pub_key_test');
    });

    it('should throw InternalServerErrorException if response not ok', async () => {
      const mockErrorResponse = {
        error: {
          reason: 'Invalid merchant public key',
        },
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => mockErrorResponse,
      });

      await expect(service.getAcceptanceToken()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('tokenizeCard', () => {
    it('should return tokenized card id successfully', async () => {
      const mockResponse = {
        data: {
          id: 'card_tok_123',
        },
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const cardToken = await service.tokenizeCard('4242 4242 4242 4242', '123', '12', '29', 'Julian');
      expect(cardToken).toBe('card_tok_123');
    });
  });

  describe('generateIntegritySignature', () => {
    it('should return a valid sha256 hash', () => {
      const signature = service.generateIntegritySignature('ref_123', 100000, 'COP');
      expect(signature).toBeDefined();
      expect(signature).toHaveLength(64);
    });
  });

  describe('createTransaction', () => {
    it('should return transaction details from Wompi', async () => {
      const mockMerchantResponse = {
        data: {
          presigned_acceptance: {
            acceptance_token: 'acceptance_token_abc',
          },
        },
      };
      const mockTxResponse = {
        data: {
          id: 'tx_wompi_456',
          status: 'PENDING',
        },
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMerchantResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockTxResponse,
        });

      const tx = await service.createTransaction(1500, 'test@wompi.com', 'card_token_xyz', 'ref_xyz');
      expect(tx.id).toBe('tx_wompi_456');
      expect(tx.status).toBe('PENDING');
    });
  });

  describe('getTransactionStatus', () => {
    it('should return Wompi transaction status successfully', async () => {
      const mockResponse = {
        data: {
          status: 'APPROVED',
        },
      };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const status = await service.getTransactionStatus('tx_123');
      expect(status).toBe('APPROVED');
    });
  });
});
