import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUsersService = {
    findOneByEmail: jest.fn(),
    findOneByEmailWithPassword: jest.fn(),
    create: jest.fn(),
    deleteUnverifiedUser: jest.fn(),
    verifyUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        _id: 'user_id_mock',
        email: 'test@example.com',
        name: 'John Doe',
      });

      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
      };

      const result = await service.register(registerDto);
      expect(result.email).toBe('test@example.com');
      expect(mockUsersService.create).toHaveBeenCalledWith('test@example.com', 'password123', 'John Doe');
    });

    it('should throw ConflictException if email is already registered and verified', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue({
        email: 'test@example.com',
        isVerified: true,
      });

      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'John Doe',
      };

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return access token if credentials are valid and user verified', async () => {
      mockUsersService.findOneByEmailWithPassword.mockResolvedValue({
        _id: 'user_id_mock',
        email: 'test@example.com',
        password: 'hashed_password',
        isVerified: true,
        name: 'John Doe',
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await service.login(loginDto);
      expect(result.access_token).toBe('mocked_token');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockUsersService.findOneByEmailWithPassword.mockResolvedValue({
        _id: 'user_id_mock',
        email: 'test@example.com',
        password: 'hashed_password',
        isVerified: true,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const loginDto = {
        email: 'test@example.com',
        password: 'wrong_password',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is not verified', async () => {
      mockUsersService.findOneByEmailWithPassword.mockResolvedValue({
        _id: 'user_id_mock',
        email: 'test@example.com',
        password: 'hashed_password',
        isVerified: false,
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
