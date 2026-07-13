import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateTransactionStatusDto {
  @ApiProperty({
    example: 'APPROVED',
    enum: ['PENDING', 'APPROVED', 'DECLINED', 'FAILED'],
    description: 'Updated status of the transaction',
  })
  @IsEnum(['PENDING', 'APPROVED', 'DECLINED', 'FAILED'], {
    message: 'El estado debe ser PENDING, APPROVED, DECLINED o FAILED',
  })
  @IsNotEmpty()
  status!: string;
}
