import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionCartItemDto {
  @ApiProperty({ example: 'prod-1', description: 'ID of the product' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 2, description: 'Quantity purchased' })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateTransactionDto {
  @ApiProperty({ example: 249900, description: 'Amount in COP' })
  @IsInt()
  @Min(100)
  amount!: number;

  @ApiProperty({ example: 'COP', default: 'COP', required: false })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: 'Julian Perez', description: 'Name of the cardholder' })
  @IsString()
  @IsNotEmpty()
  cardHolder!: string;

  @ApiProperty({ example: '**** **** **** 1234', description: 'Masked credit card number' })
  @IsString()
  @IsNotEmpty()
  cardMaskedNumber!: string;

  @ApiProperty({ example: 'WMP-123456789', description: 'Unique payment reference code' })
  @IsString()
  @IsNotEmpty()
  reference!: string;

  @ApiProperty({ example: '4242424242424242', description: 'Credit card number' })
  @IsString()
  @IsNotEmpty()
  cardNumber!: string;

  @ApiProperty({ example: '12/25', description: 'Card expiration date MM/AA' })
  @IsString()
  @IsNotEmpty()
  expiry!: string;

  @ApiProperty({ example: '123', description: 'Card security code CVC' })
  @IsString()
  @IsNotEmpty()
  cvv!: string;

  @ApiProperty({ type: [TransactionCartItemDto], description: 'Items purchased in this transaction' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransactionCartItemDto)
  cart!: TransactionCartItemDto[];
}
