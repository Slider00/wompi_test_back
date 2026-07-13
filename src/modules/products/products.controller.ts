import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { DecreaseStockDto } from './dto/decrease-stock.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener la lista de todos los productos e inventario' })
  @ApiResponse({ status: 200, description: 'Lista de productos retornada con éxito' })
  async findAll() {
    return this.productsService.findAll();
  }

  @Post('decrease-stock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Descontar el stock de los productos tras un pago exitoso' })
  @ApiResponse({ status: 200, description: 'Inventario de stock actualizado con éxito' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente para completar la compra o cuerpo de petición inválido' })
  @ApiResponse({ status: 404, description: 'Uno o más productos del carrito no existen' })
  async decreaseStock(@Body() decreaseStockDto: DecreaseStockDto) {
    return this.productsService.decreaseStock(decreaseStockDto.cart);
  }
}
