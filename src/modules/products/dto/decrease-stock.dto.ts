import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDto {
  @ApiProperty({ example: 'prod-1', description: 'ID of the product' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 2, description: 'Quantity to purchase' })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class DecreaseStockDto {
  @ApiProperty({ type: [CartItemDto], description: 'List of items in the cart' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  cart!: CartItemDto[];
}
